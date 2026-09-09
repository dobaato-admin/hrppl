import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { SetupGuideBanner } from "@/components/setup/SetupGuideBanner";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AppShell } from "@/components/AppShell";
import { KpiTile, PageHeader, SectionCard, SkeletonRows, StatusChip } from "@/components/monday";
import { RequestsSummary } from "@/components/dashboard/RequestsSummary";
import { BoardCard, BoardRow, AdminTile } from "@/components/dashboard-tiles";
import { getMyOrgStatus } from "@/lib/org-signup.functions";
import { getDashboardSnapshot } from "@/lib/dashboard.functions";
import {
  CalendarDays,
  ClipboardCheck,
  Sparkles,
  GraduationCap,
  Receipt,
  Plus,
  Clock,
  Target,
  Building2,
  Globe2,
  ShieldCheck,
  BookOpen,
  AlertCircle,
  Users,
  Inbox,
  DollarSign,
  Wallet,
  FileSignature,
  TrendingUp,
  FileText,
  Settings as SettingsIcon,
  Pin,
  UserSearch,
  Package,
} from "lucide-react";
import {
  listMyQuickAccess,
  setMyQuickAccess,
  QUICK_ACCESS_REGISTRY,
} from "@/lib/manager-quick-access.functions";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Link as RLink } from "@tanstack/react-router";
import { toast } from "sonner";

const ICON_MAP: Record<string, any> = {
  Building2,
  Users,
  Inbox,
  CalendarDays,
  Clock,
  DollarSign,
  Wallet,
  Sparkles,
  BookOpen,
  FileSignature,
  TrendingUp,
  FileText,
  UserSearch,
  Package,
  ClipboardCheck,
};

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "hrppl Dashboard — your workspace" },
      {
        name: "description",
        content:
          "Your hrppl workspace dashboard: leave, timesheets, reviews, payslips and admin tiles at a glance.",
      },
      { name: "robots", content: "noindex,nofollow" },
      { property: "og:title", content: "hrppl Dashboard" },
      { property: "og:description", content: "Your hrppl workspace at a glance." },
      { property: "og:url", content: "https://hrppl.io/dashboard" },
    ],
  }),
  component: Dashboard,
});

interface Counts {
  pendingLeave: number;
  openTimesheet: number;
  pendingReviews: number;
  onboardingOpen: number;
  recentPayslips: number;
}

