import { formatPrice, type Currency } from "@/lib/currency";

interface ProductPriceProps {
  price: string; // matches the DB's numeric-as-string price field
  currency?: Currency;
}

export default function ProductPrice({ price, currency = "ETB" }: ProductPriceProps) {
  return (
    <p className="text-2xl font-bold text-emerald-700">{formatPrice(price, currency)}</p>
  );
}
