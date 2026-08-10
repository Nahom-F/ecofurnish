import Link from "next/link";
import { Leaf, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatPrice, type Currency } from "@/lib/currency";
import { getEffectivePrice, hasActiveDiscount } from "@/lib/pricing";
import { Product } from "@/types/product";
import ProductImage from "./ProductImage";

export default function ProductHoverDetail({
  product,
  currency,
}: {
  product: Product;
  currency: Currency;
}) {
  const discounted = hasActiveDiscount(product);

  return (
    <div
      // Pinned to the same top-left corner as the card underneath, so the
      // product photo doesn't jump — it just grows downward in place,
      // overlapping whatever's below it in the grid, the way a Windows
      // Store tile expands on hover rather than opening a separate panel.
      className="absolute inset-x-0 top-0 z-30 origin-top animate-in fade-in-0 zoom-in-95 overflow-hidden rounded-xl border border-border bg-card text-sm shadow-2xl duration-150"
      // Purely supplementary detail — a screen reader already gets the full
      // name/description from the card's own link, so this doesn't need to
      // be announced a second time.
      aria-hidden="true"
    >
      <ProductImage product={product} />

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-heading text-base leading-snug font-medium">{product.name}</h3>
          {discounted ? (
            <div className="flex flex-col items-end whitespace-nowrap">
              <span className="text-lg font-bold text-primary">
                {formatPrice(getEffectivePrice(product), currency)}
              </span>
              <span className="text-xs text-muted-foreground line-through">
                {formatPrice(product.price, currency)}
              </span>
            </div>
          ) : (
            <span className="whitespace-nowrap text-lg font-bold text-primary">
              {formatPrice(product.price, currency)}
            </span>
          )}
        </div>

        {product.avgRating != null && product.reviewCount ? (
          <div className="mt-1 flex items-center gap-1">
            <Star className="size-3.5 fill-yellow-400 text-yellow-400" />
            <span className="text-xs font-medium">{product.avgRating.toFixed(1)}</span>
            <span className="text-xs text-muted-foreground">({product.reviewCount})</span>
          </div>
        ) : null}

        <p className="mt-2 text-muted-foreground">
          {product.description || "Sustainable furniture crafted from recycled materials."}
        </p>

        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <Badge variant="outline" className="capitalize">
            {product.category}
          </Badge>
          <Badge className="gap-1 bg-green-600 text-white hover:bg-green-700">
            <Leaf className="size-3" />
            {product.plasticWeightKg}kg diverted
          </Badge>
          <span
            className={
              product.stock > 0
                ? "text-xs text-muted-foreground"
                : "text-xs font-medium text-destructive"
            }
          >
            {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
          </span>
        </div>

        <Link
          href={`/products/${product.id}`}
          tabIndex={-1}
          className="mt-3 inline-block text-xs font-medium text-primary hover:underline"
        >
          View full details →
        </Link>
      </div>
    </div>
  );
}
