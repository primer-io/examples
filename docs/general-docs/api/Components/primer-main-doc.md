---
title: Main Component
sidebar_label: <primer-main>
sidebar_position: 1
description: The Main component provides an optional container for payment methods and checkout completion states.
---

# Main Component
## \<primer-main\>

The `primer-main` component serves as an optional container for payment methods within the checkout flow. Similar to an HTML `<main>` tag that signals the main content of a page, `primer-main` acts as the main container of your checkout application, providing organized structure for different checkout states.

This component manages the display of payment options and checkout completion states through a flexible slot system, but developers can choose to bypass it entirely for fully custom implementations.

## Usage

### Basic Usage (Default Layout)

```html
<primer-checkout client-token="your-client-token">
  <primer-main slot="main"></primer-main>
</primer-checkout>
```

This renders a complete list of all available payment methods automatically.

### Custom Layout

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

### Bypassing primer-main Completely

You can bypass the `primer-main` component entirely and provide your own implementation directly in the `main` slot of the `primer-checkout` component:

```html
<primer-checkout client-token="your-client-token">
  <div slot="main">
    <!-- Your completely custom checkout implementation -->
    <div class="payment-selection">
      <h2>Select Payment Method</h2>
      <primer-payment-method type="PAYMENT_CARD"></primer-payment-method>
    </div>
  </div>
</primer-checkout>
```

## Slots

| Name                | Description                                                                                                  |
|---------------------|--------------------------------------------------------------------------------------------------------------|
| `payments`          | Custom content slot for payment methods. When provided, it replaces the default payment methods list.        |
| `checkout-complete` | Custom content slot for the checkout completion state. Defaults to the `primer-checkout-complete` component. |
| `checkout-failure`  | Custom content slot for the checkout failure state. Defaults to the `primer-checkout-failure` component.     |

## States

The Main component automatically manages different checkout states:

1. **Default state**: Displays payment methods
2. **Success state**: Displays checkout completion content when the payment is successful
3. **Error state**: Displays checkout failure content when an error occurs
4. **Processing state**: Applies visual feedback when the checkout is processing

## CSS Custom Properties

The Main component uses the following CSS custom properties for styling:

| Property               | Description                                           |
|------------------------|-------------------------------------------------------|
| `--primer-space-small` | Spacing between payment method items (default: `8px`) |

## Examples

### Custom Completion State

```html
<primer-checkout client-token="your-client-token">
  <primer-main slot="main">
    <div slot="checkout-complete">
      <h2>Thank you for your order!</h2>
      <p>Your payment has been processed successfully.</p>
      <button onclick="window.location.href='/orders'">View Your Orders</button>
    </div>
  </primer-main>
</primer-checkout>
```

### Custom Error State

```html
<primer-checkout client-token="your-client-token">
  <primer-main slot="main">
    <div slot="checkout-failure">
      <h2>Something went wrong</h2>
      <p>We couldn't process your payment. Please try again.</p>
      <button onclick="window.location.reload()">Try Again</button>
    </div>
  </primer-main>
</primer-checkout>
```


## Notes

- `primer-main` is an optional component that acts as a structured container within the `primer-checkout` component
- When used, it automatically handles checkout completion and error states through its slot system
- It can be bypassed entirely by placing custom content directly in the `main` slot of `primer-checkout`
- For custom implementations without `primer-main`, you'll need to listen to checkout state events to manage different states
- The component must be used within a `primer-checkout` component when employed
