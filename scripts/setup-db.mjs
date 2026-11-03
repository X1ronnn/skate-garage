// Creates the Skate Garage tables and seeds the catalog.
// Usage: npm run db:setup   (reads DATABASE_URL from .env.local)
import { neon } from "@neondatabase/serverless";
import { categories, products, reviewPool } from "./catalog.mjs";
import { hashPassword } from "better-auth/crypto";
import { randomUUID } from "node:crypto";

export const DEMO = { email: "demo@skategarage.dev", password: "skate-demo-2026", name: "Demo Skater" };

const sql = neon(process.env.DATABASE_URL);

await sql`CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT
)`;
await sql`CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  brand TEXT NOT NULL,
  category_id INTEGER NOT NULL REFERENCES categories(id),
  price INTEGER NOT NULL CHECK (price >= 0),
  stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  description TEXT NOT NULL,
  color TEXT,
  size TEXT,
  material TEXT,
  image TEXT NOT NULL,
  featured BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
)`;
await sql`CREATE TABLE IF NOT EXISTS reviews (
  id SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  author TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
)`;
await sql`CREATE INDEX IF NOT EXISTS products_category_idx ON products(category_id)`;
await sql`CREATE INDEX IF NOT EXISTS reviews_product_idx ON reviews(product_id)`;

for (const c of categories) {
  await sql`INSERT INTO categories (name, slug, description) VALUES (${c.name}, ${c.slug}, ${c.description})
            ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description`;
}
const catRows = await sql`SELECT id, slug FROM categories`;
const catId = Object.fromEntries(catRows.map((r) => [r.slug, r.id]));

for (const [i, p] of products.entries()) {
  const created = new Date(Date.now() - (products.length - i) * 86400000).toISOString();
  await sql`INSERT INTO products (slug, name, brand, category_id, price, stock, description, color, size, material, image, featured, created_at)
    VALUES (${p.slug}, ${p.name}, ${p.brand}, ${catId[p.category]}, ${p.price}, ${p.stock}, ${p.description}, ${p.color ?? null}, ${p.size ?? null}, ${p.material ?? null}, ${"/products/" + p.slug + ".jpg"}, ${!!p.featured}, ${created})
    ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, brand = EXCLUDED.brand, category_id = EXCLUDED.category_id, price = EXCLUDED.price,
      description = EXCLUDED.description, color = EXCLUDED.color, size = EXCLUDED.size, material = EXCLUDED.material, image = EXCLUDED.image, featured = EXCLUDED.featured`;
}

// Seed demo reviews once (2-4 per product, deterministic)
const [{ count }] = await sql`SELECT count(*)::int AS count FROM reviews`;
if (count === 0) {
  const rows = await sql`SELECT id FROM products ORDER BY id`;
  for (const [i, { id }] of rows.entries()) {
    const n = 2 + (i % 3);
    for (let k = 0; k < n; k++) {
      const [author, rating, body] = reviewPool[(i + k) % reviewPool.length];
      await sql`INSERT INTO reviews (product_id, author, rating, body, created_at) VALUES (${id}, ${author}, ${rating}, ${body}, now() - (${(k + 1) * 3} || ' days')::interval)`;
    }
  }
}


// ---------- Phase 2: auth, orders, returns ----------
await sql`CREATE TABLE IF NOT EXISTS "user" (
  id TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL UNIQUE, email_verified BOOLEAN NOT NULL DEFAULT FALSE,
  image TEXT, role TEXT NOT NULL DEFAULT 'customer', created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now())`;
await sql`CREATE TABLE IF NOT EXISTS session (
  id TEXT PRIMARY KEY, expires_at TIMESTAMPTZ NOT NULL, token TEXT NOT NULL UNIQUE, created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(), ip_address TEXT, user_agent TEXT, user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE)`;
await sql`CREATE TABLE IF NOT EXISTS account (
  id TEXT PRIMARY KEY, account_id TEXT NOT NULL, provider_id TEXT NOT NULL, user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  access_token TEXT, refresh_token TEXT, id_token TEXT, access_token_expires_at TIMESTAMPTZ, refresh_token_expires_at TIMESTAMPTZ,
  scope TEXT, password TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now())`;
await sql`CREATE TABLE IF NOT EXISTS verification (
  id TEXT PRIMARY KEY, identifier TEXT NOT NULL, value TEXT NOT NULL, expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now())`;
await sql`CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY, user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending_payment' CHECK (status IN ('pending_payment','paid','shipped','delivered','cancelled','return_requested','returned')),
  subtotal INTEGER NOT NULL, shipping_fee INTEGER NOT NULL, total INTEGER NOT NULL, payment_method TEXT, payment_ref TEXT,
  full_name TEXT NOT NULL, phone TEXT NOT NULL, address TEXT NOT NULL, city TEXT NOT NULL, province TEXT NOT NULL, postal_code TEXT NOT NULL,
  courier TEXT, tracking_number TEXT, paid_at TIMESTAMPTZ, shipped_at TIMESTAMPTZ, delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now())`;
