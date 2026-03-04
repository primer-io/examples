---
name: primer-android-checkout
description: Build checkout and payment experiences using Primer's Android CheckoutComponents SDK. Use this skill when implementing payment flows, checkout screens, card forms, or integrating Primer SDK into Jetpack Compose applications. Covers controller pattern, composable APIs, slot-based customization, Material 3 theming, and state management.
---

# Primer Android Checkout

## Overview

This skill provides comprehensive guidance for building checkout and payment experiences using Primer's Android CheckoutComponents SDK (`io.primer.android:checkout`). The SDK is a Jetpack Compose-native library that provides composable components for card payments, alternative payment methods, and saved payment methods management.

Use this skill when:

- Implementing checkout screens or payment flows in Android apps
- Building card payment forms with validation and formatting
- Displaying available payment methods from Primer
- Managing saved (vaulted) payment methods
- Customizing checkout UI with design tokens and slot-based composition
- Handling payment lifecycle events and state
- Integrating Primer with Jetpack Compose and Material 3
- Troubleshooting Compose version conflicts, state management, or SDK issues

**SDK status:** Beta (v3.0.0-beta). The API may change before stable release.

### Key Architectural Concepts

1. **Controller pattern** -- all stateful components use `remember*Controller()` composable functions that return controller interfaces exposing `StateFlow` and action methods
2. **Slot-based composition** -- top-level composables accept `@Composable` lambda parameters for each UI section, with sensible defaults you can selectively override
3. **Design tokens** -- theming uses a token system (`PrimerTheme`) that automatically maps to Material 3 `ColorScheme`
4. **Two presentation modes** -- `PrimerCheckoutSheet` (modal bottom sheet) and `PrimerCheckoutHost` (inline embedding)

## Quick Start Guide

### Installation

Prerequisites:

- Android API level 24+ (minSdk)
- Kotlin 2.0+ with the Compose Compiler Gradle plugin
- Jetpack Compose enabled
- A `clientToken` from your server via the Client Session API

Add the SDK dependency to your module-level `build.gradle.kts`:

```kotlin
dependencies {
    implementation("io.primer.android:checkout:3.0.0-beta")
}
```

Ensure Compose is configured:

```kotlin
plugins {
    id("org.jetbrains.kotlin.plugin.compose") version "<your-kotlin-version>"
}

android {
    buildFeatures {
        compose = true
    }
}

dependencies {
    implementation(platform("androidx.compose:compose-bom:2025.12.00"))
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.material3:material3")
    implementation("androidx.lifecycle:lifecycle-runtime-compose:2.7.0")
}
```

ProGuard/R8: The SDK includes its own rules. No additional configuration needed.

### Minimal Compose Integration (PrimerCheckoutSheet)

The fastest way to add checkout -- a modal bottom sheet with built-in navigation between payment method selection, card form, success, and error screens:

```kotlin
@Composable
fun CheckoutScreen(clientToken: String) {
    val checkout = rememberPrimerCheckoutController(
        clientToken = clientToken,
    )

    PrimerCheckoutSheet(
        checkout = checkout,
        onEvent = { event ->
            when (event) {
                is PrimerCheckoutEvent.Success -> { /* Navigate to confirmation */ }
                is PrimerCheckoutEvent.Failure -> { /* Error is shown in the UI */ }
            }
        },
    )
}
```

### Inline Integration (PrimerCheckoutHost)

Embed checkout components directly in your layout for full control over navigation and presentation:

```kotlin
@Composable
fun InlineCheckout(clientToken: String) {
    val checkout = rememberPrimerCheckoutController(clientToken)
    val state by checkout.state.collectAsStateWithLifecycle()

    PrimerCheckoutHost(
        checkout = checkout,
        onEvent = { event ->
            when (event) {
                is PrimerCheckoutEvent.Success -> { /* Handle success */ }
                is PrimerCheckoutEvent.Failure -> { /* Handle failure */ }
            }
        },
    ) {
        when (state) {
            is PrimerCheckoutState.Loading -> {
                CircularProgressIndicator()
            }
            is PrimerCheckoutState.Ready -> {
                val cardFormController = rememberCardFormController(checkout)
                val paymentMethodsController = rememberPaymentMethodsController(checkout)

                Column {
                    PrimerPaymentMethods(controller = paymentMethodsController)
                    PrimerCardForm(controller = cardFormController)
                }
            }
        }
    }
}
```

## Architecture: Controller Pattern

### Why Controllers

Every stateful SDK component follows the same pattern: a `remember*Controller()` composable creates a controller that survives recomposition, exposes observable state via `StateFlow`, and provides action methods. This is analogous to Compose's own `rememberScrollState()` or `rememberLazyListState()`.

### remember\*Controller Functions

```kotlin
val checkout = rememberPrimerCheckoutController(clientToken)
val cardFormController = rememberCardFormController(checkout)
val paymentMethodsController = rememberPaymentMethodsController(checkout)
val vaultedMethodsController = rememberVaultedPaymentMethodsController(checkout)
```

All child controllers require the parent `PrimerCheckoutController` and must be called inside `PrimerCheckoutHost` content or a `PrimerCheckoutSheet` slot (they need CompositionLocal providers).

### Controller Lifecycle with Compose

Controllers are remembered across recompositions. When the key parameters change (e.g., a new `clientToken`), the controller is recreated. Always use the `remember*` functions -- never construct controllers directly:

```kotlin
// CORRECT -- survives recomposition
val checkout = rememberPrimerCheckoutController(clientToken)

// WRONG -- creates new controller on every recomposition
val checkout = PrimerCheckoutController(clientToken)
```

## PrimerCheckoutController

Central interface for managing a checkout session.

### Creation

```kotlin
@Composable
fun rememberPrimerCheckoutController(
    clientToken: String,
    settings: PrimerSettings = PrimerSettings(),
): PrimerCheckoutController
```

| Parameter     | Type             | Default            | Description                                       |
| ------------- | ---------------- | ------------------ | ------------------------------------------------- |
| `clientToken` | `String`         | Required           | Short-lived token from the Client Session API     |
| `settings`    | `PrimerSettings` | `PrimerSettings()` | SDK configuration including payment handling mode |

### Interface

```kotlin
@Stable
interface PrimerCheckoutController {
    val state: StateFlow<PrimerCheckoutState>
    fun refresh()
    fun dismiss()
}
```

| Member      | Type                             | Description                                                                                              |
| ----------- | -------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `state`     | `StateFlow<PrimerCheckoutState>` | Current checkout lifecycle state. Collect with `collectAsStateWithLifecycle()`.                          |
| `refresh()` | Method                           | Reinitializes the checkout session. State transitions back to `Loading`.                                 |
| `dismiss()` | Method                           | Programmatically dismisses the checkout UI. Closes the bottom sheet or triggers cleanup for inline host. |

### formatAmount Extension

```kotlin
fun PrimerCheckoutController.formatAmount(amountInCents: Int): String
```

Formats an amount in minor units (cents) into a locale-aware currency string based on the current session (e.g., `"$10.00"`, `"10,00 EUR"`).

## PrimerCheckoutState and PrimerCheckoutEvent

### PrimerCheckoutState

Sealed interface representing the lifecycle of a checkout session. Observe via `PrimerCheckoutController.state`.

```kotlin
@Stable
sealed interface PrimerCheckoutState {
    data object Loading : PrimerCheckoutState
    data class Ready(
        val clientSession: PrimerClientSession,
    ) : PrimerCheckoutState
}
```

| State     | Description                                                                                                     |
| --------- | --------------------------------------------------------------------------------------------------------------- |
| `Loading` | SDK is initializing -- fetching configuration and payment methods. Initial state and re-entered on `refresh()`. |
| `Ready`   | Checkout is fully initialized and ready for payment. Contains `clientSession` data.                             |

#### PrimerClientSession

```kotlin
data class PrimerClientSession(
    val totalAmount: Int?,
    val currencyCode: String?,
    val customerId: String?,
    val orderId: String?,
)
```

| Property       | Type      | Description                                                  |
| -------------- | --------- | ------------------------------------------------------------ |
| `totalAmount`  | `Int?`    | Total amount in minor currency units (e.g., `1000` = $10.00) |
| `currencyCode` | `String?` | ISO 4217 currency code (e.g., `"USD"`, `"EUR"`)              |
| `customerId`   | `String?` | Customer identifier from your system                         |
| `orderId`      | `String?` | Order identifier from your system                            |

### PrimerCheckoutEvent

Sealed interface for payment outcome events delivered through the `onEvent` callback on `PrimerCheckoutSheet` or `PrimerCheckoutHost`.

