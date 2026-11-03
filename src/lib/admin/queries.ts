import "server-only";
import { and, asc, desc, eq, getTableColumns, ilike, inArray, or, sql, type SQL } from "drizzle-orm";
import { db } from "@/db";
import { requireAdminView } from "./guard";
import { categories, orderItems, orders, products, returns, reviews, user, type OrderStatus } from "@/db/schema";

const PAID: OrderStatus[] = ["paid", "shipped", "delivered", "return_requested"];

export async function getKpis(days = 30) {
  await requireAdminView();
  const since = sql`now() - (${days} || ' days')::interval`;
  const prevSince = sql`now() - (${days * 2} || ' days')::interval`;
  const [row] = await db.execute<{
    revenue: number; orders: number; customers: number; prev_revenue: number; prev_orders: number; pending_returns: number; to_ship: number;
  }>(sql`
    SELECT
      coalesce(sum(total) FILTER (WHERE created_at >= ${since} AND status IN ('paid','shipped','delivered','return_requested')),0)::int AS revenue,
      count(*) FILTER (WHERE created_at >= ${since} AND status <> 'pending_payment' AND status <> 'cancelled')::int AS orders,
      count(DISTINCT user_id) FILTER (WHERE created_at >= ${since} AND status <> 'pending_payment')::int AS customers,
      coalesce(sum(total) FILTER (WHERE created_at >= ${prevSince} AND created_at < ${since} AND status IN ('paid','shipped','delivered','return_requested')),0)::int AS prev_revenue,
      count(*) FILTER (WHERE created_at >= ${prevSince} AND created_at < ${since} AND status <> 'pending_payment' AND status <> 'cancelled')::int AS prev_orders,
      (SELECT count(*)::int FROM returns WHERE status = 'requested') AS pending_returns,
      count(*) FILTER (WHERE status = 'paid')::int AS to_ship
    FROM orders`).then((r) => r.rows);
  return row;
}

export async function getDailyRevenue(days = 30) {
  await requireAdminView();
  const res = await db.execute<{ day: string; revenue: number; orders: number }>(sql`
    WITH d AS (
      SELECT generate_series((now() AT TIME ZONE 'Asia/Manila')::date - (${days - 1})::int, (now() AT TIME ZONE 'Asia/Manila')::date, '1 day')::date AS day
    )
    SELECT to_char(d.day, 'YYYY-MM-DD') AS day,
      coalesce(sum(o.total) FILTER (WHERE o.status IN ('paid','shipped','delivered','return_requested')),0)::int AS revenue,
      count(o.id) FILTER (WHERE o.status NOT IN ('pending_payment','cancelled'))::int AS orders
    FROM d LEFT JOIN orders o ON (o.created_at AT TIME ZONE 'Asia/Manila')::date = d.day
    GROUP BY d.day ORDER BY d.day`);
  return res.rows;
}

export async function getBestSellers(limit = 5) {
  await requireAdminView();
  return db
    .select({ productId: orderItems.productId, name: orderItems.name, image: orderItems.image, units: sql<number>`sum(${orderItems.quantity})::int`, revenue: sql<number>`sum(${orderItems.quantity} * ${orderItems.price})::int` })
    .from(orderItems)
    .innerJoin(orders, eq(orders.id, orderItems.orderId))
    .where(inArray(orders.status, PAID))
    .groupBy(orderItems.productId, orderItems.name, orderItems.image)
    .orderBy(desc(sql`sum(${orderItems.quantity})`))
    .limit(limit);
}

export async function getLowStock(threshold = 8) {
  await requireAdminView();
  return db.select({ id: products.id, name: products.name, stock: products.stock, image: products.image }).from(products)
    .where(and(eq(products.archived, false), sql`${products.stock} <= ${threshold}`)).orderBy(asc(products.stock)).limit(8);
}

export async function getOrders({ status, q }: { status?: string; q?: string } = {}) {
  await requireAdminView();
  const where: SQL[] = [sql`${orders.status} <> 'pending_payment'`];
  if (status) where.push(eq(orders.status, status as OrderStatus));
  if (q) {
    const n = Number(q.replace("#", ""));
    where.push(or(ilike(orders.fullName, `%${q}%`), ilike(user.email, `%${q}%`), ...(Number.isInteger(n) && n > 0 ? [eq(orders.id, n)] : []))!);
  }
  return db
    .select({
      id: orders.id, status: orders.status, total: orders.total, createdAt: orders.createdAt, fullName: orders.fullName, email: user.email, paymentMethod: orders.paymentMethod,
      items: sql<number>`(SELECT coalesce(sum(oi.quantity),0)::int FROM order_items oi WHERE oi.order_id = "orders"."id")`,
    })
    .from(orders).innerJoin(user, eq(user.id, orders.userId))
    .where(and(...where)).orderBy(desc(orders.createdAt)).limit(200);
}

export async function getOrderAdmin(id: number) {
  await requireAdminView();
  const [o] = await db.select({ ...getTableColumns(orders), email: user.email }).from(orders).innerJoin(user, eq(user.id, orders.userId)).where(eq(orders.id, id)).limit(1);
  if (!o) return null;
  const [items, [ret]] = await Promise.all([
    db.select().from(orderItems).where(eq(orderItems.orderId, id)).orderBy(orderItems.id),
    db.select().from(returns).where(eq(returns.orderId, id)).limit(1),
  ]);
  return { order: o, items, ret: ret ?? null };
}

export async function getReturns() {
  await requireAdminView();
  return db
    .select({ ...getTableColumns(returns), customer: orders.fullName, total: orders.total, orderStatus: orders.status })
    .from(returns).innerJoin(orders, eq(orders.id, returns.orderId))
    .orderBy(sql`CASE WHEN ${returns.status} = 'requested' THEN 0 ELSE 1 END`, desc(returns.createdAt)).limit(100);
}

export async function getAdminProducts(q?: string) {
  await requireAdminView();
  return db
    .select({ ...getTableColumns(products), category: categories.name, sold: sql<number>`(SELECT coalesce(sum(oi.quantity),0)::int FROM order_items oi JOIN orders o ON o.id = oi.order_id WHERE oi.product_id = "products"."id" AND o.status IN ('paid','shipped','delivered','return_requested'))` })
    .from(products).innerJoin(categories, eq(categories.id, products.categoryId))
    .where(q ? or(ilike(products.name, `%${q}%`), ilike(products.brand, `%${q}%`)) : undefined)
    .orderBy(asc(products.archived), asc(products.name));
}

export async function getAdminProduct(id: number) {
  await requireAdminView();
  const [p] = await db.select().from(products).where(eq(products.id, id)).limit(1);
  return p ?? null;
}

export async function getAllCategories() {
  await requireAdminView();
  return db.select().from(categories).orderBy(asc(categories.id));
}

export async function getAdminReviews() {
  await requireAdminView();
  return db
    .select({ ...getTableColumns(reviews), productName: products.name, productSlug: products.slug })
    .from(reviews).innerJoin(products, eq(products.id, reviews.productId))
    .orderBy(desc(reviews.createdAt)).limit(100);
}
