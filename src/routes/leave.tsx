import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { submitLeaveRequest, cancelLeaveRequest, countWorkingDays } from "@/lib/leave.functions";
import { projectLeaveBalances } from "@/lib/leave-accruals.functions";
import { AppShell } from "@/components/AppShell";
import { KpiTile, StatusChip, statusTone, CardRail } from "@/components/monday";
import { CalendarDays, Clock3, CheckCircle2, AlertCircle } from "lucide-react";

export const Route = createFileRoute("/leave")({
  head: () => ({ meta: [{ title: "My leave — WorldPay HRMS" }] }),
  component: MyLeave,
});

interface LeaveType { id: string; code: string; name: string; color: string; annual_quota_days: number; requires_approval: boolean; is_paid: boolean; allow_half_day: boolean; is_active: boolean }
interface Balance { id: string; leave_type_id: string; year: number; accrued_days: number; used_days: number; pending_days: number; carried_over_days: number }
interface Request { id: string; leave_type_id: string; start_date: string; end_date: string; days: number; status: string; reason: string | null; rejection_reason: string | null; created_at: string; half_day_start: boolean; half_day_end: boolean }

function MyLeave() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [emp, setEmp] = useState<{ id: string; tenant_id: string } | null>(null);
  const [types, setTypes] = useState<LeaveType[]>([]);
  const [balances, setBalances] = useState<Balance[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ leaveTypeId: "", startDate: "", endDate: "", halfStart: false, halfEnd: false, reason: "" });
  const [busy, setBusy] = useState(false);
  const [projectDate, setProjectDate] = useState("");
  const [projection, setProjection] = useState<any[] | null>(null);
  const [projecting, setProjecting] = useState(false);
  const [holidayDates, setHolidayDates] = useState<Set<string>>(new Set());

  const submit = useServerFn(submitLeaveRequest);
  const cancel = useServerFn(cancelLeaveRequest);
  const project = useServerFn(projectLeaveBalances);

  useEffect(() => { if (!loading && !user) navigate({ to: "/auth" }); }, [loading, user, navigate]);

  async function loadAll() {
    if (!user) return;
    const { data: e } = await supabase.from("employees").select("id,tenant_id").eq("user_id", user.id).maybeSingle();
    if (!e) return;
    setEmp(e as any);
    const [tRes, bRes, rRes, tenantRes] = await Promise.all([
      supabase.from("leave_types").select("*").eq("tenant_id", e.tenant_id).eq("is_active", true).order("name"),
      supabase.from("leave_balances").select("*").eq("employee_id", e.id).eq("year", new Date().getUTCFullYear()),
      supabase.from("leave_requests").select("*").eq("employee_id", e.id).order("created_at", { ascending: false }),
      supabase.from("tenants").select("country_code").eq("id", e.tenant_id).maybeSingle(),
    ]);
    setTypes((tRes.data ?? []) as LeaveType[]);
    setBalances((bRes.data ?? []) as Balance[]);
    setRequests((rRes.data ?? []) as Request[]);

    // Fetched once per session (not re-fetched as the form's dates change) so
    // the balance preview below can recompute instantly — must match what
    // submitLeaveRequest will actually charge, or the preview lies.
    const countryCode = tenantRes.data?.country_code as string | undefined;
    if (countryCode) {
      const { data: holidays } = await supabase
        .from("public_holidays").select("holiday_date").eq("country_code", countryCode);
      setHolidayDates(new Set((holidays ?? []).map((h: { holiday_date: string }) => h.holiday_date)));
    }
  }
  useEffect(() => { loadAll(); }, [user]);

  const computedDays = form.startDate && form.endDate
    ? countWorkingDays(form.startDate, form.endDate, form.halfStart, form.halfEnd, holidayDates)
    : 0;

  async function onSubmit() {
    if (!form.leaveTypeId || !form.startDate || !form.endDate) { toast.error("Fill all required fields"); return; }
    if (computedDays <= 0) { toast.error("Invalid date range, or every selected day is a weekend/holiday"); return; }
    setBusy(true);
    try {
      await submit({ data: { leaveTypeId: form.leaveTypeId, startDate: form.startDate, endDate: form.endDate, days: computedDays, halfDayStart: form.halfStart, halfDayEnd: form.halfEnd, reason: form.reason || undefined } });
      toast.success("Leave request submitted");
      setOpen(false);
      setForm({ leaveTypeId: "", startDate: "", endDate: "", halfStart: false, halfEnd: false, reason: "" });
      await loadAll();
    } catch (e: any) {
      toast.error(e.message ?? "Failed to submit");
    } finally { setBusy(false); }
  }

  async function onProject() {
    if (!projectDate) { toast.error("Pick a target date"); return; }
    setProjecting(true);
    try {
      const r: any = await project({ data: { targetDate: projectDate } });
      setProjection(r.projections ?? []);
    } catch (e: any) { toast.error(e.message ?? "Failed"); }
    finally { setProjecting(false); }
  }

  async function onCancel(id: string) {
    if (!confirm("Cancel this leave request?")) return;
    try {
      await cancel({ data: { requestId: id } });
      toast.success("Request cancelled");
      await loadAll();
    } catch (e: any) { toast.error(e.message ?? "Failed"); }
  }

  if (loading || !user) return <main className="flex min-h-screen items-center justify-center text-muted-foreground">Loading…</main>;
  if (!emp) return <main className="flex min-h-screen items-center justify-center text-muted-foreground p-6 text-center">You're not linked to an employee record yet. Ask your organization admin to add you.</main>;

  const typeById = (id: string) => types.find((t) => t.id === id);

  const pendingCount = requests.filter((r) => r.status === "pending").length;
  const approvedCount = requests.filter((r) => r.status === "approved").length;
  const rejectedCount = requests.filter((r) => r.status === "rejected").length;
  const totalAvailable = types.reduce((sum, t) => {
    const b = balances.find((x) => x.leave_type_id === t.id);
    const accrued = Number(b?.accrued_days ?? t.annual_quota_days);
    const used = Number(b?.used_days ?? 0);
    const pending = Number(b?.pending_days ?? 0);
    const carried = Number(b?.carried_over_days ?? 0);
    return sum + (accrued + carried - used - pending);
  }, 0);

  return (
    <AppShell title="My leave" subtitle="Request time off and track your balance.">
      <section className="mx-auto max-w-5xl space-y-6 px-6 py-8">
        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <KpiTile label="Days available" value={totalAvailable.toFixed(1)} tone="primary" icon={CalendarDays} hint="Across all types" />
          <KpiTile label="Pending" value={pendingCount} tone={pendingCount > 0 ? "working" : "done"} icon={Clock3} />
          <KpiTile label="Approved" value={approvedCount} tone="done" icon={CheckCircle2} />
          <KpiTile label="Rejected" value={rejectedCount} tone={rejectedCount > 0 ? "stuck" : "info"} icon={AlertCircle} />
        </section>

        <div className="flex items-center justify-end">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button size="sm">Request leave</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>New leave request</DialogTitle>
                <DialogDescription>Submit a time off request. Pending requests reserve your balance.</DialogDescription>
              </DialogHeader>
              <div className="space-y-3">
                <div>
                  <Label>Leave type</Label>
                  <Select value={form.leaveTypeId} onValueChange={(v) => setForm({ ...form, leaveTypeId: v })}>
                    <SelectTrigger><SelectValue placeholder="Select leave type" /></SelectTrigger>
                    <SelectContent>{types.map((t) => <SelectItem key={t.id} value={t.id}>{t.name} {!t.is_paid && <span className="text-xs text-muted-foreground">· unpaid</span>}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div><Label>Start date</Label><Input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} /></div>
                  <div><Label>End date</Label><Input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} /></div>
                </div>
                {typeById(form.leaveTypeId)?.allow_half_day && (
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <label className="flex items-center gap-2"><input type="checkbox" checked={form.halfStart} onChange={(e) => setForm({ ...form, halfStart: e.target.checked })} /> Half-day on start</label>
                    <label className="flex items-center gap-2"><input type="checkbox" checked={form.halfEnd} onChange={(e) => setForm({ ...form, halfEnd: e.target.checked })} /> Half-day on end</label>
                  </div>
                )}
                <div><Label>Reason (optional)</Label><Textarea rows={3} value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} /></div>
                <div className="rounded-md border border-border bg-muted/30 p-2 text-sm">Total: <strong>{computedDays}</strong> working day(s) <span className="text-xs text-muted-foreground">(weekends and public holidays excluded)</span></div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button onClick={onSubmit} disabled={busy}>{busy ? "Submitting…" : "Submit request"}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader><CardTitle className="text-base">Balances · {new Date().getUTCFullYear()}</CardTitle><CardDescription>Days available per leave type</CardDescription></CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {types.map((t) => {
                const b = balances.find((x) => x.leave_type_id === t.id);
                const accrued = Number(b?.accrued_days ?? t.annual_quota_days);
                const used = Number(b?.used_days ?? 0);
                const pending = Number(b?.pending_days ?? 0);
                const carried = Number(b?.carried_over_days ?? 0);
                const available = accrued + carried - used - pending;
                return (
                  <div key={t.id} className="rounded-md border border-border p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full" style={{ background: t.color }} /><span className="font-medium">{t.name}</span></div>
                      <Badge variant="outline">{t.is_paid ? "Paid" : "Unpaid"}</Badge>
                    </div>
                    <div className="mt-2 text-2xl font-semibold">{available.toFixed(1)}</div>
                    <div className="text-xs text-muted-foreground">Available · {used.toFixed(1)} used · {pending.toFixed(1)} pending</div>
                  </div>
                );
              })}
              {types.length === 0 && <div className="text-sm text-muted-foreground">No leave types configured yet.</div>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Project balance</CardTitle>
            <CardDescription>See your projected balance on a future date, including upcoming accruals and pending leave.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-end gap-2">
              <div>
                <Label>Target date</Label>
                <Input type="date" value={projectDate} onChange={(e) => setProjectDate(e.target.value)} />
              </div>
              <Button size="sm" onClick={onProject} disabled={projecting}>{projecting ? "Projecting…" : "Project"}</Button>
            </div>
            {projection && (
              <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {projection.map((p: any) => (
                  <div key={p.leaveTypeId} className="rounded-md border border-border p-3">
                    <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full" style={{ background: p.color }} /><span className="font-medium">{p.leaveTypeName}</span></div>
                    <div className="mt-2 text-2xl font-semibold">{Number(p.projected.available).toFixed(1)}</div>
                    <div className="text-xs text-muted-foreground">
                      +{Number(p.projected.accrual).toFixed(1)} accrual
                      {Number(p.projected.carryOver) > 0 ? ` · +${Number(p.projected.carryOver).toFixed(1)} carry-over` : ""}
                      {Number(p.projected.futureApproved) > 0 ? ` · −${Number(p.projected.futureApproved).toFixed(1)} approved` : ""}
                      {Number(p.projected.futurePending) > 0 ? ` · −${Number(p.projected.futurePending).toFixed(1)} pending` : ""}
                    </div>
                  </div>
                ))}
                {projection.length === 0 && <div className="text-sm text-muted-foreground">No leave types.</div>}
              </div>
            )}
          </CardContent>
        </Card>



        <Card>
          <CardHeader><CardTitle className="text-base">My requests</CardTitle><CardDescription>{requests.length} request(s)</CardDescription></CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow><TableHead>Type</TableHead><TableHead>Dates</TableHead><TableHead>Days</TableHead><TableHead>Status</TableHead><TableHead></TableHead></TableRow></TableHeader>
              <TableBody>
                {requests.map((r) => {
                  const t = typeById(r.leave_type_id);
                  return (
                    <TableRow key={r.id}>
                      <TableCell><span className="inline-flex items-center gap-2"><span className="h-2 w-2 rounded-full" style={{ background: t?.color ?? "#94a3b8" }} />{t?.name ?? "—"}</span></TableCell>
                      <TableCell>{r.start_date} → {r.end_date}</TableCell>
                      <TableCell>{Number(r.days).toFixed(1)}</TableCell>
                      <TableCell><StatusBadge status={r.status} /></TableCell>
                      <TableCell className="text-right">{r.status === "pending" && <Button size="sm" variant="ghost" onClick={() => onCancel(r.id)}>Cancel</Button>}</TableCell>
                    </TableRow>
                  );
                })}
                {requests.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">No requests yet.</TableCell></TableRow>}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </section>
    </AppShell>
  );
}

function StatusBadge({ status }: { status: string }) {
  const s = statusTone(status);
  return <StatusChip tone={s.tone}>{s.label}</StatusChip>;
}