```kotlin
@Stable
sealed interface PrimerCheckoutEvent {
    data class Success(
        val checkoutData: PrimerCheckoutData,
    ) : PrimerCheckoutEvent

    data class Failure(
        val error: PrimerError,
    ) : PrimerCheckoutEvent
}
```

| Event     | When                                                       | Property                           |
| --------- | ---------------------------------------------------------- | ---------------------------------- |
| `Success` | After payment confirmation from processor (AUTO mode only) | `checkoutData: PrimerCheckoutData` |
| `Failure` | After a payment error or SDK error                         | `error: PrimerError`               |

Events can fire multiple times per session (e.g., a `Failure` followed by a `Success` on retry).

#### PrimerCheckoutData

```kotlin
data class PrimerCheckoutData(
    val payment: PrimerPayment,
)
```

#### PrimerPayment

```kotlin
data class PrimerPayment(
    val id: String,
    val orderId: String?,
)
```

| Property  | Type      | Description                                                    |
| --------- | --------- | -------------------------------------------------------------- |
| `id`      | `String`  | Unique payment identifier assigned by Primer                   |
| `orderId` | `String?` | Order identifier, if provided when creating the client session |

## PrimerCheckoutSheet

Modal bottom sheet composable with built-in navigation between screens (splash, loading, payment methods, card form, success, error). Each screen is a slot parameter you can override.

### Full Composable Signature

```kotlin
@Composable
fun PrimerCheckoutSheet(
    checkout: PrimerCheckoutController,
    modifier: Modifier = Modifier,
    onDismiss: () -> Unit = {},
    onEvent: (PrimerCheckoutEvent) -> Unit = {},
    theme: PrimerTheme = PrimerTheme(),
    splash: @Composable () -> Unit = { PrimerCheckoutSheetDefaults.Splash() },
    loading: @Composable () -> Unit = { PrimerCheckoutSheetDefaults.Loading() },
    paymentMethodSelection: @Composable () -> Unit = {
        PrimerCheckoutSheetDefaults.PaymentMethodSelection(checkout)
    },
    cardForm: @Composable () -> Unit = {
        val controller = rememberCardFormController(checkout)
        PrimerCardForm(controller = controller)
    },
    success: @Composable (PrimerCheckoutData) -> Unit = { data ->
        PrimerCheckoutSheetDefaults.Success(data)
    },
    error: @Composable (PrimerError) -> Unit = { error ->
        PrimerCheckoutSheetDefaults.Error(error)
    },
)
```

### All Parameters with Defaults

| Parameter                | Type                                       | Default                                     | Description                                                              |
| ------------------------ | ------------------------------------------ | ------------------------------------------- | ------------------------------------------------------------------------ |
| `checkout`               | `PrimerCheckoutController`                 | Required                                    | Checkout controller that drives the sheet lifecycle                      |
| `modifier`               | `Modifier`                                 | `Modifier`                                  | Modifier applied to the bottom sheet container                           |
| `onDismiss`              | `() -> Unit`                               | `{}`                                        | Called on swipe down, back press, or auto-dismiss after result screen    |
| `onEvent`                | `(PrimerCheckoutEvent) -> Unit`            | `{}`                                        | Payment outcome events                                                   |
| `theme`                  | `PrimerTheme`                              | `PrimerTheme()`                             | Design tokens applied to all components within the sheet                 |
| `splash`                 | `@Composable () -> Unit`                   | `Defaults.Splash()`                         | Slot displayed briefly when the sheet first opens                        |
| `loading`                | `@Composable () -> Unit`                   | `Defaults.Loading()`                        | Slot displayed during payment processing                                 |
| `paymentMethodSelection` | `@Composable () -> Unit`                   | `Defaults.PaymentMethodSelection(checkout)` | Slot for payment method selection screen                                 |
| `cardForm`               | `@Composable () -> Unit`                   | `PrimerCardForm(...)`                       | Slot for card payment form screen                                        |
| `success`                | `@Composable (PrimerCheckoutData) -> Unit` | `Defaults.Success(data)`                    | Slot after successful payment. Auto-dismisses after 3 seconds.           |
| `error`                  | `@Composable (PrimerError) -> Unit`        | `Defaults.Error(error)`                     | Slot after payment failure. Shows retry and "try other methods" options. |

### Screen Slots

Override any slot to customize that screen while keeping default behavior for others:

```kotlin
PrimerCheckoutSheet(
    checkout = checkout,
    // Custom card form with rearranged fields
    cardForm = {
        val controller = rememberCardFormController(checkout)
        PrimerCardForm(
            controller = controller,
            cardDetails = {
                Column {
                    CardFormDefaults.CardholderField(controller)
                    CardFormDefaults.CardNumberField(controller)
                    Row {
                        CardFormDefaults.ExpiryField(controller, Modifier.weight(1f))
                        Spacer(Modifier.width(8.dp))
                        CardFormDefaults.CvvField(controller, Modifier.weight(1f))
                    }
                }
            },
        )
    },
    // Custom success screen
    success = { data ->
        Column(
            modifier = Modifier.fillMaxWidth().padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
        ) {
            Icon(Icons.Default.CheckCircle, contentDescription = null, tint = Color.Green)
            Text("Payment ${data.payment.id} confirmed!")
        }
    },
)
```

### PrimerCheckoutSheetDefaults

Pre-built composable implementations for each screen slot:

```kotlin
object PrimerCheckoutSheetDefaults {
    @Composable fun Splash()
    @Composable fun Loading()
    @Composable fun Success(checkoutData: PrimerCheckoutData)
    @Composable fun Error(error: PrimerError)
    @Composable fun PaymentMethodSelection(checkout: PrimerCheckoutController)
    @Composable fun VaultedMethods(checkout: PrimerCheckoutController)
    @Composable fun PaymentMethods(checkout: PrimerCheckoutController)
}
```

| Function                           | Description                                                                   |
| ---------------------------------- | ----------------------------------------------------------------------------- |
| `Splash()`                         | Brief splash screen with Primer logo and loading animation                    |
| `Loading()`                        | Centered circular progress indicator during payment processing                |
| `Success(checkoutData)`            | Checkmark animation and payment confirmation. Auto-dismisses after 3 seconds. |
| `Error(error)`                     | Error message with retry and "try other methods" options                      |
| `PaymentMethodSelection(checkout)` | Vaulted methods (if any) + available payment methods                          |
| `VaultedMethods(checkout)`         | Saved payment methods section only                                            |
| `PaymentMethods(checkout)`         | Available payment methods section only (excluding vaulted)                    |

## PrimerCheckoutHost

Inline host composable for embedding checkout components directly in your layout.

### Full Composable Signature

```kotlin
@Composable
fun PrimerCheckoutHost(
    checkout: PrimerCheckoutController,
    modifier: Modifier = Modifier,
    onEvent: (PrimerCheckoutEvent) -> Unit = {},
    theme: PrimerTheme = PrimerTheme(),
    content: @Composable () -> Unit,
)
```

| Parameter  | Type                            | Default         | Description                                                     |
| ---------- | ------------------------------- | --------------- | --------------------------------------------------------------- |
| `checkout` | `PrimerCheckoutController`      | Required        | Checkout controller providing session state to child components |
| `modifier` | `Modifier`                      | `Modifier`      | Modifier applied to the host container                          |
| `onEvent`  | `(PrimerCheckoutEvent) -> Unit` | `{}`            | Payment outcome events                                          |
| `theme`    | `PrimerTheme`                   | `PrimerTheme()` | Design tokens applied to all SDK components within the host     |
| `content`  | `@Composable () -> Unit`        | Required        | Your custom layout containing SDK components (trailing lambda)  |

### What It Provides

1. **PrimerTheme** -- applies design tokens so child components inherit your styling
2. **CompositionLocal providers** -- injects checkout context so `remember*Controller()` functions work
3. **Overlay management** -- renders overlays for 3DS challenges and redirect flows automatically

Without `PrimerCheckoutHost`, SDK components like `PrimerCardForm` and `PrimerPaymentMethods` will not function.

### When to Use Host vs Sheet

| Feature               | PrimerCheckoutSheet             | PrimerCheckoutHost           |
| --------------------- | ------------------------------- | ---------------------------- |
| Presentation          | Modal bottom sheet              | Inline in your layout        |
| Navigation            | Built-in screen transitions     | You manage navigation        |
| Dismissal             | Swipe, back press, auto-dismiss | You control visibility       |
| Success/error screens | Built-in slots (customizable)   | You build your own           |
| 3DS/redirect flows    | Handled within the sheet        | Overlay sheet appears on top |

## PrimerSettings

