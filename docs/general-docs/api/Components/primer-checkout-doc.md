---
title: Checkout Component
sidebar_label: <primer-checkout>
sidebar_position: 0
description: The Checkout component is the main container for all Primer payment components and handles SDK initialization.
---

# Checkout Component

## \<primer-checkout\>

The `Checkout` component serves as the main container for all Primer payment components. It initializes the Primer SDK, manages the checkout state, and provides context to child components. This component can be used as a simple drop-in solution or as a foundation for a highly customized checkout experience.

## Usage

The Checkout component can be used in three ways:

```mermaid
flowchart TD
    A[Checkout Implementation Options] --> B[Drop-in Solution]
    A --> C[Customized via primer-main]
    A --> D[Fully Custom Implementation]

    B -->|"&lt;primer-checkout&gt; only"| E[Automatic display of<br>all payment methods]
    C -->|"Use slots within<br>&lt;primer-main&gt;"| F[Customize specific<br>checkout sections]
    D -->|"Replace &lt;primer-main&gt;<br>with custom content"| G[Complete control<br>over UI and flow]

    style A fill:#f9f9f9,stroke:#2f98ff,stroke-width:2px
    style B fill:#e1f5fe,stroke:#0288d1,stroke-width:1px
    style C fill:#e8f5e9,stroke:#388e3c,stroke-width:1px
    style D fill:#fff8e1,stroke:#ffa000,stroke-width:1px
    style E fill:#e3f2fd,stroke:#1976d2,stroke-width:1px
    style F fill:#e8f5e9,stroke:#388e3c,stroke-width:1px
    style G fill:#fff8e1,stroke:#ffa000,stroke-width:1px
```

### 1. As a Drop-in Solution

Simply add the component with a client token to render a complete, ready-to-use checkout experience:

```html
<primer-checkout client-token="your-client-token"></primer-checkout>
```

This minimal implementation automatically displays all available payment methods with default styling and behavior.

### 2. With Customized primer-main Component

Use the optional `primer-main` component with slots to customize specific parts of the checkout experience:

```html
<primer-checkout client-token="your-client-token">
  <primer-main slot="main">
    <!-- Custom payment method layout -->
    <div slot="payments">
      <primer-payment-method type="PAYMENT_CARD"></primer-payment-method>
      <primer-payment-method type="PAYPAL"></primer-payment-method>
    </div>

    <!-- Custom completion screen -->
    <div slot="checkout-complete">
      <h2>Thank you for your purchase!</h2>
    </div>
  </primer-main>
</primer-checkout>
```

### 3. With Fully Custom Implementation

Replace the `primer-main` component entirely with your own custom implementation:

```html
<primer-checkout client-token="your-client-token">
  <!-- Custom implementation without using primer-main -->
  <div slot="main" id="custom-checkout">
    <h2>Select Payment Method</h2>
    <div class="payment-options">
      <primer-payment-method type="PAYMENT_CARD"></primer-payment-method>
    </div>
  </div>
</primer-checkout>
```

For comprehensive layout customization options, see the [Layout Customizations Guide](/documentation/layout-customizations-guide).

## Properties

| Attribute        | Type      | Description                                                                     | Default |
| ---------------- | --------- | ------------------------------------------------------------------------------- | ------- |
| `client-token`   | `String`  | Required. The client token obtained from your Primer backend integration.       | `''`    |
| `options`        | `Object`  | Optional. Configuration options for the Primer SDK.                             | `{}`    |
| `custom-styles`  | `String`  | Optional. Stringified JSON object containing CSS custom properties for styling. | `''`    |
| `disable-loader` | `Boolean` | Optional. When true, disables the default loading spinner.                      | `false` |

## Slots

| Name   | Description                                                                                                                                                                                                                                                  |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `main` | Main content slot for checkout components. If no content is provided, a default `<primer-main>` component is rendered with all available payment methods. You can provide either a `<primer-main>` component or your own custom implementation in this slot. |

## Events

| Event Name                       | Description                                      | Event Detail              |
| -------------------------------- | ------------------------------------------------ | ------------------------- |
| `primer-checkout-initialized`    | Fired when the SDK is successfully initialized   | SDK instance              |
| `primer-payment-methods-updated` | Fired when payment methods are loaded            | Available payment methods |
| `primer-state-changed`           | Fired when the checkout state changes            | Current state object      |
| `primer-card-network-change`     | Fired when card network detection changes        | Card network information  |
| `primer-card-submit-success`     | Fired when a card form is successfully submitted | Submission result         |
| `primer-card-submit-errors`      | Fired when card form submission has errors       | Validation errors         |
| `primer-oncheckout-complete`     | Fired when checkout is completed successfully    | Payment payload           |
| `primer-oncheckout-failure`      | Fired when checkout process fails                | Error details and payment |

