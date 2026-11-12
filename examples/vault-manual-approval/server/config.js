const env = process.env;

const missing = ['PRIMER_API_KEY', 'STRIPE_SECRET_KEY'].filter(
  (name) => !env[name],
);
if (missing.length > 0) {
  console.error(
    `Missing required environment variables: ${missing.join(', ')}`,
  );
  console.error('Copy .env.example to .env and fill them in.');
  process.exit(1);
}

// Sandbox only: a live key here would charge real cards.
if (!/^[sr]k_test_/.test(env.STRIPE_SECRET_KEY)) {
  console.error(
    'STRIPE_SECRET_KEY must start with sk_test_ or rk_test_. This example is sandbox only.',
  );
  process.exit(1);
}

const route = env.ROUTE ?? 'stripe';
if (route !== 'stripe' && route !== 'primer') {
  console.error(`ROUTE must be "stripe" or "primer", got "${route}".`);
  process.exit(1);
}

const amount = Number(env.AMOUNT ?? 4999);
if (!Number.isInteger(amount) || amount <= 0) {
  console.error(
    `AMOUNT must be a positive integer in minor units, got "${env.AMOUNT}".`,
  );
  process.exit(1);
}

export const config = {
  primerApiKey: env.PRIMER_API_KEY,
  primerApiHost: env.PRIMER_API_HOST || 'api.sandbox.primer.io',
  primerProxyHost: env.PRIMER_PROXY_HOST || 'proxy.sandbox.primer.io',
  primerProxyApiKey: env.PRIMER_PROXY_API_KEY || env.PRIMER_API_KEY,
  stripeSecretKey: env.STRIPE_SECRET_KEY,
  route,
  amount,
  currency: env.CURRENCY || 'EUR',
  countryCode: env.COUNTRY_CODE || 'DE',
  // The endpoints have no authentication, so keep them local.
  host: env.HOST || '127.0.0.1',
  port: Number(env.PORT || 3000),
  // Lets the browser pick a route, so a presenter can show both paths.
  routeOverrideAllowed: env.NODE_ENV !== 'production',
};
