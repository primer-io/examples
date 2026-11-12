// Creates or updates the demo products in Sphere. Sphere needs each product and its tax code
// before it can calculate tax on it. Run it again whenever CART changes: npm run seed
import { CART } from '../server/catalog.js';
import { config } from '../server/config.js';
import { upsertProduct } from '../server/sphere.js';

for (const item of CART) {
  const product = await upsertProduct({
    external_id: item.itemId,
    name: item.description,
    tax_code: config.sphereTaxCode,
  });
  console.log(item.itemId, JSON.stringify(product));
}
