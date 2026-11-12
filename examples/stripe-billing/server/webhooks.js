// Webhook receivers. Both routes get the raw body (see app.js): a signature is computed over
// the exact bytes, so a parsed and re-serialized body would never match.
//
// Both acknowledge with 200 before doing any work. Stripe redelivers an event when the
// response is slow, and a card authorization is slow. Holding the response open across one
// is how an integration charges a customer twice.
import { createHmac, timingSafeEqual } from 'node:crypto';
import { config } from './config.js';
import { handlePaymentStatus } from './primer-events.js';
import { classifyPayment, PrimerError } from './primer.js';
import { handleRenewal } from './renewal.js';
import { stripe } from './stripe.js';

// Stripe. Every event must be signed: an unsigned one could name any open invoice and
// trigger a charge outside Stripe's schedule.
export function stripeWebhook(req, res) {
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      req.get('stripe-signature') || '',
      config.stripeWebhookSecret,
    );
  } catch (err) {
    console.error('stripe webhook signature failed:', err.message);
    return res.status(400).send('Invalid signature');
  }

  res.sendStatus(200);

  // The invoice event is the only signal to act on. Stripe also creates and cancels an
  // internal PaymentIntent per invoice. Those events are noise here.
  if (event.type !== 'invoice.payment_attempt_required') return;

  // The event is already acknowledged, so a log line is the only trace of a failure.
  processRenewal(event).catch((err) => {
    const invoiceId = event.data.object.id;
    if (err instanceof PrimerError && err.outcomeUnknown) {
      console.error(
        `OUTCOME UNKNOWN: check Primer payments with orderId=${invoiceId}. The charge may have gone through.`,
        err.message,
      );
    } else {
      console.error(
        'renewal failed',
        'event',
        event.id,
        'invoice',
        invoiceId,
        err.message,
        JSON.stringify(err.body || err.raw || {}),
      );
    }
  });
}

async function processRenewal(event) {
  // Read the invoice fresh: the event payload may be stale by the time it is delivered.
  const invoice = await stripe.invoices.retrieve(event.data.object.id);
  // The first invoice is paid through the browser route and the PAYMENT.STATUS webhook. Charging
  // the stored token here too would take the first payment twice.
  if (invoice.billing_reason === 'subscription_create') {
    console.log(
      'renewal skipped',
      invoice.id,
      'is the first invoice (subscription_create), paid by the first-payment flow',
    );
    return;
  }
  // A void or uncollectible invoice can still show an amount remaining.
  if (invoice.status !== 'open' || invoice.amount_remaining <= 0) {
    console.log(
      'renewal skipped',
      invoice.id,
      'status',
      invoice.status,
      'remaining',
      invoice.amount_remaining,
    );
    return;
  }
  await handleRenewal(invoice, event.id);
}

// Primer sends the base64 HMAC-SHA256 of the raw body in X-Signature-Primary.
// X-Signature-Secondary appears only for 24 hours after a secret rotation, so accept either.
function hasValidSignature(req) {
  const expected = createHmac('sha256', config.primerWebhookSecret)
    .update(req.body)
    .digest();
  return ['x-signature-primary', 'x-signature-secondary'].some((name) => {
    const header = req.get(name);
    if (!header) return false;
    const given = Buffer.from(header, 'base64');
    return given.length === expected.length && timingSafeEqual(given, expected);
  });
}

export function primerWebhook(req, res) {
  // express.raw leaves no Buffer when the request has no body.
  if (!Buffer.isBuffer(req.body)) return res.status(400).send('Body required');
  if (!hasValidSignature(req)) {
    console.error('primer webhook signature failed');
    return res.status(401).send('Invalid signature');
  }

  let event;
  try {
    event = JSON.parse(req.body.toString('utf8'));
  } catch {
    return res.status(400).send('Body must be JSON');
  }

  // signedAt is a Unix timestamp in seconds inside the signed payload (milliseconds are
  // accepted defensively).
  // Primer retries are signed again, so an old one is a replay. Primer recommends rejecting
  // anything more than 3 minutes off.
  let signedAt = Number(event?.signedAt);
  if (signedAt > 1e12) signedAt /= 1000;
  if (
    !Number.isFinite(signedAt) ||
    Math.abs(Date.now() / 1000 - signedAt) > 180
  ) {
    console.error(
      'primer webhook rejected: signedAt missing or older than 3 minutes',
      event?.signedAt,
    );
    return res.status(400).send('Stale or missing signedAt');
  }

  res.sendStatus(200);

  if (event?.eventType !== 'PAYMENT.STATUS' || !event.payment) {
    console.log(
      'primer webhook ignored: unexpected event',
      event?.eventType,
      event?.payment?.id,
    );
    return;
  }
  handlePaymentStatus(event.payment).catch((err) => {
    // Already acknowledged, and nothing retries this: Primer holds an outcome that Stripe may
    // not. A retry with the same Stripe idempotency keys would replay a saved failure.
    if (classifyPayment(event.payment).classification === 'approved')
      console.error(
        `STRANDED payment ${event.payment.id} for invoice ${event.payment.orderId}: report it to Stripe by hand, or refund it in Primer.`,
      );
    console.error(
      'primer webhook failed',
      'payment',
      event.payment.id,
      'order',
      event.payment.orderId,
      err.message,
      JSON.stringify(err.body || err.raw || {}),
    );
  });
}
