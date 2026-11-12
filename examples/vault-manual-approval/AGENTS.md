# Agent guide: vault-manual-approval

Use this when adapting or porting the example. Sandbox only: `server/config.js` refuses non-test Stripe keys.

## File map

- `server/index.js`: Express routes `/api/client-session` and `/api/decide`, input validation, listen address.
- `server/config.js`: environment parsing, amount, currency, default route.
- `server/primer.js`: Primer API calls: client session, approve, resolve, get payment.
- `server/decide.js`: routing rule, returns `stripe` or `primer`.
- `server/process.js`: runs the chosen path and maps results to HTTP responses.
- `server/proxy.js`: creates the Stripe payment method through Primer's PCI proxy.
- `server/stripe.js`: creates and confirms the Stripe PaymentIntent.
- `public/index.html`, `public/app.js`: page, `<primer-checkout>` and event handling.

## Rules to keep

1. Amount and currency come from the server, never the browser.
2. The client session sets `approvalMode: "MANUAL"` and a `customerId`. As of November 2026, some Vault docs pages show the field as `mode`. The API field is `approvalMode`.
3. De-duplicate `primer:payment-approval-required` on `paymentAttemptId`. The SDK can emit it more than once per attempt.
4. Send only the token string to your backend.
5. Build the proxy body by string concatenation. Encoding the body breaks the `{{token.FIELD}}` placeholders.
6. The Stripe call that charges goes direct. Only the call that carries card data goes through the proxy.
7. Resolve with `outcome` only. As of November 2026, some docs pages show `vaultPaymentMethod`; the API rejects it at the moment.
8. Resolve `FAILED` when your processor definitely did not charge. If you don't resolve, the checkout waits until the attempt expires.
9. Call `continueFlow()` in a `finally`.
10. Set `options` on `<primer-checkout>` as a property, not an attribute.
11. Never return raw upstream bodies to the browser. Server logs may include them.
12. Approve or resolve returning 410 means the decision window closed (15 minutes from tokenization). Still call `continueFlow()`. If the Stripe charge succeeded before a failed resolve, the shopper has been charged: return `charged: true` and reconcile.
13. Treat an unknown charge outcome (timeout, network error, Stripe 5xx or an idempotency conflict) as unknown. Don't resolve `FAILED` for a card that may have been charged: return `charged: "unknown"` and don't resolve.
14. The route picker is enabled unless `NODE_ENV=production`, so set `NODE_ENV=production` in any deployed copy.
15. `/api/client-session` and `/api/decide` have no authentication. Add your own before you deploy.

## Porting to React, Next.js, Vue or Angular

`server/index.js` is the only Express-specific file. Replace its routes with your framework's server endpoints (for example Next.js route handlers). The other `server/` modules move unchanged. `public/app.js` becomes a component that mounts `<primer-checkout>` once and attaches the same listeners. See https://primer.io/docs/checkout/primer-checkout/installation.

`public/app.js` imports `/vendor/primer-js/primer-loader.js`, which `server/index.js` serves, so a framework port imports from `@primer-io/primer-js` instead. `server/config.js` calls `process.exit` on import, which serverless handlers need to replace with a thrown error.

## Where to change behavior

- Routing rule: `server/decide.js`.
- Another processor: `server/proxy.js` and `server/stripe.js`, then the Stripe branch in `server/process.js`.
  The `sk_test_` gate and `STRIPE_SECRET_KEY` in `server/config.js` are Stripe-specific. The route names appear in `config.js`, `decide.js` and `index.js`. Primer must allowlist the new `X-Target-Host` on the proxy: ask your Primer contact.
