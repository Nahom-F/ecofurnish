"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { FaDiscord, FaGithub } from "react-icons/fa6";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { GoogleIcon } from "@/components/icons/GoogleIcon";
import { MicrosoftIcon } from "@/components/icons/MicrosoftIcon";
import { authClient } from "@/lib/auth-client";
import { SOCIAL_PROVIDERS, type SocialProviderId } from "@/lib/social-providers";

const ICONS: Record<
  SocialProviderId,
  React.ComponentType<{ className?: string; style?: React.CSSProperties }>
> = {
  google: GoogleIcon,
  microsoft: MicrosoftIcon,
  github: FaGithub,
  discord: FaDiscord,
};

// Only set for providers whose brand mark is meant to render in a fixed
// signature color rather than inherit the button's neutral text color
// (GitHub's own guidelines are fine monochrome; Google and Microsoft get
// their own multi-color SVGs instead of a color override — see
// components/icons/GoogleIcon.tsx and MicrosoftIcon.tsx).
const ICON_COLORS: Partial<Record<SocialProviderId, string>> = {
  discord: "#5865F2", // Discord "blurple"
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
    <div className="space-y-2.5 lg:space-y-3">
      <div className="grid gap-1.5 lg:gap-2.5">
        {SOCIAL_PROVIDERS.filter((p) => providers.includes(p.id)).map(({ id, name }) => {
          const Icon = ICONS[id];
          const color = ICON_COLORS[id];
          return (
            <Button
              key={id}
              type="button"
              variant="outline"
              size="sm"
              className="w-full justify-center gap-1.5 lg:h-11 lg:gap-2.5 lg:px-4 lg:text-[0.95rem]"
              disabled={disabled || pending !== null}
              onClick={() => handleClick(id)}
            >
              {pending === id ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin lg:h-5 lg:w-5" />
              ) : (
                <Icon className="h-3.5 w-3.5 lg:h-5 lg:w-5" style={color ? { color } : undefined} />
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
