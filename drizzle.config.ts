import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";

// Load the .env file so Drizzle can read DATABASE_URL
dotenv.config({ path: ".env" });

export default defineConfig({
  dialect: "postgresql",
  schema: "./db/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});