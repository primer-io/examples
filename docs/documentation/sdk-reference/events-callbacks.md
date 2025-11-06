---
title: Events & Callbacks Reference
sidebar_label: Events & Callbacks
sidebar_position: 2
description: Technical reference for Primer SDK events and callbacks
---

# Events & Callbacks Reference

Complete technical reference for all Primer SDK events, callbacks, and instance methods.

:::tip Practical Guide Available
For practical examples and implementation patterns, see the [Events Guide](/guides/events-guide).
:::

## DOM Events

All Primer SDK events are CustomEvents with `bubbles: true` and `composed: true`, allowing them to propagate through the DOM and cross shadow DOM boundaries.

### Events Overview

| Event Name                    | Detail Type                | Description                                                             |
| ----------------------------- | -------------------------- | ----------------------------------------------------------------------- |
| `primer:state-change`         | `SdkStateContextType`      | Dispatched when SDK state changes (loading, processing, success, error) |
| `primer:methods-update`       | `InitializedPayments`      | Dispatched when available payment methods are updated                   |
| `primer:ready`                | `PrimerJS`                 | Dispatched when SDK is fully initialized and ready                      |
| `primer:card-network-change`  | `CardNetworksContextType`  | Dispatched when card network is detected or changed                     |
| `primer:card-submit`          | `CardSubmitPayload`        | Triggerable event to submit the card form programmatically              |
| `primer:card-success`         | `CardSubmitSuccessPayload` | Dispatched when card form submission succeeds                           |
| `primer:card-error`           | `CardSubmitErrorsPayload`  | Dispatched when card form validation errors occur                       |
| `primer:payment-start`        | `undefined`                | Dispatched when payment creation begins                                 |
| `primer:payment-success`      | `PaymentSuccessData`       | Dispatched when payment completes successfully with PII-filtered data   |
| `primer:payment-failure`      | `PaymentFailureData`       | Dispatched when payment fails with error details                        |
| `primer:vault:methods-update` | `VaultedMethodsUpdateData` | Dispatched when vaulted payment methods are loaded or updated           |

### `primer:state-change`

Dispatched when SDK state changes during the payment lifecycle.

:::note Changed in v0.7.0
The `error` property has been renamed to `primerJsError` and the `failure` property has been renamed to `paymentFailure` with an updated structure.
:::

**Payload Properties:**

| Property         | Type                                                                                                        | Description                                                  |
| ---------------- | ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| `isSuccessful`   | `boolean`                                                                                                   | Whether the payment operation completed successfully         |
| `isProcessing`   | `boolean`                                                                                                   | Whether a payment operation is currently in progress         |
| `primerJsError`  | `Error \| null`                                                                                             | SDK initialization or component error object                 |
| `isLoading`      | `boolean`                                                                                                   | Whether the SDK is loading resources or initializing         |
| `paymentFailure` | `{ code: string; message: string; diagnosticsId?: string \| null; data?: Record<string, unknown> } \| null` | Payment processing failure with structured error information |

**Usage Note:** Listen to this event to show loading spinners, success messages, or error states.

### `primer:methods-update`

Dispatched when available payment methods are loaded or updated.

**Payload Properties:**

The event detail is an `InitializedPayments` instance with the following methods:

| Method            | Returns                               | Description                                    |
| ----------------- | ------------------------------------- | ---------------------------------------------- |
| `toArray()`       | `InitializedPaymentMethod[]`          | Returns all payment methods as an array        |
| `size()`          | `number`                              | Returns the count of available payment methods |
| `get<T>(type: T)` | `PaymentMethodByType<T> \| undefined` | Retrieves a specific payment method by type    |

**Usage Note:** Use this event to dynamically render payment methods or check availability.

### `primer:ready`

Dispatched when the Primer SDK is fully initialized and ready for use.

:::note Changed in v0.7.0
The `onPaymentComplete` callback has been replaced with `onPaymentSuccess` and `onPaymentFailure` callbacks. The `onVaultedMethodsUpdate` callback has been added.
:::

