---
name: primer-ios-checkout
description: Build checkout and payment experiences using Primer's iOS CheckoutComponents SDK. Use this skill when implementing payment flows, checkout screens, card forms, or integrating Primer SDK into SwiftUI or UIKit applications. Covers scope-based architecture, state management, theming, and all payment method scope APIs.
---

# Primer iOS Checkout

## Overview

This skill provides comprehensive guidance for building checkout and payment experiences using Primer's iOS CheckoutComponents SDK (`PrimerSDK`). CheckoutComponents is a SwiftUI-first, scope-based checkout system that requires iOS 15.0+ and Swift 6.0+.

Use this skill when:

- Implementing checkout pages or payment flows in iOS apps
- Integrating Primer payment methods (cards, Apple Pay, PayPal, Klarna, ACH, etc.)
- Building custom card forms with field-level control and validation
- Working with SwiftUI NavigationStack, sheets, or full-screen covers
- Customizing payment UI with design token theming
- Handling payment lifecycle state via AsyncStream
- Using UIKit with PrimerCheckoutPresenter
- Implementing vaulted (saved) payment methods

Key architectural concepts:

- **Scope-based design**: Every part of the checkout is a typed protocol (scope) exposing state, actions, and customization points
- **AsyncStream state**: All state changes flow through Swift's `AsyncStream<State>` — no delegates, no Combine
- **SwiftUI-first**: `PrimerCheckout` is a standard SwiftUI `View`; UIKit uses `PrimerCheckoutPresenter`
- **Design token theming**: Override colors, spacing, radius, typography, and border width via `PrimerCheckoutTheme`

## Quick Start Guide

### Installation

**CocoaPods:**

```ruby
# Podfile
pod 'PrimerSDK'
```

```bash
pod install --repo-update
```

**Swift Package Manager:**

1. In Xcode: File > Add Package Dependencies
2. Enter: `https://github.com/nickkjordan/primer-sdk-ios` (or the Primer SDK repository URL)
3. Select version and add to your target

### Minimal SwiftUI Integration

```swift
import PrimerSDK
import SwiftUI

struct CheckoutView: View {
    let clientToken: String

    var body: some View {
        PrimerCheckout(clientToken: clientToken)
    }
}
```

### Minimal SwiftUI with Completion Handling

```swift
import PrimerSDK
import SwiftUI

private let primerSettings = PrimerSettings(paymentHandling: .auto)

struct CheckoutView: View {
    let clientToken: String
    @State private var paymentCompleted = false
    @State private var paymentResult: PaymentResult?

    var body: some View {
        if paymentCompleted, let result = paymentResult {
            ConfirmationView(result: result)
        } else {
            PrimerCheckout(
                clientToken: clientToken,
                primerSettings: primerSettings,
                onCompletion: { state in
                    switch state {
                    case .success(let result):
                        paymentResult = result
                        paymentCompleted = true
                    case .failure(let error):
                        print("Payment failed: \(error.errorId)")
                    case .dismissed:
                        break
                    default:
                        break
                    }
                }
            )
        }
    }
}
```

### Minimal UIKit Integration

```swift
import PrimerSDK
import UIKit

class CheckoutViewController: UIViewController, PrimerCheckoutPresenterDelegate {

    func showCheckout() {
        PrimerCheckoutPresenter.shared.delegate = self

        PrimerCheckoutPresenter.presentCheckout(
            clientToken: clientToken,
            from: self,
            primerSettings: PrimerSettings(paymentHandling: .auto),
            primerTheme: PrimerCheckoutTheme()
        )
    }

    // MARK: - PrimerCheckoutPresenterDelegate

    func primerCheckoutPresenterDidCompleteWithSuccess(_ result: PaymentResult) {
        let confirmationVC = ConfirmationViewController(result: result)
        navigationController?.pushViewController(confirmationVC, animated: true)
    }

    func primerCheckoutPresenterDidFailWithError(_ error: PrimerError) {
        print("Payment failed: \(error.errorId)")
    }

    func primerCheckoutPresenterDidDismiss() {
        print("Checkout dismissed")
    }
}
```

## Architecture: Scope-Based Design

### Scope Hierarchy

```
PrimerCheckout (SwiftUI View)
  └── PrimerCheckoutScope (top-level protocol)
        ├── state: AsyncStream<PrimerCheckoutState>
        ├── paymentMethodSelection: PrimerPaymentMethodSelectionScope
        │     ├── state: AsyncStream<PrimerPaymentMethodSelectionState>
        │     └── (customization: screen, paymentMethodItem, categoryHeader, emptyStateView)
        └── getPaymentMethodScope() → payment method scopes:
              ├── PrimerCardFormScope (cards)
              │     ├── selectCountry: PrimerSelectCountryScope
              │     └── (field configs, ViewBuilder fields, submit/cancel)
              ├── PrimerApplePayScope (Apple Pay)
              ├── PrimerPayPalScope (PayPal)
              ├── PrimerKlarnaScope (Klarna — multi-step)
              ├── PrimerAchScope (ACH — multi-step)
              ├── PrimerWebRedirectScope (Twint, etc.)
              ├── PrimerFormRedirectScope (BLIK, MBWay)
              └── PrimerQRCodeScope (PromptPay, Xfers)
```

### Accessing Scopes

Scopes are accessed via the `scope` closure on `PrimerCheckout`:

```swift
PrimerCheckout(
    clientToken: clientToken,
    scope: { checkoutScope in
        // Direct access to payment method selection
        let selection = checkoutScope.paymentMethodSelection

        // Access payment method scopes by protocol type
        let cardScope: PrimerCardFormScope? = checkoutScope.getPaymentMethodScope(PrimerCardFormScope.self)

        // Access by payment method type enum
        let applePayScope: PrimerApplePayScope? = checkoutScope.getPaymentMethodScope(for: .applePay)

        // Access by payment method type string
        let paypalScope: PrimerPayPalScope? = checkoutScope.getPaymentMethodScope(for: "PAYPAL")
    }
)
```

**IMPORTANT:** `getPaymentMethodScope()` returns `nil` until the checkout reaches `.ready` state. Always observe `checkoutScope.state` first:

```swift
scope: { checkoutScope in
    Task {
        for await state in checkoutScope.state {
            if case .ready = state {
                // Safe to access scopes now
                if let cardScope = checkoutScope.getPaymentMethodScope(PrimerCardFormScope.self) {
                    // Configure card form
                }
            }
        }
    }
}
```

### Base Protocol: PrimerPaymentMethodScope

All payment method scopes conform to this protocol:

```swift
@MainActor
protocol PrimerPaymentMethodScope: AnyObject {
    associatedtype State: Equatable

    var state: AsyncStream<State> { get }
    var presentationContext: PresentationContext { get }   // default: .fromPaymentSelection
    var dismissalMechanism: [DismissalMechanism] { get }  // default: []

    func start()
    func submit()
    func cancel()
    func onBack()
    func onDismiss()
}
```

## PrimerCheckout View

### Declaration

```swift
@available(iOS 15.0, *)
public struct PrimerCheckout: View
```

### Initializer

```swift
PrimerCheckout(
    clientToken: String,
    primerSettings: PrimerSettings = PrimerSettings(),
    primerTheme: PrimerCheckoutTheme = PrimerCheckoutTheme(),
    scope: ((PrimerCheckoutScope) -> Void)? = nil,
    onCompletion: ((PrimerCheckoutState) -> Void)? = nil
)
```

### Parameters

| Parameter        | Type                               | Default                 | Description                                |
| ---------------- | ---------------------------------- | ----------------------- | ------------------------------------------ |
| `clientToken`    | `String`                           | Required                | Token from the Client Session endpoint     |
| `primerSettings` | `PrimerSettings`                   | `PrimerSettings()`      | SDK behavior configuration                 |
| `primerTheme`    | `PrimerCheckoutTheme`              | `PrimerCheckoutTheme()` | Design token overrides                     |
| `scope`          | `((PrimerCheckoutScope) -> Void)?` | `nil`                   | Closure providing access to checkout scope |
| `onCompletion`   | `((PrimerCheckoutState) -> Void)?` | `nil`                   | Callback for terminal checkout states      |

### PrimerCheckoutScope Properties and Methods

```swift
@MainActor
public protocol PrimerCheckoutScope: AnyObject
```

**Properties:**

| Property                 | Type                                | Description                      |
| ------------------------ | ----------------------------------- | -------------------------------- |
| `state`                  | `AsyncStream<PrimerCheckoutState>`  | Stream of checkout state changes |
| `paymentMethodSelection` | `PrimerPaymentMethodSelectionScope` | Payment method selection scope   |
| `paymentHandling`        | `PrimerPaymentHandling`             | Current payment handling mode    |

**Customization Properties:**

| Property       | Type                  | Description                                             |
| -------------- | --------------------- | ------------------------------------------------------- |
| `container`    | `ContainerComponent?` | Wraps all checkout content. Receives a content closure. |
| `splashScreen` | `Component?`          | Shown during initialization                             |
| `loading`      | `Component?`          | Shown during payment processing                         |
| `errorScreen`  | `ErrorComponent?`     | Shown on error. Receives error message.                 |

**Methods:**

