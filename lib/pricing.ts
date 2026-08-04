// Single source of truth for "what does this product actually cost right
// now" — used both for display (strikethrough original + sale price) and
// for whatever gets snapshotted into the cart/order, so a discount is
// never applied in one place and missed in another.

interface DiscountableProduct {
  price: string;
  discountPercent?: number | null;
}

export function hasActiveDiscount(product: { discountPercent?: number | null }): boolean {
  return !!product.discountPercent && product.discountPercent > 0;
}

/** The price a customer actually pays, as a decimal string (2dp), same
 * shape as every other price value in the app. Falls back to the plain
 * price when there's no active discount. */
export function getEffectivePrice(product: DiscountableProduct): string {
  if (!hasActiveDiscount(product)) return product.price;
  const discounted = parseFloat(product.price) * (1 - product.discountPercent! / 100);
  return discounted.toFixed(2);
}
