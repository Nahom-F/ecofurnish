"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { products, orders } from "@/db/schema";
import { requireAdmin } from "@/lib/require-admin";
import { sendOrderStatusUpdateEmail } from "@/lib/email";

export interface ProductInput {
  name: string;
  description: string;
  price: string;
  imageUrl: string;
  category: string;
  rooms: string[];
  stock: number;
  plasticWeightKg: string;
  discountPercent: number;
  discountReason: string;
}

export async function createProduct(input: ProductInput) {
  await requireAdmin();
  await db.insert(products).values(input);
  revalidatePath("/admin/products");
  revalidatePath("/");
}

export async function updateProduct(id: string, input: ProductInput) {
  await requireAdmin();
  await db
    .update(products)
    .set({ ...input, updatedAt: new Date() })
    .where(eq(products.id, id));
  revalidatePath("/admin/products");
  revalidatePath("/");
  revalidatePath(`/products/${id}`);
}

export async function deleteProduct(id: string) {
  await requireAdmin();
  await db.delete(products).where(eq(products.id, id));
  revalidatePath("/admin/products");
  revalidatePath("/");
}

const VALID_STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled"];

export async function updateOrderStatus(orderId: string, status: string) {
  await requireAdmin();
  if (!VALID_STATUSES.includes(status)) {
    throw new Error(`Invalid status: ${status}`);
  }

  const [existing] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  if (!existing) throw new Error("Order not found");

  await db.update(orders).set({ status }).where(eq(orders.id, orderId));

  // Only notify on an actual change — re-selecting the same status
  // (nothing to tell the customer) shouldn't re-send anything.
  if (existing.status !== status) {
    await sendOrderStatusUpdateEmail(
      existing.customerEmail,
      existing.customerName,
      orderId,
      status,
      existing.trackingNote
    );
  }

  revalidatePath("/admin/orders");
  revalidatePath(`/order-confirmation/${orderId}`);
  revalidatePath("/account/orders");
}

export async function updateOrderTrackingNote(orderId: string, trackingNote: string) {
  await requireAdmin();
  await db
    .update(orders)
    .set({ trackingNote: trackingNote.trim() || null })
    .where(eq(orders.id, orderId));
  revalidatePath("/admin/orders");
  revalidatePath(`/order-confirmation/${orderId}`);
}
