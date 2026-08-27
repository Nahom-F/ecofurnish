"use client";

import { useSyncExternalStore } from "react";
import { getSimulatedStock } from "@/lib/simulated-stock";

// Nothing in this app ever mutates the localStorage tally while a
// product page is already open (it's only written right after a
// checkout completes, on a different page) — so this subscription
// never actually needs to fire a notification. useSyncExternalStore
// still requires a subscribe function per its API; an empty one is
// the correct no-op here, not a placeholder for something missing.
function subscribe() {
  return () => {};
}

/**
 * Returns the stock number to actually display for a product.
 * useSyncExternalStore is the right tool here specifically because its
 * getServerSnapshot argument lets the SSR render match the client's
 * first paint exactly (both return rawStock), then cleanly swap to the
 * localStorage-adjusted value after hydration — without the cascading-
 * render risk of calling setState inside a useEffect.
 */
export function useEffectiveStock(productId: string, rawStock: number): number {
  return useSyncExternalStore(
    subscribe,
    () => getSimulatedStock(productId, rawStock),
    () => rawStock
  );
}
