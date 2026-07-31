"use client";

import { useEffect, useRef, useState } from "react";
import { Product } from "@/types/product";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import ProductImage from "./ProductImage";
import ProductInfo from "./ProductInfo";
import ProductActions from "./ProductActions";
import ProductHoverDetail from "./ProductHoverDetail";
import type { Currency } from "@/lib/currency";

interface ProductCardProps {
  product: Product;
  currency?: Currency;
}

export default function ProductCard({ product, currency = "ETB" }: ProductCardProps) {
  const [open, setOpen] = useState(false);
  const [canHover, setCanHover] = useState(false);
  const showTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Only the mouse-hover trigger is gated to real pointer devices — on a
  // touchscreen, :hover-style interactions don't get a reliable "leave"
  // event, so the preview would just get stuck open after a tap. Checked
  // once on mount rather than in render, since matchMedia isn't available
  // during SSR.
  useEffect(() => {
    setCanHover(window.matchMedia("(hover: hover) and (pointer: fine)").matches);
  }, []);

  function scheduleOpen() {
    if (!canHover) return;
    showTimer.current = setTimeout(() => setOpen(true), 200);
  }

  function cancelOpen() {
    if (showTimer.current) clearTimeout(showTimer.current);
    setOpen(false);
  }

  return (
    <div
      className="relative"
      onMouseEnter={scheduleOpen}
      onMouseLeave={cancelOpen}
      onFocus={() => setOpen(true)}
      onBlur={(e) => {
        // Only close once focus has left the card entirely, not when it
        // moves from the title link to the Add to Cart button inside it.
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setOpen(false);
      }}
    >
      <Card className="flex flex-col overflow-hidden transition-all hover:shadow-lg">
        {/* Clicking the image or text takes you to the product details page */}
        <Link href={`/products/${product.id}`} className="contents">
          <ProductImage product={product} />
          <ProductInfo product={product} currency={currency} />
        </Link>

        {/* The interactive button section */}
        <ProductActions product={product} />
      </Card>

      {open && <ProductHoverDetail product={product} currency={currency} />}
    </div>
  );
}