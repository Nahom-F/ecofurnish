"use client";

import { useEffect, useRef, useState } from "react";

interface AdBannerProps {
  /** Path to the ad video once you have one (e.g. from Panzoid), like "/ads/ad-1.mp4". Leave unset to show the placeholder. */
  videoSrc?: string;
  /** Poster frame shown before the clip mounts/plays — also what's visible
   * to anyone who never scrolls this far, so it costs nothing extra. */
  posterSrc?: string;
}

// Placeholder ad slot. Until videoSrc is set, this just shows a labeled
// placeholder block so the layout and spacing are real even before you
// have a real clip to drop in. Once you export something from Panzoid,
// save it to /public/ads/ and pass its path as videoSrc.
//
// Loops muted+autoplay, like a banner ad rather than a video someone
// presses play on — muted is required for autoplay to work in any
// browser, and playsInline stops iOS Safari from forcing fullscreen.
// `controls` is still there so a visitor can unmute or pause it.
//
// The <video> itself isn't mounted until this section is about to enter
// the viewport (IntersectionObserver below). Previously it sat right in
// the initial HTML with autoPlay, so the browser fetched and started
// decoding the full clip on every homepage load — main-thread work and
// network bytes spent on an ad most visitors hadn't scrolled to yet, or
// ever would. A lightweight poster image + `preload="none"` stands in
// until then, so the request for the actual video only fires once it's
// genuinely about to be seen.
export default function AdBanner({ videoSrc, posterSrc }: AdBannerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    if (!videoSrc || shouldLoad) return;
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      // Starts loading a little before it's actually on screen so it's
      // ready (not still buffering) by the time someone scrolls to it.
      { rootMargin: "300px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [videoSrc, shouldLoad]);

  return (
    <section className="border-y border-border/60 bg-muted/20">
      <div className="container mx-auto max-w-7xl px-4 py-10">
        <p className="mb-3 text-center text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Advertisement
        </p>

        {videoSrc ? (
          <div ref={containerRef} className="mx-auto aspect-video w-full max-w-3xl">
            {shouldLoad ? (
              <video
                src={videoSrc}
                poster={posterSrc}
                controls
                loop
                autoPlay
                muted
                playsInline
                preload="none"
                className="h-full w-full rounded-xl bg-black object-cover"
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element -- this
              // is a tiny static poster frame, not worth next/image's
              // optimization pipeline for something already this small.
              <img
                src={posterSrc}
                alt=""
                className="h-full w-full rounded-xl bg-black object-cover"
              />
            )}
          </div>
        ) : (
          <div className="mx-auto flex aspect-video w-full max-w-3xl items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/40">
            <span className="text-lg font-medium text-muted-foreground">Your Advertisement</span>
          </div>
        )}
      </div>
    </section>
  );
}
