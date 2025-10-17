---
sidebar_position: 1
title: SDK Options Reference
description: Complete reference of all SDK configuration options
---

# SDK Options Reference

This reference documents the configuration options passed to the `options` property of the `<primer-checkout>` component. These options configure SDK behavior, payment methods, and features.

:::info How to Use These Options

This reference documents **WHAT** options are available. For guidance on **HOW** to configure these options (including React/JSX patterns and setAttribute() requirements), see the [Options Guide](/documentation/options-guide).

For handling checkout events like completion or failure, see the [Events Guide](/documentation/events-guide) instead.
:::

:::info Component Properties vs SDK Options
This reference documents **SDK options** (the contents of the `options` object). For **component properties** like `client-token`, `custom-styles`, and `loader-disabled`, see the [Options Guide - Component Properties](/documentation/options-guide#component-properties-html-attributes).
:::

## SDK Core Option

:::warning SDK Core is Default as of v0.4.0
Starting in v0.4.0, **SDK Core is enabled by default**. This is a new payment engine with enhanced performance and features.

**Current Support:**

- ✅ Card payment forms
- ✅ Vaulted payment methods (stored cards)
- ✅ Billing address capture

**Coming Soon:**

- 🔄 Additional payment methods (in future releases)

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

// Component property (separate from options)
checkout.setAttribute('client-token', 'your-token');

// SDK option - opt out of SDK Core
checkout.options = {
  sdkCore: false, // Use legacy SDK
};
```

**Example - Using SDK Core (default):**

```javascript
const checkout = document.querySelector('primer-checkout');

// Component property (separate from options)
checkout.setAttribute('client-token', 'your-token');

// SDK options - sdkCore: true is the default
checkout.options = {
  // sdkCore: true is the default, no need to specify
  locale: 'en-GB',
};
```

## Core SDK Options

These are the fundamental options for configuring SDK behavior. These go inside the `options` object.

:::warning client-token is NOT an SDK Option
The client token is set as a component property using `setAttribute('client-token', 'your-token')`, NOT in the options object. See the [Options Guide](/documentation/options-guide#required-client-token) for details.
:::

### locale

**Required**: No
**Type**: `string`
**Default**: Browser's locale
**Description**: Forces the locale for UI elements. Use standard locale formats like "en-US", "fr-FR", "es-ES", etc.

**Example:**

```javascript
const checkout = document.querySelector('primer-checkout');

// Component property
checkout.setAttribute('client-token', 'your-token');

// SDK option
checkout.options = {
  locale: 'en-GB', // British English
};
```

### merchantDomain

**Required**: No
**Type**: `string`
**Default**: `window.location.hostname`
**Description**: Specifies the merchant's domain for Apple Pay domain validation. Particularly useful when the checkout is hosted on a different domain than the merchant's registered Apple Pay domain.

**Example:**

```javascript
const checkout = document.querySelector('primer-checkout');

// Component property
checkout.setAttribute('client-token', 'your-token');

// SDK option
checkout.options = {
  merchantDomain: 'merchant.example.com',
};
```

### disabledPayments

**Required**: No
**Type**: `boolean`
**Default**: `false`
**Description**: When `true`, disables all payment methods globally. Useful for drop-in mode when you only want to display vaulted payment methods.

**Example:**

```javascript
const checkout = document.querySelector('primer-checkout');

// Component property
checkout.setAttribute('client-token', 'your-token');

// SDK option
checkout.options = {
  disabledPayments: true, // Only show vaulted payment methods
};
```

## Card Options

Configure card payment form behavior and appearance.

### card.cardholderName.required

**Type**: `boolean`
**Default**: `false`
**Description**: Whether the cardholder name field is required for card payments.

### card.cardholderName.visible

**Type**: `boolean`
**Default**: `true`
**Description**: Whether the cardholder name field is visible in the card form.

**Example:**

```javascript
const checkout = document.querySelector('primer-checkout');

// Component property
checkout.setAttribute('client-token', 'your-token');

// SDK option
checkout.options = {
  card: {
    cardholderName: {
      required: true,
      visible: true,
    },
  },
};
```

## Apple Pay Options

Configure Apple Pay button appearance and behavior.

### applePay.buttonType

**Type**: `'plain' | 'buy' | 'set-up' | 'donate' | 'check-out' | 'book' | 'subscribe'`
**Default**: `'plain'`
**Description**: The type of Apple Pay button to display.

### applePay.buttonStyle

**Type**: `'white' | 'white-outline' | 'black'`
**Default**: `'black'`
**Description**: The visual style of the Apple Pay button.

### applePay.captureBillingAddress

**Type**: `boolean`
**Default**: `false`
**Description**: Whether to capture billing address during checkout.

:::warning Deprecated
Use `applePay.billingOptions.requiredBillingContactFields` instead.
:::

### applePay.billingOptions

**Type**: `object`
**Description**: Configuration for billing information collection.

**billingOptions.requiredBillingContactFields**
**Type**: `Array<'emailAddress' | 'name' | 'phoneNumber' | 'postalAddress' | 'phoneticName'>`
**Description**: Required billing contact fields to collect during checkout.

### applePay.shippingOptions

**Type**: `object`
**Description**: Configuration for shipping information collection.

**shippingOptions.requiredShippingContactFields**
**Type**: `Array<'emailAddress' | 'name' | 'phoneNumber' | 'postalAddress' | 'phoneticName'>`
**Description**: Required shipping contact fields to collect during checkout.

**shippingOptions.requireShippingMethod**
**Type**: `boolean`
**Default**: `false`
**Description**: Whether shipping method selection is required.

**Example:**

```javascript
const checkout = document.querySelector('primer-checkout');

// Component property
checkout.setAttribute('client-token', 'your-token');

// SDK option
checkout.options = {
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
**Description**: The type of Google Pay button to display.

### googlePay.buttonColor

**Type**: `'default' | 'black' | 'white'`
**Default**: `'default'`
**Description**: The color of the Google Pay button.

### googlePay.buttonSizeMode

**Type**: `'fill' | 'static'`
**Default**: `'fill'`
**Description**: The size mode of the Google Pay button. `'fill'` makes the button expand to fill its container, while `'static'` keeps it at a fixed size.

### googlePay.captureBillingAddress

**Type**: `boolean`
**Default**: `false`
**Description**: Whether to prompt for billing address during checkout.

### googlePay.shippingAddressParameters

**Type**: `object`
**Description**: Configuration for shipping address collection.

**shippingAddressParameters.phoneNumberRequired**
**Type**: `boolean`
**Default**: `false`
**Description**: Whether phone number is required in the shipping address.

### googlePay.emailRequired

**Type**: `boolean`
**Default**: `false`
**Description**: Whether email address is required during checkout.

### googlePay.requireShippingMethod

**Type**: `boolean`
**Default**: `false`
**Description**: Whether shipping method selection is required.

**Example:**

```javascript
const checkout = document.querySelector('primer-checkout');

// Component property
checkout.setAttribute('client-token', 'your-token');

// SDK option
checkout.options = {
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

Configure PayPal button appearance and behavior.

### paypal.buttonColor

**Type**: `'gold' | 'blue' | 'silver' | 'white' | 'black'`
**Default**: `'gold'`
**Description**: The color of the PayPal button.

### paypal.buttonShape

**Type**: `'pill' | 'rect'`
**Default**: `'pill'`
**Description**: The shape of the PayPal button.

### paypal.buttonSize

**Type**: `'small' | 'medium' | 'large' | 'responsive'`
**Default**: `'medium'`
**Description**: The size of the PayPal button.

### paypal.buttonHeight

**Type**: `number`
**Description**: Custom button height in pixels. Overrides the `buttonSize` setting.

### paypal.buttonLabel

**Type**: `'checkout' | 'credit' | 'pay' | 'buynow' | 'paypal' | 'installment'`
**Default**: `'checkout'`
**Description**: The label text displayed on the PayPal button.

### paypal.buttonTagline

**Type**: `boolean`
**Default**: `false`
**Description**: Whether to show the PayPal tagline below the button.

### paypal.paymentFlow

**Type**: `'DEFAULT' | 'PREFER_VAULT'`
**Default**: `'DEFAULT'`
**Description**: The payment flow to use. `'PREFER_VAULT'` prioritizes saving the payment method for future use.

**Example:**

```javascript
const checkout = document.querySelector('primer-checkout');

// Component property
checkout.setAttribute('client-token', 'your-token');

// SDK option
checkout.options = {
  paypal: {
    buttonColor: 'gold',
    buttonShape: 'pill',
    buttonSize: 'medium',
    buttonLabel: 'checkout',
    paymentFlow: 'DEFAULT',
  },
};
```

## Klarna Options

Configure Klarna payment behavior.

### klarna.paymentFlow

**Type**: `'DEFAULT' | 'PREFER_VAULT'`
**Default**: `'DEFAULT'`
**Description**: The payment flow to use. `'PREFER_VAULT'` prioritizes saving the payment method for future use.

### klarna.recurringPaymentDescription

**Type**: `string`
**Description**: Description for recurring payments. Required if offering recurring payment options.

### klarna.allowedPaymentCategories

**Type**: `Array<'pay_now' | 'pay_later' | 'pay_over_time'>`
**Description**: Allowed Klarna payment categories. Restricts which Klarna payment options are available to customers.

### klarna.buttonOptions

**Type**: `object`
**Description**: Configuration for the Klarna button.

**buttonOptions.text**
**Type**: `string`
**Description**: Custom text to display on the Klarna button.

**Example:**

```javascript
const checkout = document.querySelector('primer-checkout');

// Component property
checkout.setAttribute('client-token', 'your-token');

// SDK option
checkout.options = {
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

## 3D Secure Options

Configure 3D Secure authentication behavior.

### threeDsOptions.enabled

**Type**: `boolean`
**Default**: `true`
**Description**: Whether 3D Secure authentication is enabled for card payments.

### threeDsOptions.preferred

**Type**: `boolean`
**Default**: `false`
**Description**: Whether 3D Secure is preferred over other authentication methods when multiple options are available.

**Example:**

```javascript
const checkout = document.querySelector('primer-checkout');

// Component property
checkout.setAttribute('client-token', 'your-token');

// SDK option
checkout.options = {
  threeDsOptions: {
    enabled: true,
    preferred: false,
  },
};
```

## Vault Options

Configure payment method vaulting (saving for future use).

### vault.enabled

**Type**: `boolean`
**Required**: Yes (if using vault)
**Description**: Enable payment method vaulting to allow customers to save payment methods for future purchases.

### vault.showEmptyState

**Type**: `boolean`
**Default**: `false`
**Description**: Show an empty state message when no vaulted payment methods exist. Useful for providing user feedback in the UI.

**Example:**

```javascript
const checkout = document.querySelector('primer-checkout');

// Component property
checkout.setAttribute('client-token', 'your-token');

// SDK option
checkout.options = {
  vault: {
    enabled: true,
    showEmptyState: true,
  },
};
```

## Stripe Options

Configure Stripe-specific payment options.

### stripe.mandateData

**Type**: `object`
**Description**: Configuration for direct debit mandate text and merchant information.

**mandateData.fullMandateText**
**Type**: `string`
**Description**: Custom mandate text for direct debit payments. Displayed to customers during checkout.

**mandateData.merchantName**
**Type**: `string`
**Description**: Merchant name displayed in the mandate text.

### stripe.publishableKey

**Type**: `string`
**Description**: Stripe publishable key for direct Stripe integration.

**Example:**

```javascript
const checkout = document.querySelector('primer-checkout');

// Component property
checkout.setAttribute('client-token', 'your-token');

// SDK option
checkout.options = {
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
**Description**: Whether to show the order amount on the submit button. When `true`, displays formatted amount next to button text (e.g., "Pay $12.34").

### submitButton.useBuiltInButton

**Type**: `boolean`
**Default**: `true`
**Description**: Whether to render the built-in submit button component.

- When `true` (default): The component renders the standard Primer submit button.
- When `false`: No DOM elements are created, allowing external buttons to handle form submission by dispatching the `primer:card-submit` event.

**Example with Built-in Button:**

```javascript
const checkout = document.querySelector('primer-checkout');

// Component property
checkout.setAttribute('client-token', 'your-token');

// SDK option
checkout.options = {
  submitButton: {
    amountVisible: true,
    useBuiltInButton: true, // Default
  },
};
```

**Example with External Button:**

```javascript
const checkout = document.querySelector('primer-checkout');

// Component property
checkout.setAttribute('client-token', 'your-token');

// Hide built-in button and use external button
checkout.options = {
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
See the [Events Guide - primer:card-submit](/documentation/events-guide#primercard-submit) for more details on external button usage and event handling.
:::

## Complete Options Reference

Here's a comprehensive example showing all available options. Use this as a starting template and remove options you don't need.

```typescript
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

  // Card Options
  card: {
    cardholderName: {
      required: true, // Whether cardholder name is required
      visible: true, // Whether cardholder name field is visible
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

  // PayPal Options
  paypal: {
    buttonColor: 'gold',
    buttonShape: 'pill',
    buttonSize: 'medium',
    buttonLabel: 'checkout',
    paymentFlow: 'DEFAULT',
  },

  // Klarna Options
  klarna: {
    paymentFlow: 'DEFAULT',
    allowedPaymentCategories: ['pay_now', 'pay_later', 'pay_over_time'],
  },

  // 3D Secure Options
  threeDsOptions: {
    enabled: true,
    preferred: false,
  },

  // Vault Options
  vault: {
    enabled: true,
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

- **[Options Guide](/documentation/options-guide)** - Learn HOW to configure SDK options with usage patterns and best practices
- **[Events Guide](/documentation/events-guide)** - Handle checkout completion, failure, and other SDK events
- **[Getting Started](/documentation/getting-started)** - New to the Primer SDK? Start here
- **[Primer Checkout Component](/sdk-reference/primer-checkout-doc)** - Component-specific documentation and API reference
