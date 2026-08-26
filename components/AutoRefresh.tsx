"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Renders nothing — just periodically calls router.refresh() so a
 * server-rendered page's data stays current without the person needing
 * to manually reload. Drop it anywhere in the tree (once per page is
 * enough). React reconciliation preserves other components' local
 * state (open dialogs, form inputs) across a refresh as long as the
 * tree shape doesn't change, so this is safe to leave running even
 * while someone's mid-interaction elsewhere on the page.
 */
export function AutoRefresh({ intervalSeconds = 15 }: { intervalSeconds?: number }) {
  const router = useRouter();

  useEffect(() => {
    const id = setInterval(() => router.refresh(), intervalSeconds * 1000);
    return () => clearInterval(id);
  }, [router, intervalSeconds]);

  return null;
}
