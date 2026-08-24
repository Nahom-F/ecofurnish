// Pure, client-safe constant — no db/email imports here on purpose.
// lib/orders.ts (server-only: touches the DB and sends email) imports
// this rather than defining it, and any client component that just
// needs the list of statuses (like OrderStatusSelect) should import
// from HERE, never from lib/orders.ts. Importing a plain (non-"use
// server") module into a client component bundles its entire import
// tree into the browser — lib/orders.ts pulls in the Neon DB client,
// which then throws in the browser at module-eval time (no
// DATABASE_URL client-side), taking the whole page down with it. See
// the driver-logistics order-status bug for exactly this failure mode.
export const ORDER_STATUSES = [
  "pending",
  "processing",
  "ready_for_delivery",
  "on_the_road",
  "near_destination",
  "delivered",
  "cancelled",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];