Configuration class for SDK behavior. Pass to `rememberPrimerCheckoutController()`.

### Data Class Definition

```kotlin
data class PrimerSettings(
    var paymentHandling: PrimerPaymentHandling = PrimerPaymentHandling.AUTO,
    var locale: Locale = Locale.getDefault(),
    var paymentMethodOptions: PrimerPaymentMethodOptions = PrimerPaymentMethodOptions(),
    var uiOptions: PrimerUIOptions = PrimerUIOptions(),
    var debugOptions: PrimerDebugOptions = PrimerDebugOptions(),
    var clientSessionCachingEnabled: Boolean = false,
    var apiVersion: PrimerApiVersion = PrimerApiVersion.V2_4,
)
```

| Property                      | Type                         | Default                        | Description                                                                           |
| ----------------------------- | ---------------------------- | ------------------------------ | ------------------------------------------------------------------------------------- |
| `paymentHandling`             | `PrimerPaymentHandling`      | `AUTO`                         | Controls whether the SDK processes payments automatically or delegates to your server |
| `locale`                      | `Locale`                     | `Locale.getDefault()`          | Forces the SDK locale for translations and formatting                                 |
| `paymentMethodOptions`        | `PrimerPaymentMethodOptions` | `PrimerPaymentMethodOptions()` | Payment method-specific configuration                                                 |
| `uiOptions`                   | `PrimerUIOptions`            | `PrimerUIOptions()`            | UI behavior settings                                                                  |
| `debugOptions`                | `PrimerDebugOptions`         | `PrimerDebugOptions()`         | Debug and development options                                                         |
| `clientSessionCachingEnabled` | `Boolean`                    | `false`                        | Caches the client session to reduce network requests                                  |
| `apiVersion`                  | `PrimerApiVersion`           | `V2_4`                         | Primer API version used for backend communication                                     |

### PrimerPaymentHandling

| Value  | Description                                                            |
| ------ | ---------------------------------------------------------------------- |
| `AUTO` | SDK processes payment end-to-end. Emits `Success` or `Failure` events. |

### PrimerUIOptions

```kotlin
data class PrimerUIOptions(
    var isInitScreenEnabled: Boolean = true,
    var isSuccessScreenEnabled: Boolean = true,
    var isErrorScreenEnabled: Boolean = true,
    var dismissalMechanism: List<DismissalMechanism> = listOf(DismissalMechanism.GESTURES),
    var theme: PrimerTheme = PrimerTheme(),
    var cardFormUIOptions: PrimerCardFormUIOptions = PrimerCardFormUIOptions(),
)
```

| Property                 | Type                       | Default                     | Description                                           |
| ------------------------ | -------------------------- | --------------------------- | ----------------------------------------------------- |
| `isInitScreenEnabled`    | `Boolean`                  | `true`                      | Shows a loading screen while the checkout initializes |
| `isSuccessScreenEnabled` | `Boolean`                  | `true`                      | Shows a success screen after payment completes        |
| `isErrorScreenEnabled`   | `Boolean`                  | `true`                      | Shows an error screen when a payment fails            |
| `dismissalMechanism`     | `List<DismissalMechanism>` | `[GESTURES]`                | How the user can dismiss the checkout sheet           |
| `theme`                  | `PrimerTheme`              | `PrimerTheme()`             | Visual theme for all SDK components                   |
| `cardFormUIOptions`      | `PrimerCardFormUIOptions`  | `PrimerCardFormUIOptions()` | Card form-specific UI options                         |

#### DismissalMechanism

| Value          | Description                                |
| -------------- | ------------------------------------------ |
| `GESTURES`     | Dismiss by tapping outside or swiping down |
| `CLOSE_BUTTON` | Shows a close button in the sheet header   |

#### PrimerCardFormUIOptions

| Property              | Type      | Default | Description                                                                   |
| --------------------- | --------- | ------- | ----------------------------------------------------------------------------- |
| `payButtonAddNewCard` | `Boolean` | `false` | When `true`, the card form button shows "Add new card" instead of "Pay $X.XX" |

### PrimerPaymentMethodOptions

```kotlin
data class PrimerPaymentMethodOptions(
    var redirectScheme: String? = null,
    var googlePayOptions: PrimerGooglePayOptions = PrimerGooglePayOptions(),
    var klarnaOptions: PrimerKlarnaOptions = PrimerKlarnaOptions(),
    var threeDsOptions: PrimerThreeDsOptions = PrimerThreeDsOptions(),
    var stripeOptions: PrimerStripeOptions = PrimerStripeOptions(),
)
```

| Property           | Type                     | Default                    | Description                                                                                                                       |
| ------------------ | ------------------------ | -------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `redirectScheme`   | `String?`                | `null`                     | Deep link scheme for returning from third-party apps (e.g., `"myapp://primer"`). Required for 3DS, PayPal, Klarna redirect flows. |
| `googlePayOptions` | `PrimerGooglePayOptions` | `PrimerGooglePayOptions()` | Google Pay configuration                                                                                                          |
| `klarnaOptions`    | `PrimerKlarnaOptions`    | `PrimerKlarnaOptions()`    | Klarna configuration                                                                                                              |
| `threeDsOptions`   | `PrimerThreeDsOptions`   | `PrimerThreeDsOptions()`   | 3D Secure configuration                                                                                                           |
| `stripeOptions`    | `PrimerStripeOptions`    | `PrimerStripeOptions()`    | Stripe ACH configuration                                                                                                          |

#### PrimerGooglePayOptions

| Property                        | Type                                     | Default | Description                                                  |
| ------------------------------- | ---------------------------------------- | ------- | ------------------------------------------------------------ |
| `merchantName`                  | `String?`                                | `null`  | Merchant name displayed in the Google Pay sheet              |
| `buttonStyle`                   | `GooglePayButtonStyle`                   | --      | Button appearance: `WHITE` or `BLACK`                        |
| `captureBillingAddress`         | `Boolean`                                | `false` | Requests billing address from Google Pay                     |
| `existingPaymentMethodRequired` | `Boolean`                                | `false` | Only shows Google Pay if the user has a saved payment method |
| `shippingAddressParameters`     | `PrimerGoogleShippingAddressParameters?` | `null`  | Shipping address requirements (has `phoneNumberRequired`)    |
| `requireShippingMethod`         | `Boolean`                                | `false` | Requires a shipping method selection                         |
| `emailAddressRequired`          | `Boolean`                                | `false` | Requests email from Google Pay                               |
| `buttonOptions`                 | `GooglePayButtonOptions`                 | --      | Button customization (`buttonTheme`, `buttonType`)           |

#### PrimerKlarnaOptions

| Property                      | Type      | Default | Description                                     |
| ----------------------------- | --------- | ------- | ----------------------------------------------- |
| `recurringPaymentDescription` | `String?` | `null`  | Description shown for recurring Klarna payments |
| `returnIntentUrl`             | `String?` | `null`  | Return URL after Klarna authorization           |

#### PrimerThreeDsOptions

| Property                 | Type      | Default | Description                               |
| ------------------------ | --------- | ------- | ----------------------------------------- |
| `threeDsAppRequestorUrl` | `String?` | `null`  | App requestor URL for 3DS2 authentication |

#### PrimerStripeOptions

| Property         | Type           | Default | Description                                                                                                                                                               |
| ---------------- | -------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `mandateData`    | `MandateData?` | `null`  | ACH mandate text. Use `TemplateMandateData(merchantName)` for standard template, or `FullMandateStringData(value)` / `FullMandateData(@StringRes value)` for custom text. |
| `publishableKey` | `String?`      | `null`  | Stripe publishable key                                                                                                                                                    |

### PrimerDebugOptions

| Property                  | Type      | Default | Description                                                          |
| ------------------------- | --------- | ------- | -------------------------------------------------------------------- |
| `is3DSSanityCheckEnabled` | `Boolean` | `true`  | Enables 3DS security sanity checks. Disable only during development. |

### PrimerApiVersion

| Value  | Description                     |
| ------ | ------------------------------- |
| `V2_4` | Primer API version 2.4 (latest) |

### Settings Usage Example

```kotlin
val settings = PrimerSettings(
    locale = Locale.GERMANY,
    uiOptions = PrimerUIOptions(
        isInitScreenEnabled = false,
        dismissalMechanism = listOf(DismissalMechanism.CLOSE_BUTTON),
    ),
    paymentMethodOptions = PrimerPaymentMethodOptions(
        redirectScheme = "myapp://primer",
        googlePayOptions = PrimerGooglePayOptions(
            merchantName = "My Store",
            captureBillingAddress = true,
        ),
    ),
)

val checkout = rememberPrimerCheckoutController(
    clientToken = clientToken,
    settings = settings,
)
```

