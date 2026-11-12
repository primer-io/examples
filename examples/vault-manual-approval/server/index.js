import { randomUUID } from 'node:crypto';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import { config } from './config.js';
import { createClientSession } from './primer.js';
import { decide } from './decide.js';
import { processAttempt } from './process.js';

const require = createRequire(import.meta.url);
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
// The exports map has no ./dist/* entry, so resolve the main entry (dist/primer-loader.js) and serve its directory.
const primerJsDist = path.dirname(require.resolve('@primer-io/primer-js'));

const app = express();
app.use(express.json());
app.use(express.static(path.join(root, 'public')));
app.use('/vendor/primer-js', express.static(primerJsDist));

app.post('/api/client-session', async (req, res) => {
  try {
    const clientToken = await createClientSession({
      orderId: `order-${randomUUID()}`,
      customerId: `customer-${randomUUID()}`,
      amount: config.amount,
      currencyCode: config.currency,
      countryCode: config.countryCode,
    });
    console.log('[session] client session created');
    res.json({
      clientToken,
      amount: config.amount,
      currency: config.currency,
      defaultRoute: config.route,
      routeOverrideAllowed: config.routeOverrideAllowed,
    });
  } catch (err) {
    console.error('[session] failed:', err.message, err.body ?? '');
    res.status(502).json({
      error: 'Could not create a client session. See the server log.',
    });
  }
});

// Ids go into URL paths and log lines, so allow only plain characters.
const ID_PATTERN = /^[A-Za-z0-9_-]+$/;
const isId = (value) =>
  typeof value === 'string' && value.length <= 200 && ID_PATTERN.test(value);

app.post('/api/decide', async (req, res) => {
  const { paymentAttemptId, paymentMethodToken, route } = req.body ?? {};
  if (!isId(paymentAttemptId) || !isId(paymentMethodToken)) {
    return res.status(400).json({
      error:
        'paymentAttemptId and paymentMethodToken must be non-empty strings of letters, digits, "_" or "-"',
    });
  }
  if (route !== undefined && route !== 'stripe' && route !== 'primer') {
    return res
      .status(400)
      .json({ error: 'route must be "stripe" or "primer"' });
  }

  const chosen = decide({
    paymentAttemptId,
    paymentMethodToken,
    requestedRoute: route,
  });
  console.log(`[decide] attempt ${paymentAttemptId} -> ${chosen}`);

  try {
    const { status, body } = await processAttempt({
      paymentAttemptId,
      paymentMethodToken,
      route: chosen,
    });
    res.status(status).json(body);
  } catch (err) {
    console.error(`[${chosen}] failed:`, err.message, err.body ?? '');
    res
      .status(502)
      .json({ error: `Processing with ${chosen} failed. See the server log.` });
  }
});

// Without this, Express answers a malformed body with an HTML stack page.
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Invalid JSON' });
  }
  // body-parser errors such as 413 carry their own client error status.
  const status = err.status ?? err.statusCode;
  if (status >= 400 && status < 500) {
    return res
      .status(status)
      .json({ error: err.expose ? err.message : 'Bad request' });
  }
  console.error('[server] unhandled:', err.message);
  res.status(500).json({ error: 'Internal error' });
});

app.listen(config.port, config.host, () => {
  console.log(
    `Listening on http://${config.host}:${config.port} (default route: ${config.route})`,
  );
});