**Payload Properties:**

The event detail contains the `PrimerJS` instance with the following properties:

| Property                 | Type                                                   | Description                                  |
| ------------------------ | ------------------------------------------------------ | -------------------------------------------- |
| `onPaymentStart`         | `() => void`                                           | Callback for payment creation start          |
| `onPaymentPrepare`       | `(data: PaymentData, handler: PrepareHandler) => void` | Callback for payment preparation             |
| `onPaymentSuccess`       | `(data: PaymentSuccessData) => void`                   | Callback for successful payment completion   |
| `onPaymentFailure`       | `(data: PaymentFailureData) => void`                   | Callback for payment failure                 |
| `onVaultedMethodsUpdate` | `(data: VaultedMethodsUpdateData) => void`             | Callback for vaulted payment methods updates |
| `refreshSession()`       | `() => Promise<void>`                                  | Method to refresh the checkout session       |
| `getPaymentMethods()`    | `() => PaymentMethodInfo[]`                            | Method to retrieve cached payment methods    |

**Usage Note:** Use this event to configure callbacks and access PrimerJS instance methods.

### `primer:card-network-change`

Dispatched when card network is detected or changes based on card number input.

**Payload Properties:**

| Property                 | Type                  | Description                                            |
| ------------------------ | --------------------- | ------------------------------------------------------ |
| `detectedCardNetwork`    | `CardNetwork \| null` | The detected card network (Visa, Mastercard, etc.)     |
| `selectableCardNetworks` | `CardNetwork[]`       | Array of selectable card networks for co-branded cards |
| `isLoading`              | `boolean`             | Whether card network detection is in progress          |

**CardNetwork Type:**

| Property      | Type     | Description                      |
| ------------- | -------- | -------------------------------- |
| `displayName` | `string` | Human-readable card network name |
| `network`     | `string` | Card network identifier          |

**Usage Note:** Use this event to display card brand logos or network-specific messaging.

### `primer:card-submit`

Triggerable event to submit the card form programmatically from anywhere in your application.

**Payload Properties:**

| Property | Type                | Description                                               |
| -------- | ------------------- | --------------------------------------------------------- |
| `source` | `string` (optional) | Identifier for the trigger source (e.g., "custom-button") |

**Usage Note:** Dispatch this event to trigger card form submission when using external submit buttons.

### `primer:card-success`

Dispatched when card form submission completes successfully.

**Payload Properties:**

| Property | Type               | Description            |
| -------- | ------------------ | ---------------------- |
| `result` | `CardSubmitResult` | Submission result data |

**CardSubmitResult Type:**

| Property      | Type                 | Description                       |
| ------------- | -------------------- | --------------------------------- |
| `success`     | `boolean` (optional) | Whether submission was successful |
| `token`       | `string` (optional)  | Payment token generated           |
| `analyticsId` | `string` (optional)  | Analytics tracking identifier     |
| `paymentId`   | `string` (optional)  | Payment identifier                |

**Usage Note:** Use this event to confirm successful card form validation and submission.

### `primer:card-error`

Dispatched when card form validation errors occur.

**Payload Properties:**

| Property | Type                     | Description                |
| -------- | ------------------------ | -------------------------- |
| `errors` | `InputValidationError[]` | Array of validation errors |

**InputValidationError Type:**

| Property | Type     | Description                       |
| -------- | -------- | --------------------------------- |
| `field`  | `string` | Field name that failed validation |
| `name`   | `string` | Error name/type                   |
| `error`  | `string` | Human-readable error message      |

**Usage Note:** Use this event to display validation error messages to users.

### `primer:payment-start`

:::tip New in v0.7.0
This event provides more granular control over payment flow tracking.
:::

Dispatched when payment creation begins.

**Payload Properties:**

This event has no detail payload (`undefined`).

**Usage Note:** Listen to this event to show loading indicators when the payment flow starts. Use this for UI feedback without coupling to specific payment callbacks.

