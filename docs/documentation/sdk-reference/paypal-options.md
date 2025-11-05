---
title: PayPal Options
sidebar_label: PayPal
sidebar_position: 5
description: Configuration options for PayPal payment integration
---

# PayPal Options

PayPal integration enables customers to pay using their PayPal account, credit/debit cards, Venmo, PayPal Credit, and other PayPal-supported funding sources. The SDK provides comprehensive configuration options for styling, funding controls, and vaulting.

:::warning SDK Core Required
PayPal only works with SDK Core enabled (`sdkCore: true` in your Primer configuration). For legacy SDK implementations, use `sdkCore: false`.
:::

## Configuration

Configure PayPal options through the checkout component's `options` property:

```typescript
import { loadPrimer } from '@primer-io/primer-js';

loadPrimer();

const checkout = document.querySelector('primer-checkout');
checkout.options = {
  sdkCore: true, // Required for PayPal
  paypal: {
    style: {
      layout: 'vertical',
      color: 'gold',
      shape: 'rect',
      height: 40,
    },
    disableFunding: ['credit', 'card'],
    vault: false,
  },
};
```

## PayPal Button Style Options

Customize the appearance of PayPal buttons using the `style` object. All style properties are optional.

| Option            | Type                                                                   | Default      | Description                                             |
| ----------------- | ---------------------------------------------------------------------- | ------------ | ------------------------------------------------------- |
| `layout`          | `'vertical'` \| `'horizontal'`                                         | `'vertical'` | Button layout orientation                               |
| `color`           | `'gold'` \| `'blue'` \| `'silver'` \| `'white'` \| `'black'`           | `'gold'`     | Button color theme                                      |
| `shape`           | `'rect'` \| `'pill'`                                                   | `'rect'`     | Button border shape                                     |
| `height`          | `number` (25-55)                                                       | `40`         | Button height in pixels (constrained by PayPal SDK)     |
| `label`           | `'paypal'` \| `'checkout'` \| `'buynow'` \| `'pay'` \| `'installment'` | `'paypal'`   | Button label text                                       |
| `tagline`         | `boolean`                                                              | `false`      | Show/hide tagline below button (horizontal layout only) |
| `borderRadius`    | `number` (0-55)                                                        | `4`          | Button corner radius in pixels                          |
| `disableMaxWidth` | `boolean`                                                              | `false`      | Disable maximum width constraint                        |

:::note Height Constraint
The `height` option is limited to 25-55 pixels by the PayPal JavaScript SDK. Values outside this range will be clamped.
:::

### Style Examples

```typescript
// Horizontal blue pill buttons
paypal: {
  style: {
    layout: 'horizontal',
    color: 'blue',
    shape: 'pill',
    height: 45,
    label: 'checkout',
    tagline: false,
  }
}

// Vertical silver buttons with custom border radius
paypal: {
  style: {
    layout: 'vertical',
    color: 'silver',
    shape: 'rect',
    height: 50,
    borderRadius: 8,
    disableMaxWidth: true,
  }
}
```

