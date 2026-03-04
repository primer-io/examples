# Primer iOS Checkout - Scope API Reference

Flat API reference for all scope protocols, state types, and common types. Optimized for AI lookup.

## PrimerCheckoutScope

```swift
@MainActor
public protocol PrimerCheckoutScope: AnyObject
```

**Properties:**

| Property                 | Type                                |
| ------------------------ | ----------------------------------- |
| `state`                  | `AsyncStream<PrimerCheckoutState>`  |
| `paymentMethodSelection` | `PrimerPaymentMethodSelectionScope` |
| `paymentHandling`        | `PrimerPaymentHandling`             |
| `container`              | `ContainerComponent?`               |
| `splashScreen`           | `Component?`                        |
| `loading`                | `Component?`                        |
| `errorScreen`            | `ErrorComponent?`                   |

**Methods:**

```swift
func getPaymentMethodScope<T: PrimerPaymentMethodScope>(_ scopeType: T.Type) -> T?
func getPaymentMethodScope<T: PrimerPaymentMethodScope>(for methodType: PrimerPaymentMethodType) -> T?
func getPaymentMethodScope<T: PrimerPaymentMethodScope>(for paymentMethodType: String) -> T?
func onDismiss()
```

## PrimerPaymentMethodScope (Base Protocol)

```swift
@MainActor
protocol PrimerPaymentMethodScope: AnyObject {
    associatedtype State: Equatable
    var state: AsyncStream<State> { get }
    var presentationContext: PresentationContext { get }
    var dismissalMechanism: [DismissalMechanism] { get }
    func start()
    func submit()
    func cancel()
    func onBack()
    func onDismiss()
}
```

## PrimerCardFormScope

```swift
@MainActor
public protocol PrimerCardFormScope: PrimerPaymentMethodScope where State == PrimerCardFormState
```

**State/Context Properties:**

| Property              | Type                               |
| --------------------- | ---------------------------------- |
| `state`               | `AsyncStream<PrimerCardFormState>` |
| `presentationContext` | `PresentationContext`              |
| `dismissalMechanism`  | `[DismissalMechanism]`             |
| `cardFormUIOptions`   | `PrimerCardFormUIOptions?`         |
| `selectCountry`       | `PrimerSelectCountryScope`         |

**Field Config Properties (all `InputFieldConfig?`):**

`cardNumberConfig`, `expiryDateConfig`, `cvvConfig`, `cardholderNameConfig`, `postalCodeConfig`, `countryConfig`, `cityConfig`, `stateConfig`, `addressLine1Config`, `addressLine2Config`, `phoneNumberConfig`, `firstNameConfig`, `lastNameConfig`, `emailConfig`, `retailOutletConfig`, `otpCodeConfig`

**Layout Properties:**

| Property                     | Type                                          |
| ---------------------------- | --------------------------------------------- |
| `title`                      | `String?`                                     |
| `screen`                     | `CardFormScreenComponent?`                    |
| `cardInputSection`           | `Component?`                                  |
| `billingAddressSection`      | `Component?`                                  |
| `submitButton`               | `Component?`                                  |
| `cobadgedCardsView`          | `(([String], (String) -> Void) -> any View)?` |
| `errorScreen`                | `ErrorComponent?`                             |
| `submitButtonText`           | `String?`                                     |
| `showSubmitLoadingIndicator` | `Bool`                                        |

**Field Update Methods:**

```swift
func updateCardNumber(_ cardNumber: String)
func updateCvv(_ cvv: String)
func updateExpiryDate(_ expiryDate: String)
func updateCardholderName(_ cardholderName: String)
func updatePostalCode(_ postalCode: String)
func updateCity(_ city: String)
func updateState(_ state: String)
func updateAddressLine1(_ addressLine1: String)
func updateAddressLine2(_ addressLine2: String)
func updatePhoneNumber(_ phoneNumber: String)
func updateFirstName(_ firstName: String)
func updateLastName(_ lastName: String)
func updateEmail(_ email: String)
func updateCountryCode(_ countryCode: String)
func updateSelectedCardNetwork(_ network: String)
func updateRetailOutlet(_ retailOutlet: String)
func updateOtpCode(_ otpCode: String)
func updateExpiryMonth(_ month: String)
func updateExpiryYear(_ year: String)
```

**Generic Field Methods:**

```swift
func updateField(_ fieldType: PrimerInputElementType, value: String)
func getFieldValue(_ fieldType: PrimerInputElementType) -> String
func setFieldError(_ fieldType: PrimerInputElementType, message: String, errorCode: String?)
func clearFieldError(_ fieldType: PrimerInputElementType)
func getFieldError(_ fieldType: PrimerInputElementType) -> String?
func getFormConfiguration() -> CardFormConfiguration
```

