---
title: SDK Options Guide
description: Learn how to configure the Primer SDK with options
---

# SDK Options Guide

Primer Checkout SDK configuration uses an options object that controls everything from localization and API versions to payment method behavior and styling preferences. This guide explains how to properly pass options to the SDK and implement configuration patterns that work reliably across different scenarios and frameworks.

## Understanding SDK Options

SDK options are configuration settings that determine how the Primer Checkout SDK behaves and appears. These options control features like:

- **Localization**: Display language for UI text and error messages
- **API Versioning**: Which version of the Primer API to use
- **Payment Methods**: Supported payment types and their configuration
- **Vault Mode**: Settings for storing payment methods for future use
- **Theme Customization**: Styling and appearance preferences
- **Billing Requirements**: Which customer data fields to collect

:::info Options vs Events
Options configure **how the SDK behaves**, while events handle **what happens during the payment flow**. For handling checkout completion, failure, or pending states, use **events** - see the [Events Guide](/guides/events-guide).
:::

### What This Guide Covers

This guide focuses on the mechanics of passing options to the SDK and configuration patterns. For a complete list of all available options and their values, see the [SDK Options Reference](/sdk-reference/sdk-options-reference).

## Understanding Configuration Types

The Primer Checkout SDK has TWO distinct types of configuration that work together but must be handled differently:

### 1. Component Properties (HTML Attributes)

These are web component attributes that configure the component itself:

- **`client-token`** (required) - Your Primer API client token
- **`custom-styles`** - Custom CSS theme configuration as a JSON string
- **`loader-disabled`** - Boolean to disable the CSS loader
- **`options`** - The SDK configuration object (see below)

**How to set**: Use `setAttribute()` for string/boolean attributes. Set `options` as a direct property.

### 2. SDK Options (Options Object)

These are SDK configuration settings passed via the `options` property:

- **Core options**: `locale`, `sdkCore`, `merchantDomain`, `disabledPayments`, `enabledPaymentMethods`
- **Payment method options**: `applePay`, `googlePay`, `paypal`, `klarna`
- **Card options**: `card.cardholderName.required`, `card.cardholderName.visible`, `card.cardholderName.defaultValue`
- **Other options**: `vault`, `stripe`, `submitButton`

**How to set**: Assign a JavaScript object to the `options` property.

:::note SDK Core is Enabled by Default
The `sdkCore` option is enabled by default (`sdkCore: true`). You only need to explicitly set this option if you want to disable SDK Core features by setting it to `false`. Most developers should omit this option and use the default value.
:::

:::warning Critical Distinction
Component properties (like `client-token`) are set using `setAttribute()`. SDK options (like `locale`, `sdkCore`) are set inside the `options` object. Do not confuse these two!
:::

**Complete Example:**

```javascript
const checkout = document.querySelector('primer-checkout');

// 1. Set component properties using setAttribute()
checkout.setAttribute('client-token', 'your-token');
checkout.setAttribute(
  'custom-styles',
  JSON.stringify({ primerColorBrand: '#4a6cf7' }),
);
checkout.setAttribute('loader-disabled', 'false');

// 2. Set SDK options as an object property
checkout.options = {
  locale: 'en-GB',
  merchantDomain: 'example.com',
  applePay: {
    buttonType: 'buy',
    buttonStyle: 'black',
  },
};
```

## Configuring the SDK

### Component Properties (HTML Attributes)

Component properties are web component attributes that must be set using `setAttribute()` when working with JavaScript. These properties configure the checkout component container itself.

#### Required: client-token

The `client-token` attribute is required and provides authentication for the Primer SDK.

```javascript
const checkout = document.querySelector('primer-checkout');

// ✅ CORRECT: Use setAttribute()
checkout.setAttribute('client-token', 'your-client-token-from-primer-api');

// ❌ WRONG: Direct property assignment won't work
checkout.clientToken = 'your-token'; // Ignored by component
```

**HTML usage:**

```html
<primer-checkout client-token="your-client-token"></primer-checkout>
```

#### Optional: custom-styles

The `custom-styles` attribute accepts a JSON string containing CSS custom properties for theming.

```javascript
const checkout = document.querySelector('primer-checkout');

const customStyles = {
  primerColorBrand: '#4a6cf7',
  primerTypographyBrand: 'Inter, sans-serif',
};

// ✅ CORRECT: Use setAttribute() with JSON string
checkout.setAttribute('custom-styles', JSON.stringify(customStyles));

// ❌ WRONG: Direct property assignment won't work
checkout.customStyles = customStyles; // Ignored
```

