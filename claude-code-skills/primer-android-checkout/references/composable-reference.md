# Primer Android Checkout -- Composable Reference

Flat API reference for all composables, controllers, state types, configuration types, and theming types in the Primer Android Checkout SDK (v3.0.0-beta.3). Optimized for AI lookup -- no narrative, signatures and types only.

---

## Import Map

IMPORTANT: Use these exact imports when writing code. The SDK package structure does NOT follow a flat `api.*` convention.

```kotlin
// Checkout presentation (sheet + host + remember function)
import io.primer.checkout.api.checkout.PrimerCheckoutSheet
import io.primer.checkout.api.checkout.PrimerCheckoutHost
import io.primer.checkout.api.checkout.rememberPrimerCheckoutController

// Checkout state, events, controller interface
import io.primer.checkout.api.state.PrimerCheckoutController
import io.primer.checkout.api.state.PrimerCheckoutState
import io.primer.checkout.api.state.PrimerCheckoutEvent
import io.primer.checkout.api.state.formatAmount  // extension on PrimerCheckoutController

// Payment method model (used by PrimerPaymentMethods composable)
import io.primer.checkout.api.checkout.models.PrimerPaymentMethod

// Card form
import io.primer.checkout.components.card.PrimerCardForm
import io.primer.checkout.components.card.CardFormDefaults
import io.primer.checkout.components.card.PrimerCardFormController
import io.primer.checkout.components.card.rememberCardFormController
import io.primer.checkout.components.card.SyncValidationError

// Payment methods list
import io.primer.checkout.components.paymentMethods.PrimerPaymentMethods
import io.primer.checkout.components.paymentMethods.PaymentMethodsDefaults
import io.primer.checkout.components.paymentMethods.PrimerPaymentMethodsController
import io.primer.checkout.components.paymentMethods.rememberPaymentMethodsController

// Vaulted payment methods
import io.primer.checkout.components.paymentMethods.PrimerVaultedPaymentMethods
import io.primer.checkout.components.paymentMethods.VaultedPaymentMethodsDefaults
import io.primer.checkout.components.paymentMethods.PrimerVaultedPaymentMethodsController
import io.primer.checkout.components.paymentMethods.rememberVaultedPaymentMethodsController

// Country selection
import io.primer.checkout.components.country.PrimerCountrySelectionController

// Theming
import io.primer.checkout.PrimerTheme
import io.primer.checkout.LocalPrimerTheme
import io.primer.checkout.internal.tokens.LightColorTokens
import io.primer.checkout.internal.tokens.DarkColorTokens
import io.primer.checkout.internal.tokens.BorderWidthTokens
import io.primer.checkout.internal.tokens.RadiusTokens
import io.primer.checkout.internal.tokens.SizeTokens
import io.primer.checkout.internal.tokens.SpacingTokens
import io.primer.checkout.internal.tokens.TypographyTokens

// Common types from the core SDK (transitive dependencies)
import io.primer.android.components.domain.inputs.models.PrimerInputElementType
import io.primer.android.components.domain.core.models.card.PrimerCardNetwork
import io.primer.android.clientSessionActions.domain.models.PrimerCountry
import io.primer.android.domain.tokenization.models.PrimerVaultedPaymentMethod
import io.primer.android.domain.action.models.PrimerClientSession
```

---

## Controller Creation Functions

### rememberPrimerCheckoutController

```kotlin
@ExperimentalPrimerApi
@Composable
fun rememberPrimerCheckoutController(
    clientToken: String,
    settings: PrimerSettings = PrimerSettings(),
): PrimerCheckoutController
```

### rememberCardFormController

```kotlin
@Composable
fun rememberCardFormController(
    checkout: PrimerCheckoutController,
): PrimerCardFormController
```

Requires `PrimerCheckoutHost` or `PrimerCheckoutSheet` scope.

### rememberPaymentMethodsController

```kotlin
@Composable
fun rememberPaymentMethodsController(
    checkout: PrimerCheckoutController,
): PrimerPaymentMethodsController
```

Requires `PrimerCheckoutHost` or `PrimerCheckoutSheet` scope.

### rememberVaultedPaymentMethodsController

