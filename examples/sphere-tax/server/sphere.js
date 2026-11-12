// Sphere API calls: https://docs.getsphere.com
import { config } from './config.js';

const CALCULATE_URL = 'https://server.getsphere.com/tax_api/calculate_tax';
const API_URL = 'https://api.getsphere.com/v1';
// calculate_tax runs while the shopper waits, so it gets a short timeout.
const CALCULATE_TIMEOUT_MS = 2_000;
// Recording happens after checkout, so it can wait longer.
const WRITE_TIMEOUT_MS = 15_000;

// kind says what went wrong: timeout, network, rate_limited (429), server (5xx) or client
// (any other status, or an answer we cannot use).
export class SphereError extends Error {
  constructor(
    message,
    {
      kind = 'client',
      status = 0,
      code = null,
      body = null,
      retryAfterMs = 0,
    } = {},
  ) {
    super(message);
    this.kind = kind;
    this.status = status;
    this.code = code;
    this.body = body;
    this.retryAfterMs = retryAfterMs;
  }
}

// Fail open only when Sphere is slow or down: a timeout, 429 or 5xx. Any other failure, such as
// a refused connection or a 4xx, means something else is wrong, so the checkout stops.
export const failsOpen = (err) =>
  ['timeout', 'rate_limited', 'server'].includes(err.kind);

// A queued write is retried unless Sphere gave a final answer. 401, 403 and 408 count as not
// final: a key can be fixed and a request can time out on Sphere's side.
export const isRetryableWrite = (err) =>
  err.kind !== 'client' || [401, 403, 408].includes(err.status);

export const withoutEmpty = (object) =>
  Object.fromEntries(Object.entries(object).filter(([, v]) => v));

// Sphere's documented error bodies: calculate_tax returns { code, message }, a 400 from the
// Transaction API returns { field: [message] }, and 403 and 404 return { detail }.
function errorDetail(body) {
  if (!body || typeof body !== 'object') return { code: null, message: null };
  if (typeof body.detail === 'string') {
    return { code: null, message: body.detail };
  }
  if (typeof body.code === 'string' || typeof body.message === 'string') {
    return {
      code: typeof body.code === 'string' ? body.code : null,
      message: typeof body.message === 'string' ? body.message : null,
    };
  }
  const fields = Object.entries(body)
    .filter(([, v]) => Array.isArray(v))
    .map(([k, v]) =>
      k === 'non_field_errors' ? v.join(' ') : `${k}: ${v.join(' ')}`,
    );
  return { code: null, message: fields.join('; ') || null };
}

// showDetail words a 4xx for the shopper. Only calculate_tax uses it, because there a 4xx
// usually means "fix the address".
async function post(url, body, timeoutMs, { showDetail = false } = {}) {
  let res;
  let text;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: {
        'X-API-KEY': config.sphereApiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(timeoutMs),
    });
    text = await res.text();
  } catch (err) {
    // Sphere may have processed the request. Transaction writes are safe to repeat because
    // Sphere dedupes on external_id.
    const kind = err.name === 'TimeoutError' ? 'timeout' : 'network';
    throw new SphereError(
      `Sphere request failed: ${kind === 'timeout' ? 'timed out' : err.message}`,
      { kind },
    );
  }

  let parsed = null;
  try {
    parsed = text ? JSON.parse(text) : null;
  } catch {
    parsed = { raw: text };
  }
  if (!res.ok) {
    const kind =
      res.status === 429
        ? 'rate_limited'
        : res.status >= 500
          ? 'server'
          : 'client';
    const seconds = Number(res.headers.get('retry-after'));
    const { code, message } = errorDetail(parsed);
    const detail = [code, message].filter(Boolean).join(': ');
    const summary =
      showDetail && kind === 'client' && detail
        ? `Sphere could not calculate tax: ${detail}`
        : `Sphere returned ${res.status}${detail ? `: ${detail}` : ''}`;
    throw new SphereError(summary.slice(0, 300), {
      kind,
      status: res.status,
      code,
      body: parsed,
      retryAfterMs: seconds > 0 ? seconds * 1000 : 0,
    });
  }
  return parsed;
}

// Sphere's field names for an address.
export function toSphereAddress(address) {
  return withoutEmpty({
    address1: address.addressLine1,
    address2: address.addressLine2,
    city: address.city,
    state: address.state,
    postal_code: address.postalCode,
    country: address.countryCode,
  });
}

// lines: [{ itemId, amount }] where amount is the line total in minor units.
// Returns { calculationId, lines: [{ id, taxAmount }] } with id = itemId.
export async function calculateTax({
  currency,
  address,
  taxId,
  customerId,
  lines,
}) {
  const res = await post(
    CALCULATE_URL,
    {
      currency: currency.toLowerCase(),
      customer_id: customerId,
      customer_address: toSphereAddress(address),
      tax_id: taxId || undefined,
      include_taxability_reason: true,
      line_items: lines.map((l) => ({
        id: l.itemId,
        product_id: l.itemId,
        amount: l.amount,
      })),
    },
    CALCULATE_TIMEOUT_MS,
    { showDetail: true },
  );

  const data = res?.data;
  if (!Array.isArray(data?.lines)) {
    throw new SphereError('Sphere returned an unexpected tax answer.');
  }
  const result = lines.map((l) => {
    // A missing line must never become zero tax: the shopper would be undercharged.
    const found = data.lines.find((x) => x.id === l.itemId);
    if (!found || !Array.isArray(found.tax_amounts)) {
      throw new SphereError(
        `Sphere's tax answer has no usable line ${l.itemId}.`,
      );
    }
    // Sphere marks tax-inclusive rates with tax_rate.inclusive. This example covers
    // tax-exclusive pricing only.
    if (found.tax_amounts.some((t) => t.tax_rate?.inclusive === true)) {
      throw new SphereError(
        'Sphere returned tax-inclusive rates. This example covers tax-exclusive pricing only.',
      );
    }
    if (!found.tax_amounts.every((t) => Number.isInteger(t.amount))) {
      throw new SphereError(
        `Sphere's tax answer for ${l.itemId} is not numeric.`,
      );
    }
    // No tax where you aren't registered gives zero. An empty tax_amounts sums to 0.
    // A line can carry several taxes. The line's tax is their sum.
    const taxAmount = found.tax_amounts.reduce((sum, t) => sum + t.amount, 0);
    return { id: l.itemId, taxAmount };
  });

  // The sale must be recorded with the same calculation. Tax without an id cannot be.
  const calculationId = data.sphere_tax_calculation_id || null;
  if (!calculationId && result.some((l) => l.taxAmount > 0)) {
    throw new SphereError('Sphere returned tax without a calculation id.');
  }
  return { calculationId, lines: result };
}

export function postTransaction(body) {
  return post(`${API_URL}/transactions`, body, WRITE_TIMEOUT_MS);
}

export function cancelTransaction(externalId) {
  return post(
    `${API_URL}/transactions/${encodeURIComponent(externalId)}/cancel`,
    {},
    WRITE_TIMEOUT_MS,
  );
}

export function upsertProduct(body) {
  return post(`${API_URL}/products`, body, WRITE_TIMEOUT_MS);
}
