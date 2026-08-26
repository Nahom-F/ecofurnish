// Shared hover/focus treatment for dropdown-style menu items — Select
// options (Room/Category/Currency filters, this project's own admin
// pickers) and the free-text category combobox in the admin product
// form. A soft brand-green glow, in the same emerald tones used across
// the navbar redesign, replacing the generic bg-accent highlight so
// every dropdown in the app reads as the same "glowing green"
// interactive language rather than a plain browser default.
//
// Applied on both hover: and focus:, not focus: alone — the admin
// category combobox's suggestion buttons call preventDefault() in
// onMouseDown (see product-form.tsx) so the click never actually
// focuses them, which meant a focus-only style had zero visible effect
// there even though it worked fine in the keyboard-focusable Select
// dropdowns.
export const DROPDOWN_ITEM_HOVER =
  "hover:bg-accent/40 hover:text-emerald-700 hover:shadow-[0_2px_8px_rgba(6,78,59,0.15)] focus:bg-accent/40 focus:text-emerald-700 focus:shadow-[0_2px_8px_rgba(6,78,59,0.15)] dark:hover:text-emerald-400 dark:hover:shadow-[0_2px_10px_rgba(16,185,129,0.18)] dark:focus:text-emerald-400 dark:focus:shadow-[0_2px_10px_rgba(16,185,129,0.18)]";

