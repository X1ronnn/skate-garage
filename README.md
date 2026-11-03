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

**PayPal sandbox buyer:** `sb-3nm4z53689497@personal.example.com` / `SkateDemo2026!` (sandbox only, fake money).

**Phase 3 (live): admin dashboard** at `/admin`
- Role-based access (`customer`, `admin`, read-only `demo_admin`). Every admin query and server action checks the role on the server, not just the layout
- Dashboard: 30-day revenue, orders and average order value vs the previous period, daily revenue chart (SQL `generate_series`, Manila time), best sellers, low stock, recent orders
- Orders: search and status filters; ship with courier and tracking number, mark delivered, cancel and restock
- Returns: approve, reject, or mark refunded (which restocks the items)
- Products: create and edit with image upload to Vercel Blob, archive and restore (archived items vanish from the store but stay in past orders), quick restock; store pages revalidate on save
- Review moderation

**Demo admin (read-only):** `admin@skategarage.dev` / `skate-admin-demo` (or click "View the admin dashboard" on the sign-in page). Browse everything; changes are blocked on the server. The dashboard includes seeded sample sales history.

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

To make yourself a full admin, sign up in the app, then run `ADMIN_EMAIL=you@example.com npm run db:setup`.

## Project structure

```
src/
  app/            # routes: home, shop, product/[slug], cart, checkout, account, login, admin/*
  components/     # UI, cart provider, filters, product card
  db/             # Drizzle schema and client
  lib/            # queries, server actions (orders, payments, returns, reviews), auth
  lib/admin/      # role guard, admin queries and server actions
scripts/          # database setup + catalog seed
```

> Demo store for portfolio purposes. Product photos come from the original store; reviews are sample data. No real orders or payments are processed.
