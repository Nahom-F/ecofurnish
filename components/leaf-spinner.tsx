import { Leaf } from "lucide-react";

export function LeafSpinner({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <Leaf
      className={`animate-spin text-primary ${className}`}
      style={{ animationDuration: "1.4s" }}
    />
  );
}

export function PageLoading() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <LeafSpinner className="h-10 w-10" />
    </div>
  );
}
