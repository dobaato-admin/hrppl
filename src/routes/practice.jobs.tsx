import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { z } from "zod";
import { AppShell } from "@/components/AppShell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { listJobs, listProjects, upsertJob } from "@/lib/practice.functions";
import { toast } from "sonner";

const searchSchema = z.object({ project: z.string().uuid().optional() });

export const Route = createFileRoute("/practice/jobs")({
  validateSearch: (s) => searchSchema.parse(s),
  head: () => ({ meta: [{ title: "Jobs — WorldPay HRMS" }] }),
  component: JobsPage,
});

const STATUS_TONE: Record<string, string> = {
  open: "bg-status-pending text-status-pending-foreground",
  in_progress: "bg-status-working text-status-working-foreground",
  review: "bg-status-info text-status-info-foreground",
  completed: "bg-status-done text-status-done-foreground",
  cancelled: "bg-muted text-muted-foreground",
};

function JobsPage() {
  const { project } = Route.useSearch();
  const fetchJobs = useServerFn(listJobs);
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["jobs", project ?? "all"],
    queryFn: () => fetchJobs({ data: project ? { project_id: project } : {} }),
  });

  return (
    <AppShell title="Jobs" subtitle={project ? "Filtered to project" : "All jobs across projects"}>
      <div className="mx-auto w-full max-w-6xl space-y-4 p-4 md:p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Jobs</h2>
          <JobDialog onSaved={() => qc.invalidateQueries({ queryKey: ["jobs"] })} defaultProject={project} />
        </div>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : (data?.jobs ?? []).length === 0 ? (
          <Card><CardContent className="p-6 text-sm text-muted-foreground">No jobs yet.</CardContent></Card>
        ) : (
          <div className="space-y-2">
            {data?.jobs.map((j: any) => (
              <Card key={j.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <CardTitle className="text-base">{j.name}</CardTitle>
                      <CardDescription>
                        {j.projects?.clients?.name} · {j.projects?.name}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={STATUS_TONE[j.status] ?? ""}>{j.status.replace(/_/g, " ")}</Badge>
                      <Badge variant="outline">{j.priority}</Badge>
                    </div>
                  </div>
                </CardHeader>
                {(j.due_date || j.estimated_hours) && (
                  <CardContent className="text-sm text-muted-foreground">
                    {j.due_date && <span>Due {j.due_date} · </span>}
                    {j.estimated_hours && <span>{j.estimated_hours}h estimated</span>}
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}

// Stable id per form session, so a double-submit collides on the primary key
// instead of creating a second row (§1 #7).
function newDraftId() {
  return crypto.randomUUID();
}

function JobDialog({ onSaved, defaultProject }: { onSaved: () => void; defaultProject?: string }) {
  const [open, setOpen] = useState(false);
  const fetchProjects = useServerFn(listProjects);
  const { data: pd } = useQuery({ queryKey: ["projects"], queryFn: () => fetchProjects({}), enabled: open });
  const save = useServerFn(upsertJob);
  const [saving, setSaving] = useState(false);
  const [draftId, setDraftId] = useState(newDraftId);
  const [form, setForm] = useState<any>({
    project_id: defaultProject ?? "", name: "", status: "open", priority: "normal",
    due_date: "", estimated_hours: null,
  });

  function handleOpenChange(next: boolean) {
    if (next) setDraftId(newDraftId());
    setOpen(next);
  }

  async function submit() {
    if (saving) return; // belt to the button's braces
    setSaving(true);
    try {
      await save({ data: { ...form, id: draftId, estimated_hours: form.estimated_hours ? Number(form.estimated_hours) : null } });
      toast.success("Job saved"); setOpen(false); onSaved();
    } catch (e: any) { toast.error(e?.message ?? "Failed"); }
    finally { setSaving(false); }
  }
  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild><Button>New job</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>New job</DialogTitle></DialogHeader>
        <div className="grid gap-3">
          <div>
            <Label>Project</Label>
            <Select value={form.project_id} onValueChange={(v) => setForm({ ...form, project_id: v })}>
              <SelectTrigger><SelectValue placeholder="Pick project" /></SelectTrigger>
              <SelectContent>{(pd?.projects ?? []).map((p: any) => <SelectItem key={p.id} value={p.id}>{p.clients?.name} — {p.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in_progress">In progress</SelectItem>
                  <SelectItem value="review">Review</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Priority</Label>
              <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Due date</Label><Input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} /></div>
            <div><Label>Estimated hours</Label><Input type="number" value={form.estimated_hours ?? ""} onChange={(e) => setForm({ ...form, estimated_hours: e.target.value })} /></div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)} disabled={saving}>Cancel</Button>
          <Button onClick={submit} disabled={saving || !form.project_id || !form.name}>
            {saving ? "Saving…" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
