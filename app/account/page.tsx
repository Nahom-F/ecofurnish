import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Gift, PackageSearch, ShieldCheck } from "lucide-react";
import { auth } from "@/lib/auth";
import { ProfileForm } from "@/components/account/profile-form";
import { PasswordForm } from "@/components/account/password-form";
import { AvatarPicker } from "@/components/account/avatar-picker";
import { CurrencyForm } from "@/components/account/currency-form";
import { DeleteAccountButton } from "@/components/account/delete-account-button";
import type { Currency } from "@/lib/currency";

export default async function AccountPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/sign-in");

  const isAdmin = session.user.role === "admin";

  return (
    <div className="container mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-8 text-3xl font-extrabold tracking-tight">Your Account</h1>

      <div className="mb-8 flex gap-3">
        <Link
          href="/account/orders"
          className="flex flex-1 items-center gap-2 rounded-lg border border-border/60 p-4 text-sm font-medium transition-colors hover:bg-muted/30"
        >
          <PackageSearch className="h-4 w-4 text-primary" />
          Order history
        </Link>
        <Link
          href="/account/referrals"
          className="flex flex-1 items-center gap-2 rounded-lg border border-border/60 p-4 text-sm font-medium transition-colors hover:bg-muted/30"
        >
          <Gift className="h-4 w-4 text-primary" />
          Invite friends
        </Link>
        {isAdmin && (
          <Link
            href="/admin"
            className="flex flex-1 items-center gap-2 rounded-lg border border-border/60 p-4 text-sm font-medium transition-colors hover:bg-muted/30"
          >
            <ShieldCheck className="h-4 w-4 text-primary" />
            Admin dashboard
          </Link>
        )}
      </div>

      <div className="space-y-8">
        <section className="rounded-lg border border-border/60 p-6">
          <h2 className="font-semibold">Profile</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {session.user.email}
          </p>
          <div className="mt-4">
            <AvatarPicker initialImage={session.user.image} name={session.user.name ?? ""} />
          </div>
          <div className="mt-6">
            <ProfileForm initialName={session.user.name ?? ""} />
          </div>
        </section>

        <section className="rounded-lg border border-border/60 p-6">
          <h2 className="font-semibold">Currency</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Used as your default when browsing the catalog.
          </p>
          <div className="mt-4">
            <CurrencyForm
              initialCurrency={(session.user.preferredCurrency as Currency) || "ETB"}
            />
          </div>
        </section>

        <section className="rounded-lg border border-border/60 p-6">
          <h2 className="font-semibold">Change password</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            You&apos;ll need your current password to set a new one.
          </p>
          <div className="mt-4">
            <PasswordForm />
          </div>
        </section>

        <section className="rounded-lg border border-destructive/40 p-6">
          <h2 className="font-semibold text-destructive">Danger zone</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Permanently delete your account. We&apos;ll email a confirmation link
            first — nothing is deleted immediately.
          </p>
          <div className="mt-4">
            <DeleteAccountButton />
          </div>
        </section>
      </div>
    </div>
  );
}
