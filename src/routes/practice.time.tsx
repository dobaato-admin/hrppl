import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  listJobs, listProjects, listMyTimeEntries, upsertMyTimeEntry, deleteMyTimeEntry,
} from "@/lib/practice.functions";
import { listDepartments } from "@/lib/departments.functions";
import { TimeEntryAllocationDialog } from "@/components/timesheets/TimeEntryAllocationDialog";
import { listMyTimesheets, submitMyTimesheet } from "@/lib/timesheet-workflow.functions";
import { toast } from "sonner";
import { Trash2, Layers, Send, CheckCircle2, XCircle, Clock } from "lucide-react";

function startOfWeek(d: Date) {
  const dt = new Date(d);
  const day = (dt.getDay() + 6) % 7; // Monday=0
  dt.setDate(dt.getDate() - day);
  return dt.toISOString().slice(0, 10);
}
function endOfWeek(d: Date) {
  const dt = new Date(d);
  const day = (dt.getDay() + 6) % 7;
  dt.setDate(dt.getDate() - day + 6);
  return dt.toISOString().slice(0, 10);
}
function statusBadge(s: string) {
  if (s === "approved") return <Badge className="bg-emerald-600"><CheckCircle2 className="h-3 w-3 mr-1" />Approved</Badge>;
  if (s === "rejected") return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
  if (s === "submitted") return <Badge className="bg-amber-600"><Clock className="h-3 w-3 mr-1" />Submitted</Badge>;
  return <Badge variant="secondary">Draft</Badge>;
}


export const Route = createFileRoute("/practice/time")({
  head: () => ({ meta: [{ title: "Time entries — WorldPay HRMS" }] }),
  component: TimePage,
});

