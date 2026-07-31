import Image from "next/image";

interface CategoryCardProps {
  title: string;
  image: string;
}

export default function CategoryCard({
  title,
  image,
}: CategoryCardProps) {
  return (
    <article className="group relative overflow-hidden rounded-2xl">
      <Image
        src={image}
        alt={title}
        width={500}
        height={350}
        className="h-72 w-full object-cover transition-transform duration-500 group-hover:scale-105"
      />

      <div className="absolute inset-0 flex items-end bg-linear-to-t from-black/70 to-transparent p-6">
        <h3 className="text-2xl font-bold text-white">
          {title}
        </h3>
      </div>
    </article>
  );
}