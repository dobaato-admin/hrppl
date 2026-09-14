import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { can } from "@/lib/rbac";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { approveLeaveRequest, rejectLeaveRequest } from "@/lib/leave.functions";
import {
  runMonthlyLeaveAccrual,
  runYearEndCarryOver,
  adjustLeaveBalance,
} from "@/lib/leave-accruals.functions";
import { useMyTenantId } from "@/hooks/use-tenant";

export const Route = createFileRoute("/org/leave")({
  head: () => ({ meta: [{ title: "Leave management — hrppl" }] }),
  component: OrgLeave,
});

interface Request {
  id: string;
  employee_id: string;
  leave_type_id: string;
  start_date: string;
  end_date: string;
  days: number;
  status: string;
  reason: string | null;
  rejection_reason: string | null;
  created_at: string;
}
interface LeaveType {
  id: string;
  name: string;
  color: string;
}
interface Emp {
  id: string;
  first_name: string;
  last_name: string;
  employee_number: string;
}
interface Balance {
  id: string;
  employee_id: string;
  leave_type_id: string;
  year: number;
  accrued_days: number;
  used_days: number;
  pending_days: number;
  carried_over_days: number;
}
interface LogRow {
  id: string;
  employee_id: string;
  leave_type_id: string;
  kind: string;
  amount: number;
  reason: string | null;
  created_at: string;
  period_key: string;
}

