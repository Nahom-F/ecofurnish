"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useSession } from "@/lib/auth-client";

export interface CartItem {
  productId: string;
  name: string;
  price: string; // snapshot at time of adding, as a decimal string
  imageUrl: string | null;
  quantity: number;
  stock: number;
}

interface CartContextValue {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
}

const CartContext = createContext<CartContextValue | null>(null);

function storageKeyFor(userId: string | null) {
  return `ecofurnish:cart:${userId ?? "guest"}`;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { data: session, isPending } = useSession();
  const userId = session?.user?.id ?? null;

  const [items, setItems] = useState<CartItem[]>([]);
  // Tracks which account's cart is currently loaded, so we can tell when
  // the signed-in user has changed (sign in, sign out, or switched
  // accounts) and reload from that account's own storage key instead of
  // carrying another account's cart over.
  const [loadedFor, setLoadedFor] = useState<string | null | "unloaded">("unloaded");

  useEffect(() => {
    if (isPending) return; // don't load until we know who's signed in
    if (loadedFor === userId) return;

    try {
      const raw = window.localStorage.getItem(storageKeyFor(userId));
      let loaded: CartItem[] = raw ? JSON.parse(raw) : [];

      // Just signed in from a guest session — fold whatever was in the
      // guest cart into the account cart instead of silently stranding it
      // (guest and account carts are stored under different keys).
      if (userId && loadedFor === null) {
        const guestRaw = window.localStorage.getItem(storageKeyFor(null));
        const guestItems: CartItem[] = guestRaw ? JSON.parse(guestRaw) : [];
        if (guestItems.length > 0) {
          for (const guestItem of guestItems) {
            const existing = loaded.find((i) => i.productId === guestItem.productId);
            if (existing) {
              existing.quantity = Math.min(existing.quantity + guestItem.quantity, existing.stock);
            } else {
              loaded = [...loaded, guestItem];
            }
          }
          window.localStorage.removeItem(storageKeyFor(null));
        }
      }

      // Syncing from localStorage (external, unreadable during SSR/render).
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setItems(loaded);
    } catch {
      setItems([]);
    }
    setLoadedFor(userId);
  }, [isPending, userId, loadedFor]);

  // Persist on every change, once the correct account's cart is loaded
  useEffect(() => {
    if (loadedFor === "unloaded" || loadedFor !== userId) return;
    try {
      window.localStorage.setItem(storageKeyFor(userId), JSON.stringify(items));
    } catch {
      // storage full or blocked — cart just won't persist this session
    }
  }, [items, userId, loadedFor]);

  const addItem: CartContextValue["addItem"] = (item, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === item.productId);
      if (existing) {
        const nextQty = Math.min(existing.quantity + quantity, existing.stock);
        return prev.map((i) =>
          i.productId === item.productId ? { ...i, quantity: nextQty } : i
        );
      }
      return [...prev, { ...item, quantity: Math.min(quantity, item.stock) }];
    });
  };

  const removeItem = (productId: string) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    setItems((prev) =>
      prev.map((i) =>
        i.productId === productId
          ? { ...i, quantity: Math.min(quantity, i.stock) }
          : i
      )
    );
  };

  const clearCart = () => setItems([]);

  const totalItems = useMemo(
    () => items.reduce((sum, i) => sum + i.quantity, 0),
    [items]
  );

  const subtotal = useMemo(
    () => items.reduce((sum, i) => sum + parseFloat(i.price) * i.quantity, 0),
    [items]
  );

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateQuantity, clearCart, totalItems, subtotal }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
