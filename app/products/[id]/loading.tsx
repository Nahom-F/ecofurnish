import { Skeleton } from "@/components/ui/skeleton";

// Shaped like the real product page (image + summary column) instead of
// a full-screen spinner, so layout doesn't jump once data arrives.
export default function Loading() {
  return (
    <main className="container mx-auto px-4 py-20">
      <Skeleton className="mb-8 h-5 w-32" />

      <div className="grid gap-16 lg:grid-cols-2">
        <Skeleton className="aspect-square w-full rounded-2xl" />

        <div className="space-y-6">
          <div>
            <Skeleton className="h-4 w-24" />
            <Skeleton className="mt-2 h-9 w-3/4" />
          </div>

          <Skeleton className="h-7 w-28" />

          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>

          <div className="flex gap-3">
            <Skeleton className="h-12 flex-1 rounded-xl" />
            <Skeleton className="h-12 w-12 rounded-xl" />
          </div>
        </div>
      </div>
    </main>
  );
}