| Method                  | Signature                                                                                                | Description                       |
| ----------------------- | -------------------------------------------------------------------------------------------------------- | --------------------------------- |
| `getPaymentMethodScope` | `func getPaymentMethodScope<T: PrimerPaymentMethodScope>(_ scopeType: T.Type) -> T?`                     | Get scope by protocol type        |
| `getPaymentMethodScope` | `func getPaymentMethodScope<T: PrimerPaymentMethodScope>(for methodType: PrimerPaymentMethodType) -> T?` | Get scope by method type enum     |
| `getPaymentMethodScope` | `func getPaymentMethodScope<T: PrimerPaymentMethodScope>(for paymentMethodType: String) -> T?`           | Get scope by method type string   |
| `onDismiss`             | `func onDismiss()`                                                                                       | Programmatically dismiss checkout |

## PrimerSettings Configuration

### PrimerSettings Struct

```swift
public struct PrimerSettings {
    public init(
        paymentHandling: PrimerPaymentHandling = .auto,
        uiOptions: PrimerUIOptions? = nil,
        paymentMethodOptions: PrimerPaymentMethodOptions? = nil
    )
}
```

| Parameter              | Type                          | Default | Description                           |
| ---------------------- | ----------------------------- | ------- | ------------------------------------- |
| `paymentHandling`      | `PrimerPaymentHandling`       | `.auto` | Payment flow control                  |
| `uiOptions`            | `PrimerUIOptions?`            | `nil`   | UI display preferences                |
| `paymentMethodOptions` | `PrimerPaymentMethodOptions?` | `nil`   | Payment method-specific configuration |

### Payment Handling Modes

```swift
public enum PrimerPaymentHandling {
    case auto    // Primer handles the full payment flow (recommended)
    case manual  // Primer returns a token for server-side processing
}
```

**Auto mode (recommended):** Primer handles tokenization and payment creation. `onCompletion` receives `.success(PaymentResult)` with the completed payment.

```swift
PrimerCheckout(
    clientToken: clientToken,
    primerSettings: PrimerSettings(paymentHandling: .auto),
    onCompletion: { state in
        if case .success(let result) = state {
            print("Payment complete: \(result.payment?.id ?? "")")
        }
    }
)
```

**Manual mode:** Primer returns a token. You handle payment creation on your server.

```swift
PrimerCheckout(
    clientToken: clientToken,
    primerSettings: PrimerSettings(paymentHandling: .manual),
    onCompletion: { state in
        if case .success(let result) = state {
            if let token = result.paymentMethodData?.token {
                createPaymentOnServer(token: token)
            }
        }
    }
)
```

## State and Events

### Checkout State Lifecycle

```
[*] --> initializing
initializing --> ready
ready --> success
ready --> failure
success --> dismissed
failure --> dismissed
dismissed --> [*]
```

### PrimerCheckoutState Enum

```swift
public enum PrimerCheckoutState {
    case initializing
    case ready(totalAmount: Int, currencyCode: String)
    case success(PaymentResult)
    case dismissed
    case failure(PrimerError)
}
```

| Case            | Associated Values                        | Description           |
| --------------- | ---------------------------------------- | --------------------- |
| `.initializing` | --                                       | Loading configuration |
| `.ready`        | `totalAmount: Int, currencyCode: String` | Ready for interaction |
| `.success`      | `PaymentResult`                          | Payment completed     |
| `.failure`      | `PrimerError`                            | Payment failed        |
| `.dismissed`    | --                                       | Checkout dismissed    |

### Observing State via AsyncStream

```swift
PrimerCheckout(
    clientToken: clientToken,
    scope: { checkoutScope in
        Task {
            for await state in checkoutScope.state {
                switch state {
                case .initializing:
                    print("Loading checkout...")
                case .ready(let totalAmount, let currencyCode):
                    print("Ready: \(totalAmount) \(currencyCode)")
                case .success(let result):
                    print("Success: \(result.payment?.id ?? "")")
                case .failure(let error):
                    print("Failed: \(error.errorId)")
                case .dismissed:
                    print("Dismissed")
                }
            }
        }
    }
)
```

### onCompletion Callback

The `onCompletion` callback fires when checkout reaches a terminal state (success, failure, or dismissed):

```swift
PrimerCheckout(
    clientToken: clientToken,
    onCompletion: { state in
        switch state {
        case .success(let result):
            navigateToConfirmation(result: result)
        case .failure(let error):
            logError(error)
        case .dismissed:
            navigateBack()
        default:
            break
        }
    }
)
```

Use `onCompletion` for reacting to the final result. Use `AsyncStream` for tracking intermediate states.

### Payment Method Scope States

Each payment method scope has its own state type. See the dedicated scope sections below for full state definitions.

## Card Form (PrimerCardFormScope)

### Declaration

```swift
@MainActor
public protocol PrimerCardFormScope: PrimerPaymentMethodScope where State == PrimerCardFormState
```

### Properties

**State and Context:**

| Property              | Type                               | Description                                                        |
| --------------------- | ---------------------------------- | ------------------------------------------------------------------ |
| `state`               | `AsyncStream<PrimerCardFormState>` | Stream of form state changes                                       |
| `presentationContext` | `PresentationContext`              | `.direct` (cancel button) or `.fromPaymentSelection` (back button) |
| `dismissalMechanism`  | `[DismissalMechanism]`             | Supported dismissal methods                                        |
| `cardFormUIOptions`   | `PrimerCardFormUIOptions?`         | UI display options                                                 |
| `selectCountry`       | `PrimerSelectCountryScope`         | Country picker scope                                               |

### All Field Configurations (InputFieldConfig)

Each field has a corresponding `InputFieldConfig?` property:

| Property               | Field           |
| ---------------------- | --------------- |
| `cardNumberConfig`     | Card number     |
| `expiryDateConfig`     | Expiration date |
| `cvvConfig`            | CVV/CVC         |
| `cardholderNameConfig` | Cardholder name |
| `postalCodeConfig`     | Postal/ZIP code |
| `countryConfig`        | Country         |
| `cityConfig`           | City            |
| `stateConfig`          | State/province  |
| `addressLine1Config`   | Address line 1  |
| `addressLine2Config`   | Address line 2  |
| `phoneNumberConfig`    | Phone number    |
| `firstNameConfig`      | First name      |
| `lastNameConfig`       | Last name       |
| `emailConfig`          | Email           |
| `retailOutletConfig`   | Retail outlet   |
| `otpCodeConfig`        | OTP code        |

### Layout Customization

| Property                     | Type                                          | Description                                                                 |
| ---------------------------- | --------------------------------------------- | --------------------------------------------------------------------------- |
| `title`                      | `String?`                                     | Form title text                                                             |
| `screen`                     | `CardFormScreenComponent?`                    | Full screen replacement. Signature: `(any PrimerCardFormScope) -> any View` |
| `cardInputSection`           | `Component?`                                  | Card inputs section replacement                                             |
| `billingAddressSection`      | `Component?`                                  | Billing address section replacement                                         |
| `submitButton`               | `Component?`                                  | Submit button section replacement                                           |
| `cobadgedCardsView`          | `(([String], (String) -> Void) -> any View)?` | Co-badged card network selector                                             |
| `errorScreen`                | `ErrorComponent?`                             | Error display replacement                                                   |
| `submitButtonText`           | `String?`                                     | Submit button label                                                         |
| `showSubmitLoadingIndicator` | `Bool`                                        | Show loading spinner on submit                                              |

### Field Update Methods

| Method                                           | Description                             |
| ------------------------------------------------ | --------------------------------------- |
| `updateCardNumber(_ cardNumber: String)`         | Update card number value                |
| `updateCvv(_ cvv: String)`                       | Update CVV value                        |
| `updateExpiryDate(_ expiryDate: String)`         | Update expiry date value                |
| `updateCardholderName(_ cardholderName: String)` | Update cardholder name                  |
| `updatePostalCode(_ postalCode: String)`         | Update postal code                      |
| `updateCity(_ city: String)`                     | Update city                             |
| `updateState(_ state: String)`                   | Update state/province                   |
| `updateAddressLine1(_ addressLine1: String)`     | Update address line 1                   |
| `updateAddressLine2(_ addressLine2: String)`     | Update address line 2                   |
| `updatePhoneNumber(_ phoneNumber: String)`       | Update phone number                     |
| `updateFirstName(_ firstName: String)`           | Update first name                       |
| `updateLastName(_ lastName: String)`             | Update last name                        |
| `updateEmail(_ email: String)`                   | Update email                            |
| `updateCountryCode(_ countryCode: String)`       | Update country code                     |
| `updateSelectedCardNetwork(_ network: String)`   | Select card network for co-badged cards |
| `updateRetailOutlet(_ retailOutlet: String)`     | Update retail outlet                    |
| `updateOtpCode(_ otpCode: String)`               | Update OTP code                         |
| `updateExpiryMonth(_ month: String)`             | Update expiry month                     |
| `updateExpiryYear(_ year: String)`               | Update expiry year                      |

### Generic Field Access Methods

| Method                                                            | Description               |
| ----------------------------------------------------------------- | ------------------------- |
| `updateField(_ fieldType: PrimerInputElementType, value: String)` | Update any field by type  |
| `getFieldValue(_ fieldType: PrimerInputElementType) -> String`    | Get current field value   |
| `setFieldError(_ fieldType:message:errorCode:)`                   | Set a custom error        |
| `clearFieldError(_ fieldType:)`                                   | Clear a custom error      |
| `getFieldError(_ fieldType:) -> String?`                          | Get current error message |
| `getFormConfiguration() -> CardFormConfiguration`                 | Get field configuration   |

