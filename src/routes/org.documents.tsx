import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { cn } from "@/lib/utils";
import { FileText, Send, AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/org/documents")({
  head: () => ({ meta: [{ title: "Documents — hrppl" }] }),
  component: DocsLayout,
});

const TABS = [
  { to: "/org/documents", label: "Envelopes", icon: Send, exact: true },
  { to: "/org/documents/templates", label: "Templates", icon: FileText },
  { to: "/org/documents/expiring", label: "Expiring & verification", icon: AlertTriangle },
];

function DocsLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <AppShell
      title="Documents & e-signature"
      subtitle="Templates, envelopes, signed copies and verification"
    >
      <div className="mx-auto max-w-7xl space-y-4 p-4 md:p-6">
        <div className="sticky top-14 z-10 -mx-4 overflow-x-auto border-b bg-background/85 px-4 backdrop-blur md:-mx-6 md:px-6">
          <nav className="flex min-w-max gap-1 py-2">
            {TABS.map((t) => {
              const Icon = t.icon;
              const active = t.exact
                ? pathname === t.to
                : pathname === t.to || pathname.startsWith(t.to + "/");
              return (
                <Link
                  key={t.to}
                  to={t.to}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition",
                    active
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                  )}
                >
                  <Icon className="h-4 w-4" /> {t.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <Outlet />
      </div>
    </AppShell>
  );
}