**Example:**

```typescript
document.addEventListener('primer:payment-start', () => {
  console.log('Payment creation has started');
  // Show loading spinner
});
```

### `primer:payment-success`

:::tip New in v0.7.0
This event provides PII-filtered payment data for safe client-side processing and analytics.
:::

Dispatched when payment completes successfully.

**Payload Properties:**

| Property            | Type             | Description                                                |
| ------------------- | ---------------- | ---------------------------------------------------------- |
| `paymentSummary`    | `PaymentSummary` | PII-filtered payment data including last 4 digits, network |
| `paymentMethodType` | `string`         | Payment method type identifier (e.g., "PAYMENT_CARD")      |
| `timestamp`         | `number`         | Unix timestamp (seconds) when payment succeeded            |

**PaymentSummary Type:**

| Property                     | Type      | Description                               |
| ---------------------------- | --------- | ----------------------------------------- |
| `last4Digits`                | `string`  | Last 4 digits of the payment card         |
| `expirationMonth`            | `string`  | Card expiration month                     |
| `expirationYear`             | `string`  | Card expiration year                      |
| `cardholderName`             | `string`  | Name on the card                          |
| `network`                    | `string`  | Card network (e.g., "VISA", "MASTERCARD") |
| `isNetworkTokenized`         | `boolean` | Whether the card is network tokenized     |
| `paymentInstrumentType`      | `string`  | Type of payment instrument                |
| `billingAddress`             | `object`  | Billing address details                   |
| `threeDSecureAuthentication` | `object`  | 3DS authentication information            |

:::note PII Protection
The `PaymentSummary` object is automatically filtered to remove PII, making it safe for client-side analytics and logging.
:::

**Usage Note:** Use this event for success analytics, confirmation displays, and updating your UI with payment details. The filtered data is safe for client-side storage and tracking.

**Example:**

```typescript
document.addEventListener('primer:payment-success', ((
  event: CustomEvent<PaymentSuccessData>,
) => {
  const { paymentSummary, paymentMethodType, timestamp } = event.detail;

  console.log('Payment succeeded!');
  console.log('Card ending in:', paymentSummary.last4Digits);
  console.log('Network:', paymentSummary.network);
  console.log('Payment method:', paymentMethodType);

  // Show success message with safe details
  showSuccessMessage(
    `Payment completed using ${paymentSummary.network} ending in ${paymentSummary.last4Digits}`,
  );
}) as EventListener);
```

### `primer:payment-failure`

:::tip New in v0.7.0
This event provides structured error information for consistent error handling.
:::

Dispatched when payment fails.

**Payload Properties:**

| Property              | Type                                 | Description                                                       |
| --------------------- | ------------------------------------ | ----------------------------------------------------------------- |
| `error`               | `object`                             | Structured error information                                      |
| `error.code`          | `string`                             | Error code identifier                                             |
| `error.message`       | `string`                             | Human-readable error message                                      |
| `error.diagnosticsId` | `string \| null` (optional)          | Diagnostic identifier for support                                 |
| `error.data`          | `Record<string, unknown>` (optional) | Additional error context data                                     |
| `paymentSummary`      | `PaymentSummary \| undefined`        | PII-filtered payment data (if payment was created before failure) |
| `paymentMethodType`   | `string`                             | Payment method type identifier                                    |
| `timestamp`           | `number`                             | Unix timestamp (seconds) when payment failed                      |

**Usage Note:** Use this event for error tracking, displaying failure messages to users, and enabling retry logic. The `diagnosticsId` can be used for support inquiries.

**Example:**

```typescript
document.addEventListener('primer:payment-failure', ((
  event: CustomEvent<PaymentFailureData>,
) => {
  const { error, paymentMethodType, paymentSummary } = event.detail;

  console.error('Payment failed:', error.message);
  console.error('Error code:', error.code);

  if (error.diagnosticsId) {
    console.error('Diagnostics ID:', error.diagnosticsId);
  }

  // Show error message to user
  showErrorMessage(`Payment failed: ${error.message}`, {
    allowRetry: true,
    diagnosticsId: error.diagnosticsId,
  });
}) as EventListener);
```

