"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Loader2, ImagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { CATEGORIES } from "@/data/categories";
import {
  createProduct,
  updateProduct,
  uploadProductImage,
  type ProductInput,
} from "@/app/admin/actions";
import { toast } from "sonner";

interface ProductFormProps {
  productId?: string;
  initial?: ProductInput;
  existingCategories?: string[];
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
  discountPercent: 0,
  discountReason: "",
};

export function ProductForm({ productId, initial, existingCategories = [] }: ProductFormProps) {
  const router = useRouter();
  const [values, setValues] = useState<ProductInput>(initial ?? emptyProduct);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function update<K extends keyof ProductInput>(key: K, value: ProductInput[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  function toggleRoom(room: string, checked: boolean) {
    setValues((v) => ({
      ...v,
      rooms: checked ? [...v.rooms, room] : v.rooms.filter((r) => r !== room),
    }));
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Instant local preview while the real upload is still in flight —
    // swapped for the real blob URL once that resolves below.
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setUploading(true);

    const formData = new FormData();
    formData.set("file", file);
    const result = await uploadProductImage(formData);

    setUploading(false);
    URL.revokeObjectURL(objectUrl);

    if (!result.success) {
      setPreviewUrl(null);
      toast.error(result.error);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    update("imageUrl", result.url);
    setPreviewUrl(null); // now shown via values.imageUrl itself instead
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
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong saving this product.");
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
            list="existing-categories"
            value={values.category}
            onChange={(e) => update("category", e.target.value)}
          />
          <datalist id="existing-categories">
            {existingCategories.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
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
        <Label>Product image</Label>
        <div className="flex items-start gap-4">
          <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg border border-border/60 bg-muted">
            {(previewUrl || values.imageUrl) && (
              <Image
                src={previewUrl || values.imageUrl}
                alt=""
                fill
                unoptimized={!!previewUrl} // a blob: object URL, not a real remote image
                className="object-cover"
              />
            )}
            {uploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/70">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            )}
          </div>
          <div className="flex-1 space-y-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
              disabled={uploading}
              className="hidden"
              id="image-upload"
            />
            <Button
              type="button"
              variant="outline"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
            >
              <ImagePlus className="h-4 w-4" />
              {uploading ? "Uploading…" : values.imageUrl ? "Replace image" : "Upload image"}
            </Button>
            <p className="text-xs text-muted-foreground">JPEG, PNG, or WebP, up to 4MB.</p>
            <Input
              value={values.imageUrl}
              onChange={(e) => update("imageUrl", e.target.value)}
              placeholder="Or paste an image URL directly"
              className="text-xs"
            />
          </div>
        </div>
      </div>

      <div className="space-y-2 rounded-lg border border-emerald-700/30 bg-emerald-700/5 p-4">
        <Label>Discount</Label>
        <p className="text-xs text-muted-foreground">
          Leave at 0% for no discount. Runs until you change it back — there&apos;s no
          automatic expiry.
        </p>
        <div className="grid grid-cols-2 gap-4 pt-1">
          <div className="space-y-1.5">
            <Label htmlFor="discountPercent">Discount %</Label>
            <Input
              id="discountPercent"
              type="number"
              min={0}
              max={99}
              value={values.discountPercent}
              onChange={(e) => update("discountPercent", Number(e.target.value))}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="discountReason">Reason (shown to customers)</Label>
            <Input
              id="discountReason"
              value={values.discountReason}
              onChange={(e) => update("discountReason", e.target.value)}
              placeholder="Launch week discount"
            />
          </div>
        </div>
      </div>

      <Button type="submit" disabled={submitting}>
        {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
        {productId ? "Save changes" : "Create product"}
      </Button>
    </form>
  );
}
