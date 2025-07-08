---
title: Migrating from Event Listeners to Payment Method Container
sidebar_position: 2
description: Learn how to simplify payment method layouts by migrating from verbose event listeners to the declarative payment method container component
---

# Migrating from Event Listeners to Payment Method Container

## Overview

With the introduction of the `primer-payment-method-container` component in v0.3.2, you can now create custom payment method layouts using a simple declarative approach instead of complex event listeners and manual state management.

This migration guide shows how to update your existing event-driven payment method implementations to use the new container component.

## Key Benefits of Migration

1. **Reduced Complexity**: No need for event listeners, state management, or manual filtering
2. **Declarative Syntax**: Clear intent through HTML attributes
3. **Automatic Updates**: Container automatically responds to payment method changes
4. **Better Performance**: Eliminates React re-renders for payment method updates
5. **Cleaner Code**: Significantly less boilerplate code

## Migration Examples

### Basic Payment Method Filtering

**Before** (Complex event-driven approach):

```tsx
const Component = ({ clientToken, options }) => {
  const [paymentMethods, setPaymentMethods] = useState([]);
  const litRef = useRef<PrimerCheckoutComponent>(null);

  useEffect(() => {
    if (litRef.current) {
      litRef.current.addEventListener('primer:methods-update', (e) => {
        const methods = e?.detail;
        const filteredMethods = methods
          .toArray()
          .filter((method) => method.type !== 'PAYMENT_CARD');
        setPaymentMethods(filteredMethods);
      });
    }
  }, [clientToken]);

  return (
    <primer-checkout client-token={clientToken} options={options} ref={litRef}>
      <primer-main slot='main'>
        <div slot='payments'>
          {paymentMethods.map(({ type }) => (
            <primer-payment-method
              key={type}
              type={type}
            ></primer-payment-method>
          ))}
        </div>
      </primer-main>
    </primer-checkout>
  );
};
```

**After** (Declarative container approach):

```tsx
const Component = ({ clientToken, options }) => {
  return (
    <primer-checkout client-token={clientToken} options={options}>
      <primer-main slot='main'>
        <div slot='payments'>
          <primer-payment-method-container exclude='PAYMENT_CARD'></primer-payment-method-container>
        </div>
      </primer-main>
    </primer-checkout>
  );
};
```

### Sectioned Payment Layout

**Before** (Event-driven with complex filtering):

```tsx
const SectionedCheckout = ({ clientToken }) => {
  const [walletMethods, setWalletMethods] = useState([]);
  const [otherMethods, setOtherMethods] = useState([]);
  const litRef = useRef<PrimerCheckoutComponent>(null);

  useEffect(() => {
    if (litRef.current) {
      litRef.current.addEventListener('primer:methods-update', (e) => {
        const methods = e?.detail?.toArray() || [];

        const wallets = methods.filter((method) =>
          ['APPLE_PAY', 'GOOGLE_PAY'].includes(method.type),
        );

        const others = methods.filter(
          (method) =>
            !['APPLE_PAY', 'GOOGLE_PAY', 'PAYMENT_CARD'].includes(method.type),
        );

        setWalletMethods(wallets);
        setOtherMethods(others);
      });
    }
  }, [clientToken]);

  return (
    <primer-checkout client-token={clientToken} ref={litRef}>
      <primer-main slot='main'>
        <div slot='payments'>
          <div className='payment-section'>
            <h3>Quick Pay Options</h3>
            {walletMethods.map(({ type }) => (
              <primer-payment-method
                key={type}
                type={type}
              ></primer-payment-method>
            ))}
          </div>

          <div className='payment-section'>
            <h3>Other Payment Methods</h3>
            {otherMethods.map(({ type }) => (
              <primer-payment-method
                key={type}
                type={type}
              ></primer-payment-method>
            ))}
          </div>

          <div className='payment-section'>
            <h3>Pay with Card</h3>
            <primer-payment-method type='PAYMENT_CARD'></primer-payment-method>
          </div>
        </div>
      </primer-main>
    </primer-checkout>
  );
};
```

**After** (Declarative container approach):

```tsx
const SectionedCheckout = ({ clientToken }) => {
  return (
    <primer-checkout client-token={clientToken}>
      <primer-main slot='main'>
        <div slot='payments'>
          <div className='payment-section'>
            <h3>Quick Pay Options</h3>
            <primer-payment-method-container include='APPLE_PAY,GOOGLE_PAY'></primer-payment-method-container>
          </div>

          <div className='payment-section'>
            <h3>Other Payment Methods</h3>
            <primer-payment-method-container exclude='PAYMENT_CARD,APPLE_PAY,GOOGLE_PAY'></primer-payment-method-container>
          </div>

          <div className='payment-section'>
            <h3>Pay with Card</h3>
            <primer-payment-method type='PAYMENT_CARD'></primer-payment-method>
          </div>
        </div>
      </primer-main>
    </primer-checkout>
  );
};
```

## Migration Checklist

### Step 1: Identify Event Listener Usage

Look for code patterns that:

- Use `addEventListener('primer:methods-update', ...)`
- Manually filter payment methods in event handlers
- Manage payment method state with `useState` or similar
- Manually render `primer-payment-method` components based on filtered arrays

### Step 2: Replace with Container Component

- Remove event listeners and state management code
- Replace manual payment method rendering with `primer-payment-method-container`
- Use `include` attribute for whitelist filtering
- Use `exclude` attribute for blacklist filtering
- Combine both attributes for complex filtering scenarios

### Step 3: Test Your Implementation

- Verify that the same payment methods are displayed
- Test with different payment method configurations
- Ensure filtering works correctly
- Check that automatic updates still work when payment methods change

### Step 4: Clean Up

- Remove unused imports (useState, useEffect, useRef if no longer needed)
- Remove unused state variables
- Simplify component props if they were only used for event handling

## Advanced Migration Scenarios

### Custom Payment Method Ordering

If you need specific payment method ordering that can't be achieved with include/exclude filters, you can combine container components with individual payment method components:

```html
<!-- Priority payment methods in specific order -->
<primer-payment-method type="APPLE_PAY"></primer-payment-method>
<primer-payment-method type="GOOGLE_PAY"></primer-payment-method>

<!-- Other methods (automatically filtered) -->
<primer-payment-method-container
  exclude="APPLE_PAY,GOOGLE_PAY,PAYMENT_CARD"
></primer-payment-method-container>

<!-- Card form last -->
<primer-payment-method type="PAYMENT_CARD"></primer-payment-method>
```

The migration is backward compatible - your existing event-driven implementations will continue to work, allowing you to migrate incrementally as needed.
