"use server";

import { and, eq, inArray, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/db";
import { orderItems, orders, products, RETURN_REASONS, returns, reviews } from "@/db/schema";
import { getSession } from "./session";
import { REVIEWABLE, RETURNABLE, shippingFor } from "./order-utils";
import { capturePaypalOrder, createPaypalOrder, paypalEnabled } from "./paypal";

type Result<T = object> = ({ ok: true } & T) | { ok: false; error: string };

async function currentUser() {
  const s = await getSession();
  if (!s) throw new Error("Please sign in to continue.");
  return s.user;
}

/* ---------- Checkout ---------- */
const shippingSchema = z.object({
  fullName: z.string().trim().min(2).max(80),
  phone: z.string().trim().regex(/^[0-9+\s()-]{7,20}$/, "Enter a valid phone number"),
  address: z.string().trim().min(5).max(160),
  city: z.string().trim().min(2).max(60),
  province: z.string().trim().min(2).max(60),
  postalCode: z.string().trim().regex(/^\d{4}$/, "Postal code must be 4 digits"),
});
const placeOrderSchema = z.object({
  items: z.array(z.object({ id: z.number().int().positive(), qty: z.number().int().min(1).max(20) })).min(1).max(30),
  shipping: shippingSchema,
});

export async function placeOrder(input: z.infer<typeof placeOrderSchema>): Promise<Result<{ orderId: number }>> {
  try {
    const user = await currentUser();
    const parsed = placeOrderSchema.safeParse(input);
    if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid order details" };
    const { items, shipping } = parsed.data;

    const rows = await db.select().from(products).where(inArray(products.id, items.map((i) => i.id)));
    const lines = items.map((i) => ({ item: i, product: rows.find((r) => r.id === i.id) }));
    for (const { item, product } of lines) {
      if (!product || product.archived) return { ok: false, error: "One of the items is no longer available." };
      if (product.stock < item.qty) return { ok: false, error: `Only ${product.stock} left of ${product.name}. Please update your cart.` };
    }
    // Prices always come from the database, never from the client.
    const subtotal = lines.reduce((n, l) => n + l.product!.price * l.item.qty, 0);
    const shippingFee = shippingFor(subtotal);

    const [order] = await db
      .insert(orders)
      .values({ userId: user.id, status: "pending_payment", subtotal, shippingFee, total: subtotal + shippingFee, ...shipping })
      .returning({ id: orders.id });
    try {
      await db.insert(orderItems).values(
        lines.map(({ item, product }) => ({ orderId: order.id, productId: product!.id, name: product!.name, image: product!.image, price: product!.price, quantity: item.qty })),
      );
    } catch (e) {
      await db.delete(orders).where(eq(orders.id, order.id));
      throw e;
    }
    return { ok: true, orderId: order.id };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Could not place order" };
  }
}

async function ownPendingOrder(orderId: number, userId: string) {
  const [o] = await db.select().from(orders).where(and(eq(orders.id, orderId), eq(orders.userId, userId))).limit(1);
  if (!o) throw new Error("Order not found.");
  if (o.status !== "pending_payment") throw new Error("This order has already been paid.");
  return o;
}

/** Atomically reserves stock for every line of an order. Either all lines succeed or none do. */
async function reserveStock(orderId: number) {
  const res = await db.execute(sql`
    WITH items AS (
      SELECT product_id AS id, sum(quantity)::int AS qty FROM order_items WHERE order_id = ${orderId} GROUP BY product_id
    ), ok AS (
      SELECT (SELECT count(*) FROM items) = (SELECT count(*) FROM products p JOIN items i ON p.id = i.id WHERE p.stock >= i.qty) AS all_ok
    )
    UPDATE products p SET stock = p.stock - i.qty FROM items i, ok WHERE p.id = i.id AND ok.all_ok RETURNING p.id`);
  return res.rows.length > 0;
}

async function releaseStock(orderId: number) {
  await db.execute(sql`
    UPDATE products p SET stock = p.stock + i.qty
    FROM (SELECT product_id AS id, sum(quantity)::int AS qty FROM order_items WHERE order_id = ${orderId} GROUP BY product_id) i
    WHERE p.id = i.id`);
}

async function markPaid(orderId: number, method: string, ref: string) {
  await db.update(orders).set({ status: "paid", paymentMethod: method, paymentRef: ref, paidAt: new Date() }).where(eq(orders.id, orderId));
  revalidatePath("/", "layout");
}

export async function payWithDemo(orderId: number): Promise<Result> {
  try {
    const user = await currentUser();
    await ownPendingOrder(orderId, user.id);
    if (!(await reserveStock(orderId))) return { ok: false, error: "Some items just sold out. Please update your cart." };
    await markPaid(orderId, "demo", `DEMO-${crypto.randomUUID().slice(0, 8).toUpperCase()}`);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Payment failed" };
  }
}

export async function startPaypal(orderId: number): Promise<Result<{ paypalOrderId: string }>> {
  try {
    if (!paypalEnabled()) return { ok: false, error: "PayPal is not configured." };
    const user = await currentUser();
    const o = await ownPendingOrder(orderId, user.id);
    return { ok: true, paypalOrderId: await createPaypalOrder(o.id, o.total) };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Could not start PayPal checkout" };
  }
}

export async function finishPaypal(orderId: number, paypalOrderId: string): Promise<Result> {
  try {
    const user = await currentUser();
    await ownPendingOrder(orderId, user.id);
    if (!(await reserveStock(orderId))) return { ok: false, error: "Some items just sold out. You have not been charged." };
    const { ok, data } = await capturePaypalOrder(paypalOrderId);
    if (!ok) {
      await releaseStock(orderId);
      return { ok: false, error: "PayPal could not complete the payment. You have not been charged." };
    }
    const captureId = data?.purchase_units?.[0]?.payments?.captures?.[0]?.id ?? paypalOrderId;
    await markPaid(orderId, "paypal", captureId);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Payment failed" };
  }
}

/* ---------- Returns ---------- */
const MAX_IMAGE = 4 * 1024 * 1024;

export async function requestReturn(_prev: unknown, form: FormData): Promise<Result | null> {
  try {
    const user = await currentUser();
    const orderId = Number(form.get("orderId"));
    const reason = String(form.get("reason") ?? "");
    const details = String(form.get("details") ?? "").trim().slice(0, 1000);
    if (!RETURN_REASONS.includes(reason as (typeof RETURN_REASONS)[number])) return { ok: false, error: "Please choose a reason." };

    const [o] = await db.select().from(orders).where(and(eq(orders.id, orderId), eq(orders.userId, user.id))).limit(1);
    if (!o) return { ok: false, error: "Order not found." };
    if (!RETURNABLE.includes(o.status)) return { ok: false, error: "This order can't be returned." };

    let imageUrl: string | null = null;
    const file = form.get("photo");
    if (file instanceof File && file.size > 0) {
      if (!file.type.startsWith("image/")) return { ok: false, error: "The photo must be an image." };
      if (file.size > MAX_IMAGE) return { ok: false, error: "The photo must be 4 MB or smaller." };
      if (process.env.BLOB_READ_WRITE_TOKEN) {
        const { put } = await import("@vercel/blob");
        const ext = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
        const blob = await put(`returns/order-${orderId}.${ext}`, file, { access: "public", addRandomSuffix: true, contentType: file.type });
        imageUrl = blob.url;
      }
    }

    try {
      await db.insert(returns).values({ orderId, userId: user.id, reason, details: details || null, imageUrl });
    } catch {
      return { ok: false, error: "A return was already requested for this order." };
    }
    await db.update(orders).set({ status: "return_requested" }).where(eq(orders.id, orderId));
    revalidatePath(`/account/orders/${orderId}`);
    revalidatePath("/account");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Could not submit the return" };
  }
}

/* ---------- Verified reviews ---------- */
export async function getReviewEligibility(productId: number): Promise<{ canReview: boolean; signedIn: boolean; reason?: string }> {
  const s = await getSession();
  if (!s) return { canReview: false, signedIn: false };
  const [bought] = await db
    .select({ orderId: orders.id })
    .from(orderItems)
    .innerJoin(orders, eq(orders.id, orderItems.orderId))
    .where(and(eq(orders.userId, s.user.id), eq(orderItems.productId, productId), inArray(orders.status, REVIEWABLE)))
    .limit(1);
  if (!bought) return { canReview: false, signedIn: true, reason: "Only customers who bought this item can review it." };
  const [existing] = await db.select({ id: reviews.id }).from(reviews).where(and(eq(reviews.userId, s.user.id), eq(reviews.productId, productId))).limit(1);
  if (existing) return { canReview: false, signedIn: true, reason: "You've already reviewed this item. Thanks!" };
  return { canReview: true, signedIn: true };
}

const reviewSchema = z.object({
  productId: z.coerce.number().int().positive(),
  rating: z.coerce.number().int().min(1).max(5),
  body: z.string().trim().min(10, "Please write at least 10 characters.").max(1000),
});

export async function addReview(_prev: unknown, form: FormData): Promise<Result | null> {
  try {
    const user = await currentUser();
    const parsed = reviewSchema.safeParse({ productId: form.get("productId"), rating: form.get("rating"), body: form.get("body") });
    if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid review" };
    const elig = await getReviewEligibility(parsed.data.productId);
    if (!elig.canReview) return { ok: false, error: elig.reason ?? "You can't review this item." };
    await db.insert(reviews).values({ productId: parsed.data.productId, userId: user.id, author: user.name, rating: parsed.data.rating, body: parsed.data.body });
    const [p] = await db.select({ slug: products.slug }).from(products).where(eq(products.id, parsed.data.productId));
    if (p) revalidatePath(`/product/${p.slug}`);
    revalidatePath("/shop");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Could not save the review" };
  }
}
