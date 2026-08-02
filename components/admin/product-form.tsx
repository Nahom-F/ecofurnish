"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { CATEGORIES } from "@/data/categories";
import { createProduct, updateProduct, type ProductInput } from "@/app/admin/actions";
import { toast } from "sonner";

interface ProductFormProps {
  productId?: string;
  initial?: ProductInput;
}

const emptyProduct: ProductInput = {
  name: "",
  description: "",
  price: "0.00",
  imageUrl: "/placeholder.jpg",
  category: "Other",
  rooms: [],
  stock: 0,
  plasticWeightKg: "0.00",
};

export function ProductForm({ productId, initial }: ProductFormProps) {
  const router = useRouter();
  const [values, setValues] = useState<ProductInput>(initial ?? emptyProduct);
  const [submitting, setSubmitting] = useState(false);

  function update<K extends keyof ProductInput>(key: K, value: ProductInput[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  function toggleRoom(room: string, checked: boolean) {
    setValues((v) => ({
      ...v,
      rooms: checked ? [...v.rooms, room] : v.rooms.filter((r) => r !== room),
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (productId) {
        await updateProduct(productId, values);
        toast.success("Product updated");
      } else {
        await createProduct(values);
        toast.success("Product created");
      }
      router.push("/admin/products");
    } catch {
      toast.error("Something went wrong saving this product.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="name">Name</Label>
        <Input id="name" required value={values.name} onChange={(e) => update("name", e.target.value)} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={values.description}
          onChange={(e) => update("description", e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="price">Price (ETB)</Label>
          <Input
            id="price"
            required
            inputMode="decimal"
            value={values.price}
            onChange={(e) => update("price", e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="stock">Stock</Label>
          <Input
            id="stock"
            type="number"
            min={0}
            required
            value={values.stock}
            onChange={(e) => update("stock", Number(e.target.value))}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="category">Category</Label>
          <Input
            id="category"
            required
            value={values.category}
            onChange={(e) => update("category", e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="plasticWeightKg">Plastic diverted (kg)</Label>
          <Input
            id="plasticWeightKg"
            inputMode="decimal"
            value={values.plasticWeightKg}
            onChange={(e) => update("plasticWeightKg", e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Rooms</Label>
        <p className="text-xs text-muted-foreground">
          Which room(s) this fits — a piece can belong to more than one.
        </p>
        <div className="flex flex-wrap gap-4 pt-1">
          {CATEGORIES.map((room) => (
            <label key={room.id} className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={values.rooms.includes(room.title)}
                onCheckedChange={(checked) => toggleRoom(room.title, checked === true)}
              />
              {room.title}
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="imageUrl">Image path</Label>
        <Input
          id="imageUrl"
          required
          value={values.imageUrl}
          onChange={(e) => update("imageUrl", e.target.value)}
          placeholder="/products/example.png"
        />
        <p className="text-xs text-muted-foreground">
          A path under <code>/public</code> — drop new images into{" "}
          <code>public/products/</code> first.
        </p>
      </div>

      <Button type="submit" disabled={submitting}>
        {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
        {productId ? "Save changes" : "Create product"}
      </Button>
    </form>
  );
}
