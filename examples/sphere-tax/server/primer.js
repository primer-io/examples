// Primer API calls: https://primer.io/docs/api/v2.4
import { config } from './config.js';

// Carries what the caller needs to decide what to do next.
// outcomeUnknown is true when a request may have reached Primer and its result is not known: a
// timeout, a network error, a 5xx on a POST, or an empty 2xx.
export class PrimerError extends Error {
  constructor(
    message,
    { status = 0, body = null, outcomeUnknown = false } = {},
  ) {
    super(message);
    this.status = status;
    this.body = body;
    this.outcomeUnknown = outcomeUnknown;
  }
}

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
    // Without a timeout a hung connection would hold the request forever.
    res = await fetch(`https://${config.primerApiHost}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(30_000),
    });
    text = await res.text();
  } catch (err) {
    throw new PrimerError(`Primer ${method} ${path} failed: ${err.message}`, {
      outcomeUnknown: true,
    });
  }

  let parsed = null;
  try {
    parsed = text ? JSON.parse(text) : null;
  } catch {
    parsed = { raw: text };
  }
  if (!res.ok) {
    if (res.status === 401 || res.status === 403) {
      console.error(
        `PRIMER_AUTH_FAILED ${method} ${path} status ${res.status}: check PRIMER_API_KEY`,
      );
    }
    // A 5xx on a POST can come after Primer acted on it, so it is a timeout's equal.
    throw new PrimerError(`Primer ${method} ${path} returned ${res.status}`, {
      status: res.status,
      body: parsed,
      outcomeUnknown: method === 'POST' && res.status >= 500,
    });
  }
  // Every call here returns a body. An empty 2xx says nothing about what happened.
  if (parsed === null) {
    throw new PrimerError(
      `Primer ${method} ${path} returned ${res.status} with an empty body`,
      { status: res.status, outcomeUnknown: true },
    );
  }
  return parsed;
}

export function createClientSession(body) {
  return request('POST', '/client-session', body);
}

export function updateClientSession(body) {
  return request('PATCH', '/client-session', body);
}

export function getPayment(paymentId) {
  return request('GET', `/payments/${encodeURIComponent(paymentId)}`);
}

// The items are payment summaries: use them to find an id, then call getPayment for the rest.
export async function findPaymentsByOrder(orderId) {
  const res = await request(
    'GET',
    `/payments?order_id=${encodeURIComponent(orderId)}`,
  );
  return res.data || [];
}

// orderId on a refund is the merchant's own reference for it. It comes back on the REFUND
// transaction in GET /payments/{id}, which is how a refund is matched to our record.
export function refundPayment(
  paymentId,
  { amount, orderId, reason },
  idempotencyKey,
) {
  return request(
    'POST',
    `/payments/${encodeURIComponent(paymentId)}/refund`,
    { amount, orderId, reason },
    idempotencyKey,
  );
}

// Primer answers a reused idempotency key with an error, not the original result, so it
// already has this request. A refund gets 409 IdempotencyKeyAlreadyExists. The docs show 400
// for creating a payment, so both are accepted.
export function isDuplicateRequest(err) {
  if (!(err instanceof PrimerError)) return false;
  const errorId = String(
    err.body?.error?.errorId || err.body?.errorId || '',
  ).toLowerCase();
  return (
    (err.status === 409 || err.status === 400) &&
    errorId.includes('idempotencykeyalreadyexists')
  );
}

// Primer's dates are UTC but have no offset, and Date.parse would read that as server local
// time. Returns ISO 8601 with Z, which is what Sphere's finalized_on expects.
export function toUtcIso(date) {
  const text = String(date ?? '');
  const hasOffset = /T.*(Z|[+-]\d\d(:?\d\d)?)$/i.test(text);
  const ms = Date.parse(hasOffset ? text : `${text}Z`);
  // A made-up date would put the sale in the wrong tax period, so refuse instead.
  if (!Number.isFinite(ms)) throw new Error(`Unreadable Primer date: ${text}`);
  return new Date(ms).toISOString().replace(/\.\d{3}Z$/, 'Z');
}