## Card Form

### PrimerCardForm Composable

Composable that renders a card payment form with card details, optional billing address, and submit button. Each section is a slot parameter.

```kotlin
@Composable
fun PrimerCardForm(
    controller: PrimerCardFormController,
    modifier: Modifier = Modifier,
    cardDetails: @Composable () -> Unit = { CardFormDefaults.CardDetailsContent(controller) },
    billingAddress: @Composable () -> Unit = { CardFormDefaults.BillingAddressContent(controller) },
    submitButton: @Composable () -> Unit = { CardFormDefaults.SubmitButton(controller) },
)
```

| Parameter        | Type                       | Default                                              | Description                                                              |
| ---------------- | -------------------------- | ---------------------------------------------------- | ------------------------------------------------------------------------ |
| `controller`     | `PrimerCardFormController` | Required                                             | Controller managing form state, validation, and submission               |
| `modifier`       | `Modifier`                 | `Modifier`                                           | Modifier applied to the root container                                   |
| `cardDetails`    | `@Composable () -> Unit`   | `CardFormDefaults.CardDetailsContent(controller)`    | Slot for card input fields (number, expiry, CVV, cardholder name)        |
| `billingAddress` | `@Composable () -> Unit`   | `CardFormDefaults.BillingAddressContent(controller)` | Slot for billing address fields. Only rendered when required by session. |
| `submitButton`   | `@Composable () -> Unit`   | `CardFormDefaults.SubmitButton(controller)`          | Slot for the submit/pay button                                           |

Default layout order: CardNumberField, ExpiryField + CvvField (side by side), CardholderField, billing address fields, SubmitButton.

### PrimerCardFormController

Controller interface for the card payment form.

#### Creation

```kotlin
@Composable
fun rememberCardFormController(
    checkout: PrimerCheckoutController,
): PrimerCardFormController
```

Must be called inside `PrimerCheckoutHost` content or a `PrimerCheckoutSheet` slot.

#### Field Update Methods

| Method                                | Parameter        | Description                                      |
| ------------------------------------- | ---------------- | ------------------------------------------------ |
| `updateCardNumber(value: String)`     | Raw card number  | Updates card number. Triggers network detection. |
| `updateCvv(value: String)`            | CVV digits       | Updates CVV field                                |
| `updateExpiryDate(value: String)`     | Raw expiry input | Updates expiry date. Auto-formats to MM/YY.      |
| `updateCardholderName(value: String)` | Full name        | Updates cardholder name                          |
| `updatePostalCode(value: String)`     | Postal/ZIP code  | Updates billing postal code                      |
| `updateCountryCode(value: String)`    | ISO country code | Updates billing country code                     |
| `updateCity(value: String)`           | City name        | Updates billing city                             |
| `updateState(value: String)`          | State/region     | Updates billing state                            |
| `updateAddressLine1(value: String)`   | Street address   | Updates billing address line 1                   |
| `updateAddressLine2(value: String)`   | Apt, suite, etc. | Updates billing address line 2                   |
| `updatePhoneNumber(value: String)`    | Phone number     | Updates billing phone number                     |
| `updateFirstName(value: String)`      | First name       | Updates billing first name                       |
| `updateLastName(value: String)`       | Last name        | Updates billing last name                        |

#### Action Methods

| Method                                                                | Description                                                                                                 |
| --------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `submit()`                                                            | Submits the form for tokenization and payment. Sets `state.isLoading` to `true` during submission.          |
| `selectCardNetwork(network: PrimerCardNetwork)`                       | Selects a network for co-badged cards. Only applicable when `state.networkSelection` has multiple networks. |
| `onFieldFocusChange(type: PrimerInputElementType, hasFocus: Boolean)` | Notifies controller of field focus changes. Triggers on-blur validation.                                    |
| `requestCountrySelection()`                                           | Opens the country selection picker UI                                                                       |
| `setVaultOnSuccess(vault: Boolean)`                                   | Configures whether to save the payment method to vault after success. Requires `customerId` in session.     |

### Controller State Data Class

```kotlin
data class State(
    val cardFields: List<PrimerInputElementType>,
    val billingFields: List<PrimerInputElementType>,
    val fieldErrors: List<PrimerFieldError>?,
    val data: Map<PrimerInputElementType, String>,
    val isLoading: Boolean,
    val isFormEnabled: Boolean,
    val selectedCountry: PrimerCountry?,
    val networkSelection: NetworkSelection?,
    val fieldFocusStates: Map<PrimerInputElementType, Boolean>,
    val isFormValid: Boolean,
    val vaultOnSuccess: Boolean,
)
```

| Property           | Type                                   | Description                                                            |
| ------------------ | -------------------------------------- | ---------------------------------------------------------------------- |
| `cardFields`       | `List<PrimerInputElementType>`         | Card input fields required by the session                              |
| `billingFields`    | `List<PrimerInputElementType>`         | Billing address fields required by the session. Empty if not required. |
| `fieldErrors`      | `List<PrimerFieldError>?`              | Validation errors per field. `null` before first validation.           |
| `data`             | `Map<PrimerInputElementType, String>`  | Current field values keyed by input element type                       |
| `isLoading`        | `Boolean`                              | `true` while submitting a payment                                      |
| `isFormEnabled`    | `Boolean`                              | `true` when the form accepts input. `false` during submission.         |
| `selectedCountry`  | `PrimerCountry?`                       | Selected billing country, or `null`                                    |
| `networkSelection` | `NetworkSelection?`                    | Co-badge network selection data. `null` when card is not co-badged.    |
| `fieldFocusStates` | `Map<PrimerInputElementType, Boolean>` | Focus state per field                                                  |
| `isFormValid`      | `Boolean`                              | `true` when all required fields pass validation. Updates in real-time. |
| `vaultOnSuccess`   | `Boolean`                              | Whether payment method will be saved to vault on success               |

#### NetworkSelection

```kotlin
data class NetworkSelection(
    val availableNetworks: List<PrimerCardNetwork>,
    val selectedNetwork: PrimerCardNetwork?,
)
```

#### PrimerFieldError

```kotlin
data class PrimerFieldError(
    val inputElementType: PrimerInputElementType,
    val errorId: String,
)
```

### CardFormDefaults

Object providing pre-built composable functions for each part of the card form.

#### Card Detail Fields

All field functions accept `controller: PrimerCardFormController` and `modifier: Modifier = Modifier` (except `CardNetworkField` which has no modifier parameter).

| Function                                | Description                                                                          |
| --------------------------------------- | ------------------------------------------------------------------------------------ |
| `CardNumberField(controller, modifier)` | Card number input with auto-formatting (spaces), Luhn validation, and network icon   |
| `ExpiryField(controller, modifier)`     | Expiry date input with MM/YY auto-formatting                                         |
| `CvvField(controller, modifier)`        | CVV input with dynamic length based on card network, password masking                |
| `CardholderField(controller, modifier)` | Cardholder name input. Only rendered when required by session.                       |
| `CardNetworkField(controller)`          | Co-badge network selector. Only rendered for co-badged cards. No modifier parameter. |

#### Billing Address Fields

Only rendered when required by session configuration.

| Function                                  | Description                                 |
| ----------------------------------------- | ------------------------------------------- |
| `CountryCodeField(controller, modifier)`  | Country selector that opens a picker dialog |
| `FirstNameField(controller, modifier)`    | Billing first name input                    |
| `LastNameField(controller, modifier)`     | Billing last name input                     |
| `AddressLine1Field(controller, modifier)` | Street address line 1                       |
| `AddressLine2Field(controller, modifier)` | Street address line 2 (optional)            |
| `CityField(controller, modifier)`         | City name input                             |
| `StateField(controller, modifier)`        | State or region input                       |
| `PostalCodeField(controller, modifier)`   | Postal or ZIP code input                    |

### Content Composables

#### CardDetailsContent

```kotlin
@Composable
fun CardFormDefaults.CardDetailsContent(
    controller: PrimerCardFormController,
    cardNumber: @Composable () -> Unit = { CardNumberField(controller) },
    expiryDate: @Composable () -> Unit = { ExpiryField(controller) },
    cvv: @Composable () -> Unit = { CvvField(controller) },
    cardholderName: @Composable () -> Unit = { CardholderField(controller) },
)
```

Renders the default card details layout. Each field can be individually replaced via slot parameters.

#### BillingAddressContent

