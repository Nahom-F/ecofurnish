"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Menu,
  X,
  Home as HomeIcon,
  ShoppingBag,
  LayoutGrid,
  Leaf,
  Mail,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { navigation } from "@/config/navigation";
import Logo from "./Logo";

// Icon + display order for the mobile drawer specifically — the shared
// `navigation` config (also used by the desktop nav) keeps its own order,
// this just controls how this one drawer presents the same links.
const ICONS: Record<string, typeof HomeIcon> = {
  Home: HomeIcon,
  Shop: ShoppingBag,
  Collections: LayoutGrid,
  About: Leaf,
  Contact: Mail,
};
const MOBILE_ORDER = ["Home", "Shop", "Collections", "About", "Contact"];

export default function MobileNav() {
  const [open, setOpen] = useState(false);

  const items = [...navigation].sort(
    (a, b) => MOBILE_ORDER.indexOf(a.title) - MOBILE_ORDER.indexOf(b.title)
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={<Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu" />}
      >
        <Menu className="h-5 w-5" />
      </DialogTrigger>

      <DialogContent
        showCloseButton={false}
        className="left-0 top-0 flex h-dvh w-4/5 max-w-none translate-x-0 translate-y-0 flex-col rounded-none border-0 p-0 shadow-2xl data-open:slide-in-from-left data-closed:slide-out-to-left sm:max-w-sm"
      >
        <DialogTitle className="sr-only">Menu</DialogTitle>
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-border/60 px-4">
          <div onClick={() => setOpen(false)}>
            <Logo />
          </div>
          <DialogClose render={<Button variant="ghost" size="icon" aria-label="Close menu" />}>
            <X className="h-5 w-5" />
          </DialogClose>
        </div>

        <nav aria-label="Mobile navigation" className="flex-1 p-4">
          <ul className="space-y-2">
            {items.map((item) => {
              const Icon = ICONS[item.title] ?? LayoutGrid;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 rounded-xl bg-muted/40 px-4 py-3.5 text-base font-medium text-foreground transition-colors hover:bg-muted"
                  >
                    <Icon className="h-5 w-5 text-emerald-700" />
                    <span className="flex-1">{item.title}</span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Decorative footer — matches the drawer's brand personality
            without adding more functional content to an already-simple menu. */}
        <div className="relative shrink-0 overflow-hidden border-t border-border/60 px-6 py-6">
          <svg
            viewBox="0 0 300 60"
            preserveAspectRatio="none"
            className="pointer-events-none absolute inset-x-0 top-0 h-12 w-full text-emerald-700/10"
          >
            <path
              d="M0 40 C 60 10, 120 55, 180 25 S 260 45, 300 15"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            />
          </svg>
          <div className="relative flex items-center gap-2">
            <Leaf className="h-4 w-4 shrink-0 text-emerald-700" />
            <p className="text-sm text-muted-foreground">
              Sustainable living, thoughtfully designed.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
