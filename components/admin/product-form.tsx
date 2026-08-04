"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Upload, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CATEGORIES } from "@/data/categories";
import { createProduct, updateProduct, type ProductInput } from "@/app/admin/actions";
import { toast } from "sonner";

interface ProductFormProps {
  productId?: string;
  initial?: ProductInput;
  // Distinct category values already in use, for the dropdown — keeps a
  // new product landing in the same bucket as existing ones instead of a
  // typo splintering off a near-duplicate category (e.g. "Seating" vs
  // "seating"). "__new__" is a sentinel for "type a brand new one".
  existingCategories: string[];
}

const NEW_CATEGORY = "__new__";

const emptyProduct: ProductInput = {
  name: "",
  description: "",
  price: "0.00",
  imageUrl: "",
  category: "",
  rooms: [],
  stock: 0,
  plasticWeightKg: "0.00",
  discountPercent: 0,
  discountReason: "",
};

export function ProductForm({ productId, initial, existingCategories }: ProductFormProps) {
  const router = useRouter();
  const [values, setValues] = useState<ProductInput>(initial ?? emptyProduct);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  // Whether the category field is in "type a new one" mode — starts true
  // if we're creating fresh, or editing a product whose category isn't
  // (yet) in the known list.
  const [addingCategory, setAddingCategory] = useState(
    !!values.category && !existingCategories.includes(values.category)
  );
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
    setUploadError(null);
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed.");
      update("imageUrl", data.url);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!values.imageUrl) {
      toast.error("Please add a product photo first.");
      return;
    }
    if (!values.category.trim()) {
      toast.error("Please choose or type a category.");
      return;
    }
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
        <Label htmlFor="description">Detail / description</Label>
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
          <Label htmlFor="stock">Stock (how many you have)</Label>
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
          <Label htmlFor="category">Category (what it is — table, seating…)</Label>
          {addingCategory ? (
            <div className="flex gap-2">
              <Input
                id="category"
                required
                autoFocus
                value={values.category}
                onChange={(e) => update("category", e.target.value)}
                placeholder="e.g. Seating"
              />
              {existingCategories.length > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setAddingCategory(false)}
                >
                  Cancel
                </Button>
              )}
            </div>
          ) : (
            <Select
              value={values.category || undefined}
              onValueChange={(v) => {
                if (v === NEW_CATEGORY) {
                  update("category", "");
                  setAddingCategory(true);
                } else if (v) {
                  update("category", v);
                }
              }}
            >
              <SelectTrigger id="category" className="w-full">
                <SelectValue placeholder="Choose a category" />
              </SelectTrigger>
              <SelectContent>
                {existingCategories.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
                <SelectItem value={NEW_CATEGORY}>+ Add new category…</SelectItem>
              </SelectContent>
            </Select>
          )}
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
        <Label>Photo</Label>
        <div className="flex items-start gap-4">
          <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-dashed border-border bg-muted/30">
            {values.imageUrl ? (
              // Plain <img>, not next/image — this is just an admin-form
              // preview of whatever URL is currently set, which could be
              // any host, so it isn't worth wiring through the image
              // optimizer's domain allowlist.
              // eslint-disable-next-line @next/next/no-img-element
              <img src={values.imageUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <ImageIcon className="h-6 w-6 text-muted-foreground" />
            )}
          </div>
          <div className="flex-1 space-y-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleFileChange}
              className="hidden"
              id="photo-upload"
            />
            <Button
              type="button"
              variant="outline"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
            >
              {uploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              {uploading ? "Uploading…" : "Upload photo"}
            </Button>
            {uploadError && <p className="text-xs text-destructive">{uploadError}</p>}
            <div className="space-y-1">
              <Label htmlFor="imageUrl" className="text-xs text-muted-foreground">
                or paste an image URL
              </Label>
              <Input
                id="imageUrl"
                value={values.imageUrl}
                onChange={(e) => update("imageUrl", e.target.value)}
                placeholder="https://…"
              />
            </div>
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
