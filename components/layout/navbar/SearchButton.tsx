import Link from "next/link";
import { Search } from "lucide-react";
import { NAV_HOVER_ICON } from "./nav-hover";

// Links to the catalog's own search input (in CatalogView) rather than
// duplicating search logic here. The focusSearch param tells CatalogView
// to focus that input once it's in view, so landing here actually drops
// you into a ready-to-type search box instead of just scrolling nearby.
export default function SearchButton() {
  return (
    <Link href="/?focusSearch=1#all-products" aria-label="Search products" className={`${NAV_HOVER_ICON} p-2`}>
      <Search className="h-5 w-5 text-foreground" />
    </Link>
  );
}
