import { db } from "@/db";
import { products } from "@/db/schema";
import { ProductForm } from "@/components/admin/product-form";

export default async function NewProductPage() {
  const rows = await db.selectDistinct({ category: products.category }).from(products);
  const existingCategories = rows.map((r) => r.category).sort();

  return (
    <div>
      <h2 className="mb-6 text-lg font-semibold">New product</h2>
      <ProductForm existingCategories={existingCategories} />
    </div>
  );
}
