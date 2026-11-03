import Link from "next/link";
import { requireAdminView } from "@/lib/admin/guard";
import { getAllCategories } from "@/lib/admin/queries";
import { ProductForm } from "@/components/admin/product-form";

export const metadata = { title: "New product" };

export default async function NewProduct() {
  const [{ readOnly }, cats] = await Promise.all([requireAdminView("/admin/products/new"), getAllCategories()]);
  return (
    <div className="space-y-6">
      <Link href="/admin/products" className="text-sm text-muted-foreground hover:text-foreground">← Products</Link>
      <h1 className="text-2xl font-bold tracking-tight">New product</h1>
      <ProductForm categories={cats} readOnly={readOnly} />
    </div>
  );
}
