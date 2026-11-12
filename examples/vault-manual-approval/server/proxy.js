import { config } from './config.js';

const TOKEN_PATTERN = /^[A-Za-z0-9_-]+$/;

// Primer's PCI proxy swaps each {{token.FIELD}} placeholder for the real card
// data before forwarding to Stripe, so this server never sees the card.
export async function createStripePaymentMethod(token, idempotencyKey) {
  // The token goes into the body unescaped, so refuse anything but plain token characters.
  if (!TOKEN_PATTERN.test(token))
    throw new Error('Invalid payment method token');

  // Built by hand: URLSearchParams would encode the braces and the proxy
  // would no longer find the placeholders.
  const body = [
    'type=card',
    `card[number]={{${token}.CARD_NUMBER}}`,
    `card[exp_month]={{${token}.EXPIRY_MONTH}}`,
    `card[exp_year]={{${token}.EXPIRY_YEAR}}`,
    `card[cvc]={{${token}.CVV}}`,
  ].join('&');

  let res;
  let text;
  try {
    res = await fetch(`https://${config.primerProxyHost}/v1/payment_methods`, {
      method: 'POST',
      headers: {
        'X-Primer-Api-Key': config.primerProxyApiKey,
        'X-Target-Host': 'api.stripe.com',
        'Authorization': `Bearer ${config.stripeSecretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Idempotency-Key': idempotencyKey,
      },
      body,
      redirect: 'manual',
      signal: AbortSignal.timeout(30_000),
    });
    text = await res.text();
  } catch (cause) {
    // The proxy forwards the idempotency key to Stripe, so the request may
    // have reached Stripe and the outcome is unknown.
    throw Object.assign(
      new Error(`Proxy request did not complete: ${cause.message}`),
      { outcomeUnknown: true },
    );
  }
  let parsed = text;
  try {
    parsed = JSON.parse(text);
  } catch {
    // Not JSON: keep the raw text.
  }

  if (!res.ok) {
    const requestId = res.headers.get('X-Primer-Request-Id');
    const refused = res.headers.get('X-Primer-Proxy-Error') === 'true';
    const err = new Error(
      `${refused ? 'Primer proxy refused the request' : 'Proxy or Stripe error'}: ` +
        `status ${res.status}, request id ${requestId}`,
    );
    err.status = res.status;
    // A 409 from Stripe means a key that is still in flight or was reused, so
    // the outcome is unknown. A 409 raised by the proxy itself (token-consumed)
    // means nothing was forwarded to Stripe, so it is a known failure.
    err.outcomeUnknown = res.status === 409 && !refused;
    err.body = parsed;
    err.requestId = requestId;
    throw err;
  }
  if (typeof parsed?.id !== 'string' || !parsed.id.startsWith('pm_'))
    throw new Error('Proxy response has no pm_ payment method id');
  return parsed.id;
}
