# Primer Android Checkout -- Compose Integration Patterns

Code-heavy patterns for integrating Primer Checkout SDK with Jetpack Compose. Covers presentation modes, state observation, custom layouts, controller lifecycle, navigation, theming, common pitfalls, and debugging.

---

## Sheet vs Host Patterns

### Minimal Sheet (fastest integration)

```kotlin
@Composable
fun CheckoutScreen(clientToken: String, onComplete: () -> Unit) {
    val checkout = rememberPrimerCheckoutController(clientToken)

    PrimerCheckoutSheet(
        checkout = checkout,
        onDismiss = onComplete,
        onEvent = { event ->
            when (event) {
                is PrimerCheckoutEvent.Success -> onComplete()
                is PrimerCheckoutEvent.Failure -> { /* shown in sheet UI */ }
            }
        },
    )
}
```

### Sheet with Custom Slots

```kotlin
@Composable
fun CustomSheetCheckout(clientToken: String) {
    val checkout = rememberPrimerCheckoutController(clientToken)

    PrimerCheckoutSheet(
        checkout = checkout,
        // Custom loading
        loading = {
            Box(Modifier.fillMaxWidth().padding(32.dp), contentAlignment = Alignment.Center) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    CircularProgressIndicator()
                    Spacer(Modifier.height(16.dp))
                    Text("Processing payment...")
                }
            }
        },
        // Custom card form with rearranged fields
        cardForm = {
            val controller = rememberCardFormController(checkout)
            PrimerCardForm(
                controller = controller,
                cardDetails = {
                    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        CardFormDefaults.CardholderField(controller)
                        CardFormDefaults.CardNumberField(controller)
                        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            CardFormDefaults.ExpiryField(controller, Modifier.weight(1f))
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
                Icon(
                    Icons.Default.CheckCircle,
                    contentDescription = null,
                    tint = MaterialTheme.colorScheme.primary,
                    modifier = Modifier.size(64.dp),
                )
                Spacer(Modifier.height(16.dp))
                Text(
                    "Payment confirmed!",
                    style = MaterialTheme.typography.headlineSmall,
                )
                Text(
                    "ID: ${data.payment.id}",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )
            }
        },
    )
}
```

### Inline Host (full control)

```kotlin
@Composable
fun InlineCheckoutScreen(clientToken: String) {
    val checkout = rememberPrimerCheckoutController(clientToken)
    val checkoutState by checkout.state.collectAsStateWithLifecycle()

    PrimerCheckoutHost(
        checkout = checkout,
        onEvent = { event ->
            when (event) {
                is PrimerCheckoutEvent.Success -> { /* navigate away */ }
                is PrimerCheckoutEvent.Failure -> { /* show error in your UI */ }
            }
        },
    ) {
        Scaffold(
            topBar = {
                TopAppBar(title = { Text("Checkout") })
            },
        ) { padding ->
            when (val state = checkoutState) {
                is PrimerCheckoutState.Loading -> {
                    Box(
                        Modifier.fillMaxSize().padding(padding),
                        contentAlignment = Alignment.Center,
                    ) {
                        CircularProgressIndicator()
                    }
                }
                is PrimerCheckoutState.Ready -> {
                    val cardFormController = rememberCardFormController(checkout)
                    val paymentMethodsController = rememberPaymentMethodsController(checkout)

                    Column(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(padding)
                            .verticalScroll(rememberScrollState())
                            .padding(16.dp),
                        verticalArrangement = Arrangement.spacedBy(16.dp),
                    ) {
                        // Order summary
                        Text(
                            "Total: ${checkout.formatAmount(state.clientSession.totalAmount ?: 0)}",
                            style = MaterialTheme.typography.headlineSmall,
                        )

                        // Payment methods
                        PrimerPaymentMethods(controller = paymentMethodsController)

                        HorizontalDivider()

                        // Card form
                        PrimerCardForm(controller = cardFormController)
                    }
                }
            }
        }
    }
}
```

---

## State Observation Patterns

### Observing Checkout State

```kotlin
val checkout = rememberPrimerCheckoutController(clientToken)
val checkoutState by checkout.state.collectAsStateWithLifecycle()

when (checkoutState) {
    is PrimerCheckoutState.Loading -> { /* show loading */ }
    is PrimerCheckoutState.Ready -> {
        val session = (checkoutState as PrimerCheckoutState.Ready).clientSession
        Text("Order: ${session.orderId}")
        Text("Amount: ${session.totalAmount} ${session.currencyCode}")
    }
}
```

