import Image from "next/image";
import { getAvatarColor, parseAvatarPreset } from "@/lib/avatar-presets";

interface AvatarDisplayProps {
  image: string | null | undefined;
  name: string;
  className?: string;
  textClassName?: string;
}

export function AvatarDisplay({
  image,
  name,
  className = "h-9 w-9 text-sm",
  textClassName = "",
}: AvatarDisplayProps) {
  const initials =
    name
      .trim()
      .split(" ")
      .map((part) => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "?";

  const preset = parseAvatarPreset(image);

  // Legacy support: if `image` is a real URL (e.g. from before this
  // preset system existed), just render it directly.
  if (image && !preset) {
    return (
      <span className={`relative block shrink-0 overflow-hidden rounded-full ${className}`}>
        <Image src={image} alt={name} fill className="object-cover" sizes="40px" />
      </span>
    );
  }

  const color = getAvatarColor(preset?.colorId);

  return (
    <span
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full font-semibold text-white ${color.className} ${className} ${textClassName}`}
    >
      {preset?.icon || initials}
    </span>
  );
}
