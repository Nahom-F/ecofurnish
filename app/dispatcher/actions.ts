"use server";

import { and, desc, eq, isNull, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { driverApplications, deliveryAssignments, deliveryClaims, orders } from "@/db/schema";
import { requireDispatcher } from "@/lib/require-dispatcher";
import { sendDriverApplicationDecisionEmail, sendDeliveryAssignedEmail, sendDriverAssignmentEmail } from "@/lib/email";
import { geocodeAddress } from "@/lib/geocode";
import { generateMagicToken, generateBuyerPin, driverPortalUrl } from "@/lib/delivery";
import { applyOrderStatus, type OrderStatus } from "@/lib/orders";

export type PendingClaim = {
  claimId: string;
  claimType: string;
  driverLat: string | null;
  driverLng: string | null;
  distanceMeters: string | null;
  pinEntered: string | null;
  pinMatched: boolean | null;
  createdAt: Date;
  orderId: string;
  customerName: string;
  driverId: string;
  driverName: string;
  driverFlagCount: number;
};

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
  magicToken: string;
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
      magicToken: deliveryAssignments.magicToken,
    })
    .from(deliveryAssignments)
    .innerJoin(orders, eq(deliveryAssignments.orderId, orders.id))
    .innerJoin(driverApplications, eq(deliveryAssignments.driverId, driverApplications.id))
    .where(eq(deliveryAssignments.status, "active"))
    .orderBy(desc(deliveryAssignments.createdAt));
}

// Gives the assignment dialog a starting pin — the dispatcher drags it
// into place afterward (see the delivery-location design decision).
// Gives the assignment dialog a starting pin — the dispatcher drags it
// into place afterward (see the delivery-location design decision).
// Prefers the buyer's own checkout-time geolocation (orders.customerLat/
// customerLng) when they granted it — that's a real GPS fix, so it beats
// text-geocoding the address every time. Falls back to geocoding the
// address, and finally to null (Addis Ababa center) if that misses too.
export async function geocodeOrderAddress(orderId: string) {
  await requireDispatcher();
  const [order] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  if (!order) throw new Error("Order not found.");

  if (order.customerLat && order.customerLng) {
    return {
      lat: parseFloat(order.customerLat),
      lng: parseFloat(order.customerLng),
      source: "gps" as const,
    };
  }

  const geocoded = await geocodeAddress(order.shippingAddress, order.city);
  return geocoded ? { ...geocoded, source: "geocoded" as const } : null;
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

  // The driver's own link — this is the ONLY way a driver without an
  // email on file (email is optional; phone is the required contact)
  // can get it, so it's returned here for the dispatcher UI to display
  // and copy, not just emailed best-effort below.
  const portalUrl = driverPortalUrl(magicToken);
  if (driver.email) {
    await sendDriverAssignmentEmail(driver.email, driver.fullName, orderId, portalUrl);
  }

  revalidatePath("/dispatcher/deliveries");
  revalidatePath("/admin/orders");
  revalidatePath(`/order-confirmation/${orderId}`);
  revalidatePath("/account/orders");

  return { success: true as const, portalUrl, magicToken };
}

// A claim's type maps 1:1 to the order status it advances to once
// approved. "near_destination" is the same literal string on both
// sides — coincidence of naming, not a bug.
const CLAIM_TO_ORDER_STATUS: Record<string, OrderStatus> = {
  started_driving: "on_the_road",
  near_destination: "near_destination",
  delivered: "delivered",
};

