import { CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { formatPrice, type Currency } from "@/lib/currency";
import { Product } from "@/types/product";
import ProductRating from "./ProductRating";

export default function ProductInfo({
  product,
  currency = "ETB",
}: {
  product: Product;
  currency?: Currency;
}) {
  return (
    <>
      <CardHeader className="p-3 pb-2 sm:p-4">
        <div className="flex items-start justify-between gap-2 sm:gap-4">
          <CardTitle className="line-clamp-1 text-base sm:text-lg">{product.name}</CardTitle>
          <span className="whitespace-nowrap text-base font-bold text-primary sm:text-lg">
            {formatPrice(product.price, currency)}
          </span>
        </div>
        {/* Only rendered once a product has at least one real review —
            no reviews yet reads as "new listing," not a fake 0-star. */}
        {product.avgRating != null && product.reviewCount ? (
          <ProductRating rating={product.avgRating} count={product.reviewCount} />
        ) : null}
      </CardHeader>

      <CardContent className="grow p-3 pt-0 sm:p-4 sm:pt-0">
        <p className="line-clamp-2 text-sm text-muted-foreground">
          {product.description || "Sustainable furniture crafted from recycled materials."}
        </p>
      </CardContent>
    </>
  );
}