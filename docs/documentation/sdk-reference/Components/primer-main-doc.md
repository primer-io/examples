---
title: Main Component
sidebar_label: <primer-main>
sidebar_position: 1
description: The Main component provides an optional container for payment methods and checkout completion state.
---

# Main Component

## \<primer-main\>

The `primer-main` component serves as an optional container for payment methods within the checkout flow. It provides organized structure for payment selection and checkout completion through a flexible slot system.

Developers can choose to bypass this component entirely for fully custom implementations by placing content directly in the `main` slot of `primer-checkout`.

## Usage

```html
<primer-checkout client-token="your-client-token">
  <primer-main slot="main"></primer-main>
</primer-checkout>
```

This renders a complete list of all available payment methods automatically.

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
| ------------------- | ------------------------------------------------------------------------------------------------------------ |
| `payments`          | Custom content slot for payment methods. When provided, it replaces the default payment methods list.        |
| `checkout-complete` | Custom content slot for the checkout completion state. Defaults to the `primer-checkout-complete` component. |

:::info
If you don't provide content for these slots, the component will use default implementations. Note that error handling is managed by the parent `primer-checkout` component, not by `primer-main`.
:::

## CSS Custom Properties

The Main component uses the following CSS custom properties for styling:

| Property               | Description                                           |
| ---------------------- | ----------------------------------------------------- |
| `--primer-space-small` | Spacing between payment method items (default: `8px`) |

## Examples

<details>
<summary><strong>Custom Completion State</strong></summary>

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

This example shows how to create a custom success screen that appears after a successful payment, with a button that redirects customers to their orders page.

</details>

<details>
<summary><strong>Combined Custom Layout Example</strong></summary>

```html
<primer-checkout client-token="your-client-token">
  <primer-main slot="main">
    <!-- Custom payment methods layout -->
    <div slot="payments">
      <h2>Choose how you'd like to pay</h2>
      <div class="payment-options">
        <primer-payment-method type="PAYMENT_CARD"></primer-payment-method>
        <primer-payment-method type="PAYPAL"></primer-payment-method>
      </div>
    </div>

    <!-- Custom success state -->
    <div slot="checkout-complete">
      <h2>Thank you for your order!</h2>
      <p>Your payment has been processed successfully.</p>
      <button onclick="window.location.href='/orders'">View Your Orders</button>
    </div>
  </primer-main>
</primer-checkout>
```

This example shows how to customize both main slots within the `primer-main` component, creating a customized checkout experience while leveraging the component's built-in success state management.

</details>

## Key Considerations

:::info Summary

- `primer-main` is an optional component that acts as a structured container within the `primer-checkout` component
- When used, it automatically handles checkout completion (success) state through its slot system
- Error handling is managed by the parent `primer-checkout` component, not by `primer-main`
- It can be bypassed entirely by placing custom content directly in the `main` slot of `primer-checkout`
- For custom implementations without `primer-main`, you'll need to listen to checkout state events to manage different states
- The component must be used within a `primer-checkout` component when employed
  :::
