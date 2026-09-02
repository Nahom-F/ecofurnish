import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { REFERRAL_COOKIE, REFERRAL_COOKIE_MAX_AGE_DAYS } from "@/lib/referral-cookie";

export function middleware(request: NextRequest) {
  const ref = request.nextUrl.searchParams.get("ref");
  if (!ref) return NextResponse.next();

  const response = NextResponse.next();
  // Don't clobber a code that's already been captured this visit — the
  // first referral link someone actually clicked is the one that should
  // get credit, not whatever ?ref= happens to be on a later page they land on.
  if (!request.cookies.get(REFERRAL_COOKIE)) {
    response.cookies.set(REFERRAL_COOKIE, ref, {
      maxAge: REFERRAL_COOKIE_MAX_AGE_DAYS * 24 * 60 * 60,
      path: "/",
      sameSite: "lax",
    });
  }
  return response;
}

export const config = {
  // Skip static assets, the service worker, and API routes — no need to
  // run this on every single request.
  matcher: "/((?!_next/static|_next/image|api|sw\\.js|favicon\\.ico|manifest\\.webmanifest).*)",
};
