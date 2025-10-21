---
title: React Integration Guide
description: Complete guide for integrating Primer SDK web components with React 18 and React 19, including TypeScript setup and stable reference patterns.
---

# React Integration Guide

Web components work natively in React without requiring wrapper components. This guide covers React-specific patterns for integrating Primer SDK components, focusing on the key differences between React 18 and React 19, and the critical importance of stable object references.

## What This Guide Covers

- **TypeScript/JSX type setup** - Essential configuration for TypeScript projects
- **React 18 vs React 19 patterns** - Key differences and when to use each approach
- **Stable reference patterns** - Preventing re-initialization and state loss
- **Common pitfalls** - What to avoid and how to fix issues

## Prerequisites

- Basic understanding of React hooks (useRef, useEffect, useMemo)
- Familiarity with [SDK Options configuration](/guides/options-guide)
- For Next.js patterns, see the [SSR Guide](/guides/server-side-rendering-guide)

---

## TypeScript/JSX Types Setup

:::danger CRITICAL: TypeScript Types Required

**If you're using TypeScript with React (or any JSX framework), you MUST configure JSX types before using Primer components.** Without this setup, TypeScript will throw errors when using `<primer-checkout>` in JSX.

### Required Setup

Add this to your project (typically in `src/types/primer.d.ts` or at the top of your component file):

```typescript
import type { CheckoutElement } from '@primer-io/primer-js';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'primer-checkout': CheckoutElement;
    }
  }
}
```

### Why This Is Needed

TypeScript doesn't recognize custom web component tags by default. Without this declaration:

- ❌ TypeScript will show "Property 'primer-checkout' does not exist" errors
- ❌ You won't get autocomplete or type checking for component props
- ❌ Your build will fail in strict TypeScript projects

### What This Does

- ✅ Registers `<primer-checkout>` as a valid JSX element
- ✅ Provides type checking for component properties and attributes
- ✅ Enables IDE autocomplete for Primer component features

### Alternative: Import from SDK

For projects using multiple JSX frameworks (React, Preact, etc.), import the full type definitions:

```typescript
import { CustomElements } from '@primer-io/primer-js/dist/jsx/index';

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements extends CustomElements {}
  }
}
```

:::

---

## React 18 vs React 19: The Key Difference

React 19 introduced improved support for web components, changing HOW you pass object properties to custom elements. However, the need for stable references remains critical in both versions.

### React 18 Pattern: Ref + useEffect

In React 18, you must use refs and useEffect to assign object properties because React tries to convert all props to HTML attributes.

```typescript
import { useRef, useEffect } from 'react';

// ✅ Define options outside component or use useMemo
const SDK_OPTIONS = { locale: 'en-GB' };

function CheckoutPage({ clientToken }: { clientToken: string }) {
  const checkoutRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const checkout = checkoutRef.current;
    if (!checkout) return;

    // Imperative property assignment
    checkout.options = SDK_OPTIONS;

    // Set up event listeners
    const handleReady = () => console.log('✅ SDK ready');
    checkout.addEventListener('primer:ready', handleReady);

    return () => {
      checkout.removeEventListener('primer:ready', handleReady);
    };
  }, []); // Empty deps - runs once

  return (
    <primer-checkout
      ref={checkoutRef}
      client-token={clientToken}
    />
  );
}
```

**Pattern**: Imperative property assignment via refs
**Boilerplate**: High (ref + useEffect required)

### React 19 Pattern: Direct Options Prop

React 19 detects custom element properties and assigns them directly, allowing declarative JSX syntax.

```typescript
// ✅ Define options outside component or use useMemo
const SDK_OPTIONS = { locale: 'en-GB' };

function CheckoutPage({ clientToken }: { clientToken: string }) {
  return (
    <primer-checkout
      client-token={clientToken}
      options={SDK_OPTIONS}
    />
  );
}
```

**Pattern**: Declarative JSX property assignment
**Boilerplate**: Minimal (no ref or useEffect needed)

### Comparison Table

