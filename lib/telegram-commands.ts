import { asc } from "drizzle-orm";
import { db } from "@/db";
import { products } from "@/db/schema";
import { computeDailyDigest, formatDigestAsText } from "@/lib/insights";
import { narrateDigest } from "@/lib/gemini";

/** "/stock" — every product's current stock, lowest first (most actionable first). */
export async function buildStockReply(): Promise<string> {
  const rows = await db
    .select({ name: products.name, stock: products.stock })
    .from(products)
    .orderBy(asc(products.stock));

  if (rows.length === 0) return "No products found.";

  const lines = rows.map((p) => {
    const dot = p.stock <= 5 ? "🔴" : p.stock <= 15 ? "🟡" : "🟢";
    return `${dot} ${p.name} — ${p.stock} left`;
  });

  return [`<b>📦 Stock levels</b>`, ...lines].join("\n");
}

/** "/digest" — the exact same content the 7am cron sends, on demand. */
export async function buildDigestReply(): Promise<string> {
  const digest = await computeDailyDigest();
  const narrated = await narrateDigest(digest);
  return narrated ?? formatDigestAsText(digest);
}

export function buildHelpReply(): string {
  return [
    `<b>EcoFurnish bot</b>`,
    `/stock — current stock for every product`,
    `/digest — today's revenue, orders, and top seller (same as the 7am summary)`,
    `/help — this message`,
  ].join("\n");
}

/** Routes an incoming message's text to the right reply. Never throws —
 * any lookup failure falls back to a plain-text error so the bot always
 * answers something rather than going silent. */
export async function handleCommand(text: string): Promise<string> {
  const command = text.trim().toLowerCase().split(/\s+/)[0];

  try {
    switch (command) {
      case "/stock":
      case "/inventory":
        return await buildStockReply();
      case "/digest":
      case "/summary":
        return await buildDigestReply();
      case "/start":
      case "/help":
        return buildHelpReply();
      default:
        return `Didn't recognize that one.\n\n${buildHelpReply()}`;
    }
  } catch (err) {
    console.error("Telegram command failed:", command, err);
    return "Something went wrong pulling that up — check the Vercel function logs for details.";
  }
}
