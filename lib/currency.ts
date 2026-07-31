export type Currency = "ETB" | "USD" | "GBP";

// Simulated exchange rates — swap for a live FX API when you're ready.
// Base currency is ETB, matching how prices are stored in the database.
export const EXCHANGE_RATES: Record<Currency, number> = {
  ETB: 1,
  USD: 0.017,
  GBP: 0.013,
};

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  ETB: "Br",
  USD: "$",
  GBP: "£",
};

export const CURRENCIES: Currency[] = ["ETB", "USD", "GBP"];

/** Converts a base-ETB price (as stored) into the target display currency. */
export function formatPrice(priceEtb: string | number, currency: Currency): string {
  const numeric = typeof priceEtb === "string" ? parseFloat(priceEtb) : priceEtb;
  const converted = numeric * EXCHANGE_RATES[currency];
  return `${CURRENCY_SYMBOLS[currency]}${converted.toFixed(2)}`;
}
