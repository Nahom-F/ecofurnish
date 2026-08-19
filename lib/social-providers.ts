// Shared between lib/auth.ts (server) and the sign-in/sign-up pages (which
// use this at request time, server-side, to decide which "Continue with
// ___" buttons to render). Keep this list in sync with the provider block
// in lib/auth.ts — same env vars, same ids.
export const SOCIAL_PROVIDERS = [
  { id: "google", name: "Google" },
  { id: "microsoft", name: "Microsoft" },
  { id: "github", name: "GitHub" },
  { id: "discord", name: "Discord" },
] as const;

export type SocialProviderId = (typeof SOCIAL_PROVIDERS)[number]["id"];

const ENV_KEYS: Record<SocialProviderId, [string, string]> = {
  google: ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET"],
  microsoft: ["MICROSOFT_CLIENT_ID", "MICROSOFT_CLIENT_SECRET"],
  github: ["GITHUB_CLIENT_ID", "GITHUB_CLIENT_SECRET"],
  discord: ["DISCORD_CLIENT_ID", "DISCORD_CLIENT_SECRET"],
};

/** Server-only — reads env vars, so don't call this from a "use client" file. */
export function getEnabledSocialProviders(): SocialProviderId[] {
  return SOCIAL_PROVIDERS.map((p) => p.id).filter((id) => {
    const [clientIdKey, clientSecretKey] = ENV_KEYS[id];
    return Boolean(process.env[clientIdKey] && process.env[clientSecretKey]);
  });
}
