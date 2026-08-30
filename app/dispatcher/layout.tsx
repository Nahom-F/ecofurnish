import { requireDispatcher } from "@/lib/require-dispatcher";
import { AutoRefresh } from "@/components/AutoRefresh";
import { GlowNav, type GlowNavLink } from "@/components/GlowNav";

const DISPATCHER_LINKS: GlowNavLink[] = [
  { href: "/dispatcher", label: "Applications", exact: true },
  { href: "/dispatcher/deliveries", label: "Deliveries" },
  { href: "/dispatcher/claims", label: "Claims" },
];

export const dynamic = "force-dynamic";

export default async function DispatcherLayout({ children }: { children: React.ReactNode }) {
  await requireDispatcher();

  return (
    <div className="container mx-auto max-w-6xl px-4 py-10">
      <AutoRefresh />
      <div className="mb-8 border-b border-border/60 pb-4">
        <h1 className="mb-3 text-xl font-bold tracking-tight">Dispatcher</h1>
        <GlowNav links={DISPATCHER_LINKS} />
      </div>
      {children}
    </div>
  );
}