```kotlin
@Composable
fun rememberVaultedPaymentMethodsController(
    checkout: PrimerCheckoutController,
): PrimerVaultedPaymentMethodsController
```

Requires `PrimerCheckoutHost` or `PrimerCheckoutSheet` scope.

### rememberCountrySelectionController

```kotlin
@Composable
fun rememberCountrySelectionController(): PrimerCountrySelectionController
```

### rememberKlarnaController

```kotlin
@Composable
fun rememberKlarnaController(
    checkout: PrimerCheckoutController,
): PrimerKlarnaController
```

Requires `PrimerCheckoutHost` or `PrimerCheckoutSheet` scope.

### rememberQrCodeController

```kotlin
@Composable
fun rememberQrCodeController(
    checkout: PrimerCheckoutController,
    paymentMethodType: String,
): PrimerQrCodeController
```

Requires `PrimerCheckoutHost` or `PrimerCheckoutSheet` scope.

---

## Controller Interfaces

### PrimerCheckoutController

```kotlin
@Stable
interface PrimerCheckoutController {
    val state: StateFlow<PrimerCheckoutState>
    fun refresh()
    fun dismiss()
}
```

Extension:

```kotlin
fun PrimerCheckoutController.formatAmount(amountInCents: Int): String
```

### PrimerCardFormController

```kotlin
interface PrimerCardFormController {
    val state: StateFlow<State>

    // Card field updates
    fun updateCardNumber(value: String)
    fun updateCvv(value: String)
    fun updateExpiryDate(value: String)
    fun updateCardholderName(value: String)

    // Billing field updates
    fun updatePostalCode(value: String)
    fun updateCountryCode(value: String)
    fun updateCity(value: String)
    fun updateState(value: String)
    fun updateAddressLine1(value: String)
    fun updateAddressLine2(value: String)
    fun updatePhoneNumber(value: String)
    fun updateFirstName(value: String)
    fun updateLastName(value: String)

    // Actions
    fun submit()
    fun selectCardNetwork(network: PrimerCardNetwork)
    fun onFieldFocusChange(type: PrimerInputElementType, hasFocus: Boolean)
    fun requestCountrySelection()
    fun setVaultOnSuccess(vault: Boolean)
}
```

### PrimerPaymentMethodsController

```kotlin
interface PrimerPaymentMethodsController {
    val methods: StateFlow<List<PrimerPaymentMethod>>
    fun select(method: PrimerPaymentMethod)
}
```

### PrimerVaultedPaymentMethodsController

```kotlin
interface PrimerVaultedPaymentMethodsController {
    val methods: StateFlow<List<PrimerVaultedPaymentMethod>>
    fun select(method: PrimerVaultedPaymentMethod)
    fun delete(method: PrimerVaultedPaymentMethod)
    fun showAll()
}
```

### PrimerCountrySelectionController

```kotlin
interface PrimerCountrySelectionController {
    val state: StateFlow<State>
    fun onCountrySelected(code: CountryCode, name: String)
    fun onSearch(query: String)

    data class State(
        val countries: List<PrimerCountry>,
        val filteredCountries: List<PrimerCountry>,
        val searchQuery: String,
        val isLoading: Boolean,
    )
}
```

### PrimerKlarnaController

```kotlin
@Stable
interface PrimerKlarnaController {
    val state: StateFlow<State>
    fun selectPaymentCategory(context: Context, categoryId: String)
    fun submitPayment()

    data class Category(val id: String, val name: String, val url: String)
    data class State(
        val step: Step,
        val categories: List<Category>,
        val selectedCategoryId: String?,
        val paymentView: WeakReference<View>?,
    )
    sealed interface Step {
        data object Loading : Step
        data object CategorySelection : Step
        data object ViewReady : Step
        data object AuthorizationStarted : Step
    }
}
```

### PrimerQrCodeController

```kotlin
@Stable
interface PrimerQrCodeController {
    val state: StateFlow<State>

    sealed class State {
        data object Loading : State()
        data class Ready(
            val qrCodeBase64: String,
            val qrCodeUrl: String? = null,
            val expiresAt: String? = null,
        ) : State()
    }
}
```

---

## Composable Components

### PrimerCheckoutSheet

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

### PrimerCheckoutSheetDefaults

