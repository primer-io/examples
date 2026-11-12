// The only file that reads process.env. Fails fast, listing every missing variable.
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const required = ['PRIMER_API_KEY', 'SPHERE_API_KEY', 'SPHERE_TAX_CODE'];

const missing = required.filter((name) => !process.env[name]);
if (missing.length > 0) {
  console.error(`Missing environment variables: ${missing.join(', ')}`);
  console.error('Copy .env.example to .env and fill them in.');
  process.exit(1);
}

const exampleDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
);
const dbPath = process.env.DB_PATH || 'data/orders.db';

export const config = {
  primerApiKey: process.env.PRIMER_API_KEY,
  primerApiHost: process.env.PRIMER_API_HOST || 'api.sandbox.primer.io',
  // Nothing here can tell a test key from a live one. Use a Sphere test organization.
  sphereApiKey: process.env.SPHERE_API_KEY,
  sphereTaxCode: process.env.SPHERE_TAX_CODE,
  dbPath: dbPath === ':memory:' ? dbPath : path.resolve(exampleDir, dbPath),
  // The API routes have no authentication, so listen on localhost only.
  // Put real auth in front of them before binding to anything else.
  host: process.env.HOST || '127.0.0.1',
  port: Number(process.env.PORT) || 3000,
};
