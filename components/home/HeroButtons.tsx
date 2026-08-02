import Link from "next/link";

export default function HeroButtons() {
  return (
    <div className="mt-8 flex flex-wrap gap-4">
      <Link
        href="/#all-products"
        className="rounded-xl bg-emerald-700 px-6 py-3 text-white transition-all duration-300 hover:bg-emerald-800 hover:shadow-lg"
      >
        Shop Collection
      </Link>

      <Link
        href="/#all-products"
        className="rounded-xl border border-border px-6 py-3 text-foreground transition-all duration-300 hover:border-emerald-700 hover:text-emerald-700"
      >
        Explore Collections
      </Link>
    </div>
  );
}