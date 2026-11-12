// The first payment: the shopper paid the first invoice in Primer Checkout, and Primer vaulted
// the card. Link the card to the Stripe customer, then report the payment so the invoice is paid.
//
// Two callers can get here for one payment: the browser (POST /api/payment-complete) and
// Primer's PAYMENT.STATUS webhook. Every Stripe write is keyed on the Primer payment id,
// so running both is safe.
import { HttpError } from './http-error.js';
import * as primer from './primer.js';
import * as billing from './stripe.js';

// Returns { outcome: 'ACTIVE' | 'PENDING' | 'DECLINED', subscriptionStatus, message? }.
// Throws an HttpError whose message is safe to show the shopper.
export async function completeFirstPayment(subscriptionId, primerPaymentId) {
  const sub = await billing.loadSubscription(subscriptionId);
  if (!sub) throw new HttpError(400, 'Unknown subscription.');

  // Stripe only accepts the first payment while the subscription waits for it.
  // After 23 hours the subscription expires and the invoice can no longer take a payment.
  if (sub.status !== 'incomplete')
    return handleSettledSubscription(sub, primerPaymentId);

  const payment = await primer.getPayment(primerPaymentId);
  const verdict = primer.classifyPayment(payment);

  if (verdict.classification === 'unknown') {
    // Not a payment we understand, so it can't be checked against the invoice either. Report
    // nothing, and don't invite a retry: the shopper may have been charged.
    throw new HttpError(
      502,
      `Payment ${primerPaymentId} has status ${payment?.status || 'missing'}; check the Primer dashboard. Do not pay again.`,
    );
  }

  // The payment id comes from the browser. Before it can mark an invoice paid, check that it
  // is the payment for this invoice, this amount and this customer.
  const mismatch = [
    payment.orderId !== sub.invoiceId && 'orderId',
    payment.amount !== sub.amountDue && 'amount',
    String(payment.currencyCode).toUpperCase() !== sub.currency &&
      'currencyCode',
    payment.customerId !== sub.customerId && 'customerId',
  ].filter(Boolean);
  if (mismatch.length > 0) {
    console.error(
      'payment does not match invoice',
      primerPaymentId,
      sub.invoiceId,
      mismatch.join(','),
    );
    throw new HttpError(400, 'This payment does not match the invoice.');
  }

  if (verdict.classification === 'pending') {
    // Not an outcome yet. Reporting it as paid would pay the invoice for money that may
    // never arrive. The PAYMENT.STATUS webhook finishes the work.
    console.log(
      'first payment pending, nothing reported',
      primerPaymentId,
      sub.invoiceId,
    );
    return {
      outcome: 'PENDING',
      subscriptionStatus: sub.status,
      message: 'Your payment is still processing.',
    };
  }

  // A declined first payment is not reported to Stripe. The shopper is on the page and can try
  // another card. Reporting it would let the hard-decline automation cancel the subscription
  // under them, and the retry schedule has no saved card to charge. If they leave,
  // Stripe expires the incomplete subscription after 23 hours.
  if (verdict.classification !== 'approved') {
    console.log(
      'first payment declined',
      primerPaymentId,
      sub.invoiceId,
      verdict.classification,
      verdict.code,
    );
    return {
      outcome: 'DECLINED',
      subscriptionStatus: sub.status,
      message: 'The payment was declined. Try another card.',
    };
  }

  // From here Primer has taken the money. Any failure must say so: a generic "try again"
  // sends a charged shopper back to pay a second time.
  try {
    return await reportApprovedPayment(sub, payment);
  } catch (err) {
    if (err instanceof HttpError) throw err;
    // Nothing retries this report. Repeating it with the same Stripe idempotency keys can't
    // help: Stripe saves the response to a key, 500s included, and replays it for at least 24
    // hours (https://docs.stripe.com/api/idempotent_requests). A person has to finish it.
    const deadline = new Date((sub.created + 23 * 3600) * 1000).toISOString();
    console.error(
      `STRANDED first payment ${primerPaymentId} for invoice ${sub.invoiceId}: report it to Stripe by hand before ${deadline}, or refund it in Primer.`,
      err.message,
    );
    throw new HttpError(
      502,
      `Your payment ${primerPaymentId} was taken but could not be confirmed with Stripe yet. Do not pay again; the merchant will confirm it.`,
    );
  }
}

