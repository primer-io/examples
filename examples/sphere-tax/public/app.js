// Browser half of the example. The server owns every Sphere and Primer API call
// and every secret. This page starts an order, asks the server to calculate tax
// for an address, shows Primer Checkout, and tells the server when the shopper
// has paid.
import { loadPrimer } from '/vendor/primer-js/primer-loader.js';

const startSavedButton = document.getElementById('start-saved');
const startNewButton = document.getElementById('start-new');
const orderLine = document.getElementById('order');
const summaryTable = document.getElementById('summary');
const addressForm = document.getElementById('address-form');
const addressFields = document.getElementById('address-fields');
const taxButton = document.getElementById('tax-button');
const hint = document.getElementById('hint');
const checkoutContainer = document.getElementById('checkout');
const afterPayment = document.getElementById('after-payment');
const refundForm = document.getElementById('refund-form');
const refundAmount = document.getElementById('refund-amount');
const refundButton = document.getElementById('refund-button');
const cancelButton = document.getElementById('cancel-button');
const refundList = document.getElementById('refund-list');
const logList = document.getElementById('log');

// The address the "Use a saved address" button sends. The server calculates tax
// for it before it creates the client session.
const SAVED_ADDRESS = {
  addressLine1: '350 5th Ave',
  addressLine2: '',
  city: 'New York',
  state: 'NY',
  postalCode: '10118',
  countryCode: 'US',
};

const ADDRESS_FIELDS = [
  'addressLine1',
  'addressLine2',
  'city',
  'state',
  'postalCode',
  'countryCode',
];

let orderId = null;
let summary = null;
let primer = null; // The Primer instance from primer:ready.
let taxedAddressKey = null; // What the current quote was calculated for.
let isStale = false;
let attempt = 0;
let paymentReported = false;
let busy = false; // A refund or cancel request is running.
let pollTimer = null;

// The "What happened" list on the page.
function log(text, isError = false) {
  const li = document.createElement('li');
  li.textContent = text;
  if (isError) li.className = 'error';
  logList.append(li);
}

// A line with a spinner while the server works. Some calls take seconds (the
// payment confirmation polls Primer), and a silent page looks stuck. done()
// swaps the spinner for the final text. A second done() adds a new line, so a
// late error never overwrites a success line.
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

// Currencies differ: JPY has 0 fraction digits, EUR has 2, KWD has 3.
function fractionDigits(currency) {
  return new Intl.NumberFormat('en', {
    style: 'currency',
    currency,
  }).resolvedOptions().maximumFractionDigits;
}

function formatMoney(minorUnits, currency) {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
  }).format(minorUnits / 10 ** fractionDigits(currency));
}

// Returns the JSON body. A non-2xx response throws with the server's message, its HTTP status
// and its error code, if any. fetch itself rejects when there is no response at all.
async function request(method, path, body) {
  const response = await fetch(path, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw Object.assign(new Error(data.error || `HTTP ${response.status}`), {
      status: response.status,
      code: data.code,
    });
  }
  return data;
}

function postJson(path, body) {
  return request('POST', path, body);
}

// Registers the web components. Call it once, before the first <primer-checkout>.
loadPrimer();

// --- Order summary ---------------------------------------------------------

function cell(row, text) {
  const td = document.createElement('td');
  td.textContent = text;
  row.append(td);
}

function summaryRow(label, value, className) {
  const row = document.createElement('tr');
  if (className) row.className = className;
  cell(row, label);
  cell(row, value);
  return row;
}

function renderSummary() {
  const money = (minor) => formatMoney(minor, summary.currency);
  const rows = summary.lines.map((line) =>
    summaryRow(
      `${line.description} × ${line.quantity}`,
      // `amount` is the unit price, as in the Primer client session.
      `${money(line.amount * line.quantity)} + ${money(line.taxAmount)} tax`,
    ),
  );
  let taxText = 'Calculated from your address';
  if (summary.taxStatus === 'CALCULATED') taxText = money(summary.tax);
  if (summary.taxStatus === 'NOT_COLLECTED') {
    taxText = 'Not collected: Sphere unavailable';
  }
  summaryTable.replaceChildren(
    ...rows,
    summaryRow('Subtotal', money(summary.subtotal)),
    summaryRow('Tax', taxText),
    summaryRow('Total', money(summary.total), 'total'),
  );
  summaryTable.hidden = false;
}