### `primer:vault:methods-update`

:::tip New in v0.7.0
This event allows tracking of vaulted payment methods without directly accessing the vault component.
:::

Dispatched when vaulted payment methods are loaded or updated.

**Payload Properties:**

| Property          | Type                         | Description                              |
| ----------------- | ---------------------------- | ---------------------------------------- |
| `vaultedPayments` | `InitializedVaultedPayments` | Wrapper class containing vaulted methods |
| `timestamp`       | `number`                     | Unix timestamp (seconds) when updated    |

**InitializedVaultedPayments Methods:**

| Method      | Returns                                    | Description                                  |
| ----------- | ------------------------------------------ | -------------------------------------------- |
| `get(id)`   | `VaultedPaymentMethodSummary \| undefined` | Retrieves a specific vaulted payment by ID   |
| `toArray()` | `VaultedPaymentMethodSummary[]`            | Returns all vaulted payment methods as array |
| `size()`    | `number`                                   | Returns the count of vaulted payment methods |

**VaultedPaymentMethodSummary Type:**

| Property            | Type     | Description                               |
| ------------------- | -------- | ----------------------------------------- |
| `id`                | `string` | Unique identifier for the vaulted payment |
| `paymentMethodType` | `string` | Payment method type identifier            |
| `last4Digits`       | `string` | Last 4 digits of the payment card         |
| `expirationMonth`   | `string` | Card expiration month                     |
| `expirationYear`    | `string` | Card expiration year                      |
| `cardholderName`    | `string` | Name on the card                          |
| `network`           | `string` | Card network                              |

**Usage Note:** Use this event to update your vault UI, track the number of saved payment methods, or react to changes in the user's vaulted payments.

**Example:**

```typescript
document.addEventListener('primer:vault:methods-update', ((
  event: CustomEvent<VaultedMethodsUpdateData>,
) => {
  const { vaultedPayments, timestamp } = event.detail;

  console.log('Vaulted payment methods updated');
  console.log('Total vaulted methods:', vaultedPayments.size());

  // Render vaulted payment methods in UI
  const methods = vaultedPayments.toArray();
  methods.forEach((method) => {
    console.log(`${method.network} ending in ${method.last4Digits}`);
  });

  // Update UI
  updateVaultDisplay(methods);
}) as EventListener);
```

## PrimerJS Callbacks

Callbacks are set on the PrimerJS instance (accessible via the `primer:ready` event) to handle payment lifecycle events.

### Callbacks Overview

| Callback                 | Parameters                                   | Description                                                  |
| ------------------------ | -------------------------------------------- | ------------------------------------------------------------ |
| `onPaymentStart`         | None                                         | Called when payment creation begins                          |
| `onPaymentPrepare`       | `data: PaymentData, handler: PrepareHandler` | Called before payment is created, allows validation or abort |
| `onPaymentSuccess`       | `data: PaymentSuccessData`                   | Called when payment completes successfully                   |
| `onPaymentFailure`       | `data: PaymentFailureData`                   | Called when payment fails                                    |
| `onVaultedMethodsUpdate` | `data: VaultedMethodsUpdateData`             | Called when vaulted payment methods update                   |

### onPaymentStart

Called when payment creation begins.

```typescript
onPaymentStart?: () => void;
```

**Usage Note:** Use this callback to show loading indicators or disable UI elements during payment processing.

### onPaymentPrepare

Called before payment is created, allowing validation or aborting the payment flow.

```typescript
onPaymentPrepare?: (data: PaymentData, handler: PrepareHandler) => void;
```

**Parameters:**

