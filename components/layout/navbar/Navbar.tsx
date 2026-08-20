"use client";

import { usePathname } from "next/navigation";
import NavbarActions from "./NavbarActions";
import Logo from "./Logo";
import NavLinks from "./NavLinks";
import MobileNav from "./MobileNav";
import SearchButton from "./SearchButton";
import { ThemeToggle } from "@/components/theme-toggle";

// Sign-in/sign-up swap the full nav for just the logo (still a link home)
// and search on desktop, so the form has room to sit above the fold
// without scrolling. Nav links and the cart/wishlist/account icons are
// either redundant here (the account icon just points back to this same
// page) or a mid-task distraction from finishing the form.
//
// Mobile is untouched on purpose — MobileNav and NavbarActions already
// collapse to a hamburger + theme toggle there, which was already the
// right amount of chrome, so every branch below is gated behind `md:`.
const MINIMAL_HEADER_ROUTES = new Set(["/sign-in", "/sign-up"]);

export default function Navbar() {
  const pathname = usePathname();
  const isAuthPage = MINIMAL_HEADER_ROUTES.has(pathname);

  return (
    <header
      className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-md"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      <div
        className={`mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:h-20 sm:px-6 ${
          isAuthPage ? "md:h-16" : ""
        }`}
      >
        <div className="flex items-center gap-1 sm:gap-2">
          <MobileNav />
          <Logo />
        </div>

        {isAuthPage ? (
          <>
            <div className="hidden md:block">
              <SearchButton />
            </div>
            <div className="md:hidden">
              <ThemeToggle />
            </div>
          </>
        ) : (
          <>
            <div className="hidden md:block">
              <NavLinks />
            </div>
            <NavbarActions />
          </>
        )}
      </div>
    </header>
  );
}
