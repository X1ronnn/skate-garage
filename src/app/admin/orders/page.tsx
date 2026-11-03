import Link from "next/link";
import { getOrders } from "@/lib/admin/queries";
import { formatPrice, cn } from "@/lib/utils";
import { OrderStatusBadge } from "@/components/order-status-badge";
import { statusLabel } from "@/lib/order-utils";
import { ORDER_STATUSES } from "@/db/schema";

export const metadata = { title: "Orders" };

export default async function AdminOrders({ searchParams }: { searchParams: Promise<{ status?: string; q?: string }> }) {
  const { status, q } = await searchParams;
  const validStatus = ORDER_STATUSES.includes(status as never) ? status : undefined;
  const list = await getOrders({ status: validStatus, q: q?.slice(0, 60) });
  const tabs = ["paid", "shipped", "delivered", "return_requested", "returned", "cancelled"] as const;
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div><h1 className="text-2xl font-bold tracking-tight">Orders</h1><p className="text-sm text-muted-foreground">{list.length} orders</p></div>
        <form className="flex gap-2">
          {validStatus && <input type="hidden" name="status" value={validStatus} />}
          <input name="q" defaultValue={q} placeholder="Search #id, name or email" className="h-9 w-64 rounded-md border border-border bg-background px-3 text-sm" />
        </form>
      </div>
      <div className="flex flex-wrap gap-1 text-sm">
        <Link href="/admin/orders" className={cn("rounded-md px-3 py-1.5", !validStatus ? "bg-primary text-primary-foreground" : "hover:bg-accent")}>All</Link>
        {tabs.map((t) => (
          <Link key={t} href={`/admin/orders?status=${t}`} className={cn("rounded-md px-3 py-1.5", validStatus === t ? "bg-primary text-primary-foreground" : "hover:bg-accent")}>{statusLabel[t]}</Link>
        ))}
      </div>
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr><th className="px-4 py-3">Order</th><th className="px-2 py-3">Customer</th><th className="px-2 py-3">Date</th><th className="px-2 py-3">Items</th><th className="px-2 py-3">Payment</th><th className="px-2 py-3">Status</th><th className="px-4 py-3 text-right">Total</th></tr>
          </thead>
          <tbody className="divide-y divide-border">
            {list.map((o) => (
              <tr key={o.id} className="hover:bg-accent/50">
                <td className="px-4 py-3"><Link href={`/admin/orders/${o.id}`} className="font-medium hover:underline">#{o.id}</Link></td>
                <td className="px-2 py-3"><p>{o.fullName}</p><p className="text-xs text-muted-foreground">{o.email}</p></td>
                <td className="px-2 py-3 text-muted-foreground">{o.createdAt.toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" })}</td>
                <td className="px-2 py-3">{o.items}</td>
                <td className="px-2 py-3 capitalize text-muted-foreground">{o.paymentMethod}</td>
                <td className="px-2 py-3"><OrderStatusBadge status={o.status} /></td>
                <td className="px-4 py-3 text-right font-medium">{formatPrice(o.total)}</td>
              </tr>
            ))}
            {list.length === 0 && <tr><td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">No orders found.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
