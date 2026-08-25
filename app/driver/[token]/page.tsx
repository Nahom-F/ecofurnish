import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { deliveryClaims } from "@/db/schema";
import { getAssignmentContext, isTokenExpired, NEXT_CLAIM_TYPE } from "@/lib/driver-portal";
import { OrderTimeline } from "@/components/order/OrderTimeline";
import { DriverActionPanel } from "@/components/driver/DriverActionPanel";

export default async function DriverPortalPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const context = await getAssignmentContext(token);

  if (!context) {
    return (
      <div className="container mx-auto max-w-md px-4 py-20 text-center">
        <h1 className="text-2xl font-bold">Link not found</h1>
        <p className="mt-2 text-muted-foreground">This delivery link doesn&apos;t exist.</p>
      </div>
    );
  }

  const { assignment, order } = context;
  const expired = isTokenExpired(assignment);

  const claims = await db
    .select()
    .from(deliveryClaims)
    .where(eq(deliveryClaims.assignmentId, assignment.id))
    .orderBy(desc(deliveryClaims.createdAt));

  const expectedType = NEXT_CLAIM_TYPE[order.status] ?? null;
  const pendingClaim = claims.find((c) => c.claimType === expectedType && c.status === "pending");
  const lastDeclined = claims.find((c) => c.claimType === expectedType && c.status === "declined");

  return (
    <div className="container mx-auto max-w-lg px-4 py-10">
      <h1 className="text-2xl font-bold">Your Delivery</h1>
      <p className="mt-1 text-muted-foreground">
        {order.shippingAddress}, {order.city}
      </p>

      <div className="my-6">
        <OrderTimeline
          status={order.status}
          createdAt={order.createdAt}
          trackingNote={order.trackingNote}
        />
      </div>

      {assignment.status !== "active" ? (
        <p className="rounded-lg border border-border/60 p-4 text-center text-muted-foreground">
          This delivery is complete. Thanks for driving!
        </p>
      ) : expired ? (
        <p className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-center text-destructive">
          This link has expired. Contact your dispatcher for a new one.
        </p>
      ) : order.status === "cancelled" ? (
        <p className="rounded-lg border border-border/60 p-4 text-center text-muted-foreground">
          This delivery was cancelled.
        </p>
      ) : order.status === "delivered" ? (
        <p className="rounded-lg border border-border/60 p-4 text-center text-muted-foreground">
          Delivered — thanks for driving!
        </p>
      ) : (
        <DriverActionPanel
          token={token}
          expectedType={expectedType}
          alreadyPending={!!pendingClaim}
          lastDeclinedNote={lastDeclined?.dispatcherNote ?? null}
        />
      )}
    </div>
  );
}
