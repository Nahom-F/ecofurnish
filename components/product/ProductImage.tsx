import Image from "next/image";
import { Leaf } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Product } from "@/types/product";

export default function ProductImage({ product }: { product: Product }) {
  const displayImage = product.imageUrl || "/placeholder.jpg"; // Fallback image

  return (
    <div className="relative aspect-square overflow-hidden bg-muted">
      <Image
        src={displayImage}
        alt={product.name}
        fill
        className="object-cover transition-transform hover:scale-105"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />
      {/* Eco-Impact Badge overlaid on the image */}
      <Badge className="absolute left-3 top-3 flex items-center gap-1 bg-green-600 text-white hover:bg-green-700">
        <Leaf className="h-3 w-3" />
        {product.plasticWeightKg}kg Plastic Diverted
      </Badge>
    </div>
  );
}