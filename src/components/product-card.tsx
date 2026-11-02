import Image from "next/image";
import Link from "next/link";
import type { ProductWithMeta } from "@/lib/queries";
import { formatPrice } from "@/lib/utils";
import { Rating } from "./rating";
import { Badge } from "./ui/badge";

export function ProductCard({ product, priority }: { product: ProductWithMeta; priority?: boolean }) {
  return (
    <Link href={`/product/${product.slug}`} className="group flex flex-col">
      <div className="relative aspect-square overflow-hidden rounded-lg border border-border bg-white">
        <Image
          src={product.image}
          alt={product.name}
          fill
          priority={priority}
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
          className="object-contain p-4 transition-transform duration-300 group-hover:scale-105"
        />
        {product.stock <= 8 && product.stock > 0 && (
          <Badge variant="solid" className="absolute left-3 top-3">Only {product.stock} left</Badge>
        )}
        {product.stock === 0 && <Badge variant="secondary" className="absolute left-3 top-3">Sold out</Badge>}
      </div>
      <div className="mt-3 flex flex-1 flex-col gap-1">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">{product.brand}</p>
        <h3 className="text-sm font-medium leading-snug group-hover:underline">{product.name}</h3>
        <Rating value={product.rating} count={product.reviewCount} />
        <p className="mt-auto pt-1 text-sm font-semibold">{formatPrice(product.price)}</p>
      </div>
    </Link>
  );
}
