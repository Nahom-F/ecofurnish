// Soft-UI / neumorphic navbar buttons — nav links and icon buttons alike
// are now always-visible floating pills, not invisible-until-hover: a
// cream/white background, generously padded, very rounded, with a soft
// ambient shadow underneath that reads as gently raised off the page.
// Hovering deepens that shadow and grows the pill slightly, rather than
// introducing a background that wasn't there before — the "raised"
// button gets MORE raised, not switched on from flat.
//
// This replaces the earlier invisible-until-hover / frosted-blur version
// of this file — that approach doesn't really combine with an opaque
// soft-3D card look, so the backdrop-blur is dropped here. Flag if you
// still want a frosted/glassy quality layered on top of this — it's a
// different visual language from neumorphism and would need its own
// pass to look intentional rather than muddy.
//
// `scale` (not padding or width) is what makes the hovered pill grow —
// transforms don't take up layout space, so it gets bigger without
// nudging its neighbors. `relative z-10` on hover keeps it painting
// above adjacent items instead of getting clipped if the grown size
// overlaps into their space. The same deepen-on-hover treatment applies
// on `aria-expanded` (open dropdown state) so a dropdown trigger doesn't
// flatten back out the moment its menu opens and the cursor drifts off.
// The fill itself is a custom color, not a Tailwind swatch — matching a
// generic green (like emerald-50) risked landing on a slightly different
// hue than the page's own custom green theme (this site's greens lean
// warmer/olive; emerald leans cooler/teal), which would look like a
// mismatched sticker rather than a lighter shade of the same surface.
// Pulled the hue straight from this theme's own CSS variables
// (app/globals.css) and kept it, just pushed lighter/more saturated than
// the page background so the pill reads as a raised, tinted surface
// rather than plain white — same idea in dark mode: lighter and a touch
// more saturated than the dark background/card, which is the direction
// "raised" reads correctly in dark mode too.
const NEUMORPHIC_BASE =
  "relative bg-[oklch(0.97_0.05_130)] shadow-[0_3px_10px_rgba(6,78,59,0.12)] transition-all duration-200 dark:bg-[oklch(0.30_0.05_145)] dark:shadow-[0_0_14px_rgba(16,185,129,0.12)]";

const NEUMORPHIC_HOVER =
  "hover:z-10 hover:scale-110 hover:shadow-[0_6px_18px_rgba(6,78,59,0.20)] dark:hover:shadow-[0_0_22px_rgba(16,185,129,0.22)] aria-expanded:z-10 aria-expanded:scale-110 aria-expanded:shadow-[0_6px_18px_rgba(6,78,59,0.20)] dark:aria-expanded:shadow-[0_0_22px_rgba(16,185,129,0.22)]";

// Icon buttons (search, wishlist, cart, account, theme) — circular,
// padding supplied per-component (p-1/p-2) since avatar vs. icon sizes
// differ slightly.
export const NAV_HOVER_ICON = `${NEUMORPHIC_BASE} ${NEUMORPHIC_HOVER} rounded-full`;

// Nav links — pill-shaped (very large radius on a text-width box, not a
// perfect circle), generous padding so they read as wide and comfortable
// rather than text with a background stapled on. Text goes solid
// dark-green-ish (not the old /80-opacity muted tone) since these are
// now defined buttons, not subtle inline links. Real font-weight
// (font-bold) reflows text a hair wider at the same font-size — unlike
// scale, that DOES take up layout space, which would nudge a sibling
// pill sideways — so hovering thickens the letterforms with a doubled
// text-shadow instead, which fakes the look without changing measured
// width.
export const NAV_HOVER_LINK = `${NEUMORPHIC_BASE} ${NEUMORPHIC_HOVER} block rounded-full px-5 py-2.5 text-sm font-medium text-foreground hover:text-emerald-700 hover:[text-shadow:0_0_0.3px_currentColor,0_0_0.3px_currentColor]`;
