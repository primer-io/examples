# Customising the UI

Slots, defaults and design tokens for Primer's iOS CheckoutComponents.

## Contents

- [How customisation works](#how-customisation-works)
- [The card form](#the-card-form)
- [The payment method list](#the-payment-method-list)
- [Saved payment methods](#saved-payment-methods)
- [Theming](#theming)

## How customisation works

Every composable takes `@ViewBuilder` slots with working defaults. Override the one slot you care
about and the rest keep Primer's rendering — you never have to rebuild a form to move a button.

All of them read their session from the SwiftUI environment, which
`.primerCheckoutSession(_:onCompletion:)` puts there. Without that modifier above them in the view
tree they render nothing, not a crash. That is the usual cause of "the form does not show".

## The card form

```swift
import SwiftUI
import PrimerSDK

struct DefaultForm: View {
    var body: some View {
        PrimerCardForm()
    }
}
```

Three slots, each handed the `PrimerCardFormSession`:

| Slot             | Default                               | Use it to                       |
| ---------------- | ------------------------------------- | ------------------------------- |
| `cardDetails`    | `CardFormDefaults.cardDetails($0)`    | Reorder or wrap the card fields |
| `billingAddress` | `CardFormDefaults.billingAddress($0)` | Hide or relabel billing capture |
| `submitButton`   | `CardFormDefaults.submitButton($0)`   | Your own pay button             |

Compose around the defaults rather than replacing them — the defaults own field formatting,
validation display and network detection:

```swift
import SwiftUI
import PrimerSDK

struct BrandedForm: View {
    var body: some View {
        PrimerCardForm(
            cardDetails: { session in
                VStack(alignment: .leading, spacing: 12) {
                    Text("Card").font(.headline)
                    CardFormDefaults.cardDetails(session)
                }
            },
            submitButton: { session in
                Button("Pay") { session.submit() }
                    .buttonStyle(.borderedProminent)
                    .disabled(!session.state.isValid)
            }
        )
    }
}
```

`state.isValid` is the whole-form flag. For per-field messages use `hasError(for:)` and
`errorMessage(for:)`, both keyed by `PrimerInputElementType`:

```swift
import SwiftUI
import PrimerSDK

struct FieldErrors: View {
    let session: PrimerCardFormSession

    var body: some View {
        VStack(alignment: .leading) {
            if session.state.hasError(for: .cardNumber) {
                Text(session.state.errorMessage(for: .cardNumber) ?? "")
                    .foregroundColor(.red)
            }
        }
    }
}
```

Driving fields yourself is possible — `updateCardNumber`, `updateCvv` and the rest are public — but
you then own formatting and masking, which the defaults do for you.

## The payment method list

```swift
import SwiftUI
import PrimerSDK

struct Methods: View {
    var body: some View {
        PrimerPaymentMethods()
    }
}
```

| Slot         | Handed                                | Default                                           |
| ------------ | ------------------------------------- | ------------------------------------------------- |
| `header`     | `PrimerSelectionSession`              | `PaymentMethodsDefaults.header($0)`               |
| `method`     | `CheckoutPaymentMethod`, `() -> Void` | `PaymentMethodsDefaults.method($0, onSelect: $1)` |
| `emptyState` | `PrimerSelectionSession`              | `PaymentMethodsDefaults.emptyState($0)`           |

The `method` slot is handed the selection callback as its second argument — a shortcut for
`session.select(method)`:

```swift
import SwiftUI
import PrimerSDK

struct CustomRows: View {
    @ObservedObject var session: PrimerCheckoutSession  // the one passed to .primerCheckoutSession

    var body: some View {
        PrimerPaymentMethods(method: { method, onSelect in
            Button(action: onSelect) {
                HStack {
                    Text(method.name)
                    Spacer()
                    if let surcharge = method.surcharge {
                        Text("+\(session.formatAmount(surcharge) ?? "")")
                    } else if method.hasUnknownSurcharge {
                        Text("+…")
                    }
                }
            }
        })
    }
}
```

`surcharge` is minor units, so format it with `formatAmount(_:)` rather than printing the number.
`hasUnknownSurcharge` is a separate flag — render it, or a shopper sees no surcharge where one will
be applied.

## Saved payment methods

```swift
import SwiftUI
import PrimerSDK

struct Saved: View {
    var body: some View {
        PrimerVaultedPaymentMethods()
    }
}
```

It renders the **selected** saved method only — the first one until the customer picks another — and
nothing at all when there are none. The default header's "Show all" opens the SDK's saved-methods
screen, where the customer can switch or delete. The list is empty unless the client session
carries a customer id.

Three slots, each type-erased — wrap what you return in `AnyView`:

| Slot           | Handed                               | Does                                 |
| -------------- | ------------------------------------ | ------------------------------------ |
| `header`       | `PrimerSelectionSession`             | Title and the "Show all" link        |
| `item`         | the method, `isSelected`, `onSelect` | `onSelect` **marks** the row; no pay |
| `submitButton` | `isLoading`, `isEnabled`, `onSubmit` | `onSubmit` **pays**                  |

Calling `onSubmit` is the same as calling `selectVaulted(_:)` on the selected method. A card that
needs CVV recapture gets the SDK's own CVV screen at that point, so no slot has to make room for a
CVV field. For your own list with a pay button, see **Saved payment methods** in `SKILL.md`.

Deleting is `async throws` on the selection session. It does not ask the customer to confirm, so
put your own confirmation in front of this call:

```swift
import PrimerSDK

@MainActor
func removeFirstSavedMethod(_ session: PrimerSelectionSession) async throws {
    guard let first = session.vaultedPaymentMethods.first else { return }
    try await session.delete(first)
}
```

## Theming

`PrimerCheckoutTheme` overrides design tokens. Every group is optional and every token inside it is
optional, so you override only what you want:

```swift
import SwiftUI
import PrimerSDK

let theme = PrimerCheckoutTheme(
    colors: ColorOverrides(primerColorBrand: .purple),
    radius: RadiusOverrides(primerRadiusMedium: 12),
    borderWidth: BorderWidthOverrides(primerBorderWidthThin: 1.5)
)
```

| Group         | Type                   | Covers                                                                                        |
| ------------- | ---------------------- | --------------------------------------------------------------------------------------------- |
| `colors`      | `ColorOverrides`       | Brand, the grey ramp, background, text, border, icon, focus and loader colours                |
| `radius`      | `RadiusOverrides`      | `primerRadiusXsmall` … `primerRadiusLarge`, plus `primerRadiusBase`                           |
| `spacing`     | `SpacingOverrides`     | `primerSpaceXxsmall` … `primerSpaceXxlarge`, plus `primerSpaceBase`                           |
| `sizes`       | `SizeOverrides`        | `primerSizeSmall` … `primerSizeXxxlarge`, plus `primerSizeBase`                               |
| `typography`  | `TypographyOverrides`  | `titleXlarge`, `titleLarge`, `bodyLarge`, `bodyMedium`, `bodySmall`, each a `TypographyStyle` |
| `borderWidth` | `BorderWidthOverrides` | `primerBorderWidthThin`, `primerBorderWidthMedium`, `primerBorderWidthThick`                  |

A `TypographyStyle` takes `font` (a family name), `size`, `weight`, `letterSpacing` and
`lineHeight`. `weight` is a SwiftUI `Font.Weight`, so it takes `.semibold`, not a number.

### Dark mode

There is no separate dark palette. `colors` applies in light and dark mode alike, on top of
Primer's own dark tokens. A colour you set is therefore used in both modes: pick one that works on
both backgrounds, or leave it unset so Primer's own light and dark values apply.

To give dark mode its own colours inline, pass a theme that follows the colour scheme to the
modifier's `theme:`. The modifier re-applies the theme whenever the value changes, and a new
session is not needed:

```swift
import SwiftUI
import PrimerSDK

struct AdaptiveCheckout: View {
    @StateObject private var session: PrimerCheckoutSession
    @Environment(\.colorScheme) private var colorScheme

    init(clientToken: String) {
        _session = StateObject(wrappedValue: PrimerCheckoutSession(clientToken: clientToken))
    }

    private var theme: PrimerCheckoutTheme {
        PrimerCheckoutTheme(colors: ColorOverrides(
            primerColorBrand: colorScheme == .dark ? .mint : .indigo
        ))
    }

    var body: some View {
        ScrollView {
            PrimerCardForm()
        }
        .primerCheckoutSession(session, theme: theme)
    }
}
```

`PrimerCheckout` reads its `primerTheme` once, when it starts. It does not pick up a new theme
while it is on screen. To fix the checkout to one mode instead, set `appearanceMode`:

```swift
import PrimerSDK

let lightOnly = PrimerSettings(
    uiOptions: PrimerUIOptions(appearanceMode: .light)
)
```

A theme can also go on the session, where it applies until the modifier's `theme:` overrides it:

```swift
import PrimerSDK

@MainActor
func themedSession(clientToken: String, theme: PrimerCheckoutTheme) -> PrimerCheckoutSession {
    PrimerCheckoutSession(clientToken: clientToken, theme: theme)
}
```
