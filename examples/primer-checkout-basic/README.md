# Primer Checkout: basic

Renders a `<primer-checkout>` for a single-item EUR order. On load, the browser creates a [client session](https://primer.io/docs/checkout/client-session) with your sandbox API key and passes the returned client token to the checkout. A toggle switches custom styles on and off. If session creation fails, the page shows the error message.

For a full walkthrough, see [Accept your first payment](https://primer.io/docs/checkout/primer-checkout/first-payment).

## Run it

1. Copy `.env.example` to `.env`.
2. Set `VITE_PRIMER_API_KEY` to a sandbox API key with the `client_tokens:write` scope. See [Authentication](https://primer.io/docs/api-reference/get-started/authentication).
3. `npm install`
4. `npm run dev`

`VITE_PRIMER_API_URL` is optional and defaults to `https://api.sandbox.primer.io`.

## Local sandbox testing only

Vite exposes `VITE_` variables to the browser, so the API key is visible to anyone who opens the page. In production, create the client session on your server and send only the client token to the browser.
