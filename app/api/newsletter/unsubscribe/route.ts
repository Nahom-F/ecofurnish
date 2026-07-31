import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { newsletterSubscribers } from "@/db/schema";

// Handles both a normal link click (GET) and mail-client one-click
// unsubscribe (POST, per RFC 8058 / the List-Unsubscribe-Post header) —
// Gmail and Yahoo have required this for bulk senders since their 2024
// policy changes.
async function unsubscribe(email: string | null) {
  if (!email) return NextResponse.json({ error: "Missing email" }, { status: 400 });
  await db.delete(newsletterSubscribers).where(eq(newsletterSubscribers.email, email));
  return { email };
}

export async function GET(request: NextRequest) {
  const email = request.nextUrl.searchParams.get("email");
  const result = await unsubscribe(email);
  if (result instanceof NextResponse) return result;

  return new NextResponse(
    `<!DOCTYPE html><html><body style="font-family:sans-serif;max-width:480px;margin:80px auto;text-align:center;">
      <h2>You're unsubscribed</h2>
      <p style="color:#666;">${result.email} won't receive further EcoFurnish newsletter emails.</p>
    </body></html>`,
    { headers: { "Content-Type": "text/html" } }
  );
}

export async function POST(request: NextRequest) {
  const email = request.nextUrl.searchParams.get("email");
  const result = await unsubscribe(email);
  if (result instanceof NextResponse) return result;
  return NextResponse.json({ success: true });
}
