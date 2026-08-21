import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AppShell } from "@/components/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/use-auth";
import { listVarianceQueue } from "@/lib/timesheet-allocations.functions";
import { approveTimesheet, listPendingTimesheets, rejectTimesheet } from "@/lib/timesheet-workflow.functions";
import { toast } from "sonner";
import { AlertTriangle, ShieldCheck, CheckCircle2, XCircle, Clock, Inbox, Search } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";



export const Route = createFileRoute("/org/timesheet-review")({
  head: () => ({ meta: [{ title: "Timesheet review — WorldPay HRMS" }] }),
  component: TimesheetReviewPage,
});

function TimesheetReviewPage() {
  const { roles, loading } = useAuth();
  const navigate = useNavigate();
  const fn = useServerFn(listVarianceQueue);
  const today = new Date().toISOString().slice(0, 10);
  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);
  const [from, setFrom] = useState(weekAgo);
  const [to, setTo] = useState(today);
  const [onlyFlagged, setOnlyFlagged] = useState(true);

  const canAccess = roles.includes("manager") || roles.includes("org_admin") || roles.includes("super_admin");

  useEffect(() => {
    if (!loading && !canAccess) navigate({ to: "/dashboard" });
  }, [loading, canAccess, navigate]);

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["variance-queue", from, to, onlyFlagged],
    queryFn: () => fn({ data: { from, to, only_flagged: onlyFlagged } }),
    enabled: canAccess,
  });

  const rows = data?.rows ?? [];
  const flaggedCount = rows.filter((r: any) => r.flag_suspicious).length;

  // ---- Approvals queue ----
  const qc = useQueryClient();
  const listPending = useServerFn(listPendingTimesheets);
  const approveFn = useServerFn(approveTimesheet);
  const rejectFn = useServerFn(rejectTimesheet);
  const [statusFilter, setStatusFilter] = useState<"submitted" | "approved" | "rejected" | "all">("submitted");
  const { data: pendingData, isLoading: pendingLoading } = useQuery({
    queryKey: ["pending-timesheets", statusFilter],
    queryFn: () => listPending({ data: { status: statusFilter } }),
    enabled: canAccess,
  });
  const pending = pendingData?.timesheets ?? [];
  const submittedCount = statusFilter === "submitted" ? pending.length : pending.filter((t: any) => t.status === "submitted").length;

  const [employeeQuery, setEmployeeQuery] = useState("");
  const filteredPending = pending.filter((t: any) => {
    if (!employeeQuery.trim()) return true;
    const q = employeeQuery.toLowerCase();
    const name = `${t.employees?.first_name ?? ""} ${t.employees?.last_name ?? ""} ${t.employees?.employee_number ?? ""}`.toLowerCase();
    return name.includes(q);
  });

  // KPI counts from the current pending fetch
  const kpi = {
    submitted: pending.filter((t: any) => t.status === "submitted").length,
    approved: pending.filter((t: any) => t.status === "approved").length,
    rejected: pending.filter((t: any) => t.status === "rejected").length,
  };

  const [selected, setSelected] = useState<Set<string>>(new Set());
  // Reset selection when filter or fetched data changes
  useEffect(() => { setSelected(new Set()); }, [statusFilter, employeeQuery, pendingData]);
  const submittedVisibleIds = filteredPending.filter((t: any) => t.status === "submitted").map((t: any) => t.id);
  const allSelected = submittedVisibleIds.length > 0 && submittedVisibleIds.every((id: string) => selected.has(id));
  function toggleAll() {
    if (allSelected) setSelected(new Set());
    else setSelected(new Set(submittedVisibleIds));
  }
  function toggleOne(id: string) {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelected(next);
  }

  const [rejectFor, setRejectFor] = useState<{ id: string; label: string } | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [bulkBusy, setBulkBusy] = useState(false);

  async function doApprove(id: string) {
    try { await approveFn({ data: { id } }); toast.success("Timesheet approved"); qc.invalidateQueries({ queryKey: ["pending-timesheets"] }); }
    catch (e: any) { toast.error(e?.message ?? "Failed"); }
  }
  async function doBulkApprove() {
    if (selected.size === 0) return;
    setBulkBusy(true);
    const ids = Array.from(selected);
    let ok = 0, fail = 0;
    for (const id of ids) {
      try { await approveFn({ data: { id } }); ok++; }
      catch { fail++; }
    }
    setBulkBusy(false);
    setSelected(new Set());
    qc.invalidateQueries({ queryKey: ["pending-timesheets"] });
    if (fail === 0) toast.success(`Approved ${ok} timesheet${ok === 1 ? "" : "s"}`);
    else toast.warning(`Approved ${ok}, ${fail} failed`);
  }
  async function doReject() {
    if (!rejectFor) return;
    try {
      await rejectFn({ data: { id: rejectFor.id, reason: rejectReason } });
      toast.success("Timesheet rejected");
      setRejectFor(null); setRejectReason("");
      qc.invalidateQueries({ queryKey: ["pending-timesheets"] });
    } catch (e: any) { toast.error(e?.message ?? "Failed"); }
  }


  function tsStatusBadge(s: string) {
    if (s === "approved") return <Badge className="bg-emerald-600"><CheckCircle2 className="h-3 w-3 mr-1" />Approved</Badge>;
    if (s === "rejected") return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
    if (s === "submitted") return <Badge className="bg-amber-600"><Clock className="h-3 w-3 mr-1" />Submitted</Badge>;
    return <Badge variant="secondary">Draft</Badge>;
  }

  return (
    <AppShell title="Timesheet review" subtitle="Approvals and three-way variance">
      <div className="mx-auto w-full max-w-7xl space-y-4 p-4 md:p-6">
        <Tabs defaultValue="approvals" className="space-y-4">
          <TabsList>
            <TabsTrigger value="approvals" className="gap-2">
              <Inbox className="h-4 w-4" /> Approvals
              {submittedCount > 0 && <Badge variant="destructive" className="ml-1">{submittedCount}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="variance" className="gap-2">
              <AlertTriangle className="h-4 w-4" /> Variance
              {flaggedCount > 0 && <Badge variant="destructive" className="ml-1">{flaggedCount}</Badge>}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="approvals" className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg border bg-card p-3">
                <div className="text-xs text-muted-foreground">Submitted</div>
                <div className="text-2xl font-semibold tabular-nums">{kpi.submitted}</div>
              </div>
              <div className="rounded-lg border bg-card p-3">
                <div className="text-xs text-muted-foreground">Approved</div>
                <div className="text-2xl font-semibold tabular-nums text-emerald-600">{kpi.approved}</div>
              </div>
              <div className="rounded-lg border bg-card p-3">
                <div className="text-xs text-muted-foreground">Rejected</div>
                <div className="text-2xl font-semibold tabular-nums text-destructive">{kpi.rejected}</div>
              </div>
            </div>

            <Card>
              <CardHeader className="space-y-3">
                <CardTitle className="flex flex-wrap items-center justify-between gap-2">
                  <span className="flex items-center gap-2"><Inbox className="h-5 w-5" /> Approval queue</span>
                  <div className="flex flex-wrap gap-1">
                    {(["submitted", "approved", "rejected", "all"] as const).map((s) => (
                      <Button key={s} size="sm" variant={statusFilter === s ? "default" : "outline"} onClick={() => setStatusFilter(s)}>
                        {s[0].toUpperCase() + s.slice(1)}
                      </Button>
                    ))}
                  </div>
                </CardTitle>
                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      className="pl-8"
                      placeholder="Search employee name or number…"
                      value={employeeQuery}
                      onChange={(e) => setEmployeeQuery(e.target.value)}
                    />
                  </div>
                  {selected.size > 0 && (
                    <Button size="sm" onClick={doBulkApprove} disabled={bulkBusy}>
                      <CheckCircle2 className="h-4 w-4 mr-1" />
                      {bulkBusy ? "Approving…" : `Approve ${selected.size} selected`}
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-10">
                          {submittedVisibleIds.length > 0 && (
                            <Checkbox
                              checked={allSelected}
                              onCheckedChange={toggleAll}
                              aria-label="Select all submitted"
                            />
                          )}
                        </TableHead>
                        <TableHead>Employee</TableHead>
                        <TableHead>Period</TableHead>
                        <TableHead className="text-right">Hours</TableHead>
                        <TableHead>Submitted</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Notes</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingLoading && <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-6">Loading…</TableCell></TableRow>}
                      {!pendingLoading && filteredPending.length === 0 && <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-6">{employeeQuery ? "No matches for that search." : "Nothing here."}</TableCell></TableRow>}
                      {filteredPending.map((t: any) => {
                        const label = t.employees ? `${t.employees.first_name ?? ""} ${t.employees.last_name ?? ""}`.trim() || t.employees.employee_number : t.employee_id.slice(0, 8);
                        const isSubmitted = t.status === "submitted";
                        return (
                          <TableRow key={t.id} className={selected.has(t.id) ? "bg-muted/40" : ""}>
                            <TableCell>
                              {isSubmitted && (
                                <Checkbox
                                  checked={selected.has(t.id)}
                                  onCheckedChange={() => toggleOne(t.id)}
                                  aria-label={`Select ${label}`}
                                />
                              )}
                            </TableCell>
                            <TableCell>{label}</TableCell>
                            <TableCell className="whitespace-nowrap">{t.period_start} → {t.period_end}</TableCell>
                            <TableCell className="text-right tabular-nums">{Number(t.total_hours).toFixed(2)}</TableCell>
                            <TableCell className="text-xs text-muted-foreground">{t.submitted_at ? new Date(t.submitted_at).toLocaleString() : "—"}</TableCell>
                            <TableCell>{tsStatusBadge(t.status)}</TableCell>
                            <TableCell className="text-xs max-w-[220px] truncate" title={t.rejection_reason || t.notes || ""}>
                              {t.status === "rejected" && t.rejection_reason
                                ? <span className="text-destructive">{t.rejection_reason}</span>
                                : (t.notes ?? "—")}
                            </TableCell>
                            <TableCell className="text-right">
                              {isSubmitted ? (
                                <div className="flex justify-end gap-2">
                                  <Button size="sm" onClick={() => doApprove(t.id)}><CheckCircle2 className="h-4 w-4 mr-1" />Approve</Button>
                                  <Button size="sm" variant="outline" onClick={() => setRejectFor({ id: t.id, label })}><XCircle className="h-4 w-4 mr-1" />Reject</Button>
                                </div>
                              ) : (
                                <span className="text-xs text-muted-foreground">—</span>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>


          <TabsContent value="variance" className="space-y-4">
        <Card>

          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5" /> Review queue
              {flaggedCount > 0 && (
                <Badge variant="destructive" className="ml-2">{flaggedCount} flagged</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 md:grid-cols-4">
              <div>
                <Label className="text-xs">From</Label>
                <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
              </div>
              <div>
                <Label className="text-xs">To</Label>
                <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
              </div>
              <div className="flex items-center gap-3 mt-5">
                <Switch checked={onlyFlagged} onCheckedChange={setOnlyFlagged} id="flag" />
                <Label htmlFor="flag" className="text-sm">Only flagged variances</Label>
              </div>
              <div className="flex items-end">
                <Button onClick={() => refetch()} disabled={isFetching} variant="outline" className="w-full">
                  {isFetching ? "Refreshing…" : "Refresh"}
                </Button>
              </div>
            </div>

            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Employee</TableHead>
                    <TableHead className="text-right">Rostered</TableHead>
                    <TableHead className="text-right">Attendance</TableHead>
                    <TableHead className="text-right">Claimed</TableHead>
                    <TableHead className="text-right">Δ claim vs attend</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading && (<TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-6">Loading…</TableCell></TableRow>)}
                  {!isLoading && rows.length === 0 && (<TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-6">No records.</TableCell></TableRow>)}
                  {rows.map((r: any) => {
                    const variance = Number(r.variance_claim_vs_attendance ?? 0);
                    const label = r.employee ? `${r.employee.first_name ?? ""} ${r.employee.last_name ?? ""}`.trim() || r.employee.employee_number : r.employee_id.slice(0, 8);
                    return (
                      <TableRow key={`${r.employee_id}-${r.work_date}`} className={r.flag_suspicious ? "bg-destructive/5" : ""}>
                        <TableCell>{r.work_date}</TableCell>
                        <TableCell>{label}</TableCell>
                        <TableCell className="text-right tabular-nums">{Number(r.rostered_hours).toFixed(2)}</TableCell>
                        <TableCell className="text-right tabular-nums">{Number(r.attendance_hours).toFixed(2)}</TableCell>
                        <TableCell className="text-right tabular-nums">{Number(r.claimed_hours).toFixed(2)}</TableCell>
                        <TableCell className={`text-right tabular-nums ${Math.abs(variance) > 0.5 ? "text-destructive font-medium" : ""}`}>
                          {variance > 0 ? "+" : ""}{variance.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          {r.flag_suspicious ? (
                            <Badge variant="destructive" className="gap-1"><AlertTriangle className="h-3 w-3" />Variance</Badge>
                          ) : (
                            <Badge variant="secondary">OK</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
            <p className="text-xs text-muted-foreground">
              Δ &gt; ±30 min between claimed and attendance is flagged. Rostered hours will populate when the roster module is enabled.
            </p>
          </CardContent>
        </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={!!rejectFor} onOpenChange={(v) => { if (!v) { setRejectFor(null); setRejectReason(""); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject timesheet — {rejectFor?.label}</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label>Reason (sent to employee)</Label>
            <Textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} rows={4} placeholder="Explain what needs to change…" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setRejectFor(null); setRejectReason(""); }}>Cancel</Button>
            <Button variant="destructive" onClick={doReject} disabled={rejectReason.trim().length < 3}>Reject</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}

