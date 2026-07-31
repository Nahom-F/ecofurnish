"use client";

import { CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { toast } from "sonner";
import { Product } from "@/types/product";
import WishlistButton from "./WishlistButton";

export default function ProductActions({ product }: { product: Product }) {
  const { addItem } = useCart();

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation(); // Stops the parent click event[cite: 10]
    
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
      stock: product.stock,
    });
    toast.success(`${product.name} added to cart`);
  }

  return (
    <CardFooter className="mt-auto flex gap-2 bg-transparent p-4 pt-0">
      <Button
        size="lg"
        className="flex flex-1 items-center gap-2"
        disabled={product.stock <= 0}
        onClick={handleAddToCart}
      >
        {product.stock > 0 ? (
          <>
            <ShoppingCart className="h-4 w-4" />
            Add to Cart
          </>
        ) : (
          "Out of Stock"
        )}
      </Button>
      <WishlistButton product={product} />
    </CardFooter>
  );
}