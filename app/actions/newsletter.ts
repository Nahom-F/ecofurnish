"use server";

import { eq } from "drizzle-orm";
import { db } from "@/db";
import { newsletterSubscribers } from "@/db/schema";
import { sendNewsletterWelcomeEmail } from "@/lib/email";

export async function subscribeToNewsletter(email: string) {
  if (!email || !email.includes("@")) {
    return { success: false as const, error: "Enter a valid email address." };
  }
  let isNewSubscriber = false;
  try {
    // .returning() is empty when onConflictDoNothing actually hit a
    // conflict — that's how this tells "brand new" apart from "already
    // subscribed, resubmitted the form" without a separate lookup query.
    const inserted = await db
      .insert(newsletterSubscribers)
      .values({ email })
      .onConflictDoNothing()
      .returning({ id: newsletterSubscribers.id });
    isNewSubscriber = inserted.length > 0;
  } catch (err) {
    console.error("Failed to save newsletter subscriber:", err);
    return { success: false as const, error: "Something went wrong — try again." };
  }
  // Only a genuinely new subscriber gets the welcome email — resubmitting
  // an already-subscribed address used to fire it again every time.
  if (isNewSubscriber) {
    await sendNewsletterWelcomeEmail(email);
  }
  return { success: true as const };
}

/** Used to show the correct initial state for a signed-in visitor — see
 * components/home/Newsletter.tsx. */
export async function isSubscribedToNewsletter(email: string) {
  const [row] = await db
    .select({ id: newsletterSubscribers.id })
    .from(newsletterSubscribers)
    .where(eq(newsletterSubscribers.email, email))
    .limit(1);
  return Boolean(row);
}
