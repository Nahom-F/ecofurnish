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
 *
 * Also force-refreshes on bfcache restoration (the `pageshow` event
 * with `event.persisted === true`). iOS Safari in particular can
 * restore a fully-frozen snapshot of a page — DOM, JS heap, everything
 * — on back/forward navigation (and sometimes what looks like a plain
 * reload inside a PWA) without ever making a new network request, so
 * neither the server nor the service worker gets a chance to serve
 * fresh data. This is the actual mechanism behind "I approved
 * something, reloaded, and it reverted" — the approval genuinely
 * happened server-side; the page just never re-fetched at all.
 */
export function AutoRefresh({ intervalSeconds = 15 }: { intervalSeconds?: number }) {
  const router = useRouter();

  useEffect(() => {
    const id = setInterval(() => router.refresh(), intervalSeconds * 1000);

    function handlePageShow(event: PageTransitionEvent) {
      if (event.persisted) router.refresh();
    }
    window.addEventListener("pageshow", handlePageShow);

    return () => {
      clearInterval(id);
      window.removeEventListener("pageshow", handlePageShow);
    };
  }, [router, intervalSeconds]);

  return null;
}
