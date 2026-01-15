---
title: Payment Methods
sidebar_position: 3
description: Overview of supported payment methods in the Primer SDK and configuration options
---

# Payment Methods

The Primer SDK is actively developing a new payment engine (SDK Core) while maintaining full support for legacy implementations. Currently, SDK Core supports card payments, PayPal, and BLIK, with new payment methods added weekly.

## SDK Modes

**SDK Core (Default)**
The new payment engine under active development. Supports a growing list of payment methods with modern architecture and enhanced features. This is the default mode and recommended for new integrations.

**Legacy SDK**
Enable with `sdkCore: false` in configuration. Provides full access to 50+ payment methods. Use when you need payment methods not yet available in SDK Core, or for existing integrations.

## Currently Supported Payment Methods (SDK Core)

The following payment methods work with the default SDK Core engine:

### PAYMENT_CARD

Full-featured card payment form with field validation and tokenization.

### APPLE_PAY

Apple Pay button integration. See the [Apple Pay integration guide](/sdk-reference/apple-pay-options) for detailed setup instructions.

### GOOGLE_PAY

Google Pay button integration. See the [Google Pay integration guide](/sdk-reference/google-pay-options) for detailed setup instructions.

### PAYPAL

PayPal button integration. See the [PayPal integration guide](/sdk-reference/paypal-options) for detailed setup instructions.

### ADYEN_BLIK

Polish payment method requiring one-time password (OTP) verification. Popular in Poland for bank transfers.

## Redirect Payment Methods

:::info New in v0.13.0
The SDK now supports redirect-based Alternative Payment Methods (APMs) with intelligent popup and redirect handling. Redirect APMs are enabled by default.
:::

Redirect-based payment methods take the customer off-site to complete payment with the provider (e.g., bank login, wallet authentication). The SDK handles this flow automatically with:

- **Popup-first approach**: Opens the provider's page in a popup with an overlay on your site
- **Automatic fallback**: Uses full-page redirect when popups are blocked or in WebViews

### Configuring Redirect Behavior

```javascript
const checkout = document.querySelector('primer-checkout');
checkout.setAttribute('client-token', 'your-client-token');

checkout.options = {
  redirect: {
    returnUrl: 'https://example.com/checkout/complete', // Where to return after redirect
    forceRedirect: false, // Force full-page redirect instead of popup
  },
};
```

See the [SDK Options Reference - Redirect Options](/sdk-reference/sdk-options-reference#redirect-options) for complete configuration details.

## Configuration

By default, all SDK Core-supported payment methods are enabled. Use `enabledPaymentMethods` to restrict which payment methods are displayed:

```typescript
import { PaymentMethodType } from '@primer-io/primer-js';

const checkout = document.querySelector('primer-checkout');
checkout.setAttribute('client-token', 'your-client-token');
checkout.options = {
  // Only show card, PayPal, and BLIK
  enabledPaymentMethods: [
    PaymentMethodType.PAYMENT_CARD,
    PaymentMethodType.PAYPAL,
    PaymentMethodType.ADYEN_BLIK,
  ],
};
```

**Default behavior:**

```javascript
// All supported payment methods enabled by default
const checkout = document.querySelector('primer-checkout');
checkout.setAttribute('client-token', 'token');

// No enabledPaymentMethods needed - all supported methods will display

const checkout = document.querySelector('primer-checkout');
checkout.setAttribute('client-token', 'token');
```

## Legacy SDK Support

The Legacy SDK (`sdkCore: false`) provides access to 50+ payment methods by integrating directly with payment processor **Web Headless APIs**. This is the predecessor to SDK Core and remains available while SDK Core expands its payment method support.

### Web Headless Requirement

Not all payment methods support Web Headless integration. When browsing the [Primer Payment Methods catalog](https://primer.io/docs/connections/payment-methods/available-payment-methods), **look for the "Web Headless" column** (✔️) to verify compatibility with the Legacy SDK.

**Examples of Web Headless-supported payment methods:**

- Klarna (`KLARNA`) - ✔️ Web Headless
- Apple Pay (`APPLE_PAY`) - ✔️ Web Headless
- iDEAL via Adyen (`ADYEN_IDEAL`) - ✔️ Web Headless

**Examples of Drop-in only payment methods (not supported):**

- Klarna via Adyen (`ADYEN_KLARNA`) - ❌ Web Headless (Drop-in only)
- iDEAL via Stripe (`STRIPE_IDEAL`) - ❌ Web Headless (Drop-in only)

### Configuration

Enable Legacy SDK by setting `sdkCore: false`. All payment methods configured in your Primer Dashboard that support Web Headless will be automatically available.

```javascript
const checkout = document.querySelector('primer-checkout');
checkout.setAttribute('client-token', 'your-client-token');
checkout.options = {
  sdkCore: false, // Enables Legacy SDK with Web Headless payment methods
};
```

:::note Payment Method Availability
The `enabledPaymentMethods` option is not supported in Legacy mode. Available payment methods are determined by:

1. Your Primer Dashboard configuration
2. Payment processor Web Headless support
3. Regional availability
   :::

View the full catalog at [Primer Payment Methods](https://primer.io/docs/connections/payment-methods/available-payment-methods).

## What's Next

New payment methods are being added to SDK Core weekly. Check the [release notes](/changelog) for announcements of newly supported payment methods.

Payment methods currently in development include Apple Pay, Google Pay, Klarna, Afterpay, Affirm, and regional alternatives.
