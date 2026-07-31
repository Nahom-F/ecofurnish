"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { updateOrderTrackingNote } from "@/app/admin/actions";

export function TrackingNoteInput({
  orderId,
  trackingNote,
}: {
  orderId: string;
  trackingNote: string | null;
}) {
  const [value, setValue] = useState(trackingNote ?? "");
  const [saved, setSaved] = useState(value);

  async function handleBlur() {
    if (value === saved) return; // no change — don't hit the server on every unrelated blur
    try {
      await updateOrderTrackingNote(orderId, value);
      setSaved(value);
      toast.success("Tracking note saved");
    } catch {
      toast.error("Couldn't save tracking note");
      setValue(saved);
    }
  }

  return (
    <Input
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={handleBlur}
      placeholder="e.g. Telebirr ref"
      className="h-8 w-36 text-xs"
    />
  );
}