function Dashboard() {
  const { user, roles, loading, rolesLoaded } = useAuth();
  const navigate = useNavigate();
  const statusFn = useServerFn(getMyOrgStatus);
  const { data: orgStatus } = useQuery({
    // Keyed by user id. Without it the cache entry outlives a sign-out, so the
    // next account to sign in on this browser read the previous user's tenant,
    // roles and onboarding state until the 60s default staleTime elapsed —
    // long enough to drive the redirects below to the wrong place.
    // AppShell and MfaEnforcementBanner already scope their keys this way.
    queryKey: ["my-org-status", user?.id],
    queryFn: () => statusFn({}),
    enabled: !!user,
  });

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [loading, user, navigate]);

  // Route new users to the appropriate next step. Platform admins
  // (super_admin / regional_admin) legitimately have no home tenant — /welcome
  // is the "create or join an organization" flow and is not for them; they
  // pick a tenant to act as from the TenantSwitcher in AppShell instead.
  useEffect(() => {
    if (!orgStatus || !user) return;
    if (!orgStatus.tenantId && !orgStatus.isPlatformAdmin) {
      navigate({ to: "/welcome" });
    } else if (orgStatus.employee && !orgStatus.onboardingProfile?.submitted_at) {
      navigate({ to: "/onboarding/profile" });
    }
  }, [orgStatus, user, navigate]);

  const showSetupBanner =
    orgStatus?.tenantId &&
    orgStatus.roles.includes("org_admin") &&
    !orgStatus.setupProgress?.completed_at;

  // Dashboard data.
  //
  // W5 P2-6 · This was five separate client-side Supabase counts issued from
  // the browser. getDashboardSnapshot returns those same five numbers from one
  // server call — and, in the same payload, pre-computed `manager`, `hr` and
  // `finance` blocks that nothing consumed. That is the per-role dashboard the
  // W4 §5 design asked for: it had been built server-side and never surfaced,
  // because /me/dashboard was the only caller and /me/dashboard was an orphan.
  //
  // A block comes back null when the caller's roles do not warrant it, so the
  // page needs no role checks of its own: it renders what it is given. Adding
  // a role section later needs no change here.
  const snapshotFn = useServerFn(getDashboardSnapshot);
  const { data: snapshot } = useQuery({
    queryKey: ["dashboard-snapshot", user?.id],
    enabled: !!user,
    staleTime: 60_000,
    queryFn: () => snapshotFn(),
  });

  const me = snapshot?.me ?? null;
  const counts: Counts = {
    pendingLeave: me?.pendingLeaveCount ?? 0,
    openTimesheet: me?.draftTimesheetCount ?? 0,
    pendingReviews: me?.trainingDueCount ?? 0,
    onboardingOpen: me?.onboardingOpenCount ?? 0,
    recentPayslips: me?.latestPayslip ? 1 : 0,
  };

  if (loading || !user) {
    return (
      <AppShell title="Home" subtitle="Loading your workspace">
        <div className="mx-auto max-w-7xl space-y-6 p-4 md:p-6">
          <div className="h-32 w-full animate-pulse rounded-2xl bg-muted/60" />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-28 animate-pulse rounded-xl bg-muted/60" />
            ))}
          </div>
          <SkeletonRows rows={4} />
        </div>
      </AppShell>
    );
  }

  const isSuper = roles.includes("super_admin");
  const isRegional = roles.includes("regional_admin");
  const isOrg = roles.includes("org_admin");
  // Was missing "finance" — every other people-manager-adjacent role already
  // saw the quick-access picker below; finance alone got nothing extra
  // (see docs/w4-information-architecture-design.md §5).
  const isManager = roles.some((r) =>
    ["manager", "org_admin", "hr", "branch_admin", "finance", "super_admin"].includes(r),
  );

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 5) return "Working late";
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  })();

  return (
    <AppShell title="Home" subtitle="Your workspace at a glance">
      <div className="mx-auto max-w-7xl space-y-6 p-4 md:p-6">
        {/* Above the greeting on purpose: while an organisation is
            unconfigured, this is the most important thing on the page. It
            renders nothing once activated, and nothing at all for roles that
            cannot act on it. */}
        <SetupGuideBanner roles={roles} />
        <PageHeader
          eyebrow={greeting}
          title={
            <>
              Hello,{" "}
              <span className="bg-gradient-brand bg-clip-text text-transparent">
                {user.email?.split("@")[0]}
              </span>
            </>
          }
          subtitle="Here's what's on your board today — leave, time, reviews, and pay at a glance."
          actions={
            <>
              <Button asChild className="shadow-sm">
                <Link to="/leave">
                  <Plus className="mr-1 h-4 w-4" /> Request leave
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/attendance">
                  <Clock className="mr-1 h-4 w-4" /> Clock in
                </Link>
              </Button>
              <Button asChild variant="outline" className="hidden sm:inline-flex">
                <Link to="/performance">
                  <Target className="mr-1 h-4 w-4" /> Add a goal
                </Link>
              </Button>
            </>
          }
        />

        {showSetupBanner && (
          <Card className="border-status-warning/40 bg-status-warning/10">
            <CardContent className="flex flex-wrap items-center justify-between gap-3 py-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="mt-0.5 h-5 w-5 text-status-warning" />
                <div>
                  <div className="font-medium">Finish setting up your organization</div>
                  <div className="text-sm text-muted-foreground">
                    A few quick steps to unlock payroll, leave, and onboarding for your team.
                  </div>
                </div>
              </div>
              <Button asChild size="sm">
                <Link to="/org/setup">Continue setup</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* KPI board */}
        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <KpiTile
            label="Leave pending"
            value={counts.pendingLeave}
            tone="working"
            to="/leave"
            icon={CalendarDays}
          />
          <KpiTile
            label="Timesheets to submit"
            value={counts.openTimesheet}
            tone="info"
            to="/attendance"
            icon={ClipboardCheck}
          />
          <KpiTile
            label="Reviews open"
            value={counts.pendingReviews}
            tone="done"
            to="/performance"
            icon={Sparkles}
          />
          <KpiTile
            label="Onboarding tasks"
            value={counts.onboardingOpen}
            tone="pending"
            to="/onboarding"
            icon={GraduationCap}
          />
          <KpiTile
            label="Payslips available"
            value={counts.recentPayslips}
            tone="primary"
            to="/my-payslips"
            icon={Receipt}
          />
        </section>

        {/* What am I waiting on, and what is waiting on me. Sits above the
            boards because an unactioned approval is the most time-sensitive
            thing on this page — a same-day work-from-home request is worthless
            if nobody sees it until tomorrow. */}
        <RequestsSummary />

        {/* Boards */}
        <section className="grid gap-4 lg:grid-cols-3">
          <BoardCard
            title="My week"
            color="bg-status-info"
            description="Time off, clock-ins, reviews due"
          >
            <BoardRow
              label="Pending leave requests"
              status={counts.pendingLeave > 0 ? "Working on it" : "Done"}
              tone={counts.pendingLeave > 0 ? "working" : "done"}
              to="/leave"
            />
            <BoardRow
              label="Open timesheet"
              status={counts.openTimesheet > 0 ? "Stuck" : "Done"}
              tone={counts.openTimesheet > 0 ? "stuck" : "done"}
              to="/attendance"
            />
            <BoardRow
              label="Reviews to action"
              status={counts.pendingReviews > 0 ? "Working on it" : "Done"}
              tone={counts.pendingReviews > 0 ? "working" : "done"}
              to="/performance"
            />
          </BoardCard>

          <BoardCard
            title="Onboarding"
            color="bg-status-working"
            description="Checklists assigned to you"
          >
            <BoardRow
              label="In-progress tasks"
              status={counts.onboardingOpen > 0 ? "Working on it" : "Done"}
              tone={counts.onboardingOpen > 0 ? "working" : "done"}
              to="/onboarding"
            />
            {/* Was hardcoded to status="Open" regardless of state — W4 left it
                because there was no data source. The snapshot's `me` block is
                that source. */}
            <BoardRow
              label="Personal details"
              status={
                me == null
                  ? "—"
                  : me.missingProfileFields.length > 0
                    ? `${me.missingProfileFields.length} missing`
                    : "Complete"
              }
              tone={me && me.missingProfileFields.length > 0 ? "working" : "done"}
              to="/onboarding/profile"
            />
          </BoardCard>

          <BoardCard title="Pay" color="bg-primary" description="Latest payroll & payslips">
            <BoardRow
              label="Available payslips"
              status={counts.recentPayslips > 0 ? "Done" : "Pending"}
              tone={counts.recentPayslips > 0 ? "done" : "pending"}
              to="/my-payslips"
            />
            {/* Replaced a permanently-static "Notification preferences · Info"
                row. The snapshot carries no notification state, and a chip that
                always reads the same tells the reader nothing — so this row now
                shows something real that was otherwise only visible from
                /me/signatures. */}
            <BoardRow
              label="Signatures awaiting you"
              status={
                me == null
                  ? "—"
                  : me.signaturesPendingCount > 0
                    ? `${me.signaturesPendingCount} to sign`
                    : "Nothing pending"
              }
              tone={me && me.signaturesPendingCount > 0 ? "stuck" : "done"}
              to="/me/signatures"
            />
          </BoardCard>
        </section>

        {/* Role sections.
            W5 P2-6 · Rendered purely on whether the snapshot returned the
            block, never on a role check in this file. getDashboardSnapshot
            already decides who warrants which bucket, so the page cannot drift
            from that decision the way the nav drifted from the route gates. */}
        {(snapshot?.manager || snapshot?.hr || snapshot?.finance) && (
          <section className="grid gap-4 lg:grid-cols-2">
            {snapshot?.manager && (
              <SectionCard
                tone="working"
                title="My team"
                description={`${snapshot.manager.reportsCount} direct report${snapshot.manager.reportsCount === 1 ? "" : "s"}`}
                actions={
                  <Button asChild size="sm" variant="outline">
                    <Link to="/team">Open</Link>
                  </Button>
                }
              >
                <RoleRow
                  label="Leave awaiting your decision"
                  n={snapshot.manager.pendingLeave.length}
                  to="/org/leave"
                />
                <RoleRow
                  label="Expense claims to approve"
                  n={snapshot.manager.pendingExpense.length}
                  to="/org/expenses"
                />
                <RoleRow
                  label="Timesheets to approve"
                  n={snapshot.manager.pendingTimesheets.length}
                  to="/org/timesheets"
                />
                <RoleRow
                  label="Overdue reviews"
                  n={snapshot.manager.overdueReviews.length}
                  to="/org/performance"
                />
              </SectionCard>
            )}

            {snapshot?.finance && (
              <SectionCard
                tone="done"
                title="Finance"
                description="Pay runs, claims and rates that need attention"
                actions={
                  <Button asChild size="sm" variant="outline">
                    <Link to="/org/payroll">Run payroll</Link>
                  </Button>
                }
              >
                <RoleRow
                  label="Draft pay runs"
                  n={snapshot.finance.draftRuns.length}
                  to="/org/payroll"
                />
                <RoleRow
                  label="Expense claims pending"
                  n={snapshot.finance.pendingExpenseClaims}
                  to="/org/expenses"
                />
                <div className="flex items-center justify-between gap-3 py-1.5 text-sm">
                  <span className="text-muted-foreground">FX rates</span>
                  <StatusChip tone={snapshot.finance.fxStale ? "stuck" : "done"}>
                    {snapshot.finance.fxAgeDays == null
                      ? "None recorded"
                      : `${snapshot.finance.fxAgeDays} day${snapshot.finance.fxAgeDays === 1 ? "" : "s"} old`}
                  </StatusChip>
                </div>
              </SectionCard>
            )}

            {snapshot?.hr && (
              <SectionCard
                tone="info"
                title="People operations"
                description="Records that are incomplete or expiring"
                actions={
                  <Button asChild size="sm" variant="outline">
                    <Link to="/org/employees">Employees</Link>
                  </Button>
                }
              >
                <RoleRow
                  label="Missing pay setup"
                  n={snapshot.hr.missingPay?.length ?? 0}
                  to="/org/pay-rates"
                />
                <RoleRow
                  label="Incomplete profiles"
                  n={snapshot.hr.missingProfile?.length ?? 0}
                  to="/admin/id-requests"
                />
                {/* Certifications, not documents — these come from
                    training_enrollments' issued certificates, so the way in is
                    the training page that owns their renewal. */}
                <RoleRow
                  label="Certifications expiring"
                  n={snapshot.hr.expiringCertifications?.length ?? 0}
                  to="/org/training"
                />
                <RoleRow
                  label="Onboarding in progress"
                  n={snapshot.hr.pendingOnboardingCount ?? 0}
                  to="/org/onboarding/tracker"
                />
              </SectionCard>
            )}
          </section>
        )}

        {isManager && <ManagerQuickAccess roles={roles} />}

        {/* Admin shortcuts */}
        {(isOrg || isRegional || isSuper) && (
          <section>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Admin shortcuts
            </h3>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {(isOrg || isSuper) && (
                <AdminTile
                  title="Org console"
                  description="Employees, payroll, leave, performance."
                  to="/org"
                  color="bg-status-working"
                  Icon={Building2}
                />
              )}
              {(isRegional || isSuper) && (
                <AdminTile
                  title="Regional"
                  description="Onboard organizations & subscriptions."
                  to="/regional"
                  color="bg-status-info"
                  Icon={Globe2}
                />
              )}
              {isSuper && (
                <AdminTile
                  title="Platform admin"
                  description="Roles, countries & global settings."
                  to="/admin"
                  color="bg-status-stuck"
                  Icon={ShieldCheck}
                />
              )}
              {isSuper && (
                <AdminTile
                  title="API reference"
                  description="Developer Swagger UI (super admin only)."
                  to="/admin/api-docs"
                  color="bg-primary"
                  Icon={BookOpen}
                />
              )}
            </div>
          </section>
        )}

        {rolesLoaded && roles.length === 0 && (
          <Card className="border-status-stuck/40 bg-status-stuck/5">
            <CardHeader>
              <CardTitle>No role assigned yet</CardTitle>
              <CardDescription>
                Your account has no roles yet. A Super Admin or Regional Admin must grant access.
              </CardDescription>
            </CardHeader>
          </Card>
        )}
      </div>
    </AppShell>
  );
}

