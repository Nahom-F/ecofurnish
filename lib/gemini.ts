import { computeDailyDigest, type DailyDigest } from "@/lib/insights";

async function callGemini(prompt: string): Promise<string | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );

    if (!res.ok) {
      console.error("Gemini API error:", res.status, await res.text());
      return null;
    }

    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    return typeof text === "string" && text.trim() ? text.trim() : null;
  } catch (err) {
    console.error("Failed to call Gemini API:", err);
    return null;
  }
}

// Optional layer: rephrases the already-computed digest numbers into a
// short natural-language summary. Never asked to calculate anything
// itself — every number it sees is handed to it, so it can't invent one.
//
// Uses Gemini's free tier (no card required as of when this was written —
// verify current limits at ai.google.dev, Google has changed free-tier
// quotas before). Set GEMINI_API_KEY to enable this; without it, the
// digest just sends the plain-text version from lib/insights.ts.
//
// Model name below WILL go stale again — Google has already deprecated
// gemini-2.5-flash-lite (this originally used it) in favor of
// gemini-3.5-flash-lite. When it fails, the error surfaces clearly in
// Vercel's function logs as a 404 naming the dead model — check
// ai.google.dev/gemini-api/docs/models for whatever the current
// low-cost/low-latency model is called and swap it in below.
export async function narrateDigest(digest: DailyDigest): Promise<string | null> {
  const prompt = `You write a short, casual daily business summary for the owner of a small furniture store, to be sent over Telegram. Use plain text with simple emoji, no markdown headers. Keep it under 120 words. Only use the numbers given below — never estimate or invent a number that isn't here.

Data:
${JSON.stringify(digest, null, 2)}
`;

  return callGemini(prompt);
}

// Free-form chat for the Telegram bot — anything the owner asks that isn't
// one of the fixed /commands falls through to here. Grounded in the same
// real digest data narrateDigest uses, so it can answer "how's revenue
// this week" conversationally without ever inventing a number that isn't
// actually in the store's data.
export async function chatReply(userMessage: string): Promise<string | null> {
  const digest = await computeDailyDigest();

  const prompt = `You are a helpful assistant for the owner of EcoFurnish, a small sustainable-furniture store, chatting over Telegram. Answer their message conversationally and briefly — a few sentences, plain text, no markdown headers. You only know what's in the store data below; if answering needs a number that isn't there, say plainly that you don't have that figure rather than guessing.

Store data:
${JSON.stringify(digest, null, 2)}

Owner's message: "${userMessage}"`;

  return callGemini(prompt);
}
