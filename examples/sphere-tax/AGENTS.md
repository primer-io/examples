# Agent guide: sphere-tax

Use this when adapting or porting the example on a Sphere test organization.

## File map

- `server/app.js`, `server/index.js`, `server/config.js`: routes, validation, errors; startup; environment.
- `server/catalog.js`: the cart, currency, `toMajor`.
- `server/orders.js`: tax quote, payment confirmation, the sale.
- `server/refunds.js`: refunds, credit notes, cancellation.
- `server/outbox.js`, `server/worker.js`: queued Sphere writes; retry and recovery loop (`tick`).
- `server/db.js`: SQLite and `transaction()`.
- `server/sphere.js`, `server/primer.js`: API calls, fail-open and retry policy, date conversion.
- `server/shared.js`: shared helpers, `isClientError`, `saleView`.
- `public/index.html`, `public/app.js`: page and `<primer-checkout>`.
- `scripts/seed-products.js`: Sphere products.

## Rules to keep

1. Amounts come from `server/catalog.js`, never the browser.
2. `PATCH /client-session` replaces `order.lineItems` and `metadata`: always send both in full.
3. Store a tax quote only after the PATCH succeeds, then call `refreshSession()`.
4. In `primer:payment-start`, call `preventDefault()` synchronously first. Abort if tax was never calculated (`NOT_CALCULATED`; fail-open `NOT_COLLECTED` proceeds) or the form no longer matches the quoted address. Use a new idempotency key per attempt.
5. Each sale line's `external_id` equals the line `id` sent to `calculate_tax`, or Sphere rejects the calculation ID.
6. Record the sale only when the payment is `SETTLED` or `PARTIALLY_SETTLED`. `AUTHORIZED`, `PENDING` and `SETTLING` wait as `AWAITING_CAPTURE`, because a `SETTLING` payment can still be cancelled. Give up after 24 hours for `AUTHORIZED` or `PENDING` and 14 days for `SETTLING` (`NEEDS_REVIEW`).
7. `finalized_on` is the capture time for a sale and the refund transaction date for a credit note, in UTC with a `Z` (`toUtcIso`). Capture time is the latest `CAPTURE_SUCCEEDED` event on a `SALE` transaction, from `GET /payments/{id}?expand=transactions.events`. If there is none, send the order to `NEEDS_REVIEW`; never fall back to `payment.date`.
8. A tax ID goes to `calculate_tax` as `tax_id` and on the sale as `customer_tax_ids: [{ tax_id, country }]`, not on credit notes.
9. Primer and `calculate_tax` take minor units. The Transaction API takes decimal text (`toMajor`). Primer's line `amount` is per unit; `calculate_tax` takes the line total (`lineTotal`).
10. Write the `sphere_writes` row in the same database transaction as its state change: the order becoming `PAID`, or the refund becoming `REFUNDED`.
11. Fail open only on a timeout, 429 or 5xx from `calculate_tax`, and record that sale without a calculation ID, with `taxCollected: 'false'` (a string). Any other error blocks payment. `customer_tax_location_invalid` returns 422 with Sphere's message. Every other 4xx is a setup problem: log it and return a generic 502.
12. Retry a queued Sphere write with the same `external_id` on a timeout, network error, 429, 5xx, 401, 403 or 408; any other 4xx marks it `FAILED`. Primer calls treat 401, 403, 408 and 429 as not final (`isClientError`).
13. Reserve a refund synchronously (`reserveRefund`): check the remaining amount and insert with no `await` between.
14. The refund id is the Primer idempotency key and `orderId`. Queue the credit note only after Primer reports the refund `SETTLED`.
15. Confirm every payment and refund with Primer, never from the browser. Check the payment's `orderId`, amount, currency and calculation ID. If confirming fails after Primer may have taken the money (`STRANDED?`), tell the shopper not to pay again.
16. Refunds need a sale whose `saleView` status is `RECORDED`. A cancellation needs no refund in progress and no credit note pending.
17. Never return an upstream body to the browser: log it and send a generic message. Two exceptions, `customer_tax_location_invalid` and a Primer refund rejection, return only the error code and message, cut to 300 characters.
18. Card only (no `redirect.returnUrl`), one process (synchronous SQLite), tax-exclusive pricing. The routes have no auth: add your own.

## Porting to React, Next.js, Vue or Angular

Only `server/app.js` and `server/index.js` are Express-specific: replace the routes with your backend's endpoints and keep the validation. `server/config.js` calls `process.exit` on import, so serverless handlers need a thrown error. `public/app.js` becomes a component that mounts `<primer-checkout>` once with the same listeners, importing from `@primer-io/primer-js`.

`server/worker.js` needs a long-running process. On serverless, run `tick` from a scheduled job and use a shared database instead of SQLite. Keep rules 10 and 13 there: the refund reservation and the write claim each need a transaction or row lock. The 15-second payment poll can exceed a serverless timeout: return `AWAITING_CAPTURE` sooner.

## Where to change behavior

- Products and prices: `CART` in `server/catalog.js`, then `npm run seed`. `itemId` is the Sphere product `external_id`. Tax code: `SPHERE_TAX_CODE`.
- Fail-open policy: `failsOpen` in `server/sphere.js`. Return false for fail closed.
- Worker timings: constants in `server/worker.js`, `server/refunds.js`, `server/orders.js`, and `flushWrite` (`server/outbox.js`).
- Database: `server/db.js`.
