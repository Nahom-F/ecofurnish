interface SectionHeadingProps {
  title: string;
  subtitle: string;
}

export default function SectionHeading({
  title,
  subtitle,
}: SectionHeadingProps) {
  return (
    <div className="mb-10 text-center">
      <h2 className="text-3xl font-bold text-foreground">
        {title}
      </h2>

      <p className="mt-3 text-muted-foreground">
        {subtitle}
      </p>
    </div>
  );
}