| Aspect                        | React 18                              | React 19              |
| ----------------------------- | ------------------------------------- | --------------------- |
| **How objects are passed**    | ref + useEffect                       | JSX props             |
| **Attribute conversion**      | Converts objects to `[object Object]` | Assigns as properties |
| **Code pattern**              | Imperative                            | Declarative           |
| **Lines of code**             | ~15 lines                             | ~5 lines              |
| **Stable references needed?** | ✅ Yes (always)                       | ✅ Yes (always)       |
| **Can inline objects?**       | ❌ No (doesn't work)                  | ❌ No (causes issues) |

### When to Use Which Pattern

- **Using React 18?** Use the ref + useEffect pattern with stable references
- **Using React 19?** Use the JSX props pattern with stable references
- **Either version?** Always use constants or useMemo for object stability

### Migration from React 18 to React 19

If upgrading from React 18 to React 19, you can simplify your code:

**Before (React 18)**:

```typescript
const SDK_OPTIONS = { locale: 'en-GB' };

function CheckoutPage() {
  const ref = useRef();

  useEffect(() => {
    if (ref.current) {
      ref.current.options = SDK_OPTIONS;
    }
  }, []);

  return <primer-checkout ref={ref} client-token={token} />;
}
```

**After (React 19)**:

```typescript
const SDK_OPTIONS = { locale: 'en-GB' };

function CheckoutPage() {
  return <primer-checkout client-token={token} options={SDK_OPTIONS} />;
}
```

**Critical**: Keep the constant! React 19 doesn't eliminate the need for stable references.

---

## Stable References Pattern

### Why Stability Matters

Web components can react to property changes. When you pass a new object reference, the component may re-initialize, even if the content is identical.

**The Problem**:

```typescript
// ❌ BAD: New object every render
function CheckoutPage() {
  // This creates a NEW object on every render
  return <primer-checkout options={{ locale: 'en-GB' }} />;
}

// What happens:
// Render 1: Creates object at memory address 0x001
// Render 2: Creates object at memory address 0x002 (NEW reference!)
// Render 3: Creates object at memory address 0x003 (NEW reference!)
// Result: Component may re-initialize on every parent re-render
```

**Real-World Impact**: User enters credit card number → parent re-renders → component receives new options reference → form resets → **user's input is lost** 😱

### Pattern 1: Constant Outside Component

For static options that never change, define them outside the component.

```typescript
// ✅ Created once at module load, same reference forever
const SDK_OPTIONS = {
  locale: 'en-GB',
  paymentMethodOptions: {
    PAYMENT_CARD: {
      requireCVV: true,
      requireBillingAddress: true,
    },
  },
};

function CheckoutPage({ clientToken }: { clientToken: string }) {
  // React 19 example (use ref + useEffect for React 18)
  return (
    <primer-checkout
      client-token={clientToken}
      options={SDK_OPTIONS}
    />
  );
}
```

**When to use**: Options are static and don't depend on props, state, or user input

**Benefits**:

- ✅ Zero re-render overhead
- ✅ Simplest pattern
- ✅ No React hooks needed

### Pattern 2: useMemo for Dynamic Values

For options that depend on props or state, use useMemo to maintain stable references.

```typescript
import { useMemo } from 'react';

interface CheckoutPageProps {
  clientToken: string;
  userLocale: string;
  merchantName: string;
}

function CheckoutPage({ clientToken, userLocale, merchantName }: CheckoutPageProps) {
  // ✅ Creates new object ONLY when dependencies change
  const sdkOptions = useMemo(
    () => ({
      locale: userLocale,
      paymentMethodOptions: {
        APPLE_PAY: {
          merchantName: merchantName,
          merchantCountryCode: 'GB',
        },
      },
    }),
    [userLocale, merchantName], // Only recreate if these change
  );

  // React 19 example (use ref + useEffect for React 18)
  return (
    <primer-checkout
      client-token={clientToken}
      options={sdkOptions}
    />
  );
}
```

**When to use**: Options depend on props, state, or context that can change

**Benefits**:

- ✅ Stable reference until dependencies change
- ✅ Only re-initializes when necessary
- ✅ Prevents unnecessary re-renders

### Common Mistake: Inline Object Creation

```typescript
// ❌ WRONG: Object created in component body (React 18 & 19)
function CheckoutPage() {
  // New object on every render
  const options = { locale: 'en-GB' };
  return <primer-checkout options={options} />;
}

// ❌ WRONG: Inline object in JSX (React 18 & 19)
function CheckoutPage() {
  // New object on every render
  return <primer-checkout options={{ locale: 'en-GB' }} />;
}

// ✅ CORRECT: Use constant or useMemo
const SDK_OPTIONS = { locale: 'en-GB' };

function CheckoutPage() {
  // Same object reference every render
  return <primer-checkout options={SDK_OPTIONS} />;
}

// ✅ CORRECT: Use useMemo for empty deps
function CheckoutPage() {
  const options = useMemo(() => ({ locale: 'en-GB' }), []);
  return <primer-checkout options={options} />;
}
```

**Why it's wrong**:

- Creates new object reference on every component render
- Causes component to potentially re-initialize
- Can lead to lost form state and poor performance
- Works this way in BOTH React 18 AND React 19

**How to fix**:

- Move object outside component (constant)
- Wrap in useMemo with appropriate dependencies
- Use useState if options need to be modified

---

## Quick Reference

### Decision Matrix

| Scenario                    | React 18 Solution               | React 19 Solution                    |
| --------------------------- | ------------------------------- | ------------------------------------ |
| **Static options**          | Constant + ref + useEffect      | Constant + JSX prop                  |
| **Dynamic options**         | useMemo + ref + useEffect       | useMemo + JSX prop                   |
| **Options depend on props** | useMemo with dependencies + ref | useMemo with dependencies + JSX prop |
| **User-modifiable options** | useState + ref                  | useState + JSX prop                  |

### Key Principles (Both Versions)

1. ✅ Always use stable references (constant or useMemo)
2. ❌ Never inline objects in JSX
3. ❌ Never create objects in component body without useMemo
4. ✅ Include all dependencies in useMemo dependency array
5. ✅ Define static options outside component

### Testing for Stability

Verify reference stability with a simple test:

```typescript
function CheckoutPage() {
  const options = useMemo(() => ({ locale: 'en-GB' }), []);

  // Log reference to verify stability
  useEffect(() => {
    console.log('Options reference:', options);
  });

  return <primer-checkout options={options} />;
}

// ✅ Should only log once on mount
// ❌ If it logs on every render, reference is unstable!
```

---

## Next Steps

- **Configure SDK options**: See [Options Guide](/guides/options-guide) for detailed configuration patterns
- **Handle SSR/Next.js**: See [SSR Guide](/guides/server-side-rendering-guide) for server-side rendering patterns
- **Explore options**: See [SDK Options Reference](/sdk-reference/sdk-options-reference) for complete API documentation
- **Handle events**: See [Events Guide](/guides/events-guide) for payment lifecycle event handling

---

## Summary

React integration with Primer SDK components is straightforward when you follow these key principles:

1. **TypeScript setup**: Configure JSX types for proper TypeScript support
2. **React version pattern**: Use refs in React 18, JSX props in React 19
3. **Stable references**: Always use constants or useMemo to prevent re-initialization
4. **Never inline objects**: Avoid creating new object references on every render

Both React 18 and React 19 work excellently with Primer SDK components when these patterns are followed. React 19 simply reduces boilerplate while maintaining the same stability requirements.