```kotlin
@Composable
fun CardFormDefaults.BillingAddressContent(
    controller: PrimerCardFormController,
    countryCode: @Composable () -> Unit = { CountryCodeField(controller) },
    firstName: @Composable () -> Unit = { FirstNameField(controller) },
    lastName: @Composable () -> Unit = { LastNameField(controller) },
    addressLine1: @Composable () -> Unit = { AddressLine1Field(controller) },
    addressLine2: @Composable () -> Unit = { AddressLine2Field(controller) },
    city: @Composable () -> Unit = { CityField(controller) },
    state: @Composable () -> Unit = { StateField(controller) },
    postalCode: @Composable () -> Unit = { PostalCodeField(controller) },
)
```

Renders the default billing address layout. Only renders fields required by the session.

#### SubmitButton

```kotlin
@Composable
fun CardFormDefaults.SubmitButton(
    controller: PrimerCardFormController,
    modifier: Modifier = Modifier,
)
```

Default pay button that displays the formatted amount, disables when invalid or submitting, and shows a loading indicator during submission.

### Card Field Components Detail

#### CardNumberField

| Aspect             | Detail                                                                                  |
| ------------------ | --------------------------------------------------------------------------------------- |
| Auto-formatting    | Groups digits with spaces (e.g., `4242 4242 4242 4242`)                                 |
| Max length         | 16-19 digits depending on detected network                                              |
| Keyboard type      | `KeyboardType.Number`                                                                   |
| Validation         | Luhn algorithm check, minimum length per network                                        |
| Validation timing  | On blur (when user taps another field)                                                  |
| Trailing icon      | Detected card network logo(s)                                                           |
| Network detection  | Local detection begins after 1st digit; remote detection after 8th digit                |
| Supported networks | Visa, Mastercard, Amex, Discover, Diners Club, JCB, UnionPay, Maestro, Cartes Bancaires |

#### ExpiryField

| Aspect          | Detail                                                    |
| --------------- | --------------------------------------------------------- |
| Auto-formatting | Inserts `/` automatically (typing `1225` becomes `12/25`) |
| Max length      | 5 characters (MM/YY)                                      |
| Keyboard        | `KeyboardType.Number`                                     |
| Validation      | Valid month (01-12), future date                          |

#### CvvField

| Aspect     | Detail                                           |
| ---------- | ------------------------------------------------ |
| Max length | 4 digits for Amex, 3 for other networks          |
| Keyboard   | `KeyboardType.Number`                            |
| Visual     | Password masking (dots)                          |
| Dynamic    | Max length updates when card network is detected |

#### CardholderField

| Aspect     | Detail                                                        |
| ---------- | ------------------------------------------------------------- |
| Keyboard   | `KeyboardType.Text` with `KeyboardCapitalization.Words`       |
| Validation | Required (non-empty) when session requires cardholder name    |
| Visibility | Only rendered when `CARDHOLDER_NAME` is in `state.cardFields` |

#### CardNetworkField

| Aspect                | Detail                                                       |
| --------------------- | ------------------------------------------------------------ |
| Visibility            | Only rendered when card has multiple networks (co-badged)    |
| Interaction           | Tapping a chip calls `controller.selectCardNetwork(network)` |
| No modifier parameter | Unlike other fields                                          |

#### Billing Address Field Summary

| Field               | Keyboard             | Validation                         | Notes                                                   |
| ------------------- | -------------------- | ---------------------------------- | ------------------------------------------------------- |
| `CountryCodeField`  | --                   | Required                           | Read-only; opens picker via `requestCountrySelection()` |
| `FirstNameField`    | `Text` + `Words` cap | Required                           | --                                                      |
| `LastNameField`     | `Text` + `Words` cap | Required                           | --                                                      |
| `AddressLine1Field` | `Text`               | Required                           | --                                                      |
| `AddressLine2Field` | `Text`               | Optional                           | --                                                      |
| `CityField`         | `Text`               | Required                           | --                                                      |
| `StateField`        | `Text`               | Required                           | Label adapts to selected country                        |
| `PostalCodeField`   | `Text`               | Required, format varies by country | Label adapts to selected country                        |

### Validation Behavior

1. **While typing** -- no error messages shown. `isFormValid` updates in real-time.
2. **On blur** -- field is validated and any error is added to `state.fieldErrors`.
3. **Error display** -- inline error text below the field using theme error color.
4. **Error clearing** -- errors clear when corrected and re-validated on next blur.

Use `isFormValid` for submit button state. Use `fieldErrors` for error messages.

## Payment Methods

### PrimerPaymentMethods Composable

```kotlin
@Composable
fun PrimerPaymentMethods(
    controller: PrimerPaymentMethodsController,
    modifier: Modifier = Modifier,
    header: @Composable () -> Unit = { PaymentMethodsDefaults.SectionHeader() },
    method: @Composable (PrimerPaymentMethod, () -> Unit) -> Unit = { paymentMethod, onClick ->
        PaymentMethodsDefaults.Method(paymentMethod, onClick)
    },
)
```

| Parameter    | Type                                                    | Default                                  | Description                                                                   |
| ------------ | ------------------------------------------------------- | ---------------------------------------- | ----------------------------------------------------------------------------- |
| `controller` | `PrimerPaymentMethodsController`                        | Required                                 | Controller providing available payment methods                                |
| `modifier`   | `Modifier`                                              | `Modifier`                               | Modifier applied to the root container                                        |
| `header`     | `@Composable () -> Unit`                                | `PaymentMethodsDefaults.SectionHeader()` | Slot for section header above the list                                        |
| `method`     | `@Composable (PrimerPaymentMethod, () -> Unit) -> Unit` | `PaymentMethodsDefaults.Method(...)`     | Slot for each payment method item. Receives method data and onClick callback. |

Default behavior: renders a "Pay with" header, a vertical list of methods with icon, name, and optional surcharge, groups methods by surcharge amount. Shows `PaymentMethodsDefaults.EmptyState()` when no methods are available.

### PrimerPaymentMethodsController

```kotlin
@Composable
fun rememberPaymentMethodsController(
    checkout: PrimerCheckoutController,
): PrimerPaymentMethodsController
```

Must be called inside `PrimerCheckoutHost` content or a `PrimerCheckoutSheet` slot.

| Member           | Type                                   | Description                                                                                   |
| ---------------- | -------------------------------------- | --------------------------------------------------------------------------------------------- |
| `methods`        | `StateFlow<List<PrimerPaymentMethod>>` | Available payment methods for the current session. Updates on `checkout.refresh()`.           |
| `select(method)` | Method                                 | Selects a payment method to begin its payment flow (card form, redirect, native wallet, etc.) |

### PrimerPaymentMethod Data Class

```kotlin
data class PrimerPaymentMethod(
    val paymentMethodType: String,
    val paymentMethodName: String?,
    val iconUrl: String?,
    val surcharge: Amount?,
)
```

| Property            | Type      | Description                                                                    |
| ------------------- | --------- | ------------------------------------------------------------------------------ |
| `paymentMethodType` | `String`  | Payment method identifier (e.g., `"PAYMENT_CARD"`, `"PAYPAL"`, `"GOOGLE_PAY"`) |
| `paymentMethodName` | `String?` | Human-readable display name                                                    |
| `iconUrl`           | `String?` | URL to the payment method icon image                                           |
| `surcharge`         | `Amount?` | Surcharge amount, or `null` if none                                            |

Common payment method types: `"PAYMENT_CARD"`, `"PAYPAL"`, `"GOOGLE_PAY"`, `"KLARNA"`, `"APPLE_PAY"`, `"IDEAL"`, `"BANCONTACT"`, `"SOFORT"`.

### PrimerVaultedPaymentMethodsController

Controller for saved payment methods.

```kotlin
@Composable
fun rememberVaultedPaymentMethodsController(
    checkout: PrimerCheckoutController,
): PrimerVaultedPaymentMethodsController
```

Must be called inside `PrimerCheckoutHost` content or a `PrimerCheckoutSheet` slot.

| Member           | Type                                          | Description                                                                             |
| ---------------- | --------------------------------------------- | --------------------------------------------------------------------------------------- |
| `methods`        | `StateFlow<List<PrimerVaultedPaymentMethod>>` | Saved payment methods for the current customer. Empty while loading or when none exist. |
| `select(method)` | Method                                        | Pay with a saved method. Automatically shows CVV recapture if required.                 |
| `delete(method)` | Method                                        | Delete a saved method. Shows a confirmation dialog before deletion.                     |
| `showAll()`      | Method                                        | Open the full vaulted methods management screen.                                        |

#### PrimerVaultedPaymentMethod

```kotlin
data class PrimerVaultedPaymentMethod(
    val id: String,
    val analyticsId: String,
    val paymentInstrumentType: String,
    val paymentMethodType: String,
    val paymentInstrumentData: PaymentInstrumentData?,
    val threeDSecureAuthentication: ThreeDSecureAuthentication?,
)
```

