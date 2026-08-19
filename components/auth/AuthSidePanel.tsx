import Image from "next/image";
import { Leaf, Heart } from "lucide-react";

// Shared decorative side for /sign-in and /sign-up — kept in one place so
// the two pages can't visually drift apart from each other. Purely
// decorative: no form logic lives here, hidden below the lg breakpoint
// since a photo collage this size doesn't work on a phone screen.
export function AuthSidePanel({
  heading,
  subheading,
}: {
  heading: React.ReactNode;
  subheading: React.ReactNode;
}) {
  return (
    <div className="hidden lg:block">
      <h1 className="text-5xl font-extrabold leading-tight tracking-tight text-foreground">
        {heading}
      </h1>
      <p className="mt-4 max-w-sm text-muted-foreground">{subheading}</p>

      <div className="relative mt-14 h-[420px]">
        <div className="absolute left-0 top-4 w-64 -rotate-3 overflow-hidden rounded-2xl border-4 border-white shadow-xl dark:border-card">
          <Image
            src="/images/products/eco-lounge-chair.jpg"
            alt=""
            width={400}
            height={480}
            className="h-72 w-full object-cover"
          />
        </div>
        <div className="absolute right-2 top-24 w-56 rotate-2 overflow-hidden rounded-2xl border-4 border-white shadow-xl dark:border-card">
          <Image
            src="/images/products/sofa.jpg"
            alt=""
            width={400}
            height={320}
            className="h-52 w-full object-cover"
          />
        </div>
        <div className="absolute bottom-0 left-24 w-40 -rotate-2 overflow-hidden rounded-2xl border-4 border-white shadow-lg dark:border-card">
          <Image
            src="/images/products/plant-stand.jpg"
            alt=""
            width={280}
            height={280}
            className="h-36 w-full object-cover"
          />
        </div>

        <span className="absolute right-16 top-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg">
          <Leaf className="h-5 w-5" />
        </span>
        <span className="absolute bottom-6 right-4 flex h-11 w-11 items-center justify-center rounded-full bg-white text-primary shadow-lg dark:bg-card">
          <Heart className="h-4.5 w-4.5" fill="currentColor" />
        </span>
      </div>
    </div>
  );
}
