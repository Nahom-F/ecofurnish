"use server";

import { and, desc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { driverApplications } from "@/db/schema";
import { requireDispatcher } from "@/lib/require-dispatcher";
import { sendDriverApplicationDecisionEmail } from "@/lib/email";

export type DriverApplication = typeof driverApplications.$inferSelect;

export async function getDriverApplications() {
  await requireDispatcher();
  return db.select().from(driverApplications).orderBy(desc(driverApplications.createdAt));
}

export async function approveDriverApplication(id: string, reviewNote: string) {
  await requireDispatcher();

  // Atomic guard: only actually updates a row that's still "pending",
  // so two dispatchers reviewing the same application at once can't
  // both succeed (or send duplicate decision emails) — same pattern as
  // promoteToDispatcher/removeDispatcherRole in app/admin/actions.ts.
  const [application] = await db
    .update(driverApplications)
    .set({ status: "approved", reviewedAt: new Date(), reviewNote: reviewNote.trim() || null })
    .where(and(eq(driverApplications.id, id), eq(driverApplications.status, "pending")))
    .returning();

  if (!application) throw new Error("Application not found, or already reviewed.");

  if (application.email) {
    await sendDriverApplicationDecisionEmail(application.email, application.fullName, true);
  }
  revalidatePath("/dispatcher");
}

export async function rejectDriverApplication(id: string, reviewNote: string) {
  await requireDispatcher();

  const [application] = await db
    .update(driverApplications)
    .set({ status: "rejected", reviewedAt: new Date(), reviewNote: reviewNote.trim() || null })
    .where(and(eq(driverApplications.id, id), eq(driverApplications.status, "pending")))
    .returning();

  if (!application) throw new Error("Application not found, or already reviewed.");

  if (application.email) {
    await sendDriverApplicationDecisionEmail(application.email, application.fullName, false);
  }
  revalidatePath("/dispatcher");
}
