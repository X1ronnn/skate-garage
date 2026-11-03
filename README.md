# Skate Garage

A full-stack skateboard e-commerce store. It's a modern rebuild of a PHP + MySQL shop I built in 2023, now on **Next.js 15, TypeScript, Tailwind CSS, Drizzle ORM and Neon Postgres**, deployed on Vercel.

**Live demo:** https://skate-garage.vercel.app &nbsp;·&nbsp; **Author:** [Arvin Dwight Corpuz](https://dwight-corpuz.vercel.app)

## Features

**Phase 1 (live)**
- Storefront with hero, categories and featured products
- Shop page with category, brand and price filters, search, and sorting (all URL-driven, server-rendered)
- Product pages with specs, stock status, ratings and reviews, plus related products
- Persistent cart (quantity limits by stock, free-shipping threshold, order summary)
- 22 product pages statically generated from the database and revalidated every 5 minutes

**Phase 2 (live)**
- Email/password accounts with [Better Auth](https://better-auth.com), plus a one-click demo customer login
- Checkout with server-side price validation and **atomic stock reservation** (a single SQL statement reserves every line or none, so stock can't oversell)
- Payments: simulated demo card, or **PayPal sandbox** when `NEXT_PUBLIC_PAYPAL_CLIENT_ID` / `PAYPAL_CLIENT_SECRET` are set (stock is released if a capture fails)
- Order history, order timeline (placed → paid → shipped → delivered), courier and tracking number
- Return requests (one per order) with optional photo upload to Vercel Blob
- Verified-buyer reviews: only customers who bought an item can review it

**Demo login:** `demo@skategarage.dev` / `skate-demo-2026` (or click "Continue as demo customer").

**Phase 3 (planned)**
- Admin dashboard: sales charts, product and inventory management, order status updates

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15 (App Router, React Server Components) |
| Language | TypeScript |
| Styling | Tailwind CSS with shadcn/ui-style components (Zinc palette) |
| Database | Neon serverless Postgres |
| ORM | Drizzle ORM |
| Auth | Better Auth (sessions in Postgres) |
| Payments | PayPal Orders v2 API (sandbox) |
| File storage | Vercel Blob |
| Validation | Zod |
| Hosting | Vercel (Singapore region, close to the database) |

## From PHP to Next.js

| Original (2023) | Rebuild |
|---|---|
| ~20k lines of PHP pages + Bootstrap | Typed React components and server-side data access |
| MySQL on XAMPP | Serverless Postgres (Neon) |
| Page reload for every filter | URL-driven filters with server rendering |
| Session-based cart | Client cart in localStorage, validated server-side at checkout |
| PHP sessions + manual password hashing | Better Auth sessions, rate limiting and scrypt password hashing |

## Run locally

```bash
npm install
cp .env.example .env.local   # add your Neon DATABASE_URL
npm run db:setup             # creates tables and seeds the catalog
npm run dev
```

## Project structure

```
src/
  app/            # routes: home, shop, product/[slug], cart, checkout, account, login
  components/     # UI, cart provider, filters, product card
  db/             # Drizzle schema and client
  lib/            # queries, server actions (orders, payments, returns, reviews), auth
scripts/          # database setup + catalog seed
```

> Demo store for portfolio purposes. Product photos come from the original store; reviews are sample data. No real orders or payments are processed.
