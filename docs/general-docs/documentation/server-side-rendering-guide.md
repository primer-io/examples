---
sidebar_position: 3
title: Server-Side Rendering Guide
sidebar_label: SSR Guide
description: Learn how to integrate Primer Checkout with server-side rendering frameworks like Next.js, Nuxt.js, and SvelteKit
---

# Server-Side Rendering Guide

Primer Checkout is a client-side library built with Web Components that requires browser-specific APIs to function. This guide explains how to properly integrate Primer Checkout with server-side rendering (SSR) frameworks.

## Why SSR Requires Special Handling

:::warning Important SSR Limitation
Primer Checkout is **not supported in server-side rendering (SSR) frameworks out of the box**. The library relies on browser-specific APIs and must only be loaded on the client side.
:::

Server-side rendering frameworks execute code on the server to generate HTML before sending it to the browser. However, Primer Checkout depends on several browser-only features:

1. **Web Components API**: The Custom Elements API (`customElements.define()`) is only available in browsers
2. **DOM APIs**: The library requires access to the Document Object Model for component rendering
3. **Browser Context**: Secure iframe creation and payment processing require a browser environment
4. **Window Object**: Many payment features depend on `window` and browser-specific objects

When SSR frameworks try to execute Primer code on the server, they encounter errors because these APIs don't exist in the Node.js environment.

### The Solution: Client-Side Only Loading

To use Primer Checkout with SSR frameworks, you must ensure that:

1. Primer SDK loading code only runs in the browser (client-side)
2. Component rendering is deferred until after client-side hydration
3. Proper error handling is in place for loading failures

## Framework-Specific Integration

### Next.js

Next.js offers several patterns for client-side code execution. The recommended approach uses React's `useEffect` hook to ensure code runs only in the browser.

#### Using useEffect Pattern (Recommended)

```javascript
import { useEffect } from 'react';
import { loadPrimer } from '@primer-io/primer-js';

function MyCheckoutComponent() {
  useEffect(() => {
    // Only run on client side
    if (typeof window !== 'undefined') {
      const initializePrimer = async () => {
        console.log('🔧 Loading Primer components');
        try {
          await loadPrimer();
          console.log('✅ Primer components loaded successfully');
        } catch (error) {
          console.error('❌ Failed to load Primer components:', error);
        }
      };

      initializePrimer();
    }
  }, []); // Empty dependency array ensures this runs once on mount

  return (
    <div>
      {/* Your checkout components here */}
      <primer-checkout client-token='your-client-token'>
        {/* Checkout content */}
      </primer-checkout>
    </div>
  );
}
```

#### Why This Works

- `useEffect` runs only on the client side, never during server-side rendering
- The `typeof window !== 'undefined'` check provides an additional safety layer
- The empty dependency array `[]` ensures the effect runs only once when the component mounts
- Error handling catches any initialization failures

#### Next.js App Router Pattern

If you're using Next.js 13+ with the App Router, you can also use client component directives:

```javascript
'use client';

import { useEffect } from 'react';
import { loadPrimer } from '@primer-io/primer-js';

export default function CheckoutPage() {
  useEffect(() => {
    try {
      loadPrimer();
      console.log('✅ Primer loaded');
    } catch (error) {
      console.error('❌ Primer loading failed:', error);
    }
  }, []);

  return (
    <div>
      <primer-checkout client-token='your-client-token'>
        {/* Checkout content */}
      </primer-checkout>
    </div>
  );
}
```

The `'use client'` directive marks this entire component as client-side only, making it safe to import and use browser-specific code.

:::danger Critical: React SDK Options Pattern

When using React, **NEVER pass SDK options as inline objects** to Primer components. React will create a new object reference on every render, which can trigger unnecessary re-renders and potentially cause re-initialization issues.

**❌ WRONG - Inline object (creates new reference every render)**:

```javascript
return (
  <primer-checkout client-token={token} options={{ locale: 'en-GB' }}>
    {children}
  </primer-checkout>
);
```

**✅ CORRECT - Constant outside component**:

```javascript
import { PrimerCheckoutComponent } from '@primer-io/primer-js';
import { useEffect, useRef } from 'react';

// Define SDK options OUTSIDE the component
const SDK_OPTIONS = {
  locale: 'en-GB',
};

function CheckoutWrapper({ token, children }) {
  const checkoutRef = useRef(null);

  useEffect(() => {
    if (!token) return;

    const handleStateChange = (evt) => {
      console.log('State changed:', evt.detail);
    };

    const checkout = checkoutRef.current;
    checkout?.addEventListener('primer:state-change', handleStateChange);

    return () => {
      checkout?.removeEventListener('primer:state-change', handleStateChange);
    };
  }, [token]);

  return (
    <primer-checkout
      client-token={token}
      options={SDK_OPTIONS}
      ref={checkoutRef}
    >
      <div slot='main'>{children}</div>
    </primer-checkout>
  );
}
```

