"use client";

import { useEffect, useId } from "react";
import Script from "next/script";

interface TurnstileWidgetProps {
  onVerify: (token: string) => void;
  onExpire?: () => void;
}

declare global {
  interface Window {
    turnstile?: {
      render: (container: string | HTMLElement, options: Record<string, unknown>) => string;
      reset: (widgetId?: string) => void;
    };
    __onTurnstileLoad?: () => void;
  }
}

export function TurnstileWidget({ onVerify, onExpire }: TurnstileWidgetProps) {
  const containerId = `turnstile-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  useEffect(() => {
    if (!siteKey) return;

    let widgetId: string | undefined;
    let cancelled = false;

    function render() {
      if (cancelled || !window.turnstile) return;
      widgetId = window.turnstile.render(`#${containerId}`, {
        sitekey: siteKey,
        callback: onVerify,
        "expired-callback": onExpire,
      });
    }

    if (window.turnstile) {
      render();
    } else {
      window.__onTurnstileLoad = render;
    }

    return () => {
      cancelled = true;
      if (widgetId && window.turnstile) {
        window.turnstile.reset(widgetId);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [siteKey, containerId]);

  if (!siteKey) {
    return (
      <p className="text-xs text-muted-foreground">
        Captcha isn&apos;t configured yet — add NEXT_PUBLIC_TURNSTILE_SITE_KEY to .env.
      </p>
    );
  }

  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?onload=__onTurnstileLoad"
        async
        defer
      />
      <div id={containerId} />
    </>
  );
}
