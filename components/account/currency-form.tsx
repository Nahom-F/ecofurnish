"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { authClient } from "@/lib/auth-client";
import { CURRENCIES, type Currency } from "@/lib/currency";

export function CurrencyForm({ initialCurrency }: { initialCurrency: Currency }) {
  const [currency, setCurrency] = useState<Currency>(initialCurrency);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    await authClient.updateUser(
      { preferredCurrency: currency },
      {
        onSuccess: () => {
          toast.success("Currency preference saved");
        },
        onError: (ctx) => {
          toast.error(ctx.error.message || "Couldn't save your preference.");
        },
        onResponse: () => setSaving(false),
      }
    );
  }

  return (
    <div className="flex items-end gap-3">
      <div className="flex-1 space-y-1.5">
        <Select value={currency} onValueChange={(v) => setCurrency((v as Currency) ?? "ETB")}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CURRENCIES.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button onClick={handleSave} disabled={saving || currency === initialCurrency}>
        {saving && <Loader2 className="h-4 w-4 animate-spin" />}
        Save
      </Button>
    </div>
  );
}