### Observing Card Form State

```kotlin
val cardFormController = rememberCardFormController(checkout)
val formState by cardFormController.state.collectAsStateWithLifecycle()

// Check if form is valid
val canSubmit = formState.isFormValid && !formState.isLoading

// Read field values
val cardNumber = formState.data[PrimerInputElementType.CARD_NUMBER] ?: ""

// Check for errors on a specific field
val cardErrors = formState.fieldErrors?.filter {
    it.inputElementType == PrimerInputElementType.CARD_NUMBER
}

// Check if billing address is required
val hasBilling = formState.billingFields.isNotEmpty()

// Co-badged card network selection
val networks = formState.networkSelection
if (networks != null && networks.availableNetworks.size > 1) {
    // Show network selector
}
```

### Observing Payment Methods

```kotlin
val controller = rememberPaymentMethodsController(checkout)
val methods by controller.methods.collectAsStateWithLifecycle()

methods.forEach { method ->
    Text("${method.paymentMethodName} (${method.paymentMethodType})")
    method.surcharge?.let { Text("Surcharge: $it") }
}
```

### Observing Vaulted Methods

```kotlin
val vaultedController = rememberVaultedPaymentMethodsController(checkout)
val vaultedMethods by vaultedController.methods.collectAsStateWithLifecycle()
val checkoutState by checkout.state.collectAsStateWithLifecycle()

// Distinguish "loading" from "no saved methods"
when {
    checkoutState is PrimerCheckoutState.Loading -> Text("Loading...")
    vaultedMethods.isEmpty() -> Text("No saved payment methods")
    else -> {
        vaultedMethods.forEach { method ->
            val data = method.paymentInstrumentData
            Text("${data?.network} ending ${data?.last4Digits}")
        }
    }
}
```

---

## Custom Card Form Layouts

### Rearranged Fields

```kotlin
PrimerCardForm(
    controller = controller,
    cardDetails = {
        Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
            // Name first, then card details
            CardFormDefaults.CardholderField(controller)
            CardFormDefaults.CardNumberField(controller)
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                CardFormDefaults.ExpiryField(controller, Modifier.weight(1f))
                CardFormDefaults.CvvField(controller, Modifier.weight(1f))
            }
            CardFormDefaults.CardNetworkField(controller)
        }
    },
)
```

### Replace Only the Submit Button

```kotlin
val formState by controller.state.collectAsStateWithLifecycle()

PrimerCardForm(
    controller = controller,
    submitButton = {
        Button(
            onClick = { controller.submit() },
            enabled = formState.isFormValid && !formState.isLoading,
            modifier = Modifier.fillMaxWidth().height(56.dp),
        ) {
            if (formState.isLoading) {
                CircularProgressIndicator(
                    modifier = Modifier.size(24.dp),
                    color = MaterialTheme.colorScheme.onPrimary,
                )
            } else {
                Text("Complete Purchase")
            }
        }
    },
)
```

### Replace Individual Fields in CardDetailsContent

```kotlin
PrimerCardForm(
    controller = controller,
    cardDetails = {
        CardFormDefaults.CardDetailsContent(
            controller = controller,
            // Only replace the card number field
            cardNumber = {
                Column {
                    Text("Card Number", style = MaterialTheme.typography.labelMedium)
                    CardFormDefaults.CardNumberField(controller)
                }
            },
            // Keep defaults for expiry, cvv, cardholder
        )
    },
)
```

### Add Vault Toggle to Card Form

```kotlin
val formState by controller.state.collectAsStateWithLifecycle()

PrimerCardForm(
    controller = controller,
    submitButton = {
        Column {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.padding(vertical = 8.dp),
            ) {
                Checkbox(
                    checked = formState.vaultOnSuccess,
                    onCheckedChange = { controller.setVaultOnSuccess(it) },
                )
                Spacer(Modifier.width(8.dp))
                Text("Save this card for future payments")
            }
            CardFormDefaults.SubmitButton(controller)
        }
    },
)
```

---

## Custom Payment Method Lists

### Custom Method Row

