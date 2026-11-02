"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { cn } from "@/lib/utils";

type Props = { categories: { slug: string; name: string; productCount: number }[]; brands: string[] };

const priceRanges = [
  { label: "Under ₱500", min: "", max: "499" },
  { label: "₱500 – ₱2,000", min: "500", max: "2000" },
  { label: "₱2,000 – ₱3,000", min: "2000", max: "3000" },
  { label: "Over ₱3,000", min: "3001", max: "" },
];

export function ShopFilters({ categories, brands }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();

  const update = (changes: Record<string, string | null>) => {
    const next = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(changes)) v ? next.set(k, v) : next.delete(k);
    startTransition(() => router.push(`${pathname}?${next.toString()}`, { scroll: false }));
  };

  const activeCat = params.get("category");
  const activeBrand = params.get("brand");
  const min = params.get("min") ?? "";
  const max = params.get("max") ?? "";

  const pill = (active: boolean) =>
    cn("w-full rounded-md px-3 py-1.5 text-left text-sm transition-colors", active ? "bg-primary text-primary-foreground" : "hover:bg-accent");

  return (
    <aside className={cn("space-y-8 transition-opacity", pending && "opacity-60")}>
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Category</p>
        <div className="space-y-1">
          <button className={pill(!activeCat)} onClick={() => update({ category: null })}>All products</button>
          {categories.map((c) => (
            <button key={c.slug} className={pill(activeCat === c.slug)} onClick={() => update({ category: c.slug })}>
              {c.name} <span className="opacity-60">({c.productCount})</span>
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Brand</p>
        <div className="space-y-1">
          <button className={pill(!activeBrand)} onClick={() => update({ brand: null })}>All brands</button>
          {brands.map((b) => (
            <button key={b} className={pill(activeBrand === b)} onClick={() => update({ brand: b })}>{b}</button>
          ))}
        </div>
      </div>
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Price</p>
        <div className="space-y-1">
          <button className={pill(!min && !max)} onClick={() => update({ min: null, max: null })}>Any price</button>
          {priceRanges.map((r) => (
            <button key={r.label} className={pill(min === r.min && max === r.max)} onClick={() => update({ min: r.min || null, max: r.max || null })}>
              {r.label}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}

export function SortSelect() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="text-muted-foreground">Sort</span>
      <select
        className="h-9 rounded-md border border-border bg-background px-2 text-sm outline-none focus:ring-2 focus:ring-ring"
        value={params.get("sort") ?? "featured"}
        onChange={(e) => {
          const next = new URLSearchParams(params.toString());
          e.target.value === "featured" ? next.delete("sort") : next.set("sort", e.target.value);
          router.push(`${pathname}?${next.toString()}`, { scroll: false });
        }}
      >
        <option value="featured">Featured</option>
        <option value="newest">Newest</option>
        <option value="price-asc">Price: low to high</option>
        <option value="price-desc">Price: high to low</option>
        <option value="rating">Top rated</option>
      </select>
    </label>
  );
}
