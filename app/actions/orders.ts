"use server";

import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { orders, orderItems, products } from "@/db/schema";
import { auth } from "@/lib/auth";
import { initializeChapaTransaction, verifyChapaTransaction } from "@/lib/chapa";
import { sendOrderConfirmationEmail, sendLowStockAlertEmail } from "@/lib/email";

interface PlaceOrderInput {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  city: string;
  notes?: string;
  items: { productId: string; name: string; price: string; quantity: number }[];
}

/**
 * Creates the order + line items as "unpaid". Stock isn't touched yet —
 * that only happens once Chapa confirms the payment actually went through,
 * so an abandoned checkout never permanently reserves inventory.
 */
export async function createOrder(input: PlaceOrderInput) {
  if (input.items.length === 0) {
    return { success: false as const, error: "Your cart is empty." };
  }

  const session = await auth.api.getSession({ headers: await headers() });
  // The checkout page already gates this in the UI, but that's only a
  // convenience — enforce it here too, since a server action is directly
  // callable and the UI check alone wouldn't stop that.
  if (!session?.user) {
    return { success: false as const, error: "Please sign in to check out." };
  }
  const userId = session.user.id;

  const totalAmount = input.items
    .reduce((sum, item) => sum + parseFloat(item.price) * item.quantity, 0)
    .toFixed(2);

  const [order] = await db
    .insert(orders)
    .values({
      userId,
      customerName: input.customerName,
      customerEmail: input.customerEmail,
      customerPhone: input.customerPhone,
      shippingAddress: input.shippingAddress,
      city: input.city,
      notes: input.notes,
      totalAmount,
    })
    .returning();

  await db.insert(orderItems).values(
    input.items.map((item) => ({
      orderId: order.id,
      productId: item.productId,
      productName: item.name,
      unitPrice: item.price,
      quantity: item.quantity,
    }))
  );

  return { success: true as const, orderId: order.id };
}

/** Starts a Chapa transaction for an already-created order and returns its hosted checkout URL. */
export async function createCheckoutSession(orderId: string) {
  const [order] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  if (!order) {
    return { success: false as const, error: "Order not found." };
  }

  // Chapa requires a unique tx_ref per attempt — reusing the order id alone
  // would collide if the customer retries after a cancel, so we timestamp it.
  const txRef = `ecofurnish-${orderId.slice(0, 8)}-${Date.now()}`;
  const [firstName, ...rest] = order.customerName.split(" ");

  const result = await initializeChapaTransaction({
    amount: parseFloat(order.totalAmount),
    email: order.customerEmail,
    firstName: firstName || order.customerName,
    lastName: rest.join(" ") || firstName || order.customerName,
    phoneNumber: order.customerPhone,
    txRef,
    orderId,
    title: "EcoFurnish",
  });

  if (!result.success) {
    return { success: false as const, error: result.error };
  }

  await db.update(orders).set({ chapaTxRef: txRef }).where(eq(orders.id, orderId));

  return { success: true as const, url: result.checkoutUrl };
}

/**
 * Called from the order-confirmation page (and from the Chapa callback
 * route) to confirm — server-to-server, not just via the browser redirect —
 * that a transaction actually succeeded, before doing anything irreversible
 * (decrementing stock, sending the confirmation email). Safe to call more
 * than once: it's a no-op if the order is already marked paid.
 */
export async function confirmPayment(orderId: string, txRef: string) {
  const [order] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  if (!order) return { paid: false as const };

  if (order.paymentStatus === "paid") {
    return { paid: true as const };
  }

  if (order.chapaTxRef !== txRef) {
    return { paid: false as const };
  }

  const { paid } = await verifyChapaTransaction(txRef);
  if (!paid) return { paid: false as const };

  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));

  const LOW_STOCK_THRESHOLD = 5;
  for (const item of items) {
    const [product] = await db
      .select({ stock: products.stock, name: products.name })
      .from(products)
      .where(eq(products.id, item.productId))
      .limit(1);
    if (product) {
      const newStock = Math.max(0, product.stock - item.quantity);
      await db.update(products).set({ stock: newStock }).where(eq(products.id, item.productId));
      // Only fires on the crossing, not on every purchase once it's
      // already low — e.g. 6→4 alerts, but 4→2 (already below threshold
      // before this purchase) doesn't re-send the same warning.
      if (newStock <= LOW_STOCK_THRESHOLD && product.stock > LOW_STOCK_THRESHOLD) {
        await sendLowStockAlertEmail(product.name, newStock);
      }
    }
  }

  await db
    .update(orders)
    .set({ paymentStatus: "paid", status: "processing" })
    .where(eq(orders.id, orderId));

  await sendOrderConfirmationEmail({
    toEmail: order.customerEmail,
    customerName: order.customerName,
    orderId: order.id,
    totalAmount: order.totalAmount,
    items: items.map((i) => ({
      productName: i.productName,
      unitPrice: i.unitPrice,
      quantity: i.quantity,
    })),
  });

  return { paid: true as const };
}
