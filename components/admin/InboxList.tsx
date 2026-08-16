"use client";

import { useState } from "react";
import { Mail, MailOpen, ChevronDown, ChevronUp } from "lucide-react";
import { markInboundEmailRead } from "@/app/admin/actions";

interface InboundEmail {
  id: string;
  fromEmail: string;
  toEmail: string;
  subject: string | null;
  text: string | null;
  html: string | null;
  read: boolean;
  receivedAt: Date;
}

export function InboxList({ emails }: { emails: InboundEmail[] }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const [localEmails, setLocalEmails] = useState(emails);

  async function toggleOpen(email: InboundEmail) {
    const opening = openId !== email.id;
    setOpenId(opening ? email.id : null);

    if (opening && !email.read) {
      setLocalEmails((prev) => prev.map((e) => (e.id === email.id ? { ...e, read: true } : e)));
      try {
        await markInboundEmailRead(email.id, true);
      } catch {
        // Not worth a toast for this — worst case it shows unread again
        // on next page load, no data lost.
      }
    }
  }

  return (
    <div className="divide-y divide-border/60 rounded-lg border border-border/60">
      {localEmails.map((email) => {
        const isOpen = openId === email.id;
        return (
          <div key={email.id}>
            <button
              type="button"
              onClick={() => toggleOpen(email)}
              className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/40"
            >
              {email.read ? (
                <MailOpen className="h-4 w-4 shrink-0 text-muted-foreground" />
              ) : (
                <Mail className="h-4 w-4 shrink-0 text-primary" />
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className={`truncate text-sm ${email.read ? "font-normal" : "font-semibold"}`}>
                    {email.subject || "(no subject)"}
                  </span>
                </div>
                <p className="truncate text-xs text-muted-foreground">
                  {email.fromEmail} → {email.toEmail}
                </p>
              </div>
              <span className="shrink-0 text-xs text-muted-foreground">
                {new Date(email.receivedAt).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                })}
              </span>
              {isOpen ? (
                <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
              )}
            </button>

            {isOpen && (
              <div className="border-t border-border/60 bg-muted/20 px-4 py-4">
                {email.html ? (
                  <div
                    className="prose prose-sm max-w-none text-foreground"
                    // Admin-only surface, and Resend has already parsed this
                    // out of a real email — same trust level as any other
                    // email client rendering HTML mail.
                    dangerouslySetInnerHTML={{ __html: email.html }}
                  />
                ) : (
                  <p className="whitespace-pre-wrap text-sm text-foreground">
                    {email.text || "(empty message)"}
                  </p>
                )}
                <a
                  href={`mailto:${email.fromEmail}?subject=${encodeURIComponent(
                    "Re: " + (email.subject || "")
                  )}`}
                  className="mt-4 inline-block text-sm font-medium text-primary hover:underline"
                >
                  Reply via email
                </a>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
