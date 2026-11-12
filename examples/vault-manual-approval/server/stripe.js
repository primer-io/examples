import { config } from './config.js';

// Errors with outcomeUnknown = true mean the request may have reached Stripe,
// so the card may have been charged. Callers must not report a failure.
function unknown(message, extra = {}) {
  return Object.assign(new Error(message), { outcomeUnknown: true }, extra);
}

// Called directly: the card is already a pm_ id, so this call needs no proxy.
export async function chargeWithStripe({
  paymentMethodId,
  amount,
  currency,
  idempotencyKey,
}) {
  let res;
  let text;
  try {
    res = await fetch('https://api.stripe.com/v1/payment_intents', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.stripeSecretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Idempotency-Key': idempotencyKey,
      },
      body: new URLSearchParams({
        'amount': String(amount),
        'currency': currency.toLowerCase(),
        'payment_method': paymentMethodId,
        'confirm': 'true',
        'automatic_payment_methods[enabled]': 'true',
        'automatic_payment_methods[allow_redirects]': 'never',
      }),
      signal: AbortSignal.timeout(30_000),
    });
    text = await res.text();
  } catch (cause) {
    // Timeout or network error. The request may have reached Stripe, so the outcome is unknown.
    throw unknown(`Stripe request did not complete: ${cause.message}`);
  }

  let body = null;
  try {
    body = JSON.parse(text);
  } catch {
    // Handled below.
  }

  if (res.ok) {
    if (typeof body?.id !== 'string' || typeof body?.status !== 'string') {
      throw unknown('Stripe returned a success status without a usable body', {
        status: res.status,
      });
    }
    return { id: body.id, status: body.status };
  }

  // A declined card is an outcome, not a failure of this server.
  const intent = body?.error?.payment_intent;
  if (res.status === 402 && intent) {
    return {
      id: intent.id,
      status: intent.status,
      message: body.error.message,
    };
  }

  const message = `Stripe POST /v1/payment_intents -> ${res.status}`;
  // A 5xx or 409 can happen after Stripe created the charge. An idempotency
  // error means the key was already used, so an earlier call may have charged.
  // Other 4xx errors mean Stripe rejected the request before charging.
  const outcomeUnknown =
    res.status >= 500 ||
    res.status === 409 ||
    body?.error?.type === 'idempotency_error';
  const err = outcomeUnknown
    ? unknown(message)
    : Object.assign(new Error(message), { outcomeUnknown: false });
  err.status = res.status;
  err.body = body;
  throw err;
}
