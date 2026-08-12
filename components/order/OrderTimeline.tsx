import { Check, Package, PackageCheck, ShoppingBag, Truck, XCircle } from "lucide-react";

const STEPS = [
  { key: "pending", label: "Placed", icon: ShoppingBag },
  { key: "processing", label: "Processing", icon: Package },
  { key: "shipped", label: "Shipped", icon: Truck },
  { key: "delivered", label: "Delivered", icon: PackageCheck },
] as const;

export function OrderTimeline({
  status,
  createdAt,
  trackingNote,
}: {
  status: string;
  createdAt: Date | string;
  trackingNote?: string | null;
}) {
  if (status === "cancelled") {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3">
        <XCircle className="h-5 w-5 shrink-0 text-destructive" />
        <div>
          <p className="text-sm font-medium text-destructive">Order cancelled</p>
          <p className="text-xs text-muted-foreground">
            Placed{" "}
            {new Date(createdAt).toLocaleDateString(undefined, {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </p>
        </div>
      </div>
    );
  }

  const currentIndex = Math.max(
    0,
    STEPS.findIndex((s) => s.key === status)
  );
  // Fraction of the connecting line to fill — 0 at "Placed", 1 at "Delivered".
  const progress = currentIndex / (STEPS.length - 1);

  return (
    <div className="py-2">
      <div className="relative">
        <div className="absolute left-0 right-0 top-4 h-0.5 bg-border sm:top-5" />
        <div
          className="absolute left-0 top-4 h-0.5 bg-primary transition-all duration-500 sm:top-5"
          style={{ width: `${progress * 100}%` }}
        />
        <div className="relative flex justify-between">
          {STEPS.map((step, i) => {
            const done = i < currentIndex;
            const current = i === currentIndex;
            const Icon = step.icon;
            return (
              <div key={step.key} className="flex flex-col items-center gap-1.5 text-center">
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition-colors sm:h-10 sm:w-10 ${
                    done
                      ? "border-primary bg-primary text-primary-foreground"
                      : current
                        ? "border-primary bg-background text-primary"
                        : "border-border bg-background text-muted-foreground"
                  }`}
                >
                  {done ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Icon className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
                  )}
                </span>
                <span
                  className={`max-w-[4.5rem] text-[0.7rem] font-medium sm:max-w-none sm:text-xs ${
                    done || current ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {trackingNote && currentIndex >= STEPS.findIndex((s) => s.key === "shipped") && (
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Tracking: <span className="font-medium text-foreground">{trackingNote}</span>
        </p>
      )}
    </div>
  );
}
