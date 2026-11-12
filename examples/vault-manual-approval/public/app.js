import { loadPrimer } from '/vendor/primer-js/primer-loader.js';

const logList = document.getElementById('log');
const routePicker = document.getElementById('route-picker');

// One line per step. The presenter narrates from this list.
function log(message, isError = false) {
  const li = document.createElement('li');
  li.textContent = message;
  if (isError) li.className = 'error';
  logList.append(li);
}

async function postJson(url, body) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data };
}

// /api/client-session returns amounts in minor units (4999 means 49.99 EUR).
function formatAmount(amount, currency) {
  const format = new Intl.NumberFormat('en', { style: 'currency', currency });
  const digits = format.resolvedOptions().maximumFractionDigits;
  return format.format(amount / 10 ** digits);
}

// Only sent when the demo selector is visible and a non-default option is picked.
function chosenRoute() {
  if (routePicker.hidden) return undefined;
  return (
    document.querySelector('input[name="route"]:checked').value || undefined
  );
}

// Describe what the backend did, using the response bodies built in server/process.js.
function describeDecision({ status, data }) {
  if (status === 410) {
    return data.charged
      ? `Approval window expired after Stripe had already charged the card. The shopper was charged, so reconcile this payment. ${data.message ?? ''}`
      : `Approval window expired. Nothing was charged. ${data.message ?? ''}`;
  }
  if (data.outcome === 'UNREPORTED') {
    return `Stripe charged the card, but Primer was not told. The shopper was charged, so reconcile this payment. ${data.message ?? ''}`;
  }
  if (data.charged === 'unknown') {
    return `Stripe did not confirm the charge. Check Stripe before retrying. ${data.error ?? ''}`;
  }
  if (status !== 200)
    return `Backend error (${status}): ${data.error ?? 'unknown'}`;
  if (data.route === 'primer' && !data.paymentId) {
    return 'Primer approved the payment but returned no payment id. Check the Primer dashboard.';
  }
  if (data.route === 'primer') {
    return `Primer payment ${data.paymentId} is ${data.paymentStatus}, approved`;
  }
  if (data.outcome === 'SUCCEEDED') {
    return `Stripe PaymentIntent ${data.stripePaymentIntentId} ${data.stripeStatus}, resolved SUCCEEDED`;
  }
  return `Stripe did not take the payment${data.message ? `: ${data.message}` : ''}, resolved FAILED`;
}

// Builds the request first so a local error (such as a missing token) is
// logged on its own. Never rejects, so every listener can await it.
async function sendDecision({ paymentAttemptId, paymentMethodToken }) {
  let body;
  try {
    body = {
      paymentAttemptId,
      paymentMethodToken: paymentMethodToken.token,
      route: chosenRoute(),
    };
  } catch (error) {
    log(`Could not build the decision request: ${error.message}`, true);
    return undefined;
  }
  let result;
  try {
    result = await postJson('/api/decide', body);
  } catch {
    log(
      'No response from the backend. The outcome is unknown: check the server log and Stripe before retrying.',
      true,
    );
    return undefined;
  }
  if (result.data.route) log(`Backend chose: ${result.data.route}`);
  log(describeDecision(result), result.status !== 200);
  return result;
}

// Text for the checkout-complete slot, or undefined to keep the default.
function completeText(result) {
  const { route, outcome } = result?.data ?? {};
  if (route === 'stripe' && outcome === 'SUCCEEDED') {
    return "Payment complete: Stripe charged the card through Primer's proxy.";
  }
  if (route === 'primer' && outcome === 'APPROVED') {
    return 'Payment approved: Primer is processing it through your Workflow.';
  }
  return undefined;
}

async function main() {
  await loadPrimer();

  const { status, data: session } = await postJson('/api/client-session', {});
  if (status !== 200) {
    log(`Could not create a client session: ${session.error ?? status}`, true);
    return;
  }

  document.getElementById('order-total').textContent =
    `Order total: ${formatAmount(session.amount, session.currency)}`;
  if (session.routeOverrideAllowed) {
    document.getElementById('default-route').textContent = session.defaultRoute;
    routePicker.hidden = false;
  }

  const checkout = document.createElement('primer-checkout');
  checkout.setAttribute('client-token', session.clientToken);
  // Options must be set as a property. An attribute would stringify the object.
  checkout.options = { locale: 'en-US' };

  // Primer Checkout's own success screen says the shopper will be redirected to
  // an order confirmation page, and this page never redirects. This slot
  // replaces that text. It belongs to <primer-main>, so the example supplies
  // that element. The text is updated once /api/decide has named the route.
  const primerMain = document.createElement('primer-main');
  primerMain.slot = 'main';
  const complete = document.createElement('p');
  complete.slot = 'checkout-complete';
  complete.className = 'checkout-complete';
  complete.textContent = 'Payment complete. See What happened below.';
  primerMain.append(complete);
  checkout.append(primerMain);

  checkout.addEventListener('primer:ready', () => log('Checkout ready'));

  // The SDK can emit the same attempt twice. Keep the first decision's promise
  // so a duplicate waits for it instead of calling the backend again.
  const inFlight = new Map();
  checkout.addEventListener(
    'primer:payment-approval-required',
    async (event) => {
      const { paymentAttemptId, continueFlow } = event.detail;
      let decision = inFlight.get(paymentAttemptId);
      if (!decision) {
        log(`Payment paused for approval: attempt ${paymentAttemptId}`);
        decision = sendDecision(event.detail);
        inFlight.set(paymentAttemptId, decision);
      }
      try {
        const text = completeText(await decision);
        if (text) complete.textContent = text;
      } catch (error) {
        log(`Unexpected error: ${error.message}`, true);
      }
      // Every event resumes the SDK. If you don't call continueFlow(), the SDK
      // checks the attempt on its own only after 90 seconds.
      try {
        await continueFlow();
      } catch (error) {
        log(`Checkout could not resume: ${error.message}`, true);
      }
    },
  );

  // Stripe path: Primer holds no payment, so the SDK emits the external event.
  checkout.addEventListener('primer:payment-success-external', () =>
    log('Checkout finished: payment-success-external'),
  );
  // Primer path.
  checkout.addEventListener('primer:payment-success', () =>
    log('Checkout finished: payment-success'),
  );
  checkout.addEventListener('primer:payment-failure', (event) =>
    log(
      `Checkout finished: payment-failure${event.detail?.error?.message ? ` (${event.detail.error.message})` : ''}`,
      true,
    ),
  );

  document.getElementById('checkout').append(checkout);
}

main().catch((error) => log(`Unexpected error: ${error.message}`, true));
