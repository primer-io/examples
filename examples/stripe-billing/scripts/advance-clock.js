// Test only. Moves the Stripe test clock behind a subscription to just past its renewal, so
// Stripe finalizes the next invoice and sends invoice.payment_attempt_required.
// Needs STRIPE_USE_TEST_CLOCK=1 when the subscription was created.
//
// Usage: npm run advance-clock -- sub_123
import { stripe } from '../server/stripe.js';

const subscriptionId = process.argv[2];
if (!subscriptionId?.startsWith('sub_')) {
  console.error('Usage: npm run advance-clock -- <subscription id>');
  process.exit(1);
}

const sub = await stripe.subscriptions.retrieve(subscriptionId, {
  expand: ['customer'],
});
const clockId = sub.customer.test_clock;
if (!clockId) {
  console.error(
    'This customer has no test clock. Set STRIPE_USE_TEST_CLOCK=1 and subscribe again.',
  );
  process.exit(1);
}

// Stripe keeps a renewal invoice as a draft for about an hour, so go one hour past the period end.
// Advance once, then wait for the renewal to be reported before advancing again. In our testing,
// Stripe returned 429 for writes while a test clock advanced (observed, not documented), and the
// server's renewal writes are among them.
// The server retries each of those once (whenClockIdle in server/stripe.js).
const clockIdOf = typeof clockId === 'string' ? clockId : clockId.id;
const periodEnd = sub.items.data[0].current_period_end;
console.log(
  `Advancing ${clockIdOf} to ${new Date((periodEnd + 3600) * 1000).toISOString()}`,
);
await stripe.testHelpers.testClocks.advance(clockIdOf, {
  frozen_time: periodEnd + 3600,
});

const deadline = Date.now() + 120_000;
for (;;) {
  if (Date.now() > deadline)
    throw new Error('The test clock did not become ready within 2 minutes.');
  const clock = await stripe.testHelpers.testClocks.retrieve(clockIdOf);
  if (clock.status === 'ready') break;
  if (clock.status === 'internal_failure')
    throw new Error('The test clock failed to advance.');
  await new Promise((resolve) => setTimeout(resolve, 2000));
}

console.log('Clock is ready. In the server log, look for:');
console.log('  renewal requested ...   Stripe asked for payment');
console.log(
  '  renewal outcome ...     Primer answered, with its classification',
);
console.log(
  '  renewal reported ...    Stripe has the outcome; safe to advance again',
);
console.log('Then check the subscription and invoice in the Stripe Dashboard.');
