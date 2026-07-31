import NavbarActions from "./NavbarActions";
import Logo from "./Logo";
import NavLinks from "./NavLinks";
import MobileNav from "./MobileNav";

export default function Navbar() {
  return (
    <header
      className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-md"
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
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