| Name      | Type             | Description                                                                  |
| --------- | ---------------- | ---------------------------------------------------------------------------- |
| `data`    | `PaymentData`    | Contains `paymentMethodType` being used                                      |
| `handler` | `PrepareHandler` | Object with `continuePaymentCreation()` and `abortPaymentCreation()` methods |

**Usage Note:** Use this callback to validate order details or perform pre-payment checks before proceeding.

### onPaymentSuccess

:::tip New in v0.7.0
Replaces `onPaymentComplete` for successful payments with PII-filtered data.
:::

Called when payment completes successfully.

```typescript
onPaymentSuccess?: (data: PaymentSuccessData) => void;
```

**Parameters:**

| Name   | Type                 | Description                                     |
| ------ | -------------------- | ----------------------------------------------- |
| `data` | `PaymentSuccessData` | Contains PII-filtered payment data and metadata |

**PaymentSuccessData Structure:**

| Property            | Type             | Description                                                |
| ------------------- | ---------------- | ---------------------------------------------------------- |
| `paymentSummary`    | `PaymentSummary` | PII-filtered payment data including last 4 digits, network |
| `paymentMethodType` | `string`         | Payment method type identifier                             |
| `timestamp`         | `number`         | Unix timestamp (seconds) when payment succeeded            |

**Usage Note:** Use this callback to handle successful payments, redirect users to confirmation pages, and track analytics. The `paymentSummary` object is automatically filtered for PII protection.

**Example:**

```typescript
primerCheckout.onPaymentSuccess = (data) => {
  const { paymentSummary, paymentMethodType } = data;

  console.log('Payment successful!');
  console.log(
    `Card: ${paymentSummary.network} ending in ${paymentSummary.last4Digits}`,
  );

  // Redirect to success page
  window.location.href = `/order-confirmation?payment=${paymentMethodType}`;
};
```

### onPaymentFailure

:::tip New in v0.7.0
Replaces `onPaymentComplete` for failed payments with structured error information.
:::

Called when payment fails.

```typescript
onPaymentFailure?: (data: PaymentFailureData) => void;
```

**Parameters:**

| Name   | Type                 | Description                            |
| ------ | -------------------- | -------------------------------------- |
| `data` | `PaymentFailureData` | Contains error information and context |

**PaymentFailureData Structure:**

| Property              | Type                                 | Description                                                       |
| --------------------- | ------------------------------------ | ----------------------------------------------------------------- |
| `error`               | `object`                             | Structured error information                                      |
| `error.code`          | `string`                             | Error code identifier                                             |
| `error.message`       | `string`                             | Human-readable error message                                      |
| `error.diagnosticsId` | `string \| null` (optional)          | Diagnostic identifier for support                                 |
| `error.data`          | `Record<string, unknown>` (optional) | Additional error context data                                     |
| `paymentSummary`      | `PaymentSummary \| undefined`        | PII-filtered payment data (if payment was created before failure) |
| `paymentMethodType`   | `string`                             | Payment method type identifier                                    |
| `timestamp`           | `number`                             | Unix timestamp (seconds) when payment failed                      |

**Usage Note:** Use this callback to display error messages to users, enable retry logic, and track payment failures. The `diagnosticsId` can be shared with support teams for troubleshooting.

**Example:**

```typescript
primerCheckout.onPaymentFailure = (data) => {
  const { error, paymentMethodType } = data;

  console.error('Payment failed:', error.message);

  // Display error to user
  showErrorNotification({
    title: 'Payment Failed',
    message: error.message,
    diagnosticsId: error.diagnosticsId,
    allowRetry: true,
  });

  // Track failure in analytics
  trackPaymentFailure({
    errorCode: error.code,
    paymentMethod: paymentMethodType,
  });
};
```

### onVaultedMethodsUpdate

:::tip New in v0.7.0
New callback for tracking changes to vaulted payment methods.
:::

Called when vaulted payment methods are loaded or updated.

```typescript
onVaultedMethodsUpdate?: (data: VaultedMethodsUpdateData) => void;
```

**Parameters:**