```kotlin
PrimerPaymentMethods(
    controller = paymentMethodsController,
    method = { method, onClick ->
        Card(
            onClick = onClick,
            modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp),
        ) {
            Row(
                modifier = Modifier.padding(16.dp),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                // Load icon from URL
                method.iconUrl?.let { url ->
                    AsyncImage(
                        model = url,
                        contentDescription = method.paymentMethodName,
                        modifier = Modifier.size(32.dp),
                    )
                    Spacer(Modifier.width(12.dp))
                }
                Column(Modifier.weight(1f)) {
                    Text(
                        method.paymentMethodName ?: method.paymentMethodType,
                        style = MaterialTheme.typography.bodyLarge,
                    )
                    method.surcharge?.let {
                        Text(
                            "Surcharge: $it",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                        )
                    }
                }
                Icon(Icons.Default.ChevronRight, contentDescription = null)
            }
        }
    },
)
```

### Filter Payment Methods by Type

```kotlin
val controller = rememberPaymentMethodsController(checkout)
val allMethods by controller.methods.collectAsStateWithLifecycle()

// Show cards separately from other methods
val cardMethods = allMethods.filter { it.paymentMethodType == "PAYMENT_CARD" }
val otherMethods = allMethods.filter { it.paymentMethodType != "PAYMENT_CARD" }

Column {
    if (otherMethods.isNotEmpty()) {
        Text("Express checkout", style = MaterialTheme.typography.titleMedium)
        otherMethods.forEach { method ->
            PaymentMethodsDefaults.Method(method) { controller.select(method) }
        }
    }

    if (cardMethods.isNotEmpty()) {
        Text("Pay with card", style = MaterialTheme.typography.titleMedium)
        val cardFormController = rememberCardFormController(checkout)
        PrimerCardForm(controller = cardFormController)
    }
}
```

---

## Controller Lifecycle Patterns

### Correct: Screen-Level Checkout Controller

```kotlin
@Composable
fun CheckoutScreen(clientToken: String) {
    // Created at screen level -- survives recomposition
    val checkout = rememberPrimerCheckoutController(clientToken)

    PrimerCheckoutHost(checkout = checkout) {
        // Child controllers created inside Host scope
        val cardFormController = rememberCardFormController(checkout)
        val paymentMethodsController = rememberPaymentMethodsController(checkout)
        // ...
    }
}
```

### Wrong: Controller in Conditional

```kotlin
@Composable
fun BadExample(clientToken: String) {
    var showCheckout by remember { mutableStateOf(false) }

    if (showCheckout) {
        // WRONG -- recreated every time showCheckout toggles
        val checkout = rememberPrimerCheckoutController(clientToken)
        PrimerCheckoutSheet(checkout = checkout)
    }
}
```

### Correct: Controller Survives Toggle

```kotlin
@Composable
fun GoodExample(clientToken: String) {
    // Controller created unconditionally
    val checkout = rememberPrimerCheckoutController(clientToken)
    var showCheckout by remember { mutableStateOf(false) }

    Button(onClick = { showCheckout = true }) { Text("Pay") }

    if (showCheckout) {
        PrimerCheckoutSheet(
            checkout = checkout,
            onDismiss = { showCheckout = false },
        )
    }
}
```

### Refreshing the Session

```kotlin
val checkout = rememberPrimerCheckoutController(clientToken)
val state by checkout.state.collectAsStateWithLifecycle()

Column {
    when (state) {
        is PrimerCheckoutState.Loading -> CircularProgressIndicator()
        is PrimerCheckoutState.Ready -> {
            // Refresh button -- goes back to Loading, refetches config
            Button(onClick = { checkout.refresh() }) {
                Text("Refresh")
            }
        }
    }
}
```

---

## Navigation Patterns

### Sheet with Navigation Component

```kotlin
@Composable
fun NavHostCheckout(navController: NavController) {
    val viewModel: CheckoutViewModel = viewModel()
    val clientToken by viewModel.clientToken.collectAsStateWithLifecycle()

    clientToken?.let { token ->
        val checkout = rememberPrimerCheckoutController(token)

        PrimerCheckoutSheet(
            checkout = checkout,
            onDismiss = { navController.popBackStack() },
            onEvent = { event ->
                when (event) {
                    is PrimerCheckoutEvent.Success -> {
                        navController.navigate("confirmation/${event.checkoutData.payment.id}") {
                            popUpTo("checkout") { inclusive = true }
                        }
                    }
                    is PrimerCheckoutEvent.Failure -> { /* shown in sheet */ }
                }
            },
        )
    }
}
```

