import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { cn } from "@/lib/utils";
import { User, Wallet, FolderOpen, Users, Briefcase, Home, FileSignature } from "lucide-react";

export const Route = createFileRoute("/me")({
  head: () => ({ meta: [{ title: "Me — hrppl" }] }),
  component: MeLayout,
});

const TABS = [
  { to: "/me", label: "Overview", icon: Home, exact: true },
  { to: "/me/contact", label: "Contact", icon: User },
  { to: "/me/banking-tax", label: "Banking & tax", icon: Wallet },
  { to: "/me/documents", label: "Documents", icon: FolderOpen },
  { to: "/me/signatures", label: "Signatures", icon: FileSignature },
  { to: "/me/directory", label: "Directory", icon: Users },
  { to: "/me/dashboard", label: "Dashboard", icon: Briefcase },
];

function MeLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const shellTitle = pathname === "/me/security" ? "Security" : "Me";
  return (
    <AppShell title={shellTitle} subtitle={shellTitle === "Me" ? "Your personal hub" : undefined}>
      <div className="mx-auto max-w-6xl space-y-4 p-4 md:p-6">
        <div className="sticky top-14 z-10 -mx-4 overflow-x-auto border-b bg-background/85 px-4 backdrop-blur md:-mx-6 md:px-6">
          <nav className="flex min-w-max gap-1 py-2">
            {TABS.map((t) => {
              const Icon = t.icon;
              const active = t.exact ? pathname === t.to : pathname === t.to || pathname.startsWith(t.to + "/");
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
