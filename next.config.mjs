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
    return [
      {
        // Applies to every route, including API routes — these are all
        // static per-response headers (no per-request value needed), so
        // they belong here rather than in middleware.ts. The one exception
        // is Content-Security-Policy: it needs a fresh nonce per request to
        // trust Next's own inline hydration scripts without 'unsafe-inline',
        // so that one is set in middleware.ts instead.
        source: "/(.*)",
        headers: [
          // Legacy fallback for browsers that don't honor CSP's
          // frame-ancestors (set alongside frame-ancestors 'self' in
          // middleware.ts) — stops the site being framed by another origin
          // for clickjacking.
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          // Stops browsers from guessing ("sniffing") a response's MIME
          // type from its content and running it as something more
          // dangerous than what the server declared (e.g. treating an
          // uploaded image as executable script).
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Sends the full URL as a referrer to same-origin requests, but
          // only the origin (no path/query) cross-origin — avoids leaking
          // things like order IDs or search terms in checkout/account URLs
          // to third parties (Unsplash, OSM tiles, etc.) while keeping
          // useful analytics referrer data.
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // 1 year + subdomains + preload: the full requirements for
          // submitting to the HSTS preload list (https://hstspreload.org),
          // so browsers refuse to ever load this site over plain HTTP,
          // even on someone's very first visit. Submitting is optional and
          // manual — this header alone already forces HTTPS for a year at
          // a time regardless of submission.
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains; preload",
          },
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