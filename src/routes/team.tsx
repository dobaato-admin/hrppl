import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";
import { KpiTile, StatusChip, statusTone, CardRail } from "@/components/monday";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { approveLeaveRequest, rejectLeaveRequest } from "@/lib/leave.functions";
import { approveTimesheet, rejectTimesheet } from "@/lib/attendance.functions";
import { decideExpenseClaim } from "@/lib/expenses.functions";
import { Users, CalendarCheck2, FileClock, UmbrellaOff, Search, GraduationCap, ClipboardList, MessageSquareWarning, Receipt } from "lucide-react";
import { AdminGate } from "@/components/AdminGate";
import { localYmd } from "@/lib/work-date";

export const Route = createFileRoute("/team")({
  head: () => ({ meta: [{ title: "Dashboard — hrppl" }] }),
  component: () => (
    <AdminGate feature="manager.team">
      <TeamPage />
    </AdminGate>
  ),
});

interface Emp {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  employee_number: string;
  job_title: string | null;
  department_id: string | null;
  status: string;
  manager_id: string | null;
}
interface Dept { id: string; name: string }
interface LeaveReq {
  id: string; employee_id: string; leave_type_id: string; start_date: string; end_date: string;
  days: number; status: string; reason: string | null; created_at: string;
}
interface LeaveType { id: string; name: string; color: string }
interface Sheet {
  id: string; employee_id: string; period_start: string; period_end: string;
  total_hours: number; overtime_hours: number; status: string; rejection_reason: string | null;
  approved_at: string | null; approved_by: string | null; submitted_at: string | null; updated_at: string;
}
interface OnbAssign { id: string; employee_id: string; checklist_id: string; status: string; due_date: string | null; assigned_at: string }
interface OnbChecklist { id: string; name: string }
interface TrainEnroll { id: string; employee_id: string; course_id: string; status: string; due_date: string | null; score: number | null; assigned_at: string }
interface Course { id: string; title: string }
interface Grievance { id: string; filer_employee_id: string | null; filer_user_id: string; subject: string; category: string; severity: string; status: string; is_anonymous: boolean; created_at: string }
interface Expense { id: string; employee_id: string; title: string; status: string; total_amount: number; currency: string; submitted_at: string | null; created_at: string }

function startOfWeek(d: Date) {
  const x = new Date(d);
  const day = (x.getDay() + 6) % 7;
  x.setDate(x.getDate() - day);
  x.setHours(0, 0, 0, 0);
  return x;
}
/**
 * T24 · The browser's own calendar date, not the UTC one.
 *
 * This was `d.toISOString().slice(0, 10)`, applied to the *local* midnight
 * Date that `startOfWeek` returns. For any zone east of Greenwich, local
 * midnight Monday is still Sunday in UTC, so every column of the week grid was
 * labelled one day later than the date it actually queried — a leave day
 * showed against the wrong weekday, and the whole week window was off by one.
 * `Asia/Kathmandu` (+05:45) and `Australia/Sydney` (+10) both hit it; a US
 * manager saw it shift the other way after 19:00 local.
 *
 * This grid is the browser's view of a manager's own week, so the browser's
 * zone is the right one here — see `localYmd`.
 */
const ymd = localYmd;
function fullName(e: Pick<Emp, "first_name" | "last_name">) { return `${e.first_name} ${e.last_name}`.trim(); }
function initials(e: Pick<Emp, "first_name" | "last_name">) {
  return `${(e.first_name?.[0] ?? "").toUpperCase()}${(e.last_name?.[0] ?? "").toUpperCase()}`;
}

