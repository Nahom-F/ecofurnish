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
      <p className="mt-4 max-w-md text-lg text-muted-foreground">{subheading}</p>

      <div className="relative mt-8 h-[360px]">
        <div className="absolute left-0 top-2 w-60 -rotate-3 overflow-hidden rounded-2xl border-4 border-white shadow-xl dark:border-card">
          <Image
            src="/images/products/eco-lounge-chair.jpg"
            alt=""
            width={360}
            height={420}
            className="h-64 w-full object-cover"
          />
        </div>
        <div className="absolute right-0 top-20 w-52 rotate-2 overflow-hidden rounded-2xl border-4 border-white shadow-xl dark:border-card">
          <Image
            src="/images/products/sofa.jpg"
            alt=""
            width={340}
            height={280}
            className="h-44 w-full object-cover"
          />
        </div>
        <div className="absolute bottom-0 left-24 w-36 -rotate-2 overflow-hidden rounded-2xl border-4 border-white shadow-lg dark:border-card">
          <Image
            src="/images/products/plant-stand.jpg"
            alt=""
            width={240}
            height={240}
            className="h-32 w-full object-cover"
          />
        </div>

        <span className="absolute right-16 top-0 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg">
          <Leaf className="h-5 w-5" />
        </span>
        <span className="absolute bottom-6 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-white text-primary shadow-lg dark:bg-card">
          <Heart className="h-4 w-4" fill="currentColor" />
        </span>
      </div>
    </div>
  );
}
