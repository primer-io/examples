---
title: Apple Pay Options
sidebar_label: Apple Pay
sidebar_position: 5
description: Configuration options for Apple Pay payment integration
---

# Apple Pay Options

Apple Pay integration enables customers to pay using payment methods saved to their Apple Wallet, including credit/debit cards and other supported payment methods. The SDK provides comprehensive configuration options for button styling and contact information capture.

## Configuration

Configure Apple Pay options through the checkout component's `options` property:

```typescript
import { loadPrimer } from '@primer-io/primer-js';

loadPrimer();

const checkout = document.querySelector('primer-checkout');
checkout.options = {
  applePay: {
    buttonOptions: {
      type: 'buy',
      buttonStyle: 'black',
    },
    billingOptions: {
      requiredBillingContactFields: ['postalAddress'],
    },
  },
};
```

## Button Style Options

Customize the appearance of the Apple Pay button through the `buttonOptions` configuration. All properties are optional.

### Button Type

The button type determines the label displayed on the Apple Pay button. Each type displays localized text according to the user's device language.

| Type           | Description                   |
| -------------- | ----------------------------- |
| `'plain'`      | Apple Pay logo only (default) |
| `'add-money'`  | "Add Money with Apple Pay"    |
| `'book'`       | "Book with Apple Pay"         |
| `'buy'`        | "Buy with Apple Pay"          |
| `'check-out'`  | "Check Out with Apple Pay"    |
| `'continue'`   | "Continue with Apple Pay"     |
| `'contribute'` | "Contribute with Apple Pay"   |
| `'donate'`     | "Donate with Apple Pay"       |
| `'order'`      | "Order with Apple Pay"        |
| `'pay'`        | "Pay with Apple Pay"          |
| `'reload'`     | "Reload with Apple Pay"       |
| `'rent'`       | "Rent with Apple Pay"         |
| `'set-up'`     | "Set Up with Apple Pay"       |
| `'subscribe'`  | "Subscribe with Apple Pay"    |
| `'support'`    | "Support with Apple Pay"      |
| `'tip'`        | "Tip with Apple Pay"          |
| `'top-up'`     | "Top Up with Apple Pay"       |

### Button Style

The button style controls the visual appearance of the Apple Pay button.

| Style             | Description                                              |
| ----------------- | -------------------------------------------------------- |
| `'black'`         | Black button with white text (default, for light themes) |
| `'white'`         | White button with black text (for dark themes)           |
| `'white-outline'` | White button with black outline and black text           |

### Style Examples

```typescript
// Standard black button for purchasing
applePay: {
  buttonOptions: {
    type: 'buy',
    buttonStyle: 'black',
  },
}

// White button for dark backgrounds
applePay: {
  buttonOptions: {
    type: 'pay',
    buttonStyle: 'white',
  },
}

// Donation button with outline style
applePay: {
  buttonOptions: {
    type: 'donate',
    buttonStyle: 'white-outline',
  },
}
```