#### Optional: loader-disabled

The `loader-disabled` attribute disables the default CSS loading spinner.

```javascript
// ✅ CORRECT
checkout.setAttribute('loader-disabled', 'true');

// ❌ WRONG
checkout.loaderDisabled = true; // Ignored
```

:::warning Why setAttribute() is Required
Component properties use Lit's attribute system which monitors DOM attribute changes. Direct property assignment bypasses this system, causing values to be ignored. The `options` property is the ONLY exception to this rule.
:::

### SDK Options (Options Object)

SDK options configure the Primer SDK behavior and are passed as a JavaScript object to the `options` property. Unlike component attributes, you assign the `options` property directly - **do NOT use `setAttribute()`**.

```javascript
const checkout = document.querySelector('primer-checkout');

// ✅ CORRECT: Assign options directly as an object
checkout.options = {
  locale: 'en-GB',
  merchantDomain: 'merchant.example.com',
  applePay: {
    buttonType: 'buy',
    buttonStyle: 'black',
  },
  card: {
    cardholderName: {
      required: true,
    },
  },
};

// ⚠️ NOT RECOMMENDED: setAttribute with JSON works but isn't ideal
checkout.setAttribute('options', JSON.stringify({ locale: 'en-GB' }));
// ✅ Technically works but has performance overhead
// ✅ Requires JSON parsing by the component
// ❌ Use property assignment instead for better performance
//
// Prefer this:
checkout.options = { locale: 'en-GB' }; // Direct property assignment
```

> **Note**: While `setAttribute()` with JSON strings works, it's not the recommended approach.
> Use it only in edge cases where direct property assignment isn't possible (e.g., certain
> build tool limitations or framework constraints). The SDK will parse the JSON string, but
> direct property assignment is more performant and type-safe.

For a complete list of all available SDK options, see the [SDK Options Reference](/sdk-reference/sdk-options-reference).

### Complete Working Example

Here's a complete example showing both component properties and SDK options:

```javascript
document.addEventListener('DOMContentLoaded', () => {
  const checkout = document.querySelector('primer-checkout');

  // 1. Set component properties (HTML attributes) using setAttribute()
  checkout.setAttribute('client-token', 'eyJ0eXAiOiJKV1QiLCJhbGc...');
  checkout.setAttribute(
    'custom-styles',
    JSON.stringify({
      primerColorBrand: '#4a6cf7',
      primerTypographyBrand: 'Inter, sans-serif',
    }),
  );

  // 2. Set SDK options as an object property
  checkout.options = {
    locale: 'en-GB',
    applePay: {
      buttonType: 'buy',
      buttonStyle: 'black',
    },
    card: {
      cardholderName: {
        required: true,
        visible: true,
      },
    },
  };

  // 3. Set up event listeners
  checkout.addEventListener('primer:ready', (event) => {
    console.log('✅ SDK initialized');
  });
});
```

:::info React Developers
Using React? See the **[React Integration Guide](./react-guide.md)** for React-specific patterns including:

- TypeScript/JSX types setup (critical!)
- React 18 vs React 19 differences
- Stable references with useMemo
- Common React pitfalls and solutions
  :::

## Configuration Patterns by Scenario

These patterns demonstrate common configuration scenarios with complete, working examples.

### Basic Checkout Setup

Simple card payment configuration with locale customization:

```javascript
document.addEventListener('DOMContentLoaded', () => {
  const checkout = document.querySelector('primer-checkout');

  // 1. Set required component property
  checkout.setAttribute('client-token', 'your-client-token');

  // 2. Set SDK options
  checkout.options = {
    locale: 'en-GB', // British English
  };
});
```

**Key points:**

- `client-token` is a component property (attribute)
- `locale` is an SDK option (in options object)
- These two configuration types work together
- SDK Core is enabled by default - no need to specify it

### Custom Payment Method Configuration

Enabling specific payment methods with configuration:

```javascript
import { PaymentMethodType } from '@primer-io/primer-js';

document.addEventListener('DOMContentLoaded', () => {
  const checkout = document.querySelector('primer-checkout');

  // 1. Set component property
  checkout.setAttribute('client-token', 'your-client-token');

  // 2. Set SDK options with payment method configuration
  checkout.options = {
    locale: 'en-US',
    // Specify which payment methods to enable
    enabledPaymentMethods: [
      PaymentMethodType.PAYMENT_CARD,
      PaymentMethodType.ADYEN_BLIK,
    ],
    card: {
      cardholderName: {
        required: true,
        visible: true,
      },
    },
  };
});
```

**Key points:**

