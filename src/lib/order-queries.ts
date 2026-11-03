import "server-only";
import { and, desc, eq, getTableColumns, sql } from "drizzle-orm";
import { db } from "@/db";
import { orderItems, orders, products, returns } from "@/db/schema";

export async function getUserOrders(userId: string) {
  return db
    .select({
      id: orders.id, status: orders.status, total: orders.total, createdAt: orders.createdAt,
      itemCount: sql<number>`(SELECT coalesce(sum(oi.quantity),0)::int FROM order_items oi WHERE oi.order_id = "orders"."id")`,
      firstImage: sql<string | null>`(SELECT oi.image FROM order_items oi WHERE oi.order_id = "orders"."id" ORDER BY oi.id LIMIT 1)`,
    })
    .from(orders)
    .where(and(eq(orders.userId, userId), sql`${orders.status} <> 'pending_payment'`))
    .orderBy(desc(orders.createdAt));
}

export async function getUserOrder(userId: string, orderId: number) {
  const [order] = await db.select().from(orders).where(and(eq(orders.id, orderId), eq(orders.userId, userId))).limit(1);
  if (!order) return null;
  const [items, [ret]] = await Promise.all([
    db.select({ ...getTableColumns(orderItems), slug: products.slug }).from(orderItems).innerJoin(products, eq(products.id, orderItems.productId)).where(eq(orderItems.orderId, orderId)).orderBy(orderItems.id),
    db.select().from(returns).where(eq(returns.orderId, orderId)).limit(1),
  ]);
  return { order, items, ret: ret ?? null };
}