```kotlin
object PrimerCheckoutSheetDefaults {
    @Composable fun Splash()
    @Composable fun Loading()
    @Composable fun Success(checkoutData: PrimerCheckoutData)
    @Composable fun Error(error: PrimerError)
    @Composable fun PaymentMethodSelection(
        checkout: PrimerCheckoutController,
        vaultedMethods: @Composable () -> Unit = { VaultedMethods(checkout) },
        paymentMethods: @Composable () -> Unit = { PaymentMethods(checkout) },
    )
    @Composable fun VaultedMethods(checkout: PrimerCheckoutController)
    @Composable fun PaymentMethods(checkout: PrimerCheckoutController)
}
```

### PrimerCheckoutHost

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

### PrimerCardForm

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

### CardFormDefaults -- Content Composables

```kotlin
@Composable
fun CardFormDefaults.CardDetailsContent(
    cardFormState: PrimerCardFormController,
    cardNumber: @Composable () -> Unit = { CardNumberField(cardFormState) },
    expiryDate: @Composable () -> Unit = { ExpiryField(cardFormState) },
    cvv: @Composable () -> Unit = { CvvField(cardFormState) },
    cardholderName: @Composable () -> Unit = { CardholderField(cardFormState) },
)

@Composable
fun CardFormDefaults.BillingAddressContent(
    cardFormState: PrimerCardFormController,
    countryCode: @Composable () -> Unit = { CountryCodeField(cardFormState) },
    firstName: @Composable () -> Unit = { FirstNameField(cardFormState) },
    lastName: @Composable () -> Unit = { LastNameField(cardFormState) },
    addressLine1: @Composable () -> Unit = { AddressLine1Field(cardFormState) },
    addressLine2: @Composable () -> Unit = { AddressLine2Field(cardFormState) },
    city: @Composable () -> Unit = { CityField(cardFormState) },
    stateField: @Composable () -> Unit = { StateField(cardFormState) },
    postalCode: @Composable () -> Unit = { PostalCodeField(cardFormState) },
)

@Composable
fun CardFormDefaults.SubmitButton(
    controller: PrimerCardFormController,
    modifier: Modifier = Modifier,
)
```

### CardFormDefaults -- Card Detail Fields

```kotlin
@Composable fun CardFormDefaults.CardNumberField(controller: PrimerCardFormController, modifier: Modifier = Modifier)
@Composable fun CardFormDefaults.ExpiryField(controller: PrimerCardFormController, modifier: Modifier = Modifier)
@Composable fun CardFormDefaults.CvvField(controller: PrimerCardFormController, modifier: Modifier = Modifier)
@Composable fun CardFormDefaults.CardholderField(controller: PrimerCardFormController, modifier: Modifier = Modifier)
@Composable fun CardFormDefaults.CardNetworkField(controller: PrimerCardFormController)  // no modifier
```

### CardFormDefaults -- Billing Address Fields

```kotlin
@Composable fun CardFormDefaults.CountryCodeField(controller: PrimerCardFormController, modifier: Modifier = Modifier)
@Composable fun CardFormDefaults.FirstNameField(controller: PrimerCardFormController, modifier: Modifier = Modifier)
@Composable fun CardFormDefaults.LastNameField(controller: PrimerCardFormController, modifier: Modifier = Modifier)
@Composable fun CardFormDefaults.AddressLine1Field(controller: PrimerCardFormController, modifier: Modifier = Modifier)
@Composable fun CardFormDefaults.AddressLine2Field(controller: PrimerCardFormController, modifier: Modifier = Modifier)
@Composable fun CardFormDefaults.CityField(controller: PrimerCardFormController, modifier: Modifier = Modifier)
@Composable fun CardFormDefaults.StateField(controller: PrimerCardFormController, modifier: Modifier = Modifier)
@Composable fun CardFormDefaults.PostalCodeField(controller: PrimerCardFormController, modifier: Modifier = Modifier)
```

### PrimerPaymentMethods

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

### PaymentMethodsDefaults

```kotlin
object PaymentMethodsDefaults {
    @Composable fun SectionHeader()
    @Composable fun Method(method: PrimerPaymentMethod, onClick: () -> Unit)
    @Composable fun EmptyState(modifier: Modifier = Modifier)
}
```

