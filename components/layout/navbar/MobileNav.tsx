"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
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

export default function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={<Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu" />}
      >
        <Menu className="h-5 w-5" />
      </DialogTrigger>

      <DialogContent
        showCloseButton={false}
        className="left-0 top-0 h-dvh w-full max-w-none translate-x-0 translate-y-0 rounded-none border-0 p-0 data-open:slide-in-from-left data-closed:slide-out-to-left sm:max-w-sm"
      >
        <DialogTitle className="sr-only">Menu</DialogTitle>
        <div className="flex h-16 items-center justify-between border-b border-border/60 px-4">
          <div onClick={() => setOpen(false)}>
            <Logo />
          </div>
          <DialogClose render={<Button variant="ghost" size="icon" aria-label="Close menu" />}>
            <X className="h-5 w-5" />
          </DialogClose>
        </div>
        <nav aria-label="Mobile navigation" className="p-4">
          <ul className="space-y-1">
            {navigation.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-3 py-3 text-base font-medium text-foreground transition-colors hover:bg-muted"
                >
                  {item.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </DialogContent>
    </Dialog>
  );
}
