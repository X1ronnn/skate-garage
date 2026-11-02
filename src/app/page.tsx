import Image from "next/image";
import Link from "next/link";
import { ArrowRight, RotateCcw, ShieldCheck, Truck } from "lucide-react";
import { getCategoriesWithCounts, getFeaturedProducts } from "@/lib/queries";
import { ProductCard } from "@/components/product-card";
import { buttonClass } from "@/components/ui/button";

export const revalidate = 300;

const categoryImages: Record<string, string> = {
  decks: "/products/justice-cosmos-deck.jpg",
  completes: "/products/complete-skateboard-crimson.jpg",
  tools: "/products/silver-pro-t-tool.jpg",
};

export default async function HomePage() {
  const [featured, cats] = await Promise.all([getFeaturedProducts(8), getCategoriesWithCounts()]);

  return (
    <>
      <section className="relative isolate overflow-hidden bg-zinc-950 text-white">
        <Image src="/hero/slide-2.jpg" alt="Skateboard on an empty road at sunset" fill priority sizes="100vw" className="-z-10 object-cover opacity-55" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-zinc-950 via-zinc-950/70 to-transparent" />
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 md:py-36">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-zinc-400">Skate Garage · Est. 2023</p>
          <h1 className="mt-4 max-w-2xl text-4xl font-bold tracking-tight sm:text-6xl">Boards built for the streets.</h1>
          <p className="mt-5 max-w-xl text-lg text-zinc-300">Decks from Justice, Turf and Boiling, ready-to-ride completes, and the tools to keep your setup dialed.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/shop" className={buttonClass("default", "lg", "bg-white text-zinc-900 hover:bg-zinc-200")}>
              Shop all <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/shop?category=completes" className={buttonClass("outline", "lg", "border-zinc-600 bg-transparent text-white hover:bg-white/10")}>
              Complete setups
            </Link>
          </div>
        </div>
      </section>

      <section className="border-b border-border">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 text-sm sm:grid-cols-3 sm:px-6">
          {[
            { icon: Truck, title: "Nationwide shipping", text: "Tracked delivery anywhere in the Philippines." },
            { icon: ShieldCheck, title: "Secure checkout", text: "PayPal checkout (sandbox in this demo)." },
            { icon: RotateCcw, title: "Easy returns", text: "Request a return from your order page." },
          ].map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex items-start gap-3">
              <Icon className="mt-0.5 h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">{title}</p>
                <p className="text-muted-foreground">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pt-16 sm:px-6">
        <h2 className="text-2xl font-semibold tracking-tight">Shop by category</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {cats.map((c) => (
            <Link key={c.slug} href={`/shop?category=${c.slug}`} className="group relative overflow-hidden rounded-lg border border-border bg-white p-6">
              <div className="relative mx-auto aspect-[4/3] w-full">
                <Image src={categoryImages[c.slug] ?? "/products/turf-rose-deck.jpg"} alt={c.name} fill sizes="33vw" className="object-contain transition-transform duration-300 group-hover:scale-105" />
              </div>
              <div className="mt-4 flex items-center justify-between">
                <div>
                  <p className="font-medium">{c.name}</p>
                  <p className="text-sm text-muted-foreground">{c.productCount} products</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pt-16 sm:px-6">
        <div className="flex items-end justify-between">
          <h2 className="text-2xl font-semibold tracking-tight">Featured</h2>
          <Link href="/shop" className="text-sm text-muted-foreground hover:text-foreground">View all →</Link>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
          {featured.map((p, i) => <ProductCard key={p.id} product={p} priority={i < 4} />)}
        </div>
      </section>
    </>
  );
}
