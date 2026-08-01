import FooterBottom from "./FooterBottom";
import FooterBrand from "./FooterBrand";
import FooterLinks from "./FooterLinks";
import FooterSocials from "./FooterSocials";

export default function Footer() {
  return (
    <footer className="bg-background border-t border-border pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-0">
      <div className="container mx-auto px-4 py-16">
        <div className="grid gap-12 md:grid-cols-3">
          <FooterBrand />

          <FooterLinks />

          <FooterSocials />
        </div>

        <FooterBottom />
      </div>
    </footer>
  );
}