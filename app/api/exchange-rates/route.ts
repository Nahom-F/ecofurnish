import { NextResponse } from "next/server";
import { getFreshRates } from "@/lib/fx-rates";

// Polled from the browser by CurrencyProvider (see
// lib/currency-context.tsx) every FX_REFRESH_INTERVAL_MS. getFreshRates
// itself decides whether that's actually worth a network call upstream
// or just returns the still-warm cache — this route is a thin wrapper
// so the client has something to poll.
export async function GET() {
  const { rates, updatedAt } = await getFreshRates();
  return NextResponse.json({ rates, updatedAt });
}