```mermaid
sequenceDiagram
    participant Checkout as primer-checkout
    participant YourApp

    Note over Checkout,YourApp: Initialization Phase
    Checkout->>YourApp: primer-checkout-initialized

    Note over Checkout,YourApp: Payment Method Discovery
    Checkout->>YourApp: primer-payment-methods-updated

    Note over Checkout,YourApp: Payment Processing
    YourApp->>Checkout: Submit Payment
    Checkout->>YourApp: primer-state-changed (isProcessing: true)

    alt Success Path
        Checkout->>YourApp: primer-card-submit-success
        Checkout->>YourApp: primer-state-changed (isSuccessful: true)
        Checkout->>YourApp: primer-oncheckout-complete (payment)
    else Error Path
        Checkout->>YourApp: primer-card-submit-errors
        Checkout->>YourApp: primer-state-changed (error: {...})
        Checkout->>YourApp: primer-oncheckout-failure (error, payment)
    end
```

## SDK Options

:::caution Temporary Implementation
The current SDK options structure documented here is temporary and will be changing. We will be moving away from the JSON-based configuration approach as we progress with the migration of our Headless SDK.
:::

The `options` property accepts a configuration object for the Primer SDK. When used as an HTML attribute, it must be a stringified JSON object. Remember that stringified JSON must use double quotes for property names and string values.

Here's a comprehensive overview of the available options:

### Core Options

| Option       | Type                | Description                                                        | Default          |
| ------------ | ------------------- | ------------------------------------------------------------------ | ---------------- |
| `locale`     | `String`            | Forces the locale for UI elements. Formats: "en-US", "fr-FR", etc. | Browser's locale |
| `apiVersion` | `"legacy" \| "2.4"` | API version to use when interacting with Primer backend.           | `"legacy"`       |

### Payment Method-Specific Options

<details>
<summary><strong>Card Options</strong></summary>

Controls the behavior of card payment methods.

```javascript
{
  "card": {
    "cardholderName": {
      "required": true  // Whether the cardholder name is required
    },
    "allowedCardNetworks": ["visa", "mastercard", "amex"]  // Limit accepted card types
  }
}
```

</details>

<details>
<summary><strong>Apple Pay Options</strong></summary>

Configures Apple Pay payment behavior.

```javascript
{
  "applePay": {
    // Deprecated - use billingOptions.requiredBillingContactFields instead
    "captureBillingAddress": false,

    "billingOptions": {
      // Required billing information to collect during checkout
      "requiredBillingContactFields": ["postalAddress", "phoneNumber", "emailAddress"]
    },

    "shippingOptions": {
      // Required shipping information to collect during checkout
      "requiredShippingContactFields": ["postalAddress", "name", "phoneNumber", "emailAddress"]
    }
  }
}
```

</details>

<details>
<summary><strong>Google Pay Options</strong></summary>

Configures Google Pay payment behavior.

```javascript
{
  "googlePay": {
    "captureBillingAddress": false,  // Whether to prompt for billing address
    "buttonTheme": "dark",           // "dark" or "light" button theme
    "buttonType": "buy"              // "buy", "checkout", "order", "plain", etc.
  }
}
```

</details>

<details>
<summary><strong>PayPal Options</strong></summary>

Configures PayPal payment behavior.

```javascript
{
  "paypal": {
    "captureBillingAddress": false,  // Whether to capture billing address
    "captureShippingAddress": false  // Whether to capture shipping address
  }
}
```

</details>

### Example of Complete Options Object

Here's an example of a complete options object with various settings:

```html
<primer-checkout
  client-token="your-client-token"
  options='{"locale":"en-GB","apiVersion":"2.4","card":{"cardholderName":{"required":true},"allowedCardNetworks":["visa","mastercard","amex"]},"applePay":{"billingOptions":{"requiredBillingContactFields":["postalAddress","emailAddress"]}},"googlePay":{"captureBillingAddress":true,"buttonTheme":"dark"}}'
>
  <primer-main slot="main"></primer-main>
</primer-checkout>
```

When using JavaScript:

```javascript
const checkout = document.querySelector('primer-checkout');
checkout.options = {
  locale: 'en-GB',
  apiVersion: '2.4',
  card: {
    cardholderName: {
      required: true,
    },
    allowedCardNetworks: ['visa', 'mastercard', 'amex'],
  },
  applePay: {
    billingOptions: {
      requiredBillingContactFields: ['postalAddress', 'emailAddress'],
    },
  },
  googlePay: {
    captureBillingAddress: true,
    buttonTheme: 'dark',
  },
};
```

