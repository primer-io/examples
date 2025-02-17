# Customizing the Card Form Component

The Primer SDK's card form component offers extensive customization options while maintaining PCI compliance. This guide covers how to customize the layout, styling, and behavior of your card form.

## Table of Contents
- [Basic Card Form Structure](#basic-card-form-structure)
- [Customizing Form Layout](#customizing-form-layout)
- [Working with Submit Buttons](#working-with-submit-buttons)
- [Adding Custom Fields](#adding-custom-fields)
- [Accessibility and Labels](#accessibility-and-labels)
- [Event Handling](#event-handling)

## Basic Card Form Structure

The card form consists of individual components that can be arranged as needed:

```html
<primer-card-form>
  <primer-card-form-name></primer-card-form-name>
  <primer-card-form-cardnumber></primer-card-form-cardnumber>
  <primer-card-form-expiry></primer-card-form-expiry>
  <primer-card-form-cvv></primer-card-form-cvv>
  <button type="submit">Pay Now</button>
</primer-card-form>
```

## Customizing Form Layout

You have complete control over the layout of form elements. Here are some common patterns:

### Inline Layout

```html
<primer-card-form>
  <div class="form-container">
    <primer-card-form-cardnumber></primer-card-form-cardnumber>
    <div class="inline-group">
      <primer-card-form-name></primer-card-form-name>
      <primer-card-form-expiry></primer-card-form-expiry>
      <primer-card-form-cvv></primer-card-form-cvv>
    </div>
    <button type="submit">Pay Now</button>
  </div>
</primer-card-form>
```

### Custom Grid Layout

```html
<primer-card-form>
  <div class="grid-container">
    <div class="full-width">
      <primer-card-form-cardnumber></primer-card-form-cardnumber>
    </div>
    <div class="half-width">
      <primer-card-form-name></primer-card-form-name>
    </div>
    <div class="quarter-width">
      <primer-card-form-expiry></primer-card-form-expiry>
    </div>
    <div class="quarter-width">
      <primer-card-form-cvv></primer-card-form-cvv>
    </div>
  </div>
  <button type="submit">Pay Now</button>
</primer-card-form>
```

## Working with Submit Buttons

### Using the Default Button

```html
<primer-card-form>
  <!-- Form fields -->
  <primer-button buttonType="submit" variant="primary">
    Pay Now
  </primer-button>
</primer-card-form>
```

### Custom Submit Button

```html
<primer-card-form>
  <!-- Form fields -->
  <button 
    type="submit"
    class="custom-button"
    data-submit
  >
    Complete Payment
  </button>
</primer-card-form>
```

## Adding Custom Fields

When adding custom fields, remember they won't be included in the default form submission:

```html
<primer-card-form>
  <!-- SDK Components -->
  <primer-card-form-cardnumber></primer-card-form-cardnumber>
  
  <!-- Custom Field -->
  <primer-input-wrapper>
    <primer-input-label slot="label">
      Discount Code
    </primer-input-label>
    <primer-input 
      slot="input" 
      id="discount-code"
    ></primer-input>
  </primer-input-wrapper>
  
  <button type="submit">Pay Now</button>
</primer-card-form>

<script>
// Handle custom field separately
document.getElementById('discount-code')
  ?.addEventListener('input', (evt) => {
    const discountCode = evt.target.value;
    // Process discount code
  });
</script>
```

## Accessibility and Labels

Each form component accepts customizable labels and ARIA attributes:

```html
<primer-card-form-cardnumber
  label="Card Number"
  placeholder="1234 5678 9012 3456"
  aria-label="Enter your card number"
></primer-card-form-cardnumber>

<primer-card-form-cvv
  label="Security Code"
  placeholder="123"
  aria-label="Enter card security code"
></primer-card-form-cvv>
```

## Event Handling

The card form emits events for various states:

```javascript
const cardForm = document.querySelector('primer-card-form');

// Handle successful submission
cardForm?.addEventListener('primer-card-submit-success', (evt) => {
  const { result } = evt.detail;
  // Handle successful payment
});

// Handle validation errors
cardForm?.addEventListener('primer-card-submit-errors', (evt) => {
  const { errors } = evt.detail;
  // Handle validation errors
});
```

## Best Practices

1. **Custom Fields**: Handle custom field validation and submission separately from the SDK's form submission.

2. **Layout Structure**: Keep the form structure semantic and accessible when customizing layouts.

3. **Submit Buttons**: Always use either `type="submit"` for native buttons or `buttonType="submit"` for SDK buttons.

4. **Event Handling**: Set up error handling for both SDK events and custom field validation.

5. **Accessibility**: Maintain proper labeling and ARIA attributes when customizing the form.

## Next Steps

- Check our [Styling Guide](/docs/styling) for detailed CSS customization options
- Learn about [Form Validation](/docs/validation) for custom field integration
- Explore [Payment Flow](/docs/payment-flow) for advanced payment scenarios
