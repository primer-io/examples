// Refunds, their credit notes in Sphere, and the cancellation that stands in for a chargeback.
import { CART, lineTotal, toMajor } from './catalog.js';
import * as db from './db.js';
import { HttpError } from './http-error.js';
import { flushWrite } from './outbox.js';
import { summarize } from './orders.js';
import * as primer from './primer.js';
import {
  age,
  cancelId,
  isClientError,
  isPermanent,
  refundView,
  requireOrder,
  saleView,
  sphereCustomer,
  sum,
  taxOf,
  totalOf,
} from './shared.js';

// A request with no answer is sent again on each check after this long, until REFUND_UNMATCHED_MS.
const REFUND_RESEND_MS = 60_000;
const REFUND_UNMATCHED_MS = 30 * 60_000;

// Splits a refund across the lines. gross is what the shopper gets back, tax included. Sphere
// wants the net part of each line, and works out the tax from the original sale.
// Each line's share follows what is left on it, so refunds that add up to the order total
// clear every line to exactly zero net and zero tax, whatever sizes they came in.
// refundsSoFar: earlier refunds that count, each with an allocation of { itemId, gross, net }.
export function allocateRefund(order, refundsSoFar, gross) {
  const lines = CART.map((item) => {
    const prior = refundsSoFar
      .flatMap((r) => r.allocation)
      .filter((a) => a.itemId === item.itemId);
    const net = lineTotal(item) - sum(prior.map((a) => a.net));
    const tax =
      taxOf(order, item.itemId) - sum(prior.map((a) => a.gross - a.net));
    return { itemId: item.itemId, net, gross: net + tax };
  });
  const remaining = sum(lines.map((l) => l.gross));
  if (!Number.isInteger(gross) || gross < 1 || gross > remaining) {
    throw new Error(`Refund ${gross} is outside what is left: ${remaining}`);
  }

  // Proportional split by largest remainder, so the shares add up to gross exactly.
  const products = lines.map((l) => gross * l.gross);
  const shares = products.map((p) => (p - (p % remaining)) / remaining);
  const leftover = gross - sum(shares);
  products
    .map((p, i) => ({ i, rest: p % remaining }))
    .sort((a, b) => b.rest - a.rest || a.i - b.i)
    .slice(0, leftover)
    .forEach(({ i }) => (shares[i] += 1));

  return lines
    .map((l, i) => ({
      itemId: l.itemId,
      gross: shares[i],
      // The last of a line's money takes exactly what is left, so no cent of net is stranded.
      net:
        shares[i] === l.gross
          ? l.net
          : Math.round((shares[i] * l.net) / l.gross),
    }))
    .filter((a) => a.gross > 0);
}

// Checks the request and saves the refund in one synchronous step, so two requests cannot
// both spend the same remaining amount.
function reserveRefund(orderId, amount) {
  const order = requireOrder(orderId);
  // Not while the sale is unrecorded, cancelled, or has a cancel pending or failed.
  if (saleView(order)?.status !== 'RECORDED') {
    throw new HttpError(
      409,
      'The sale is not recorded in Sphere, or is being cancelled, so it cannot be refunded.',
    );
  }
  const all = db.listRefunds(orderId);
  const counting = all.filter((r) => r.status !== 'FAILED');
  const remaining = totalOf(order) - sum(counting.map((r) => r.amount));
  if (amount > remaining) {
    throw new HttpError(400, `amount can be at most ${remaining}.`);
  }
  // Refunds are never deleted, so the count is the next free number.
  const id = `${orderId}-refund-${all.length + 1}`;
  db.insertRefund({
    id,
    orderId,
    amount,
    allocation: allocateRefund(order, counting, amount),
    status: 'REQUESTED',
  });
  return db.getRefund(id);
}

// Asks Primer to refund. REQUESTED means this call has not got an answer yet.
// Returns null, or a message when Primer rejected the request.
async function sendRefund(order, refund) {
  try {
    await primer.refundPayment(
      order.paymentId,
      { amount: refund.amount, orderId: refund.id, reason: 'Customer refund' },
      refund.id,
    );
  } catch (err) {
    // Unless the key was used before (Primer already has this refund), decide whether the
    // request may have arrived.
    if (!primer.isDuplicateRequest(err)) {
      if (!(err instanceof primer.PrimerError)) throw err;
      // No answer, or an answer that can change (a bad key, a busy Primer): not a rejection.
      if (err.outcomeUnknown || !isClientError(err)) {
        console.warn(`Refund ${refund.id}: no answer from Primer, will check`);
        return null;
      }
      const e = err.body?.error;
      const detail = [e?.errorId && `(${e.errorId})`, e?.description];
      return `Primer rejected the refund ${detail.filter(Boolean).join(': ')}`.slice(
        0,
        300,
      );
    }
  }
  db.markRefundPending(refund.id);
  return null;
}

export async function startRefund(orderId, amount) {
  const refund = reserveRefund(orderId, amount);
  // Only this first send may mark the refund FAILED: the shopper is here to see it.
  const rejection = await sendRefund(requireOrder(orderId), refund);
  if (rejection) {
    db.setRefundStatus(refund.id, 'FAILED');
    throw new HttpError(409, rejection);
  }

  let outcome = 'REFUND_PENDING';
  try {
    outcome = await confirmRefund(refund.id);
  } catch (err) {
    // The refund is requested. The worker will finish it, so do not tell the shopper it failed.
    console.warn(`Refund ${refund.id}: could not confirm yet: ${err.message}`);
  }
  return {
    outcome,
    refund: refundView(db.getRefund(refund.id)),
    summary: summarize(orderId),
  };
}

