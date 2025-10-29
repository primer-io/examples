---
name: primer-web-components
description: Build checkout and payment experiences using Primer's web components. Use this skill when implementing payment flows, checkout pages, card forms, or integrating Primer SDK into React, Next.js, or vanilla JavaScript applications. Covers component usage, React integration patterns, stable object references, event handling, SSR support, and CSS theming.
---

# Primer Web Components

## Overview

This skill provides comprehensive guidance for building checkout and payment experiences using Primer's web component library (`@primer-io/primer-js`). Primer components are framework-agnostic custom elements that work with React, Next.js, Vue, Svelte, or vanilla JavaScript.

Use this skill when:

- Implementing checkout pages or payment flows
- Integrating Primer payment methods (cards, Apple Pay, Google Pay, PayPal, etc.)
- Building custom card forms with validation
- Working with React and need to handle web component integration properly
- Customizing payment UI with themes and CSS custom properties

## Quick Start Guide

### Installation

```bash
npm install @primer-io/primer-js
```

### Basic HTML Setup

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Primer Checkout</title>
  </head>
  <body>
    <primer-checkout client-token="your-client-token"></primer-checkout>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
```

### Vanilla JavaScript Initialization

```typescript
import { loadPrimer } from '@primer-io/primer-js';
import { fetchClientToken } from './fetchClientToken';

(async function () {
  await loadPrimer();

  const checkout = document.querySelector('primer-checkout')!;
  const response = await fetchClientToken('order-id');

  if (response.success) {
    checkout.setAttribute('client-token', response.clientToken);
  }
})();
```

### React 19 Setup (Recommended)

**TypeScript Configuration:**

```typescript
import { CustomElements } from '@primer-io/primer-js/dist/jsx/index';

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements extends CustomElements {}
  }
}
```

**Component:**

```typescript
const SDK_OPTIONS = { locale: 'en-GB' };

function CheckoutPage({ clientToken }: { clientToken: string }) {
  return (
    <primer-checkout
      client-token={clientToken}
      options={SDK_OPTIONS}
    />
  );
}
```

## Component Architecture

### Core Component Hierarchy

```
primer-checkout (root)
├── primer-main (layout container)
│   ├── slot="payments" (payment method selection)
│   ├── slot="checkout-complete" (success state)
│   └── slot="checkout-failure" (error state)
├── primer-payment-method (individual payment type)
├── primer-payment-method-container (declarative filtering)
└── primer-card-form (card payment inputs)
    ├── primer-input-card-number
    ├── primer-input-card-expiry
    ├── primer-input-cvv
    ├── primer-input-card-holder-name
    └── primer-card-form-submit
```

### Component vs SDK Options

**Component Properties** (set via attributes or `setAttribute()`):

- `client-token` - Required JWT from backend
- `custom-styles` - JSON string of CSS custom properties
- `loader-disabled` - Boolean

**SDK Options** (set via JavaScript property):

```javascript
checkout.options = {
  locale: 'en-GB',
  paymentMethodOptions: {
    PAYMENT_CARD: {
      requireCVV: true,
      cardholderName: {
        required: true,
        visible: true,
      },
    },
    APPLE_PAY: {
      merchantName: 'Your Store',
      buttonType: 'buy',
      buttonStyle: 'black',
    },
  },
  vault: {
    enabled: true,
  },
};
```

**Important:** Never mix these up. Component properties use `setAttribute()`, SDK options use direct property assignment.

## React Integration Patterns

### Critical: Stable Object References

**THE MOST COMMON MISTAKE** with Primer in React is creating new object references on every render, causing component re-initialization and loss of user input.

#### ❌ WRONG - Causes Problems

```typescript
// WRONG: Inline object
function CheckoutPage() {
  return <primer-checkout options={{ locale: 'en-GB' }} />;
}

