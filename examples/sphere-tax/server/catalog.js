// The cart. Prices come from here, never from the browser.
// itemId is also the product external_id in Sphere (see scripts/seed-products.js).
export const CURRENCY = 'USD';

export const CART = [
  {
    itemId: 'pro-plan-annual',
    description: 'Pro plan (annual)',
    amount: 120000,
    quantity: 1,
  },
  {
    itemId: 'extra-seat',
    description: 'Extra seat (annual)',
    amount: 15000,
    quantity: 2,
  },
];

// amount is per unit, as Primer's lineItems expect. calculate_tax wants the line total.
export const lineTotal = (item) => item.amount * item.quantity;

// Primer and calculate_tax take whole minor units. The Transaction API takes decimal text
// in the main unit, so 120000 becomes "1200.00".
export function toMajor(minor, currency = CURRENCY) {
  const digits = new Intl.NumberFormat('en', {
    style: 'currency',
    currency,
  }).resolvedOptions().maximumFractionDigits;
  const sign = minor < 0 ? '-' : '';
  const text = String(Math.abs(minor)).padStart(digits + 1, '0');
  if (digits === 0) return `${sign}${text}`;
  return `${sign}${text.slice(0, -digits)}.${text.slice(-digits)}`;
}
