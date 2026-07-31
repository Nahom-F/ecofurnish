"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { sendPasswordChangedEmail } from "@/lib/email";

export async function notifyPasswordChanged() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return;
  await sendPasswordChangedEmail(session.user.email, session.user.name ?? "there");
}
