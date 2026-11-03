import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, Circle, PartyPopper } from "lucide-react";
import { requireUser } from "@/lib/session";
import { getUserOrder } from "@/lib/order-queries";
import { formatPrice, cn } from "@/lib/utils";
import { RETURNABLE } from "@/lib/order-utils";
import { OrderStatusBadge } from "@/components/order-status-badge";
import { ReturnForm } from "@/components/return-form";

export const metadata: Metadata = { title: "Order details", robots: { index: false } };

const fmt = (d: Date | null) => (d ? d.toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" }) : null);

export default async function OrderPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ placed?: string }> }) {
  const { id } = await params;
  const user = await requireUser(`/account/orders/${id}`);
  const data = await getUserOrder(user.id, Number(id));
  if (!data || Number.isNaN(Number(id))) notFound();
  const { order, items, ret } = data;
  const placed = (await searchParams).placed === "1";

  const steps = [
    { label: "Order placed", date: fmt(order.createdAt), done: true },
    { label: "Payment confirmed", date: fmt(order.paidAt), done: !!order.paidAt },
    { label: "Shipped", date: fmt(order.shippedAt), done: !!order.shippedAt },
    { label: "Delivered", date: fmt(order.deliveredAt), done: !!order.deliveredAt },
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <Link href="/account" className="text-sm text-muted-foreground hover:text-foreground">← All orders</Link>
      {placed && (
        <div className="mt-4 flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-emerald-900">
          <PartyPopper className="mt-0.5 h-5 w-5" />
          <div><p className="font-medium">Thanks for your order!</p><p className="text-sm">Payment confirmed. We&apos;ll email you when it ships.</p></div>
        </div>
      )}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-bold tracking-tight">Order #{order.id}</h1>
        <OrderStatusBadge status={order.status} />
      </div>

      <ol className="mt-8 grid gap-4 sm:grid-cols-4">
        {steps.map((s) => (
          <li key={s.label} className="flex items-start gap-2">
            {s.done ? <CheckCircle2 className="h-5 w-5 text-emerald-600" /> : <Circle className="h-5 w-5 text-zinc-300" />}
            <div><p className={cn("text-sm font-medium", !s.done && "text-muted-foreground")}>{s.label}</p>{s.date && <p className="text-xs text-muted-foreground">{s.date}</p>}</div>
          </li>
        ))}
      </ol>

      {order.trackingNumber && (
        <div className="mt-6 rounded-lg border border-border p-4 text-sm">
          <p className="text-muted-foreground">Tracking</p>
          <p className="mt-1 font-medium">{order.courier} · <span className="font-mono">{order.trackingNumber}</span></p>
        </div>
      )}

      <div className="mt-8 grid gap-6 md:grid-cols-[1fr_280px]">
        <ul className="divide-y divide-border rounded-lg border border-border">
          {items.map((i) => (
            <li key={i.id} className="flex items-center gap-4 p-4">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md border border-border bg-white">
                <Image src={i.image} alt={i.name} fill sizes="64px" className="object-contain p-1" />
              </div>
              <div className="flex-1">
                <p className="font-medium">{i.name}</p>
                <p className="text-sm text-muted-foreground">{formatPrice(i.price)} × {i.quantity}</p>
              </div>
              <p className="font-semibold">{formatPrice(i.price * i.quantity)}</p>
            </li>
          ))}
        </ul>
        <div className="space-y-4">
          <dl className="space-y-2 rounded-lg border border-border p-4 text-sm">
            <div className="flex justify-between"><dt className="text-muted-foreground">Subtotal</dt><dd>{formatPrice(order.subtotal)}</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">Shipping</dt><dd>{order.shippingFee === 0 ? "Free" : formatPrice(order.shippingFee)}</dd></div>
            <div className="flex justify-between border-t border-border pt-2 font-semibold"><dt>Total</dt><dd>{formatPrice(order.total)}</dd></div>
            {order.paymentMethod && <p className="pt-1 text-xs text-muted-foreground">Paid via {order.paymentMethod === "paypal" ? "PayPal (sandbox)" : "demo card"} · {order.paymentRef}</p>}
          </dl>
          <div className="rounded-lg border border-border p-4 text-sm">
            <p className="text-muted-foreground">Ship to</p>
            <p className="mt-1 font-medium">{order.fullName}</p>
            <p>{order.address}</p>
            <p>{order.city}, {order.province} {order.postalCode}</p>
            <p className="text-muted-foreground">{order.phone}</p>
          </div>
        </div>
      </div>

      <section className="mt-10">
        <h2 className="text-lg font-semibold">Returns</h2>
        <div className="mt-3">
          {ret ? (
            <div className="rounded-lg border border-border p-4 text-sm">
              <p><span className="text-muted-foreground">Status:</span> <span className="font-medium capitalize">{ret.status}</span></p>
              <p className="mt-1"><span className="text-muted-foreground">Reason:</span> {ret.reason}</p>
              {ret.details && <p className="mt-1 text-muted-foreground">{ret.details}</p>}
              {ret.imageUrl && <a href={ret.imageUrl} target="_blank" rel="noopener" className="mt-2 inline-block underline underline-offset-4">View photo</a>}
            </div>
          ) : RETURNABLE.includes(order.status) ? (
            <ReturnForm orderId={order.id} uploadsEnabled={Boolean(process.env.BLOB_READ_WRITE_TOKEN)} />
          ) : (
            <p className="text-sm text-muted-foreground">Returns are available after payment is confirmed.</p>
          )}
        </div>
      </section>

      {items.length > 0 && order.status !== "pending_payment" && (
        <p className="mt-8 text-sm text-muted-foreground">
          Enjoying your gear? Leave a review on the product page:{" "}
          {items.map((i, n) => (
            <span key={i.id}>{n > 0 && ", "}<Link href={`/product/${i.slug}#reviews`} className="font-medium text-foreground underline underline-offset-4">{i.name}</Link></span>
          ))}
        </p>
      )}
    </div>
  );
}