### Validation State Management (FieldValidationStates)

When using custom field components via `InputFieldConfig(component:)`, you must report validation state manually:

```swift
func updateValidationState(_ field: WritableKeyPath<FieldValidationStates, Bool>, isValid: Bool)
```

Usage:

```swift
// Mark the CVV field as valid
scope.updateValidationState(\.cvv, isValid: true)

// Mark the card number field as invalid
scope.updateValidationState(\.cardNumber, isValid: false)
```

SDK-provided fields (e.g., `PrimerCardNumberField`, `PrimerCvvField`) manage validation automatically. You only call `updateValidationState` for custom field components.

Available KeyPaths on `FieldValidationStates`:

| KeyPath            | Field           |
| ------------------ | --------------- |
| `\.cardNumber`     | Card number     |
| `\.cvv`            | CVV             |
| `\.expiry`         | Expiry date     |
| `\.cardholderName` | Cardholder name |
| `\.postalCode`     | Postal code     |
| `\.countryCode`    | Country code    |
| `\.city`           | City            |
| `\.state`          | State           |
| `\.addressLine1`   | Address line 1  |
| `\.addressLine2`   | Address line 2  |
| `\.firstName`      | First name      |
| `\.lastName`       | Last name       |
| `\.email`          | Email           |
| `\.phoneNumber`    | Phone number    |

### ViewBuilder Field Methods

Each method returns an `AnyView` containing the SDK-managed field:

| Method                      | Parameters                                     |
| --------------------------- | ---------------------------------------------- |
| `PrimerCardNumberField`     | `label: String?, styling: PrimerFieldStyling?` |
| `PrimerExpiryDateField`     | `label: String?, styling: PrimerFieldStyling?` |
| `PrimerCvvField`            | `label: String?, styling: PrimerFieldStyling?` |
| `PrimerCardholderNameField` | `label: String?, styling: PrimerFieldStyling?` |
| `PrimerCountryField`        | `label: String?, styling: PrimerFieldStyling?` |
| `PrimerPostalCodeField`     | `label: String?, styling: PrimerFieldStyling?` |
| `PrimerCityField`           | `label: String?, styling: PrimerFieldStyling?` |
| `PrimerStateField`          | `label: String?, styling: PrimerFieldStyling?` |
| `PrimerAddressLine1Field`   | `label: String?, styling: PrimerFieldStyling?` |
| `PrimerAddressLine2Field`   | `label: String?, styling: PrimerFieldStyling?` |
| `PrimerFirstNameField`      | `label: String?, styling: PrimerFieldStyling?` |
| `PrimerLastNameField`       | `label: String?, styling: PrimerFieldStyling?` |
| `PrimerEmailField`          | `label: String?, styling: PrimerFieldStyling?` |
| `PrimerPhoneNumberField`    | `label: String?, styling: PrimerFieldStyling?` |
| `PrimerRetailOutletField`   | `label: String?, styling: PrimerFieldStyling?` |
| `PrimerOtpCodeField`        | `label: String?, styling: PrimerFieldStyling?` |
| `DefaultCardFormView`       | `styling: PrimerFieldStyling?`                 |

### PrimerCardFormState

```swift
public struct PrimerCardFormState: Equatable {
    var configuration: CardFormConfiguration
    var data: FormData
    var fieldErrors: [FieldError]
    var isLoading: Bool
    var isValid: Bool
    var selectedCountry: PrimerCountry?
    var selectedNetwork: PrimerCardNetwork?
    var availableNetworks: [PrimerCardNetwork]
    var surchargeAmountRaw: Int?
    var surchargeAmount: String?
    var displayFields: [PrimerInputElementType]
}
```

| Property             | Type                       | Description                                       |
| -------------------- | -------------------------- | ------------------------------------------------- |
| `isValid`            | `Bool`                     | All required fields pass validation               |
| `isLoading`          | `Bool`                     | Form is submitting                                |
| `fieldErrors`        | `[FieldError]`             | Current validation errors                         |
| `selectedNetwork`    | `PrimerCardNetwork?`       | Detected card network                             |
| `availableNetworks`  | `[PrimerCardNetwork]`      | Available networks for co-badged cards            |
| `displayFields`      | `[PrimerInputElementType]` | Fields to display                                 |
| `selectedCountry`    | `PrimerCountry?`           | Selected billing country                          |
| `surchargeAmount`    | `String?`                  | Formatted surcharge amount                        |
| `surchargeAmountRaw` | `Int?`                     | Surcharge in minor units                          |
| `configuration`      | `CardFormConfiguration`    | Field configuration (card fields, billing fields) |
| `data`               | `FormData`                 | Current form data values                          |

### Actions

| Method     | Description                  |
| ---------- | ---------------------------- |
| `submit()` | Validate and submit the form |
| `onBack()` | Navigate back                |
| `cancel()` | Cancel the card form         |

### Custom Card Form Example

```swift
PrimerCheckout(
    clientToken: clientToken,
    scope: { checkoutScope in
        Task {
            for await state in checkoutScope.state {
                if case .ready = state {
                    if let cardScope = checkoutScope.getPaymentMethodScope(PrimerCardFormScope.self) {
                        // Custom screen
                        cardScope.screen = { scope in
                            AnyView(
                                VStack(spacing: 16) {
                                    scope.PrimerCardNumberField(label: "Card Number", styling: nil)
                                    HStack(spacing: 12) {
                                        scope.PrimerExpiryDateField(label: "Expiry", styling: nil)
                                        scope.PrimerCvvField(label: "CVV", styling: nil)
                                    }
                                    scope.PrimerCardholderNameField(label: "Name on Card", styling: nil)

                                    Button("Pay") {
                                        scope.submit()
                                    }
                                    .disabled(!scope.state.isValid) // Note: use latest state from observation
                                }
                                .padding()
                            )
                        }
                    }
                }
            }
        }
    }
)
```

## Payment Method Selection (PrimerPaymentMethodSelectionScope)

### Declaration

```swift
@MainActor
public protocol PrimerPaymentMethodSelectionScope: AnyObject
```

### Properties

| Property                       | Type                                             | Description                       |
| ------------------------------ | ------------------------------------------------ | --------------------------------- |
| `state`                        | `AsyncStream<PrimerPaymentMethodSelectionState>` | Stream of selection state changes |
| `dismissalMechanism`           | `[DismissalMechanism]`                           | Supported dismissal methods       |
| `selectedVaultedPaymentMethod` | `VaultedPaymentMethod?`                          | Currently selected vaulted method |

### Customization

| Property            | Type                                     | Description                                                                           |
| ------------------- | ---------------------------------------- | ------------------------------------------------------------------------------------- |
| `screen`            | `PaymentMethodSelectionScreenComponent?` | Full screen replacement. Signature: `(PrimerPaymentMethodSelectionScope) -> any View` |
| `paymentMethodItem` | `PaymentMethodItemComponent?`            | Custom payment method row. Signature: `(CheckoutPaymentMethod) -> any View`           |
| `categoryHeader`    | `CategoryHeaderComponent?`               | Custom section header. Signature: `(String) -> any View`                              |
| `emptyStateView`    | `Component?`                             | Shown when no methods are available                                                   |

### Methods

| Method                                             | Description                          |
| -------------------------------------------------- | ------------------------------------ |
| `onPaymentMethodSelected(paymentMethod:)`          | Select a payment method to proceed   |
| `cancel()`                                         | Cancel the selection                 |
| `payWithVaultedPaymentMethod()`                    | Pay with the selected vaulted method |
| `payWithVaultedPaymentMethodAndCvv(_ cvv: String)` | Pay with vaulted method using CVV    |
| `updateCvvInput(_ cvv: String)`                    | Update CVV input for vaulted method  |
| `showAllVaultedPaymentMethods()`                   | Expand the vaulted methods list      |
| `showOtherWaysToPay()`                             | Show additional payment methods      |

### PrimerPaymentMethodSelectionState

```swift
public struct PrimerPaymentMethodSelectionState {
    var paymentMethods: [CheckoutPaymentMethod]
    var isLoading: Bool
    var selectedPaymentMethod: CheckoutPaymentMethod?
    var searchQuery: String
    var filteredPaymentMethods: [CheckoutPaymentMethod]
    var error: String?
    var selectedVaultedPaymentMethod: VaultedPaymentMethod?
    var isVaultPaymentLoading: Bool
    var requiresCvvInput: Bool
    var cvvInput: String
    var isCvvValid: Bool
    var cvvError: String?
    var isPaymentMethodsExpanded: Bool
}
```

| Property                   | Type                      | Description                             |
| -------------------------- | ------------------------- | --------------------------------------- |
| `paymentMethods`           | `[CheckoutPaymentMethod]` | All available payment methods           |
| `isLoading`                | `Bool`                    | Loading state                           |
| `selectedPaymentMethod`    | `CheckoutPaymentMethod?`  | Currently selected method               |
| `filteredPaymentMethods`   | `[CheckoutPaymentMethod]` | Methods matching search query           |
| `error`                    | `String?`                 | Error message                           |
| `requiresCvvInput`         | `Bool`                    | Whether selected vault method needs CVV |
| `isCvvValid`               | `Bool`                    | CVV validation state                    |
| `isPaymentMethodsExpanded` | `Bool`                    | Whether the full list is shown          |

### Vaulted Payment Methods

