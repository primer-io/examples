# Primer Checkout: saved payment methods

Shows how to save a card after a successful payment ([Save Payment Methods](https://primer.io/docs/payment-services/save-payment-methods)) and list it for the returning customer. The client session sets `vaultOnSuccess`, and checkout sets `vault.enabled` ([Configuring checkout](https://primer.io/docs/checkout/primer-checkout/configuration/sdk-options)). The customer ID is fixed, so a card saved in one session appears the next time you load the page or click Reset Checkout Session.

## Run it

1. Copy `.env.example` to `.env`.
2. Set `VITE_PRIMER_API_KEY` to a Primer sandbox API key with the `client_tokens:write` scope.
3. Run `npm install`.
4. Run `npm run dev`.

The example posts to `https://api.sandbox.primer.io`. Set `VITE_PRIMER_API_URL` in `.env` to override that.

## Sandbox only

Vite exposes `VITE_` variables to the browser, so anyone who opens the page can read the key. Use this for local sandbox testing only. In production, create the client session on your server ([Client Session](https://primer.io/docs/checkout/client-session)).
