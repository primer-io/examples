# Primer Web Components - Component Reference

## Core Components

### `<primer-checkout>`

The root component that initializes the Primer SDK and manages the checkout flow.

**Required Attributes:**

- `client-token` - JWT token from backend client session

**Optional Attributes:**

- `custom-styles` - JSON string of CSS custom properties
- `loader-disabled` - Boolean to disable loading indicator

**Properties (set via JavaScript):**

- `options` - SDK configuration object (locale, payment methods, etc.)

**Example:**

```html
<primer-checkout client-token="eyJ0eXAiOiJKV1QiLCJhbGc...">
  <primer-main slot="main">
    <!-- Content -->
  </primer-main>
</primer-checkout>
```

### `<primer-main>`

Container for checkout content with predefined slots for different states.

**Slots:**

- `payments` - Main payment method selection area
- `checkout-complete` - Success state content
- `checkout-failure` - Error state content

**Example:**

```html
<primer-main slot="main">
  <div slot="payments">
    <primer-payment-method type="PAYMENT_CARD"></primer-payment-method>
  </div>
  <div slot="checkout-complete">
    <h2>Payment Successful!</h2>
  </div>
</primer-main>
```

### `<primer-payment-method>`

Displays a specific payment method.

**Attributes:**

- `type` - Payment method type (PAYMENT_CARD, PAYPAL, APPLE_PAY, GOOGLE_PAY, etc.)
- `disabled` - Boolean to disable the payment method

**Example:**

```html
<primer-payment-method type="PAYMENT_CARD"></primer-payment-method>
<primer-payment-method type="PAYPAL"></primer-payment-method>
<primer-payment-method type="GOOGLE_PAY" disabled></primer-payment-method>
```

### `<primer-payment-method-container>`

Declarative container for automatically rendering filtered payment methods.

**Attributes:**

- `include` - Comma-separated list of payment method types to include
- `exclude` - Comma-separated list of payment method types to exclude

**Example:**

```html
<!-- Show only digital wallets -->
<primer-payment-method-container
  include="APPLE_PAY,GOOGLE_PAY"
></primer-payment-method-container>

<!-- Show everything except cards -->
<primer-payment-method-container
  exclude="PAYMENT_CARD"
></primer-payment-method-container>
```

## Card Form Components

### `<primer-card-form>`

Container for card payment inputs with built-in validation and state management.

**Slots:**

- `card-form-content` - Custom content area for inputs

**Example:**

```html
<primer-card-form>
  <div slot="card-form-content">
    <primer-input-card-number></primer-input-card-number>
    <primer-input-card-expiry></primer-input-card-expiry>
    <primer-input-cvv></primer-input-cvv>
    <primer-card-form-submit></primer-card-form-submit>
  </div>
</primer-card-form>
```

### `<primer-input-card-number>`

Secure card number input field with automatic card type detection.

**DOM Structure:**

```html
<primer-input-wrapper>
  <primer-input-label slot="label">Card Number</primer-input-label>
  <div slot="input">
    <!-- Secure iframe for card number -->
    <primer-card-network-selector></primer-card-network-selector>
  </div>
</primer-input-wrapper>
```

### `<primer-input-card-expiry>`

Expiration date input with automatic formatting (MM/YY).

### `<primer-input-cvv>`

CVV/security code input field.

### `<primer-input-card-holder-name>`

Cardholder name text input (not in secure iframe).

### `<primer-card-form-submit>`

Localized submit button for card forms.

## Base UI Components

### `<primer-input-wrapper>`

Container that provides consistent styling for form inputs.

**Attributes:**

- `has-error` - Boolean to show error state

**Slots:**

- `label` - For primer-input-label
- `input` - For primer-input or custom content
- `error` - For primer-input-error

**Example:**

```html
<primer-input-wrapper>
  <primer-input-label slot="label">Email</primer-input-label>
  <primer-input slot="input" type="email"></primer-input>
  <primer-input-error slot="error">Invalid email</primer-input-error>
</primer-input-wrapper>
```

### `<primer-input>`

Standard input field with consistent styling.

**Attributes:**

- Standard HTML input attributes: `type`, `value`, `placeholder`, `disabled`, `required`, etc.
- `name` - For form data collection

**Events:**

