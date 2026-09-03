import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { AdminGate } from "@/components/AdminGate";
import { AuComplianceShell } from "@/components/AuComplianceShell";
import { EmptyState, KpiTile, SectionCard, StatusChip } from "@/components/monday";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useMyTenantCountry, useMyTenantId } from "@/hooks/use-tenant";
import {
  listUnderpaymentFindings,
  runMinimumWageAudit,
  updateUnderpaymentFinding,
} from "@/lib/minimum-wage-audit.functions";
import { AlertTriangle, ShieldCheck } from "lucide-react";

/**
 * Minimum-wage / underpayment audit (PRD M6).
 *
 * Compares what each employee was actually paid per ordinary hour against the
 * award rate their classification entitles them to, and records a finding
 * where the first is lower. All three server functions were unreachable.
 *
 * Gated `org.auUnderpayment` (org_admin, hr) — mirrors "Org admins and HR can
 * manage underpayment findings". HR is included deliberately: remediation is a
 * people matter as much as a payroll one, and the policy already says so.
 *
 * **An employee with no award classification produces no finding.** They are
 * not audited, rather than audited and passed — which is why the page counts
 * them and says so, instead of showing a clean result that isn't one.
 */
export const Route = createFileRoute("/admin/underpayment-audit")({
  head: () => ({ meta: [{ title: "Underpayment audit — HRPPL" }] }),
  component: () => (
    <AdminGate feature="org.auUnderpayment">
      <UnderpaymentAuditPage />
    </AdminGate>
  ),
});

const money = (n: unknown) =>
  new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD" }).format(Number(n ?? 0));

const STATUS_TONE = {
  open: "stuck",
  reviewed: "working",
  resolved: "done",
  waived: "pending",
} as const;

type Status = keyof typeof STATUS_TONE;

