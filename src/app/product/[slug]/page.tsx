import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllSlugs, getProductBySlug, getRelatedProducts, getReviews } from "@/lib/queries";
import { formatPrice } from "@/lib/utils";
import { AddToCart } from "@/components/add-to-cart";
import { ProductCard } from "@/components/product-card";
import { Rating } from "@/components/rating";
import { Badge } from "@/components/ui/badge";
import { ReviewForm } from "@/components/review-form";

export const revalidate = 300;
type Params = Promise<{ slug: string }>;

export async function generateStaticParams() {
  return (await getAllSlugs()).map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const product = await getProductBySlug((await params).slug);
  if (!product) return { title: "Product not found" };
  return { title: product.name, description: product.description, openGraph: { images: [product.image] } };
}

export default async function ProductPage({ params }: { params: Params }) {
  const product = await getProductBySlug((await params).slug);
  if (!product) notFound();
  const [reviews, related] = await Promise.all([getReviews(product.id), getRelatedProducts(product.categoryId, product.id)]);

  const specs = [
    ["Brand", product.brand],
    ["Category", product.categoryName],
    ["Size", product.size],
    ["Color", product.color],
    ["Material", product.material],
  ].filter(([, v]) => v) as [string, string][];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <nav className="text-sm text-muted-foreground" aria-label="Breadcrumb">
        <Link href="/shop" className="hover:text-foreground">Shop</Link>
        <span className="mx-2">/</span>
        <Link href={`/shop?category=${product.categorySlug}`} className="hover:text-foreground">{product.categoryName}</Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{product.name}</span>
      </nav>

      <div className="mt-6 grid gap-10 md:grid-cols-2">
        <div className="relative aspect-square overflow-hidden rounded-xl border border-border bg-white">
          <Image src={product.image} alt={product.name} fill priority sizes="(min-width: 768px) 50vw, 100vw" className="object-contain p-8" />
        </div>

        <div>
          <p className="text-sm uppercase tracking-wide text-muted-foreground">{product.brand}</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">{product.name}</h1>
          <Rating value={product.rating} count={product.reviewCount} className="mt-3 text-sm" />
          <p className="mt-5 text-3xl font-semibold">{formatPrice(product.price)}</p>
          <div className="mt-3">
            {product.stock === 0 ? <Badge variant="secondary">Sold out</Badge>
              : product.stock <= 8 ? <Badge variant="outline" className="border-amber-300 text-amber-700">Only {product.stock} left in stock</Badge>
              : <Badge variant="outline" className="border-emerald-300 text-emerald-700">In stock</Badge>}
          </div>
          <p className="mt-6 leading-relaxed text-muted-foreground">{product.description}</p>

          <div className="mt-8">
            <AddToCart product={{ id: product.id, slug: product.slug, name: product.name, brand: product.brand, price: product.price, image: product.image, stock: product.stock }} />
          </div>

          <dl className="mt-10 divide-y divide-border rounded-lg border border-border text-sm">
            {specs.map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4 px-4 py-3">
                <dt className="text-muted-foreground">{k}</dt>
                <dd className="text-right font-medium">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <section id="reviews" className="mt-16 scroll-mt-24 border-t border-border pt-10">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <h2 className="text-xl font-semibold">Customer reviews</h2>
          <Rating value={product.rating} count={product.reviewCount} className="text-sm" />
        </div>
        {reviews.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">No reviews yet.</p>
        ) : (
          <ul className="mt-6 grid gap-4 md:grid-cols-2">
            {reviews.map((r) => (
              <li key={r.id} className="rounded-lg border border-border p-5">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{r.author}{r.userId && <span className="ml-2 rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700">Verified buyer</span>}</p>
                  <time className="text-xs text-muted-foreground" dateTime={r.createdAt.toISOString()}>
                    {r.createdAt.toLocaleDateString("en-PH", { year: "numeric", month: "short", day: "numeric" })}
                  </time>
                </div>
                <Rating value={r.rating} className="mt-1" />
                <p className="mt-3 text-sm text-muted-foreground">{r.body}</p>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-6"><ReviewForm productId={product.id} slug={product.slug} /></div>
        <p className="mt-4 text-xs text-muted-foreground">Older reviews are sample data for this demo. New reviews come from verified buyers.</p>
      </section>

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="text-xl font-semibold">You might also like</h2>
          <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-8 lg:grid-cols-4">
            {related.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}
    </div>
  );
}
