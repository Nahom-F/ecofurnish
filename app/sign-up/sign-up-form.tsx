"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, Mail, Lock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/password-input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { signUp, sendVerificationEmail } from "@/lib/auth-client";
import { PasswordStrengthMeter } from "@/components/password-strength-meter";
import { passesAllChecks } from "@/lib/password-strength";
import { TurnstileWidget } from "@/components/turnstile-widget";
import { verifyCaptcha } from "@/app/actions/captcha";
import { SocialAuthButtons } from "@/components/social-auth-buttons";
import { AuthSidePanel } from "@/components/auth/AuthSidePanel";
import type { SocialProviderId } from "@/lib/social-providers";

export function SignUpForm({ socialProviders }: { socialProviders: SocialProviderId[] }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
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
    <div className="bg-emerald-50/50 dark:bg-transparent">
      <div className="container mx-auto grid max-w-6xl gap-12 px-4 py-12 lg:max-w-7xl lg:grid-cols-2 lg:items-center lg:gap-16 lg:py-20">
        <AuthSidePanel
          heading={<>Join us.</>}
          subheading={
            <>
              Create an account to start your{" "}
              <span className="font-medium text-primary">sustainable</span> journey.
            </>
          }
        />

        <div className="mx-auto w-full max-w-sm rounded-2xl border border-border/60 bg-card p-8 shadow-xl lg:mx-0 lg:max-w-md lg:p-10">
          {awaitingVerification ? (
            <div className="text-center">
              <h2 className="text-2xl font-bold tracking-tight lg:text-3xl">Check your email</h2>
              <p className="mt-3 text-sm text-muted-foreground">
                We sent a verification link to your inbox. Click it to activate your account,
                then come back and sign in.
              </p>
              <Button className="mt-6 w-full lg:h-11" render={<Link href="/sign-in" />} nativeButton={false}>
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
          ) : (
            <>
              <h2 className="text-2xl font-bold tracking-tight lg:text-3xl">Create an account</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Faster checkout and order tracking, for future orders.
              </p>

              <label className="mt-6 flex items-start gap-2 text-sm text-muted-foreground">
                <Checkbox
                  checked={agreedToTerms}
                  onCheckedChange={(checked) => setAgreedToTerms(checked === true)}
                  className="mt-0.5"
                />
                <span>
                  I agree to the{" "}
                  <Link
                    href="/terms"
                    target="_blank"
                    className="font-medium text-foreground hover:underline"
                  >
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link
                    href="/privacy"
                    target="_blank"
                    className="font-medium text-foreground hover:underline"
                  >
                    Privacy Policy
                  </Link>
                  .
                </span>
              </label>

              <div className="mt-4">
                <SocialAuthButtons providers={socialProviders} disabled={!agreedToTerms} />
              </div>

              <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="name">Name</Label>
                  <div className="relative">
                    <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="name"
                      name="name"
                      required
                      autoComplete="name"
                      placeholder="Your name"
                      className="pl-9 lg:h-11"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      autoComplete="email"
                      placeholder="Enter your email"
                      className="pl-9 lg:h-11"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <PasswordInput
                      id="password"
                      name="password"
                      required
                      autoComplete="new-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Create a password"
                      className="pl-9 lg:h-11"
                    />
                  </div>
                </div>

                {password.length > 0 && <PasswordStrengthMeter password={password} />}

                <div className="space-y-1.5">
                  <Label>Verify you&apos;re human</Label>
                  <TurnstileWidget onVerify={setCaptchaToken} onExpire={() => setCaptchaToken(null)} />
                </div>

                {error && <p className="text-sm text-destructive">{error}</p>}

                <Button
                  type="submit"
                  className="w-full lg:h-11"
                  disabled={loading || !passwordValid || !agreedToTerms}
                >
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  Create account
                </Button>
              </form>

              <p className="mt-6 text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link href="/sign-in" className="font-medium text-primary hover:underline">
                  Sign in
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
