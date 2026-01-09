---
title: Error Message Container
sidebar_label: <primer-error-message-container>
sidebar_position: 6
description: A pre-built component to display payment failure errors in the checkout process
---

# Error Message Container

## \<primer-error-message-container\>

The `primer-error-message-container` component provides a convenient way to display **payment failure errors** during the checkout process. It automatically handles the display of payment failure errors received from the SDK without requiring you to write custom error handling code.

## Basic Usage

```html
<!DOCTYPE html>
<html lang="en">
  <body>
    <primer-checkout client-token="YOUR_CLIENT_TOKEN">
      <primer-error-message-container></primer-error-message-container>
      <primer-card-form></primer-card-form>
      <primer-submit-button>Pay Now</primer-submit-button>
    </primer-checkout>
  </body>
</html>
```

The component automatically displays payment failure errors. No configuration required.

## When to Use

Use `<primer-error-message-container>` when you want automatic display of payment failure errors without custom error handling.

**Use this component if:**

- You want zero-config error display
- You're using the default checkout layout

**Don't use this component if:**

- You need custom error UI/UX
- You want to handle errors programmatically
- You're building a fully custom layout with your own error handling

For custom error handling, listen to the `primer:state-change` event on `<primer-checkout>` and access the `paymentFailure` field.

## How It Works

The component subscribes to the SDK state and automatically displays payment failure errors when they occur.

**What it displays:**

- Payment failure errors (after submission fails)

**What it does NOT display:**

- Card validation errors (use `primer-card-form` validation instead)
- SDK initialization errors
- Network errors during processing

**Behavior:**

- Automatically shows when `paymentFailure` state field is populated
- Automatically hides when payment succeeds or is retried
- Includes proper ARIA attributes for accessibility

## Technical Implementation

The component uses Lit's `@consume` decorator to subscribe to SDK state changes via the `sdkStateContext`. This allows it to automatically react to state updates without manual event listener setup.

**State Fields Monitored:**

- `paymentFailure` - Displays error messages when payment processing fails
- `isProcessing` - Hides errors during active payment processing

## CSS Custom Properties

The error message container can be styled using the following CSS custom properties:

| Property                                   | Purpose                      |
| ------------------------------------------ | ---------------------------- |
| `--primer-color-text-negative`             | Error message text color     |
| `--primer-typography-error-font`           | Error message font family    |
| `--primer-typography-error-size`           | Error message font size      |
| `--primer-typography-error-weight`         | Error message font weight    |
| `--primer-typography-error-line-height`    | Error message line height    |
| `--primer-typography-error-letter-spacing` | Error message letter spacing |

## Related Components

- [`<primer-checkout>`](/sdk-reference/Components/primer-checkout-doc) - The main checkout container
- [`<primer-main>`](/sdk-reference/Components/primer-main-doc) - The main content area component
