"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { subscribeToNewsletter } from "@/app/actions/newsletter";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    setError(null);

    const result = await subscribeToNewsletter(email);
    if (result.success) {
      setStatus("done");
    } else {
      setError(result.error);
      setStatus("idle");
    }
  }

  return (
    <section className="bg-emerald-700 py-20">
      <div className="container mx-auto max-w-3xl px-4 text-center">
        <h2 className="text-4xl font-bold text-white">Join Our Newsletter</h2>
        <p className="mt-4 text-emerald-100">
          Receive exclusive offers, furniture inspiration, and early access to
          new collections.
        </p>

        {status === "done" ? (
          <p className="mt-10 font-medium text-white">
            You&apos;re on the list — check your inbox for a confirmation.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-10 flex flex-col gap-4 sm:flex-row">
            <input
              type="email"
              required
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 rounded-xl border-0 px-5 py-3 text-zinc-900 outline-none"
            />
            <button
              type="submit"
              disabled={status === "submitting"}
              className="flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 font-semibold text-emerald-700 transition hover:bg-zinc-100 disabled:opacity-70"
            >
              {status === "submitting" && <Loader2 className="h-4 w-4 animate-spin" />}
              Subscribe
            </button>
          </form>
        )}
        {error && <p className="mt-3 text-sm text-white/90">{error}</p>}
      </div>
    </section>
  );
}
