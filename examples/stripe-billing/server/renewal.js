// A renewal. Stripe finalizes the invoice and asks us to collect. Charge the vaulted token
// through Primer as a merchant-initiated payment, then report the outcome to Stripe.
import * as primer from './primer.js';
import * as billing from './stripe.js';

export async function handleRenewal(invoice, eventId) {
  const meta = invoice.metadata || {};
  console.log(
    'renewal requested',
    invoice.id,
    invoice.amount_remaining,
    invoice.currency,
  );

  // The guards below stop a second charge. Each metadata marker is written by this example.

  // A pending payment may still settle. Charging again would take the money twice.
  if (meta.primer_pending_payment_id) {
    console.error(
      'renewal skipped:',
      invoice.id,
      'has pending Primer payment',
      meta.primer_pending_payment_id,
    );
    return;
  }

  // Primer took this money but the outcome never reached Stripe, so the invoice is still open.
  // Report it by hand. A reported success pays the invoice, so only a stuck report lands here.
  if (meta.primer_charged_payment_id) {
    console.error(
      'renewal skipped:',
      invoice.id,
      'already charged by Primer payment',
      meta.primer_charged_payment_id,
      '- report it to Stripe by hand',
    );
    return;
  }

  // A replay of the event whose outcome is already recorded. The counter has moved on, so
  // without this the replay would get a new Primer key and charge again.
  if (meta.primer_reported_event_id === eventId) {
    console.log('renewal skipped: event', eventId, 'was already reported');
    return;
  }

  // A hard decline means this invoice is not charged again, even if the payment method
  // changes. Clear `primer_decline_classification` by hand to retry it.
  if (meta.primer_decline_classification === 'hard') {
    console.error(
      'renewal skipped:',
      invoice.id,
      'was hard declined and is not charged again; clear primer_decline_classification by hand to retry it',
    );
    return;
  }

  // How many attempts have been reported to Stripe. It keys Primer's idempotency.
  const attempt =
    meta.primer_reported_attempts === undefined
      ? 0
      : Number(meta.primer_reported_attempts);
  if (!Number.isInteger(attempt) || attempt < 0) {
    console.error(
      'renewal skipped:',
      invoice.id,
      'has an invalid primer_reported_attempts:',
      meta.primer_reported_attempts,
    );
    return;
  }

  const paymentMethod = await billing.resolveInvoicePaymentMethod(invoice);
  const token = paymentMethod?.metadata?.[billing.PRIMER_TOKEN_KEY];
  if (!token) {
    console.error(
      'no Primer token for invoice',
      invoice.id,
      '- was the custom payment method attached at signup?',
    );
    return;
  }

  let payment;
  try {
    payment = await primer.createPayment({
      token,
      invoiceId: invoice.id,
      amount: invoice.amount_remaining,
      currency: invoice.currency.toUpperCase(),
      customerId: invoice.customer,
      subscriptionId: billing.invoiceSubscriptionId(invoice),
      // Our own counter, not Stripe's attempt_count: that only rises on automatic retries,
      // so a manual retry would reuse the key and Primer would refuse it.
      idempotencyKey: `renewal:${invoice.id}:${attempt}`,
    });
  } catch (err) {
    if (primer.isDuplicateRequest(err)) {
      // Primer already has a payment for this invoice and attempt: either it was charged and
      // its outcome never reached Stripe, or two deliveries overlapped. Never charge again.
      console.error(
        `DUPLICATE renewal: Primer already has a payment for ${invoice.id}, attempt ${attempt}. ` +
          `Wait a few minutes, then if the invoice is still open, find the payment in Primer by orderId, ` +
          `report it to Stripe by hand and set primer_reported_attempts to ${attempt + 1}.`,
      );
      return;
    }
    throw err;
  }

  let verdict = primer.classifyPayment(payment);
  console.log(
    'renewal outcome',
    payment.id,
    payment.status,
    verdict.classification,
    verdict.code || '',
  );
  let clearPending = false;

  // Stamp nothing and keep the counter: this payment may have taken the money. The next retry
  // is refused as a duplicate until someone checks the payment in Primer.
  if (verdict.classification === 'unknown') {
    console.error(
      'renewal outcome unknown: check Primer payment',
      payment.id,
      'for invoice',
      invoice.id,
    );
    return;
  }

  if (verdict.classification === 'pending') {
    // No outcome yet. Park the invoice until Primer's PAYMENT.STATUS webhook reports it.
    await billing
      .whenClockIdle(() =>
        billing.markPendingPayment(invoice.id, payment.id, eventId),
      )
      .catch((err) => {
        // Unmarked, the next retry event would charge again while this payment is in flight.
        err.message = `marking pending Primer payment ${payment.id} on ${invoice.id} failed: ${err.message}`;
        throw err;
      });

    // The payment may have settled before the marker landed. Its webhook then found no marker
    // and was ignored, so nothing else would report it. Look once more.
    let latest;
    try {
      latest = await primer.getPayment(payment.id);
    } catch (err) {
      console.error(
        'could not re-check pending payment',
        payment.id,
        err.message,
        `- check payment ${payment.id} by hand; its webhook may already have arrived`,
      );
      return;
    }
    const settled = primer.classifyPayment(latest);
    // Still pending, or unknown (already logged): the webhook or a person takes it from here.
    if (['pending', 'unknown'].includes(settled.classification)) return;
    payment = latest;
    verdict = settled;
    clearPending = true;
  }

  const approved = verdict.classification === 'approved';

  // Mark an approved charge before reporting it. If the report fails, the marker is what stops
  // the next retry charging again. Declines are never marked, or the guard above would skip every
  // retry. A failed mark is only logged: a successful report pays the invoice anyway.
  if (approved) {
    await billing
      .whenClockIdle(() => billing.markChargedPayment(invoice.id, payment.id))
      .catch((err) => {
        console.error(
          'could not mark charged payment',
          payment.id,
          'on',
          invoice.id,
          err.message,
        );
      });
  }

  // Stamp a decline before reporting it: Stripe's retry automations branch on this.
  if (!approved) {
    await billing
      .whenClockIdle(() =>
        billing.stampDeclineClassification(invoice.id, verdict),
      )
      .catch((err) => {
        err.message = `stamping decline for Primer payment ${payment.id} on ${invoice.id} failed: ${err.message}`;
        throw err;
      });
  }

  try {
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
        'renewal payment',
        payment.id,
        'was already reported to Stripe',
      );
      return;
    }
    // Primer has the outcome and Stripe does not. The counter did not advance, so the next retry
    // is refused as a duplicate. Report this payment by hand.
    if (approved)
      console.error(billing.strandedRenewal(payment.id, invoice.id, attempt));
    err.message = `reporting Primer payment ${payment.id} (${payment.status}) to Stripe failed: ${err.message}`;
    throw err;
  }

  console.log(
    'renewal reported',
    invoice.id,
    'Primer payment',
    payment.id,
    approved ? 'paid' : 'failed',
  );

  // Advance the counter only now that Stripe has the outcome. Don't throw: the report is done.
  const clear = clearPending
    ? ['primer_pending_payment_id', 'primer_pending_event_id']
    : [];
  await billing
    .whenClockIdle(() =>
      billing.recordReportedAttempt(invoice.id, attempt, eventId, clear),
    )
    .catch((err) => {
      console.error(
        `could not record attempt ${attempt} on ${invoice.id} (Primer payment ${payment.id}): ${err.message}. ` +
          'The next retry is refused as a duplicate until primer_reported_attempts is fixed by hand.',
      );
    });
}
