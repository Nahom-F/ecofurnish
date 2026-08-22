"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Leaf } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Product } from "@/types/product";

interface ProductGalleryProps {
  product: Product;
}

export default function ProductGallery({ product }: ProductGalleryProps) {
  // Cover photo first, then the extra gallery photos — one combined list
  // so the arrows/thumbnails don't need to treat the cover specially.
  const photos = [product.imageUrl, ...product.images].filter(
    (src): src is string => !!src
  );
  const displayPhotos = photos.length > 0 ? photos : ["/placeholder.jpg"];
  const [index, setIndex] = useState(0);
  const hasMultiple = displayPhotos.length > 1;

  function next() {
    setIndex((i) => (i + 1) % displayPhotos.length);
  }
  function prev() {
    setIndex((i) => (i - 1 + displayPhotos.length) % displayPhotos.length);
  }

  return (
    <div className="space-y-3">
      <div className="group relative aspect-square overflow-hidden rounded-2xl bg-muted">
        <Image
          src={displayPhotos[index]}
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

        {hasMultiple && (
          <>
            <button
              type="button"
              onClick={prev}
              aria-label="Previous photo"
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-background/80 p-2 opacity-0 shadow-md transition-opacity hover:bg-background group-hover:opacity-100"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Next photo"
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-background/80 p-2 opacity-0 shadow-md transition-opacity hover:bg-background group-hover:opacity-100"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
              {displayPhotos.map((_, i) => (
                <span
                  key={i}
                  className={`h-1.5 w-1.5 rounded-full transition-colors ${
                    i === index ? "bg-white" : "bg-white/50"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {hasMultiple && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {displayPhotos.map((src, i) => (
            <button
              key={src + i}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`View photo ${i + 1}`}
              className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition-colors ${
                i === index ? "border-primary" : "border-transparent"
              }`}
            >
              <Image src={src} alt="" fill className="object-cover" sizes="64px" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