```swift
// Observe vaulted methods
Task {
    for await state in checkoutScope.paymentMethodSelection.state {
        if let vaulted = state.selectedVaultedPaymentMethod {
            print("Selected vaulted: \(vaulted)")
        }
        if state.requiresCvvInput {
            // Show CVV input for vault re-use
        }
    }
}

// Pay with vaulted method
checkoutScope.paymentMethodSelection.payWithVaultedPaymentMethod()

// Pay with CVV
checkoutScope.paymentMethodSelection.payWithVaultedPaymentMethodAndCvv("123")
```

## Apple Pay (PrimerApplePayScope)

### Declaration

```swift
@MainActor
public protocol PrimerApplePayScope: PrimerPaymentMethodScope where State == PrimerApplePayState
```

### Properties

| Property | Type                               | Description                       |
| -------- | ---------------------------------- | --------------------------------- |
| `state`  | `AsyncStream<PrimerApplePayState>` | Stream of Apple Pay state changes |

### Customization

| Property         | Type                                       | Description                                          |
| ---------------- | ------------------------------------------ | ---------------------------------------------------- |
| `screen`         | `((any PrimerApplePayScope) -> any View)?` | Full screen replacement                              |
| `applePayButton` | `((@escaping () -> Void) -> any View)?`    | Custom Apple Pay button. Receives an action closure. |

### Methods

| Method                          | Description                                     |
| ------------------------------- | ----------------------------------------------- |
| `submit()`                      | Initiate Apple Pay payment                      |
| `PrimerApplePayButton(action:)` | Returns the SDK's Apple Pay button as `AnyView` |

### PrimerApplePayState

```swift
public struct PrimerApplePayState: Equatable {
    var isLoading: Bool
    var isAvailable: Bool
    var availabilityError: String?
    var buttonStyle: PKPaymentButtonStyle
    var buttonType: PKPaymentButtonType
    var cornerRadius: CGFloat
}
```

| Property            | Type                   | Description               |
| ------------------- | ---------------------- | ------------------------- |
| `isLoading`         | `Bool`                 | Loading state             |
| `isAvailable`       | `Bool`                 | Device supports Apple Pay |
| `availabilityError` | `String?`              | Reason if unavailable     |
| `buttonStyle`       | `PKPaymentButtonStyle` | Current button style      |
| `buttonType`        | `PKPaymentButtonType`  | Current button type       |
| `cornerRadius`      | `CGFloat`              | Button corner radius      |

### Apple Pay Example

```swift
if let applePayScope: PrimerApplePayScope = checkoutScope.getPaymentMethodScope(PrimerApplePayScope.self) {
    // Check availability
    Task {
        for await state in applePayScope.state {
            if state.isAvailable {
                print("Apple Pay is available")
            }
        }
    }

    // Use SDK's button
    let button = applePayScope.PrimerApplePayButton {
        applePayScope.submit()
    }

    // Or custom button
    applePayScope.applePayButton = { action in
        AnyView(
            Button(action: action) {
                HStack {
                    Image(systemName: "apple.logo")
                    Text("Pay")
                }
                .frame(maxWidth: .infinity, minHeight: 50)
                .background(.black)
                .foregroundColor(.white)
                .cornerRadius(10)
            }
        )
    }
}
```

## PayPal (PrimerPayPalScope)

### Declaration

```swift
@MainActor
public protocol PrimerPayPalScope: PrimerPaymentMethodScope where State == PrimerPayPalState
```

### Properties

| Property              | Type                             | Description                          |
| --------------------- | -------------------------------- | ------------------------------------ |
| `state`               | `AsyncStream<PrimerPayPalState>` | Stream of PayPal state changes       |
| `presentationContext` | `PresentationContext`            | `.direct` or `.fromPaymentSelection` |
| `dismissalMechanism`  | `[DismissalMechanism]`           | Supported dismissal methods          |

### Customization

| Property           | Type                     | Description                                                               |
| ------------------ | ------------------------ | ------------------------------------------------------------------------- |
| `screen`           | `PayPalScreenComponent?` | Full screen replacement. Signature: `(any PrimerPayPalScope) -> any View` |
| `payButton`        | `PayPalButtonComponent?` | Custom pay button. Signature: `(any PrimerPayPalScope) -> any View`       |
| `submitButtonText` | `String?`                | Submit button label                                                       |

### Methods

| Method     | Description            |
| ---------- | ---------------------- |
| `start()`  | Begin the PayPal flow  |
| `submit()` | Submit the payment     |
| `onBack()` | Navigate back          |
| `cancel()` | Cancel the PayPal flow |

### PrimerPayPalState

```swift
public struct PrimerPayPalState: Equatable {
    public enum Status: Equatable {
        case idle
        case loading
        case redirecting
        case processing
        case success
        case failure(String)
    }

    var status: Status
    var paymentMethod: CheckoutPaymentMethod?
    var surchargeAmount: String?
}
```

| Property          | Type                     | Description                   |
| ----------------- | ------------------------ | ----------------------------- |
| `status`          | `Status`                 | Current payment status        |
| `paymentMethod`   | `CheckoutPaymentMethod?` | PayPal payment method details |
| `surchargeAmount` | `String?`                | Formatted surcharge amount    |

## Klarna (PrimerKlarnaScope)

Klarna follows a multi-step flow: category selection, authorization, and finalization.

### Declaration

```swift
@MainActor
public protocol PrimerKlarnaScope: PrimerPaymentMethodScope where State == PrimerKlarnaState
```

### Properties

| Property              | Type                             | Description                          |
| --------------------- | -------------------------------- | ------------------------------------ |
| `state`               | `AsyncStream<PrimerKlarnaState>` | Stream of Klarna state changes       |
| `presentationContext` | `PresentationContext`            | `.direct` or `.fromPaymentSelection` |
| `dismissalMechanism`  | `[DismissalMechanism]`           | Supported dismissal methods          |
| `paymentView`         | `UIView?`                        | Klarna's native payment view         |

### Customization

| Property          | Type                     | Description                                                               |
| ----------------- | ------------------------ | ------------------------------------------------------------------------- |
| `screen`          | `KlarnaScreenComponent?` | Full screen replacement. Signature: `(any PrimerKlarnaScope) -> any View` |
| `authorizeButton` | `KlarnaButtonComponent?` | Custom authorize button. Signature: `(any PrimerKlarnaScope) -> any View` |
| `finalizeButton`  | `KlarnaButtonComponent?` | Custom finalize button. Signature: `(any PrimerKlarnaScope) -> any View`  |

### Methods

| Method                                        | Description                      |
| --------------------------------------------- | -------------------------------- |
| `selectPaymentCategory(_ categoryId: String)` | Select a Klarna payment category |
| `authorizePayment()`                          | Start the authorization step     |
| `finalizePayment()`                           | Complete the finalization step   |
| `onBack()`                                    | Navigate back                    |
| `cancel()`                                    | Cancel the Klarna flow           |

### PrimerKlarnaState

```swift
public struct PrimerKlarnaState: Equatable {
    public enum Step: Equatable {
        case loading
        case categorySelection
        case viewReady
        case authorizationStarted
        case awaitingFinalization
    }

    var step: Step
    var categories: [KlarnaPaymentCategory]
    var selectedCategoryId: String?
}
```

**Flow:**

```
[*] --> loading --> categorySelection --> viewReady --> authorizationStarted --> awaitingFinalization --> [*]
```

| Property             | Type                      | Description                 |
| -------------------- | ------------------------- | --------------------------- |
| `step`               | `Step`                    | Current step in the flow    |
| `categories`         | `[KlarnaPaymentCategory]` | Available Klarna categories |
| `selectedCategoryId` | `String?`                 | Currently selected category |

### Klarna Example

```swift
if let klarnaScope: PrimerKlarnaScope = checkoutScope.getPaymentMethodScope(PrimerKlarnaScope.self) {
    Task {
        for await state in klarnaScope.state {
            switch state.step {
            case .loading:
                print("Loading Klarna...")
            case .categorySelection:
                // Auto-select first category
                if let firstCategory = state.categories.first {
                    klarnaScope.selectPaymentCategory(firstCategory.id)
                }
            case .viewReady:
                klarnaScope.authorizePayment()
            case .authorizationStarted:
                print("Authorizing...")
            case .awaitingFinalization:
                klarnaScope.finalizePayment()
            }
        }
    }
}
```

## ACH (PrimerAchScope)

ACH follows a multi-step flow: user details collection, bank account collection, and mandate acceptance.

### Declaration

```swift
@MainActor
public protocol PrimerAchScope: PrimerPaymentMethodScope where State == PrimerAchState
```

### Properties

| Property                      | Type                          | Description                                   |
| ----------------------------- | ----------------------------- | --------------------------------------------- |
| `state`                       | `AsyncStream<PrimerAchState>` | Stream of ACH state changes                   |
| `presentationContext`         | `PresentationContext`         | `.direct` or `.fromPaymentSelection`          |
| `dismissalMechanism`          | `[DismissalMechanism]`        | Supported dismissal methods                   |
| `bankCollectorViewController` | `UIViewController?`           | Bank collection view controller for embedding |

### Customization

| Property            | Type                  | Description                                                            |
| ------------------- | --------------------- | ---------------------------------------------------------------------- |
| `screen`            | `AchScreenComponent?` | Full screen replacement. Signature: `(any PrimerAchScope) -> any View` |
| `userDetailsScreen` | `AchScreenComponent?` | User details step replacement                                          |
| `mandateScreen`     | `AchScreenComponent?` | Mandate step replacement                                               |
| `submitButton`      | `AchButtonComponent?` | Custom submit button. Signature: `(any PrimerAchScope) -> any View`    |

