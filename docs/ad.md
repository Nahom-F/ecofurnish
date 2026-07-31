# Ad banner — setup steps

The placeholder is already live on the homepage (`components/home/AdBanner.tsx`,
placed right after the full catalog grid, before "Our Impact"). It shows
a dashed "Your Advertisement" box until you give it a real video. These
are the remaining steps to swap that in.

**Status: done for the current clip.** `ad-1.mp4` is already in
`public/ads/`, wired into the homepage, and set to loop muted like a
banner ad (visitors can unmute via the controls). The steps below are
for next time you export a new one — worth reading once even now, since
step 3 covers something Panzoid's export didn't do automatically this
round.

### 1. Make the clip in Panzoid

A couple of settings matter for how it'll actually display on the site:

- **Aspect ratio: 16:9.** The banner is styled `aspect-video` (16:9) —
  anything else gets cropped or letterboxed inside that box.
- **Keep it short.** A looping 5-15 second clip works better here than a
  long one — this is a small banner on a furniture site, not a video
  player people will sit and watch.
- **Export at 720p, not 1080p or higher.** Explained in step 3, but the
  short version: this keeps the file small enough to not be a problem on
  a free hosting plan.

### 2. Export and download it

Panzoid's default export this round came out as `.mkv` with VP8 video +
Opus audio inside it — worth knowing because of step 3 below. If yours
exports as `.mp4` with H.264 instead, you can skip straight to step 4.

### 3. Convert it to a real web-compatible MP4

This is the step that actually mattered this round, so it's worth
explaining rather than skipping past: a video's file extension and its
actual codec are two different things. Renaming a `.mkv` file (VP8 +
Opus inside) to `.mp4` doesn't change what's inside it — the browser
still has to decode VP8/Opus, and **Safari can't**, on Mac or iPhone,
regardless of what the file is named. It happened to work when you
tested it because Chrome-based browsers are more permissive about this,
which is exactly the kind of thing that looks fine while you're building
it and then quietly breaks for a chunk of real visitors.

The fix is a real re-encode, not a rename — converting the video/audio
into H.264/AAC, which every major browser plays natively inside `.mp4`.
If you have [ffmpeg](https://ffmpeg.org) installed:

```
ffmpeg -i your-export.mkv -c:v libx264 -profile:v high -pix_fmt yuv420p \
  -crf 26 -preset medium -c:a aac -b:a 128k -movflags +faststart ad-1.mp4
```

No ffmpeg installed? [CloudConvert](https://cloudconvert.com) does the
same conversion in the browser, free tier is plenty for a clip this
short — just make sure the output format is specifically "MP4 (H.264)",
not just "MP4," since some converters will happily produce an MP4
container with the same incompatible codecs still inside it.

Either way, the result should be a few MB, not tens of MB — if it comes
out much bigger than the source, drop the resolution to 720p or raise
the CRF number (26-30 is a reasonable range; higher = smaller file, a
bit softer quality).

### 4. Save it into the project

```
public/ads/ad-1.mp4
```

(To replace the current ad with a new one, overwrite this same file —
nothing else needs to change, since the homepage already points here.)

### 5. Wire it into the homepage

Already done — `app/page.tsx` already has:

```tsx
<AdBanner videoSrc="/ads/ad-1.mp4" />
```

Only relevant again if you rename the file or want a different filename.

### 6. Test it locally

```
pnpm dev
```

Visit `http://localhost:3000` and scroll to the banner (right after the
full catalog). It should autoplay muted and loop — use the speaker icon
in the controls to unmute.

### 7. Deploy

Nothing extra to configure — the file ships as part of your normal
deploy since it's in `public/`, same as your product photos.

### Later, if you want more than one ad

Right now `AdBanner` always shows the same clip. If you want to rotate
between a few different ads (e.g. show a different one per visit, or
swap seasonally), that's a small follow-up change to the component
rather than something to build now — say the word when you're there and
I'll add it.
