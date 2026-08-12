import { and, eq, inArray, ne } from "drizzle-orm";
import { db } from "@/db";
import { orderItems, orders, products } from "@/db/schema";

/**
 * Total kg of plastic diverted from landfill across a customer's own
 * completed orders — sums each order line's quantity against that
 * product's current plasticWeightKg (orders don't snapshot it, so this
 * uses the live product value, same tradeoff ReorderButton already makes
 * for image/stock). Only counts orders that were actually paid and
 * weren't cancelled; a deleted product is skipped rather than erroring.
 */
export async function getUserPlasticDivertedKg(userId: string): Promise<number> {
  const paidOrders = await db
    .select({ id: orders.id })
    .from(orders)
    .where(and(eq(orders.userId, userId), eq(orders.paymentStatus, "paid"), ne(orders.status, "cancelled")));

  if (paidOrders.length === 0) return 0;

  const orderIds = paidOrders.map((o) => o.id);
  const items = await db
    .select({ productId: orderItems.productId, quantity: orderItems.quantity })
    .from(orderItems)
    .where(inArray(orderItems.orderId, orderIds));

  if (items.length === 0) return 0;

  const productIds = [...new Set(items.map((i) => i.productId))];
  const matchingProducts = await db
    .select({ id: products.id, plasticWeightKg: products.plasticWeightKg })
    .from(products)
    .where(inArray(products.id, productIds));

  const weightById = new Map(matchingProducts.map((p) => [p.id, parseFloat(p.plasticWeightKg)]));

  return items.reduce((total, item) => {
    const weight = weightById.get(item.productId);
    return weight ? total + weight * item.quantity : total;
  }, 0);
}
