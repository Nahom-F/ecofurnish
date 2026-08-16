import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: { url: process.env.DATABASE_URL! },
  tablesFilter: [
    "products",
    "orders",
    "order_items",
    "newsletter_subscribers",
    "reviews",
    "referral_codes",
    "referral_rewards",
    "referrals",
    "inbound_emails",
  ],
});