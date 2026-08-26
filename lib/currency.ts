export type Currency = "ETB" | "USD" | "GBP";

// Starting point / fallback only. lib/fx-rates.ts refreshes these in
// place from a live FX API (see that file for how), so by the time a
// page actually renders a converted price this object usually already
// holds real rates — this literal is just what's used before the first
// refresh completes, or if the live fetch is ever unavailable.
// Base currency is ETB, matching how prices are stored in the database.
export const EXCHANGE_RATES: Record<Currency, number> = {
  ETB: 1,
  USD: 0.017,
  GBP: 0.013,
};

// How often we check for fresh rates — client polling (currency-context)
// and the server-side cache TTL (fx-rates.ts) both use this so the two
// stay in step. Free FX sources typically only publish new numbers once
// a day, but checking this often means we pick up a real change within
// minutes of it landing, and it's cheap since a check is a no-op unless
// the cache has actually gone stale.
export const FX_REFRESH_INTERVAL_MS = 5 * 60 * 1000;

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  ETB: "Br",
  USD: "$",
  GBP: "£",
};

export const CURRENCIES: Currency[] = ["ETB", "USD", "GBP"];

/**
 * Converts a base-ETB price (as stored) into the target display currency.
 * Uses the live-refreshed EXCHANGE_RATES by default — pass `rates`
 * explicitly only where you've already awaited a fresh copy yourself
 * (see getFreshRates in lib/fx-rates.ts) and want to guarantee this
 * particular call used it, rather than whatever the shared object
 * happened to hold at call time.
 */
export function formatPrice(
  priceEtb: string | number,
  currency: Currency,
  rates: Record<Currency, number> = EXCHANGE_RATES
): string {
  const numeric = typeof priceEtb === "string" ? parseFloat(priceEtb) : priceEtb;
  const converted = numeric * rates[currency];
  return `${CURRENCY_SYMBOLS[currency]}${converted.toFixed(2)}`;
}
