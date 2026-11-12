// The Express app: routes, validation and static files. index.js starts it, and `npm run check`
// imports it, so broken wiring fails there.
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import { HttpError } from './http-error.js';
import * as orders from './orders.js';
import * as refunds from './refunds.js';

export const app = express();

app.use(express.json());

const root = path.dirname(fileURLToPath(import.meta.url));
app.use(express.static(path.join(root, '..', 'public')));
// The browser imports Primer's loader from the npm package instead of a CDN.
const primerJsDir = path.dirname(
  createRequire(import.meta.url).resolve('@primer-io/primer-js'),
);
app.use('/vendor/primer-js', express.static(primerJsDir));

// Input from the browser is untrusted. Ids go into database lookups and Primer requests.
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

const requireText = (value, name, { required = false } = {}) => {
  if (value === undefined || value === null || value === '') {
    if (required) throw new HttpError(400, `${name} is required.`);
    return '';
  }
  const text = typeof value === 'string' ? value.trim() : null;
  if (text === null || text.length > 100 || /[\u0000-\u001f]/.test(text)) {
    throw new HttpError(400, `${name} is invalid.`);
  }
  if (required && !text) throw new HttpError(400, `${name} is required.`);
  return text;
};

// Primer's field names, all strings. Sphere's names are mapped in sphere.js.
const parseAddress = (value) => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new HttpError(400, 'address is invalid.');
  }
  const countryCode = requireText(value.countryCode, 'countryCode', {
    required: true,
  });
  if (!/^[A-Za-z]{2}$/.test(countryCode)) {
    throw new HttpError(400, 'countryCode must be 2 letters.');
  }
  return {
    addressLine1: requireText(value.addressLine1, 'addressLine1'),
    addressLine2: requireText(value.addressLine2, 'addressLine2'),
    city: requireText(value.city, 'city', { required: true }),
    state: requireText(value.state, 'state'),
    postalCode: requireText(value.postalCode, 'postalCode', { required: true }),
    countryCode: countryCode.toUpperCase(),
  };
};

const parseTaxId = (value) => {
  if (value === undefined || value === null) return '';
  if (
    typeof value !== 'string' ||
    value.length > 50 ||
    !/^[A-Za-z0-9 .-]*$/.test(value)
  ) {
    throw new HttpError(400, 'taxId is invalid.');
  }
  return value.trim();
};

const parseAmount = (value) => {
  if (!Number.isSafeInteger(value) || value < 1) {
    throw new HttpError(400, 'amount must be a whole number of minor units.');
  }
  return value;
};

// Step 1. Start an order. With an address, the tax is known before the checkout loads.
app.post('/api/orders', async (req, res) => {
  const hasAddress = req.body?.address != null;
  const address = hasAddress ? parseAddress(req.body.address) : null;
  const taxId = hasAddress ? parseTaxId(req.body.taxId) : '';
  res.json(await orders.createOrder({ address, taxId }));
});

// Step 2. The shopper entered an address in the checkout page: quote the tax again.
app.post('/api/orders/:id/tax', async (req, res) => {
  const id = requireId(req.params.id, 'ord_', 'order id');
  const address = parseAddress(req.body?.address);
  const taxId = parseTaxId(req.body?.taxId);
  res.json(await orders.applyTax(id, { address, taxId }));
});

// Step 3. Primer says the payment worked. Check that with Primer and record the sale.
app.post('/api/orders/:id/payment', async (req, res) => {
  const id = requireId(req.params.id, 'ord_', 'order id');
  const paymentId = requireId(req.body?.paymentId, '', 'paymentId');
  try {
    res.json(await orders.confirmPayment(id, paymentId, { waitMs: 15_000 }));
  } catch (err) {
    if (err instanceof HttpError) throw err;
    // The shopper has already paid, so the generic "please try again" would send them back to
    // pay twice. The worker keeps checking this payment.
    console.error(
      'STRANDED? Primer payment',
      paymentId,
      'order',
      id,
      err.message,
      JSON.stringify(err.body || {}),
    );
    throw new HttpError(
      502,
      `Payment ${paymentId} may have been taken but could not be confirmed. Do not pay again; check with the merchant.`,
    );
  }
});

app.post('/api/orders/:id/refunds', async (req, res) => {
  const id = requireId(req.params.id, 'ord_', 'order id');
  const amount = parseAmount(req.body?.amount);
  res.json(await refunds.startRefund(id, amount));
});

app.post('/api/orders/:id/cancel-in-sphere', async (req, res) => {
  const id = requireId(req.params.id, 'ord_', 'order id');
  res.json(await refunds.cancelSale(id));
});

app.get('/api/orders/:id', (req, res) => {
  const id = requireId(req.params.id, 'ord_', 'order id');
  res.json({ summary: orders.summarize(id) });
});

// Upstream error bodies can hold details the browser must not see, so they are only logged.
app.use((err, req, res, next) => {
  if (res.headersSent) return next(err);
  // HttpError, or a 4xx from the body parser (malformed JSON, body too large).
  if (err instanceof HttpError || err.expose)
    return res.status(err.status).json({
      error: err.message,
      code: err instanceof HttpError ? err.code : undefined,
    });
  console.error(
    req.method,
    req.path,
    'failed:',
    err.message,
    JSON.stringify(err.body || {}),
  );
  res.status(502).json({ error: 'Something went wrong. Please try again.' });
});
