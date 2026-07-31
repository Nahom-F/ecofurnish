"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useSession } from "@/lib/auth-client";
import type { Currency } from "@/lib/currency";

interface CurrencyContextValue {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
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

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency must be used within a CurrencyProvider");
  return ctx;
}
