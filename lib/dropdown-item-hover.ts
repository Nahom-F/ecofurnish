// Shared hover/focus treatment for dropdown-style menu items — Select
// options (Room/Category/Currency filters, this project's own admin
// pickers) and the free-text category combobox in the admin product
// form. An underline plus a soft brand-green glow, in the same emerald
// tones used across the navbar redesign, replacing the generic
// bg-accent highlight so every dropdown in the app reads as the same
// "glowing green" interactive language rather than a plain browser
// default.
export const DROPDOWN_ITEM_HOVER =
  "focus:bg-accent/40 focus:text-emerald-700 focus:underline focus:shadow-[0_2px_8px_rgba(6,78,59,0.15)] dark:focus:text-emerald-400 dark:focus:shadow-[0_2px_10px_rgba(16,185,129,0.18)]";
