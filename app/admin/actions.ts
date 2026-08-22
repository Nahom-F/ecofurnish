"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { put } from "@vercel/blob";
import { db } from "@/db";
import { products, orders, inboundEmails } from "@/db/schema";
import { requireAdmin } from "@/lib/require-admin";
import { sendOrderStatusUpdateEmail } from "@/lib/email";

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_IMAGE_BYTES = 4 * 1024 * 1024; // stay comfortably under Vercel's 4.5MB server-upload cap

export async function uploadProductImage(formData: FormData) {
  await requireAdmin();

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { success: false as const, error: "No file selected." };
  }
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return { success: false as const, error: "Please upload a JPEG, PNG, or WebP image." };
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return { success: false as const, error: "Image is too large — please keep it under 4MB." };
  }

  try {
    const blob = await put(`products/${file.name}`, file, {
      access: "public",
      addRandomSuffix: true,
    });
    return { success: true as const, url: blob.url };
  } catch (err) {
    console.error("Product image upload failed:", err);
    return { success: false as const, error: "Upload failed — please try again." };
  }
}

export interface ProductInput {
  name: string;
  description: string;
  price: string;
  imageUrl: string;
  images: string[];
  category: string;
  rooms: string[];
  stock: number;
  plasticWeightKg: string;
  discountPercent: number;
  discountReason: string;
}

function validateProductInput(input: ProductInput) {
  if (!input.name.trim()) throw new Error("Name is required.");
  if (!input.category.trim()) throw new Error("Category is required.");
  const price = parseFloat(input.price);
  if (!Number.isFinite(price) || price < 0) {
    throw new Error("Price must be a valid, non-negative number.");
  }
  if (!Number.isInteger(input.stock) || input.stock < 0) {
    throw new Error("Stock must be a non-negative whole number.");
  }
  // The HTML max=99 on the form input is a UI hint only — a request
  // straight to this action (or a typo like "150") would otherwise sail
  // through and, via getEffectivePrice's formula, produce a negative
  // price that flows straight into what Chapa actually charges.
  if (
    !Number.isInteger(input.discountPercent) ||
    input.discountPercent < 0 ||
    input.discountPercent > 99
  ) {
    throw new Error("Discount must be a whole number between 0 and 99.");
  }
  // Cover photo + up to 7 extra = 8 total, which is plenty for a product
  // gallery and keeps the admin form and hover-cycler from getting unwieldy.
  if (input.images.length > 7) {
    throw new Error("You can add up to 7 extra photos on top of the cover photo.");
  }
}

export async function createProduct(input: ProductInput) {
  await requireAdmin();
  validateProductInput(input);
  await db.insert(products).values(input);
  revalidatePath("/admin/products");
  revalidatePath("/");
}

export async function updateProduct(id: string, input: ProductInput) {
  await requireAdmin();
  validateProductInput(input);
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

export async function markInboundEmailRead(id: string, read: boolean) {
  await requireAdmin();
  await db.update(inboundEmails).set({ read }).where(eq(inboundEmails.id, id));
  revalidatePath("/admin/inbox");
}