### Methods

| Method                                | Description                                       |
| ------------------------------------- | ------------------------------------------------- |
| `updateFirstName(_ value: String)`    | Update first name                                 |
| `updateLastName(_ value: String)`     | Update last name                                  |
| `updateEmailAddress(_ value: String)` | Update email address                              |
| `submitUserDetails()`                 | Submit user details to proceed to bank collection |
| `acceptMandate()`                     | Accept the ACH mandate                            |
| `declineMandate()`                    | Decline the mandate                               |
| `onBack()`                            | Navigate back                                     |
| `cancel()`                            | Cancel the ACH flow                               |

### PrimerAchState

```swift
public struct PrimerAchState: Equatable {
    public enum Step: Equatable {
        case loading
        case userDetailsCollection
        case bankAccountCollection
        case mandateAcceptance
        case processing
    }

    var step: Step
    var userDetails: UserDetails
    var fieldValidation: FieldValidation?
    var mandateText: String?
    var isSubmitEnabled: Bool
}
```

**Flow:**

```
[*] --> loading --> userDetailsCollection --> bankAccountCollection --> mandateAcceptance --> processing --> [*]
```

**Supporting types:**

```swift
public struct UserDetails: Equatable {
    let firstName: String
    let lastName: String
    let emailAddress: String
}

public struct FieldValidation: Equatable {
    let firstNameError: String?
    let lastNameError: String?
    let emailError: String?
    var hasErrors: Bool
}
```

| Property          | Type               | Description                        |
| ----------------- | ------------------ | ---------------------------------- |
| `step`            | `Step`             | Current step in the flow           |
| `userDetails`     | `UserDetails`      | Collected user details             |
| `fieldValidation` | `FieldValidation?` | Validation errors for user details |
| `mandateText`     | `String?`          | ACH mandate text for acceptance    |
| `isSubmitEnabled` | `Bool`             | Whether submit is allowed          |

## Web Redirect (PrimerWebRedirectScope)

Manages payment methods that redirect to an external web page (e.g., Twint).

### Declaration

```swift
@MainActor
public protocol PrimerWebRedirectScope: PrimerPaymentMethodScope where State == PrimerWebRedirectState
```

### Properties

| Property            | Type                                  | Description                                      |
| ------------------- | ------------------------------------- | ------------------------------------------------ |
| `paymentMethodType` | `String`                              | Payment method type identifier (e.g., `"TWINT"`) |
| `state`             | `AsyncStream<PrimerWebRedirectState>` | Stream of state changes                          |

### Customization

| Property           | Type                          | Description                                                                    |
| ------------------ | ----------------------------- | ------------------------------------------------------------------------------ |
| `screen`           | `WebRedirectScreenComponent?` | Full screen replacement. Signature: `(any PrimerWebRedirectScope) -> any View` |
| `payButton`        | `WebRedirectButtonComponent?` | Custom pay button. Signature: `(any PrimerWebRedirectScope) -> any View`       |
| `submitButtonText` | `String?`                     | Submit button label                                                            |

### Inherited Methods (from PrimerPaymentMethodScope)

`start()`, `submit()`, `cancel()`, `onBack()`, `onDismiss()`

### PrimerWebRedirectState

```swift
public struct PrimerWebRedirectState: Equatable {
    public enum Status: Equatable {
        case idle
        case loading
        case redirecting
        case polling
        case success
        case failure(String)
    }

    var status: Status
    var paymentMethod: CheckoutPaymentMethod?
    var surchargeAmount: String?
}
```

**Flow:**

```
[*] --> idle --> loading --> redirecting --> polling --> success/failure
```

**Payment methods using this scope:**

| Payment Method | Type String |
| -------------- | ----------- |
| Twint          | `"TWINT"`   |

## Form Redirect (PrimerFormRedirectScope)

Manages payment methods that collect user input before completing in an external app (e.g., BLIK, MBWay).

### Declaration

```swift
@MainActor
public protocol PrimerFormRedirectScope: PrimerPaymentMethodScope where State == PrimerFormRedirectState
```

### Properties

| Property            | Type                                   | Description                                           |
| ------------------- | -------------------------------------- | ----------------------------------------------------- |
| `paymentMethodType` | `String`                               | Payment method type identifier (e.g., `"ADYEN_BLIK"`) |
| `state`             | `AsyncStream<PrimerFormRedirectState>` | Stream of state changes                               |

### Customization

| Property           | Type                                | Description                                                                                                              |
| ------------------ | ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `screen`           | `FormRedirectScreenComponent?`      | Full screen replacement (replaces both form and pending screens). Signature: `(any PrimerFormRedirectScope) -> any View` |
| `formSection`      | `FormRedirectFormSectionComponent?` | Custom form fields area. Signature: `(any PrimerFormRedirectScope) -> any View`                                          |
| `submitButton`     | `FormRedirectButtonComponent?`      | Custom submit button. Signature: `(any PrimerFormRedirectScope) -> any View`                                             |
| `submitButtonText` | `String?`                           | Submit button label                                                                                                      |

### Methods

| Method                  | Description                             |
| ----------------------- | --------------------------------------- |
| `updateField(_:value:)` | Update a form field value by field type |

Inherits `start()`, `submit()`, `cancel()`, `onBack()` from `PrimerPaymentMethodScope`.

### PrimerFormRedirectState

```swift
public struct PrimerFormRedirectState: Equatable {
    public enum Status: Equatable {
        case ready
        case submitting
        case awaitingExternalCompletion
        case success
        case failure(String)
    }

    var status: Status
    var fields: [PrimerFormFieldState]
    var isSubmitEnabled: Bool        // Computed: all fields valid
    var pendingMessage: String?
    var surchargeAmount: String?

    // Convenience
    var otpField: PrimerFormFieldState?
    var phoneField: PrimerFormFieldState?
    var isLoading: Bool
    var isTerminal: Bool
}
```

**Flow:**

```
[*] --> ready --> submitting --> awaitingExternalCompletion --> success/failure
```

### PrimerFormFieldState

```swift
public struct PrimerFormFieldState: Equatable, Identifiable {
    public enum FieldType: String, Equatable, Sendable {
        case otpCode       // BLIK 6-digit code
        case phoneNumber   // MBWay phone number
    }

    public enum KeyboardType: Equatable, Sendable {
        case numberPad
        case phonePad
        case `default`
    }

    var id: String { fieldType.rawValue }
    let fieldType: FieldType
    var value: String
    var isValid: Bool
    var errorMessage: String?
    let placeholder: String
    let label: String
    let helperText: String?
    let keyboardType: KeyboardType
    let maxLength: Int?
    var countryCodePrefix: String?
    var dialCode: String?
}
```

**Payment methods using this scope:**

| Payment Method | Type String     | Field Type          |
| -------------- | --------------- | ------------------- |
| BLIK           | `"ADYEN_BLIK"`  | OTP code (6 digits) |
| MBWay          | `"ADYEN_MBWAY"` | Phone number        |

## QR Code (PrimerQRCodeScope)

Manages payment methods that display a QR code for scanning (e.g., PromptPay, Xfers). The SDK automatically polls for completion.

### Declaration

```swift
@MainActor
public protocol PrimerQRCodeScope: PrimerPaymentMethodScope where State == PrimerQRCodeState
```

### Properties

| Property | Type                             | Description                     |
| -------- | -------------------------------- | ------------------------------- |
| `state`  | `AsyncStream<PrimerQRCodeState>` | Stream of QR code state changes |

### Customization

| Property | Type                     | Description                                                               |
| -------- | ------------------------ | ------------------------------------------------------------------------- |
| `screen` | `QRCodeScreenComponent?` | Full screen replacement. Signature: `(any PrimerQRCodeScope) -> any View` |

### Inherited Methods

Inherits `start()`, `cancel()`, `onBack()` from `PrimerPaymentMethodScope`. QR code scopes do not use `submit()` -- the payment completes when the user scans the QR code.

### PrimerQRCodeState

```swift
public struct PrimerQRCodeState: Equatable {
    public enum Status: Equatable {
        case loading
        case displaying
        case success
        case failure(String)
    }

    var status: Status
    var paymentMethod: CheckoutPaymentMethod?
    var qrCodeImageData: Data?
}
```

**Flow:**

```
[*] --> loading --> displaying --> success/failure
```

| Property          | Type                     | Description                                                      |
| ----------------- | ------------------------ | ---------------------------------------------------------------- |
| `status`          | `Status`                 | Current payment status                                           |
| `paymentMethod`   | `CheckoutPaymentMethod?` | Payment method details                                           |
| `qrCodeImageData` | `Data?`                  | QR code image data (PNG). Available when status is `.displaying` |

**Payment methods using this scope:**

| Payment Method | Region   |
| -------------- | -------- |
| PromptPay      | Thailand |
| Xfers          | Thailand |

## Select Country (PrimerSelectCountryScope)

Manages the country picker UI, accessed via `PrimerCardFormScope.selectCountry`.

### Declaration

```swift
@MainActor
public protocol PrimerSelectCountryScope
```

### Properties

| Property | Type                                    | Description                            |
| -------- | --------------------------------------- | -------------------------------------- |
| `state`  | `AsyncStream<PrimerSelectCountryState>` | Stream of country picker state changes |

