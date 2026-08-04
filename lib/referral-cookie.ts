// Kept in its own file (no DB imports) because middleware.ts runs on the
// Edge runtime and can't import lib/referrals.ts, which pulls in the
// Postgres pool via db/index.ts.
export const REFERRAL_COOKIE = "ef_ref";
export const REFERRAL_COOKIE_MAX_AGE_DAYS = 30;
