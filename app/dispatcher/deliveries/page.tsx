import {
  getAssignableOrders,
  getApprovedDrivers,
  getActiveDeliveries,
} from "@/app/dispatcher/actions";
import { DeliveryAssignmentPanel } from "@/components/dispatcher/DeliveryAssignmentPanel";

export default async function DispatcherDeliveriesPage() {
  const [orders, drivers, activeDeliveries] = await Promise.all([
    getAssignableOrders(),
    getApprovedDrivers(),
    getActiveDeliveries(),
  ]);

  return (
    <div>
      <h2 className="mb-1 text-lg font-semibold">Deliveries</h2>
      <p className="mb-6 text-sm text-muted-foreground">
        Assign an approved driver to an order that&apos;s packed and ready to go. The buyer gets
        their delivery PIN by email the moment you assign a driver.
      </p>
      <DeliveryAssignmentPanel orders={orders} drivers={drivers} activeDeliveries={activeDeliveries} />
    </div>
  );
}