**Validation State Method:**

```swift
func updateValidationState(_ field: WritableKeyPath<FieldValidationStates, Bool>, isValid: Bool)
```

**Actions:**

```swift
func submit()
func onBack()
func cancel()
```

**ViewBuilder Field Methods (all return `AnyView`):**

```swift
func PrimerCardNumberField(label: String?, styling: PrimerFieldStyling?) -> AnyView
func PrimerExpiryDateField(label: String?, styling: PrimerFieldStyling?) -> AnyView
func PrimerCvvField(label: String?, styling: PrimerFieldStyling?) -> AnyView
func PrimerCardholderNameField(label: String?, styling: PrimerFieldStyling?) -> AnyView
func PrimerCountryField(label: String?, styling: PrimerFieldStyling?) -> AnyView
func PrimerPostalCodeField(label: String?, styling: PrimerFieldStyling?) -> AnyView
func PrimerCityField(label: String?, styling: PrimerFieldStyling?) -> AnyView
func PrimerStateField(label: String?, styling: PrimerFieldStyling?) -> AnyView
func PrimerAddressLine1Field(label: String?, styling: PrimerFieldStyling?) -> AnyView
func PrimerAddressLine2Field(label: String?, styling: PrimerFieldStyling?) -> AnyView
func PrimerFirstNameField(label: String?, styling: PrimerFieldStyling?) -> AnyView
func PrimerLastNameField(label: String?, styling: PrimerFieldStyling?) -> AnyView
func PrimerEmailField(label: String?, styling: PrimerFieldStyling?) -> AnyView
func PrimerPhoneNumberField(label: String?, styling: PrimerFieldStyling?) -> AnyView
func PrimerRetailOutletField(label: String?, styling: PrimerFieldStyling?) -> AnyView
func PrimerOtpCodeField(label: String?, styling: PrimerFieldStyling?) -> AnyView
func DefaultCardFormView(styling: PrimerFieldStyling?) -> AnyView
```

## PrimerPaymentMethodSelectionScope

```swift
@MainActor
public protocol PrimerPaymentMethodSelectionScope: AnyObject
```

**Properties:**

| Property                       | Type                                             |
| ------------------------------ | ------------------------------------------------ |
| `state`                        | `AsyncStream<PrimerPaymentMethodSelectionState>` |
| `dismissalMechanism`           | `[DismissalMechanism]`                           |
| `selectedVaultedPaymentMethod` | `VaultedPaymentMethod?`                          |
| `screen`                       | `PaymentMethodSelectionScreenComponent?`         |
| `paymentMethodItem`            | `PaymentMethodItemComponent?`                    |
| `categoryHeader`               | `CategoryHeaderComponent?`                       |
| `emptyStateView`               | `Component?`                                     |

**Methods:**

```swift
func onPaymentMethodSelected(paymentMethod: CheckoutPaymentMethod)
func cancel()
func payWithVaultedPaymentMethod()
func payWithVaultedPaymentMethodAndCvv(_ cvv: String)
func updateCvvInput(_ cvv: String)
func showAllVaultedPaymentMethods()
func showOtherWaysToPay()
```

## PrimerApplePayScope

```swift
@MainActor
public protocol PrimerApplePayScope: PrimerPaymentMethodScope where State == PrimerApplePayState
```

**Properties:**

| Property         | Type                                       |
| ---------------- | ------------------------------------------ |
| `state`          | `AsyncStream<PrimerApplePayState>`         |
| `screen`         | `((any PrimerApplePayScope) -> any View)?` |
| `applePayButton` | `((@escaping () -> Void) -> any View)?`    |

**Methods:**

```swift
func submit()
func PrimerApplePayButton(action: @escaping () -> Void) -> AnyView
```

## PrimerPayPalScope

```swift
@MainActor
public protocol PrimerPayPalScope: PrimerPaymentMethodScope where State == PrimerPayPalState
```

**Properties:**

| Property              | Type                             |
| --------------------- | -------------------------------- |
| `state`               | `AsyncStream<PrimerPayPalState>` |
| `presentationContext` | `PresentationContext`            |
| `dismissalMechanism`  | `[DismissalMechanism]`           |
| `screen`              | `PayPalScreenComponent?`         |
| `payButton`           | `PayPalButtonComponent?`         |
| `submitButtonText`    | `String?`                        |

**Methods:**

```swift
func start()
func submit()
func onBack()
func cancel()
```

## PrimerKlarnaScope

```swift
@MainActor
public protocol PrimerKlarnaScope: PrimerPaymentMethodScope where State == PrimerKlarnaState
```

