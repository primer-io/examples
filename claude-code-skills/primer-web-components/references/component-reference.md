# Component and API reference

Every element, attribute, slot, event payload and option below is taken from the shipped package —
`dist/custom-elements.json` for the element registry and `dist/primer-loader.d.ts` for the types.
Attributes not listed here do not exist; the element ignores them silently.

## Contents

- [Component properties vs SDK options](#component-properties-vs-sdk-options)
- [Core components](#core-components)
- [Card form components](#card-form-components)
- [Base UI components](#base-ui-components)
- [Vault components](#vault-components)
- [Slots](#slots)
- [Events](#events)
- [Payment summary shape](#payment-summary-shape)
- [Saved payment method shape](#saved-payment-method-shape)
- [Error shape](#error-shape)
- [SDK options](#sdk-options)
- [Removed options and renamed callbacks](#removed-options-and-renamed-callbacks)
- [Payment method options](#payment-method-options)
- [CSS custom properties](#css-custom-properties)
- [TypeScript types and third-party type dependencies](#typescript-types-and-third-party-type-dependencies)

## Component properties vs SDK options

`<primer-checkout>` is a Lit element. Its three attributes are reflected properties, watched through
the attribute system, so they are set with `setAttribute`. `options` is a plain property that is not
attribute-backed: assign it.

```javascript
checkout.setAttribute('client-token', 'your-client-token');
checkout.setAttribute('loader-disabled', 'true');
checkout.setAttribute(
  'custom-styles',
  JSON.stringify({ primerColorBrand: '#4a6cf7' }),
);

checkout.options = { locale: 'en-GB', vault: { enabled: true } };
```

`setAttribute('options', …)` stores a string the element never reads. `client-token` inside
`options` is ignored — it is not part of `PrimerCheckoutOptions`. `checkout.getAttribute('locale')`
returns `null` because locale lives in `options`.

## Core components

### `<primer-checkout>`

| Attribute         | Meaning                                                                                    |
| ----------------- | ------------------------------------------------------------------------------------------ |
| `client-token`    | The client session JWT from your backend. Required.                                        |
| `custom-styles`   | JSON string of camelCase token names — see [CSS custom properties](#css-custom-properties) |
| `loader-disabled` | Suppresses the built-in pre-init spinner                                                   |
| `js-initialized`  | Set **by the SDK** once it has initialised; do not set it yourself                         |

Property: `options` (`PrimerCheckoutOptions`). Also exposes `primerJS` once ready, the same object
`primer:ready` carries.

`loadPrimer()` injects a stylesheet that hides `primer-main:not(:defined)` and the `[slot="main"]`
content of a `primer-checkout` without `js-initialized`, and draws the spinner on
`primer-checkout:not([js-initialized]):not([loader-disabled])::after`. Flash-of-unstyled-content is
handled; adding your own `:not(:defined)` rules hides the SDK's loader too.

### `<primer-main>`

No attributes. Must be slotted as `<primer-main slot="main">`. Renders exactly one of its three
slots depending on state — see [Slots](#slots).

### `<primer-payment-method>`

| Attribute  | Meaning                                                                  |
| ---------- | ------------------------------------------------------------------------ |
| `type`     | A `PaymentMethodType` string, e.g. `PAYMENT_CARD`, `PAYPAL`, `APPLE_PAY` |
| `disabled` | Boolean                                                                  |

It looks `type` up in the payment methods the client session returned and renders the matching
component (card form, native wallet button, Klarna, QR code, BLIK, MB WAY, redirect or
backend-driven). **When `type` is not in that list it renders nothing and reports nothing.**

### `<primer-payment-method-container>`

| Attribute  | Meaning                       |
| ---------- | ----------------------------- |
| `include`  | Comma-separated types to keep |
| `exclude`  | Comma-separated types to drop |
| `disabled` | Boolean                       |

Values are trimmed; `include` is applied first, then `exclude`. Renders nothing when the filter
leaves no methods. Because it renders what actually arrived, it is safer than naming each method.

### `<primer-error-message-container>`

| Attribute                | Meaning                                                  |
| ------------------------ | -------------------------------------------------------- |
| `show-processing-errors` | Also surface errors raised while a payment is processing |

### `<primer-billing-address>`

No attributes. Slot it inside `<primer-card-form>`'s `card-form-content`. Its failures arrive on
`primer:card-error` as `field: 'billingAddress'`, `error: 'BILLING_ADDRESS_SUBMISSION_FAILED'`.

## Card form components

`<primer-card-form>` takes `hide-labels` and `disabled`. Slot your fields into `card-form-content`;
leave the slot empty and it renders card number, expiry, CVV (and cardholder name, if
`options.card.cardholderName.visible`) plus a submit button.

```html
<primer-card-form>
  <div slot="card-form-content">
    <primer-input-card-number label="Card number"></primer-input-card-number>
    <div style="display: flex; gap: 8px">
      <primer-input-card-expiry></primer-input-card-expiry>
      <primer-input-cvv></primer-input-cvv>
    </div>
    <primer-input-card-holder-name></primer-input-card-holder-name>
    <primer-billing-address></primer-billing-address>
    <primer-card-form-submit></primer-card-form-submit>
  </div>
</primer-card-form>
```

| Element                           | Attributes                                                       |
| --------------------------------- | ---------------------------------------------------------------- |
| `<primer-input-card-number>`      | `label`, `placeholder`, `aria-label`                             |
| `<primer-input-card-expiry>`      | `label`, `placeholder`, `aria-label`                             |
| `<primer-input-cvv>`              | `label`, `placeholder`, `aria-label`                             |
| `<primer-input-card-holder-name>` | `label`, `placeholder`, `aria-label`                             |
| `<primer-card-form-submit>`       | `buttonText`, `variant`, `disabled`                              |
| `<primer-card-network-selector>`  | none — rendered inside the card number field for co-badged cards |

Card number, expiry and CVV are hosted iframes; cardholder name is a normal input, which is why
`primerJS.setCardholderName(name)` can prefill it (after the inputs have rendered — earlier calls
warn and no-op) and `options.card.cardholderName.defaultValue` can too.

## Base UI components

| Element                   | Attributes                                                                                                                                            |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `<primer-input>`          | `value`, `placeholder`, `disabled`, `name`, `type`, `required`, `readonly`, `pattern`, `minlength`, `maxlength`, `min`, `max`, `step`, `autocomplete` |
| `<primer-input-wrapper>`  | `has-error`, `focusWithin`                                                                                                                            |
| `<primer-input-label>`    | `for`, `disabled` (default slot for the text)                                                                                                         |
| `<primer-input-error>`    | `for`, `active` (default slot for the text)                                                                                                           |
| `<primer-button>`         | `variant`, `type`, `disabled`, `loading`, `selectable`, `selectionState`, `flex`                                                                      |
| `<primer-select>`         | `name`, `value`, `disabled`, `has-error`, `placeholder`                                                                                               |
| `<primer-spinner>`        | `color`, `size`, `compact`                                                                                                                            |
| `<primer-icon>`           | `name`, `color`, `size`                                                                                                                               |
| `<primer-collapsable>`    | `header`, `expanded`, `expandText`, `collapseText`, `ariaLabel`, `buttonVariant`                                                                      |
| `<primer-dialog>`         | `size`, `showCloseButton`                                                                                                                             |
| `<primer-portal-dialog>`  | `size`, `showCloseButton`, `darkMode`, `cta`, `onOpen`, `onContentRendered`                                                                           |
| `<primer-checkout-state>` | `type`, `description`                                                                                                                                 |

`<primer-button>`'s `variant` is `'primary' | 'secondary' | 'tertiary'`. The button's HTML type is
`type`, not `buttonType`. `<primer-portal-dialog darkMode>` adds `primer-dark-theme` to itself.

```html
<primer-input-wrapper has-error>
  <primer-input-label slot="label">Billing zip</primer-input-label>
  <primer-input slot="input" type="text" name="zip"></primer-input>
  <primer-input-error slot="error" active>Enter a valid zip</primer-input-error>
</primer-input-wrapper>
```

## Vault components

| Element                              | Attributes                                           |
| ------------------------------------ | ---------------------------------------------------- |
| `<primer-vault-manager>`             | `animationDuration`                                  |
| `<primer-vault-manager-header>`      | `isEditMode`, `hasPaymentMethods`                    |
| `<primer-vault-payment-method-item>` | `isEditMode`                                         |
| `<primer-vault-payment-submit>`      | `buttonText`, `variant`, `disabled`                  |
| `<primer-vault-cvv-input>`           | `paymentMethod`                                      |
| `<primer-vault-delete-confirmation>` | `isDeleting`, `paymentMethodId`, `paymentMethodName` |
| `<primer-vault-error-message>`       | `errorMessage`                                       |
| `<primer-vault-empty-state>`         | none                                                 |
| `<primer-show-other-payments>`       | none                                                 |

`<primer-vault-manager>` renders nothing unless `options.vault.enabled` is true and
`vault.headless` is not. With no saved payment methods it renders nothing unless
`options.vault.showEmptyState` is true.

Payment-method components you can also place directly: `<primer-klarna>`, `<primer-adyen-klarna>`,
`<primer-adyen-mbway>`, `<primer-blik>`, `<primer-qrcode>`, `<primer-redirect-payment>`,
`<primer-backend-driven>`, `<primer-native-payment>` (Apple Pay / Google Pay),
`<primer-payment-method-accordion>`, `<primer-payment-method-button>`. Each takes a `paymentMethod`
property from `primer:methods-update` or `primerJS.getPaymentMethods()`, plus `disabled`. Prefer
`<primer-payment-method type="…">`, which picks the right one for you.

## Slots

| Slot                                | On                             | Rendered when                                             |
| ----------------------------------- | ------------------------------ | --------------------------------------------------------- |
| `main`                              | `<primer-checkout>`            | always — this is where `<primer-main>` goes               |
| `payments`                          | `<primer-main>`                | not loading, no init error, not yet successful            |
| `checkout-complete`                 | `<primer-main>`                | `sdkState.isSuccessful`                                   |
| `checkout-error`                    | `<primer-main>`                | `sdkState.primerJsError` — **initialisation errors only** |
| `card-form-content`                 | `<primer-card-form>`           | always                                                    |
| `label` / `input` / `error`         | `<primer-input-wrapper>`       | always                                                    |
| `other-payments`                    | `<primer-show-other-payments>` | vault disabled, headless, or empty                        |
| `show-other-payments-toggle-button` | `<primer-show-other-payments>` | vault has content to collapse                             |
| `submit-button`                     | `<primer-vault-manager>`       | a saved payment method is selected                        |
| `vault-empty-state`                 | `<primer-vault-manager>`       | vault empty and `showEmptyState`                          |

There is no `checkout-failure` slot. Payment failures are not a `<primer-main>` state at all — use
`<primer-error-message-container>` or `primer:payment-failure`.

## Events

Every event bubbles and is composed, and `<primer-checkout>` re-dispatches from itself, so you can
listen on the element, an ancestor, or `document`. `event.detail` is fully typed when the element
reference is typed `PrimerCheckoutComponent` — the class declares `addEventListener` overloads over
the whole event map.

| Event                                        | `detail`                                                                          |
| -------------------------------------------- | --------------------------------------------------------------------------------- |
| `primer:ready`                               | the `PrimerJS` instance                                                           |
| `primer:state-change`                        | `{ isLoading, isProcessing, isSuccessful, primerJsError, paymentFailure }`        |
| `primer:methods-update`                      | `InitializedPaymentMethod[]` — **the array is the detail**                        |
| `primer:payment-start`                       | `{ paymentMethodType, continuePaymentCreation, abortPaymentCreation, timestamp }` |
| `primer:payment-success`                     | `{ payment, paymentMethodType?, timestamp }`                                      |
| `primer:payment-failure`                     | `{ error, payment?, paymentMethodType?, timestamp }`                              |
| `primer:payment-cancel`                      | `{ payment?, paymentMethodType, timestamp }`                                      |
| `primer:payment-approval-required`           | `PaymentApprovalRequiredData & { timestamp }` — MANUAL flow                       |
| `primer:vault-methods-update`                | `{ vaultedPayments, cvvRecapture, timestamp }`                                    |
| `primer:vault-selection-change`              | `{ paymentMethodId, timestamp }`                                                  |
| `primer:vault-submit`                        | `{ source? }` — dispatch to submit the selected saved payment method              |
| `primer:card-submit`                         | `{ source? }` — dispatch to submit the card form                                  |
| `primer:card-success`                        | `{ result }` — `result` is `{ success?, token?, paymentId?, analyticsId?, … }`    |
| `primer:card-error`                          | `{ errors }` — each `{ field?, name, error, message }`                            |
| `primer:card-network-change`                 | `{ detectedCardNetwork, selectableCardNetworks, isLoading }` **or `null`**        |
| `primer:bin-data-available`                  | BIN metadata for the entered card                                                 |
| `primer:bin-data-loading-change`             | `{ loading }`                                                                     |
| `primer:shipping-address-change`             | `{ paymentMethodType, shippingAddress, setShippingOptions, timestamp }`           |
| `primer:shipping-option-change`              | `{ paymentMethodType, selectedShippingOption, continue, timestamp }`              |
| `primer:show-other-payments-toggle`          | `{ action?, source? }` — dispatch to expand/collapse                              |
| `primer:show-other-payments-toggled`         | `{ expanded }`                                                                    |
| `primer:dialog-open` / `primer:dialog-close` | no detail                                                                         |

**`timestamp` is Unix seconds on every event** (`Math.floor(Date.now() / 1000)`). `new Date(timestamp)`
gives you January 1970; multiply by 1000.

`primer:card-network-change` can carry a `null` detail — guard before destructuring:

```javascript
checkout.addEventListener('primer:card-network-change', (event) => {
  if (!event.detail || event.detail.isLoading) return;
  const network = event.detail.detectedCardNetwork?.network;
  if (network) yourShowCardBrand(network);
});
```

Three events are answered rather than observed — `primer:payment-start`,
`primer:shipping-address-change`, `primer:shipping-option-change`. Each needs a synchronous
`event.preventDefault()` if you intend to answer asynchronously, or the SDK treats the event as
unhandled and continues on its own. See
[Gate payment creation](../SKILL.md#gate-payment-creation).

### The `primer:ready` detail

`PrimerJS` — everything on it that is not marked internal:

| Member                                                                                                 | Notes                                                                                         |
| ------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------- |
| `vault.startPayment(id, { cvv? })`                                                                     | start a payment with a saved payment method                                                   |
| `vault.delete(id)`                                                                                     | delete a saved payment method                                                                 |
| `vault.createCvvInput(options)`                                                                        | mount a CVV recapture field                                                                   |
| `refreshSession()`                                                                                     | refetch the client session. **No-op while a payment is in flight**, with a `[PRIMER]` warning |
| `getPaymentMethods()`                                                                                  | the cached `InitializedPaymentMethod[]`                                                       |
| `setCardholderName(name)`                                                                              | prefill; must run after the hosted inputs render                                              |
| `resumeAppSwitch(orderId)` / `cancelAppSwitch()`                                                       | PayPal App Switch return from a native host app                                               |
| `createCvvInput`, `startVaultPayment`                                                                  | **deprecated** — use the `vault` namespace                                                    |
| `onPaymentStart`, `onPaymentPrepare`, `onPaymentSuccess`, `onPaymentFailure`, `onVaultedMethodsUpdate` | **deprecated** — use the matching `primer:*` event                                            |

## Payment summary shape

`PaymentSummary` is what `primer:payment-success` and `primer:payment-failure` carry as `payment`.
The SDK builds it by whitelisting five field names out of the raw payment, so nothing else is
present however much the API returned — `cardholderName` in particular is dropped.

```typescript
// Mirror of the shipped declaration -- import the type, do not redeclare it.
interface PaymentSummary {
  id: string;
  orderId: string;
  paymentMethodData?: {
    paymentMethodType?: string;
    last4Digits?: string; // cards
    network?: string; // cards, e.g. "VISA"
    accountNumberLastFourDigits?: string; // ACH
    bankName?: string; // ACH
  };
}
```

There is no `payment.network`, `payment.last4Digits` or `payment.paymentMethodType` — all of it is
one level down, under `paymentMethodData`. The top-level `paymentMethodType` you can read is a
sibling of `payment` in the event detail, and it is optional there.

## Saved payment method shape

`VaultedPaymentMethodSummary` is a discriminated union on `paymentInstrumentType`. Narrow on it
before reading `paymentInstrumentData`.

| `paymentInstrumentType`    | `paymentInstrumentData` fields                                                                           |
| -------------------------- | -------------------------------------------------------------------------------------------------------- |
| `PAYMENT_CARD`             | `last4Digits`, `network`, `cardholderName`, `expirationMonth`, `expirationYear`                          |
| `PAYPAL_BILLING_AGREEMENT` | `externalPayerId`, `email`, `firstName`, `lastName`, `externalPayerInfo`, `shippingAddress`              |
| `KLARNA_CUSTOMER_TOKEN`    | `email`, `firstName`, `lastName`, `phoneNumber`, `sessionData.billingAddress`                            |
| anything else              | `Record<string, unknown>` — ACH arrives here as `accountNumberLastFourDigits`, `bankName`, `accountType` |

Common to all: `id`, `analyticsId`, `paymentMethodType`, `userDescription?`.

Unlike `PaymentSummary`, this is **not** name-filtered — a saved card carries the cardholder name
and expiry. Treat it as PII: do not log it or send it to analytics.

`vaultedPayments` is a plain array. `.length`, `.map`, `.filter`, `.find` all work; there is no
`.get(id)`, `.size()` or `.toArray()`. To find one, use `find`:

```javascript
const method = vaultedPayments.find((m) => m.id === yourSelectedId);
```

Only `PAYMENT_CARD`, `PAYPAL`, `KLARNA` and `STRIPE_ACH` instruments are returned; other stored
types are filtered out before you see them, as are cards whose network is excluded by the client
session's `orderedAllowedCardNetworks`.

## Error shape

`PaymentFailureError` (the `error` on `primer:payment-failure`, and `paymentFailure` on
`primer:state-change`) is `{ code, message, diagnosticsId?, origin?, … }` — it is an open record, so
extra fields may be present. `primerJsError` is an `SdkError`: the same plus a `suggestion` on
integration errors and a nested `error` cause.

| `origin`      | Who acts, and how                                              |
| ------------- | -------------------------------------------------------------- |
| `integration` | Your setup is wrong. Read `suggestion`                         |
| `payment`     | Declined or failed. Check the Dashboard; let the shopper retry |
| `network`     | Transport failure — retryable                                  |
| `user`        | The shopper cancelled. Not an error to report                  |
| `primer`      | Report to Primer support with the `diagnosticsId`              |

Initialisation codes on `primerJsError`: `INVALID_CLIENT_TOKEN` (malformed, expired or rejected —
mint a new one) and `INITIALIZATION_ERROR` (anything else, e.g. the configuration failed to load).

## SDK options

`PrimerCheckoutOptions`. Defaults below are the SDK's, read from the type's `@default` tags and the
shipped implementation.

| Option                             | Type                                       | Default                                            | Notes                                                                                                                                                                                                      |
| ---------------------------------- | ------------------------------------------ | -------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `locale`                           | `string`                                   | detected from the browser                          | e.g. `'en-GB'`                                                                                                                                                                                             |
| `enabledPaymentMethods`            | `PaymentMethodType[]`                      | **unset — every method the client session allows** | A filter over the session's list, never an addition to it                                                                                                                                                  |
| `merchantDomain`                   | `string`                                   | unset                                              | Apple Pay only. When unset the SDK checks `window.location.hostname` against the Apple Pay domains configured in the Dashboard and hides the button if it is absent. Set it when the SDK runs in an iframe |
| `disabledPayments`                 | `boolean`                                  | `false`                                            | Renders every method **disabled**, not hidden — a display-only preview mode. Drop-in mode only                                                                                                             |
| `redirect.returnUrl`               | `string`                                   | unset                                              | Required in practice for any redirect-capable method; see below                                                                                                                                            |
| `redirect.forceRedirect`           | `boolean`                                  | `false`                                            | Use a full redirect instead of a popup everywhere                                                                                                                                                          |
| `card.cardholderName.required`     | `boolean`                                  | `false`                                            |                                                                                                                                                                                                            |
| `card.cardholderName.visible`      | `boolean`                                  | `true`                                             |                                                                                                                                                                                                            |
| `card.cardholderName.placeholder`  | `string`                                   | unset                                              |                                                                                                                                                                                                            |
| `card.cardholderName.defaultValue` | `string`                                   | unset                                              | Applied during iframe init; the shopper can edit it                                                                                                                                                        |
| `vault.enabled`                    | `boolean`                                  | —                                                  | **Required when `vault` is present**                                                                                                                                                                       |
| `vault.showEmptyState`             | `boolean`                                  | `false`                                            | Show the vault section when nothing is saved                                                                                                                                                               |
| `vault.headless`                   | `boolean`                                  | `false`                                            | Vault works, no vault UI renders                                                                                                                                                                           |
| `vault.enabledPaymentMethods`      | `PaymentMethodType[]`                      | unset                                              | Restrict which saved payment method types are shown                                                                                                                                                        |
| `submitButton.amountVisible`       | `boolean`                                  | `false`                                            | e.g. "Pay $12.34"                                                                                                                                                                                          |
| `submitButton.useBuiltInButton`    | `boolean`                                  | `true`                                             | `false` renders no button; dispatch `primer:card-submit` yourself                                                                                                                                          |
| `giftCard`                         | `{ logoSrc, background, logoAlt?, text? }` | unset                                              |                                                                                                                                                                                                            |

Callbacks also live on `options`: `onAvailablePaymentMethodsLoad`, `onAvailablePaymentMethodsRefresh`,
`onClientSessionUpdate`, `onPaymentApprovalRequired`, `onCheckoutResume`, `onShippingAddressChange`,
`onShippingOptionChange`, `onBinDataAvailable`, `onCardNetworksChange`. Each has an equivalent
`primer:*` event except the client-session ones; prefer the events.

**`redirect.returnUrl`.** Without it, every payment method that may redirect the shopper is dropped
from the checkout — the SDK logs `[PRIMER] … will not be available in this checkout` and carries
on. The type's own doc comment says the SDK throws at initialisation; it does not, so the only
symptom is a missing payment method. The URL must load a page that re-initialises the SDK with the
`?clientToken=…` query parameter Primer appends on return.

**Not in the options surface.** There is no client-side option for `vaultOnSuccess`, `customerId`,
amount, currency or line items — those are client-session fields your backend sets. For options that
used to exist, see below.

## Removed options and renamed callbacks

`sdkCore` selected a legacy headless engine alongside SDK Core. That engine was **removed in
1.6.0**: the option is not in `PrimerCheckoutOptions` (so an object literal carrying it is a type
error) and the runtime never reads it. Delete it — every payment method now runs on the one engine,
and there is nothing to opt into. `options.stripe` (`mandateData`, `publishableKey`) went with it;
Stripe ACH is configured in the Dashboard.

| Old name                                                                                                                          | Use instead                                                                  |
| --------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `onPaymentComplete`                                                                                                               | `primer:payment-success` and `primer:payment-failure`                        |
| `error` (on the state payload)                                                                                                    | `primerJsError`                                                              |
| `failure` (on the state payload)                                                                                                  | `paymentFailure`                                                             |
| `primer:payment-methods-updated`                                                                                                  | → use `primer:methods-update`                                                |
| `primer:ready` callbacks (`onPaymentSuccess`, `onPaymentFailure`, `onPaymentStart`, `onPaymentPrepare`, `onVaultedMethodsUpdate`) | the matching `primer:*` event — all five are deprecated but still functional |
| `primerJS.createCvvInput`, `primerJS.startVaultPayment`                                                                           | `primerJS.vault.createCvvInput`, `primerJS.vault.startPayment`               |
| `applePay.buttonType`, `applePay.buttonStyle`                                                                                     | `applePay.buttonOptions.type`, `applePay.buttonOptions.buttonStyle`          |
| `redirect.resumePaymentOnPopupClosure`                                                                                            | nothing — the flag is deprecated and has no effect                           |

The drop-in (`@primer-io/checkout-web`, `Primer.showUniversalCheckout()`) is a separate package, not
an older version of this one. See
[Migrating off the drop-in](react-patterns.md#migrating-off-the-drop-in).

## Payment method options

### `options.paypal`

| Option                     | Type                                               | Notes                                                                              |
| -------------------------- | -------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `style`                    | `PayPalButtonStyle` + per-funding-source overrides | see below                                                                          |
| `vault`                    | `boolean`                                          | Save the PayPal account. Also needs `vaultOnSuccess` on the client session         |
| `paymentFlow`              | `string`                                           | `'PREFER_VAULT'` for the vault-first flow                                          |
| `disableFunding`           | `FUNDING_SOURCE[]`                                 | e.g. `['credit', 'paylater', 'card']`                                              |
| `enableFunding`            | `FUNDING_SOURCE[]`                                 | e.g. `['venmo']`. `disableFunding` wins on a conflict                              |
| `buyerCountry`             | `string`                                           | Applied in SANDBOX/STAGING only; ignored in production                             |
| `integrationDate`, `debug` | `string`, `boolean`                                | passed through to PayPal's SDK                                                     |
| `appSwitch.enabled`        | `boolean` (`false`)                                | Open the PayPal app when installed                                                 |
| `appSwitch.returnUrl`      | `string`                                           | Required when App Switch is enabled, and must be the URL the SDK initialised on    |
| `appSwitch.hostApp`        | `{ getContext, openApprovalUrl }`                  | For checkout inside a native app's webview; pair with `primerJS.resumeAppSwitch()` |

`style` is PayPal's own `PayPalButtonStyle` (from `@paypal/paypal-js`), and Primer resolves it like
this:

| Style field                       | Primer's fallback                                                                                                    |
| --------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `color`                           | `'gold'`; the **card** button accepts only `'black'` or `'white'` and falls back to `'black'` with a console warning |
| `shape`                           | `'rect'`                                                                                                             |
| `label`                           | `'paypal'`                                                                                                           |
| `layout`                          | `'vertical'`, or `'horizontal'` when `tagline` is true                                                               |
| `tagline`                         | `false`                                                                                                              |
| `height`                          | no default — derived from the rendered button height, clamped to 25–55                                               |
| `borderRadius`, `disableMaxWidth` | no default; omitted unless you set them                                                                              |

Per-funding-source overrides sit beside the base fields, keyed by funding source:

```javascript
checkout.options = {
  paypal: {
    style: { color: 'blue', shape: 'pill', card: { color: 'black' } },
    disableFunding: ['credit', 'paylater'],
    enableFunding: ['venmo'],
    vault: true,
  },
};
```

### `options.applePay`

```javascript
checkout.options = {
  applePay: {
    buttonOptions: { type: 'buy', buttonStyle: 'black' },
    billingOptions: { requiredBillingContactFields: ['postalAddress'] },
    shippingOptions: {
      requiredShippingContactFields: ['postalAddress', 'name', 'email'],
      requireShippingMethod: false,
    },
  },
};
```

- `buttonOptions.type` — `add-money`, `book`, `buy`, `check-out`, `continue`, `contribute`,
  `donate`, `order`, `pay`, `plain` (default), `reload`, `rent`, `set-up`, `subscribe`, `support`,
  `tip`, `top-up`
- `buttonOptions.buttonStyle` — `black`, `white`, `white-outline`
- `requiredBillingContactFields` — **`'postalAddress'` only.** `'emailAddress'` is not a member of
  this union and does not compile
- `requiredShippingContactFields` — `postalAddress`, `name`, `phoneticName`, `phone`, `email`. Note
  `phone` and `email`, not `phoneNumber` and `emailAddress`
- Top-level `buttonType` / `buttonStyle` still exist but are deprecated in favour of `buttonOptions`
- `requireShippingMethod: true` shows nothing unless you also register `onShippingAddressChange` and
  `onShippingOptionChange`; the SDK logs a warning and the sheet stays empty

Apple's button guidelines bind the appearance whatever the union permits.

### `options.googlePay`

| Option                          | Type                                 | Default                                                                           |
| ------------------------------- | ------------------------------------ | --------------------------------------------------------------------------------- |
| `buttonType`                    | Google's `ButtonType`                | `'buy'`                                                                           |
| `buttonColor`                   | `'default' \| 'black' \| 'white'`    | `'black'`                                                                         |
| `buttonSizeMode`                | `'fill' \| 'static'`                 | `'fill'`                                                                          |
| `buttonRadius`                  | `number`                             | unset — max depends on button height                                              |
| `buttonLocale`                  | ISO 639-1 string                     | browser/OS locale                                                                 |
| `buttonBorderType`              | `'default_border' \| 'no_border'`    | `'default_border'`                                                                |
| `captureBillingAddress`         | `boolean`                            | unset                                                                             |
| `captureShippingAddress`        | `boolean`                            | unset — needs `onShippingAddressChange`                                           |
| `shippingAddressParameters`     | Google's `ShippingAddressParameters` | unset                                                                             |
| `emailRequired`                 | `boolean`                            | unset                                                                             |
| `requireShippingMethod`         | `boolean`                            | unset — needs both shipping callbacks                                             |
| `existingPaymentMethodRequired` | `boolean`                            | `false` — production only; hides the button unless the shopper already has a card |

`buttonType` and `buttonColor` are Google's own unions, so their members follow Google's
documentation rather than Primer's.

### `options.klarna` and `options.adyenKlarna`

| Option                               | Type                                              |
| ------------------------------------ | ------------------------------------------------- |
| `klarna.paymentFlow`                 | `'DEFAULT' \| 'PREFER_VAULT'`                     |
| `klarna.allowedPaymentCategories`    | `('pay_now' \| 'pay_later' \| 'pay_over_time')[]` |
| `klarna.recurringPaymentDescription` | `string`                                          |
| `klarna.buttonOptions.text`          | `string`                                          |
| `adyenKlarna.buttonOptions.text`     | `string`                                          |

Klarna and Adyen Klarna are different payment methods with different types (`KLARNA`,
`ADYEN_KLARNA`) and different option keys. Configuring one does nothing for the other.

## CSS custom properties

Set them on `:root` or `primer-checkout`; they pierce the shadow DOM. `loadPrimer()` injects the
light palette on `:root, primer-checkout` and the dark palette on `primer-checkout.primer-dark-theme`
(also `primer-dialog` and `primer-portal-dialog`).

**Dark mode** is a class on the element, not a set of tokens you write:

```javascript
checkout.classList.add('primer-dark-theme');
```

There is no `primer-light-theme` class — light is the default palette. Re-declaring the dark tokens
by hand is unnecessary and easy to get wrong: the grey ramp is `--primer-color-gray-000`, `-100`,
`-200`, `-300`, `-400`, `-500`, `-600` and `-900`, and nothing else. `--primer-color-gray-800` does
not exist and resolves to nothing.

| Token                       | Default                               |
| --------------------------- | ------------------------------------- |
| `--primer-color-brand`      | `#2f98ff`                             |
| `--primer-color-loader`     | `var(--primer-color-brand)`           |
| `--primer-color-focus`      | `var(--primer-color-brand)`           |
| `--primer-space-base`       | `4px`                                 |
| `--primer-size-base`        | `4px`                                 |
| `--primer-radius-base`      | `4px`                                 |
| `--primer-radius-button`    | falls back to `--primer-radius-small` |
| `--primer-typography-brand` | the system font stack                 |

Other families, each with `small` / `medium` / `large` steps: `--primer-color-text-*`,
`--primer-color-background-{outlined,transparent}-*`, `--primer-color-border-*`,
`--primer-color-icon-*`, `--primer-space-*`, `--primer-size-*`, `--primer-radius-*`,
`--primer-width-*`, `--primer-typography-{title,body,error}-*`, `--primer-animation-{duration,easing}`.
Read the injected stylesheet in the browser's dev tools for the current values.

`--primer-typography-brand: Inter, sans-serif` — unquoted, like any CSS `font-family`.
`'Inter, sans-serif'` in quotes is one family name containing a comma, and matches nothing.

The `custom-styles` attribute takes a JSON string; each camelCase key becomes a kebab-case custom
property (`primerColorBrand` → `--primer-color-brand`). Keys must match `[a-zA-Z][a-zA-Z0-9]*`, so
only token names, and values are checked against `^[\w\s#.,%()\-+/!]+$` — anything else is rejected
with a `Rejected potentially unsafe CSS value` warning. Malformed JSON logs
`Error parsing customStyles property` and applies nothing.

```html
<primer-checkout
  custom-styles='{"primerColorBrand":"#2f98ff","primerRadiusBase":"8px"}'
></primer-checkout>
```

## TypeScript types and third-party type dependencies

Exported as **values**: `loadPrimer`, `injectLoaderStyles`, `injectThemeStyles`, `injectLightTheme`,
`injectDarkTheme`, and every element class (`PrimerCheckoutComponent`, `CardForm`, `PaymentMethod`,
`VaultManager`, …).

Exported as **types only**: `PrimerCheckoutOptions`, `PaymentMethodType`,
`SpecializedPaymentMethodType`, `PaymentSummary`, `PaymentSuccessData`, `PaymentFailureData`,
`PaymentFailureError`, `SdkError`, `SdkErrorOrigin`, `SdkState`, `VaultedPaymentMethodSummary` and
its four variants, `InitializedPaymentMethod`, `PrimerEvents`, `InputValidationError`,
`CardNetwork`, `CardNetworksContextType`, `LocaleCode`, `PrepareHandler`, `VaultAPI`.

`PaymentMethodType` is a union of string literals — `'PAYMENT_CARD'`, `'PAYPAL'`, `'APPLE_PAY'`,
`'GOOGLE_PAY'`, `'KLARNA'`, `'ADYEN_KLARNA'`, `'STRIPE_ACH'`, `'ADYEN_BLIK'` and the rest of the
processor-prefixed set. There is no runtime object to read members off:

```typescript
// WRONG -- a type has no members at runtime, and this is a compile error.
import { PaymentMethodType } from '@primer-io/primer-js';

const enabledPaymentMethods = [PaymentMethodType.PAYMENT_CARD];
```

```typescript
// CORRECT
// add to the top of your file
import type {
  PrimerCheckoutOptions,
  PaymentMethodType,
} from '@primer-io/primer-js';

type PrimerCheckoutEl = HTMLElement & { options: PrimerCheckoutOptions };

const METHODS: PaymentMethodType[] = ['PAYMENT_CARD', 'APPLE_PAY'];

const checkout = document.querySelector('primer-checkout') as PrimerCheckoutEl;
checkout.options = { enabledPaymentMethods: METHODS };
```

`SpecializedPaymentMethodType` is the set with a dedicated component; everything else renders
through the redirect or backend-driven path. Read it from the type rather than keeping a list —
Primer adds methods between releases.

### Third-party types, and the element class trap

`dist/primer-loader.d.ts` imports from `lit`, `@lit/context`, `@lit/task` and `@paypal/paypal-js`,
and references the `google.payments.api` global namespace. **None of them is a declared dependency
of the package** — the runtime is bundled, but the declarations are not, so `npm install
@primer-io/primer-js` installs none of them.

The consequence worth knowing: `PrimerCheckoutComponent` extends `LitElement`, so without `lit`
installed its base type is unresolved and it no longer overlaps with `Element`. Both of these fail:

```typescript
// WRONG -- without `lit` in your dependencies: "Type 'PrimerCheckoutComponent' does not
// satisfy the constraint 'Element'", and the same value cast reports "neither type
// sufficiently overlaps".
import type { PrimerCheckoutComponent } from '@primer-io/primer-js';

const a = document.querySelector<PrimerCheckoutComponent>('primer-checkout');
const b = document.querySelector('primer-checkout') as PrimerCheckoutComponent;
```

Name the surface you actually use instead — `HTMLElement & { options: PrimerCheckoutOptions }` — and
cast event details per listener with `(event as CustomEvent<PaymentSuccessData>).detail`. That needs
nothing but the published package. Add the third-party type packages only for the fields that
require them: `@paypal/paypal-js` for `paypal.style`, `@types/google.payments.api` for
`googlePay.buttonType`, `lit` if you want the element classes themselves. With
`skipLibCheck: true` — the Vite and Next.js TypeScript templates set it — the missing declarations
are silent and the affected fields widen to `any`.

The shipped types also document a `--primer-loader-disabled` CSS custom property as a way to turn
off the pre-init loader. Nothing in the runtime reads it; use the `loader-disabled` attribute.
