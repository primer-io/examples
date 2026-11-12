// Browser half of the example. The server owns every Stripe call and every
// secret. This page only creates the subscription, shows Primer Checkout and
// tells the server when the shopper has paid.
import { loadPrimer } from '/vendor/primer-js/primer-loader.js';

const form = document.getElementById('subscribe-form');
const emailInput = document.getElementById('email');
const button = document.getElementById('subscribe-button');
const order = document.getElementById('order');
const checkoutContainer = document.getElementById('checkout');
const logList = document.getElementById('log');

// The "What happened" list on the page.
function log(text, isError = false) {
  const li = document.createElement('li');
  li.textContent = text;
  if (isError) li.className = 'error';
  logList.append(li);
}

// A line with a spinner while the server works. Some calls take seconds (the
// payment confirmation makes several Stripe calls), and a silent page looks
// stuck. done() swaps the spinner for the final text. A second done() adds a new
// line, so a late error never overwrites a success line.
function pending(text) {
  const li = document.createElement('li');
  const spinner = document.createElement('span');
  spinner.className = 'spinner';
  spinner.setAttribute('aria-hidden', 'true');
  li.append(spinner, text);
  logList.append(li);
  let open = true;
  return {
    done(finalText, isError = false) {
      if (!open) return log(finalText, isError);
      open = false;
      li.textContent = finalText;
      if (isError) li.className = 'error';
    },
  };
}

function formatMoney(minorUnits, currency) {
  const formatter = new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
  });
  // Currencies differ: JPY has 0 fraction digits, EUR has 2, KWD has 3.
  const digits = formatter.resolvedOptions().maximumFractionDigits;
  return formatter.format(minorUnits / 10 ** digits);
}

// Returns the JSON body. A non-2xx response throws with the server's message.
// fetch itself rejects when there is no response at all.
async function postJson(path, body) {
  const response = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || `HTTP ${response.status}`);
  return data;
}

// Registers the web components. Call it once, before the first <primer-checkout>.
loadPrimer();

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  // One request at a time. A second click must not create a second subscription.
  button.disabled = true;
  let step = pending('Creating the subscription…');
  try {
    const subscription = await postJson('/api/subscribe', {
      email: emailInput.value,
    });
    const amount = formatMoney(subscription.amountDue, subscription.currency);
    step.done(
      `Subscription ${subscription.subscriptionId} created, first invoice ${subscription.invoiceId} for ${amount}`,
    );
    order.textContent = `First invoice: ${amount}`;
    order.hidden = false;

    step = pending('Creating the checkout session…');
    const session = await postJson('/api/client-session', {
      subscriptionId: subscription.subscriptionId,
    });
    step.done('Checkout session created');
    mountCheckout(session.clientToken, subscription.subscriptionId);
    // The button stays disabled: the subscription exists and is being paid.
  } catch (error) {
    step.done(error.message, true);
    button.disabled = false;
  }
});

function mountCheckout(clientToken, subscriptionId) {
  const checkout = document.createElement('primer-checkout');
  checkout.setAttribute('client-token', clientToken);
  // Options are a property, not an attribute.
  checkout.options = {
    locale: 'en-US',
    // Enable only cards for this checkout in the Primer Dashboard. The page sets no
    // `redirect.returnUrl`, so Primer Checkout fails to start if a redirect method is enabled,
    // and a redirect would return to a page that no longer holds the subscription id.
    // This is a first payment, so there are no saved cards to offer. The card
    // is vaulted by the client session, not by this option (not confirmed in Primer's docs; the
    // server refuses to report a payment whose card was not vaulted).
    vault: { enabled: false },
  };

  // Guard against a repeated primer:payment-success for one payment.
  const reported = new Set();

  // Primer Checkout's own success screen says the shopper will be redirected to
  // an order confirmation page, and this page never redirects. The slot is on
  // screen from the moment Primer reports success, before Stripe has confirmed,
  // so the text only says the payment arrived. The outcome is in "What happened".
  // The slot belongs to <primer-main>, so the example supplies that element.
  const main = document.createElement('primer-main');
  main.slot = 'main';
  const complete = document.createElement('p');
  complete.slot = 'checkout-complete';
  complete.className = 'checkout-complete';
  complete.textContent =
    'Payment received. The server is confirming it with Stripe; see What happened below.';
  main.append(complete);
  checkout.append(main);

  checkout.addEventListener('primer:ready', () => log('Checkout ready'));

  checkout.addEventListener('primer:payment-success', async (event) => {
    const primerPaymentId = event.detail.payment.id;
    if (reported.has(primerPaymentId)) return;
    reported.add(primerPaymentId);
    log(`Primer payment ${primerPaymentId} succeeded`);

    // The subscription stays "incomplete" until the server reports this
    // payment to Stripe. Primer succeeding is not enough.
    const step = pending('Confirming the payment with Stripe…');
    try {
      const result = await postJson('/api/payment-complete', {
        subscriptionId,
        primerPaymentId,
      });
      if (result.outcome === 'ACTIVE') {
        step.done('Reported to Stripe: subscription is active');
      } else if (result.outcome === 'PENDING') {
        step.done(
          result.message ||
            "Primer has not settled the payment yet. The server finishes when Primer's webhook arrives.",
        );
      } else if (result.outcome === 'DECLINED') {
        step.done(
          `Payment declined: ${result.message || 'no reason given'}`,
          true,
        );
      } else {
        // Any other shape is not a decline: the shopper may have been charged.
        step.done(
          'Unexpected response from the server. The payment may have been taken: do not pay again, check with the merchant.',
          true,
        );
      }
    } catch (error) {
      if (error instanceof TypeError) {
        // fetch rejected: the request may or may not have reached the server.
        step.done(
          'No response from the server. The outcome is unknown: check the server log before retrying.',
          true,
        );
      } else {
        // The server words these errors so a charged shopper is never told to pay again, and it
        // turns any unexpected failure after payment into one that says the payment may have
        // been taken.
        step.done(error.message, true);
      }
    }
  });

  checkout.addEventListener('primer:payment-failure', (event) => {
    log(
      `Primer payment failed: ${event.detail.error?.message || 'unknown error'}`,
      true,
    );
  });

  checkoutContainer.replaceChildren(checkout);
  log('Mounting checkout');
}
