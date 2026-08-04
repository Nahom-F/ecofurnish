"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { getAvailableCredit, getReferralStats } from "@/lib/referrals";

async function requireUserId() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) throw new Error("Not signed in.");
  return session.user.id;
}

export async function fetchReferralStats() {
  const userId = await requireUserId();
  return getReferralStats(userId);
}

/** For the checkout page — just the number it needs, nothing else. */
export async function fetchAvailableCredit() {
  const userId = await requireUserId();
  return getAvailableCredit(userId);
}
