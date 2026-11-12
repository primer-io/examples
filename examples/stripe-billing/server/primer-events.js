// Primer PAYMENT.STATUS events. A payment Primer answered with PENDING has no outcome yet, and
// Primer's guide says to wait for this webhook before reporting it to Stripe. Two payments can
// be waiting on it:
//
// - a renewal that handleRenewal parked behind primer_pending_payment_id. This is the
//   webhook's main job.
// - the first payment, when /api/payment-complete saw PENDING, failed or never arrived. The
//   browser usually finishes it, so this only steps in after a delay if the subscription is
//   still incomplete.
//
// Anything else is left alone. Where money may be stranded, it is logged for a person.
import { completeFirstPayment } from './first-payment.js';
import * as primer from './primer.js';
import * as billing from './stripe.js';

// Gives the browser's /api/payment-complete time to report the first payment itself.
const FIRST_PAYMENT_DELAY_MS = 10_000;

// How long an alarm waits for a concurrent path to finish before deciding something is stuck.
const ALARM_DELAY_MS = 20_000;

// These sleeps and the ones below are in-memory timers: a restart during one loses that work.
// In production, use a delayed job.
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function handlePaymentStatus(payment) {
  const invoiceId = payment.orderId;
  // orderId is a Stripe invoice id for every payment this example makes. A shared Primer
  // account can send other payments here too.
  if (typeof invoiceId !== 'string' || !invoiceId.startsWith('in_')) {
    console.log(
      'primer webhook ignored: orderId is not a Stripe invoice',
      invoiceId,
      payment.id,
    );
    return;
  }

  let invoice;
  try {
    invoice = await billing.stripe.invoices.retrieve(invoiceId);
  } catch (err) {
    if (err.code !== 'resource_missing') throw err;
    console.log(
      'primer webhook ignored: unknown invoice',
      invoiceId,
      payment.id,
    );
    return;
  }

  const verdict = primer.classifyPayment(payment);
  if (verdict.classification === 'pending') {
    console.log(
      'primer webhook: payment',
      payment.id,
      'is still pending on invoice',
      invoiceId,
    );
    return;
  }
  if (verdict.classification === 'unknown') {
    // classifyPayment already logged it. Report nothing: Stripe could charge again on a guess.
    console.error(
      'primer webhook: payment',
      payment.id,
      'has an unknown status, nothing reported. Check it in Primer.',
    );
    return;
  }
  const approved = verdict.classification === 'approved';

  if (invoice.status !== 'open') {
    // Paid is expected: it was already reported. Approved money for an invoice that can no
    // longer take it has nowhere to go.
    const reported =
      approved &&
      invoice.status === 'paid' &&
      (await billing.isPaymentReported(invoiceId, payment.id));
    if (approved && !reported) {
      console.error(
        'approved payment',
        payment.id,
        'for',
        invoice.status,
        'invoice',
        invoiceId,
        '- refund it in Primer',
      );
    } else {
      console.log(
        'primer webhook skipped: invoice',
        invoiceId,
        'is',
        invoice.status,
        'payment',
        payment.id,
      );
    }
    return;
  }

  if (invoice.metadata?.primer_pending_payment_id === payment.id) {
    await reportRenewal(invoice, payment, verdict);
    return;
  }

  if (invoice.metadata?.primer_charged_payment_id === payment.id) {
    await alarmIfStuck(
      invoice,
      payment,
      'is charged but unreported; report it to Stripe by hand',
    );
    return;
  }

  const subscriptionId = billing.invoiceSubscriptionId(invoice);
  const sub = subscriptionId
    ? await billing.loadSubscription(subscriptionId)
    : null;
  if (sub?.status === 'incomplete' && sub.invoiceId === invoice.id) {
    await completeWaitingFirstPayment(sub, payment);
    return;
  }

  if (approved) {
    await alarmIfStuck(
      invoice,
      payment,
      'is approved but matches no pending or first payment; report it by hand',
    );
  } else {
    console.log(
      'primer webhook ignored: payment',
      payment.id,
      'is not the pending payment of open invoice',
      invoiceId,
    );
  }
}

// A concurrent path (the renewal reporting, or another delivery) may be about to settle what
// looks stuck. Wait, look again, and raise the alarm only if the invoice is still open, its
// attempt counter has not moved and Stripe has no record of the payment.
async function alarmIfStuck(invoice, payment, problem) {
  const attempt = Number(invoice.metadata?.primer_reported_attempts || 0);
  await sleep(ALARM_DELAY_MS);
  const fresh = await billing.stripe.invoices.retrieve(invoice.id);
  const stuck =
    fresh.status === 'open' &&
    Number(fresh.metadata?.primer_reported_attempts || 0) === attempt &&
    !(await billing.isPaymentReported(invoice.id, payment.id));
  if (stuck)
    console.error(
      'STRANDED PAYMENT: Primer payment',
      payment.id,
      problem,
      '- invoice',
      invoice.id,
    );
  else
    console.log(
      'primer webhook: payment',
      payment.id,
      'on invoice',
      invoice.id,
      'was settled meanwhile',
    );
}