### Customization

| Property      | Type                                               | Description                                                                        |
| ------------- | -------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `screen`      | `((PrimerSelectCountryScope) -> AnyView)?`         | Full screen replacement                                                            |
| `searchBar`   | `((String, (String) -> Void, String) -> AnyView)?` | Custom search bar. Parameters: query, onQueryChange, placeholder                   |
| `countryItem` | `CountryItemComponent?`                            | Custom country row. Signature: `(PrimerCountry, @escaping () -> Void) -> any View` |

### Methods

| Method                                        | Description                     |
| --------------------------------------------- | ------------------------------- |
| `onCountrySelected(countryCode:countryName:)` | Select a country                |
| `cancel()`                                    | Cancel the picker               |
| `onSearch(query:)`                            | Filter countries by search text |

### PrimerSelectCountryState

```swift
public struct PrimerSelectCountryState: Equatable {
    var countries: [PrimerCountry]
    var filteredCountries: [PrimerCountry]
    var searchQuery: String
    var isLoading: Bool
    var selectedCountry: PrimerCountry?
}
```

### PrimerCountry

```swift
public struct PrimerCountry: Equatable {
    let code: String      // ISO 3166-1 alpha-2 (e.g., "US")
    let name: String      // Localized name
    let flag: String?     // Flag emoji
    let dialCode: String? // Dialing code
}
```

### Country Picker Example

```swift
if let cardScope: PrimerCardFormScope = checkoutScope.getPaymentMethodScope(PrimerCardFormScope.self) {
    let countryScope = cardScope.selectCountry

    countryScope.countryItem = { country, onSelect in
        AnyView(
            Button(action: onSelect) {
                HStack {
                    if let flag = country.flag {
                        Text(flag)
                    }
                    Text(country.name)
                    Spacer()
                    Text(country.code)
                        .foregroundColor(.secondary)
                }
                .padding(.vertical, 8)
            }
        )
    }
}
```

## Theming

### PrimerCheckoutTheme

```swift
@available(iOS 15.0, *)
public struct PrimerCheckoutTheme {
    public init(
        colors: ColorOverrides? = nil,
        radius: RadiusOverrides? = nil,
        spacing: SpacingOverrides? = nil,
        sizes: SizeOverrides? = nil,
        typography: TypographyOverrides? = nil,
        borderWidth: BorderWidthOverrides? = nil
    )
}
```

All parameters are optional. Nil values use internal defaults.

### ColorOverrides

```swift
public struct ColorOverrides {
    // Brand
    public var primerColorBrand: Color?
    public var primerColorFocus: Color?
    public var primerColorLoader: Color?

    // Background
    public var primerColorBackground: Color?

    // Text
    public var primerColorTextPrimary: Color?
    public var primerColorTextSecondary: Color?
    public var primerColorTextPlaceholder: Color?
    public var primerColorTextDisabled: Color?
    public var primerColorTextNegative: Color?
    public var primerColorTextLink: Color?

    // Borders (outlined)
    public var primerColorBorderOutlinedDefault: Color?
    public var primerColorBorderOutlinedHover: Color?
    public var primerColorBorderOutlinedActive: Color?
    public var primerColorBorderOutlinedFocus: Color?
    public var primerColorBorderOutlinedDisabled: Color?
    public var primerColorBorderOutlinedError: Color?
    public var primerColorBorderOutlinedSelected: Color?
    public var primerColorBorderOutlinedLoading: Color?

    // Borders (transparent)
    public var primerColorBorderTransparentDefault: Color?
    public var primerColorBorderTransparentHover: Color?
    public var primerColorBorderTransparentActive: Color?
    public var primerColorBorderTransparentFocus: Color?
    public var primerColorBorderTransparentDisabled: Color?
    public var primerColorBorderTransparentSelected: Color?

    // Icons
    public var primerColorIconPrimary: Color?
    public var primerColorIconDisabled: Color?
    public var primerColorIconNegative: Color?
    public var primerColorIconPositive: Color?

    // Gray scale
    public var primerColorGray000: Color?
    public var primerColorGray100: Color?
    public var primerColorGray200: Color?
    public var primerColorGray300: Color?
    public var primerColorGray400: Color?
    public var primerColorGray500: Color?
    public var primerColorGray600: Color?
    public var primerColorGray700: Color?
    public var primerColorGray900: Color?

    // Semantic
    public var primerColorGreen500: Color?
    public var primerColorRed100: Color?
    public var primerColorRed500: Color?
    public var primerColorRed900: Color?
    public var primerColorBlue500: Color?
    public var primerColorBlue900: Color?
}
```

### RadiusOverrides

```swift
public struct RadiusOverrides {
    public var primerRadiusXsmall: CGFloat?  // Default: 2
    public var primerRadiusSmall: CGFloat?   // Default: 4
    public var primerRadiusMedium: CGFloat?  // Default: 8
    public var primerRadiusLarge: CGFloat?   // Default: 12
    public var primerRadiusBase: CGFloat?    // Default: 4
}
```

### SpacingOverrides

```swift
public struct SpacingOverrides {
    public var primerSpaceXxsmall: CGFloat?  // Default: 2
    public var primerSpaceXsmall: CGFloat?   // Default: 4
    public var primerSpaceSmall: CGFloat?    // Default: 8
    public var primerSpaceMedium: CGFloat?   // Default: 12
    public var primerSpaceLarge: CGFloat?    // Default: 16
    public var primerSpaceXlarge: CGFloat?   // Default: 20
    public var primerSpaceXxlarge: CGFloat?  // Default: 24
    public var primerSpaceBase: CGFloat?     // Default: 4
}
```

### SizeOverrides

```swift
public struct SizeOverrides {
    public var primerSizeSmall: CGFloat?     // Default: 16
    public var primerSizeMedium: CGFloat?    // Default: 20
    public var primerSizeLarge: CGFloat?     // Default: 24
    public var primerSizeXlarge: CGFloat?    // Default: 32
    public var primerSizeXxlarge: CGFloat?   // Default: 44
    public var primerSizeXxxlarge: CGFloat?  // Default: 56
    public var primerSizeBase: CGFloat?      // Default: 4
}
```

### TypographyOverrides and TypographyStyle

```swift
public struct TypographyOverrides {
    public var titleXlarge: TypographyStyle?  // 24pt, weight 550
    public var titleLarge: TypographyStyle?   // 16pt, weight 550
    public var bodyLarge: TypographyStyle?    // 16pt, weight 400
    public var bodyMedium: TypographyStyle?   // 14pt, weight 400
    public var bodySmall: TypographyStyle?    // 12pt, weight 400
}

public struct TypographyStyle {
    public var font: String?             // Font family name
    public var letterSpacing: CGFloat?   // Letter spacing in points
    public var weight: Font.Weight?      // Font weight
    public var size: CGFloat?            // Font size in points
    public var lineHeight: CGFloat?      // Line height in points
}
```

### BorderWidthOverrides

```swift
public struct BorderWidthOverrides {
    public var primerBorderWidthThin: CGFloat?    // Default: 1
    public var primerBorderWidthMedium: CGFloat?  // Default: 2
    public var primerBorderWidthThick: CGFloat?   // Default: 3
}
```

### PrimerFieldStyling

Per-field styling overrides for card form fields:

```swift
public struct PrimerFieldStyling {
    // Typography
    let fontName: String?
    let fontSize: CGFloat?
    let fontWeight: CGFloat?
    let labelFontName: String?
    let labelFontSize: CGFloat?
    let labelFontWeight: CGFloat?

    // Colors
    let textColor: Color?
    let labelColor: Color?
    let backgroundColor: Color?
    let borderColor: Color?
    let focusedBorderColor: Color?
    let errorBorderColor: Color?
    let placeholderColor: Color?

    // Layout
    let cornerRadius: CGFloat?
    let borderWidth: CGFloat?
    let padding: EdgeInsets?
    let fieldHeight: CGFloat?
}
```

### InputFieldConfig

```swift
public struct InputFieldConfig {
    public init(
        label: String? = nil,
        placeholder: String? = nil,
        styling: PrimerFieldStyling? = nil,
        component: Component? = nil
    )
}
```

When `component` is provided, it completely replaces the field. The `label`, `placeholder`, and `styling` properties are ignored.

### Theming Example

```swift
private let primerTheme = PrimerCheckoutTheme(
    colors: ColorOverrides(
        primerColorBrand: .blue,
        primerColorBackground: Color(.systemBackground),
        primerColorTextPrimary: .primary
    ),
    radius: RadiusOverrides(
        primerRadiusMedium: 12
    ),
    spacing: SpacingOverrides(
        primerSpaceLarge: 20
    ),
    typography: TypographyOverrides(
        titleLarge: TypographyStyle(
            font: "Avenir",
            weight: .semibold,
            size: 18
        )
    ),
    borderWidth: BorderWidthOverrides(
        primerBorderWidthThin: 1.5
    )
)

PrimerCheckout(
    clientToken: clientToken,
    primerTheme: primerTheme
)
```

## SwiftUI Integration Patterns

### NavigationStack

```swift
struct ContentView: View {
    @State private var path = NavigationPath()
    let clientToken: String

    var body: some View {
        NavigationStack(path: $path) {
            CartView(onCheckout: {
                path.append("checkout")
            })
            .navigationDestination(for: String.self) { destination in
                if destination == "checkout" {
                    PrimerCheckout(
                        clientToken: clientToken,
                        onCompletion: { state in
                            if case .success = state {
                                path.append("confirmation")
                            }
                        }
                    )
                    .navigationTitle("Payment")
                    .navigationBarTitleDisplayMode(.inline)
                }
            }
        }
    }
}
```