const LOCKED_KEYS = ["org-console"];

// Seed keys for a user who has never customized their quick access, chosen
// per role since "requests-inbox, employees, reports" made no sense for
// finance and nothing existed at all for it before this wave. Still fully
// editable afterwards via "Customize" — these are starting defaults, not a
// role-locked set. See docs/w4-information-architecture-design.md §5.
const DEFAULT_KEYS_BY_ROLE: Record<string, string[]> = {
  manager: ["team-dashboard", "requests-inbox"],
  hr: ["employees", "recruitment", "onboarding-tracker"],
  finance: ["payroll", "expenses", "analytics"],
  branch_admin: ["team-members", "requests-inbox", "asset-register"],
};
const FALLBACK_DEFAULT_KEYS = ["requests-inbox", "employees", "reports"];

function defaultKeysForRoles(roles: string[]): string[] {
  for (const role of ["manager", "hr", "finance", "branch_admin"]) {
    if (roles.includes(role)) return DEFAULT_KEYS_BY_ROLE[role];
  }
  return FALLBACK_DEFAULT_KEYS;
}

function ManagerQuickAccess({ roles }: { roles: string[] }) {
  const listFn = useServerFn(listMyQuickAccess);
  const saveFn = useServerFn(setMyQuickAccess);
  const [pins, setPins] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);

  async function refresh() {
    const r = await listFn({});
    const stored = r.pins.length > 0 ? r.pins.map((p: any) => p.key) : defaultKeysForRoles(roles);
    // Always pin locked keys first, then the user's choices (deduped)
    const merged = [...LOCKED_KEYS, ...stored.filter((k: string) => !LOCKED_KEYS.includes(k))];
    setPins(
      merged
        .map((k: string) => QUICK_ACCESS_REGISTRY.find((i) => i.key === k))
        .filter(Boolean) as any[],
    );
    setSelected(merged);
    setLoaded(true);
  }
  useEffect(() => {
    refresh();
  }, []);

  async function save() {
    try {
      // Persist user's selections minus locked keys (locked are always prepended)
      const toSave = selected.filter((k) => !LOCKED_KEYS.includes(k));
      await saveFn({ data: { keys: toSave } });
      toast.success("Quick access updated");
      setOpen(false);
      refresh();
    } catch (e: any) {
      toast.error(e?.message ?? "Failed");
    }
  }

  if (!loaded) {
    return (
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Quick access
          </h3>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="h-[120px] animate-pulse">
              <CardHeader className="space-y-2">
                <span className="inline-flex h-9 w-9 rounded-lg bg-muted" />
                <span className="block h-4 w-2/3 rounded bg-muted" />
                <span className="block h-3 w-1/2 rounded bg-muted" />
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Quick access
        </h3>
        <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
          <SettingsIcon className="mr-1 h-3.5 w-3.5" /> Customize
        </Button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {pins.map((p) => {
          const Icon = ICON_MAP[p.icon] ?? Pin;
          const locked = LOCKED_KEYS.includes(p.key);
          return (
            <RLink key={p.key} to={p.href as any} className="group">
              <Card
                className={`relative h-full transition hover:-translate-y-0.5 hover:shadow-md ${
                  locked ? "border-primary/40 bg-primary/[0.03]" : ""
                }`}
              >
                {locked && (
                  <Badge
                    variant="secondary"
                    className="absolute right-2 top-2 gap-1 px-1.5 py-0 text-[10px]"
                  >
                    <Pin className="h-2.5 w-2.5" /> Pinned
                  </Badge>
                )}
                <CardHeader className="space-y-2">
                  <span
                    className={`inline-flex h-9 w-9 items-center justify-center rounded-lg text-white shadow-sm ${
                      locked ? "bg-primary" : "bg-status-working"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <CardTitle className="text-base">{p.label}</CardTitle>
                  <CardDescription className="text-xs">{p.group}</CardDescription>
                </CardHeader>
              </Card>
            </RLink>
          );
        })}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Customize quick access</DialogTitle>
          </DialogHeader>
          <p className="text-xs text-muted-foreground">
            Pinned items (like Org console) are always shown and can't be removed.
          </p>
          <div className="space-y-4">
            {Array.from(new Set(QUICK_ACCESS_REGISTRY.map((r) => r.group))).map((group) => (
              <div key={group}>
                <h4 className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {group}
                </h4>
                <div className="space-y-1">
                  {QUICK_ACCESS_REGISTRY.filter((r) => r.group === group).map((r) => {
                    const locked = LOCKED_KEYS.includes(r.key);
                    return (
                      <label
                        key={r.key}
                        className={`flex items-center gap-2 rounded-md p-1.5 ${
                          locked ? "opacity-70" : "hover:bg-muted"
                        }`}
                      >
                        <Checkbox
                          checked={locked || selected.includes(r.key)}
                          disabled={locked}
                          onCheckedChange={(v) => {
                            if (locked) return;
                            if (v) setSelected([...selected, r.key]);
                            else setSelected(selected.filter((k) => k !== r.key));
                          }}
                        />
                        <span className="text-sm">{r.label}</span>
                        {locked && (
                          <Badge variant="secondary" className="gap-1 px-1.5 py-0 text-[10px]">
                            <Pin className="h-2.5 w-2.5" /> Pinned
                          </Badge>
                        )}
                        <span className="ml-auto text-xs text-muted-foreground">{r.href}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={save}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}

/**
 * One line of a role section: a label, a count, and a way in.
 *
 * Zero is shown as "Clear" rather than "0" — on a dashboard the useful signal
 * is whether anything needs doing, and a row of zeroes reads as noise.
 */
function RoleRow({ label, n, to }: { label: string; n: number; to: string }) {
  return (
    <Link
      to={to}
      className="flex items-center justify-between gap-3 rounded-md py-1.5 text-sm transition hover:bg-muted/60"
    >
      <span className="text-muted-foreground">{label}</span>
      <StatusChip tone={n > 0 ? "working" : "done"}>{n > 0 ? n : "Clear"}</StatusChip>
    </Link>
  );
}