// SPHERE_FAILED, not FAILED: FAILED already means Primer's refund failed.
function creditOutcome(refundId) {
  const status = db.getWrite(refundId)?.status;
  if (status === 'DONE') return 'CREDITED';
  return status === 'FAILED' ? 'SPHERE_FAILED' : 'QUEUED';
}

function refundNeedsReview(refundId, text) {
  console.error(text);
  db.setRefundStatus(refundId, 'NEEDS_REVIEW');
  return 'NEEDS_REVIEW';
}

// Looks at Primer's record of the refund and moves ours forward.
// Returns CREDITED, QUEUED, SPHERE_FAILED, REFUND_PENDING, FAILED or NEEDS_REVIEW.
export async function confirmRefund(refundId) {
  const refund = db.getRefund(refundId);
  if (refund.status === 'REFUNDED') return creditOutcome(refundId);
  if (refund.status === 'FAILED' || refund.status === 'NEEDS_REVIEW') {
    return refund.status;
  }
  try {
    return await checkRefund(refund);
  } catch (err) {
    // Same rule as payments: a 4xx or a bug would repeat forever. Once the credit note is
    // queued it is the queue's job.
    if (!isPermanent(err) || db.getRefund(refundId).status === 'REFUNDED') {
      throw err;
    }
    return refundNeedsReview(
      refundId,
      `REFUND_NEEDS_REVIEW ${refundId}: ${err.message}`,
    );
  }
}

async function checkRefund(refund) {
  const order = requireOrder(refund.orderId);
  const payment = await primer.getPayment(order.paymentId);
  const refundTransactions = (payment.transactions || []).filter(
    (t) => t.transactionType === 'REFUND',
  );
  const transaction = refundTransactions.find((t) => t.orderId === refund.id);

  if (!transaction) {
    const waited = age(refund.createdAt);
    if (waited > REFUND_UNMATCHED_MS) {
      const seen = refundTransactions
        .map((t) => `${t.amount} ${t.processorStatus} ${t.orderId}`)
        .join(', ');
      return refundNeedsReview(
        refund.id,
        `REFUND_UNMATCHED ${refund.id} payment ${order.paymentId}, refund transactions: ${seen || 'none'}`,
      );
    }
    // Primer has no such refund. If the request never got an answer, send it again: the
    // idempotency key makes that safe. A rejection here is not proof the refund failed.
    if (refund.status === 'REQUESTED' && waited > REFUND_RESEND_MS) {
      const rejection = await sendRefund(order, refund);
      if (rejection) {
        return refundNeedsReview(
          refund.id,
          `REFUND_NEEDS_REVIEW ${refund.id}: ${rejection}`,
        );
      }
    }
    return 'REFUND_PENDING';
  }
  if (
    ['FAILED', 'DECLINED', 'CANCELLED'].includes(transaction.processorStatus)
  ) {
    db.setRefundStatus(refund.id, 'FAILED');
    return 'FAILED';
  }
  if (transaction.processorStatus !== 'SETTLED') {
    db.markRefundPending(refund.id);
    return 'REFUND_PENDING';
  }

  // Settled. Queue the credit note and mark the refund done together.
  db.transaction(() => {
    db.insertWrite({
      externalId: refund.id,
      orderId: order.id,
      kind: 'credit',
      body: creditBody(order, refund, transaction),
    });
    db.setRefundStatus(refund.id, 'REFUNDED');
  });
  await flushWrite(refund.id);
  return creditOutcome(refund.id);
}

function creditBody(order, refund, transaction) {
  return {
    external_id: refund.id,
    type: 'credit',
    status: 'finalized',
    // Linked to the sale, so Sphere takes the tax off that sale in proportion.
    original_transaction_id: order.id,
    finalized_on: primer.toUtcIso(transaction.date),
    ...sphereCustomer(order),
    line_items: refund.allocation.map((a) => ({
      external_id: a.itemId,
      product_id: a.itemId,
      amount: toMajor(a.net),
    })),
  };
}

// Chargeback

// Stands in for a chargeback. In production, call this from Primer's dispute webhook.
// A failed cancel can be tried again by calling this again.
export async function cancelSale(orderId) {
  const order = requireOrder(orderId);
  const status = saleView(order)?.status;
  if (status !== 'RECORDED' && status !== 'CANCEL_FAILED') {
    throw new HttpError(409, 'The sale cannot be cancelled right now.');
  }
  // A credit note for a cancelled sale would be rejected, and a refund still running would
  // pay the shopper back after Sphere has dropped the sale.
  const refunding = db
    .listRefunds(orderId)
    .some((r) => r.status === 'REQUESTED' || r.status === 'REFUND_PENDING');
  if (refunding || db.hasPendingWrite(orderId, 'credit')) {
    throw new HttpError(
      409,
      'A refund is still in progress, so the sale cannot be cancelled yet.',
    );
  }
  const id = cancelId(orderId);
  const existing = db.getWrite(id);
  if (!existing) {
    db.insertWrite({
      externalId: id,
      orderId,
      kind: 'cancel',
      body: { external_id: orderId },
    });
  } else if (existing.status === 'FAILED') {
    db.resetWrite(id);
  }
  await flushWrite(id);
  return { summary: summarize(orderId) };
}
