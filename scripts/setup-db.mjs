// Creates the Skate Garage tables and seeds the catalog.
// Usage: npm run db:setup   (reads DATABASE_URL from .env.local)
import { neon } from "@neondatabase/serverless";
import { categories, products, reviewPool } from "./catalog.mjs";

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

const [summary] = await sql`SELECT (SELECT count(*)::int FROM categories) AS categories, (SELECT count(*)::int FROM products) AS products, (SELECT count(*)::int FROM reviews) AS reviews`;
console.log("Database ready:", summary);