async function reportApprovedPayment(sub, payment) {
  // Without vaulting there is no token to charge at renewal.
  if (payment.paymentMethod?.isVaulted !== true) {
    console.error(
      `first payment ${payment.id} approved but not vaulted, invoice ${sub.invoiceId}: refund payment ${payment.id} in Primer, or vault the card and report by hand.`,
    );
    throw new HttpError(
      502,
      'The payment succeeded but the card was not saved. Do not pay again. Check vaultOnSuccess and customerId on the client session.',
    );
  }

  try {
    await attachAndReport(sub, payment);
  } catch (err) {
    // Another caller reporting the same payment with the same keys. Done if it is reported.
    if (
      !billing.isIdempotencyError(err) ||
      !(await billing.isPaymentReported(sub.invoiceId, payment.id))
    )
      throw err;
    console.log('first payment already reported', payment.id);
  }

  // Best effort: the payment is reported, so a failed read must not turn into an error.
  // Say ACTIVE only for a status we read and know is live.
  let status = null;
  try {
    status = (await billing.stripe.subscriptions.retrieve(sub.subscriptionId))
      .status;
  } catch (err) {
    console.error('could not read subscription after reporting', err.message);
  }
  console.log('first payment reported', sub.invoiceId, 'subscription', status);
  if (status === 'active' || status === 'trialing')
    return { outcome: 'ACTIVE', subscriptionStatus: status };
  return {
    outcome: 'PENDING',
    subscriptionStatus: status,
    message: `Your payment ${payment.id} was reported to Stripe, but the subscription is not confirmed active yet. Do not pay again.`,
  };
}

async function attachAndReport(sub, payment) {
  // Renewals charge the multi-use token from the payment-instruments list.
  let vaulted = await primer.findVaultedToken(
    sub.customerId,
    payment.paymentMethod,
  );
  if (!vaulted) {
    // The payment is vaulted, so fall back to its own token rather than leave a charged
    // customer without a saved card. This assumes the token on a vaulted payment is multi-use;
    // if it is not, renewals will fail.
    console.error(
      'no unique vaulted instrument for payment',
      payment.id,
      '- using the payment token. This assumes it is multi-use; if it is not, renewals will fail.',
    );
    vaulted = {
      token: payment.paymentMethod.paymentMethodToken,
      card: payment.paymentMethod.paymentMethodData || {},
    };
  }
  if (!vaulted.token)
    throw new Error('Primer returned no payment method token');

  const paymentMethod = await billing.attachPrimerPaymentMethod({
    customerId: sub.customerId,
    subscriptionId: sub.subscriptionId,
    primerToken: vaulted.token,
    card: vaulted.card,
    primerPaymentId: payment.id,
  });

  await billing.reportFirstPayment({
    invoiceId: sub.invoiceId,
    customerId: sub.customerId,
    paymentMethodId: paymentMethod.id,
    amount: sub.amountDue,
    currency: sub.currency,
    primerPaymentId: payment.id,
    at: primer.paymentTime(payment),
  });
}

// The subscription is no longer waiting for a first payment. Either this payment was already
// reported, or it arrived too late and the money needs a refund.
async function handleSettledSubscription(sub, primerPaymentId) {
  const expired = sub.status === 'incomplete_expired';
  if (
    !expired &&
    (await billing.isPaymentReported(sub.invoiceId, primerPaymentId))
  ) {
    return { outcome: 'ACTIVE', subscriptionStatus: sub.status };
  }

  const payment = await primer.getPayment(primerPaymentId);
  const chargedForThisInvoice =
    primer.classifyPayment(payment).classification === 'approved' &&
    payment.orderId === sub.invoiceId &&
    payment.customerId === sub.customerId;
  if (chargedForThisInvoice) {
    console.error(
      'approved payment for a subscription that is',
      sub.status,
      '- refund in Primer',
      primerPaymentId,
    );
    throw new HttpError(
      409,
      `Payment ${primerPaymentId} cannot be applied to a ${sub.status} subscription. Contact us to get a refund.`,
    );
  }
  throw new HttpError(
    409,
    `The subscription is ${sub.status}, not waiting for a first payment.`,
  );
}
