import Image from "next/image";
import Link from "next/link";
import { getBestSellers, getDailyRevenue, getKpis, getLowStock, getOrders } from "@/lib/admin/queries";
import { formatPrice } from "@/lib/utils";
import { StatCard } from "@/components/admin/stat-card";
import { RevenueChart } from "@/components/admin/bar-chart";
import { OrderStatusBadge } from "@/components/order-status-badge";

export const metadata = { title: "Dashboard" };
const pct = (a: number, b: number) => (b ? ((a - b) / b) * 100 : null);

export default async function AdminDashboard() {
  const [k, daily, best, low, recent] = await Promise.all([getKpis(30), getDailyRevenue(30), getBestSellers(5), getLowStock(8), getOrders()]);
  const aov = k.orders ? Math.round(k.revenue / k.orders) : 0;
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Last 30 days · includes sample sales history for the demo</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Revenue" value={formatPrice(k.revenue)} delta={pct(k.revenue, k.prev_revenue)} />
        <StatCard label="Orders" value={String(k.orders)} delta={pct(k.orders, k.prev_orders)} />
        <StatCard label="Average order value" value={formatPrice(aov)} hint={`${k.customers} customers`} />
        <StatCard label="Needs attention" value={`${k.to_ship} to ship`} hint={`${k.pending_returns} return${k.pending_returns === 1 ? "" : "s"} to review`} />
      </div>

      <section className="rounded-lg border border-border p-5">
        <h2 className="font-semibold">Daily revenue</h2>
        <div className="mt-4"><RevenueChart data={daily} /></div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2 [&>*]:min-w-0">
        <section className="rounded-lg border border-border p-5">
          <h2 className="font-semibold">Best sellers</h2>
          <ol className="mt-4 space-y-3">
            {best.map((b, i) => (
              <li key={b.productId} className="flex items-center gap-3 text-sm">
                <span className="w-4 text-muted-foreground">{i + 1}</span>
                <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded border border-border bg-white"><Image src={b.image} alt="" fill sizes="40px" className="object-contain p-0.5" /></div>
                <p className="min-w-0 flex-1 truncate font-medium">{b.name}</p>
                <p className="hidden whitespace-nowrap text-muted-foreground sm:block">{b.units} sold</p>
                <p className="w-20 text-right font-medium">{formatPrice(b.revenue)}</p>
              </li>
            ))}
          </ol>
        </section>
        <section className="rounded-lg border border-border p-5">
          <div className="flex items-center justify-between"><h2 className="font-semibold">Low stock</h2><Link href="/admin/products" className="text-sm text-muted-foreground hover:text-foreground">Manage →</Link></div>
          {low.length === 0 ? <p className="mt-4 text-sm text-muted-foreground">Everything is well stocked.</p> : (
            <ul className="mt-4 space-y-3">
              {low.map((p) => (
                <li key={p.id} className="flex items-center gap-3 text-sm">
                  <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded border border-border bg-white"><Image src={p.image} alt="" fill sizes="40px" className="object-contain p-0.5" /></div>
                  <Link href={`/admin/products/${p.id}`} className="flex-1 font-medium hover:underline">{p.name}</Link>
                  <span className={p.stock === 0 ? "rounded bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700" : "rounded bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-800"}>{p.stock === 0 ? "Out of stock" : `${p.stock} left`}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="rounded-lg border border-border">
        <div className="flex items-center justify-between p-5"><h2 className="font-semibold">Recent orders</h2><Link href="/admin/orders" className="text-sm text-muted-foreground hover:text-foreground">View all →</Link></div>
        <div className="overflow-x-auto"><table className="w-full text-sm">
          <tbody className="divide-y divide-border border-t border-border">
            {recent.slice(0, 6).map((o) => (
              <tr key={o.id} className="hover:bg-accent/50">
                <td className="px-5 py-3"><Link href={`/admin/orders/${o.id}`} className="font-medium hover:underline">#{o.id}</Link></td>
                <td className="px-2 py-3">{o.fullName}</td>
                <td className="hidden px-2 py-3 text-muted-foreground sm:table-cell">{o.createdAt.toLocaleDateString("en-PH", { month: "short", day: "numeric" })}</td>
                <td className="px-2 py-3"><OrderStatusBadge status={o.status} /></td>
                <td className="px-5 py-3 text-right font-medium">{formatPrice(o.total)}</td>
              </tr>
            ))}
          </tbody>
        </table></div>
      </section>
    </div>
  );
}
