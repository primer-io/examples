---
title: Google Pay Options
sidebar_label: Google Pay
sidebar_position: 6
description: Configuration options for Google Pay payment integration
---

# Google Pay Options

Google Pay integration enables customers to pay using payment methods saved to their Google account, including credit/debit cards and other supported payment methods. The SDK provides comprehensive configuration options for button styling, express checkout features, and address capture.

## Configuration

Configure Google Pay options through the checkout component's `options` property:

```typescript
import { loadPrimer } from '@primer-io/primer-js';

loadPrimer();

const checkout = document.querySelector('primer-checkout');
checkout.options = {
  googlePay: {
    buttonType: 'buy',
    buttonColor: 'black',
    buttonSizeMode: 'fill',
    captureBillingAddress: true,
  },
};
```

## Button Style Options

Customize the appearance of the Google Pay button. All style properties are optional.

| Option             | Type                                                                                                    | Default         | Description                                            |
| ------------------ | ------------------------------------------------------------------------------------------------------- | --------------- | ------------------------------------------------------ |
| `buttonType`       | `'book'` \| `'buy'` \| `'checkout'` \| `'donate'` \| `'order'` \| `'pay'` \| `'plain'` \| `'subscribe'` | `'buy'`         | Button label with localized text                       |
| `buttonColor`      | `'default'` \| `'black'` \| `'white'`                                                                   | `'black'`       | Button color theme                                     |
| `buttonSizeMode`   | `'static'` \| `'fill'`                                                                                  | `'fill'`        | Button sizing behavior                                 |
| `buttonRadius`     | `number`                                                                                                | —               | Corner radius in pixels (max depends on button height) |
| `buttonBorderType` | `'default_border'` \| `'no_border'`                                                                     | —               | Button border style                                    |
| `buttonLocale`     | `string`                                                                                                | Browser default | ISO 639-1 locale code (e.g., `'en'`, `'de'`, `'fr'`)   |

### Button Type Options

Each button type displays a localized label:

- `'buy'` - "Buy with Google Pay"
- `'checkout'` - "Checkout with Google Pay"
- `'pay'` - "Pay with Google Pay"
- `'order'` - "Order with Google Pay"
- `'book'` - "Book with Google Pay"
- `'donate'` - "Donate with Google Pay"
- `'subscribe'` - "Subscribe with Google Pay"
- `'plain'` - Google Pay logo only (no text)

### Button Color Options

- `'default'` / `'black'` - Black button, suitable for light backgrounds
- `'white'` - White button, suitable for dark backgrounds

### Button Size Mode

- `'static'` - Button is sized based on the translated `buttonType` label
- `'fill'` - Button fills the container width (use CSS `width` and `height` to control size)

### Button Border Type

- `'default_border'` - Renders the button with a visible border
- `'no_border'` - Renders the button without a border

### Style Examples

```typescript
// Standard black button
googlePay: {
  buttonType: 'checkout',
  buttonColor: 'black',
  buttonSizeMode: 'fill',
}

// White button with custom radius for dark backgrounds
googlePay: {
  buttonType: 'pay',
  buttonColor: 'white',
  buttonRadius: 8,
}

// Localized button (German)
googlePay: {
  buttonType: 'buy',
  buttonLocale: 'de',
}
```

:::note Supported Locales
Google Pay supports many locales including: `en`, `ar`, `bg`, `ca`, `cs`, `da`, `de`, `el`, `es`, `et`, `fi`, `fr`, `hr`, `id`, `it`, `ja`, `ko`, `ms`, `nl`, `no`, `pl`, `pt`, `ru`, `sk`, `sl`, `sr`, `sv`, `th`, `tr`, `uk`, and `zh`.
:::

## Express Checkout Features

Google Pay supports express checkout capabilities that capture customer information directly from the Google Pay payment sheet.

### Billing Address Capture

Capture the customer's billing address from their Google account:

```typescript
googlePay: {
  captureBillingAddress: true,
}
```

When enabled, the billing address is automatically extracted from the payment data and updated in the client session.

### Shipping Address Capture

Capture the customer's shipping address:

```typescript
googlePay: {
  captureShippingAddress: true,
  shippingAddressParameters: {
    allowedCountryCodes: ['US', 'CA', 'GB'], // optional
    phoneNumberRequired: true,
  },
}
```

| Option                      | Type      | Description                        |
| --------------------------- | --------- | ---------------------------------- |
| `captureShippingAddress`    | `boolean` | Enable shipping address capture    |
| `shippingAddressParameters` | `object`  | Configure shipping address options |

**Shipping Address Parameters:**

