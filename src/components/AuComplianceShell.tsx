import type { ReactNode } from "react";
import { AppShell } from "@/components/AppShell";
import { EmptyState, SkeletonRows } from "@/components/monday";
import { Globe2, Building2 } from "lucide-react";

/**
 * The frame every Australian-compliance page renders inside.
 *
 * All five of these pages need the same three answers before they can show
 * anything: which tenant, is it Australian, and is it loaded yet. Written out
 * per page that becomes five chances to get one of them subtly different — and
 * two of them (`No organisation` vs `not an AU tenant`) look identical if you
 * conflate them, which is how a platform account ends up staring at a page
 * that says nothing is here.
 *
 * Authorization is NOT done here. It belongs at the route, as an AdminGate
 * with the page's feature key, so the page never mounts for the wrong role —
 * and so the parity test can read the gate. This component assumes the caller
 * is allowed and only answers "allowed to see *what*".
 *
 * Two states worth naming, because CLAUDE.md calls out the failure mode:
 *
 * - **No tenant.** `super_admin` and `regional_admin` have no home tenant, so
 *   every tenant-scoped surface is legitimately empty for them until they pick
 *   one in the switcher. An unexplained empty page reads as broken, so this
 *   says so and points at the switcher.
 * - **Not an Australian tenant.** Reachable by URL even though the nav hides
 *   the whole subgroup outside AU — a bookmark, or a platform account that
 *   switched tenants with the page open. The server guards would refuse
 *   anyway; this explains it before the user clicks something that throws.
 */
export function AuComplianceShell({
  title,
  subtitle,
  actions,
  tenantId,
  country,
  isLoading,
  children,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  /** From `useMyTenantId()` — `undefined` while loading, `null` for no tenant. */
  tenantId: string | null | undefined;
  /** From `useMyTenantCountry()` — same three-state convention. */
  country: string | null | undefined;
  /** Any further loading the page itself is waiting on. */
  isLoading?: boolean;
  children: (tenantId: string) => ReactNode;
}) {
  if (tenantId === undefined || country === undefined) {
    return (
      <AppShell title={title} subtitle={subtitle}>
        <div className="p-4">
          <SkeletonRows rows={5} />
        </div>
      </AppShell>
    );
  }

  if (tenantId === null) {
    return (
      <AppShell title={title} subtitle={subtitle}>
        <div className="p-4">
          <EmptyState
            icon={Building2}
            title="No organisation selected"
            description="Platform accounts have no home organisation. Use the tenant switcher in the top bar to act as one, and this page will show its data."
            tone="info"
          />
        </div>
      </AppShell>
    );
  }

  if (country !== "AU") {
    return (
      <AppShell title={title} subtitle={subtitle}>
        <div className="p-4">
          <EmptyState
            icon={Globe2}
            title="Not an Australian organisation"
            description={
              `This is Australian payroll compliance — Single Touch Payroll, Payday Super and ` +
              `modern awards. The current organisation is registered in ` +
              `${country ?? "another country"}, so none of it applies. Switch to an Australian ` +
              `organisation to use these pages.`
            }
            tone="pending"
          />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title={title} subtitle={subtitle} actions={actions}>
      <div className="p-4 space-y-4">
        {isLoading ? <SkeletonRows rows={5} /> : children(tenantId)}
      </div>
    </AppShell>
  );
}
