"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export interface GlowNavLink {
  href: string;
  label: string;
  // Dashboard/Applications (the section root) need this — otherwise
  // they'd stay lit up on every sub-page too, since every path in the
  // section starts with the same prefix.
  exact?: boolean;
}

/**
 * The current page's link glows (brighter, persists regardless of
 * hover); hovering any other link gives it a lighter glow of its own
 * that follows the cursor and disappears when the cursor leaves. Both
 * use the theme's --primary variable via drop-shadow, so the color is
 * automatically correct in light and dark mode with no separate
 * per-theme values to maintain.
 */
export function GlowNav({ links }: { links: GlowNavLink[] }) {
  const pathname = usePathname();

  return (
    <nav className="flex gap-4 overflow-x-auto text-sm font-medium text-muted-foreground [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {links.map((link) => {
        const isActive = link.exact
          ? pathname === link.href
          : pathname === link.href || pathname.startsWith(`${link.href}/`);

        return (
          <Link
            key={link.href}
            href={link.href}
            className={`flex shrink-0 items-center gap-1 transition-[filter,color] duration-200 ${
              isActive
                ? "font-semibold text-primary drop-shadow-[0_0_6px_var(--primary)]"
                : "text-muted-foreground hover:text-primary hover:drop-shadow-[0_0_3px_var(--primary)]"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
