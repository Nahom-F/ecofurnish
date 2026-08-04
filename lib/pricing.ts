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
 * price when there's no active discount.
 *
 * Clamps discountPercent to 0-99 regardless of what's actually stored —
 * this is the one function every price displayed or charged in the app
 * runs through, so it's the right place for a last-line-of-defense
 * against a bad value (e.g. a typo'd 150 in the admin form, or a direct
 * DB edit) ever producing a negative price. */
export function getEffectivePrice(product: DiscountableProduct): string {
  if (!hasActiveDiscount(product)) return product.price;
  const safePercent = Math.min(99, Math.max(0, product.discountPercent!));
  const discounted = parseFloat(product.price) * (1 - safePercent / 100);
  return discounted.toFixed(2);
}
