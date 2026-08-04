"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User, PackageSearch, ShieldCheck, LogOut, UserCog, Gift } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useSession, signOut } from "@/lib/auth-client";
import { AvatarDisplay } from "@/components/avatar-display";

export default function UserMenu() {
  const { data: session, isPending } = useSession();
  const isAdmin = session?.user?.role === "admin";
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const [mounted, setMounted] = useState(false);
  // Standard SSR-hydration-safe "mounted" gate (see comment above render).
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <span className="rounded-xl p-2" aria-hidden="true">
        <User className="h-5 w-5 text-foreground" />
      </span>
    );
  }

  if (!isPending && !session?.user) {
    return (
      <Link
        href="/sign-in"
        aria-label="Sign in"
        className="rounded-xl p-2 transition-colors hover:bg-muted"
      >
        <User className="h-5 w-5 text-foreground" />
      </Link>
    );
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <button
              type="button"
              aria-label="Account menu"
              className="overflow-hidden rounded-xl p-1 transition-colors hover:bg-muted"
            />
          }
        >
          <AvatarDisplay
            image={session?.user?.image}
            name={session?.user?.name ?? "?"}
            className="h-7 w-7 text-xs"
          />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-[280px] p-2">
          <DropdownMenuItem
            className="items-start gap-3 rounded-xl px-2 py-2.5"
            render={<Link href="/account" />}
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-700/10 text-emerald-700">
              <UserCog className="h-4.5 w-4.5" />
            </span>
            <span className="flex flex-col gap-0.5 pt-0.5">
              <span className="text-sm font-semibold text-foreground">Account</span>
              <span className="text-xs text-muted-foreground">Manage your profile</span>
            </span>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="items-start gap-3 rounded-xl px-2 py-2.5"
            render={<Link href="/account/orders" />}
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-700/10 text-emerald-700">
              <PackageSearch className="h-4.5 w-4.5" />
            </span>
            <span className="flex flex-col gap-0.5 pt-0.5">
              <span className="text-sm font-semibold text-foreground">Order history</span>
              <span className="text-xs text-muted-foreground">View your past orders</span>
            </span>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="items-start gap-3 rounded-xl px-2 py-2.5"
            render={<Link href="/account/referrals" />}
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-700/10 text-emerald-700">
              <Gift className="h-4.5 w-4.5" />
            </span>
            <span className="flex flex-col gap-0.5 pt-0.5">
              <span className="text-sm font-semibold text-foreground">Invite friends</span>
              <span className="text-xs text-muted-foreground">Earn rewards for referrals</span>
            </span>
          </DropdownMenuItem>
          {isAdmin && (
            <DropdownMenuItem
              className="items-start gap-3 rounded-xl px-2 py-2.5"
              render={<Link href="/admin" />}
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-700/10 text-emerald-700">
                <ShieldCheck className="h-4.5 w-4.5" />
              </span>
              <span className="flex flex-col gap-0.5 pt-0.5">
                <span className="text-sm font-semibold text-foreground">Admin dashboard</span>
                <span className="text-xs text-muted-foreground">Manage products &amp; orders</span>
              </span>
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="items-start gap-3 rounded-xl px-2 py-2.5"
            onClick={() => setConfirmOpen(true)}
            variant="destructive"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <LogOut className="h-4.5 w-4.5" />
            </span>
            <span className="flex flex-col gap-0.5 pt-0.5">
              <span className="text-sm font-semibold text-destructive">Sign out</span>
              <span className="text-xs text-destructive/70">Log out of your account</span>
            </span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sign out?</DialogTitle>
            <DialogDescription>
              You&apos;ll need to sign in again to see your orders and wishlist.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
            <Button
              variant="destructive"
              onClick={() => {
                signOut();
                setConfirmOpen(false);
                router.push("/");
              }}
            >
              Sign out
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
