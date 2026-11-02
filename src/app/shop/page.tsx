import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { getBrands, getCategoriesWithCounts, getProducts, type ShopFilters as Filters } from "@/lib/queries";
import { ProductCard } from "@/components/product-card";
import { ShopFilters, SortSelect } from "@/components/shop-filters";
import { buttonClass } from "@/components/ui/button";

export const metadata: Metadata = { title: "Shop", description: "Browse skateboard decks, complete setups and skate tools." };

type SP = Promise<Record<string, string | string[] | undefined>>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) || undefined;
const SORTS = ["featured", "newest", "price-asc", "price-desc", "rating"] as const;

export default async function ShopPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const sortParam = one(sp.sort);
  const filters: Filters = {
    category: one(sp.category),
    brand: one(sp.brand),
    q: one(sp.q)?.slice(0, 80),
    min: one(sp.min) ? Number(one(sp.min)) : undefined,
    max: one(sp.max) ? Number(one(sp.max)) : undefined,
    sort: SORTS.includes(sortParam as (typeof SORTS)[number]) ? (sortParam as Filters["sort"]) : "featured",
  };
  const [items, cats, brands] = await Promise.all([getProducts(filters), getCategoriesWithCounts(), getBrands()]);
  const title = filters.q ? `Results for “${filters.q}”` : cats.find((c) => c.slug === filters.category)?.name ?? "All products";

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{items.length} {items.length === 1 ? "product" : "products"}</p>
        </div>
        <Suspense><SortSelect /></Suspense>
      </div>
      <div className="mt-8 grid gap-10 md:grid-cols-[220px_1fr]">
        <Suspense><ShopFilters categories={cats} brands={brands} /></Suspense>
        <div>
          {items.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border p-12 text-center">
              <p className="font-medium">No products match those filters.</p>
              <Link href="/shop" className={buttonClass("outline", "md", "mt-4")}>Clear filters</Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-x-4 gap-y-8 lg:grid-cols-3">
              {items.map((p, i) => <ProductCard key={p.id} product={p} priority={i < 3} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
