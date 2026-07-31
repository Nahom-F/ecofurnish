import { HERO_IMAGE } from "@/config/site";
import Image from "next/image";

export default function HeroImage() {
  return (
    <div className="relative flex items-center justify-center">
      <div className="absolute h-80 w-80 rounded-full bg-emerald-100 blur-3xl" />

      <Image
        src={HERO_IMAGE.src}
        alt={HERO_IMAGE.alt}
        width={550}
        height={550}
        priority
        className="relative z-10 object-contain"
      />
    </div>
  );
}