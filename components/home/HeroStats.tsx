const stats = [
  {
    value: "10K+",
    label: "Happy Customers",
  },
  {
    value: "100%",
    label: "Eco Certified",
  },
  {
    value: "Free",
    label: "Shipping",
  },
];

export default function HeroStats() {
  return (
    <div className="mt-10 flex flex-wrap gap-8">
      {stats.map((stat) => (
        <div key={stat.label}>
          <p className="text-2xl font-bold text-foreground">
            {stat.value}
          </p>

          <p className="text-sm text-muted-foreground">
            {stat.label}
          </p>
        </div>
      ))}
    </div>
  );
}