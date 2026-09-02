import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { REFERRAL_COOKIE, REFERRAL_COOKIE_MAX_AGE_DAYS } from "@/lib/referral-cookie";

// Every external origin the app actually loads something from client-side.
// Keep this in sync with reality rather than widening it "just in case" —
// each entry here is a claimed exception to the same-origin default, so it
// should map to a real fetch/script/img/frame somewhere in the app:
//   - challenges.cloudflare.com   Turnstile widget script + its iframe (components/turnstile-widget.tsx)
//   - images.unsplash.com         seed/demo product photos (next.config.mjs remotePatterns)
//   - *.public.blob.vercel-storage.com   uploaded product images (Vercel Blob)
//   - lh3.googleusercontent.com, avatars.githubusercontent.com, cdn.discordapp.com
//       social sign-in avatars (lib/social-providers.ts / avatar-display.tsx)
//   - *.tile.openstreetmap.org    Leaflet map tiles (components/dispatcher/DeliveryMapPicker.tsx)
//   - vitals.vercel-insights.com  @vercel/analytics beacon (app/layout.tsx)
// Chapa's checkout is a full top-level redirect (window.location.href in
// app/checkout/page.tsx), not a fetch/frame/form-post, so it needs no entry
// here — CSP doesn't govern plain navigation.
const CSP_DIRECTIVES = (nonce: string) =>
  [
    `default-src 'self'`,
    `script-src 'self' 'nonce-${nonce}' https://challenges.cloudflare.com`,
    // Tailwind, Radix/shadcn, and Leaflet all set the `style` attribute
    // straight from JS, and there's no realistic nonce path for that — so
    // style-src keeps 'unsafe-inline'. Its blast radius is far smaller than
    // script-src's (CSS injection can't execute arbitrary JS), which is why
    // this relaxation is the accepted trade-off even in strict CSPs.
    `style-src 'self' 'unsafe-inline'`,
    `img-src 'self' data: blob: https://images.unsplash.com https://*.public.blob.vercel-storage.com https://lh3.googleusercontent.com https://avatars.githubusercontent.com https://cdn.discordapp.com https://*.tile.openstreetmap.org`,
    `font-src 'self' data:`,
    `connect-src 'self' https://challenges.cloudflare.com https://vitals.vercel-insights.com`,
    `frame-src https://challenges.cloudflare.com`,
    `object-src 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `frame-ancestors 'self'`,
    `upgrade-insecure-requests`,
  ].join("; ");

export function middleware(request: NextRequest) {
  // A fresh nonce per request lets the browser trust Next.js's own inline
  // hydration/streaming scripts — via the `x-nonce` request-header
  // convention Next reads automatically, see
  // https://nextjs.org/docs/app/guides/content-security-policy — without
  // falling back to 'unsafe-inline' in script-src, which would let *any*
  // inline script run, including one an attacker injected.
  const nonce = btoa(crypto.randomUUID());
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("Content-Security-Policy", CSP_DIRECTIVES(nonce));

  // Don't clobber a code that's already been captured this visit — the
  // first referral link someone actually clicked is the one that should
  // get credit, not whatever ?ref= happens to be on a later page they land on.
  const ref = request.nextUrl.searchParams.get("ref");
  if (ref && !request.cookies.get(REFERRAL_COOKIE)) {
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
