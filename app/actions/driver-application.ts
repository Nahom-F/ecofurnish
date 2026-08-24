"use server";

import { db } from "@/db";
import { driverApplications } from "@/db/schema";
import { sendDriverApplicationReceivedEmail } from "@/lib/email";

export const VEHICLE_TYPES = ["Bicycle", "Motorcycle", "Car", "On Foot"] as const;

export interface DriverApplicationInput {
  fullName: string;
  phone: string;
  email: string;
  city: string;
  vehicleType: string;
  notes: string;
}

// Captcha is verified client-side first via the existing verifyCaptcha
// action (app/actions/captcha.ts) — same two-step flow as sign-up,
// sign-in, and forgot-password — so this doesn't re-check a token itself.
export async function submitDriverApplication(input: DriverApplicationInput) {
  const fullName = input.fullName.trim();
  const phone = input.phone.trim();
  const city = input.city.trim();
  const email = input.email.trim();

  if (!fullName || !phone || !city) {
    return { success: false as const, error: "Please fill in your name, phone, and city." };
  }
  if (!(VEHICLE_TYPES as readonly string[]).includes(input.vehicleType)) {
    return { success: false as const, error: "Please select a vehicle type." };
  }

  await db.insert(driverApplications).values({
    fullName,
    phone,
    email: email || null,
    city,
    vehicleType: input.vehicleType,
    notes: input.notes.trim() || null,
  });

  // Email is optional on this form (phone is the required contact
  // method — see driverApplications.email in db/schema.ts), so this is
  // best-effort: nothing to send a receipt to if they left it blank.
  if (email) {
    await sendDriverApplicationReceivedEmail(email, fullName);
  }

  return { success: true as const };
}
