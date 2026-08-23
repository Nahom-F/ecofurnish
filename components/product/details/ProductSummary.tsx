"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Product } from "@/types/product";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/lib/cart-context";
import { useCurrency } from "@/lib/currency-context";
import { formatPrice } from "@/lib/currency";
import { getEffectivePrice } from "@/lib/pricing";
import ProductMeta from "./ProductMeta";
import QuantitySelector from "./QuantitySelector";
import AddToCartButton from "../AddToCartButton";
import WishlistButton from "../WishlistButton";

interface ProductSummaryProps {
  product: Product;
}

export default function ProductSummary({ product }: ProductSummaryProps) {
  const { addItem } = useCart();
  const { currency } = useCurrency();
  const [quantity, setQuantity] = useState(1);
  const outOfStock = product.stock <= 0;

  function handleAddToCart() {
    addItem(
      {
        productId: product.id,
        name: product.name,
        price: getEffectivePrice(product),
        imageUrl: product.imageUrl,
        stock: product.stock,
      },
      quantity
    );
    toast.success(`${quantity} × ${product.name} added to cart`);
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={`/?category=${encodeURIComponent(product.category)}#all-products`}
          className="text-sm font-medium uppercase tracking-wide text-muted-foreground transition-colors hover:text-primary"
        >
          {product.category}
        </Link>
        <h1 className="mt-1 text-4xl font-bold">{product.name}</h1>
      </div>

      <ProductMeta
        price={product.price}
        currency={currency}
        avgRating={product.avgRating}
        reviewCount={product.reviewCount}
        discountPercent={product.discountPercent}
        discountReason={product.discountReason}
      />

      <p className="text-muted-foreground">
        {product.description || "Sustainable furniture crafted from recycled materials."}
      </p>

      {product.rooms.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Fits
          </span>
          {product.rooms.map((room) => (
            <Link key={room} href={`/?room=${encodeURIComponent(room)}#all-products`}>
              <Badge
                variant="outline"
                className="cursor-pointer transition-colors hover:border-primary hover:text-primary"
              >
                {room}
              </Badge>
            </Link>
          ))}
        </div>
      )}

      {!outOfStock && (
        <div className="flex items-center gap-2.5">
          <QuantitySelector
            quantity={quantity}
            onDecrease={() => setQuantity((q) => Math.max(1, q - 1))}
            onIncrease={() => setQuantity((q) => Math.min(product.stock, q + 1))}
            max={product.stock}
          />
          {/* Same pattern as the cart page's running-total badge: keyed on
              quantity so React remounts it on every +/- click, replaying
              the pop-in animation each time instead of only on first
              render. Uses getEffectivePrice (the discounted price, same
              value handleAddToCart actually sends to the cart) rather
              than product.price directly, so this preview always matches
              what actually gets added. */}
          <span
            key={quantity}
            className="rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold whitespace-nowrap text-primary duration-200 animate-in fade-in-0 zoom-in-90"
          >
            {formatPrice((parseFloat(getEffectivePrice(product)) * quantity).toFixed(2), currency)}
          </span>
        </div>
      )}

      <div className="flex gap-3">
        <AddToCartButton onClick={handleAddToCart} disabled={outOfStock} />
        <WishlistButton product={product} />
      </div>
    </div>
  );
}
