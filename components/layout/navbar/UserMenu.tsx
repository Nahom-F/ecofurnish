"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User, PackageSearch, ShieldCheck, LogOut, UserCog } from "lucide-react";
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
        <DropdownMenuContent align="end">
          <DropdownMenuItem render={<Link href="/account" />}>
            <UserCog className="h-4 w-4" />
            Account
          </DropdownMenuItem>
          <DropdownMenuItem render={<Link href="/account/orders" />}>
            <PackageSearch className="h-4 w-4" />
            Order history
          </DropdownMenuItem>
          {isAdmin && (
            <DropdownMenuItem render={<Link href="/admin" />}>
              <ShieldCheck className="h-4 w-4" />
              Admin dashboard
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setConfirmOpen(true)} variant="destructive">
            <LogOut className="h-4 w-4" />
            Sign out
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
