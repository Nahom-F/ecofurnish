import SearchButton from "./SearchButton";
import WishlistButton from "./WishlistButton";
import CartButton from "./CartButton";
import UserMenu from "./UserMenu";
import { ThemeToggle } from "@/components/theme-toggle";

export default function NavbarActions() {
  return (
    <div className="flex items-center gap-1 sm:gap-2">
      <div className="hidden sm:block">
        <SearchButton />
      </div>
      <ThemeToggle />
      {/* On mobile these live in the bottom tab bar instead — showing them
          here too would just duplicate navigation that's already one thumb
          away. */}
      <div className="hidden sm:block">
        <WishlistButton />
      </div>
      <div className="hidden sm:block">
        <CartButton />
      </div>
      <div className="hidden sm:block">
        <UserMenu />
      </div>
    </div>
  );
}
