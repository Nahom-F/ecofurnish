import { CATEGORIES } from "@/data/categories";
import SectionHeading from "./SectionHeading";
import CategoryCard from "./CategoryCard";

export default function Categories() {
  return (
    <section id="categories" className="py-20">
      <div className="container mx-auto px-4">
        <SectionHeading
          title="Shop by Category"
          subtitle="Find furniture designed for every room in your home."
        />

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.map((category) => (
            <CategoryCard
              key={category.id}
              title={category.title}
              image={category.image}
            />
          ))}
        </div>
      </div>
    </section>
  );
}