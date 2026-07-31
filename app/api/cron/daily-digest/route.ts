import { NextRequest, NextResponse } from "next/server";
import { computeDailyDigest, formatDigestAsText } from "@/lib/insights";
import { narrateDigest } from "@/lib/gemini";
import { sendTelegramMessage } from "@/lib/telegram";

// Vercel invokes cron routes with GET and an
// `Authorization: Bearer ${CRON_SECRET}` header — CRON_SECRET is set
// automatically in your Vercel project's env vars, nothing to configure.
// Checked only in production so you can hit this manually while testing
// locally (e.g. visiting it in a browser) without needing the header.
export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const digest = await computeDailyDigest();

  // Falls back to the plain-text version whenever GEMINI_API_KEY isn't
  // set, or if the API call fails for any reason — the digest still goes
  // out either way, just without the rephrasing.
  const narrated = await narrateDigest(digest);
  const message = narrated ?? formatDigestAsText(digest);

  const result = await sendTelegramMessage(message);

  return NextResponse.json({ sent: result.success, digest });
}
