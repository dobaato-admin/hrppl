import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { AppShell } from "@/components/AppShell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/hooks/use-auth";
import { getAuStpAudit } from "@/lib/au-stp-audit.functions";
import { CheckCircle2, AlertTriangle, XCircle, Download } from "lucide-react";

export const Route = createFileRoute("/admin/au-stp-audit")({
  head: () => ({ meta: [{ title: "AU STP2 & Payday Super audit — HRPPL" }] }),
  component: Page,
});

function StatusPill({ ok }: { ok: boolean }) {
  return ok
    ? <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100"><CheckCircle2 className="h-3 w-3 mr-1" />OK</Badge>
    : <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Missing</Badge>;
}

function downloadGapsCsv(gaps: any[], missingSuper: any[]) {
  const rows = [
    ["employee_number", "name", "gap_type", "missing_field"],
    ...gaps.flatMap((g) => g.missing.map((m: string) => [g.employee_number ?? "", g.name, "STP2", m])),
    ...missingSuper.map((g) => [g.employee_number ?? "", g.name, "Super", "Super fund choice"]),
  ];
  const csv = rows.map((r) => r.map((c: any) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  const a = document.createElement("a");
  a.href = url; a.download = `au-stp-audit-${new Date().toISOString().slice(0,10)}.csv`; a.click();
  URL.revokeObjectURL(url);
}

function Page() {
  const { roles, loading } = useAuth();
  const navigate = useNavigate();
  const canAccess = roles.includes("org_admin") || roles.includes("super_admin");
  useEffect(() => { if (!loading && !canAccess) navigate({ to: "/dashboard" }); }, [loading, canAccess, navigate]);

  const fetchAudit = useServerFn(getAuStpAudit);
  const auditQ = useQuery({ queryKey: ["au-stp-audit"], queryFn: () => fetchAudit(), enabled: canAccess });
  const a: any = auditQ.data;

  if (auditQ.isLoading) return <AppShell title="AU STP2 audit"><div className="p-4 text-sm text-muted-foreground">Loading…</div></AppShell>;
  if (!a) return <AppShell title="AU STP2 audit"><div className="p-4 text-sm">No data.</div></AppShell>;
  if (!a.ok) return <AppShell title="AU STP2 audit"><div className="p-4 text-sm text-muted-foreground">{a.reason}</div></AppShell>;

  return (
    <AppShell title="AU STP Phase 2 & Payday Super audit" subtitle={`Tenant: ${a.tenant.name}`}>
      <div className="p-4 space-y-4">
        {a.exportBlocked && (
          <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-destructive mt-0.5" />
            <div>
              <div className="font-medium text-destructive">STP export is blocked</div>
              <div className="text-muted-foreground">Resolve the employer and employee gaps below before building or submitting a pay event.</div>
            </div>
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Employer readiness</CardTitle>
            <CardDescription>Required identifiers and gateway configuration.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {Object.entries(a.employer).map(([k, v]: any) => (
              <div key={k} className="flex items-center justify-between border-b py-2 text-sm">
                <div>
                  <div className="font-medium">{v.label}</div>
                  <div className="text-xs text-muted-foreground">{v.value ?? "Not set"}</div>
                </div>
                <div className="flex items-center gap-2">
                  <StatusPill ok={v.ok} />
                  {!v.ok && <Link to="/admin/payroll-settings" className="text-xs text-primary hover:underline">Fix →</Link>}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm">Employee readiness ({a.employees.with_gaps} of {a.employees.total} have gaps)</CardTitle>
              <CardDescription>Missing STP Phase 2 fields per active employee.</CardDescription>
            </div>
            <Button size="sm" variant="outline" onClick={() => downloadGapsCsv(a.employees.gaps, a.employees.missing_super_choice)}>
              <Download className="h-3 w-3 mr-1" />Export gaps CSV
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Missing</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {a.employees.gaps.length === 0 && (
                  <TableRow><TableCell colSpan={3} className="text-center text-sm text-muted-foreground py-6">No employee gaps.</TableCell></TableRow>
                )}
                {a.employees.gaps.map((e: any) => (
                  <TableRow key={e.id}>
                    <TableCell>
                      <div className="font-medium">{e.name}</div>
                      <div className="text-xs text-muted-foreground">{e.employee_number ?? "—"}</div>
                    </TableCell>
                    <TableCell><div className="text-xs">{e.missing.join(" · ")}</div></TableCell>
                    <TableCell className="text-right">
                      <Link to="/admin/employees/$employeeId" params={{ employeeId: e.id }} className="text-xs text-primary hover:underline">Go fix →</Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Super fund choice ({a.employees.missing_super_count} missing)</CardTitle>
            <CardDescription>Employees without a recorded super choice; falls back to default fund / stapled lookup.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader><TableRow><TableHead>Employee</TableHead><TableHead></TableHead></TableRow></TableHeader>
              <TableBody>
                {a.employees.missing_super_choice.length === 0 && (
                  <TableRow><TableCell colSpan={2} className="text-center text-sm text-muted-foreground py-6">All employees have a super choice.</TableCell></TableRow>
                )}
                {a.employees.missing_super_choice.map((e: any) => (
                  <TableRow key={e.id}>
                    <TableCell><div className="font-medium">{e.name}</div><div className="text-xs text-muted-foreground">{e.employee_number ?? "—"}</div></TableCell>
                    <TableCell className="text-right">
                      <Link to="/admin/employees/$employeeId" params={{ employeeId: e.id }} className="text-xs text-primary hover:underline">Add choice →</Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Payday Super (effective 1 July 2026 — 7-day rule)</CardTitle>
            <CardDescription>SG contributions must reach the fund within 7 calendar days of payday.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between"><span>Payday Super enabled</span><StatusPill ok={a.paydaySuper.enabled} /></div>
            <div className="flex justify-between"><span>7-day rule achievable with current config</span><StatusPill ok={a.paydaySuper.sevenDayRuleAchievable} /></div>
            <div className="flex justify-between"><span>Overdue obligations</span>
              <Badge variant={a.paydaySuper.overdue > 0 ? "destructive" : "outline"}>{a.paydaySuper.overdue}</Badge>
            </div>
            {a.paydaySuper.recent.length > 0 && (
              <div className="mt-2">
                <div className="text-xs font-medium mb-1">Recent obligations</div>
                <Table>
                  <TableHeader><TableRow><TableHead>Pay date</TableHead><TableHead>Due</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Amount</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {a.paydaySuper.recent.slice(0, 8).map((o: any) => (
                      <TableRow key={o.id}>
                        <TableCell>{o.pay_date}</TableCell>
                        <TableCell>{o.due_date}</TableCell>
                        <TableCell><Badge variant={o.status === "paid" ? "outline" : "destructive"}>{o.status}</Badge></TableCell>
                        <TableCell className="text-right">{o.amount_due}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