| Name   | Type                       | Description                                 |
| ------ | -------------------------- | ------------------------------------------- |
| `data` | `VaultedMethodsUpdateData` | Contains vaulted payment methods collection |

**VaultedMethodsUpdateData Structure:**

| Property          | Type                         | Description                              |
| ----------------- | ---------------------------- | ---------------------------------------- |
| `vaultedPayments` | `InitializedVaultedPayments` | Wrapper class containing vaulted methods |
| `timestamp`       | `number`                     | Unix timestamp (seconds) when updated    |

**Usage Note:** Use this callback to update your vault UI when payment methods are added, removed, or modified. The `InitializedVaultedPayments` class provides convenient methods to access vaulted payment data.

**Example:**

```typescript
primerCheckout.onVaultedMethodsUpdate = (data) => {
  const { vaultedPayments } = data;

  console.log(`Loaded ${vaultedPayments.size()} vaulted payment methods`);

  // Update UI with vaulted methods
  const methods = vaultedPayments.toArray();
  renderVaultedPaymentMethods(methods);

  // Get specific method by ID
  const primaryMethod = vaultedPayments.get('payment-method-id-123');
  if (primaryMethod) {
    setDefaultPaymentMethod(primaryMethod);
  }
};
```

## PrimerJS Instance Methods

Public methods available on the PrimerJS instance (accessible via the `primer:ready` event).

### Methods Overview

| Method                    | Returns               | Description                                                   |
| ------------------------- | --------------------- | ------------------------------------------------------------- |
| `refreshSession()`        | `Promise<void>`       | Synchronizes client-side SDK with server-side session updates |
| `getPaymentMethods()`     | `PaymentMethodInfo[]` | Returns cached list of available payment methods              |
| `setCardholderName(name)` | `void`                | Programmatically sets the cardholder name field value         |

### refreshSession()

Synchronizes client-side SDK with server-side session updates.

```typescript
async refreshSession(): Promise<void>
```

**Use Case:** Call this method after updating the checkout session on your server to refresh payment methods or order details.

### getPaymentMethods()

Returns the cached list of available payment methods.

```typescript
getPaymentMethods(): PaymentMethodInfo[]
```

**Use Case:** Use this method to check which payment methods are available without waiting for events.

### setCardholderName()

:::tip New in v0.7.1
Programmatically set the cardholder name value in card payment forms.
:::

Sets the cardholder name field value programmatically.

```typescript
setCardholderName(cardholderName: string): void
```

**Parameters:**

| Name             | Type     | Description                |
| ---------------- | -------- | -------------------------- |
| `cardholderName` | `string` | The cardholder name to set |

**Use Case:** Pre-fill the cardholder name from user profile data, auto-complete from previous transactions, or synchronize with external form data to improve checkout UX.

**Timing Requirements:**

- Must be called after the `primer:ready` event has fired
- Must be called after card hosted inputs have been rendered
- Calling before initialization will log a warning and fail gracefully

**Example:**

```typescript
const checkout = document.querySelector('primer-checkout');

checkout.addEventListener('primer:ready', (event) => {
  const primerJS = event.detail;

  // Pre-fill cardholder name from user profile
  primerJS.setCardholderName('John Doe');
});
```

## Type Definitions

### Payment Types

#### PaymentData

```typescript
interface PaymentData {
  paymentMethodType: string;
}
```

#### PaymentSuccessData

:::tip New in v0.7.0
Provides PII-filtered payment data for safe client-side processing.
:::

```typescript
interface PaymentSuccessData {
  paymentSummary: PaymentSummary;
  paymentMethodType: string;
  timestamp: number;
}
```

#### PaymentFailureData

:::tip New in v0.7.0
Provides structured error information for consistent error handling.
:::

```typescript
interface PaymentFailureData {
  error: {
    code: string;
    message: string;
    diagnosticsId?: string | null;
    data?: Record<string, unknown>;
  };
  paymentSummary?: PaymentSummary;
  paymentMethodType: string;
  timestamp: number;
}
```

