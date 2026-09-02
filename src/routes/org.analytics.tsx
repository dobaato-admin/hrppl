import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { can } from "@/lib/rbac";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
} from "recharts";
import { getOrgAnalytics } from "@/lib/analytics.functions";

export const Route = createFileRoute("/org/analytics")({
  head: () => ({ meta: [{ title: "Analytics — WorldPay HRMS" }] }),
  component: AnalyticsPage,
});

interface AnalyticsData {
  kpis: {
    activeHeadcount: number;
    onboardingCompletionRate: number;
    terminationsInWindow: number;
    attritionRate: number;
    latestCycleName: string | null;
    trainingCompletionRate: number;
    payrollTotalInWindow: number;
    payrollCurrency: string;
    expenseTotalInWindow: number;
    expenseCurrency: string;
  };
  byDepartment: { name: string; count: number }[];
  onboarding: {
    total: number;
    in_progress: number;
    completed: number;
    signed_off: number;
    cancelled: number;
  };
  reviewMix: { name: string; value: number }[];
  leaveBreakdown: { name: string; days: number }[];
  timesheetMix: { name: string; value: number }[];
  headcountTrend: { month: string; headcount: number }[];
  payrollTrend: { month: string; amount: number }[];
  trainingMix: { name: string; value: number }[];
  expenseTrend: { month: string; amount: number }[];
}

const PIE_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--chart-2, var(--accent)))",
  "hsl(var(--chart-3, var(--secondary)))",
  "hsl(var(--chart-4, var(--muted-foreground)))",
  "hsl(var(--destructive))",
];

