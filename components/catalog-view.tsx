"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ProductCard from "@/components/product/ProductCard";
import { CURRENCIES, type Currency } from "@/lib/currency";
import { useCurrency } from "@/lib/currency-context";

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: string;
  imageUrl: string | null;
  category: string;
  stock: number;
  plasticWeightKg: string;
}

export function CatalogView({ products }: { products: Product[] }) {
  const searchParams = useSearchParams();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>(searchParams.get("category") || "all");
  const { currency, setCurrency } = useCurrency();

  // Re-sync the category filter whenever the URL's ?category= param
  // changes — e.g. clicking a footer "Seating" link while already on this
  // page doesn't remount CatalogView (same route, just new search params),
  // so relying on useState's one-time initial value alone would leave the
  // filter stuck on whatever it was showing before.
  const categoryParam = searchParams.get("category");
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (categoryParam) setCategory(categoryParam);
  }, [categoryParam]);

  const categories = useMemo(
    () => Array.from(new Set(products.map((p) => p.category))).sort(),
    [products]
  );

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchesCategory = category === "all" || p.category === category;
      const matchesSearch =
        search.trim() === "" ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.description ?? "").toLowerCase().includes(search.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [products, search, category]);

  return (
    <div>
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search products…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select value={category} onValueChange={(v) => setCategory(v ?? "all")}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={currency} onValueChange={(v) => setCurrency((v as Currency) ?? "ETB")}>
          <SelectTrigger className="w-full sm:w-28">
            <SelectValue placeholder="Currency" />
          </SelectTrigger>
          <SelectContent>
            {CURRENCIES.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed bg-muted/20 py-24 text-center">
          <h2 className="mb-2 text-2xl font-semibold">No products match</h2>
          <p className="text-muted-foreground">Try a different search term or category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
          {filtered.map((product, index) => (
            <div
              key={product.id}
              className="animate-in fade-in-0 slide-in-from-bottom-3 fill-mode-both duration-500"
              style={{ animationDelay: `${Math.min(index * 40, 400)}ms` }}
            >
              <ProductCard product={product} currency={currency} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
