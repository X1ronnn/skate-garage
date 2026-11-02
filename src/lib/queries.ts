import "server-only";
import { and, asc, desc, eq, getTableColumns, gte, ilike, lte, ne, or, sql, type SQL } from "drizzle-orm";
import { db } from "@/db";
import { categories, products, reviews } from "@/db/schema";

const ratings = db
  .select({
    productId: reviews.productId,
    rating: sql<number>`round(avg(${reviews.rating})::numeric, 1)::float`.as("rating"),
    reviewCount: sql<number>`count(*)::int`.as("review_count"),
  })
  .from(reviews)
  .groupBy(reviews.productId)
  .as("ratings");

const productFields = {
  ...getTableColumns(products),
  categorySlug: categories.slug,
  categoryName: categories.name,
  rating: ratings.rating,
  reviewCount: ratings.reviewCount,
};

const baseQuery = () =>
  db
    .select(productFields)
    .from(products)
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .leftJoin(ratings, eq(products.id, ratings.productId));

export type ProductWithMeta = Awaited<ReturnType<typeof getFeaturedProducts>>[number];

export type ShopFilters = {
  category?: string;
  brand?: string;
  q?: string;
  min?: number;
  max?: number;
  sort?: "featured" | "newest" | "price-asc" | "price-desc" | "rating";
};

export async function getProducts(f: ShopFilters = {}) {
  const where: SQL[] = [];
  if (f.category) where.push(eq(categories.slug, f.category));
  if (f.brand) where.push(eq(products.brand, f.brand));
  if (f.q) {
    const term = `%${f.q}%`;
    where.push(or(ilike(products.name, term), ilike(products.brand, term), ilike(products.description, term))!);
  }
  if (typeof f.min === "number" && !Number.isNaN(f.min)) where.push(gte(products.price, f.min));
  if (typeof f.max === "number" && !Number.isNaN(f.max)) where.push(lte(products.price, f.max));

  const order =
    f.sort === "price-asc" ? [asc(products.price)]
    : f.sort === "price-desc" ? [desc(products.price)]
    : f.sort === "newest" ? [desc(products.createdAt)]
    : f.sort === "rating" ? [sql`${ratings.rating} DESC NULLS LAST`]
    : [desc(products.featured), asc(products.name)];

  return baseQuery().where(where.length ? and(...where) : undefined).orderBy(...order);
}

export async function getFeaturedProducts(limit = 8) {
  return baseQuery().where(eq(products.featured, true)).orderBy(desc(products.createdAt)).limit(limit);
}

export async function getProductBySlug(slug: string) {
  const [product] = await baseQuery().where(eq(products.slug, slug)).limit(1);
  return product ?? null;
}

export async function getRelatedProducts(categoryId: number, excludeId: number, limit = 4) {
  return baseQuery()
    .where(and(eq(products.categoryId, categoryId), ne(products.id, excludeId)))
    .orderBy(desc(products.featured), asc(products.price))
    .limit(limit);
}

export async function getReviews(productId: number) {
  return db.select().from(reviews).where(eq(reviews.productId, productId)).orderBy(desc(reviews.createdAt));
}

export async function getCategoriesWithCounts() {
  return db
    .select({ ...getTableColumns(categories), productCount: sql<number>`count(${products.id})::int` })
    .from(categories)
    .leftJoin(products, eq(products.categoryId, categories.id))
    .groupBy(categories.id)
    .orderBy(asc(categories.id));
}

export async function getBrands() {
  const rows = await db.selectDistinct({ brand: products.brand }).from(products).orderBy(asc(products.brand));
  return rows.map((r) => r.brand);
}

export async function getAllSlugs() {
  return db.select({ slug: products.slug }).from(products);
}
