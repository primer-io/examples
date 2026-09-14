# Primer Android Checkout -- Compose Integration Patterns

Complete screens for integrating Primer Checkout with Jetpack Compose: presentation modes, state
observation, custom layouts, controller lifecycle, navigation, theming, gating, pitfalls and
debugging.

**Every snippet below opens with its own `// imports for this snippet` block.** Copy the block
with the snippet; that is the whole import list for it, Primer and non-Primer, and nothing in it
is left for you to infer. Do **not** assemble an import block by picking symbols out of the
[import map](composable-reference.md#import-map) one at a time — that is how
`io.primer.checkout.api.state.rememberPrimerCheckoutController` (right symbol, wrong package) and
a dropped `androidx.compose.ui.unit.dp` both got written from a map that had them correct.

The map remains the **authority and the index**: it is where you look a symbol up for code you
are writing yourself, and every line in every block here appears in it verbatim. If a block and
the map ever disagree, the map is right and the block is the bug — report it. If a symbol a
snippet uses is in neither, that too is a bug to report rather than a package to guess.

**The map is complete for these snippets, not for your screen.** It lists what the code here
needs; your app's own framework is not in it and is not meant to be. The navigation pattern below
is the case that has confused a reader: it takes a `NavController` as a parameter, so
`androidx.navigation.NavController` is in the map and `NavHost`, `composable(...)` and
`rememberNavController()` are not — you own the graph, you write those imports
(`androidx.navigation.compose.*`, from the `navigation-compose` coordinate the install snippet
declares). Same for your DI, your `ViewModel`s, your theme and your `R`. A symbol missing from the
map is only a bug when a snippet _here_ uses it.

Two pieces of Kotlin and Compose boilerplate are called out here as well as in the map, because
they are language mechanics rather than API surface and are the ones a reader who rewrites a
snippet loses.

**Property delegation needs its operators imported.** Every `val x by
…collectAsStateWithLifecycle()` and every `var x by remember { mutableStateOf(…) }` in this file
requires `import androidx.compose.runtime.getValue` for a `val`, plus
`import androidx.compose.runtime.setValue` for a `var`. Both are already in the block above each
snippet that needs them; the reason they are also named here is the snippet you write yourself.
Without them Kotlin reports
`State<…> has no method getValue(…), so it cannot serve as a delegate`. There is no way to write
`by` without them, and no way to get the state without `by` except `.value` on the returned
`State`.

**Side-by-side fields use `fillMaxWidth`, not `weight`.** Two fields on one row are laid out as
`Modifier.fillMaxWidth(0.5f)` on the first and `Modifier.fillMaxWidth()` on the second: a `Row`
measures an unweighted child against the space its predecessors left, so that is a half and the
rest. Both modifiers are plain `Modifier` extensions, so they need no layout scope and cannot be
mis-imported, and they keep working when you lift the fields into a `Row` of your own.
`Modifier.weight(1f)` inside a `Row { }` would also work, and is legal precisely because
`RowScope` hands it to you — but **there is no import for it, and importing
`androidx.compose.foundation.layout.weight` resolves to an unrelated `internal` symbol and fails
the build** with `Cannot access 'val RowColumnParentData?.weight: Float': it is internal in file`.
Both halves of that matter and neither replaces the other: the `fillMaxWidth` idiom protects you
when you copy a snippet from here, the warning protects you when you write your own `Row`, which
is the more common case and the one where the platform itself suggests `weight`. Same for
`Modifier.align` and `BoxScope`'s `Modifier.matchParentSize`. The
[do-not-import list](composable-reference.md#import-map) repeats all of this where you are actually
assembling imports, and names the error each wrong one produces.

**Stubs are named for their owner.** Anything starting `your`/`Your` — `yourCartRepository`,
`YourPaymentMethodIcon`, `R.font.your_brand_bold`, `YourCheckoutViewModel` — is code you write, and
nothing else here is. The convention is stated in [`SKILL.md`](../SKILL.md#overview).

**Provenance.** Signatures and behaviour were read off the source of the release tag that
[`SKILL.md`](../SKILL.md#install-and-initialise) pins. Where a pattern depends on behaviour that a
signature does not show — which slots are skipped, which calls throw, which state a call needs —
the rule is stated once in
[`composable-reference.md`](composable-reference.md) and linked from here.

---

## Contents

This file is ~9,900 words. Read one section, not the file: the ranges are exact, so
`sed -n '1092,1255p' references/compose-patterns.md` gives you the theming patterns and nothing
else. Every snippet carries its own import block, so one section is self-contained.

| Lines     | Section                                                                                                                                                                |
| --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 136-374   | [Sheet vs Host Patterns](#sheet-vs-host-patterns)                                                                                                                      |
| 138-171   | &nbsp;&nbsp;[Minimal Sheet (fastest integration)](#minimal-sheet-fastest-integration)                                                                                  |
| 172-256   | &nbsp;&nbsp;[Sheet with Custom Slots](#sheet-with-custom-slots)                                                                                                        |
| 257-374   | &nbsp;&nbsp;[Inline Host (full control)](#inline-host-full-control)                                                                                                    |
| 375-536   | [State Observation Patterns](#state-observation-patterns)                                                                                                              |
| 377-407   | &nbsp;&nbsp;[Observing Checkout State](#observing-checkout-state)                                                                                                      |
| 408-441   | &nbsp;&nbsp;[Observing Card Form State](#observing-card-form-state)                                                                                                    |
| 442-504   | &nbsp;&nbsp;[Observing Payment Methods](#observing-payment-methods)                                                                                                    |
| 505-536   | &nbsp;&nbsp;[Observing Saved Payment Methods](#observing-saved-payment-methods)                                                                                        |
| 537-700   | [Custom Card Form Layouts](#custom-card-form-layouts)                                                                                                                  |
| 539-577   | &nbsp;&nbsp;[Rearranged Fields](#rearranged-fields)                                                                                                                    |
| 578-628   | &nbsp;&nbsp;[Replace Only the Submit Button](#replace-only-the-submit-button)                                                                                          |
| 629-656   | &nbsp;&nbsp;[Replace Individual Fields in CardDetailsContent](#replace-individual-fields-in-carddetailscontent)                                                        |
| 657-700   | &nbsp;&nbsp;[Add Vault Toggle to Card Form](#add-vault-toggle-to-card-form)                                                                                            |
| 701-816   | [Custom Payment Method Lists](#custom-payment-method-lists)                                                                                                            |
| 703-773   | &nbsp;&nbsp;[Custom Method Row](#custom-method-row)                                                                                                                    |
| 774-816   | &nbsp;&nbsp;[Filter Payment Methods by Type](#filter-payment-methods-by-type)                                                                                          |
| 817-947   | [Controller Lifecycle Patterns](#controller-lifecycle-patterns)                                                                                                        |
| 819-844   | &nbsp;&nbsp;[Correct: Screen-Level Checkout Controller](#correct-screen-level-checkout-controller)                                                                     |
| 845-870   | &nbsp;&nbsp;[Wrong: Controller in Conditional](#wrong-controller-in-conditional)                                                                                       |
| 871-910   | &nbsp;&nbsp;[Correct: Controller Survives Toggle](#correct-controller-survives-toggle)                                                                                 |
| 911-947   | &nbsp;&nbsp;[Refreshing the Session](#refreshing-the-session)                                                                                                          |
| 948-1091  | [Navigation Patterns](#navigation-patterns)                                                                                                                            |
| 950-994   | &nbsp;&nbsp;[Sheet with Navigation Component](#sheet-with-navigation-component)                                                                                        |
| 995-1091  | &nbsp;&nbsp;[Host with Internal Navigation](#host-with-internal-navigation)                                                                                            |
| 1092-1255 | [Theming Patterns](#theming-patterns)                                                                                                                                  |
| 1094-1118 | &nbsp;&nbsp;[Custom Brand Colors](#custom-brand-colors)                                                                                                                |
| 1119-1154 | &nbsp;&nbsp;[Custom Typography](#custom-typography)                                                                                                                    |
| 1155-1178 | &nbsp;&nbsp;[Custom Spacing and Radius](#custom-spacing-and-radius)                                                                                                    |
| 1179-1208 | &nbsp;&nbsp;[Access Theme Tokens Inside Host](#access-theme-tokens-inside-host)                                                                                        |
| 1209-1255 | &nbsp;&nbsp;[Full Customization Example](#full-customization-example)                                                                                                  |
| 1256-1420 | [Accessibility for slots you replaced](#accessibility-for-slots-you-replaced)                                                                                          |
| 1271-1325 | &nbsp;&nbsp;[A labelled custom method row](#a-labelled-custom-method-row)                                                                                              |
| 1326-1388 | &nbsp;&nbsp;[A labelled custom submit button](#a-labelled-custom-submit-button)                                                                                        |
| 1389-1420 | &nbsp;&nbsp;[Announcing something of your own](#announcing-something-of-your-own)                                                                                      |
| 1421-1619 | [Common Pitfalls](#common-pitfalls)                                                                                                                                    |
| 1423-1457 | &nbsp;&nbsp;[Pitfall: Creating a Second Checkout Controller Instead of Passing the First](#pitfall-creating-a-second-checkout-controller-instead-of-passing-the-first) |
| 1458-1472 | &nbsp;&nbsp;[Pitfall: Using collectAsState Instead of collectAsStateWithLifecycle](#pitfall-using-collectasstate-instead-of-collectasstatewithlifecycle)               |
| 1473-1498 | &nbsp;&nbsp;[Pitfall: SDK Components Outside Host/Sheet Scope](#pitfall-sdk-components-outside-hostsheet-scope)                                                        |
| 1499-1532 | &nbsp;&nbsp;[Pitfall: Setting redirectScheme and Expecting It to Do Something](#pitfall-setting-redirectscheme-and-expecting-it-to-do-something)                       |
| 1533-1564 | &nbsp;&nbsp;[Pitfall: Only Handling Success](#pitfall-only-handling-success)                                                                                           |
| 1565-1619 | &nbsp;&nbsp;[Pitfall: Confusing isFormValid and fieldErrors](#pitfall-confusing-isformvalid-and-fielderrors)                                                           |
| 1620-1673 | [Troubleshooting: symptom to cause](#troubleshooting-symptom-to-cause)                                                                                                 |
| 1674-1795 | [Debugging Patterns](#debugging-patterns)                                                                                                                              |
| 1676-1698 | &nbsp;&nbsp;[Log All State Transitions](#log-all-state-transitions)                                                                                                    |
| 1699-1720 | &nbsp;&nbsp;[Log Card Form State Changes](#log-card-form-state-changes)                                                                                                |
| 1721-1741 | &nbsp;&nbsp;[Log Payment Method List](#log-payment-method-list)                                                                                                        |
| 1742-1775 | &nbsp;&nbsp;[Log All Events with Diagnostics](#log-all-events-with-diagnostics)                                                                                        |
| 1776-1795 | &nbsp;&nbsp;[Verify Installation](#verify-installation)                                                                                                                |
| 1796-1915 | [Complete Integration Example](#complete-integration-example)                                                                                                          |
| 1916-1930 | [Klarna and QR Code Payment Methods](#klarna-and-qr-code-payment-methods)                                                                                              |
| 1931-2012 | [Gating Payment Creation (idempotency keys)](#gating-payment-creation-idempotency-keys)                                                                                |
| 2013-2136 | [Google Pay Integration Pattern](#google-pay-integration-pattern)                                                                                                      |
| 2137-2281 | [Error Recovery Pattern](#error-recovery-pattern)                                                                                                                      |
| 2230-2281 | &nbsp;&nbsp;[Replacing the Sheet's Error Screen](#replacing-the-sheets-error-screen)                                                                                   |
| 2282-2393 | [Vault-Only Flow Pattern](#vault-only-flow-pattern)                                                                                                                    |
| 2394-2482 | [Retryable Pay Button for Saved Methods](#retryable-pay-button-for-saved-methods)                                                                                      |

## Sheet vs Host Patterns

### Minimal Sheet (fastest integration)

```kotlin
// imports for this snippet
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
fun CheckoutScreen(clientToken: String, onComplete: () -> Unit) {
    val checkout = rememberPrimerCheckoutController(clientToken)

    val state by checkout.state.collectAsStateWithLifecycle()
    LaunchedEffect(state) {
        when (val s = state) {
            is PrimerCheckoutState.Success -> onComplete()
            is PrimerCheckoutState.Failure -> { /* shown in sheet UI */ }
            else -> Unit
        }
    }

    PrimerCheckoutSheet(
        checkout = checkout,
        onDismiss = onComplete,
    )
}
```

### Sheet with Custom Slots

```kotlin
// imports for this snippet
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import io.primer.android.core.ExperimentalPrimerApi
import io.primer.checkout.api.checkout.PrimerCheckoutSheet
import io.primer.checkout.api.checkout.rememberPrimerCheckoutController
import io.primer.checkout.components.card.CardFormDefaults
import io.primer.checkout.components.card.PrimerCardForm
import io.primer.checkout.components.card.rememberCardFormController

@OptIn(ExperimentalPrimerApi::class)
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
                        // Half, then the rest: no layout scope needed, so this survives
                        // being moved into a Row of your own.
                        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            CardFormDefaults.ExpiryField(controller, Modifier.fillMaxWidth(0.5f))
                            CardFormDefaults.CvvField(controller, Modifier.fillMaxWidth())
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
                // No Icons.Default.* anywhere in this skill on purpose: see the install
                // snippet in SKILL.md. Draw your own vector here if you want a tick.
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
// imports for this snippet
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import io.primer.android.core.ExperimentalPrimerApi
import io.primer.checkout.api.checkout.PrimerCheckoutHost
import io.primer.checkout.api.checkout.rememberPrimerCheckoutController
import io.primer.checkout.api.state.PrimerCheckoutState
import io.primer.checkout.api.state.formatAmount
import io.primer.checkout.components.card.PrimerCardForm
import io.primer.checkout.components.card.rememberCardFormController
import io.primer.checkout.components.paymentMethods.PrimerPaymentMethods
import io.primer.checkout.components.paymentMethods.rememberPaymentMethodsController

@OptIn(ExperimentalPrimerApi::class, ExperimentalMaterial3Api::class)
@Composable
fun InlineCheckoutScreen(clientToken: String) {
    val checkout = rememberPrimerCheckoutController(clientToken)
    val checkoutState by checkout.state.collectAsStateWithLifecycle()

    // formatAmount throws outside Ready, and the state can move on between the snapshot this
    // composition rendered and the call, so the match is not enough on its own: format it from
    // an effect, guard the call, and keep the last good string.
    var formattedTotal by remember { mutableStateOf<String?>(null) }

    LaunchedEffect(checkoutState) {
        when (val s = checkoutState) {
            is PrimerCheckoutState.Ready ->
                runCatching { checkout.formatAmount(s.clientSession.totalAmount ?: 0) }
                    .onSuccess { formattedTotal = it }
            is PrimerCheckoutState.Success -> { /* navigate away */ }
            is PrimerCheckoutState.Failure -> { /* show error in your UI */ }
            else -> Unit
        }
    }

    PrimerCheckoutHost(
        checkout = checkout,
    ) {
        Scaffold(
            topBar = {
                TopAppBar(title = { Text("Checkout") })
            },
        ) { padding ->
            // Bind the subject even where no branch reads the payload: checkoutState is a
            // delegated property and does not smart-cast, so `when (checkoutState)` is a
            // habit that breaks the first time a branch needs s.clientSession.
            when (val s = checkoutState) {
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
                        // Order summary -- the string formatted above, not a live call
                        Text(
                            "Total: ${formattedTotal ?: ""}",
                            style = MaterialTheme.typography.headlineSmall,
                        )

                        // Payment methods
                        PrimerPaymentMethods(controller = paymentMethodsController)

                        HorizontalDivider()

                        // Card form
                        PrimerCardForm(controller = cardFormController)
                    }
                }
                // PrimerCheckoutState is a sealed interface with six subtypes --
                // the when must be exhaustive.
                else -> Unit
            }
        }
    }
}
```

---

## State Observation Patterns

### Observing Checkout State

`collectAsStateWithLifecycle()` gives you a _delegated_ property, and Kotlin does not smart-cast
delegated properties — `when (checkoutState) { is Ready -> checkoutState.clientSession }` will not
compile. Bind the subject to a local `val` in the `when` and use that:

```kotlin
// imports for this snippet
import androidx.compose.material3.Text
import androidx.compose.runtime.getValue
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import io.primer.android.core.ExperimentalPrimerApi
import io.primer.checkout.api.checkout.rememberPrimerCheckoutController
import io.primer.checkout.api.state.PrimerCheckoutState

@OptIn(ExperimentalPrimerApi::class)
val checkout = rememberPrimerCheckoutController(clientToken)
val checkoutState by checkout.state.collectAsStateWithLifecycle()

when (val s = checkoutState) {
    is PrimerCheckoutState.Loading -> { /* show loading */ }
    is PrimerCheckoutState.Ready -> {
        Text("Order: ${s.clientSession.orderId}")
        Text("Amount: ${s.clientSession.totalAmount} ${s.clientSession.currencyCode}")
    }
    // PrimerCheckoutState is a sealed interface with six subtypes --
    // the when must be exhaustive.
    else -> Unit
}
```

### Observing Card Form State

```kotlin
// imports for this snippet
import androidx.compose.runtime.getValue
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import io.primer.android.components.domain.inputs.models.PrimerInputElementType
import io.primer.checkout.components.card.rememberCardFormController

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

// Co-badged card network selection. networkSelection is never null -- an empty
// availableNetworks list means the network is not yet known.
val networks = formState.networkSelection
if (networks.availableNetworks.size > 1) {
    // Show network selector
}
```

### Observing Payment Methods

`formatAmount` throws outside `PrimerCheckoutState.Ready`
([why](composable-reference.md#controller-interfaces)), so format the surcharges once while the
state _is_ `Ready` and render the strings you kept — do not call it from the row. The whole
mapping goes inside one `runCatching`: the state can still move on mid-effect, and a surcharge
column that keeps its previous values beats one that crashes the screen.

Because nothing returns the state to `Ready`, this effect runs while `Ready` and then not again:
after a client-session update the strings below are the _pre-update_ surcharges. That is the
deliberate trade — stale beats crashed — and if you need the updated figures as text, format them
from the `ClientSessionUpdated` payload yourself, exactly as
[both rules reconciled](composable-reference.md#when-both-rules-collide-formatamount-and-clientsessionupdated)
sets out. The same section explains why `PrimerPaymentMethods` itself belongs inside a `Ready`
branch once any method carries a surcharge.

```kotlin
// imports for this snippet
import androidx.compose.material3.Text
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import io.primer.android.configuration.domain.model.Surcharge
import io.primer.checkout.api.state.PrimerCheckoutState
import io.primer.checkout.components.paymentMethods.rememberPaymentMethodsController

val controller = rememberPaymentMethodsController(checkout)
val methods by controller.methods.collectAsStateWithLifecycle()
val checkoutState by checkout.state.collectAsStateWithLifecycle()

// paymentMethodType -> already-formatted surcharge text
var surchargeText by remember { mutableStateOf(emptyMap<String, String>()) }

LaunchedEffect(checkoutState, methods) {
    if (checkoutState !is PrimerCheckoutState.Ready) return@LaunchedEffect
    runCatching {
        methods.mapNotNull { method ->
            // Surcharge is a sealed interface, not a number: interpolating it prints a
            // class name.
            when (val surcharge = method.surcharge) {
                is Surcharge.PaymentMethodSurcharge ->
                    method.paymentMethodType to "+ ${checkout.formatAmount(surcharge.amount)}"
                // minOrNull, not min: min() throws on an empty surcharges map.
                is Surcharge.CardNetworksSurcharge ->
                    surcharge.surcharges.values.minOrNull()?.let { cheapest ->
                        method.paymentMethodType to "+ from ${checkout.formatAmount(cheapest)}"
                    }
                null -> null
            }
        }.toMap()
    }.onSuccess { surchargeText = it }
}

methods.forEach { method ->
    // paymentMethodName, not displayName -- and it is nullable, hence the fallback.
    Text(method.paymentMethodName ?: method.paymentMethodType)
    surchargeText[method.paymentMethodType]?.let { Text(it) }
}
```

### Observing Saved Payment Methods

```kotlin
// imports for this snippet
import androidx.compose.material3.Text
import androidx.compose.runtime.getValue
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import io.primer.checkout.api.state.PrimerCheckoutState
import io.primer.checkout.components.paymentMethods.rememberVaultedPaymentMethodsController

val vaultedController = rememberVaultedPaymentMethodsController(checkout)
val vaultedMethods by vaultedController.methods.collectAsStateWithLifecycle()
val checkoutState by checkout.state.collectAsStateWithLifecycle()

// Distinguish "loading" from "no saved payment methods"
when {
    checkoutState is PrimerCheckoutState.Loading -> Text("Loading...")
    vaultedMethods.isEmpty() -> Text("No saved payment methods")
    else -> {
        vaultedMethods.forEach { method ->
            // paymentInstrumentData is non-null; its fields are not. last4Digits is an Int,
            // so pad it or a card ending 0042 renders as "42".
            val data = method.paymentInstrumentData
            val last4 = data.last4Digits?.toString()?.padStart(4, '0')
            Text(listOfNotNull(data.network, last4?.let { "ending $it" }).joinToString(" "))
        }
    }
}
```

---

## Custom Card Form Layouts

### Rearranged Fields

Every field composable except `CardNumberField` and `CardNetworkField` draws nothing unless the
session asks for it, so a rearranged layout still shows only the fields the session declares
([details](composable-reference.md#composables-and-defaults)).

Do not add `CardFormDefaults.CardNetworkField` as a row of its own: `CardNumberField` already draws
it as its trailing icon, so a separate call puts a second co-badge selector on screen.

```kotlin
// imports for this snippet
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import io.primer.checkout.components.card.CardFormDefaults
import io.primer.checkout.components.card.PrimerCardForm

PrimerCardForm(
    controller = controller,
    cardDetails = {
        Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
            // Name first, then card details
            CardFormDefaults.CardholderField(controller)
            // Draws the co-badged network selector as its own trailing icon.
            CardFormDefaults.CardNumberField(controller)
            // Half, then the rest: no layout scope needed, so this survives being
            // moved into a Row of your own.
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                CardFormDefaults.ExpiryField(controller, Modifier.fillMaxWidth(0.5f))
                CardFormDefaults.CvvField(controller, Modifier.fillMaxWidth())
            }
        }
    },
)
```

### Replace Only the Submit Button

```kotlin
// imports for this snippet
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.size
import androidx.compose.material3.Button
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import io.primer.checkout.components.card.PrimerCardForm

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

**Putting the amount on the button: not from the form state.** The SDK's own KDoc for
`PrimerCardForm` shows this slot as
`MyBrandButton(text = "Pay ${checkout.formatAmount(formState.amount)}", …)`, and **`formState` has
no `amount`** — `PrimerCardFormController.State` never carries one, so that line is
`Unresolved reference 'amount'`
([the KDoc's four broken examples](composable-reference.md#where-the-sdks-own-kdoc-is-wrong)). The
total lives on `clientSession.totalAmount`, and formatting it is `Ready`-only, so a "Pay $10.00"
button reads the string you cached while `Ready` — the effect in
[Inline Host](#inline-host-full-control) is that cache — and never calls `formatAmount` from the
slot, which composes on every keystroke and mostly not from `Ready`.

### Replace Individual Fields in CardDetailsContent

```kotlin
// imports for this snippet
import androidx.compose.foundation.layout.Column
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import io.primer.checkout.components.card.CardFormDefaults
import io.primer.checkout.components.card.PrimerCardForm

PrimerCardForm(
    controller = controller,
    cardDetails = {
        CardFormDefaults.CardDetailsContent(
            cardFormState = controller,
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
// imports for this snippet
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.material3.Checkbox
import androidx.compose.material3.Text
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import io.primer.checkout.components.card.CardFormDefaults
import io.primer.checkout.components.card.PrimerCardForm

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

The `method` slot is called only while **no** method in the list carries a non-zero surcharge. As
soon as one does, the SDK renders its own surcharge group cards and this slot is skipped entirely,
so keep the default row acceptable as a fallback — and do not put surcharge rendering in here,
because a surcharge is exactly the condition under which this code never runs. If you need custom
rows _and_ surcharges, build the list yourself from `controller.methods` (see
[Observing Payment Methods](#observing-payment-methods)) rather than through this slot.

Three things to get right when you copy this, all measured mistakes. The slot lambda takes
**two** parameters, `(paymentMethod: PrimerPaymentMethod, onClick: () -> Unit)` —
[every slot's arity](composable-reference.md#every-slot-and-how-many-parameters-it-takes). The
method's display field is **`paymentMethodName`**, which is nullable: there is no
`PrimerPaymentMethod.displayName` and no `iconUrl`, whatever the SDK's own KDoc example for this
very slot shows
([why the KDoc says otherwise](composable-reference.md#where-the-sdks-own-kdoc-is-wrong)). Write
`method.paymentMethodName ?: method.paymentMethodType`. And the `paymentMethod` this slot hands you
is `io.primer.checkout.api.checkout.models.PrimerPaymentMethod`, the five-field type from
`controller.methods` — **not** the one-field class of the same name that
`clientSession.paymentMethod` returns, which has no `paymentMethodType` at all
([two types, one name](composable-reference.md#two-types-called-primerpaymentmethod)).

```kotlin
// imports for this snippet
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.material3.Card
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import io.primer.checkout.components.paymentMethods.PrimerPaymentMethods

PrimerPaymentMethods(
    controller = paymentMethodsController,
    // TWO parameters: (paymentMethod, onClick). Not three -- there is no isSelected on
    // this slot; that is PrimerVaultedPaymentMethods' `item`. A third parameter here
    // fails with "expected 2 parameters, got 3".
    method = { method, onClick ->
        Card(
            onClick = onClick,
            modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp),
        ) {
            Row(
                modifier = Modifier.padding(16.dp),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                // No brand icon is available from the SDK: PrimerPaymentMethod carries no
                // icon field and PaymentMethodsDefaults exposes no icon-only composable.
                // Supply your own drawable per paymentMethodType, or use
                // PaymentMethodsDefaults.Method(method, onClick) for the SDK-drawn row
                // including its icon, at the cost of the custom layout.
                YourPaymentMethodIcon(method.paymentMethodType)
                Spacer(Modifier.width(12.dp))
                Text(
                    method.paymentMethodName ?: method.paymentMethodType,
                    style = MaterialTheme.typography.bodyLarge,
                )
                // No surcharge line here on purpose: this slot does not run when any method
                // carries one. No trailing chevron either -- that would need a
                // material-icons-* artifact, and the install snippet declares none.
            }
        }
    },
)
```

### Filter Payment Methods by Type

```kotlin
// imports for this snippet
import androidx.compose.foundation.layout.Column
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.getValue
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import io.primer.checkout.components.card.PrimerCardForm
import io.primer.checkout.components.card.rememberCardFormController
import io.primer.checkout.components.paymentMethods.PaymentMethodsDefaults
import io.primer.checkout.components.paymentMethods.rememberPaymentMethodsController

val controller = rememberPaymentMethodsController(checkout)
val allMethods by controller.methods.collectAsStateWithLifecycle()

// Show cards separately from other methods
val cardMethods = allMethods.filter { it.paymentMethodType == "PAYMENT_CARD" }
val otherMethods = allMethods.filter { it.paymentMethodType != "PAYMENT_CARD" }

// paymentMethodType names the processor for redirect methods, so match a suffix or a set
// rather than a bare "IDEAL": ADYEN_IDEAL, MOLLIE_IDEAL, PAY_NL_IDEAL, BUCKAROO_IDEAL.
val idealMethods = allMethods.filter { it.paymentMethodType.endsWith("IDEAL") }

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
// imports for this snippet
import androidx.compose.runtime.Composable
import io.primer.android.core.ExperimentalPrimerApi
import io.primer.checkout.api.checkout.PrimerCheckoutHost
import io.primer.checkout.api.checkout.rememberPrimerCheckoutController
import io.primer.checkout.components.card.rememberCardFormController
import io.primer.checkout.components.paymentMethods.rememberPaymentMethodsController

@OptIn(ExperimentalPrimerApi::class)
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
// imports for this snippet
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import io.primer.android.core.ExperimentalPrimerApi
import io.primer.checkout.api.checkout.PrimerCheckoutSheet
import io.primer.checkout.api.checkout.rememberPrimerCheckoutController

@OptIn(ExperimentalPrimerApi::class)
@Composable
fun BadExample(clientToken: String) {
    var showCheckout by remember { mutableStateOf(false) }

    if (showCheckout) {
        // WRONG (compiles; wrong at runtime) -- recreated every time showCheckout toggles
        val checkout = rememberPrimerCheckoutController(clientToken)
        PrimerCheckoutSheet(checkout = checkout)
    }
}
```

### Correct: Controller Survives Toggle

```kotlin
// imports for this snippet
import androidx.compose.material3.Button
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import io.primer.android.core.ExperimentalPrimerApi
import io.primer.checkout.api.checkout.PrimerCheckoutSheet
import io.primer.checkout.api.checkout.rememberPrimerCheckoutController

@OptIn(ExperimentalPrimerApi::class)
@Composable
fun GoodExample(clientToken: String) {
    // CORRECT -- created unconditionally, so toggling cannot recreate it
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

What this gates is the _screen_, not an active payment. Both the sheet and the host cancel the
in-flight flow when they leave composition, and a pending `beforePaymentCreate` decision is
aborted rather than paused
([both routes to the same cleanup](composable-reference.md#signatures-defaults-and-slot-behaviour)),
so flip `showCheckout` back to `false` from `onDismiss` or from a terminal state — not from
your own timer or a back handler that can fire mid-payment.

### Refreshing the Session

```kotlin
// imports for this snippet
import androidx.compose.foundation.layout.Column
import androidx.compose.material3.Button
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Text
import androidx.compose.runtime.getValue
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import io.primer.android.core.ExperimentalPrimerApi
import io.primer.checkout.api.checkout.rememberPrimerCheckoutController
import io.primer.checkout.api.state.PrimerCheckoutState

@OptIn(ExperimentalPrimerApi::class)
val checkout = rememberPrimerCheckoutController(clientToken)
val state by checkout.state.collectAsStateWithLifecycle()

Column {
    // `state` is a delegated property: bind the subject, here as everywhere.
    when (val s = state) {
        is PrimerCheckoutState.Loading -> CircularProgressIndicator()
        is PrimerCheckoutState.Ready -> {
            // Refresh button -- goes back to Loading, refetches config
            Button(onClick = { checkout.refresh() }) {
                Text("Refresh")
            }
        }
        // PrimerCheckoutState is a sealed interface with six subtypes --
        // the when must be exhaustive.
        else -> Unit
    }
}
```

---

## Navigation Patterns

### Sheet with Navigation Component

```kotlin
// imports for this snippet
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavController
import io.primer.android.core.ExperimentalPrimerApi
import io.primer.checkout.api.checkout.PrimerCheckoutSheet
import io.primer.checkout.api.checkout.rememberPrimerCheckoutController
import io.primer.checkout.api.state.PrimerCheckoutState

@OptIn(ExperimentalPrimerApi::class)
@Composable
fun NavHostCheckout(navController: NavController) {
    val viewModel: YourCheckoutViewModel = viewModel()
    val clientToken by viewModel.clientToken.collectAsStateWithLifecycle()

    clientToken?.let { token ->
        val checkout = rememberPrimerCheckoutController(token)

        val state by checkout.state.collectAsStateWithLifecycle()
        LaunchedEffect(state) {
            when (val s = state) {
                is PrimerCheckoutState.Success -> {
                    navController.navigate("confirmation/${s.checkoutData.payment.id}") {
                        popUpTo("checkout") { inclusive = true }
                    }
                }
                is PrimerCheckoutState.Failure -> { /* shown in sheet */ }
                else -> Unit
            }
        }

        PrimerCheckoutSheet(
            checkout = checkout,
            onDismiss = { navController.popBackStack() },
        )
    }
}
```

### Host with Internal Navigation

```kotlin
// imports for this snippet
import androidx.compose.animation.AnimatedContent
import androidx.compose.foundation.layout.Column
import androidx.compose.material3.Button
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import io.primer.android.core.ExperimentalPrimerApi
import io.primer.android.domain.PrimerCheckoutData
import io.primer.android.domain.error.models.PrimerError
import io.primer.checkout.api.checkout.PrimerCheckoutHost
import io.primer.checkout.api.checkout.rememberPrimerCheckoutController
import io.primer.checkout.api.state.PrimerCheckoutState
import io.primer.checkout.components.card.PrimerCardForm
import io.primer.checkout.components.card.rememberCardFormController
import io.primer.checkout.components.paymentMethods.PrimerPaymentMethods
import io.primer.checkout.components.paymentMethods.rememberPaymentMethodsController

// Declared at file scope -- Kotlin does not allow enum classes inside a function.
enum class Screen { METHODS, CARD_FORM, SUCCESS, ERROR }

@OptIn(ExperimentalPrimerApi::class)
@Composable
fun HostWithNavigation(clientToken: String) {
    val checkout = rememberPrimerCheckoutController(clientToken)
    val checkoutState by checkout.state.collectAsStateWithLifecycle()

    var screen by remember { mutableStateOf(Screen.METHODS) }
    var paymentData by remember { mutableStateOf<PrimerCheckoutData?>(null) }
    var paymentError by remember { mutableStateOf<PrimerError?>(null) }

    LaunchedEffect(checkoutState) {
        when (val s = checkoutState) {
            is PrimerCheckoutState.Success -> {
                paymentData = s.checkoutData
                screen = Screen.SUCCESS
            }
            is PrimerCheckoutState.Failure -> {
                paymentError = s.error
                screen = Screen.ERROR
            }
            else -> Unit
        }
    }

    PrimerCheckoutHost(
        checkout = checkout,
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
// imports for this snippet
import androidx.compose.ui.graphics.Color
import io.primer.checkout.PrimerTheme
import io.primer.checkout.api.checkout.PrimerCheckoutSheet
import io.primer.checkout.internal.tokens.DarkColorTokens
import io.primer.checkout.internal.tokens.LightColorTokens

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

`R.font.your_brand_regular` and `R.font.your_brand_bold` below are **your** resources, not the
SDK's: drop a `.ttf`/`.otf` (or an XML font family) into your module's `res/font/`, and the ids
appear on your app's own generated `R` — which you import by your own package name, because there
is no SDK `R` your code can reach. `TypographyStyle.font` has no default, so a style you pass has
to name a font; the SDK's bundled Inter lives on the SDK module's `R`. Styles you do not pass keep
Inter.

```kotlin
// imports for this snippet
import com.example.checkout.R   // YOUR app's generated R: substitute your module's package
import io.primer.checkout.PrimerTheme
import io.primer.checkout.internal.tokens.TypographyStyle
import io.primer.checkout.internal.tokens.TypographyTokens

val myTheme = PrimerTheme(
    typographyTokens = TypographyTokens(
        titleXlarge = TypographyStyle(
            font = R.font.your_brand_regular,
            size = 28,
            weight = 700,
            lineHeight = 36,
            letterSpacing = -0.5f,
        ),
        bodyLarge = TypographyStyle(
            font = R.font.your_brand_regular,
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
// imports for this snippet
import androidx.compose.ui.unit.dp
import io.primer.checkout.PrimerTheme
import io.primer.checkout.internal.tokens.RadiusTokens
import io.primer.checkout.internal.tokens.SpacingTokens

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
// imports for this snippet
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Text
import androidx.compose.ui.Modifier
import io.primer.checkout.LocalPrimerTheme
import io.primer.checkout.api.checkout.PrimerCheckoutHost

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
// imports for this snippet
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import com.example.checkout.R   // YOUR app's generated R: substitute your module's package
import io.primer.checkout.PrimerTheme
import io.primer.checkout.internal.tokens.BorderWidthTokens
import io.primer.checkout.internal.tokens.DarkColorTokens
import io.primer.checkout.internal.tokens.LightColorTokens
import io.primer.checkout.internal.tokens.RadiusTokens
import io.primer.checkout.internal.tokens.TypographyStyle
import io.primer.checkout.internal.tokens.TypographyTokens

val brandTheme = PrimerTheme(
    lightColorTokens = object : LightColorTokens() {
        override val primerColorBrand: Color = Color(0xFF1DB954)   // your brand green
        override val primerColorGray900: Color = Color(0xFF191414) // near-black text
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
            font = R.font.your_brand_bold,
            size = 24,
            weight = 700,
            lineHeight = 32,
            letterSpacing = -0.5f,
        ),
    ),
)
```

---

## Accessibility for slots you replaced

The SDK's default composables carry labels, hints, required/optional suffixes and polite live
regions — [what each one announces, and what it does
not](composable-reference.md#accessibility). There is no accessibility parameter anywhere in the
public API, so the rule is simply: **the semantics live in the composable you replaced.** Replace
one and you own its announcements; keep one and you get them for free.

Two overrides account for almost all of it: a custom payment-method row, and a custom submit
button. Both restore what the default carried, using the same five semantics APIs the SDK itself
uses.

One thing you do _not_ have to restore: `PrimerCardForm` emits its own "_N_ errors found" polite
live region from outside every slot, so no override removes it.

### A labelled custom method row

The SDK's row announces "Pay with card" (and a native Google Pay row as "Google Pay payment
method"). A `Card { Text(...) }` of your own announces only the text inside it — which for a
method the client session did not name is a wire code like `ADYEN_IDEAL` read out letter by letter.
Put the label on the row and let the inner text be decorative.

```kotlin
// imports for this snippet
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.material3.Card
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.unit.dp
import io.primer.checkout.components.paymentMethods.PrimerPaymentMethods

PrimerPaymentMethods(
    controller = paymentMethodsController,
    // TWO parameters: (paymentMethod, onClick).
    method = { method, onClick ->
        // paymentMethodName, not displayName, and nullable -- so the fallback is the wire
        // code. Build the spoken label from the same expression you render.
        val name = method.paymentMethodName ?: method.paymentMethodType
        Card(
            onClick = onClick,
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 4.dp)
                .semantics { contentDescription = "Pay with $name" },
        ) {
            Row(
                modifier = Modifier.padding(16.dp),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                YourPaymentMethodIcon(method.paymentMethodType)
                Spacer(Modifier.width(12.dp))
                Text(name, style = MaterialTheme.typography.bodyLarge)
            }
        }
    },
)
```

`YourPaymentMethodIcon` is your own composable; give its own image a null
`contentDescription`, because the row above already carries the label and a labelled icon inside a
labelled row is read twice.

### A labelled custom submit button

`CardFormDefaults.SubmitButton` announces "Submit payment" plus a state description that changes
between "Double-tap to submit payment", "Button disabled. Complete all required fields to enable
payment" and "Processing payment, please wait". Overriding the slot drops all four strings. The
`stateDescription` is the part worth reproducing: without it a disabled button announces as
disabled and says nothing about why.

```kotlin
// imports for this snippet
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.size
import androidx.compose.material3.Button
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.semantics.stateDescription
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import io.primer.checkout.components.card.PrimerCardForm

val formState by controller.state.collectAsStateWithLifecycle()

PrimerCardForm(
    controller = controller,
    submitButton = {
        // Your own copy, in your own tone -- these are shopper-facing strings, so put them
        // in your app's strings.xml rather than inline as here.
        val label = "Submit payment"
        val state = when {
            formState.isLoading -> "Processing payment, please wait"
            !formState.isFormValid -> "Complete all required fields to enable payment"
            else -> "Double-tap to submit payment"
        }
        Button(
            onClick = { controller.submit() },
            enabled = formState.isFormValid && !formState.isLoading,
            modifier = Modifier
                .fillMaxWidth()
                .height(56.dp)
                .semantics {
                    contentDescription = label
                    stateDescription = state
                },
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

### Announcing something of your own

A polite live region is the mechanism for anything that appears or changes without the shopper
moving focus — your own validation message, an updated total, a retry banner. It is what the SDK
uses for its error text and its loading screen, and it is one modifier:

```kotlin
// imports for this snippet
import androidx.compose.material3.Text
import androidx.compose.ui.Modifier
import androidx.compose.ui.semantics.LiveRegionMode
import androidx.compose.ui.semantics.liveRegion
import androidx.compose.ui.semantics.semantics

Text(
    yourStatusMessage,
    modifier = Modifier.semantics { liveRegion = LiveRegionMode.Polite },
)
```

Use `Polite`, not `Assertive`: assertive interrupts whatever TalkBack is mid-sentence on, which
during a card form is usually the field the shopper is filling in. The SDK uses `Polite`
everywhere.

There is one gap you cannot close from a slot, and it is worth knowing before an accessibility
review: neither `PrimerCheckoutSheet` nor `PrimerCheckoutHost` announces a screen change, so
moving from method selection to the card form to the result screen is silent. If your flow needs
an announcement there, drive it from your own state in a live region on your own container —
`PrimerCheckoutState` is the signal, collected exactly as everywhere else in this file.

---

## Common Pitfalls

### Pitfall: Creating a Second Checkout Controller Instead of Passing the First

`PrimerCheckoutController` is an interface with no public constructor, so `new`-ing one is not a
mistake you can make — `rememberPrimerCheckoutController` is the only way to get one. The mistake
that does happen compiles cleanly: calling that factory a second time somewhere nested. The
returned `ViewModel` is keyed by a `rememberSaveable` id generated per call site, so a nested call
is a **second checkout session** on the same token, with its own state flow, its own payment
methods request and its own terminal event. Pass the one controller down instead; the sheet's slots
already close over it.

```kotlin
// imports for this snippet
import io.primer.checkout.api.checkout.PrimerCheckoutSheet
import io.primer.checkout.api.checkout.rememberPrimerCheckoutController
import io.primer.checkout.components.card.PrimerCardForm
import io.primer.checkout.components.card.rememberCardFormController

// WRONG (compiles; wrong at runtime) -- a second controller, and a second session, inside a slot
PrimerCheckoutSheet(
    checkout = checkout,
    cardForm = {
        val nested = rememberPrimerCheckoutController(clientToken)
        PrimerCardForm(controller = rememberCardFormController(nested))
    },
)

// CORRECT -- child controllers hang off the one checkout controller
PrimerCheckoutSheet(
    checkout = checkout,
    cardForm = {
        PrimerCardForm(controller = rememberCardFormController(checkout))
    },
)
```

### Pitfall: Using collectAsState Instead of collectAsStateWithLifecycle

```kotlin
// imports for this snippet
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.lifecycle.compose.collectAsStateWithLifecycle

// WRONG (compiles; wrong at runtime) -- does not respect lifecycle, may leak
val state by checkout.state.collectAsState()

// CORRECT
val state by checkout.state.collectAsStateWithLifecycle()
```

### Pitfall: SDK Components Outside Host/Sheet Scope

`PrimerCheckoutHost` and `PrimerCheckoutSheet` provide the theme (`LocalPrimerTheme`) and the
settings the SDK screens read, and they host the overlays for the card form, 3DS and redirects.
Components rendered outside that scope fall back to the default theme and cannot show those
overlays, so a submit appears to do nothing. Create the child controller and its component in the
same scope.

```kotlin
// imports for this snippet
import io.primer.checkout.api.checkout.PrimerCheckoutHost
import io.primer.checkout.components.card.PrimerCardForm
import io.primer.checkout.components.card.rememberCardFormController

// WRONG (compiles; wrong at runtime) -- component (and its controller) outside the host
val cardFormController = rememberCardFormController(checkout)
PrimerCardForm(controller = cardFormController)
PrimerCheckoutHost(checkout = checkout) { /* ... */ }

// CORRECT -- both inside Host content
PrimerCheckoutHost(checkout = checkout) {
    val cardFormController = rememberCardFormController(checkout)
    PrimerCardForm(controller = cardFormController)
}
```

### Pitfall: Setting redirectScheme and Expecting It to Do Something

Browser redirects (PayPal, iDEAL, Bancontact, …) return through
`primer://requestor.<your applicationId>/async`, which the SDK builds itself and registers in its
own manifest. You add no intent filter, and `paymentMethodOptions.redirectScheme` is not read by
the SDK at this version — setting it changes nothing.

The two return URLs that _are_ yours to supply. **Copy the nesting, not the line:** neither
`returnIntentUrl` nor `threeDsOptions` is a `PrimerSettings` parameter, and hoisting one to the top
level fails with `No parameter with name 'threeDsOptions' found` plus a misleading
`No value passed for parameter 'parcel'` — `PrimerSettings` has a `Parcelable` constructor the
compiler falls through to. Three levels deep is correct here
([what belongs to what](composable-reference.md#configuration-types)).

```kotlin
// imports for this snippet
import io.primer.android.data.settings.PrimerKlarnaOptions
import io.primer.android.data.settings.PrimerPaymentMethodOptions
import io.primer.android.data.settings.PrimerSettings
import io.primer.android.data.settings.PrimerThreeDsOptions

// PrimerSettings -> paymentMethodOptions -> klarnaOptions / threeDsOptions -> the field.
val settings = PrimerSettings(
    paymentMethodOptions = PrimerPaymentMethodOptions(
        // Required for Klarna: selecting a category without it throws
        // IllegalArgumentException. Use a deep link your app already handles.
        klarnaOptions = PrimerKlarnaOptions(returnIntentUrl = "myapp://klarna"),
        // 3DS out-of-band only. Must be https and match Android's WEB_URL pattern,
        // or the SDK drops it silently and the shopper cannot return from the bank app.
        threeDsOptions = PrimerThreeDsOptions(threeDsAppRequestorUrl = "https://example.com/3ds"),
    ),
)
```

### Pitfall: Only Handling Success

`Success` and `Failure` are both members of `PrimerCheckoutState`, and both stick on the flow
until a new attempt starts. Collecting only one of them silently drops the other, and a `when`
over the state needs an `else` -- there are six members, not two.

```kotlin
// imports for this snippet
import android.util.Log
import androidx.compose.runtime.LaunchedEffect
import io.primer.checkout.api.state.PrimerCheckoutState

// WRONG (compiles; wrong at runtime) -- ignores failures, and misses the client-session states entirely
LaunchedEffect(state) {
    if (state is PrimerCheckoutState.Success) { /* ... */ }
}

// CORRECT -- handle both outcomes, and terminate the when
LaunchedEffect(state) {
    when (val s = state) {
        is PrimerCheckoutState.Success -> {
            yourNavigateToConfirmation(s.checkoutData.payment.id)
        }
        is PrimerCheckoutState.Failure -> {
            Log.e("Checkout", "Error: ${s.error.description}")
            Log.e("Checkout", "diagnosticsId: ${s.error.diagnosticsId}")
        }
        else -> Unit
    }
}
```

### Pitfall: Confusing isFormValid and fieldErrors

```kotlin
// imports for this snippet
// fieldErrorMessage(error, context) is this skill's own helper, defined a few lines below
// in this file and identically in composable-reference.md. It is not an SDK function.
import androidx.compose.material3.Button
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.getValue
import androidx.compose.ui.platform.LocalContext
import androidx.lifecycle.compose.collectAsStateWithLifecycle

val formState by controller.state.collectAsStateWithLifecycle()

// isFormValid -- updates in real-time as user types, use for submit button
Button(
    onClick = { controller.submit() },
    enabled = formState.isFormValid && !formState.isLoading,
) { Text("Pay") }

// fieldErrors -- updates on blur only, use for error messages. The entries carry string
// resource ids, not text; errorId is a programmatic code and must not be shown to a shopper.
val context = LocalContext.current
formState.fieldErrors?.forEach { error ->
    Text(fieldErrorMessage(error, context), color = MaterialTheme.colorScheme.error)
}
```

`errorResId` is the only field on a Components validation error that carries a message:
`errorFormatId` is always null here and `fieldId` is always `0`, so `context.getString(fieldId)`
throws `Resources.NotFoundException`
([why](composable-reference.md#syncvalidationerror)). Resolve it with a `?.let` chain rather than a
null check — `SyncValidationError` comes from the SDK module and Kotlin will not smart-cast its
properties, so the `if (error.errorResId != null) context.getString(error.errorResId)` form does
not compile — and take the `Context` as a parameter so the same function works from a `ViewModel`
that has no composition around it.

```kotlin
// imports for this snippet
import android.content.Context
import com.example.checkout.R   // YOUR app's generated R: substitute your module's package
import io.primer.android.ui.core.model.SyncValidationError

// A plain function, not a @Composable, so the same one serves a Text() in a slot and a
// ViewModel formatting errors for a snackbar. The same function appears in
// composable-reference.md, deliberately. Keep them identical.
// R here is YOUR app's generated R: import com.example.checkout.R
fun fieldErrorMessage(error: SyncValidationError, context: Context): String =
    error.errorResId?.let { context.getString(it) }
        ?: context.getString(R.string.your_field_invalid)
```

---

## Troubleshooting: symptom to cause

What the merchant sees, and what causes it. Reach for the logging patterns below once you have
narrowed it to one of these.

- **Stuck on `Loading`** — token invalid, expired, or from another environment. Check Logcat.
- **No payment methods** — not enabled in the Dashboard for the session's currency and country, or
  a session field is missing (Klarna needs `lineItems`).
- **Blank checkout** — a component or child controller outside the sheet or host.
- **Card fields missing** — expected; the session decides which render.
- **Submit inert** — `state.isFormValid` is false. Inspect `state.fieldErrors`.
- **Re-initialises constantly** — controller inside an `if`, or a second one in a nested slot.
- **State never updates** — collected without `collectAsStateWithLifecycle()`.
- **Crash on Klarna category select** — `paymentMethodOptions.klarnaOptions.returnIntentUrl`
  unset.
- **No return from a banking app (3DS OOB)** —
  `paymentMethodOptions.threeDsOptions.threeDsAppRequestorUrl` missing or not `https://`.
- **3DS fails instantly on an emulator or a rooted device** — `debugOptions.is3DSSanityCheckEnabled`
  defaults to `true` and refuses to initialise when the 3DS SDK reports device warnings, which it
  always does there. Set it `false` in debug builds
  ([why](composable-reference.md#configuration-types)).
- **Crash inside `PrimerPaymentMethods`** — the list was composed outside `Ready` while a method
  carried a surcharge; its surcharge header formats an amount and `formatAmount` is `Ready`-only.
- **Crash after a failed payment, inside the SDK's own sheet, on a surcharged session** — the
  default error screen's "try other payment methods" button navigates back to the method list
  while the state is `Failure`, and the surcharge header throws there. Not fixable in your code:
  override the sheet's `error` slot and offer `refresh()` instead
  ([why](composable-reference.md#signatures-defaults-and-slot-behaviour),
  [how](#replacing-the-sheets-error-screen)).
- **A payment never completes after the sheet was hidden or navigated away from** — leaving
  composition cancels the in-flight flow, and a pending `beforePaymentCreate` decision is
  _aborted_ with `"Payment gate dismissed"`. Keep the sheet or host composed until a terminal
  state arrives.
- **`Unresolved reference 'surcharge'`** — you are on `clientSession.paymentMethod`, which is a
  different class with the same simple name. Surcharges come from `controller.methods`
  ([both types](composable-reference.md#two-types-called-primerpaymentmethod)).
- **`No parameter with name '…' found`, plus `No value passed for parameter 'parcel'`** — a nested
  settings field passed straight to `PrimerSettings(...)`; the second error is the `Parcelable`
  constructor the compiler fell through to
  ([the nesting](composable-reference.md#configuration-types)).
- **Two network selectors** — `CardNetworkField` called next to `CardNumberField`.
- **TalkBack reads a payment method as a wire code, or reads nothing** — a custom `method` row
  carries no label; the SDK's row did.
  [Restore it](#accessibility-for-slots-you-replaced).
- **A disabled pay button announces nothing about why** — a custom `submitButton` dropped the
  SDK's `stateDescription`. Same section.
- **Crash formatting an amount** — `formatAmount` called outside `Ready`.
- **Compose compiler build failure** — apply `org.jetbrains.kotlin.plugin.compose` matching your
  Kotlin version; `composeOptions.kotlinCompilerExtensionVersion` is obsolete on Kotlin 2.x.
- **`Icons.Default.*` unresolved** — no `material-icons-*` coordinate is declared, by design; see
  the install snippet in [`SKILL.md`](../SKILL.md#install-and-initialise).

---

## Debugging Patterns

### Log All State Transitions

```kotlin
// imports for this snippet
import android.util.Log
import androidx.compose.runtime.LaunchedEffect
import io.primer.android.core.ExperimentalPrimerApi
import io.primer.checkout.api.checkout.rememberPrimerCheckoutController
import io.primer.checkout.api.state.PrimerCheckoutState

@OptIn(ExperimentalPrimerApi::class)
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
// imports for this snippet
import android.util.Log
import androidx.compose.runtime.LaunchedEffect
import io.primer.checkout.components.card.rememberCardFormController

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
// imports for this snippet
import android.util.Log
import androidx.compose.runtime.LaunchedEffect
import io.primer.checkout.components.paymentMethods.rememberPaymentMethodsController

val controller = rememberPaymentMethodsController(checkout)

LaunchedEffect(controller) {
    controller.methods.collect { methods ->
        Log.d("PrimerDebug", "Available methods (${methods.size}):")
        methods.forEach { m ->
            // paymentMethodName is the display field (nullable); there is no displayName.
            Log.d("PrimerDebug", "  ${m.paymentMethodType}: ${m.paymentMethodName}")
        }
    }
}
```

### Log All Events with Diagnostics

```kotlin
// imports for this snippet
import android.util.Log
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import io.primer.checkout.api.checkout.PrimerCheckoutSheet
import io.primer.checkout.api.state.PrimerCheckoutState

val state by checkout.state.collectAsStateWithLifecycle()
LaunchedEffect(state) {
    when (val s = state) {
        is PrimerCheckoutState.Success -> {
            Log.i("PrimerDebug", "Payment success: ${s.checkoutData.payment.id}")
            Log.i("PrimerDebug", "Order ID: ${s.checkoutData.payment.orderId}")
        }
        is PrimerCheckoutState.Failure -> {
            Log.e("PrimerDebug", "Payment failed: ${s.error.description}")
            Log.e("PrimerDebug", "Error ID: ${s.error.errorId}")
            Log.e("PrimerDebug", "Error code: ${s.error.errorCode}")
            Log.e("PrimerDebug", "Diagnostics ID: ${s.error.diagnosticsId}")
            Log.e("PrimerDebug", "Recovery: ${s.error.recoverySuggestion}")
        }
        else -> Unit
    }
}

PrimerCheckoutSheet(
    checkout = checkout,
)
```

### Verify Installation

`assembleDebug` succeeding proves nothing about the pin: an unused dependency, a version other
than the one you wrote, and a stale cache all build clean. Ask what actually resolved, and read the
version back:

```bash
./gradlew -q :app:dependencyInsight --dependency io.primer:checkout \
  --configuration debugCompileClasspath | head -3
```

The first line is the resolved coordinate. It must be the version the install snippet in
[`SKILL.md`](../SKILL.md#install-and-initialise) pins. A
different version means something upgraded it (another dependency, a BOM, a dynamic range) and the
lines under it say what. `No dependencies matching given input were found` means it is not on that
configuration at all, which is the failure `assembleDebug` hides. Run it once per payment-method
wrapper you added as well, e.g. `--dependency io.primer:3ds-android`.

---

## Complete Integration Example

Full checkout screen with settings, theming, payment methods, card form, saved payment methods and
outcome handling:

```kotlin
// imports for this snippet
import android.util.Log
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.material3.Checkbox
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.graphics.Color
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import io.primer.android.core.ExperimentalPrimerApi
import io.primer.android.data.settings.DismissalMechanism
import io.primer.android.data.settings.PrimerGooglePayOptions
import io.primer.android.data.settings.PrimerPaymentMethodOptions
import io.primer.android.data.settings.PrimerSettings
import io.primer.android.ui.settings.PrimerUIOptions
import io.primer.checkout.PrimerTheme
import io.primer.checkout.api.checkout.PrimerCheckoutSheet
import io.primer.checkout.api.checkout.PrimerCheckoutSheetDefaults
import io.primer.checkout.api.checkout.rememberPrimerCheckoutController
import io.primer.checkout.api.state.PrimerCheckoutState
import io.primer.checkout.components.card.CardFormDefaults
import io.primer.checkout.components.card.PrimerCardForm
import io.primer.checkout.components.card.rememberCardFormController
import io.primer.checkout.internal.tokens.DarkColorTokens
import io.primer.checkout.internal.tokens.LightColorTokens

@OptIn(ExperimentalPrimerApi::class)
@Composable
fun FullCheckoutScreen(
    clientToken: String,
    onPaymentComplete: (String) -> Unit,
    onDismiss: () -> Unit,
) {
    val settings = PrimerSettings(
        paymentMethodOptions = PrimerPaymentMethodOptions(
            googlePayOptions = PrimerGooglePayOptions(
                merchantName = "Example Store",
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

    val state by checkout.state.collectAsStateWithLifecycle()
    LaunchedEffect(state) {
        when (val s = state) {
            is PrimerCheckoutState.Success -> {
                onPaymentComplete(s.checkoutData.payment.id)
            }
            is PrimerCheckoutState.Failure -> {
                Log.e("Checkout", "diagnosticsId: ${s.error.diagnosticsId}")
            }
            else -> Unit
        }
    }

    PrimerCheckoutSheet(
        checkout = checkout,
        theme = theme,
        onDismiss = onDismiss,
        paymentMethodSelection = {
            Column {
                // Saved payment methods first
                PrimerCheckoutSheetDefaults.VaultedMethods(checkout)
                // Then the available methods
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

---

## Klarna and QR Code Payment Methods

There is no merchant-side pattern for these. `PrimerKlarnaController`, `PrimerQrCodeController`
and their `remember` functions are `internal` to the SDK, so app code cannot reference them.
Both methods render inside `PrimerCheckoutSheet`, or through `PrimerPaymentMethods` when you
build your own layout with `PrimerCheckoutHost` -- the SDK owns their multi-step UI.

Klarna needs two things beyond the defaults: `lineItems` on the client session, or the method does
not appear at all, and `paymentMethodOptions.klarnaOptions.returnIntentUrl` in your settings
(`PrimerKlarnaOptions`, nested two levels under `PrimerSettings` —
[the nesting](composable-reference.md#configuration-types)), or selecting a Klarna category throws
`IllegalArgumentException`.

---

## Gating Payment Creation (idempotency keys)

Pass a `beforePaymentCreate` slot to pause the SDK immediately before it creates a payment. Run
last-minute checks, then either continue -- optionally with a per-attempt `X-Idempotency-Key` --
or abort. Providing the slot is the opt-in; omit it and the SDK proceeds with no idempotency key.

Once provided you **must** resolve it exactly once **per attempt**, or the payment waits
indefinitely — there is no timeout. The gate stays registered for as long as the sheet or host is
composed, so a branch that renders nothing on a second attempt hangs checkout: resolve from a
`LaunchedEffect` in that branch.

Two lifetime facts decide how this snippet is written, both documented in full under
[the handler's identity and lifetime](composable-reference.md#the-beforepaymentcreate-handler):
the handler object is the **same instance** on every attempt, and your slot is composed **only
while a decision is pending**. So a `remember` inside the slot is fresh per attempt (put the
idempotency key there — one key per screen means a retry after a decline is deduplicated against
the payment that already failed), and a `rememberSaveable` outside it survives across attempts
(put "already accepted" there).

```kotlin
// imports for this snippet
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import io.primer.android.core.ExperimentalPrimerApi
import io.primer.checkout.api.checkout.PrimerCheckoutSheet
import io.primer.checkout.api.checkout.rememberPrimerCheckoutController
import java.util.UUID

@OptIn(ExperimentalPrimerApi::class)
@Composable
fun GatedCheckout(clientToken: String) {
    val checkout = rememberPrimerCheckoutController(clientToken)
    var termsAccepted by rememberSaveable { mutableStateOf(false) }

    PrimerCheckoutSheet(
        checkout = checkout,
        beforePaymentCreate = { handler ->
            if (termsAccepted) {
                // Already accepted on an earlier attempt. Resolve immediately -- rendering
                // nothing here would leave the handler unresolved and the payment waiting
                // forever, because providing the slot keeps the gate registered.
                LaunchedEffect(handler) {
                    handler.continuePaymentCreation(idempotencyKey = UUID.randomUUID().toString())
                }
            } else {
                AlertDialog(
                    onDismissRequest = { handler.abortPaymentCreation("Dismissed") },
                    title = { Text("Accept terms to continue") },
                    confirmButton = {
                        TextButton(onClick = {
                            termsAccepted = true
                            // Generated here, not hoisted: the slot runs once per payment
                            // attempt, and a retry after a decline must not reuse the previous
                            // key or the retry is deduplicated against the failed payment.
                            handler.continuePaymentCreation(
                                idempotencyKey = UUID.randomUUID().toString(),
                            )
                        }) { Text("Accept and pay") }
                    },
                    dismissButton = {
                        TextButton(onClick = { handler.abortPaymentCreation("Terms declined") }) {
                            Text("Cancel")
                        }
                    },
                )
            }
        },
    )
}
```

`PrimerCheckoutHost` takes the same slot with the same contract.

---

## Google Pay Integration Pattern

Configure Google Pay and show an express checkout button:

```kotlin
// imports for this snippet
import android.util.Log
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Button
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.google.android.gms.wallet.button.ButtonConstants
import io.primer.android.core.ExperimentalPrimerApi
import io.primer.android.data.settings.GooglePayButtonOptions
import io.primer.android.data.settings.PrimerGooglePayOptions
import io.primer.android.data.settings.PrimerPaymentMethodOptions
import io.primer.android.data.settings.PrimerSettings
import io.primer.checkout.api.checkout.PrimerCheckoutHost
import io.primer.checkout.api.checkout.rememberPrimerCheckoutController
import io.primer.checkout.api.state.PrimerCheckoutState
import io.primer.checkout.components.card.PrimerCardForm
import io.primer.checkout.components.card.rememberCardFormController
import io.primer.checkout.components.paymentMethods.rememberPaymentMethodsController

@OptIn(ExperimentalPrimerApi::class)
@Composable
fun GooglePayCheckout(clientToken: String, onComplete: (String) -> Unit) {
    val settings = PrimerSettings(
        paymentMethodOptions = PrimerPaymentMethodOptions(
            googlePayOptions = PrimerGooglePayOptions(
                merchantName = "My Store",
                captureBillingAddress = true,
                // buttonTheme/buttonType are Ints from Google Play Services --
                // import com.google.android.gms.wallet.button.ButtonConstants
                buttonOptions = GooglePayButtonOptions(
                    buttonTheme = ButtonConstants.ButtonTheme.DARK,
                    buttonType = ButtonConstants.ButtonType.PAY,
                ),
            ),
        ),
    )

    val checkout = rememberPrimerCheckoutController(clientToken, settings)
    val checkoutState by checkout.state.collectAsStateWithLifecycle()

    LaunchedEffect(checkoutState) {
        when (val s = checkoutState) {
            is PrimerCheckoutState.Success -> onComplete(s.checkoutData.payment.id)
            is PrimerCheckoutState.Failure -> {
                Log.e("GooglePay", "Error: ${s.error.description}")
            }
            else -> Unit
        }
    }

    PrimerCheckoutHost(
        checkout = checkout,
    ) {
        if (checkoutState is PrimerCheckoutState.Ready) {
            val controller = rememberPaymentMethodsController(checkout)
            val methods by controller.methods.collectAsStateWithLifecycle()

            Column(
                modifier = Modifier.fillMaxWidth().padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(16.dp),
            ) {
                // Express checkout: Google Pay button
                val googlePay = methods.find { it.paymentMethodType == "GOOGLE_PAY" }
                googlePay?.let { method ->
                    Button(
                        onClick = { controller.select(method) },
                        modifier = Modifier.fillMaxWidth().height(48.dp),
                    ) {
                        Text("Pay with Google Pay")
                    }
                }

                HorizontalDivider()

                // Card form fallback
                val cardFormController = rememberCardFormController(checkout)
                PrimerCardForm(controller = cardFormController)
            }
        } else {
            Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                CircularProgressIndicator()
            }
        }
    }
}
```

**Notes:** `controller.select(googlePayMethod)` opens the native Google Pay sheet; no extra UI is
needed. `GooglePayButtonOptions` and `buttonStyle` only style the SDK-drawn Google Pay row inside
`PrimerPaymentMethods`, and the hand-rolled `Button` above ignores both.

That `Button` compiles, renders and takes payments, and it is the one snippet here that can still
fail something no compiler sees: Google's
[brand guidelines](https://developers.google.com/pay/api/android/guides/brand-guidelines) govern
how a Google Pay button may look, and a plain Material button labelled "Pay with Google Pay" does
not meet them — which can cost you a production review. It stands here as the shape of the
integration, not as shippable UI. The compliant path is the SDK-drawn Google Pay row inside
`PrimerPaymentMethods`, styled through `googlePayOptions.buttonOptions` and `buttonStyle`; the
alternative is Google's own branded button, a `FrameLayout`
(`com.google.android.gms.wallet.button.PayButton`, in the `play-services-wallet` coordinate the
install snippet already carries) that you would host in an `AndroidView` and wire up yourself.
This skill does not cover that path.

---

## Error Recovery Pattern

Handle errors with recovery strategies based on error ID.

One constraint shapes this pattern: the checkout controller is a `ViewModel` keyed to the
composition, not to the token, so **assigning a new client token to the same screen does nothing**.
An expired token has to be reported upwards so the host can re-enter the screen with a fresh one
(popping and re-pushing the route gives a new `ViewModelStore`, and therefore a new controller).
Everything else recovers in place with `checkout.refresh()`.

```kotlin
// imports for this snippet
import android.util.Log
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.SnackbarResult
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.ui.Modifier
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import io.primer.android.core.ExperimentalPrimerApi
import io.primer.checkout.api.checkout.PrimerCheckoutSheet
import io.primer.checkout.api.checkout.rememberPrimerCheckoutController
import io.primer.checkout.api.state.PrimerCheckoutState
import kotlinx.coroutines.launch

@OptIn(ExperimentalPrimerApi::class)
@Composable
fun CheckoutWithErrorRecovery(
    clientToken: String,
    onTokenExpired: () -> Unit,   // caller mints a new token and re-navigates to this screen
    onComplete: () -> Unit,
) {
    val checkout = rememberPrimerCheckoutController(clientToken)
    val scope = rememberCoroutineScope()
    val snackbarHostState = remember { SnackbarHostState() }

    Scaffold(
        snackbarHost = { SnackbarHost(snackbarHostState) },
    ) { padding ->
        val state by checkout.state.collectAsStateWithLifecycle()
        LaunchedEffect(state) {
            when (val s = state) {
                is PrimerCheckoutState.Success -> onComplete()
                is PrimerCheckoutState.Failure -> {
                    when (s.error.errorId) {
                        "payment-cancelled" -> {
                            // User cancelled -- no action needed
                        }
                        "bad-network", "connectivity-errors" -> {
                            scope.launch {
                                val result = snackbarHostState.showSnackbar(
                                    message = "No internet connection",
                                    actionLabel = "Retry",
                                )
                                if (result == SnackbarResult.ActionPerformed) {
                                    checkout.refresh()
                                }
                            }
                        }
                        "unauthorized", "failed-to-create-session" -> {
                            // Token invalid or expired. refresh() reuses the same token and
                            // would fail again, so hand this back to the caller.
                            onTokenExpired()
                        }
                        "server-error" -> {
                            scope.launch {
                                snackbarHostState.showSnackbar("Server error. Please try again later.")
                            }
                        }
                        else -> {
                            Log.e("Checkout", "Error: ${s.error.errorId}")
                            Log.e("Checkout", "diagnosticsId: ${s.error.diagnosticsId}")
                        }
                    }
                }
                else -> Unit
            }
        }

        PrimerCheckoutSheet(
            checkout = checkout,
            modifier = Modifier.padding(padding),
        )
    }
}
```

### Replacing the Sheet's Error Screen

The default `error` screen carries two buttons — **Retry**, wired to `checkout.refresh()`, and
"try other payment methods" — and overriding the slot replaces both, so a custom error screen that
forgets `refresh()` is a dead end. Rebuild the retry:

```kotlin
// imports for this snippet
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Button
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import io.primer.checkout.api.checkout.PrimerCheckoutSheet

PrimerCheckoutSheet(
    checkout = checkout,
    error = { err ->
        Column(
            modifier = Modifier.fillMaxWidth().padding(24.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp),
        ) {
            // description and recoverySuggestion are developer-facing: show your own copy
            // to the shopper and log the rest.
            Text("We could not take that payment", style = MaterialTheme.typography.titleMedium)
            when (err.errorId) {
                // refresh() reuses the same client token, so it cannot fix an expired one.
                "unauthorized", "failed-to-create-session" ->
                    Button(onClick = { yourNavigateToFreshToken() }) { Text("Start again") }
                else ->
                    Button(onClick = { checkout.refresh() }) { Text("Retry") }
            }
            TextButton(onClick = { checkout.dismiss() }) { Text("Back to cart") }
            Text(
                "Reference: ${err.diagnosticsId}",
                style = MaterialTheme.typography.bodySmall,
            )
        }
    },
)
```

`checkout.dismiss()` is what closes the sheet from a custom result screen; the default success
screen auto-dismisses after three seconds, a custom one never does.

---

## Vault-Only Flow Pattern

Collect a card, store it for reuse, and list what the customer has already saved.

`setVaultOnSuccess(true)` asks Primer to store the instrument **when the payment succeeds** — it is
not a switch that skips the charge, and Components exposes no `VAULT`-intent entry point of its
own (`PrimerSessionIntent` only appears read-only on `PrimerPaymentMethod`). Whether the shopper is
charged is decided by the client session your server creates; see
[the Primer docs](https://primer.io/docs) for a vault-intent session.

```kotlin
// imports for this snippet
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import io.primer.android.core.ExperimentalPrimerApi
import io.primer.android.data.settings.PrimerSettings
import io.primer.android.ui.settings.PrimerCardFormUIOptions
import io.primer.android.ui.settings.PrimerUIOptions
import io.primer.checkout.api.checkout.PrimerCheckoutHost
import io.primer.checkout.api.checkout.rememberPrimerCheckoutController
import io.primer.checkout.api.state.PrimerCheckoutState
import io.primer.checkout.components.card.PrimerCardForm
import io.primer.checkout.components.card.rememberCardFormController
import io.primer.checkout.components.paymentMethods.PrimerVaultedPaymentMethods
import io.primer.checkout.components.paymentMethods.rememberVaultedPaymentMethodsController

@OptIn(ExperimentalPrimerApi::class)
@Composable
fun VaultCardScreen(clientToken: String) {
    val settings = PrimerSettings(
        uiOptions = PrimerUIOptions(
            cardFormUIOptions = PrimerCardFormUIOptions(
                // Titles the SDK's own card-form screen "Add card" instead of "Pay with card".
                // It does not change any button label, and it has no effect on a card form you
                // render yourself inside PrimerCheckoutHost.
                payButtonAddNewCard = true,
            ),
        ),
    )

    val checkout = rememberPrimerCheckoutController(clientToken, settings)
    val checkoutState by checkout.state.collectAsStateWithLifecycle()

    LaunchedEffect(checkoutState) {
        when (val s = checkoutState) {
            is PrimerCheckoutState.Success -> { /* Card saved successfully */ }
            is PrimerCheckoutState.Failure -> { /* Handle error */ }
            else -> Unit
        }
    }

    PrimerCheckoutHost(
        checkout = checkout,
    ) {
        if (checkoutState !is PrimerCheckoutState.Ready) {
            CircularProgressIndicator()
            return@PrimerCheckoutHost
        }

        val cardFormController = rememberCardFormController(checkout)
        val vaultedController = rememberVaultedPaymentMethodsController(checkout)
        val vaultedMethods by vaultedController.methods.collectAsStateWithLifecycle()
        val formState by cardFormController.state.collectAsStateWithLifecycle()

        // Enable vault on success
        LaunchedEffect(Unit) {
            cardFormController.setVaultOnSuccess(true)
        }

        Column(
            modifier = Modifier.fillMaxWidth().padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp),
        ) {
            // Show existing saved methods
            if (vaultedMethods.isNotEmpty()) {
                Text("Saved payment methods", style = MaterialTheme.typography.titleMedium)
                PrimerVaultedPaymentMethods(controller = vaultedController)
                HorizontalDivider()
            }

            // Card form to add new method
            Text("Add new card", style = MaterialTheme.typography.titleMedium)
            PrimerCardForm(controller = cardFormController)
        }
    }
}
```

**Requirements:**

- The client session must include `customerId`, or vaulting silently does not happen
- Call `cardFormController.setVaultOnSuccess(true)` to save the card on success
- `PrimerCardFormUIOptions.payButtonAddNewCard = true` retitles the SDK's card-form screen from
  "Pay with card" to "Add card". It changes no button label, and it has no effect on a card form
  you render yourself inside `PrimerCheckoutHost` — as here. `CardFormDefaults.SubmitButton` reads
  "Pay", with no amount, so override the `submitButton` slot if you want "Save card"
- Whether the shopper is charged depends on the client session, not on this screen

---

## Retryable Pay Button for Saved Methods

`PrimerVaultedPaymentMethods` hands its `submitButton` slot an `isLoading` that flips to `true` on
the first `onSubmit()` and is never set back
([why](composable-reference.md#composables-and-defaults)). Drive the slot from your own state
instead, and reset it when the attempt ends, or a declined saved-card payment leaves the shopper
with a spinner and no way to retry short of leaving the screen.

```kotlin
// imports for this snippet
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.size
import androidx.compose.material3.Button
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import io.primer.checkout.api.state.PrimerCheckoutController
import io.primer.checkout.api.state.PrimerCheckoutState
import io.primer.checkout.components.paymentMethods.PrimerVaultedPaymentMethods
import io.primer.checkout.components.paymentMethods.rememberVaultedPaymentMethodsController

@Composable
fun RetryableVaultedMethods(checkout: PrimerCheckoutController) {
    val vaultedController = rememberVaultedPaymentMethodsController(checkout)
    val checkoutState by checkout.state.collectAsStateWithLifecycle()

    // Your own latch, not the slot's: the slot's never clears.
    var submitting by remember { mutableStateOf(false) }

    // Both terminal states end the attempt, and both stick, so keying the effect on the
    // state runs it once per attempt. An `if` rather than a `when (checkoutState)`: no branch
    // here needs the payload, and `when` over an unbound delegated property is the habit the
    // rest of this file exists to prevent.
    LaunchedEffect(checkoutState) {
        if (checkoutState is PrimerCheckoutState.Success ||
            checkoutState is PrimerCheckoutState.Failure
        ) {
            submitting = false
        }
    }

    PrimerVaultedPaymentMethods(
        controller = vaultedController,
        // THREE parameters: (isLoading, enabled, onSubmit). Both of the first two are
        // ignored here, and that is the whole point -- see below. Arity table:
        // composable-reference.md#every-slot-and-how-many-parameters-it-takes
        submitButton = { _, _, onSubmit ->
            Button(
                onClick = {
                    submitting = true
                    onSubmit()
                },
                // Not `enabled && !submitting`: the slot's own `enabled` is
                // `!isLoading && selectedMethod != null`, so it carries the same one-way
                // latch and stays false after the first attempt.
                enabled = !submitting,
                modifier = Modifier.fillMaxWidth(),
            ) {
                if (submitting) {
                    CircularProgressIndicator(
                        modifier = Modifier.size(24.dp),
                        color = MaterialTheme.colorScheme.onPrimary,
                    )
                } else {
                    Text("Pay with saved card")
                }
            }
        },
    )
}
```

**Both of the slot's boolean parameters have to be discarded, not just `isLoading`.** The SDK
invokes the slot as `submitButton(isLoading, !isLoading && selectedMethod != null) { … }`, so
`enabled` embeds the very latch this pattern exists to escape: an `enabled && !submitting`
condition is `false` for as long as the composable lives, and the button never becomes retryable.
Nothing is lost by dropping it — `PrimerVaultedPaymentMethods` returns before composing anything
when `methods` is empty, and the selection defaults to the first method, so the
`selectedMethod != null` half is always true wherever your slot runs. `!submitting` is the whole
condition.