// WRONG: Object in component body
function CheckoutPage() {
  const options = { locale: 'en-GB' }; // New object every render!
  return <primer-checkout options={options} />;
}
```

#### ✅ CORRECT - Stable References

**Static Options (Module-level constant):**

```typescript
const SDK_OPTIONS = {
  locale: 'en-GB',
  paymentMethodOptions: {
    PAYMENT_CARD: {
      requireCVV: true,
      requireBillingAddress: true,
    },
  },
};

function CheckoutPage({ clientToken }: { clientToken: string }) {
  return (
    <primer-checkout
      client-token={clientToken}
      options={SDK_OPTIONS}
    />
  );
}
```

**Dynamic Options (useMemo):**

```typescript
import { useMemo } from 'react';

function CheckoutPage({ clientToken, userLocale, merchantName }: Props) {
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
    [userLocale, merchantName] // Only recreate when dependencies change
  );

  return (
    <primer-checkout
      client-token={clientToken}
      options={sdkOptions}
    />
  );
}
```

### React 18 vs React 19

**React 19** supports passing object props directly via JSX.

**React 18** requires imperative property assignment via refs:

```typescript
const SDK_OPTIONS = { locale: 'en-GB' };

function CheckoutPage({ clientToken }: { clientToken: string }) {
  const checkoutRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const checkout = checkoutRef.current;
    if (!checkout) return;

    checkout.options = SDK_OPTIONS;

    const handleReady = () => console.log('SDK ready');
    checkout.addEventListener('primer:ready', handleReady);

    return () => {
      checkout.removeEventListener('primer:ready', handleReady);
    };
  }, []);

  return (
    <primer-checkout
      ref={checkoutRef}
      client-token={clientToken}
    />
  );
}
```

For detailed React patterns, see `references/react-patterns.md`.

## Common Use Cases

### 1. Default Checkout (Simplest)

```html
<primer-checkout client-token="your-token"></primer-checkout>
```

This provides a complete checkout experience with all available payment methods.

### 2. Custom Payment Method Layout

```html
<primer-checkout client-token="your-token">
  <primer-main slot="main">
    <div slot="payments">
      <h2>Choose Payment Method</h2>

      <!-- Individual methods -->
      <primer-payment-method type="PAYMENT_CARD"></primer-payment-method>
      <primer-payment-method type="PAYPAL"></primer-payment-method>

      <!-- Error display -->
      <primer-error-message-container></primer-error-message-container>
    </div>

    <div slot="checkout-complete">
      <h2>Thank you for your order!</h2>
    </div>
  </primer-main>
</primer-checkout>
```

### 3. Declarative Payment Filtering

```html
<div slot="payments">
  <!-- Show only digital wallets -->
  <primer-payment-method-container include="APPLE_PAY,GOOGLE_PAY">
  </primer-payment-method-container>

  <!-- Show everything except cards -->
  <primer-payment-method-container exclude="PAYMENT_CARD">
  </primer-payment-method-container>
</div>
```

### 4. Custom Card Form

```html
<primer-card-form>
  <div slot="card-form-content">
    <primer-input-card-number></primer-input-card-number>

    <div style="display: flex; gap: 8px;">
      <primer-input-card-expiry></primer-input-card-expiry>
      <primer-input-cvv></primer-input-cvv>
    </div>

    <primer-input-card-holder-name></primer-input-card-holder-name>

    <!-- Custom field using base components -->
    <primer-input-wrapper>
      <primer-input-label slot="label">Billing Zip</primer-input-label>
      <primer-input slot="input" type="text" name="zip"></primer-input>
    </primer-input-wrapper>

    <primer-card-form-submit></primer-card-form-submit>
  </div>
</primer-card-form>
```

### 5. Event Handling

```javascript
const checkout = document.querySelector('primer-checkout');

// SDK Ready
checkout.addEventListener('primer:ready', () => {
  console.log('✅ SDK initialized');
});

// State Changes
checkout.addEventListener('primer:state-change', (event) => {
  const { isProcessing, isSuccessful, error } = event.detail;

  if (isProcessing) {
    // Show loading
  }
  if (isSuccessful) {
    // Navigate to success page
  }
  if (error) {
    // Handle error
  }
});

