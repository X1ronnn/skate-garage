import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight, Package } from "lucide-react";
import { requireUser } from "@/lib/session";
import { getUserOrders } from "@/lib/order-queries";
import { formatPrice } from "@/lib/utils";
import { OrderStatusBadge } from "@/components/order-status-badge";
import { SignOutButton } from "@/components/sign-out-button";
import { buttonClass } from "@/components/ui/button";

export const metadata: Metadata = { title: "My account", robots: { index: false } };

export default async function AccountPage() {
  const user = await requireUser("/account");
  const list = await getUserOrders(user.id);
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Hi, {user.name.split(" ")[0]}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{user.email}</p>
        </div>
        <SignOutButton />
      </div>

      <h2 className="mt-10 text-lg font-semibold">Your orders</h2>
      {list.length === 0 ? (
        <div className="mt-4 rounded-lg border border-dashed border-border p-12 text-center">
          <Package className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-3 font-medium">No orders yet</p>
          <Link href="/shop" className={buttonClass("default", "md", "mt-5")}>Start shopping</Link>
        </div>
      ) : (
        <ul className="mt-4 divide-y divide-border rounded-lg border border-border">
          {list.map((o) => (
            <li key={o.id}>
              <Link href={`/account/orders/${o.id}`} className="flex items-center gap-4 p-4 transition-colors hover:bg-accent/60">
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md border border-border bg-white">
                  {o.firstImage && <Image src={o.firstImage} alt="" fill sizes="56px" className="object-contain p-1" />}
                </div>
                <div className="flex-1">
                  <p className="font-medium">Order #{o.id}</p>
                  <p className="text-sm text-muted-foreground">
                    {o.createdAt.toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" })} · {o.itemCount} {o.itemCount === 1 ? "item" : "items"}
                  </p>
                </div>
                <div className="text-right">
                  <OrderStatusBadge status={o.status} />
                  <p className="mt-1 text-sm font-semibold">{formatPrice(o.total)}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
