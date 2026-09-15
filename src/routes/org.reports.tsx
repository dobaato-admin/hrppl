import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { can } from "@/lib/rbac";
import { useEffect, useState } from "react";
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
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";
import { getOrgReports } from "@/lib/reports.functions";

export const Route = createFileRoute("/org/reports")({
  head: () => ({ meta: [{ title: "Reports — hrppl" }] }),
  component: ReportsPage,
});

interface Row {
  month: string;
  hires: number;
  terminations: number;
  payrollCost: number;
  leaveDays: number;
  overtimeHours: number;
}
interface Kpis {
  headcount: number;
  monthlySalaryBill: number;
  pendingLeaveRequests: number;
  overtimeLast: number;
  currency: string;
}

function toCsv(rows: any[]): string {
  if (!rows.length) return "";
  const cols = Object.keys(rows[0]);
  const head = cols.join(",");
  const body = rows.map((r) => cols.map((c) => JSON.stringify(r[c] ?? "")).join(",")).join("\n");
  return head + "\n" + body;
}
function download(name: string, content: string) {
  const blob = new Blob([content], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function ReportsPage() {
  const { user, roles, loading } = useAuth();
  const navigate = useNavigate();
  const [months, setMonths] = useState(6);
  const [kpis, setKpis] = useState<Kpis | null>(null);
  const [series, setSeries] = useState<Row[]>([]);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  /**
   * False for `branch_admin`, who holds policies on employees, leave and
   * timesheets but **none on `payroll_runs`**. Their report therefore reads
   * zero runs, and a chart showing a tenant spending nothing on wages is not an
   * empty state — it is a false statement.
   */
  const [payrollVisible, setPayrollVisible] = useState(true);
  /**
   * True for a branch admin, whose `employees` policy is branch-scoped. Every
   * figure below is then their branches', not the organisation's — and a number
   * that means something other than its label is worse than a missing one.
   */
  const [branchScoped, setBranchScoped] = useState(false);

  const fnReports = useServerFn(getOrgReports);
  // W5 · Single source: the same feature key this page's nav row uses.
  // These pages carry no route-level gate component, only this inline
  // check, so the two were free to disagree — and did. The sidebar offered
  // the page and the page answered "Forbidden".
  const canAccess = can("org.reports", roles);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [loading, user, navigate]);

  useEffect(() => {
    if (!user || !canAccess) return;
    setBusy(true);
    setFailed(false);
    fnReports({ data: { monthsBack: months } })
      .then((r) => {
        setKpis(r.kpis as Kpis);
        setSeries(r.series as Row[]);
        setPayrollVisible((r as { payrollVisible?: boolean }).payrollVisible !== false);
        setBranchScoped((r as { branchScoped?: boolean }).branchScoped === true);
      })
      // Was `.catch(() => {})`. A swallowed failure left the last good numbers
      // on screen, or zeros, with nothing to say either had happened.
      .catch((err) => {
        console.error("[reports] could not load organisation report", err);
        setFailed(true);
      })
      .finally(() => setBusy(false));
  }, [user, canAccess, months]);

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
            <h1 className="text-xl font-semibold">Reports & analytics</h1>
            <p className="text-xs text-muted-foreground">
              Headcount, payroll, leave, overtime trends.
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
            <Button
              size="sm"
              variant="outline"
              onClick={() => download(`reports-${months}m.csv`, toCsv(series))}
              disabled={!series.length}
            >
              Export CSV
            </Button>
            <Link to="/org">
              <Button variant="outline" size="sm">
                Back
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {branchScoped && !failed && (
        <div className="mx-auto mb-4 max-w-6xl rounded-md border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
          These figures cover the branches you administer, not the whole organisation.
        </div>
      )}

      {failed && (
        <div className="mx-auto mb-4 max-w-6xl rounded-md border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-muted-foreground">
          Could not load the organisation report. Every figure below is stale or absent — do not
          read it as this month's position.
        </div>
      )}

      <section className="mx-auto max-w-6xl px-6 py-8 space-y-6">
        <div className="grid gap-4 md:grid-cols-4">
          <Kpi label="Active headcount" value={kpis ? String(kpis.headcount) : "—"} />
          <Kpi
            label="Monthly salary bill"
            value={kpis ? `${kpis.monthlySalaryBill.toLocaleString()} ${kpis.currency}` : "—"}
          />
          <Kpi
            label="Pending leave requests"
            value={kpis ? String(kpis.pendingLeaveRequests) : "—"}
          />
          <Kpi label="Overtime last month (h)" value={kpis ? String(kpis.overtimeLast) : "—"} />
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Headcount changes</CardTitle>
            <CardDescription>Hires vs terminations per month.</CardDescription>
          </CardHeader>
          <CardContent style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={series}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" fontSize={11} />
                <YAxis fontSize={11} />
                <Tooltip />
                <Legend />
                <Bar dataKey="hires" fill="hsl(var(--primary))" />
                <Bar dataKey="terminations" fill="hsl(var(--destructive))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Payroll cost (approved)</CardTitle>
            <CardDescription>
              {payrollVisible
                ? `Total gross by month, in ${kpis?.currency ?? "—"}.`
                : "Payroll is not visible to your role, so this chart is not shown. It is not zero."}
            </CardDescription>
          </CardHeader>
          <CardContent style={{ height: 260 }}>
            {!payrollVisible ? (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                Not available for your role.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={series}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" fontSize={11} />
                  <YAxis fontSize={11} />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="payrollCost"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Approved leave days</CardTitle>
            </CardHeader>
            <CardContent style={{ height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={series}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" fontSize={11} />
                  <YAxis fontSize={11} />
                  <Tooltip />
                  <Bar dataKey="leaveDays" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Overtime hours</CardTitle>
            </CardHeader>
            <CardContent style={{ height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={series}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" fontSize={11} />
                  <YAxis fontSize={11} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="overtimeHours"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {busy && <p className="text-xs text-muted-foreground">Loading…</p>}
      </section>
    </main>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardDescription>{label}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold">{value}</div>
      </CardContent>
    </Card>
  );
}