**✅ CORRECT - Using useMemo for dynamic options**:

```javascript
import { useMemo } from 'react';

function CheckoutWrapper({ token, userId, children }) {
  // Use useMemo when options depend on props or state
  const sdkOptions = useMemo(
    () => ({
      locale: 'en-GB',
    }),
    [userId],
  ); // Only recreate when userId changes

  return (
    <primer-checkout client-token={token} options={sdkOptions}>
      <div slot='main'>{children}</div>
    </primer-checkout>
  );
}
```

**Why This Matters**:

- React creates new object references on every render
- New object references can trigger component re-initialization
- This can cause performance issues and unexpected behavior
- Use constants outside components or `useMemo` hook for stable references

For more information on React object reference stability, see the [Best Practices section](#best-practices).
:::

### Nuxt.js

Nuxt.js provides the `onMounted` lifecycle hook for client-side code execution.

#### Using onMounted (Nuxt 3)

```javascript
<template>
  <div>
    <primer-checkout client-token="your-client-token">
      <!-- Checkout content -->
    </primer-checkout>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';

onMounted(async () => {
  if (import.meta.client) {
    try {
      const { loadPrimer } = await import('@primer-io/primer-js');
      loadPrimer();
      console.log('✅ Primer loaded');
    } catch (error) {
      console.error('❌ Failed to load Primer:', error);
    }
  }
});
</script>
```

:::note Modern Nuxt 3 Pattern
This example uses `import.meta.client`, which is the modern Nuxt 3 way to detect client-side execution. While `process.client` still works in Nuxt 3, it's a legacy pattern from Nuxt 2 and should be avoided in new code. Using `import.meta.client` provides better TypeScript support and aligns with modern Nuxt 3 conventions.
:::

#### Why This Works

- `onMounted` executes only on the client side after component hydration
- `import.meta.client` check ensures the code runs only in browser context (modern Nuxt 3 pattern)
- Dynamic `import()` prevents the SDK from being bundled in server-side code
- Error handling manages loading failures gracefully

#### Nuxt 2 Pattern

For Nuxt 2, use the `mounted` lifecycle hook:

```javascript
<template>
  <div>
    <primer-checkout client-token="your-client-token">
      <!-- Checkout content -->
    </primer-checkout>
  </div>
</template>

<script>
export default {
  mounted() {
    if (process.client) {
      import('@primer-io/primer-js')
        .then(({ loadPrimer }) => {
          loadPrimer();
          console.log('✅ Primer loaded');
        })
        .catch((error) => {
          console.error('❌ Failed to load Primer:', error);
        });
    }
  }
}
</script>
```

### SvelteKit

SvelteKit uses the `onMount` lifecycle function for client-side code.

#### Using onMount Pattern

```javascript
<script>
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';

  onMount(async () => {
    if (browser) {
      try {
        const { loadPrimer } = await import('@primer-io/primer-js');
        loadPrimer();
        console.log('✅ Primer loaded');
      } catch (error) {
        console.error('❌ Failed to load Primer:', error);
      }
    }
  });
</script>

<div>
  <primer-checkout client-token="your-client-token">
    <!-- Checkout content -->
  </primer-checkout>
</div>
```

#### Why This Works

- `onMount` runs only on the client side after component initialization
- SvelteKit's `browser` variable safely identifies the browser environment
- Dynamic `import()` ensures SDK code is not bundled for SSR
- Error handling provides feedback on loading failures

## Best Practices

### 1. Always Use Framework Lifecycle Methods

Don't attempt to load Primer at the module level or during component initialization. Always use your framework's client-side lifecycle methods:

```javascript
// ❌ WRONG: Module-level import will break SSR
import { loadPrimer } from '@primer-io/primer-js';
loadPrimer(); // This runs on server!

// ✅ CORRECT: Load in client-side lifecycle
useEffect(() => {
  loadPrimer();
}, []);
```

### 2. Include Environment Checks

Add defensive checks even within client-side lifecycle methods:

```javascript
useEffect(() => {
  if (typeof window !== 'undefined') {
    loadPrimer();
  }
}, []);
```

This provides additional safety if your framework's behavior changes or if code is refactored.

### 3. Implement Proper Error Handling

Always wrap Primer initialization in try-catch blocks:

```javascript
useEffect(() => {
  try {
    loadPrimer();
    console.log('✅ Primer loaded successfully');
  } catch (error) {
    console.error('❌ Primer initialization failed:', error);
    // Optionally show user-friendly error message
    // or trigger error reporting service
  }
}, []);
```

This prevents unhandled errors from breaking your checkout experience.

### 4. Use Dynamic Imports When Possible

Dynamic imports prevent SSR bundling issues and reduce initial bundle size:

```javascript
// Instead of static import
import { loadPrimer } from '@primer-io/primer-js';

// Use dynamic import
const { loadPrimer } = await import('@primer-io/primer-js');
```

### 5. Defer Component Rendering Until Loaded

Consider showing a loading state until Primer is initialized:

```javascript
function CheckoutComponent() {
  const [primerLoaded, setPrimerLoaded] = useState(false);

  useEffect(() => {
    loadPrimer()
      .then(() => setPrimerLoaded(true))
      .catch((error) => console.error(error));
  }, []);

  if (!primerLoaded) {
    return <div>Loading payment options...</div>;
  }

  return <primer-checkout client-token='token'>{/* ... */}</primer-checkout>;
}
```

### 6. Stabilize SDK Options References in React

When using React or React-based frameworks (Next.js, Remix), always ensure SDK options have stable object references to prevent unnecessary re-renders.

**The Problem**: React creates new object references on every render:

```javascript
// ❌ WRONG: New object created every render
function Checkout() {
  return (
    <primer-checkout
      options={{
        locale: 'en-GB', // New reference each time!
      }}
    ></primer-checkout>
  );
}
```

**Solution 1**: Define options outside the component:

```javascript
// ✅ CORRECT: Stable reference
const SDK_OPTIONS = {
  locale: 'en-GB',
};

function Checkout() {
  return <primer-checkout options={SDK_OPTIONS}></primer-checkout>;
}
```

**Solution 2**: Use `useMemo` for dynamic options:

```javascript
// ✅ CORRECT: Memoized when needed
function Checkout({ userId }) {
  const options = useMemo(
    () => ({
      locale: 'en-GB',
    }),
    [],
  ); // Only changes when dependencies change

  return <primer-checkout options={options}></primer-checkout>;
}
```

**Why This Matters**:

- Prevents potential re-initialization of Primer components
- Improves performance by avoiding unnecessary re-renders
- Ensures predictable component behavior
- Follows React best practices for object dependencies

This pattern applies to **all configuration objects** passed to Primer components, including event handlers stored in objects, configuration maps, and initialization parameters.

## Troubleshooting

### Common Errors and Solutions

#### Error: "customElements is not defined"

**Cause**: Primer code is running on the server where Web Components API doesn't exist.

**Solution**: Ensure `loadPrimer()` is called only in client-side lifecycle methods (useEffect, onMounted, etc.)

#### Error: "window is not defined"

**Cause**: Code is accessing browser globals during server-side rendering.

**Solution**: Add environment checks before accessing browser APIs:

```javascript
if (typeof window !== 'undefined') {
  // Browser-only code here
}
```

#### Infinite Re-renders or Performance Issues

**Cause**: Passing inline objects as SDK options in React causes new object references on every render.

**Solution**: Move SDK options outside the component or use `useMemo`:

```javascript
// Outside component (for static options)
const SDK_OPTIONS = { locale: 'en-GB' };

// Or inside with useMemo (for dynamic options)
const options = useMemo(() => ({ locale: 'en-GB' }), []);
```

#### Components Don't Render

**Cause**: `loadPrimer()` may not have been called before components are used.

**Solution**: Ensure `loadPrimer()` executes before rendering Primer components. Use loading states if needed.

#### TypeScript Errors with Custom Elements

**Cause**: TypeScript doesn't recognize custom element types by default.

**Solution**: Import and use Primer's TypeScript definitions:

```typescript
import { CustomElements } from '@primer-io/primer-js/dist/jsx/index';

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements extends CustomElements {}
  }
}
```

### Debugging Tips

1. **Check Console Logs**: Add logging to verify when `loadPrimer()` executes
2. **Inspect Network Tab**: Ensure the Primer SDK loads in the browser
3. **Verify Component Registration**: Check if custom elements are defined:

```javascript
console.log(customElements.get('primer-checkout')); // Should return a constructor
```

4. **Test Client-Side Only**: Temporarily disable SSR for your checkout page to isolate issues

## Summary

Integrating Primer Checkout with SSR frameworks requires:

1. **Client-side only loading** using framework lifecycle methods
2. **Environment checks** to prevent server-side execution
3. **Error handling** for graceful failure management
4. **Dynamic imports** to avoid bundling issues

By following these patterns, you can successfully use Primer Checkout in any SSR framework while maintaining a smooth development experience.

For more information on basic setup and configuration, see the [Getting Started Guide](/documentation/getting-started).
