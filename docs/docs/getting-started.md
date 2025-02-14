---
sidebar_position: 1
---


# Getting Started with Primer Web SDK

Welcome to Primer's Web SDK! This guide will help you integrate our payment solution into your website or web application.

## Table of Contents
- [Installation](#installation)
- [Basic Setup](#basic-setup)
- [Creating a Checkout Component](#creating-a-checkout-component)
- [Event Handling](#event-handling)
- [Customizing the Checkout Experience](#customizing-the-checkout-experience)
- [Framework Integration](#framework-integration)

## Installation

You can integrate the Primer SDK using either NPM or our CDN.

### Using NPM

```bash
npm install @primer-io/primer-js
```

Then import and initialize Primer in your application:

```javascript
import { loadPrimer } from '@primer-io/primer-js';
loadPrimer();
```

### Using CDN

Add the following script tag to your HTML:

```html
<script
  src="https://sdk.primer.io/web/v1-latest/primer.min.js"
  crossorigin="anonymous"
></script>
```

## Basic Setup

Create a basic checkout integration by adding the `primer-checkout` component to your page:

```html
<primer-checkout
  clientToken={clientToken}
  options={options}
></primer-checkout>
```

The component requires two main props:
- `clientToken`: Your client session token
- `options`: Configuration options for the checkout (passed as stringified JSON)

## Event Handling

The SDK emits standardized events to help you manage the checkout flow. All events bubble up and cross shadow DOM boundaries.

### Core Events

```javascript
const checkout = document.querySelector('primer-checkout');

// Listen for SDK state changes
checkout?.addEventListener('primer-state-changed', (evt) => {
  const { isProcessing, isSuccessful, error } = evt.detail;
  // Handle state changes
});

// Listen for available payment methods
checkout?.addEventListener('primer-payment-methods-updated', (evt) => {
  const paymentMethods = evt.detail.toArray();
  // Handle payment methods list
});

// Access SDK instance
checkout?.addEventListener('primer-checkout-initialized', (evt) => {
  const primerInstance = evt.detail;
  // Access SDK methods
});
```

### Card Form Events

```javascript
// Handle successful card submission
checkout?.addEventListener('primer-card-submit-success', (evt) => {
  const { result } = evt.detail;
  // Handle success
});

// Handle card validation errors
checkout?.addEventListener('primer-card-submit-errors', (evt) => {
  const { errors } = evt.detail;
  // Handle validation errors
});
```

## Customizing the Checkout Experience

### Basic Layout Structure

The SDK provides two main approaches to layout customization:

#### 1. Using the Main Component

```html
<primer-checkout clientToken={clientToken} options={options}>
  <primer-main>
    <!-- Custom checkout content -->
  </primer-main>
</primer-checkout>
```

#### 2. Direct Implementation

You can skip the `primer-main` component and implement your own UI flow:

```html
<primer-checkout clientToken={clientToken} options={options}>
  <div>
    <!-- Your custom implementation -->
    <!-- Use event listeners to manage checkout state -->
  </div>
</primer-checkout>
```

### Payment Methods Integration

```javascript
<div>
  {paymentMethods.map(({ type }) => (
    <primer-payment-method type={type}></primer-payment-method>
  ))}
</div>
```

### Custom Success and Failure Handling

When using `primer-main`, you can customize success and failure screens:

```html
<primer-main>
  <div slot="success">
    <!-- Custom success screen -->
  </div>
  <div slot="failure">
    <!-- Custom failure screen -->
  </div>
</primer-main>
```

Alternatively, listen to state events to manage these states in your own UI:

```javascript
checkout?.addEventListener('primer-state-changed', (evt) => {
  const { isSuccessful, error } = evt.detail;
  if (isSuccessful) {
    // Show your success UI
  } else if (error) {
    // Show your error UI
  }
});
```

## Framework Integration

The SDK uses Web Components, which work natively with all major JavaScript frameworks. No additional wrappers or adapters are required.

### TypeScript Support

For TypeScript projects, you'll need to add type declarations. Please refer to our [TypeScript Integration Guide](/docs/typescript) for detailed setup instructions.

### Framework-Specific Guides

While the SDK works out of the box with all frameworks, we provide additional documentation for optimizing your integration:

- [React Integration Guide](/docs/react)
- [Vue Integration Guide](/docs/vue)
- [Angular Integration Guide](/docs/angular)

## Next Steps

- Explore our [API Documentation](/api) for advanced features
- Visit our [Examples Gallery](/examples) for implementation samples
- Check our [Troubleshooting Guide](/troubleshooting) for common issues

