import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdminView } from "@/lib/admin/guard";
import { getAdminProduct, getAllCategories } from "@/lib/admin/queries";
import { setArchived } from "@/lib/admin/actions";
import { ProductForm } from "@/components/admin/product-form";
import { ActionButton } from "@/components/admin/action-button";

export const metadata = { title: "Edit product" };

export default async function EditProduct({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ created?: string }> }) {
  const id = Number((await params).id);
  const [{ readOnly }, product, cats] = await Promise.all([requireAdminView(`/admin/products/${id}`), Number.isInteger(id) ? getAdminProduct(id) : null, getAllCategories()]);
  if (!product) notFound();
  const created = (await searchParams).created === "1";
  return (
    <div className="space-y-6">
      <Link href="/admin/products" className="text-sm text-muted-foreground hover:text-foreground">← Products</Link>
      {created && <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-800">Product created and live in the store.</p>}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{product.name}</h1>
          {!product.archived && <Link href={`/product/${product.slug}`} target="_blank" className="text-sm text-muted-foreground underline underline-offset-4">View in store</Link>}
          {product.archived && <p className="text-sm font-medium text-amber-700">Archived: hidden from the store</p>}
        </div>
        {product.archived
          ? <ActionButton label="Restore to store" action={setArchived.bind(null, product.id, false)} />
          : <ActionButton label="Archive product" variant="ghost" confirm="Archive this product? It will be hidden from the store; past orders keep it." action={setArchived.bind(null, product.id, true)} />}
      </div>
      <ProductForm product={product} categories={cats} readOnly={readOnly} />
    </div>
  );
}
