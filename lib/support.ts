import { db } from "@/db";
import { products } from "@/db/schema";
import { count } from "drizzle-orm";
import { siteConfig } from "@/config/site";

/**
 * Everything the public support bot is allowed to know. Deliberately its
 * own module, not a reuse of lib/insights.ts's computeDailyDigest() — that
 * has real revenue and customer figures meant for the store owner over
 * Telegram, never for an anonymous website visitor. If a fact needs to be
 * business-sensitive, it does not belong in this file.
 */
export interface SupportFacts {
  companyName: string;
  tagline: string;
  productCount: number;
  deliveryEstimate: string;
  paymentSteps: string;
  missionStatement: string;
  links: { terms: string; privacy: string; returns: string; contact: string; orders: string };
}

export async function getSupportFacts(): Promise<SupportFacts> {
  const [{ value: productCount }] = await db.select({ value: count() }).from(products);

  return {
    companyName: siteConfig.name,
    tagline: siteConfig.tagline,
    productCount,

    // PLACEHOLDER — no real delivery estimate exists anywhere on the site
    // yet (checked; About and the homepage only say "fast", no figure).
    // Replace with a real number before treating this as live/accurate.
    deliveryEstimate:
      "Most orders ship within 1-2 business days from Addis Ababa. Delivery typically takes 2-5 business days within Addis Ababa, and 5-10 business days elsewhere in Ethiopia.",

    paymentSteps:
      "Add items to your cart, go to checkout, sign in (or create a free account), enter your shipping details, then pay securely through Chapa — cards, Telebirr, CBE Birr, or bank transfer are all supported. We never see or store your card details.",

    // PLACEHOLDER — drafted from the existing tagline/description in
    // config/site.ts, not a statement the business has actually written.
    // Edit to something real before launch.
    missionStatement:
      "EcoFurnish exists to prove furniture can be both beautiful and genuinely sustainable — every piece is built from recycled materials without compromising on comfort or timeless design.",

    links: {
      terms: `${siteConfig.url}/terms`,
      privacy: `${siteConfig.url}/privacy`,
      returns: `${siteConfig.url}/returns`,
      contact: `${siteConfig.url}/contact`,
      orders: `${siteConfig.url}/account/orders`,
    },
  };
}
