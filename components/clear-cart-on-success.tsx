"use client";

import { useEffect, useRef } from "react";
import { useCart } from "@/lib/cart-context";

/** Mount this only when an order is confirmed paid — clears the cart once. */
export function ClearCartOnSuccess() {
  const { clearCart } = useCart();
  const cleared = useRef(false);

  useEffect(() => {
    if (cleared.current) return;
    cleared.current = true;
    clearCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