function TeamPage() {
  const { user, roles, loading } = useAuth();
  const navigate = useNavigate();
  const [me, setMe] = useState<{ id: string; tenant_id: string } | null>(null);
  const [reports, setReports] = useState<Emp[]>([]);
  /**
   * False until load() has answered. `reports` starts as `[]`, so a manager was
   * told "No direct reports yet." while their reports were loading — on the
   * page whose entire purpose is their reports.
   */
  const [loaded, setLoaded] = useState(false);
  const [depts, setDepts] = useState<Dept[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [pendingLeave, setPendingLeave] = useState<LeaveReq[]>([]);
  const [pendingSheets, setPendingSheets] = useState<Sheet[]>([]);
  const [historySheets, setHistorySheets] = useState<Sheet[]>([]);
  const [weekLeave, setWeekLeave] = useState<LeaveReq[]>([]);
  const [busy, setBusy] = useState(false);
  const [search, setSearch] = useState("");
  const [weekStart] = useState(() => startOfWeek(new Date()));
  const [onbAssignments, setOnbAssignments] = useState<OnbAssign[]>([]);
  const [onbChecklists, setOnbChecklists] = useState<OnbChecklist[]>([]);
  const [enrollments, setEnrollments] = useState<TrainEnroll[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [grievances, setGrievances] = useState<Grievance[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);

  const fnApproveLeave = useServerFn(approveLeaveRequest);
  const fnRejectLeave = useServerFn(rejectLeaveRequest);
  const fnApproveSheet = useServerFn(approveTimesheet);
  const fnRejectSheet = useServerFn(rejectTimesheet);
  const fnDecideExpense = useServerFn(decideExpenseClaim);

  async function recommendExpense(id: string) {
    const comment = window.prompt("Recommendation note (optional)") ?? undefined;
    setBusy(true);
    try { await fnDecideExpense({ data: { id, action: "recommend", comment } }); toast.success("Recommended to admin"); await load(); }
    catch (e: any) { toast.error(e.message); }
    finally { setBusy(false); }
  }
  async function withdrawExpense(id: string) {
    setBusy(true);
    try { await fnDecideExpense({ data: { id, action: "withdraw_recommendation" } }); toast.success("Recommendation withdrawn"); await load(); }
    catch (e: any) { toast.error(e.message); }
    finally { setBusy(false); }
  }

  useEffect(() => {
    if (!loading) {
      if (!user) { navigate({ to: "/auth" }); return; }
      const allowed = roles.some((r) => ["manager", "org_admin", "super_admin"].includes(r));
      if (!allowed) { toast.error("Manager access required"); navigate({ to: "/dashboard" }); }
    }
  }, [loading, user, roles, navigate]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("employees").select("id,tenant_id").eq("user_id", user.id).maybeSingle();
      if (data) setMe(data as any);
    })();
  }, [user]);

  async function load() {
    if (!me) return;
    // Direct reports
    const { data: rep } = await supabase
      .from("employees")
      .select("id,first_name,last_name,email,employee_number,job_title,department_id,status,manager_id")
      .eq("manager_id", me.id)
      .order("first_name");
    const list = (rep ?? []) as Emp[];
    setReports(list);

    // Departments
    const { data: d } = await supabase.from("departments").select("id,name").eq("tenant_id", me.tenant_id);
    setDepts((d ?? []) as Dept[]);

    // Leave types (for color/name)
    const { data: lt } = await supabase.from("leave_types").select("id,name,color").eq("tenant_id", me.tenant_id);
    setLeaveTypes((lt ?? []) as LeaveType[]);

    const ids = list.map((e) => e.id);
    const userIds = list.map((e) => (e as any).user_id).filter(Boolean);
    if (ids.length === 0) {
      setPendingLeave([]); setPendingSheets([]); setHistorySheets([]); setWeekLeave([]);
      setOnbAssignments([]); setEnrollments([]); setGrievances([]); setExpenses([]);
      return;
    }

    const weekEnd = new Date(weekStart); weekEnd.setDate(weekEnd.getDate() + 6);
    const since = new Date(); since.setDate(since.getDate() - 30);

    const [lr, ts, hs, wl, oa, oc, en, co, gr, ex] = await Promise.all([
      supabase.from("leave_requests").select("*").in("employee_id", ids).eq("status", "pending").order("created_at"),
      supabase.from("timesheets").select("*").in("employee_id", ids).eq("status", "submitted").order("period_start"),
      supabase.from("timesheets").select("*").in("employee_id", ids).in("status", ["approved", "rejected"])
        .gte("updated_at", since.toISOString()).order("updated_at", { ascending: false }).limit(20),
      supabase.from("leave_requests").select("*").in("employee_id", ids).eq("status", "approved")
        .gte("end_date", ymd(weekStart)).lte("start_date", ymd(weekEnd)),
      supabase.from("onboarding_assignments").select("id,employee_id,checklist_id,status,due_date,assigned_at")
        .in("employee_id", ids).order("assigned_at", { ascending: false }),
      supabase.from("onboarding_checklists").select("id,name").eq("tenant_id", me.tenant_id),
      supabase.from("training_enrollments").select("id,employee_id,course_id,status,due_date,score,assigned_at")
        .in("employee_id", ids).order("assigned_at", { ascending: false }),
      supabase.from("training_courses").select("id,title").eq("tenant_id", me.tenant_id),
      supabase.from("grievances").select("id,filer_employee_id,filer_user_id,subject,category,severity,status,is_anonymous,created_at")
        .eq("tenant_id", me.tenant_id)
        .or(`filer_employee_id.in.(${ids.join(",")}),against_employee_id.in.(${ids.join(",")})`)
        .order("created_at", { ascending: false }).limit(50),
      supabase.from("expense_claims").select("id,employee_id,title,status,total_amount,currency,submitted_at,created_at")
        .in("employee_id", ids).order("created_at", { ascending: false }).limit(50),
    ]);
    setPendingLeave((lr.data ?? []) as LeaveReq[]);
    setPendingSheets((ts.data ?? []) as Sheet[]);
    setHistorySheets((hs.data ?? []) as Sheet[]);
    setWeekLeave((wl.data ?? []) as LeaveReq[]);
    setOnbAssignments((oa.data ?? []) as OnbAssign[]);
    setOnbChecklists((oc.data ?? []) as OnbChecklist[]);
    setEnrollments((en.data ?? []) as TrainEnroll[]);
    setCourses((co.data ?? []) as Course[]);
    setGrievances((gr.data ?? []) as Grievance[]);
    setExpenses((ex.data ?? []) as Expense[]);
    void userIds;
    setLoaded(true);
  }
  useEffect(() => { load(); }, [me]);

  const empMap = useMemo(() => Object.fromEntries(reports.map((e) => [e.id, e])), [reports]);
  const ltMap = useMemo(() => Object.fromEntries(leaveTypes.map((t) => [t.id, t])), [leaveTypes]);
  const deptMap = useMemo(() => Object.fromEntries(depts.map((d) => [d.id, d.name])), [depts]);

  const filteredReports = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return reports;
    return reports.filter((e) =>
      fullName(e).toLowerCase().includes(q) ||
      e.email.toLowerCase().includes(q) ||
      (e.job_title ?? "").toLowerCase().includes(q) ||
      e.employee_number.toLowerCase().includes(q),
    );
  }, [reports, search]);

  const onLeaveToday = useMemo(() => {
    const today = ymd(new Date());
    return weekLeave.filter((r) => r.start_date <= today && r.end_date >= today);
  }, [weekLeave]);

  async function approveLeave(id: string) {
    setBusy(true);
    try {
      const r: any = await fnApproveLeave({ data: { requestId: id } });
      toast.success(r?.advanced ? `Advanced to tier ${r.tier} — awaiting the next approver` : "Approved");
      await load();
    }
    catch (e: any) { toast.error(e.message); }
    finally { setBusy(false); }
  }
  async function rejectLeave(id: string) {
    const reason = window.prompt("Reason (optional)") ?? undefined;
    setBusy(true);
    try { await fnRejectLeave({ data: { requestId: id, reason } }); toast.success("Rejected"); await load(); }
    catch (e: any) { toast.error(e.message); }
    finally { setBusy(false); }
  }
  async function approveSheet(id: string) {
    setBusy(true);
    try { await fnApproveSheet({ data: { timesheetId: id } }); toast.success("Approved"); await load(); }
    catch (e: any) { toast.error(e.message); }
    finally { setBusy(false); }
  }
  async function rejectSheet(id: string) {
    const reason = window.prompt("Reason (optional)") ?? undefined;
    setBusy(true);
    try { await fnRejectSheet({ data: { timesheetId: id, reason } }); toast.success("Rejected"); await load(); }
    catch (e: any) { toast.error(e.message); }
    finally { setBusy(false); }
  }

  if (loading || !user) return <main className="flex min-h-screen items-center justify-center text-muted-foreground">Loading…</main>;

  const weekDays: Date[] = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart); d.setDate(d.getDate() + i); return d;
  });

  return (
    <AppShell title="Dashboard" subtitle="Approvals, roster, and weekly leave at a glance.">
      <section className="mx-auto max-w-7xl space-y-6 px-6 py-8">
        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <KpiTile label="Direct reports" value={reports.length} tone="primary" icon={Users} hint={`${reports.filter((e) => e.status === "active").length} active`} />
          <KpiTile label="Leave to approve" value={pendingLeave.length} tone={pendingLeave.length > 0 ? "working" : "done"} icon={CalendarCheck2} />
          <KpiTile label="Timesheets to approve" value={pendingSheets.length} tone={pendingSheets.length > 0 ? "working" : "done"} icon={FileClock} />
          <KpiTile label="On leave today" value={onLeaveToday.length} tone={onLeaveToday.length > 0 ? "info" : "done"} icon={UmbrellaOff} />
        </section>

        <Tabs defaultValue="approvals">
          <TabsList className="flex-wrap h-auto">
            <TabsTrigger value="approvals">Approvals ({pendingLeave.length + pendingSheets.length})</TabsTrigger>
            <TabsTrigger value="roster">Roster ({reports.length})</TabsTrigger>
            <TabsTrigger value="calendar">Leave calendar</TabsTrigger>
            <TabsTrigger value="onboarding">Onboarding ({onbAssignments.filter(a => a.status !== "signed_off" && a.status !== "cancelled").length})</TabsTrigger>
            <TabsTrigger value="training">Training ({enrollments.filter(e => e.status !== "completed").length})</TabsTrigger>
            <TabsTrigger value="grievances">Grievances ({grievances.filter(g => !["resolved","dismissed"].includes(g.status)).length})</TabsTrigger>
            <TabsTrigger value="expenses">Expenses ({expenses.filter(e => e.status === "submitted").length})</TabsTrigger>
          </TabsList>

          <TabsContent value="approvals" className="space-y-4">
            <Card className="overflow-hidden">
              <CardRail tone={pendingLeave.length > 0 ? "working" : "done"} />
              <CardHeader>
                <CardTitle className="text-base">Leave requests</CardTitle>
                <CardDescription>{pendingLeave.length} pending</CardDescription>
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
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingLeave.map((r) => {
                      const e = empMap[r.employee_id];
                      const t = ltMap[r.leave_type_id];
                      return (
                        <TableRow key={r.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-7 w-7"><AvatarFallback className="text-xs">{e ? initials(e) : "?"}</AvatarFallback></Avatar>
                              <span className="font-medium">{e ? fullName(e) : "—"}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="inline-flex items-center gap-2">
                              <span className="h-2 w-2 rounded-full" style={{ background: t?.color ?? "#94a3b8" }} />
                              {t?.name ?? "—"}
                            </span>
                          </TableCell>
                          <TableCell className="whitespace-nowrap">{r.start_date} → {r.end_date}</TableCell>
                          <TableCell>{Number(r.days).toFixed(1)}</TableCell>
                          <TableCell className="text-xs text-muted-foreground max-w-xs truncate">{r.reason || "—"}</TableCell>
                          <TableCell className="text-right space-x-1">
                            <Button size="sm" variant="outline" disabled={busy} onClick={() => rejectLeave(r.id)}>Reject</Button>
                            <Button size="sm" disabled={busy} onClick={() => approveLeave(r.id)}>Approve</Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {pendingLeave.length === 0 && (
                      <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-6">All caught up — no pending leave.</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card className="overflow-hidden">
              <CardRail tone={pendingSheets.length > 0 ? "working" : "done"} />
              <CardHeader>
                <CardTitle className="text-base">Timesheets</CardTitle>
                <CardDescription>{pendingSheets.length} awaiting review</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Period</TableHead>
                      <TableHead>Hours</TableHead>
                      <TableHead>Overtime</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingSheets.map((s) => {
                      const e = empMap[s.employee_id];
                      const st = statusTone(s.status);
                      return (
                        <TableRow key={s.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-7 w-7"><AvatarFallback className="text-xs">{e ? initials(e) : "?"}</AvatarFallback></Avatar>
                              <span className="font-medium">{e ? fullName(e) : "—"}</span>
                            </div>
                          </TableCell>
                          <TableCell className="whitespace-nowrap">{s.period_start} → {s.period_end}</TableCell>
                          <TableCell>{Number(s.total_hours).toFixed(2)}</TableCell>
                          <TableCell>{Number(s.overtime_hours).toFixed(2)}</TableCell>
                          <TableCell><StatusChip tone={st.tone}>{st.label}</StatusChip></TableCell>
                          <TableCell className="text-right space-x-1">
                            <Button size="sm" variant="outline" disabled={busy} onClick={() => rejectSheet(s.id)}>Reject</Button>
                            <Button size="sm" disabled={busy} onClick={() => approveSheet(s.id)}>Approve</Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {pendingSheets.length === 0 && (
                      <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-6">All caught up — no pending timesheets.</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card className="overflow-hidden">
              <CardRail tone="info" />
              <CardHeader>
                <CardTitle className="text-base">Timesheet status history</CardTitle>
                <CardDescription>Last 30 days · {historySheets.length} processed</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Period</TableHead>
                      <TableHead>Hours</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Processed</TableHead>
                      <TableHead>Note</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {historySheets.map((s) => {
                      const e = empMap[s.employee_id];
                      const st = statusTone(s.status);
                      const when = s.status === "approved" ? s.approved_at : s.updated_at;
                      return (
                        <TableRow key={s.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-7 w-7"><AvatarFallback className="text-xs">{e ? initials(e) : "?"}</AvatarFallback></Avatar>
                              <span className="font-medium">{e ? fullName(e) : "—"}</span>
                            </div>
                          </TableCell>
                          <TableCell className="whitespace-nowrap">{s.period_start} → {s.period_end}</TableCell>
                          <TableCell>{Number(s.total_hours).toFixed(2)}</TableCell>
                          <TableCell><StatusChip tone={st.tone}>{st.label}</StatusChip></TableCell>
                          <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                            {when ? new Date(when).toLocaleString([], { dateStyle: "medium", timeStyle: "short" }) : "—"}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground max-w-xs truncate">
                            {s.status === "rejected" ? (s.rejection_reason || "Rejected") : "Approved"}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {historySheets.length === 0 && (
                      <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-6">No processed timesheets in the last 30 days.</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="roster">
            <Card className="overflow-hidden">
              <CardRail tone="info" />
              <CardHeader className="flex flex-row items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-base">Direct reports</CardTitle>
                  <CardDescription>{filteredReports.length} of {reports.length}</CardDescription>
                </div>
                <div className="relative w-64">
                  <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                  <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search…" className="pl-7" />
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Number</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Email</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredReports.map((e) => {
                      const s = statusTone(e.status);
                      return (
                        <TableRow key={e.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-7 w-7"><AvatarFallback className="text-xs">{initials(e)}</AvatarFallback></Avatar>
                              <span className="font-medium">{fullName(e)}</span>
                            </div>
                          </TableCell>
                          <TableCell className="font-mono text-xs">{e.employee_number}</TableCell>
                          <TableCell>{e.job_title ?? "—"}</TableCell>
                          <TableCell>{e.department_id ? deptMap[e.department_id] ?? "—" : "—"}</TableCell>
                          <TableCell><StatusChip tone={s.tone}>{s.label}</StatusChip></TableCell>
                          <TableCell className="text-xs text-muted-foreground">{e.email}</TableCell>
                        </TableRow>
                      );
                    })}
                    {filteredReports.length === 0 && (
                      <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-6">
                        {!loaded
                          ? "Loading your team…"
                          : reports.length === 0
                            ? "No direct reports yet."
                            : "No matches."}
                      </TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="calendar">
            <Card className="overflow-hidden">
              <CardRail tone="primary" />
              <CardHeader>
                <CardTitle className="text-base">This week — approved leave</CardTitle>
                <CardDescription>{ymd(weekStart)} → {ymd(new Date(weekStart.getTime() + 6 * 86400000))}</CardDescription>
              </CardHeader>
              <CardContent>
                {reports.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-6 text-center">No direct reports.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <div className="grid min-w-[720px]" style={{ gridTemplateColumns: "200px repeat(7, 1fr)" }}>
                      <div />
                      {weekDays.map((d) => (
                        <div key={ymd(d)} className="px-2 py-1 text-center text-xs font-medium text-muted-foreground">
                          {d.toLocaleDateString([], { weekday: "short" })}<br />
                          <span className="text-foreground">{d.getDate()}</span>
                        </div>
                      ))}
                      {reports.map((e) => (
                        <CalendarRow
                          key={e.id}
                          emp={e}
                          weekDays={weekDays}
                          leave={weekLeave.filter((r) => r.employee_id === e.id)}
                          ltMap={ltMap}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="onboarding">
            <Card className="overflow-hidden">
              <CardRail tone="info" />
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2"><ClipboardList className="h-4 w-4" /> Onboarding progress</CardTitle>
                <CardDescription>Checklists assigned to your direct reports</CardDescription>
              </CardHeader>
              <CardContent>
                {onbAssignments.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-6 text-center">No onboarding assignments.</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employee</TableHead>
                        <TableHead>Checklist</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Due</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {onbAssignments.map((a) => {
                        const e = empMap[a.employee_id];
                        const cl = onbChecklists.find((c) => c.id === a.checklist_id);
                        return (
                          <TableRow key={a.id}>
                            <TableCell>{e ? fullName(e) : "—"}</TableCell>
                            <TableCell>{cl?.name ?? "—"}</TableCell>
                            <TableCell><StatusChip tone={statusTone(a.status).tone}>{a.status.replace("_", " ")}</StatusChip></TableCell>
                            <TableCell>{a.due_date ?? "—"}</TableCell>
                            <TableCell className="text-right">
                              <Button asChild size="sm" variant="ghost"><Link to="/org/onboarding">Open</Link></Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="training">
            <Card className="overflow-hidden">
              <CardRail tone="info" />
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2"><GraduationCap className="h-4 w-4" /> Training enrollments</CardTitle>
                <CardDescription>Courses your team is taking</CardDescription>
              </CardHeader>
              <CardContent>
                {enrollments.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-6 text-center">No enrollments yet.</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employee</TableHead>
                        <TableHead>Course</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Due</TableHead>
                        <TableHead>Score</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {enrollments.map((en) => {
                        const e = empMap[en.employee_id];
                        const c = courses.find((x) => x.id === en.course_id);
                        return (
                          <TableRow key={en.id}>
                            <TableCell>{e ? fullName(e) : "—"}</TableCell>
                            <TableCell>{c?.title ?? "—"}</TableCell>
                            <TableCell><StatusChip tone={statusTone(en.status).tone}>{en.status.replace("_", " ")}</StatusChip></TableCell>
                            <TableCell>{en.due_date ?? "—"}</TableCell>
                            <TableCell>{en.score ?? "—"}</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="grievances">
            <Card className="overflow-hidden">
              <CardRail tone="stuck" />
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2"><MessageSquareWarning className="h-4 w-4" /> Grievances</CardTitle>
                <CardDescription>Cases involving your direct reports</CardDescription>
              </CardHeader>
              <CardContent>
                {grievances.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-6 text-center">No grievances on file.</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Subject</TableHead>
                        <TableHead>Filer</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Severity</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Filed</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {grievances.map((g) => {
                        const e = g.filer_employee_id ? empMap[g.filer_employee_id] : null;
                        return (
                          <TableRow key={g.id}>
                            <TableCell>{g.subject}</TableCell>
                            <TableCell>{g.is_anonymous ? <Badge variant="secondary">Anonymous</Badge> : e ? fullName(e) : "—"}</TableCell>
                            <TableCell>{g.category}</TableCell>
                            <TableCell><StatusChip tone={statusTone(g.severity).tone}>{g.severity}</StatusChip></TableCell>
                            <TableCell><StatusChip tone={statusTone(g.status).tone}>{g.status}</StatusChip></TableCell>
                            <TableCell>{new Date(g.created_at).toLocaleDateString()}</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="expenses">
            <Card className="overflow-hidden">
              <CardRail tone={expenses.some(e => e.status === "submitted") ? "working" : "done"} />
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2"><Receipt className="h-4 w-4" /> Expense claims</CardTitle>
                <CardDescription>Your team's claims — review and recommend to HR/Finance</CardDescription>
              </CardHeader>
              <CardContent>
                {expenses.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-6 text-center">No expense claims.</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employee</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Submitted</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {expenses.map((x) => {
                        const e = empMap[x.employee_id];
                        return (
                          <TableRow key={x.id}>
                            <TableCell>{e ? fullName(e) : "—"}</TableCell>
                            <TableCell>{x.title}</TableCell>
                            <TableCell>{x.currency} {Number(x.total_amount).toFixed(2)}</TableCell>
                            <TableCell><StatusChip tone={statusTone(x.status).tone}>{x.status}</StatusChip></TableCell>
                            <TableCell>{x.submitted_at ? new Date(x.submitted_at).toLocaleDateString() : "—"}</TableCell>
                            <TableCell className="text-right space-x-1">
                              {x.status === "submitted" && (
                                <Button size="sm" variant="default" disabled={busy} onClick={() => recommendExpense(x.id)}>Recommend</Button>
                              )}
                              {x.status === "recommended" && (
                                <Button size="sm" variant="outline" disabled={busy} onClick={() => withdrawExpense(x.id)}>Withdraw</Button>
                              )}
                              <Button asChild size="sm" variant="ghost"><Link to="/org/expenses">Open</Link></Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </section>
    </AppShell>
  );
}

function CalendarRow({
  emp, weekDays, leave, ltMap,
}: {
  emp: Emp;
  weekDays: Date[];
  leave: LeaveReq[];
  ltMap: Record<string, LeaveType>;
}) {
  return (
    <>
      <div className="flex items-center gap-2 border-t border-border px-2 py-2">
        <Avatar className="h-6 w-6"><AvatarFallback className="text-[10px]">{initials(emp)}</AvatarFallback></Avatar>
        <span className="text-sm truncate">{fullName(emp)}</span>
      </div>
      {weekDays.map((d) => {
        const ds = ymd(d);
        const hit = leave.find((r) => r.start_date <= ds && r.end_date >= ds);
        const t = hit ? ltMap[hit.leave_type_id] : null;
        return (
          <div key={ds} className="border-t border-border p-1">
            {hit && (
              <div
                className="h-6 rounded-md text-[10px] font-medium text-white px-1.5 flex items-center"
                style={{ background: t?.color ?? "var(--color-status-info)" }}
                title={t?.name ?? "Leave"}
              >
                {t?.name ?? "Leave"}
              </div>
            )}
          </div>
        );
      })}
    </>
  );
}
