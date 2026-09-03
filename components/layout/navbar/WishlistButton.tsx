"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { useWishlist } from "@/lib/wishlist-context";
import { NAV_HOVER_ICON } from "./nav-hover";

export default function WishlistButton() {
  const { totalItems } = useWishlist();

  return (
    <Link href="/wishlist" aria-label="Wishlist" className={`${NAV_HOVER_ICON} p-2`}>
      <Heart className="h-5 w-5 text-foreground" />
      {totalItems > 0 && (
        <span
          key={totalItems}
          className="absolute -right-1 -top-1 flex h-4.5 min-w-4.5 animate-in zoom-in-50 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-semibold text-white duration-300"
        >
          {totalItems}
        </span>
      )}
    </Link>
  );
}
