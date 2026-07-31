interface TestimonialCardProps {
  name: string;
  role: string;
  comment: string;
}

export default function TestimonialCard({
  name,
  role,
  comment,
}: TestimonialCardProps) {
  return (
    <article className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <p className="italic text-muted-foreground">&quot;{comment}&quot;</p>

      <div className="mt-6">
        <h3 className="font-semibold text-foreground">{name}</h3>
        <p className="text-sm text-muted-foreground">{role}</p>
      </div>
    </article>
  );
}
