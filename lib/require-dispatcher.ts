import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

/**
 * Call at the top of any dispatcher page or server action. Admins pass
 * too — dispatcher is a subset of what admin can already do, not a
 * separate silo, so there's no reason to lock admins out of the
 * dispatcher tools. Redirects non-dispatchers/non-admins to sign-in (if
 * logged out) or the homepage (if logged in but neither role). To make a
 * user a dispatcher, run `pnpm make-admin <email> dispatcher` (see
 * db/make-admin.ts).
 */
export async function requireDispatcher() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/sign-in");
  if (session.user.role !== "dispatcher" && session.user.role !== "admin") redirect("/");
  return session;
}
