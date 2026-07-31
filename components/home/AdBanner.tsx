"use client";

interface AdBannerProps {
  /** Path to the ad video once you have one (e.g. from Panzoid), like "/ads/ad-1.mp4". Leave unset to show the placeholder. */
  videoSrc?: string;
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
export default function AdBanner({ videoSrc }: AdBannerProps) {
  return (
    <section className="border-y border-border/60 bg-muted/20">
      <div className="container mx-auto max-w-7xl px-4 py-10">
        <p className="mb-3 text-center text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Advertisement
        </p>

        {videoSrc ? (
          <video
            src={videoSrc}
            controls
            loop
            autoPlay
            muted
            playsInline
            className="mx-auto aspect-video w-full max-w-3xl rounded-xl bg-black"
          />
        ) : (
          <div className="mx-auto flex aspect-video w-full max-w-3xl items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/40">
            <span className="text-lg font-medium text-muted-foreground">Your Advertisement</span>
          </div>
        )}
      </div>
    </section>
  );
}
