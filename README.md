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

**Phase 2 (in progress)**
- Customer accounts and demo login
- PayPal sandbox checkout, order history and tracking
- Return requests with photo upload

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
| Hosting | Vercel (Singapore region, close to the database) |

## From PHP to Next.js

| Original (2023) | Rebuild |
|---|---|
| ~20k lines of PHP pages + Bootstrap | Typed React components and server-side data access |
| MySQL on XAMPP | Serverless Postgres (Neon) |
| Page reload for every filter | URL-driven filters with server rendering |
| Session-based cart | Client cart persisted in localStorage (server cart arrives with accounts) |

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
  app/            # routes: home, shop, product/[slug], cart
  components/     # UI, cart provider, filters, product card
  db/             # Drizzle schema and client
  lib/            # queries and utilities
scripts/          # database setup + catalog seed
```

> Demo store for portfolio purposes. Product photos come from the original store; reviews are sample data. No real orders or payments are processed.
