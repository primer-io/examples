# Primer Checkout — Vaulted Payment Methods

Demonstrates how to let returning customers pay with a saved card or wallet in one click, without re-entering their payment details.

## When to use this pattern

Vaulting is the right choice when you want to:

- **Reduce checkout friction for returning customers** — stored cards mean no re-entry
- **Support subscriptions or recurring billing** — charge saved methods from your backend later
- **Build one-click checkout** — returning users see their saved methods immediately

Merchants typically see 20–30% higher conversion rates from returning customers when saved payment methods are available at checkout.

## How vaulting works

```
First visit (vault + pay)         Return visit (pay with saved method)
─────────────────────────         ────────────────────────────────────
1. Create client session           1. Create client session
   with vault.enabled = true          (no extra config needed)

2. Customer pays as normal         2. Primer shows saved payment methods
                                      at the top of the checkout

3. Primer vaults the payment       3. Customer selects a saved method
   method against your customer       and confirms — no card entry needed
   ID in your Primer account
```

The `vault.enabled: true` option tells Primer to offer the customer a "Save for future payments" option alongside the standard payment flow. Primer stores the tokenised payment method — **no raw card data ever touches your servers**.

## Quick start

### 1. Enable vaulting in your Primer dashboard

Go to **Settings → Vault** and ensure vaulting is enabled for your account.

### 2. Start the backend

This example uses the [checkout-example-backend](https://github.com/primer-io/checkout-example-backend). The backend creates client sessions — no vault-specific configuration is needed there.

### 3. Run the example

```bash
npm install
npm run dev
```

### 4. Test the vault flow

1. Complete a payment using a test card — Primer will offer to save it
2. Click **Reset Checkout Session** (the test control button) to simulate a return visit
3. Your saved card appears at the top of the checkout form

Test cards: `4111 1111 1111 1111`, any future expiry, any CVV.

## Key implementation details

### Enabling the vault

Set `vault.enabled` via the `options` property (not an attribute):

```ts
// ✅ Correct — options is a property
checkout.options = {
  vault: {
    enabled: true,
  },
};

// ❌ Cannot set objects via setAttribute
checkout.setAttribute('options', '...');
```

### Customer identity

For vaulted payment methods to be linked to the right customer across sessions, include a stable `customerId` when creating the client session on your backend:

```ts
// Backend: POST /client-session
{
  customerId: 'usr_abc123',   // Your internal customer ID
  orderId: 'ord_xyz789',
  // ...
}
```

Without a `customerId`, Primer cannot associate saved methods with a returning user.

### Charging a vaulted method from your backend

After vaulting, you can charge the saved payment method server-side without a new checkout session:

```ts
// POST https://api.primer.io/payments
{
  orderId: 'ord_new123',
  amount: 2500,
  currencyCode: 'GBP',
  paymentMethodToken: 'pm_token_from_vault',  // returned by webhook
}
```

See the [Payments API reference](https://apiref.primer.io/reference/create_payment_payments_post) for full details.

## File structure

```
primer-checkout-vaulted/
├── index.html              # Checkout page with a "Reset Session" test control
├── src/
│   ├── main.ts             # Initialises checkout with vault.enabled, handles session reset
│   ├── explanation.ts      # Generates the in-page explanatory UI (keeps index.html clean)
│   ├── fetchClientToken.ts # Calls your backend to get a client token
│   └── base.css            # Page and vault-specific styles
└── package.json
```

## Next steps

- **Charge a saved method from your backend** → [Primer Payments API](https://apiref.primer.io/reference/create_payment_payments_post)
- **List and delete vaulted methods** → [Vault API](https://apiref.primer.io/reference/list_vault_payment_methods_customers__customer_id__vault_payment_methods_get)
- **Build a subscription flow** → [Primer Workflows documentation](https://primer.io/docs/workflows)
- **Start from scratch** → [`primer-checkout-basic`](../primer-checkout-basic/)
