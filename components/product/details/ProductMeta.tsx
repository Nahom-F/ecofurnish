import ProductPrice from "../ProductPrice";
import ProductRating from "../ProductRating";
import type { Currency } from "@/lib/currency";

interface ProductMetaProps {
  price: string;
  currency?: Currency;
  avgRating?: number | null;
  reviewCount?: number;
  discountPercent?: number | null;
  discountReason?: string | null;
}

export default function ProductMeta({
  price,
  currency = "ETB",
  avgRating,
  reviewCount,
  discountPercent,
  discountReason,
}: ProductMetaProps) {
  return (
    <div className="space-y-4">
      <ProductPrice
        price={price}
        currency={currency}
        discountPercent={discountPercent}
        discountReason={discountReason}
      />
      {avgRating != null && reviewCount ? (
        <ProductRating rating={avgRating} count={reviewCount} />
      ) : null}
    </div>
  );
}