| Option                | Type       | Description                                           |
| --------------------- | ---------- | ----------------------------------------------------- |
| `allowedCountryCodes` | `string[]` | ISO 3166-1 alpha-2 country codes for allowed shipping |
| `phoneNumberRequired` | `boolean`  | Require phone number with shipping address            |

:::tip API Continuity
For backward compatibility, providing `shippingAddressParameters` (even empty `{}`) implicitly enables shipping address capture. You can also use the explicit `captureShippingAddress: true` option.
:::

### Email Capture

Capture the customer's email address:

```typescript
googlePay: {
  emailRequired: true,
}
```

## Advanced Options

### Existing Payment Method Required

Only show the Google Pay button if the user has an existing payment method saved:

```typescript
googlePay: {
  existingPaymentMethodRequired: true,
}
```

When set to `true` (in PRODUCTION environment), the button only displays if the user has a payment method that can be used for the transaction. This enables a one-tap checkout experience for returning users.

:::note Production Only
The `existingPaymentMethodRequired` option only affects button visibility in the PRODUCTION environment. In TEST mode, the button is always shown.
:::

## Supported Card Networks

Google Pay supports the following card networks:

| Network    | Description            |
| ---------- | ---------------------- |
| VISA       | Visa cards             |
| MASTERCARD | Mastercard cards       |
| AMEX       | American Express cards |
| DISCOVER   | Discover cards         |
| JCB        | JCB cards              |
| INTERAC    | Interac cards          |

The SDK automatically filters card networks based on your Primer configuration. If `orderedAllowedCardNetworks` is configured in your client session, only those networks will be available.

## Complete Configuration Example

```html
<primer-checkout client-token="your-client-token"></primer-checkout>

<script type="module">
  import { loadPrimer } from '@primer-io/primer-js';

  loadPrimer();

  const checkout = document.querySelector('primer-checkout');
  checkout.options = {
    sdkCore: true, // Required for Google Pay
    googlePay: {
      // Button styling
      buttonType: 'checkout',
      buttonColor: 'black',
      buttonSizeMode: 'fill',
      buttonRadius: 4,
      buttonLocale: 'en',

      // Billing information
      captureBillingAddress: true,

      // Shipping information
      captureShippingAddress: true,
      shippingAddressParameters: {
        allowedCountryCodes: ['US', 'CA', 'GB', 'DE', 'FR'],
        phoneNumberRequired: true,
      },

      emailRequired: true,

      // One-tap checkout for returning users
      existingPaymentMethodRequired: false,
    },
  };
</script>
```

## Display Items

When using express checkout with shipping, the Google Pay payment sheet displays line items to the customer. The SDK automatically builds display items from your order data:

- **Line items** - Individual products from `order.lineItems`
- **Fees** - Any fees from `order.fees` (non-zero amounts only)

If `merchantAmount` is set in the order, a simplified "Subtotal" view is shown instead.

## Testing

In TEST environment, Google Pay returns mock payment credentials. To test in PRODUCTION:

1. Register your website with the [Google Pay Business Console](https://pay.google.com/business/console/)
2. Use a real Google account with saved payment methods
3. Set `existingPaymentMethodRequired: true` to test one-tap checkout

## Client Options Reference

| Option                          | Type      | Default   | Description                                       |
| ------------------------------- | --------- | --------- | ------------------------------------------------- |
| `buttonType`                    | `string`  | `'buy'`   | Button label type                                 |
| `buttonColor`                   | `string`  | `'black'` | Button color theme                                |
| `buttonSizeMode`                | `string`  | `'fill'`  | Button sizing behavior                            |
| `buttonRadius`                  | `number`  | —         | Corner radius in pixels                           |
| `buttonBorderType`              | `string`  | —         | Button border style                               |
| `buttonLocale`                  | `string`  | —         | ISO 639-1 locale code                             |
| `captureBillingAddress`         | `boolean` | `false`   | Capture billing address from Google Pay           |
| `captureShippingAddress`        | `boolean` | `false`   | Capture shipping address from Google Pay          |
| `shippingAddressParameters`     | `object`  | —         | Shipping address configuration                    |
| `emailRequired`                 | `boolean` | `false`   | Capture email address from Google Pay             |
| `existingPaymentMethodRequired` | `boolean` | `false`   | Only show button if user has saved payment method |

## Related Documentation

- [Google Pay Web Developer Documentation](https://developers.google.com/pay/api/web) - Official Google Pay documentation
- [Google Pay Button Options](https://developers.google.com/pay/api/web/reference/request-objects#ButtonOptions) - Complete button customization reference
- [Payment Methods Guide](/guides/payment-methods-guide) - Integration patterns and best practices
