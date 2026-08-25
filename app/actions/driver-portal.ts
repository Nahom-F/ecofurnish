"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { deliveryClaims } from "@/db/schema";
import { getAssignmentContext, isTokenExpired, NEXT_CLAIM_TYPE, type ClaimType } from "@/lib/driver-portal";
import { haversineDistanceMeters } from "@/lib/haversine";

type Guard =
  | { ok: true; assignment: NonNullable<Awaited<ReturnType<typeof getAssignmentContext>>>["assignment"] }
  | { ok: false; error: string };

async function guardSubmission(token: string, expectedType: ClaimType): Promise<Guard> {
  const context = await getAssignmentContext(token);
  if (!context) return { ok: false, error: "This delivery link isn't valid." };
  const { assignment, order } = context;

  if (assignment.status !== "active") {
    return { ok: false, error: "This delivery is no longer active." };
  }
  if (isTokenExpired(assignment)) {
    return { ok: false, error: "This delivery link has expired." };
  }
  if (NEXT_CLAIM_TYPE[order.status] !== expectedType) {
    return { ok: false, error: "This step isn't available right now — try refreshing the page." };
  }

  const [existingPending] = await db
    .select()
    .from(deliveryClaims)
    .where(
      and(
        eq(deliveryClaims.assignmentId, assignment.id),
        eq(deliveryClaims.claimType, expectedType),
        eq(deliveryClaims.status, "pending")
      )
    )
    .limit(1);
  if (existingPending) {
    return { ok: false, error: "Already submitted — waiting for dispatcher review." };
  }

  return { ok: true, assignment };
}

export async function submitStartedDriving(token: string) {
  const guard = await guardSubmission(token, "started_driving");
  if (!guard.ok) return { success: false as const, error: guard.error };

  await db
    .insert(deliveryClaims)
    .values({ assignmentId: guard.assignment.id, claimType: "started_driving" });

  revalidatePath(`/driver/${token}`);
  return { success: true as const };
}

export async function submitNearDestination(token: string, lat: number, lng: number) {
  const guard = await guardSubmission(token, "near_destination");
  if (!guard.ok) return { success: false as const, error: guard.error };

  const distanceMeters = haversineDistanceMeters(
    lat,
    lng,
    parseFloat(guard.assignment.deliveryLat),
    parseFloat(guard.assignment.deliveryLng)
  );

  await db.insert(deliveryClaims).values({
    assignmentId: guard.assignment.id,
    claimType: "near_destination",
    driverLat: lat.toFixed(6),
    driverLng: lng.toFixed(6),
    distanceMeters: distanceMeters.toFixed(1),
  });

  revalidatePath(`/driver/${token}`);
  return { success: true as const };
}

export async function submitDelivered(token: string, lat: number, lng: number, pin: string) {
  const guard = await guardSubmission(token, "delivered");
  if (!guard.ok) return { success: false as const, error: guard.error };

  // A wrong PIN never creates a claim at all — the driver just gets
  // told to try again. This is a deliberate simplification from the
  // original "log every attempt" idea: if a mismatch DID create a
  // pending claim, the "no duplicate pending claim" guard above would
  // block the driver from immediately retrying a simple typo until a
  // dispatcher happened to notice and decline it. Verifying before
  // insert keeps the PIN a real access gate instead of a dead end.
  if (pin.trim() !== guard.assignment.buyerPin) {
    return {
      success: false as const,
      error: "That PIN doesn't match — please double check with the customer.",
    };
  }

  const distanceMeters = haversineDistanceMeters(
    lat,
    lng,
    parseFloat(guard.assignment.deliveryLat),
    parseFloat(guard.assignment.deliveryLng)
  );

  await db.insert(deliveryClaims).values({
    assignmentId: guard.assignment.id,
    claimType: "delivered",
    driverLat: lat.toFixed(6),
    driverLng: lng.toFixed(6),
    distanceMeters: distanceMeters.toFixed(1),
    pinEntered: pin.trim(),
    pinMatched: true,
  });

  revalidatePath(`/driver/${token}`);
  return { success: true as const };
}
