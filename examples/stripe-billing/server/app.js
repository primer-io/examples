// The Express app: routes, validation and static files. index.js starts it, and `npm run check`
// imports it, so broken wiring fails there.
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import { completeFirstPayment } from './first-payment.js';
import { HttpError } from './http-error.js';
import * as primer from './primer.js';
import * as billing from './stripe.js';
import { primerWebhook, stripeWebhook } from './webhooks.js';

export const app = express();

// Webhooks need the raw body to verify their signatures, so they are mounted
// before express.json(), which would replace the body with a parsed object.
// type '*/*' keeps a body with an unexpected Content-Type a Buffer, so it fails the signature
// check instead of arriving as undefined.
const raw = express.raw({ type: '*/*' });
app.post('/api/webhooks/stripe', raw, stripeWebhook);
app.post('/api/webhooks/primer', raw, primerWebhook);

app.use(express.json());

const root = path.dirname(fileURLToPath(import.meta.url));
app.use(express.static(path.join(root, '..', 'public')));
// The browser imports Primer's loader from the npm package instead of a CDN.
const primerJsDir = path.dirname(
  createRequire(import.meta.url).resolve('@primer-io/primer-js'),
);
app.use('/vendor/primer-js', express.static(primerJsDir));

// Input from the browser is untrusted. Ids go into Stripe and Primer requests.
const requireId = (value, prefix, name) => {
  if (
    typeof value !== 'string' ||
    !/^[A-Za-z0-9_-]+$/.test(value) ||
    !value.startsWith(prefix)
  ) {
    throw new HttpError(400, `${name} is invalid.`);
  }
  return value;
};
const requireEmail = (value) => {
  if (
    typeof value !== 'string' ||
    value.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
  ) {
    throw new HttpError(400, 'A valid email is required.');
  }
  return value;
};

// Step 1. Create the customer and subscription first: the invoice Stripe opens says how much
// Primer must charge. The price comes from config, never from the browser.
app.post('/api/subscribe', async (req, res) => {
  const email = requireEmail(req.body?.email);
  const sub = await billing.createCustomerAndSubscription(email);
  console.log(
    'subscription created',
    sub.subscriptionId,
    sub.amountDue,
    sub.currency,
  );
  res.json(sub);
});

// Step 2. Client session for the first payment. The amount is Stripe's, and the Primer
// customerId is the Stripe customer id, so the vault and the billing engine agree on who it is.
app.post('/api/client-session', async (req, res) => {
  const subscriptionId = requireId(
    req.body?.subscriptionId,
    'sub_',
    'subscriptionId',
  );
  const sub = await billing.loadSubscription(subscriptionId);
  if (!sub) throw new HttpError(400, 'Unknown subscription.');
  if (sub.status !== 'incomplete')
    throw new HttpError(
      409,
      `The subscription is ${sub.status}, not waiting for a first payment.`,
    );

  const session = await primer.createClientSession({
    invoiceId: sub.invoiceId,
    subscriptionId: sub.subscriptionId,
    customerId: sub.customerId,
    email: sub.email,
    amount: sub.amountDue,
    currency: sub.currency,
    priceId: sub.priceId,
    description: sub.description,
  });
  res.json({
    clientToken: session.clientToken,
    amount: sub.amountDue,
    currency: sub.currency,
    invoiceId: sub.invoiceId,
  });
});

// Step 3. Primer took the first payment. Link the vaulted card to the customer, report the payment.
app.post('/api/payment-complete', async (req, res) => {
  const subscriptionId = requireId(
    req.body?.subscriptionId,
    'sub_',
    'subscriptionId',
  );
  const primerPaymentId = requireId(
    req.body?.primerPaymentId,
    '',
    'primerPaymentId',
  );
  try {
    res.json(await completeFirstPayment(subscriptionId, primerPaymentId));
  } catch (err) {
    if (err instanceof HttpError) throw err;
    // The shopper has already paid in Primer, so the generic "please try again" would send them
    // back to pay twice. Any failure here says the payment may have been taken.
    console.error(
      'STRANDED? Primer payment',
      primerPaymentId,
      'subscription',
      subscriptionId,
      err.message,
      JSON.stringify(err.body || err.raw || {}),
    );
    throw new HttpError(
      502,
      `Payment ${primerPaymentId} may have been taken but could not be confirmed. Do not pay again; check with the merchant.`,
    );
  }
});

// Upstream error bodies can hold details the browser must not see, so they are only logged.
app.use((err, req, res, next) => {
  if (res.headersSent) return next(err);
  // HttpError, or a 4xx from the body parser (malformed JSON, body too large).
  if (err instanceof HttpError || err.expose)
    return res.status(err.status).json({ error: err.message });
  console.error(
    req.method,
    req.path,
    'failed:',
    err.message,
    JSON.stringify(err.body || err.raw || {}),
  );
  res.status(502).json({ error: 'Something went wrong. Please try again.' });
});
