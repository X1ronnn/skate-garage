import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getOrderAdmin } from "@/lib/admin/queries";
import { cancelOrder, decideReturn, markDelivered } from "@/lib/admin/actions";
import { formatPrice } from "@/lib/utils";
import { OrderStatusBadge } from "@/components/order-status-badge";
import { ShipForm } from "@/components/admin/ship-form";
import { ActionButton } from "@/components/admin/action-button";

export const metadata = { title: "Order" };
const fmt = (d: Date | null) => (d ? d.toLocaleString("en-PH", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" }) : "—");

export default async function AdminOrder({ params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  const data = Number.isInteger(id) ? await getOrderAdmin(id) : null;
  if (!data) notFound();
  const { order: o, items, ret } = data;

  return (
    <div className="space-y-6">
      <Link href="/admin/orders" className="text-sm text-muted-foreground hover:text-foreground">← Orders</Link>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h1 className="text-2xl font-bold tracking-tight">Order #{o.id}</h1><p className="text-sm text-muted-foreground">Placed {fmt(o.createdAt)} by {o.fullName} ({o.email})</p></div>
        <OrderStatusBadge status={o.status} />
      </div>

      <section className="rounded-lg border border-border p-5">
        <h2 className="font-semibold">Fulfillment</h2>
        <div className="mt-4">
          {o.status === "paid" && (
            <div className="space-y-4">
              <ShipForm orderId={o.id} />
              <div className="border-t border-border pt-4"><ActionButton label="Cancel order and restock" variant="ghost" confirm={`Cancel order #${o.id}? Stock will be returned.`} action={cancelOrder.bind(null, o.id)} /></div>
            </div>
          )}
          {o.status === "shipped" && (
            <div className="flex flex-wrap items-center gap-4">
              <p className="text-sm">Shipped via <span className="font-medium">{o.courier}</span> · <span className="font-mono">{o.trackingNumber}</span></p>
              <ActionButton label="Mark as delivered" variant="default" action={markDelivered.bind(null, o.id)} />
            </div>
          )}
          {!["paid", "shipped"].includes(o.status) && (
            <p className="text-sm text-muted-foreground">
              {o.status === "pending_payment" ? "Waiting for the customer to pay." : o.status === "cancelled" ? "This order was cancelled." : `Delivered ${fmt(o.deliveredAt)}${o.trackingNumber ? ` · ${o.courier} ${o.trackingNumber}` : ""}.`}
            </p>
          )}
        </div>
        <dl className="mt-5 grid gap-3 border-t border-border pt-4 text-sm sm:grid-cols-4">
          <div><dt className="text-muted-foreground">Paid</dt><dd>{fmt(o.paidAt)}</dd></div>
          <div><dt className="text-muted-foreground">Shipped</dt><dd>{fmt(o.shippedAt)}</dd></div>
          <div><dt className="text-muted-foreground">Delivered</dt><dd>{fmt(o.deliveredAt)}</dd></div>
          <div><dt className="text-muted-foreground">Payment</dt><dd className="capitalize">{o.paymentMethod ?? "—"} <span className="block truncate font-mono text-xs text-muted-foreground">{o.paymentRef}</span></dd></div>
        </dl>
      </section>

      {ret && (
        <section className="rounded-lg border border-orange-200 bg-orange-50/50 p-5">
          <div className="flex flex-wrap items-center justify-between gap-2"><h2 className="font-semibold">Return request</h2><span className="rounded-md border border-orange-300 bg-white px-2 py-0.5 text-xs font-medium capitalize">{ret.status}</span></div>
          <p className="mt-2 text-sm"><span className="text-muted-foreground">Reason:</span> {ret.reason}</p>
          {ret.details && <p className="mt-1 text-sm text-muted-foreground">{ret.details}</p>}
          {ret.imageUrl && <a href={ret.imageUrl} target="_blank" rel="noopener" className="mt-2 inline-block text-sm underline underline-offset-4">View customer photo</a>}
          <div className="mt-4 flex flex-wrap gap-2">
            {ret.status === "requested" && <>
              <ActionButton label="Approve return" variant="default" action={decideReturn.bind(null, ret.id, "approved")} />
              <ActionButton label="Reject" action={decideReturn.bind(null, ret.id, "rejected")} confirm="Reject this return? The order goes back to Delivered." />
            </>}
            {ret.status === "approved" && <ActionButton label="Mark as refunded and restock" variant="default" action={decideReturn.bind(null, ret.id, "refunded")} confirm="Confirm the item was received and the customer refunded?" />}
          </div>
        </section>
      )}

      <div className="grid gap-6 md:grid-cols-[1fr_280px]">
        <ul className="divide-y divide-border rounded-lg border border-border">
          {items.map((i) => (
            <li key={i.id} className="flex items-center gap-4 p-4">
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md border border-border bg-white"><Image src={i.image} alt={i.name} fill sizes="56px" className="object-contain p-1" /></div>
              <div className="flex-1"><p className="font-medium">{i.name}</p><p className="text-sm text-muted-foreground">{formatPrice(i.price)} × {i.quantity}</p></div>
              <p className="font-semibold">{formatPrice(i.price * i.quantity)}</p>
            </li>
          ))}
        </ul>
        <div className="space-y-4 text-sm">
          <dl className="space-y-2 rounded-lg border border-border p-4">
            <div className="flex justify-between"><dt className="text-muted-foreground">Subtotal</dt><dd>{formatPrice(o.subtotal)}</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">Shipping</dt><dd>{o.shippingFee ? formatPrice(o.shippingFee) : "Free"}</dd></div>
            <div className="flex justify-between border-t border-border pt-2 font-semibold"><dt>Total</dt><dd>{formatPrice(o.total)}</dd></div>
          </dl>
          <div className="rounded-lg border border-border p-4"><p className="text-muted-foreground">Ship to</p><p className="mt-1 font-medium">{o.fullName}</p><p>{o.address}</p><p>{o.city}, {o.province} {o.postalCode}</p><p className="text-muted-foreground">{o.phone}</p></div>
        </div>
      </div>
    </div>
  );
}
