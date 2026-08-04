import { formatPrice, type Currency } from "@/lib/currency";
import { getEffectivePrice, hasActiveDiscount } from "@/lib/pricing";

interface ProductPriceProps {
  price: string; // matches the DB's numeric-as-string price field
  currency?: Currency;
  discountPercent?: number | null;
  discountReason?: string | null;
}

export default function ProductPrice({
  price,
  currency = "ETB",
  discountPercent,
  discountReason,
}: ProductPriceProps) {
  const discounted = hasActiveDiscount({ discountPercent });

  if (!discounted) {
    return <p className="text-2xl font-bold text-emerald-700">{formatPrice(price, currency)}</p>;
  }

  const effective = getEffectivePrice({ price, discountPercent });
  return (
    <div className="space-y-1">
      <div className="flex flex-wrap items-baseline gap-2">
        <p className="text-2xl font-bold text-emerald-700">{formatPrice(effective, currency)}</p>
        <p className="text-base text-muted-foreground line-through">
          {formatPrice(price, currency)}
        </p>
        <span className="rounded-full bg-emerald-700 px-2 py-0.5 text-xs font-semibold text-white">
          {discountPercent}% off
        </span>
      </div>
      {discountReason && <p className="text-sm text-muted-foreground">{discountReason}</p>}
    </div>
  );
}
