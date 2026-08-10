"use client";

import { useEffect, useRef, useState } from "react";
import { MessageCircle, X, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { askSupportBot } from "@/app/actions/support-chat";

interface Message {
  role: "user" | "bot";
  text: string;
}

const GREETING: Message = {
  role: "bot",
  text: "Hi! I'm the EcoFurnish assistant. Ask me about products, delivery, or how ordering works.",
};

export default function SupportChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([GREETING]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, sending]);

  async function handleSend() {
    const text = input.trim();
    if (!text || sending) return;
    setMessages((prev) => [...prev, { role: "user", text }]);
    setInput("");
    setSending(true);
    try {
      const reply = await askSupportBot(text);
      setMessages((prev) => [...prev, { role: "bot", text: reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: "Something went wrong on my end — please try again." },
      ]);
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      {open && (
        <div className="fixed inset-x-4 bottom-36 z-50 flex h-[60vh] max-h-[480px] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl sm:inset-x-auto sm:right-6 sm:bottom-24 sm:w-96 md:bottom-24">
          <div className="flex items-center justify-between border-b border-border bg-emerald-700 px-4 py-3 text-white">
            <span className="text-sm font-semibold">EcoFurnish Support</span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close support chat"
              className="rounded-md p-1 hover:bg-white/10"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                  m.role === "user"
                    ? "ml-auto bg-emerald-700 text-white"
                    : "bg-muted text-foreground"
                }`}
              >
                {m.text}
              </div>
            ))}
            {sending && (
              <div className="flex items-center gap-1.5 rounded-2xl bg-muted px-3 py-2 text-sm text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Thinking…
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 border-t border-border p-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Ask a question…"
              maxLength={500}
              className="flex-1 rounded-full border border-border bg-background px-4 py-2 text-sm outline-none focus:border-emerald-700"
            />
            <Button
              size="icon"
              onClick={handleSend}
              disabled={sending || !input.trim()}
              aria-label="Send message"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close support chat" : "Open support chat"}
        className="fixed bottom-20 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-700 text-white shadow-lg transition-transform hover:scale-105 md:bottom-6 md:right-6"
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>
    </>
  );
}