await sql`CREATE INDEX IF NOT EXISTS orders_user_idx ON orders(user_id)`;
await sql`CREATE TABLE IF NOT EXISTS order_items (
  id SERIAL PRIMARY KEY, order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE, product_id INTEGER NOT NULL REFERENCES products(id),
  name TEXT NOT NULL, image TEXT NOT NULL, price INTEGER NOT NULL, quantity INTEGER NOT NULL CHECK (quantity > 0))`;
await sql`CREATE INDEX IF NOT EXISTS order_items_order_idx ON order_items(order_id)`;
await sql`CREATE TABLE IF NOT EXISTS returns (
  id SERIAL PRIMARY KEY, order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE, user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  reason TEXT NOT NULL, details TEXT, image_url TEXT, status TEXT NOT NULL DEFAULT 'requested', created_at TIMESTAMPTZ NOT NULL DEFAULT now())`;
await sql`CREATE UNIQUE INDEX IF NOT EXISTS returns_order_unique ON returns(order_id)`;
await sql`ALTER TABLE reviews ADD COLUMN IF NOT EXISTS user_id TEXT REFERENCES "user"(id) ON DELETE SET NULL`;
await sql`ALTER TABLE reviews ADD COLUMN IF NOT EXISTS order_id INTEGER REFERENCES orders(id) ON DELETE SET NULL`;

// Demo customer (credentials are shown on the login page on purpose)
let [demo] = await sql`SELECT id FROM "user" WHERE email = ${DEMO.email}`;
if (!demo) {
  const id = randomUUID();
  await sql`INSERT INTO "user" (id, name, email, email_verified, role) VALUES (${id}, ${DEMO.name}, ${DEMO.email}, true, 'customer')`;
  await sql`INSERT INTO account (id, account_id, provider_id, user_id, password) VALUES (${randomUUID()}, ${id}, 'credential', ${id}, ${await hashPassword(DEMO.password)})`;
  demo = { id };
}
const [{ demoOrders }] = await sql`SELECT count(*)::int AS "demoOrders" FROM orders WHERE user_id = ${demo.id}`;
if (demoOrders === 0) {
  const pick = async (slug) => (await sql`SELECT id, name, image, price FROM products WHERE slug = ${slug}`)[0];
  const seedOrder = async ({ items, status, daysAgo, courier, tracking }) => {
    const rows = await Promise.all(items.map(async ([slug, qty]) => ({ ...(await pick(slug)), qty })));
    const subtotal = rows.reduce((n, r) => n + r.price * r.qty, 0);
    const shipping = subtotal >= 3000 ? 0 : 150;
    const created = new Date(Date.now() - daysAgo * 86400000);
    const [o] = await sql`INSERT INTO orders (user_id, status, subtotal, shipping_fee, total, payment_method, payment_ref, full_name, phone, address, city, province, postal_code, courier, tracking_number, paid_at, shipped_at, delivered_at, created_at)
      VALUES (${demo.id}, ${status}, ${subtotal}, ${shipping}, ${subtotal + shipping}, 'demo', ${'DEMO-' + randomUUID().slice(0, 8).toUpperCase()}, ${DEMO.name}, '0917 000 0000', '123 Demo Street, Lahug', 'Cebu City', 'Cebu', '6000',
        ${courier}, ${tracking}, ${created.toISOString()}, ${new Date(created.getTime() + 86400000).toISOString()}, ${status === 'delivered' ? new Date(created.getTime() + 3 * 86400000).toISOString() : null}, ${created.toISOString()})
      RETURNING id`;
    for (const r of rows) await sql`INSERT INTO order_items (order_id, product_id, name, image, price, quantity) VALUES (${o.id}, ${r.id}, ${r.name}, ${r.image}, ${r.price}, ${r.qty})`;
  };
  await seedOrder({ items: [["justice-cosmos-deck", 1], ["silver-pro-t-tool", 1]], status: "delivered", daysAgo: 12, courier: "J&T Express", tracking: "JT0012345678" });
  await seedOrder({ items: [["complete-skateboard-ocean", 1]], status: "shipped", daysAgo: 2, courier: "LBC", tracking: "LBC-88341207" });
}

const [summary] = await sql`SELECT (SELECT count(*)::int FROM categories) AS categories, (SELECT count(*)::int FROM products) AS products, (SELECT count(*)::int FROM reviews) AS reviews, (SELECT count(*)::int FROM "user") AS users, (SELECT count(*)::int FROM orders) AS orders`;
console.log("Database ready:", summary);
