// Shared hover styling for every navbar item — nav links and icon buttons
// alike stay flat/boxless at rest, then get a frosted-glass pill on
// hover: a faint white tint in light mode, black in dark mode, blurred so
// whatever's behind it (the header's own background) blurs a touch more
// right where the cursor is.
//
// `scale` (not padding, width, or font-size) is what makes the hovered
// item grow — transforms don't take up layout space, so the item gets
// visibly bigger without nudging its neighbors. `relative z-10` on hover
// keeps it painting above adjacent items instead of getting clipped if
// the grown size overlaps into their space. The same treatment applies
// on `aria-expanded` (open dropdown state) so a dropdown trigger doesn't
// flatten back out the moment its menu opens and the cursor drifts off.
export const NAV_HOVER_ICON =
  "relative rounded-xl transition-all duration-200 hover:z-10 hover:scale-110 hover:bg-white/10 hover:backdrop-blur-md dark:hover:bg-black/20 aria-expanded:z-10 aria-expanded:bg-white/10 aria-expanded:backdrop-blur-md dark:aria-expanded:bg-black/20";

// Nav links add a color/weight change on top of the pill above. Real
// font-weight (font-bold) reflows text a hair wider at the same
// font-size — unlike scale, that DOES take up layout space, which is
// exactly the kind of shift that would nudge a sibling link sideways. A
// doubled text-shadow fakes the thicker-stroke look of bold without
// changing the text's measured width, so neighbors never move.
export const NAV_HOVER_LINK =
  "relative block rounded-xl px-3 py-1.5 transition-all duration-200 hover:z-10 hover:scale-110 hover:bg-white/10 hover:backdrop-blur-md hover:text-emerald-700 hover:[text-shadow:0_0_0.3px_currentColor,0_0_0.3px_currentColor] dark:hover:bg-black/20";