### PrimerVaultedPaymentMethods

```kotlin
@Composable
fun PrimerVaultedPaymentMethods(
    controller: PrimerVaultedPaymentMethodsController,
    modifier: Modifier = Modifier,
    header: @Composable (onShowAll: () -> Unit) -> Unit = { onShowAll ->
        VaultedPaymentMethodsDefaults.SectionHeader(onShowAll = onShowAll)
    },
    item: @Composable (
        method: PrimerVaultedPaymentMethod,
        isSelected: Boolean,
        onSelect: () -> Unit,
    ) -> Unit = { method, isSelected, onSelect ->
        VaultedPaymentMethodsDefaults.Method(method, isSelected, onSelect)
    },
    submitButton: @Composable (
        isLoading: Boolean,
        enabled: Boolean,
        onSubmit: () -> Unit,
    ) -> Unit = { isLoading, enabled, onSubmit -> },
)
```

### VaultedPaymentMethodsDefaults

```kotlin
object VaultedPaymentMethodsDefaults {
    @Composable fun SectionHeader(onShowAll: () -> Unit)
    @Composable fun Method(method: PrimerVaultedPaymentMethod, isSelected: Boolean, onSelect: () -> Unit)
}
```

---

## State Types

### PrimerCheckoutState

```kotlin
@Stable
sealed interface PrimerCheckoutState {
    data object Loading : PrimerCheckoutState
    data class Ready(val clientSession: PrimerClientSession) : PrimerCheckoutState
}
```

### PrimerClientSession

```kotlin
data class PrimerClientSession(
    val customerId: String?,
    val orderId: String?,
    val currencyCode: String?,
    val totalAmount: Int?,
    val lineItems: List<PrimerLineItem>?,
    val orderDetails: PrimerOrder?,
    val customer: PrimerCustomer?,
    val paymentMethod: PrimerPaymentMethod?,
    val fees: List<PrimerFee>?,
)
```

### PrimerCheckoutEvent

```kotlin
@Stable
sealed interface PrimerCheckoutEvent {
    data class Success(val checkoutData: PrimerCheckoutData) : PrimerCheckoutEvent
    data class Failure(val error: PrimerError) : PrimerCheckoutEvent
}
```

### PrimerCheckoutData

```kotlin
data class PrimerCheckoutData(
    val payment: Payment,
    val additionalInfo: PrimerCheckoutAdditionalInfo? = null,
)
```

### Payment

```kotlin
data class Payment(val id: String, val orderId: String)
```

### PrimerCardFormController.State

```kotlin
data class State(
    val cardFields: List<PrimerInputElementType>,
    val billingFields: List<PrimerInputElementType>,
    val fieldErrors: List<SyncValidationError>?,
    val data: Map<PrimerInputElementType, String>,
    val isLoading: Boolean,
    val isFormEnabled: Boolean,
    val selectedCountry: PrimerCountry?,
    val networkSelection: NetworkSelection?,
    val fieldFocusStates: Map<PrimerInputElementType, FieldState>,
    val isFormValid: Boolean,
    val vaultOnSuccess: Boolean,
)
```

### NetworkSelection

```kotlin
data class NetworkSelection(
    val selectedNetwork: PrimerCardNetwork?,
    val availableNetworks: List<PrimerCardNetwork>,
    val isNetworkSelectable: Boolean,
    val isUserSelected: Boolean,
)
```

### FieldState

```kotlin
data class FieldState(
    val hasFocus: Boolean,
    val hasBeenFocused: Boolean,
    val shouldShowError: Boolean,
)
```

### SyncValidationError

```kotlin
data class SyncValidationError(
    val inputElementType: PrimerInputElementType,
    val errorId: String,
    @StringRes val fieldId: Int,
    @StringRes val errorResId: Int?,
    @StringRes val errorFormatId: Int?,
)
```

---

## Configuration Types

### PrimerSettings

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

### PrimerPaymentHandling

```kotlin
enum class PrimerPaymentHandling { AUTO, MANUAL }
```

### PrimerApiVersion

```kotlin
enum class PrimerApiVersion { V2_4 }
```

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

### DismissalMechanism

```kotlin
enum class DismissalMechanism { GESTURES, CLOSE_BUTTON }
```

