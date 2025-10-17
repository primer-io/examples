---
sidebar_position: 1
title: Getting Started
description: Learn how to install and set up Primer Checkout in your web application
---

# Getting Started with Primer Checkout

Welcome to Primer Checkout! This guide will help you integrate our payment solution into your website or web application.

## Environment Requirements

Before diving into the implementation, ensure your environment meets these requirements:

| Requirement       | Details                                         |
| ----------------- | ----------------------------------------------- |
| **Node.js**       | Current LTS version recommended                 |
| **Browsers**      | Modern browsers (Chrome, Firefox, Safari, Edge) |
| **Not Supported** | Internet Explorer 11, Classic Edge (legacy)     |

:::note Why some browsers aren't supported
Legacy browsers like Internet Explorer 11 aren't officially supported due to their non-standard DOM behavior and lack of support for modern Web Component features.
:::

## Before You Start

Before integrating Primer Checkout, ensure you have completed these prerequisites:

1. You're [ready to process payments](https://primer.io/docs/payments/process-payments)
2. [Universal Checkout is properly configured](https://primer.io/docs/payments/universal-checkout/configure-universal-checkout-without-code) in your Primer Dashboard

### Create a Client Session

A **client session** is required to initialize the checkout experience. This session contains your order data and provides you with a **client token** needed to initialize the components.

#### Steps to create a client session:

<details>
<summary><strong>1. Generate an API key</strong></summary>

- Visit the [Primer Dashboard developer page](https://sandbox-dashboard.primer.io/developers/apiKeys)
- Create an API key with these scopes: - `client_tokens:write` - `transactions:authorize`
</details>

<details>
<summary><strong>2. Make a client session request</strong></summary>

- Make a POST request to the [Client Session API](https://primer.io/docs/api/api-reference/client-session-api/create-client-side-token)
- Include at minimum: - `orderId`: Your reference for tracking this payment - `currencyCode`: Three-letter currency code (e.g., "USD") - `order.lineItems`: Details of items in the order
</details>

The response will contain a `clientToken` that you'll use in the next steps to initialize Primer Checkout.

## Installation

You can integrate the Primer SDK using NPM.

```bash
npm install @primer-io/primer-js
```

Then import and initialize Primer in your application:

```javascript
import { loadPrimer } from '@primer-io/primer-js';
loadPrimer();
```

## Basic Setup

Create a basic checkout integration by adding the `primer-checkout` component to your page:

```html
<primer-checkout client-token="your-client-token"></primer-checkout>
```

:::warning Single Instance Limitation
Currently, only one instance of `<primer-checkout>` can be used per application. Multiple checkout configurations on a single page are not supported in the current version. This limitation may be addressed in future releases as we progress with engine rewrites.
:::

For comprehensive details on all available attributes, refer to the [Checkout Component SDK Reference](/sdk-reference/primer-checkout-doc).

:::note React and Framework Developers

If you're using **React, Next.js, or any JSX-based framework**, special patterns are required to avoid re-render issues when passing SDK options. The [SDK Options Guide](/documentation/options-guide) covers React-specific patterns in detail, including `useMemo` patterns for dynamic options.

For complete server-side rendering patterns, see the [Server-Side Rendering Guide](/documentation/server-side-rendering-guide).

:::

:::tip Advanced Topics

**SDK Options**: Need to configure payment methods, locales, or advanced features? See the [Options Guide](/documentation/options-guide) for comprehensive SDK configuration patterns.

**Server-Side Rendering**: If you're using SSR frameworks (Next.js, Nuxt.js, SvelteKit), see the [Server-Side Rendering Guide](/documentation/server-side-rendering-guide) for framework-specific patterns.

**Event Handling**: Need to respond to checkout lifecycle events? Check out the [Events Guide](/documentation/events-guide) for comprehensive event documentation.

:::

## Adding Styles

Primer Checkout uses CSS Custom Properties to manage its visual appearance. The styles are loaded automatically when you call `loadPrimer();`

### Theme Implementation Options

```html
<!-- Add the theme class to your checkout container -->
<primer-checkout client-token="your-client-token" class="primer-dark-theme">
  <!-- Your checkout content -->
</primer-checkout>
```

You can switch themes by changing the class on your container:

```javascript
// Switch to light theme
document.querySelector('primer-checkout').className = 'primer-light-theme';

// Switch to dark theme
document.querySelector('primer-checkout').className = 'primer-dark-theme';
```

## Customizing with the Styling API

Primer Checkout provides a comprehensive Styling API that allows you to customize the visual appearance of all checkout components. This API uses CSS Custom Properties (CSS Variables) to maintain a consistent design language across components.

```html
<!-- Example of styling customization using CSS variables -->
<style>
  primer-checkout {
    /* Brand color customization */
    --primer-color-brand: #4a6cf7;

    /* Typography customization */
    --primer-typography-brand: 'Montserrat', sans-serif;

    /* Border radius customization */
    --primer-radius-medium: 8px;

    /* Spacing customization */
    --primer-space-medium: 16px;
  }
</style>
```

You can customize nearly every aspect of the checkout UI, including:

- Colors (brand colors, text colors, backgrounds)
- Typography (font families, sizes, weights) - At the moment custom fonts will not work on iframes. The mechanism to set custom fonts on the whole checkout will come in future releases.
- Border radius values
- Spacing and sizing
- Input and button appearances

The Styling API also supports providing styles through a JSON object using the `custom-styles` attribute:

```html
<primer-checkout
  client-token="your-client-token"
  custom-styles='{"primerColorBrand":"#4a6cf7","primerTypographyBrand":"Montserrat, sans-serif"}'
>
</primer-checkout>
```

For detailed information on all available styling variables and customization options, refer to the [Primer Checkout Styling API](/sdk-reference/styling-api-docs).

## TypeScript Support

### JSX-based Frameworks

You can define special types so that merchants can use Primer components in any JSX Framework without needing a dedicated wrapper:

```tsx
import { CustomElements } from '@primer-io/primer-js/dist/jsx/index';

// Libraries will often have their own module names,
// you will need to use when extending the IntrinsicElements interface.
// For example, Preact requires you to use the "preact"
declare module 'my-app' {
  namespace JSX {
    interface IntrinsicElements extends CustomElements {}
  }
}
```

:::note
Libraries will often have their own module names you will need to use when extending the IntrinsicElements interface. For example, Preact requires you to use the "preact" module name instead of "my-app" (declare module "preact") and StencilJS uses "@stencil/core" (declare module "@stencil/core").
:::

## Event Handling

Primer Checkout emits events throughout the payment lifecycle that you can listen to and respond to. Events bubble up through the DOM and can be captured at the component or document level.

**Quick Example:**

```javascript
const checkout = document.querySelector('primer-checkout');

checkout.addEventListener('primer:ready', (event) => {
  console.log('Checkout is ready!');
});

checkout.addEventListener('primer:state-change', (event) => {
  const { isProcessing, isSuccessful, error } = event.detail;
  // Handle state changes
});
```

For comprehensive information on all available events, event payloads, and best practices, see the [Events Guide](/documentation/events-guide).

## Customizing the Checkout Experience

The SDK provides flexible options for customizing your checkout experience. You can use the built-in components with custom layouts or implement your own UI entirely.

### Basic Layout Structure

```html
<primer-checkout client-token="your-client-token">
  <primer-main slot="main">
    <div slot="payments">
      <primer-payment-method type="PAYMENT_CARD"></primer-payment-method>
      <primer-payment-method type="PAYPAL"></primer-payment-method>
      <!-- Include error message container to display payment failures -->
      <primer-error-message-container></primer-error-message-container>
    </div>
  </primer-main>
</primer-checkout>
```

:::tip
The `<primer-error-message-container>` component provides a ready-to-use solution for displaying payment failure messages. When using custom layouts, you can either include this component or build your own error handling using the checkout events.
:::

For more advanced customization options, including handling success and failure states, checkout flow customization, and more, refer to the [Layout Customizations Guide](/documentation/layout-customizations-guide).

### Payment Method Configuration

#### Using Payment Method Container (Recommended)

For most use cases, the new `primer-payment-method-container` component provides a simpler declarative approach:

```html
<!-- Include specific payment methods -->
<primer-payment-method-container
  include="APPLE_PAY,GOOGLE_PAY"
></primer-payment-method-container>

<!-- Exclude specific payment methods -->
<primer-payment-method-container
  exclude="PAYMENT_CARD"
></primer-payment-method-container>
```

See [SDK Reference documentation](/sdk-reference/Components/payment-method-container-doc) for complete usage guide.

#### Alternative: Event-Driven Approach

For advanced use cases requiring complex payment method handling, you can use the traditional event-driven approach with `primer:methods-update` events as shown in the Event Handling section above.

## Technical Limitations

When working with Primer Checkout, be aware of the following limitations:

| Area            | Limitation                  | Description                                                                                                                                                        | Learn More                                                  |
| --------------- | --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------- |
| **Browser**     | Modern Browsers Only        | The SDK uses modern web technologies and is not compatible with legacy browsers such as Internet Explorer 11.                                                      | [Environment Requirements](#environment-requirements)       |
| **Styling**     | Shadow DOM Isolation        | Direct CSS targeting of inner elements is not possible due to Shadow DOM encapsulation. Use the provided CSS variables for customization.                          | [Technology Overview](/documentation/components-technology) |
| **Lifecycle**   | Web Component Lifecycle     | Custom elements have their own lifecycle methods that differ from those in frameworks like React or Vue. Ensure proper handling of connections and disconnections. | [Technology Overview](/documentation/components-technology) |
| **Security**    | HTTPS Required              | The SDK requires a secure context (HTTPS) for certain features like Apple Pay to function correctly.                                                               | -                                                           |
| **Integration** | Framework-Specific Patterns | While the SDK works with all modern frameworks, integration patterns may differ based on your framework's approach to handling custom elements.                    | [SSR Guide](/documentation/server-side-rendering-guide)     |

For more detailed information about the underlying technologies and design decisions, see our [Technology Overview](/documentation/components-technology).
