---
sidebar_position: 5
title: SDK Options Guide
description: Learn how to configure the Primer SDK with options
---

# SDK Options Guide

Primer Checkout SDK configuration uses an options object that controls everything from localization and API versions to payment method behavior and styling preferences. This guide explains how to properly pass options to the SDK, handle React-specific challenges, and implement configuration patterns that work reliably across different scenarios.

## Understanding SDK Options

SDK options are configuration settings that determine how the Primer Checkout SDK behaves and appears. These options control features like:

- **Localization**: Display language for UI text and error messages
- **API Versioning**: Which version of the Primer API to use
- **Payment Methods**: Supported payment types and their configuration
- **Vault Mode**: Settings for storing payment methods for future use
- **Theme Customization**: Styling and appearance preferences
- **Billing Requirements**: Which customer data fields to collect

:::info Options vs Events
Options configure **how the SDK behaves**, while events handle **what happens during the payment flow**. For handling checkout completion, failure, or pending states, use **events** - see the [Events Guide](/documentation/events-guide).
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

- **Core options**: `locale`, `sdkCore`, `merchantDomain`, `disabledPayments`
- **Payment method options**: `applePay`, `googlePay`, `paypal`, `klarna`
- **Card options**: `card.cardholderName.required`, `card.cardholderName.visible`
- **Other options**: `vault`, `stripe`, `threeDsOptions`, `submitButton`

**How to set**: Assign a JavaScript object to the `options` property.

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
  sdkCore: true,
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

**React/JSX usage:**

```jsx
<primer-checkout client-token={token}></primer-checkout>
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
  sdkCore: true,
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

// ❌ WRONG: Don't use setAttribute() for options
checkout.setAttribute('options', JSON.stringify({ locale: 'en-GB' })); // Won't work
```

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
    sdkCore: true,
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

## React/JSX Patterns

### Component Properties in React

React JSX treats web component attributes correctly, so you can pass component properties as JSX attributes:

```tsx
import { useRef, useEffect } from 'react';

function CheckoutPage({ clientToken }: { clientToken: string }) {
  const checkoutRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const checkout = checkoutRef.current;
    if (!checkout) return;

    // Set SDK options as object property
    checkout.options = {
      locale: 'en-GB',
      sdkCore: true,
    };
  }, []);

  return (
    <primer-checkout
      ref={checkoutRef}
      client-token={clientToken}
      loader-disabled={false}
    >
      {/* Component content */}
    </primer-checkout>
  );
}
```

### SDK Options in React

The critical issue in React is with the **`options` property**, not with component attributes.

:::danger React/JSX Users: Critical SDK Options Pattern

**If you're using React, Next.js, or any JSX-based framework**, you MUST follow specific patterns when passing SDK options to avoid re-render issues.

**The Problem**: React creates new object references on every render. Passing inline objects to `<primer-checkout>` can trigger unnecessary re-renders and component re-initialization.

**❌ NEVER do this in React**:

```javascript
// Inline object creates new reference every render!
<primer-checkout client-token={token} options={{ locale: 'en-GB' }} />
```

**✅ Always do this instead**:

```javascript
// Define options OUTSIDE component or use useMemo
const SDK_OPTIONS = {
  locale: 'en-GB',
};

function MyComponent() {
  return <primer-checkout options={SDK_OPTIONS} />;
}
```

