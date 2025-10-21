# Custom Layout Example

This example demonstrates how to create a custom payment layout using Primer Checkout. It showcases how to organize different payment methods into sections with custom styling and use the new `primer-payment-method-container` component for simplified payment method management.

## Features

- **Custom Layout Structure**: Organized payment methods into distinct sections
- **Individual Payment Methods**: Card and PayPal with dedicated styling containers
- **Declarative Container**: Uses `primer-payment-method-container` for other payment methods
- **No Complex Event Handling**: Simplified approach without manual payment method filtering
- **Responsive Design**: Custom CSS styling for different payment sections

## Layout Structure

The example creates a sectioned layout with:

1. **Card Payment Section**: Dedicated area for card payments with custom styling
2. **Quick Checkout Section**: PayPal with special styling
3. **Alternative Methods Section**: All other available payment methods using the payment method container

## Implementation Approach

### Modern Declarative Approach (Current)

The example now uses a simplified approach with:

```tsx
{/* Individual payment methods for specific styling */}
<primer-payment-method type="PAYMENT_CARD"></primer-payment-method>
<primer-payment-method type="PAYPAL"></primer-payment-method>

{/* Container for all other methods */}
<primer-payment-method-container exclude="PAYMENT_CARD,PAYPAL"></primer-payment-method-container>
```

### Benefits

- **Reduced Complexity**: No event listeners or state management needed
- **Automatic Updates**: Payment methods update automatically when availability changes
- **Cleaner Code**: Significantly less boilerplate code
- **Better Performance**: No React re-renders for payment method updates
- **Flexible Layout**: Combine individual components with containers as needed

## Key Components Used

- **`primer-checkout`**: Main checkout container
- **`primer-main`**: Main content area
- **`primer-payment-method`**: Individual payment method components for specific methods
- **`primer-payment-method-container`**: Container for filtered groups of payment methods
- **`primer-error-message-container`**: Error message display

## Running the Example

```bash
npm install
npm run dev
```

## Styling

The example includes custom CSS in `styles.css` with:

- **Card Container**: Special styling for card payment section
- **PayPal Container**: Custom styling for quick checkout section
- **Alternative Methods**: Container styling for other payment methods
- **Responsive Design**: Mobile-friendly layout

## Migration Note

This example has been updated from the previous event-driven approach to use the new declarative payment method container. The new approach eliminates the need for:

- Manual event listeners (`primer:methods-update`)
- State management for payment methods
- Complex filtering logic
- Conditional rendering based on method availability

For more information about migrating from event listeners to the payment method container, see the [Migration Guide](../../docs/documentation/guides/migration-guides/event-listeners-to-payment-method-container.md).
