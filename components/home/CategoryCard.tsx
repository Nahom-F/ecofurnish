import Image from "next/image";
import Link from "next/link";

interface CategoryCardProps {
  title: string;
  image: string;
}

export default function CategoryCard({
  title,
  image,
}: CategoryCardProps) {
  return (
    <Link
      href={`/?room=${encodeURIComponent(title)}#all-products`}
      className="group relative block overflow-hidden rounded-2xl"
    >
      <Image
        src={image}
        alt={title}
        width={500}
        height={350}
        // Matches Categories.tsx's grid: 1 column below md, 2 from md,
        // 3 from lg inside a max-w-7xl container — without this, Next
        // has no way to know the image renders narrower than 500px on
        // most breakpoints and ships the same oversized file to everyone.
        sizes="(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 420px"
        className="h-72 w-full object-cover transition-transform duration-500 group-hover:scale-105"
      />

      <div className="absolute inset-0 flex items-end bg-linear-to-t from-black/70 to-transparent p-6">
        <h3 className="text-2xl font-bold text-white">
          {title}
        </h3>
      </div>
    </Link>
  );
}