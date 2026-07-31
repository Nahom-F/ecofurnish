import Image from "next/image";
import { Leaf } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Product } from "@/types/product";

interface ProductGalleryProps {
  product: Product;
}

export default function ProductGallery({ product }: ProductGalleryProps) {
  const displayImage = product.imageUrl || "/placeholder.jpg";

  return (
    <div className="relative aspect-square overflow-hidden rounded-2xl bg-muted">
      <Image
        src={displayImage}
        alt={product.name}
        fill
        priority
        className="object-cover"
        sizes="(max-width: 1024px) 100vw, 50vw"
      />
      <Badge className="absolute left-4 top-4 flex items-center gap-1 bg-green-600 text-white hover:bg-green-700">
        <Leaf className="h-3 w-3" />
        {product.plasticWeightKg}kg Plastic Diverted
      </Badge>
    </div>
  );
}
