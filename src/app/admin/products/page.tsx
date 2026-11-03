import Image from "next/image";
import Link from "next/link";
import { Plus } from "lucide-react";
import { getAdminProducts } from "@/lib/admin/queries";
import { adjustStock } from "@/lib/admin/actions";
import { formatPrice, cn } from "@/lib/utils";
import { ActionButton } from "@/components/admin/action-button";
import { buttonClass } from "@/components/ui/button";

export const metadata = { title: "Products" };

export default async function AdminProducts({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const list = await getAdminProducts(q?.slice(0, 60));
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div><h1 className="text-2xl font-bold tracking-tight">Products</h1><p className="text-sm text-muted-foreground">{list.filter((p) => !p.archived).length} active · {list.filter((p) => p.archived).length} archived</p></div>
        <div className="flex gap-2">
          <form><input name="q" defaultValue={q} placeholder="Search products" className="h-9 w-56 rounded-md border border-border bg-background px-3 text-sm" /></form>
          <Link href="/admin/products/new" className={buttonClass("default", "sm", "h-9")}><Plus className="h-4 w-4" /> New product</Link>
        </div>
      </div>
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground"><tr><th className="px-4 py-3">Product</th><th className="px-2 py-3">Category</th><th className="px-2 py-3">Price</th><th className="px-2 py-3">Sold</th><th className="px-2 py-3">Stock</th><th className="px-4 py-3">Quick restock</th></tr></thead>
          <tbody className="divide-y divide-border">
            {list.map((p) => (
              <tr key={p.id} className={cn("hover:bg-accent/50", p.archived && "opacity-50")}>
                <td className="px-4 py-3">
                  <Link href={`/admin/products/${p.id}`} className="flex items-center gap-3">
                    <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded border border-border bg-white"><Image src={p.image} alt="" fill sizes="40px" className="object-contain p-0.5" /></div>
                    <div><p className="font-medium hover:underline">{p.name}</p><p className="text-xs text-muted-foreground">{p.brand}{p.featured && " · Featured"}{p.archived && " · Archived"}</p></div>
                  </Link>
                </td>
                <td className="px-2 py-3 text-muted-foreground">{p.category}</td>
                <td className="px-2 py-3">{formatPrice(p.price)}</td>
                <td className="px-2 py-3">{p.sold}</td>
                <td className="px-2 py-3"><span className={cn("rounded px-2 py-0.5 text-xs font-medium", p.stock === 0 ? "bg-red-50 text-red-700" : p.stock <= 8 ? "bg-amber-50 text-amber-800" : "bg-muted")}>{p.stock}</span></td>
                <td className="px-4 py-3"><div className="flex gap-1"><ActionButton label="+5" action={adjustStock.bind(null, p.id, 5)} /><ActionButton label="+10" action={adjustStock.bind(null, p.id, 10)} /></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
