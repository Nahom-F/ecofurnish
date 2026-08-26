"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useSession } from "@/lib/auth-client";
import { EXCHANGE_RATES, FX_REFRESH_INTERVAL_MS, type Currency } from "@/lib/currency";

interface CurrencyContextValue {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  /** When EXCHANGE_RATES was last confirmed fresh from a live source, or null before the first successful check. */
  ratesUpdatedAt: number | null;
}

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession();

  const [currency, setCurrencyState] = useState<Currency>("ETB");
  // Tracks whether the person has picked a currency themselves this
  // session, so we stop overwriting their choice once they have — same
  // "adopt once, then don't clobber" behavior the catalog dropdown had
  // before this became shared state.
  const [touched, setTouched] = useState(false);

  // Adopt the signed-in user's saved currency once we know it — but only
  // until they manually pick one themselves. Session data resolves
  // asynchronously after mount, so this can't just be the initial state.
  useEffect(() => {
    const preferred = session?.user?.preferredCurrency as Currency | undefined;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (preferred && !touched) setCurrencyState(preferred);
  }, [session, touched]);

  const setCurrency = (next: Currency) => {
    setCurrencyState(next);
    setTouched(true);
  };

  const [ratesUpdatedAt, setRatesUpdatedAt] = useState<number | null>(null);

  // Poll the live rates on mount and every FX_REFRESH_INTERVAL_MS after
  // that. EXCHANGE_RATES is mutated in place (not replaced) so every
  // formatPrice() call anywhere in the client bundle picks up the new
  // numbers on its next render without needing rates threaded through
  // as a prop — only ratesUpdatedAt needs to live in state, purely to
  // give components like ExchangeRateNote a reason to re-render.
  useEffect(() => {
    let cancelled = false;

    async function poll() {
      try {
        const res = await fetch("/api/exchange-rates");
        if (!res.ok || cancelled) return;
        const data = await res.json();
        if (cancelled || !data?.rates) return;
        Object.assign(EXCHANGE_RATES, data.rates);
        setRatesUpdatedAt(data.updatedAt ?? Date.now());
      } catch {
        // Offline, or the route hiccupped — keep showing whatever rates
        // we already had rather than breaking price display over it.
      }
    }

    poll();
    const id = setInterval(poll, FX_REFRESH_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, ratesUpdatedAt }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency must be used within a CurrencyProvider");
  return ctx;
}
