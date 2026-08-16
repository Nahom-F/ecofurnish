"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/password-input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { signIn, authClient } from "@/lib/auth-client";
import { TurnstileWidget } from "@/components/turnstile-widget";
import { SocialAuthButtons } from "@/components/social-auth-buttons";
import type { SocialProviderId } from "@/lib/social-providers";
import { verifyCaptcha } from "@/app/actions/captcha";
import { toast } from "sonner";

export function SignInForm({ socialProviders }: { socialProviders: SocialProviderId[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);
  const [resending, setResending] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // Must read FormData synchronously, before any `await` below —
    // e.currentTarget isn't reliably valid once an awaited promise resolves.
    const formData = new FormData(e.currentTarget);

    setLoading(true);
    setError(null);
    setUnverifiedEmail(null);

    const captchaResult = await verifyCaptcha(captchaToken);
    if (!captchaResult.success) {
      setError(captchaResult.error);
      setLoading(false);
      return;
    }

    const email = String(formData.get("email") || "");

    await signIn.email(
      { email, password: String(formData.get("password") || ""), rememberMe },
      {
        onSuccess: () => router.push("/"),
        onError: (ctx) => {
          const message = ctx.error.message || "Couldn't sign in with those details.";
          // better-auth blocks sign-in for unverified accounts (requireEmailVerification
          // is on) — detect that case so we can offer to resend the link instead of
          // just showing a generic error.
          if (/verify|verification/i.test(message)) {
            setUnverifiedEmail(email);
          } else {
            setError(message);
          }
          setLoading(false);
        },
      }
    );
  }

  async function handleResend() {
    if (!unverifiedEmail) return;
    setResending(true);
    await authClient.sendVerificationEmail(
      { email: unverifiedEmail },
      {
        onSuccess: () => {
          toast.success("Verification email sent — check your inbox.");
        },
        onError: (ctx) => {
          toast.error(ctx.error.message || "Couldn't resend the email.");
        },
        onResponse: () => setResending(false),
      }
    );
  }

  return (
    <div className="container mx-auto flex max-w-sm flex-col justify-center px-4 py-24">
      <h1 className="text-2xl font-bold tracking-tight">Sign in</h1>
      <p className="mt-1 text-sm text-muted-foreground">Welcome back to EcoFurnish.</p>

      {unverifiedEmail ? (
        <div className="mt-6 space-y-4 rounded-lg border border-border/60 p-4 text-sm">
          <p className="text-muted-foreground">
            <span className="font-medium text-foreground">{unverifiedEmail}</span> hasn&apos;t been
            verified yet. Check your inbox for the link, or send a new one.
          </p>
          <Button onClick={handleResend} disabled={resending} className="w-full" size="sm">
            {resending && <Loader2 className="h-4 w-4 animate-spin" />}
            Resend verification email
          </Button>
          <button
            type="button"
            onClick={() => setUnverifiedEmail(null)}
            className="w-full text-center text-xs text-muted-foreground hover:underline"
          >
            Back to sign in
          </button>
        </div>
      ) : (
        <>
          <div className="mt-6">
            <SocialAuthButtons providers={socialProviders} />
          </div>

          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required autoComplete="email" />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-medium text-muted-foreground hover:text-foreground hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <PasswordInput id="password" name="password" required autoComplete="current-password" />
            </div>

            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <Checkbox checked={rememberMe} onCheckedChange={setRememberMe} />
              Remember me
            </label>

            <TurnstileWidget onVerify={setCaptchaToken} onExpire={() => setCaptchaToken(null)} />

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Sign in
            </Button>
          </form>
        </>
      )}

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link href="/sign-up" className="font-medium text-foreground hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}
