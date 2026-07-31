import { betterAuth } from "better-auth";
import { Pool } from "pg";
import {
  sendVerificationEmail,
  sendDeleteAccountEmail,
  sendResetPasswordEmail,
  sendPasswordChangedEmail,
} from "@/lib/email";

// Set up the database connection pool using your environment variable
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const auth = betterAuth({
  // FIX: Pass the pool directly instead of wrapping it in an object
  database: pool, 
  
  // This tells Better Auth about your custom admin column
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "user",
      },
      preferredCurrency: {
        type: "string",
        defaultValue: "ETB",
      },
    },
    // Sends a "confirm deletion" email before an account is actually
    // removed, rather than deleting immediately on request.
    deleteUser: {
      enabled: true,
      sendDeleteAccountVerification: async ({ user, url }) => {
        await sendDeleteAccountEmail(user.email, url);
      },
    },
  },
  // You can add authentication providers here later (like Google, GitHub, or Email/Password)
  emailAndPassword: {
    enabled: true,
    // Blocks sign-in until the email link below is clicked.
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }) => {
      await sendResetPasswordEmail(user.email, url);
    },
    // Fires server-side right after a successful token-based reset — no
    // session to read yet at that point (this device may not be signed
    // in), so this reuses the same "password changed" notice the account
    // settings page sends after an authenticated change, just triggered
    // from the token flow instead of a session lookup.
    onPasswordReset: async ({ user }) => {
      await sendPasswordChangedEmail(user.email, user.name ?? "there");
    },
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      await sendVerificationEmail(user.email, url);
    },
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
  },
  // Better Auth rate-limits auth routes by default in production, but its
  // default storage is in-memory — on a serverless host (Vercel) each
  // invocation can be a fresh instance, so that in-memory counter doesn't
  // reliably persist between requests and the protection is much weaker
  // than it looks. Pointing it at the database instead makes it durable.
  // Run `pnpm auth:migrate` once after this change to create the
  // `rateLimit` table.
  rateLimit: {
    storage: "database",
    customRules: {
      // Brute-force login attempts and signup spam are the routes worth
      // limiting tighter than the global default.
      "/sign-in/email": { window: 60, max: 5 },
      "/sign-up/email": { window: 60, max: 5 },
      // Same reasoning — without this, someone could spam reset emails at
      // an arbitrary inbox, or brute-force guess reset tokens.
      "/forget-password": { window: 60, max: 5 },
      "/reset-password": { window: 60, max: 5 },
    },
  },
});
