import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import {
  createPayrollRun,
  computePayrollRun,
  submitPayrollRun,
  approvePayrollRun,
  rejectPayrollRun,
  cancelPayrollRun,
  deletePayrollRun,
} from "@/lib/payroll.functions";
import {
  emailRunPayslips,
  resendPayslipEmail,
  bulkResendPayslipsInRange,
} from "@/lib/payroll-emails.functions";
import { getRunVariance, getRunDistribution } from "@/lib/payroll-insights.functions";
import { generatePayslipPdf } from "@/lib/payslip-pdf";
import {
  Download,
  Eye,
  Mail,
  RefreshCw,
  Loader2,
  CheckCircle,
  AlertCircle,
  XCircle,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";

export const Route = createFileRoute("/org/payroll")({
  head: () => ({ meta: [{ title: "Payroll — WorldPay HRMS" }] }),
  component: PayrollPage,
});

interface PayrollRun {
  id: string;
  period_start: string;
  period_end: string;
  pay_date: string;
  status: "draft" | "computed" | "pending_approval" | "approved" | "cancelled";
  submitted_at: string | null;
  submitted_by: string | null;
  approved_by: string | null;
  currency_code: string;
  totals: any;
  computed_at: string | null;
  approved_at: string | null;
  notes: string | null;
  base_currency_code?: string | null;
  fx_rate?: number | null;
}

interface Payslip {
  id: string;
  employee_id: string;
  gross: number;
  income_tax: number;
  employee_contributions: number;
  employer_contributions: number;
  net_pay: number;
  lines: any[];
}

function PayrollPage() {
  const { user, roles, loading } = useAuth();
  const navigate = useNavigate();
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [runs, setRuns] = useState<PayrollRun[]>([]);
  const [selected, setSelected] = useState<PayrollRun | null>(null);
  const [payslips, setPayslips] = useState<Payslip[]>([]);
  const [employees, setEmployees] = useState<
    Record<
      string,
      {
        name: string;
        number: string;
        email: string;
        first: string;
        last: string;
        job: string | null;
      }
    >
  >({});
  const [tenantInfo, setTenantInfo] = useState<{ name: string; country_code: string } | null>(null);
  const [auAddon, setAuAddon] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({
    periodStart: "",
    periodEnd: "",
    payDate: "",
    notes: "",
    currencyCode: "",
    fxRate: "",
  });
  const [previewSlip, setPreviewSlip] = useState<Payslip | null>(null);

  const create = useServerFn(createPayrollRun);
  const compute = useServerFn(computePayrollRun);
  const submit = useServerFn(submitPayrollRun);
  const approve = useServerFn(approvePayrollRun);
  const reject = useServerFn(rejectPayrollRun);
  const cancelFn = useServerFn(cancelPayrollRun);
  const del = useServerFn(deletePayrollRun);
  const emailPayslips = useServerFn(emailRunPayslips);
  const resendEmail = useServerFn(resendPayslipEmail);
  const bulkResend = useServerFn(bulkResendPayslipsInRange);
  const fetchVariance = useServerFn(getRunVariance);
  const fetchDistribution = useServerFn(getRunDistribution);
  const [bulkRange, setBulkRange] = useState({ from: "", to: "" });
  const [variance, setVariance] = useState<any | null>(null);
  const [varianceOpen, setVarianceOpen] = useState(false);
  const [distribution, setDistribution] = useState<
    Record<string, { count: number; last_at: string | null; last_action: string | null }>
  >({});

  const [bulkProgress, setBulkProgress] = useState<{
    open: boolean;
    status: "idle" | "running" | "done";
    sent: number;
    skipped: number;
    failed: number;
    total: number;
    runs: number;
    errors: string[];
  }>({
    open: false,
    status: "idle",
    sent: 0,
    skipped: 0,
    failed: 0,
    total: 0,
    runs: 0,
    errors: [],
  });

  const isOrgAdmin = roles.includes("org_admin") || roles.includes("super_admin");
  const isManager = roles.includes("manager") || roles.includes("super_admin");
  const canAccess = isOrgAdmin || isManager;

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [loading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("tenant_id")
        .eq("id", user.id)
        .maybeSingle();
      if (data?.tenant_id) {
        setTenantId(data.tenant_id);
        const { data: t } = await supabase
          .from("tenants")
          .select("name,country_code")
          .eq("id", data.tenant_id)
          .maybeSingle();
        if (t) setTenantInfo(t as any);
        const { data: sub } = await supabase
          .from("tenant_subscriptions")
          .select("au_payroll_addon,status")
          .eq("tenant_id", data.tenant_id)
          .maybeSingle();
        setAuAddon(
          !!(sub && sub.au_payroll_addon && (sub.status === "active" || sub.status === "trialing")),
        );
      }
    })();
  }, [user]);

  async function loadRuns() {
    if (!tenantId) return;
    const { data } = await supabase
      .from("payroll_runs")
      .select("*")
      .eq("tenant_id", tenantId)
      .order("period_end", { ascending: false });
    setRuns((data ?? []) as PayrollRun[]);
  }
  useEffect(() => {
    loadRuns();
  }, [tenantId]);

  async function openRun(run: PayrollRun) {
    setSelected(run);
    setVariance(null);
    setDistribution({});
    const { data: ps } = await supabase.from("payroll_payslips").select("*").eq("run_id", run.id);
    setPayslips((ps ?? []) as Payslip[]);
    const ids = Array.from(new Set((ps ?? []).map((p: any) => p.employee_id)));
    if (ids.length) {
      const { data: emps } = await supabase
        .from("employees")
        .select("id,first_name,last_name,employee_number,email,job_title")
        .in("id", ids);
      const map: Record<
        string,
        {
          name: string;
          number: string;
          email: string;
          first: string;
          last: string;
          job: string | null;
        }
      > = {};
      (emps ?? []).forEach((e: any) => {
        map[e.id] = {
          name: `${e.first_name} ${e.last_name}`,
          number: e.employee_number,
          email: e.email,
          first: e.first_name,
          last: e.last_name,
          job: e.job_title,
        };
      });
      setEmployees(map);
    }
    // Load distribution status for approved runs (so we can show "emailed X ago" badges)
    if (run.status === "approved" && (ps ?? []).length > 0) {
      try {
        const res: any = await fetchDistribution({ data: { runId: run.id } });
        setDistribution(res?.distribution ?? {});
      } catch (e) {
        /* non-blocking */
      }
    }
  }

  async function loadVariance(run: PayrollRun) {
    setBusy(true);
    try {
      const res: any = await fetchVariance({ data: { runId: run.id } });
      setVariance(res);
      setVarianceOpen(true);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function onCreate() {
    if (!tenantId) return;
    if (!form.periodStart || !form.periodEnd || !form.payDate) {
      toast.error("All dates required");
      return;
    }
    const currencyCode = form.currencyCode.trim().toUpperCase() || undefined;
    const fxRateNum = form.fxRate.trim() ? Number(form.fxRate) : undefined;
    if (currencyCode && currencyCode.length !== 3) {
      toast.error("Currency must be a 3-letter code (e.g. USD)");
      return;
    }
    if (fxRateNum != null && !(fxRateNum > 0)) {
      toast.error("FX rate must be greater than zero");
      return;
    }
    setBusy(true);
    try {
      await create({
        data: {
          tenantId,
          periodStart: form.periodStart,
          periodEnd: form.periodEnd,
          payDate: form.payDate,
          notes: form.notes || undefined,
          currencyCode,
          fxRate: fxRateNum,
        },
      });
      toast.success("Draft run created");
      setCreateOpen(false);
      setForm({
        periodStart: "",
        periodEnd: "",
        payDate: "",
        notes: "",
        currencyCode: "",
        fxRate: "",
      });
      loadRuns();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function onCompute(run: PayrollRun) {
    setBusy(true);
    try {
      const res = await compute({ data: { runId: run.id } });
      toast.success(`Computed ${res.employeeCount} payslips`);
      loadRuns();
      openRun(run);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function onSubmit(run: PayrollRun) {
    if (!confirm("Submit run for manager approval?")) return;
    setBusy(true);
    try {
      await submit({ data: { runId: run.id } });
      toast.success("Submitted for approval");
      loadRuns();
      openRun(run);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  }
  async function onApprove(run: PayrollRun) {
    if (!confirm("Approve run? This locks payslips and makes them visible to employees.")) return;
    setBusy(true);
    try {
      await approve({ data: { runId: run.id } });
      toast.success("Run approved");
      loadRuns();
      openRun(run);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  }
  async function onReject(run: PayrollRun) {
    const reason = prompt("Reason for rejection (optional):") ?? undefined;
    setBusy(true);
    try {
      await reject({ data: { runId: run.id, reason } });
      toast.success("Run sent back to draft author");
      loadRuns();
      openRun(run);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function onCancel(run: PayrollRun) {
    if (!confirm("Cancel this run?")) return;
    setBusy(true);
    try {
      await cancelFn({ data: { runId: run.id } });
      toast.success("Run cancelled");
      loadRuns();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function onDelete(run: PayrollRun) {
    if (!confirm("Delete this draft run?")) return;
    setBusy(true);
    try {
      await del({ data: { runId: run.id } });
      toast.success("Deleted");
      setSelected(null);
      loadRuns();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function onEmailPayslips(run: PayrollRun) {
    if (!confirm("Email payslip PDFs to all employees in this run?")) return;
    setBusy(true);
    try {
      const res = await emailPayslips({ data: { runId: run.id } });
      if (res.failed > 0 || res.skipped > 0) {
        toast.warning(
          `Sent ${res.sent} of ${res.total} · ${res.skipped} skipped · ${res.failed} failed`,
        );
        if (res.errors?.length) console.warn("[emailRunPayslips]", res.errors);
      } else {
        toast.success(`Queued payslip email for ${res.sent} employee${res.sent === 1 ? "" : "s"}`);
      }
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function onResendPayslip(payslipId: string) {
    if (!selected) return;
    if (!confirm("Resend payslip email to this employee?")) return;
    setBusy(true);
    try {
      await resendEmail({ data: { runId: selected.id, payslipId } });
      toast.success("Payslip email resent");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function onBulkResend() {
    if (!bulkRange.from || !bulkRange.to) {
      toast.error("Pick a from and to date");
      return;
    }
    if (bulkRange.from > bulkRange.to) {
      toast.error("From date must be before To date");
      return;
    }
    if (
      !confirm(
        `Resend all payslips for approved runs with pay date between ${bulkRange.from} and ${bulkRange.to}?`,
      )
    )
      return;
    setBusy(true);
    setBulkProgress({
      open: true,
      status: "running",
      sent: 0,
      skipped: 0,
      failed: 0,
      total: 0,
      runs: 0,
      errors: [],
    });
    try {
      const res: any = await bulkResend({ data: { from: bulkRange.from, to: bulkRange.to } });
      setBulkProgress({
        open: true,
        status: "done",
        sent: res.sent ?? 0,
        skipped: res.skipped ?? 0,
        failed: res.failed ?? 0,
        total: res.total ?? 0,
        runs: res.runs ?? 0,
        errors: res.errors ?? [],
      });
      if (res.runs === 0) {
        toast.info("No approved runs in that range");
      }
    } catch (e: any) {
      setBulkProgress((prev) => ({ ...prev, open: true, status: "done", errors: [e.message] }));
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  }

  function exportCsv() {
    if (!selected || payslips.length === 0) return;
    const header = [
      "Employee #",
      "Employee",
      "Gross",
      "Allowances",
      "Deductions",
      "Employee contrib",
      "Employer contrib",
      "Income tax",
      "Net pay",
    ];
    const rows = payslips.map((p) => [
      employees[p.employee_id]?.number ?? "",
      employees[p.employee_id]?.name ?? "",
      p.gross,
      (p as any).allowances ?? 0,
      (p as any).deductions ?? 0,
      p.employee_contributions,
      p.employer_contributions,
      p.income_tax,
      p.net_pay,
    ]);
    const csv = [header, ...rows]
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `payroll_${selected.period_start}_${selected.period_end}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const fmt = useMemo(
    () => (n: number) =>
      selected
        ? new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: selected.currency_code,
          }).format(n)
        : String(n),
    [selected],
  );

  if (loading || !user) {
    return (
      <main className="flex min-h-screen items-center justify-center text-muted-foreground">
        Loading…
      </main>
    );
  }
  if (!canAccess) {
    return (
      <main className="flex min-h-screen items-center justify-center text-muted-foreground">
        Forbidden
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-xl font-semibold">Payroll runs</h1>
            <p className="text-xs text-muted-foreground">
              Process pay periods and approve payslips.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
              <DialogTrigger asChild>
                <Button size="sm">New run</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>New payroll run</DialogTitle>
                  <DialogDescription>
                    Define the pay period and date. You'll compute payslips next.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-3">
                  <div>
                    <Label>Period start</Label>
                    <Input
                      type="date"
                      value={form.periodStart}
                      onChange={(e) => setForm({ ...form, periodStart: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Period end</Label>
                    <Input
                      type="date"
                      value={form.periodEnd}
                      onChange={(e) => setForm({ ...form, periodEnd: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Pay date</Label>
                    <Input
                      type="date"
                      value={form.payDate}
                      onChange={(e) => setForm({ ...form, payDate: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Pay currency</Label>
                      <Input
                        placeholder="Tenant default"
                        maxLength={3}
                        value={form.currencyCode}
                        onChange={(e) =>
                          setForm({ ...form, currencyCode: e.target.value.toUpperCase() })
                        }
                      />
                      <p className="mt-1 text-xs text-muted-foreground">
                        Leave blank to use the tenant currency.
                      </p>
                    </div>
                    <div>
                      <Label>FX rate (base → pay)</Label>
                      <Input
                        type="number"
                        step="0.000001"
                        min="0"
                        placeholder="Required if different currency"
                        value={form.fxRate}
                        onChange={(e) => setForm({ ...form, fxRate: e.target.value })}
                      />
                      <p className="mt-1 text-xs text-muted-foreground">
                        1 unit of tenant currency × rate = pay currency.
                      </p>
                    </div>
                  </div>
                  <div>
                    <Label>Notes</Label>
                    <Input
                      value={form.notes}
                      onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={onCreate} disabled={busy}>
                    Create draft
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Link to="/org">
              <Button variant="outline" size="sm">
                Back
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-8 space-y-6">
        {tenantInfo?.country_code?.toUpperCase() === "AU" && auAddon === false && (
          <Card className="border-amber-500/40 bg-amber-500/5">
            <CardHeader>
              <CardTitle className="text-base">AU Payroll add-on required</CardTitle>
              <CardDescription>
                Australian payroll (STP Phase 2, Super, Award interpretation) is a paid add-on on
                top of Pro. Payroll for all other countries remains free on every plan. Contact
                sales or visit{" "}
                <Link to="/settings/account" className="underline">
                  Settings → Plan
                </Link>{" "}
                to enable it.
              </CardDescription>
            </CardHeader>
          </Card>
        )}
        {isOrgAdmin && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Bulk resend payslips</CardTitle>
              <CardDescription>
                Resend payslip emails for every approved run with a pay date in this range. One
                audit entry per recipient.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap items-end gap-3">
                <div>
                  <Label>From (pay date)</Label>
                  <Input
                    type="date"
                    value={bulkRange.from}
                    onChange={(e) => setBulkRange({ ...bulkRange, from: e.target.value })}
                  />
                </div>
                <div>
                  <Label>To (pay date)</Label>
                  <Input
                    type="date"
                    value={bulkRange.to}
                    onChange={(e) => setBulkRange({ ...bulkRange, to: e.target.value })}
                  />
                </div>
                <Button onClick={onBulkResend} disabled={busy || !bulkRange.from || !bulkRange.to}>
                  <RefreshCw className="mr-2 h-4 w-4" /> Resend in range
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Runs</CardTitle>
            <CardDescription>All payroll runs for your tenant.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Period</TableHead>
                  <TableHead>Pay date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Employees</TableHead>
                  <TableHead>Net total</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {runs.map((r) => (
                  <TableRow key={r.id} className="cursor-pointer" onClick={() => openRun(r)}>
                    <TableCell>
                      {r.period_start} → {r.period_end}
                    </TableCell>
                    <TableCell>{r.pay_date}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          r.status === "approved"
                            ? "default"
                            : r.status === "cancelled"
                              ? "destructive"
                              : r.status === "pending_approval"
                                ? "outline"
                                : "secondary"
                        }
                      >
                        {r.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{r.totals?.employee_count ?? "—"}</TableCell>
                    <TableCell>
                      {r.totals?.net_pay != null
                        ? new Intl.NumberFormat("en-US", {
                            style: "currency",
                            currency: r.currency_code,
                          }).format(r.totals.net_pay)
                        : "—"}
                    </TableCell>
                    <TableCell className="text-right text-xs text-muted-foreground">
                      Open →
                    </TableCell>
                  </TableRow>
                ))}
                {runs.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      No runs yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {selected && (
          <Card>
            <CardHeader className="flex flex-row items-start justify-between">
              <div>
                <CardTitle className="text-base">
                  Run {selected.period_start} → {selected.period_end}
                </CardTitle>
                <CardDescription>
                  Status: <Badge variant="outline">{selected.status.replace("_", " ")}</Badge>
                  {selected.computed_at && (
                    <> · Computed {new Date(selected.computed_at).toLocaleString()}</>
                  )}
                  {selected.submitted_at && (
                    <> · Submitted {new Date(selected.submitted_at).toLocaleString()}</>
                  )}
                  {selected.approved_at && (
                    <> · Approved {new Date(selected.approved_at).toLocaleString()}</>
                  )}
                  {selected.status === "pending_approval" && (
                    <div className="mt-1 text-amber-600">
                      Awaiting manager approval — payslips are NOT yet visible to employees.
                    </div>
                  )}
                  {selected.status === "approved" && (
                    <div className="mt-1 text-emerald-600">
                      Approved — payslips are visible to employees.
                    </div>
                  )}
                </CardDescription>
              </div>
              <p className="text-xs text-muted-foreground">
                Overtime hours from approved timesheets within this period are added automatically
                as an "Overtime" line item.
              </p>
              <div className="flex flex-wrap gap-2">
                {isOrgAdmin && selected.status === "draft" && (
                  <>
                    <Button size="sm" onClick={() => onCompute(selected)} disabled={busy}>
                      Compute
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => onDelete(selected)}
                      disabled={busy}
                    >
                      Delete
                    </Button>
                  </>
                )}
                {isOrgAdmin && selected.status === "computed" && (
                  <>
                    <Button size="sm" onClick={() => onCompute(selected)} disabled={busy}>
                      Recompute
                    </Button>
                    <Button size="sm" onClick={() => onSubmit(selected)} disabled={busy}>
                      Submit for approval
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onCancel(selected)}
                      disabled={busy}
                    >
                      Cancel
                    </Button>
                  </>
                )}
                {selected.status === "pending_approval" &&
                  isManager &&
                  selected.submitted_by !== user?.id && (
                    <>
                      <Button size="sm" onClick={() => onApprove(selected)} disabled={busy}>
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onReject(selected)}
                        disabled={busy}
                      >
                        Reject
                      </Button>
                    </>
                  )}
                {selected.status === "pending_approval" &&
                  isManager &&
                  selected.submitted_by === user?.id && (
                    <span className="text-xs text-muted-foreground self-center">
                      You submitted this run — another manager must approve.
                    </span>
                  )}
                {payslips.length > 0 && (
                  <Button size="sm" variant="outline" onClick={exportCsv}>
                    Export CSV
                  </Button>
                )}
                {(selected.status === "computed" ||
                  selected.status === "pending_approval" ||
                  selected.status === "approved") &&
                  payslips.length > 0 && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => loadVariance(selected)}
                      disabled={busy}
                    >
                      <TrendingUp className="mr-2 h-4 w-4" /> Variance vs prior
                    </Button>
                  )}
                {isOrgAdmin && selected.status === "approved" && payslips.length > 0 && (
                  <Button size="sm" onClick={() => onEmailPayslips(selected)} disabled={busy}>
                    <Mail className="mr-2 h-4 w-4" /> Email payslips
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {selected.totals?.gross != null && (
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4 mb-6 text-sm">
                  <Stat label="Gross" value={fmt(selected.totals.gross)} />
                  <Stat label="Income tax" value={fmt(selected.totals.income_tax)} />
                  <Stat
                    label="Employee contrib."
                    value={fmt(selected.totals.employee_contributions)}
                  />
                  <Stat label="Net pay" value={fmt(selected.totals.net_pay)} />
                </div>
              )}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Gross</TableHead>
                    <TableHead>Tax</TableHead>
                    <TableHead>Contrib.</TableHead>
                    <TableHead>Net</TableHead>
                    {selected.status === "approved" && <TableHead>Delivery</TableHead>}
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payslips.map((p) => {
                    const e = employees[p.employee_id];
                    const dist = distribution[p.id];
                    const downloadSingle = () => {
                      if (!e || !selected || !tenantInfo) return;
                      generatePayslipPdf({
                        payslip: p as any,
                        run: {
                          period_start: selected.period_start,
                          period_end: selected.period_end,
                          pay_date: selected.pay_date,
                        },
                        employee: {
                          first_name: e.first,
                          last_name: e.last,
                          employee_number: e.number,
                          email: e.email,
                          job_title: e.job,
                        },
                        tenant: tenantInfo,
                      });
                    };
                    return (
                      <TableRow key={p.id}>
                        <TableCell>
                          <div className="font-medium">{e?.name ?? p.employee_id}</div>
                          <div className="text-xs text-muted-foreground">{e?.number}</div>
                        </TableCell>
                        <TableCell>{fmt(p.gross)}</TableCell>
                        <TableCell>{fmt(p.income_tax)}</TableCell>
                        <TableCell>{fmt(p.employee_contributions)}</TableCell>
                        <TableCell className="font-medium">{fmt(p.net_pay)}</TableCell>
                        {selected.status === "approved" && (
                          <TableCell>
                            {!e?.email ? (
                              <Badge variant="outline" className="text-amber-600">
                                No email
                              </Badge>
                            ) : dist && dist.count > 0 ? (
                              <div className="text-xs">
                                <Badge variant="secondary" className="gap-1">
                                  <CheckCircle className="h-3 w-3" /> Sent ×{dist.count}
                                </Badge>
                                <div className="mt-0.5 text-muted-foreground">
                                  {dist.last_at ? new Date(dist.last_at).toLocaleString() : ""}
                                </div>
                              </div>
                            ) : (
                              <Badge variant="outline">Not sent</Badge>
                            )}
                          </TableCell>
                        )}
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" onClick={() => setPreviewSlip(p)}>
                            <Eye className="mr-1 h-3.5 w-3.5" /> Preview
                          </Button>
                          <Button variant="ghost" size="sm" onClick={downloadSingle} disabled={!e}>
                            <Download className="mr-1 h-3.5 w-3.5" /> PDF
                          </Button>
                          {isOrgAdmin && selected.status === "approved" && e?.email && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onResendPayslip(p.id)}
                              disabled={busy}
                            >
                              <RefreshCw className="mr-1 h-3.5 w-3.5" /> Resend
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {payslips.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={selected.status === "approved" ? 7 : 6}
                        className="text-center text-muted-foreground"
                      >
                        No payslips. Compute the run to generate them.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        <Dialog open={!!previewSlip} onOpenChange={(o) => !o && setPreviewSlip(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Payslip preview</DialogTitle>
              <DialogDescription>
                {previewSlip && employees[previewSlip.employee_id]?.name} · {selected?.period_start}{" "}
                → {selected?.period_end}
                {selected &&
                  selected.base_currency_code &&
                  selected.base_currency_code !== selected.currency_code && (
                    <>
                      {" "}
                      · Converted from {selected.base_currency_code} at FX {selected.fx_rate}
                    </>
                  )}
              </DialogDescription>
            </DialogHeader>
            {previewSlip && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2 text-sm md:grid-cols-4">
                  <Stat label="Gross" value={fmt(previewSlip.gross)} />
                  <Stat label="Income tax" value={fmt(previewSlip.income_tax)} />
                  <Stat label="Employee contrib." value={fmt(previewSlip.employee_contributions)} />
                  <Stat label="Net pay" value={fmt(previewSlip.net_pay)} />
                </div>
                <div>
                  <div className="mb-2 text-xs font-medium uppercase text-muted-foreground">
                    Line items
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Label</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(previewSlip.lines ?? []).map((l: any, i: number) => (
                        <TableRow key={i}>
                          <TableCell>
                            <div className="font-medium">{l.label ?? l.code}</div>
                            {l.code && l.label && (
                              <div className="text-xs text-muted-foreground">{l.code}</div>
                            )}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {l.category ?? "—"}
                          </TableCell>
                          <TableCell className="text-right">
                            {typeof l.amount === "number" ? fmt(l.amount) : "—"}
                          </TableCell>
                        </TableRow>
                      ))}
                      {(!previewSlip.lines || previewSlip.lines.length === 0) && (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center text-muted-foreground">
                            No line items.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
                <div className="text-xs text-muted-foreground">
                  Employer contributions: {fmt(previewSlip.employer_contributions)}
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setPreviewSlip(null)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog
          open={bulkProgress.open}
          onOpenChange={(o) => setBulkProgress((p) => ({ ...p, open: o }))}
        >
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {bulkProgress.status === "running" ? "Resending payslips…" : "Bulk resend summary"}
              </DialogTitle>
              <DialogDescription>
                {bulkProgress.status === "running"
                  ? "Generating PDFs and queuing emails. This may take a moment."
                  : `Completed for pay dates ${bulkRange.from} to ${bulkRange.to}.`}
              </DialogDescription>
            </DialogHeader>
            {bulkProgress.status === "running" && (
              <div className="space-y-4 py-4">
                <Progress value={undefined} />
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing approved runs and sending payslip emails…
                </div>
              </div>
            )}
            {bulkProgress.status === "done" && (
              <div className="space-y-4 py-2">
                {bulkProgress.runs === 0 ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <AlertCircle className="h-4 w-4" />
                    No approved payroll runs found in the selected date range.
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="rounded-lg border border-border p-3 text-center">
                        <div className="flex items-center justify-center gap-1 text-emerald-600">
                          <CheckCircle className="h-4 w-4" />
                          <span className="text-lg font-semibold">{bulkProgress.sent}</span>
                        </div>
                        <div className="text-xs text-muted-foreground">Sent</div>
                      </div>
                      <div className="rounded-lg border border-border p-3 text-center">
                        <div className="flex items-center justify-center gap-1 text-amber-600">
                          <AlertCircle className="h-4 w-4" />
                          <span className="text-lg font-semibold">{bulkProgress.skipped}</span>
                        </div>
                        <div className="text-xs text-muted-foreground">Skipped</div>
                      </div>
                      <div className="rounded-lg border border-border p-3 text-center">
                        <div className="flex items-center justify-center gap-1 text-red-600">
                          <XCircle className="h-4 w-4" />
                          <span className="text-lg font-semibold">{bulkProgress.failed}</span>
                        </div>
                        <div className="text-xs text-muted-foreground">Failed</div>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {bulkProgress.total} payslip{bulkProgress.total === 1 ? "" : "s"} across{" "}
                      {bulkProgress.runs} run{bulkProgress.runs === 1 ? "" : "s"}
                    </div>
                    {bulkProgress.errors.length > 0 && (
                      <div className="space-y-1">
                        <div className="text-xs font-medium text-red-600">
                          Errors ({bulkProgress.errors.length})
                        </div>
                        <ScrollArea className="h-32 rounded-md border border-border bg-muted/40 p-2">
                          <ul className="space-y-1 text-xs text-muted-foreground">
                            {bulkProgress.errors.map((err, i) => (
                              <li key={i}>• {err}</li>
                            ))}
                          </ul>
                        </ScrollArea>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setBulkProgress((p) => ({ ...p, open: false }))}
                disabled={bulkProgress.status === "running"}
              >
                {bulkProgress.status === "running" ? "Processing…" : "Close"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={varianceOpen} onOpenChange={setVarianceOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Variance vs prior approved run</DialogTitle>
              <DialogDescription>
                {variance?.prior_run ? (
                  <>
                    Compared against run {variance.prior_run.period_start} →{" "}
                    {variance.prior_run.period_end} (pay date {variance.prior_run.pay_date}).
                  </>
                ) : (
                  <>No prior approved run found — this is the first comparable run.</>
                )}
              </DialogDescription>
            </DialogHeader>
            {variance && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2 md:grid-cols-4 text-sm">
                  <Stat
                    label="Employees"
                    value={`${variance.summary.employee_count_current}${variance.summary.employee_count_prior != null ? ` (was ${variance.summary.employee_count_prior})` : ""}`}
                  />
                  <Stat label="New on this run" value={String(variance.summary.new_employees)} />
                  <Stat label="Dropped" value={String(variance.summary.dropped_employees)} />
                  <Stat
                    label={`Big change (≥${variance.summary.large_delta_threshold_pct}%)`}
                    value={String(variance.summary.large_delta_count)}
                  />
                </div>
                {variance.prior_run && (
                  <div>
                    <div className="mb-2 text-xs font-medium uppercase text-muted-foreground">
                      Totals delta ({variance.currency_code})
                    </div>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Bucket</TableHead>
                          <TableHead className="text-right">Prior</TableHead>
                          <TableHead className="text-right">Current</TableHead>
                          <TableHead className="text-right">Δ</TableHead>
                          <TableHead className="text-right">%</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {Object.entries(variance.totals).map(([k, v]: [string, any]) => (
                          <TableRow key={k}>
                            <TableCell className="capitalize">{k.replace(/_/g, " ")}</TableCell>
                            <TableCell className="text-right">
                              {v.prev != null
                                ? new Intl.NumberFormat("en-US", {
                                    style: "currency",
                                    currency: variance.currency_code,
                                  }).format(v.prev)
                                : "—"}
                            </TableCell>
                            <TableCell className="text-right">
                              {new Intl.NumberFormat("en-US", {
                                style: "currency",
                                currency: variance.currency_code,
                              }).format(v.cur)}
                            </TableCell>
                            <TableCell
                              className={`text-right ${v.delta == null ? "" : v.delta > 0 ? "text-emerald-600" : v.delta < 0 ? "text-red-600" : ""}`}
                            >
                              {v.delta != null
                                ? new Intl.NumberFormat("en-US", {
                                    style: "currency",
                                    currency: variance.currency_code,
                                    signDisplay: "exceptZero",
                                  }).format(v.delta)
                                : "—"}
                            </TableCell>
                            <TableCell className="text-right text-xs">
                              {v.pct != null ? `${v.pct >= 0 ? "+" : ""}${v.pct.toFixed(1)}%` : "—"}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
                <div>
                  <div className="mb-2 text-xs font-medium uppercase text-muted-foreground">
                    Per-employee net pay change
                  </div>
                  <ScrollArea className="h-72 rounded-md border border-border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Employee</TableHead>
                          <TableHead className="text-right">Prior net</TableHead>
                          <TableHead className="text-right">Current net</TableHead>
                          <TableHead className="text-right">Δ</TableHead>
                          <TableHead className="text-right">%</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {variance.rows.map((r: any) => {
                          const flag =
                            r.pct != null &&
                            Math.abs(r.pct) >= variance.summary.large_delta_threshold_pct;
                          return (
                            <TableRow key={r.employee_id} className={flag ? "bg-amber-500/10" : ""}>
                              <TableCell>
                                <div className="font-medium">{r.employee_name}</div>
                                <div className="text-xs text-muted-foreground">
                                  {r.employee_number}{" "}
                                  {r.is_new && (
                                    <Badge variant="outline" className="ml-1">
                                      new
                                    </Badge>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell className="text-right">
                                {r.prev_net != null
                                  ? new Intl.NumberFormat("en-US", {
                                      style: "currency",
                                      currency: variance.currency_code,
                                    }).format(r.prev_net)
                                  : "—"}
                              </TableCell>
                              <TableCell className="text-right">
                                {new Intl.NumberFormat("en-US", {
                                  style: "currency",
                                  currency: variance.currency_code,
                                }).format(r.cur_net)}
                              </TableCell>
                              <TableCell
                                className={`text-right ${r.delta == null ? "" : r.delta > 0 ? "text-emerald-600" : r.delta < 0 ? "text-red-600" : ""}`}
                              >
                                {r.delta == null ? (
                                  "—"
                                ) : (
                                  <span className="inline-flex items-center gap-1">
                                    {r.delta > 0 ? (
                                      <TrendingUp className="h-3 w-3" />
                                    ) : r.delta < 0 ? (
                                      <TrendingDown className="h-3 w-3" />
                                    ) : (
                                      <Minus className="h-3 w-3" />
                                    )}
                                    {new Intl.NumberFormat("en-US", {
                                      style: "currency",
                                      currency: variance.currency_code,
                                      signDisplay: "exceptZero",
                                    }).format(r.delta)}
                                  </span>
                                )}
                              </TableCell>
                              <TableCell className="text-right text-xs">
                                {r.pct != null
                                  ? `${r.pct >= 0 ? "+" : ""}${r.pct.toFixed(1)}%`
                                  : "—"}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                        {variance.rows.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center text-muted-foreground">
                              No employees on this run.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </div>
                {variance.dropped_employee_ids.length > 0 && (
                  <div className="rounded-md border border-amber-500/40 bg-amber-500/10 p-3 text-xs">
                    <div className="font-medium text-amber-700 dark:text-amber-400">
                      {variance.dropped_employee_ids.length} employee
                      {variance.dropped_employee_ids.length === 1 ? "" : "s"} on the prior run are
                      NOT on this one.
                    </div>
                    <div className="text-muted-foreground">
                      Verify whether these are terminations or accidental omissions before
                      approving.
                    </div>
                  </div>
                )}
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setVarianceOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </section>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="font-semibold">{value}</div>
    </div>
  );
}