**For complete React integration patterns**, including `useMemo` usage for dynamic options, see the [Server-Side Rendering Guide - Next.js section](/documentation/server-side-rendering-guide#nextjs).
:::

### Why React Object References Matter

React re-renders components when props change. Every time a component re-renders, inline objects create new references:

```javascript
// ❌ WRONG: New object on every render
function CheckoutPage() {
  // This creates a NEW object every time CheckoutPage renders
  const options = { locale: 'en-GB' };

  return <primer-checkout options={options} />;
}

// ✅ CORRECT: Stable reference
const SDK_OPTIONS = { locale: 'en-GB' };

function CheckoutPage() {
  // Same object reference every render
  return <primer-checkout options={SDK_OPTIONS} />;
}
```

### React Pattern 1: Static Options (Recommended)

For options that don't change during the component lifecycle, define them outside the component:

```typescript
import { useEffect, useRef } from 'react';

// Define options outside component - created once
const SDK_OPTIONS = {
  locale: 'en-GB',
  paymentMethodOptions: {
    PAYMENT_CARD: {
      requireCVV: true,
      requireBillingAddress: true,
    },
  },
};

function CheckoutPage() {
  const checkoutRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const checkout = checkoutRef.current;
    if (!checkout) return;

    // Set options as property reference
    checkout.options = SDK_OPTIONS;

    // Set up event listeners
    const handleReady = (event: CustomEvent) => {
      console.log('✅ SDK ready');
    };

    checkout.addEventListener('primer:ready', handleReady);

    // Cleanup
    return () => {
      checkout.removeEventListener('primer:ready', handleReady);
    };
  }, []); // Empty deps - runs once

  return (
    <primer-checkout
      ref={checkoutRef}
      client-token="your-client-token"
    >
      {/* Component content */}
    </primer-checkout>
  );
}
```

### React Pattern 2: Dynamic Options with useMemo

For options that depend on props or state, use `useMemo` to maintain stable references:

```typescript
import { useEffect, useMemo, useRef } from 'react';

interface CheckoutPageProps {
  userLocale: string;
  merchantName: string;
}

function CheckoutPage({ userLocale, merchantName }: CheckoutPageProps) {
  const checkoutRef = useRef<HTMLElement>(null);

  // useMemo creates new object only when dependencies change
  const sdkOptions = useMemo(
    () => ({
      locale: userLocale,
      paymentMethodOptions: {
        APPLE_PAY: {
          merchantName: merchantName,
          merchantCountryCode: 'GB',
        },
      },
    }),
    [userLocale, merchantName], // Only recreate if these change
  );

  useEffect(() => {
    const checkout = checkoutRef.current;
    if (!checkout) return;

    checkout.options = sdkOptions;

    const handleReady = (event: CustomEvent) => {
      console.log('✅ SDK ready with locale:', userLocale);
    };

    checkout.addEventListener('primer:ready', handleReady);

    return () => {
      checkout.removeEventListener('primer:ready', handleReady);
    };
  }, [sdkOptions]); // Re-run when sdkOptions reference changes

  return (
    <primer-checkout
      ref={checkoutRef}
      client-token="your-client-token"
    >
      {/* Component content */}
    </primer-checkout>
  );
}
```

### React Pattern 3: Avoiding Re-initialization

**Critical**: If the SDK re-initializes unnecessarily, check that your options object reference is stable:

```typescript
import { useEffect, useMemo, useRef } from 'react';

function CheckoutPage() {
  const checkoutRef = useRef<HTMLElement>(null);

  // ❌ WRONG: Creates new object every render
  const badOptions = {
    locale: 'en-GB',
  };

  // ✅ CORRECT: Stable reference with useMemo
  const goodOptions = useMemo(
    () => ({
      locale: 'en-GB',
    }),
    [], // Empty deps = created once
  );

  useEffect(() => {
    const checkout = checkoutRef.current;
    if (!checkout) return;

    checkout.options = goodOptions; // Stable reference

    // This will only run once because goodOptions never changes
  }, [goodOptions]);

  return <primer-checkout ref={checkoutRef} />;
}
```

### Common React Pitfalls and Solutions

#### Pitfall 1: Inline Object in JSX

```typescript
// ❌ WRONG: Inline object
<primer-checkout options={{ locale: 'en-GB' }} />

// ✅ CORRECT: Use constant or useMemo
const options = useMemo(() => ({ locale: 'en-GB' }), []);
<primer-checkout options={options} />
```

#### Pitfall 2: Object Created in Component Body

```typescript
// ❌ WRONG: New object every render
function CheckoutPage() {
  const options = { locale: 'en-GB' };
  return <primer-checkout options={options} />;
}

// ✅ CORRECT: Define outside or use useMemo
const OPTIONS = { locale: 'en-GB' };
function CheckoutPage() {
  return <primer-checkout options={OPTIONS} />;
}
```

#### Pitfall 3: Missing useMemo Dependencies

```typescript
// ❌ WRONG: Missing dependency
const options = useMemo(
  () => ({
    locale: userLocale, // Uses userLocale but not in deps
  }),
  [],
); // Missing userLocale in dependency array

// ✅ CORRECT: Include all dependencies
const options = useMemo(
  () => ({
    locale: userLocale,
  }),
  [userLocale],
); // userLocale in deps
```

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
    sdkCore: true, // Use SDK Core (default)
  };
});
```

**Key points:**

- `client-token` is a component property (attribute)
- `locale` and `sdkCore` are SDK options (in options object)
- These two configuration types work together

### Custom Payment Method Configuration

Enabling Apple Pay with billing address requirements:

```javascript
document.addEventListener('DOMContentLoaded', () => {
  const checkout = document.querySelector('primer-checkout');

  // 1. Set component property
  checkout.setAttribute('client-token', 'your-client-token');

  // 2. Set SDK options with payment method configuration
  checkout.options = {
    locale: 'en-US',
    sdkCore: true,
    applePay: {
      merchantName: 'Your Store Name',
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
});
```

**Key points:**

- `client-token` is a component property
- `applePay` and `card` are SDK options
- Configure multiple payment methods in the options object
- All payment configuration happens in `options`, not attributes

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
    sdkCore: true,
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
    sdkCore: true,
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
- `locale`, `sdkCore`, `merchantDomain`, and payment methods are SDK options
- Component properties handle theming; SDK options handle functionality
- Clear separation between visual (properties) and behavioral (options) configuration

## Best Practices

### 1. Define Options Outside Components to Prevent Re-renders

Create options objects once and reuse them to avoid unnecessary re-renders:

:::tip Performance Optimization
Define static options outside your component or function scope. This prevents creating new object references on every render/execution.
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
  checkout.options = { locale: 'en-GB' }; // New object
}
```

### 2. Use useMemo in React for Dynamic Options

When options depend on props or state, use `useMemo` to maintain stable references:

:::tip React Performance
Always use `useMemo` when options depend on props, state, or other dynamic values. This prevents unnecessary SDK re-initialization.
:::

```typescript
// ✅ GOOD: Stable reference with proper dependencies
const options = useMemo(
  () => ({
    locale: userLocale,
    paymentMethodOptions: {
      APPLE_PAY: { merchantName: storeName },
    },
  }),
  [userLocale, storeName], // Only recreate when these change
);

// ❌ AVOID: New object every render
const options = {
  locale: userLocale,
  paymentMethodOptions: {
    APPLE_PAY: { merchantName: storeName },
  },
};
```

### 3. Use TypeScript Interfaces for Type Safety

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

### 4. Test Options Configuration Separately

Create isolated tests for your options configuration:

```typescript
describe('SDK Options Configuration', () => {
  it('should create valid options object', () => {
    const options = {
      locale: 'en-GB',
    };

    expect(options.locale).toBe('en-GB');
  });

  it('should maintain stable reference with useMemo', () => {
    const { result, rerender } = renderHook(() =>
      useMemo(() => ({ locale: 'en-GB' }), []),
    );

    const firstRef = result.current;
    rerender();
    const secondRef = result.current;

    expect(firstRef).toBe(secondRef); // Same reference
  });
});
```

### 5. Debug Configuration Issues

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
checkout.options = { locale: 'en-GB', sdkCore: true };
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

### 6. Distinguish Between Component Properties and SDK Options

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
- `sdkCore` - Engine selection
- Payment method configuration
- Feature settings

```javascript
// ✅ CORRECT: Clear separation
const checkout = document.querySelector('primer-checkout');

// Component properties
checkout.setAttribute('client-token', 'your-token');
checkout.setAttribute('loader-disabled', 'false');

// SDK options
checkout.options = {
  locale: 'en-GB',
  sdkCore: true,
  applePay: { buttonType: 'buy' },
};

// ❌ WRONG: Mixing them up
checkout.setAttribute('locale', 'en-GB'); // Won't work - locale is an SDK option
checkout.options = {
  clientToken: 'your-token', // Wrong - this is a component property
};
```

### 7. Keep Options Simple and Focused

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
- **[Events Guide](/documentation/events-guide)** - Comprehensive guide to handling SDK events (for checkout completion/failure handling)
- **[Getting Started](/documentation/getting-started)** - New to the Primer SDK? Start here
- **[Primer Checkout Component](/sdk-reference/primer-checkout-doc)** - Component-specific documentation and API reference
