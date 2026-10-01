# API reference

Types, state shapes and error ids for Primer's iOS CheckoutComponents. Signatures here are
mirrors — they are not compiled by the gate. Every worked example lives in `SKILL.md` or the other
reference files.

## Contents

- [Entry points](#entry-points)
- [Sessions](#sessions)
- [States](#states)
- [Errors](#errors)
- [What this skill does not cover](#what-this-skill-does-not-cover)

## Entry points

```swift
public struct PrimerCheckout: View {
    public init(
        clientToken: String,
        primerSettings: PrimerSettings = PrimerSettings(),
        primerTheme: PrimerCheckoutTheme = PrimerCheckoutTheme(),
        onCompletion: ((PrimerCheckoutState) -> Void)? = nil
    )
}
```

There is **no `scope:` parameter**. Earlier revisions of this skill documented one; it has never
existed. Custom layouts go through `PrimerCheckoutSession` instead.

```swift
public extension View {
    func primerCheckoutSession(
        _ session: PrimerCheckoutSession,
        theme: PrimerCheckoutTheme? = nil,
        onCompletion: ((PrimerCheckoutState) -> Void)? = nil
    ) -> some View
}
```

`theme` overrides the theme the session was built with and re-applies on every change. Leave it
`nil` to keep the session's own.

For UIKit hosts, `PrimerCheckoutPresenter` has five `presentCheckout` overloads. Three take a
required `from viewController:` — with a client token alone, plus `primerSettings:`, plus
`primerTheme:`. Two find the presenting view controller for you. All are `@MainActor`-isolated.

## Sessions

```swift
@MainActor
public final class PrimerCheckoutSession: ObservableObject {
    public enum Phase: Equatable { case initializing, ready }

    @Published public private(set) var phase: Phase
    @Published public private(set) var clientSession: PrimerClientSession?

    public var onBeforePaymentCreate: BeforePaymentCreateHandler?
    public var idempotencyKey: @Sendable () -> String?

    public init(clientToken: String,
                settings: PrimerSettings = PrimerSettings(),
                theme: PrimerCheckoutTheme = PrimerCheckoutTheme(),
                idempotencyKey: @escaping @Sendable () -> String? = { nil })

    public func start() async
    public func refresh() async
    public func cancel()

    public var cardForm: PrimerCardFormSession?
    public var selection: PrimerSelectionSession?

    public func formatAmount(_ amountInMinorUnits: Int) -> String?
}
```

`phase` carries only lifecycle. Outcomes arrive through the modifier's `onCompletion`, never here.

`clientSession` is the value checkout initialized with. A mid-checkout client-session update —
a surcharge, a billing address — does **not** refresh it; call `refresh()` for that.

`cardForm` and `selection` are non-nil only once `phase == .ready`, and are cached, so the same
instance comes back on each access.

`formatAmount(_:)` formats minor units with the client session's currency and the
`PrimerSettings` locale, as the SDK's own screens do. It returns `nil` before `.ready`.

```swift
@MainActor
public final class PrimerCardFormSession: ObservableObject {
    @Published public private(set) var state: PrimerCardFormState

    public func updateCardNumber(_ value: String)
    public func updateCvv(_ value: String)
    public func updateExpiryDate(_ value: String)
    public func updateCardholderName(_ value: String)
    // plus postal code, country, city, state, address lines, phone, first/last name
    public func selectCardNetwork(_ network: PrimerCardNetwork)
    public func setVaultOnSuccess(_ enabled: Bool) async throws
    public func submit()
    public func cancel()
}
```

There is no public initializer — get one from `PrimerCheckoutSession.cardForm`, or from the slot
closures on `PrimerCardForm`.

```swift
@MainActor
public final class PrimerSelectionSession: ObservableObject {
    @Published public private(set) var state: PrimerPaymentMethodSelectionState

    @Published public private(set) var vaultedPaymentMethods: [PrimerHeadlessUniversalCheckout.VaultedPaymentMethod]

    public func select(_ method: CheckoutPaymentMethod)
    public func selectVaulted(_ method: PrimerHeadlessUniversalCheckout.VaultedPaymentMethod)
    public func delete(_ method: PrimerHeadlessUniversalCheckout.VaultedPaymentMethod) async throws
    public func showAll()
    public func cancel()
}
```

`selectVaulted(_:)` **pays**. It returns at once, and the outcome arrives through `onCompletion`.
If the card needs CVV recapture, the SDK first shows its own CVV screen, and that screen finishes
the payment. There is no public CVV input. Keep the selected row in your own view state.

`vaultedPaymentMethods` is published, so a list built from it re-renders after `delete(_:)` or a
delete on the SDK's saved-methods screen. `delete(_:)` does not ask for confirmation.

Note the vaulted type is namespaced under `PrimerHeadlessUniversalCheckout` — it is shared with the
older headless SDK rather than reintroduced for Components.

## States

```swift
public enum PrimerCheckoutState: Equatable {
    case initializing
    case ready(clientSession: PrimerClientSession)
    case success(PaymentResult)
    case dismissed
    case failure(PrimerError, checkoutData: PrimerCheckoutData? = nil)
}
```

Delivery is not one-shot — see **Handle the outcome** in `SKILL.md`.

```swift
public struct PaymentResult {
    public let paymentId: String
    public let status: PaymentStatus
    public let token: String?
    public let redirectUrl: String?
    public let errorMessage: String?
    public let amount: Int?
    public let currencyCode: String?
    public let paymentMethodType: String?
}
```

`amount` is in minor units and optional; `paymentMethodType` is the wire string, not an enum.

```swift
public struct PrimerCardFormState: Equatable {
    public var isValid: Bool                       // public internal(set)
    public var displayFields: [PrimerInputElementType]
    public func hasError(for fieldType: PrimerInputElementType) -> Bool
    public func errorMessage(for fieldType: PrimerInputElementType) -> String?
}
```

```swift
public struct CheckoutPaymentMethod {
    public let id: String
    public let type: String
    public let name: String
    public let icon: UIImage?
    public let surcharge: Int?
    public let hasUnknownSurcharge: Bool
}
```

`surcharge` is minor units and `nil` when the method carries none; `hasUnknownSurcharge` is a
separate flag, so "no surcharge" and "surcharge not yet known" are distinguishable. Render both.

## Errors

`PrimerError` is a **`public enum`** conforming to `PrimerErrorProtocol`, which refines
`CustomNSError` and `LocalizedError`. Its cases are public, so a test can build one, for example
`PrimerError.invalidClientToken()`. Members you can rely on:

| Member               | Type      | Note                              |
| -------------------- | --------- | --------------------------------- |
| `errorId`            | `String`  | Stable id, safe to switch on      |
| `diagnosticsId`      | `String`  | **Not** optional — no `??` needed |
| `errorDescription`   | `String?` | From `LocalizedError`; logs only  |
| `recoverySuggestion` | `String?` | From `LocalizedError`             |

At the pinned version, the ids are:

`uninitialized-sdk-session`, `invalid-client-token`, `missing-configuration`,
`misconfigured-payment-methods`, `missing-primer-input-element`, `payment-cancelled`,
`failed-to-create-session`, `failed-to-redirect`, `invalid-architecture`,
`invalid-client-session-value`, `invalid-url`, `invalid-merchant-identifier`, `invalid-value`,
`unable-to-make-payments-on-provided-networks`, `unable-to-present-payment-method`,
`unsupported-session-intent`, `unsupported-payment-method-type`,
`unsupported-payment-method-for-manager`, `generic-underlying-errors`, `missing-sdk-dependency`,
`merchant-error`, `payment-failed`, `apple-pay-timed-out`, `failed-to-create-payment`,
`failed-to-resume-payment`, `invalid-vaulted-payment-method-id`, `nol-pay-sdk-error`,
`nol-pay-sdk-init-error`, `klarna-sdk-error`, `klarna-user-not-approved`,
`unable-to-present-apple-pay`, `apple-pay-no-cards-in-wallet`, `apple-pay-device-not-supported`,
`apple-pay-configuration-error`, `apple-pay-presentation-failed`, `failed-to-load-design-tokens`,
`unknown`.

Stripe errors are the exception: `stripeError` returns its own key rather than a fixed id, so treat
any unrecognised value as a `default` case rather than assuming this list is closed.

## What this skill does not cover

Stated so that "unsupported" reads differently from "undocumented":

- **Per-payment-method scopes.** `PrimerApplePayScope`, `PrimerCardFormScope`, `PrimerKlarnaScope`
  and the rest exist in the SDK source but are declared without `public`, so they are not reachable
  from an app. An earlier revision of this skill was built around them.
- **Restyling the Apple Pay button.** `PrimerApplePayState` is internal, and Apple's own brand rules
  bind you regardless.
- **Nol Pay** has public error ids, but CheckoutComponents does not register it, so it never appears.
