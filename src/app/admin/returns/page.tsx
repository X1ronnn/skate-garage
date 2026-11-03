import Link from "next/link";
import { getReturns } from "@/lib/admin/queries";
import { formatPrice, cn } from "@/lib/utils";

export const metadata = { title: "Returns" };
const tone: Record<string, string> = { requested: "bg-orange-50 text-orange-800 border-orange-200", approved: "bg-sky-50 text-sky-800 border-sky-200", rejected: "bg-zinc-50 text-zinc-600 border-zinc-200", refunded: "bg-emerald-50 text-emerald-800 border-emerald-200" };

export default async function AdminReturns() {
  const list = await getReturns();
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold tracking-tight">Returns</h1><p className="text-sm text-muted-foreground">Requests needing a decision are listed first.</p></div>
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground"><tr><th className="px-4 py-3">Order</th><th className="px-2 py-3">Customer</th><th className="px-2 py-3">Reason</th><th className="px-2 py-3">Photo</th><th className="px-2 py-3">Requested</th><th className="px-2 py-3">Status</th><th className="px-4 py-3 text-right">Order total</th></tr></thead>
          <tbody className="divide-y divide-border">
            {list.map((r) => (
              <tr key={r.id} className="hover:bg-accent/50">
                <td className="px-4 py-3"><Link href={`/admin/orders/${r.orderId}`} className="font-medium hover:underline">#{r.orderId}</Link></td>
                <td className="px-2 py-3">{r.customer}</td>
                <td className="px-2 py-3">{r.reason}</td>
                <td className="px-2 py-3">{r.imageUrl ? <a href={r.imageUrl} target="_blank" rel="noopener" className="underline underline-offset-4">View</a> : <span className="text-muted-foreground">—</span>}</td>
                <td className="px-2 py-3 text-muted-foreground">{r.createdAt.toLocaleDateString("en-PH", { month: "short", day: "numeric" })}</td>
                <td className="px-2 py-3"><span className={cn("rounded-md border px-2 py-0.5 text-xs font-medium capitalize", tone[r.status])}>{r.status}</span></td>
                <td className="px-4 py-3 text-right">{formatPrice(r.total)}</td>
              </tr>
            ))}
            {list.length === 0 && <tr><td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">No returns yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
