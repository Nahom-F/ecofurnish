"use client";

const STORAGE_KEY = "ecofurnish-simulated-purchases";

type SimulatedPurchases = Record<string, number>;

function readSimulatedPurchases(): SimulatedPurchases {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

/**
 * The stock number THIS browser should see for a product — the real,
 * admin-set stock minus whatever this browser has itself "bought" in
 * past demo checkouts. Real stock is never touched by checkout anymore
 * (see confirmPayment in app/actions/orders.ts), specifically so this
 * number stays identical for every other visitor; only this browser's
 * own localStorage tally makes it differ here. Returns realStock
 * unchanged during SSR (no localStorage yet) — callers that render this
 * should follow the useState+useEffect pattern used in
 * useEffectiveStock below to avoid a hydration mismatch.
 */
export function getSimulatedStock(productId: string, realStock: number): number {
  const purchases = readSimulatedPurchases();
  return Math.max(0, realStock - (purchases[productId] ?? 0));
}

/**
 * Called once, client-side, right after a real order is confirmed
 * paid — records what THIS browser just "bought" so its own view of
 * stock reflects it going forward, without touching the real shared
 * number. See RecordSimulatedPurchase (components/RecordSimulatedPurchase.tsx).
 */
export function recordSimulatedPurchase(items: { productId: string; quantity: number }[]) {
  if (typeof window === "undefined") return;
  const purchases = readSimulatedPurchases();
  for (const item of items) {
    purchases[item.productId] = (purchases[item.productId] ?? 0) + item.quantity;
  }
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(purchases));
  } catch {
    // localStorage unavailable (private browsing, quota, etc.) — fine,
    // this is a cosmetic layer; the real checkout flow is unaffected.
  }
}