// --- Address form ----------------------------------------------------------

function readForm() {
  const form = new FormData(addressForm);
  const value = (name) => (form.get(name) || '').toString().trim();
  const address = {};
  for (const name of ADDRESS_FIELDS) address[name] = value(name);
  address.countryCode = address.countryCode.toUpperCase();
  return { address, taxId: value('taxId') };
}

// One string for the address and tax ID, to compare a quote with the form.
function formKey() {
  const { address, taxId } = readForm();
  return JSON.stringify({ address, taxId });
}

function fillForm(address) {
  for (const name of ADDRESS_FIELDS) {
    addressForm.elements[name].value = address[name] || '';
  }
  addressForm.elements.taxId.value = '';
}

function showHint(text) {
  hint.textContent = text;
  hint.hidden = !text;
}

// The shopper edited the form after a quote. The session still holds the old
// tax, so payment is blocked until they calculate again.
addressForm.addEventListener('input', () => {
  const nowStale = taxedAddressKey !== null && formKey() !== taxedAddressKey;
  if (nowStale && !isStale) {
    log('Address changed after the tax quote. Calculate tax again.');
  }
  isStale = nowStale;
  showHint(nowStale ? 'Calculate tax again for this address.' : '');
});

addressForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!orderId || paymentReported) return;
  taxButton.disabled = true;
  showHint('');
  // Remember what the quote is for. The shopper may keep typing while it runs.
  const key = formKey();
  const step = pending('Calculating tax with Sphere…');
  try {
    const result = await postJson(`/api/orders/${orderId}/tax`, readForm());
    setSummary(result.summary);
    taxedAddressKey = key;
    isStale = formKey() !== taxedAddressKey;
    showHint(isStale ? 'Calculate tax again for this address.' : '');
    step.done(taxLogText());
    // The server already patched the client session. refreshSession() makes
    // Primer Checkout show the new total.
    if (primer && typeof primer.refreshSession === 'function') {
      await primer.refreshSession();
      log('Checkout refreshed with the new total');
    } else {
      log(
        'Checkout is not ready yet, so it was not refreshed. The session already holds the tax.',
      );
    }
  } catch (error) {
    step.done(error.message, true);
  } finally {
    taxButton.disabled = false;
  }
});

function taxLogText() {
  if (summary.taxStatus === 'NOT_COLLECTED') {
    return 'Sphere did not answer. No tax is collected on this order.';
  }
  return `Tax calculated: ${formatMoney(summary.tax, summary.currency)}`;
}

// --- Starting an order -----------------------------------------------------

async function startOrder(address) {
  startSavedButton.disabled = true;
  startNewButton.disabled = true;
  // A new order starts clean, whether or not an earlier one was paid.
  clearTimeout(pollTimer);
  orderId = null;
  checkoutContainer.replaceChildren();
  paymentReported = false;
  attempt = 0;
  taxedAddressKey = null;
  isStale = false;
  addressFields.disabled = false;
  afterPayment.hidden = true;
  addressForm.reset();
  showHint('');
  const step = pending('Creating the order and checkout session…');
  try {
    const body = address ? { address } : {};
    const result = await postJson('/api/orders', body);
    orderId = result.orderId;
    setSummary(result.summary);
    orderLine.textContent = `Order ${orderId}`;
    orderLine.hidden = false;
    addressForm.hidden = false;
    if (address) {
      // The server calculated tax for this address before it made the session.
      fillForm(address);
      taxedAddressKey = formKey();
      step.done(`Order created. ${taxLogText()}`);
    } else {
      step.done('Order created. Enter an address and calculate tax.');
    }
    mountCheckout(result.clientToken);
    // The buttons stay disabled: this order is now being paid.
  } catch (error) {
    step.done(error.message, true);
    startSavedButton.disabled = false;
    startNewButton.disabled = false;
  }
}

