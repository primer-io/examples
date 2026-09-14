---
name: primer-android-checkout
description: Accept card and alternative payments in an Android app with Primer's CheckoutComponents SDK, a Jetpack Compose library. Use this skill to take a first card payment, add Google Pay, PayPal, Klarna or iDEAL, theme the checkout, reuse saved cards, gate payment creation with an idempotency key, or handle 3DS and redirect returns. Also use it to migrate onto Components from Primer's Android drop-in or headless SDK, and to debug a checkout that renders blank, shows no payment methods, stays loading, or does nothing on submit.
---

# Primer Android Checkout

## Overview

`io.primer:checkout` (CheckoutComponents) is a Compose-native SDK. Create one controller from a
client token, hand it to `PrimerCheckoutSheet` (a modal bottom sheet owning navigation between
method selection, card form, 3DS and results) or `PrimerCheckoutHost` (your layout, SDK overlays on
top), then observe `controller.state`. There is no listener: every result arrives as a
`PrimerCheckoutState`.

Every stateful piece shares one shape: a `remember*Controller()` giving a `StateFlow` and actions.
SDK composables take `@Composable` slots with working defaults, so you replace one screen or field
and keep the rest.

**SDK status: beta** — the API can change between releases. What ships but is out of scope is
[listed here](references/composable-reference.md#not-covered-here).

Every name starting `your`/`Your` — `yourCartRepository`, `YourPaymentMethodIcon`,
`R.font.your_brand_bold` — is code you write. Everything else resolves from the SDK or AndroidX.

## When to use this skill

- A first card payment; Google Pay, PayPal, Klarna, iDEAL
- Branding the checkout; replacing individual fields and buttons
- Saved cards; idempotency keys on payment creation
- Failures, cancellations, 3DS, redirect returns
- TalkBack labels, and what replacing a slot costs
- [Migrating](#old-patterns-drop-in-and-headless) onto Components from drop-in or headless
- A blank checkout, an empty method list, an inert submit

## Reference files

- [`references/composable-reference.md`](references/composable-reference.md) — import map, every
  signature, default, slot arity and state transition; settings, tokens, error ids,
  accessibility, boundaries
- [`references/compose-patterns.md`](references/compose-patterns.md) — complete screens, theming,
  gating, error recovery, vault, Google Pay, accessibility, troubleshooting by symptom

## Install and initialise

Needs minSdk 24, Kotlin 2.0+ with the Compose Compiler Gradle plugin, and a client token from your
server ([docs](https://primer.io/docs)). R8 rules ship with the SDK. In your checkout module's
`build.gradle.kts`:

```kotlin
plugins {
    id("org.jetbrains.kotlin.plugin.compose") version "<your-kotlin-version>"
}

dependencies {
    implementation("io.primer:checkout:3.0.0-beta.6")

    implementation(platform("androidx.compose:compose-bom:2025.12.00"))
    implementation("androidx.compose.ui:ui")
    // Carries compose-runtime and foundation/foundation-layout transitively (getValue,
    // rememberCoroutineScope, launch, Column, Row, Box, verticalScroll): not optional.
    implementation("androidx.compose.material3:material3")
    // collectAsStateWithLifecycle, used by every example here
    implementation("androidx.lifecycle:lifecycle-runtime-compose:2.9.4")

    // Needed only by patterns in this skill:
    implementation("androidx.lifecycle:lifecycle-viewmodel-compose:2.9.4") // viewModel()
    implementation("androidx.navigation:navigation-compose:2.8.4")
    implementation("androidx.compose.animation:animation")               // AnimatedContent
    implementation("com.google.android.gms:play-services-wallet:19.5.0") // ButtonConstants

    // Payment-method wrappers: `io.primer:checkout` compiles against these and ships none
    // of them, so add one coordinate per method you enable in the Dashboard.
    implementation("io.primer:3ds-android:1.8.0")     // 3DS on card payments
    implementation("io.primer:klarna-android:1.3.0")  // Klarna
    implementation("io.primer:stripe-android:1.1.2")  // STRIPE_ACH
}
```

A green build does not prove the pin resolved: [resolve and print
it](references/compose-patterns.md#verify-installation).

No `material-icons-*` coordinate — frozen upstream, so nothing here uses `Icons.Default.*`.

Packages are deep and split across artifacts — the checkout API under `io.primer.checkout`,
settings and payloads under `io.primer.android`. **Every snippet here opens with its own
`// imports for this snippet` block: copy the block, never assemble one** out of the
[import map](references/composable-reference.md#import-map). That map is complete **for the
snippets here** — Compose, Material 3, lifecycle and Java as well as Primer — and is the authority
each block copies from. It is not a ceiling on what your screen may import: these patterns
_receive_ a `NavController`, so `NavHost`, `composable` and `rememberNavController` are absent
because the graph is yours, not because they are barred.

Two it settles. `by` needs `androidx.compose.runtime.getValue` (plus `setValue` for a `var`).
`Modifier.weight` is a `RowScope` member with no import: importing
`androidx.compose.foundation.layout.weight` hits an `internal` symbol and fails the build. The
do-not-import list names both.

`rememberPrimerCheckoutController` is annotated `@ExperimentalPrimerApi` at opt-in level
`WARNING`: it compiles without opting in, but fails under `allWarningsAsErrors`. Add
`@OptIn(ExperimentalPrimerApi::class)` to the calling function or file.

## Take the first payment

```kotlin
// imports for this snippet
import android.util.Log
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import io.primer.android.core.ExperimentalPrimerApi
import io.primer.checkout.api.checkout.PrimerCheckoutSheet
import io.primer.checkout.api.checkout.rememberPrimerCheckoutController
import io.primer.checkout.api.state.PrimerCheckoutState

@OptIn(ExperimentalPrimerApi::class)
@Composable
fun CheckoutScreen(clientToken: String, onDone: (String) -> Unit) {
    val checkout = rememberPrimerCheckoutController(clientToken = clientToken)
    val state by checkout.state.collectAsStateWithLifecycle()

    // Success sticks on the flow: called from composition, onDone() would
    // re-fire on every recomposition.
    LaunchedEffect(state) {
        when (val s = state) {
            is PrimerCheckoutState.Success -> onDone(s.checkoutData.payment.id)
            is PrimerCheckoutState.Failure -> Log.e("Checkout", s.error.diagnosticsId)
            else -> Unit
        }
    }

    PrimerCheckoutSheet(checkout = checkout)
}
```

For an inline layout use `PrimerCheckoutHost(checkout) { ... }`, building the body from
`PrimerPaymentMethods` and `PrimerCardForm`; it still overlays card form, 3DS and redirects. Create
child controllers _inside_ the host content or a sheet slot, where the theme, settings and overlays
live. [Full screens](references/compose-patterns.md#sheet-vs-host-patterns).

## Handle the outcome

`PrimerCheckoutState` is a sealed interface with six members, observed on `controller.state`; four
carry a payload. Read
[every member and the transitions between them](references/composable-reference.md#state-types).

Handle `Success` and `Failure`. Both are terminal and both **stick** until a new attempt starts; a
retry runs `Loading` → `Ready` → terminal again, so your handler fires once per attempt.
`refresh()` is the only way back into `Loading`.

`formatAmount(amountInCents)` formats minor units in the session currency (`1000` → `"$10.00"`),
reading it from `Ready` only — from every other state, `ClientSessionUpdated` included, it throws
`IllegalArgumentException`. Format while `Ready`, guard the call, keep the string. Nothing returns
to `Ready`, and a card submit passes through `ClientSessionUpdated`, so format updated totals from
that payload yourself
([both rules, reconciled](references/composable-reference.md#when-both-rules-collide-formatamount-and-clientsessionupdated)).

The controller is a ViewModel keyed to the composition, not the token: **a new client token on the
same screen does not rebuild it** — leave and re-enter to start over.

## Configure the session

`PrimerSettings` is one nested constructor — `locale`, `paymentMethodOptions`, `uiOptions`,
`debugOptions` — read once, when `rememberPrimerCheckoutController(clientToken, settings)` first
creates the controller.
[Its shape and every default](references/composable-reference.md#configuration-types);
[settings in context](references/compose-patterns.md#google-pay-integration-pattern).

**Redirect returns need no manifest entry** — the SDK registers
`primer://requestor.<applicationId>/async` itself — and nothing reads
`paymentMethodOptions.redirectScheme` at this version. Two settings do matter, both nested two
levels down and neither a `PrimerSettings` parameter:
`paymentMethodOptions.klarnaOptions.returnIntentUrl` (a `scheme://host` deep link your app handles;
Klarna throws `IllegalArgumentException` without one) and
`paymentMethodOptions.threeDsOptions.threeDsAppRequestorUrl`, which must be `https://` or it is
silently dropped, stranding the shopper in the banking app.

From `PrimerUIOptions`, Components reads only `dismissalMechanism` and `cardFormUIOptions`; the
screen toggles and `theme` are legacy drop-in options. Leave `paymentHandling` on `AUTO`:
Components has no tokenization callback, so `MANUAL` cannot complete and breaks redirect methods.

A missing session field shows up as a method that never appears, not an error: `countryCode`
filters methods, `customerId` allows saving them, `lineItems` is required for Klarna.

## Style it

`PrimerTheme` carries the tokens: colours (light and dark), spacing, radius, size, border width,
typography. Semantic colours are computed from base ones, so overriding one base token updates
every semantic token and the Material 3 `ColorScheme`. Subclass
`LightColorTokens`/`DarkColorTokens`, copy the other `*Tokens` data classes, pass the result as
`theme =` to the sheet or host.

`TypographyStyle.font` has no default: a custom font means rebuilding each style with a `@FontRes`
id off your app's own `R`. Untouched styles keep the SDK's Inter, which lives on the SDK's `R`.
[Token values and the M3 mapping](references/composable-reference.md#theming-types),
[four worked themes](references/compose-patterns.md#theming-patterns).

## Add payment methods

Methods come from the Dashboard and the client session; `controller.select(method)` starts the flow.
Each needs its own settings, and Klarna and Stripe ACH also need their coordinate from the install
snippet — without it the method is dropped from the list, logged as `misconfigured-payment-method`.
[Which method needs what](references/composable-reference.md#payment-methods-and-what-each-needs),
including the two — Klarna and QR code — with no merchant-callable API at all.

Whenever any method carries a non-zero surcharge, `PrimerPaymentMethods` draws its own surcharge
cards and never calls the `method` slot, so a custom row applies only to surcharge-free lists; for
both, build the list from `controller.methods` — whose element type is the only one carrying
`surcharge`; `clientSession.paymentMethod` is a
[different class of the same name](references/composable-reference.md#two-types-called-primerpaymentmethod).
`Surcharge` is a sealed interface, not a number: interpolating it prints a class name. Format its `amount` with `formatAmount`, from `Ready` — and
keep `PrimerPaymentMethods` in a `Ready` branch: its surcharge header formats there too, and
throws elsewhere.

## Customise the form

`PrimerCardForm` takes `cardDetails`, `billingAddress` and `submitButton` slots, and
`CardFormDefaults` supplies every field, so you rearrange without rewriting validation. These three
slots take no lambda parameters; the method-list slots do, with arities that differ —
[the table](references/composable-reference.md#every-slot-and-how-many-parameters-it-takes).
Side-by-side fields use `Modifier.fillMaxWidth(0.5f)` then `Modifier.fillMaxWidth()`, never
`Modifier.weight`. [Four worked layouts](references/compose-patterns.md#custom-card-form-layouts).

The session decides which fields render, so a rearranged layout still shows only what it asks for.
Two field composables ignore that and one is already on screen inside `CardNumberField`
— [which, and what that costs you](references/composable-reference.md#composables-and-defaults).
Replacing a slot also replaces its accessibility labels — the SDK sets them and no public API
overrides them ([what each override costs](references/composable-reference.md#accessibility)).

Drive a custom submit button from `state.isFormValid && !state.isLoading`; the default reads "Pay",
with no amount. `state.fieldErrors` gives string-resource ids, not text — resolve them with
`fieldErrorMessage(error, context)` from
[`SyncValidationError`](references/composable-reference.md#syncvalidationerror), which takes a
`Context` so the same helper works inside and outside composition. `errorId` is programmatic, never
shopper-facing, and `fieldId` is not resolvable here — that section says why.

## Saved payment methods

With a `customerId` on the session, `rememberVaultedPaymentMethodsController(checkout)` exposes
`methods`, `select`, `delete` and `showAll`. `PrimerVaultedPaymentMethods` renders the selected
saved method plus a pay button, nothing when there are none; `select` re-asks for the CVV when
required. `delete` is immediate — no confirmation dialog, and a failed delete surfaces no error, so
confirm in your own UI. To save a card during checkout, call
`cardFormController.setVaultOnSuccess(true)`
([vault-only pattern](references/compose-patterns.md#vault-only-flow-pattern)).

## Gate payment creation

Pass `beforePaymentCreate` to the sheet or host — a one-parameter slot handed a
`PrimerPaymentCreationDecisionHandler` — to pause the SDK just before it creates a payment, then
continue with an optional per-attempt `X-Idempotency-Key`, or abort. The slot's presence is the
opt-in; omit it and the SDK proceeds with no key.
[Worked example](references/compose-patterns.md#gating-payment-creation-idempotency-keys).

Resolve the handler exactly once **per attempt** — a branch that renders nothing leaves the payment
waiting with no timeout, which is why the worked example resolves it from a `LaunchedEffect`. Generate the key inside the
slot: hoisted to screen scope, a retry after a decline collides with the payment that already failed.
[Handler identity and lifetime](references/composable-reference.md#the-beforepaymentcreate-handler).

## Errors and recovery

`Failure` carries a `PrimerError`. Switch on `errorId`; `description` and `recoverySuggestion` are
for logs, not shoppers; `errorCode` is the issuer reason (`"card_declined"`); quote `diagnosticsId`
to Primer support.

`"unauthorized"` and `"failed-to-create-session"` mean the token expired, and `refresh()` reuses that token — mint a new one and re-enter the screen. Inside the
sheet you may need none of this: the default `error` screen already offers Retry (via `refresh()`)
and "try other payment methods"; overriding `error` replaces both.
[Every id and what to do about it](references/composable-reference.md#error-ids),
[recovery screen](references/compose-patterns.md#error-recovery-pattern).

## Troubleshooting

Every symptom this SDK produces, with its cause, in
[symptom to cause](references/compose-patterns.md#troubleshooting-symptom-to-cause) — beside the
logging patterns that confirm it.

## Key guidelines

- Create controllers only through `remember*`, unconditionally, at screen level
- Collect every `StateFlow` with `collectAsStateWithLifecycle()`
- Put navigation, analytics and cart mutation in `LaunchedEffect`, never in composition
- Handle `Success` and `Failure`; end the `when` with `else`
- Set `paymentMethodOptions.klarnaOptions.returnIntentUrl` before Klarna; it throws without one
- Call `formatAmount` only from `Ready`; format `ClientSessionUpdated` totals yourself

<details>
<summary><strong>Old patterns: drop-in and headless</strong></summary>
<a id="old-patterns-drop-in-and-headless"></a>

Components is current; this is for recognising code you are moving away from.

| Legacy                               | Entry point                                                                  | Components equivalent                                            |
| ------------------------------------ | ---------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| Drop-in (`io.primer:android`)        | `Primer.instance.configure`, then `showUniversalCheckout`                    | `rememberPrimerCheckoutController` + `PrimerCheckoutSheet`       |
| Drop-in vault manager                | `Primer.instance.showVaultManager`                                           | `PrimerVaultedPaymentMethods`                                    |
| Headless (`io.primer:headless-core`) | `PrimerHeadlessUniversalCheckout.current.start`, plus listeners and managers | `PrimerCheckoutHost` + `PrimerPaymentMethods` / `PrimerCardForm` |
| Listener callbacks                   | `onCheckoutCompleted`, `onFailed`, …                                         | `PrimerCheckoutState.Success` / `Failure`                        |
| `onBeforePaymentCreated`             | decision handler in a callback                                               | `beforePaymentCreate` slot                                       |

`PrimerSettings` ports as-is; drop-in's screen toggles and `theme` do not.

</details>
