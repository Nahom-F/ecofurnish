"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateOrderStatus } from "@/app/admin/actions";
import { ORDER_STATUSES } from "@/lib/orders";

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  processing: "Processing",
  ready_for_delivery: "Ready for Delivery",
  on_the_road: "On the Road",
  near_destination: "Near Destination",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export function OrderStatusSelect({
  orderId,
  status,
}: {
  orderId: string;
  status: string;
}) {
  const [value, setValue] = useState(status);
  const [saving, setSaving] = useState(false);

  async function handleChange(next: string | null) {
    if (!next) return;
    setValue(next);
    setSaving(true);
    try {
      await updateOrderStatus(orderId, next);
      toast.success("Order status updated");
    } catch {
      toast.error("Couldn't update status");
      setValue(status);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Select value={value} onValueChange={handleChange} disabled={saving}>
      <SelectTrigger className="w-44">
        <SelectValue>{STATUS_LABELS[value] ?? value}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        {ORDER_STATUSES.map((s) => (
          <SelectItem key={s} value={s}>
            {STATUS_LABELS[s] ?? s}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
