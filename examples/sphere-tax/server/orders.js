// The order flow: tax quote, payment confirmation and recording the sale. Routes and the
// worker call in here.
import { randomUUID } from 'node:crypto';
import { CART, CURRENCY, lineTotal, toMajor } from './catalog.js';
import * as db from './db.js';
import { HttpError } from './http-error.js';
import { flushWrite } from './outbox.js';
import * as primer from './primer.js';
import {
  CAPTURED,
  age,
  isClientError,
  isPermanent,
  requireOrder,
  saleView,
  refundView,
  sphereCustomer,
  subtotalOf,
  sum,
  taxOf,
  totalOf,
} from './shared.js';
import * as sphere from './sphere.js';

const WAITING = new Set(['AUTHORIZED', 'PENDING']);
const NOT_PAID = new Set(['DECLINED', 'FAILED', 'CANCELLED']);
const POLL_MS = 1_500;
const DAY_MS = 24 * 60 * 60 * 1000;
// Sphere rejected the product setup or the key, which a shopper cannot fix.
const MERCHANT_CODES = ['invalid_product_tax_code'];
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const requireOpen = (order) => {
  if (order.paymentId || order.status !== 'OPEN') {
    throw new HttpError(
      409,
      'A payment has started, so the tax can no longer change.',
    );
  }
};

// Tax

const noTax = () => CART.map((i) => ({ id: i.itemId, taxAmount: 0 }));

// Asks Sphere for the tax. Returns the fields to store on the order.
async function quoteTax(order, address, taxId) {
  try {
    const quote = await sphere.calculateTax({
      currency: CURRENCY,
      address,
      taxId,
      customerId: order.customerId,
      lines: CART.map((item) => ({
        itemId: item.itemId,
        amount: lineTotal(item),
      })),
    });
    return {
      taxStatus: 'CALCULATED',
      tax: { calculationId: quote.calculationId, lines: quote.lines },
    };
  } catch (err) {
    if (!(err instanceof sphere.SphereError)) throw err;
    // Sphere is slow or down: let the shopper pay without tax rather than lose the sale.
    // Sphere recommends this. The sale is still recorded, and Sphere works out the tax owed.
    if (sphere.failsOpen(err)) {
      console.warn(
        `Order ${order.id}: Sphere unavailable, tax not collected: ${err.message}`,
      );
      return {
        taxStatus: 'NOT_COLLECTED',
        tax: {
          calculationId: null,
          lines: noTax(),
        },
      };
    }
    // A final 4xx is usually an address Sphere cannot locate, and the shopper fixes it. A bad
    // key or product setup is ours to fix, so it stays a server error.
    if (
      !sphere.isRetryableWrite(err) &&
      err.status >= 400 &&
      !MERCHANT_CODES.includes(err.code)
    ) {
      throw new HttpError(422, err.message);
    }
    throw err;
  }
}

// The order fields that come from a tax quote for this address.
async function quoteFields(order, address, taxId) {
  const quote = await quoteTax(order, address, taxId);
  return { address, taxId: taxId || '', ...quote };
}

// What Primer needs on create and on every PATCH. PATCH replaces lineItems and metadata
// entirely, so both are always sent in full.
function sessionFields(order) {
  const fields = {
    order: {
      countryCode: order.address?.countryCode ?? 'US',
      lineItems: CART.map((item) => ({
        itemId: item.itemId,
        description: item.description,
        amount: item.amount,
        quantity: item.quantity,
        taxAmount: taxOf(order, item.itemId),
      })),
    },
    metadata: {
      sphereTaxCalculationId: order.tax.calculationId ?? '',
      taxCollected: taxCollected(order),
    },
  };
  if (order.address) {
    fields.customer = { billingAddress: sphere.withoutEmpty(order.address) };
  }
  return fields;
}

const taxCollected = (order) =>
  order.taxStatus === 'NOT_COLLECTED' ? 'false' : 'true';

export async function createOrder({ address, taxId }) {
  const order = {
    id: `ord_${randomUUID()}`,
    customerId: `cus_${randomUUID()}`,
    status: 'OPEN',
    address: null,
    taxId: '',
    taxStatus: 'NOT_CALCULATED',
    // No address yet, so no tax. The browser blocks payment until there is a quote, and the
    // server flags any payment made without one.
    tax: {
      calculationId: null,
      lines: noTax(),
    },
    paymentId: null,
  };
  if (address) {
    Object.assign(order, await quoteFields(order, address, taxId));
  }

  // No top-level amount: Primer adds up the line items, tax included.
  const session = await primer.createClientSession({
    orderId: order.id,
    currencyCode: CURRENCY,
    customerId: order.customerId,
    ...sessionFields(order),
  });
  order.clientToken = session.clientToken;
  db.saveOrder(order);
  return {
    orderId: order.id,
    clientToken: order.clientToken,
    summary: summarize(order.id),
  };
}

