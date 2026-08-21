import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { getDashboardSnapshot } from "@/lib/dashboard.functions";
import { SectionCard, EmptyState, SkeletonRows, KpiTile } from "@/components/monday";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertTriangle,
  CalendarDays,
  ClipboardCheck,
  ClipboardList,
  DollarSign,
  FileSignature,
  FileWarning,
  GraduationCap,
  IdCard,
  Inbox,
  Receipt,
  Sparkles,
  Users,
  Building2,
  MapPin,
  BadgeCheck,
  Wallet,
  Briefcase,
} from "lucide-react";

export const Route = createFileRoute("/me/dashboard")({
  head: () => ({ meta: [{ title: "My dashboard — hrppl" }] }),
  component: Dashboard,
});

function fmtName(p?: { first_name?: string; last_name?: string } | null) {
  if (!p) return "—";
  return `${p.first_name ?? ""} ${p.last_name ?? ""}`.trim() || "—";
}

function AnomalyList({
  title,
  items,
  icon: Icon,
  cta,
  render,
  emptyHint,
}: {
  title: string;
  items: any[];
  icon: any;
  cta?: { label: string; to: string };
  render: (e: any) => React.ReactNode;
  emptyHint?: string;
}) {
  const count = items?.length ?? 0;
  return (
    <SectionCard
      title={
        <span className="flex items-center gap-2">
          <Icon className="h-4 w-4" /> {title}
          <Badge variant={count > 0 ? "destructive" : "secondary"} className="ml-1">{count}</Badge>
        </span> as any
      }
      tone={count > 0 ? "stuck" : "done"}
    >
      {count === 0 ? (
        <EmptyState title="All clear" description={emptyHint ?? "Nothing needs attention here."} />
      ) : (
        <div className="space-y-1.5">
          {items.slice(0, 8).map((e: any, i: number) => (
            <div key={e.id ?? i} className="flex items-center justify-between rounded-md border bg-card px-3 py-1.5 text-sm">
              {render(e)}
            </div>
          ))}
          {items.length > 8 && (
            <div className="px-3 pt-1 text-xs text-muted-foreground">+ {items.length - 8} more</div>
          )}
          {cta && (
            <div className="pt-2">
              <Button asChild size="sm" variant="outline"><Link to={cta.to}>{cta.label}</Link></Button>
            </div>
          )}
        </div>
      )}
    </SectionCard>
  );
}

