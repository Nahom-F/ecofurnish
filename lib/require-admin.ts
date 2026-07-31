import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

/**
 * Call at the top of any admin page or server action. Redirects non-admins
 * to sign-in (if logged out) or the homepage (if logged in but not an
 * admin). To make a user an admin, run `pnpm make-admin <email>`.
 */
export async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/sign-in");
  if (session.user.role !== "admin") redirect("/");
  return session;
}