:::tip Apple Pay Design Guidelines
Apple provides strict design guidelines for Apple Pay buttons. The SDK automatically renders buttons according to [Apple's Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/apple-pay).
:::

## Billing Contact Options

Capture the customer's billing information from their Apple Wallet through the `billingOptions` configuration.

```typescript
applePay: {
  billingOptions: {
    requiredBillingContactFields: ['postalAddress'],
  },
}
```

| Option                         | Type                  | Description                              |
| ------------------------------ | --------------------- | ---------------------------------------- |
| `requiredBillingContactFields` | `('postalAddress')[]` | Fields of billing information to capture |

### Required Billing Contact Fields

Currently supported billing contact fields:

- `'postalAddress'` - Billing address including street, city, state/province, postal code, and country

When billing contact fields are required, the Apple Pay payment sheet prompts the user to select or provide the requested information before completing the transaction.

```typescript
// Capture billing address
applePay: {
  billingOptions: {
    requiredBillingContactFields: ['postalAddress'],
  },
}
```

## Shipping Contact Options

Capture shipping information and enable shipping method selection through the `shippingOptions` configuration.

```typescript
applePay: {
  shippingOptions: {
    requiredShippingContactFields: ['postalAddress', 'name', 'email', 'phone'],
  },
}
```

| Option                          | Type       | Description                               |
| ------------------------------- | ---------- | ----------------------------------------- |
| `requiredShippingContactFields` | `string[]` | Fields of shipping information to capture |

### Required Shipping Contact Fields

Specify which shipping contact information the customer must provide:

| Field             | Description                                  |
| ----------------- | -------------------------------------------- |
| `'postalAddress'` | Shipping address (street, city, state, etc.) |
| `'name'`          | Recipient's name                             |
| `'phoneticName'`  | Phonetic representation of recipient's name  |
| `'phone'`         | Phone number                                 |
| `'email'`         | Email address                                |

```typescript
// Capture full shipping information
applePay: {
  shippingOptions: {
    requiredShippingContactFields: ['postalAddress', 'name', 'email', 'phone'],
  },
}

// Capture only shipping address
applePay: {
  shippingOptions: {
    requiredShippingContactFields: ['postalAddress'],
  },
}
```

## Complete Configuration Example

```html
<primer-checkout client-token="your-client-token"></primer-checkout>

<script type="module">
  import { loadPrimer } from '@primer-io/primer-js';

  loadPrimer();

  const checkout = document.querySelector('primer-checkout');
  checkout.options = {
    sdkCore: true, // Required for Apple Pay
    applePay: {
      // Button styling
      buttonOptions: {
        type: 'buy',
        buttonStyle: 'black',
      },

      // Billing information
      billingOptions: {
        requiredBillingContactFields: ['postalAddress'],
      },

      // Shipping information
      shippingOptions: {
        requiredShippingContactFields: [
          'postalAddress',
          'name',
          'email',
          'phone',
        ],
      },
    },
  };
</script>
```

## Supported Card Networks

Apple Pay supports the following card networks:

| Network    | Description            |
| ---------- | ---------------------- |
| VISA       | Visa cards             |
| MASTERCARD | Mastercard cards       |
| AMEX       | American Express cards |
| DISCOVER   | Discover cards         |
| JCB        | JCB cards              |

The SDK automatically filters card networks based on your Primer configuration. If `orderedAllowedCardNetworks` is configured in your client session, only those networks will be available.

## Display Items

When using express checkout with shipping, the Apple Pay payment sheet displays line items to the customer. The SDK automatically builds display items from your order data:

- **Line items** - Individual products from `order.lineItems`
- **Fees** - Any fees from `order.fees` (non-zero amounts only)

If `merchantAmount` is set in the order, a simplified "Subtotal" view is shown instead.

## Testing

Apple Pay requires specific setup for testing:

### Development Testing

1. Use Safari browser on macOS or iOS
2. Ensure you have a test card added to your Apple Wallet
3. Use Primer's TEST environment

### Production Testing

1. Register your domain with Apple Pay in the [Apple Developer Portal](https://developer.apple.com/)
2. Configure your merchant identifier
3. Verify your domain
4. Use a real Apple account with saved payment methods

:::note Apple Pay Requirements
Apple Pay only works on supported devices with Safari or WebKit-based browsers. The button will only appear when the device and browser support Apple Pay, and the user has payment methods configured in their Apple Wallet.
:::

## Client Options Reference

| Option                                          | Type       | Default   | Description                        |
| ----------------------------------------------- | ---------- | --------- | ---------------------------------- |
| `buttonOptions`                                 | `object`   | —         | Button styling configuration       |
| `buttonOptions.type`                            | `string`   | `'plain'` | Button label type                  |
| `buttonOptions.buttonStyle`                     | `string`   | —         | Button color theme                 |
| `billingOptions`                                | `object`   | —         | Billing information configuration  |
| `billingOptions.requiredBillingContactFields`   | `string[]` | —         | Billing fields to capture          |
| `shippingOptions`                               | `object`   | —         | Shipping information configuration |
| `shippingOptions.requiredShippingContactFields` | `string[]` | —         | Shipping fields to capture         |

## Related Documentation

- [Apple Pay on the Web Documentation](https://developer.apple.com/documentation/applepayontheweb) - Official Apple Pay documentation
- [Apple Pay Button Types](https://developer.apple.com/documentation/applepayontheweb/applepaybuttontype) - Complete button type reference
- [Apple Pay Button Styles](https://developer.apple.com/documentation/applepayontheweb/applepaybuttonstyle) - Button style reference
- [Payment Methods Guide](/guides/payment-methods-guide) - Integration patterns and best practices
