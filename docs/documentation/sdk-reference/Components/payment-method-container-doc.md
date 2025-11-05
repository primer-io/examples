---
title: 'Payment Method Container'
sidebar_label: <primer-payment-method-container>
sidebar_position: 3
description: 'Simplify payment method layouts with declarative filtering and automatic rendering'
---

# Payment Method Container

## \<primer-payment-method-container\>

The `primer-payment-method-container` component simplifies the creation of custom payment method layouts by automatically rendering available payment methods with built-in filtering capabilities. It eliminates the need for verbose event listeners and manual state management.

```html
<primer-payment-method-container
  include="APPLE_PAY,GOOGLE_PAY"
></primer-payment-method-container>
```

## Usage

```html
<primer-checkout client-token="your-client-token">
  <primer-main slot="main">
    <div slot="payments">
      <!-- All available payment methods -->
      <primer-payment-method-container></primer-payment-method-container>
    </div>
  </primer-main>
</primer-checkout>
```

## Properties

| Property   | Type      | Default     | Description                                                                                   |
| ---------- | --------- | ----------- | --------------------------------------------------------------------------------------------- |
| `include`  | `string`  | `undefined` | Comma-separated list of payment method types to include. Only these methods will be rendered. |
| `exclude`  | `string`  | `undefined` | Comma-separated list of payment method types to exclude. These methods will be filtered out.  |
| `disabled` | `boolean` | `false`     | Disables all payment methods in the container.                                                |

## CSS Custom Properties

| Property               | Description                           |
| ---------------------- | ------------------------------------- |
| `--primer-space-small` | Gap between payment method components |

## Key Benefits

- **Declarative filtering** - Use `include` and `exclude` attributes instead of manual JavaScript filtering
- **Automatic updates** - Component automatically responds to payment method changes
- **Zero boilerplate** - No event listeners or state management needed
- **Flexible layouts** - Easily create sectioned payment layouts with different filters

## Examples

<details>
<summary><strong>Sectioned Payment Layout</strong></summary>

Create organized payment sections with different filtering:

```html
<primer-checkout client-token="your-client-token">
  <primer-main slot="main">
    <div slot="payments">
      <!-- Quick pay options section -->
      <div class="payment-section">
        <h3>Quick Pay Options</h3>
        <primer-payment-method-container
          include="APPLE_PAY,GOOGLE_PAY"
        ></primer-payment-method-container>
      </div>

      <!-- Alternative payment methods section -->
      <div class="payment-section">
        <h3>Other Payment Methods</h3>
        <primer-payment-method-container
          exclude="PAYMENT_CARD,APPLE_PAY,GOOGLE_PAY"
        ></primer-payment-method-container>
      </div>

      <!-- Card form section -->
      <div class="payment-section">
        <h3>Pay with Card</h3>
        <primer-payment-method type="PAYMENT_CARD"></primer-payment-method>
      </div>
    </div>
  </primer-main>
</primer-checkout>
```

</details>

<details>
<summary><strong>Combined Filtering</strong></summary>

Use both include and exclude filters together:

```html
<!-- Include specific methods, then exclude one from that set -->
<primer-payment-method-container
  include="APPLE_PAY,GOOGLE_PAY,PAYPAL"
  exclude="PAYPAL"
></primer-payment-method-container>
<!-- Result: Only APPLE_PAY and GOOGLE_PAY will be rendered -->
```

</details>

<details>
<summary><strong>Disabled State</strong></summary>

Temporarily disable all payment methods in a container:

```html
<!-- Disable all payment methods during processing -->
<primer-payment-method-container disabled></primer-payment-method-container>
```

</details>

## Filter Logic

**Include Filter:**

- Only renders payment methods in the comma-separated list
- Case-sensitive exact matching
- Whitespace automatically trimmed

**Exclude Filter:**

- Filters out payment methods in the comma-separated list
- Case-sensitive exact matching
- Whitespace automatically trimmed

**Combined Filters:**

- `include` applied first, then `exclude`
- If no methods remain after filtering, component renders nothing

## Related Components

- [Payment Method Component](/sdk-reference/Components/payment-method-doc) - Individual payment method component
- [Primer Checkout](/sdk-reference/Components/primer-checkout-doc) - Main checkout container
- [Primer Main](/sdk-reference/Components/primer-main-doc) - Main checkout content area

## Key Considerations

:::info

- Payment methods must be configured in your Primer Dashboard to be displayed
- Component automatically subscribes to payment method updates
- Filter attributes are case-sensitive (exact match)
- Must be used within `<primer-checkout>` context
- Renders nothing when no methods remain after filtering

:::
