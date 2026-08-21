"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Send, Users, Megaphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { sendBroadcastEmail, type BroadcastAudience } from "@/app/actions/broadcast";

export function BroadcastForm({ counts }: { counts: { allCustomers: number; subscribers: number } }) {
  const [audience, setAudience] = useState<BroadcastAudience>("subscribers");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const recipientCount = audience === "subscribers" ? counts.subscribers : counts.allCustomers;
  const ready = subject.trim().length > 0 && body.trim().length > 0;

  async function sendTest() {
    if (!ready) return;
    setSending(true);
    try {
      const result = await sendBroadcastEmail({ subject, body, audience: "test" });
      if (result.success) toast.success("Test sent to your own email");
      else toast.error(result.error ?? "Test send failed");
    } finally {
      setSending(false);
    }
  }

  async function sendReal() {
    setConfirmOpen(false);
    setSending(true);
    try {
      const result = await sendBroadcastEmail({ subject, body, audience });
      if (result.success) {
        toast.success(`Sent to ${result.sent} recipient${result.sent === 1 ? "" : "s"}`);
        setSubject("");
        setBody("");
      } else {
        toast.error(
          result.error ?? `${result.failed} of ${result.sent + (result.failed ?? 0)} failed to send`
        );
      }
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <Label className="mb-2 block">Audience</Label>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => setAudience("subscribers")}
            className={`rounded-lg border p-4 text-left transition-colors ${
              audience === "subscribers"
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/40"
            }`}
          >
            <div className="flex items-center gap-2 font-medium">
              <Megaphone className="h-4 w-4" />
              Newsletter subscribers
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {counts.subscribers} opted in — for regular updates, offers, new arrivals. Includes
              an unsubscribe link.
            </p>
          </button>
          <button
            type="button"
            onClick={() => setAudience("all-customers")}
            className={`rounded-lg border p-4 text-left transition-colors ${
              audience === "all-customers"
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/40"
            }`}
          >
            <div className="flex items-center gap-2 font-medium">
              <Users className="h-4 w-4" />
              All customers
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {counts.allCustomers} accounts — reserve this for genuinely important, infrequent
              notices, not routine updates. No unsubscribe link, same as your order emails.
            </p>
          </button>
        </div>
      </div>

      <div>
        <Label htmlFor="broadcast-subject" className="mb-2 block">
          Subject
        </Label>
        <Input
          id="broadcast-subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="What's this about?"
        />
      </div>

      <div>
        <Label htmlFor="broadcast-body" className="mb-2 block">
          Message
        </Label>
        <Textarea
          id="broadcast-body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={8}
          placeholder="Write the update here — plain text is fine, line breaks are kept."
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button variant="outline" onClick={sendTest} disabled={!ready || sending}>
          Send test to myself
        </Button>

        <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
          <Button disabled={!ready || sending} onClick={() => setConfirmOpen(true)}>
            <Send className="h-4 w-4" />
            Send to {recipientCount} recipient{recipientCount === 1 ? "" : "s"}
          </Button>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Send to {recipientCount} people?</DialogTitle>
              <DialogDescription>
                This goes out immediately to{" "}
                {audience === "subscribers" ? "everyone on the newsletter list" : "every customer account"}
                . Sending a test to yourself first is a good idea if you haven&apos;t already.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
              <Button onClick={sendReal} disabled={sending}>
                Send now
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