export async function applyTax(orderId, { address, taxId }) {
  const order = requireOrder(orderId);
  requireOpen(order);
  const fields = await quoteFields(order, address, taxId);

  await primer.updateClientSession({
    clientToken: order.clientToken,
    ...sessionFields({ ...order, ...fields }),
  });

  // Store the quote only now. If the PATCH had failed, the stored quote would not match what
  // the checkout shows.
  const fresh = requireOrder(orderId);
  requireOpen(fresh);
  db.saveOrder({ ...fresh, ...fields });
  return { summary: summarize(orderId) };
}

// Payment

function paymentMismatch(order, payment) {
  if (order.taxStatus === 'NOT_CALCULATED') return 'tax was never calculated';
  const expected = totalOf(order);
  if (payment.amount !== expected) {
    return `amount expected ${expected}, paid ${payment.amount}`;
  }
  if (payment.currencyCode && payment.currencyCode !== CURRENCY) {
    return `currency expected ${CURRENCY}, paid ${payment.currencyCode}`;
  }
  // If the session metadata comes back on the payment, it must name the stored quote. It may be
  // absent, so absence is not a mismatch.
  const paid = payment.metadata?.sphereTaxCalculationId;
  const stored = order.tax.calculationId ?? '';
  if (paid !== undefined && paid !== stored) {
    return `tax calculation expected ${stored || '(none)'}, paid with ${paid || '(none)'}`;
  }
  return null;
}

function saleBody(order, payment) {
  return {
    // The order id is the external_id, so repeating the request never creates a second sale.
    external_id: order.id,
    type: 'debit',
    status: 'finalized',
    // The payment date, so a late retry cannot move the sale into another tax period.
    finalized_on: primer.toUtcIso(payment.date),
    ...sphereCustomer(order),
    // No id means Sphere calculates the tax itself: either Sphere was unavailable at checkout
    // (fail open) or no tax applied because you aren't registered there.
    ...(order.tax.calculationId
      ? { sphere_tax_calculation_id: order.tax.calculationId }
      : {}),
    line_items: CART.map((item) => ({
      // Must equal the line id sent to calculate_tax, or Sphere rejects the calculation.
      external_id: item.itemId,
      product_id: item.itemId,
      amount: toMajor(lineTotal(item)),
      quantity: String(item.quantity),
      unit_price: toMajor(item.amount),
    })),
    metadata: {
      primerPaymentId: payment.id,
      taxCollected: taxCollected(order),
    },
  };
}

function paymentOutcome(order) {
  if (order.status === 'NEEDS_REVIEW') return 'NEEDS_REVIEW';
  if (order.status === 'PAID') {
    // A FAILED write is not retried, so it must not read as queued.
    const status = db.getWrite(order.id)?.status;
    if (status === 'DONE') return 'RECORDED';
    return status === 'FAILED' ? 'SPHERE_FAILED' : 'QUEUED';
  }
  return 'AWAITING_CAPTURE';
}

// Not retried: someone has to look at it.
function orderNeedsReview(orderId, reason) {
  console.error(`NEEDS_REVIEW ${orderId} ${reason}`);
  db.saveOrder({ ...requireOrder(orderId), status: 'NEEDS_REVIEW' });
}

// Confirms the payment with Primer, never from what the browser says, then records the sale.
// waitMs is how long to wait for an authorized payment to be captured.
export async function confirmPayment(orderId, paymentId, { waitMs }) {
  const order = requireOrder(orderId);
  const done = order.status === 'PAID' || order.status === 'NEEDS_REVIEW';
  if (done && order.paymentId === paymentId) {
    return { outcome: paymentOutcome(order), summary: summarize(orderId) };
  }
  try {
    return await checkPayment(orderId, paymentId, waitMs);
  } catch (err) {
    if (err instanceof HttpError) throw err;
    const current = requireOrder(orderId);
    if (current.paymentId !== paymentId) {
      // Not claimed yet, so the id came from the browser and may be wrong.
      if (isClientError(err)) {
        console.error(
          `Order ${orderId}: Primer does not know payment ${paymentId}`,
        );
        throw new HttpError(400, 'Primer does not know that payment.');
      }
      throw err;
    }
    // Retrying a 4xx or a bug would loop forever. Once the sale is queued it is the queue's job.
    if (current.status !== 'AWAITING_CAPTURE' || !isPermanent(err)) throw err;
    orderNeedsReview(orderId, `payment ${paymentId}: ${err.message}`);
    return { outcome: 'NEEDS_REVIEW', summary: summarize(orderId) };
  }
}

