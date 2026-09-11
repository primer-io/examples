---
name: primer-web-components
description: Accept card and alternative payments on the web with Primer's Checkout web components (@primer-io/primer-js), a framework-agnostic custom-element library. Use this skill to take a first card payment, add PayPal, Apple Pay, Google Pay or Klarna, theme the checkout, reuse saved cards, gate payment creation with an idempotency key, or build a custom card form. Also use it to migrate a React, Next.js, Vue or Svelte app onto the web components from Primer's Universal Checkout drop-in (@primer-io/checkout-web) or the headless API, and to debug a checkout that renders blank, shows no payment methods, stays loading, or does nothing on submit.
---

# Primer Web Components

## Overview

`@primer-io/primer-js` ships Primer Checkout as custom elements. Render `<primer-checkout>`, hand it
a client token your backend created, and it renders the payment methods that client session allows.
The rest is optional: slot your own layout in, set an `options` object, listen for `primer:*` DOM
events. Being custom elements, they behave the same in React, Next.js, Vue, Svelte and plain HTML.

The client session, payment-method configuration and payment processing are backend and Dashboard
work — see the [Primer docs](https://primer.io/docs). This skill is the browser half.

## When to use this skill

- Taking a first card payment, in plain HTML or React/Next.js/Vue/Svelte
- Adding PayPal, Apple Pay, Google Pay, Klarna or a redirect payment method
- Theming the checkout, or building a custom card form or payment-method layout
- Reusing saved payment methods; gating payment creation with an idempotency key
- [Migrating](#old-patterns) off the Universal Checkout drop-in (`@primer-io/checkout-web`)
- Debugging a checkout that renders blank, lists no methods, or ignores submit

## Reference files

- [`references/component-reference.md`](references/component-reference.md) — elements, attributes,
  slots, event payloads, options, CSS tokens
- [`references/react-patterns.md`](references/react-patterns.md) — React 18/19, Next.js, Nuxt,
  SvelteKit, drop-in migration

## Install and initialise

```bash
npm install @primer-io/primer-js@1.9.3
```

Importing the package registers the custom elements. `loadPrimer()` injects the loader and theme
stylesheets; it is **synchronous and returns `void`**, so there is nothing to `await` or `.catch()`.

```typescript
// add to the top of your file
import { loadPrimer } from '@primer-io/primer-js';
import type { PrimerCheckoutOptions } from '@primer-io/primer-js';

// The query returns a bare Element. Name the property you add -- NOT the exported element
// class, which needs `lit` installed to resolve. See references/component-reference.md.
type PrimerCheckoutEl = HTMLElement & { options: PrimerCheckoutOptions };

loadPrimer();

const checkout = document.querySelector('primer-checkout') as PrimerCheckoutEl;
checkout.setAttribute('client-token', await yourFetchClientToken());
```

`client-token` is an **attribute** (`setAttribute`); `options` is a **property** (assignment).
`setAttribute('options', …)` stringifies and is ignored, and `client-token` inside `options` does
nothing — [why](references/component-reference.md#component-properties-vs-sdk-options).

**What you can import.** Values: `loadPrimer`, `injectLoaderStyles`, `injectThemeStyles`,
`injectLightTheme`, `injectDarkTheme`, the element classes. Every other export —
`PrimerCheckoutOptions`, `PaymentSuccessData`, `PaymentSummary` and **`PaymentMethodType`**
included — is **type-only** ([full list](references/component-reference.md#typescript-types-and-third-party-type-dependencies)).

```typescript
// WRONG -- PaymentMethodType is exported as a type, not a value. This does not compile.
import { PaymentMethodType } from '@primer-io/primer-js';
const options = { enabledPaymentMethods: [PaymentMethodType.PAYMENT_CARD] };
```

```typescript
// CORRECT -- the values are the strings themselves; the type only constrains them.
import type { PaymentMethodType } from '@primer-io/primer-js';

const METHODS: PaymentMethodType[] = ['PAYMENT_CARD', 'PAYPAL'];
```

## Take the first payment

The default checkout needs no slots — this is a complete integration:

```html
<primer-checkout client-token="your-client-token"></primer-checkout>
<script type="module" src="/src/main.ts"></script>
```

For a custom layout, slot `<primer-main slot="main">` in and fill its `payments` slot.

```html
<primer-checkout client-token="your-client-token">
  <primer-main slot="main">
    <div slot="payments">
      <primer-payment-method type="PAYMENT_CARD"></primer-payment-method>
      <primer-payment-method type="PAYPAL"></primer-payment-method>
      <primer-error-message-container></primer-error-message-container>
    </div>
    <div slot="checkout-complete"><h2>Thank you for your order</h2></div>
  </primer-main>
</primer-checkout>
```

`<primer-payment-method type="X">` renders nothing at all — silently — when `X` is not among the
methods the client session made available. `<primer-payment-method-container include="APPLE_PAY,GOOGLE_PAY">`
renders whichever of a comma-separated list did arrive, which is the safer form.

React needs a stable `options` reference, and a ref in React 18:
[`references/react-patterns.md`](references/react-patterns.md).

## Handle the outcome

Listen for events on the element. The `primer:ready` detail's callbacks — `onPaymentSuccess`,
`onPaymentFailure`, `onVaultedMethodsUpdate`, `onPaymentStart`, `onPaymentPrepare` — are all
deprecated in favour of the equivalent event.

```typescript
// add to the top of your file
import type {
  PaymentSuccessData,
  PaymentFailureData,
} from '@primer-io/primer-js';

const checkout = document.querySelector('primer-checkout')!;

checkout.addEventListener('primer:payment-success', (event) => {
  const { payment, timestamp } = (event as CustomEvent<PaymentSuccessData>)
    .detail;
  // `timestamp` is Unix SECONDS -- multiply before handing it to Date.
  console.log(
    payment.id,
    payment.paymentMethodData?.network,
    new Date(timestamp * 1000),
  );
  window.location.href = `/confirmation?orderId=${payment.orderId}`;
});

checkout.addEventListener('primer:payment-failure', (event) => {
  const { error } = (event as CustomEvent<PaymentFailureData>).detail;
  yourShowError(error.message, error.diagnosticsId); // quote diagnosticsId to support
});
```

`payment` is a `PaymentSummary` — `id` and `orderId` at the top level, everything about the
instrument **nested under `paymentMethodData`**, never on `payment` itself, and only five
whitelisted fields survive the filter
([shape](references/component-reference.md#payment-summary-shape)).

Terminal states: `primer:payment-success`, `primer:payment-failure`, `primer:payment-cancel`.
`primer:state-change` carries the interim flags (`isLoading`, `isProcessing`, `isSuccessful`) plus
`primerJsError` (initialisation only) and `paymentFailure`.

## Configure the session

```javascript
checkout.options = {
  locale: 'en-GB',
  enabledPaymentMethods: ['PAYMENT_CARD', 'PAYPAL'],
  redirect: { returnUrl: 'https://yourshop.example/checkout/return' },
  card: { cardholderName: { required: true, visible: true } },
  vault: { enabled: true },
};
```

`redirect.returnUrl` is not optional in practice: **any method that may redirect the customer is
dropped from the checkout when it is missing**, with only a console warning. (The SDK's own type
comment claims it throws at initialisation; it does not.) Point it at a page that re-initialises the
SDK with the `?clientToken=…` query parameter Primer appends on return.

Omitting `enabledPaymentMethods` shows **every** method the client session allows — there is no
`[PAYMENT_CARD]` default. [Full options surface, defaults and
owners](references/component-reference.md#sdk-options).

## Style it

CSS custom properties pierce the shadow DOM. Set them on `:root` or `primer-checkout`.

```css
primer-checkout {
  --primer-color-brand: #4a6cf7; /* --primer-color-loader and -focus inherit from it */
  --primer-radius-base: 8px; /* --primer-radius-button overrides buttons alone */
  --primer-typography-brand: Inter, sans-serif;
}
```

Dark mode ships with the SDK — add the class, do not redefine the tokens:

```javascript
checkout.classList.add('primer-dark-theme');
```

The `custom-styles` attribute does the same from a JSON string of camelCase names
(`primerColorBrand` → `--primer-color-brand`).
[Token list and sanitiser rules](references/component-reference.md#css-custom-properties).

## Add payment methods

Dashboard configuration and the client session decide which methods exist; `enabledPaymentMethods`
narrows that. Client-side options only affect presentation and what a wallet collects.

| Method                                   | Extra client-side requirement                                                                                  |
| ---------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Card, Google Pay, Klarna                 | none                                                                                                           |
| PayPal                                   | `paypal.vault: true` **and** `vaultOnSuccess` on the client session, to save it                                |
| Apple Pay                                | `merchantDomain`, if the page hostname is not in the Dashboard's Apple Pay domains, or the SDK is in an iframe |
| Redirect methods (iDEAL, Sofort, P24, …) | `redirect.returnUrl` — see above                                                                               |
| Wallet shipping in the native sheet      | `onShippingAddressChange` **and** `onShippingOptionChange`, each answered within 20s                           |

Wallet and PayPal button appearance is bound by Apple's, Google's and PayPal's brand rules whatever
the option types allow. Per-method options, defaults and funding-source controls:
[`references/component-reference.md`](references/component-reference.md#payment-method-options).

## Customise the form

Slot the inputs into `<primer-card-form>`'s `card-form-content` slot; leave it empty and the form
renders its own default layout. Each input takes `label`, `placeholder` and `aria-label` —
[worked example, full element list](references/component-reference.md#card-form-components).

To submit from your own button, set `options.submitButton.useBuiltInButton = false`, drop
`<primer-card-form-submit>`, and dispatch on `document` — `<primer-checkout>` listens there.

```javascript
document.dispatchEvent(
  new CustomEvent('primer:card-submit', {
    bubbles: true,
    composed: true,
    detail: { source: 'your-pay-button' },
  }),
);
```

The inputs render their own validation errors; `primer:card-error` hands you the same ones
(`{ field, name, error, message }`) if you want to render them yourself.

## Saved payment methods

```javascript
checkout.options = { vault: { enabled: true, showEmptyState: true } };
```

The client session **must** carry a `customerId` — without one the vault manager throws
`You must provide a customerId in the client session to use the Vault Manager.` Saving a method also
needs `vaultOnSuccess` on the client session; `vault.enabled` alone only shows what is already
stored, and only card, PayPal, Klarna and Stripe ACH instruments are shown at all.

```javascript
checkout.addEventListener('primer:vault-methods-update', (event) => {
  const { vaultedPayments, cvvRecapture } = event.detail;
  // A plain array -- .length, .map, .forEach. There is no .get(), .size() or .toArray().
  vaultedPayments.forEach((method) => {
    console.log(
      method.paymentMethodType,
      method.paymentInstrumentData?.last4Digits,
    );
  });
});
```

`paymentInstrumentData` is shaped by `paymentInstrumentType`; narrow on it before reading fields,
and treat it as PII — unlike `PaymentSummary` it is not name-filtered ([per-type
fields](references/component-reference.md#saved-payment-method-shape)). `vault.headless: true` keeps
the vault working with no vault UI rendered.

## Gate payment creation

`primer:payment-start` fires immediately before the payment is created. Its detail carries
`continuePaymentCreation(data?)`, `abortPaymentCreation()`, `paymentMethodType` and `timestamp`.

**The SDK continues on its own unless you stop it during dispatch.** Straight after dispatching it
checks whether a listener called `preventDefault()` or resolved a handler _synchronously_; if
neither happened it calls `continuePaymentCreation()` itself. An `async` listener returns after that
check, so the payment is already away by the time your check answers.

```javascript
// WRONG (compiles; wrong at runtime) -- the SDK auto-continued at dispatch. The payment
// goes through whatever yourRiskCheck() decides, and abortPaymentCreation() arrives too late.
checkout.addEventListener('primer:payment-start', async (event) => {
  if (await yourRiskCheck()) event.detail.continuePaymentCreation();
  else event.detail.abortPaymentCreation();
});
```

```javascript
// CORRECT -- preventDefault() runs synchronously, which parks the payment until you resolve.
checkout.addEventListener('primer:payment-start', (event) => {
  event.preventDefault();
  const { continuePaymentCreation, abortPaymentCreation } = event.detail;

  yourRiskCheck().then((ok) =>
    ok
      ? continuePaymentCreation({ idempotencyKey: crypto.randomUUID() })
      : abortPaymentCreation(),
  );
});
```

A synchronous decision needs no `preventDefault()` — calling `continuePaymentCreation()` or
`abortPaymentCreation()` inside the listener is itself the signal. Either way, resolve exactly once.
`idempotencyKey` becomes the request's `X-Idempotency-Key`, which is what makes a retry safe.
`primerJS.refreshSession()` is a no-op while a payment is in flight (it logs a `[PRIMER]` warning),
so it cannot be used here. The two wallet shipping events in
[Add payment methods](#add-payment-methods) follow the same contract.

## Errors and recovery

Drop `<primer-error-message-container>` into your `payments` slot and payment failures render
themselves. For custom handling, read `primer:payment-failure`: `error` carries `code`, `message`,
`diagnosticsId?` and `origin`, which says who acts on it —
[the five origins](references/component-reference.md#error-shape). `primerJsError` on
`primer:state-change` is initialisation only: `INVALID_CLIENT_TOKEN` (mint a new one) or
`INITIALIZATION_ERROR`.

Content slotted into `checkout-error` on `<primer-main>` replaces the initialisation error screen.
The slot is `checkout-error`, not `checkout-failure`, and it does **not** show payment failures.

## Troubleshooting

**Checkout renders blank.** The elements never registered: import the package and call
`loadPrimer()` in a browser-side entry point. Do not hide `primer-checkout` yourself while it
loads — the SDK ships that CSS and its own spinner; `loader-disabled` turns the spinner off.

**No payment methods, or one is missing.** Dashboard configuration and the client session decide
first. Then: filtered out by `enabledPaymentMethods`? A redirect method with no
`options.redirect.returnUrl`? A `<primer-payment-method type="…">` naming a method this session did
not return, which renders nothing? Each of these logs a `[PRIMER]` console warning.

**Submit does nothing.** With `submitButton.useBuiltInButton: false` you own submission: dispatch
`primer:card-submit` on `document` with `bubbles` and `composed`.

**Options ignored.** Use `checkout.options = {…}`, not `setAttribute`; in React the object needs a
stable reference or every render re-initialises the checkout.

**Payment proceeds despite my check.** Call `event.preventDefault()` synchronously — see
[Gate payment creation](#gate-payment-creation).

**Saved cards missing.** The client session needs a `customerId`, plus `vaultOnSuccess` to store new
ones.

**JSX type errors.** Augment the JSX namespace with `CustomElements` — React 18 and 19 want it in
different places: [`references/react-patterns.md`](references/react-patterns.md#jsx-typing).

## Key guidelines

1. `client-token` via `setAttribute`; `options` via property assignment.
2. `loadPrimer()` is synchronous and returns `void`.
3. `PaymentMethodType` and every non-element export is type-only — the values are strings.
4. `primer:payment-start` needs a synchronous `preventDefault()` before any async check.
5. Every event's `timestamp` is Unix **seconds**; card details sit under `paymentMethodData`.
6. `vaultedPayments` and the `primer:methods-update` detail are plain arrays.
7. Set `redirect.returnUrl` whenever a redirect method may be enabled.
8. Prefer the events over the deprecated `primer:ready` callbacks.
9. In React, `options` must be a module constant or `useMemo`'d.

## Old patterns

<details>
<summary>Universal Checkout drop-in, headless mode, and the <code>sdkCore</code> flag</summary>

- **`@primer-io/checkout-web` / `Primer.showUniversalCheckout()`** — the drop-in, a different
  package. Replaced by `<primer-checkout>` plus the events in
  [Handle the outcome](#handle-the-outcome);
  [step-by-step migration](references/react-patterns.md#migrating-off-the-drop-in)
- **`sdkCore` and `options.stripe`** — the legacy headless engine, gone.
  [What replaced them](references/component-reference.md#removed-options-and-renamed-callbacks)
- **Pre-1.0 callback and event names** —
  [rename table](references/component-reference.md#removed-options-and-renamed-callbacks)

</details>
