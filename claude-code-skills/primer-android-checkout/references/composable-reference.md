# Primer Android Checkout — API reference

Public surface of `io.primer:checkout`: imports, composables, controllers, state, settings, design
tokens and error ids.

**Provenance.** Every signature, default, token value and _behavioural_ claim in this file —
what a composable skips, what a call throws, what a screen does after three seconds — was read off
the source of the release tag that [`SKILL.md`](../SKILL.md#install-and-initialise) pins, not off a
release branch and not off KDoc, which is stale in places (`delete` is documented as showing a
confirmation dialog and does not). Behaviour is as version-sensitive as a parameter list: when the
pin moves, re-read both from that tag rather than editing by hand.

The SDK repo carries a machine-generated declaration dump at `components/api/components.api`, which
is the cheapest way to diff a new tag against the signatures below. Know its limits before trusting
it as coverage: it is generated for the `:components` module only, and it drops the
`io.primer.checkout.internal` package. So it covers the composables, the controllers and
`PrimerCheckoutState`, and it covers neither the design tokens nor anything under
`io.primer.android.*` — which is most of the settings and payload types on this page.

Only the merchant-callable surface is listed. Types the SDK declares `internal` — the Klarna, QR
code, dynamic form and country-selection controllers among them — are deliberately absent: app code
cannot reference them, and those flows are driven by `PrimerCheckoutSheet` or
`PrimerPaymentMethods` instead.

## Contents

This file is ~13,900 words. Read one section, not the file: the ranges are exact, so
`sed -n '58,388p' references/composable-reference.md` gives you the import map and nothing else.
A parent range includes its subsections.

| Lines     | Section                                                                                                                              |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| 58-388    | [Import map](#import-map) — complete for these snippets; do-not-import list included                                                 |
| 389-427   | [Controller creation](#controller-creation)                                                                                          |
| 428-682   | [Controller interfaces](#controller-interfaces)                                                                                      |
| 550-652   | &nbsp;&nbsp;[When `formatAmount` and `ClientSessionUpdated` collide](#when-both-rules-collide-formatamount-and-clientsessionupdated) |
| 653-682   | &nbsp;&nbsp;[The beforePaymentCreate handler](#the-beforepaymentcreate-handler)                                                      |
| 683-1030  | [Composables and defaults](#composables-and-defaults)                                                                                |
| 685-711   | &nbsp;&nbsp;[Where the SDK's own KDoc is wrong](#where-the-sdks-own-kdoc-is-wrong)                                                   |
| 712-747   | &nbsp;&nbsp;[Every slot, and how many parameters it takes](#every-slot-and-how-many-parameters-it-takes)                             |
| 748-1030  | &nbsp;&nbsp;[Signatures, defaults and slot behaviour](#signatures-defaults-and-slot-behaviour)                                       |
| 1031-1226 | [State types](#state-types)                                                                                                          |
| 1180-1226 | &nbsp;&nbsp;[SyncValidationError](#syncvalidationerror)                                                                              |
| 1227-1390 | [Configuration types](#configuration-types) — every setting's owner                                                                  |
| 1391-1568 | [Common data types](#common-data-types)                                                                                              |
| 1546-1568 | &nbsp;&nbsp;[Two types called `PrimerPaymentMethod`](#two-types-called-primerpaymentmethod)                                          |
| 1569-1597 | [Payment methods and what each needs](#payment-methods-and-what-each-needs)                                                          |
| 1598-1617 | [Error ids](#error-ids)                                                                                                              |
| 1618-1734 | [Theming types](#theming-types)                                                                                                      |
| 1681-1734 | &nbsp;&nbsp;[Colour tokens](#colour-tokens)                                                                                          |
| 1735-1765 | [Material 3 colour mapping](#material-3-colour-mapping)                                                                              |
| 1766-1866 | [Accessibility](#accessibility)                                                                                                      |
| 1778-1802 | &nbsp;&nbsp;[What the default composables announce](#what-the-default-composables-announce)                                          |
| 1803-1846 | &nbsp;&nbsp;[What the SDK does not do](#what-the-sdk-does-not-do)                                                                    |
| 1847-1866 | &nbsp;&nbsp;[What each override costs](#what-each-override-costs)                                                                    |
| 1867-1884 | [Not covered here](#not-covered-here)                                                                                                |

## Import map

The one canonical list, and it is **complete for the code this skill ships**: every import needed
by every snippet in `SKILL.md` and in [`compose-patterns.md`](compose-patterns.md) is below,
Compose, Material 3, lifecycle, AndroidX and Java imports included. Nothing a snippet here uses is
left to be filled in from memory or from an IDE's suggestions — the reader of this skill has
neither.

**What that claim does not cover: your own app's framework.** This is the _snippets'_ import list,
not a ceiling on what your screen may import, and reading it as one has already stopped a writer
mid-task. The clearest case is navigation: `androidx.navigation.NavController` is below because the
skill's navigation pattern _receives_ a controller, and `NavHost`, `composable(...)` and
`rememberNavController()` — all `androidx.navigation.compose.*`, in the `navigation-compose`
coordinate the install snippet already declares — are **absent because the merchant owns the
graph**, not because they are forbidden. The same goes for your DI (Hilt, Koin), your own
`ViewModel`s, your app theme, your `R` (see the note on it below) and anything else outside the
checkout. Import what your app needs. What this list is complete _about_ is the Primer surface and
the platform symbols the snippets here depend on: if a symbol used by a snippet on this page or in
`compose-patterns.md` is missing below, that is a bug to report — everything else is yours.

**Do not assemble an import block out of this list one symbol at a time.** Every worked example in
this skill — here and in [`compose-patterns.md`](compose-patterns.md) — is preceded by its own
contiguous `// imports for this snippet` block containing exactly what that snippet needs. Copy
that block. The list below is the _index_: it is where you look up a symbol you need for code you
are writing yourself, and where you check a package you are unsure of. Reading down 142 entries
picking out ten is how `io.primer.checkout.api.state.rememberPrimerCheckoutController` gets
written — the package borrowed from the `PrimerCheckoutState` line beside it. The real package is
`io.primer.checkout.api.checkout`, it is correct in the list, and the mistake still happened four
times.

**Which one wins.** This map is the authority; the per-snippet blocks are copies of it, not a
second source. If a block and this map disagree about a symbol's package, the map is right and the
block is a bug to fix — report it rather than picking the one you prefer. Nothing is documented
_only_ in a per-snippet block: every line in every block appears verbatim below. One list and
many copies of it is a deliberate exception to keeping a list in one place: a copy next to the code
it serves prevents a class of error that a single distant list has been measured to cause.

**Which blocks have one.** Only the ones you are meant to copy into your app. The blocks on this
page that restate an SDK declaration — `interface PrimerCheckoutController`, `data class
PrimerSettings`, the token classes — carry no import block and are not code to paste: they exist so
you can read a shape, and pasting one redeclares a type the SDK already ships. Every block that
_calls_ the SDK has its imports above it.

```kotlin
// Presentation and controller
import io.primer.checkout.api.checkout.PrimerCheckoutSheet
import io.primer.checkout.api.checkout.PrimerCheckoutSheetDefaults
import io.primer.checkout.api.checkout.PrimerCheckoutHost
import io.primer.checkout.api.checkout.rememberPrimerCheckoutController
import io.primer.checkout.api.state.PrimerCheckoutController
import io.primer.checkout.api.state.PrimerCheckoutState
import io.primer.checkout.api.state.formatAmount           // extension on the controller
import io.primer.android.core.ExperimentalPrimerApi        // opt-in annotation

// Card form
import io.primer.checkout.components.card.PrimerCardForm
import io.primer.checkout.components.card.CardFormDefaults
import io.primer.checkout.components.card.PrimerCardFormController
import io.primer.checkout.components.card.rememberCardFormController

// Payment methods and saved methods
// The list type: five fields, carries `surcharge`. There is a SECOND public
// PrimerPaymentMethod in io.primer.android.domain.action.models -- see the
// do-not-import list, and "Two types called PrimerPaymentMethod" below.
import io.primer.checkout.api.checkout.models.PrimerPaymentMethod
import io.primer.checkout.components.paymentMethods.PrimerPaymentMethods
import io.primer.checkout.components.paymentMethods.PaymentMethodsDefaults
import io.primer.checkout.components.paymentMethods.PrimerPaymentMethodsController
import io.primer.checkout.components.paymentMethods.rememberPaymentMethodsController
import io.primer.checkout.components.paymentMethods.PrimerVaultedPaymentMethods
import io.primer.checkout.components.paymentMethods.VaultedPaymentMethodsDefaults
import io.primer.checkout.components.paymentMethods.PrimerVaultedPaymentMethodsController
import io.primer.checkout.components.paymentMethods.rememberVaultedPaymentMethodsController
import io.primer.android.domain.tokenization.models.PrimerVaultedPaymentMethod

// Settings
import io.primer.android.data.settings.PrimerSettings
import io.primer.android.data.settings.PrimerPaymentHandling
import io.primer.android.data.settings.PrimerPaymentMethodOptions
import io.primer.android.data.settings.PrimerGooglePayOptions
import io.primer.android.data.settings.PrimerGoogleShippingAddressParameters
import io.primer.android.data.settings.GooglePayButtonOptions
import io.primer.android.data.settings.GooglePayButtonStyle
import io.primer.android.data.settings.PrimerKlarnaOptions
import io.primer.android.data.settings.PrimerThreeDsOptions
import io.primer.android.data.settings.PrimerStripeOptions   // MandateData is nested inside it
import io.primer.android.data.settings.PrimerDebugOptions
import io.primer.android.data.settings.DismissalMechanism
import io.primer.android.ui.settings.PrimerUIOptions
import io.primer.android.ui.settings.PrimerCardFormUIOptions
import io.primer.android.core.data.datasource.PrimerApiVersion
import io.primer.android.PrimerSessionIntent

// Outcome payloads, errors, form types
import io.primer.android.domain.PrimerCheckoutData
import io.primer.android.domain.payments.create.model.Payment   // PrimerCheckoutData.payment's type
import io.primer.android.payments.core.additionalInfo.PrimerCheckoutAdditionalInfo
import io.primer.android.data.tokenization.models.PaymentInstrumentData
import io.primer.android.data.tokenization.models.ExternalPayerInfo   // the four per-method
import io.primer.android.data.tokenization.models.SessionData         // extras on a saved
import io.primer.android.data.tokenization.models.SessionInfo         // payment method; needed
import io.primer.android.data.tokenization.models.BinData             // only to name their types
import io.primer.android.domain.action.models.PrimerClientSession
import io.primer.android.domain.error.models.PrimerError
import io.primer.android.payments.core.create.data.model.PaymentStatus
import io.primer.android.completion.PrimerPaymentCreationDecisionHandler
import io.primer.android.components.domain.inputs.models.PrimerInputElementType
import io.primer.android.components.domain.core.models.PrimerPaymentMethodManagerCategory
import io.primer.android.components.domain.core.models.card.PrimerCardNetwork
import io.primer.android.components.domain.core.models.card.PrimerBinData
import io.primer.android.components.domain.core.models.card.PrimerCardBinData
import io.primer.android.components.domain.core.models.card.PrimerBinDataStatus
import io.primer.android.payments.core.tokenization.data.model.ResponseCode
import io.primer.android.configuration.data.model.CardNetwork      // CardNetwork.Type lives here
import io.primer.android.configuration.data.model.CountryCode
import io.primer.android.clientSessionActions.domain.models.PrimerCountry
import io.primer.android.ui.core.model.SyncValidationError
import io.primer.android.configuration.domain.model.Surcharge

// Theming
import io.primer.checkout.PrimerTheme
import io.primer.checkout.LocalPrimerTheme
import io.primer.checkout.internal.tokens.LightColorTokens
import io.primer.checkout.internal.tokens.DarkColorTokens
import io.primer.checkout.internal.tokens.SpacingTokens
import io.primer.checkout.internal.tokens.RadiusTokens
import io.primer.checkout.internal.tokens.SizeTokens
import io.primer.checkout.internal.tokens.BorderWidthTokens
import io.primer.checkout.internal.tokens.TypographyTokens
import io.primer.checkout.internal.tokens.TypographyStyle

// ===== NON-PRIMER, AND THE PART THAT ACTUALLY BREAKS BUILDS =====
// Complete for the snippets this skill ships. Three of four failures in one review loop
// were a self-served Compose import, so none of them is omitted as "obvious".

// Compose runtime
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.getValue                      // REQUIRED by `val x by ...`
import androidx.compose.runtime.setValue                      // and by `var x by remember { ... }`
import androidx.compose.runtime.saveable.rememberSaveable     // note the .saveable package
import androidx.lifecycle.compose.collectAsStateWithLifecycle // the collector to use
import androidx.compose.runtime.collectAsState                // ONLY for the WRONG half of the
                                                              // collectAsState pitfall; never ship it
// Only the API-declaration blocks on this page use these three
import androidx.compose.runtime.Immutable
import androidx.compose.runtime.Stable
import androidx.compose.runtime.staticCompositionLocalOf      // LocalPrimerTheme's declaration

// Layout and foundation (arrive transitively through material3)
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.Arrangement        // Arrangement.spacedBy
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.background
import androidx.compose.foundation.verticalScroll
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.isSystemInDarkTheme       // PrimerTheme.colorTokens()'s default

// Compose UI
import androidx.compose.ui.Modifier
import androidx.compose.ui.Alignment
import androidx.compose.ui.graphics.Color                    // colour-token overrides
import androidx.compose.ui.unit.dp                           // 12.dp — every theme snippet needs it
import androidx.compose.ui.unit.Dp                           // only to name the token types
import androidx.compose.ui.text.TextStyle                    // TypographyStyle.toTextStyle()
import androidx.compose.ui.platform.LocalContext             // where you get a Context

// Semantics, for labelling a slot you replaced. See Accessibility below: these five are
// what the SDK's own default composables use, and the only accessibility surface you get,
// because no Primer signature takes a label.
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.stateDescription
import androidx.compose.ui.semantics.liveRegion
import androidx.compose.ui.semantics.LiveRegionMode

// Material 3. Every line here is used by a snippet in this skill.
import androidx.compose.material3.Text
import androidx.compose.material3.Button
import androidx.compose.material3.TextButton
import androidx.compose.material3.Card
import androidx.compose.material3.Checkbox
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.SnackbarResult
import androidx.compose.material3.ExperimentalMaterial3Api    // TopAppBar's opt-in
import androidx.compose.animation.AnimatedContent             // its own coordinate, see the install snippet

// Android, AndroidX, Java, coroutines
import android.content.Context                                // fieldErrorMessage(error, context)
import android.util.Log
import androidx.annotation.StringRes                          // only in the declarations below
import androidx.annotation.FontRes                            // TypographyStyle.font
import androidx.lifecycle.viewmodel.compose.viewModel         // viewModel() in the nav pattern
import androidx.navigation.NavController                      // navigate()/popBackStack() are members
import com.google.android.gms.wallet.button.ButtonConstants   // GooglePayButtonOptions values
import kotlinx.coroutines.launch                              // scope.launch { ... }
import kotlinx.coroutines.flow.StateFlow                      // naming a controller's flow type
import java.text.NumberFormat                                 // formatting amounts outside Ready
import java.util.Currency                                     // ...and its fraction digits
import java.util.Locale                                       // PrimerSettings.locale
import java.util.UUID                                         // idempotency keys

// Your app's own generated R, needed by every `R.string.…` and `R.font.…` below. It is
// not the SDK's R and there is nothing here to copy: substitute your module's package.
//   import com.example.checkout.R

// ===== DO NOT IMPORT =====
// The wrong imports a writer assembling an import block reaches for by name.
// None of them fails in a way that points back at this list, so they are named
// here, where you are writing imports. Where an idiom below avoids the trap
// entirely rather than warning about it, that is deliberate.
//
// androidx.compose.foundation.layout.weight
//   Fails: "Cannot access 'val RowColumnParentData?.weight: Float': it is
//   internal in file". Modifier.weight is a RowScope member handed to you by a
//   Row { } lambda and has no import at all. Same for ColumnScope's weight,
//   Modifier.align, and BoxScope's Modifier.matchParentSize. This is still the
//   most-reached-for wrong import in this list even though no snippet here uses
//   weight: the reader who trips on it is writing their own Row, not copying
//   ours. Inside a Row { }, Modifier.weight(1f) is legal and needs no import --
//   what is never legal is importing it.
//
// androidx.compose.material.Text  (and anything else under androidx.compose.material.*)
//   Fails: unresolved reference. That is Material 2. This skill is Material 3
//   (androidx.compose.material3.*), and material3 brings in only
//   androidx.compose.material:material-ripple, so no Material 2 component or
//   androidx.compose.material.icons.Icons is on the classpath at all.
//
// io.primer.checkout.api.state.rememberPrimerCheckoutController
// io.primer.checkout.api.state.PrimerCheckoutSheet
// io.primer.checkout.api.state.PrimerCheckoutHost
//   Fail: unresolved reference. Right symbols, wrong package. api.state holds
//   PrimerCheckoutController, PrimerCheckoutState and formatAmount and nothing
//   else; the three above are api.checkout. This is the single most-made mistake
//   in this list -- four writers made it from a correct map, each by taking the
//   package off the neighbouring PrimerCheckoutState line. Copy the block above
//   the snippet instead of picking lines out of this file.
//
// io.primer.checkout.api.state.PrimerCheckoutEvent
//   Fails: unresolved reference. There is no event type and no listener; every
//   result arrives as PrimerCheckoutState. The SDK's own CHANGELOG still writes
//   PrimerCheckoutEvent.Success, and no such type ships.
//
// io.primer.android.domain.action.models.PrimerPaymentMethod
//   RESOLVES, is public, and is the wrong type. It is a different class that
//   happens to share the simple name: one field, orderedAllowedCardNetworks,
//   and it is what PrimerClientSession.paymentMethod returns. Import it beside
//   the list type and they collide on the simple name; import it instead of the
//   list type and every field of a method row fails -- surcharge,
//   paymentMethodType, paymentMethodName. The one in controller.methods is
//   io.primer.checkout.api.checkout.models.PrimerPaymentMethod, imported above.
//
// io.primer.checkout.components.card.rememberCardFormState
//   Fails: unresolved reference. No such function -- but the SDK's own KDoc on
//   PrimerCardFormController names `rememberCardFormState(checkout)` four times.
//   The factory is rememberCardFormController. See "Where the SDK's own KDoc is
//   wrong" below: four of its examples do not compile.
//
// io.primer.checkout.components.klarna.PrimerKlarnaController
// io.primer.checkout.components.qrCode.PrimerQrCodeController
// io.primer.checkout.components.dynamicForm.PrimerDynamicFormController
// io.primer.checkout.components.country.PrimerCountrySelectionController
//   Fail: cannot access, it is internal. The packages look public and the
//   declarations are internal; the SDK drives these flows itself.
//
// io.primer.android.ui.settings.PrimerTheme
//   Resolves, and is the wrong type: the legacy drop-in theme, @RestrictTo with
//   an internal constructor, never read by Components. Theming goes through
//   io.primer.checkout.PrimerTheme, imported above. Importing both collides on
//   the simple name.
//
// io.primer.android.data.settings.MandateData
//   Fails: unresolved reference. MandateData is nested in PrimerStripeOptions.
```

Four things to know about those imports.

**The two delegate operators are deliberately duplicated, not centralised.** `getValue` and
`setValue` above are what makes `by` legal Kotlin, and they are restated in
[`SKILL.md`](../SKILL.md#install-and-initialise) and at the top of
[`compose-patterns.md`](compose-patterns.md) as well. That is on purpose: this map is the one home
for _SDK surface_, and a reader who opens a pattern file and never opens this one still has to
write `by`. Do not "de-duplicate" them back to here.

**Some modifiers are scope-provided and cannot be imported at all.** `Modifier.weight` is a member
of `RowScope`, supplied by the receiver of a `Row { }` lambda — `ColumnScope` declares its own, and
`BoxScope` provides `Modifier.align` and `Modifier.matchParentSize` the same way. There is no
import for any of them, and reaching for one is actively harmful: `import
androidx.compose.foundation.layout.weight` resolves to an unrelated `internal` extension and fails
with `Cannot access 'val RowColumnParentData?.weight: Float': it is internal in file`. **No snippet
in this skill uses one.** Side-by-side fields are laid out with `Modifier.fillMaxWidth(0.5f)` on the
first child and `Modifier.fillMaxWidth()` on the second, which is import-free and scope-free, so it
keeps working when you move it into a `Row` of your own: a `Row` measures an unweighted child
against the space its predecessors left, so the second child fills the other half. Both statements
have to stand together: the safe idiom is what a reader who copies gets, and the do-not-import
line above is what a reader who writes their own `Row` needs, because `Modifier.weight` is the
first thing the platform suggests to them. Two other receivers appear in these snippets and supply
members that likewise have no import: `NavOptionsBuilder` inside `navController.navigate(route) { }`
provides `popUpTo`, and its `PopUpToBuilder` provides `inclusive`.

**The design-token classes sit in a package called `io.primer.checkout.internal.tokens`, and are
still the supported way to theme.** The classes themselves are declared public — `open class
LightColorTokens`, `data class RadiusTokens` — so app code can subclass and construct them, and
`PrimerTheme`'s own constructor takes them. The package name is misleading, not a warning. One
consequence to plan around: the SDK's binary-compatibility validator is configured to ignore that
package, so these types carry no binary-compatibility guarantee even though they are public. A
theme that overrides tokens is the piece most likely to need attention when the pin moves — keep it
in one file.

**`MandateData` is nested inside `PrimerStripeOptions`**, so there is no
`io.primer.android.data.settings.MandateData` to import; write
`PrimerStripeOptions.MandateData.TemplateMandateData("Example Store")`.

## Controller creation

```kotlin
@ExperimentalPrimerApi              // opt-in level WARNING
@Composable
fun rememberPrimerCheckoutController(
    clientToken: String,
    settings: PrimerSettings = PrimerSettings(),
): PrimerCheckoutController

@Composable
fun rememberCardFormController(checkout: PrimerCheckoutController): PrimerCardFormController

@Composable
fun rememberPaymentMethodsController(checkout: PrimerCheckoutController): PrimerPaymentMethodsController

@Composable
fun rememberVaultedPaymentMethodsController(
    checkout: PrimerCheckoutController,
): PrimerVaultedPaymentMethodsController
```

`clientToken` is the base64 client token your server minted, passed through unchanged. `settings`
is the whole [`PrimerSettings`](#configuration-types) for the session, handed to the SDK when the
controller is first created; like `clientToken`, passing a different instance on a later
recomposition does not rebuild anything. The three child factories take `checkout` — the controller
from `rememberPrimerCheckoutController` — and nothing else, so every child is bound to that one
session.

`rememberPrimerCheckoutController` returns a `ViewModel` scoped to the composition and keyed by a
`rememberSaveable` id, not by `clientToken`: changing the token argument on a screen that is
already composed does **not** create a new checkout session. Leave and re-enter the screen for
that.

Create the three child controllers inside `PrimerCheckoutHost` content or a `PrimerCheckoutSheet`
slot. That is where the checkout's theme (`LocalPrimerTheme`), its settings and its overlay host
are provided, so components created there pick up your theme and can show the card form, 3DS and
redirect overlays.

## Controller interfaces

```kotlin
@Stable
interface PrimerCheckoutController {
    val state: StateFlow<PrimerCheckoutState>
    fun refresh()   // back to Loading, refetches configuration, methods and saved methods
    fun dismiss()   // closes the sheet or the host overlay; the controller stays usable
}

// Extension, not a member. See the note below: Ready-only.
fun PrimerCheckoutController.formatAmount(amountInCents: Int): String
```

`formatAmount` reads the currency code off whatever state it finds at the moment of the call, and
it looks in exactly one state: `PrimerCheckoutState.Ready`. From every other state — `Loading`,
`BeforeClientSessionUpdated`, `ClientSessionUpdated`, `Success`, `Failure` — the currency resolves
to null and the call throws `IllegalArgumentException`. `ClientSessionUpdated` is the trap: it
carries a `clientSession` of its own and still is not a state `formatAmount` will read.

So a formatted amount is not something to derive at render time in an arbitrary state. Do what the
SDK's own app bar does — format while `Ready` in a `LaunchedEffect`, keep the string, render the
string:

```kotlin
// imports for this snippet
import androidx.compose.material3.Text
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import io.primer.checkout.api.state.PrimerCheckoutState
import io.primer.checkout.api.state.formatAmount

val state by checkout.state.collectAsStateWithLifecycle()
var formattedTotal by remember { mutableStateOf<String?>(null) }

LaunchedEffect(state) {
    val ready = state as? PrimerCheckoutState.Ready ?: return@LaunchedEffect
    runCatching { checkout.formatAmount(ready.clientSession.totalAmount ?: 0) }
        .onSuccess { formattedTotal = it }
}

Text(formattedTotal ?: "")
```

**The `runCatching` is not defensive noise, and every `formatAmount` call in this skill has one.**
`formatAmount` does not read the `Ready` you matched on; it reads the controller's state at the
moment of the call, and a session update between the snapshot this composition rendered and the
line that runs can move that state to `BeforeClientSessionUpdated`. Checking the state first
narrows the window and does not close it. On failure keep the last good string — an amount that is
one update stale beats a crash, and the next `Ready` overwrites it.

The same applies to any surcharge, fee or line-item amount you format yourself. Two different
owners hand you those minor-unit `Int`s, and each is readable in any state — reading the number
never throws, only turning it into text goes through `Ready`:

- `PrimerClientSession` (off `Ready.clientSession` or `ClientSessionUpdated.clientSession`) carries
  `totalAmount`, `fees[].amount` and `lineItems[].amount`.
- `io.primer.checkout.api.checkout.models.PrimerPaymentMethod` — the type in
  `controller.methods`, **not** the one on `clientSession.paymentMethod` — carries `surcharge`.
  [Two types share that name](#two-types-called-primerpaymentmethod).

When that rule meets the instruction to re-render on a
client-session update, read
[both rules, reconciled](#when-both-rules-collide-formatamount-and-clientsessionupdated) below —
the two collide on an ordinary card payment.

```kotlin
@Stable
interface PrimerCardFormController {
    val state: StateFlow<State>

    fun updateCardNumber(cardNumber: String)          // digits only; the field formats them
    fun updateCvv(cvv: String)
    fun updateExpiryDate(expiryDate: String)          // "MMYY" or "MM/YY"
    fun updateCardholderName(cardholderName: String)

    fun updatePostalCode(postalCode: String)
    fun updateCountryCode(countryCode: String)        // ISO 3166-1 alpha-2, e.g. "GB"
    fun updateCity(city: String)
    fun updateState(state: String)
    fun updateAddressLine1(addressLine1: String)
    fun updateAddressLine2(addressLine2: String)
    fun updatePhoneNumber(phoneNumber: String)
    fun updateFirstName(firstName: String)
    fun updateLastName(lastName: String)

    fun submit()
    fun selectCardNetwork(network: PrimerCardNetwork) // co-badged cards
    fun onFieldFocusChange(field: PrimerInputElementType, hasFocus: Boolean)
    fun requestCountrySelection()                     // opens the SDK country picker
    fun setVaultOnSuccess(enabled: Boolean)           // needs customerId on the session
}
```

```kotlin
@Stable
interface PrimerPaymentMethodsController {
    val methods: StateFlow<List<PrimerPaymentMethod>>
    fun select(method: PrimerPaymentMethod)   // card -> card form screen; others -> their own flow
}

@Stable
interface PrimerVaultedPaymentMethodsController {
    val methods: StateFlow<List<PrimerVaultedPaymentMethod>>
    fun select(method: PrimerVaultedPaymentMethod)   // pays; asks for CVV again when required
    fun delete(method: PrimerVaultedPaymentMethod)   // immediate, no confirmation, silent on failure
    fun showAll()                                    // opens the SDK's saved-methods screen
}
```

```kotlin
interface PrimerPaymentCreationDecisionHandler {
    // Attaches X-Idempotency-Key to POST /payments and every /resume for this payment.
    fun continuePaymentCreation(idempotencyKey: String? = null)
    fun abortPaymentCreation(errorMessage: String?)
}
```

### When both rules collide: `formatAmount` and `ClientSessionUpdated`

Two true statements in this skill meet on one ordinary task, and readers have hit the collision
often enough that leaving both standing is itself the defect. `formatAmount` is safe from `Ready`
only. `ClientSessionUpdated` is the state that says the totals, fees and surcharges just changed
and should be re-rendered. Doing the second with the first throws.

Three facts settle it, all read off the release tag `SKILL.md` pins:

- **Nothing moves the state back to `Ready`.** `Ready` is assigned in exactly two places: the
  initial load, and `refresh()`. `ClientSessionUpdated` is therefore not a blip you can wait out —
  you stay in it until a terminal state or a `refresh()`.
- **A card submit causes one.** The Components card form pushes a billing-address client-session
  action before it tokenizes, whenever any billing field is non-blank, so
  `Ready → BeforeClientSessionUpdated → ClientSessionUpdated → Success`/`Failure` is the _normal_
  path through a card payment, not an edge case.
- **The SDK does not re-format either.** Its own app bar caches the string it formatted while
  `Ready` and leaves it alone; there is no SDK code path that formats an amount from an updated
  session.

So: **format from `Ready` and cache the string; when `ClientSessionUpdated` arrives, re-render from
its payload — and if you need the changed amount as _text_, format that one yourself.** Never call
`formatAmount` from `ClientSessionUpdated`, and do not call `refresh()` to get back to `Ready` for
formatting's sake: it refetches configuration, methods and saved methods and resets the flow.

```kotlin
// imports for this snippet
import androidx.compose.material3.Text
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import io.primer.checkout.api.state.PrimerCheckoutState
import io.primer.checkout.api.state.formatAmount

val state by checkout.state.collectAsStateWithLifecycle()
var currencyCode by remember { mutableStateOf<String?>(null) }
var total by remember { mutableStateOf<String?>(null) }

LaunchedEffect(state) {
    when (val s = state) {
        is PrimerCheckoutState.Ready -> {
            currencyCode = s.clientSession.currencyCode
            runCatching { checkout.formatAmount(s.clientSession.totalAmount ?: 0) }
                .onSuccess { total = it }
        }
        // The amount changed and formatAmount would throw from here. Format it yourself
        // with the currency you kept from Ready.
        is PrimerCheckoutState.ClientSessionUpdated -> {
            total = yourFormatMinorUnits(s.clientSession.totalAmount ?: 0, currencyCode) ?: total
        }
        else -> Unit
    }
}

Text(total ?: "")
```

```kotlin
// imports for this snippet
import java.text.NumberFormat
import java.util.Currency
import java.util.Locale

// As close to the SDK's own formatter as app code can get: it also uses
// NumberFormat.getCurrencyInstance(settings.locale), so pass the same Locale you gave
// PrimerSettings or the two strings will disagree. One difference to know about: the SDK takes
// the minor-unit exponent from its own bundled currency-format list, this takes it from
// Currency.defaultFractionDigits, and for a handful of currencies those differ by a digit.
// Currency.getInstance throws IllegalArgumentException on anything that is not an ISO 4217
// code, hence the runCatching.
fun yourFormatMinorUnits(
    amountInMinorUnits: Int,
    currencyCode: String?,
    locale: Locale = Locale.getDefault(),
): String? = currencyCode?.let { code ->
    runCatching {
        val iso = Currency.getInstance(code)
        val digits = iso.defaultFractionDigits.coerceAtLeast(0)
        var divisor = 1.0
        repeat(digits) { divisor *= 10.0 }
        NumberFormat.getCurrencyInstance(locale).apply {
            currency = iso
            maximumFractionDigits = digits
            minimumFractionDigits = digits
        }.format(amountInMinorUnits / divisor)
    }.getOrNull()
}
```

`amountInMinorUnits` is the same minor-unit `Int` the session carries, `currencyCode` is the ISO
4217 code you kept from `Ready` (null before the first `Ready`, hence the nullable return), and
`locale` defaults to the device's — pass the one you gave `PrimerSettings` if you set it.

One rendering hazard follows from the same fact, and it is the SDK's code that throws rather than
yours: `PrimerPaymentMethods` formats a surcharge header by calling `formatAmount` **during
composition** (see [Composables and defaults](#composables-and-defaults)). Keep that composable
inside a `Ready` branch — every host pattern in
[`compose-patterns.md`](compose-patterns.md#sheet-vs-host-patterns) does — or a session update
while a surcharged method is on screen takes the crash out of your control.

### The beforePaymentCreate handler

Identity and lifetime, because the whole gating contract depends on them and neither is visible
from the signature:

- **The handler object is the same instance on every attempt.** The SDK holds one delegating
  handler and re-offers it, so it is not a per-attempt identity you can key work off by value.
- **The slot composable is only in composition while a decision is pending.** The SDK exposes the
  pending handler as a nullable flow and calls your slot only while it is non-null. Between
  attempts your slot leaves composition entirely.
- Which is why the recipe works: a `LaunchedEffect` inside the slot re-launches on each attempt
  because the slot is composed afresh, not because its key changed. For the same reason, a
  `remember`ed value declared _inside_ the slot is new per attempt, and a `rememberSaveable`
  declared _outside_ it survives across attempts. Put the idempotency key inside, and any
  "already accepted" flag outside.
- **Registration is by presence, checked at composition — and unregistering aborts, it does not
  continue.** Passing a non-null slot registers the gate before a shopper can start a payment. Two
  different things happen when it is absent, and conflating them loses a payment:
  - _Never registered_ (you always pass `null`, or never pass the parameter): the SDK sees a
    pending decision with no gate and calls `continuePaymentCreation(null)` itself, so the payment
    proceeds with no idempotency key.
  - _Registered and then removed_ — the slot argument flips from non-null to `null`, or the sheet
    or host leaves composition — the SDK **aborts** payment creation with the message
    `"Payment gate dismissed"`. If a decision was pending, that attempt is over; it does not
    resume. Do not swap the slot out mid-checkout, and do not tear down the sheet while a decision
    is pending.
- Resolve the handler exactly once per attempt. An unresolved handler leaves that payment waiting
  indefinitely — there is no timeout — and a branch of your slot that renders nothing is an
  unresolved handler.

## Composables and defaults

### Where the SDK's own KDoc is wrong

Read this before you copy anything out of the SDK's doc comments, because the composables below
carry `## Custom …` examples in their KDoc and **four of those examples do not compile**. This is
not a warning about KDoc in general: these are the specific lines, at the release `SKILL.md` pins,
that a reader lands on precisely when they set out to do what this skill's recipes do.

| KDoc, on                                                    | What it writes                                                           | Why it fails                                                                                                                                                                                                                                                                                 |
| ----------------------------------------------------------- | ------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `PrimerPaymentMethods`, custom-row example                  | `AsyncImage(model = paymentMethod.iconUrl, …)`                           | `Unresolved reference 'iconUrl'`. The type has [five fields](#common-data-types) and no icon of any kind. The KDoc is describing a field the SDK does not ship                                                                                                                               |
| `PrimerCardForm`, custom-submit-button example              | `checkout.formatAmount(formState.amount)`                                | `Unresolved reference 'amount'`. `PrimerCardFormController.State` has no amount — the card form never sees one. The total lives on `clientSession.totalAmount`, and formatting it is [`Ready`-only](#controller-interfaces), so a "Pay $10.00" button needs the cached string, not this line |
| `PrimerCardForm`, custom-field-layout example               | `CardFormDefaults.CardNumberField()`, `ExpiryField(Modifier.weight(1f))` | No parameterless overloads: every default field takes the controller first ([signatures](#signatures-defaults-and-slot-behaviour)). `Modifier` is never the first argument                                                                                                                   |
| `PrimerCardFormController` and `rememberCardFormController` | `rememberCardFormState(checkout)`, four times                            | `Unresolved reference`. The factory is `rememberCardFormController`                                                                                                                                                                                                                          |

One more KDoc line compiles and is still a trap: `CardFormDefaults`' rearranging example lays two
fields out with `Modifier.weight(1f)` inside a `Row { }`. That is legal Kotlin — `RowScope` provides
it — and there is **no import for it**, so a reader who takes the idiom from the SDK's KDoc and then
resolves imports by name lands on `androidx.compose.foundation.layout.weight` and fails the build
with `Cannot access 'val RowColumnParentData?.weight: Float': it is internal in file`. This skill
lays side-by-side fields out with `Modifier.fillMaxWidth(0.5f)` then `Modifier.fillMaxWidth()`
instead, which needs no scope and cannot be mis-imported; the
[do-not-import list](#import-map) carries the same warning where you assemble imports.

The rule to carry away: the SDK's signatures are authoritative, its prose is usually right, and its
**examples are unverified**. Where this page and a doc comment disagree, this page was read off the
implementation.

### Every slot, and how many parameters it takes

Read this before you override a slot. The lambda arities are not uniform, they are not guessable
from the slot's name, and a slot lambda written with the wrong number of parameters fails with
`expected 2 parameters, got 3` (or Kotlin silently accepting `it` where you meant a method) rather
than with anything that points at the right count. The two neighbours that get confused are
`PrimerPaymentMethods`'s `method` — **two** parameters — and `PrimerVaultedPaymentMethods`'s
`item` — **three**.

| Composable                                  | Slot                                                                                                       | Parameters, in order                                                                | Count                                         |
| ------------------------------------------- | ---------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- | --------------------------------------------- |
| `PrimerCheckoutSheet`                       | `splash`, `loading`, `paymentMethodSelection`, `cardForm`                                                  | —                                                                                   | **0**                                         |
| `PrimerCheckoutSheet`                       | `success`                                                                                                  | `checkoutData: PrimerCheckoutData`                                                  | **1**                                         |
| `PrimerCheckoutSheet`                       | `error`                                                                                                    | `error: PrimerError`                                                                | **1**                                         |
| `PrimerCheckoutSheet`, `PrimerCheckoutHost` | `beforePaymentCreate`                                                                                      | `handler: PrimerPaymentCreationDecisionHandler`                                     | **1**                                         |
| `PrimerCheckoutHost`                        | `content`                                                                                                  | —                                                                                   | **0**                                         |
| `PrimerCardForm`                            | `cardDetails`, `billingAddress`, `submitButton`                                                            | —                                                                                   | **0**                                         |
| `CardFormDefaults.CardDetailsContent`       | `cardNumber`, `expiryDate`, `cvv`, `cardholderName`                                                        | —                                                                                   | **0**                                         |
| `CardFormDefaults.BillingAddressContent`    | `countryCode`, `firstName`, `lastName`, `addressLine1`, `addressLine2`, `city`, `stateField`, `postalCode` | —                                                                                   | **0**                                         |
| `PrimerPaymentMethods`                      | `header`                                                                                                   | —                                                                                   | **0**                                         |
| `PrimerPaymentMethods`                      | `method`                                                                                                   | `paymentMethod: PrimerPaymentMethod`, `onClick: () -> Unit`                         | **2** — there is no `isSelected` and no index |
| `PrimerVaultedPaymentMethods`               | `header`                                                                                                   | `onShowAll: () -> Unit`                                                             | **1**                                         |
| `PrimerVaultedPaymentMethods`               | `item`                                                                                                     | `method: PrimerVaultedPaymentMethod`, `isSelected: Boolean`, `onSelect: () -> Unit` | **3**                                         |
| `PrimerVaultedPaymentMethods`               | `submitButton`                                                                                             | `isLoading: Boolean`, `enabled: Boolean`, `onSubmit: () -> Unit`                    | **3**                                         |
| `PaymentMethodsDefaults.Method`             | (a function, not a slot)                                                                                   | `method: PrimerPaymentMethod`, `onClick: () -> Unit`                                | **2**                                         |

Two of those counts are less useful than they look and the reason is in the call site, not the
signature: `item` is always invoked as `item(method, true) { … }`, and _both_ of `submitButton`'s
booleans latch — the call is `submitButton(isLoading, !isLoading && selectedMethod != null)`. Both
are covered below. Every other slot in the table was read at its call site too, at this release,
and the arguments are live values: `method` is called `method(paymentMethod) { select(paymentMethod) }`
per method, the sheet's `success` and `error` get the real payload, `header` gets a working
`onShowAll`, and the zero-parameter slots have nothing to get wrong. So this is the whole list of
arguments you should ignore rather than use — but it is a list about _this_ release: a slot's
arity is in its signature, and whether an argument is a constant is not.

### Signatures, defaults and slot behaviour

```kotlin
@Composable
fun PrimerCheckoutSheet(
    checkout: PrimerCheckoutController,
    modifier: Modifier = Modifier,
    onDismiss: () -> Unit = {},
    theme: PrimerTheme = PrimerTheme(),
    splash: @Composable () -> Unit = { PrimerCheckoutSheetDefaults.Splash() },
    loading: @Composable () -> Unit = { PrimerCheckoutSheetDefaults.Loading() },
    paymentMethodSelection: @Composable () -> Unit = {
        PrimerCheckoutSheetDefaults.PaymentMethodSelection(checkout)
    },
    cardForm: @Composable () -> Unit = {
        val cardFormController = rememberCardFormController(checkout)
        PrimerCardForm(controller = cardFormController)
    },
    success: @Composable (PrimerCheckoutData) -> Unit = { data ->
        PrimerCheckoutSheetDefaults.Success(checkoutData = data)
    },
    error: @Composable (PrimerError) -> Unit = { err ->
        PrimerCheckoutSheetDefaults.Error(error = err)
    },
    beforePaymentCreate: (@Composable (handler: PrimerPaymentCreationDecisionHandler) -> Unit)? = null,
)

@Composable
fun PrimerCheckoutHost(
    checkout: PrimerCheckoutController,
    modifier: Modifier = Modifier,
    theme: PrimerTheme = PrimerTheme(),
    beforePaymentCreate: (@Composable (handler: PrimerPaymentCreationDecisionHandler) -> Unit)? = null,
    content: @Composable () -> Unit,
)
```

| Parameter                            | Applies to | Notes                                                                                                                                                                                                                                                                              |
| ------------------------------------ | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `checkout`                           | both       | Required, from `rememberPrimerCheckoutController`                                                                                                                                                                                                                                  |
| `modifier`                           | both       | Sheet: the bottom-sheet container. Host: the container around `content`                                                                                                                                                                                                            |
| `onDismiss`                          | sheet      | Swipe down, back press, close button, or auto-dismiss after the result screen                                                                                                                                                                                                      |
| `theme`                              | both       | Provided to children as `LocalPrimerTheme`; this is how you theme Components                                                                                                                                                                                                       |
| `splash`, `loading`                  | sheet      | Shown before load and during processing                                                                                                                                                                                                                                            |
| `paymentMethodSelection`, `cardForm` | sheet      | The two input screens                                                                                                                                                                                                                                                              |
| `success`, `error`                   | sheet      | Result screens. The default success screen auto-dismisses after 3 seconds; the default error screen shows a **Retry** button wired to `checkout.refresh()` and a "try other payment methods" button. Override `error` and you replace both — drive your own retry from `refresh()` |
| `beforePaymentCreate`                | both       | Gate before payment creation; providing it is the opt-in. See [the handler's lifetime](#the-beforepaymentcreate-handler)                                                                                                                                                           |
| `content`                            | host       | Your layout. Overlays for card form, 3DS and redirects render above it                                                                                                                                                                                                             |

**Both cancel the active payment flow when they leave composition**, by two different routes to the
same `cleanupActiveFlow()`: the host holds a `DisposableEffect` on the controller directly, and the
sheet gets one from the modal-sheet shell it shares with the host's overlay, so dismissing the
sheet disposes it too. The controller stays usable either way — in-flight requests are cancelled,
not the session — but neither one is safe to hide mid-payment: whatever was in flight is abandoned,
and if a `beforePaymentCreate` decision was pending it is _aborted_ with
`"Payment gate dismissed"` (see [the handler](#the-beforepaymentcreate-handler)), which ends that
attempt rather than pausing it. So gate the _creation_ of the screen, not the composition of an
active checkout: create the controller unconditionally and show the sheet conditionally
([worked example](compose-patterns.md#correct-controller-survives-toggle)), and once a payment is
in flight leave the sheet or host composed until a terminal state arrives.

```kotlin
object PrimerCheckoutSheetDefaults {
    @Composable fun Splash()
    @Composable fun Loading()
    @Composable fun Success(
        checkoutData: PrimerCheckoutData,
        title: String? = null,      // null uses the SDK's localised copy
        message: String? = null,
    )
    @Composable fun Error(
        error: PrimerError,
        title: String? = null,
        message: String? = null,
    )
    @Composable fun PaymentMethodSelection(
        checkout: PrimerCheckoutController,
        vaultedMethods: @Composable () -> Unit = { VaultedMethods(checkout) },
        paymentMethods: @Composable () -> Unit = { PaymentMethods(checkout) },
    )
    @Composable fun VaultedMethods(checkout: PrimerCheckoutController)  // renders nothing if none
    @Composable fun PaymentMethods(checkout: PrimerCheckoutController)
}
```

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

| Parameter        | Notes                                                                                                                        |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `controller`     | Required, from `rememberCardFormController`, created inside the host or sheet slot                                           |
| `modifier`       | The form's own `Column`, which is already `fillMaxWidth()`                                                                   |
| `cardDetails`    | Number, expiry, CVV, cardholder. Replacing it replaces all four                                                              |
| `billingAddress` | The billing section. Renders nothing when the session asks for no billing fields, so leaving it on the default costs nothing |
| `submitButton`   | Rendered after both sections. Overriding it means driving `controller.submit()` and the enabled state yourself               |

`CardFormDefaults` is an `object`; its functions are members, so call them as
`CardFormDefaults.CardNumberField(controller)`. **The first parameter is not called `controller`.**
It is `cardFormController` on `CardNumberField`, `ExpiryField` and `CardholderField`, and
`cardFormState` on everything else — pass it positionally and the difference never bites, but a
named argument has to match:

```kotlin
object CardFormDefaults {
    // Card fields
    @Composable fun CardNumberField(cardFormController: PrimerCardFormController, modifier: Modifier = Modifier)
    @Composable fun ExpiryField(cardFormController: PrimerCardFormController, modifier: Modifier = Modifier)
    @Composable fun CardholderField(cardFormController: PrimerCardFormController, modifier: Modifier = Modifier)
    @Composable fun CvvField(cardFormState: PrimerCardFormController, modifier: Modifier = Modifier)
    @Composable fun CardNetworkField(cardFormState: PrimerCardFormController)   // no modifier

    // Billing address fields
    @Composable fun CountryCodeField(cardFormState: PrimerCardFormController, modifier: Modifier = Modifier)
    @Composable fun FirstNameField(cardFormState: PrimerCardFormController, modifier: Modifier = Modifier)
    @Composable fun LastNameField(cardFormState: PrimerCardFormController, modifier: Modifier = Modifier)
    @Composable fun AddressLine1Field(cardFormState: PrimerCardFormController, modifier: Modifier = Modifier)
    @Composable fun AddressLine2Field(cardFormState: PrimerCardFormController, modifier: Modifier = Modifier)
    @Composable fun CityField(cardFormState: PrimerCardFormController, modifier: Modifier = Modifier)
    @Composable fun StateField(cardFormState: PrimerCardFormController, modifier: Modifier = Modifier)
    @Composable fun PostalCodeField(cardFormState: PrimerCardFormController, modifier: Modifier = Modifier)

    // Sections
    @Composable fun CardDetailsContent(
        cardFormState: PrimerCardFormController,
        cardNumber: @Composable () -> Unit = { CardNumberField(cardFormState) },
        expiryDate: @Composable () -> Unit = { ExpiryField(cardFormState) },
        cvv: @Composable () -> Unit = { CvvField(cardFormState) },
        cardholderName: @Composable () -> Unit = { CardholderField(cardFormState) },
    )
    @Composable fun BillingAddressContent(
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
    @Composable fun SubmitButton(cardFormState: PrimerCardFormController, modifier: Modifier = Modifier)
}
```

Default layout: card number on its own row, expiry and CVV side by side, cardholder name, then the
billing section and the submit button.

Most field composables return without drawing anything unless their `PrimerInputElementType` is in
`state.cardFields` or `state.billingFields`, so a rearranged layout still shows only what the
session asks for. Two do not, and both matter when you build your own layout:

- **`CardNumberField` never self-gates.** It has no `cardFields` check and always draws. Place it
  unconditionally; there is no session in which the card form omits the number.
- **`CardNetworkField` never self-gates either, and is already on screen.** `CardNumberField`
  passes it as its own trailing icon, so the co-badged network selector appears inside the number
  field. Adding `CardFormDefaults.CardNetworkField(...)` as a separate row draws a _second_
  selector. Call it directly only if you have replaced `CardNumberField` with your own input.

`CvvField` gates on `CVV` in either `cardFields` or `billingFields`. `CardNumberField` formats in
groups of four and caps length by detected network; `CvvField` caps at that network's CVV length;
`SubmitButton` enables on `isFormValid && !isLoading` and is labelled "Pay" — a bare "Pay", with no
amount interpolated.

```kotlin
@Composable
fun PrimerPaymentMethods(
    controller: PrimerPaymentMethodsController,
    modifier: Modifier = Modifier,
    header: @Composable () -> Unit = { PaymentMethodsDefaults.SectionHeader() },
    // TWO parameters. Write it `method = { paymentMethod, onClick -> ... }`. Not three:
    // there is no isSelected here -- that is PrimerVaultedPaymentMethods' `item` slot.
    method: @Composable (paymentMethod: PrimerPaymentMethod, onClick: () -> Unit) -> Unit =
        { m, onClick -> PaymentMethodsDefaults.Method(m, onClick) },
)

object PaymentMethodsDefaults {
    @Composable fun SectionHeader()
    @Composable fun Method(method: PrimerPaymentMethod, onClick: () -> Unit)
    @Composable fun EmptyState(modifier: Modifier = Modifier)   // "No payment methods available"
}
```

| Parameter    | Notes                                                                                                                                                                                                                      |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `controller` | Required, from `rememberPaymentMethodsController`                                                                                                                                                                          |
| `modifier`   | The list container                                                                                                                                                                                                         |
| `header`     | Section header. Skipped entirely when the list is empty                                                                                                                                                                    |
| `method`     | Your row. **Two** lambda parameters — `(paymentMethod: PrimerPaymentMethod, onClick: () -> Unit)` — and no third: no `isSelected`, no index, no surcharge. Called per method, but only for surcharge-free lists, see below |

Behaviour worth knowing before you override a slot: with no methods, only `EmptyState()` renders
("No payment methods available") and `header` is skipped. The list groups methods by surcharge
value, and when **any** method carries a non-zero surcharge it renders as SDK-drawn surcharge group
cards with the `method` slot **not called at all**; your custom row only applies to lists where
every method's surcharge is absent or zero. There is no slot for the surcharge card, so a custom
row cannot render a surcharge — the SDK formats those itself.

Two consequences of _how_ it formats them. A `Surcharge.CardNetworksSurcharge` is collapsed to a
single "surcharge may apply" line rather than an amount, so per-network figures are yours to render
or not at all. And a non-zero `Surcharge.PaymentMethodSurcharge` header calls the same
[`Ready`-only `formatAmount`](#controller-interfaces) **from composition**, so composing
`PrimerPaymentMethods` outside `Ready` with such a method in the list throws
`IllegalArgumentException` from inside the SDK, where you cannot catch it. Render the list inside a
`Ready` branch. (A `CardNetworksSurcharge` does not format: it groups under an internal
"unknown" value and takes the "surcharge may apply" branch. Only a real
`PaymentMethodSurcharge` amount reaches `formatAmount`.)

**The default sheet walks into that itself, and there is nothing in your code to fix.** The sheet's
screens are chosen by its own nav graph rather than by the state, so its method-selection screen
can be composed while the state is not `Ready` — and its default `error` screen offers a "try other
payment methods" button that navigates straight back to it. On a client session where any method
carries a non-zero `PaymentMethodSurcharge`, a failed payment followed by that button composes
`PrimerPaymentMethods` from `Failure` and the surcharge header throws inside the SDK. Nothing in the
public API turns that button off on its own; the mitigation is to override the sheet's
[`error` slot](#signatures-defaults-and-slot-behaviour) — which replaces both of its buttons — and
offer `checkout.refresh()`, the one call that goes back through `Loading` to `Ready`, instead of a
route back to the list ([worked example](compose-patterns.md#replacing-the-sheets-error-screen)).
Worth knowing before you ship surcharges: the crash lands in your app's crash reporter, not
Primer's.

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
    ) -> Unit = { isLoading, enabled, onSubmit -> /* SDK-internal styled button */ },
)

object VaultedPaymentMethodsDefaults {
    @Composable fun SectionHeader(onShowAll: () -> Unit)
    @Composable fun Method(method: PrimerVaultedPaymentMethod, isSelected: Boolean, onSelect: () -> Unit)
}
```

| Parameter      | Notes                                                                                                                                                                                                                                                                                                                |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `controller`   | Required, from `rememberVaultedPaymentMethodsController`                                                                                                                                                                                                                                                             |
| `modifier`     | The outer `Column`; the inner card is styled from the theme's radius and grey tokens                                                                                                                                                                                                                                 |
| `header`       | Handed an `onShowAll` lambda that calls `controller.showAll()`. Call it or the SDK's saved-methods screen becomes unreachable                                                                                                                                                                                        |
| `item`         | **Three** lambda parameters — `(method: PrimerVaultedPaymentMethod, isSelected: Boolean, onSelect: () -> Unit)`. Called once, for the selected method, always with `isSelected = true`; its `onSelect` re-selects that same method, so it is not a list-selection callback                                           |
| `submitButton` | **Three** lambda parameters — `(isLoading: Boolean, enabled: Boolean, onSubmit: () -> Unit)`. `onSubmit()` pays with the selected method. **Both booleans carry the latch below**: the call site is `submitButton(isLoading, !isLoading && selectedMethod != null)`, so `enabled` is not just "a method is selected" |

The whole composable renders nothing while `methods` is empty, and it shows **one** row — the
selected saved method — not the list; `showAll()` from the header opens the SDK's saved-methods
screen. The selection defaults to the first method and resets to the first whenever the `methods`
list changes. The default `submitButton` is an internal composable: there is no
`VaultedPaymentMethodsDefaults.SubmitButton`, so a slot override has to draw its own button and
call `onSubmit()`.

One-way latch to know about: the `isLoading` passed to `submitButton` flips to `true` when
`onSubmit()` runs and is never set back. A failed vaulted payment therefore leaves the pay button
loading and disabled for as long as this composable stays in composition — leaving and re-entering
the screen resets it. If you need a retryable button, override `submitButton` and drive it from
your own state — **discarding both** of the booleans the slot hands you, because `enabled` is
computed as `!isLoading && selectedMethod != null` and so latches too. Discarding `enabled` costs
nothing: the composable returns early when `methods` is empty and the selection defaults to the
first method, so `selectedMethod` is never null while your slot is composed
([worked example](compose-patterns.md#retryable-pay-button-for-saved-methods)). The third argument
is the one you keep: the lambda behind `onSubmit` re-selects the current method with no `isLoading`
guard of its own, so calling it again after a decline does start a second attempt — the latch is in
the two booleans, not in the action.

## State types

```kotlin
@Immutable
sealed interface PrimerCheckoutState {
    data object Loading : PrimerCheckoutState
    data class Ready(val clientSession: PrimerClientSession) : PrimerCheckoutState
    data object BeforeClientSessionUpdated : PrimerCheckoutState
    data class ClientSessionUpdated(val clientSession: PrimerClientSession) : PrimerCheckoutState
    data class Success(val checkoutData: PrimerCheckoutData) : PrimerCheckoutState
    data class Failure(val error: PrimerError) : PrimerCheckoutState
}
```

The members, their payloads and the transitions between them — the canonical list:

| State                        | Carries         | Meaning                                                                                                                                                                                                                                                                                           |
| ---------------------------- | --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Loading`                    | —               | Initial value, and the state `refresh()` returns to                                                                                                                                                                                                                                               |
| `Ready`                      | `clientSession` | Configuration, methods and saved methods loaded. The only state `formatAmount` reads                                                                                                                                                                                                              |
| `BeforeClientSessionUpdated` | —               | An update is starting — most often the billing-address action the card form pushes when you submit it                                                                                                                                                                                             |
| `ClientSessionUpdated`       | `clientSession` | Update finished. Re-render totals, fees and surcharges from **this payload**, formatting the changed amounts yourself: `formatAmount` throws here, and the state does not go back to `Ready` on its own. [Both rules, reconciled](#when-both-rules-collide-formatamount-and-clientsessionupdated) |
| `Success`                    | `checkoutData`  | Terminal under `AUTO` handling: the payment was created                                                                                                                                                                                                                                           |
| `Failure`                    | `error`         | Terminal: the attempt failed                                                                                                                                                                                                                                                                      |

What moves the machine:

- `Loading` is entered once at construction, and re-entered **only** by `refresh()` — which reuses
  the same client token, so it cannot recover from an expired one.
- `Loading` → `Ready` on successful configuration load; `Loading` → `Failure` if it fails.
- `BeforeClientSessionUpdated` → `ClientSessionUpdated` around a session update. Neither is
  terminal, and neither leads back to `Ready`: `Ready` is set only by the initial load and by
  `refresh()`, so after an update you sit in `ClientSessionUpdated` until a terminal state or a
  `refresh()`. Submitting the card form is enough to cause one — it pushes a billing-address
  action first whenever any billing field is filled — so most card payments pass through
  `ClientSessionUpdated` on the way to `Success`. Anything that needs `Ready` (`formatAmount`, and
  `PrimerPaymentMethods` when a method carries a surcharge) has to account for that:
  [how](#when-both-rules-collide-formatamount-and-clientsessionupdated).
- `Success` and `Failure` are terminal and **re-enterable**: both stick on the flow until a new
  attempt starts, and a retry runs `Loading` → `Ready` → terminal again. A handler keyed on the
  state therefore fires once per attempt rather than once per session.
- Nothing transitions out of a terminal state by itself. The default error screen's Retry button
  calls `refresh()`; from your own UI, so must you.

Because the terminal states stick, act on them from a `LaunchedEffect` keyed on the state and never
from composition — a `Success` that sticks would otherwise re-fire its effect on every
recomposition. End every `when` over the state with `else`: there are six members.

```kotlin
data class PrimerCheckoutData(
    val payment: Payment,
    val additionalInfo: PrimerCheckoutAdditionalInfo? = null,   // marker interface, method-specific
)

data class Payment(                     // io.primer.android.domain.payments.create.model
    val id: String,
    val orderId: String,
    val status: PaymentStatus? = null,
)

enum class PaymentStatus { PENDING, SUCCESS, FAILED }
```

`Payment` does not live beside `PrimerCheckoutData`; its package is
`io.primer.android.domain.payments.create.model`. Reading `checkoutData.payment.id` needs no
import, but naming the type in your own signature does.

```kotlin
data class PrimerClientSession(
    val customerId: String?,
    val orderId: String?,
    val currencyCode: String?,          // ISO 4217, e.g. "USD"
    val totalAmount: Int?,              // minor units: 1000 == $10.00
    val lineItems: List<PrimerLineItem>?,
    val orderDetails: PrimerOrder?,
    val customer: PrimerCustomer?,
    val paymentMethod: PrimerPaymentMethod?,   // NOT the list type: see note below
    val fees: List<PrimerFee>?,
)

data class PrimerCustomer(
    val emailAddress: String?, val mobileNumber: String?,
    val firstName: String?, val lastName: String?,
    val billingAddress: PrimerAddress?, val shippingAddress: PrimerAddress?,
)
data class PrimerOrder(val countryCode: CountryCode?, val shipping: PrimerShipping?)
data class PrimerShipping(
    val amount: Int?, val methodId: String?, val methodName: String?, val methodDescription: String?,
)
data class PrimerLineItem(
    val itemId: String?, val itemDescription: String?, val amount: Int?,
    val discountAmount: Int?, val quantity: Int?, val taxCode: String?, val taxAmount: Int?,
)
data class PrimerAddress(
    val firstName: String? = null, val lastName: String? = null,
    val addressLine1: String? = null, val addressLine2: String? = null,
    val postalCode: String? = null, val city: String? = null, val state: String? = null,
    val countryCode: CountryCode? = null,
) {
    val country: String?   // countryCode?.name, for when you want the string
        get() = countryCode?.name
}
data class PrimerFee(val type: String?, val amount: Int)   // minor units
```

**`clientSession.paymentMethod` is not the type in the methods list.** It is a second public class
that shares the simple name, and it carries one field —
`orderedAllowedCardNetworks: List<CardNetwork.Type>` — so a `surcharge`, a `paymentMethodType` or a
`paymentMethodName` read off it does not compile.
[Which type each API hands back](#two-types-called-primerpaymentmethod).

```kotlin
// Nested in PrimerCardFormController
@Immutable
data class State(
    val cardFields: List<PrimerInputElementType> = emptyList(),
    val billingFields: List<PrimerInputElementType> = emptyList(),
    val fieldErrors: List<SyncValidationError>? = emptyList(),
    val data: Map<PrimerInputElementType, String> = emptyMap(),
    val isLoading: Boolean = false,
    val isFormEnabled: Boolean = true,
    val selectedCountry: PrimerCountry? = null,
    val networkSelection: NetworkSelection = NetworkSelection(),   // never null
    val binData: PrimerBinData? = null,
    val fieldFocusStates: Map<PrimerInputElementType, FieldState> = emptyMap(),
    val isFormValid: Boolean = false,
    val vaultOnSuccess: Boolean = false,
)

@Immutable
data class NetworkSelection(
    val selectedNetwork: PrimerCardNetwork? = null,
    val availableNetworks: List<PrimerCardNetwork> = emptyList(),   // >1 means co-badged
    val isNetworkSelectable: Boolean = true,
    val isUserSelected: Boolean = false,
)

@Immutable
data class FieldState(
    val hasFocus: Boolean = false,
    val hasBeenFocused: Boolean = false,
    val shouldShowError: Boolean = false,
)
```

`isFormValid` tracks every keystroke — use it for button state. `fieldErrors` is populated on blur —
use it for messages. Reference the nested types as `PrimerCardFormController.State`,
`PrimerCardFormController.NetworkSelection` and `PrimerCardFormController.FieldState`.

### SyncValidationError

```kotlin
data class SyncValidationError(
    val inputElementType: PrimerInputElementType,   // which field
    val errorId: String,                            // programmatic; never show it to a shopper
    val fieldId: Int,                               // a string-resource id in theory; always 0 here
    @StringRes val errorResId: Int? = null,         // the message, and the only field to read
    @StringRes val errorFormatId: Int? = null,      // template id; always null here
)
```

The type hands out resource ids, not text. Which ones, at this release, is narrower than the
declaration suggests, and it decides the whole recipe: every error on the Components card form is
built by one `internal` mapper that sets **`errorResId` only**, leaving `errorFormatId` null and
`fieldId` at `0`. So `errorResId` is the message — an SDK string resource, resolvable from your app
like any other — and `fieldId` is not a resource id at all. `context.getString(0)` throws
`Resources.NotFoundException`; the SDK's own resolver wraps that call in a `try`/`catch` for
exactly this reason. Do not resolve `fieldId`, and do not show `errorId`.

```kotlin
// imports for this snippet
import android.content.Context
import com.example.checkout.R   // YOUR app's generated R: substitute your module's package
import io.primer.android.ui.core.model.SyncValidationError

// A plain function, not a @Composable, so the same one serves a Text() in a slot and a
// ViewModel formatting errors for a snackbar. The same function appears in
// compose-patterns.md, deliberately. Keep them identical.
fun fieldErrorMessage(error: SyncValidationError, context: Context): String =
    error.errorResId?.let { context.getString(it) }
        ?: context.getString(R.string.your_field_invalid)
```

Two things about that shape are load-bearing, and both exist because the reader will restructure
it. It is `?.let { }` rather than `if (error.errorResId != null) context.getString(error.errorResId)`
because `SyncValidationError` is declared in the SDK module and Kotlin does not smart-cast a
property across a module boundary — the `if` form does not compile, and no amount of copying to
local `val`s survives someone rewriting the branch. And it takes a `Context` instead of reading
`LocalContext.current` internally, so it is callable from anywhere; a `@Composable` version forces
whoever needs it outside composition to write their own, which is where the non-compiling form
comes back.

From composition: `val context = LocalContext.current`, then
`state.fieldErrors?.forEach { Text(fieldErrorMessage(it, context)) }`. From a `ViewModel` or a
mapper, pass any `Context` you already hold.

## Configuration types

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

enum class PrimerPaymentHandling { AUTO, MANUAL }
```

**Seven parameters, and every other setting on this page belongs to one of them.** Configuration
nesting is invisible one line at a time, so this is where to check ownership before you copy a
field out of a declaration block below. `PrimerSettings` accepts _only_ these seven names; the
declaration blocks below this table are the complete field lists, and this is the routing table:

| Where the field lives        | Reached as                              | Fields it owns                                                                                                                |
| ---------------------------- | --------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `PrimerSettings`             | `PrimerSettings(...)`                   | `paymentHandling`, `locale`, `paymentMethodOptions`, `uiOptions`, `debugOptions`, `clientSessionCachingEnabled`, `apiVersion` |
| `PrimerPaymentMethodOptions` | `paymentMethodOptions = …`              | `redirectScheme`, `googlePayOptions`, `klarnaOptions`, `threeDsOptions`, `stripeOptions`                                      |
| `PrimerGooglePayOptions`     | `paymentMethodOptions.googlePayOptions` | `merchantName`, `buttonStyle`, `buttonOptions`, `captureBillingAddress`, …                                                    |
| `PrimerKlarnaOptions`        | `paymentMethodOptions.klarnaOptions`    | `returnIntentUrl`, `recurringPaymentDescription`                                                                              |
| `PrimerThreeDsOptions`       | `paymentMethodOptions.threeDsOptions`   | `threeDsAppRequestorUrl`                                                                                                      |
| `PrimerStripeOptions`        | `paymentMethodOptions.stripeOptions`    | `publishableKey`, `mandateData`                                                                                               |
| `PrimerUIOptions`            | `uiOptions = …`                         | `dismissalMechanism`, `cardFormUIOptions`, and the drop-in-only fields                                                        |
| `PrimerDebugOptions`         | `debugOptions = …`                      | `is3DSSanityCheckEnabled`                                                                                                     |

**One line up from its own declaration block, a nested field stops compiling — and the error
misleads.** `threeDsOptions` is the one that has actually been mis-copied: passed straight to
`PrimerSettings(threeDsOptions = PrimerThreeDsOptions(...))` it fails with
`No parameter with name 'threeDsOptions' found` _and_ a bewildering
`No value passed for parameter 'parcel'`, because `PrimerSettings` also declares a
`constructor(parcel: Parcel)` for `Parcelable` and the compiler falls through to it once the named
argument fails. The same pair of errors is what you get for any of `returnIntentUrl`,
`merchantName`, `publishableKey`, `dismissalMechanism`, `is3DSSanityCheckEnabled` or
`redirectScheme` at the top level. Write the whole path — the
[settings snippet](compose-patterns.md#pitfall-setting-redirectscheme-and-expecting-it-to-do-something)
shows two levels of nesting in the shape you copy.

**Leave `paymentHandling` on its `AUTO` default.** `AUTO` lets the SDK create the payment and emit
`Success`/`Failure`, which is the contract everything else in this skill assumes. `MANUAL` is a
drop-in and headless mode, and Components does not complete it:

- Components wires exactly seven headless callbacks into `PrimerCheckoutState` — available methods,
  before/after client-session update, additional info, before-payment-create, completed, failed.
  There is **no tokenization callback**, so under `MANUAL` there is nothing to hand your backend the
  payment method token, and no resume path for the client token it might return.
- Backend-driven methods — every browser redirect, so PayPal, iDEAL, Bancontact and the rest — are
  constructed through a factory that returns a failure outright when `paymentHandling == MANUAL`
  (`"<type> is not supported in MANUAL mode."`).

Same defect class as `redirectScheme` below: the setting is public, typed and correctly defaulted,
and no Components code path completes it. If you need `MANUAL`, you need the headless SDK.

`PrimerApiVersion` has one member, `V2_4`, plus `PrimerApiVersion.LATEST` on its companion —
`LATEST` is an alias, so naming it keeps the setting on whatever the SDK ships.

The two remaining settings do have Components readers, so neither is inert:

- `clientSessionCachingEnabled` is passed straight through as the `cleanClientSessionCache`
  argument when the checkout tears down. On the `false` default the cached client session survives
  teardown; set it `true` and the cache is cleared when the controller is disposed. Note the
  inversion — the flag named "caching enabled" is the flag that _clears_ the cache on cleanup.
- `debugOptions.is3DSSanityCheckEnabled` defaults to `true`, and on that default the 3DS provider
  refuses to initialise whenever the Netcetera SDK reports device warnings — which it does on
  emulators and rooted devices. The failure arrives as a `Failure` state, not as a dialog. Set it
  `false` in debug builds to test 3DS on an emulator; the SDK's own `recoverySuggestion` on that
  error tells you the same thing.

```kotlin
data class PrimerPaymentMethodOptions(
    var redirectScheme: String? = null,     // not read by the SDK at this version -- see below
    var googlePayOptions: PrimerGooglePayOptions = PrimerGooglePayOptions(),
    var klarnaOptions: PrimerKlarnaOptions = PrimerKlarnaOptions(),
    var threeDsOptions: PrimerThreeDsOptions = PrimerThreeDsOptions(),
    var stripeOptions: PrimerStripeOptions = PrimerStripeOptions(),
)

data class PrimerGooglePayOptions(
    var merchantName: String? = null,               // shown in the Google Pay sheet
    @Deprecated var allowedCardNetworks: List<String> =
        listOf("AMEX", "DISCOVER", "JCB", "MASTERCARD", "VISA"),
    var allowCreditCards: Boolean = true,
    var allowPrepaidCards: Boolean = true,
    var buttonStyle: GooglePayButtonStyle = GooglePayButtonStyle.BLACK,
    var captureBillingAddress: Boolean = false,
    val existingPaymentMethodRequired: Boolean = false,
    val shippingAddressParameters: PrimerGoogleShippingAddressParameters? = null,
    val requireShippingMethod: Boolean = false,
    val emailAddressRequired: Boolean = false,
    val buttonOptions: GooglePayButtonOptions = GooglePayButtonOptions(),
)

enum class GooglePayButtonStyle { WHITE, BLACK }

// buttonTheme/buttonType are Ints from Google Play Services' ButtonConstants.
// Both are defaulted, so GooglePayButtonOptions() is valid.
data class GooglePayButtonOptions(
    val buttonTheme: Int = ButtonConstants.ButtonTheme.DARK,
    val buttonType: Int = ButtonConstants.ButtonType.PAY,
)

data class PrimerGoogleShippingAddressParameters(val phoneNumberRequired: Boolean = false)

data class PrimerKlarnaOptions(
    var recurringPaymentDescription: String? = null,
    var returnIntentUrl: String? = null,   // REQUIRED for Klarna; a deep link back into your app
)

// 3DS out-of-band return. Must be an https URL matching Android's WEB_URL pattern; the SDK
// appends a transID query parameter. Any other value is silently ignored.
data class PrimerThreeDsOptions(val threeDsAppRequestorUrl: String? = null)

data class PrimerStripeOptions(
    val mandateData: MandateData? = null,
    val publishableKey: String? = null,
) {
    sealed interface MandateData {
        data class TemplateMandateData(val merchantName: String) : MandateData
        data class FullMandateStringData(val value: String) : MandateData
        data class FullMandateData(@StringRes val value: Int) : MandateData
    }
}

data class PrimerDebugOptions(val is3DSSanityCheckEnabled: Boolean = true)
```

Redirect returns are handled by the SDK: `web-redirect-shared`'s manifest registers an activity for
`primer://requestor.${applicationId}/async` and the SDK builds that URL from your `applicationId`,
so browser and Custom Tab redirects come back with no manifest work from you. `redirectScheme` has
no reader in the SDK at this version. Klarna is the exception: `returnIntentUrl` is passed to
Klarna's own SDK and is `requireNotNull`-checked, so choosing a Klarna category without it throws
`IllegalArgumentException`.

```kotlin
data class PrimerUIOptions(
    var isInitScreenEnabled: Boolean = true,       // drop-in only, ignored by Components
    var isSuccessScreenEnabled: Boolean = true,    // drop-in only, ignored by Components
    var isErrorScreenEnabled: Boolean = true,      // drop-in only, ignored by Components
    var dismissalMechanism: List<DismissalMechanism> = listOf(DismissalMechanism.GESTURES),
    var theme: PrimerTheme = PrimerTheme.build(),  // the LEGACY io.primer.android.ui.settings type
    var cardFormUIOptions: PrimerCardFormUIOptions = PrimerCardFormUIOptions(),
)

enum class DismissalMechanism { GESTURES, CLOSE_BUTTON }

data class PrimerCardFormUIOptions(var payButtonAddNewCard: Boolean = false)
```

Components reads only `dismissalMechanism` (`GESTURES` allows swipe/outside-tap, `CLOSE_BUTTON`
shows a close button in the header) and `cardFormUIOptions`. The three screen toggles are honoured
by the drop-in SDK only. `PrimerUIOptions.theme` is
`io.primer.android.ui.settings.PrimerTheme`, an unrelated legacy type with an `internal`
constructor — it is not `io.primer.checkout.PrimerTheme`, you cannot construct it, and Components
never reads it. Theme through the `theme` parameter of the sheet or host.

`payButtonAddNewCard = true` changes the SDK card-form screen's **title** from "Pay with card" to
"Add card". It does not change the submit button's label.

## Common data types

```kotlin
abstract class PrimerError {
    abstract val errorId: String              // stable id — switch on this
    abstract val description: String          // developer-facing, not localised for shoppers
    abstract val diagnosticsId: String        // quote to Primer support
    abstract val errorCode: String?           // issuer/processor reason, e.g. "card_declined"
    abstract val recoverySuggestion: String?
    abstract val exposedError: PrimerError    // the error safe to surface for a wrapped failure
}
```

```kotlin
data class PrimerPaymentMethod(              // io.primer.checkout.api.checkout.models
    val paymentMethodType: String,           // wire code: "PAYMENT_CARD", "PAYPAL", "GOOGLE_PAY", …
    val paymentMethodName: String?,          // the display name. NULLABLE -- always ?: fall back
    val supportedPrimerSessionIntents: List<PrimerSessionIntent>,
    val paymentMethodManagerCategories: List<PrimerPaymentMethodManagerCategory>,
    val surcharge: Surcharge? = null,
)
// Five fields, and that is the whole type. THERE IS NO `displayName` AND NO `iconUrl`.
// The one line to write, every time you put a method's name on screen, is:
//     method.paymentMethodName ?: method.paymentMethodType
```

**`paymentMethodName`, never `displayName`.** The display field on this type is
`paymentMethodName` and it is `String?`. `PrimerPaymentMethod.displayName` does not exist and fails
with `Unresolved reference 'displayName'` — the name is easy to reach for because `displayName`
_is_ a real field on three neighbouring types in this file (`PrimerCardNetwork.displayName`,
`PrimerCardBinData.displayName`, and every `CardNetwork.Type` member), none of which is the type in
`controller.methods`. Because it is nullable, the only correct call site is
`method.paymentMethodName ?: method.paymentMethodType`, which is how every snippet in this skill
writes it; `method.paymentMethodName` alone renders "null" for any method the client session did
not name.

**And there is no icon.** `PrimerPaymentMethod` carries no icon, URL or drawable of any kind, and
`PaymentMethodsDefaults` exposes no icon-only composable. The SDK's own KDoc on
`PrimerPaymentMethods` shows a custom-row example calling `AsyncImage(model = paymentMethod.iconUrl,
…)`, which does not compile against the type it documents — this is the KDoc being wrong, not a
field you have missed. Either supply your own drawable per `paymentMethodType`, or call
`PaymentMethodsDefaults.Method(method, onClick)` and take the SDK-drawn row including its icon.

**And a second public class shares the simple name.** This one — in
`io.primer.checkout.api.checkout.models` — is what `controller.methods` gives you. The other,
`io.primer.android.domain.action.models.PrimerPaymentMethod`, is what
`clientSession.paymentMethod` returns, and it has none of the five fields above:
[which API hands back which](#two-types-called-primerpaymentmethod).

```kotlin
enum class PrimerSessionIntent { CHECKOUT, VAULT }

enum class PrimerPaymentMethodManagerCategory {
    NATIVE_UI, RAW_DATA, NOL_PAY, KLARNA, STRIPE_ACH, COMPONENT_WITH_REDIRECT,
}

sealed interface Surcharge {
    data class PaymentMethodSurcharge(val amount: Int) : Surcharge            // minor units
    data class CardNetworksSurcharge(val surcharges: Map<String, Int>) : Surcharge  // by network name
}
```

```kotlin
data class PrimerVaultedPaymentMethod(
    val id: String,
    val analyticsId: String,
    val paymentInstrumentType: String,
    val paymentMethodType: String,
    val paymentInstrumentData: PaymentInstrumentData,        // not nullable
    val threeDSecureAuthentication: AuthenticationDetails? = null,
) {
    data class AuthenticationDetails(
        val responseCode: ResponseCode,
        val reasonCode: String?,
        val reasonText: String?,
        val protocolVersion: String?,
        val challengeIssued: Boolean?,
    )
}

data class PaymentInstrumentData(
    val network: String? = null,                 // "Visa", "Mastercard", … display casing
    val cardholderName: String? = null,
    val first6Digits: Int? = null,
    val last4Digits: Int? = null,                // an Int: pad to 4 chars before displaying
    val accountNumberLast4Digits: Int? = null,
    val expirationMonth: Int? = null,
    val expirationYear: Int? = null,
    val externalPayerInfo: ExternalPayerInfo? = null,
    val klarnaCustomerToken: String? = null,
    val sessionData: SessionData? = null,
    val paymentMethodType: String? = null,
    val sessionInfo: SessionInfo? = null,
    val binData: BinData? = null,
    val bankName: String? = null,
)
```

`ExternalPayerInfo`, `SessionData`, `SessionInfo` and `BinData` are further payload types
([imports](#import-map)) carrying per-method extras: PayPal payer email, recurring descriptions,
locale and BIN routing data. Reading a field off one needs no import; naming the type in your own
signature does. A saved card only needs `network`, `last4Digits` and the expiry.

```kotlin
data class PrimerBinData(                    // state.binData on the card form controller
    val preferred: PrimerCardBinData?,       // best match for the digits entered so far
    val alternatives: List<PrimerCardBinData>,
    val status: PrimerBinDataStatus,         // COMPLETE only after a successful BIN lookup
    val firstDigits: String?,
)

data class PrimerCardBinData(
    val network: CardNetwork.Type,
    val displayName: String,
    val issuerCountryCode: String,           // ISO 3166-1 alpha-2
    val issuerName: String?,
    val accountFundingType: String,          // wire values, e.g. "DEBIT", "CREDIT"
    val prepaidReloadableIndicator: String,
    val productUsageType: String,
    val productCode: String,
    val productName: String,
    val issuerCurrencyCode: String?,         // ISO 4217
    val regionalRestriction: String,
    val accountNumberType: String,
)

enum class PrimerBinDataStatus { PARTIAL, COMPLETE }
```

Network detection is local until 8 digits are entered, then a remote BIN lookup runs (10s timeout).
`status` is `COMPLETE` only when that lookup returned data; a partial number, a failed lookup or a
timeout all leave `PARTIAL` with `preferred = null`, so treat `PARTIAL` as "not known yet" rather
than as an error.

```kotlin
enum class PrimerInputElementType {
    ALL, CARD_NUMBER, CVV, EXPIRY_DATE, CARDHOLDER_NAME, POSTAL_CODE, COUNTRY_CODE,
    CITY, STATE, ADDRESS_LINE_1, ADDRESS_LINE_2, PHONE_NUMBER, FIRST_NAME, LAST_NAME,
    RETAIL_OUTLET, OTP_CODE,
}

data class PrimerCardNetwork(
    val network: CardNetwork.Type,
    val displayName: String,        // already localised for display, e.g. "American Express"
    val allowed: Boolean,           // false when the session disallows it for this transaction
)

data class PrimerCountry(val name: String, val code: CountryCode)
```

`CardNetwork.Type` is nested in `CardNetwork` and each member carries a `displayName`:
`OTHER`, `VISA`, `MASTERCARD`, `AMEX`, `DINERS_CLUB`, `DISCOVER`, `JCB`, `UNIONPAY`, `MAESTRO`,
`ELO`, `MIR`, `HIPER`, `HIPERCARD`, `CARTES_BANCAIRES`, `DANKORT`, `EFTPOS`. `CountryCode` is an
ISO 3166-1 alpha-2 enum (`CountryCode.US`, `CountryCode.GB`, …).

### Two types called `PrimerPaymentMethod`

The SDK ships **two public classes with that simple name**, in different packages, and which one
you are holding depends on the API that handed it to you. This is the easiest way there is to get
an `Unresolved reference` out of documentation that is correct: read the five-field type above,
navigate to a method through the client session instead of the methods list, and the field you
wanted is not on the object you actually have.

| Type                                                         | What hands it to you                                                                                                                              | Fields                                                                                                                                   |
| ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `io.primer.checkout.api.checkout.models.PrimerPaymentMethod` | `PrimerPaymentMethodsController.methods` (`controller.methods`), the `method` slot of `PrimerPaymentMethods`, and `PaymentMethodsDefaults.Method` | The five above: `paymentMethodType`, `paymentMethodName`, `supportedPrimerSessionIntents`, `paymentMethodManagerCategories`, `surcharge` |
| `io.primer.android.domain.action.models.PrimerPaymentMethod` | `PrimerClientSession.paymentMethod` — i.e. `Ready.clientSession.paymentMethod` and `ClientSessionUpdated.clientSession.paymentMethod`             | **One**: `orderedAllowedCardNetworks: List<CardNetwork.Type>`. No `surcharge`, no `paymentMethodType`, no `paymentMethodName`            |

Two consequences, and they are the whole of it:

- **Surcharges and method identity come from `controller.methods`, never from the client session.**
  `clientSession.paymentMethod` answers exactly one question — which card networks this session
  allows, in the order to offer them. `Unresolved reference 'surcharge'` on a client session means
  you are on the second row and the fix is the methods list, not an import.
- **Never import both into one file.** They collide on the simple name; whichever one Kotlin
  resolves, half your code stops compiling. The [do-not-import list](#import-map) names the one
  that belongs in a method row.

## Payment methods and what each needs

The canonical list — [`SKILL.md`](../SKILL.md#add-payment-methods) links here rather than repeating
it. Which methods appear at all is decided by your Dashboard and the client session; this table is
what each one needs from your app once it does. The coordinate column is not optional: the SDK
compiles against those wrappers and ships none of them, so a method whose wrapper is missing has
its factory fail and is filtered out of `controller.methods`.

Every path in the settings column starts at `PrimerSettings` and is written out in full on purpose:
none of these is a `PrimerSettings` parameter, and copying the last segment on its own is the
mistake [the nesting table](#configuration-types) exists to stop.

| `paymentMethodType`            | Flow the SDK runs                                                              | Settings it needs                                                                                               | Coordinate                               |
| ------------------------------ | ------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| `PAYMENT_CARD`                 | Card form screen, then 3DS if the issuer asks                                  | — (`paymentMethodOptions.threeDsOptions.threeDsAppRequestorUrl` for out-of-band 3DS)                            | `io.primer:3ds-android` for any 3DS      |
| `GOOGLE_PAY`                   | Native Google Pay sheet                                                        | `paymentMethodOptions.googlePayOptions`, its `merchantName` at minimum                                          | — (arrives through `io.primer:checkout`) |
| `KLARNA`                       | Category selection, then Klarna's own view                                     | `paymentMethodOptions.klarnaOptions.returnIntentUrl` (required — it throws without one) and session `lineItems` | `io.primer:klarna-android`               |
| `STRIPE_ACH`                   | Bank-account collection                                                        | `paymentMethodOptions.stripeOptions` (`publishableKey`, `mandateData`)                                          | `io.primer:stripe-android`               |
| `PAYPAL`, iDEAL, Bancontact, … | Browser or Custom Tab redirect, returning to the SDK's own registered activity | —                                                                                                               | —                                        |
| PromptPay, PayNow, …           | QR-code screen                                                                 | —                                                                                                               | —                                        |

`paymentMethodType` is a wire code, and for the processor-routed methods it names the processor:
iDEAL arrives as `ADYEN_IDEAL`, `MOLLIE_IDEAL`, `PAY_NL_IDEAL` or `BUCKAROO_IDEAL`, PromptPay as
`RAPYD_PROMPTPAY` or `OMISE_PROMPTPAY`. Match on a prefix or a set, never on a bare `"IDEAL"`.

Klarna and QR code have no merchant-callable API: their controllers are `internal`, so you cannot
drive or replace those screens. Leave the methods in the list and let `PrimerCheckoutSheet` or
`PrimerPaymentMethods` render them.

## Error ids

`PrimerCheckoutState.Failure.error.errorId` values worth branching on, and what to do about each.
The canonical list — `SKILL.md` links here rather than repeating it.

| `errorId`                        | Error class                               | Meaning                                                                                                                                                  | What to do                                                                                                                    |
| -------------------------------- | ----------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `"payment-cancelled"`            | `PaymentMethodCancelledError`             | The shopper backed out of a method's flow                                                                                                                | Nothing. Not a failure to report                                                                                              |
| `"failed-to-redirect"`           | `PaymentMethodRedirectError`              | Could not open the external app or browser                                                                                                               | Offer another payment method                                                                                                  |
| `"bad-network"`                  | `BadNetworkError`                         | A request failed on a poor connection                                                                                                                    | Offer retry via `refresh()`                                                                                                   |
| `"connectivity-errors"`          | `ConnectivityError`                       | No connectivity at all                                                                                                                                   | Offer retry via `refresh()`                                                                                                   |
| `"failed-to-create-session"`     | `SessionCreateError`                      | The checkout session could not be created                                                                                                                | Mint a new client token and re-enter the screen — `refresh()` reuses the old one                                              |
| `"unauthorized"`                 | `UnauthorizedError`                       | Client token invalid or expired                                                                                                                          | As above: a new token and a new screen                                                                                        |
| `"client-error"`                 | `ClientError`                             | HTTP 4xx                                                                                                                                                 | Not shopper-recoverable. Log `diagnosticsId` and check the client session your server sent                                    |
| `"server-error"`                 | `ServerError` / `HttpError`               | HTTP 5xx                                                                                                                                                 | Retry later                                                                                                                   |
| `"invalid-value"`                | `GeneralError`                            | Bad value in SDK configuration or session                                                                                                                | Fix the settings or session; not retryable as-is                                                                              |
| `"unknown-error"`                | `PrimerUnknownError`                      | Unclassified                                                                                                                                             | Log `diagnosticsId` and quote it to Primer support                                                                            |
| `"missing-sdk-dependency"`       | `ThreeDsError.ThreeDsLibraryMissingError` | 3DS was required and `io.primer:3ds-android` is not on the classpath — the SDK looks for it by class name at runtime                                     | Add the coordinate from the install snippet in [`SKILL.md`](../SKILL.md#install-and-initialise)                               |
| `"misconfigured-payment-method"` | `MisConfiguredPaymentMethodError`         | A method is enabled in the Dashboard but its wrapper artifact is missing (`io.primer:klarna-android`, `io.primer:stripe-android`), so its factory failed | Same: add that method's coordinate. Until you do, the method is filtered out of `controller.methods` rather than shown broken |

## Theming types

```kotlin
data class PrimerTheme(                       // io.primer.checkout.PrimerTheme
    val lightColorTokens: LightColorTokens = LightColorTokens(),
    val darkColorTokens: DarkColorTokens = DarkColorTokens(),
    val borderWidthTokens: BorderWidthTokens = BorderWidthTokens(),
    val radiusTokens: RadiusTokens = RadiusTokens(),
    val sizeTokens: SizeTokens = SizeTokens(),
    val spacingTokens: SpacingTokens = SpacingTokens(),
    val typographyTokens: TypographyTokens = TypographyTokens(),
) {
    // Member function, not an extension. Returns dark or light tokens.
    @Composable fun colorTokens(darkTheme: Boolean = isSystemInDarkTheme()): LightColorTokens
}

val LocalPrimerTheme = staticCompositionLocalOf { PrimerTheme() }
```

```kotlin
data class SpacingTokens(
    val xxsmall: Dp = 2.dp, val xsmall: Dp = 4.dp, val small: Dp = 8.dp,
    val medium: Dp = 12.dp, val large: Dp = 16.dp, val xlarge: Dp = 20.dp, val base: Dp = 4.dp,
)
data class RadiusTokens(
    val xsmall: Dp = 2.dp, val small: Dp = 4.dp, val medium: Dp = 8.dp,
    val large: Dp = 12.dp, val base: Dp = 4.dp,
)
data class SizeTokens(
    val small: Dp = 16.dp, val medium: Dp = 20.dp, val large: Dp = 24.dp,
    val xlarge: Dp = 32.dp, val xxlarge: Dp = 44.dp, val xxxlarge: Dp = 56.dp, val base: Dp = 4.dp,
)
data class BorderWidthTokens(val thin: Dp = 1.dp, val medium: Dp = 2.dp, val thick: Dp = 3.dp)
```

```kotlin
data class TypographyStyle(
    @FontRes val font: Int,        // no default
    val letterSpacing: Float,
    val weight: Int,
    val size: Int,                 // sp
    val lineHeight: Int,           // sp
) {
    fun toTextStyle(): TextStyle
}

data class TypographyTokens(
    // R.font.inter is the SDK module's own R, not yours: there is no import that reaches
    // it from app code. Your overrides name a font on your app's R instead.
    val titleXlarge: TypographyStyle = TypographyStyle(font = R.font.inter, letterSpacing = -0.6f, weight = 550, size = 24, lineHeight = 32),
    val titleLarge: TypographyStyle = TypographyStyle(font = R.font.inter, letterSpacing = -0.2f, weight = 550, size = 16, lineHeight = 20),
    val bodyLarge: TypographyStyle = TypographyStyle(font = R.font.inter, letterSpacing = -0.2f, weight = 400, size = 16, lineHeight = 20),
    val bodyMedium: TypographyStyle = TypographyStyle(font = R.font.inter, letterSpacing = 0f, weight = 400, size = 14, lineHeight = 20),
    val bodySmall: TypographyStyle = TypographyStyle(font = R.font.inter, letterSpacing = 0f, weight = 400, size = 12, lineHeight = 16),
)
```

Each default names the SDK's own bundled Inter resource, which your app cannot reference (it is the
SDK module's `R`). Since `font` has no default, customising a style means passing an id off **your**
generated `R` — `import com.example.checkout.R`, with your module's package — along with the other
four values; styles you do not pass keep Inter. Sizes are `sp` and weights are variable-font weights
(550 is a mid-semibold). [Worked example](compose-patterns.md#custom-typography).

### Colour tokens

`LightColorTokens` is an `open class` with 16 base tokens as `open val`s and 26 semantic tokens as
`open val` getters that resolve through the base ones. `DarkColorTokens : LightColorTokens()`
overrides 15 base values (brand stays the same). Override a base token and every semantic token
follows.

| Base token                            | Light       | Dark        |
| ------------------------------------- | ----------- | ----------- |
| `primerColorBrand`                    | `#2F98FF`   | `#2F98FF`   |
| `primerColorGray000`                  | `#FFFFFF`   | `#171619`   |
| `primerColorGray100`                  | `#F5F5F5`   | `#292929`   |
| `primerColorGray200`                  | `#EEEEEE`   | `#424242`   |
| `primerColorGray300`                  | `#E0E0E0`   | `#575757`   |
| `primerColorGray400`                  | `#BDBDBD`   | `#858585`   |
| `primerColorGray500`                  | `#9E9E9E`   | `#767577`   |
| `primerColorGray600`                  | `#757575`   | `#C7C7C7`   |
| `primerColorGray900`                  | `#212121`   | `#EFEFEF`   |
| `primerColorRed100`                   | `#FFECEC`   | `#321C20`   |
| `primerColorRed500`                   | `#FF7279`   | `#E46D70`   |
| `primerColorRed900`                   | `#B4324B`   | `#F6BFBF`   |
| `primerColorGreen500`                 | `#3EB68F`   | `#27B17D`   |
| `primerColorBlue500`                  | `#399DFF`   | `#3F93E4`   |
| `primerColorBlue900`                  | `#2270F4`   | `#4AAEFF`   |
| `primerColorBorderTransparentDefault` | transparent | transparent |

Semantic tokens and what they resolve to:

| Token                                                                    | Resolves to                           |
| ------------------------------------------------------------------------ | ------------------------------------- |
| `primerColorTextPrimary`                                                 | `primerColorGray900`                  |
| `primerColorTextSecondary`                                               | `primerColorGray600`                  |
| `primerColorTextPlaceholder`                                             | `primerColorGray500`                  |
| `primerColorTextDisabled`                                                | `primerColorGray400`                  |
| `primerColorTextNegative`                                                | `primerColorRed900`                   |
| `primerColorTextLink`                                                    | `primerColorBlue900`                  |
| `primerColorBackground`                                                  | `primerColorGray000`                  |
| `primerColorBorderOutlinedDefault`                                       | `primerColorGray300`                  |
| `primerColorBorderOutlinedHover`                                         | `primerColorGray400`                  |
| `primerColorBorderOutlinedActive`                                        | `primerColorGray500`                  |
| `primerColorBorderOutlinedFocus`                                         | `primerColorFocus`                    |
| `primerColorBorderOutlinedDisabled`                                      | `primerColorGray200`                  |
| `primerColorBorderOutlinedError`                                         | `primerColorRed500`                   |
| `primerColorBorderOutlinedLoading`                                       | `primerColorGray200`                  |
| `primerColorBorderOutlinedSelected`                                      | `primerColorBrand`                    |
| `primerColorBorderTransparentHover` / `Active` / `Disabled` / `Selected` | `primerColorBorderTransparentDefault` |
| `primerColorBorderTransparentFocus`                                      | `primerColorFocus`                    |
| `primerColorIconPrimary`                                                 | `primerColorGray900`                  |
| `primerColorIconDisabled`                                                | `primerColorGray400`                  |
| `primerColorIconNegative`                                                | `primerColorRed500`                   |
| `primerColorIconPositive`                                                | `primerColorGreen500`                 |
| `primerColorFocus`                                                       | `primerColorBrand`                    |
| `primerColorLoader`                                                      | `primerColorBrand`                    |

## Material 3 colour mapping

`PrimerCheckoutSheet` and `PrimerCheckoutHost` both wrap their content in a `MaterialTheme` whose
`ColorScheme` is derived from the active colour tokens, so Material components you place inside
inherit Primer's colours. `onColoredSurface` below means `primerColorGray000` in light mode and
`primerColorGray900` in dark.

| M3 role                                                                    | Primer token                                           |
| -------------------------------------------------------------------------- | ------------------------------------------------------ |
| `primary`                                                                  | `primerColorBrand`                                     |
| `onPrimary`, `onPrimaryContainer`, `onSecondary`, `onTertiary`, `onError`  | `onColoredSurface`                                     |
| `primaryContainer`                                                         | `primerColorBlue900`                                   |
| `inversePrimary`, `tertiary`                                               | `primerColorBlue500`                                   |
| `secondary`                                                                | `primerColorGray600`                                   |
| `secondaryContainer`, `tertiaryContainer`, `surfaceContainerHigh`          | `primerColorGray200`                                   |
| `onSecondaryContainer`, `onTertiaryContainer`, `onBackground`, `onSurface` | `primerColorTextPrimary`                               |
| `background`, `surface`, `surfaceContainerLowest`                          | `primerColorBackground`                                |
| `surfaceVariant`, `surfaceContainer`, `surfaceContainerLow`                | `primerColorGray100`                                   |
| `onSurfaceVariant`                                                         | `primerColorTextSecondary`                             |
| `surfaceTint`                                                              | `primerColorBrand`                                     |
| `inverseSurface`                                                           | `primerColorGray900`                                   |
| `inverseOnSurface`                                                         | `primerColorGray000`                                   |
| `surfaceBright`                                                            | `primerColorGray000` light / `primerColorGray300` dark |
| `surfaceDim`                                                               | `primerColorGray100` light / `primerColorGray000` dark |
| `surfaceContainerHighest`, `outlineVariant`                                | `primerColorGray300`                                   |
| `error`                                                                    | `primerColorRed500`                                    |
| `errorContainer`                                                           | `primerColorRed100`                                    |
| `onErrorContainer`                                                         | `primerColorTextNegative`                              |
| `outline`                                                                  | `primerColorBorderOutlinedDefault`                     |
| `scrim`                                                                    | `Color.Black` at 32% alpha                             |

## Accessibility

What the SDK does for you, what it does not, and what each slot override costs. Read off the
release tag `SKILL.md` pins, the same way as every signature on this page — the point of the
section is that you can answer a TalkBack question from it without guessing.

**There is no accessibility API.** `components/api/components.api` contains zero occurrences of
`accessib`, `semantic` or `contentDescription`: no composable takes a label parameter, no
`PrimerSettings` field affects announcements, no design token carries one. Everything below is
behaviour baked into the default composables, and the only lever you have over it is which
composables you keep.

### What the default composables announce

| Surface                         | Semantics it carries                                                                                                                                                                                                                                                                                                                                                                                                      |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Every default card field        | A `contentDescription` on the field's wrapper column: the field's accessibility label, then its spoken hint where one exists, then `required` or `optional`. `ADDRESS_LINE_2` is the only field the SDK deliberately marks optional; the card number field also announces "optional", which is the bug noted below                                                                                                        |
| A field's validation error      | The error text under the field is a **polite live region**, so it is announced when it appears. The SDK passes `isError = false` to the Material text field on purpose, so Material does not announce it a second time                                                                                                                                                                                                    |
| Two or more errors at once      | `PrimerCardForm` emits a second polite live region reading "_N_ errors found". It sits in `PrimerCardForm` itself, after `submitButton()` — so it survives **every** slot override                                                                                                                                                                                                                                        |
| The billing section             | `contentDescription = "Billing address"` plus `heading()`, so TalkBack's heading navigation lands on it                                                                                                                                                                                                                                                                                                                   |
| The country field               | `role = Role.DropdownList`                                                                                                                                                                                                                                                                                                                                                                                                |
| `CardFormDefaults.SubmitButton` | Label "Submit payment", plus a `stateDescription` that switches between "Double-tap to submit payment", "Button disabled. Complete all required fields to enable payment" and "Processing payment, please wait"                                                                                                                                                                                                           |
| The SDK's loading screen        | Polite live region, "Loading, please wait"                                                                                                                                                                                                                                                                                                                                                                                |
| SDK-drawn payment method rows   | A row label, and only two methods get a named one: "Pay with card" and "Pay with Klarna". Every other row — PayPal, iDEAL, Google Pay, the rest — is labelled "_name_ payment method", the name taken from the SDK's own asset data for that method rather than from the `PrimerPaymentMethod` you see. (The SDK ships "Pay with PayPal" and "Pay with iDEAL" strings and reads neither; they are in the dead list below) |
| SDK-drawn saved method rows     | "Saved payment method: _description_", a `stateDescription` for the selected one, and a state description on delete                                                                                                                                                                                                                                                                                                       |
| Trailing icons                  | The CVV and expiry icons are labelled; brand and decorative artwork is `contentDescription = null`, which is correct                                                                                                                                                                                                                                                                                                      |

The strings come from 79 `accessibility_*` resources in the SDK's `values/strings.xml`, translated
into 56 further locale folders, and resolve through the `locale` you set on
[`PrimerSettings`](#configuration-types).

Text scales: `TypographyStyle.toTextStyle()` emits `size.sp` and `lineHeight.sp`, so every default
label follows the shopper's font-size setting. Containers do not — `SpacingTokens`, `SizeTokens`
and `RadiusTokens` are all `Dp` — so check the SDK's screens at the largest font scale you
support rather than assuming they reflow. Layout direction is handled: the inputs and rows read
`LocalLayoutDirection`, and numeric fields force LTR digits inside an RTL layout.

### What the SDK does not do

- **No screen-change announcement.** `PrimerCheckoutSheet` and `PrimerCheckoutHost` add no
  semantics at all. Nothing is announced when the sheet opens, or when it moves between method
  selection, the card form, 3DS and the result screen. If your flow needs one, put it on your own
  container.
- **No traversal control.** `clearAndSetSemantics`, `isTraversalGroup` and `traversalIndex` appear
  nowhere in the module, so TalkBack reads the SDK's screens in whatever order the layout produces
  and nothing pins that order across releases.
- **No touch-target guarantee.** The module sets no `minimumInteractiveComponentSize`; targets are
  whatever the Material 3 components the SDK builds on apply by default.
- **No way to pass your own label.** `CardFormDefaults.CardNumberField(controller, modifier)` takes
  a controller and a modifier. There is no label argument, on it or on any other default.
- **Overriding the strings is an Android mechanism, not an SDK feature.** The SDK ships no
  `res/values/public.xml`, so the `accessibility_*` names are ordinary library resources: declaring
  the same name in your own module's `strings.xml` replaces it through normal resource merging. Do
  it for every locale you also override, and expect the names to be as unstable as any other
  internal detail of a beta release.
- **13 of the 79 are dead, and overriding one does nothing at all — silently.** They are declared,
  translated into all 56 locales, and read by no code path in the module, so they look exactly like
  the 66 that work. Redefining a resource cannot fail, there is no log line, and the string simply
  never reaches TalkBack. At this release the dead ones are `accessibility_action_set_default`,
  `accessibility_card_form_card_number_error_invalid`, `accessibility_card_form_cvc_error_invalid`,
  `accessibility_card_form_expiry_error_invalid`, `accessibility_common_cancel`,
  `accessibility_common_dismiss`, `accessibility_payment_selection_card_full`,
  `accessibility_payment_selection_card_masked`,
  `accessibility_payment_selection_pay_with_ideal`,
  `accessibility_payment_selection_pay_with_paypal`, `accessibility_paypal_logo`,
  `accessibility_screen_processing_payment` and `accessibility_screen_success`. **Three of them are
  near-twins of a name that _is_ read, which is the trap**: the processing screen announces
  `accessibility_common_processing_payment`, not `..._screen_processing_payment`; the success screen
  announces its icon's `accessibility_checkout_success_icon`, not `accessibility_screen_success`;
  and a field's validation error announces the shopper-facing message resolved from
  [`errorResId`](#syncvalidationerror) rather than any of the three `*_error_invalid` strings. Pick
  the wrong one of a pair and you have changed nothing while believing you have. Before you rely on
  an override, check that the name is read: `grep -rn "R.string.<name>"` over the SDK sources for
  the release `SKILL.md` pins, which is exactly how this list was produced. A resource is a
  mechanism, not an API, and a mechanism with no reader is inert.

One artifact you will hear and should not chase: the card number field is passed the label string
"Card number, required" and is _not_ passed `isRequired`, which defaults to `false`, so the SDK
appends its own "optional" — TalkBack reads "Card number, required, optional". That is the SDK's
string concatenation, not your integration.

### What each override costs

The rule is mechanical: **semantics live in the composable you replaced.** Replace it and you own
its announcements.

| If you override                                                                | You lose                                                                                                                                           | Restore it with                                                                                      |
| ------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| A `CardFormDefaults.*Field` with your own input                                | That field's label, spoken hint, required/optional suffix, and its error live region                                                               | Your own `Modifier.semantics { contentDescription = … }` and a polite live region on your error text |
| `PrimerCardForm`'s `cardDetails` / `billingAddress` with default fields inside | Nothing per field. Replacing the _section_ keeps each field's own semantics, and the billing `heading()` only if you keep `BillingAddressContent`  | —                                                                                                    |
| `PrimerCardForm`'s `submitButton`                                              | The "Submit payment" label and the three-way disabled/loading state description                                                                    | `contentDescription` plus a `stateDescription` driven off `isFormValid` and `isLoading`              |
| `PrimerPaymentMethods`'s `method`                                              | The SDK row's label. Your `Card` announces only whatever `Text` you put in it, which for a method with a null `paymentMethodName` is the wire code | A `contentDescription` on the row, built from `paymentMethodName ?: paymentMethodType`               |
| `PrimerVaultedPaymentMethods`'s `item`                                         | "Saved payment method: …" and the selected-state description                                                                                       | Both, from the `method` and `isSelected` the slot hands you                                          |
| `PrimerVaultedPaymentMethods`'s `submitButton`                                 | The submit label and state description                                                                                                             | As for the card form's submit button                                                                 |
| `PrimerCheckoutSheet`'s `success` / `error`                                    | Nothing — the SDK's result screens carry only labelled icons                                                                                       | —                                                                                                    |

The multi-error live region is the one exception in the other direction: it is emitted by
`PrimerCardForm`, not by a slot, so no override removes it.
[Worked example](compose-patterns.md#accessibility-for-slots-you-replaced) — a labelled custom
method row and a labelled custom submit button.

## Not covered here

So you can tell "unsupported" from "merely undocumented". Every public declaration in the
`:components` API dump at the pinned release is documented above — checked against
`components/api/components.api`, not asserted — and the boundaries below are things that exist in
the artifact but are not yours to call. Each row was verified the same way an included symbol is:
an exclusion is a claim about the SDK, and two rows that used to sit here (`debugOptions` and
`clientSessionCachingEnabled`) turned out to have Components readers and moved into
[Configuration types](#configuration-types).

| Exists in the SDK                                                                                                                                       | Why it is not here                                                                                                                                                                                                     |
| ------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `PrimerKlarnaController`, `PrimerQrCodeController`, `PrimerDynamicFormController`, `PrimerCountrySelectionController` and their `remember*`/composables | All declared `internal`. App code cannot reference them; the flows run inside `PrimerCheckoutSheet` or via `PrimerPaymentMethods`                                                                                      |
| `io.primer.android.ui.settings.PrimerTheme`                                                                                                             | Legacy drop-in type with an `internal` constructor. Not `io.primer.checkout.PrimerTheme` and never read by Components                                                                                                  |
| Drop-in (`io.primer:android`) and headless (`io.primer:headless-core`) entry points                                                                     | Legacy integrations. Mapped to their Components equivalents in [`SKILL.md`](../SKILL.md) under "Old patterns"                                                                                                          |
| NOL Pay (`PrimerPaymentMethodManagerCategory.NOL_PAY`)                                                                                                  | The category enum member ships, and the string `NOL` appears nowhere in the `:components` sources — there is no Components surface to document                                                                         |
| A `VAULT`-intent entry point                                                                                                                            | `PrimerSessionIntent` appears only as a read-only `List` on `PrimerPaymentMethod`; nothing in the public surface accepts one. Whether a session vaults or charges is decided by the client session your server creates |
| `PrimerError.context`                                                                                                                                   | An `open val` on the base class returning `ErrorContextParams` from the analytics module. It is the SDK's own analytics plumbing, not part of the merchant contract                                                    |