### Sheet Presentation

```swift
struct ContentView: View {
    @State private var showCheckout = false
    let clientToken: String

    var body: some View {
        Button("Checkout") {
            showCheckout = true
        }
        .sheet(isPresented: $showCheckout) {
            PrimerCheckout(
                clientToken: clientToken,
                onCompletion: { state in
                    if case .success = state {
                        showCheckout = false
                    }
                }
            )
        }
    }
}
```

### Full-Screen Cover

```swift
struct ContentView: View {
    @State private var showCheckout = false
    let clientToken: String

    var body: some View {
        Button("Checkout") {
            showCheckout = true
        }
        .fullScreenCover(isPresented: $showCheckout) {
            NavigationView {
                PrimerCheckout(
                    clientToken: clientToken,
                    onCompletion: { state in
                        if case .success = state, case .dismissed = state {
                            showCheckout = false
                        }
                    }
                )
                .navigationTitle("Payment")
                .navigationBarTitleDisplayMode(.inline)
                .toolbar {
                    ToolbarItem(placement: .cancellationAction) {
                        Button("Cancel") {
                            showCheckout = false
                        }
                    }
                }
            }
        }
    }
}
```

### Dismissal Handling

```swift
PrimerCheckout(
    clientToken: clientToken,
    onCompletion: { state in
        switch state {
        case .success:
            showCheckout = false
            showConfirmation = true
        case .dismissed:
            showCheckout = false
        case .failure:
            // Error is shown in the checkout UI -- don't dismiss
            break
        default:
            break
        }
    }
)
```

### Handle Payment Result with State Transition

```swift
struct CheckoutView: View {
    let clientToken: String
    @State private var paymentCompleted = false
    @State private var paymentResult: PaymentResult?

    var body: some View {
        if paymentCompleted, let result = paymentResult {
            ConfirmationView(result: result)
        } else {
            PrimerCheckout(
                clientToken: clientToken,
                onCompletion: { state in
                    switch state {
                    case .success(let result):
                        paymentResult = result
                        paymentCompleted = true
                    case .failure(let error):
                        print("Payment failed: \(error.errorId)")
                    case .dismissed:
                        break
                    default:
                        break
                    }
                }
            )
        }
    }
}
```

### Handle Payment Result with NavigationPath

```swift
struct CheckoutView: View {
    let clientToken: String
    @State private var path = NavigationPath()

    var body: some View {
        NavigationStack(path: $path) {
            PrimerCheckout(
                clientToken: clientToken,
                onCompletion: { state in
                    if case .success(let result) = state {
                        path.append(result)
                    }
                }
            )
            .navigationDestination(for: PaymentResult.self) { result in
                ConfirmationView(result: result)
            }
        }
    }
}
```

## UIKit Integration

### PrimerCheckoutPresenter

```swift
@available(iOS 15.0, *)
public final class PrimerCheckoutPresenter {
    public static let shared: PrimerCheckoutPresenter
    public weak var delegate: PrimerCheckoutPresenterDelegate?
    public static var isAvailable: Bool
    public static var isPresenting: Bool

    public static func presentCheckout(
        clientToken: String,
        from viewController: UIViewController,
        primerSettings: PrimerSettings,
        primerTheme: PrimerCheckoutTheme,
        scope: ((PrimerCheckoutScope) -> Void)? = nil,
        completion: (() -> Void)? = nil
    )

    public static func dismiss(animated: Bool = true, completion: (() -> Void)? = nil)
}
```

### PrimerCheckoutPresenterDelegate

```swift
public protocol PrimerCheckoutPresenterDelegate: AnyObject {
    // Required
    func primerCheckoutPresenterDidCompleteWithSuccess(_ result: PaymentResult)
    func primerCheckoutPresenterDidFailWithError(_ error: PrimerError)
    func primerCheckoutPresenterDidDismiss()

    // Optional (3DS)
    func primerCheckoutPresenterWillPresent3DSChallenge(_ paymentMethodTokenData: PrimerPaymentMethodTokenData)
    func primerCheckoutPresenterDidDismiss3DSChallenge()
    func primerCheckoutPresenterDidComplete3DSChallenge(success: Bool, resumeToken: String?, error: Error?)
}
```

### UIKit Full Example

```swift
class CheckoutViewController: UIViewController, PrimerCheckoutPresenterDelegate {

    func showCheckout() {
        PrimerCheckoutPresenter.shared.delegate = self

        PrimerCheckoutPresenter.presentCheckout(
            clientToken: clientToken,
            from: self,
            primerSettings: PrimerSettings(paymentHandling: .auto),
            primerTheme: PrimerCheckoutTheme(
                colors: ColorOverrides(primerColorBrand: .systemBlue)
            ),
            scope: { checkoutScope in
                checkoutScope.splashScreen = {
                    AnyView(
                        VStack {
                            ProgressView()
                            Text("Loading...")
                        }
                    )
                }
            }
        )
    }

    // MARK: - PrimerCheckoutPresenterDelegate

    func primerCheckoutPresenterDidCompleteWithSuccess(_ result: PaymentResult) {
        let confirmationVC = ConfirmationViewController(result: result)
        navigationController?.pushViewController(confirmationVC, animated: true)
    }

    func primerCheckoutPresenterDidFailWithError(_ error: PrimerError) {
        print("Payment failed: \(error.errorId)")
    }

    func primerCheckoutPresenterDidDismiss() {
        print("Checkout dismissed")
    }

    // 3DS (optional)
    func primerCheckoutPresenterWillPresent3DSChallenge(_ paymentMethodTokenData: PrimerPaymentMethodTokenData) {
        print("3DS challenge starting")
    }

    func primerCheckoutPresenterDidDismiss3DSChallenge() {
        print("3DS challenge dismissed")
    }

    func primerCheckoutPresenterDidComplete3DSChallenge(success: Bool, resumeToken: String?, error: Error?) {
        print("3DS result: \(success)")
    }
}
```

### UIKit Convenience Methods

```swift
// Minimal
PrimerCheckoutPresenter.presentCheckout(clientToken: clientToken)

// With view controller
PrimerCheckoutPresenter.presentCheckout(clientToken: clientToken, from: self)

// Check availability before presenting
guard !PrimerCheckoutPresenter.isPresenting else { return }
PrimerCheckoutPresenter.presentCheckout(clientToken: clientToken, from: self)

// Dismiss programmatically
PrimerCheckoutPresenter.dismiss(animated: true) {
    print("Checkout dismissed")
}
```

## Common Objects

### PaymentResult

```swift
public struct PaymentResult {
    let payment: Payment?
    let paymentMethodData: PrimerPaymentMethodTokenData?
}
```

| Property            | Type                            | Description                             |
| ------------------- | ------------------------------- | --------------------------------------- |
| `payment`           | `Payment?`                      | Payment details including ID and status |
| `paymentMethodData` | `PrimerPaymentMethodTokenData?` | Token data (available in manual mode)   |

### PrimerError

```swift
public struct PrimerError {
    let errorId: String
    let errorDescription: String?
    let diagnosticsId: String?
}
```

| Property           | Type      | Description                                  |
| ------------------ | --------- | -------------------------------------------- |
| `errorId`          | `String`  | Unique error identifier for support requests |
| `errorDescription` | `String?` | Human-readable error message                 |
| `diagnosticsId`    | `String?` | Diagnostic ID for Primer support             |

### PresentationContext

```swift
public enum PresentationContext {
    case direct               // Show cancel button
    case fromPaymentSelection // Show back button
}
```

### DismissalMechanism

```swift
public enum DismissalMechanism {
    case gestures    // Swipe-down dismissal
    case closeButton // Close/cancel button
}
```

### CheckoutPaymentMethod

```swift
public struct CheckoutPaymentMethod {
    let id: String
    let type: String                  // e.g., "PAYMENT_CARD", "PAYPAL"
    let name: String                  // Display name
    let icon: UIImage?
    let metadata: [String: Any]?
    let surcharge: Int?               // Minor units
    let hasUnknownSurcharge: Bool
    let formattedSurcharge: String?
    let backgroundColor: UIColor?
}
```

### FieldError

```swift
public struct FieldError: Equatable, Identifiable {
    let id: UUID
    let fieldType: PrimerInputElementType
    let message: String
    let errorCode: String?
}
```

### CardFormConfiguration

```swift
public struct CardFormConfiguration: Equatable {
    let cardFields: [PrimerInputElementType]
    let billingFields: [PrimerInputElementType]
    let requiresBillingAddress: Bool
    var allFields: [PrimerInputElementType]
}
```

### FormData

```swift
public struct FormData: Equatable {
    subscript(fieldType: PrimerInputElementType) -> String { get set }
    var dictionary: [PrimerInputElementType: String]
}
```

### FieldValidationStates

```swift
public struct FieldValidationStates: Equatable {
    // Card fields
    public var cardNumber: Bool
    public var cvv: Bool
    public var expiry: Bool
    public var cardholderName: Bool

    // Billing address fields
    public var postalCode: Bool
    public var countryCode: Bool
    public var city: Bool
    public var state: Bool
    public var addressLine1: Bool
    public var addressLine2: Bool
    public var firstName: Bool
    public var lastName: Bool
    public var email: Bool
    public var phoneNumber: Bool
}
```

