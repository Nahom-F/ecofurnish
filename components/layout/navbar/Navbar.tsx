"use client";

import { usePathname } from "next/navigation";
import Logo from "./Logo";
import NavLinks from "./NavLinks";
import MobileNav from "./MobileNav";
import NavbarActions from "./NavbarActions";
import SearchButton from "./SearchButton";

// Sign-in/sign-up intentionally drop the full nav — no products live to
// browse on those pages, so Shop/Collections/wishlist/cart/account are
// all dead weight there, and fewer places to click away to is a
// deliberate choice for a page whose only job is getting someone signed
// in. The logo still links home (see Logo.tsx) as the one way back out,
// and search still works — it already just deep-links to the catalog's
// own search box on the homepage (see SearchButton.tsx), so sending
// someone there from a page with nothing to search is the same behavior
// it already had everywhere else, not a special case.
const MINIMAL_ROUTES = new Set(["/sign-in", "/sign-up"]);

export default function Navbar() {
  const pathname = usePathname();

  if (MINIMAL_ROUTES.has(pathname)) {
    return (
      <header
        className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-md"
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:h-20 sm:px-6">
          <Logo />
          {/* SearchButton's own style is hover-only, right for the full
              navbar where it's one of five icons — here it's the only
              action on the page, so it gets a permanent circle instead of
              relying on hover to read as clickable. Wrapped rather than
              changed at the source, so the full navbar elsewhere is
              unaffected. */}
          <div className="rounded-full border border-border/60 bg-background p-0.5 shadow-sm">
            <SearchButton />
          </div>
        </div>
      </header>
    );
  }

  return (
    <header
      className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-md"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:h-20 sm:px-6">
        <div className="flex items-center gap-1 sm:gap-2">
          <MobileNav />
          <Logo />
        </div>

        <div className="hidden md:block">
          <NavLinks />
        </div>

        <NavbarActions />
      </div>
    </header>
  );
}
