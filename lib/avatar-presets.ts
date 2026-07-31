// Avatars are stored as a small encoded string in the user's `image`
// field — "preset:<colorId>:<icon>" — not an uploaded file. No storage
// service needed, and it's the same for a user on any device, which a
// locally-uploaded file could never be.

export interface AvatarColor {
  id: string;
  label: string;
  className: string; // gradient background
}

export const AVATAR_COLORS: AvatarColor[] = [
  { id: "emerald-gold", label: "Emerald Gold", className: "bg-linear-to-br from-emerald-600 to-amber-400" },
  { id: "silver", label: "Silver", className: "bg-linear-to-br from-slate-400 to-slate-200" },
  { id: "forest-mist", label: "Forest Mist", className: "bg-linear-to-br from-green-700 to-teal-400" },
  { id: "ocean", label: "Ocean", className: "bg-linear-to-br from-cyan-600 to-blue-500" },
  { id: "clay-sunset", label: "Clay Sunset", className: "bg-linear-to-br from-orange-500 to-rose-400" },
  { id: "berry", label: "Berry", className: "bg-linear-to-br from-purple-600 to-pink-500" },
  { id: "copper", label: "Copper", className: "bg-linear-to-br from-orange-700 to-yellow-500" },
  { id: "moss", label: "Moss", className: "bg-linear-to-br from-lime-600 to-emerald-700" },
];

// Eco/furniture-themed, on brand — not generic smileys.
export const AVATAR_ICONS = [
  { id: "none", label: "Initials", emoji: null },
  { id: "leaf", label: "Leaf", emoji: "🌿" },
  { id: "plant", label: "Potted plant", emoji: "🪴" },
  { id: "tree", label: "Tree", emoji: "🌳" },
  { id: "sofa", label: "Sofa", emoji: "🛋️" },
  { id: "chair", label: "Chair", emoji: "🪑" },
  { id: "recycle", label: "Recycle", emoji: "♻️" },
  { id: "wood", label: "Wood", emoji: "🪵" },
  { id: "globe", label: "Globe", emoji: "🌍" },
] as const;

export function getAvatarColor(colorId: string | undefined): AvatarColor {
  return AVATAR_COLORS.find((c) => c.id === colorId) ?? AVATAR_COLORS[0];
}

/** Parses the `preset:<colorId>:<icon>` string stored in user.image. */
export function parseAvatarPreset(value: string | null | undefined) {
  if (!value || !value.startsWith("preset:")) return null;
  const [, colorId, icon] = value.split(":");
  return { colorId, icon: icon || null };
}

export function encodeAvatarPreset(colorId: string, icon: string | null) {
  return `preset:${colorId}:${icon ?? ""}`;
}