| Property                     | Type                          | Description                               |
| ---------------------------- | ----------------------------- | ----------------------------------------- |
| `id`                         | `String`                      | Unique identifier for this vaulted method |
| `analyticsId`                | `String`                      | Analytics tracking identifier             |
| `paymentInstrumentType`      | `String`                      | Instrument type (e.g., `"PAYMENT_CARD"`)  |
| `paymentMethodType`          | `String`                      | Payment method type identifier            |
| `paymentInstrumentData`      | `PaymentInstrumentData?`      | Card or payment method details            |
| `threeDSecureAuthentication` | `ThreeDSecureAuthentication?` | 3DS authentication data, if available     |

#### PaymentInstrumentData

| Property            | Type                 | Description                                   |
| ------------------- | -------------------- | --------------------------------------------- |
| `network`           | `String?`            | Card network (e.g., `"Visa"`, `"Mastercard"`) |
| `cardholderName`    | `String?`            | Cardholder name                               |
| `first6Digits`      | `String?`            | First 6 digits (BIN)                          |
| `last4Digits`       | `String?`            | Last 4 digits for display                     |
| `expirationMonth`   | `String?`            | Expiry month (MM)                             |
| `expirationYear`    | `String?`            | Expiry year (YYYY)                            |
| `externalPayerInfo` | `ExternalPayerInfo?` | External payer details (e.g., PayPal email)   |
| `binData`           | `BinData?`           | BIN data for card routing                     |
| `bankName`          | `String?`            | Bank name for bank-based methods              |

#### PrimerVaultedPaymentMethods Composable

```kotlin
@Composable
fun PrimerVaultedPaymentMethods(
    controller: PrimerVaultedPaymentMethodsController,
    modifier: Modifier = Modifier,
    header: @Composable () -> Unit = { VaultedPaymentMethodsDefaults.SectionHeader() },
    item: @Composable (PrimerVaultedPaymentMethod) -> Unit = {
        VaultedPaymentMethodsDefaults.Method(it, controller)
    },
    submitButton: @Composable () -> Unit = {},
)
```

#### VaultedPaymentMethodsDefaults

| Function                     | Description                                                           |
| ---------------------------- | --------------------------------------------------------------------- |
| `SectionHeader()`            | Default section header ("Saved payment methods")                      |
| `Method(method, controller)` | Default method row with card details, network icon, and delete action |

### PaymentMethodsDefaults

```kotlin
object PaymentMethodsDefaults {
    @Composable fun SectionHeader()
    @Composable fun Method(method: PrimerPaymentMethod, onClick: () -> Unit)
    @Composable fun EmptyState(modifier: Modifier = Modifier)
}
```

| Function                  | Description                                                          |
| ------------------------- | -------------------------------------------------------------------- |
| `SectionHeader()`         | Default "Pay with" header styled with the current theme              |
| `Method(method, onClick)` | Payment method item with icon, name, optional surcharge, and chevron |
| `EmptyState(modifier)`    | Message displayed when no payment methods are available              |

## Theming

### PrimerTheme

Root theme container holding all design token groups.

```kotlin
data class PrimerTheme(
    val lightColorTokens: LightColorTokens = LightColorTokens(),
    val darkColorTokens: DarkColorTokens = DarkColorTokens(),
    val borderWidthTokens: BorderWidthTokens = BorderWidthTokens(),
    val radiusTokens: RadiusTokens = RadiusTokens(),
    val sizeTokens: SizeTokens = SizeTokens(),
    val spacingTokens: SpacingTokens = SpacingTokens(),
    val typographyTokens: TypographyTokens = TypographyTokens(),
)
```

| Property            | Type                | Description                                             |
| ------------------- | ------------------- | ------------------------------------------------------- |
| `lightColorTokens`  | `LightColorTokens`  | Color tokens for light mode                             |
| `darkColorTokens`   | `DarkColorTokens`   | Color tokens for dark mode. Extends `LightColorTokens`. |
| `borderWidthTokens` | `BorderWidthTokens` | Border widths for inputs, focus rings, dividers         |
| `radiusTokens`      | `RadiusTokens`      | Corner radius for cards, inputs, bottom sheets          |
| `sizeTokens`        | `SizeTokens`        | Sizes for icons and touch targets                       |
| `spacingTokens`     | `SpacingTokens`     | Padding and margin values                               |
| `typographyTokens`  | `TypographyTokens`  | Font sizes, weights, and line heights                   |

### Token Groups

#### LightColorTokens and DarkColorTokens

16 base tokens + 26 semantic tokens. `DarkColorTokens` extends `LightColorTokens` and overrides 15 base tokens. Override base tokens to change foundational colors -- all semantic tokens resolve through them.

**Base tokens (16):**

| Token                                 | Light       | Dark        | Purpose                         |
| ------------------------------------- | ----------- | ----------- | ------------------------------- |
| `primerColorBrand`                    | `#2F98FF`   | `#2F98FF`   | Primary brand color             |
| `primerColorGray000`                  | `#FFFFFF`   | `#171619`   | Lightest gray (background base) |
| `primerColorGray100`                  | `#F5F5F5`   | `#292929`   | Very light gray                 |
| `primerColorGray200`                  | `#EEEEEE`   | `#424242`   | Light gray                      |
| `primerColorGray300`                  | `#E0E0E0`   | `#575757`   | Medium-light gray               |
| `primerColorGray400`                  | `#BDBDBD`   | `#858585`   | Medium gray                     |
| `primerColorGray500`                  | `#9E9E9E`   | `#767577`   | Gray                            |
| `primerColorGray600`                  | `#757575`   | `#C7C7C7`   | Medium-dark gray                |
| `primerColorGray900`                  | `#212121`   | `#EFEFEF`   | Darkest gray (text base)        |
| `primerColorRed100`                   | `#FFECEC`   | `#321C20`   | Error background                |
| `primerColorRed500`                   | `#FF7279`   | `#E46D70`   | Error accent                    |
| `primerColorRed900`                   | `#B4324B`   | `#F6BFBF`   | Error text                      |
| `primerColorGreen500`                 | `#3EB68F`   | `#27B17D`   | Success accent                  |
| `primerColorBlue500`                  | `#399DFF`   | `#3F93E4`   | Info accent                     |
| `primerColorBlue900`                  | `#2270F4`   | `#4AAEFF`   | Link color                      |
| `primerColorBorderTransparentDefault` | transparent | transparent | Transparent border base         |

**Key semantic tokens:**

| Token                               | Resolves to           | Purpose               |
| ----------------------------------- | --------------------- | --------------------- |
| `primerColorTextPrimary`            | `primerColorGray900`  | Main text             |
| `primerColorTextSecondary`          | `primerColorGray600`  | Labels, descriptions  |
| `primerColorTextPlaceholder`        | `primerColorGray500`  | Input placeholders    |
| `primerColorTextDisabled`           | `primerColorGray400`  | Disabled text         |
| `primerColorTextNegative`           | `primerColorRed900`   | Error messages        |
| `primerColorTextLink`               | `primerColorBlue900`  | Clickable links       |
| `primerColorBackground`             | `primerColorGray000`  | Primary background    |
| `primerColorBorderOutlinedDefault`  | `primerColorGray300`  | Default input border  |
| `primerColorBorderOutlinedHover`    | `primerColorGray400`  | Hovered input border  |
| `primerColorBorderOutlinedActive`   | `primerColorGray500`  | Active input border   |
| `primerColorBorderOutlinedFocus`    | `primerColorFocus`    | Focused input border  |
| `primerColorBorderOutlinedDisabled` | `primerColorGray200`  | Disabled input border |
| `primerColorBorderOutlinedError`    | `primerColorRed500`   | Error input border    |
| `primerColorBorderOutlinedLoading`  | `primerColorGray200`  | Loading input border  |
| `primerColorBorderOutlinedSelected` | `primerColorBrand`    | Selected item border  |
| `primerColorIconPrimary`            | `primerColorGray900`  | Default icon          |
| `primerColorIconDisabled`           | `primerColorGray400`  | Disabled icon         |
| `primerColorIconNegative`           | `primerColorRed500`   | Error icon            |
| `primerColorIconPositive`           | `primerColorGreen500` | Success icon          |
| `primerColorFocus`                  | `primerColorBrand`    | Focus ring            |
| `primerColorLoader`                 | `primerColorBrand`    | Loading indicator     |

Override base tokens by extending `LightColorTokens` or `DarkColorTokens`:

