// Helpers used by orders.js, refunds.js and outbox.js. Kept in one file so the three never
// import each other in a circle.
import { CART, CURRENCY, lineTotal } from './catalog.js';
import * as db from './db.js';
import { HttpError } from './http-error.js';
import * as primer from './primer.js';
import * as sphere from './sphere.js';

export const CAPTURED = new Set(['SETTLING', 'SETTLED', 'PARTIALLY_SETTLED']);

export const sum = (numbers) => numbers.reduce((a, b) => a + b, 0);
export const age = (iso) => Date.now() - Date.parse(iso);
export const cancelId = (orderId) => `${orderId}-cancel`;

export const taxOf = (order, itemId) =>
  order.tax.lines.find((l) => l.id === itemId)?.taxAmount ?? 0;
export const subtotalOf = () => sum(CART.map(lineTotal));
export const totalOf = (order) =>
  subtotalOf() + sum(order.tax.lines.map((l) => l.taxAmount));

export function requireOrder(orderId) {
  const order = db.getOrder(orderId);
  if (!order) throw new HttpError(404, 'Unknown order.');
  return order;
}

// A final 4xx from Primer, or a bug of ours: the same attempt would fail again, so it needs a
// person. 401, 403, 408 and 429 can pass once a key is fixed or the load drops, so they are not
// final.
export const isClientError = (err) =>
  err instanceof primer.PrimerError &&
  err.status >= 400 &&
  err.status < 500 &&
  ![401, 403, 408, 429].includes(err.status);
export const isPermanent = (err) =>
  !(err instanceof primer.PrimerError) || isClientError(err);

// Fields shared by the sale and its credit notes.
export function sphereCustomer(order) {
  return {
    currency: CURRENCY.toLowerCase(),
    customer_id: order.customerId,
    billing_address: sphere.toSphereAddress(order.address),
  };
}

// A write that is done is RECORDED in Sphere. The other statuses read the same.
const recorded = (status) => (status === 'DONE' ? 'RECORDED' : status);
const CANCEL_STATUS = {
  DONE: 'CANCELLED',
  PENDING: 'CANCEL_PENDING',
  FAILED: 'CANCEL_FAILED',
};

export function saleView(order) {
  if (order.status !== 'PAID') return null;
  const write = db.getWrite(order.id);
  if (!write) return null;
  // While a cancel is pending or failed, refunds wait until it is resolved.
  const cancel = db.getWrite(cancelId(order.id));
  if (cancel) {
    return {
      status: CANCEL_STATUS[cancel.status],
      lastError: cancel.status === 'DONE' ? null : cancel.last_error,
    };
  }
  return { status: recorded(write.status), lastError: write.last_error };
}

export function refundView(refund) {
  const credit = db.getWrite(refund.id);
  return {
    id: refund.id,
    amount: refund.amount,
    status: refund.status,
    creditNote: credit ? recorded(credit.status) : null,
  };
}
