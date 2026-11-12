// Reads the environment once and fails fast, listing every missing variable.
const required = [
  'PRIMER_API_KEY',
  'STRIPE_SECRET_KEY',
  'PRIMER_WEBHOOK_SECRET',
  'STRIPE_WEBHOOK_SECRET',
  'STRIPE_PRICE_ID',
  'STRIPE_CPM_TYPE_ID',
];

const missing = required.filter((name) => !process.env[name]);
if (missing.length > 0) {
  console.error(`Missing environment variables: ${missing.join(', ')}`);
  console.error('Copy .env.example to .env and fill them in.');
  process.exit(1);
}

// Every subscribe creates a real Stripe customer and subscription. Keep it on test keys.
if (!/^[rs]k_test_/.test(process.env.STRIPE_SECRET_KEY)) {
  console.error(
    'STRIPE_SECRET_KEY must be a test-mode key (sk_test_... or rk_test_...).',
  );
  process.exit(1);
}

export const config = {
  primerApiKey: process.env.PRIMER_API_KEY,
  primerApiHost: process.env.PRIMER_API_HOST || 'api.sandbox.primer.io',
  // Required: PENDING payments normally settle through this webhook.
  primerWebhookSecret: process.env.PRIMER_WEBHOOK_SECRET,
  stripeSecretKey: process.env.STRIPE_SECRET_KEY,
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  stripePriceId: process.env.STRIPE_PRICE_ID,
  stripeCpmTypeId: process.env.STRIPE_CPM_TYPE_ID,
  stripeUseTestClock: process.env.STRIPE_USE_TEST_CLOCK === '1',
  // The API routes have no authentication, so listen on localhost only.
  // Put real auth in front of them before binding to anything else.
  host: process.env.HOST || '127.0.0.1',
  port: Number(process.env.PORT) || 3000,
};
