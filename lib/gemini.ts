import type { DailyDigest } from "@/lib/insights";

// Optional layer: rephrases the already-computed digest numbers into a
// short natural-language summary. Never asked to calculate anything
// itself — every number it sees is handed to it, so it can't invent one.
//
// Uses Gemini's free tier (no card required as of when this was written —
// verify current limits at ai.google.dev, Google has changed free-tier
// quotas before). Set GEMINI_API_KEY to enable this; without it, the
// digest just sends the plain-text version from lib/insights.ts.
export async function narrateDigest(digest: DailyDigest): Promise<string | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  const prompt = `You write a short, casual daily business summary for the owner of a small furniture store, to be sent over Telegram. Use plain text with simple emoji, no markdown headers. Keep it under 120 words. Only use the numbers given below — never estimate or invent a number that isn't here.

Data:
${JSON.stringify(digest, null, 2)}
`;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`,
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
