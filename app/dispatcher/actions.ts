"use server";

import { and, desc, eq, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { driverApplications, deliveryAssignments, orders } from "@/db/schema";
import { requireDispatcher } from "@/lib/require-dispatcher";
import { sendDriverApplicationDecisionEmail, sendDeliveryAssignedEmail } from "@/lib/email";
import { geocodeAddress } from "@/lib/geocode";
import { generateMagicToken, generateBuyerPin } from "@/lib/delivery";

export type DriverApplication = typeof driverApplications.$inferSelect;
export type AssignableOrder = typeof orders.$inferSelect;
export type ApprovedDriver = typeof driverApplications.$inferSelect;
export type ActiveDelivery = {
  assignmentId: string;
  orderId: string;
  customerName: string;
  driverName: string;
  orderStatus: string;
  assignedAt: Date;
};

export async function getDriverApplications() {
  await requireDispatcher();
  return db.select().from(driverApplications).orderBy(desc(driverApplications.createdAt));
}

export async function approveDriverApplication(id: string, reviewNote: string) {
  await requireDispatcher();

  // Atomic guard: only actually updates a row that's still "pending",
  // so two dispatchers reviewing the same application at once can't
  // both succeed (or send duplicate decision emails) — same pattern as
  // promoteToDispatcher/removeDispatcherRole in app/admin/actions.ts.
  const [application] = await db
    .update(driverApplications)
    .set({ status: "approved", reviewedAt: new Date(), reviewNote: reviewNote.trim() || null })
    .where(and(eq(driverApplications.id, id), eq(driverApplications.status, "pending")))
    .returning();

  if (!application) throw new Error("Application not found, or already reviewed.");

  if (application.email) {
    await sendDriverApplicationDecisionEmail(application.email, application.fullName, true);
  }
  revalidatePath("/dispatcher");
}

export async function rejectDriverApplication(id: string, reviewNote: string) {
  await requireDispatcher();

  const [application] = await db
    .update(driverApplications)
    .set({ status: "rejected", reviewedAt: new Date(), reviewNote: reviewNote.trim() || null })
    .where(and(eq(driverApplications.id, id), eq(driverApplications.status, "pending")))
    .returning();

  if (!application) throw new Error("Application not found, or already reviewed.");

  if (application.email) {
    await sendDriverApplicationDecisionEmail(application.email, application.fullName, false);
  }
  revalidatePath("/dispatcher");
}

// Orders ready to hand to a driver: prepped ("processing") and not
// already under an active assignment. Filtered in JS rather than a SQL
// subquery/join — simpler to read, and the row counts here are small at
// this store's scale.
export async function getAssignableOrders(): Promise<AssignableOrder[]> {
  await requireDispatcher();

  const active = await db
    .select({ orderId: deliveryAssignments.orderId })
    .from(deliveryAssignments)
    .where(eq(deliveryAssignments.status, "active"));
  const assignedOrderIds = new Set(active.map((a) => a.orderId));

  const candidates = await db
    .select()
    .from(orders)
    .where(eq(orders.status, "processing"))
    .orderBy(desc(orders.createdAt));

  return candidates.filter((o) => !assignedOrderIds.has(o.id));
}

// Approved, non-blacklisted drivers who aren't already mid-delivery on
// another order — one active delivery per driver at a time, to keep
// things simple at this scale (no multi-stop routing).
export async function getApprovedDrivers(): Promise<ApprovedDriver[]> {
  await requireDispatcher();

  const active = await db
    .select({ driverId: deliveryAssignments.driverId })
    .from(deliveryAssignments)
    .where(eq(deliveryAssignments.status, "active"));
  const busyDriverIds = new Set(active.map((a) => a.driverId));

  const approved = await db
    .select()
    .from(driverApplications)
    .where(and(eq(driverApplications.status, "approved"), isNull(driverApplications.blacklistedAt)));

  return approved.filter((d) => !busyDriverIds.has(d.id));
}

export async function getActiveDeliveries(): Promise<ActiveDelivery[]> {
  await requireDispatcher();

  return db
    .select({
      assignmentId: deliveryAssignments.id,
      orderId: orders.id,
      customerName: orders.customerName,
      driverName: driverApplications.fullName,
      orderStatus: orders.status,
      assignedAt: deliveryAssignments.createdAt,
    })
    .from(deliveryAssignments)
    .innerJoin(orders, eq(deliveryAssignments.orderId, orders.id))
    .innerJoin(driverApplications, eq(deliveryAssignments.driverId, driverApplications.id))
    .where(eq(deliveryAssignments.status, "active"))
    .orderBy(desc(deliveryAssignments.createdAt));
}

// Gives the assignment dialog a starting pin — the dispatcher drags it
// into place afterward (see the delivery-location design decision).
// Returns null on a geocoding miss; the dialog falls back to an
// Addis Ababa center point for the dispatcher to place manually.
export async function geocodeOrderAddress(orderId: string) {
  await requireDispatcher();
  const [order] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  if (!order) throw new Error("Order not found.");
  return geocodeAddress(order.shippingAddress, order.city);
}

export async function assignDriverToOrder({
  orderId,
  driverId,
  lat,
  lng,
}: {
  orderId: string;
  driverId: string;
  lat: number;
  lng: number;
}) {
  await requireDispatcher();

  const [order] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  if (!order) throw new Error("Order not found.");
  if (order.status !== "processing") {
    throw new Error("This order isn't in a state to assign a driver.");
  }

  const [existingActive] = await db
    .select()
    .from(deliveryAssignments)
    .where(and(eq(deliveryAssignments.orderId, orderId), eq(deliveryAssignments.status, "active")))
    .limit(1);
  if (existingActive) throw new Error("This order already has an active delivery assignment.");

  const [driver] = await db
    .select()
    .from(driverApplications)
    .where(eq(driverApplications.id, driverId))
    .limit(1);
  if (!driver || driver.status !== "approved" || driver.blacklistedAt) {
    throw new Error("This driver isn't eligible for assignment.");
  }

  const magicToken = generateMagicToken();
  const buyerPin = generateBuyerPin();
  const tokenExpiresAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000); // 14 days

  await db.insert(deliveryAssignments).values({
    orderId,
    driverId,
    magicToken,
    tokenExpiresAt,
    deliveryLat: lat.toFixed(6),
    deliveryLng: lng.toFixed(6),
    buyerPin,
  });

  // Direct update rather than applyOrderStatus (lib/orders.ts) — that
  // helper is reserved for the admin's manual override and the
  // dispatcher claim-approval flow (Phase 6), both of which send the
  // generic per-stage email. Assignment has its own richer email below
  // (with the PIN), so routing through applyOrderStatus here would
  // double-email the customer for what's really one event.
  await db.update(orders).set({ status: "ready_for_delivery" }).where(eq(orders.id, orderId));

  await sendDeliveryAssignedEmail(order.customerEmail, order.customerName, orderId, buyerPin);

  revalidatePath("/dispatcher/deliveries");
  revalidatePath("/admin/orders");
  revalidatePath(`/order-confirmation/${orderId}`);
  revalidatePath("/account/orders");

  return { success: true as const };
}
