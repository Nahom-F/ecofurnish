import { getBroadcastAudienceCounts, getAllCustomers } from "@/app/actions/broadcast";
import { BroadcastForm } from "@/components/admin/BroadcastForm";

export default async function AdminBroadcastPage() {
  const [counts, customers] = await Promise.all([getBroadcastAudienceCounts(), getAllCustomers()]);

  return (
    <div>
      <h2 className="mb-6 text-lg font-semibold">Broadcast</h2>
      <BroadcastForm counts={counts} customers={customers} />
    </div>
  );
}
