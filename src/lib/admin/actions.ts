"use server";

import { and, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/db";
import { orders, products, returns, reviews } from "@/db/schema";
import { assertAdminWrite } from "./guard";

type Result = { ok: true; message?: string } | { ok: false; error: string };
const fail = (e: unknown): Result => ({ ok: false, error: e instanceof Error ? e.message : "Something went wrong" });

function refreshStore() {
  revalidatePath("/", "layout");
}

async function restock(orderId: number) {
  await db.execute(sql`
    UPDATE products p SET stock = p.stock + i.qty
    FROM (SELECT product_id AS id, sum(quantity)::int AS qty FROM order_items WHERE order_id = ${orderId} GROUP BY product_id) i
    WHERE p.id = i.id`);
}

/* ---------- Orders ---------- */
const shipSchema = z.object({
  orderId: z.coerce.number().int().positive(),
  courier: z.enum(["J&T Express", "LBC", "Ninja Van", "Flash Express", "Grab Express"]),
  trackingNumber: z.string().trim().min(5, "Enter a tracking number").max(40).regex(/^[A-Za-z0-9-]+$/, "Letters, numbers and dashes only"),
});

export async function markShipped(_prev: unknown, form: FormData): Promise<Result | null> {
  try {
    await assertAdminWrite();
    const d = shipSchema.parse({ orderId: form.get("orderId"), courier: form.get("courier"), trackingNumber: form.get("trackingNumber") });
    const res = await db.update(orders).set({ status: "shipped", courier: d.courier, trackingNumber: d.trackingNumber.toUpperCase(), shippedAt: new Date() })
      .where(and(eq(orders.id, d.orderId), eq(orders.status, "paid"))).returning({ id: orders.id });
    if (!res.length) return { ok: false, error: "Only paid orders can be marked as shipped." };
    revalidatePath(`/admin/orders/${d.orderId}`); revalidatePath("/admin", "layout"); revalidatePath(`/account/orders/${d.orderId}`);
    return { ok: true, message: "Marked as shipped." };
  } catch (e) {
    if (e instanceof z.ZodError) return { ok: false, error: e.issues[0]?.message ?? "Invalid input" };
    return fail(e);
  }
}

export async function markDelivered(orderId: number): Promise<Result> {
  try {
    await assertAdminWrite();
    const res = await db.update(orders).set({ status: "delivered", deliveredAt: new Date() }).where(and(eq(orders.id, orderId), eq(orders.status, "shipped"))).returning({ id: orders.id });
    if (!res.length) return { ok: false, error: "Only shipped orders can be marked as delivered." };
    revalidatePath(`/admin/orders/${orderId}`); revalidatePath("/admin", "layout"); revalidatePath(`/account/orders/${orderId}`);
    return { ok: true, message: "Marked as delivered." };
  } catch (e) { return fail(e); }
}

export async function cancelOrder(orderId: number): Promise<Result> {
  try {
    await assertAdminWrite();
    const res = await db.update(orders).set({ status: "cancelled" }).where(and(eq(orders.id, orderId), eq(orders.status, "paid"))).returning({ id: orders.id });
    if (!res.length) return { ok: false, error: "Only paid orders that haven't shipped can be cancelled." };
    await restock(orderId);
    refreshStore();
    return { ok: true, message: "Order cancelled and stock restored. Refund the customer in PayPal if they paid with PayPal." };
  } catch (e) { return fail(e); }
}

/* ---------- Returns ---------- */
export async function decideReturn(returnId: number, decision: "approved" | "rejected" | "refunded"): Promise<Result> {
  try {
    await assertAdminWrite();
    const [r] = await db.select().from(returns).where(eq(returns.id, returnId)).limit(1);
    if (!r) return { ok: false, error: "Return not found." };
    const allowed = { requested: ["approved", "rejected"], approved: ["refunded"], rejected: [], refunded: [] } as const;
    if (!(allowed[r.status] as readonly string[]).includes(decision)) return { ok: false, error: `Can't change a ${r.status} return to ${decision}.` };
    await db.update(returns).set({ status: decision }).where(eq(returns.id, returnId));
    if (decision === "rejected") await db.update(orders).set({ status: "delivered" }).where(eq(orders.id, r.orderId));
    if (decision === "refunded") { await db.update(orders).set({ status: "returned" }).where(eq(orders.id, r.orderId)); await restock(r.orderId); refreshStore(); }
    revalidatePath("/admin", "layout"); revalidatePath(`/account/orders/${r.orderId}`);
    return { ok: true, message: `Return ${decision}.` };
  } catch (e) { return fail(e); }
}

/* ---------- Products ---------- */
const productSchema = z.object({
  id: z.coerce.number().int().positive().optional(),
  name: z.string().trim().min(3).max(100),
  brand: z.string().trim().min(2).max(40),
  categoryId: z.coerce.number().int().positive(),
  price: z.coerce.number().int().min(1, "Price must be at least ₱1").max(500000),
  stock: z.coerce.number().int().min(0).max(10000),
  description: z.string().trim().min(10).max(2000),
  color: z.string().trim().max(40).optional(),
  size: z.string().trim().max(40).optional(),
  material: z.string().trim().max(80).optional(),
  featured: z.boolean(),
});

const slugify = (s: string) => s.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80);

