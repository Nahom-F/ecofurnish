import Logo from "../navbar/Logo";

export default function FooterBrand() {
  return (
    <div className="space-y-4">
      <Logo />

      <p className="max-w-sm text-sm leading-6 text-muted-foreground">
        Sustainable furniture designed for modern families who value quality,
        comfort, and timeless design.
      </p>
    </div>
  );
}