---
name: primer-ios-checkout
description: Accept card and alternative payments in a SwiftUI or UIKit iOS app with Primer's CheckoutComponents SDK (PrimerSDK). Use this skill to take a first card payment, add Apple Pay, PayPal, Klarna or iDEAL, theme the checkout, reuse saved cards, gate payment creation with an idempotency key, or handle 3DS and redirect returns. Also use it to migrate onto Components from Primer's iOS drop-in or headless SDK, and to debug a checkout that renders blank, shows no payment methods, stays loading, or does nothing on submit.
---

# Primer iOS Checkout

## Overview

Primer's CheckoutComponents SDK renders a payment sheet from a **client session** your backend
creates. You hand it a **client token**; it shows the payment methods your Primer Dashboard has
enabled, collects the details, runs 3DS and redirects, and hands back a terminal state. You never
touch card data.

Two ways in, same session underneath:

- **`PrimerCheckout`** — a SwiftUI view that renders the whole flow. Start here.
- **`PrimerCheckoutSession`** plus the `.primerCheckoutSession(_:)` modifier — the same checkout,
  driven by you, so Primer's field views sit inside your own layout.

Components needs **iOS 15+**. The package and the pod both declare iOS 15.0, so your app target
must too.

## When to use this skill

Taking a first payment on iOS; adding Apple Pay, PayPal, Klarna or a redirect method; theming the
sheet; reusing a saved card; attaching an idempotency key; handling a 3DS or redirect return; a
checkout that renders blank or does nothing on submit; migrating off the drop-in or headless SDK.

