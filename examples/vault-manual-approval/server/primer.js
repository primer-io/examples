import { randomUUID } from 'node:crypto';
import { config } from './config.js';

export class PrimerError extends Error {
  constructor(message, status, body) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

// Approve and resolve send a random key per call. Primer answers a replayed
// key with an error rather than the original response, so the key gives no
// retry protection here. Resolve is idempotent on paymentAttemptId anyway.
async function request(method, path, body, idempotencyKey) {
  const headers = {
    'X-Api-Key': config.primerApiKey,
    'X-Api-Version': '2.4',
    'Content-Type': 'application/json',
  };
  if (idempotencyKey) headers['X-Idempotency-Key'] = idempotencyKey;

  let res;
  let text;
  try {
    res = await fetch(`https://${config.primerApiHost}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(30_000),
    });
    text = await res.text();
  } catch (cause) {
    // The request may have reached Primer, so the outcome is unknown.
    throw Object.assign(
      new PrimerError(
        `Primer ${method} ${path} did not complete: ${cause.message}`,
      ),
      { outcomeUnknown: true },
    );
  }
  let parsed = null;
  try {
    parsed = text ? JSON.parse(text) : null;
  } catch {
    parsed = { raw: text };
  }
  if (!res.ok) {
    throw new PrimerError(
      `Primer ${method} ${path} -> ${res.status}`,
      res.status,
      parsed,
    );
  }
  return parsed;
}

// approvalMode MANUAL pauses the payment after the card is tokenized, until
// the backend calls approve or resolve.
export async function createClientSession({
  orderId,
  customerId,
  amount,
  currencyCode,
  countryCode,
}) {
  const session = await request('POST', '/client-session', {
    approvalMode: 'MANUAL',
    orderId,
    customerId, // identifies the shopper to Primer
    amount,
    currencyCode,
    paymentMethod: { vaultOnSuccess: true },
    order: {
      countryCode,
      lineItems: [
        { itemId: 'item-1', description: 'Example order', amount, quantity: 1 },
      ],
    },
  });
  return session.clientToken;
}

// Approve hands the held payment to your Primer Workflow.
// Returns null when Primer accepted the approval but sent no readable payment
// id, because the approval has already gone through.
export async function approvePaymentAttempt(paymentAttemptId) {
  const res = await request(
    'POST',
    `/payment-attempts/${encodeURIComponent(paymentAttemptId)}/approve`,
    undefined,
    randomUUID(),
  );
  const paymentId = [res?.paymentId, res?.payment_id, res?.id].find(
    (v) => typeof v === 'string' && v !== '',
  );
  return paymentId ?? null;
}

// Tells Primer the merchant processed the payment elsewhere.
export function resolvePaymentAttempt(paymentAttemptId, outcome) {
  return request(
    'POST',
    `/payment-attempts/${encodeURIComponent(paymentAttemptId)}/resolve`,
    { outcome },
    randomUUID(),
  );
}

export function getPayment(paymentId) {
  return request('GET', `/payments/${encodeURIComponent(paymentId)}`);
}
