"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/password-input";
import { authClient } from "@/lib/auth-client";
import { PasswordStrengthMeter } from "@/components/password-strength-meter";
import { passesAllChecks } from "@/lib/password-strength";
import { notifyPasswordChanged } from "@/app/actions/account";

export function PasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [saving, setSaving] = useState(false);

  const passwordValid = passesAllChecks(newPassword);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!passwordValid) {
      toast.error("Please meet all the password requirements below.");
      return;
    }

    setSaving(true);
    await authClient.changePassword(
      { currentPassword, newPassword, revokeOtherSessions: true },
      {
        onSuccess: () => {
          toast.success("Password updated");
          setCurrentPassword("");
          setNewPassword("");
          notifyPasswordChanged();
        },
        onError: (ctx) => {
          toast.error(ctx.error.message || "Couldn't update your password.");
        },
        onResponse: () => setSaving(false),
      }
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="currentPassword">Current password</Label>
        <PasswordInput
          id="currentPassword"
          autoComplete="current-password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          required
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="newPassword">New password</Label>
        <PasswordInput
          id="newPassword"
          autoComplete="new-password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />
      </div>

      {newPassword.length > 0 && <PasswordStrengthMeter password={newPassword} />}

      <Button type="submit" disabled={saving || !passwordValid || !currentPassword}>
        {saving && <Loader2 className="h-4 w-4 animate-spin" />}
        Update password
      </Button>
    </form>
  );
}