async function checkPayment(orderId, paymentId, waitMs) {
  let payment = await primer.getPayment(paymentId);
  // The browser sends the payment id, so check it is this order's payment.
  if (payment.orderId !== orderId) {
    console.error(
      `Order ${orderId}: payment ${paymentId} belongs to order ${payment.orderId}`,
    );
    throw new HttpError(400, 'That payment does not belong to this order.');
  }
  claimPayment(orderId, paymentId);

  const deadline = Date.now() + waitMs;
  while (WAITING.has(payment.status) && Date.now() < deadline) {
    await sleep(POLL_MS);
    payment = await primer.getPayment(paymentId);
  }

  if (NOT_PAID.has(payment.status)) {
    releasePayment(orderId, paymentId);
    throw Object.assign(
      new HttpError(
        409,
        `The payment ${payment.status.toLowerCase()}. The order is open, so you can pay again.`,
      ),
      { code: 'PAYMENT_NOT_PAID' },
    );
  }
  if (!CAPTURED.has(payment.status)) {
    const { awaitingSince } = requireOrder(orderId);
    if (age(awaitingSince) > DAY_MS) {
      orderNeedsReview(orderId, `still ${payment.status} after 24h`);
      return { outcome: 'NEEDS_REVIEW', summary: summarize(orderId) };
    }
    return { outcome: 'AWAITING_CAPTURE', summary: summarize(orderId) };
  }
  return recordSale(orderId, payment);
}

// Stores the payment id on the order at once. This also stops further tax changes.
function claimPayment(orderId, paymentId) {
  const order = requireOrder(orderId);
  if (order.paymentId === paymentId) return;
  if (order.paymentId) {
    // The shopper may have been charged twice, once for each payment.
    console.error(
      `SECOND_PAYMENT order ${orderId} payments ${order.paymentId} and ${paymentId}`,
    );
    throw new HttpError(409, 'This order already has a different payment.');
  }
  db.saveOrder({
    ...order,
    paymentId,
    status: 'AWAITING_CAPTURE',
    awaitingSince: new Date().toISOString(),
  });
}

// A failed payment leaves the order open so the shopper can try again.
function releasePayment(orderId, paymentId) {
  const order = requireOrder(orderId);
  if (order.paymentId !== paymentId) return;
  db.saveOrder({
    ...order,
    paymentId: null,
    status: 'OPEN',
    awaitingSince: null,
  });
}

function recordSale(orderId, payment) {
  const order = requireOrder(orderId);
  const problem =
    order.status === 'AWAITING_CAPTURE' && paymentMismatch(order, payment);
  if (problem) {
    orderNeedsReview(orderId, `payment ${payment.id}: ${problem}`);
  } else if (order.status === 'AWAITING_CAPTURE') {
    // The queued sale and the PAID status are written together or not at all.
    db.transaction(() => {
      db.insertWrite({
        externalId: orderId,
        orderId,
        kind: 'sale',
        body: saleBody(order, payment),
      });
      db.saveOrder({ ...order, status: 'PAID' });
    });
  }
  return finishSale(orderId);
}

async function finishSale(orderId) {
  if (requireOrder(orderId).status === 'PAID') await flushWrite(orderId);
  return {
    outcome: paymentOutcome(requireOrder(orderId)),
    summary: summarize(orderId),
  };
}

// Summary

export function summarize(orderId) {
  const order = requireOrder(orderId);
  const refunds = db.listRefunds(orderId);
  return {
    orderId: order.id,
    currency: CURRENCY,
    status: order.status,
    // amount is the unit price. The line total is amount times quantity.
    lines: CART.map((item) => ({
      itemId: item.itemId,
      description: item.description,
      quantity: item.quantity,
      amount: item.amount,
      taxAmount: taxOf(order, item.itemId),
    })),
    subtotal: subtotalOf(),
    tax: sum(order.tax.lines.map((l) => l.taxAmount)),
    total: totalOf(order),
    taxStatus: order.taxStatus,
    taxAddress: order.address,
    sphereTaxCalculationId: order.tax.calculationId,
    paymentId: order.paymentId,
    sale: saleView(order),
    // Every refund that has not failed, so total minus refunded is what can still be refunded.
    refunded: sum(
      refunds.filter((r) => r.status !== 'FAILED').map((r) => r.amount),
    ),
    refunds: refunds.map(refundView),
  };
}
