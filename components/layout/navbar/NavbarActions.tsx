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
      <WishlistButton />
      <CartButton />
      <UserMenu />
    </div>
  );
}
