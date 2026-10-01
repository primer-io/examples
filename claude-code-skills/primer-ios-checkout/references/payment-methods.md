# Payment methods

What each method needs on the client, beyond being enabled on the client session.

## Contents

- [The rule](#the-rule)
- [What each method needs](#what-each-method-needs)
- [The redirect scheme](#the-redirect-scheme)
- [Apple Pay](#apple-pay)
- [Klarna](#klarna)
- [3DS](#3ds)
- [Stripe ACH](#stripe-ach)

## The rule

Which payment methods appear is decided by the **client session** your backend creates, not by your
app. Enabling iDEAL in the Dashboard makes it appear with no client change.

What your app owns is the setup a method cannot work without: a URL scheme to come back to, a
merchant identifier, a publishable key. Miss one and the method either does not appear or fails at
the point the shopper commits — which is why these belong in your first integration, not a later
pass.

Everything here goes in `PrimerSettings.paymentMethodOptions`.

## What each method needs

| Method                   | Needs                                                                                | Fails how, if missing                             |
| ------------------------ | ------------------------------------------------------------------------------------ | ------------------------------------------------- |
| Card                     | —                                                                                    |                                                   |
| Apple Pay                | `applePayOptions` with a merchant identifier, plus the Apple Pay capability          | Listed; `invalid-merchant-identifier` when tapped |
| PayPal                   | `urlScheme`                                                                          | `invalid-value` before the browser opens          |
| Klarna                   | The `PrimerKlarnaSDK` pod; `urlScheme` is optional                                   | Not listed                                        |
| Adyen Klarna             | `urlScheme`                                                                          | `invalid-value` after the payment is created      |
| iDEAL, Twint             | `urlScheme`                                                                          | `invalid-value` when the shopper picks it         |
| BLIK, MBWay, QR-code     | — (`urlScheme` is forwarded if set)                                                  |                                                   |
| Stripe ACH               | `stripeOptions` (publishable key, `mandateData`), `urlScheme`, `PrimerStripeSDK` pod | Listed; fails once the shopper starts paying      |
| Any card method with 3DS | `threeDsOptions` for the out-of-band app return                                      | 3DS continues without that return                 |

## The redirect scheme

One value covers every redirect method:

```swift
import PrimerSDK

let settings = PrimerSettings(
    paymentMethodOptions: PrimerPaymentMethodOptions(urlScheme: "myapp://checkout")
)
```

Register the same scheme in your `Info.plist`:

```xml
<key>CFBundleURLTypes</key>
<array>
  <dict>
    <key>CFBundleURLSchemes</key>
    <array><string>myapp</string></array>
  </dict>
</array>
```

Two things to know. The SDK validates only that the string parses as a URL, and only _warns_ when it
does not — so a typo surfaces as `invalid-value` when the shopper picks the method, not as a startup
error. And the scheme is `nil` by default, so the day a redirect method is enabled in the Dashboard,
that method fails while cards keep working, with no app change to blame.

## Apple Pay

```swift
import PrimerSDK

let settings = PrimerSettings(
    paymentMethodOptions: PrimerPaymentMethodOptions(
        applePayOptions: PrimerApplePayOptions(
            merchantIdentifier: "merchant.com.example.yourapp",
            merchantName: "Your Store"
        )
    )
)
```

`merchantIdentifier` and `merchantName` are both required positionally — `merchantName` is
`String?`, so pass `nil` explicitly rather than omitting it.

The identifier must match one on your Apple Developer account, and the Apple Pay capability must be
on the target. `checkProvidedNetworks` defaults to `true`. `showApplePayForUnsupportedDevice` has no
effect here: Apple Pay is listed whenever it is enabled.

Apple's Human Interface Guidelines bind the button's appearance whatever the compiler allows, and
the SDK's own Apple Pay button state is internal, so use the button Primer renders.

## Klarna

Klarna runs in the Klarna SDK inside your app, so it needs the `PrimerKlarnaSDK` pod next to
`PrimerSDK`; without it Klarna is not listed. `urlScheme` is optional for it, but required for Adyen
Klarna. `klarnaOptions` has no effect: CheckoutComponents always runs Klarna as a one-off payment.

## 3DS

3DS runs inside the checkout with no code from you, and it does not read `urlScheme`. For the return
from an out-of-band challenge, `threeDsOptions` sets the requestor URL:

```swift
import PrimerSDK

let settings = PrimerSettings(
    paymentMethodOptions: PrimerPaymentMethodOptions(
        urlScheme: "myapp://checkout",
        threeDsOptions: PrimerThreeDsOptions(
            threeDsAppRequestorUrl: "https://example.com/3ds-return"
        )
    )
)
```

`threeDsAppRequestorUrl` is optional and defaults to `nil`; when set it should be an `https` URL, not
your custom scheme.

## Stripe ACH

```swift
import PrimerSDK

let settings = PrimerSettings(
    paymentMethodOptions: PrimerPaymentMethodOptions(
        urlScheme: "myapp://checkout",
        stripeOptions: PrimerStripeOptions(
            publishableKey: "pk_live_...",
            mandateData: .templateMandate(merchantName: "Your Store")
        )
    )
)
```

ACH also needs the `PrimerStripeSDK` pod. Without it, or without `mandateData`, the method is listed
and fails once the shopper starts paying.

Stripe errors do not use the fixed `errorId` list — `stripeError` carries its own key through, so
handle unrecognised ids in a `default` branch.
