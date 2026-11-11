# Primer Skills for Claude Code

Official Primer skills for Claude Code and compatible AI coding assistants. Skills provide comprehensive reference documentation and best practices for building payment experiences with Primer.

## What are Skills?

Skills are packaged knowledge bases that AI coding assistants can reference while you work. They contain:

- Component API documentation
- Integration patterns and examples
- Best practices and common pitfalls
- Troubleshooting guides
- Framework-specific instructions

## Available Skills

### primer-web-components

**Version:** 1.1.0

**What it includes:**

- Complete component reference for Primer Checkout web components
- React integration patterns (React 18 & 19)
- Critical best practices (stable object references, event handling)
- SSR support documentation (Next.js, SvelteKit)
- CSS theming guide
- Common troubleshooting scenarios
- Verified against the shipped `@primer-io/primer-js` 1.9.3

**Directory:** [`primer-web-components/`](./primer-web-components)

### primer-ios-checkout

**Version:** 1.3.1

**What it includes:**

- Integration tasks in the order you ship them, with three references by integration domain
- `PrimerCheckout` for the managed flow, and `PrimerCheckoutSession` with the composables for
  custom layouts
- Session and state type reference, with the error ids
- Card form slots and `CardFormDefaults`, with field-level validation display
- Per-method setup: the redirect scheme, Apple Pay's merchant identifier, 3DS
- Design token theming via `PrimerCheckoutTheme`, and how dark mode actually applies
- Paying with a saved card from your own pay button, with the SDK's CVV recapture screen
- Outcome delivery documented as it behaves — a failure after ready arrives once per attempt
- Gating payment creation: idempotency keys, continue or abort
- UIKit support via `PrimerCheckoutPresenter`
- A "What this skill does not cover" section, so unsupported reads differently from undocumented
- Troubleshooting by symptom

**Directory:** [`primer-ios-checkout/`](./primer-ios-checkout)

### primer-android-checkout

**Version:** 1.4.0

**What it includes:**

- Composable API reference for the checkout sheet and inline host, with a complete import map
- Controller pattern with `remember*Controller` functions, and their identity and lifetime
- Card form control: per-field updates, validation state, co-badged network selection
- Payment method flows, which methods the SDK drives itself, and which need their own dependency
- Material 3 theming via design tokens and `appearanceMode`, slot-based customization, state
  observation
- Google Pay Express Checkout: shipping address and shipping option handlers
- What the SDK provides for TalkBack, and what it leaves to you
- Error reference with concrete error IDs, and troubleshooting by symptom
- Gating payment creation: idempotency keys, continue or abort
- A "Not covered here" section, so unsupported reads differently from undocumented

**Directory:** [`primer-android-checkout/`](./primer-android-checkout)

## Installation

### Method 1: Via Marketplace (Recommended)

The easiest way to install Primer skills is through the Claude Code marketplace:

```bash
# Add Primer marketplace
/plugin marketplace add primer-io/examples

# Install skills (choose one or more)
/plugin install primer-web-components@primer-skills
/plugin install primer-ios-checkout@primer-skills
/plugin install primer-android-checkout@primer-skills
```

After installation, restart Claude Code. The skill will automatically activate when you're working with Primer components.

### Method 2: Manual Installation

For Claude Code, Cursor, or other AI coding assistants:

```bash
cd ~/.claude/skills  # or ~/.cursor/skills for Cursor
git clone --depth 1 https://github.com/primer-io/examples.git temp

# Copy the skill(s) you need
mv temp/claude-code-skills/primer-web-components ./      # Web
mv temp/claude-code-skills/primer-ios-checkout ./         # iOS
mv temp/claude-code-skills/primer-android-checkout ./     # Android

rm -rf temp
```

Or download directly from GitHub:

