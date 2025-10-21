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

| Event Name                   | Detail Type                | Description                                                             |
| ---------------------------- | -------------------------- | ----------------------------------------------------------------------- |
| `primer:state-change`        | `SdkStateContextType`      | Dispatched when SDK state changes (loading, processing, success, error) |
| `primer:methods-update`      | `InitializedPayments`      | Dispatched when available payment methods are updated                   |
| `primer:ready`               | `PrimerJS`                 | Dispatched when SDK is fully initialized and ready                      |
| `primer:card-network-change` | `CardNetworksContextType`  | Dispatched when card network is detected or changed                     |
| `primer:card-submit`         | `CardSubmitPayload`        | Triggerable event to submit the card form programmatically              |
| `primer:card-success`        | `CardSubmitSuccessPayload` | Dispatched when card form submission succeeds                           |
| `primer:card-error`          | `CardSubmitErrorsPayload`  | Dispatched when card form validation errors occur                       |

### primer:state-change

Dispatched when SDK state changes during the payment lifecycle.

**Payload Properties:**

| Property       | Type                                                                           | Description                                          |
| -------------- | ------------------------------------------------------------------------------ | ---------------------------------------------------- |
| `isSuccessful` | `boolean`                                                                      | Whether the payment operation completed successfully |
| `isProcessing` | `boolean`                                                                      | Whether a payment operation is currently in progress |
| `error`        | `Error \| null`                                                                | Error object if an error occurred                    |
| `isLoading`    | `boolean`                                                                      | Whether the SDK is loading resources or initializing |
| `failure`      | `{ code: string; message: string; details?: Record<string, unknown> } \| null` | Structured failure information with code and message |

**Usage Note:** Listen to this event to show loading spinners, success messages, or error states.

### primer:methods-update

Dispatched when available payment methods are loaded or updated.

**Payload Properties:**

The event detail is an `InitializedPayments` instance with the following methods:

| Method            | Returns                               | Description                                    |
| ----------------- | ------------------------------------- | ---------------------------------------------- |
| `toArray()`       | `InitializedPaymentMethod[]`          | Returns all payment methods as an array        |
| `size()`          | `number`                              | Returns the count of available payment methods |
| `get<T>(type: T)` | `PaymentMethodByType<T> \| undefined` | Retrieves a specific payment method by type    |

**Usage Note:** Use this event to dynamically render payment methods or check availability.

### primer:ready

Dispatched when the Primer SDK is fully initialized and ready for use.

**Payload Properties:**

The event detail contains the `PrimerJS` instance with the following properties:

| Property              | Type                                                   | Description                               |
| --------------------- | ------------------------------------------------------ | ----------------------------------------- |
| `onPaymentStart`      | `() => void`                                           | Callback for payment creation start       |
| `onPaymentPrepare`    | `(data: PaymentData, handler: PrepareHandler) => void` | Callback for payment preparation          |
| `onPaymentComplete`   | `(data: PaymentCompleteData) => void`                  | Callback for payment completion           |
| `refreshSession()`    | `() => Promise<void>`                                  | Method to refresh the checkout session    |
| `getPaymentMethods()` | `() => PaymentMethodInfo[]`                            | Method to retrieve cached payment methods |

**Usage Note:** Use this event to configure callbacks and access PrimerJS instance methods.

### primer:card-network-change

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

### primer:card-submit

Triggerable event to submit the card form programmatically from anywhere in your application.

**Payload Properties:**

| Property | Type                | Description                                               |
| -------- | ------------------- | --------------------------------------------------------- |
| `source` | `string` (optional) | Identifier for the trigger source (e.g., "custom-button") |

**Usage Note:** Dispatch this event to trigger card form submission when using external submit buttons.

### primer:card-success

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

### primer:card-error

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

## PrimerJS Callbacks

Callbacks are set on the PrimerJS instance (accessible via the `primer:ready` event) to handle payment lifecycle events.

### Callbacks Overview

| Callback            | Parameters                                   | Description                                                  |
| ------------------- | -------------------------------------------- | ------------------------------------------------------------ |
| `onPaymentStart`    | None                                         | Called when payment creation begins                          |
| `onPaymentPrepare`  | `data: PaymentData, handler: PrepareHandler` | Called before payment is created, allows validation or abort |
| `onPaymentComplete` | `data: PaymentCompleteData`                  | Called when payment completes (success or error)             |

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

### onPaymentComplete

Called when payment completes with success, pending, or error status.

```typescript
onPaymentComplete?: (data: PaymentCompleteData) => void;
```

**Parameters:**

| Name   | Type                  | Description                                                |
| ------ | --------------------- | ---------------------------------------------------------- |
| `data` | `PaymentCompleteData` | Contains payment result, status, and error (if applicable) |

**Usage Note:** Use this callback to handle payment outcomes and redirect users appropriately.

## PrimerJS Instance Methods

Public methods available on the PrimerJS instance (accessible via the `primer:ready` event).

### Methods Overview

| Method                | Returns               | Description                                                   |
| --------------------- | --------------------- | ------------------------------------------------------------- |
| `refreshSession()`    | `Promise<void>`       | Synchronizes client-side SDK with server-side session updates |
| `getPaymentMethods()` | `PaymentMethodInfo[]` | Returns cached list of available payment methods              |

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

## Type Definitions

### Payment Types

#### PaymentCompleteData

```typescript
interface PaymentCompleteData {
  payment: Payment | null;
  status: 'success' | 'pending' | 'error';
  error?: PrimerClientError;
}
```

#### PaymentData

```typescript
interface PaymentData {
  paymentMethodType: string;
}
```

### Event Payload Types

#### SdkStateContextType / SdkState

```typescript
type SdkStateContextType = SdkState | null;

type SdkState = {
  isSuccessful: boolean;
  isProcessing: boolean;
  error: Error | null;
  isLoading: boolean;
  failure: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
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
- [Primer Checkout Component](/sdk-reference/primer-checkout-doc) - Component API reference
- [SDK Options Reference](/sdk-reference/sdk-options-reference) - Configuration options