// Payment Methods Updated
checkout.addEventListener('primer-payment-methods-updated', (event) => {
  const methods = event.detail.toArray();
  console.log('Available methods:', methods);
});
```

## CSS Theming

### Custom Properties

Apply via CSS:

```css
:root {
  --primer-color-brand: #2f98ff;
  --primer-radius-base: 8px;
  --primer-typography-brand: 'Inter, sans-serif';
  --primer-space-base: 4px;
}

/* Or scope to specific checkout */
primer-checkout {
  --primer-color-brand: #4a6cf7;
}
```

Or via `custom-styles` attribute:

```html
<primer-checkout
  custom-styles='{"primerColorBrand":"#2f98ff","primerRadiusBase":"8px"}'
></primer-checkout>
```

### Dark Theme

```css
primer-checkout.primer-dark-theme {
  --primer-color-text-primary: var(--primer-color-gray-100);
  --primer-color-background-outlined-default: var(--primer-color-gray-800);
}
```

```javascript
// Apply theme
const checkout = document.querySelector('primer-checkout');
checkout.classList.add('primer-dark-theme');
```

## Server-Side Rendering (SSR)

### Next.js App Router

```typescript
'use client';

import { useEffect } from 'react';
import { loadPrimer } from '@primer-io/primer-js';

export default function CheckoutPage() {
  useEffect(() => {
    loadPrimer();
  }, []);

  return (
    <primer-checkout client-token="your-token">
      {/* Content */}
    </primer-checkout>
  );
}
```

### Preventing FOUC (Flash of Undefined Components)

```css
primer-checkout:has(:not(:defined)) {
  visibility: hidden;
}
```

## Context7 Integration

For always up-to-date documentation, use Context7 MCP server:

```typescript
// Resolve library
const library = await resolveLibraryId('primer checkout components');
// Returns: /primer-io/examples

// Fetch documentation
const docs = await getLibraryDocs('/primer-io/examples', {
  topic: 'card form integration',
  tokens: 10000,
});
```

This ensures access to the latest component APIs, patterns, and examples.

## Best Practices

1. **Always use stable object references** in React (module-level constants or `useMemo`)
2. **Set component properties via `setAttribute()`**, SDK options via property assignment
3. **Clean up event listeners** in React `useEffect` cleanup functions
4. **Use declarative containers** (`primer-payment-method-container`) instead of manual filtering
5. **Include error handling** with `primer-error-message-container`
6. **Load Primer in `useEffect`** for SSR frameworks
7. **Use TypeScript declarations** for proper JSX support
8. **Keep SDK options simple** - only configure what you need

## Resources

### references/component-reference.md

Comprehensive documentation of all Primer components:

- Core components (`primer-checkout`, `primer-main`, `primer-payment-method`)
- Card form components
- Base UI components (`primer-input`, `primer-button`, etc.)
- Events and their payloads
- SDK options structure
- CSS custom properties

### references/react-patterns.md

Deep dive into React integration:

- React 19 vs React 18 patterns
- Stable object reference patterns
- Event handling patterns
- SSR support (Next.js, SvelteKit)
- Custom hooks (`usePrimerDropIn`)
- Preventing flash of undefined components

## Common Troubleshooting

**Component re-initializing on every render?**
→ Check object reference stability. Use module-level constants or `useMemo`.

**TypeScript errors with JSX?**
→ Add TypeScript declarations from `@primer-io/primer-js/dist/jsx/index`.

**SSR errors?**
→ Load Primer in `useEffect` or use `'use client'` directive.

**Event not firing?**
→ Ensure component is mounted before adding listener. Use `useEffect` in React.

**Payment methods not showing?**
→ Check client token is valid and SDK is initialized (`primer:ready` event).

**Styling not applying?**
→ CSS custom properties pierce Shadow DOM. Use `--primer-*` variables.