### Important Notes on JSON Formatting

:::warning
When passing options to the `primer-checkout` component as an HTML attribute:

1. The entire options object must be a valid JSON string (use `JSON.stringify()` in JavaScript)
2. Use double quotes (`"`) for property names and string values
3. Do not include trailing commas
4. Boolean values should be `true` or `false` (not strings)
   :::

<div class="tabs-container">
<div class="tabs">
<div class="tab incorrect">Incorrect ❌</div>
<div class="tab correct">Correct ✅</div>
</div>

<div class="tab-content incorrect">

```html
<!-- Invalid: Single quotes around property names, trailing comma -->
<primer-checkout
  options='{"locale": "en-GB", "apiVersion": "2.4",}'
></primer-checkout>
```

</div>

<div class="tab-content correct">

```html
<!-- Valid: Proper JSON formatting -->
<primer-checkout
  options='{"locale":"en-GB","apiVersion":"2.4"}'
></primer-checkout>
```

</div>
</div>

## States

The Checkout component manages several states:

```mermaid
stateDiagram-v2
    [*] --> Loading: SDK Initialization
    Loading --> Error: Initialization Failed
    Loading --> Ready: SDK Initialized
    Ready --> Processing: Payment Started
    Processing --> Success: Payment Completed
    Processing --> Failure: Payment Failed

    Success --> [*]
    Failure --> Ready: User retries
    Error --> [*]
```

1. **Loading state**: During SDK initialization
2. **Error state**: When SDK initialization fails
3. **Ready state**: When SDK is initialized and ready to process payments
4. **Processing state**: During payment processing
5. **Success state**: When payment is completed successfully
6. **Failure state**: When payment processing fails

## CSS Custom Properties

Checkout Components use CSS Custom Properties (CSS Variables) to maintain a consistent design language across components. These tokens provide a standardized way to customize the appearance of your UI components.

You can apply tokens in two ways:

1. Using CSS Custom Properties directly in your stylesheets
2. Using JSON properties through the `custom-styles` attribute

<details>
<summary><strong>CSS Usage Example</strong></summary>

```css
/* Apply styling to all checkout components */
:root {
  --primer-color-brand: #2f98ff;
  --primer-radius-base: 4px;
  --primer-typography-brand: Inter, sans-serif;
  --primer-space-base: 4px;
  --primer-size-base: 4px;
  --primer-color-loader: #2f98ff;
  --primer-color-focus: #2f98ff;
}
```

</details>

<details>
<summary><strong>JSON Usage Example</strong></summary>

```html
<primer-checkout
  custom-styles='{"primerColorBrand":"#2f98ff","primerRadiusBase":"4px","primerTypographyBrand":"Inter, sans-serif","primerSpaceBase":"4px","primerSizeBase":"4px","primerColorLoader":"#2f98ff","primerColorFocus":"#2f98ff"}'
></primer-checkout>
```

</details>

:::tip
Choose the approach that best fits your project structure. The CSS approach offers more flexibility with selectors and media queries, while the JSON approach keeps styling concerns directly with the component instance.
:::

## Technical Implementation

The Checkout component:

1. **Initializes the Primer SDK** using the provided client token
2. **Manages locale settings** based on the options or falls back to browser default
3. **Provides context to child components** through various controllers
4. **Renders a default main component** when no content is provided
5. **Handles loading and error states** automatically

## Examples

<details>
<summary><strong>Basic Drop-in Implementation</strong></summary>

The simplest implementation with default behavior and styling:

```html
<primer-checkout client-token="your-client-token"></primer-checkout>
```

</details>

<details>
<summary><strong>Using primer-main with Customization</strong></summary>

```html
<primer-checkout client-token="your-client-token" options='{"locale":"en-GB"}'>
  <primer-main slot="main">
    <!-- Customize payment methods display -->
    <div slot="payments">
      <primer-payment-method type="PAYMENT_CARD"></primer-payment-method>
    </div>
  </primer-main>
</primer-checkout>
```

</details>

<details>
<summary><strong>Fully Custom Implementation</strong></summary>

```html
<primer-checkout client-token="your-client-token">
  <!-- Custom implementation without primer-main -->
  <div slot="main" class="custom-checkout">
    <h2>Complete Your Purchase</h2>
    <primer-payment-method type="PAYMENT_CARD"></primer-payment-method>
  </div>
</primer-checkout>
```

</details>

