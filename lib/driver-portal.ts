import { eq } from "drizzle-orm";
import { db } from "@/db";
import { deliveryAssignments, orders } from "@/db/schema";

export type AssignmentContext = {
  assignment: typeof deliveryAssignments.$inferSelect;
  order: typeof orders.$inferSelect;
};

/**
 * Resolves a driver's magic-link token to its assignment + order, or
 * null if the token simply doesn't exist. Doesn't check expiry or
 * assignment.status itself (see isTokenExpired below) — callers decide
 * what to show for an expired/inactive-but-real link vs. a token that
 * never existed at all. Shared by the driver portal page
 * (app/driver/[token]) and its submit actions
 * (app/actions/driver-portal.ts) so both agree on what a valid link is.
 */
export async function getAssignmentContext(token: string): Promise<AssignmentContext | null> {
  const [assignment] = await db
    .select()
    .from(deliveryAssignments)
    .where(eq(deliveryAssignments.magicToken, token))
    .limit(1);
  if (!assignment) return null;

  const [order] = await db.select().from(orders).where(eq(orders.id, assignment.orderId)).limit(1);
  if (!order) return null;

  return { assignment, order };
}

export function isTokenExpired(assignment: { tokenExpiresAt: Date }): boolean {
  return assignment.tokenExpiresAt.getTime() < Date.now();
}

export type ClaimType = "started_driving" | "near_destination" | "delivered";

// Maps the order's current (dispatcher-confirmed) stage to the one
// claim type that's actually actionable next. Deliberately keyed off
// order.status rather than the driver's own claim history — status only
// advances once a dispatcher approves a claim (Phase 6), so this is
// always "what's really next," not "what the driver already tapped."
export const NEXT_CLAIM_TYPE: Record<string, ClaimType | null> = {
  ready_for_delivery: "started_driving",
  on_the_road: "near_destination",
  near_destination: "delivered",
  delivered: null,
};
