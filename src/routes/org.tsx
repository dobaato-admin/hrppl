import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { isOrgMember } from "@/lib/rbac";

export const Route = createFileRoute("/org")({
  component: OrgLayout,
});

function OrgLayout() {
  const { user, loading, roles, rolesLoaded } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const canAccess = isOrgMember(roles);
  const isOrgRoot = pathname === "/org" || pathname === "/org/";
  const isSetupWizard = pathname === "/org/setup" || pathname.startsWith("/org/setup/");

  // If the user is signed in but has no org role, send them straight into the
  // setup wizard rather than stranding them on a card with a single button.
  useEffect(() => {
    if (!loading && user && rolesLoaded && !canAccess && isOrgRoot) {
      navigate({ to: "/org/setup", replace: true });
    }
  }, [loading, user, rolesLoaded, canAccess, isOrgRoot, navigate]);

  if (loading || (user && !rolesLoaded)) {
    return <main className="flex min-h-screen items-center justify-center text-muted-foreground">Loading…</main>;
  }

  if (!user) {
    return <Outlet />;
  }

  if (rolesLoaded && !canAccess && isOrgRoot) {
    return (
      <AppShell title="Organization" subtitle="Set up your workspace">
        <div className="mx-auto max-w-3xl p-4 md:p-6">
          <Card>
            <CardHeader>
              <CardTitle>Create organization</CardTitle>
              <CardDescription>Redirecting you to the setup wizard…</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link to="/org/setup">Continue to setup</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </AppShell>
    );
  }

  // The org section gets its chrome here, at the layout, rather than in each
  // page. Without this org.tsx returned a bare <Outlet /> and eight first-class
  // destinations — Employees, Run payroll, Leave management, Timesheets,
  // Performance, Reports, Analytics, Onboarding admin — rendered with no
  // sidebar and no top bar, leaving the user stranded with only the browser
  // back button.
  //
  // AppShell is nesting-aware, so the children that already render their own
  // (org.documents, org.recruitment, and pages with their own titles) keep
  // their PageHeader and do not get a second set of chrome.
  //
  // No title here on purpose: the page supplies it.
  if (isSetupWizard) {
    // /org/setup is reachable before the user has a tenant at all
    // (TENANTLESS_ALLOWED in AuthRouteGate). Showing a full org nav to someone
    // who has no org yet would offer links that all bounce back here.
    return <Outlet />;
  }

  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}