function UnderpaymentAuditPage() {
  const { tenantId } = useMyTenantId();
  const { country } = useMyTenantCountry();
  const qc = useQueryClient();
  const enabled = !!tenantId && country === "AU";

  const [statusFilter, setStatusFilter] = useState<Status | "all">("open");

  const fetchFindings = useServerFn(listUnderpaymentFindings);
  const findingsQ = useQuery({
    queryKey: ["au-underpayment", tenantId, statusFilter],
    queryFn: () =>
      fetchFindings({
        data: {
          tenantId: tenantId!,
          ...(statusFilter === "all" ? {} : { status: statusFilter }),
        },
      }),
    enabled,
  });

  // Employee names, and how many are outside the audit's reach entirely.
  const contextQ = useQuery({
    queryKey: ["au-underpayment-context", tenantId],
    enabled,
    queryFn: async () => {
      const { data: employees } = await supabase
        .from("employees")
        .select("id, first_name, last_name, employee_number")
        .eq("tenant_id", tenantId!);
      const { data: assignments } = await supabase
        .from("employee_award_assignments")
        .select("employee_id")
        .eq("tenant_id", tenantId!);
      return { employees: employees ?? [], assignments: assignments ?? [] };
    },
  });

  const employeeName = useMemo(() => {
    const m = new Map<string, string>();
    for (const e of contextQ.data?.employees ?? []) {
      m.set((e as any).id, `${(e as any).first_name} ${(e as any).last_name}`);
    }
    return m;
  }, [contextQ.data]);

  const unauditable = useMemo(() => {
    const assigned = new Set((contextQ.data?.assignments ?? []).map((a: any) => a.employee_id));
    return (contextQ.data?.employees ?? []).filter((e: any) => !assigned.has(e.id)).length;
  }, [contextQ.data]);

  const findings = (findingsQ.data?.findings ?? []) as any[];
  const openTotal = findings
    .filter((f) => f.status === "open")
    .reduce((a, f) => a + Number(f.shortfall_total ?? 0), 0);

  const [editing, setEditing] = useState<any | null>(null);
  const [nextStatus, setNextStatus] = useState<Status>("reviewed");
  const [notes, setNotes] = useState("");

  const runAudit = useServerFn(runMinimumWageAudit);
  const runAuditM = useMutation({
    mutationFn: () => runAudit({ data: { tenantId: tenantId! } }),
    onSuccess: (res: any) => {
      toast.success(
        `Audited ${res?.audited ?? 0} payslips across ${res?.runs ?? 0} runs — ` +
          `${res?.findings ?? 0} finding${res?.findings === 1 ? "" : "s"}, ${res?.cleared ?? 0} cleared`,
      );
      qc.invalidateQueries({ queryKey: ["au-underpayment"] });
    },
    onError: (e: any) => toast.error(e?.message ?? "Could not run the audit"),
  });

  const update = useServerFn(updateUnderpaymentFinding);
  const updateM = useMutation({
    mutationFn: (d: any) => update({ data: d }),
    onSuccess: () => {
      toast.success("Finding updated");
      setEditing(null);
      qc.invalidateQueries({ queryKey: ["au-underpayment"] });
    },
    onError: (e: any) => toast.error(e?.message ?? "Could not update the finding"),
  });

  return (
    <AuComplianceShell
      title="Underpayment audit"
      subtitle="Actual hourly pay against the award minimum, payslip by payslip"
      tenantId={tenantId}
      country={country}
      isLoading={findingsQ.isLoading}
      actions={
        <Button size="sm" disabled={runAuditM.isPending} onClick={() => runAuditM.mutate()}>
          <ShieldCheck className="mr-1 h-4 w-4" />
          {runAuditM.isPending ? "Auditing…" : "Run audit"}
        </Button>
      }
    >
      {() => (
        <>
          <div className="grid gap-3 sm:grid-cols-2">
            <KpiTile
              label="Open shortfall"
              value={money(openTotal)}
              tone={openTotal > 0 ? "stuck" : "done"}
              icon={AlertTriangle}
              hint={
                openTotal > 0
                  ? "Back pay owed on findings that are still open"
                  : "No open underpayment findings"
              }
            />
            <KpiTile
              label="Not audited"
              value={unauditable}
              tone={unauditable > 0 ? "pending" : "done"}
              to="/admin/awards"
              hint={
                unauditable > 0
                  ? "Employees with no award classification — nothing to compare against"
                  : "Every employee has an award classification"
              }
            />
          </div>

          {unauditable > 0 ? (
            <div className="flex items-start gap-2 rounded-md border border-amber-500/30 bg-amber-500/5 p-3 text-sm">
              <AlertTriangle className="mt-0.5 h-4 w-4 text-amber-600" />
              <div>
                <div className="font-medium">
                  {unauditable} employee{unauditable === 1 ? "" : "s"} cannot be audited
                </div>
                <div className="text-muted-foreground">
                  Without an award classification there is no minimum to compare against, so these
                  people are skipped entirely. A clean result below does not cover them. Assign a
                  classification on the Award library page.
                </div>
              </div>
            </div>
          ) : null}

          <SectionCard
            title="Findings"
            description="One finding per payslip where the paid ordinary rate fell below the award rate. Re-running the audit clears findings that no longer apply."
            actions={
              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="reviewed">Reviewed</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="waived">Waived</SelectItem>
                  <SelectItem value="all">All</SelectItem>
                </SelectContent>
              </Select>
            }
          >
            {findings.length === 0 ? (
              <EmptyState
                icon={ShieldCheck}
                title={statusFilter === "open" ? "No open findings" : "Nothing here"}
                description={
                  unauditable > 0
                    ? "Note that employees without an award classification were not audited at all — see the warning above."
                    : "Every audited payslip paid at or above the award rate. Run the audit again after the next payroll run."
                }
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Pay date</TableHead>
                    <TableHead className="text-right">Hours</TableHead>
                    <TableHead className="text-right">Paid</TableHead>
                    <TableHead className="text-right">Award</TableHead>
                    <TableHead className="text-right">Shortfall</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-20" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {findings.map((f) => (
                    <TableRow key={f.id}>
                      <TableCell className="font-medium">
                        {employeeName.get(f.employee_id) ?? (
                          <span className="font-mono text-xs">{f.employee_id}</span>
                        )}
                        {f.casual ? (
                          <span className="ml-2 text-xs text-muted-foreground">casual</span>
                        ) : null}
                      </TableCell>
                      <TableCell className="font-mono text-xs">{f.pay_date}</TableCell>
                      <TableCell className="text-right tabular-nums">
                        {Number(f.ordinary_hours ?? 0).toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {money(f.paid_hourly_rate)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {money(f.award_hourly_rate)}
                      </TableCell>
                      <TableCell className="text-right font-medium tabular-nums text-destructive">
                        {money(f.shortfall_total)}
                      </TableCell>
                      <TableCell>
                        <StatusChip tone={STATUS_TONE[f.status as Status] ?? "pending"}>
                          {f.status}
                        </StatusChip>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setEditing(f);
                            setNextStatus(f.status === "open" ? "reviewed" : (f.status as Status));
                            setNotes(f.notes ?? "");
                          }}
                        >
                          Update
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </SectionCard>

          <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Update finding</DialogTitle>
                <DialogDescription>
                  {money(editing?.shortfall_total)} shortfall for{" "}
                  {employeeName.get(editing?.employee_id) ?? "this employee"} on {editing?.pay_date}
                  . Marking it resolved records who did so and when.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="finding-status">Status</Label>
                  <Select value={nextStatus} onValueChange={(v) => setNextStatus(v as Status)}>
                    <SelectTrigger id="finding-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="reviewed">Reviewed</SelectItem>
                      <SelectItem value="resolved">Resolved — back pay made</SelectItem>
                      <SelectItem value="waived">Waived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="finding-notes">Notes</Label>
                  <Textarea
                    id="finding-notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="How this was remediated, or why it was waived"
                    rows={4}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setEditing(null)}>
                  Cancel
                </Button>
                <Button
                  disabled={updateM.isPending}
                  onClick={() =>
                    updateM.mutate({ id: editing.id, status: nextStatus, notes: notes || null })
                  }
                >
                  {updateM.isPending ? "Saving…" : "Save"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}
    </AuComplianceShell>
  );
}
