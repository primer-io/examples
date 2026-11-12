# Agent guide: stripe-billing

Use this when adapting or porting the example. Sandbox only: `server/config.js` refuses Stripe keys that don't start with `sk_test_` or `rk_test_`.

## File map

- `server/app.js`: Express app: routes, input validation, static files, error handler.
- `server/index.js`: starts the app on the configured host and port.
- `server/config.js`: environment, host, port.
- `server/stripe.js`: Stripe calls and invoice metadata markers.
- `server/primer.js`: Primer calls and `classifyPayment`.
- `server/first-payment.js`: verifies and reports the first payment.
- `server/renewal.js`: charges and reports a renewal.
- `server/primer-events.js`: `PAYMENT.STATUS` handling.
- `server/webhooks.js`: both webhook receivers.
- `server/http-error.js`: errors safe to show the browser.
- `public/index.html`, `public/app.js`: page and `<primer-checkout>`.
- `scripts/advance-clock.js`: test clock helper.

## Rules to keep

1. The price comes from `STRIPE_PRICE_ID`, never the browser.
2. The amount comes from the invoice's `amount_due`.
3. The client session sets `customerId`, `vaultOnSuccess`, and `FIRST_PAYMENT` with `firstPaymentReason: 'Recurring'`.
4. Verify the Primer payment against the invoice before reporting it.
5. Find the `MULTI_USE` token via `GET /payment-instruments`.
6. Put an idempotency key on every Stripe write that reports a payment or attaches a payment method, with timestamps from the Primer payment date, so if the browser route and the Primer webhook both report the first payment, they send identical parameters. Don't key metadata updates whose parameters change.
7. Use the raw body for both webhook signatures.
8. Acknowledge with 200 before any work.
9. The renewal key is `renewal:<invoice>:<attempts>`. Advance the counter only after Stripe has the outcome.
10. When Primer rejects a renewal for a duplicate idempotency key, Primer already has a payment for that attempt, approved or not. Don't charge again; look up that payment in Primer and report it by hand if Stripe has no record ([idempotency key](https://primer.io/docs/api-reference/get-started/idempotency-key)).
11. Stamp the decline before reporting it.
12. Never report PENDING.
13. A Primer status other than approved, PENDING or a decline is unknown: report nothing to Stripe.
14. Report the first payment within 23 hours, or Stripe expires the subscription.
15. Never return upstream bodies to the browser.
16. The API routes have no auth: add your own.
17. Both webhooks do their work after the 200. On Vercel or Lambda the function freezes after the response, so run that work through `after()`/`waitUntil` or a queue. The sleeps in `server/primer-events.js` need a delayed job there.
18. A line starting with `STRANDED` means Primer took money that Stripe has no record of. Keep it loud, name the payment and the action, and tell the shopper not to pay again. Nothing retries it: Stripe replays saved responses for the same idempotency key.
19. Card only. Don't set `redirect.returnUrl` or enable redirect methods; the page doesn't keep the subscription id across a redirect.

## Porting to React, Next.js, Vue or Angular

`server/app.js`, `server/index.js` and `server/webhooks.js` are the Express-specific files. Replace the routes in `app.js` with your backend's endpoints: Next.js route handlers, or your existing server for React, Vue or Angular. The webhook handlers read `req.get`, a Buffer `req.body` and `res.sendStatus`, so adapt those too. The webhook routes need the raw body in your framework. The other `server/` modules move unchanged, except `server/config.js` on serverless (below). `public/app.js` becomes a component that mounts `<primer-checkout>` once and attaches the same listeners.

`public/app.js` imports `/vendor/primer-js/primer-loader.js`, which `server/app.js` serves. A port imports from `@primer-io/primer-js` instead. `server/config.js` calls `process.exit` on import, which serverless handlers need to replace with a thrown error.

## Where to change behavior

- Plan or price: `STRIPE_PRICE_ID`. `COUNTRY_BY_CURRENCY` in `server/primer.js` maps a few currencies and falls back to `US`; add yours.
- Decline policy: `classifyPayment` in `server/primer.js`, plus the retry schedule and automations in Stripe that read `primer_decline_classification`.
- Persistence: all state is in Stripe: invoice metadata, the Primer token on the custom payment method, and `primer_payment_id` on payment attempt records. If you add a database, keep the attempt counter, pending and charged markers and last event id, written in the order `server/renewal.js` writes them.