startSavedButton.addEventListener('click', () => startOrder(SAVED_ADDRESS));
startNewButton.addEventListener('click', () => startOrder(null));

// --- Checkout --------------------------------------------------------------

function mountCheckout(clientToken) {
  const checkout = document.createElement('primer-checkout');
  checkout.setAttribute('client-token', clientToken);
  // Options are a property, not an attribute.
  checkout.options = {
    locale: 'en-US',
    // Enable only cards in the Primer Dashboard. Without `redirect.returnUrl`, Primer Checkout
    // fails to start if a redirect method is enabled, and a redirect would return to a page
    // that no longer holds the order.
    // The saved-card list is off: every order here is a new customer.
    vault: { enabled: false },
  };

  // Guard against a repeated primer:payment-success for one payment.
  const reported = new Set();

  // Replaces Primer's default success text, which promises a redirect this page never does.
  // The slot belongs to <primer-main>.
  const main = document.createElement('primer-main');
  main.slot = 'main';
  const complete = document.createElement('p');
  complete.slot = 'checkout-complete';
  complete.className = 'checkout-complete';
  complete.textContent =
    'Payment received. The server is recording it; see What happened below.';
  main.append(complete);
  checkout.append(main);

  checkout.addEventListener('primer:ready', (event) => {
    primer = event.detail;
    log('Checkout ready');
  });

  // The SDK reads defaultPrevented right after it dispatches this event, so
  // preventDefault() must be the first, synchronous statement. Nothing may be
  // awaited before it.
  checkout.addEventListener('primer:payment-start', (event) => {
    event.preventDefault();
    const { continuePaymentCreation, abortPaymentCreation } = event.detail;

    if (paymentReported) {
      log('A payment was already reported for this order.', true);
      abortPaymentCreation();
      return;
    }
    // NOT_COLLECTED passes: when Sphere is down the example fails open and
    // takes the payment without tax rather than losing the sale.
    if (
      summary.taxStatus === 'NOT_CALCULATED' ||
      formKey() !== taxedAddressKey
    ) {
      const message = 'Calculate tax for this address before paying.';
      log(message, true);
      showHint(message);
      abortPaymentCreation();
      return;
    }
    // A new key per attempt, so a retry after a decline is not rejected as a
    // duplicate of the declined one.
    attempt += 1;
    continuePaymentCreation({ idempotencyKey: `${orderId}:${attempt}` });
  });

  checkout.addEventListener('primer:payment-success', async (event) => {
    const primerPaymentId = event.detail.payment.id;
    if (reported.has(primerPaymentId)) return;
    reported.add(primerPaymentId);
    paymentReported = true;
    addressFields.disabled = true;
    log(`Primer payment ${primerPaymentId} succeeded`);

    // Primer succeeding is not enough: the sale is not in Sphere until the
    // server records it.
    const step = pending('Recording the sale in Sphere…');
    try {
      const result = await postJson(`/api/orders/${orderId}/payment`, {
        paymentId: primerPaymentId,
      });
      setSummary(result.summary);
      if (result.outcome === 'RECORDED') {
        step.done('Sale recorded in Sphere');
      } else if (result.outcome === 'QUEUED') {
        step.done(
          'Payment confirmed. The server is recording the sale in Sphere and retries until Sphere confirms it.',
        );
      } else if (result.outcome === 'SPHERE_FAILED') {
        step.done(
          'Payment confirmed, but Sphere rejected the sale. Nothing retries it automatically: see the SPHERE_WRITE_FAILED line in the server log.',
          true,
        );
      } else if (result.outcome === 'AWAITING_CAPTURE') {
        step.done(
          "Payment authorized but not captured yet. The server records the sale once it's captured.",
        );
      } else if (result.outcome === 'NEEDS_REVIEW') {
        step.done(
          "The payment doesn't match the order. Nothing was recorded; check the server log.",
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
      if (error.code === 'PAYMENT_NOT_PAID') {
        // Primer's success event came first, but the payment was then declined or failed. No
        // money was taken. The old checkout is spent, so the shopper starts a new order.
        step.done(
          'The payment did not go through. Start a new order to try again.',
          true,
        );
        startSavedButton.disabled = false;
        startNewButton.disabled = false;
      } else if (error instanceof TypeError) {
        // fetch rejected: the request may or may not have reached the server.
        step.done(
          'No response from the server. The outcome is unknown: check the server log before retrying.',
          true,
        );
      } else {
        // The server words these errors so a charged shopper is never told to pay again.
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

// --- After payment: refund and chargeback ----------------------------------

function remainingMinor() {
  return summary.total - summary.refunded;
}

function updateAfterPayment() {
  const status = summary.sale?.status;
  // The server only accepts a refund once the sale is in Sphere and no cancel is pending or
  // failed.
  const canRefund = !busy && status === 'RECORDED' && remainingMinor() > 0;
  refundButton.disabled = !canRefund;
  // A failed cancel can be tried again.
  cancelButton.disabled = !(canRefund || (!busy && status === 'CANCEL_FAILED'));
}

// Puts what is left to refund in the amount field, in the main currency unit.
function resetRefundAmount() {
  const digits = fractionDigits(summary.currency);
  refundAmount.value = (remainingMinor() / 10 ** digits).toFixed(digits);
}

function showAfterPayment() {
  resetRefundAmount();
  afterPayment.hidden = false;
  updateAfterPayment();
}

// Every response that carries a summary goes through here, so the page always shows what the
// server last said, including statuses the worker set after the request returned.
function setSummary(next) {
  summary = next;
  renderSummary();
  renderRefunds();
  // The sale can be recorded later, by the worker, so this is not only for the payment handler.
  if (summary.sale && afterPayment.hidden) showAfterPayment();
  updateAfterPayment();
  pollWhileWorkRemains();
}

const REFUND_STATUS = {
  REQUESTED: 'requested',
  REFUND_PENDING: 'pending at Primer',
  REFUNDED: 'refunded',
  FAILED: 'failed',
  NEEDS_REVIEW: 'needs review',
};
const CREDIT_NOTE = {
  RECORDED: 'credit note recorded',
  PENDING: 'credit note pending',
  FAILED: 'credit note failed',
};

// One line per refund, for example "Refund 1: $1,633.12, refunded, credit note recorded".
function renderRefunds() {
  const items = summary.refunds.map((refund) => {
    const li = document.createElement('li');
    const number = refund.id.split('-refund-').pop();
    const parts = [
      `Refund ${number}: ${formatMoney(refund.amount, summary.currency)}`,
      REFUND_STATUS[refund.status] ?? refund.status,
    ];
    if (refund.creditNote) parts.push(CREDIT_NOTE[refund.creditNote]);
    li.textContent = parts.join(', ');
    return li;
  });
  refundList.replaceChildren(...items);
  refundList.hidden = items.length === 0;
}

// True while the server still has something to finish, so a later status is worth fetching.
function workRemains() {
  const sale = summary.sale?.status;
  return (
    summary.status === 'AWAITING_CAPTURE' ||
    sale === 'PENDING' ||
    sale === 'CANCEL_PENDING' ||
    summary.refunds.some(
      (r) =>
        r.status === 'REQUESTED' ||
        r.status === 'REFUND_PENDING' ||
        r.creditNote === 'PENDING',
    )
  );
}

// Checks the order every 3 s while workRemains(), then stops.
let pollFailed = false;
function pollWhileWorkRemains() {
  clearTimeout(pollTimer);
  if (!workRemains()) return;
  pollTimer = setTimeout(async () => {
    try {
      const before = summary;
      const result = await request('GET', `/api/orders/${orderId}`);
      pollFailed = false;
      setSummary(result.summary);
      logChanges(before, summary);
      if (before.status === 'AWAITING_CAPTURE' && summary.status === 'OPEN') {
        // The authorization was voided or the payment failed after Primer said it succeeded.
        log(
          'The payment was not captured. Start a new order to try again.',
          true,
        );
        startSavedButton.disabled = false;
        startNewButton.disabled = false;
      }
    } catch (error) {
      // Log it once, then keep trying: the next poll may work.
      if (!pollFailed) {
        log(`Could not check the order: ${error.message}. Still trying.`, true);
      }
      pollFailed = true;
      pollWhileWorkRemains();
    }
  }, 3000);
}

function logChanges(before, after) {
  if (before.sale?.status !== after.sale?.status) {
    const failed = ['FAILED', 'CANCEL_FAILED'].includes(after.sale?.status);
    log(
      `Sale status in Sphere: ${after.sale?.status}${failed ? `: ${after.sale.lastError || 'no reason given'}` : ''}`,
      failed,
    );
  }
  for (const refund of after.refunds) {
    const old = before.refunds.find((r) => r.id === refund.id);
    if (
      old?.status === refund.status &&
      old?.creditNote === refund.creditNote
    ) {
      continue;
    }
    const bad = ['FAILED', 'NEEDS_REVIEW'].includes(refund.status);
    log(
      `Refund ${refund.id}: ${refund.status}, credit note ${refund.creditNote ?? 'none yet'}`,
      bad || refund.creditNote === 'FAILED',
    );
  }
}

refundForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  // A comma is accepted as the decimal mark. Anything that is not a plain number, such as
  // 1.633,12, is refused instead of being read as a different amount.
  const text = refundAmount.value.trim().replace(',', '.');
  const amount = /^\d+(\.\d+)?$/.test(text)
    ? Math.round(parseFloat(text) * 10 ** fractionDigits(summary.currency))
    : 0;
  if (amount <= 0) {
    log('Enter a refund amount as a plain number, greater than zero.', true);
    return;
  }
  busy = true;
  updateAfterPayment();
  const step = pending('Refunding through Primer…');
  try {
    const result = await postJson(`/api/orders/${orderId}/refunds`, {
      amount,
    });
    setSummary(result.summary);
    if (result.outcome === 'CREDITED') {
      step.done('Refund settled, credit note recorded in Sphere');
    } else if (result.outcome === 'QUEUED') {
      step.done(
        'Refund settled. The server is recording the credit note in Sphere and retries until Sphere confirms it.',
      );
    } else if (result.outcome === 'SPHERE_FAILED') {
      step.done(
        'Refund settled, but Sphere rejected the credit note. Nothing retries it automatically: see the SPHERE_WRITE_FAILED line in the server log.',
        true,
      );
    } else if (result.outcome === 'REFUND_PENDING') {
      step.done(
        'Primer is still processing the refund. The server records the credit note once it settles.',
      );
    } else if (result.outcome === 'FAILED') {
      step.done(
        'Primer reports the refund failed. No credit note was recorded.',
        true,
      );
    } else if (result.outcome === 'NEEDS_REVIEW') {
      step.done(
        'The server cannot match this refund to Primer. Check the server log before refunding again.',
        true,
      );
    } else {
      step.done(
        'Unexpected response from the server. Check the server log before refunding again.',
        true,
      );
    }
    resetRefundAmount();
  } catch (error) {
    step.done(error.message, true);
  } finally {
    busy = false;
    updateAfterPayment();
  }
});

// Stand-in for a chargeback. In production, trigger this from Primer's dispute
// webhook instead of a button.
cancelButton.addEventListener('click', async () => {
  busy = true;
  updateAfterPayment();
  const step = pending('Cancelling the sale in Sphere…');
  try {
    const result = await postJson(
      `/api/orders/${orderId}/cancel-in-sphere`,
      {},
    );
    setSummary(result.summary);
    if (summary.sale?.status === 'CANCEL_FAILED') {
      step.done(
        `Cancelling the sale in Sphere failed: ${summary.sale.lastError || 'no reason given'}. Press Cancel again to retry.`,
        true,
      );
    } else {
      step.done(`Sale status in Sphere: ${summary.sale?.status}`);
    }
  } catch (error) {
    step.done(error.message, true);
  } finally {
    busy = false;
    updateAfterPayment();
  }
});
