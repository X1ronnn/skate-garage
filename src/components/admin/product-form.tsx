"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState } from "react";
import { saveProduct } from "@/lib/admin/actions";
import type { Category, Product } from "@/db/schema";
import { Button } from "@/components/ui/button";

const input = "mt-1.5 h-10 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring";

export function ProductForm({ product, categories, readOnly }: { product?: Product; categories: Category[]; readOnly: boolean }) {
  const [state, action, pending] = useActionState(saveProduct, null);
  const [preview, setPreview] = useState<string | null>(product?.image ?? null);
  const router = useRouter();

  useEffect(() => {
    if (state?.ok && !product && state.id) router.push(`/admin/products/${state.id}?created=1`);
  }, [state, product, router]);

  return (
    <form action={action} className="grid gap-8 lg:grid-cols-[1fr_300px]">
      <fieldset disabled={readOnly} className="space-y-5">
        {product && <input type="hidden" name="id" value={product.id} />}
        <label className="block text-sm font-medium">Product name<input name="name" required defaultValue={product?.name} className={input} /></label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-medium">Brand<input name="brand" required defaultValue={product?.brand} className={input} /></label>
          <label className="block text-sm font-medium">Category
            <select name="categoryId" defaultValue={product?.categoryId ?? categories[0]?.id} className={input}>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </label>
          <label className="block text-sm font-medium">Price (₱)<input name="price" type="number" min={1} required defaultValue={product?.price} className={input} /></label>
          <label className="block text-sm font-medium">Stock<input name="stock" type="number" min={0} required defaultValue={product?.stock ?? 10} className={input} /></label>
          <label className="block text-sm font-medium">Size<input name="size" defaultValue={product?.size ?? ""} placeholder='8.0"' className={input} /></label>
          <label className="block text-sm font-medium">Color<input name="color" defaultValue={product?.color ?? ""} className={input} /></label>
        </div>
        <label className="block text-sm font-medium">Material<input name="material" defaultValue={product?.material ?? ""} placeholder="7-ply Canadian maple" className={input} /></label>
        <label className="block text-sm font-medium">Description
          <textarea name="description" required rows={4} defaultValue={product?.description} className="mt-1.5 w-full rounded-md border border-border bg-background px-3 py-2 text-sm" />
        </label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="featured" defaultChecked={product?.featured} className="h-4 w-4" /> Feature on the home page</label>
      </fieldset>

      <div className="space-y-4">
        <div className="relative aspect-square overflow-hidden rounded-lg border border-border bg-white">
          {preview ? <Image src={preview} alt="Product image preview" fill sizes="300px" className="object-contain p-4" unoptimized={preview.startsWith("blob:")} /> : <div className="flex h-full items-center justify-center text-sm text-muted-foreground">No image yet</div>}
        </div>
        <label className="block text-sm font-medium">{product ? "Replace image" : "Product image"}
          <input type="file" name="image" accept="image/*" disabled={readOnly} required={!product}
            onChange={(e) => { const f = e.target.files?.[0]; if (f) setPreview(URL.createObjectURL(f)); }}
            className="mt-1.5 block w-full text-sm file:mr-3 file:rounded-md file:border file:border-border file:bg-background file:px-3 file:py-1.5 file:text-sm" />
        </label>
        {state && <p className={`rounded-md px-3 py-2 text-sm ${state.ok ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-700"}`} role="status">{state.ok ? state.message : state.error}</p>}
        <Button type="submit" size="lg" className="w-full" disabled={pending || readOnly}>{readOnly ? "Read-only demo" : pending ? "Saving..." : product ? "Save changes" : "Create product"}</Button>
      </div>
    </form>
  );
}
