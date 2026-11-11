# Primer Checkout — Basic Integration

The simplest way to add Primer Checkout to a web app. Drop in a single `<primer-checkout>` component, point it at a client token, and Primer handles the rest — payment form rendering, validation, 3DS, and network routing.

## When to use this pattern

Use the basic drop-in when you want:

- The fastest possible time to a working checkout (under an hour for most integrations)
- Primer to handle all UI — no custom payment forms to build or maintain
- Automatic support for all payment methods enabled in your Primer dashboard
- Built-in 3DS handling without extra code

If you need a fully custom checkout UI, see [`primer-checkout-custom-form`](../primer-checkout-custom-form/) or [`primer-checkout-custom-layout`](../primer-checkout-custom-layout/).

## How it works

```
Your backend           Primer API              Payment processor
     │                     │                         │
     ├── POST /client-session ──────────────────────▶│
     │◀── clientToken ─────────────────────────────  │
     │                     │                         │
Your frontend                                        │
     │                     │                         │
     ├── <primer-checkout client-token="…"> ────────▶│
     │   (Primer renders the payment form)           │
     │                     │                         │
     │   User submits ─────▶ Primer processes ──────▶│
     │                     │◀── success/failure ─────│
     │◀── checkout-complete event ─────────────────  │
```

1. Your backend creates a client session with the order details and receives a short-lived `clientToken`
2. You pass the token to `<primer-checkout>` as an attribute
3. Primer renders the payment form and handles the full payment flow

## Quick start

### 1. Start the backend

This example needs a backend to create client sessions. You can use the [checkout-example-backend](https://github.com/primer-io/checkout-example-backend) or any backend that calls the [Primer client session API](https://apiref.primer.io/reference/create_client_side_token_client_session_post).

### 2. Run the example

```bash
npm install
npm run dev
```

Open `http://localhost:5173` (or the port shown in your terminal).

### 3. Test a payment

Use Primer's [test card numbers](https://primer.io/docs/testing):

- **Success:** `4111 1111 1111 1111`, any future expiry, any CVV
- **Decline:** `4000 0000 0000 0002`
- **3DS required:** `4000 0000 0000 3063`

## Key implementation details

### Setting the client token

Always use `setAttribute()` — not a property assignment — to set the client token:

```ts
// ✅ Correct
checkout.setAttribute('client-token', clientToken);

// ❌ Will not trigger a re-render
checkout.clientToken = clientToken;
```

### Handling checkout completion

Listen for the `checkout-complete` event on the `<primer-checkout>` element:

```ts
checkout.addEventListener('checkout-complete', (event) => {
  const { payment } = event.detail;
  // payment.id — use this to look up the payment on your backend
  // payment.orderId — the orderId you passed in the client session
});
```

### Optional: custom styles

The example includes a style toggle that demonstrates how to apply your own CSS variables to the checkout component without changing any HTML. Toggle it on to see how `--primer-color-brand` and related tokens work.

## File structure

```
primer-checkout-basic/
├── index.html              # Minimal HTML — just <primer-checkout> + a style toggle
├── src/
│   ├── main.ts             # Initialises the SDK and wires up the style toggle
│   ├── fetchClientToken.ts # Calls your backend to get a client token
│   └── base.css            # Page layout and optional custom style overrides
└── package.json
```

## Next steps

- **Save payment methods** for returning customers → [`primer-checkout-vaulted`](../primer-checkout-vaulted/)
- **Style the checkout** to match your brand → [`primer-checkout-themes`](../primer-checkout-themes/)
- **Build a fully custom UI** → [`primer-checkout-custom-layout`](../primer-checkout-custom-layout/)
- **Full API reference** → [apiref.primer.io](https://apiref.primer.io)
