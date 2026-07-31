"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";

export function ProfileForm({ initialName }: { initialName: string }) {
  const [name, setName] = useState(initialName);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await authClient.updateUser(
      { name },
      {
        onSuccess: () => {
          toast.success("Profile updated");
        },
        onError: (ctx) => {
          toast.error(ctx.error.message || "Couldn't update your profile.");
        },
        onResponse: () => setSaving(false),
      }
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-3">
      <div className="flex-1 space-y-1.5">
        <Label htmlFor="name">Name</Label>
        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <Button type="submit" disabled={saving || name === initialName}>
        {saving && <Loader2 className="h-4 w-4 animate-spin" />}
        Save
      </Button>
    </form>
  );
}