- `client-token` is a component property
- `enabledPaymentMethods` controls which payment methods are displayed
- `card` configuration applies to the card payment method
- Configure multiple payment methods in the options object
- All payment configuration happens in `options`, not attributes

### Card Form Pre-filling Configuration

:::info New in v0.7.3
Pre-fill the cardholder name field with a default value using synchronous initialization. The value appears immediately when the checkout loads with no race conditions or blank field flash.
:::

Pre-filling the cardholder name field from user profiles or customer data:

```javascript
document.addEventListener('DOMContentLoaded', () => {
  const checkout = document.querySelector('primer-checkout');

  // 1. Set component property
  checkout.setAttribute('client-token', 'your-client-token');

  // 2. Set SDK options with cardholder name pre-filling
  checkout.options = {
    locale: 'en-US',
    card: {
      cardholderName: {
        required: true,
        visible: true,
        defaultValue: 'John Doe', // Pre-fill cardholder name
      },
    },
  };
});
```

**Key points:**

- `defaultValue` pre-fills the cardholder name during initialization
- Value is applied synchronously (visible immediately, no race conditions)
- User can edit or clear the pre-filled value
- For runtime updates after initialization, use `primerJS.setCardholderName()` (see [v0.7.1 changelog](/changelog#v071---programmatic-cardholder-name-06-nov-2025))

**Common use cases:**

```javascript
// Pre-fill from user profile
const user = getUserProfile();
checkout.options = {
  card: {
    cardholderName: {
      visible: true,
      defaultValue: user.fullName, // e.g., "Jane Smith"
    },
  },
};

// Pre-fill from checkout form data
const checkoutData = getCheckoutData();
checkout.options = {
  card: {
    cardholderName: {
      required: true,
      defaultValue: `${checkoutData.firstName} ${checkoutData.lastName}`,
    },
  },
};
```

### Vault Mode Configuration

Enabling payment method vaulting with custom empty state messaging:

```javascript
document.addEventListener('DOMContentLoaded', () => {
  const checkout = document.querySelector('primer-checkout');

  // 1. Set component properties
  checkout.setAttribute('client-token', 'your-client-token');

  // 2. Set SDK options with vault configuration
  checkout.options = {
    locale: 'en-GB',
    vault: {
      vaultedPaymentMethodsHeading: 'Saved Payment Methods',
      addNewPaymentMethodButtonText: 'Add New Payment Method',
    },
    card: {
      cardholderName: {
        required: false,
        visible: true,
      },
    },
  };
});
```

**Key points:**

- `client-token` is a component property
- Vault settings are SDK options (in `options.vault`)
- All vault configuration happens in the options object
- Customize vault UI text through SDK options

### Headless Vault Configuration

:::info New in v0.9.0
Build completely custom vault UIs while retaining full vault functionality including payment method storage, selection, and CVV recapture.
:::

Headless vault mode hides the default vault UI components and provides programmatic control through PrimerJS methods. This enables custom vault interfaces that match your brand and workflow requirements.

```javascript
document.addEventListener('DOMContentLoaded', () => {
  const checkout = document.querySelector('primer-checkout');

  // 1. Set component properties
  checkout.setAttribute('client-token', 'your-client-token');

  // 2. Configure headless vault mode
  checkout.options = {
    vault: {
      enabled: true,
      headless: true, // Hide default vault UI
      showEmptyState: false, // Default in v0.9.0
    },
  };

  // 3. Set up vault event handlers
  checkout.addEventListener('primer:ready', (event) => {
    const primerJS = event.detail;

    // Handle vaulted payment methods
    primerJS.onVaultedMethodsUpdate = async ({
      vaultedPayments,
      cvvRecapture,
    }) => {
      // Build custom vault UI
      const methods = vaultedPayments.toArray();
      buildCustomVaultUI(methods);

      // Add CVV input if required
      if (cvvRecapture) {
        // Get the selected payment method
        const selectedMethod = methods.find((m) => m.isSelected);

        if (selectedMethod) {
          const cvvInput = await primerJS.createCvvInput({
            cardNetwork: selectedMethod.paymentInstrumentData.network,
            container: '#cvv-section',
            placeholder: 'CVV',
          });
          if (cvvInput) {
            document.getElementById('cvv-section').appendChild(cvvInput);
          }
        }
      }
    };

    // Handle payment button click
    document
      .getElementById('pay-with-saved-card')
      .addEventListener('click', async () => {
        try {
          await primerJS.startVaultPayment();
        } catch (error) {
          console.error('Payment failed:', error);
        }
      });

    // Handle payment success
    primerJS.onPaymentSuccess = (data) => {
      console.log('Payment successful!', data.payment.id);
      window.location.href = '/confirmation';
    };

    // Handle payment failure
    primerJS.onPaymentFailure = (data) => {
      console.error('Payment failed:', data.error.message);
      showErrorMessage(data.error.message);
    };
  });
});

// Helper function to build custom vault UI
function buildCustomVaultUI(vaultedMethods) {
  const container = document.getElementById('custom-vault-container');
  container.innerHTML = '';

  if (vaultedMethods.length === 0) {
    container.innerHTML = '<p>No saved payment methods</p>';
    return;
  }

  vaultedMethods.forEach((method, index) => {
    const methodElement = document.createElement('div');
    methodElement.className = 'saved-payment-method';
    methodElement.innerHTML = `
      <input
        type="radio"
        name="saved-method"
        id="method-${index}"
        value="${method.id}"
        ${index === 0 ? 'checked' : ''}
      >
      <label for="method-${index}">
        <span class="card-network">${method.paymentInstrumentType}</span>
        <span class="card-last4">•••• ${method.paymentInstrumentData?.last4Digits || '****'}</span>
      </label>
    `;
    container.appendChild(methodElement);
  });
}
```

**Key points:**

- `vault.headless: true` hides all default vault UI components
- `onVaultedMethodsUpdate` provides vaulted payment methods data and `cvvRecapture` flag
- `createCvvInput()` creates a styled CVV input component when needed
- `startVaultPayment()` initiates payment processing with the selected method
- Standard payment callbacks (`onPaymentSuccess`, `onPaymentFailure`) work normally
- Complete control over UI layout, styling, and user experience

**When to use headless vault:**

- Custom vault UI design that matches your brand
- Integration with existing checkout workflows
- Advanced vault management interfaces
- Non-standard vault UX patterns

**Documentation:**

- [vault.headless option](/sdk-reference/sdk-options-reference#vaultheadless) - API reference
- [createCvvInput()](/sdk-reference/events-callbacks#createcvvinput) - Method documentation
- [startVaultPayment()](/sdk-reference/events-callbacks#startvaultpayment) - Method documentation
- [onVaultedMethodsUpdate](/sdk-reference/events-callbacks#onvaultedmethodsupdate) - Callback documentation

### Advanced Customization

Combining multiple configuration options for a complete checkout experience:

```javascript
document.addEventListener('DOMContentLoaded', () => {
  const checkout = document.querySelector('primer-checkout');

  // 1. Set component properties
  checkout.setAttribute('client-token', 'your-client-token');
  checkout.setAttribute(
    'custom-styles',
    JSON.stringify({
      primerColorBrand: '#4a6cf7',
      primerTypographyBrand: 'Inter, sans-serif',
    }),
  );

  // 2. Set SDK options
  checkout.options = {
    locale: 'de-DE', // German locale
    merchantDomain: 'shop.example.de',
    applePay: {
      merchantName: 'Mein Geschäft',
      buttonType: 'buy',
      buttonStyle: 'black',
    },
    googlePay: {
      merchantName: 'Mein Geschäft',
      buttonType: 'buy',
      buttonStyle: 'black',
    },
    card: {
      cardholderName: {
        required: true,
        visible: true,
      },
    },
  };

  // 3. Set up event listeners for complete flow
  checkout.addEventListener('primer:ready', (event) => {
    console.log('✅ SDK bereit');
  });
});
```

**Key points:**

- `client-token` and `custom-styles` are component properties (attributes)
- `locale`, `merchantDomain`, and payment methods are SDK options
- Component properties handle theming; SDK options handle functionality
- Clear separation between visual (properties) and behavioral (options) configuration

## Best Practices

### 1. Define Options Outside Functions to Prevent Re-creation

Create options objects once and reuse them to avoid unnecessary re-initialization:

:::tip Performance Optimization
Define static options outside your function scope. As of v0.10.0, the SDK uses deep comparison to detect actual changes, but stable object references reduce comparison overhead and improve performance.
:::

```javascript
// ✅ GOOD: Created once
const SDK_OPTIONS = {
  locale: 'en-GB',
};

function initCheckout() {
  const checkout = document.querySelector('primer-checkout');
  checkout.options = SDK_OPTIONS; // Same reference every time
}

// ❌ AVOID: Created every time function runs
function initCheckout() {
  const checkout = document.querySelector('primer-checkout');
  checkout.options = { locale: 'en-GB' }; // New object every execution
}
```

:::info v0.10.0+ Deep Comparison
The SDK performs deep comparison to detect actual changes in the `options` object. Using stable references (the ✅ GOOD pattern) minimizes comparison overhead and remains the recommended best practice for optimal performance.
:::

### 2. Use TypeScript Interfaces for Type Safety

Define TypeScript interfaces for your options objects to catch errors at compile time:

```typescript
interface PrimerSDKOptions {
  locale: string;
  paymentMethodOptions?: {
    PAYMENT_CARD?: {
      requireCVV?: boolean;
      requireBillingAddress?: boolean;
    };
    APPLE_PAY?: {
      merchantName?: string;
      merchantCountryCode?: string;
    };
  };
}

const options: PrimerSDKOptions = {
  locale: 'en-GB',
  paymentMethodOptions: {
    PAYMENT_CARD: {
      requireCVV: true,
      requireBillingAddress: true,
    },
  },
};
```

### 3. Test Options Configuration Separately

Create isolated tests for your options configuration:

```typescript
describe('SDK Options Configuration', () => {
  it('should create valid options object', () => {
    const options = {
      locale: 'en-GB',
    };

    expect(options.locale).toBe('en-GB');
  });

  it('should maintain stable reference', () => {
    const options = { locale: 'en-GB' };
    const checkout = document.querySelector('primer-checkout');
    checkout.options = options;

    expect(checkout.options).toBe(options); // Same reference
  });
});
```

### 4. Debug Configuration Issues

Common debugging approaches for options-related issues:

:::tip Debugging SDK Options
When options aren't working as expected, check these common issues first:
:::

**Check object reference stability:**

```javascript
const options = { locale: 'en-GB' };
console.log('Options reference:', options);

// Later in code
checkout.options = options;
console.log('Applied options:', checkout.options);
console.log('References match:', checkout.options === options);
```

**Verify component properties vs SDK options:**

```javascript
// Component properties use setAttribute()
const checkout = document.querySelector('primer-checkout');

checkout.setAttribute('client-token', 'new-token');
console.log('Token attribute:', checkout.getAttribute('client-token'));

// SDK options use direct property assignment
checkout.options = { locale: 'en-GB' };
console.log('Options object:', checkout.options);
```

**Monitor SDK initialization:**

```javascript
checkout.addEventListener('primer:ready', (event) => {
  const primer = event.detail;
  console.log('✅ SDK initialized');
  console.log('Applied locale:', checkout.options?.locale);
  console.log('Active payment methods:', primer.getPaymentMethods?.());
});
```

### 5. Distinguish Between Component Properties and SDK Options

Understand the difference between component properties and SDK options:

:::warning Properties vs Options
**Component Properties** are HTML attributes that configure the component container. **SDK Options** are configuration settings for the SDK itself. They serve different purposes and must be set differently!
:::

**Component Properties** (use `setAttribute()`):

- `client-token` - API authentication
- `custom-styles` - Visual theming
- `loader-disabled` - Loader behavior

**SDK Options** (use `options` object):

- `locale` - UI language
- Payment method configuration
- Feature settings
- Merchant domain and API settings

```javascript
// ✅ CORRECT: Clear separation
const checkout = document.querySelector('primer-checkout');

// Component properties
checkout.setAttribute('client-token', 'your-token');
checkout.setAttribute('loader-disabled', 'false');

// SDK options
checkout.options = {
  locale: 'en-GB',
  applePay: { buttonType: 'buy' },
};

// ❌ WRONG: Mixing them up
checkout.setAttribute('locale', 'en-GB'); // Won't work - locale is an SDK option
checkout.options = {
  clientToken: 'your-token', // Wrong - this is a component property
};
```

### 6. Keep Options Simple and Focused

Only configure what you need:

```javascript
// ✅ GOOD: Simple, focused configuration
checkout.options = {
  locale: 'en-GB',
};

// ❌ AVOID: Over-configuration with unused options
checkout.options = {
  locale: 'en-GB',
  paymentMethodOptions: {
    PAYMENT_CARD: {
      requireCVV: true,
      requireBillingAddress: false,
      // ... 20 more unused options
    },
    APPLE_PAY: {
      // ... configured but not used
    },
  },
};
```

## See Also

- **[SDK Options Reference](/sdk-reference/sdk-options-reference)** - Complete list of all available SDK options with detailed specifications
- **[Events Guide](/guides/events-guide)** - Comprehensive guide to handling SDK events (for checkout completion/failure handling)
- **[Getting Started](/guides/getting-started)** - New to the Primer SDK? Start here
- **[Primer Checkout Component](/sdk-reference/Components/primer-checkout-doc)** - Component-specific documentation and API reference
