import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

// Better Auth appends the failing error code as ?error=..., lowercase and
// underscored (e.g. unable_to_get_user_info) — normalized here since the
// same error's `code` field elsewhere in the app is uppercase
// (FAILED_TO_GET_USER_INFO). Both spellings map to the same underlying
// thing, so both need to match.
const SESSION_MISMATCH_CODES = new Set([
  "unable_to_get_user_info",
  "failed_to_get_user_info",
]);

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const code = error?.toLowerCase();
  const isSessionMismatch = code ? SESSION_MISMATCH_CODES.has(code) : false;

  return (
    <div className="container mx-auto flex max-w-lg flex-col items-center px-4 py-20 text-center">
      <AlertTriangle className="h-10 w-10 text-destructive" />
      <h1 className="mt-4 text-2xl font-bold">Something went wrong</h1>

      {isSessionMismatch ? (
        <p className="mt-3 text-muted-foreground">
          This kind of link (deleting your account, resetting your password) only works in
          the same browser you were signed into when you requested it — and only while
          you&apos;re still signed in there. If you opened this from an email app, it may have
          launched a different browser than the one you were using. Sign in again on the
          device/browser you started from, then request the email again.
        </p>
      ) : (
        <p className="mt-3 text-muted-foreground">
          That link didn&apos;t go through{error ? ` (${error})` : ""}. It may have expired, or
          already been used.
        </p>
      )}

      <div className="mt-6 flex gap-3">
        <Button render={<Link href="/sign-in" />}>Sign in</Button>
        <Button variant="outline" render={<Link href="/" />}>
          Go home
        </Button>
      </div>
    </div>
  );
}
