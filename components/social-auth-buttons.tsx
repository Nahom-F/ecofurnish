"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { FaFacebookF, FaGithub, FaMicrosoft, FaReddit } from "react-icons/fa6";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { GoogleIcon } from "@/components/icons/GoogleIcon";
import { authClient } from "@/lib/auth-client";
import { SOCIAL_PROVIDERS, type SocialProviderId } from "@/lib/social-providers";

const ICONS: Record<SocialProviderId, React.ComponentType<{ className?: string }>> = {
  google: GoogleIcon,
  facebook: FaFacebookF,
  microsoft: FaMicrosoft,
  github: FaGithub,
  reddit: FaReddit,
};

interface SocialAuthButtonsProps {
  /** Which providers actually have credentials configured — see lib/social-providers.ts. */
  providers: SocialProviderId[];
  /** Sign-up gates these behind the terms checkbox, same as the email form's submit button. */
  disabled?: boolean;
  /** Where Better Auth sends the browser back to once the provider round-trip finishes. */
  callbackURL?: string;
}

export function SocialAuthButtons({
  providers,
  disabled,
  callbackURL = "/",
}: SocialAuthButtonsProps) {
  const [pending, setPending] = useState<SocialProviderId | null>(null);

  if (providers.length === 0) return null;

  async function handleClick(provider: SocialProviderId) {
    setPending(provider);
    await authClient.signIn.social(
      { provider, callbackURL },
      {
        // Only fires if something goes wrong before the redirect to the
        // provider even happens (e.g. misconfigured credentials) — on the
        // happy path the browser navigates away and this component unmounts.
        onError: (ctx) => {
          toast.error(ctx.error.message || `Couldn't continue with ${provider}.`);
          setPending(null);
        },
      }
    );
  }

  return (
    <div className="space-y-3">
      <div className="grid gap-2">
        {SOCIAL_PROVIDERS.filter((p) => providers.includes(p.id)).map(({ id, name }) => {
          const Icon = ICONS[id];
          return (
            <Button
              key={id}
              type="button"
              variant="outline"
              className="w-full justify-center gap-2"
              disabled={disabled || pending !== null}
              onClick={() => handleClick(id)}
            >
              {pending === id ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Icon className="h-4 w-4" />
              )}
              Continue with {name}
            </Button>
          );
        })}
      </div>

      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <div className="h-px flex-1 bg-border" />
        or
        <div className="h-px flex-1 bg-border" />
      </div>
    </div>
  );
}
