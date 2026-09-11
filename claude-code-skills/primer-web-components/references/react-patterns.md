# React, Next.js and other frameworks

Primer's elements are custom elements, so nothing here is Primer-specific machinery — it is the
standard set of adjustments a framework needs to drive a custom element. Everything below is typed
against the shipped `@primer-io/primer-js` declarations.

## Contents

- [JSX typing](#jsx-typing)
- [Typing the element reference](#typing-the-element-reference)
- [Stable object references](#stable-object-references)
- [React 19: props on the element](#react-19-props-on-the-element)
- [React 18: refs and imperative assignment](#react-18-refs-and-imperative-assignment)
- [Event handling](#event-handling)
- [Rendering a method list from an event](#rendering-a-method-list-from-an-event)
- [Server-side rendering](#server-side-rendering)
- [Migrating off the drop-in](#migrating-off-the-drop-in)

## JSX typing

`CustomElements` maps every `primer-*` tag to its props, so one augmentation types all of them, not
just `<primer-checkout>`. It lives in a subpath export and is a **type**, so import it with
`import type`.

Where the augmentation goes depends on the React major, because React 19 moved the `JSX` namespace
out of the global scope and into the `react` module.

```typescript
// add to the top of a .d.ts in your project -- React 19
import type { CustomElements } from '@primer-io/primer-js/dist/jsx/index';

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements extends CustomElements {}
  }
}
```

```typescript
// add to the top of a .d.ts in your project -- React 18
import type { CustomElements } from '@primer-io/primer-js/dist/jsx/index';

declare global {
  namespace JSX {
    interface IntrinsicElements extends CustomElements {}
  }
}
```

Pick the one that matches your `@types/react`. The two are not interchangeable: the global form is
ignored by React 19's JSX transform, and the module form has no effect under React 18.

## Typing the element reference

`primer-checkout` is not in `HTMLElementTagNameMap`, so `useRef` and `querySelector` give you
`HTMLElement`, which has no `options`.

```typescript
// WRONG -- `options` is not on HTMLElement.
const ref = useRef<HTMLElement>(null);
ref.current!.options = { locale: 'en-GB' };
```

The obvious fix — reach for the exported element class — does not work: `PrimerCheckoutComponent`
extends Lit's `LitElement`, and the package declares no dependencies, so without `lit` in your own
`package.json` its base type is unresolved and it stops satisfying `Element`. Declare the surface
you use instead. One alias, reused everywhere:

```typescript
// add to the top of your file
import { useRef } from 'react';
import type { PrimerCheckoutOptions } from '@primer-io/primer-js';

// CORRECT
type PrimerCheckoutEl = HTMLElement & { options: PrimerCheckoutOptions };

export function useCheckoutRef() {
  const ref = useRef<PrimerCheckoutEl>(null);
  return ref;
}
```

Event details are cast per listener the same way — see [Event handling](#event-handling). The
details are in [`component-reference.md`](component-reference.md#third-party-types-and-the-element-class-trap).

## Stable object references

Assigning `options` re-initialises the checkout. A new object literal on every render therefore
tears the checkout down and rebuilds it on every render, losing whatever the shopper had typed. This
is the same in React 18 and React 19 — React 19's improved custom-element support changes how the
value is delivered, not how often.

```typescript
// WRONG (compiles; wrong at runtime) -- a new object every render.
function CheckoutPage({ clientToken }: { clientToken: string }) {
  return <primer-checkout client-token={clientToken} options={{ locale: 'en-GB' }} />;
}
```

```typescript
// WRONG (compiles; wrong at runtime) -- same problem, one line up.
function CheckoutPage({ clientToken }: { clientToken: string }) {
  const options = { locale: 'en-GB' };
  return <primer-checkout client-token={clientToken} options={options} />;
}
```

Static options belong at module scope, where they are created once:

```typescript
// add to the top of your file
import type { PrimerCheckoutOptions } from '@primer-io/primer-js';

const SDK_OPTIONS: PrimerCheckoutOptions = {
  locale: 'en-GB',
  card: { cardholderName: { required: true, visible: true } },
  vault: { enabled: true },
};
```

Options that depend on props or state go in `useMemo`, with those values as the dependencies:

```typescript
// add to the top of your file
import { useMemo } from 'react';
import type { PrimerCheckoutOptions } from '@primer-io/primer-js';

export function CheckoutPage({
  clientToken,
  userLocale,
}: {
  clientToken: string;
  userLocale: string;
}) {
  const options: PrimerCheckoutOptions = useMemo(
    () => ({
      locale: userLocale,
      redirect: { returnUrl: `${window.location.origin}/checkout/return` },
    }),
    [userLocale],
  );

  return <primer-checkout client-token={clientToken} options={options} />;
}
```

Annotating the object `PrimerCheckoutOptions` is worth the extra import: it is what catches a
removed option such as `sdkCore`, or a misspelled nested key, at build time rather than in the
browser.

## React 19: props on the element

React 19 assigns unknown props on a custom element as properties rather than stringifying them, so
`options` can go straight into JSX.

```typescript
// add to the top of your file
import { useEffect } from 'react';
import { loadPrimer } from '@primer-io/primer-js';
import type { PrimerCheckoutOptions } from '@primer-io/primer-js';

const SDK_OPTIONS: PrimerCheckoutOptions = { locale: 'en-GB' };

export function CheckoutPage({ clientToken }: { clientToken: string }) {
  useEffect(() => {
    loadPrimer();
  }, []);

  return <primer-checkout client-token={clientToken} options={SDK_OPTIONS} />;
}
```

`loadPrimer()` returns `void`; there is nothing to await, and no promise to `.catch()`. Calling it
in `useEffect` keeps it off the server — see [Server-side rendering](#server-side-rendering).

## React 18: refs and imperative assignment

React 18 turns an object prop into the attribute `options="[object Object]"`, so assign the property
through a ref instead. `client-token` is a string and works as a prop in both versions.

```typescript
// add to the top of your file
import { useEffect, useRef } from 'react';
import { loadPrimer } from '@primer-io/primer-js';
import type { PrimerCheckoutOptions } from '@primer-io/primer-js';

type PrimerCheckoutEl = HTMLElement & { options: PrimerCheckoutOptions };

const SDK_OPTIONS: PrimerCheckoutOptions = { locale: 'en-GB' };

export function CheckoutPage({ clientToken }: { clientToken: string }) {
  const ref = useRef<PrimerCheckoutEl>(null);

  useEffect(() => {
    loadPrimer();
  }, []);

  useEffect(() => {
    const checkout = ref.current;
    if (!checkout) return;
    checkout.options = SDK_OPTIONS;
  }, []);

  return <primer-checkout ref={ref} client-token={clientToken} />;
}
```

## Event handling

Add listeners in an effect and remove them in its cleanup. Annotating the parameter `CustomEvent`
does not match `addEventListener`'s signature; take the `Event` and cast inside, which is also where
the payload type goes.

```typescript
// add to the top of your file
import { useEffect, useRef } from 'react';
import type { PaymentSuccessData } from '@primer-io/primer-js';

export function CheckoutPage({ clientToken }: { clientToken: string }) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const checkout = ref.current;
    if (!checkout) return;

    const onSuccess = (event: Event) => {
      const { payment } = (event as CustomEvent<PaymentSuccessData>).detail;
      // Navigation is a side effect: it belongs here, in the listener, not in render.
      window.location.href = `/confirmation?orderId=${payment.orderId}`;
    };

    checkout.addEventListener('primer:payment-success', onSuccess);
    return () => checkout.removeEventListener('primer:payment-success', onSuccess);
  }, []);

  return <primer-checkout ref={ref} client-token={clientToken} />;
}
```

Card details on the success payload are nested: `event.detail.payment.paymentMethodData?.network`
and `?.last4Digits`, never `payment.network`. The full payload is in
[`component-reference.md`](component-reference.md#payment-summary-shape).

To gate the payment, listen for `primer:payment-start` and call `event.preventDefault()`
synchronously before any `await` — see [Gate payment creation](../SKILL.md#gate-payment-creation).
The rule is the same in React; the effect only changes where the listener is registered.

## Rendering a method list from an event

`primer:methods-update` hands you the array itself as `detail`. Store the types, not the method
objects — the objects hold live SDK handles and do not belong in React state.

```typescript
// add to the top of your file
import { useEffect, useRef, useState } from 'react';
import type { InitializedPaymentMethod, PaymentMethodType } from '@primer-io/primer-js';

export function CheckoutPage({ clientToken }: { clientToken: string }) {
  const ref = useRef<HTMLElement>(null);
  const [types, setTypes] = useState<PaymentMethodType[]>([]);

  useEffect(() => {
    const checkout = ref.current;
    if (!checkout) return;

    const onMethods = (event: Event) => {
      // The detail IS the array -- there is no wrapper object.
      const methods = (event as CustomEvent<InitializedPaymentMethod[]>).detail;
      setTypes(methods.map((method) => method.type));
    };

    checkout.addEventListener('primer:methods-update', onMethods);
    return () => checkout.removeEventListener('primer:methods-update', onMethods);
  }, []);

  return (
    <primer-checkout ref={ref} client-token={clientToken}>
      <primer-main slot="main">
        <div slot="payments">
          {types.map((type) => (
            <primer-payment-method key={type} type={type} />
          ))}
        </div>
      </primer-main>
    </primer-checkout>
  );
}
```

`<primer-payment-method-container>` does the same thing declaratively, with no listener and no
state — prefer it unless you need the types for something else.

## Server-side rendering

The elements call `customElements.define` at import time and the checkout needs `window`, iframes
and the DOM, so the package must only be imported in the browser. Every framework has its own hook
for that.

**Next.js App Router.** `'use client'` is enough — a client component's `useEffect` never runs on
the server, so no `typeof window` check is needed.

```typescript
'use client';

// add to the top of your file
import { useEffect } from 'react';
import { loadPrimer } from '@primer-io/primer-js';

export default function CheckoutPage({ clientToken }: { clientToken: string }) {
  useEffect(() => {
    loadPrimer();
  }, []);

  return <primer-checkout client-token={clientToken} />;
}
```

**Next.js Pages Router.** Same shape, no directive. If the module import itself is a problem for
your bundler, import it dynamically:

```typescript
// add to the top of your file
import { useEffect } from 'react';

export default function CheckoutPage({ clientToken }: { clientToken: string }) {
  useEffect(() => {
    void import('@primer-io/primer-js').then(({ loadPrimer }) => loadPrimer());
  }, []);

  return <primer-checkout client-token={clientToken} />;
}
```

The `await import(...)` is asynchronous; `loadPrimer()` itself still is not.

**Nuxt 3.**

```vue
<template>
  <primer-checkout :client-token="clientToken" />
</template>

<script setup>
import { onMounted } from 'vue';

const props = defineProps({ clientToken: String });

onMounted(async () => {
  if (import.meta.client) {
    const { loadPrimer } = await import('@primer-io/primer-js');
    loadPrimer();
  }
});
</script>
```

`import.meta.client` is the Nuxt 3 flag; `process.client` is the Nuxt 2 one. Tell Vue not to treat
`primer-*` as Vue components — set `compilerOptions.isCustomElement` in `nuxt.config`.

**SvelteKit.**

```svelte
<script>
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';

  export let clientToken;

  onMount(async () => {
    if (browser) {
      const { loadPrimer } = await import('@primer-io/primer-js');
      loadPrimer();
    }
  });
</script>

<primer-checkout client-token={clientToken} />
```

`onMount` only runs in the browser, so the `browser` guard is belt-and-braces; keep it if you also
call the module from a non-`onMount` path.

Do not add CSS that hides `primer-checkout` until it is defined. The SDK ships that rule and its own
spinner; your version hides the spinner too. `loader-disabled` is the supported way to turn the
spinner off. (The shipped types mention a `--primer-loader-disabled` CSS custom property as a second
way — nothing in the runtime reads it. Use the attribute.)

## Migrating off the drop-in

The drop-in is a **different package**, `@primer-io/checkout-web`, driven by
`Primer.showUniversalCheckout(clientToken, options)` against a container div. There is no upgrade
path inside that package: you remove it and render the element instead.

1. `npm uninstall @primer-io/checkout-web`, then install `@primer-io/primer-js` at the version in
   [Install and initialise](../SKILL.md#install-and-initialise). Nothing in the new package imports
   the old one, and leaving both installed ships two SDKs.
2. Delete the container div, the `showUniversalCheckout` call and any `teardown()` bookkeeping —
   the element's own lifecycle replaces all of it, so the init-guard refs a drop-in integration
   needs (`isInitializingRef`, `previousTokenRef`) go too.
3. Render `<primer-checkout client-token={clientToken}>` and move your options onto `options`.
4. Rewire the callbacks:

| Drop-in                                       | Web components                                                                                                     |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `onCheckoutComplete({ payment })`             | `primer:payment-success`, `detail.payment`                                                                         |
| `onCheckoutFail(err, data, handler)`          | `primer:payment-failure`, `detail.error`; `<primer-error-message-container>` replaces `handler.showErrorMessage()` |
| `onBeforePaymentCreate(data, handler)`        | `primer:payment-start` — **and it now needs a synchronous `event.preventDefault()`** for an async check            |
| `onTokenizeSuccess` / manual payment handling | `primer:payment-approval-required` for the MANUAL flow                                                             |
| `container: '#id'`                            | slot your layout into `<primer-main slot="main">`                                                                  |
| `checkout.teardown()`                         | unmount the element                                                                                                |
| `Primer.showUniversalCheckout` return value   | the `primer:ready` detail, or `checkout.primerJS`                                                                  |

5. Re-check every option name. The two packages do not share an options type, and the removed
   `sdkCore` and `stripe` keys came from this era — see
   [Old patterns](../SKILL.md#old-patterns).

A React wrapper hook around `showUniversalCheckout` (the `usePrimerDropIn` shape, with
`primerInstanceRef`, `isInitializingRef` and `resetPrimerInstance`) has no equivalent here and
should be deleted rather than ported: its whole job was managing an imperative instance's lifetime,
which the element does itself.
