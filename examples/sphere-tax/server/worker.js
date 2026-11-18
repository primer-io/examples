// Finishes what the browser did not: payments it never reported, captures that came late,
// refunds Primer is still processing, and Sphere writes that need another try.
// Every step is safe to repeat, so a restart picks up where it left off.
import * as db from './db.js';
import { confirmPayment } from './orders.js';
import { flushWrite } from './outbox.js';
import { findPaymentsByOrder } from './primer.js';
import { confirmRefund } from './refunds.js';
import { CAPTURED, WAITING } from './shared.js';

const TICK_MS = 5_000;
// Searching for payments is one Primer call per open order, so it runs less often.
const RECOVERY_EVERY_MS = 30_000;
// Gives the browser time to report first. Payments the browser never reported within 24 hours
// are not searched for.
const MIN_AGE_MS = 30_000;
const MAX_AGE_MS = 24 * 60 * 60 * 1000;

// How often to check an order that is waiting for capture, by how long it has waited.
export function checkIntervalMs(awaitingSince) {
  const waited = Date.now() - Date.parse(awaitingSince);
  if (waited < 2 * 60_000) return 0;
  if (waited < 60 * 60_000) return 30_000;
  return 5 * 60_000;
}
const lastChecked = new Map();

let running = false;
let lastRecovery = 0;

async function attempt(label, work) {
  try {
    await work();
  } catch (err) {
    console.error(
      `Worker: ${label} failed: ${err.message}`,
      err.status ?? '',
      JSON.stringify(err.body ?? {}),
    );
  }
}

// Orders where the shopper paid but the browser never told us, for example a closed tab.
async function recoverPayments() {
  if (Date.now() - lastRecovery < RECOVERY_EVERY_MS) return;
  lastRecovery = Date.now();

  for (const order of db.listOrders('OPEN')) {
    const age = Date.now() - Date.parse(order.createdAt);
    if (order.paymentId || age < MIN_AGE_MS) continue;
    if (age > MAX_AGE_MS) {
      // Read it again: a payment may have been claimed since the list was loaded.
      const current = db.getOrder(order.id);
      if (
        current.status === 'OPEN' &&
        !current.paymentId &&
        !current.expiredLogged
      ) {
        console.error(`UNREPORTED_ORDER_EXPIRED ${order.id}`);
        db.saveOrder({ ...current, expiredLogged: true });
      }
      continue;
    }

    await attempt(`payment search for ${order.id}`, async () => {
      const payments = await findPaymentsByOrder(order.id);
      const found =
        payments.find((p) => CAPTURED.has(p.status)) ||
        payments.find((p) => WAITING.has(p.status));
      if (!found) return;
      // A payment made without a tax quote goes to NEEDS_REVIEW in confirmPayment.
      const { outcome } = await confirmPayment(order.id, found.id, {
        waitMs: 0,
      });
      console.log(`Worker: payment ${found.id} for ${order.id} is ${outcome}`);
    });
  }
}

// One pass over everything that needs finishing. startWorker runs it on a timer; a serverless
// port can call it from a scheduled job instead.
export async function tick() {
  await recoverPayments();

  const waiting = db.listOrders('AWAITING_CAPTURE');
  // Forget orders that stopped waiting, however they did, so the map does not grow forever.
  const waitingIds = new Set(waiting.map((o) => o.id));
  for (const id of lastChecked.keys()) {
    if (!waitingIds.has(id)) lastChecked.delete(id);
  }

  for (const order of waiting) {
    const due =
      (lastChecked.get(order.id) ?? 0) + checkIntervalMs(order.awaitingSince);
    if (Date.now() < due) continue;
    lastChecked.set(order.id, Date.now());
    await attempt(`capture check for ${order.id}`, async () => {
      const { outcome } = await confirmPayment(order.id, order.paymentId, {
        waitMs: 0,
      });
      if (outcome !== 'AWAITING_CAPTURE') {
        console.log(`Worker: order ${order.id} is ${outcome}`);
      }
    });
  }

  for (const refund of db.listRefundsByStatus([
    'REQUESTED',
    'REFUND_PENDING',
  ])) {
    await attempt(`refund check for ${refund.id}`, async () => {
      const outcome = await confirmRefund(refund.id);
      if (outcome !== 'REFUND_PENDING') {
        console.log(`Worker: refund ${refund.id} is ${outcome}`);
      }
    });
  }

  for (const write of db.listDueWrites()) {
    await attempt(`Sphere write ${write.external_id}`, async () => {
      const status = await flushWrite(write.external_id);
      if (status !== 'PENDING') {
        console.log(`Worker: Sphere write ${write.external_id} is ${status}`);
      }
    });
  }
}

export function startWorker() {
  return setInterval(async () => {
    // A slow tick must not overlap the next one.
    if (running) return;
    running = true;
    try {
      await tick();
    } catch (err) {
      console.error(`Worker: tick failed: ${err.message}`);
    } finally {
      running = false;
    }
  }, TICK_MS);
}
