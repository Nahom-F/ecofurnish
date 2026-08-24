import { eq } from "drizzle-orm";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { sendOrderStatusUpdateEmail } from "@/lib/email";
import { ORDER_STATUSES } from "@/lib/order-statuses";

export { ORDER_STATUSES, type OrderStatus } from "@/lib/order-statuses";

/**
 * Shared status-transition core, used by both the admin panel's manual
 * override (app/admin/actions.ts, requireAdmin-gated) and the dispatcher
 * delivery-claim approval flow (app/dispatcher/actions.ts,
 * requireDispatcher-gated). Callers are responsible for their own auth
 * check before calling this — it has no single "right" role to require,
 * so it isn't gated itself.
 */
export async function applyOrderStatus(orderId: string, status: string) {
  if (!(ORDER_STATUSES as readonly string[]).includes(status)) {
    throw new Error(`Invalid status: ${status}`);
  }

  const [existing] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  if (!existing) throw new Error("Order not found");

  await db.update(orders).set({ status }).where(eq(orders.id, orderId));

  // Only notify on an actual change — re-applying the same status
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

  return existing;
}
