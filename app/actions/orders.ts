"use server";

import { headers } from "next/headers";
import { eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { orders, orderItems, products } from "@/db/schema";
import { auth } from "@/lib/auth";
import { initializeChapaTransaction, verifyChapaTransaction } from "@/lib/chapa";
import { sendOrderConfirmationEmail, sendLowStockAlertEmail } from "@/lib/email";
import { applyReferralRewards, qualifyReferralIfFirstPurchase } from "@/lib/referrals";
import { getEffectivePrice } from "@/lib/pricing";

interface PlaceOrderInput {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  city: string;
  notes?: string;
  // Best-effort browser geolocation from checkout — see
  // orders.customerLat/customerLng in db/schema.ts. Never required.
  lat?: number;
  lng?: number;
  // price is intentionally NOT trusted from here — see the re-pricing
  // block below. It's only accepted in the input type because the cart
  // (a client-side context) naturally carries one; it's never read.
  items: { productId: string; name: string; price: string; quantity: number }[];
  // A referral reward code the customer typed in at checkout, and/or a
  // flag to auto-apply any store credit they've earned from referrals.
  promoCode?: string;
  useStoreCredit?: boolean;
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
  for (const item of input.items) {
    if (!Number.isInteger(item.quantity) || item.quantity < 1) {
      return { success: false as const, error: "Invalid item quantity." };
    }
  }

  const session = await auth.api.getSession({ headers: await headers() });
  // The checkout page already gates this in the UI, but that's only a
  // convenience — enforce it here too, since a server action is directly
  // callable and the UI check alone wouldn't stop that.
  if (!session?.user) {
    return { success: false as const, error: "Please sign in to check out." };
  }
  const userId = session.user.id;

  // Re-price every line from the database rather than trusting whatever
  // the client sent. The cart is a client-side context, so its prices —
  // and the subtotal built from them — are just as spoofable as any other
  // form input, and this total is what Chapa is actually told to charge.
  // A cart price is only ever a snapshot for display; this re-fetch is the
  // one place that price becomes real money.
  const productIds = [...new Set(input.items.map((i) => i.productId))];
  const dbProducts = await db.select().from(products).where(inArray(products.id, productIds));
  const productById = new Map(dbProducts.map((p) => [p.id, p]));

  const pricedItems: { orderId: string; productId: string; productName: string; unitPrice: string; quantity: number }[] = [];
  let subtotal = 0;
  for (const item of input.items) {
    const product = productById.get(item.productId);
    if (!product) {
      return { success: false as const, error: "One of the items in your cart is no longer available." };
    }
    const unitPrice = getEffectivePrice(product);
    subtotal += parseFloat(unitPrice) * item.quantity;
    pricedItems.push({
      orderId: "", // filled in once the order row exists, below
      productId: product.id,
      productName: product.name,
      unitPrice,
      quantity: item.quantity,
    });
  }

  let discountAmount = "0.00";
  let discountNote: string | null = null;
  if (input.promoCode || input.useStoreCredit) {
    const result = await applyReferralRewards(userId, subtotal, {
      promoCode: input.promoCode,
      useStoreCredit: input.useStoreCredit,
    });
    discountAmount = result.discountAmount;
    discountNote = result.note;
  }
  const totalAmount = Math.max(0, subtotal - parseFloat(discountAmount)).toFixed(2);

  // Silently dropped if missing, malformed, or out of range — this is a
  // convenience for the dispatcher's starting pin later, never
  // something worth failing an order over.
  const hasValidLocation =
    typeof input.lat === "number" &&
    typeof input.lng === "number" &&
    Number.isFinite(input.lat) &&
    Number.isFinite(input.lng) &&
    Math.abs(input.lat) <= 90 &&
    Math.abs(input.lng) <= 180;

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
      customerLat: hasValidLocation ? input.lat!.toFixed(6) : null,
      customerLng: hasValidLocation ? input.lng!.toFixed(6) : null,
      totalAmount,
      discountAmount,
      discountNote,
    })
    .returning();

  await db.insert(orderItems).values(
    pricedItems.map((item) => ({ ...item, orderId: order.id }))
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
  // Chapa also caps tx_ref at 50 characters — the full order UUID plus a
  // prefix and timestamp blew past that, so only the first 8 hex characters
  // are used. Nothing parses orderId back out of this string (see the
  // Chapa webhook handler), so truncating it doesn't break anything.
  const txRef = `EF-${orderId.slice(0, 8)}-${Date.now()}`;
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

  // orders.userId can be null on legacy/guest orders — nothing to
  // qualify in that case.
  if (order.userId) {
    await qualifyReferralIfFirstPurchase(order.userId);
  }

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
