import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { products } from "@/db/schema";
import { ProductForm } from "@/components/admin/product-form";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: Props) {
  const { id } = await params;
  const [product] = await db.select().from(products).where(eq(products.id, id)).limit(1);
  if (!product) notFound();

  return (
    <div>
      <h2 className="mb-6 text-lg font-semibold">Edit {product.name}</h2>
      <ProductForm
        productId={product.id}
        initial={{
          name: product.name,
          description: product.description ?? "",
          price: product.price,
          imageUrl: product.imageUrl ?? "",
          category: product.category,
          rooms: product.rooms,
          stock: product.stock,
          plasticWeightKg: product.plasticWeightKg,
          discountPercent: product.discountPercent,
          discountReason: product.discountReason ?? "",
        }}
      />
    </div>
  );
}
