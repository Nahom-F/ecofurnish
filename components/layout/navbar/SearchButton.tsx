import Link from "next/link";
import { Search } from "lucide-react";

// Links to the catalog's own search input (in CatalogView) rather than
// duplicating search logic here — a dedicated search page/flyout would be
// a reasonable next step if you want search from anywhere on the site.
export default function SearchButton() {
  return (
    <Link
      href="/#all-products"
      aria-label="Search products"
      className="rounded-xl p-2 transition-colors hover:bg-muted"
    >
      <Search className="h-5 w-5 text-foreground" />
    </Link>
  );
}
