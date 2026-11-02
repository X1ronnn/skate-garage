"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useCart } from "./cart-provider";
import { buttonClass } from "./ui/button";

export function CartButton() {
  const { count, ready } = useCart();
  return (
    <Link href="/cart" className={buttonClass("outline", "icon", "relative")} aria-label={`Cart, ${count} items`}>
      <ShoppingBag className="h-4 w-4" />
      {ready && count > 0 && (
        <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
          {count}
        </span>
      )}
    </Link>
  );
}