### Host with Internal Navigation

```kotlin
@Composable
fun HostWithNavigation(clientToken: String) {
    val checkout = rememberPrimerCheckoutController(clientToken)
    val checkoutState by checkout.state.collectAsStateWithLifecycle()

    enum class Screen { METHODS, CARD_FORM, SUCCESS, ERROR }
    var screen by remember { mutableStateOf(Screen.METHODS) }
    var paymentData by remember { mutableStateOf<PrimerCheckoutData?>(null) }
    var paymentError by remember { mutableStateOf<PrimerError?>(null) }

    PrimerCheckoutHost(
        checkout = checkout,
        onEvent = { event ->
            when (event) {
                is PrimerCheckoutEvent.Success -> {
                    paymentData = event.checkoutData
                    screen = Screen.SUCCESS
                }
                is PrimerCheckoutEvent.Failure -> {
                    paymentError = event.error
                    screen = Screen.ERROR
                }
            }
        },
    ) {
        if (checkoutState is PrimerCheckoutState.Loading) {
            CircularProgressIndicator()
            return@PrimerCheckoutHost
        }

        AnimatedContent(targetState = screen) { currentScreen ->
            when (currentScreen) {
                Screen.METHODS -> {
                    val controller = rememberPaymentMethodsController(checkout)
                    PrimerPaymentMethods(controller = controller)
                }
                Screen.CARD_FORM -> {
                    val controller = rememberCardFormController(checkout)
                    Column {
                        TextButton(onClick = { screen = Screen.METHODS }) {
                            Text("Back to methods")
                        }
                        PrimerCardForm(controller = controller)
                    }
                }
                Screen.SUCCESS -> {
                    Text("Payment ${paymentData?.payment?.id} succeeded!")
                }
                Screen.ERROR -> {
                    Column {
                        Text("Error: ${paymentError?.description}")
                        Button(onClick = { screen = Screen.METHODS }) {
                            Text("Try again")
                        }
                    }
                }
            }
        }
    }
}
```

---

## Theming Patterns

### Custom Brand Colors

```kotlin
val myTheme = PrimerTheme(
    lightColorTokens = object : LightColorTokens() {
        override val primerColorBrand: Color = Color(0xFF6C5CE7)
    },
    darkColorTokens = object : DarkColorTokens() {
        override val primerColorBrand: Color = Color(0xFFA29BFE)
    },
)

PrimerCheckoutSheet(
    checkout = checkout,
    theme = myTheme,
)
```

### Custom Typography

```kotlin
val myTheme = PrimerTheme(
    typographyTokens = TypographyTokens(
        titleXlarge = TypographyStyle(
            font = R.font.my_custom_font,
            size = 28,
            weight = 700,
            lineHeight = 36,
            letterSpacing = -0.5f,
        ),
        bodyLarge = TypographyStyle(
            font = R.font.my_custom_font,
            size = 16,
            weight = 400,
            lineHeight = 24,
            letterSpacing = 0f,
        ),
    ),
)
```

### Custom Spacing and Radius

```kotlin
val compactTheme = PrimerTheme(
    spacingTokens = SpacingTokens(
        small = 4.dp,
        medium = 8.dp,
        large = 12.dp,
        xlarge = 16.dp,
    ),
    radiusTokens = RadiusTokens(
        small = 2.dp,
        medium = 4.dp,
        large = 8.dp,
    ),
)
```

### Access Theme Tokens Inside Host

```kotlin
PrimerCheckoutHost(checkout = checkout, theme = myTheme) {
    val theme = LocalPrimerTheme.current
    val colors = theme.colorTokens() // respects dark/light mode

    Box(
        modifier = Modifier
            .background(colors.primerColorBackground)
            .padding(theme.spacingTokens.large),
    ) {
        Text(
            "Custom styled text",
            style = theme.typographyTokens.bodyLarge.toTextStyle()
                .copy(color = colors.primerColorTextPrimary),
        )
    }
}
```

### Full Customization Example