#### PaymentSummary

:::note PII Protection
All PII fields are automatically filtered from this object for safe client-side usage.
:::

```typescript
interface PaymentSummary {
  last4Digits: string;
  expirationMonth: string;
  expirationYear: string;
  cardholderName: string;
  network: string;
  isNetworkTokenized: boolean;
  paymentInstrumentType: string;
  billingAddress: {
    firstName?: string;
    lastName?: string;
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    state?: string;
    countryCode?: string;
    postalCode?: string;
  };
  threeDSecureAuthentication?: {
    responseCode: string;
    reasonCode?: string;
    reasonText?: string;
    protocolVersion?: string;
    challengeIssued?: boolean;
  };
}
```

#### VaultedMethodsUpdateData

:::tip New in v0.7.0
Provides access to vaulted payment methods collection.
:::

```typescript
interface VaultedMethodsUpdateData {
  vaultedPayments: InitializedVaultedPayments;
  timestamp: number;
}
```

#### VaultedPaymentMethodSummary

```typescript
interface VaultedPaymentMethodSummary {
  id: string;
  paymentMethodType: string;
  last4Digits: string;
  expirationMonth: string;
  expirationYear: string;
  cardholderName: string;
  network: string;
}
```

### Event Payload Types

#### SdkStateContextType / SdkState

:::note Changed in v0.7.0
The `error` property has been renamed to `primerJsError` and the `failure` property has been renamed to `paymentFailure` with updated structure.
:::

```typescript
type SdkStateContextType = SdkState | null;

type SdkState = {
  isSuccessful: boolean;
  isProcessing: boolean;
  primerJsError: Error | null;
  isLoading: boolean;
  paymentFailure: {
    code: string;
    message: string;
    diagnosticsId?: string | null;
    data?: Record<string, unknown>;
  } | null;
};
```

#### InitializedPayments

```typescript
class InitializedPayments {
  get<T extends RedirectPaymentMethodTypes>(
    type: T,
  ): RedirectPaymentMethod | undefined;

  get<T extends (typeof PaymentMethodType)[keyof typeof PaymentMethodType]>(
    type: T,
  ): PaymentMethodByType<T> | undefined;

  toArray(): InitializedPaymentMethod[];

  size(): number;
}
```

#### InitializedVaultedPayments

:::tip New in v0.7.0
Wrapper class for accessing vaulted payment methods.
:::

```typescript
class InitializedVaultedPayments {
  get(id: string): VaultedPaymentMethodSummary | undefined;

  toArray(): VaultedPaymentMethodSummary[];

  size(): number;
}
```

#### CardNetworksContextType / CardNetwork

```typescript
type CardNetworksContextType = {
  detectedCardNetwork: CardNetwork | null;
  selectableCardNetworks: CardNetwork[];
  isLoading: boolean;
} | null;

type CardNetwork = {
  displayName: string;
  network: string;
};
```

#### CardSubmitPayload

```typescript
interface CardSubmitPayload {
  source?: string;
}
```

#### CardSubmitSuccessPayload / CardSubmitResult

```typescript
interface CardSubmitSuccessPayload {
  result: CardSubmitResult;
}

interface CardSubmitResult {
  success?: boolean;
  token?: string;
  analyticsId?: string;
  paymentId?: string;
  [key: string]: unknown;
}
```

#### CardSubmitErrorsPayload

```typescript
interface CardSubmitErrorsPayload {
  errors: InputValidationError[];
}
```

### Handler Types

#### PrepareHandler

```typescript
interface PrepareHandler {
  continuePaymentCreation: () => void;
  abortPaymentCreation: () => void;
}
```

## See Also

- [Events Guide](/guides/events-guide) - Practical examples and implementation patterns
- [Primer Checkout Component](/sdk-reference/Components/primer-checkout-doc) - Component API reference
- [SDK Options Reference](/sdk-reference/sdk-options-reference) - Configuration options
