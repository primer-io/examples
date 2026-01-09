---
title: Billing Address Component
sidebar_label: <primer-billing-address>
sidebar_position: 5
description: Collects customer billing address information for card payment processing
---

# Billing Address Component

## \<primer-billing-address\>

The `primer-billing-address` component collects customer billing address information during card payment flows. It provides a form interface for capturing address details required for payment processing and fraud prevention. The component integrates seamlessly with card forms and automatically validates address information based on your Dashboard configuration.

## Usage

The billing address component can be used in two modes depending on your implementation approach.

### Drop-in Mode

In drop-in mode, the billing address component is automatically included in the default card form layout when enabled in your Dashboard settings. No manual inclusion is needed.

:::tip Automatic Inclusion
When using the default card form without custom layout, you don't need to add the billing address component manually. It will appear automatically if enabled in your Primer Dashboard checkout configuration.
:::

### Custom Layout Mode

For custom card form layouts, you must explicitly include the billing address component in the `card-form-content` slot alongside other card input components.

:::note Component Placement
The billing address component must be placed inside a `<primer-card-form>` parent component. It cannot be used independently or outside of a card form context.
:::

### Basic Example

This example shows how to use the billing address component in a custom card form layout:

```html
<primer-card-form>
  <div slot="card-form-content">
    <primer-billing-address></primer-billing-address>
    <primer-input-card-holder-name></primer-input-card-holder-name>
    <primer-input-card-number></primer-input-card-number>
    <primer-input-card-expiry></primer-input-card-expiry>
    <primer-input-cvv></primer-input-cvv>
    <primer-button type="submit">Pay</primer-button>
  </div>
</primer-card-form>
```

## Dashboard Configuration

The billing address component must be enabled in your Primer Dashboard checkout configuration. The Dashboard allows you to configure:

- Which address fields are required or optional
- Address validation rules
- Country restrictions
- Field display order

For detailed setup instructions and configuration options, see the [Primer documentation on capturing billing addresses](https://primer.io/docs/checkout/capture-billing-address#capture-billing-address).

:::warning Configuration Required
If billing address capture is not enabled in your Dashboard, the component will not render even when explicitly added to your custom layout.
:::

## Key Concepts

### Integration with Card Forms

The billing address component is designed to work exclusively within card payment flows. It captures and validates address information before submitting card payment details to ensure compliance with payment processor requirements.

```mermaid
flowchart TD
    A[primer-card-form] --> B{Mode}
    B -->|Drop-in| C[Automatic Inclusion]
    B -->|Custom Layout| D[Manual Inclusion Required]

    C --> E[primer-billing-address]
    D --> F[card-form-content slot]
    F --> E

    E --> G{Dashboard<br>Enabled?}
    G -->|Yes| H[Render Address Form]
    G -->|No| I[Don't Render]

    style A fill:#f9f9f9,stroke:#2f98ff,stroke-width:2px
    style B fill:#fff8e1,stroke:#ffa000,stroke-width:1px
    style E fill:#e1f5fe,stroke:#0288d1,stroke-width:1px
    style H fill:#e8f5e9,stroke:#388e3c,stroke-width:1px
    style I fill:#ffebee,stroke:#f44336,stroke-width:1px
```

### Validation and Data Collection

The component automatically handles:

- Field validation based on Dashboard configuration
- Address format validation by country
- Required field enforcement
- Error message display for invalid inputs

All validation rules are controlled through your Dashboard settings, ensuring consistency across your payment flows without requiring code changes.

## Styling

The billing address component can be customized using CSS custom properties. Below is the complete list of available CSS variables:

| Property                                      | Purpose                           |
| --------------------------------------------- | --------------------------------- |
| `--primer-space-xsmall`                       | Extra small spacing               |
| `--primer-space-small`                        | Small spacing                     |
| `--primer-space-medium`                       | Medium spacing                    |
| `--primer-space-large`                        | Large spacing                     |
| `--primer-color-text-primary`                 | Primary text color                |
| `--primer-color-text-placeholder`             | Placeholder text color            |
| `--primer-color-text-disabled`                | Disabled text color               |
| `--primer-color-border-outlined-default`      | Default border color              |
| `--primer-color-border-outlined-focus`        | Focus state border color          |
| `--primer-color-border-outlined-hover`        | Hover state border color          |
| `--primer-color-border-outlined-active`       | Active state border color         |
| `--primer-color-border-outlined-disabled`     | Disabled state border color       |
| `--primer-color-border-outlined-error`        | Error state border color          |
| `--primer-color-background-outlined-default`  | Default background color          |
| `--primer-color-background-outlined-hover`    | Hover state background color      |
| `--primer-color-background-outlined-active`   | Active state background color     |
| `--primer-color-background-outlined-disabled` | Disabled state background color   |
| `--primer-color-background-outlined-error`    | Error state background color      |
| `--primer-width-error`                        | Input border width in error state |
| `--primer-radius-small`                       | Border radius                     |
| `--primer-typography-body-large-font`         | Large body font family            |
| `--primer-typography-body-large-size`         | Large body font size              |
| `--primer-typography-body-large-weight`       | Large body font weight            |
| `--primer-typography-body-large-line-height`  | Large body line height            |
| `--primer-typography-body-medium-font`        | Medium body font family           |
| `--primer-color-text-negative`                | Error message text color          |
| `--primer-typography-error-font`              | Error message font family         |
| `--primer-typography-error-size`              | Error message font size           |
| `--primer-typography-error-weight`            | Error message font weight         |
| `--primer-typography-error-line-height`       | Error message line height         |
| `--primer-typography-error-letter-spacing`    | Error message letter spacing      |

## Key Considerations

:::info Summary

- SDK Core is enabled by default in Primer Checkout and is required for this component
- Must be used inside a `<primer-card-form>` parent component
- Automatically included in drop-in mode when enabled in Dashboard
- Must be explicitly added in custom layouts via the `card-form-content` slot
- Configuration and validation rules are managed through the Primer Dashboard
- The component will not render if billing address is not enabled in Dashboard settings
- Supports comprehensive styling through CSS custom properties
- Has no props/attributes or events to configure
- Field requirements and validation are controlled server-side through Dashboard configuration

:::

## Related Documentation

- [Card Form Component](/sdk-reference/Components/CardForm/) - Parent component for billing address
- [Layout Customizations Guide](/guides/layout-customizations-guide) - Creating custom card form layouts
- [Primer Billing Address Documentation](https://primer.io/docs/checkout/capture-billing-address#capture-billing-address) - Dashboard configuration guide
