---
sidebar_position: 1
title: Getting Started
description: Learn how to install and set up Primer Composable Checkout in your web application
---

# Getting Started with Primer Composable Checkout

Welcome to Primer's Composable Checkout SDK! This guide will help you integrate our payment solution into your website or web application.


:::tip What you'll learn
- Set up a client session for Primer payments
- Install and initialize the Primer Composable Checkout SDK
- Implement a basic checkout experience
- Style your checkout with light and dark themes
- Handle payment events and checkout state changes
- Customize your checkout layout
- Understand technical considerations and limitations
  :::

## Environment Requirements

Before diving into the implementation, ensure your environment meets these requirements:

| Requirement | Details |
|------------|---------|
| **Node.js** | Current LTS version recommended |
| **Browsers** | Modern browsers (Chrome, Firefox, Safari, Edge) |
| **Not Supported** | Internet Explorer 11, Classic Edge (legacy) |

:::note Why some browsers aren't supported
Legacy browsers like Internet Explorer 11 aren't officially supported due to their non-standard DOM behavior and lack of support for modern Web Component features.
:::

## Before You Start

Before integrating Primer Composable Checkout, ensure you have completed these prerequisites:

1. You're [ready to process payments](https://primer.io/docs/payments/process-payments)
2. [Universal Checkout is properly configured](https://primer.io/docs/payments/universal-checkout/configure-universal-checkout-without-code) in your Primer Dashboard


### Create a Client Session

A **client session** is required to initialize the checkout experience. This session contains your order data and provides you with a **client token** needed to initialize the components.

Here's how to create a client session:

1. **Generate an API key**
    - Visit the [Primer Dashboard developer page](https://sandbox-dashboard.primer.io/developers/apiKeys)
    - Create an API key with these scopes:
        - `client_tokens:write`
        - `transactions:authorize`

2. **Make a client session request**
    - Make a POST request to the [Client Session API](https://primer.io/docs/api/api-reference/client-session-api/create-client-side-token)
    - Include at minimum:
        - `orderId`: Your reference for tracking this payment
        - `currencyCode`: Three-letter currency code (e.g., "USD")
        - `order.lineItems`: Details of items in the order

The response will contain a `clientToken` that you'll use in the next steps to initialize Primer Composable Checkout.

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

For comprehensive details on all available attributes, refer to the [Checkout Component API Reference](/api/Components/primer-checkout-doc).

### Preventing Flash of Undefined Components

To prevent any "flash" where custom code appears before Primer's components are ready, you can add CSS like this:

```css
primer-checkout:has(:not(:defined)) {
  visibility: hidden;
}
```

For smooth transitions, you can use advanced techniques like `customElements.whenDefined()`. See here for more details.

## Adding Styles

The Primer Composable Checkout SDK uses CSS Custom Properties to manage its visual appearance. To get started with styling, include the base stylesheet in your HTML:

### Light Theme (Default)

```html
<link rel="stylesheet" href="https://sdk.primer.io/web/primer-js/v0-latest/styles.css" />
```

### Dark Theme (Optional)

```html
<link rel="stylesheet" href="https://sdk.primer.io/web/primer-js/v0-latest/dark.css" />
```

### Implementing Theme Support

There are two main approaches to implementing themes:

#### 1. Simple Theme Implementation

For basic implementations, simply include the stylesheet for your desired theme:

```html
<!-- For light theme only -->
<link rel="stylesheet" href="https://sdk.primer.io/web/primer-js/v0-latest/styles.css" />

<!-- OR for dark theme only -->
<link rel="stylesheet" href="https://sdk.primer.io/web/primer-js/v0-latest/dark.css" />
```

#### 2. Supporting Both Light and Dark Themes

To support both themes with automatic switching:

```html
<!-- Include both stylesheets -->
<link rel="stylesheet" href="https://sdk.primer.io/web/primer-js/v0-latest/styles.css" />
<link rel="stylesheet" href="https://sdk.primer.io/web/primer-js/v0-latest/dark.css" />

<!-- Add the theme class to your checkout container -->
<div id="checkout-container" class="primer-light-theme">
  <primer-checkout client-token="your-client-token">
    <!-- Your checkout content -->
  </primer-checkout>
</div>
```

You can then switch themes by changing the class on your container:

```javascript
// Switch to dark theme
document.getElementById('checkout-container').className = 'primer-dark-theme';

// Switch to light theme
document.getElementById('checkout-container').className = 'primer-light-theme';
```

## TypeScript Support

### JSX-based Frameworks

You can define special types so that merchants can use Primer components in any JSX Framework without needing a dedicated wrapper:

```tsx
import { CustomElements } from '@primer-io/primer-js/dist/jsx/index';

// Libraries will often have their own module names,
// you will need to use when extending the IntrinsicElements interface. 
// For example, Preact requires you to use the "preact"
declare module react {
 {
  namespace JSX {
    interface IntrinsicElements extends CustomElements {}
  }
}
```

## Event Handling

The SDK emits events to help you manage the checkout flow. All events bubble up through the DOM and can be listened to at the document level or on the checkout component.

### Core Events

```javascript
const checkout = document.querySelector('primer-checkout');

// Listen for SDK state changes
checkout.addEventListener('primer-state-changed', (event) => {
  const { isProcessing, isSuccessful, error } = event.detail;
  // Handle state changes
});

// Listen for available payment methods
checkout.addEventListener('primer-payment-methods-updated', (event) => {
  const paymentMethods = event.detail.toArray();
  // Handle payment methods list
});

// Access SDK instance
checkout.addEventListener('primer-checkout-initialized', (event) => {
  const primerInstance = event.detail;
  // Access SDK methods
});
```

### Card Form Events

```javascript
// Handle successful card submission
checkout.addEventListener('primer-form-submit-success', (event) => {
  const result = event.detail;
  // Handle success
});

// Handle card validation errors
checkout.addEventListener('primer-form-submit-errors', (event) => {
  const errors = event.detail;
  // Handle validation errors
});
```

## Customizing the Checkout Experience

The SDK provides flexible options for customizing your checkout experience. You can use the built-in components with custom layouts or implement your own UI entirely.

### Basic Layout Structure

```html
<primer-checkout client-token="your-client-token">
  <primer-main slot="main">
    <div slot="payments">
      <primer-payment-method type="PAYMENT_CARD"></primer-payment-method>
      <primer-payment-method type="PAYPAL"></primer-payment-method>
    </div>
  </primer-main>
</primer-checkout>
```

For more advanced customization options, including handling success and failure states, checkout flow customization, and more, refer to the [Layout Customizations Guide](/documentation/layout-customizations-guide).

## Technical Limitations

When working with the Primer Composable Checkout SDK, be aware of the following limitations:

1. **Browser Compatibility**: The SDK uses modern web technologies and is not compatible with legacy browsers such as Internet Explorer 11.

2. **Shadow DOM Isolation**: Since the SDK uses Shadow DOM for style encapsulation, direct CSS targeting of inner elements is not possible. Use the provided CSS variables for styling.

3. **Web Component Lifecycle**: Custom elements have their own lifecycle methods that differ from those in frameworks like React or Vue. Ensure you're properly handling connections and disconnections.

4. **Security Contexts**: The SDK requires a secure context (HTTPS) for certain features like Apple Pay to function correctly.

5. **Framework Integration**: While the SDK works with all modern frameworks, integration patterns may differ slightly based on your framework's approach to handling custom elements.

For more detailed information about the underlying technologies and design decisions, see our [Technology Overview](/documentation/components-technology).