All fields default to `false` and become `true` when validation passes.

### Type Aliases (Component Closures)

| Alias                                   | Signature                                           |
| --------------------------------------- | --------------------------------------------------- |
| `Component`                             | `() -> any View`                                    |
| `ContainerComponent`                    | `(@escaping () -> any View) -> any View`            |
| `ErrorComponent`                        | `(String) -> any View`                              |
| `PaymentMethodItemComponent`            | `(CheckoutPaymentMethod) -> any View`               |
| `CountryItemComponent`                  | `(PrimerCountry, @escaping () -> Void) -> any View` |
| `CategoryHeaderComponent`               | `(String) -> any View`                              |
| `PaymentMethodSelectionScreenComponent` | `(PrimerPaymentMethodSelectionScope) -> any View`   |
| `CardFormScreenComponent`               | `(any PrimerCardFormScope) -> any View`             |
| `KlarnaScreenComponent`                 | `(any PrimerKlarnaScope) -> any View`               |
| `KlarnaButtonComponent`                 | `(any PrimerKlarnaScope) -> any View`               |
| `PayPalScreenComponent`                 | `(any PrimerPayPalScope) -> any View`               |
| `PayPalButtonComponent`                 | `(any PrimerPayPalScope) -> any View`               |
| `AchScreenComponent`                    | `(any PrimerAchScope) -> any View`                  |
| `AchButtonComponent`                    | `(any PrimerAchScope) -> any View`                  |
| `WebRedirectScreenComponent`            | `(any PrimerWebRedirectScope) -> any View`          |
| `WebRedirectButtonComponent`            | `(any PrimerWebRedirectScope) -> any View`          |
| `FormRedirectScreenComponent`           | `(any PrimerFormRedirectScope) -> any View`         |
| `FormRedirectButtonComponent`           | `(any PrimerFormRedirectScope) -> any View`         |
| `FormRedirectFormSectionComponent`      | `(any PrimerFormRedirectScope) -> any View`         |
| `QRCodeScreenComponent`                 | `(any PrimerQRCodeScope) -> any View`               |

## Troubleshooting

### Quick Diagnosis Table

| Symptom                                  | Likely Cause                                               | Solution                                                                     |
| ---------------------------------------- | ---------------------------------------------------------- | ---------------------------------------------------------------------------- |
| Error screen with retry button           | Invalid or expired client token                            | Generate a fresh `clientToken` from your server for each session             |
| No payment methods shown                 | Dashboard misconfiguration or unsupported currency/country | Verify Dashboard settings and `currencyCode`/`countryCode` in client session |
| `getPaymentMethodScope()` returns nil    | Checkout not yet in `.ready` state                         | Observe `state` stream and access scopes only after `.ready`                 |
| State observation stops unexpectedly     | SwiftUI `.task` cancelled on view disappear                | Keep `PrimerCheckout` in a stable view that isn't recreated                  |
| Theme or settings not applied            | Objects created inside view `body`                         | Define as constants outside the view body                                    |
| Delegate callbacks never fire (UIKit)    | Delegate not set or deallocated                            | Set delegate on `.shared` before `presentCheckout` and retain it             |
| Apple Pay button not visible             | Simulator, no cards in Wallet, or merchant ID mismatch     | Test on real device with cards; verify Apple Developer and Dashboard config  |
| Web redirect stays in `.polling`         | User cancelled in external browser                         | Handle `.failure` state                                                      |
| BLIK/MBWay fields not appearing          | Scope accessed before `.ready`                             | Observe state and access scopes after `.ready`                               |
| QR code image not displaying             | `qrCodeImageData` is nil                                   | Check `state.status == .displaying` before using `qrCodeImageData`           |
| Build error on iOS 14                    | Deployment target too low                                  | Set deployment target to iOS 15.0+                                           |
| Form shows invalid despite filled fields | Hidden billing fields failing validation                   | Observe `fieldErrors` to identify which fields are failing                   |
| Checkout not presented (UIKit)           | Already presenting                                         | Check `PrimerCheckoutPresenter.isPresenting` before calling                  |

### Debugging: Log All State Changes

```swift
PrimerCheckout(
    clientToken: clientToken,
    scope: { checkoutScope in
        Task {
            for await state in checkoutScope.state {
                print("[Primer] Checkout state: \(state)")
            }
        }
    },
    onCompletion: { state in
        print("[Primer] Terminal state: \(state)")
    }
)
```

### Debugging: Inspect Available Payment Methods

```swift
Task {
    for await state in checkoutScope.paymentMethodSelection.state {
        for method in state.paymentMethods {
            print("[Primer] Available: \(method.type) (\(method.name))")
        }
    }
}
```

### Debugging: Check Scope Availability

```swift
let cardScope = checkoutScope.getPaymentMethodScope(PrimerCardFormScope.self)
let applePayScope = checkoutScope.getPaymentMethodScope(PrimerApplePayScope.self)
let paypalScope = checkoutScope.getPaymentMethodScope(PrimerPayPalScope.self)

print("[Primer] Card form available: \(cardScope != nil)")
print("[Primer] Apple Pay available: \(applePayScope != nil)")
print("[Primer] PayPal available: \(paypalScope != nil)")
```

### Debugging: Extract Diagnostics for Support

```swift
if case .failure(let error) = state {
    print("[Primer] Error ID: \(error.errorId)")
    print("[Primer] Description: \(error.errorDescription ?? "N/A")")
    print("[Primer] Diagnostics ID: \(error.diagnosticsId)")
}
```

### Validation vs Payment Errors

| Error Type            | When It Occurs                                   | How It's Handled                                               |
| --------------------- | ------------------------------------------------ | -------------------------------------------------------------- |
| **Validation errors** | During input (invalid format, missing fields)    | Handled automatically by input components; prevents submission |
| **Payment failures**  | After submission (declined card, network issues) | Requires explicit handling with error container or custom code |

## Critical Best Practices

### 1. Define Constants Outside the View Body

SwiftUI re-evaluates `body` frequently. Creating `PrimerSettings`, `PrimerCheckoutTheme`, or other configuration objects inside `body` causes unnecessary recreation.

```swift
// CORRECT: Constants outside body
private let primerSettings = PrimerSettings(paymentHandling: .auto)
private let primerTheme = PrimerCheckoutTheme(
    colors: ColorOverrides(primerColorBrand: .blue)
)

struct CheckoutView: View {
    let clientToken: String

    var body: some View {
        PrimerCheckout(
            clientToken: clientToken,
            primerSettings: primerSettings,
            primerTheme: primerTheme
        )
    }
}
```

```swift
// WRONG: Recreated on every render
struct CheckoutView: View {
    var body: some View {
        PrimerCheckout(
            clientToken: clientToken,
            primerSettings: PrimerSettings(paymentHandling: .auto), // recreated every render
            primerTheme: PrimerCheckoutTheme(colors: ColorOverrides(primerColorBrand: .blue)) // recreated
        )
    }
}
```

### 2. Access Scopes Only After `.ready` State

`getPaymentMethodScope()` returns `nil` before `.ready`. Always observe state first:

```swift
scope: { checkoutScope in
    Task {
        for await state in checkoutScope.state {
            if case .ready = state {
                // NOW safe to access scopes
                let cardScope = checkoutScope.getPaymentMethodScope(PrimerCardFormScope.self)
            }
        }
    }
}
```

### 3. Keep PrimerCheckout in a Stable View

Avoid placing `PrimerCheckout` in views that are recreated by navigation:

```swift
// WRONG: NavigationLink recreates the destination on push/pop
NavigationStack {
    NavigationLink("Checkout") {
        PrimerCheckout(clientToken: clientToken)
    }
}

// CORRECT: Sheet is a stable container
Button("Checkout") { showCheckout = true }
    .sheet(isPresented: $showCheckout) {
        PrimerCheckout(clientToken: clientToken)
    }
```

### 4. Set UIKit Delegate Before Presenting

```swift
// CORRECT: Set delegate BEFORE presenting
PrimerCheckoutPresenter.shared.delegate = self
PrimerCheckoutPresenter.presentCheckout(clientToken: clientToken, from: self)

// WRONG: Setting delegate after presenting may miss early callbacks
PrimerCheckoutPresenter.presentCheckout(clientToken: clientToken, from: self)
PrimerCheckoutPresenter.shared.delegate = self // Too late!
```

### 5. Generate Fresh Client Tokens

Client tokens are single-use and expire. Always fetch a fresh token from your server for each checkout session.

### 6. Handle All Terminal States

Always handle success, failure, and dismissed in `onCompletion`:

```swift
onCompletion: { state in
    switch state {
    case .success(let result):
        // Navigate to confirmation
    case .failure(let error):
        // Log error (UI shows error automatically)
    case .dismissed:
        // Clean up navigation state
    default:
        break
    }
}
```

### 7. Use `@MainActor` for Scope Interactions

All scope protocols are annotated `@MainActor`. Ensure scope interactions happen on the main actor. Using `Task { }` inside the scope closure naturally runs on `@MainActor` because the scope closure itself is `@MainActor`.

### 8. iOS Version Requirements

- CheckoutComponents requires iOS 15.0+
- The main PrimerSDK supports iOS 13.0+ for Drop-In and Headless
- Set your deployment target to at least iOS 15.0 for CheckoutComponents
