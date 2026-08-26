import { EXCHANGE_RATES, FX_REFRESH_INTERVAL_MS, type Currency } from "./currency";

/**
 * Free, keyless exchange rates, refreshed lazily on whatever cadence
 * FX_REFRESH_INTERVAL_MS says. There's no continuous background job —
 * on Vercel a serverless function can cold-start between any two
 * requests, so a setInterval() wouldn't reliably survive between them
 * anyway. Instead this just checks "is our cached copy older than the
 * refresh interval?" on each call, and only does the network round trip
 * when the answer is yes. In practice that means the first request
 * after the cache goes stale pays for the fetch and everyone after it
 * for the next few minutes gets the cached value back instantly.
 *
 * Primary source is open.er-api.com (exchangerate-api.com's free,
 * unlimited, no-key tier). If that's unreachable we try the
 * fawazahmed0/currency-api mirror on jsdelivr as a second opinion
 * before giving up and keeping whatever we last had. Both publish new
 * numbers roughly once a day rather than tick-by-tick — there's no
 * free source that does sub-daily FX — so "refreshed every 5 minutes"
 * here means we *check* that often, not that the rate itself changes
 * that often.
 */

interface RatesResult {
  rates: Record<Currency, number>;
  /** When we last successfully talked to a live source, or null if we've never managed to. */
  updatedAt: number | null;
}

let lastGoodRates: Record<Currency, number> = { ...EXCHANGE_RATES };
let lastFetchedAt: number | null = null;
let inFlight: Promise<void> | null = null;

function extractRates(candidate: unknown): Record<Currency, number> | null {
  const rates = (candidate as { rates?: Record<string, unknown> } | null)?.rates;
  const usd = rates?.USD;
  const gbp = rates?.GBP;
  if (typeof usd !== "number" || typeof gbp !== "number") return null;
  return { ETB: 1, USD: usd, GBP: gbp };
}

async function fetchFromOpenErApi(): Promise<Record<Currency, number> | null> {
  const res = await fetch("https://open.er-api.com/v6/latest/ETB", { cache: "no-store" });
  if (!res.ok) return null;
  return extractRates(await res.json());
}

async function fetchFromJsdelivrMirror(): Promise<Record<Currency, number> | null> {
  const res = await fetch(
    "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/etb.json",
    { cache: "no-store" }
  );
  if (!res.ok) return null;
  const data = (await res.json()) as { etb?: Record<string, number> };
  const usd = data.etb?.usd;
  const gbp = data.etb?.gbp;
  if (typeof usd !== "number" || typeof gbp !== "number") return null;
  return { ETB: 1, USD: usd, GBP: gbp };
}

async function refreshRates(): Promise<void> {
  try {
    const fresh = (await fetchFromOpenErApi()) ?? (await fetchFromJsdelivrMirror());
    if (!fresh) throw new Error("both FX sources returned an unexpected shape");
    lastGoodRates = fresh;
    Object.assign(EXCHANGE_RATES, fresh);
    lastFetchedAt = Date.now();
  } catch (err) {
    // A stale rate beats a broken price tag — keep serving whatever we
    // last had (or the static fallback in lib/currency.ts if we've
    // never had a successful fetch) and try again next time someone asks.
    console.error("[fx-rates] refresh failed, keeping last known rates:", err);
  }
}

/**
 * Returns the current best-known rates, refreshing first if the cache
 * has gone stale. Safe to call on every request — it's a cheap
 * timestamp check in the common case, and concurrent callers during an
 * actual refresh share a single in-flight fetch instead of each firing
 * their own.
 */
export async function getFreshRates(): Promise<RatesResult> {
  const isStale = !lastFetchedAt || Date.now() - lastFetchedAt > FX_REFRESH_INTERVAL_MS;
  if (isStale) {
    inFlight ??= refreshRates().finally(() => {
      inFlight = null;
    });
    await inFlight;
  }
  return { rates: lastGoodRates, updatedAt: lastFetchedAt };
}
