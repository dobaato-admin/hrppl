import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useMyTenant } from "@/hooks/use-tenant";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { generatePayslipPdf } from "@/lib/payslip-pdf";
import { Download } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { KpiTile } from "@/components/monday";
import { Receipt, Wallet, Calendar as CalIcon, TrendingUp } from "lucide-react";

export const Route = createFileRoute("/my-payslips")({
  head: () => ({ meta: [{ title: "My payslips — hrppl" }] }),
  component: MyPayslips,
});

interface Payslip {
  id: string;
  run_id: string;
  currency_code: string;
  gross: number;
  income_tax: number;
  employee_contributions: number;
  net_pay: number;
  allowances: number;
  deductions: number;
  lines: any[];
  created_at: string;
}
interface Run {
  id: string;
  period_start: string;
  period_end: string;
  pay_date: string;
  status: string;
}
interface EmpInfo {
  id: string;
  first_name: string;
  last_name: string;
  employee_number: string;
  email: string;
  job_title: string | null;
  tenant_id: string;
}
interface TenantInfo {
  id: string;
  name: string;
  country_code: string;
}

function MyPayslips() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState<Payslip | null>(null);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [loading, user, navigate]);

  // The tenant comes from the shared cache. This page used to read it as the
  // second of four sequential queries, keyed off the employee row it had just
  // fetched — a round trip for a value the session already holds.
  const { tenant } = useMyTenant();

  /**
   * Employee row, payslips and their runs.
   *
   * Was a useEffect writing four useStates, which had two costs. The queries
   * ran strictly in series even though only two of the steps genuinely depend
   * on each other — payslips need the employee ids, and runs need the payslip
   * run ids, but the tenant read needed neither and is now gone entirely.
   *
   * And `payslips` started as `[]`, so "No approved payslips yet." was rendered
   * as the answer while the answer was still in flight. Every employee saw that
   * on every visit to their own pay history. `isLoading` is the difference
   * between "you have none" and "we have not looked yet", and the table below
   * now says which.
   */
  const payslipsQ = useQuery({
    queryKey: ["my-payslips", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data: emps } = await supabase
        .from("employees")
        .select("id,first_name,last_name,employee_number,email,job_title,tenant_id")
        .eq("user_id", user!.id);
      const list = (emps ?? []) as EmpInfo[];
      const empIds = list.map((e) => e.id);
      if (empIds.length === 0)
        return { emp: null, payslips: [] as Payslip[], runs: {} as Record<string, Run> };

      const { data: ps } = await supabase
        .from("payroll_payslips")
        .select("*")
        .in("employee_id", empIds)
        .order("created_at", { ascending: false });
      const pslist = (ps ?? []) as Payslip[];

      const runIds = Array.from(new Set(pslist.map((p) => p.run_id)));
      const map: Record<string, Run> = {};
      if (runIds.length) {
        const { data: rs } = await supabase
          .from("payroll_runs")
          .select("id,period_start,period_end,pay_date,status")
          .in("id", runIds);
        (rs ?? []).forEach((r: any) => {
          map[r.id] = r;
        });
      }
      return { emp: list[0] ?? null, payslips: pslist, runs: map };
    },
  });

  const emp = payslipsQ.data?.emp ?? null;
  const payslips = payslipsQ.data?.payslips ?? [];
  const runs = payslipsQ.data?.runs ?? {};

  const downloadPdf = async (p: Payslip) => {
    const r = runs[p.run_id];
    if (!emp || !tenant || !r) return;

    // Load leave accruals for this employee, showing balance days as of pay period end.
    let accruals:
      | { leave_type: string; opening: number; accrued: number; taken: number; balance: number }[]
      | undefined;
    try {
      const { data: balances } = await supabase
        .from("leave_balances")
        .select(
          "opening_balance, accrued_days, used_days, pending_days, carried_over_days, leave_types(name,is_active)",
        )
        .eq("employee_id", emp.id);
      accruals = (balances ?? [])
        .filter((b: any) => b.leave_types?.is_active !== false)
        .map((b: any) => {
          const opening = Number(b.opening_balance ?? 0);
          const carried = Number(b.carried_over_days ?? 0);
          const accrued = Number(b.accrued_days ?? 0);
          const taken = Number(b.used_days ?? 0);
          const pending = Number(b.pending_days ?? 0);
          const balance = opening + carried + accrued - taken - pending;
          return {
            leave_type: b.leave_types?.name ?? "Leave",
            opening: opening + carried,
            accrued,
            taken: taken + pending,
            balance,
          };
        });
    } catch {
      /* accruals are optional */
    }

    generatePayslipPdf({
      payslip: {
        ...p,
        employer_contributions: (p as any).employer_contributions ?? 0,
        accruals,
      } as any,
      run: { period_start: r.period_start, period_end: r.period_end, pay_date: r.pay_date },
      employee: {
        first_name: emp.first_name,
        last_name: emp.last_name,
        employee_number: emp.employee_number,
        email: emp.email,
        job_title: emp.job_title,
      },
      // `tenants.country_code` is nullable, which the old local TenantInfo type
      // claimed it was not. The PDF prints it verbatim, so a null used to reach
      // the page as the literal text "null".
      tenant: { name: tenant.name, country_code: tenant.country_code ?? "" },
    });
  };

  if (loading || !user)
    return (
      <main className="flex min-h-screen items-center justify-center text-muted-foreground">
        Loading…
      </main>
    );

  const approved = payslips.filter((p) => runs[p.run_id]?.status === "approved");
  const latest = approved[0];
  const ytdNet = approved.reduce((s, p) => s + Number(p.net_pay || 0), 0);
  const currency = latest?.currency_code ?? "USD";
  const fmtAmount = (n: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency }).format(n);

  return (
    <AppShell title="My payslips" subtitle="Approved payslips only.">
      <section className="mx-auto max-w-4xl px-6 py-8 space-y-6">
        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <KpiTile label="Available" value={approved.length} tone="primary" icon={Receipt} />
          <KpiTile
            label="Latest net"
            value={latest ? fmtAmount(Number(latest.net_pay)) : "—"}
            tone="done"
            icon={Wallet}
            hint={latest ? runs[latest.run_id]?.pay_date : undefined}
          />
          <KpiTile label="YTD net" value={fmtAmount(ytdNet)} tone="info" icon={TrendingUp} />
          <KpiTile
            label="Next pay"
            value={latest ? (runs[latest.run_id]?.pay_date ?? "—") : "—"}
            tone="working"
            icon={CalIcon}
          />
        </section>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">History</CardTitle>
            <CardDescription>{approved.length} payslip(s)</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Period</TableHead>
                  <TableHead>Pay date</TableHead>
                  <TableHead>Gross</TableHead>
                  <TableHead>Net</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {approved.map((p) => {
                  const r = runs[p.run_id];
                  const fmt = (n: number) =>
                    new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: p.currency_code,
                    }).format(n);
                  return (
                    <TableRow key={p.id}>
                      <TableCell className="cursor-pointer" onClick={() => setOpen(p)}>
                        {r?.period_start} → {r?.period_end}
                      </TableCell>
                      <TableCell>{r?.pay_date}</TableCell>
                      <TableCell>{fmt(p.gross)}</TableCell>
                      <TableCell className="font-medium">{fmt(p.net_pay)}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => downloadPdf(p)}>
                          <Download className="mr-1 h-3.5 w-3.5" /> PDF
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {approved.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      {payslipsQ.isLoading
                        ? "Loading your payslips…"
                        : payslipsQ.isError
                          ? "Could not load your payslips. This list is incomplete."
                          : "No approved payslips yet."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </section>

      <Dialog open={!!open} onOpenChange={(o) => !o && setOpen(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Payslip</DialogTitle>
            <DialogDescription>
              {open && runs[open.run_id] && (
                <>
                  Period {runs[open.run_id].period_start} → {runs[open.run_id].period_end} · Pay
                  date {runs[open.run_id].pay_date}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          {open &&
            (() => {
              const fmt = (n: number) =>
                new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: open.currency_code,
                }).format(n);
              return (
                <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                  <div className="flex justify-end">
                    <Button size="sm" onClick={() => downloadPdf(open)}>
                      <Download className="mr-1 h-3.5 w-3.5" /> Download PDF
                    </Button>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Code</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(open.lines ?? []).map((l: any, i: number) => (
                        <TableRow key={i}>
                          <TableCell className="font-mono text-xs">{l.code}</TableCell>
                          <TableCell>{l.label}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{l.category}</Badge>
                          </TableCell>
                          <TableCell className="text-right">{fmt(Number(l.amount))}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <div className="grid grid-cols-2 gap-3 text-sm border-t border-border pt-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Gross</span>
                      <span>{fmt(open.gross)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Allowances</span>
                      <span>{fmt(open.allowances)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Deductions</span>
                      <span>{fmt(open.deductions)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Employee contrib.</span>
                      <span>{fmt(open.employee_contributions)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Income tax</span>
                      <span>{fmt(open.income_tax)}</span>
                    </div>
                    <div className="flex justify-between font-semibold">
                      <span>Net pay</span>
                      <span>{fmt(open.net_pay)}</span>
                    </div>
                  </div>
                </div>
              );
            })()}
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
