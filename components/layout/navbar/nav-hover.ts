// Icon buttons (search, wishlist, cart, account, theme) get their own
// always-visible pill — a soft, circular frame at rest, not just an
// invisible hover target — since an icon alone (no text label) benefits
// from a visible tap/click area more than a text link does. On hover the
// SAME pill brightens and grows, rather than just the glyph inside it:
// a stronger tint plus a blur, so it reads as the whole button lighting
// up, not only the icon symbol scaling in place.
//
// `scale` (not padding or width) is what makes the hovered pill grow —
// transforms don't take up layout space, so it gets visibly bigger
// without nudging its neighbors. `relative z-10` on hover keeps it
// painting above adjacent items instead of getting clipped if the grown
// size overlaps into their space. The same brighter/bigger treatment
// applies on `aria-expanded` (open dropdown state) so a dropdown trigger
// doesn't flatten back out the moment its menu opens and the cursor
// drifts off.
export const NAV_HOVER_ICON =
  "relative rounded-full bg-white/50 transition-all duration-200 dark:bg-black/30 hover:z-10 hover:scale-110 hover:bg-white/80 hover:backdrop-blur-md dark:hover:bg-black/60 aria-expanded:z-10 aria-expanded:scale-110 aria-expanded:bg-white/80 aria-expanded:backdrop-blur-md dark:aria-expanded:bg-black/60";

// Nav links stay boxless at rest — confirmed this is the one that's
// already right — and add a color/weight change on top of the frosted
// pill on hover. Real font-weight (font-bold) reflows text a hair wider
// at the same font-size — unlike scale, that DOES take up layout space,
// which is exactly the kind of shift that would nudge a sibling link
// sideways. A doubled text-shadow fakes the thicker-stroke look of bold
// without changing the text's measured width, so neighbors never move.
export const NAV_HOVER_LINK =
  "relative block rounded-xl px-3 py-1.5 transition-all duration-200 hover:z-10 hover:scale-110 hover:bg-white/10 hover:backdrop-blur-md hover:text-emerald-700 hover:[text-shadow:0_0_0.3px_currentColor,0_0_0.3px_currentColor] dark:hover:bg-black/20";
