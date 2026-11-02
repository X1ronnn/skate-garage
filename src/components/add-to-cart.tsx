"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Minus, Plus, ShoppingBag } from "lucide-react";
import { useCart, type CartItem } from "./cart-provider";
import { Button, buttonClass } from "./ui/button";

export function AddToCart({ product }: { product: Omit<CartItem, "qty"> }) {
  const { add, items } = useCart();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const inCart = items.find((i) => i.id === product.id)?.qty ?? 0;
  const max = Math.max(0, product.stock - inCart);

  if (product.stock === 0) return <Button disabled size="lg" className="w-full">Sold out</Button>;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div className="flex items-center rounded-md border border-border">
          <button className="flex h-11 w-11 items-center justify-center hover:bg-accent disabled:opacity-40" onClick={() => setQty((q) => Math.max(1, q - 1))} disabled={qty <= 1} aria-label="Decrease quantity">
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-10 text-center text-sm font-medium" aria-live="polite">{qty}</span>
          <button className="flex h-11 w-11 items-center justify-center hover:bg-accent disabled:opacity-40" onClick={() => setQty((q) => Math.min(max, q + 1))} disabled={qty >= max} aria-label="Increase quantity">
            <Plus className="h-4 w-4" />
          </button>
        </div>
        <Button
          size="lg"
          className="flex-1"
          disabled={max === 0}
          onClick={() => {
            add(product, qty);
            setAdded(true);
            setTimeout(() => setAdded(false), 1800);
          }}
        >
          {added ? <><Check className="h-4 w-4" /> Added to cart</> : <><ShoppingBag className="h-4 w-4" /> Add to cart</>}
        </Button>
      </div>
      {inCart > 0 && (
        <p className="text-sm text-muted-foreground">
          {inCart} in your cart · <Link href="/cart" className="font-medium text-foreground underline underline-offset-4">View cart</Link>
        </p>
      )}
      {max === 0 && inCart > 0 && <p className="text-sm text-muted-foreground">You have all available stock in your cart.</p>}
      <Link href="/cart" className={buttonClass("outline", "lg", "w-full sm:hidden")}>Go to cart</Link>
    </div>
  );
}