### PrimerCardFormUIOptions

```kotlin
data class PrimerCardFormUIOptions(
    var payButtonAddNewCard: Boolean = false,
)
```

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

### PrimerGooglePayOptions

```kotlin
data class PrimerGooglePayOptions(
    var merchantName: String? = null,
    var buttonStyle: GooglePayButtonStyle = ...,
    var captureBillingAddress: Boolean = false,
    var existingPaymentMethodRequired: Boolean = false,
    var shippingAddressParameters: PrimerGoogleShippingAddressParameters? = null,
    var requireShippingMethod: Boolean = false,
    var emailAddressRequired: Boolean = false,
    var buttonOptions: GooglePayButtonOptions = ...,
)
```

### PrimerKlarnaOptions

```kotlin
data class PrimerKlarnaOptions(
    var recurringPaymentDescription: String? = null,
    var returnIntentUrl: String? = null,
)
```

### PrimerThreeDsOptions

```kotlin
data class PrimerThreeDsOptions(
    var threeDsAppRequestorUrl: String? = null,
)
```

### PrimerStripeOptions

```kotlin
data class PrimerStripeOptions(
    var mandateData: MandateData? = null,
    var publishableKey: String? = null,
)
```

### PrimerDebugOptions

```kotlin
data class PrimerDebugOptions(
    var is3DSSanityCheckEnabled: Boolean = true,
)
```

---

## Common Data Types

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

### PrimerPaymentMethod

```kotlin
data class PrimerPaymentMethod(
    val paymentMethodType: String,
    val paymentMethodName: String?,
    val supportedPrimerSessionIntents: List<PrimerSessionIntent>,
    val paymentMethodManagerCategories: List<PrimerPaymentMethodManagerCategory>,
    val surcharge: Surcharge? = null,
)
```

### PrimerVaultedPaymentMethod

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

### PaymentInstrumentData

```kotlin
data class PaymentInstrumentData(
    val network: String?,
    val cardholderName: String?,
    val first6Digits: Int?,
    val last4Digits: Int?,
    val accountNumberLast4Digits: Int?,
    val expirationMonth: Int?,
    val expirationYear: Int?,
    val externalPayerInfo: ExternalPayerInfo?,
    val klarnaCustomerToken: String?,
    val sessionData: SessionData?,
    val paymentMethodType: String?,
    val sessionInfo: SessionInfo?,
    val binData: BinData?,
    val bankName: String?,
)
```

### PrimerCardNetwork

```kotlin
data class PrimerCardNetwork(
    val network: CardNetwork.Type,
    val displayName: String,
    val allowed: Boolean,
)
```

### CardNetwork.Type

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

### CountryCode

```kotlin
enum class CountryCode {
    US, GB, DE, FR, JP, AU, /* ... 249 total ISO 3166-1 alpha-2 values */
}
```

### PrimerInputElementType

```kotlin
enum class PrimerInputElementType {
    CARD_NUMBER, EXPIRY_DATE, CVV, CARDHOLDER_NAME,
    COUNTRY_CODE, FIRST_NAME, LAST_NAME,
    ADDRESS_LINE_1, ADDRESS_LINE_2, CITY, STATE, POSTAL_CODE,
}
```

### PrimerSessionIntent

```kotlin
enum class PrimerSessionIntent { CHECKOUT, VAULT }
```

### PrimerPaymentMethodManagerCategory

```kotlin
enum class PrimerPaymentMethodManagerCategory {
    NATIVE_UI, RAW_DATA, NOL_PAY, KLARNA, STRIPE_ACH, COMPONENT_WITH_REDIRECT,
}
```

### Surcharge

```kotlin
sealed interface Surcharge {
    data class PaymentMethodSurcharge(val amount: Int) : Surcharge
    data class CardNetworksSurcharge(val surcharges: Map<String, Int>) : Surcharge
}
```

### PrimerCheckoutAdditionalInfo

```kotlin
interface PrimerCheckoutAdditionalInfo
```

Marker interface implemented by payment method-specific additional info classes.

---

## Theming Types

### PrimerTheme

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

Methods:

```kotlin
@Composable
fun PrimerTheme.colorTokens(darkTheme: Boolean = isSystemInDarkTheme()): LightColorTokens
```

