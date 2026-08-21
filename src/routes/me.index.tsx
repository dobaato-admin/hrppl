import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { getMeOverview } from "@/lib/me.functions";
import { KpiTile, SectionCard, SkeletonRows, StatusChip, statusTone, EmptyState } from "@/components/monday";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { CalendarDays, FolderOpen, Receipt, ListChecks, Plus, ArrowUpRight } from "lucide-react";

export const Route = createFileRoute("/me/")({
  head: () => ({ meta: [{ title: "Me — hrppl" }] }),
  component: MeOverview,
});

function fmtMoney(n: number | null | undefined, c?: string | null) {
  if (n == null) return "—";
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency: c || "USD" }).format(Number(n));
  } catch { return `${n} ${c ?? ""}`.trim(); }
}
function fmtDate(d?: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });
}

function MeOverview() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  useEffect(() => { if (!loading && !user) navigate({ to: "/auth" }); }, [loading, user, navigate]);

  const fn = useServerFn(getMeOverview);
  const { data, isLoading } = useQuery({
    queryKey: ["me-overview"],
    queryFn: () => fn({}),
    enabled: !!user,
  });

  if (isLoading || !data) return <SkeletonRows rows={6} />;
  if (!data.employee) {
    return (
      <EmptyState
        title="No employee record yet"
        description="Once your organization links your account to an employee profile, your self-service hub will appear here."
      />
    );
  }

  const e = data.employee;
  return (
    <div className="space-y-4">
      <SectionCard tone="primary">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-widest text-primary">Employee #{e.employee_number}</div>
            <h2 className="font-display text-2xl font-bold tracking-tight">{e.first_name} {e.last_name}</h2>
            <p className="text-sm text-muted-foreground">
              {e.job_title ?? "—"}{data.department ? ` · ${data.department.name}` : ""} · Hired {fmtDate(e.hire_date)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {e.email}{e.phone ? ` · ${e.phone}` : ""}
            </p>
          </div>
          <div className="text-right">
            <div className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Manager</div>
            {data.manager ? (
              <div className="font-medium">{data.manager.first_name} {data.manager.last_name}</div>
            ) : (
              <div className="text-sm text-muted-foreground">No manager set</div>
            )}
            {data.manager?.job_title && <div className="text-xs text-muted-foreground">{data.manager.job_title}</div>}
          </div>
        </div>
        <div className="mt-4">
          <div className="mb-1 flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Profile completeness</span>
            <span className="font-medium tabular-nums">{data.profileCompleteness}%</span>
          </div>
          <Progress value={data.profileCompleteness} />
          {data.profileCompleteness < 100 && (
            <div className="mt-2 flex gap-2">
              <Button asChild size="sm" variant="outline"><Link to="/me/contact">Update contact <ArrowUpRight className="ml-1 h-3 w-3" /></Link></Button>
              <Button asChild size="sm" variant="outline"><Link to="/me/banking-tax">Banking & tax <ArrowUpRight className="ml-1 h-3 w-3" /></Link></Button>
            </div>
          )}
        </div>
      </SectionCard>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiTile label="Leave pending" value={data.pendingLeaveCount} tone="working" to="/leave" icon={CalendarDays} />
        <KpiTile label="Open tasks" value={data.openTaskCount} tone="pending" to="/onboarding" icon={ListChecks} />
        <KpiTile label="Documents" value={data.documentCount} tone="info" to="/me/documents" icon={FolderOpen} />
        <KpiTile label="Payslips" value={data.recentPayslips.length} tone="primary" to="/my-payslips" icon={Receipt} />
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard
          title="Leave balances"
          description="Days available across leave types"
          actions={<Button asChild size="sm"><Link to="/leave"><Plus className="mr-1 h-3.5 w-3.5" /> Request</Link></Button>}
        >
          {data.leaveBalances.length === 0 ? (
            <EmptyState title="No leave types configured" description="Ask your admin to set up leave types." />
          ) : (
            <ul className="divide-y">
              {data.leaveBalances.map((b: any, i: number) => {
                const available = Number(b.accrued_days ?? 0) + Number(b.carried_over_days ?? 0) - Number(b.used_days ?? 0) - Number(b.pending_days ?? 0);
                return (
                  <li key={i} className="flex items-center justify-between py-2.5">
                    <div className="min-w-0">
                      <div className="font-medium">{b.leave_type?.name ?? "Leave"}</div>
                      <div className="text-xs text-muted-foreground">
                        {Number(b.used_days).toFixed(1)} used · {Number(b.pending_days).toFixed(1)} pending
                      </div>
                    </div>
                    <span className="tabular-nums font-semibold">
                      {available.toFixed(1)} <span className="text-xs font-normal text-muted-foreground">days</span>
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </SectionCard>

        <SectionCard title="Recent leave" description="Your last 5 requests">
          {data.recentLeave.length === 0 ? (
            <EmptyState title="No leave requests yet" />
          ) : (
            <ul className="divide-y">
              {data.recentLeave.map((r: any) => {
                const st = statusTone(r.status);
                return (
                  <li key={r.id} className="flex items-center justify-between py-2.5">
                    <div className="min-w-0">
                      <div className="font-medium">{r.leave_type?.name ?? "Leave"}</div>
                      <div className="text-xs text-muted-foreground">{fmtDate(r.start_date)} → {fmtDate(r.end_date)} · {Number(r.days).toFixed(1)} days</div>
                    </div>
                    <StatusChip tone={st.tone}>{st.label}</StatusChip>
                  </li>
                );
              })}
            </ul>
          )}
        </SectionCard>
      </div>

      <SectionCard
        title="Recent payslips"
        description="Latest 3 pay periods"
        actions={<Button asChild size="sm" variant="outline"><Link to="/my-payslips">All payslips</Link></Button>}
      >
        {data.recentPayslips.length === 0 ? (
          <EmptyState title="No payslips yet" description="Once your first pay run is approved, payslips will appear here." />
        ) : (
          <ul className="divide-y">
            {data.recentPayslips.map((p: any) => {
              const st = statusTone(p.run?.status ?? "pending");
              return (
                <li key={p.id} className="flex items-center justify-between py-2.5">
                  <div className="min-w-0">
                    <div className="font-medium">{fmtDate(p.run?.period_start)} → {fmtDate(p.run?.period_end)}</div>
                    <div className="text-xs text-muted-foreground">Pay date {fmtDate(p.run?.pay_date)}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-display text-lg font-semibold tabular-nums">{fmtMoney(p.net_pay, p.currency_code)}</span>
                    <StatusChip tone={st.tone}>{st.label}</StatusChip>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </SectionCard>
    </div>
  );
}
