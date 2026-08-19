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