### LocalPrimerTheme

```kotlin
val LocalPrimerTheme = staticCompositionLocalOf { PrimerTheme() }
```

### LightColorTokens (open class -- 16 base + 26 semantic)

Base tokens (all `open val` of type `Color`):

```kotlin
open class LightColorTokens {
    open val primerColorBrand: Color             // #2F98FF
    open val primerColorGray000: Color           // #FFFFFF
    open val primerColorGray100: Color           // #F5F5F5
    open val primerColorGray200: Color           // #EEEEEE
    open val primerColorGray300: Color           // #E0E0E0
    open val primerColorGray400: Color           // #BDBDBD
    open val primerColorGray500: Color           // #9E9E9E
    open val primerColorGray600: Color           // #757575
    open val primerColorGray900: Color           // #212121
    open val primerColorRed100: Color            // #FFECEC
    open val primerColorRed500: Color            // #FF7279
    open val primerColorRed900: Color            // #B4324B
    open val primerColorGreen500: Color          // #3EB68F
    open val primerColorBlue500: Color           // #399DFF
    open val primerColorBlue900: Color           // #2270F4
    open val primerColorBorderTransparentDefault: Color  // transparent
}
```

Semantic tokens (computed from base, all `open val`):

```kotlin
    // Text
    open val primerColorTextPrimary: Color       // -> primerColorGray900
    open val primerColorTextSecondary: Color     // -> primerColorGray600
    open val primerColorTextPlaceholder: Color   // -> primerColorGray500
    open val primerColorTextDisabled: Color      // -> primerColorGray400
    open val primerColorTextNegative: Color      // -> primerColorRed900
    open val primerColorTextLink: Color          // -> primerColorBlue900

    // Background
    open val primerColorBackground: Color        // -> primerColorGray000

    // Outlined borders
    open val primerColorBorderOutlinedDefault: Color   // -> primerColorGray300
    open val primerColorBorderOutlinedHover: Color     // -> primerColorGray400
    open val primerColorBorderOutlinedActive: Color    // -> primerColorGray500
    open val primerColorBorderOutlinedFocus: Color     // -> primerColorFocus
    open val primerColorBorderOutlinedDisabled: Color  // -> primerColorGray200
    open val primerColorBorderOutlinedError: Color     // -> primerColorRed500
    open val primerColorBorderOutlinedLoading: Color   // -> primerColorGray200
    open val primerColorBorderOutlinedSelected: Color  // -> primerColorBrand

    // Transparent borders
    open val primerColorBorderTransparentHover: Color     // -> primerColorBorderTransparentDefault
    open val primerColorBorderTransparentActive: Color    // -> primerColorBorderTransparentDefault
    open val primerColorBorderTransparentFocus: Color     // -> primerColorFocus
    open val primerColorBorderTransparentDisabled: Color  // -> primerColorBorderTransparentDefault
    open val primerColorBorderTransparentSelected: Color  // -> primerColorBorderTransparentDefault

    // Icons
    open val primerColorIconPrimary: Color       // -> primerColorGray900
    open val primerColorIconDisabled: Color      // -> primerColorGray400
    open val primerColorIconNegative: Color      // -> primerColorRed500
    open val primerColorIconPositive: Color      // -> primerColorGreen500

    // Utility
    open val primerColorFocus: Color             // -> primerColorBrand
    open val primerColorLoader: Color            // -> primerColorBrand
```

### DarkColorTokens (extends LightColorTokens -- overrides 15 base tokens)

```kotlin
open class DarkColorTokens : LightColorTokens() {
    override val primerColorGray000: Color       // #171619
    override val primerColorGray100: Color       // #292929
    override val primerColorGray200: Color       // #424242
    override val primerColorGray300: Color       // #575757
    override val primerColorGray400: Color       // #858585
    override val primerColorGray500: Color       // #767577
    override val primerColorGray600: Color       // #C7C7C7
    override val primerColorGray900: Color       // #EFEFEF
    override val primerColorRed100: Color        // #321C20
    override val primerColorRed500: Color        // #E46D70
    override val primerColorRed900: Color        // #F6BFBF
    override val primerColorGreen500: Color      // #27B17D
    override val primerColorBlue500: Color       // #3F93E4
    override val primerColorBlue900: Color       // #4AAEFF
    // primerColorBrand stays #2F98FF (inherited)
}
```

