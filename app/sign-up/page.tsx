"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/password-input";
import { Label } from "@/components/ui/label";
import { signUp, sendVerificationEmail } from "@/lib/auth-client";
import { PasswordStrengthMeter } from "@/components/password-strength-meter";
import { passesAllChecks } from "@/lib/password-strength";
import { TurnstileWidget } from "@/components/turnstile-widget";
import { verifyCaptcha } from "@/app/actions/captcha";

export default function SignUpPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [awaitingVerification, setAwaitingVerification] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");
  const [resendState, setResendState] = useState<"idle" | "sending" | "sent">("idle");

  const passwordValid = passesAllChecks(password);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!passwordValid) {
      setError("Please meet all the password requirements below.");
      return;
    }

    // FormData must be read synchronously, before any `await` — by the time
    // an awaited promise resolves, the synthetic event's dispatch phase has
    // ended and `e.currentTarget` can no longer be relied on.
    const formData = new FormData(e.currentTarget);

    setLoading(true);

    const captchaResult = await verifyCaptcha(captchaToken);
    if (!captchaResult.success) {
      setError(captchaResult.error);
      setLoading(false);
      return;
    }

    const name = String(formData.get("name") || "");
    const email = String(formData.get("email") || "");

    await signUp.email(
      { name, email, password },
      {
        onSuccess: () => {
          setSubmittedEmail(email);
          setAwaitingVerification(true);
          setLoading(false);
        },
        onError: (ctx) => {
          setError(ctx.error.message || "Couldn't create your account.");
          setLoading(false);
        },
      }
    );
  }

  if (awaitingVerification) {
    async function handleResend() {
      setResendState("sending");
      await sendVerificationEmail(
        { email: submittedEmail, callbackURL: "/" },
        {
          onSuccess: () => setResendState("sent"),
          onError: () => setResendState("idle"),
        }
      );
    }

    return (
      <div className="container mx-auto flex max-w-sm flex-col justify-center px-4 py-24 text-center">
        <h1 className="text-2xl font-bold tracking-tight">Check your email</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          We sent a verification link to your inbox. Click it to activate your account, then
          come back and sign in.
        </p>
        <Button className="mt-6" render={<Link href="/sign-in" />} nativeButton={false}>
          Go to sign in
        </Button>
        <button
          type="button"
          onClick={handleResend}
          disabled={resendState !== "idle"}
          className="mt-4 text-sm font-medium text-foreground hover:underline disabled:no-underline disabled:text-muted-foreground"
        >
          {resendState === "sent"
            ? "Sent — check your inbox"
            : resendState === "sending"
              ? "Sending…"
              : "Link expired or never arrived? Send a new one"}
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto flex max-w-sm flex-col justify-center px-4 py-24">
      <h1 className="text-2xl font-bold tracking-tight">Create an account</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Faster checkout and order tracking, for future orders.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" required autoComplete="name" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required autoComplete="email" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <PasswordInput
            id="password"
            name="password"
            required
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {password.length > 0 && <PasswordStrengthMeter password={password} />}

        <div className="space-y-1.5">
          <Label>Verify you&apos;re human</Label>
          <TurnstileWidget onVerify={setCaptchaToken} onExpire={() => setCaptchaToken(null)} />
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <Button type="submit" className="w-full" disabled={loading || !passwordValid}>
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Create account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/sign-in" className="font-medium text-foreground hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