```kotlin
val brandTheme = PrimerTheme(
    lightColorTokens = object : LightColorTokens() {
        override val primerColorBrand: Color = Color(0xFF1DB954)  // Spotify green
        override val primerColorGray900: Color = Color(0xFF191414)
    },
    darkColorTokens = object : DarkColorTokens() {
        override val primerColorBrand: Color = Color(0xFF1ED760)
        override val primerColorGray000: Color = Color(0xFF121212)
    },
    radiusTokens = RadiusTokens(
        small = 8.dp,
        medium = 12.dp,
        large = 24.dp,  // very rounded
    ),
    borderWidthTokens = BorderWidthTokens(
        thin = 1.5.dp,
        medium = 2.dp,
    ),
    typographyTokens = TypographyTokens(
        titleXlarge = TypographyStyle(
            font = R.font.circular_bold,
            size = 24,
            weight = 700,
            lineHeight = 32,
            letterSpacing = -0.5f,
        ),
    ),
)
```

---

## Common Pitfalls

### Pitfall: Creating Controller Outside remember

```kotlin
// WRONG -- new controller every recomposition
val checkout = PrimerCheckoutController(clientToken)

// CORRECT
val checkout = rememberPrimerCheckoutController(clientToken)
```

### Pitfall: Using collectAsState Instead of collectAsStateWithLifecycle

```kotlin
// WRONG -- does not respect lifecycle, may leak
val state by checkout.state.collectAsState()

// CORRECT
val state by checkout.state.collectAsStateWithLifecycle()
```

### Pitfall: Child Controller Outside Host/Sheet Scope

```kotlin
// WRONG -- no CompositionLocal providers available
val cardFormController = rememberCardFormController(checkout)
PrimerCheckoutHost(checkout = checkout) {
    PrimerCardForm(controller = cardFormController)
}

// CORRECT -- controller created inside Host content
PrimerCheckoutHost(checkout = checkout) {
    val cardFormController = rememberCardFormController(checkout)
    PrimerCardForm(controller = cardFormController)
}
```

### Pitfall: Missing redirectScheme for 3DS/Redirect Methods

```kotlin
// WRONG -- user cannot return after 3DS or PayPal redirect
val checkout = rememberPrimerCheckoutController(clientToken)

// CORRECT
val settings = PrimerSettings(
    paymentMethodOptions = PrimerPaymentMethodOptions(
        redirectScheme = "myapp://primer",
    ),
)
val checkout = rememberPrimerCheckoutController(clientToken, settings)
```

Also register in `AndroidManifest.xml`:

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

### Pitfall: 3DS WebView Destroyed on Rotation

```xml
<!-- Add to Activity in AndroidManifest.xml -->
<activity
    android:name=".CheckoutActivity"
    android:configChanges="orientation|screenSize" />
```

### Pitfall: Not Handling Both Events

```kotlin
// WRONG -- ignoring failures
onEvent = { event ->
    if (event is PrimerCheckoutEvent.Success) { /* ... */ }
}

// CORRECT -- handle both
onEvent = { event ->
    when (event) {
        is PrimerCheckoutEvent.Success -> {
            navigateToConfirmation(event.checkoutData.payment.id)
        }
        is PrimerCheckoutEvent.Failure -> {
            Log.e("Checkout", "Error: ${event.error.description}")
            Log.e("Checkout", "diagnosticsId: ${event.error.diagnosticsId}")
        }
    }
}
```

### Pitfall: Confusing isFormValid and fieldErrors

```kotlin
val formState by controller.state.collectAsStateWithLifecycle()

// isFormValid -- updates in real-time as user types, use for submit button
Button(
    onClick = { controller.submit() },
    enabled = formState.isFormValid && !formState.isLoading,
) { Text("Pay") }

// fieldErrors -- updates on blur only, use for error messages
formState.fieldErrors?.forEach { error ->
    Text("${error.inputElementType}: ${error.errorId}", color = Color.Red)
}
```

---

## Debugging Patterns

### Log All State Transitions

```kotlin
val checkout = rememberPrimerCheckoutController(clientToken)

LaunchedEffect(checkout) {
    checkout.state.collect { state ->
        Log.d("PrimerDebug", "Checkout state: $state")
        if (state is PrimerCheckoutState.Ready) {
            Log.d("PrimerDebug", "Session: ${state.clientSession}")
        }
    }
}
```

### Log Card Form State Changes