### SpacingTokens

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

### TypographyTokens

```kotlin
data class TypographyTokens(
    val titleXlarge: TypographyStyle = TypographyStyle(size = 24, weight = 550, lineHeight = 32, letterSpacing = -0.6f),
    val titleLarge: TypographyStyle = TypographyStyle(size = 16, weight = 550, lineHeight = 20, letterSpacing = -0.2f),
    val bodyLarge: TypographyStyle = TypographyStyle(size = 16, weight = 400, lineHeight = 20, letterSpacing = -0.2f),
    val bodyMedium: TypographyStyle = TypographyStyle(size = 14, weight = 400, lineHeight = 20, letterSpacing = 0f),
    val bodySmall: TypographyStyle = TypographyStyle(size = 12, weight = 400, lineHeight = 16, letterSpacing = 0f),
)
```

### TypographyStyle

```kotlin
data class TypographyStyle(
    @FontRes val font: Int,
    val letterSpacing: Float,
    val weight: Int,
    val size: Int,
    val lineHeight: Int,
) {
    fun toTextStyle(): TextStyle
}
```

### RadiusTokens

```kotlin
data class RadiusTokens(
    val xsmall: Dp = 2.dp,
    val small: Dp = 4.dp,
    val medium: Dp = 8.dp,
    val large: Dp = 12.dp,
    val base: Dp = 4.dp,
)
```

### BorderWidthTokens

```kotlin
data class BorderWidthTokens(
    val thin: Dp = 1.dp,
    val medium: Dp = 2.dp,
    val thick: Dp = 3.dp,
)
```

### SizeTokens

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

---

## Material 3 Color Mapping

| M3 Role                   | Primer Token                                      |
| ------------------------- | ------------------------------------------------- |
| `primary`                 | `primerColorBrand`                                |
| `onPrimary`               | `onColoredSurface` (gray000 light / gray900 dark) |
| `primaryContainer`        | `primerColorBlue900`                              |
| `onPrimaryContainer`      | `onColoredSurface`                                |
| `inversePrimary`          | `primerColorBlue500`                              |
| `secondary`               | `primerColorGray600`                              |
| `onSecondary`             | `onColoredSurface`                                |
| `secondaryContainer`      | `primerColorGray200`                              |
| `onSecondaryContainer`    | `primerColorTextPrimary`                          |
| `tertiary`                | `primerColorBlue500`                              |
| `onTertiary`              | `onColoredSurface`                                |
| `tertiaryContainer`       | `primerColorGray200`                              |
| `onTertiaryContainer`     | `primerColorTextPrimary`                          |
| `background`              | `primerColorBackground`                           |
| `onBackground`            | `primerColorTextPrimary`                          |
| `surface`                 | `primerColorBackground`                           |
| `onSurface`               | `primerColorTextPrimary`                          |
| `surfaceVariant`          | `primerColorGray100`                              |
| `onSurfaceVariant`        | `primerColorTextSecondary`                        |
| `surfaceTint`             | `primerColorBrand`                                |
| `inverseSurface`          | `primerColorGray900`                              |
| `inverseOnSurface`        | `primerColorGray000`                              |
| `surfaceBright`           | gray000 (light) / gray300 (dark)                  |
| `surfaceDim`              | gray100 (light) / gray000 (dark)                  |
| `surfaceContainer`        | `primerColorGray100`                              |
| `surfaceContainerHigh`    | `primerColorGray200`                              |
| `surfaceContainerHighest` | `primerColorGray300`                              |
| `surfaceContainerLow`     | `primerColorGray100`                              |
| `surfaceContainerLowest`  | `primerColorBackground`                           |
| `error`                   | `primerColorRed500`                               |
| `onError`                 | `onColoredSurface`                                |
| `errorContainer`          | `primerColorRed100`                               |
| `onErrorContainer`        | `primerColorTextNegative`                         |
| `outline`                 | `primerColorBorderOutlinedDefault`                |
| `outlineVariant`          | `primerColorGray300`                              |
| `scrim`                   | `Color.Black` (alpha 0.32)                        |