<details>
<summary><strong>With Custom Styling</strong></summary>

```html
<primer-checkout
  client-token="your-client-token"
  options='{"locale":"en-GB"}'
  custom-styles='{"primerColorBrand":"#4a6cf7","primerTypographyBrand":"Inter, sans-serif","primerRadiusBase":"4px","primerSpaceBase":"8px","primerSizeBase":"4px","primerColorLoader":"#4a6cf7","primerColorFocus":"#2f98ff"}'
>
  <primer-main slot="main"></primer-main>
</primer-checkout>
```

</details>

<details>
<summary><strong>With API Version and Card Options</strong></summary>

```html
<primer-checkout
  client-token="your-client-token"
  options='{"apiVersion":"2.4","locale":"en-GB","card":{"cardholderName":{"required":true}}}'
>
  <primer-main slot="main"></primer-main>
</primer-checkout>
```

</details>

<details>
<summary><strong>Complete Checkout with Event Handling</strong></summary>

```html
<primer-checkout
  id="checkout"
  client-token="your-client-token"
  options='{"locale":"en-GB"}'
>
  <primer-main slot="main">
    <div slot="payments">
      <!-- Custom payment methods layout -->
    </div>
    <div slot="checkout-complete">
      <h2>Thank you for your purchase!</h2>
      <p>Your order has been confirmed.</p>
    </div>
  </primer-main>
</primer-checkout>

<script>
  const checkout = document.getElementById('checkout');

  // Listen for payment methods loading
  checkout.addEventListener('primer-payment-methods-updated', (event) => {
    const paymentMethods = event.detail;
    console.log('Available payment methods:', paymentMethods.toArray());
  });

  // Listen for checkout state changes
  checkout.addEventListener('primer-state-changed', (event) => {
    const state = event.detail;
    if (state.isSuccessful) {
      console.log('Payment completed successfully');
    } else if (state.isProcessing) {
      console.log('Payment is processing');
    } else if (state.error) {
      console.error('Error:', state.error.message);
    }
  });

  // Listen for SDK initialization
  checkout.addEventListener('primer-checkout-initialized', (event) => {
    console.log('Checkout SDK initialized');
  });
</script>
```

</details>

<details>
<summary><strong>Dynamically Setting Options in JavaScript</strong></summary>

```html
<primer-checkout id="checkout" client-token="your-client-token">
  <primer-main slot="main"></primer-main>
</primer-checkout>

<script>
  const checkout = document.getElementById('checkout');

  // Set options directly as an object
  checkout.options = {
    locale: 'en-GB',
    apiVersion: '2.4',
    card: {
      cardholderName: {
        required: true,
      },
    },
  };
</script>
```

</details>

## Locale Support

The Checkout component supports internationalization through the `locale` option. Set the desired locale in the options object:

```html
<primer-checkout client-token="your-client-token" options='{"locale":"fr-FR"}'>
  <primer-main slot="main"></primer-main>
</primer-checkout>
```

The full list of supported locales can be found in the [Localization and languages
section](https://primer.io/docs/payments/universal-checkout/drop-in/customize-checkout/web#localization-and-languages).

:::note
If an unsupported locale is provided, the component will fall back to the default 'en-GB' locale with a warning message in the console.
:::

:::warning
At present the Checkout Components only support left-to-right (LTR) languages.
:::

## Disable Loader Option

You can disable the default loading spinner that appears during SDK initialization by using the `disable-loader` attribute:

```html
<primer-checkout client-token="your-client-token" disable-loader>
  <primer-main slot="main"></primer-main>
</primer-checkout>
```

This is useful when you want to implement your own custom loading indicator or when integrating the checkout into a page that already has a loader.

## Key Considerations

:::info Summary of Key Points

- The Checkout component functions as a complete checkout solution out of the box, requiring only a client token
- Without custom layout, the component automatically displays all available payment methods
- The `primer-main` component is optional - you can provide your own custom implementation in the `main` slot
- When using a custom implementation instead of `primer-main`, you'll need to listen to checkout events to handle different checkout states
- For custom layouts, use the `main` slot to provide your own content configuration
- The component automatically handles loading states and error messages
- All Primer payment components must be used within the Checkout component
- Unsupported locales will fall back to 'en-GB' with a console warning
- When using the `options` property directly in JavaScript, you can pass it as an object; when using it as an HTML attribute, it must be a stringified JSON object
- The `custom-styles` attribute accepts a stringified JSON object with camelCase property names that map to kebab-case CSS variables
  :::

For advanced customization, refer to the [Layout Customizations Guide](/documentation/layout-customizations-guide).