**Properties:**

| Property              | Type                             |
| --------------------- | -------------------------------- |
| `state`               | `AsyncStream<PrimerKlarnaState>` |
| `presentationContext` | `PresentationContext`            |
| `dismissalMechanism`  | `[DismissalMechanism]`           |
| `paymentView`         | `UIView?`                        |
| `screen`              | `KlarnaScreenComponent?`         |
| `authorizeButton`     | `KlarnaButtonComponent?`         |
| `finalizeButton`      | `KlarnaButtonComponent?`         |

**Methods:**

```swift
func selectPaymentCategory(_ categoryId: String)
func authorizePayment()
func finalizePayment()
func onBack()
func cancel()
```

## PrimerAchScope

```swift
@MainActor
public protocol PrimerAchScope: PrimerPaymentMethodScope where State == PrimerAchState
```

**Properties:**

| Property                      | Type                          |
| ----------------------------- | ----------------------------- |
| `state`                       | `AsyncStream<PrimerAchState>` |
| `presentationContext`         | `PresentationContext`         |
| `dismissalMechanism`          | `[DismissalMechanism]`        |
| `bankCollectorViewController` | `UIViewController?`           |
| `screen`                      | `AchScreenComponent?`         |
| `userDetailsScreen`           | `AchScreenComponent?`         |
| `mandateScreen`               | `AchScreenComponent?`         |
| `submitButton`                | `AchButtonComponent?`         |

**Methods:**

```swift
func updateFirstName(_ value: String)
func updateLastName(_ value: String)
func updateEmailAddress(_ value: String)
func submitUserDetails()
func acceptMandate()
func declineMandate()
func onBack()
func cancel()
```

## PrimerWebRedirectScope

```swift
@MainActor
public protocol PrimerWebRedirectScope: PrimerPaymentMethodScope where State == PrimerWebRedirectState
```

**Properties:**

| Property            | Type                                  |
| ------------------- | ------------------------------------- |
| `paymentMethodType` | `String`                              |
| `state`             | `AsyncStream<PrimerWebRedirectState>` |
| `screen`            | `WebRedirectScreenComponent?`         |
| `payButton`         | `WebRedirectButtonComponent?`         |
| `submitButtonText`  | `String?`                             |

**Inherited Methods:** `start()`, `submit()`, `cancel()`, `onBack()`, `onDismiss()`

## PrimerFormRedirectScope

```swift
@MainActor
public protocol PrimerFormRedirectScope: PrimerPaymentMethodScope where State == PrimerFormRedirectState
```

**Properties:**

| Property            | Type                                   |
| ------------------- | -------------------------------------- |
| `paymentMethodType` | `String`                               |
| `state`             | `AsyncStream<PrimerFormRedirectState>` |
| `screen`            | `FormRedirectScreenComponent?`         |
| `formSection`       | `FormRedirectFormSectionComponent?`    |
| `submitButton`      | `FormRedirectButtonComponent?`         |
| `submitButtonText`  | `String?`                              |

**Methods:**

```swift
func updateField(_ fieldType: PrimerFormFieldState.FieldType, value: String)
```

**Inherited Methods:** `start()`, `submit()`, `cancel()`, `onBack()`

## PrimerQRCodeScope

```swift
@MainActor
public protocol PrimerQRCodeScope: PrimerPaymentMethodScope where State == PrimerQRCodeState
```

**Properties:**

| Property | Type                             |
| -------- | -------------------------------- |
| `state`  | `AsyncStream<PrimerQRCodeState>` |
| `screen` | `QRCodeScreenComponent?`         |

**Inherited Methods:** `start()`, `cancel()`, `onBack()`, `onDismiss()`. Does not use `submit()`.

## PrimerSelectCountryScope

```swift
@MainActor
public protocol PrimerSelectCountryScope
```

**Properties:**

| Property      | Type                                               |
| ------------- | -------------------------------------------------- |
| `state`       | `AsyncStream<PrimerSelectCountryState>`            |
| `screen`      | `((PrimerSelectCountryScope) -> AnyView)?`         |
| `searchBar`   | `((String, (String) -> Void, String) -> AnyView)?` |
| `countryItem` | `CountryItemComponent?`                            |

**Methods:**

```swift
func onCountrySelected(countryCode: String, countryName: String)
func cancel()
func onSearch(query: String)
```

---

## State Types

### PrimerCheckoutState

