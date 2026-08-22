// Mirrors the shape of a row from `db.select().from(products)` in
// db/schema.ts — kept as a plain type here so components can import it
// without pulling in server-only Drizzle code.
export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: string; // numeric columns come back as strings from Drizzle
  imageUrl: string | null;
  // Extra gallery photos beyond imageUrl (the cover shot). See db/schema.ts.
  images: string[];
  category: string;
  rooms: string[];
  stock: number;
  plasticWeightKg: string;
  discountPercent?: number | null;
  discountReason?: string | null;
  // Only present where the fetching page ran attachRatings() (see
  // lib/reviews.ts) — optional so callers that don't need ratings (e.g.
  // the admin product form) aren't forced to supply them.
  avgRating?: number | null;
  reviewCount?: number;
}
