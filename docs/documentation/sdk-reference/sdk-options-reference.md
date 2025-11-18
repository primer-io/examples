---
sidebar_position: 1
title: SDK Options Reference
description: Complete reference of all SDK configuration options
---

# SDK Options Reference

This reference documents the configuration options passed to the `options` property of the `<primer-checkout>` component. These options configure SDK behavior, payment methods, and features.

:::info Documentation Navigation
This is a **complete API reference** of all available SDK options - what each option does, its type, and default value.

**Looking for something else?**

- **How to pass options**: See the [Options Guide](../guides/options-guide.md)
- **React-specific patterns**: See the [React Integration Guide](../guides/react-guide.md)
- **SSR framework setup**: See the [Server-Side Rendering Guide](../guides/server-side-rendering-guide.md)
  :::

:::info Component Properties vs SDK Options
This reference documents **SDK options** (the contents of the `options` object). For **component properties** like `client-token`, `custom-styles`, and `loader-disabled`, see the [Options Guide - Component Properties](/guides/options-guide#component-properties-html-attributes).
:::

## SDK Core Option

:::warning SDK Core is Default as of v0.4.0
Starting in v0.4.0, **SDK Core is enabled by default**. This is a new payment engine with enhanced performance and features.

**For the current list of supported payment methods**, see the [Payment Methods Guide](/guides/payment-methods-guide).

**To use the full suite of payment methods now**, explicitly set `sdkCore: false` to use the legacy SDK engine.

See the [v0.4.0 changelog](/changelog#v040---sdk-core-default--billing-address-17-oct-2025) for full details.
:::

**Option Details:**

| Property  | Type      | Default | Description                                                                                   |
| --------- | --------- | ------- | --------------------------------------------------------------------------------------------- |
| `sdkCore` | `boolean` | `true`  | Enable SDK Core engine. Set to `false` to use legacy SDK v2 with full payment method support. |

**Example - Using Legacy SDK:**

```javascript
const checkout = document.querySelector('primer-checkout');

// SDK option - opt out of SDK Core
checkout.options = {
  sdkCore: false, // Use legacy SDK
};
```

**Example - Using SDK Core (default):**

```javascript
const checkout = document.querySelector('primer-checkout');

// SDK options - sdkCore: true is the default
checkout.options = {
  // sdkCore: true is the default, no need to specify
  locale: 'en-GB',
};
```

## Core SDK Options

These are the fundamental options for configuring SDK behavior. These go inside the `options` object.

:::warning client-token is NOT an SDK Option
The client token is set as a component property using `setAttribute('client-token', 'your-token')`, NOT in the options object. See the [Options Guide](/guides/options-guide#required-client-token) for details.
:::

### locale

**Type**: `string`
**Default**: Browser's locale

Forces the locale for UI elements. Use standard locale formats like "en-US", "fr-FR", "es-ES", etc.

**Example:**

```javascript
const options = {
  locale: 'en-GB', // British English
};
```

### merchantDomain

**Type**: `string`
**Default**: `window.location.hostname`

Specifies the merchant's domain for Apple Pay domain validation. Particularly useful when the checkout is hosted on a different domain than the merchant's registered Apple Pay domain.

**Example:**

```javascript
const options = {
  merchantDomain: 'merchant.example.com',
};
```

### disabledPayments

**Type**: `boolean`
**Default**: `false`

When `true`, disables all payment methods globally. Useful for drop-in mode when you only want to display vaulted payment methods.

**Example:**

```javascript
const options = {
  disabledPayments: true, // Only show vaulted payment methods
};
```

## Card Options

Configure card payment form behavior and appearance.

### card.cardholderName.required

**Type**: `boolean`
**Default**: `false`

Whether the cardholder name field is required for card payments.

### card.cardholderName.visible

**Type**: `boolean`
**Default**: `true`

Whether the cardholder name field is visible in the card form.

### card.cardholderName.defaultValue

:::info New in v0.7.3
Pre-fill the cardholder name field with a default value using synchronous initialization.
:::

**Type**: `string`
**Default**: none

Pre-fills the cardholder name field with the specified value during initialization. The value is applied synchronously via iframe URL hash, ensuring it appears immediately when the checkout loads with no race conditions or blank field flash.

**Key benefits:**

- Synchronous initialization (value visible immediately at T+4ms)
- No race conditions or blank field flash
- User can edit or clear the pre-filled value
- Backward compatible (optional parameter)

**Common use cases:**

- Pre-filling from user profiles during checkout initialization
- Auto-completing checkout forms with known customer data

**Example:**

```javascript
const options = {
  card: {
    cardholderName: {
      required: true,
      visible: true,
      defaultValue: 'John Doe', // Pre-fill cardholder name
    },
  },
};
```

**Comparison with `setCardholderName()`:**

- **`defaultValue`**: Use for pre-filling during initialization (synchronous, no race conditions)
- **`setCardholderName()`**: Use for runtime updates after initialization (see [v0.7.1 changelog](/changelog#v071---programmatic-cardholder-name-06-nov-2025))

## Apple Pay Options

Configure Apple Pay button appearance and behavior.

### applePay.buttonType

**Type**: `'plain' | 'buy' | 'set-up' | 'donate' | 'check-out' | 'book' | 'subscribe'`
**Default**: `'plain'`

The type of Apple Pay button to display.

### applePay.buttonStyle

**Type**: `'white' | 'white-outline' | 'black'`
**Default**: `'black'`

The visual style of the Apple Pay button.

### applePay.captureBillingAddress

**Type**: `boolean`
**Default**: `false`

Whether to capture billing address during checkout.

:::warning Deprecated
Use `applePay.billingOptions.requiredBillingContactFields` instead.
:::

### applePay.billingOptions

**Type**: `object`

Configuration for billing information collection.

**billingOptions.requiredBillingContactFields**
**Type**: `Array<'emailAddress' | 'name' | 'phoneNumber' | 'postalAddress' | 'phoneticName'>`

Required billing contact fields to collect during checkout.

### applePay.shippingOptions

**Type**: `object`

Configuration for shipping information collection.

**shippingOptions.requiredShippingContactFields**
**Type**: `Array<'emailAddress' | 'name' | 'phoneNumber' | 'postalAddress' | 'phoneticName'>`

Required shipping contact fields to collect during checkout.

**shippingOptions.requireShippingMethod**
**Type**: `boolean`
**Default**: `false`

Whether shipping method selection is required.

**Example:**

```javascript
const options = {
  applePay: {
    buttonType: 'buy',
    buttonStyle: 'black',
    billingOptions: {
      requiredBillingContactFields: ['postalAddress', 'emailAddress'],
    },
    shippingOptions: {
      requiredShippingContactFields: ['postalAddress', 'name'],
      requireShippingMethod: false,
    },
  },
};
```

## Google Pay Options

Configure Google Pay button appearance and behavior.

### googlePay.buttonType

**Type**: `'long' | 'short' | 'book' | 'buy' | 'checkout' | 'donate' | 'order' | 'pay' | 'plain' | 'subscribe'`
**Default**: `'long'`

The type of Google Pay button to display.

### googlePay.buttonColor

**Type**: `'default' | 'black' | 'white'`
**Default**: `'default'`

The color of the Google Pay button.

### googlePay.buttonSizeMode

**Type**: `'fill' | 'static'`
**Default**: `'fill'`

The size mode of the Google Pay button. `'fill'` makes the button expand to fill its container, while `'static'` keeps it at a fixed size.

### googlePay.captureBillingAddress

**Type**: `boolean`
**Default**: `false`

Whether to prompt for billing address during checkout.

### googlePay.shippingAddressParameters

**Type**: `object`

Configuration for shipping address collection.

**shippingAddressParameters.phoneNumberRequired**
**Type**: `boolean`
**Default**: `false`

Whether phone number is required in the shipping address.

### googlePay.emailRequired

**Type**: `boolean`
**Default**: `false`

Whether email address is required during checkout.

### googlePay.requireShippingMethod

**Type**: `boolean`
**Default**: `false`

Whether shipping method selection is required.

**Example:**

```javascript
const options = {
  googlePay: {
    buttonType: 'long',
    buttonColor: 'black',
    buttonSizeMode: 'fill',
    captureBillingAddress: true,
    emailRequired: false,
    requireShippingMethod: false,
  },
};
```

## PayPal Options

For comprehensive PayPal configuration options including button styling, vaulting, and funding source control, see the dedicated [PayPal Options Reference](/sdk-reference/paypal-options).

## Klarna Options

Configure Klarna payment behavior.

### klarna.paymentFlow

**Type**: `'DEFAULT' | 'PREFER_VAULT'`
**Default**: `'DEFAULT'`

The payment flow to use. `'PREFER_VAULT'` prioritizes saving the payment method for future use.

### klarna.recurringPaymentDescription

**Type**: `string`
**Default**: none

Description for recurring payments. Required if offering recurring payment options.

### klarna.allowedPaymentCategories

**Type**: `Array<'pay_now' | 'pay_later' | 'pay_over_time'>`
**Default**: none

Allowed Klarna payment categories. Restricts which Klarna payment options are available to customers.

### klarna.buttonOptions

**Type**: `object`

Configuration for the Klarna button.

**buttonOptions.text**
**Type**: `string`

Custom text to display on the Klarna button.

**Example:**

```javascript
const options = {
  klarna: {
    paymentFlow: 'DEFAULT',
    recurringPaymentDescription: 'Monthly subscription',
    allowedPaymentCategories: ['pay_now', 'pay_later', 'pay_over_time'],
    buttonOptions: {
      text: 'Pay with Klarna',
    },
  },
};
```

## Vault Options

Configure payment method vaulting (saving for future use).

### vault.enabled

**Type**: `boolean`
**Required**: Yes (if using vault)

Enable payment method vaulting to allow customers to save payment methods for future purchases.

### vault.headless

:::info New in v0.9.0
Enable headless vault mode for complete programmatic control over vault UI and payment flow.
:::

**Type**: `boolean`
**Default**: `false`

When `true`, hides all default vault UI components while maintaining full vault functionality. This allows you to build completely custom vault interfaces using the PrimerJS methods (`createCvvInput()`, `startVaultPayment()`) and callbacks (`onVaultedMethodsUpdate`).

**Key behaviors:**

- Default vault UI components are not rendered (vault manager, payment method list, submit button)
- All vault functionality remains operational (payment method storage, selection, CVV recapture)
- `onVaultedMethodsUpdate` callback still fires with vaulted payment methods data
- Compatible with all other vault configuration options
- Requires custom UI implementation to display and manage vaulted payment methods

**When to use:**

- Building custom vault UI that matches your brand design
- Integrating vault into existing checkout flows with specific layouts
- Creating advanced vault management interfaces
- Implementing non-standard vault UX patterns

**Example:**

```javascript
const checkout = document.querySelector('primer-checkout');
checkout.setAttribute('client-token', 'your-client-token');

checkout.options = {
  vault: {
    enabled: true,
    headless: true, // Enable headless mode
    showEmptyState: false,
  },
};

checkout.addEventListener('primer:ready', (event) => {
  const primerJS = event.detail;

  // Build custom vault UI when methods are loaded
  primerJS.onVaultedMethodsUpdate = ({ vaultedPayments, cvvRecapture }) => {
    // Render custom vault UI
    const vaultContainer = document.getElementById('custom-vault');
    vaultContainer.innerHTML = '';

    vaultedPayments.toArray().forEach((method) => {
      const methodElement = createCustomVaultCard(method);
      vaultContainer.appendChild(methodElement);
    });

    // Add CVV input if required
    if (cvvRecapture) {
      const cvvInput = await primerJS.createCvvInput();
      vaultContainer.appendChild(cvvInput);
    }
  };

  // Handle payment submission
  document.getElementById('custom-pay-btn').addEventListener('click', async () => {
    await primerJS.startVaultPayment();
  });
});
```

**Related:**

- `createCvvInput()` method - Creates CVV input component for custom vault UI (see [Events & Callbacks Reference](/sdk-reference/events-callbacks))
- `startVaultPayment()` method - Initiates vault payment (see [Events & Callbacks Reference](/sdk-reference/events-callbacks))
- `onVaultedMethodsUpdate` callback - Receives `cvvRecapture` flag (see [Events & Callbacks Reference](/sdk-reference/events-callbacks))

### vault.showEmptyState

:::warning Default Changed in v0.9.0
The default value changed from `true` to `false` in v0.9.0. Explicitly set to `true` if you want to display the empty state.
:::

**Type**: `boolean`
**Default**: `false` (changed from `true` in v0.9.0)

Show an empty state message when no vaulted payment methods exist. When `true`, displays a default message indicating no saved payment methods are available.

**Note:** This option has no effect when `vault.headless: true` (you control the empty state in your custom UI).

**Example:**

```javascript
const options = {
  vault: {
    enabled: true,
    showEmptyState: true, // Explicitly enable empty state display
  },
};
```

## Stripe Options

Configure Stripe-specific payment options.

### stripe.mandateData

**Type**: `object`

Configuration for direct debit mandate text and merchant information.

**mandateData.fullMandateText**
**Type**: `string`

Custom mandate text for direct debit payments. Displayed to customers during checkout.

**mandateData.merchantName**
**Type**: `string`

Merchant name displayed in the mandate text.

### stripe.publishableKey

**Type**: `string`
**Default**: none

Stripe publishable key for direct Stripe integration.

**Example:**

```javascript
const options = {
  stripe: {
    mandateData: {
      fullMandateText: 'By providing your payment information...',
      merchantName: 'Your Business Name',
    },
    publishableKey: 'pk_test_...',
  },
};
```

## Submit Button Options

Configure the submit button behavior and appearance.

### submitButton.amountVisible

**Type**: `boolean`
**Default**: `false`

Whether to show the order amount on the submit button. When `true`, displays formatted amount next to button text (e.g., "Pay $12.34").

### submitButton.useBuiltInButton

**Type**: `boolean`
**Default**: `true`

Whether to render the built-in submit button component.

- When `true` (default): The component renders the standard Primer submit button.
- When `false`: No DOM elements are created, allowing external buttons to handle form submission by dispatching the `primer:card-submit` event.

**Example with Built-in Button:**

```javascript
const options = {
  submitButton: {
    amountVisible: true,
    useBuiltInButton: true, // Default
  },
};
```

**Example with External Button:**

```javascript
// Hide built-in button and use external button
const options = {
  submitButton: {
    useBuiltInButton: false,
  },
};

// External button dispatches event to submit
document.getElementById('my-button').addEventListener('click', () => {
  document.dispatchEvent(
    new CustomEvent('primer:card-submit', {
      bubbles: true,
      composed: true,
    }),
  );
});
```

:::tip External Button Integration
See the [Events Guide - primer:card-submit](/guides/events-guide#primercard-submit) for more details on external button usage and event handling.
:::

## Enabled Payment Methods

Configure which payment methods are available and displayed in the checkout.

### enabledPaymentMethods

**Type**: `PaymentMethodType[]`
**Default**: `[PaymentMethodType.PAYMENT_CARD]`

Specifies which payment methods are enabled and displayed in the checkout. By default, only card payments are enabled. Configure this to enable specific payment methods for your checkout flow.

**Available payment methods**: `PAYMENT_CARD`, `PAYPAL`, `ADYEN_BLIK`

**Example:**

```javascript
import { PaymentMethodType } from '@primer-io/primer-js';

const options = {
  enabledPaymentMethods: [
    PaymentMethodType.PAYMENT_CARD,
    PaymentMethodType.ADYEN_BLIK,
  ],
};
```

**Common Use Cases:**

```javascript
// Card payments only (default)
const options = {
  enabledPaymentMethods: [PaymentMethodType.PAYMENT_CARD],
};

// Card and BLIK (Poland)
const options = {
  enabledPaymentMethods: [
    PaymentMethodType.PAYMENT_CARD,
    PaymentMethodType.ADYEN_BLIK,
  ],
};
```

:::info Payment Method Configuration
Payment methods must be configured in your Primer Dashboard and included in your client token to be available. The `enabledPaymentMethods` option filters which configured methods are displayed in the checkout UI.
:::

## Complete Options Reference

Here's a comprehensive example showing all available options. Use this as a starting template and remove options you don't need.

```typescript
import { PaymentMethodType } from '@primer-io/primer-js';

const checkout = document.querySelector('primer-checkout');

// First, set component properties (HTML attributes)
checkout.setAttribute('client-token', 'your-client-token'); // Required - component property, NOT in options

// Then, set SDK options object
checkout.options = {
  // Core Options
  sdkCore: true, // Default: true (SDK Core enabled)
  locale: 'en-US', // Optional: force UI locale
  merchantDomain: 'merchant.example.com', // Optional: for Apple Pay validation
  disabledPayments: false, // Optional: disable all payment methods
  enabledPaymentMethods: [
    PaymentMethodType.PAYMENT_CARD,
    PaymentMethodType.PAYPAL,
    PaymentMethodType.ADYEN_BLIK,
  ], // Optional: which payment methods to display

  // Card Options
  card: {
    cardholderName: {
      required: true, // Whether cardholder name is required
      visible: true, // Whether cardholder name field is visible
      defaultValue: 'John Doe', // Pre-fill cardholder name (optional)
    },
  },

  // Apple Pay Options
  applePay: {
    buttonType: 'buy', // Button type
    buttonStyle: 'black', // Button style
    billingOptions: {
      requiredBillingContactFields: ['postalAddress', 'emailAddress'],
    },
    shippingOptions: {
      requiredShippingContactFields: ['postalAddress', 'name'],
      requireShippingMethod: false,
    },
  },

  // Google Pay Options
  googlePay: {
    buttonType: 'long', // Button type
    buttonColor: 'black', // Button color
    buttonSizeMode: 'fill', // Button size mode
    captureBillingAddress: true,
    emailRequired: false,
    requireShippingMethod: false,
  },

  // Klarna Options
  klarna: {
    paymentFlow: 'DEFAULT',
    allowedPaymentCategories: ['pay_now', 'pay_later', 'pay_over_time'],
  },

  // Vault Options
  vault: {
    enabled: true,
    headless: false, // Optional: enable headless mode for custom vault UI
    showEmptyState: true,
  },

  // Stripe Options
  stripe: {
    mandateData: {
      fullMandateText: 'Custom mandate text...',
      merchantName: 'Your Business Name',
    },
    publishableKey: 'pk_test_...',
  },

  // Submit Button Options
  submitButton: {
    amountVisible: true,
    useBuiltInButton: true,
  },
};
```

:::tip TypeScript Support
For TypeScript projects, import the `PrimerCheckoutOptions` type for SDK options:

```typescript
import type { PrimerCheckoutOptions } from '@primer-io/primer-js';

const checkout = document.querySelector('primer-checkout');

// Component property
checkout.setAttribute('client-token', 'your-token');

// SDK options with type safety
const options: PrimerCheckoutOptions = {
  locale: 'en-GB',
  sdkCore: true,
  // TypeScript will provide autocomplete and type checking
  // Note: clientToken is NOT in PrimerCheckoutOptions (it's a component property)
};

checkout.options = options;
```

:::

## See Also

- **[Options Guide](/guides/options-guide)** - Learn HOW to configure SDK options with usage patterns and best practices
- **[Events Guide](/guides/events-guide)** - Handle checkout completion, failure, and other SDK events
- **[Getting Started](/guides/getting-started)** - New to the Primer SDK? Start here
- **[Primer Checkout Component](/sdk-reference/Components/primer-checkout-doc)** - Component-specific documentation and API reference
