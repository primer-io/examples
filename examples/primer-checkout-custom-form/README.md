# Primer Checkout: custom card form

Lays out your own card form inside `<primer-card-form>` through its `card-form-content` slot, using the `primer-input-*` card fields and `primer-button`. See [Build a custom card form](https://primer.io/docs/checkout/primer-checkout/guides-and-recipes/build-custom-card-form) and [Layout customization](https://primer.io/docs/checkout/primer-checkout/build-your-ui/layout-customization).

## Run it

1. Copy `.env.example` to `.env`.
2. Set `VITE_PRIMER_API_KEY` to a sandbox API key with the `client_tokens:write` scope.
3. `npm install`
4. `npm run dev`

The example creates the [client session](https://primer.io/docs/checkout/client-session) from the browser, so the key is exposed in the browser. Use it for local sandbox testing only. In production, create the client session on your server.
