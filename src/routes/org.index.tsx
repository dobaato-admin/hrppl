import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useMyTenant } from "@/hooks/use-tenant";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AppShell } from "@/components/AppShell";
import { AdminGate } from "@/components/AdminGate";

export const Route = createFileRoute("/org/")({
  head: () => ({ meta: [{ title: "Organization — hrppl" }] }),
  component: () => (
    <AdminGate feature="org.console">
      <OrgPage />
    </AdminGate>
  ),
});

function OrgPage() {
  const { user, roles, loading } = useAuth();
  const navigate = useNavigate();
  // Shared and cached (staleTime: Infinity). This used to be a local
  // `useState<Tenant | null>(null)` filled by a two-query effect, which meant
  // the page rendered "No tenant assigned" and "Your account isn't linked to an
  // organization yet" for ~400ms on every visit — measured — before the answer
  // arrived. `tenantLoading` is what separates "we do not know yet" from "there
  // isn't one", and both branches below now respect it.
  const { tenant, isLoading: tenantLoading } = useMyTenant();

  const canAccess = roles.includes("org_admin") || roles.includes("super_admin");

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth", search: { redirect: "/org/setup" } });
  }, [loading, user, navigate]);

  if (loading || !user) {
    return (
      <main className="flex min-h-screen items-center justify-center text-muted-foreground">
        Loading…
      </main>
    );
  }

  return (
    <AppShell
      title={tenant?.name ?? "Organization"}
      subtitle={
        tenantLoading
          ? "Loading your organization…"
          : tenant
            ? `${tenant.country_code} · ${tenant.currency_code} · ${tenant.plan}`
            : "No tenant assigned"
      }
      actions={
        tenant && !tenantLoading ? (
          <Badge variant={tenant.status === "active" ? "default" : "secondary"}>
            {tenant.status}
          </Badge>
        ) : null
      }
    >
      <section className="mx-auto grid max-w-6xl gap-6 px-6 py-8 md:grid-cols-2 lg:grid-cols-3">
        {!tenant && !tenantLoading && (
          <Card className="md:col-span-2 lg:col-span-3">
            <CardHeader>
              <CardTitle>Let's set up your organization</CardTitle>
              <CardDescription>
                Your account isn't linked to an organization yet. Create one now to invite your
                team, or accept a pending invitation if you've been invited.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3">
              <Button asChild>
                <Link to="/org/setup">Create organization</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/welcome">I have an invitation code</Link>
              </Button>
            </CardContent>
          </Card>
        )}
        {tenant && tenant.status !== "active" && (
          <Card className="md:col-span-2 lg:col-span-3 border-amber-500/30">
            <CardHeader>
              <CardTitle>Tenant pending activation</CardTitle>
              <CardDescription>
                Your organization is <strong>{tenant.status}</strong>. Full features unlock after
                your Regional Admin confirms your subscription payment.
              </CardDescription>
            </CardHeader>
          </Card>
        )}
        {canAccess && tenant?.status === "active" && (
          <>
            <Link to="/org/branches">
              <Card className="h-full transition-colors hover:border-primary">
                <CardHeader>
                  <CardTitle className="text-base">Branches</CardTitle>
                  <CardDescription>
                    Manage offices across countries — addresses, contacts, currency.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Badge>Available</Badge>
                </CardContent>
              </Card>
            </Link>
            <Link to="/org/employees">
              <Card className="h-full transition-colors hover:border-primary">
                <CardHeader>
                  <CardTitle className="text-base">Employees</CardTitle>
                  <CardDescription>Directory, hires, terminations, org chart.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Badge>Available</Badge>
                </CardContent>
              </Card>
            </Link>

            <Link to="/org/timesheets">
              <Card className="h-full transition-colors hover:border-primary">
                <CardHeader>
                  <CardTitle className="text-base">Timesheets</CardTitle>
                  <CardDescription>
                    Approve submitted weekly timesheets and overtime.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Badge>Available</Badge>
                </CardContent>
              </Card>
            </Link>
            <Link to="/org/leave">
              <Card className="h-full transition-colors hover:border-primary">
                <CardHeader>
                  <CardTitle className="text-base">Leave</CardTitle>
                  <CardDescription>Leave types, balances, requests, approvals.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Badge>Available</Badge>
                </CardContent>
              </Card>
            </Link>
            <Link to="/org/payroll">
              <Card className="h-full transition-colors hover:border-primary">
                <CardHeader>
                  <CardTitle className="text-base">Payroll</CardTitle>
                  <CardDescription>
                    Country-specific tax, multi-currency runs, payslips.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Badge>Available</Badge>
                </CardContent>
              </Card>
            </Link>
            <Link to="/org/performance">
              <Card className="h-full transition-colors hover:border-primary">
                <CardHeader>
                  <CardTitle className="text-base">Performance</CardTitle>
                  <CardDescription>Review cycles, goals, and finalized ratings.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Badge>Available</Badge>
                </CardContent>
              </Card>
            </Link>
            <Link to="/admin/feedback-templates">
              <Card className="h-full transition-colors hover:border-primary">
                <CardHeader>
                  <CardTitle className="text-base">360° feedback templates</CardTitle>
                  <CardDescription>
                    Configure questions and rating scales for peer feedback.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Badge>Available</Badge>
                </CardContent>
              </Card>
            </Link>
            <Link to="/admin/review-templates">
              <Card className="h-full transition-colors hover:border-primary">
                <CardHeader>
                  <CardTitle className="text-base">Review templates</CardTitle>
                  <CardDescription>
                    Competencies and rating scales used in performance reviews.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Badge>Available</Badge>
                </CardContent>
              </Card>
            </Link>
            <Link to="/org/onboarding">
              <Card className="h-full transition-colors hover:border-primary">
                <CardHeader>
                  <CardTitle className="text-base">Onboarding</CardTitle>
                  <CardDescription>
                    Checklist templates, new-joinee progress, document review.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Badge>Available</Badge>
                </CardContent>
              </Card>
            </Link>
            <Link to="/admin/offboarding">
              <Card className="h-full transition-colors hover:border-primary">
                <CardHeader>
                  <CardTitle className="text-base">Offboarding</CardTitle>
                  <CardDescription>
                    Exit checklists, asset return, final pay, knowledge handover.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Badge>Available</Badge>
                </CardContent>
              </Card>
            </Link>
            <Link to="/org/reports">
              <Card className="h-full transition-colors hover:border-primary">
                <CardHeader>
                  <CardTitle className="text-base">Reports & analytics</CardTitle>
                  <CardDescription>
                    Headcount, payroll cost, leave, overtime trends.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Badge>Available</Badge>
                </CardContent>
              </Card>
            </Link>
            <Link to="/org/analytics">
              <Card className="h-full transition-colors hover:border-primary">
                <CardHeader>
                  <CardTitle className="text-base">Analytics dashboard</CardTitle>
                  <CardDescription>
                    Cross-module KPIs: onboarding, performance, attrition, leave mix.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Badge>Available</Badge>
                </CardContent>
              </Card>
            </Link>
            <ModuleCard title="Expenses" desc="Claims, approvals, reimbursements." />
          </>
        )}
      </section>

      <footer className="mx-auto max-w-6xl px-6 py-6 text-xs text-muted-foreground">
        Modules above are Phase 2+ scope. Phase 1 ships tenant lifecycle, RBAC, and the API
        skeleton.
      </footer>
    </AppShell>
  );
}

function ModuleCard({ title, desc }: { title: string; desc: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription>{desc}</CardDescription>
      </CardHeader>
      <CardContent>
        <Badge variant="outline">Coming in Phase 2</Badge>
      </CardContent>
    </Card>
  );
}
