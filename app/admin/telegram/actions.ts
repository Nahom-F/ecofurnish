"use server";

import { and, desc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { telegramAdmins } from "@/db/schema";
import { requireAdmin } from "@/lib/require-admin";
import { sendTelegramMessage } from "@/lib/telegram";

export type TelegramAdminRow = typeof telegramAdmins.$inferSelect;

export async function getTelegramAdmins(): Promise<TelegramAdminRow[]> {
  await requireAdmin();
  return db.select().from(telegramAdmins).orderBy(desc(telegramAdmins.requestedAt));
}

export async function approveTelegramRequest(id: string) {
  await requireAdmin();

  const [row] = await db
    .update(telegramAdmins)
    .set({ status: "approved", reviewedAt: new Date() })
    .where(and(eq(telegramAdmins.id, id), eq(telegramAdmins.status, "pending")))
    .returning();
  if (!row) throw new Error("Request not found, or already reviewed.");

  await sendTelegramMessage(
    "✅ You've been approved to use the EcoFurnish bot. Try /help to see what you can do.",
    row.chatId
  );
  revalidatePath("/admin/telegram");
}

export async function rejectTelegramRequest(id: string) {
  await requireAdmin();

  const [row] = await db
    .update(telegramAdmins)
    .set({ status: "rejected", reviewedAt: new Date() })
    .where(and(eq(telegramAdmins.id, id), eq(telegramAdmins.status, "pending")))
    .returning();
  if (!row) throw new Error("Request not found, or already reviewed.");

  await sendTelegramMessage("Your request to use the EcoFurnish bot wasn't approved.", row.chatId);
  revalidatePath("/admin/telegram");
}

export async function removeTelegramAdmin(id: string) {
  await requireAdmin();

  const [row] = await db
    .update(telegramAdmins)
    .set({ status: "rejected", reviewedAt: new Date() })
    .where(and(eq(telegramAdmins.id, id), eq(telegramAdmins.status, "approved")))
    .returning();
  if (!row) throw new Error("Admin not found, or already removed.");

  await sendTelegramMessage("Your access to the EcoFurnish bot has been removed.", row.chatId);
  revalidatePath("/admin/telegram");
}

/** Adds someone directly, bypassing the request flow entirely — for a
 * chat ID you already have some other way. */
export async function addTelegramAdminManually(chatId: string, label: string) {
  await requireAdmin();

  const trimmedChatId = chatId.trim();
  if (!trimmedChatId) throw new Error("Chat ID is required.");

  const [existing] = await db
    .select()
    .from(telegramAdmins)
    .where(eq(telegramAdmins.chatId, trimmedChatId))
    .limit(1);

  if (existing) {
    await db
      .update(telegramAdmins)
      .set({ status: "approved", label: label.trim() || existing.label, reviewedAt: new Date() })
      .where(eq(telegramAdmins.id, existing.id));
  } else {
    await db.insert(telegramAdmins).values({
      chatId: trimmedChatId,
      label: label.trim() || null,
      status: "approved",
      reviewedAt: new Date(),
    });
  }

  revalidatePath("/admin/telegram");
}
