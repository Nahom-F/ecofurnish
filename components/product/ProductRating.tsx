import { Star } from "lucide-react";

interface ProductRatingProps {
  rating: number;
  count?: number;
}

export default function ProductRating({ rating, count }: ProductRatingProps) {
  return (
    <div className="flex items-center gap-1">
      <Star size={16} className="fill-yellow-400 text-yellow-400" />

      <span className="text-sm font-medium">{rating.toFixed(1)}</span>

      {typeof count === "number" && (
        <span className="text-sm text-muted-foreground">({count})</span>
      )}
    </div>
  );
}