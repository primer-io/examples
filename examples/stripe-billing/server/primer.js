// Primer API calls: https://primer.io/docs/api/v2.4/api-reference/payments-api/create-payment
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
    // Without a timeout a hung connection would hold the renewal forever.
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
    // A 5xx on a POST can come after Primer created the payment, so it is a timeout's equal.
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

// Country and currency together decide which payment methods Primer offers.
const COUNTRY_BY_CURRENCY = {
  USD: 'US',
  CAD: 'CA',
  GBP: 'GB',
  EUR: 'DE',
  AUD: 'AU',
};

// Client session for the first payment. The amount is Stripe's amount_due, never the browser's.
// customerId is required for vaulting. firstPaymentReason Recurring tells the processor the
// card is stored for scheduled merchant-initiated payments, where the processor supports it.
export function createClientSession({
  invoiceId,
  subscriptionId,
  customerId,
  email,
  amount,
  currency,
  priceId,
  description,
}) {
  return request('POST', '/client-session', {
    orderId: invoiceId, // one Primer order per Stripe invoice
    amount,
    currencyCode: currency,
    customerId,
    customer: email ? { emailAddress: email } : undefined,
    paymentMethod: {
      vaultOnSuccess: true,
      paymentType: 'FIRST_PAYMENT',
      firstPaymentReason: 'Recurring',
    },
    order: {
      countryCode: COUNTRY_BY_CURRENCY[currency] || 'US',
      // One line item for the whole invoice. The top-level amount overrides any total Primer
      // would calculate from line items.
      lineItems: [{ itemId: priceId, description, amount, quantity: 1 }],
    },
    metadata: {
      stripeSubscriptionId: subscriptionId,
      stripeInvoiceId: invoiceId,
    },
  });
}

export function getPayment(paymentId) {
  return request('GET', `/payments/${encodeURIComponent(paymentId)}`);
}

// The multi-use token and card details of the instrument the first payment vaulted.
// Primer's docs say vaulting returns a multi-use token but not which field holds it, so
// renewals use the token from GET /payment-instruments. If the customer has more than one
// instrument, match on the payment's own token, then analyticsId, then card details.
// Returns null when there is no single match, so the caller never guesses a card.
export async function findVaultedToken(customerId, paymentMethod) {
  const res = await request(
    'GET',
    `/payment-instruments?customer_id=${encodeURIComponent(customerId)}`,
  );
  const usable = (res?.data || []).filter(
    (i) => i.tokenType === 'MULTI_USE' && !i.deleted && i.token,
  );

  const card = paymentMethod?.paymentMethodData || {};
  const matchers = [
    (i) =>
      paymentMethod?.paymentMethodToken &&
      i.token === paymentMethod.paymentMethodToken,
    (i) =>
      paymentMethod?.analyticsId && i.analyticsId === paymentMethod.analyticsId,
    (i) =>
      card.last4Digits &&
      i.paymentMethodData?.last4Digits === card.last4Digits &&
      i.paymentMethodData?.expirationMonth === card.expirationMonth &&
      i.paymentMethodData?.expirationYear === card.expirationYear &&
      i.paymentMethodData?.network === card.network,
  ];
  for (const matches of matchers) {
    const found = usable.filter(matches);
    if (found.length === 1)
      return { token: found[0].token, card: found[0].paymentMethodData || {} };
  }
  return null;
}

// When Primer created the payment, in Unix seconds. Every Stripe report uses it, so if
// the browser route and the Primer webhook both report the same payment, they send
// identical parameters and Stripe treats the second as a replay.
// Primer's date is UTC but has no offset, and Date.parse would read that as server local time.
export function paymentTime(payment) {
  const date = String(payment?.date ?? '');
  const hasOffset = /T.*(Z|[+-]\d\d(:?\d\d)?)$/i.test(date);
  const ms = Date.parse(hasOffset ? date : `${date}Z`);
  return Math.floor((Number.isFinite(ms) ? ms : Date.now()) / 1000);
}

// Merchant-initiated renewal. paymentType SUBSCRIPTION carries the recurring-credential
// context to the issuer.
//
// The idempotency key must identify the attempt, not the invoice: with the same key Primer
// refuses the payment as a duplicate, so a key per invoice would block the day-2 retry.
export function createPayment({
  token,
  invoiceId,
  amount,
  currency,
  customerId,
  subscriptionId,
  idempotencyKey,
}) {
  return request(
    'POST',
    '/payments',
    {
      paymentMethodToken: token,
      orderId: invoiceId,
      amount,
      currencyCode: currency,
      customerId,
      paymentMethod: {
        paymentType: 'SUBSCRIPTION',
        authorizationType: 'FINAL',
      },
      metadata: {
        stripeInvoiceId: invoiceId,
        stripeSubscriptionId: subscriptionId,
        renewal: 'true',
      },
    },
    idempotencyKey,
  );
}

// Primer answers a reused idempotency key with an error, not the original payment.
// That means Primer already has a payment for this key, approved or not, so never retry it.
// The docs show 409 in one place and
// 400 in another, so accept both.
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

// PARTIALLY_SETTLED is left out on purpose: reporting it would mark the whole invoice
// paid for a partial amount, so it falls through to unknown and is reviewed by hand.
const APPROVED = ['AUTHORIZED', 'SETTLING', 'SETTLED'];
const DECLINED = ['DECLINED', 'FAILED', 'CANCELLED'];
const STOP = ['DO_NOT_RETRY', 'STOP_ALL_PAYMENTS'];

// Returns { classification: 'approved' | 'pending' | 'hard' | 'soft' | 'unknown', code }.
// hard: Primer or the issuer says not to retry this payment (`HARD_DECLINE`, `DO_NOT_RETRY`,
// `STOP_ALL_PAYMENTS`). soft: a later attempt may work.
// PENDING is not an outcome yet, so nothing reports it to Stripe.
// unknown: any other status, or a body that is not a payment. Reporting it as a decline would
// make Stripe retry and charge again, so callers report nothing.
export function classifyPayment(payment) {
  if (APPROVED.includes(payment?.status))
    return { classification: 'approved', code: null };
  if (payment?.status === 'PENDING')
    return { classification: 'pending', code: null };
  if (!DECLINED.includes(payment?.status)) {
    console.error(
      'UNKNOWN Primer payment status, nothing reported to Stripe:',
      payment?.id,
      payment?.status,
    );
    return { classification: 'unknown', code: null };
  }

  const reason = payment?.statusReason || {};
  const code = reason.code || reason.type || payment?.status || null;
  // advisedAction is Primer's unified advice for a decline. Only `DO_NOT_RETRY` and
  // `STOP_ALL_PAYMENTS` count as hard here. The last transaction decided the outcome.
  const transactions = payment?.transactions || [];
  const advised =
    reason.advisedAction ||
    transactions.at(-1)?.processorStatusReason?.advisedAction;
  const hard =
    reason.declineType === 'HARD_DECLINE' ||
    (reason.type === 'ISSUER_DECLINED' && STOP.includes(advised));
  return { classification: hard ? 'hard' : 'soft', code };
}
