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
      <h1 className="text-6xl font-extrabold leading-tight tracking-tight text-foreground">
        {heading}
      </h1>
      <p className="mt-5 max-w-md text-lg text-muted-foreground">{subheading}</p>

      <div className="relative mt-16 h-[480px]">
        <div className="absolute left-0 top-4 w-72 -rotate-3 overflow-hidden rounded-2xl border-4 border-white shadow-xl dark:border-card">
          <Image
            src="/images/products/eco-lounge-chair.jpg"
            alt=""
            width={440}
            height={520}
            className="h-80 w-full object-cover"
          />
        </div>
        <div className="absolute right-0 top-28 w-64 rotate-2 overflow-hidden rounded-2xl border-4 border-white shadow-xl dark:border-card">
          <Image
            src="/images/products/sofa.jpg"
            alt=""
            width={440}
            height={360}
            className="h-60 w-full object-cover"
          />
        </div>
        <div className="absolute bottom-0 left-28 w-44 -rotate-2 overflow-hidden rounded-2xl border-4 border-white shadow-lg dark:border-card">
          <Image
            src="/images/products/plant-stand.jpg"
            alt=""
            width={300}
            height={300}
            className="h-40 w-full object-cover"
          />
        </div>

        <span className="absolute right-20 top-2 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg">
          <Leaf className="h-6 w-6" />
        </span>
        <span className="absolute bottom-8 right-6 flex h-12 w-12 items-center justify-center rounded-full bg-white text-primary shadow-lg dark:bg-card">
          <Heart className="h-5 w-5" fill="currentColor" />
        </span>
      </div>
    </div>
  );
}
