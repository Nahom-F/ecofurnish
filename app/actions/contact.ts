"use server";

import { sendContactMessage } from "@/lib/email";

export async function submitContactForm(input: {
  name: string;
  email: string;
  message: string;
}) {
  if (!input.name || !input.email || !input.message) {
    return { success: false as const, error: "Please fill in every field." };
  }
  return sendContactMessage(input);
}