1. Navigate to the skill directory on [GitHub](https://github.com/primer-io/examples/tree/main/claude-code-skills)
2. Download the folder (use repo's "Code" → "Download ZIP" and extract the skill folder)
3. Copy to your skills directory:
   - **macOS/Linux:** `~/.claude/skills/<skill-name>/`
   - **Windows:** `%USERPROFILE%\.claude\skills\<skill-name>\`
4. Restart your AI assistant

## Verifying Installation

After installation, verify the skill is loaded by asking your AI assistant:

```
Do you have access to the Primer <web components|iOS checkout|Android checkout> skill?
```

The assistant should confirm it has access to the skill documentation.

## Version History

### v1.4.0 (2026-10-20)

- **primer-android-checkout:** re-pinned from `3.0.0-beta.6` to `3.0.0-beta.8`, which changed the
  API the skill documents
  - `PrimerCheckoutState` is down to four members: `BeforeClientSessionUpdated` and
    `ClientSessionUpdated` are removed, and a session update now publishes `Ready` again with the
    updated session. In-flight signal is the card form's `state.isLoading`
  - `Failure.error` renamed `primerError`, and `Failure` gained `checkoutData` (payment and order id
    when a payment was created); the sheet's `error` slot now takes two parameters
  - `formatAmount` works in every state after the first `Ready`. Removed the "format
    `ClientSessionUpdated` totals yourself" guidance, the `runCatching` guards and the
    surcharge-crash workaround it required
  - Theming: `appearanceMode` (`SYSTEM`/`LIGHT`/`DARK`) and `isDarkAppearance()`,
    `borderWidthTokens` → `widthTokens` (`default`/`focus`/`selected`/`error`), `brandFont` and an
    `error` style on typography, `primerColorOnBrand`. The raw palette (`primerColorGray*` and the
    other ramps) is now internal, `primerColorBackground` is `primerColorBackgroundPrimary`, the
    `…Hover` border tokens and every `base` token are gone; samples override semantic tokens instead
  - Google Pay Express Checkout: `onShippingAddressChange` / `onShippingOptionChange`, with a
    worked handler and the `shipping-not-updated` error id
  - Autofill on the default card and billing fields noted; KDoc table gains the `s.error` examples
    that no longer compile
  - `3ds-android`, `klarna-android` and `stripe-android` now release with the SDK, so the install
    snippet pins them at `3.0.0-beta.8` instead of their old standalone versions
  - Merchant-supplied pieces (method icons, fonts, token source, navigation, shipping backend) are
    snippet parameters instead of undefined `your*` stubs, and `import com.example.checkout.R` is
    gone from every import block, so each snippet compiles as written
  - Gate: 50 of 50 compilation units from 44 usage blocks compile, with no imports supplied by the
    harness, and the three `// WRONG (compiles; wrong at runtime)` halves compile as marked. The
    previous revision failed 8 of 50. Run against a local publish of the SDK's `v3` branch at
    `6bbca60fc` as `3.0.0-beta.8`, strictly pinned, before the release reached Maven Central: re-run
    against the published artifact

### v1.3.0 (2026-09-10)

- **primer-web-components:** rebuilt against the shipped `@primer-io/primer-js` 1.9.3, replacing
  claims validated against 1.7.0
  - `primer:payment-start` documented with `preventDefault()` first — without it the SDK continues
    payment creation while a merchant's async check is still running
  - Removed `sdkCore`, `options.stripe`, `slot="checkout-failure"`, `--primer-color-gray-800` and
    `.primer-light-theme`: none exist in the shipped package
  - `redirect.returnUrl` documented — without it the redirect method is dropped from the checkout
  - The vault manager's `customerId` requirement documented, and twelve previously unmentioned events
  - `SKILL.md` 6,003 → 1,982 words, reorganised onto the shared skill standard
- **primer-android-checkout:** re-verified against SDK `3.0.0-beta.6` and hardened over ten
  standard-driven passes, each measured by compiling twenty generated integrations against the
  published artifact
  - `SKILL.md` cut from 10,020 to under 2,000 words; detail moved into the reference files
  - 3DS, Klarna and Stripe ACH need their own dependency coordinates — the SDK loads those wrappers
    reflectively, so without them 3DS throws and the method disappears from the list while
    everything still compiles
  - Removed `redirectScheme` guidance: nothing in the SDK reads it, and the SDK registers its own
    redirect intent filter. Klarna's `returnIntentUrl` is the setting that is actually required
  - Validation errors corrected: only `errorResId` is ever populated, and the field-name resource id
    is always `0`, so the previously documented resolution call would have thrown on every error
  - `threeDsOptions` and its siblings documented with their owning type, `PrimerPaymentMethodOptions`
  - Two different `PrimerPaymentMethod` types disambiguated: the one reachable from the client
    session carries no surcharge
  - `clientSessionCachingEnabled` documented as inverted, and `is3DSSanityCheckEnabled` as the
    default that blocks 3DS on emulators and rooted devices
  - `formatAmount` documented as safe only while the session is `Ready` — it throws elsewhere, even
    in states that carry a client session
  - `paymentHandling = MANUAL` removed as an option: Components wires no tokenization callback and
    backend-driven methods fail outright in that mode
  - iDEAL and PromptPay method types listed with their processor prefixes, so a `== "IDEAL"` filter
    no longer looks correct
  - Removed documentation of the Klarna, QR-code and country-selection controllers: they are
    `internal` to the SDK and cannot be called from app code
  - Checkout state documented as transitions and terminality, not just a member list
  - Accessibility section added: what the built-in fields announce, what replacing a slot costs, and
    the fact that the SDK exposes no accessibility API at this version
  - Import map completed for Primer _and_ platform imports, with a do-not-import list, and a
    copy-ready import block on every recipe
  - Added a "Not covered here" boundary section, so unsupported reads differently from undocumented
- **primer-ios-checkout:** rewritten onto the shipped Session API and verified against SDK
  `3.0.0-beta.7`
  - The previous revision was built around `PrimerCheckoutScope`, `PrimerCardFormScope` and 21
    sibling scope and state types. All are declared without `public`, so none was reachable from an
    app, and `PrimerCheckout` has no `scope:` parameter — the only documented route to them
  - Rewritten onto what ships: `PrimerCheckout` for the managed flow, and `PrimerCheckoutSession`
    with `.primerCheckoutSession(_:)`, `PrimerCardForm`, `PrimerPaymentMethods` and
    `PrimerVaultedPaymentMethods` for custom layouts. The previous revision named none of them
  - `onCompletion` documented as not one-shot: a failure after the session is ready is delivered
    once per attempt, so the previously documented navigate-on-terminal-state pattern double-fired
  - `PrimerError` corrected from a struct to an enum with no accessible initializer, and
    `diagnosticsId` from optional to non-optional; the 37 error ids listed
  - "Gate payment creation" filled rather than omitted: `onBeforePaymentCreate` and `idempotencyKey`
    are both public, and setting the handler makes the key ignored
  - `urlScheme` documented as required for every redirect method and 3DS — it defaults to `nil` and
    only warns when malformed, so it fails at the return rather than at startup
  - Re-pinned from `3.0.0-beta.5` to `3.0.0-beta.7`, which changed the API the skill documents:
    `updateCvvInput` removed, `selectVaulted(_:)` now pays and raises the SDK's own CVV screen,
    `darkColors` removed and `width` renamed `borderWidth`, `formatAmount(_:)` and the modifier's
    `theme:` added
  - Added a "What this skill does not cover" section, so unsupported reads differently from
    undocumented
  - `SKILL.md` 8,254 → 1,388 words; the two reference files replaced by three, organised by
    integration domain
  - Gate: 23 of 23 usage blocks compile against the published tag, with no imports supplied by the
    harness. The previous revision compiled 6 of 63

### v1.2.0 (2026-03-20)

- **primer-android-checkout:** Source-verified update against SDK 3.0.0-beta.2
  - Added Klarna controller, QR code controller, and payment method flows documentation
  - Added MANUAL payment handling, PrimerSessionIntent, expanded error IDs
  - Fixed data classes against source: PrimerClientSession (4→9 fields), PrimerPaymentMethod, Payment, PaymentInstrumentData
  - Added compose patterns: Klarna, QR code, Google Pay, error recovery, vault-only flow

### v1.1.0 (2026-03-03)

- Added `primer-ios-checkout` skill for iOS CheckoutComponents SDK
- Added `primer-android-checkout` skill for Android CheckoutComponents SDK

### v1.0.0 (2025-10-28)

- Initial release
- `primer-web-components` skill with comprehensive component reference

## Contributing

If you find errors in the skill documentation or have suggestions for improvements, please open an issue or pull request in the [examples repository](https://github.com/primer-io/examples).

## License

These skills are provided under the same license as the Primer examples repository.
