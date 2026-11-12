import { config } from './config.js';
import { createStripePaymentMethod } from './proxy.js';
import { chargeWithStripe } from './stripe.js';
import {
  approvePaymentAttempt,
  getPayment,
  resolvePaymentAttempt,
} from './primer.js';

const expired = (route, charged, message) => ({
  status: 410,
  body: { route, outcome: 'EXPIRED', charged, message },
});

export async function processAttempt({
  paymentAttemptId,
  paymentMethodToken,
  route,
}) {
  return route === 'stripe'
    ? processWithStripe(paymentAttemptId, paymentMethodToken)
    : processWithPrimer(paymentAttemptId);
}

// Best effort: without it the checkout hangs until the attempt expires.
async function resolveFailed(attemptId) {
  try {
    await resolvePaymentAttempt(attemptId, 'FAILED');
  } catch (err) {
    console.error(
      `[primer] resolve FAILED did not go through for ${attemptId}:`,
      err.message,
      err.status ?? '',
      err.body ?? '',
    );
  }
}

// The card may be charged, so reporting FAILED could be wrong.
function chargeUnknown(attemptId) {
  console.error(
    `[stripe] CHARGE OUTCOME UNKNOWN for ${attemptId}, check Stripe for pi with idempotency key pi:${attemptId}`,
  );
  return {
    status: 502,
    body: {
      error: 'Stripe did not confirm the charge. Check Stripe before retrying.',
      charged: 'unknown',
    },
  };
}

// The proxy call did not complete, so we can't tell whether the card reached
// Stripe. No PaymentIntent is created before the proxy step succeeds.
function cardForwardUnknown(attemptId) {
  console.error(
    `[proxy] CARD FORWARD OUTCOME UNKNOWN for ${attemptId}, check Stripe for a PaymentMethod created with idempotency key pm:${attemptId}. No PaymentIntent was created by this request.`,
  );
  return {
    status: 502,
    body: {
      error:
        'The card could not be confirmed as forwarded to Stripe. Check Stripe before retrying.',
      charged: 'unknown',
    },
  };
}

async function processWithStripe(attemptId, token) {
  let charge;
  // Which call failed decides what the operator has to check in Stripe.
  let step = 'proxy';
  try {
    const pm = await createStripePaymentMethod(token, `pm:${attemptId}`);
    console.log(`[proxy] card forwarded to Stripe as ${pm}`);
    step = 'charge';
    charge = await chargeWithStripe({
      paymentMethodId: pm,
      amount: config.amount,
      currency: config.currency,
      idempotencyKey: `pi:${attemptId}`,
    });
    console.log(`[stripe] ${charge.id} ${charge.status}`);
  } catch (err) {
    console.error('[stripe] path failed:', err.message, err.body ?? '');
    // Never resolve FAILED when the card may have been charged.
    if (err.outcomeUnknown) {
      return step === 'proxy'
        ? cardForwardUnknown(attemptId)
        : chargeUnknown(attemptId);
    }
    await resolveFailed(attemptId);
    // The proxy answers 409 token-consumed when the single-use token was
    // already used by an earlier request. This request forwarded nothing to Stripe,
    // so it charged nothing.
    if (step === 'proxy' && err.status === 409) {
      return {
        status: 200,
        body: {
          route: 'stripe',
          outcome: 'FAILED',
          message:
            'The payment method token was already used by an earlier request. This request charged nothing.',
        },
      };
    }
    throw err;
  }

  // These statuses are final and the card was not charged. requires_action
  // (3DS through Stripe) is out of scope, so it counts as failed. Any other
  // status, such as processing, may still end in a charge, so it is unknown.
  const failedStatuses = [
    'requires_payment_method',
    'canceled',
    'requires_action',
  ];
  const succeeded = charge.status === 'succeeded';
  if (!succeeded && !failedStatuses.includes(charge.status)) {
    return chargeUnknown(attemptId);
  }
  try {
    await resolvePaymentAttempt(attemptId, succeeded ? 'SUCCEEDED' : 'FAILED');
    console.log(
      `[primer] resolved ${attemptId} ${succeeded ? 'SUCCEEDED' : 'FAILED'}`,
    );
  } catch (err) {
    const isExpired = err.status === 410;
    if (!succeeded) {
      if (isExpired) {
        return expired(
          'stripe',
          false,
          'The payment attempt expired before the outcome was reported.',
        );
      }
      throw err;
    }
    // Stripe charged the card but Primer was not told, for any reason.
    console.error(
      `[primer] CHARGED BUT NOT REPORTED: ${attemptId}, Stripe ${charge.id} succeeded but resolve failed (${err.message}). ` +
        'The shopper was charged. Reconcile or refund.',
    );
    return {
      status: isExpired ? 410 : 502,
      body: {
        route: 'stripe',
        outcome: isExpired ? 'EXPIRED' : 'UNREPORTED',
        charged: true,
        message: isExpired
          ? 'The payment attempt expired after Stripe charged the card. Reconcile or refund.'
          : 'Stripe charged the card but Primer was not told. Reconcile or refund.',
      },
    };
  }

  return {
    status: 200,
    body: {
      route: 'stripe',
      outcome: succeeded ? 'SUCCEEDED' : 'FAILED',
      stripePaymentIntentId: charge.id,
      stripeStatus: charge.status,
      ...(charge.message && { message: charge.message }),
    },
  };
}

async function processWithPrimer(attemptId) {
  let paymentId;
  try {
    paymentId = await approvePaymentAttempt(attemptId);
  } catch (err) {
    if (err.status === 410) {
      return expired(
        'primer',
        false,
        'The payment attempt expired before it was approved.',
      );
    }
    // A replayed approve answers 409 IdempotencyKeyAlreadyExists once the first
    // one created the payment. The response does not carry the payment id.
    if (
      err.status === 409 &&
      err.body?.error?.errorId === 'IdempotencyKeyAlreadyExists'
    ) {
      console.error(
        `[primer] ${attemptId} was already approved, find the payment in the Primer dashboard`,
      );
      return {
        status: 200,
        body: {
          route: 'primer',
          outcome: 'APPROVED',
          paymentStatus: 'UNKNOWN',
        },
      };
    }
    if (err.outcomeUnknown) {
      console.error(
        `[primer] approve outcome unknown for ${attemptId}, check the Primer dashboard`,
      );
      return {
        status: 502,
        body: {
          error:
            'Primer did not confirm the approval. Check the dashboard before retrying.',
        },
      };
    }
    console.error(
      `[primer] approve rejected (status ${err.status}), the attempt stays open until the decision window closes`,
    );
    throw err;
  }
  if (paymentId === null) {
    // 2xx without a payment id: the approval went through, so don't fail it.
    console.error(
      `[primer] approved ${attemptId} but the response had no payment id`,
    );
    return {
      status: 200,
      body: { route: 'primer', outcome: 'APPROVED', paymentStatus: 'UNKNOWN' },
    };
  }
  // The payment is already approved, so a failed lookup must not fail the response.
  let paymentStatus = 'UNKNOWN';
  try {
    paymentStatus = (await getPayment(paymentId)).status ?? 'UNKNOWN';
  } catch (err) {
    console.error(
      `[primer] could not fetch payment ${paymentId}:`,
      err.message,
    );
  }
  console.log(
    `[primer] approved ${attemptId} -> payment ${paymentId} ${paymentStatus}`,
  );
  return {
    status: 200,
    body: {
      route: 'primer',
      outcome: 'APPROVED',
      paymentId,
      paymentStatus,
    },
  };
}
