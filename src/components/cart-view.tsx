"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "./cart-provider";
import { buttonClass } from "./ui/button";
import { formatPrice } from "@/lib/utils";

import { FREE_SHIPPING_THRESHOLD as FREE_SHIPPING, SHIPPING_FEE as SHIPPING } from "@/lib/order-utils";

export function CartView() {
  const { items, subtotal, setQty, remove, ready, clear } = useCart();

  if (!ready) return <div className="h-64 animate-pulse rounded-lg bg-muted" />;

  if (items.length === 0)
    return (
      <div className="rounded-lg border border-dashed border-border p-16 text-center">
        <p className="text-lg font-medium">Your cart is empty</p>
        <p className="mt-1 text-sm text-muted-foreground">Find a deck or complete that fits your style.</p>
        <Link href="/shop" className={buttonClass("default", "lg", "mt-6")}>Start shopping</Link>
      </div>
    );

  const shipping = subtotal >= FREE_SHIPPING ? 0 : SHIPPING;

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
      <ul className="divide-y divide-border border-y border-border">
        {items.map((i) => (
          <li key={i.id} className="flex gap-4 py-5">
            <Link href={`/product/${i.slug}`} className="relative h-24 w-24 shrink-0 overflow-hidden rounded-md border border-border bg-white">
              <Image src={i.image} alt={i.name} fill sizes="96px" className="object-contain p-2" />
            </Link>
            <div className="flex flex-1 flex-col">
              <div className="flex justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">{i.brand}</p>
                  <Link href={`/product/${i.slug}`} className="font-medium hover:underline">{i.name}</Link>
                </div>
                <p className="font-semibold">{formatPrice(i.price * i.qty)}</p>
              </div>
              <div className="mt-auto flex items-center justify-between pt-3">
                <div className="flex items-center rounded-md border border-border">
                  <button className="flex h-8 w-8 items-center justify-center hover:bg-accent disabled:opacity-40" onClick={() => setQty(i.id, i.qty - 1)} disabled={i.qty <= 1} aria-label={`Decrease ${i.name}`}><Minus className="h-3.5 w-3.5" /></button>
                  <span className="w-8 text-center text-sm">{i.qty}</span>
                  <button className="flex h-8 w-8 items-center justify-center hover:bg-accent disabled:opacity-40" onClick={() => setQty(i.id, i.qty + 1)} disabled={i.qty >= i.stock} aria-label={`Increase ${i.name}`}><Plus className="h-3.5 w-3.5" /></button>
                </div>
                <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-destructive" onClick={() => remove(i.id)}>
                  <Trash2 className="h-4 w-4" /> Remove
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <aside className="h-fit rounded-lg border border-border p-6">
        <h2 className="font-semibold">Order summary</h2>
        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between"><dt className="text-muted-foreground">Subtotal</dt><dd>{formatPrice(subtotal)}</dd></div>
          <div className="flex justify-between"><dt className="text-muted-foreground">Shipping</dt><dd>{shipping === 0 ? "Free" : formatPrice(shipping)}</dd></div>
          {shipping > 0 && <p className="text-xs text-muted-foreground">Add {formatPrice(FREE_SHIPPING - subtotal)} more for free shipping.</p>}
          <div className="flex justify-between border-t border-border pt-3 text-base font-semibold"><dt>Total</dt><dd>{formatPrice(subtotal + shipping)}</dd></div>
        </dl>
        <Link href="/checkout" className={buttonClass("default", "lg", "mt-6 w-full")}>Proceed to checkout</Link>
        <p className="mt-2 text-center text-xs text-muted-foreground">Demo store: payments are simulated or PayPal sandbox.</p>
        <button className="mt-4 w-full text-center text-xs text-muted-foreground hover:text-foreground" onClick={clear}>Clear cart</button>
      </aside>
    </div>
  );
}
