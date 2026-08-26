import Link from "next/link";
import { requireDispatcher } from "@/lib/require-dispatcher";
import { AutoRefresh } from "@/components/AutoRefresh";

export const dynamic = "force-dynamic";

export default async function DispatcherLayout({ children }: { children: React.ReactNode }) {
  await requireDispatcher();

  return (
    <div className="container mx-auto max-w-6xl px-4 py-10">
      <AutoRefresh />
      <div className="mb-8 flex items-center gap-6 border-b border-border/60 pb-4">
        <h1 className="text-xl font-bold tracking-tight">Dispatcher</h1>
        <nav className="flex gap-4 text-sm font-medium text-muted-foreground">
          <Link href="/dispatcher" className="transition-colors hover:text-foreground">
            Applications
          </Link>
          <Link href="/dispatcher/deliveries" className="transition-colors hover:text-foreground">
            Deliveries
          </Link>
          <Link href="/dispatcher/claims" className="transition-colors hover:text-foreground">
            Claims
          </Link>
        </nav>
      </div>
      {children}
    </div>
  );
}