// Give the browser path time to finish, then act only if the subscription is still incomplete.
async function completeWaitingFirstPayment(sub, payment) {
  if (await billing.isPaymentReported(sub.invoiceId, payment.id)) {
    console.log(
      'primer webhook: first payment',
      payment.id,
      'was already reported',
    );
    return;
  }
  await sleep(FIRST_PAYMENT_DELAY_MS);
  // completeFirstPayment loads the subscription again. If it is no longer incomplete, nothing is
  // written: it returns when the browser already reported the payment, and otherwise throws and
  // the caller logs.
  const result = await completeFirstPayment(sub.subscriptionId, payment.id);
  console.log(
    'primer webhook first payment',
    payment.id,
    'invoice',
    sub.invoiceId,
    result.outcome,
  );
}

// Reports a renewal whose outcome arrived out of band, the same way handleRenewal reports one
// it saw directly: stamp a decline, report the attempt, then advance the attempt counter and
// clear the pending markers so Stripe's next retry can charge again. The report and attach
// writes are keyed on the Primer payment id, so a second delivery is a replay Stripe recognizes.
async function reportRenewal(invoice, payment, verdict) {
  const rawAttempts = invoice.metadata.primer_reported_attempts;
  const attempt = rawAttempts === undefined ? 0 : Number(rawAttempts);
  if (!Number.isInteger(attempt) || attempt < 0) {
    console.error(
      'primer webhook skipped:',
      invoice.id,
      'has an invalid primer_reported_attempts:',
      rawAttempts,
    );
    return;
  }

  const approved = verdict.classification === 'approved';
  // Primer has the outcome and Stripe does not, so an approved payment that can't be reported
  // here is money nobody will pick up.
  const stranded = () => {
    if (approved)
      console.error(billing.strandedRenewal(payment.id, invoice.id, attempt));
  };

  const mismatch = [
    payment.amount !== invoice.amount_remaining && 'amount',
    String(payment.currencyCode).toUpperCase() !==
      invoice.currency.toUpperCase() && 'currencyCode',
  ].filter(Boolean);
  if (mismatch.length > 0) {
    console.error(
      'primer webhook skipped: payment',
      payment.id,
      'does not match invoice',
      invoice.id,
      mismatch.join(','),
    );
    stranded();
    return;
  }

  // If an earlier delivery got as far as reporting before it died, only the bookkeeping is left.
  if (!(await billing.isPaymentReported(invoice.id, payment.id))) {
    const paymentMethod = await billing.resolveInvoicePaymentMethod(invoice);
    if (!paymentMethod) {
      console.error(
        'primer webhook: no payment method to report against on invoice',
        invoice.id,
        'payment',
        payment.id,
      );
      stranded();
      return;
    }
    try {
      if (!approved)
        await billing.whenClockIdle(() =>
          billing.stampDeclineClassification(invoice.id, verdict),
        );
      await billing.whenClockIdle(() =>
        billing.reportRenewalAttempt({
          invoice,
          paymentMethodId: paymentMethod.id,
          amount: invoice.amount_remaining,
          currency: invoice.currency,
          primerPaymentId: payment.id,
          succeeded: approved,
          at: primer.paymentTime(payment),
        }),
      );
    } catch (err) {
      if (await billing.settledByAnotherCaller(err, invoice.id, attempt)) {
        console.log(
          'primer webhook: payment',
          payment.id,
          'was already reported to Stripe',
        );
        return;
      }
      stranded();
      err.message = `reporting Primer payment ${payment.id} (${payment.status}) to Stripe failed: ${err.message}`;
      throw err;
    }
    console.log(
      'primer webhook renewal reported',
      payment.id,
      'invoice',
      invoice.id,
      payment.status,
    );
  }

  // The Stripe event that started this renewal was stored with the pending marker. Recording it
  // keeps the replay guard in handleRenewal matching a redelivery of that event.
  const eventId =
    invoice.metadata.primer_pending_event_id || `primer-webhook:${payment.id}`;
  await billing
    .whenClockIdle(() =>
      billing.recordReportedAttempt(invoice.id, attempt, eventId, [
        'primer_pending_payment_id',
        'primer_pending_event_id',
      ]),
    )
    .catch((err) => {
      console.error(
        `could not record attempt ${attempt} on ${invoice.id} (Primer payment ${payment.id}): ${err.message}. ` +
          'The next retry is refused as a duplicate until primer_reported_attempts is fixed and the pending markers are cleared by hand.',
      );
    });
}
