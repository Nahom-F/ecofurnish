"use client";

import { useEffect, useRef } from "react";
import { recordSimulatedPurchase } from "@/lib/simulated-stock";

/** Mount this only when an order is confirmed paid — same pattern as
 * ClearCartOnSuccess, just recording this browser's own "purchase"
 * tally instead of clearing the cart. */
export function RecordSimulatedPurchase({
  items,
}: {
  items: { productId: string; quantity: number }[];
}) {
  const recorded = useRef(false);

  useEffect(() => {
    if (recorded.current) return;
    recorded.current = true;
    recordSimulatedPurchase(items);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