```kotlin
val theme = PrimerTheme(
    lightColorTokens = object : LightColorTokens() {
        override val primerColorBrand: Color = Color(0xFF6C5CE7)
    },
    darkColorTokens = object : DarkColorTokens() {
        override val primerColorBrand: Color = Color(0xFFA29BFE)
    },
)
```

#### SpacingTokens

```kotlin
data class SpacingTokens(
    val xxsmall: Dp = 2.dp,
    val xsmall: Dp = 4.dp,
    val small: Dp = 8.dp,
    val medium: Dp = 12.dp,
    val large: Dp = 16.dp,
    val xlarge: Dp = 20.dp,
    val base: Dp = 4.dp,
)
```

| Token     | Default | Usage                         |
| --------- | ------- | ----------------------------- |
| `xxsmall` | 2.dp    | Icon padding, minimal gaps    |
| `xsmall`  | 4.dp    | Chip padding, tight spacing   |
| `small`   | 8.dp    | Between form fields           |
| `medium`  | 12.dp   | Section internal padding      |
| `large`   | 16.dp   | Container padding, major gaps |
| `xlarge`  | 20.dp   | Between major sections        |
| `base`    | 4.dp    | Base unit for calculations    |

#### TypographyTokens

```kotlin
data class TypographyTokens(
    val titleXlarge: TypographyStyle = TypographyStyle(
        size = 24, weight = 550, lineHeight = 32, letterSpacing = -0.6f,
    ),
    val titleLarge: TypographyStyle = TypographyStyle(
        size = 16, weight = 550, lineHeight = 20, letterSpacing = -0.2f,
    ),
    val bodyLarge: TypographyStyle = TypographyStyle(
        size = 16, weight = 400, lineHeight = 20, letterSpacing = -0.2f,
    ),
    val bodyMedium: TypographyStyle = TypographyStyle(
        size = 14, weight = 400, lineHeight = 20, letterSpacing = 0f,
    ),
    val bodySmall: TypographyStyle = TypographyStyle(
        size = 12, weight = 400, lineHeight = 16, letterSpacing = 0f,
    ),
)
```

| Token         | Size | Weight | Usage                |
| ------------- | ---- | ------ | -------------------- |
| `titleXlarge` | 24sp | 550    | Sheet titles         |
| `titleLarge`  | 16sp | 550    | Section headers      |
| `bodyLarge`   | 16sp | 400    | Input text, body     |
| `bodyMedium`  | 14sp | 400    | Labels, descriptions |
| `bodySmall`   | 12sp | 400    | Helper text, errors  |

Default font: **Inter** variable font. Override `font` to use your own font resource.

##### TypographyStyle

```kotlin
data class TypographyStyle(
    @FontRes val font: Int,
    val letterSpacing: Float,
    val weight: Int,
    val size: Int,
    val lineHeight: Int,
)
```

Has a `toTextStyle()` method that converts to a Compose `TextStyle`.

#### RadiusTokens

```kotlin
data class RadiusTokens(
    val xsmall: Dp = 2.dp,
    val small: Dp = 4.dp,
    val medium: Dp = 8.dp,
    val large: Dp = 12.dp,
    val base: Dp = 4.dp,
)
```

| Token    | Default | Usage                |
| -------- | ------- | -------------------- |
| `xsmall` | 2.dp    | Subtle rounding      |
| `small`  | 4.dp    | Chips, tags          |
| `medium` | 8.dp    | Input fields, cards  |
| `large`  | 12.dp   | Bottom sheet corners |
| `base`   | 4.dp    | Base unit            |

#### BorderWidthTokens

```kotlin
data class BorderWidthTokens(
    val thin: Dp = 1.dp,
    val medium: Dp = 2.dp,
    val thick: Dp = 3.dp,
)
```

| Token    | Default | Usage                         |
| -------- | ------- | ----------------------------- |
| `thin`   | 1.dp    | Input borders, dividers       |
| `medium` | 2.dp    | Focus rings, selected borders |
| `thick`  | 3.dp    | Heavy emphasis borders        |

#### SizeTokens

```kotlin
data class SizeTokens(
    val small: Dp = 16.dp,
    val medium: Dp = 20.dp,
    val large: Dp = 24.dp,
    val xlarge: Dp = 32.dp,
    val xxlarge: Dp = 44.dp,
    val xxxlarge: Dp = 56.dp,
    val base: Dp = 4.dp,
)
```

| Token      | Default | Usage                |
| ---------- | ------- | -------------------- |
| `small`    | 16.dp   | Small icons          |
| `medium`   | 20.dp   | Default icons        |
| `large`    | 24.dp   | Large icons          |
| `xlarge`   | 32.dp   | Payment method icons |
| `xxlarge`  | 44.dp   | Touch targets        |
| `xxxlarge` | 56.dp   | Large touch targets  |
| `base`     | 4.dp    | Base unit            |

### Material 3 Integration

`PrimerTheme` automatically maps color tokens to a Material 3 `ColorScheme`. Material components used within the checkout tree (such as `ModalBottomSheet`) inherit Primer tokens without additional configuration.

Both `PrimerCheckoutSheet` and `PrimerCheckoutHost` wrap content in a `MaterialTheme` that applies this mapping internally.

Key M3 color mappings:

| M3 Role              | Primer Token                                               |
| -------------------- | ---------------------------------------------------------- |
| `primary`            | `primerColorBrand`                                         |
| `onPrimary`          | `primerColorGray000` (light) / `primerColorGray900` (dark) |
| `primaryContainer`   | `primerColorBlue900`                                       |
| `secondary`          | `primerColorGray600`                                       |
| `secondaryContainer` | `primerColorGray200`                                       |
| `background`         | `primerColorBackground`                                    |
| `onBackground`       | `primerColorTextPrimary`                                   |
| `surface`            | `primerColorBackground`                                    |
| `onSurface`          | `primerColorTextPrimary`                                   |
| `surfaceVariant`     | `primerColorGray100`                                       |
| `onSurfaceVariant`   | `primerColorTextSecondary`                                 |
| `surfaceTint`        | `primerColorBrand`                                         |
| `error`              | `primerColorRed500`                                        |
| `onError`            | `primerColorGray000` (light) / `primerColorGray900` (dark) |
| `errorContainer`     | `primerColorRed100`                                        |
| `onErrorContainer`   | `primerColorTextNegative`                                  |
| `outline`            | `primerColorBorderOutlinedDefault`                         |
| `outlineVariant`     | `primerColorGray300`                                       |
| `scrim`              | `Color.Black` (alpha 0.32)                                 |

Overriding a Primer token automatically updates every M3 role that references it.

### LocalPrimerTheme

```kotlin
val LocalPrimerTheme = staticCompositionLocalOf { PrimerTheme() }
```

Compose `CompositionLocal` providing the current `PrimerTheme`. Set automatically by `PrimerCheckoutSheet` and `PrimerCheckoutHost`. Access with `LocalPrimerTheme.current` inside the checkout composable tree.

### colorTokens() Method

```kotlin
@Composable
fun PrimerTheme.colorTokens(darkTheme: Boolean = isSystemInDarkTheme()): LightColorTokens
```

Returns `darkColorTokens` when `darkTheme` is `true`, `lightColorTokens` otherwise. Defaults to the system theme.

## Common Objects

### PrimerError

```kotlin
class PrimerError {
    val errorId: String
    val description: String
    val errorCode: String?
    val diagnosticsId: String
    val recoverySuggestion: String?
}
```

| Property             | Type      | Description                                                                                               |
| -------------------- | --------- | --------------------------------------------------------------------------------------------------------- |
| `errorId`            | `String`  | Unique error identifier for programmatic handling                                                         |
| `description`        | `String`  | Human-readable error message (suitable for logging)                                                       |
| `errorCode`          | `String?` | Specific failure reason (e.g., `"card_declined"`, `"insufficient_funds"`). `null` for non-payment errors. |
| `diagnosticsId`      | `String`  | Unique diagnostics ID. Provide to Primer support when investigating issues.                               |
| `recoverySuggestion` | `String?` | Suggested recovery action. `null` when no recovery applies.                                               |

### PrimerCardNetwork

```kotlin
data class PrimerCardNetwork(
    val network: CardNetwork.Type,
    val displayName: String,
    val allowed: Boolean,
)
```

| Property      | Type               | Description                                                 |
| ------------- | ------------------ | ----------------------------------------------------------- |
| `network`     | `CardNetwork.Type` | The card network type                                       |
| `displayName` | `String`           | Human-readable network name                                 |
| `allowed`     | `Boolean`          | Whether this network is allowed for the current transaction |

#### CardNetwork.Type

