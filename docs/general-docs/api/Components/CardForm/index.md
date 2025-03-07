---
title: Card Form
sidebar_label: <primer-card-form>
sidebar_position: 3
description: The CardForm component provides a container for card input components, handling form submission and validation.
---

# Card Form Component
## \<primer-card-form\>

The `CardForm` component serves as a container for card input components. It handles payment card form submission, validation, and provides context to child components through a context provider system.

## Technical Implementation

The Card Form component:

1. **Creates a context provider** that supplies hosted input elements to child components
2. **Uses `display: contents`** to seamlessly integrate with parent layout without creating a new box in the DOM
3. **Manages hosted inputs** by creating them through the Payment Card manager
4. **Handles form submission** through multiple detection methods (native buttons, custom buttons, and direct events)
5. **Provides default layout** when no custom content is provided

## Usage

The CardForm component can be used in two ways:

1. **Default Layout**: The component provides a default layout with standard card input fields
2. **Custom Layout**: You can provide your own layout using the `card-form-content` slot

### Basic Usage (Default Layout)

```html
<primer-card-form></primer-card-form>
```

This renders a complete card form with:
- Card number input
- Expiry date input
- CVV input
- Cardholder name input
- Submit button

### Custom Layout

```html
<primer-card-form>
  <div slot="card-form-content">
    <primer-input-card-holder-name></primer-input-card-holder-name>
    <primer-input-card-number></primer-input-card-number>
    <div style="display: flex; gap: 8px;">
      <primer-input-card-expiry></primer-input-card-expiry>
      <primer-input-cvv></primer-input-cvv>
    </div>
    <button type="submit">Pay Now</button>
  </div>
</primer-card-form>
```

## DOM Structure

When no custom content is provided, the component renders the following DOM structure:

```html
<form>
  <div class="card-form">
    <primer-input-card-number></primer-input-card-number>
    <div class="card-form-row">
      <primer-input-card-expiry></primer-input-card-expiry>
      <primer-input-cvv></primer-input-cvv>
    </div>
    <primer-input-card-holder-name></primer-input-card-holder-name>
  </div>
  <primer-card-form-submit></primer-card-form-submit>
</form>
```

With custom content, your slotted content replaces the default structure.

## Slots

| Name                | Description                                                                                     |
|---------------------|-------------------------------------------------------------------------------------------------|
| `card-form-content` | Custom content slot for the card form. When provided, it replaces the default card form layout. |

## Events

| Event Name                   | Description                                              | Event Detail                          |
|------------------------------|----------------------------------------------------------|---------------------------------------|
| `primer-form-submit-success` | Fired when the form is successfully submitted            | Contains the result of the submission |
| `primer-form-submit-errors`  | Fired when there are validation errors during submission | Contains validation errors            |

## Form Submission

The CardForm component handles form submission automatically. You can trigger form submission in the following ways:

1. **Using the primer-card-form-submit component**:
   ```html
   <primer-card-form-submit></primer-card-form-submit>
   ```
   This is the recommended approach as it provides localized button text and consistent styling.

2. **Using a native HTML button**:
   ```html
   <button type="submit">Pay Now</button>
   ```

3. **Using a primer-button component**:
   ```html
   <primer-button buttonType="submit">Pay Now</primer-button>
   ```

4. **Using the data-submit attribute**:
   ```html
   <button data-submit>Pay Now</button>
   <!-- or -->
   <primer-button data-submit>Pay Now</primer-button>
   ```

5. **Programmatically**:
   ```javascript
   // Dispatch a custom event to trigger form submission
   document.querySelector('primer-card-form')
     .dispatchEvent(new CustomEvent('primer-form-submit'));
   ```

## Validation

The CardForm component automatically handles validation of all card input fields. Validation occurs when:

1. The form is submitted
2. Individual fields trigger validation events

Validation errors are automatically passed to the respective input components to display appropriate error messages. The validation process:

1. Calls the `validate()` method on the card manager
2. If validation fails, updates the context with validation errors
3. Dispatches a `primer-form-submit-errors` event with the errors
4. Child components receive the errors and display appropriate messages

## Context Provider

The CardForm component serves as a context provider for all child input components. It provides:

1. **Hosted Inputs**: Secure iframe-based inputs for card number, expiry, and CVV
2. **Setter Methods**: Functions to update cardholder name and card network
3. **Validation State**: Current validation errors for each input
4. **Submission Methods**: Functions to submit the card payment

This context mechanism ensures secure handling of sensitive payment data.

## Child Components

The CardForm component is designed to work with the following child components:

- [`primer-input-card-number`](/components/card-form/input-card-number): For entering the card number
- [`primer-input-card-expiry`](/components/card-form/input-card-expiry): For entering the card expiry date
- [`primer-input-cvv`](/components/card-form/input-cvv): For entering the card CVV/security code
- [`primer-input-card-holder-name`](/components/card-form/input-card-holder-name): For entering the cardholder's name
- [`primer-card-form-submit`](/components/card-form/card-form-submit): A submit button component (used in the default layout)

## Examples

### Complete Checkout Flow with CardForm

```html
<primer-checkout clientToken="your-client-token" options={options}>
  <primer-main slot="main">
    <div slot="payments">
      <primer-card-form>
        <div slot="card-form-content">
          <primer-input-card-holder-name></primer-input-card-holder-name>
          <primer-input-card-number></primer-input-card-number>
          <div style="display: flex; gap: 8px;">
            <primer-input-card-expiry></primer-input-card-expiry>
            <primer-input-cvv></primer-input-cvv>
          </div>
          <button type="submit">Complete Payment</button>
        </div>
      </primer-card-form>
    </div>
  </primer-main>
</primer-checkout>
```

### Handling Form Submission Events

```javascript
const cardForm = document.querySelector('primer-card-form');

// Listen for successful submissions
cardForm.addEventListener('primer-form-submit-success', (event) => {
  console.log('Payment successful!', event.detail);
  // Handle successful payment (e.g., show confirmation, redirect)
});

// Listen for validation errors
cardForm.addEventListener('primer-form-submit-errors', (event) => {
  console.error('Validation errors:', event.detail);
  // Handle errors (e.g., scroll to error, show notification)
});
```

## CSS Custom Properties

The CardForm component uses the following CSS custom properties for styling:

| Property | Description |
|----------|-------------|
| `--primer-space-small` | Spacing between inline elements (default: `8px`) |
| `--primer-space-medium` | Spacing between block elements (default: `16px`) |

## Notes

- The CardForm component must be used within a `primer-checkout` component
- All card input components must be placed inside a CardForm component to function properly
- CardForm automatically manages the hosted input elements for secure card data collection
- The component uses `display: contents` to avoid creating additional DOM structure that might interfere with your layout
- When no custom content is provided, a default form layout is rendered
- Submit buttons are detected based on their attributes (type="submit" or data-submit)
