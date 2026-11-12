# Agent guide: sphere-tax

Use this when adapting or porting the example, on a Sphere test organization.

## File map

- `server/app.js`, `server/index.js`: routes, validation, error handler; startup.
- `server/config.js`: environment.
- `server/catalog.js`: the cart, currency, `toMajor`.
- `server/orders.js`: tax quote, payment confirmation, the sale.
- `server/refunds.js`: refunds, credit notes, cancellation.
- `server/outbox.js`: sends a queued Sphere write.
- `server/worker.js`: retry and recovery loop (`tick`).
- `server/db.js`: SQLite and `transaction()`.
- `server/sphere.js`, `server/primer.js`: API calls, fail-open and retry policy, date conversion.
- `server/shared.js`: shared helpers, `isClientError`, `saleView`.
- `public/index.html`, `public/app.js`: page and `<primer-checkout>`.
- `scripts/seed-products.js`: creates the Sphere products.

## Rules to keep

1. Amounts come from `server/catalog.js`, never the browser.
2. Every `PATCH /client-session` sends the full `order.lineItems` and `metadata`. PATCH replaces both.
3. Store a tax quote only after the PATCH succeeds, then call `refreshSession()` in the browser.
4. In `primer:payment-start`, call `preventDefault()` synchronously first. Abort if tax was never calculated (`NOT_CALCULATED`; a fail-open `NOT_COLLECTED` order proceeds) or the form no longer matches the quoted address. Otherwise use a new idempotency key per attempt.
5. Each sale line's `external_id` equals the line `id` sent to `calculate_tax`, or Sphere rejects the calculation ID.
6. `finalized_on` is the payment date for a sale and the refund transaction date for a credit note, converted to UTC with a `Z` (`toUtcIso`).
7. Primer and `calculate_tax` take minor units. The Transaction API takes decimal text (`toMajor`). Primer's line `amount` is per unit, `calculate_tax` takes the line total (`lineTotal`).
8. Write the `sphere_writes` row in the same database transaction as its state change: the order becoming `PAID`, or the refund becoming `REFUNDED`.
9. Fail open only on a timeout, 429 or 5xx from `calculate_tax`, and record that sale without a calculation ID, with `taxCollected: 'false'` (a string).
10. Retry a queued Sphere write with the same `external_id` on a timeout, network error, 429, 5xx, 401, 403 or 408. Any other 4xx marks it `FAILED`. Primer calls treat 401, 403, 408 and 429 as not final, like a 5xx (`isClientError` in `server/shared.js`).
11. Reserve a refund synchronously (`reserveRefund`): check the remaining amount and insert with no `await` between.
12. The refund id is the Primer idempotency key and the refund's `orderId`. Queue its credit note only after Primer reports the refund `SETTLED`.
13. Confirm every payment and refund with Primer, never from what the browser reports. Check the payment's `orderId`, amount, currency and calculation ID against the order.
14. If confirming a payment fails after Primer may have taken the money (`STRANDED?`), tell the shopper not to pay again.
15. Refunds need a sale whose `saleView` status is `RECORDED`. A cancellation needs no refund in progress and no credit note pending.
16. Never return an upstream body to the browser. Log it and send a generic message. Two exceptions, a 4xx from `calculate_tax` and a Primer refund rejection, return only the error code and message, cut to 300 characters. The routes have no auth: add your own.
17. Card only: no `redirect.returnUrl`, and the page doesn't keep the order across a redirect.
18. One process only: the synchronous SQLite access and the write claim assume it.
19. Tax-exclusive pricing only.

## Porting to React, Next.js, Vue or Angular

`server/app.js` and `server/index.js` are the Express-specific files. Replace the routes with your backend's endpoints, keeping the validation. `server/config.js` calls `process.exit` on import: serverless handlers need a thrown error. The other `server/` modules move unchanged. `public/app.js` becomes a component that mounts `<primer-checkout>` once with the same listeners, importing from `@primer-io/primer-js`.

`server/worker.js` needs a long-running process. On serverless, run `tick` from a scheduled job and replace SQLite with a shared database. Keep rules 8 and 11 in the new database. With async queries, the refund reservation and the write claim each need a transaction or row lock. The payment route polls for up to 15 seconds, which can exceed a serverless timeout: return `AWAITING_CAPTURE` sooner and let the worker finish.

## Where to change behavior

- Products and prices: `CART` in `server/catalog.js`, then `npm run seed`. `itemId` is the Sphere product `external_id`. Tax code: `SPHERE_TAX_CODE`.
- Fail-open policy: `failsOpen` in `server/sphere.js`. Return false for fail closed.
- Worker timings: constants in `server/worker.js`, `server/refunds.js` and `server/orders.js`, and the claim lease and backoff in `flushWrite` (`server/outbox.js`).
- Database: `server/db.js`.