export async function getPendingClaims(): Promise<PendingClaim[]> {
  await requireDispatcher();

  return db
    .select({
      claimId: deliveryClaims.id,
      claimType: deliveryClaims.claimType,
      driverLat: deliveryClaims.driverLat,
      driverLng: deliveryClaims.driverLng,
      distanceMeters: deliveryClaims.distanceMeters,
      pinEntered: deliveryClaims.pinEntered,
      pinMatched: deliveryClaims.pinMatched,
      createdAt: deliveryClaims.createdAt,
      orderId: orders.id,
      customerName: orders.customerName,
      driverId: driverApplications.id,
      driverName: driverApplications.fullName,
      driverFlagCount: driverApplications.flagCount,
    })
    .from(deliveryClaims)
    .innerJoin(deliveryAssignments, eq(deliveryClaims.assignmentId, deliveryAssignments.id))
    .innerJoin(orders, eq(deliveryAssignments.orderId, orders.id))
    .innerJoin(driverApplications, eq(deliveryAssignments.driverId, driverApplications.id))
    .where(eq(deliveryClaims.status, "pending"))
    .orderBy(desc(deliveryClaims.createdAt));
}

export async function approveClaim(claimId: string, dispatcherNote: string) {
  await requireDispatcher();

  // Atomic guard, same pattern as the application review actions above.
  const [claim] = await db
    .update(deliveryClaims)
    .set({ status: "approved", reviewedAt: new Date(), dispatcherNote: dispatcherNote.trim() || null })
    .where(and(eq(deliveryClaims.id, claimId), eq(deliveryClaims.status, "pending")))
    .returning();
  if (!claim) throw new Error("Claim not found, or already reviewed.");

  const [assignment] = await db
    .select()
    .from(deliveryAssignments)
    .where(eq(deliveryAssignments.id, claim.assignmentId))
    .limit(1);
  if (!assignment) throw new Error("Assignment not found.");

  // This IS the case applyOrderStatus (lib/orders.ts) was reserved for
  // — approving a claim is exactly when the generic per-stage email
  // should fire, unlike assignment (which has its own richer email).
  // It also now handles completing the assignment itself when the new
  // status is "delivered", so there's nothing extra to do here.
  const newStatus = CLAIM_TO_ORDER_STATUS[claim.claimType];
  if (newStatus) {
    await applyOrderStatus(assignment.orderId, newStatus);
  }

  revalidatePath("/dispatcher/claims");
  revalidatePath("/dispatcher/deliveries");
  revalidatePath("/admin/orders");
  revalidatePath(`/order-confirmation/${assignment.orderId}`);
  revalidatePath("/account/orders");
}

export async function declineClaim(claimId: string, dispatcherNote: string) {
  await requireDispatcher();

  const [claim] = await db
    .update(deliveryClaims)
    .set({ status: "declined", reviewedAt: new Date(), dispatcherNote: dispatcherNote.trim() || null })
    .where(and(eq(deliveryClaims.id, claimId), eq(deliveryClaims.status, "pending")))
    .returning();
  if (!claim) throw new Error("Claim not found, or already reviewed.");

  const [assignment] = await db
    .select()
    .from(deliveryAssignments)
    .where(eq(deliveryAssignments.id, claim.assignmentId))
    .limit(1);
  if (!assignment) throw new Error("Assignment not found.");

  // Order status is untouched on a decline — the driver just sees the
  // dispatcherNote on their portal and can resubmit the same claim type
  // (Phase 5's "no duplicate pending claim" guard only blocks while one
  // is still pending; a declined one frees them to try again).
  const [driver] = await db
    .update(driverApplications)
    .set({ flagCount: sql`${driverApplications.flagCount} + 1` })
    .where(eq(driverApplications.id, assignment.driverId))
    .returning();

  // 3-strike auto-blacklist. Doesn't touch their current assignment —
  // force-reassigning a driver mid-delivery is out of scope here (see
  // the delivery-assignment design notes); this just stops them from
  // being picked for anything NEW (getApprovedDrivers already filters
  // out anyone with blacklistedAt set).
  if (driver && driver.flagCount >= 3 && !driver.blacklistedAt) {
    await db
      .update(driverApplications)
      .set({ blacklistedAt: new Date() })
      .where(eq(driverApplications.id, driver.id));
  }

  revalidatePath("/dispatcher/claims");
  revalidatePath("/dispatcher");
  revalidatePath("/dispatcher/deliveries");
}
