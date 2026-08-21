import Link from "next/link";
import { navigation } from "@/config/navigation";
import { NAV_HOVER_LINK } from "./nav-hover";

export default function NavLinks() {
  return (
    <nav aria-label="Main Navigation">
      <ul className="flex items-center gap-2">
        {navigation.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className={`${NAV_HOVER_LINK} text-sm font-medium text-foreground/80`}
            >
              {item.title}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
