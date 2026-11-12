// Stripe Billing with third-party payment processing:
// https://docs.stripe.com/billing/subscriptions/third-party-payment-processing
import Stripe from 'stripe';
import { config } from './config.js';

// Pinned so an SDK upgrade can't change the API version under you.
// Short timeout and one retry: a hung Stripe call would stall the renewal.
export const stripe = new Stripe(config.stripeSecretKey, {
  apiVersion: '2026-10-28.endive',
  timeout: 10_000,
  maxNetworkRetries: 1,
});

// Metadata key on the custom payment method that holds the Primer vaulted token.
export const PRIMER_TOKEN_KEY = 'primer_payment_method_token';

// Writes that report a payment or attach a payment method are keyed on the Primer payment id
// (`recordReportedAttempt` on invoice and attempt), so the browser, a webhook and a redelivery
// can all report the same payment safely. The metadata markers and the signup creates are not
// keyed.
// An empty part would give keys like `cpm:undefined` that collide across customers, so refuse it.
const idem = (prefix, ...parts) => {
  if (parts.some((part) => part === undefined || part === null || part === ''))
    throw new Error(`Empty idempotency key part for ${prefix}`);
  return { idempotencyKey: [prefix, ...parts].join(':') };
};

// In our testing, Stripe returned 429 for writes to a test clock's objects while the clock
// advanced. This is observed, not documented. Only test clocks lock, so production never takes
// this path. Wait for the clock, then retry once. `write`
// builds the request, so the retry carries the same idempotency key.
export async function whenClockIdle(write) {
  try {
    return await write();
  } catch (err) {
    const clockId =
      err?.statusCode === 429 &&
      /test clock advancement/i.test(err.message) &&
      err.message.match(/clock_[A-Za-z0-9]+/)?.[0];
    if (!clockId) throw err;
    console.log(
      'test clock',
      clockId,
      'is advancing, waiting to retry the write',
    );
    const deadline = Date.now() + 90_000;
    for (;;) {
      const clock = await stripe.testHelpers.testClocks.retrieve(clockId);
      if (clock.status === 'ready') break;
      if (clock.status === 'internal_failure' || Date.now() > deadline)
        throw err;
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
    return write();
  }
}

const idOf = (value) => (typeof value === 'string' ? value : value?.id);

// Accounts with Billing automations (which this integration needs) can't attach an existing
// customer to a test clock, so the customer is created on the clock.
async function createTestClock() {
  const clock = await stripe.testHelpers.testClocks.create({
    frozen_time: Math.floor(Date.now() / 1000),
    name: 'Primer Stripe Billing example',
  });
  return clock.id;
}

// payment_behavior default_incomplete leaves an open invoice. Its amount_due includes tax and
// proration, and is what Primer must charge.
export async function createCustomerAndSubscription(email) {
  const customer = await stripe.customers.create({
    email,
    ...(config.stripeUseTestClock && { test_clock: await createTestClock() }),
  });
  const subscription = await stripe.subscriptions.create({
    customer: customer.id,
    items: [{ price: config.stripePriceId }],
    payment_behavior: 'default_incomplete',
    payment_settings: { save_default_payment_method: 'on_subscription' },
    expand: ['latest_invoice'],
  });
  const invoice = subscription.latest_invoice;
  return {
    subscriptionId: subscription.id,
    customerId: customer.id,
    invoiceId: invoice.id,
    amountDue: invoice.amount_due, // minor units, passed to Primer unchanged
    currency: invoice.currency.toUpperCase(), // Stripe is lowercase, Primer is uppercase
  };
}

// Stripe is the only store, so state is read back from it on every request.
// Returns null when the subscription does not exist.
export async function loadSubscription(subscriptionId) {
  try {
    const sub = await stripe.subscriptions.retrieve(subscriptionId, {
      expand: ['latest_invoice', 'customer'],
    });
    const invoice = sub.latest_invoice;
    return {
      subscriptionId: sub.id,
      status: sub.status,
      // Stripe's 23-hour window for the first payment runs from here.
      created: sub.created,
      customerId: sub.customer.id,
      email: sub.customer.email,
      invoiceId: invoice.id,
      amountDue: invoice.amount_due,
      currency: invoice.currency.toUpperCase(),
      priceId: sub.items.data[0].price.id,
      description: invoice.lines.data[0]?.description || 'Subscription',
    };
  } catch (err) {
    if (err.code === 'resource_missing') return null;
    throw err;
  }
}

// Creates the custom payment method holding the Primer token, attaches it to the customer, and
// makes it the subscription default. Stripe then asks us to collect each renewal, rather than
// trying to collect it itself.
export async function attachPrimerPaymentMethod({
  customerId,
  subscriptionId,
  primerToken,
  card,
  primerPaymentId,
}) {
  const paymentMethod = await stripe.paymentMethods.create(
    {
      type: 'custom',
      custom: { type: config.stripeCpmTypeId },
      metadata: {
        [PRIMER_TOKEN_KEY]: primerToken,
        // For your own UI. Never put a full card number here.
        card_last4: String(card.last4Digits || ''),
        card_network: String(card.network || ''),
        card_expiry: `${card.expirationMonth || ''}/${card.expirationYear || ''}`,
      },
    },
    idem('cpm', primerPaymentId),
  );
  await stripe.paymentMethods.attach(
    paymentMethod.id,
    { customer: customerId },
    idem('attach-pm', primerPaymentId),
  );
  await stripe.subscriptions.update(
    subscriptionId,
    { default_payment_method: paymentMethod.id },
    idem('sub-default', primerPaymentId),
  );
  return paymentMethod;
}

// Reports the first payment and attaches it to the invoice, which pays the invoice and
// activates the subscription. It must happen within 23 hours of creating the subscription.
export async function reportFirstPayment({
  invoiceId,
  customerId,
  paymentMethodId,
  amount,
  currency,
  primerPaymentId,
  at,
}) {
  const paymentRecord = await stripe.paymentRecords.reportPayment(
    {
      amount_requested: { value: amount, currency: currency.toLowerCase() },
      payment_method_details: { payment_method: paymentMethodId },
      customer_details: { customer: customerId },
      initiated_at: at,
      customer_presence: 'on_session',
      processor_details: {
        type: 'custom',
        custom: { payment_reference: primerPaymentId },
      },
      outcome: 'guaranteed',
      guaranteed: { guaranteed_at: at },
    },
    idem('report', primerPaymentId),
  );
  await stripe.invoices.attachPayment(
    invoiceId,
    { payment_record: paymentRecord.id },
    idem('attach', primerPaymentId),
  );
}

// Reports a renewal attempt. If the invoice already has a payment record (an earlier failed
// attempt), the new attempt goes on that record, so the invoice shows one payment with its
// attempt history instead of a row of separate records.
export async function reportRenewalAttempt({
  invoice,
  paymentMethodId,
  amount,
  currency,
  primerPaymentId,
  succeeded,
  at,
}) {
  const outcome = succeeded
    ? { outcome: 'guaranteed', guaranteed: { guaranteed_at: at } }
    : { outcome: 'failed', failed: { failed_at: at } };

  const existing = await stripe.invoicePayments.list({
    invoice: invoice.id,
    payment: { type: 'payment_record' },
  });

  if (existing.data.length > 0) {
    const recordId = idOf(existing.data[0].payment.payment_record);
    // Two PAYMENT.STATUS deliveries for one payment can arrive together.
    if (await recordHasPayment(recordId, primerPaymentId)) return;
    // The record id is the first argument, not part of the params.
    await stripe.paymentRecords.reportPaymentAttempt(
      recordId,
      {
        initiated_at: at,
        // The attempt report has no processor_details, so this is how we recognize it later.
        metadata: { primer_payment_id: primerPaymentId },
        payment_method_details: { payment_method: paymentMethodId },
        ...outcome,
      },
      idem('attempt', primerPaymentId),
    );
    return;
  }

  const paymentRecord = await stripe.paymentRecords.reportPayment(
    {
      amount_requested: { value: amount, currency: currency.toLowerCase() },
      payment_method_details: { payment_method: paymentMethodId },
      customer_details: { customer: idOf(invoice.customer) },
      initiated_at: at,
      customer_presence: 'off_session',
      processor_details: {
        type: 'custom',
        custom: { payment_reference: primerPaymentId },
      },
      ...outcome,
    },
    idem('report', primerPaymentId),
  );
  await stripe.invoices.attachPayment(
    invoice.id,
    { payment_record: paymentRecord.id },
    idem('attach', primerPaymentId),
  );
}

// A payment record holds the payment that opened it as its payment_reference. Later attempts
// carry primer_payment_id in their metadata.
async function recordHasPayment(recordId, primerPaymentId) {
  const record = await stripe.paymentRecords.retrieve(recordId);
  if (record.processor_details?.custom?.payment_reference === primerPaymentId)
    return true;
  const attempts = await stripe.paymentAttemptRecords.list({
    payment_record: recordId,
    limit: 100,
  });
  return attempts.data.some(
    (a) => a.metadata?.primer_payment_id === primerPaymentId,
  );
}

// Whether this Primer payment was already reported on the invoice, as a record or an attempt.
export async function isPaymentReported(invoiceId, primerPaymentId) {
  const payments = await stripe.invoicePayments.list({
    invoice: invoiceId,
    payment: { type: 'payment_record' },
  });
  for (const row of payments.data) {
    const recordId = idOf(row.payment.payment_record);
    if (recordId && (await recordHasPayment(recordId, primerPaymentId)))
      return true;
  }
  return false;
}

// Stripe's retry automations can't see why a payment declined, so stamp the classification on
// the invoice before reporting the failure. The automations branch on it: a hard decline
// triggers the merchant's Stripe Billing automation, a soft one follows the retry schedule.
export function stampDeclineClassification(
  invoiceId,
  { classification, code },
) {
  return stripe.invoices.update(invoiceId, {
    metadata: {
      primer_decline_classification: classification,
      primer_decline_code: code || '',
      primer_last_attempt_at: new Date().toISOString(),
    },
  });
}

// Primer answered PENDING. This marker stops a later event from charging the invoice again
// while the payment is in flight. The Stripe event id is kept so the replay guard in
// renewal.js still matches that event once the payment settles.
export function markPendingPayment(invoiceId, primerPaymentId, eventId) {
  return stripe.invoices.update(invoiceId, {
    metadata: {
      primer_pending_payment_id: primerPaymentId,
      primer_pending_event_id: eventId,
    },
  });
}

// Written once Primer has taken the money and before it is reported to Stripe. If the report
// fails the invoice stays open, and this marker keeps blocking a second charge.
export function markChargedPayment(invoiceId, primerPaymentId) {
  return stripe.invoices.update(invoiceId, {
    metadata: { primer_charged_payment_id: primerPaymentId },
  });
}

// Advances the attempt counter that keys Primer's idempotency. Call it only after the outcome
// reached Stripe: until then the same key must keep being refused as a duplicate.
// `clear` lists markers to unset in the same write (Stripe unsets a key set to '').
export async function recordReportedAttempt(
  invoiceId,
  attempt,
  eventId,
  clear = [],
) {
  try {
    await stripe.invoices.update(
      invoiceId,
      {
        metadata: {
          primer_reported_attempts: String(attempt + 1),
          // Tells a replay of this event apart from the next scheduled retry.
          primer_reported_event_id: eventId,
          ...Object.fromEntries(clear.map((key) => [key, ''])),
        },
      },
      idem('reported', invoiceId, attempt),
    );
  } catch (err) {
    // Same key, different parameters: another caller recorded this attempt first.
    if (isIdempotencyError(err) && (await alreadySettled(invoiceId, attempt)))
      return;
    throw err;
  }
}

export const isIdempotencyError = (err) =>
  err?.type === 'StripeIdempotencyError';

// Whether a failed report only lost a race with a caller that already finished the job. A failed
// check counts as no, so the caller still has the original error and the payment id to report.
export async function settledByAnotherCaller(err, invoiceId, attempt) {
  if (!isIdempotencyError(err)) return false;
  try {
    return await alreadySettled(invoiceId, attempt);
  } catch (checkErr) {
    console.error('could not check invoice', invoiceId, checkErr.message);
    return false;
  }
}

export const strandedRenewal = (paymentId, invoiceId, attempt) =>
  `STRANDED renewal ${paymentId} for invoice ${invoiceId}: report it in Stripe by hand, then clear primer_pending_payment_id and primer_pending_event_id and set primer_reported_attempts to ${attempt + 1}.`;

// True when the invoice is paid or its attempt counter has moved past `attempt`:
// whatever raced this call has finished the job.
export async function alreadySettled(invoiceId, attempt) {
  const invoice = await stripe.invoices.retrieve(invoiceId);
  return (
    invoice.status === 'paid' ||
    Number(invoice.metadata?.primer_reported_attempts || 0) > attempt
  );
}

export const invoiceSubscriptionId = (invoice) =>
  idOf(invoice.parent?.subscription_details?.subscription);

// The payment method to charge for an invoice. invoice.default_payment_method is usually null,
// because setting the default on the subscription doesn't copy it down. Stripe resolves
// invoice, then subscription, then customer, so do the same.
export async function resolveInvoicePaymentMethod(invoice) {
  const invoicePm = idOf(invoice.default_payment_method);
  if (invoicePm) return stripe.paymentMethods.retrieve(invoicePm);

  const subscriptionId = invoiceSubscriptionId(invoice);
  if (subscriptionId) {
    const sub = await stripe.subscriptions.retrieve(subscriptionId);
    const subPm = idOf(sub.default_payment_method);
    if (subPm) return stripe.paymentMethods.retrieve(subPm);
  }

  const customer = await stripe.customers.retrieve(idOf(invoice.customer));
  const customerPm = idOf(customer.invoice_settings?.default_payment_method);
  return customerPm ? stripe.paymentMethods.retrieve(customerPm) : null;
}
