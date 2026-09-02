/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      // Next.js caps Server Action request bodies at 1MB by default. Product
      // image uploads go through a Server Action (app/admin/actions.ts) and
      // the app's own check allows images up to 4MB (MAX_IMAGE_BYTES) — so
      // without this, any photo over ~1MB was rejected by Next.js itself,
      // before uploadProductImage ever ran. That rejection doesn't reach the
      // browser as a normal error either, which is why it looked like the
      // upload was just hanging rather than failing outright.
      bodySizeLimit: "5mb",
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        // Vercel Blob — each store gets its own subdomain, hence the wildcard.
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
        pathname: "/**",
      },
      // Social sign-in avatars — session.user.image comes back as a real
      // photo URL from these providers (see components/avatar-display.tsx's
      // "legacy support" branch), and Next's Image component 400s on any
      // remote host not explicitly listed here. Microsoft/Entra is
      // deliberately not included: it doesn't hand back a plain public
      // image URL the way these three do (photo retrieval goes through a
      // separate authenticated Graph API call), so there's nothing at a
      // fixed hostname to allow here — Microsoft sign-ins fall back to the
      // initials avatar instead, which isn't a bug.
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "cdn.discordapp.com",
        pathname: "/**",
      },
    ],
  },
  async headers() {
    // Built from what the app actually loads client-side (checked every
    // "use client" component and lib/*.ts caller): Turnstile is the only
    // cross-origin script/frame, Leaflet's OSM tiles are the only extra
    // image host beyond the ones already allowed for next/image, and every
    // other external API call (Chapa, Gemini/Groq, Telegram, geocoding,
    // FX rates) happens from Server Actions/route handlers, never the
    // browser, so none of those hosts belong in a browser-facing CSP.
    //
    // script-src/style-src keep 'unsafe-inline': Next's App Router streams
    // RSC payloads into the page via inline <script> tags, and Leaflet's
    // marker (DeliveryMapPicker) sets an inline style attribute — blocking
    // those would break hydration and the dispatcher map. A stricter,
    // nonce-based CSP (per Next's own CSP guide) can replace this later,
    // but it needs middleware changes and real testing against Turnstile's
    // dynamically-injected script before it ships — not swapped in blind.
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https://images.unsplash.com https://*.public.blob.vercel-storage.com https://lh3.googleusercontent.com https://avatars.githubusercontent.com https://cdn.discordapp.com https://*.tile.openstreetmap.org",
      "font-src 'self' data:",
      "connect-src 'self' https://challenges.cloudflare.com",
      "frame-src https://challenges.cloudflare.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'self'",
      "upgrade-insecure-requests",
    ].join("; ");

    return [
      {
        // Applies to every route, including API routes — none of these
        // headers are safe to skip just because a request isn't a page.
        source: "/(.*)",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          // Belt-and-suspenders with frame-ancestors above: XFO is what
          // the Observatory/older browsers actually check for, so it
          // stays even though frame-ancestors is the modern equivalent.
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
      {
        // Never let a CDN or browser cache the service worker file itself —
        // that's how updates get stuck and old cached versions calcify.
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Service-Worker-Allowed", value: "/" },
        ],
      },
      {
        source: "/manifest.webmanifest",
        headers: [{ key: "Cache-Control", value: "public, max-age=3600" }],
      },
    ];
  },
};

export default nextConfig;