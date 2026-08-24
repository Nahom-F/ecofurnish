import Link from "next/link";
import { requireAdmin } from "@/lib/require-admin";
import { APP_VERSION } from "@/lib/version";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();

  return (
    <div className="container mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8 flex items-center gap-6 border-b border-border/60 pb-4">
        <h1 className="text-xl font-bold tracking-tight">
          Admin <span className="align-middle text-xs font-normal text-muted-foreground">v{APP_VERSION}</span>
        </h1>
        <nav className="flex gap-4 text-sm font-medium text-muted-foreground">
          <Link href="/admin" className="transition-colors hover:text-foreground">
            Dashboard
          </Link>
          <Link href="/admin/products" className="transition-colors hover:text-foreground">
            Products
          </Link>
          <Link href="/admin/orders" className="transition-colors hover:text-foreground">
            Orders
          </Link>
          <Link href="/admin/inbox" className="transition-colors hover:text-foreground">
            Inbox
          </Link>
          <Link href="/admin/broadcast" className="transition-colors hover:text-foreground">
            Broadcast
          </Link>
          <Link href="/admin/dispatchers" className="transition-colors hover:text-foreground">
            Dispatchers
          </Link>
          <Link
            href="/dispatcher"
            className="flex items-center gap-1 transition-colors hover:text-foreground"
          >
            Dispatcher Panel ↗
          </Link>
        </nav>
      </div>
      {children}
    </div>
  );
}