```swift
public enum PrimerCheckoutState {
    case initializing
    case ready(totalAmount: Int, currencyCode: String)
    case success(PaymentResult)
    case dismissed
    case failure(PrimerError)
}
```

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
    var isSubmitEnabled: Bool
    var pendingMessage: String?
    var surchargeAmount: String?
    var otpField: PrimerFormFieldState?
    var phoneField: PrimerFormFieldState?
    var isLoading: Bool
    var isTerminal: Bool
}
```

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

---

## Common Types

### PaymentResult

```swift
public struct PaymentResult {
    let payment: Payment?
    let paymentMethodData: PrimerPaymentMethodTokenData?
}
```

### PrimerError

```swift
public struct PrimerError {
    let errorId: String
    let errorDescription: String?
    let diagnosticsId: String?
}
```

### PrimerSettings

```swift
public struct PrimerSettings {
    public init(
        paymentHandling: PrimerPaymentHandling = .auto,
        uiOptions: PrimerUIOptions? = nil,
        paymentMethodOptions: PrimerPaymentMethodOptions? = nil
    )
}
```

### PrimerPaymentHandling

```swift
public enum PrimerPaymentHandling {
    case auto
    case manual
}
```

### PrimerCheckoutTheme

```swift
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

### PresentationContext

```swift
public enum PresentationContext {
    case direct
    case fromPaymentSelection
}
```

### DismissalMechanism

```swift
public enum DismissalMechanism {
    case gestures
    case closeButton
}
```

### CheckoutPaymentMethod

```swift
public struct CheckoutPaymentMethod {
    let id: String
    let type: String
    let name: String
    let icon: UIImage?
    let metadata: [String: Any]?
    let surcharge: Int?
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
    public var cardNumber: Bool
    public var cvv: Bool
    public var expiry: Bool
    public var cardholderName: Bool
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

### PrimerFieldStyling

```swift
public struct PrimerFieldStyling {
    let fontName: String?
    let fontSize: CGFloat?
    let fontWeight: CGFloat?
    let labelFontName: String?
    let labelFontSize: CGFloat?
    let labelFontWeight: CGFloat?
    let textColor: Color?
    let labelColor: Color?
    let backgroundColor: Color?
    let borderColor: Color?
    let focusedBorderColor: Color?
    let errorBorderColor: Color?
    let placeholderColor: Color?
    let cornerRadius: CGFloat?
    let borderWidth: CGFloat?
    let padding: EdgeInsets?
    let fieldHeight: CGFloat?
}
```

### PrimerFormFieldState

```swift
public struct PrimerFormFieldState: Equatable, Identifiable {
    public enum FieldType: String, Equatable, Sendable {
        case otpCode
        case phoneNumber
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

### PrimerCountry

```swift
public struct PrimerCountry: Equatable {
    let code: String
    let name: String
    let flag: String?
    let dialCode: String?
}
```

### UserDetails (ACH)

```swift
public struct UserDetails: Equatable {
    let firstName: String
    let lastName: String
    let emailAddress: String
}
```

### FieldValidation (ACH)

```swift
public struct FieldValidation: Equatable {
    let firstNameError: String?
    let lastNameError: String?
    let emailError: String?
    var hasErrors: Bool
}
```

### PrimerCheckoutPresenter (UIKit)

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
    func primerCheckoutPresenterDidCompleteWithSuccess(_ result: PaymentResult)
    func primerCheckoutPresenterDidFailWithError(_ error: PrimerError)
    func primerCheckoutPresenterDidDismiss()
    func primerCheckoutPresenterWillPresent3DSChallenge(_ paymentMethodTokenData: PrimerPaymentMethodTokenData)
    func primerCheckoutPresenterDidDismiss3DSChallenge()
    func primerCheckoutPresenterDidComplete3DSChallenge(success: Bool, resumeToken: String?, error: Error?)
}
```

---

## Type Aliases

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

## Scope-to-Payment-Method Mapping

| Payment Method      | Type String      | Scope Protocol            |
| ------------------- | ---------------- | ------------------------- |
| Card (PAYMENT_CARD) | `"PAYMENT_CARD"` | `PrimerCardFormScope`     |
| Apple Pay           | `"APPLE_PAY"`    | `PrimerApplePayScope`     |
| PayPal              | `"PAYPAL"`       | `PrimerPayPalScope`       |
| Klarna              | `"KLARNA"`       | `PrimerKlarnaScope`       |
| ACH                 | `"ACH"`          | `PrimerAchScope`          |
| Twint               | `"TWINT"`        | `PrimerWebRedirectScope`  |
| BLIK                | `"ADYEN_BLIK"`   | `PrimerFormRedirectScope` |
| MBWay               | `"ADYEN_MBWAY"`  | `PrimerFormRedirectScope` |
| PromptPay           | --               | `PrimerQRCodeScope`       |
| Xfers               | --               | `PrimerQRCodeScope`       |
