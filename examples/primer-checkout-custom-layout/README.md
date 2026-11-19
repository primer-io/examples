# Primer Checkout: custom layout

Shows how to split Primer Checkout payment methods into sections. Card and PayPal render individually, each in its own container, and `primer-payment-method-container` renders every other available method. The sections go in the `payments` slot of `primer-main`, and styles are in `src/styles.css`.

## How it works

```tsx
<primer-payment-method type='PAYMENT_CARD'></primer-payment-method>
<primer-payment-method type='PAYPAL'></primer-payment-method>
<primer-payment-method-container exclude='PAYMENT_CARD,PAYPAL'></primer-payment-method-container>
```

`primer-payment-method-container` updates when payment method availability changes, so you don't need event listeners or state. `primer-error-message-container` sits between the card and PayPal sections.

## Running the example

1. Copy `.env.example` to `.env` and set `VITE_PRIMER_API_KEY` to your Primer sandbox API key (scope `client_tokens:write`).
2. Run:

```bash
npm install
npm run dev
```

The key is exposed to the browser, so use a sandbox key only, for local testing. In production, create the [client session](https://primer.io/docs/checkout/client-session) on your server.

## Learn more

- [Layout customization](https://primer.io/docs/checkout/primer-checkout/build-your-ui/layout-customization)
- [`<primer-payment-method>`](https://primer.io/docs/sdk/primer-checkout-web/components/primer-payment-method)
- [`<primer-payment-method-container>`](https://primer.io/docs/sdk/primer-checkout-web/components/primer-payment-method-container)