function OrgLeave() {
  const { user, roles, loading } = useAuth();
  const navigate = useNavigate();
  // Shared, cached for the session with staleTime: Infinity, and acting-tenant
  // aware. This was a useState filled by an effect that read profiles.tenant_id
  // — a round trip in series before the page's own query, on every mount, and
  // NULL for a platform account so the switcher did nothing here.
  const { tenantId } = useMyTenantId();
  const [requests, setRequests] = useState<Request[]>([]);
  const [types, setTypes] = useState<Record<string, LeaveType>>({});
  const [employees, setEmployees] = useState<Record<string, Emp>>({});
  const [balances, setBalances] = useState<Balance[]>([]);
  const [logs, setLogs] = useState<LogRow[]>([]);
  const [rejectOpen, setRejectOpen] = useState<Request | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [year, setYear] = useState(new Date().getUTCFullYear());

  // Adjustment dialog
  const [adjOpen, setAdjOpen] = useState(false);
  const [adj, setAdj] = useState({
    employeeId: "",
    leaveTypeId: "",
    field: "accrued_days" as "accrued_days" | "used_days" | "carried_over_days",
    delta: 0,
    reason: "",
  });

  const approve = useServerFn(approveLeaveRequest);
  const reject = useServerFn(rejectLeaveRequest);
  const runAccrual = useServerFn(runMonthlyLeaveAccrual);
  const runCarry = useServerFn(runYearEndCarryOver);
  const adjustFn = useServerFn(adjustLeaveBalance);

  // W5 · Single source: the same feature key this page's nav row uses.
  // These pages carry no route-level gate component, only this inline
  // check, so the two were free to disagree — and did. The sidebar offered
  // the page and the page answered "Forbidden".
  const canAccess = can("org.leaveManagement", roles);
  const isOrgAdmin = roles.includes("org_admin") || roles.includes("super_admin");

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [loading, user, navigate]);

  async function loadAll() {
    if (!tenantId) return;
    const [rRes, tRes, eRes, bRes, lRes] = await Promise.all([
      supabase
        .from("leave_requests")
        .select("*")
        .eq("tenant_id", tenantId)
        .order("created_at", { ascending: false }),
      supabase.from("leave_types").select("id,name,color").eq("tenant_id", tenantId),
      supabase
        .from("employees")
        .select("id,first_name,last_name,employee_number")
        .eq("tenant_id", tenantId)
        .eq("status", "active"),
      supabase.from("leave_balances").select("*").eq("tenant_id", tenantId).eq("year", year),
      supabase
        .from("leave_accrual_log")
        .select("*")
        .eq("tenant_id", tenantId)
        .order("created_at", { ascending: false })
        .limit(100),
    ]);
    setRequests((rRes.data ?? []) as Request[]);
    const tMap: Record<string, LeaveType> = {};
    (tRes.data ?? []).forEach((t: any) => {
      tMap[t.id] = t;
    });
    setTypes(tMap);
    const eMap: Record<string, Emp> = {};
    (eRes.data ?? []).forEach((e: any) => {
      eMap[e.id] = e;
    });
    setEmployees(eMap);
    setBalances((bRes.data ?? []) as Balance[]);
    setLogs((lRes.data ?? []) as LogRow[]);
  }
  useEffect(() => {
    loadAll();
  }, [tenantId, year]);

  async function onApprove(id: string) {
    setBusy(true);
    try {
      const r: any = await approve({ data: { requestId: id } });
      toast.success(
        r?.advanced ? `Advanced to tier ${r.tier} — awaiting the next approver` : "Approved",
      );
      await loadAll();
    } catch (e: any) {
      toast.error(e.message ?? "Failed");
    } finally {
      setBusy(false);
    }
  }
  async function onReject() {
    if (!rejectOpen) return;
    setBusy(true);
    try {
      await reject({ data: { requestId: rejectOpen.id, reason: rejectReason || undefined } });
      toast.success("Rejected");
      setRejectOpen(null);
      setRejectReason("");
      await loadAll();
    } catch (e: any) {
      toast.error(e.message ?? "Failed");
    } finally {
      setBusy(false);
    }
  }

  async function onRunAccrual() {
    if (
      !confirm(
        "Run monthly accrual for the current month? This is idempotent — duplicate runs are skipped.",
      )
    )
      return;
    setBusy(true);
    try {
      const r: any = await runAccrual({ data: {} });
      toast.success(`Accrual: ${r.processed} processed, ${r.skipped} skipped, ${r.failed} failed`);
      await loadAll();
    } catch (e: any) {
      toast.error(e.message ?? "Failed");
    } finally {
      setBusy(false);
    }
  }
  async function onRunCarryOver() {
    if (!confirm(`Run year-end carry-over from ${year - 1} into ${year}?`)) return;
    setBusy(true);
    try {
      const r: any = await runCarry({ data: { fromYear: year - 1 } });
      toast.success(
        `Carry-over: ${r.processed} processed, ${r.skipped} skipped, ${r.failed} failed`,
      );
      await loadAll();
    } catch (e: any) {
      toast.error(e.message ?? "Failed");
    } finally {
      setBusy(false);
    }
  }
  async function onAdjust() {
    if (!adj.employeeId || !adj.leaveTypeId || !adj.reason || !adj.delta) {
      toast.error("Fill all fields");
      return;
    }
    setBusy(true);
    try {
      await adjustFn({ data: { ...adj, year } });
      toast.success("Balance adjusted");
      setAdjOpen(false);
      setAdj({ employeeId: "", leaveTypeId: "", field: "accrued_days", delta: 0, reason: "" });
      await loadAll();
    } catch (e: any) {
      toast.error(e.message ?? "Failed");
    } finally {
      setBusy(false);
    }
  }

  const typesList = useMemo(() => Object.values(types), [types]);
  const empsList = useMemo(() => Object.values(employees), [employees]);

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

  const pending = requests.filter((r) => r.status === "pending");
  const history = requests.filter((r) => r.status !== "pending");

  const Row = ({ r, actions }: { r: Request; actions?: boolean }) => {
    const t = types[r.leave_type_id];
    const e = employees[r.employee_id];
    return (
      <TableRow key={r.id}>
        <TableCell>
          <div className="font-medium">{e ? `${e.first_name} ${e.last_name}` : "—"}</div>
          <div className="text-xs text-muted-foreground">{e?.employee_number}</div>
        </TableCell>
        <TableCell>
          <span className="inline-flex items-center gap-2">
            <span className="h-2 w-2 rounded-full" style={{ background: t?.color ?? "#94a3b8" }} />
            {t?.name ?? "—"}
          </span>
        </TableCell>
        <TableCell>
          {r.start_date} → {r.end_date}
        </TableCell>
        <TableCell>{Number(r.days).toFixed(1)}</TableCell>
        <TableCell className="max-w-xs truncate" title={r.reason ?? ""}>
          {r.reason || "—"}
        </TableCell>
        <TableCell>
          <StatusBadge status={r.status} />
        </TableCell>
        {actions && (
          <TableCell className="text-right space-x-1">
            <Button size="sm" variant="default" disabled={busy} onClick={() => onApprove(r.id)}>
              Approve
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={busy}
              onClick={() => {
                setRejectOpen(r);
                setRejectReason("");
              }}
            >
              Reject
            </Button>
          </TableCell>
        )}
      </TableRow>
    );
  };

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-xl font-semibold">Leave management</h1>
            <p className="text-xs text-muted-foreground">
              Approve requests, manage balances, and run accruals.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              className="w-24"
              value={year}
              onChange={(e) => setYear(Number(e.target.value) || year)}
            />
            {isOrgAdmin && (
              <Link to="/admin/leave-types">
                <Button variant="outline" size="sm">
                  Leave types
                </Button>
              </Link>
            )}
            <Link to="/org">
              <Button variant="outline" size="sm">
                Back
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-8">
        <Tabs defaultValue="pending">
          <TabsList>
            <TabsTrigger value="pending">Pending ({pending.length})</TabsTrigger>
            <TabsTrigger value="history">History ({history.length})</TabsTrigger>
            <TabsTrigger value="balances">Balances</TabsTrigger>
            <TabsTrigger value="log">Accrual log</TabsTrigger>
          </TabsList>
          <TabsContent value="pending">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Awaiting decision</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Dates</TableHead>
                      <TableHead>Days</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pending.map((r) => (
                      <Row key={r.id} r={r} actions />
                    ))}
                    {pending.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-muted-foreground">
                          No pending requests.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">History</CardTitle>
                <CardDescription>All decided / cancelled requests</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Dates</TableHead>
                      <TableHead>Days</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {history.map((r) => (
                      <Row key={r.id} r={r} />
                    ))}
                    {history.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground">
                          No history yet.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="balances">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle className="text-base">Balances · {year}</CardTitle>
                  <CardDescription>{balances.length} record(s)</CardDescription>
                </div>
                {isOrgAdmin && (
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" disabled={busy} onClick={onRunAccrual}>
                      Run monthly accrual
                    </Button>
                    <Button size="sm" variant="outline" disabled={busy} onClick={onRunCarryOver}>
                      Run year-end carry-over
                    </Button>
                    <Button size="sm" disabled={busy} onClick={() => setAdjOpen(true)}>
                      Adjust balance
                    </Button>
                  </div>
                )}
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Accrued</TableHead>
                      <TableHead>Carried</TableHead>
                      <TableHead>Used</TableHead>
                      <TableHead>Pending</TableHead>
                      <TableHead className="text-right">Available</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {balances.map((b) => {
                      const t = types[b.leave_type_id];
                      const e = employees[b.employee_id];
                      const available =
                        Number(b.accrued_days) +
                        Number(b.carried_over_days) -
                        Number(b.used_days) -
                        Number(b.pending_days);
                      return (
                        <TableRow key={b.id}>
                          <TableCell>{e ? `${e.first_name} ${e.last_name}` : "—"}</TableCell>
                          <TableCell>
                            <span className="inline-flex items-center gap-2">
                              <span
                                className="h-2 w-2 rounded-full"
                                style={{ background: t?.color ?? "#94a3b8" }}
                              />
                              {t?.name ?? "—"}
                            </span>
                          </TableCell>
                          <TableCell>{Number(b.accrued_days).toFixed(2)}</TableCell>
                          <TableCell>{Number(b.carried_over_days).toFixed(2)}</TableCell>
                          <TableCell>{Number(b.used_days).toFixed(2)}</TableCell>
                          <TableCell>{Number(b.pending_days).toFixed(2)}</TableCell>
                          <TableCell className="text-right font-semibold">
                            {available.toFixed(2)}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {balances.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-muted-foreground">
                          No balances for {year}.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="log">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Recent accrual activity</CardTitle>
                <CardDescription>
                  Last 100 entries (accruals, carry-over, adjustments)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>When</TableHead>
                      <TableHead>Kind</TableHead>
                      <TableHead>Employee</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Period</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Reason</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.map((l) => {
                      const e = employees[l.employee_id];
                      const t = types[l.leave_type_id];
                      return (
                        <TableRow key={l.id}>
                          <TableCell className="text-xs">
                            {new Date(l.created_at).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{l.kind}</Badge>
                          </TableCell>
                          <TableCell>{e ? `${e.first_name} ${e.last_name}` : "—"}</TableCell>
                          <TableCell>{t?.name ?? "—"}</TableCell>
                          <TableCell className="font-mono text-xs">{l.period_key}</TableCell>
                          <TableCell className="text-right font-medium">
                            {Number(l.amount) > 0 ? "+" : ""}
                            {Number(l.amount).toFixed(2)}
                          </TableCell>
                          <TableCell className="max-w-xs truncate" title={l.reason ?? ""}>
                            {l.reason ?? "—"}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {logs.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-muted-foreground">
                          No activity yet.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </section>

      <Dialog
        open={!!rejectOpen}
        onOpenChange={(o) => {
          if (!o) setRejectOpen(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject leave request</DialogTitle>
            <DialogDescription>Optional reason will be visible to the employee.</DialogDescription>
          </DialogHeader>
          <Textarea
            rows={4}
            placeholder="Reason (optional)"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectOpen(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={onReject} disabled={busy}>
              {busy ? "Rejecting…" : "Reject request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={adjOpen} onOpenChange={setAdjOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adjust leave balance</DialogTitle>
            <DialogDescription>Year {year}. Adjustments are logged and audited.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Employee</Label>
              <Select
                value={adj.employeeId}
                onValueChange={(v) => setAdj({ ...adj, employeeId: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                  {empsList.map((e) => (
                    <SelectItem key={e.id} value={e.id}>
                      {e.first_name} {e.last_name} ({e.employee_number})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Leave type</Label>
              <Select
                value={adj.leaveTypeId}
                onValueChange={(v) => setAdj({ ...adj, leaveTypeId: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {typesList.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>Field</Label>
                <Select
                  value={adj.field}
                  onValueChange={(v) => setAdj({ ...adj, field: v as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="accrued_days">Accrued</SelectItem>
                    <SelectItem value="used_days">Used</SelectItem>
                    <SelectItem value="carried_over_days">Carried over</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Delta (+/-)</Label>
                <Input
                  type="number"
                  step="0.5"
                  value={adj.delta}
                  onChange={(e) => setAdj({ ...adj, delta: Number(e.target.value) })}
                />
              </div>
            </div>
            <div>
              <Label>Reason</Label>
              <Textarea
                rows={3}
                value={adj.reason}
                onChange={(e) => setAdj({ ...adj, reason: e.target.value })}
                placeholder="Why this adjustment?"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAdjOpen(false)}>
              Cancel
            </Button>
            <Button onClick={onAdjust} disabled={busy}>
              Apply
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; variant: any }> = {
    pending: { label: "Pending", variant: "secondary" },
    approved: { label: "Approved", variant: "default" },
    rejected: { label: "Rejected", variant: "destructive" },
    cancelled: { label: "Cancelled", variant: "outline" },
  };
  const m = map[status] ?? { label: status, variant: "outline" };
  return <Badge variant={m.variant}>{m.label}</Badge>;
}