```kotlin
val controller = rememberCardFormController(checkout)

LaunchedEffect(controller) {
    controller.state.collect { state ->
        Log.d("PrimerDebug", "Form valid: ${state.isFormValid}")
        Log.d("PrimerDebug", "Loading: ${state.isLoading}")
        Log.d("PrimerDebug", "Fields: ${state.data}")
        state.fieldErrors?.forEach { error ->
            Log.w("PrimerDebug", "Validation: ${error.inputElementType} -> ${error.errorId}")
        }
    }
}
```

### Log Payment Method List

```kotlin
val controller = rememberPaymentMethodsController(checkout)

LaunchedEffect(controller) {
    controller.methods.collect { methods ->
        Log.d("PrimerDebug", "Available methods (${methods.size}):")
        methods.forEach { m ->
            Log.d("PrimerDebug", "  ${m.paymentMethodType}: ${m.paymentMethodName}")
        }
    }
}
```

### Log All Events with Diagnostics

```kotlin
PrimerCheckoutSheet(
    checkout = checkout,
    onEvent = { event ->
        when (event) {
            is PrimerCheckoutEvent.Success -> {
                Log.i("PrimerDebug", "Payment success: ${event.checkoutData.payment.id}")
                Log.i("PrimerDebug", "Order ID: ${event.checkoutData.payment.orderId}")
            }
            is PrimerCheckoutEvent.Failure -> {
                Log.e("PrimerDebug", "Payment failed: ${event.error.description}")
                Log.e("PrimerDebug", "Error ID: ${event.error.errorId}")
                Log.e("PrimerDebug", "Error code: ${event.error.errorCode}")
                Log.e("PrimerDebug", "Diagnostics ID: ${event.error.diagnosticsId}")
                Log.e("PrimerDebug", "Recovery: ${event.error.recoverySuggestion}")
            }
        }
    },
)
```

### Verify Installation

```bash
./gradlew assembleDebug
```

If the build succeeds, the SDK dependency is resolved correctly.

---

## Complete Integration Example

Full checkout screen with settings, theming, payment methods, card form, vaulted methods, and event handling:

```kotlin
@Composable
fun FullCheckoutScreen(
    clientToken: String,
    onPaymentComplete: (String) -> Unit,
    onDismiss: () -> Unit,
) {
    val settings = PrimerSettings(
        paymentMethodOptions = PrimerPaymentMethodOptions(
            redirectScheme = "myapp://primer",
            googlePayOptions = PrimerGooglePayOptions(
                merchantName = "My Store",
            ),
        ),
        uiOptions = PrimerUIOptions(
            dismissalMechanism = listOf(DismissalMechanism.CLOSE_BUTTON),
        ),
    )

    val theme = PrimerTheme(
        lightColorTokens = object : LightColorTokens() {
            override val primerColorBrand: Color = Color(0xFF6200EE)
        },
        darkColorTokens = object : DarkColorTokens() {
            override val primerColorBrand: Color = Color(0xFFBB86FC)
        },
    )

    val checkout = rememberPrimerCheckoutController(
        clientToken = clientToken,
        settings = settings,
    )

    PrimerCheckoutSheet(
        checkout = checkout,
        theme = theme,
        onDismiss = onDismiss,
        onEvent = { event ->
            when (event) {
                is PrimerCheckoutEvent.Success -> {
                    onPaymentComplete(event.checkoutData.payment.id)
                }
                is PrimerCheckoutEvent.Failure -> {
                    Log.e("Checkout", "diagnosticsId: ${event.error.diagnosticsId}")
                }
            }
        },
        paymentMethodSelection = {
            Column {
                // Vaulted methods first
                PrimerCheckoutSheetDefaults.VaultedMethods(checkout)
                // Then available methods
                PrimerCheckoutSheetDefaults.PaymentMethods(checkout)
            }
        },
        cardForm = {
            val controller = rememberCardFormController(checkout)
            val formState by controller.state.collectAsStateWithLifecycle()

            PrimerCardForm(
                controller = controller,
                submitButton = {
                    Column {
                        // Save card checkbox
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Checkbox(
                                checked = formState.vaultOnSuccess,
                                onCheckedChange = { controller.setVaultOnSuccess(it) },
                            )
                            Text("Save for next time")
                        }
                        // Default submit button
                        CardFormDefaults.SubmitButton(controller)
                    }
                },
            )
        },
    )
}
```