Creating the client session, enabling methods, and API keys are backend and Dashboard jobs — see
[Primer's documentation](https://primer.io/docs). This skill starts at the client token.

## Reference files

- [`references/payment-methods.md`](references/payment-methods.md) — per-method setup: what each
  needs beyond being enabled, the redirect scheme, Apple Pay's merchant identifier, 3DS.
- [`references/customising-the-ui.md`](references/customising-the-ui.md) — the slots on each
  composable, `CardFormDefaults`, theming tokens, field-level control.
- [`references/api-reference.md`](references/api-reference.md) — session types, state shapes, the
  error id list.

## Install and initialise

Swift Package Manager:

```swift
// Package.swift
.package(url: "https://github.com/primer-io/primer-sdk-ios", exact: "3.0.0-beta.8")
```

CocoaPods:

```ruby
pod 'PrimerSDK', '3.0.0-beta.8'
```

Klarna (`KLARNA`) and Stripe ACH need their own pods, `PrimerKlarnaSDK` and `PrimerStripeSDK`, in
the same target; the Swift package includes neither. Without them Klarna is not listed and Stripe
ACH fails with `missing-sdk-dependency`.

One import gives you everything in this skill:

```swift
import PrimerSDK
```

Fetch a client token from your backend. It expires, so fetch it per checkout rather than caching it.

## Take the first payment

`PrimerCheckout` is the whole flow — payment method list, card form, 3DS, redirects:

```swift
import SwiftUI
import PrimerSDK

struct CheckoutScreen: View {
    let clientToken: String

    var body: some View {
        PrimerCheckout(clientToken: clientToken) { state in
            switch state {
            case .success(let result):
                print("paid: \(result.paymentId)")
            case let .failure(error, _):
                print("failed: \(error.errorId)")
            case .dismissed:
                print("shopper dismissed")
            default:
                break
            }
        }
    }
}
```

That is a complete integration. Everything below changes how it looks or what it does.

## Handle the outcome

`PrimerCheckoutState` has five cases: `.initializing`, `.ready(clientSession:)`, `.success(PaymentResult)`,
`.failure(PrimerError, checkoutData: PrimerCheckoutData?)` and `.dismissed`.

**`onCompletion` does not fire exactly once.** The SDK latches success and dismissal but deliberately
does not latch a post-`ready` failure:

| When                                   | Delivery                                                                                                                         |
| -------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `.failure` before the session is ready | `PrimerCheckout`: once per failed attempt, as its error screen offers Retry. `PrimerCheckoutSession`: once; the session is over. |
| `.failure` after it is ready           | **Once per failed attempt.** The SDK shows its own retry, so the shopper may try again and you will hear another outcome.        |
| `.success` / `.dismissed`              | Exactly once. Nothing is delivered afterwards.                                                                                   |

So navigate away on `.success` and `.dismissed`; on `.failure`, show the error and stay put.

## Configure the session

`PrimerSettings` carries everything you configure up front:

```swift
import PrimerSDK

let settings = PrimerSettings(
    paymentMethodOptions: PrimerPaymentMethodOptions(
        urlScheme: "myapp://checkout"
    )
)
```

**`urlScheme` is required for PayPal, iDEAL, Twint and other web redirects, Adyen Klarna and
Stripe ACH** — they need it to come back to your app. 3DS does not read it. Register the same scheme
in your Info.plist under `CFBundleURLSchemes`. Nothing checks it at startup — a malformed value only
logs a warning — so a missing scheme fails with `invalid-value` when the shopper picks the method.

Pass settings wherever you create the checkout:

```swift
import SwiftUI
import PrimerSDK

struct ConfiguredCheckout: View {
    let clientToken: String
    let settings: PrimerSettings

    var body: some View {
        PrimerCheckout(clientToken: clientToken, primerSettings: settings)
    }
}
```

## Style it

`PrimerCheckoutTheme` overrides design tokens; everything you leave out keeps Primer's default.

```swift
import SwiftUI
import PrimerSDK

struct ThemedCheckout: View {
    let clientToken: String

    var body: some View {
        PrimerCheckout(clientToken: clientToken, primerTheme: PrimerCheckoutTheme())
    }
}
```

Token groups and what each one reaches are in
[`references/customising-the-ui.md`](references/customising-the-ui.md).

## Add payment methods

Payment methods come from the client session — enabling one is a Dashboard and backend job, and it
then appears in the sheet with no client change. What varies is the **extra client-side setup** a
method needs. See [`references/payment-methods.md`](references/payment-methods.md) for the table;
the short version is that Apple Pay needs a merchant identifier in `PrimerApplePayOptions`, and
every redirect method needs `urlScheme`.

## Customise the form

To put Primer's fields inside your own layout, drive the session yourself. The modifier wires it
into the environment and starts it; the composables read it from there.

```swift
import SwiftUI
import PrimerSDK

struct InlineCheckout: View {
    @StateObject private var session: PrimerCheckoutSession

    init(clientToken: String) {
        _session = StateObject(wrappedValue: PrimerCheckoutSession(clientToken: clientToken))
    }

    var body: some View {
        ScrollView {
            if let total = session.clientSession?.totalAmount,
               let formatted = session.formatAmount(total) {
                Text("Total \(formatted)")
            }
            PrimerCardForm()
        }
        .primerCheckoutSession(session) { state in
            if case .success = state { print("paid") }
        }
    }
}
```

`formatAmount(_:)` prints minor units the way the SDK's own screens do — the client session's
currency and decimal digits, in the `PrimerSettings` locale. Use it rather than dividing by 100:
some currencies have no decimal digits and some have three. It returns `nil` until the session is
ready.

The modifier also takes `theme:`, which overrides the session's theme and re-applies whenever the
value changes — see [`references/customising-the-ui.md`](references/customising-the-ui.md#theming).

`PrimerCardForm` takes three slots — `cardDetails`, `billingAddress`, `submitButton` — each handed
the `PrimerCardFormSession`. Compose around `CardFormDefaults` rather than rebuilding fields:

```swift
import SwiftUI
import PrimerSDK

struct CustomSubmit: View {
    var body: some View {
        PrimerCardForm(submitButton: { session in
            Button("Pay now") { session.submit() }
                .disabled(!session.state.isValid)
        })
    }
}
```

## Saved payment methods

`PrimerVaultedPaymentMethods` renders cards the customer has saved. It needs a customer id on the
client session, or the list is empty. To save a card, the client session also needs `vaultOnSuccess`:
set it on the backend, or call `session.cardForm?.setVaultOnSuccess(_:)` from your own toggle.

```swift
import SwiftUI
import PrimerSDK

struct SavedCards: View {
    var body: some View {
        PrimerVaultedPaymentMethods()
    }
}
```

Its row tap only marks a method; its pay button pays. To build your own list, iterate
`vaultedPaymentMethods` on the selection session and keep the highlight in your own state.
`selectVaulted(_:)` **pays**, so call it from your pay button, never from a row tap:

```swift
import SwiftUI
import PrimerSDK

struct SavedCardPicker: View {
    @ObservedObject var selection: PrimerSelectionSession  // from PrimerCheckoutSession.selection
    @State private var chosenId: String?

    var body: some View {
        VStack {
            ForEach(selection.vaultedPaymentMethods, id: \.id) { method in
                Button("\(method.paymentMethodType) \(method.paymentInstrumentData.last4Digits ?? "")") {
                    chosenId = method.id
                }
            }
            Button("Pay") {
                if let method = selection.vaultedPaymentMethods.first(where: { $0.id == chosenId }) {
                    selection.selectVaulted(method)
                }
            }
            .disabled(chosenId == nil)
        }
    }
}
```

When the card needs its CVV again, the SDK opens its own CVV screen first, and that screen
finishes the payment. You do not build a CVV field. The outcome arrives through `onCompletion`.
`vaultedPaymentMethods` is published, so the list re-renders after a delete.

## Gate payment creation

`onBeforePaymentCreate` runs just before the SDK creates the payment — the place for a last-minute
check. For the common case of only supplying an idempotency key, use `idempotencyKey`, which is
invoked once per attempt:

```swift
import PrimerSDK

@MainActor
func makeSession(clientToken: String, orderId: String) -> PrimerCheckoutSession {
    PrimerCheckoutSession(
        clientToken: clientToken,
        idempotencyKey: { "order-\(orderId)" }
    )
}
```

With `onBeforePaymentCreate` set, the key in its decision wins; `idempotencyKey` is used only when
the decision has none. Both can be assigned after the session is ready and still apply to the next
attempt.

## Errors and recovery

`.failure` carries a `PrimerError` — a Swift `enum`, not a struct, conforming to `LocalizedError`.
Switch on `errorId` (a `String`), show `errorDescription` to nobody but your logs, and give support
`diagnosticsId`, which is **not** optional:

```swift
import PrimerSDK

func report(_ error: PrimerError) {
    switch error.errorId {
    case "invalid-client-token":
        print("token expired — fetch a fresh one")
    case "payment-cancelled":
        break
    default:
        print("\(error.errorId) / \(error.diagnosticsId)")
    }
}
```

The full id list is in [`references/api-reference.md`](references/api-reference.md).

## Troubleshooting

**Checkout renders blank.** It failed to start, often on an expired client token, and `onCompletion`
got the `.failure`. `PrimerCheckout` shows an error screen unless `isErrorScreenEnabled` is false.

**No payment methods appear.** They are enabled per client session, not per app — check the session
your backend created. With none left, the checkout fails with `missing-configuration`.

**The form does not render.** `PrimerCardForm` renders `CardFormDefaults.unavailable()`, an empty
view, when no session is in the environment. Inline composables need `.primerCheckoutSession(_:)`
applied above them.

**PayPal or iDEAL fails with `invalid-value`.** `urlScheme` is unset or not a valid URL. If the
shopper leaves for another app and never returns, the scheme is not registered in Info.plist.

**A decline leaves the sheet open.** Expected — see [Handle the outcome](#handle-the-outcome).

## Key guidelines

- Fetch a client token per checkout; never cache one.
- Set `urlScheme` if you use any redirect method.
- Navigate on `.success` and `.dismissed`, never on `.failure`.
- Compose around `CardFormDefaults` rather than rebuilding fields.
- Keep the session in `@StateObject`, not `@State`.
- Call `selectVaulted(_:)` from a pay button; it pays.

## Old patterns

<details>
<summary>The iOS drop-in and headless SDKs</summary>

Primer's earlier iOS integrations still ship in the same pod.

**Drop-in (`Primer.shared.showUniversalCheckout` with `PrimerDelegate`)** — replaced by
`PrimerCheckout`, which renders the same flow as a SwiftUI view.

**Headless (`PrimerHeadlessUniversalCheckout`)** — replaced by `PrimerCheckoutSession` plus the
composables, which give the same control without managing tokenization yourself.

Migrating: the client token is unchanged, so the swap is the entry point and the outcome handler.
Replace the delegate with `onCompletion`, and read
[Handle the outcome](#handle-the-outcome) first — `onCompletion` hears every failed attempt.

`PrimerCheckoutPresenter` bridges Components into UIKit if you are not on SwiftUI yet:
`PrimerCheckoutPresenter.presentCheckout(clientToken:)`, called on the main actor. It reports to
`PrimerCheckoutPresenter.shared.delegate`, a `PrimerCheckoutPresenterDelegate`:
`primerCheckoutPresenterDidFailWithError(_:checkoutData:)` once per failed attempt, then
`primerCheckoutPresenterDidCompleteWithSuccess(_:)` or `primerCheckoutPresenterDidDismiss()` once.

</details>