```kotlin
enum class CardNetwork.Type {
    OTHER, VISA, MASTERCARD, AMEX, DINERS_CLUB, DISCOVER,
    JCB, UNIONPAY, MAESTRO, ELO, MIR, HIPER, HIPERCARD,
    CARTES_BANCAIRES, DANKORT, EFTPOS,
}
```

### PrimerCountry

```kotlin
data class PrimerCountry(
    val name: String,
    val code: CountryCode,
)
```

`CountryCode` is an ISO 3166-1 alpha-2 enum with 249 values (e.g., `CountryCode.US`, `CountryCode.GB`, `CountryCode.DE`).

#### Country Selection Controller

```kotlin
@Composable
fun rememberCountrySelectionController(): PrimerCountrySelectionController
```

| Member                          | Type               | Description                             |
| ------------------------------- | ------------------ | --------------------------------------- |
| `state`                         | `StateFlow<State>` | Current state of the country picker     |
| `onCountrySelected(code, name)` | Method             | Select a country                        |
| `onSearch(query)`               | Method             | Filter the country list by search query |

State contains: `countries: List<PrimerCountry>`, `filteredCountries: List<PrimerCountry>`, `searchQuery: String`, `isLoading: Boolean`.

### PrimerInputElementType

```kotlin
enum class PrimerInputElementType {
    CARD_NUMBER, EXPIRY_DATE, CVV, CARDHOLDER_NAME,
    COUNTRY_CODE, FIRST_NAME, LAST_NAME,
    ADDRESS_LINE_1, ADDRESS_LINE_2, CITY, STATE, POSTAL_CODE,
}
```

| Value             | Validation                                      |
| ----------------- | ----------------------------------------------- |
| `CARD_NUMBER`     | Luhn check + card network detection             |
| `EXPIRY_DATE`     | MM/YY format, future date                       |
| `CVV`             | Correct length for card network (3 or 4 digits) |
| `CARDHOLDER_NAME` | Non-empty when required                         |
| `COUNTRY_CODE`    | ISO 3166-1 alpha-2                              |
| `FIRST_NAME`      | Non-empty                                       |
| `LAST_NAME`       | Non-empty                                       |
| `ADDRESS_LINE_1`  | Non-empty                                       |
| `ADDRESS_LINE_2`  | Optional                                        |
| `CITY`            | Non-empty                                       |
| `STATE`           | Non-empty                                       |
| `POSTAL_CODE`     | Format varies by country                        |

### SyncValidationError

```kotlin
class SyncValidationError {
    val inputElementType: PrimerInputElementType
    val errorId: String
}
```

## Troubleshooting

### Quick Diagnosis

| Symptom                      | Likely Cause                  | Solution                                                          |
| ---------------------------- | ----------------------------- | ----------------------------------------------------------------- |
| Compose version conflict     | Compiler version mismatch     | Align `kotlinCompilerExtensionVersion`                            |
| Checkout stays in Loading    | Invalid/expired client token  | Check Logcat for errors, regenerate token                         |
| Payment methods empty        | Dashboard misconfiguration    | Verify Dashboard settings and client session fields               |
| Card form fields missing     | Dashboard settings            | Only fields marked required in Dashboard appear                   |
| Recomposition causes re-init | Controller outside `remember` | Use `rememberPrimerCheckoutController()`                          |
| State not updating in UI     | Not lifecycle-aware collect   | Use `collectAsStateWithLifecycle()`                               |
| 3DS challenge stuck          | WebView destroyed on rotation | Add `android:configChanges="orientation\|screenSize"` to Activity |

### Compose Version Conflict

Build fails with Compose compiler version mismatch:

```kotlin
android {
    composeOptions {
        kotlinCompilerExtensionVersion = "1.5.8"
    }
}
```

### Checkout Stays in Loading State

`PrimerCheckoutState.Loading` never transitions to `Ready`:

- Check Logcat for SDK error messages
- Verify the client token is fresh and generated correctly
- Confirm network connectivity
- Ensure API key is correct in client session creation

### Payment Methods Not Showing

`PrimerPaymentMethods` shows empty list:

- Verify payment methods are configured in Primer Dashboard
- Ensure client session includes correct `currencyCode` and `countryCode`
- Check that methods are enabled for the currency/country combination

### Card Form Fields Not Appearing

Some fields (cardholder name, billing address) do not appear -- this is expected. Fields are configured by your Primer Dashboard settings. Only required fields appear.

### 3DS Challenge Not Completing

Ensure your Activity has `android:configChanges="orientation|screenSize"` to prevent the WebView from being destroyed during configuration changes.

### Recomposition Causes Re-initialization

```kotlin
// CORRECT
val checkout = rememberPrimerCheckoutController(clientToken)

// WRONG -- creates new controller on recomposition
val checkout = PrimerCheckoutController(clientToken)
```

### State Not Updating in UI

Use lifecycle-aware state collection:

```kotlin
val state by checkout.state.collectAsStateWithLifecycle()
```

### Validation vs Payment Errors

| Error Type        | When                                             | Handling                                           |
| ----------------- | ------------------------------------------------ | -------------------------------------------------- |
| Validation errors | During input (invalid format, missing fields)    | Automatic by input components; prevents submission |
| Payment failures  | After submission (declined card, network issues) | Explicit handling via `onEvent` callback           |

### Debugging State Changes

```kotlin
LaunchedEffect(checkout) {
    checkout.state.collect { state ->
        Log.d("PrimerCheckout", "State: $state")
    }
}
```

### Logging All Events

```kotlin
PrimerCheckoutSheet(
    checkout = checkout,
    onEvent = { event ->
        Log.d("PrimerCheckout", "Event: $event")
        when (event) {
            is PrimerCheckoutEvent.Success -> { }
            is PrimerCheckoutEvent.Failure -> {
                Log.e("PrimerCheckout", "diagnosticsId: ${event.error.diagnosticsId}")
            }
        }
    },
)
```

### Getting Help

When contacting Primer support, include:

1. The `diagnosticsId` from any error callbacks
2. Your Android API level, Compose version, and SDK version
3. Steps to reproduce the issue

## Critical Best Practices

### Always Use remember\* Functions

All controllers must be created with their `remember*` composable function. Direct construction will not survive recomposition and will cause repeated initialization.

### Always Use collectAsStateWithLifecycle()

When observing `StateFlow` from controllers, always use `collectAsStateWithLifecycle()` from `androidx.lifecycle:lifecycle-runtime-compose`. This ensures state collection respects the Activity/Fragment lifecycle and avoids memory leaks.

```kotlin
val checkoutState by checkout.state.collectAsStateWithLifecycle()
val cardFormState by cardFormController.state.collectAsStateWithLifecycle()
val methods by paymentMethodsController.methods.collectAsStateWithLifecycle()
```

### Set redirectScheme for Redirect Flows

Any payment method that redirects to a third-party app (3DS, PayPal, Klarna) requires a `redirectScheme` in `PrimerPaymentMethodOptions`. Without it, the user cannot return to your app.

```kotlin
val settings = PrimerSettings(
    paymentMethodOptions = PrimerPaymentMethodOptions(
        redirectScheme = "myapp://primer",
    ),
)
```

Register the scheme in your `AndroidManifest.xml`:

```xml
<activity android:name=".CheckoutActivity">
    <intent-filter>
        <action android:name="android.intent.action.VIEW" />
        <category android:name="android.intent.category.DEFAULT" />
        <category android:name="android.intent.category.BROWSABLE" />
        <data android:scheme="myapp" android:host="primer" />
    </intent-filter>
</activity>
```

### Place Controllers at the Right Scope

Create `rememberPrimerCheckoutController` at the screen level. Create child controllers (`rememberCardFormController`, `rememberPaymentMethodsController`) inside `PrimerCheckoutHost` content or `PrimerCheckoutSheet` slots where `CompositionLocal` providers are available.

### Handle Both Success and Failure Events

Always handle both `PrimerCheckoutEvent.Success` and `PrimerCheckoutEvent.Failure` in `onEvent`. Events can fire multiple times per session (retry after failure).

### Use PrimerCheckoutHost for Custom Layouts

If you need full control over layout, navigation, and presentation, use `PrimerCheckoutHost` instead of `PrimerCheckoutSheet`. The host provides the same `CompositionLocal` providers and overlay management but lets you build your own UI structure.

### Prevent 3DS WebView Destruction

Add to your Activity in `AndroidManifest.xml`:

```xml
<activity
    android:name=".CheckoutActivity"
    android:configChanges="orientation|screenSize" />
```

This prevents the WebView from being destroyed during configuration changes, which would cause 3DS challenges to fail.
