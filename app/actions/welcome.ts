"use server";

import { sendWelcomeEmail } from "@/lib/email";

export async function notifySignedUp(email: string, name: string) {
  await sendWelcomeEmail(email, name);
}