export async function saveProduct(_prev: unknown, form: FormData): Promise<(Result & { id?: number }) | null> {
  try {
    await assertAdminWrite();
    const d = productSchema.parse({
      id: form.get("id") || undefined, name: form.get("name"), brand: form.get("brand"), categoryId: form.get("categoryId"),
      price: form.get("price"), stock: form.get("stock"), description: form.get("description"),
      color: form.get("color") || undefined, size: form.get("size") || undefined, material: form.get("material") || undefined,
      featured: form.get("featured") === "on",
    });

    let image: string | undefined;
    const file = form.get("image");
    if (file instanceof File && file.size > 0) {
      if (!file.type.startsWith("image/")) return { ok: false, error: "The product image must be an image file." };
      if (file.size > 4 * 1024 * 1024) return { ok: false, error: "The image must be 4 MB or smaller." };
      if (!process.env.BLOB_READ_WRITE_TOKEN) return { ok: false, error: "Image uploads aren't configured." };
      const { put } = await import("@vercel/blob");
      const ext = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
      image = (await put(`products/${slugify(d.name)}.${ext}`, file, { access: "public", addRandomSuffix: true, contentType: file.type })).url;
    }

    const values = { name: d.name, brand: d.brand, categoryId: d.categoryId, price: d.price, stock: d.stock, description: d.description, color: d.color ?? null, size: d.size ?? null, material: d.material ?? null, featured: d.featured };
    let id = d.id;
    if (id) {
      await db.update(products).set({ ...values, ...(image ? { image } : {}) }).where(eq(products.id, id));
    } else {
      if (!image) return { ok: false, error: "Please add a product image." };
      let slug = slugify(d.name);
      const [exists] = await db.select({ id: products.id }).from(products).where(eq(products.slug, slug)).limit(1);
      if (exists) slug = `${slug}-${Date.now().toString(36)}`;
      [{ id }] = await db.insert(products).values({ ...values, slug, image }).returning({ id: products.id });
    }
    refreshStore();
    return { ok: true, message: d.id ? "Product saved." : "Product created.", id };
  } catch (e) {
    if (e instanceof z.ZodError) return { ok: false, error: `${e.issues[0]?.path.join(".")}: ${e.issues[0]?.message}` };
    return fail(e);
  }
}

export async function setArchived(productId: number, archived: boolean): Promise<Result> {
  try {
    await assertAdminWrite();
    await db.update(products).set({ archived, ...(archived ? { featured: false } : {}) }).where(eq(products.id, productId));
    refreshStore();
    return { ok: true, message: archived ? "Product archived. It's hidden from the store, and past orders are kept." : "Product restored to the store." };
  } catch (e) { return fail(e); }
}

export async function adjustStock(productId: number, delta: number): Promise<Result> {
  try {
    await assertAdminWrite();
    if (!Number.isInteger(delta) || Math.abs(delta) > 1000) return { ok: false, error: "Invalid amount." };
    const res = await db.update(products).set({ stock: sql`greatest(${products.stock} + ${delta}, 0)` }).where(eq(products.id, productId)).returning({ stock: products.stock });
    refreshStore();
    return { ok: true, message: `Stock is now ${res[0]?.stock ?? 0}.` };
  } catch (e) { return fail(e); }
}

/* ---------- Reviews ---------- */
export async function deleteReview(reviewId: number): Promise<Result> {
  try {
    await assertAdminWrite();
    await db.delete(reviews).where(eq(reviews.id, reviewId));
    refreshStore();
    return { ok: true, message: "Review removed." };
  } catch (e) { return fail(e); }
}
