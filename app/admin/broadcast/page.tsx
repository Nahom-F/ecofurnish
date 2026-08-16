import { getBroadcastAudienceCounts } from "@/app/actions/broadcast";
import { BroadcastForm } from "@/components/admin/BroadcastForm";

export default async function AdminBroadcastPage() {
  const counts = await getBroadcastAudienceCounts();

  return (
    <div>
      <h2 className="mb-6 text-lg font-semibold">Broadcast</h2>
      <BroadcastForm counts={counts} />
    </div>
  );
}
