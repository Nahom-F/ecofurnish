import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { PackageSearch } from "lucide-react";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { auth } from "@/lib/auth";
import { formatPrice, type Currency } from "@/lib/currency";
import { Badge } from "@/components/ui/badge";

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export default async function OrderHistoryPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/sign-in");

  const myOrders = await db
    .select()
    .from(orders)
    .where(eq(orders.userId, session.user.id))
    .orderBy(desc(orders.createdAt));

  const preferredCurrency = (session.user.preferredCurrency as Currency | undefined) || "ETB";

  return (
    <div className="container mx-auto max-w-3xl px-4 py-10">
      <h1 className="mb-8 text-3xl font-extrabold tracking-tight">Order History</h1>

      {myOrders.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed bg-muted/20 py-24 text-center">
          <PackageSearch className="mx-auto h-8 w-8 text-muted-foreground" />
          <h2 className="mt-4 text-xl font-semibold">No orders yet</h2>
          <p className="mt-1 text-muted-foreground">
            Orders you place while signed in will show up here.
          </p>
          <Link href="/" className="mt-4 inline-block font-medium text-primary hover:underline">
            Start shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {myOrders.map((order) => (
            <Link
              key={order.id}
              href={`/order-confirmation/${order.id}`}
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border/60 p-4 transition-colors hover:bg-muted/30"
            >
              <div>
                <p className="font-mono text-sm text-muted-foreground">
                  #{order.id.slice(0, 8)}
                </p>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {new Date(order.createdAt).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </div>
              <div className="flex gap-2">
                <Badge variant={order.paymentStatus === "paid" ? "default" : "outline"}>
                  {order.paymentStatus}
                </Badge>
                <Badge variant="outline">{STATUS_LABELS[order.status] ?? order.status}</Badge>
              </div>
              <span className="font-semibold text-primary">
                {formatPrice(order.totalAmount, preferredCurrency)}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