function Dashboard() {
  const fn = useServerFn(getDashboardSnapshot);
  const { data, isLoading } = useQuery({ queryKey: ["dashboard-snapshot"], queryFn: () => fn({}) });

  if (isLoading) return <SkeletonRows rows={8} />;
  if (!data) return <EmptyState title="No data" />;

  const me = data.me;
  const mgr = data.manager;
  const hr = data.hr;
  const fin = data.finance;

  const personalAnomalies =
    (me?.pendingLeaveCount ?? 0) +
    (me?.onboardingOpenCount ?? 0) +
    (me?.trainingDueCount ?? 0) +
    (me?.signaturesPendingCount ?? 0) +
    (me?.draftTimesheetCount ?? 0) +
    ((me?.completeness ?? 100) < 80 ? 1 : 0);

  return (
    <div className="space-y-5">
      {/* ME snapshot */}
      <SectionCard
        title="My snapshot"
        tone={personalAnomalies > 0 ? "stuck" : "done"}
        description={
          personalAnomalies === 0
            ? "You're all caught up."
            : `${personalAnomalies} item${personalAnomalies === 1 ? "" : "s"} need your attention.`
        }
      >
        {me ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <KpiTile
              label="Profile complete"
              value={`${me.completeness}%`}
              tone={me.completeness < 80 ? "stuck" : "done"}
              icon={FileWarning}
              hint={me.completeness < 80 ? `${me.missingProfileFields.length} fields to fill` : "Looking good"}
            />
            <KpiTile
              label="Pending leave"
              value={me.pendingLeaveCount}
              tone={me.pendingLeaveCount > 0 ? "working" : "info"}
              icon={CalendarDays}
              hint={me.pendingLeaveCount > 0 ? "Awaiting approval" : "Nothing pending"}
            />
            <KpiTile
              label="Onboarding tasks"
              value={me.onboardingOpenCount}
              tone={me.onboardingOpenCount > 0 ? "working" : "info"}
              icon={ClipboardList}
            />
            <KpiTile
              label="Training due"
              value={me.trainingDueCount}
              tone={me.trainingDueCount > 0 ? "working" : "info"}
              icon={GraduationCap}
            />
            <KpiTile
              label="Docs to sign"
              value={me.signaturesPendingCount}
              tone={me.signaturesPendingCount > 0 ? "stuck" : "info"}
              icon={FileSignature}
            />
            <KpiTile
              label="Draft timesheet"
              value={me.draftTimesheetCount}
              tone={me.draftTimesheetCount > 0 ? "working" : "info"}
              icon={ClipboardCheck}
            />
          </div>
        ) : (
          <EmptyState title="No employee record" description="Ask HR to link your account." />
        )}

        {me?.nextHoliday && (
          <div className="mt-3 rounded-md border bg-accent/30 px-3 py-2 text-sm">
            <span className="font-medium">Next public holiday: </span>
            {me.nextHoliday.name} — {me.nextHoliday.holiday_date}
          </div>
        )}

        {me?.latestPayslip && (
          <div className="mt-2 rounded-md border bg-card px-3 py-2 text-sm">
            <span className="font-medium">Latest payslip: </span>
            {me.latestPayslip.currency_code} {Number(me.latestPayslip.net_pay).toLocaleString()} —{" "}
            {me.latestPayslip.run?.pay_date ?? "n/a"}
          </div>
        )}
      </SectionCard>

      {/* MANAGER */}
      {mgr && mgr.reportsCount > 0 && (
        <>
          <SectionCard
            title={<span className="flex items-center gap-2"><Users className="h-4 w-4" /> Team approvals</span> as any}
            tone="primary"
            description={`Across ${mgr.reportsCount} direct report${mgr.reportsCount === 1 ? "" : "s"}`}
          >
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <KpiTile label="Pending leave" value={mgr.pendingLeave.length} tone={mgr.pendingLeave.length ? "stuck" : "done"} icon={CalendarDays} />
              <KpiTile label="Pending expenses" value={mgr.pendingExpense.length} tone={mgr.pendingExpense.length ? "stuck" : "done"} icon={Receipt} />
              <KpiTile label="Submitted timesheets" value={mgr.pendingTimesheets.length} tone={mgr.pendingTimesheets.length ? "working" : "done"} icon={ClipboardCheck} />
              <KpiTile label="Reviews to action" value={mgr.overdueReviews.length} tone={mgr.overdueReviews.length ? "working" : "done"} icon={Sparkles} />
            </div>
          </SectionCard>

          <div className="grid gap-3 lg:grid-cols-2">
            <AnomalyList
              title="Leave awaiting your decision"
              items={mgr.pendingLeave}
              icon={CalendarDays}
              cta={{ label: "Open leave", to: "/leave" }}
              render={(r) => (
                <>
                  <span className="truncate">{fmtName(r.employee)} · {r.leave_type?.name ?? "leave"} · {r.days}d</span>
                  <span className="text-xs text-muted-foreground">{r.start_date} → {r.end_date}</span>
                </>
              )}
            />
            <AnomalyList
              title="Expenses to approve"
              items={mgr.pendingExpense}
              icon={Receipt}
              cta={{ label: "Open expenses", to: "/expenses" }}
              render={(r) => (
                <>
                  <span className="truncate">{fmtName(r.employee)} · {r.title}</span>
                  <span className="text-xs font-medium">{r.currency} {Number(r.total_amount).toLocaleString()}</span>
                </>
              )}
            />
          </div>
        </>
      )}

      {/* HR / Org admin */}
      {hr && (
        <>
          <SectionCard
            title={<span className="flex items-center gap-2"><BadgeCheck className="h-4 w-4" /> Org-wide setup health</span> as any}
            tone={
              hr.missingPay.length + hr.missingDesignation.length + hr.missingDepartment.length +
              hr.missingBranch.length + hr.missingProfile.length + hr.missingOpeningBalance.length > 0
                ? "stuck" : "done"
            }
            description={`${hr.activeEmployeeCount} active employees · ${hr.leaveTypesConfigured} leave types configured`}
          >
            {hr.leaveTypesConfigured === 0 && (
              <div className="mb-3 flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm">
                <AlertTriangle className="mt-0.5 h-4 w-4 text-destructive" />
                <div className="flex-1">
                  <div className="font-medium">No leave types configured</div>
                  <div className="text-xs text-muted-foreground">Staff cannot request leave until at least one type exists.</div>
                </div>
                <Button asChild size="sm"><Link to="/admin/leave-types">Set up</Link></Button>
              </div>
            )}
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <KpiTile label="Missing pay rate" value={hr.missingPay.length} tone={hr.missingPay.length ? "stuck" : "done"} icon={DollarSign} />
              <KpiTile label="Missing designation" value={hr.missingDesignation.length} tone={hr.missingDesignation.length ? "stuck" : "done"} icon={Briefcase} />
              <KpiTile label="Missing department" value={hr.missingDepartment.length} tone={hr.missingDepartment.length ? "stuck" : "done"} icon={Building2} />
              <KpiTile label="Missing branch / office" value={hr.missingBranch.length} tone={hr.missingBranch.length ? "stuck" : "done"} icon={MapPin} />
              <KpiTile label="Incomplete personal profile" value={hr.missingProfile.length} tone={hr.missingProfile.length ? "stuck" : "done"} icon={IdCard} />
              <KpiTile label="No opening leave balance" value={hr.missingOpeningBalance.length} tone={hr.missingOpeningBalance.length ? "stuck" : "done"} icon={CalendarDays} />
            </div>
          </SectionCard>

          <div className="grid gap-3 lg:grid-cols-2">
            <AnomalyList
              title="Employees missing pay rate"
              items={hr.missingPay}
              icon={DollarSign}
              cta={{ label: "Open pay rates", to: "/org/pay-rates" }}
              render={(e) => (
                <>
                  <span className="truncate">{fmtName(e)}</span>
                  <span className="text-xs text-muted-foreground">{e.job_title ?? "no role"}</span>
                </>
              )}
            />
            <AnomalyList
              title="Employees missing designation / role"
              items={hr.missingDesignation}
              icon={Briefcase}
              cta={{ label: "Manage designations", to: "/admin/designations" }}
              render={(e) => (
                <>
                  <span className="truncate">{fmtName(e)}</span>
                  <span className="text-xs text-muted-foreground">no job title set</span>
                </>
              )}
            />
            <AnomalyList
              title="Employees missing department"
              items={hr.missingDepartment}
              icon={Building2}
              cta={{ label: "Manage departments", to: "/admin/departments" }}
              render={(e) => (
                <>
                  <span className="truncate">{fmtName(e)}</span>
                  <span className="text-xs text-muted-foreground">{e.job_title ?? "—"}</span>
                </>
              )}
            />
            <AnomalyList
              title="Employees missing branch / office"
              items={hr.missingBranch}
              icon={MapPin}
              cta={{ label: "Manage branches", to: "/org" }}
              render={(e) => (
                <>
                  <span className="truncate">{fmtName(e)}</span>
                  <span className="text-xs text-muted-foreground">{e.job_title ?? "—"}</span>
                </>
              )}
            />
            <AnomalyList
              title="Incomplete personal profiles"
              items={hr.missingProfile}
              icon={IdCard}
              cta={{ label: "View employees", to: "/admin" }}
              render={(e) => (
                <>
                  <span className="truncate">{fmtName(e)}</span>
                  <span className="text-xs text-muted-foreground">missing: {(e.missing ?? []).join(", ")}</span>
                </>
              )}
            />
            <AnomalyList
              title="Missing opening leave balance"
              items={hr.missingOpeningBalance}
              icon={CalendarDays}
              cta={{ label: "Open leave types", to: "/admin/leave-types" }}
              render={(e) => (
                <>
                  <span className="truncate">{fmtName(e)}</span>
                  <span className="text-xs text-muted-foreground">{e.missing_leave_type_ids?.length ?? 0} type(s) unset</span>
                </>
              )}
            />
            <AnomalyList
              title="Certifications expiring (60d)"
              items={hr.expiringCertifications}
              icon={BadgeCheck}
              render={(c) => (
                <>
                  <span className="truncate">{fmtName(c.employee)} · {c.name}</span>
                  <span className="text-xs text-muted-foreground">{c.expiry_date}</span>
                </>
              )}
            />
            <SectionCard title={<span className="flex items-center gap-2"><Inbox className="h-4 w-4" /> Onboarding in flight</span> as any}>
              <div className="flex items-center justify-between">
                <div className="text-sm">{hr.pendingOnboardingCount} assignment{hr.pendingOnboardingCount === 1 ? "" : "s"} in progress</div>
                <Button asChild size="sm" variant="outline"><Link to="/onboarding">Open</Link></Button>
              </div>
            </SectionCard>
          </div>
        </>
      )}

      {/* FINANCE */}
      {fin && (
        <SectionCard
          title={<span className="flex items-center gap-2"><Wallet className="h-4 w-4" /> Finance queue</span> as any}
          tone={fin.draftRuns.length || fin.pendingExpenseClaims || fin.fxStale ? "working" : "done"}
        >
          <div className="grid gap-3 sm:grid-cols-3">
            <KpiTile label="Payroll runs in progress" value={fin.draftRuns.length} tone={fin.draftRuns.length ? "working" : "done"} icon={DollarSign} />
            <KpiTile label="Expense claims to review" value={fin.pendingExpenseClaims} tone={fin.pendingExpenseClaims ? "stuck" : "done"} icon={Receipt} />
            <KpiTile label="FX rate age" value={fin.fxAgeDays === null ? "—" : `${fin.fxAgeDays}d`} tone={fin.fxStale ? "stuck" : "done"} icon={AlertTriangle} hint={fin.fxStale ? "Refresh FX" : "Recent"} />
          </div>
          {fin.draftRuns.length > 0 && (
            <div className="mt-3 space-y-1.5">
              {fin.draftRuns.map((r: any) => (
                <div key={r.id} className="flex items-center justify-between rounded-md border bg-card px-3 py-1.5 text-sm">
                  <span>{r.period_start} → {r.period_end} · pay {r.pay_date}</span>
                  <Badge variant="outline">{r.status}</Badge>
                </div>
              ))}
            </div>
          )}
          {(fin.pendingExpenseList ?? []).length > 0 && (
            <div className="mt-3">
              <div className="mb-1.5 flex items-center justify-between">
                <div className="text-xs font-medium text-muted-foreground">Expense claims awaiting approval</div>
                <Button asChild size="sm" variant="outline"><Link to="/org/expenses">Review all</Link></Button>
              </div>
              <div className="space-y-1.5">
                {(fin.pendingExpenseList ?? []).map((c: any) => (
                  <Link
                    key={c.id}
                    to="/org/expenses"
                    className="flex items-center justify-between rounded-md border bg-card px-3 py-1.5 text-sm hover:bg-muted/40"
                  >
                    <span className="min-w-0 truncate">
                      <span className="font-medium">{c.title}</span>{" "}
                      <span className="text-xs text-muted-foreground">
                        · {fmtName(c.employee)}
                        {c.submitted_at ? ` · ${new Date(c.submitted_at).toLocaleDateString()}` : ""}
                      </span>
                    </span>
                    <Badge variant="outline">{Number(c.total_amount ?? 0).toFixed(2)} {c.currency ?? ""}</Badge>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </SectionCard>
      )}
    </div>
  );
}
