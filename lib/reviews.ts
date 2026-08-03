"use server";

import { and, eq, inArray, sql } from "drizzle-orm";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { reviews, orders, orderItems } from "@/db/schema";
import { auth } from "@/lib/auth";

export interface ReviewWithMeta {
  id: string;
  userName: string;
  rating: number;
  comment: string | null;
  createdAt: Date;
}

/** Attaches avgRating/reviewCount to a list of products in one query,
 * instead of one query per card. Returns null/0 for products with no
 * reviews yet rather than a fake 0-star rating. */
export async function attachRatings<T extends { id: string }>(
  productList: T[]
): Promise<(T & { avgRating: number | null; reviewCount: number })[]> {
  if (productList.length === 0) return [];

  const rows = await db
    .select({
      productId: reviews.productId,
      avgRating: sql<string>`avg(${reviews.rating})`,
      reviewCount: sql<string>`count(*)`,
    })
    .from(reviews)
    .where(
      inArray(
        reviews.productId,
        productList.map((p) => p.id)
      )
    )
    .groupBy(reviews.productId);

  const byProduct = new Map(
    rows.map((r) => [r.productId, { avgRating: parseFloat(r.avgRating), reviewCount: parseInt(r.reviewCount, 10) }])
  );

  return productList.map((p) => ({
    ...p,
    ...(byProduct.get(p.id) ?? { avgRating: null, reviewCount: 0 }),
  }));
}

export async function getReviewsForProduct(productId: string): Promise<ReviewWithMeta[]> {
  return db
    .select({
      id: reviews.id,
      userName: reviews.userName,
      rating: reviews.rating,
      comment: reviews.comment,
      createdAt: reviews.createdAt,
    })
    .from(reviews)
    .where(eq(reviews.productId, productId))
    .orderBy(sql`${reviews.createdAt} desc`);
}

/** True if this user has a delivered order containing this product —
 * the only thing that unlocks the review form. */
export async function canReviewProduct(userId: string, productId: string): Promise<boolean> {
  const [match] = await db
    .select({ id: orders.id })
    .from(orders)
    .innerJoin(orderItems, eq(orderItems.orderId, orders.id))
    .where(
      and(eq(orders.userId, userId), eq(orders.status, "delivered"), eq(orderItems.productId, productId))
    )
    .limit(1);
  return Boolean(match);
}

export async function getMyReviewForProduct(userId: string, productId: string) {
  const [existing] = await db
    .select()
    .from(reviews)
    .where(and(eq(reviews.userId, userId), eq(reviews.productId, productId)))
    .limit(1);
  return existing ?? null;
}

export async function submitReview(productId: string, rating: number, comment: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) throw new Error("You need to be signed in to leave a review.");

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new Error("Rating must be between 1 and 5.");
  }

  const allowed = await canReviewProduct(session.user.id, productId);
  if (!allowed) {
    throw new Error("You can only review products from a delivered order.");
  }

  const existing = await getMyReviewForProduct(session.user.id, productId);
  const trimmedComment = comment.trim() || null;

  if (existing) {
    await db
      .update(reviews)
      .set({ rating, comment: trimmedComment, updatedAt: new Date() })
      .where(eq(reviews.id, existing.id));
  } else {
    await db.insert(reviews).values({
      productId,
      userId: session.user.id,
      userName: session.user.name || "Anonymous",
      rating,
      comment: trimmedComment,
    });
  }

  revalidatePath(`/products/${productId}`);
  revalidatePath("/");
}
