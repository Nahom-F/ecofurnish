import Link from "next/link";
import { navigation } from "@/config/navigation";

export default function NavLinks() {
  return (
    <nav aria-label="Main Navigation">
      <ul className="flex items-center gap-8">
        {navigation.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="text-sm font-medium text-foreground/80 transition-colors duration-200 hover:text-emerald-700"
            >
              {item.title}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}