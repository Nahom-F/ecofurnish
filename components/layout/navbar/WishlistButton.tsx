"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { useWishlist } from "@/lib/wishlist-context";

export default function WishlistButton() {
  const { totalItems } = useWishlist();

  return (
    <Link
      href="/wishlist"
      aria-label="Wishlist"
      className="relative rounded-xl p-2 transition-colors hover:bg-muted"
    >
      <Heart className="h-5 w-5 text-foreground" />
      {totalItems > 0 && (
        <span
          key={totalItems}
          className="absolute -right-1 -top-1 flex h-4.5 min-w-4.5 animate-in zoom-in-50 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white duration-300"
        >
          {totalItems}
        </span>
      )}
    </Link>
  );
}