function TimePage() {
  const fetchEntries = useServerFn(listMyTimeEntries);
  const fetchProjects = useServerFn(listProjects);
  const fetchJobs = useServerFn(listJobs);
  const save = useServerFn(upsertMyTimeEntry);
  const del = useServerFn(deleteMyTimeEntry);
  const qc = useQueryClient();

  const fetchDepts = useServerFn(listDepartments);
  const { data, isLoading } = useQuery({ queryKey: ["my-time"], queryFn: () => fetchEntries({}) });
  const { data: pd } = useQuery({ queryKey: ["projects"], queryFn: () => fetchProjects({}) });
  const { data: jd } = useQuery({ queryKey: ["jobs", "all"], queryFn: () => fetchJobs({ data: {} }) });
  const { data: dd } = useQuery({ queryKey: ["departments"], queryFn: () => fetchDepts({}) });

  const [allocFor, setAllocFor] = useState<{ id: string; hours: number } | null>(null);

  const submitFn = useServerFn(submitMyTimesheet);
  const listSheetsFn = useServerFn(listMyTimesheets);
  const { data: sheets } = useQuery({ queryKey: ["my-timesheets"], queryFn: () => listSheetsFn({}) });

  const today = new Date();
  const [periodStart, setPeriodStart] = useState(startOfWeek(today));
  const [periodEnd, setPeriodEnd] = useState(endOfWeek(today));
  const [submitNotes, setSubmitNotes] = useState("");

  const [form, setForm] = useState<any>({
    project_id: "", job_id: "", work_date: new Date().toISOString().slice(0, 10),
    hours: 1, description: "", billable: true,
  });

  const totalThisWeek = (data?.entries ?? []).filter((e: any) => {
    const d = new Date(e.work_date);
    const now = new Date();
    const diff = (now.getTime() - d.getTime()) / 86400000;
    return diff >= 0 && diff < 7;
  }).reduce((s: number, e: any) => s + Number(e.hours), 0);

  const periodHours = (data?.entries ?? [])
    .filter((e: any) => e.work_date >= periodStart && e.work_date <= periodEnd)
    .reduce((s: number, e: any) => s + Number(e.hours), 0);

  async function submitForApproval() {
    try {
      await submitFn({ data: { period_start: periodStart, period_end: periodEnd, notes: submitNotes || null } });
      toast.success("Timesheet submitted for approval");
      setSubmitNotes("");
      qc.invalidateQueries({ queryKey: ["my-timesheets"] });
    } catch (e: any) { toast.error(e?.message ?? "Failed to submit"); }
  }


  async function submit() {
    try {
      const payload: any = {
        project_id: form.project_id,
        work_date: form.work_date,
        hours: Number(form.hours),
        description: form.description || null,
        billable: form.billable,
      };
      if (form.job_id) payload.job_id = form.job_id;
      await save({ data: payload });
      toast.success("Logged");
      setForm({ ...form, description: "", hours: 1 });
      qc.invalidateQueries({ queryKey: ["my-time"] });
    } catch (e: any) { toast.error(e?.message ?? "Failed"); }
  }

  async function remove(id: string) {
    await del({ data: { id } });
    qc.invalidateQueries({ queryKey: ["my-time"] });
  }

  const jobsForProject = (jd?.jobs ?? []).filter((j: any) => j.project_id === form.project_id);

  return (
    <AppShell title="Time entries" subtitle="Log your time across projects">
      <div className="mx-auto w-full max-w-5xl space-y-4 p-4 md:p-6">
        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader><CardTitle>Log time</CardTitle></CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label>Project</Label>
                <Select value={form.project_id} onValueChange={(v) => setForm({ ...form, project_id: v, job_id: "" })}>
                  <SelectTrigger><SelectValue placeholder="Pick project" /></SelectTrigger>
                  <SelectContent>
                    {(pd?.projects ?? []).map((p: any) => (
                      <SelectItem key={p.id} value={p.id}>{p.clients?.name} — {p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Job (optional)</Label>
                <Select value={form.job_id} onValueChange={(v) => setForm({ ...form, job_id: v })} disabled={!form.project_id}>
                  <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                  <SelectContent>
                    {jobsForProject.map((j: any) => <SelectItem key={j.id} value={j.id}>{j.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Date</Label><Input type="date" value={form.work_date} onChange={(e) => setForm({ ...form, work_date: e.target.value })} /></div>
              <div><Label>Hours</Label><Input type="number" step="0.25" value={form.hours} onChange={(e) => setForm({ ...form, hours: e.target.value })} /></div>
              <div className="flex items-end gap-2"><Switch checked={form.billable} onCheckedChange={(v) => setForm({ ...form, billable: v })} /><Label>Billable</Label></div>
              <div className="sm:col-span-2"><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
              <div className="sm:col-span-2"><Button onClick={submit} disabled={!form.project_id || !form.hours}>Log time</Button></div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>This week</CardTitle></CardHeader>
            <CardContent>
              <div className="font-display text-3xl font-semibold">{totalThisWeek.toFixed(2)}h</div>
              <p className="text-sm text-muted-foreground">Logged across last 7 days.</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader><CardTitle>Recent entries</CardTitle></CardHeader>
          <CardContent>
            {isLoading ? <p className="text-sm text-muted-foreground">Loading…</p> : (data?.entries ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground">No entries yet.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead><TableHead>Project</TableHead><TableHead>Job</TableHead>
                    <TableHead>Hours</TableHead><TableHead>Billable</TableHead><TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.entries.map((e: any) => (
                    <TableRow key={e.id}>
                      <TableCell>{e.work_date}</TableCell>
                      <TableCell>{e.projects?.name}</TableCell>
                      <TableCell>{e.jobs?.name ?? "—"}</TableCell>
                      <TableCell>{Number(e.hours).toFixed(2)}</TableCell>
                      <TableCell>{e.billable ? <Badge>Billable</Badge> : <Badge variant="secondary">Non</Badge>}</TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="ghost" onClick={() => setAllocFor({ id: e.id, hours: Number(e.hours) })}>
                          <Layers className="h-4 w-4 mr-1" /> Allocate
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => remove(e.id)}><Trash2 className="h-4 w-4" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Send className="h-4 w-4" /> Submit for approval</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-4">
            <div>
              <Label className="text-xs">Period start</Label>
              <Input type="date" value={periodStart} onChange={(e) => setPeriodStart(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">Period end</Label>
              <Input type="date" value={periodEnd} onChange={(e) => setPeriodEnd(e.target.value)} />
            </div>
            <div className="sm:col-span-2">
              <Label className="text-xs">Notes (optional)</Label>
              <Input value={submitNotes} onChange={(e) => setSubmitNotes(e.target.value)} placeholder="Anything your manager should know" />
            </div>
            <div className="sm:col-span-4 flex items-center justify-between gap-3 flex-wrap">
              <p className="text-sm text-muted-foreground">
                {periodHours.toFixed(2)}h in selected period · {periodStart} → {periodEnd}
              </p>
              <Button onClick={submitForApproval} disabled={periodHours <= 0}>
                <Send className="h-4 w-4 mr-2" /> Submit timesheet
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Submission history</CardTitle></CardHeader>
          <CardContent>
            {(sheets?.timesheets ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground">No submitted timesheets yet.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Period</TableHead><TableHead>Hours</TableHead><TableHead>Status</TableHead>
                    <TableHead>Submitted</TableHead><TableHead>Reviewed</TableHead><TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sheets!.timesheets.map((t: any) => (
                    <TableRow key={t.id}>
                      <TableCell className="whitespace-nowrap">{t.period_start} → {t.period_end}</TableCell>
                      <TableCell>{Number(t.total_hours).toFixed(2)}h</TableCell>
                      <TableCell>{statusBadge(t.status)}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{t.submitted_at ? new Date(t.submitted_at).toLocaleString() : "—"}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{t.approved_at ? new Date(t.approved_at).toLocaleString() : "—"}</TableCell>
                      <TableCell className="text-xs">
                        {t.status === "rejected" && t.rejection_reason
                          ? <span className="text-destructive">{t.rejection_reason}</span>
                          : (t.notes ?? "—")}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>



      <TimeEntryAllocationDialog
        open={!!allocFor}
        onOpenChange={(v) => !v && setAllocFor(null)}
        timeEntryId={allocFor?.id ?? null}
        entryHours={allocFor?.hours ?? 0}
        projects={(pd?.projects ?? []).map((p: any) => ({ id: p.id, name: p.name, code: p.code }))}
        jobs={(jd?.jobs ?? []).map((j: any) => ({ id: j.id, name: j.name, project_id: j.project_id }))}
        departments={(dd?.departments ?? []).map((d: any) => ({ id: d.id, name: d.name }))}
      />
    </AppShell>
  );
}