- `input` - Value changed
- `change` - Value committed (blur/Enter)
- `focus` - Input focused
- `blur` - Input blurred
- `invalid` - Validation failed

### `<primer-input-label>`

Form label component.

**Attributes:**

- `for` - ID of associated input
- `disabled` - Boolean for disabled state

### `<primer-input-error>`

Error message component.

**Attributes:**

- `for` - ID of associated input
- `active` - Boolean to show/hide error

### `<primer-button>`

Styled button component.

**Attributes:**

- `variant` - "primary" or "secondary"
- `buttonType` - "button" or "submit"
- `disabled` - Boolean

**Example:**

```html
<primer-button variant="primary">Pay Now</primer-button>
<primer-button variant="secondary">Cancel</primer-button>
```

## Utility Components

### `<primer-error-message-container>`

Automatically displays payment processing errors.

**Example:**

```html
<div slot="payments">
  <primer-payment-method type="PAYMENT_CARD"></primer-payment-method>
  <primer-error-message-container></primer-error-message-container>
</div>
```

### `<primer-vault-manager>`

Displays saved payment methods when vault is enabled.

**Requires:**

- Vault enabled in SDK options: `{"vault": {"enabled": true}}`

### `<primer-show-other-payments>`

Manages visibility of alternative payment methods when vault is active.

**Slots:**

- `other-payments` - Content shown when "Show other payments" is clicked

## Events

### Checkout Events

**`primer:ready`**

- Fired when SDK initialization completes
- Detail: None

**`primer:state-change`**

- Fired when checkout state changes
- Detail: `{isProcessing, isSuccessful, error}`

**`primer-payment-methods-updated`**

- Fired when available payment methods change
- Detail: Array of payment method objects with `.toArray()` method

**Example:**

```javascript
checkout.addEventListener('primer:ready', () => {
  console.log('SDK ready');
});

checkout.addEventListener('primer:state-change', (event) => {
  const { isProcessing, isSuccessful, error } = event.detail;
  // Handle state
});

checkout.addEventListener('primer-payment-methods-updated', (event) => {
  const methods = event.detail.toArray();
  // Handle methods
});
```

## SDK Options Structure

```typescript
interface SDKOptions {
  // Localization
  locale?: string; // e.g., 'en-GB', 'fr-FR'

  // Payment method specific options
  paymentMethodOptions?: {
    PAYMENT_CARD?: {
      requireCVV?: boolean;
      requireBillingAddress?: boolean;
      cardholderName?: {
        required?: boolean;
        visible?: boolean;
      };
    };
    APPLE_PAY?: {
      merchantName?: string;
      merchantCountryCode?: string;
      buttonType?: 'buy' | 'donate' | 'plain' | 'checkout';
      buttonStyle?: 'black' | 'white' | 'white-outline';
    };
    GOOGLE_PAY?: {
      buttonTheme?: 'dark' | 'light';
      buttonType?: 'buy' | 'donate' | 'plain' | 'checkout';
    };
  };

  // Vault configuration
  vault?: {
    enabled?: boolean;
  };

  // Core SDK features
  sdkCore?: boolean;
}
```

## CSS Custom Properties

### Brand Colors

- `--primer-color-brand` - Primary brand color
- `--primer-color-loader` - Loading indicator color
- `--primer-color-focus` - Focus state color

### Typography

- `--primer-typography-brand` - Font family

### Spacing & Sizing

- `--primer-space-base` - Base spacing unit (default: 4px)
- `--primer-size-base` - Base size unit (default: 4px)
- `--primer-radius-base` - Border radius (default: 4px)

### Theme-Specific Variables

```css
.primer-light-theme {
  --primer-color-text-primary: var(--primer-color-gray-900);
  --primer-color-background-outlined-default: var(--primer-color-gray-000);
}

.primer-dark-theme {
  --primer-color-text-primary: var(--primer-color-gray-100);
  --primer-color-background-outlined-default: var(--primer-color-gray-800);
}
```

### Usage Example

```css
:root {
  --primer-color-brand: #2f98ff;
  --primer-radius-base: 8px;
  --primer-typography-brand: 'Inter, sans-serif';
}

/* Or apply to specific checkout */
primer-checkout {
  --primer-color-brand: #4a6cf7;
  --primer-radius-base: 4px;
}
```
