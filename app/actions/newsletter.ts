"use server";

import { db } from "@/db";
import { newsletterSubscribers } from "@/db/schema";
import { sendNewsletterWelcomeEmail } from "@/lib/email";

export async function subscribeToNewsletter(email: string) {
  if (!email || !email.includes("@")) {
    return { success: false as const, error: "Enter a valid email address." };
  }
  try {
    await db.insert(newsletterSubscribers).values({ email }).onConflictDoNothing();
  } catch (err) {
    console.error("Failed to save newsletter subscriber:", err);
    return { success: false as const, error: "Something went wrong — try again." };
  }
  await sendNewsletterWelcomeEmail(email);
  return { success: true as const };
}