For complete style customization details, see the [PayPal Button Style Guide](https://developer.paypal.com/sdk/js/reference/#style).

## Vaulting

Enable vaulting to allow customers to save their PayPal account for future payments without re-authentication.

### Configuration

```typescript
paypal: {
  vault: true, // Enable vaulting in SDK
}
```

### Requirements

Vaulting requires **both** SDK configuration and server-side setup:

1. **SDK Configuration**: Set `vault: true` in PayPal options
2. **Client Session**: Configure `vaultOnSuccess: true` in your client session creation request

### Implementation Details

PayPal vaulting uses the **Billing Agreement API** to enable recurring payments and stored payment methods. The implementation requires:

- **Fraudnet/Magnes Library**: PayPal's fraud detection library collects device data during the vaulting flow
- **Customer ID**: Your client session must include a `customerId` parameter identifying the customer in your system
- **Device Data**: The SDK automatically sends device fingerprint data via `metadata.paypal_client_metadata_id`

:::note
Detailed vaulting implementation guide coming soon.
:::

### Configuration Options

**SDK Core (sdkCore: true)** - Use the `vault` option:

```typescript
paypal: {
  vault: true;
}
```

**Legacy SDK (sdkCore: false)** - Use the `paymentFlow` option:

```typescript
paypal: {
  paymentFlow: 'PREFER_VAULT';
}
```

Both options enable PayPal vaulting, but use the appropriate one based on your SDK mode.

## Funding Source Control

Control which PayPal funding sources are available to customers using `disableFunding` and `enableFunding` options.

:::tip Default Behavior
**All PayPal funding sources are enabled by default.** You only need to configure these options if you want to disable or explicitly enable specific sources.
:::

### Available Funding Sources

**Verified and Documented:**

- `card` - Guest card payments (credit/debit cards without PayPal account)
- `credit` - PayPal Credit (US, UK)
- `paylater` - PayPal Pay Later

:::note Additional Funding Sources
PayPal supports additional regional funding sources (Venmo, Bancontact, BLIK, iDEAL, Giropay, and others) through the `disableFunding` and `enableFunding` options. These are currently being verified and tested. More information coming soon.
:::

### Disable Funding Sources

Use `disableFunding` to hide specific payment options from customers:

```typescript
paypal: {
  disableFunding: ['credit', 'paylater', 'card'],
}
```

This configuration:

- Hides PayPal Credit, Pay Later, and guest card options
- Shows PayPal balance, bank accounts, Venmo, and other enabled sources
- Applies only to the PayPal button (separate payment method buttons not affected)

:::note Empty Arrays Omitted
Empty arrays (`disableFunding: []`) are not passed to the PayPal SDK. Use this when you want all funding sources enabled.
:::

### Enable Funding Sources

Use `enableFunding` to explicitly enable specific funding sources (advanced use case):

```typescript
paypal: {
  enableFunding: ['venmo'],
}
```

:::warning
`disableFunding` takes precedence over `enableFunding`. If a source appears in both arrays, it will be disabled.
:::

### Funding Control Examples

```typescript
// Only PayPal balance and bank account
paypal: {
  disableFunding: ['card', 'credit', 'paylater', 'venmo'],
}

// PayPal with Venmo only
paypal: {
  disableFunding: ['card', 'credit', 'paylater'],
  enableFunding: ['venmo'],
}

// Disable all alternative funding (PayPal account only)
paypal: {
  disableFunding: [
    'card', 'credit', 'paylater', 'venmo',
    'bancontact', 'blik', 'eps', 'giropay',
    'ideal', 'mercadopago', 'mybank', 'p24',
    'sepa', 'sofort',
  ],
}
```

For complete funding source details, see the [PayPal JS SDK Configuration](https://developer.paypal.com/sdk/js/configuration/).

## Testing and Development

### Sandbox Testing

Use `buyerCountry` to simulate different buyer locations in PayPal's sandbox environment:

```typescript
paypal: {
  buyerCountry: 'US', // Only works in sandbox mode
}
```

:::warning Sandbox Only
The `buyerCountry` option only works in PayPal's sandbox environment and is ignored in production.
:::

### Debug Mode

Enable debug logging for PayPal integration:

```typescript
paypal: {
  debug: true,
}
```

### Integration Date

Specify when your integration was built (affects PayPal SDK behavior):

```typescript
paypal: {
  integrationDate: '2024-01-15',
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
    sdkCore: true, // Required for PayPal
    paypal: {
      // Button styling
      style: {
        layout: 'vertical',
        color: 'gold',
        shape: 'pill',
        height: 45,
        label: 'checkout',
        tagline: true,
        borderRadius: 6,
        disableMaxWidth: false,
      },

      // Funding control
      disableFunding: ['credit', 'card'],
      enableFunding: ['venmo'],

      // Vaulting
      vault: true,

      // Testing (sandbox only)
      buyerCountry: 'US',
      debug: true,
      integrationDate: '2024-01-15',
    },
  };
</script>
```

## Related Documentation

- [PayPal JS SDK Configuration](https://developer.paypal.com/sdk/js/configuration/) - Official PayPal SDK documentation
- [PayPal Button Style Guide](https://developer.paypal.com/sdk/js/reference/#style) - Complete style customization reference
- [Payment Methods Guide](/guides/payment-methods-guide) - Integration patterns and best practices
