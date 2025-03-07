---
title: Card Form Customizations Guide
sidebar_label: Card Form Customizations
description: Learn how to customize the card payment form in your Primer Composable Checkout experience
---

# Card Form Customizations Guide

The Primer SDK's card form components provide a secure way to collect payment card information while offering extensive customization options. This guide explains the fundamental concepts behind card form customization and how to tailor it to match your brand's requirements.

## Card Form Component Architecture

The card form uses a component-based architecture that separates concerns while maintaining security and compliance:

- `<primer-card-form>` - The container that orchestrates validation and submission
- `<primer-input-card-number>` - Secure field for card number collection with network detection
- `<primer-input-card-expiry>` - Secure field for expiration date collection
- `<primer-input-cvv>` - Secure field for security code collection
- `<primer-input-card-holder-name>` - Field for cardholder name collection
- `<primer-card-form-submit>` - Submit button with contextual styling

Each component is designed to work within the `<primer-card-form>` container, which provides validation context and event handling.

## Understanding Card Form Slot Customization

The card form uses a slot-based customization model to allow flexible layouts without compromising security.

### The `card-form-content` Slot

The primary customization point is the `card-form-content` slot within the `<primer-card-form>` component. This slot allows you to:

1. Arrange input fields in your preferred order
2. Group fields together (e.g., expiry and CVV in a row)
3. Add custom elements alongside secure inputs
4. Apply your own styling and layout

```jsx
<primer-card-form>
  <div slot="card-form-content">
    {/* Your custom layout here */}
  </div>
</primer-card-form>
```

When you don't provide content for this slot, the card form automatically renders a default layout with all required fields.

## Customizing Input Field Appearance

Each card input component accepts properties that modify its appearance without affecting functionality:

### Label and Placeholder Customization

You can customize the visible text for each input:

```jsx
<primer-input-card-number
  label="Card Number"           // Changes the label text
  placeholder="1234 5678 9012 3456" // Changes the placeholder text
  aria-label="Credit card number" // Changes the accessibility label
></primer-input-card-number>
```

These properties work consistently across all card input components, allowing for uniform customization.

## Form Layout Patterns

While you have complete freedom over the layout, certain patterns are common and effective:

### Standard Vertical Layout

The most common pattern is a vertical stack of inputs:

```jsx
<primer-card-form>
  <div slot="card-form-content">
    <primer-input-card-number></primer-input-card-number>
    <primer-input-card-holder-name></primer-input-card-holder-name>
    <div style="display: flex; gap: 8px;">
      <primer-input-card-expiry></primer-input-card-expiry>
      <primer-input-cvv></primer-input-cvv>
    </div>
    <primer-card-form-submit></primer-card-form-submit>
  </div>
</primer-card-form>
```

This pattern places related fields (expiry and CVV) side-by-side while keeping the main inputs full-width.

### How Form Submission Works

The `<primer-card-form>` component handles form submission in several ways:

1. Through the `<primer-card-form-submit>` component (recommended)
2. Through any HTML button with `type="submit"`
3. Through any element with the `data-submit` attribute

When submission is triggered, the component:
1. Validates all card inputs
2. Emits validation errors if necessary
3. Submits the payment if validation passes
4. Emits success or error events based on the outcome

## Event-Driven Validation

The card form follows an event-driven validation approach:

```jsx
// Listen for validation errors
cardForm.addEventListener('primer-form-submit-errors', (event) => {
  const errors = event.detail;
  // Handle validation errors
});

// Listen for successful submission
cardForm.addEventListener('primer-form-submit-success', (event) => {
  const result = event.detail;
  // Handle successful submission
});
```

These events bubble up to the `<primer-checkout>` component, allowing you to handle them at any level.

## Styling Card Form Components

Card form components inherit styling from CSS custom properties defined at the checkout level:

```css
:root {
  /* These properties affect all components */
  --primer-color-brand: #4a90e2;
  --primer-radius-small: 4px;
  --primer-typography-body-large-font: 'Your-Font', sans-serif;
}
```

## Integrating Custom Fields

You can seamlessly integrate custom fields alongside the secure card inputs:

```jsx
<primer-card-form>
  <div slot="card-form-content">
    <primer-input-card-number></primer-input-card-number>
    
    {/* Custom field using primer-input */}
    <primer-input-wrapper>
      <primer-input-label slot="label">Billing Zip Code</primer-input-label>
      <primer-input slot="input" type="text" name="zip"></primer-input>
    </primer-input-wrapper>
    
    <div style="display: flex; gap: 8px;">
      <primer-input-card-expiry></primer-input-card-expiry>
      <primer-input-cvv></primer-input-cvv>
    </div>
    
    <primer-card-form-submit></primer-card-form-submit>
  </div>
</primer-card-form>
```

The form container doesn't validate these custom fields directly, so you'll need to implement your own validation if needed.

## Avoiding Duplicate Card Form Rendering

When customizing your card form layout, be aware of a common issue that can lead to duplicate card form elements:

```jsx
// ❌ INCORRECT: This will cause duplicate card forms to appear
<primer-checkout client-token="your-token">
  <primer-main slot="main">
    <div slot="payments">
      <!-- Custom card form -->
      <primer-card-form>
        <div slot="card-form-content">
          <!-- Card form inputs -->
        </div>
      </primer-card-form>
      
      <!-- This will render ANOTHER card form, causing duplicates -->
      <primer-payment-method type="PAYMENT_CARD"></primer-payment-method>
    </div>
  </primer-main>
</primer-checkout>
```

**Important:** When using a custom card form, do not include `<primer-payment-method type="PAYMENT_CARD">` in your layout. The payment method component will render its own card form, resulting in duplicates.

This is especially important when dynamically generating payment methods:

```javascript
// When dynamically rendering payment methods, filter out PAYMENT_CARD
checkout.addEventListener('primer-payment-methods-updated', (event) => {
  const availableMethods = event.detail.toArray()
    // Filter out PAYMENT_CARD if you're using a custom card form
    .filter(method => method.type !== 'PAYMENT_CARD');
  
  // Render the filtered payment methods
  availableMethods.forEach(method => {
    const element = document.createElement('primer-payment-method');
    element.setAttribute('type', method.type);
    container.appendChild(element);
  });
});
```

## Best Practices

1. **Maintain Security** - Always use the provided secure input components for card data
2. **Avoid Duplicate Components** - Don't use `<primer-payment-method type="PAYMENT_CARD">` with a custom card form
3. **Prioritize Clarity** - Keep layouts simple and focused on the payment task
4. **Use Consistent Styling** - Maintain visual consistency with your site's design system
5. **Handle Validation Properly** - Provide clear error messages and guidance
6. **Consider Mobile First** - Design for small screens first, then enhance for larger devices
7. **Test Thoroughly** - Validate behavior across browsers and device types

For detailed information on individual components, refer to their API documentation:
- [Card Form](/api/Components/CardForm/)