function AnalyticsPage() {
  const { user, roles, loading } = useAuth();
  const navigate = useNavigate();
  const [months, setMonths] = useState(6);
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [busy, setBusy] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fnAnalytics = useServerFn(getOrgAnalytics);
  // W5 · Single source: the same feature key this page's nav row uses.
  // These pages carry no route-level gate component, only this inline
  // check, so the two were free to disagree — and did. The sidebar offered
  // the page and the page answered "Forbidden".
  const canAccess = can("org.analytics", roles);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [loading, user, navigate]);

  const refresh = useMemo(() => {
    return () => {
      if (!user || !canAccess) return;
      setBusy(true);
      fnAnalytics({ data: { monthsBack: months } })
        .then((r) => {
          setData(r as AnalyticsData);
          setLastUpdated(new Date());
        })
        .catch(() => {})
        .finally(() => setBusy(false));
    };
  }, [user, canAccess, months, fnAnalytics]);

  // Initial load + reload when months change
  useEffect(() => {
    refresh();
  }, [refresh]);

  // Auto-refresh every 60s so KPIs reflect new timesheets / leave / onboarding / HR changes
  useEffect(() => {
    if (!user || !canAccess) return;
    const id = window.setInterval(() => {
      if (document.visibilityState === "visible") refresh();
    }, 60_000);
    return () => window.clearInterval(id);
  }, [user, canAccess, refresh]);

  // Refresh when the tab regains focus
  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState === "visible") refresh();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [refresh]);

  const onboardingPie = useMemo(() => {
    if (!data) return [];
    const o = data.onboarding;
    return [
      { name: "In progress", value: o.in_progress },
      { name: "Completed", value: o.completed },
      { name: "Signed off", value: o.signed_off },
      { name: "Cancelled", value: o.cancelled },
    ].filter((d) => d.value > 0);
  }, [data]);

  if (loading || !user)
    return (
      <main className="flex min-h-screen items-center justify-center text-muted-foreground">
        Loading…
      </main>
    );
  if (!canAccess)
    return (
      <main className="flex min-h-screen items-center justify-center text-muted-foreground">
        Forbidden.
      </main>
    );

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-xl font-semibold">Analytics</h1>
            <p className="text-xs text-muted-foreground">
              Live from timesheets, leave, onboarding, and HR records.
              {lastUpdated && <> · Updated {lastUpdated.toLocaleTimeString()}</>}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={String(months)} onValueChange={(v) => setMonths(Number(v))}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3">Last 3 months</SelectItem>
                <SelectItem value="6">Last 6 months</SelectItem>
                <SelectItem value="12">Last 12 months</SelectItem>
                <SelectItem value="24">Last 24 months</SelectItem>
              </SelectContent>
            </Select>
            <Button size="sm" variant="outline" onClick={refresh} disabled={busy}>
              {busy ? "Refreshing…" : "Refresh"}
            </Button>
            <Link to="/org/reports">
              <Button variant="outline" size="sm">
                Reports
              </Button>
            </Link>
            <Link to="/org">
              <Button variant="outline" size="sm">
                Back
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-6xl space-y-6 px-6 py-8">
        <div className="grid gap-4 md:grid-cols-4">
          <Kpi
            label="Active headcount"
            value={data ? String(data.kpis.activeHeadcount) : "—"}
            href="/org/employees?status=active"
            linkLabel="View employees"
          />
          <Kpi
            label="Onboarding completion"
            value={data ? `${data.kpis.onboardingCompletionRate}%` : "—"}
            href="/org/onboarding"
            linkLabel="View assignments"
          />
          <Kpi
            label="Terminations (window)"
            value={data ? String(data.kpis.terminationsInWindow) : "—"}
            href={`/org/employees?status=terminated&monthsBack=${months}`}
            linkLabel="View terminations"
          />
          <Kpi
            label="Attrition rate"
            value={data ? `${data.kpis.attritionRate}%` : "—"}
            href="/org/employees"
            linkLabel="View employees"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Kpi
            label="Payroll cost (window)"
            value={
              data
                ? `${data.kpis.payrollCurrency || ""} ${data.kpis.payrollTotalInWindow.toLocaleString()}`.trim()
                : "—"
            }
            href="/org/payroll"
            linkLabel="View payroll runs"
          />
          <Kpi
            label="Approved expense spend"
            value={
              data
                ? `${data.kpis.expenseCurrency || ""} ${data.kpis.expenseTotalInWindow.toLocaleString()}`.trim()
                : "—"
            }
            href="/org/expenses?status=approved"
            linkLabel="View expenses"
          />
          <Kpi
            label="Training completion"
            value={data ? `${data.kpis.trainingCompletionRate}%` : "—"}
            href="/org/training"
            linkLabel="View training"
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Headcount trend</CardTitle>
              <CardDescription>Active employees at month end.</CardDescription>
            </CardHeader>
            <CardContent style={{ height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data?.headcountTrend ?? []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" fontSize={11} />
                  <YAxis fontSize={11} />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="headcount"
                    stroke="hsl(var(--primary))"
                    fill="hsl(var(--primary))"
                    fillOpacity={0.2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Payroll cost trend</CardTitle>
              <CardDescription>
                Approved runs, net pay per month
                {data?.kpis.payrollCurrency ? ` (${data.kpis.payrollCurrency})` : ""}.
              </CardDescription>
            </CardHeader>
            <CardContent style={{ height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data?.payrollTrend ?? []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" fontSize={11} />
                  <YAxis fontSize={11} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="amount"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Training mix</CardTitle>
              <CardDescription>Enrollments by status in window.</CardDescription>
            </CardHeader>
            <CardContent style={{ height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data?.trainingMix ?? []}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={80}
                    label
                  >
                    {(data?.trainingMix ?? []).map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
            <DrilldownList
              items={(data?.trainingMix ?? []).map((t) => ({
                label: t.name,
                count: t.value,
                href: `/org/training?status=${encodeURIComponent(t.name)}`,
              }))}
              emptyLabel="No training in window"
            />
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Expense spend trend</CardTitle>
              <CardDescription>
                Approved &amp; paid claims per month
                {data?.kpis.expenseCurrency ? ` (${data.kpis.expenseCurrency})` : ""}.
              </CardDescription>
            </CardHeader>
            <CardContent style={{ height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data?.expenseTrend ?? []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" fontSize={11} />
                  <YAxis fontSize={11} />
                  <Tooltip />
                  <Bar dataKey="amount" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Headcount by department</CardTitle>
              <CardDescription>Active employees grouped by department.</CardDescription>
            </CardHeader>
            <CardContent style={{ height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data?.byDepartment ?? []} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" fontSize={11} />
                  <YAxis dataKey="name" type="category" fontSize={11} width={110} />
                  <Tooltip />
                  <Bar dataKey="count" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
            <DrilldownList
              items={(data?.byDepartment ?? []).map((d) => ({
                label: d.name,
                count: d.count,
                href: `/org/employees?department=${encodeURIComponent(d.name)}&status=active`,
              }))}
              emptyLabel="No department data"
            />
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Onboarding funnel</CardTitle>
              <CardDescription>{data?.onboarding.total ?? 0} total assignments.</CardDescription>
            </CardHeader>
            <CardContent style={{ height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={onboardingPie} dataKey="value" nameKey="name" outerRadius={90} label>
                    {onboardingPie.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
            <DrilldownList
              items={[
                {
                  label: "In progress",
                  count: data?.onboarding.in_progress ?? 0,
                  href: "/org/onboarding?status=in_progress",
                },
                {
                  label: "Completed",
                  count: data?.onboarding.completed ?? 0,
                  href: "/org/onboarding?status=completed",
                },
                {
                  label: "Signed off",
                  count: data?.onboarding.signed_off ?? 0,
                  href: "/org/onboarding?status=signed_off",
                },
                {
                  label: "Cancelled",
                  count: data?.onboarding.cancelled ?? 0,
                  href: "/org/onboarding?status=cancelled",
                },
              ]}
              emptyLabel="No assignments"
            />
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Review status</CardTitle>
              <CardDescription>
                {data?.kpis.latestCycleName
                  ? `Cycle: ${data.kpis.latestCycleName}`
                  : "Latest cycle"}
              </CardDescription>
            </CardHeader>
            <CardContent style={{ height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data?.reviewMix ?? []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" fontSize={11} />
                  <YAxis fontSize={11} />
                  <Tooltip />
                  <Bar dataKey="value" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
            <DrilldownList
              items={(data?.reviewMix ?? []).map((r) => ({
                label: r.name,
                count: r.value,
                href: `/org/performance?status=${encodeURIComponent(r.name.toLowerCase().replace(/\s+/g, "_"))}`,
              }))}
              emptyLabel="No reviews in cycle"
            />
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Leave by type</CardTitle>
              <CardDescription>Approved days in window.</CardDescription>
            </CardHeader>
            <CardContent style={{ height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data?.leaveBreakdown ?? []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" fontSize={11} />
                  <YAxis fontSize={11} />
                  <Tooltip />
                  <Bar dataKey="days" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
            <DrilldownList
              items={(data?.leaveBreakdown ?? []).map((l) => ({
                label: l.name,
                count: l.days,
                suffix: "days",
                href: `/org/leave?type=${encodeURIComponent(l.name)}&status=approved&monthsBack=${months}`,
              }))}
              emptyLabel="No approved leave"
            />
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="text-base">Timesheet status</CardTitle>
              <CardDescription>Submissions in window, by status.</CardDescription>
            </CardHeader>
            <CardContent style={{ height: 240 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data?.timesheetMix ?? []}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={80}
                    label
                  >
                    {(data?.timesheetMix ?? []).map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
            <DrilldownList
              items={(data?.timesheetMix ?? []).map((t) => ({
                label: t.name,
                count: t.value,
                href: `/org/timesheets?status=${encodeURIComponent(t.name.toLowerCase())}&monthsBack=${months}`,
              }))}
              emptyLabel="No timesheets"
            />
          </Card>
        </div>

        {busy && <p className="text-xs text-muted-foreground">Loading…</p>}
      </section>
    </main>
  );
}

function Kpi({
  label,
  value,
  href,
  linkLabel,
}: {
  label: string;
  value: string;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardDescription>{label}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold">{value}</div>
        {href && (
          <a href={href} className="mt-1 inline-block text-xs text-primary hover:underline">
            {linkLabel ?? "View details"} →
          </a>
        )}
      </CardContent>
    </Card>
  );
}

function DrilldownList({
  items,
  emptyLabel,
}: {
  items: { label: string; count: number; href: string; suffix?: string }[];
  emptyLabel: string;
}) {
  if (!items.length) {
    return (
      <div className="border-t border-border px-6 py-3 text-xs text-muted-foreground">
        {emptyLabel}
      </div>
    );
  }
  return (
    <div className="border-t border-border px-6 py-3">
      <ul className="grid gap-1 sm:grid-cols-2">
        {items.map((it) => (
          <li key={it.label} className="flex items-center justify-between gap-2 text-xs">
            <a
              href={it.href}
              className="truncate text-foreground hover:text-primary hover:underline"
            >
              {it.label}
            </a>
            <a href={it.href} className="shrink-0 text-muted-foreground hover:text-primary">
              {it.count}
              {it.suffix ? ` ${it.suffix}` : ""} →
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
