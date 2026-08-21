import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { listClients, listProjects, upsertProject } from "@/lib/practice.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/practice/projects")({
  head: () => ({ meta: [{ title: "Projects — WorldPay HRMS" }] }),
  component: ProjectsPage,
});

function ProjectsPage() {
  const fetchProjects = useServerFn(listProjects);
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["projects"], queryFn: () => fetchProjects({}) });

  return (
    <AppShell title="Projects" subtitle="Engagements per client">
      <div className="mx-auto w-full max-w-6xl space-y-4 p-4 md:p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">All projects</h2>
          <ProjectDialog onSaved={() => qc.invalidateQueries({ queryKey: ["projects"] })} />
        </div>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : (data?.projects ?? []).length === 0 ? (
          <Card><CardContent className="p-6 text-sm text-muted-foreground">No projects yet.</CardContent></Card>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {data?.projects.map((p: any) => (
              <Link key={p.id} to="/practice/jobs" search={{ project: p.id } as any}>
                <Card className="hover:border-primary/40">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{p.name}</CardTitle>
                      <Badge variant="outline">{p.status}</Badge>
                    </div>
                    <CardDescription>{p.clients?.name ?? "—"}</CardDescription>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">
                    <div>{p.billing_type.replace(/_/g, " ")}</div>
                    {p.hourly_rate && <div>{p.currency_code} {p.hourly_rate}/h</div>}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}

// Stable id per form session, so a double-submit collides on the primary key
// instead of creating a second row (§1 #7). Regenerated each time the dialog
// opens, so the next project is genuinely new.
function newDraftId() {
  return crypto.randomUUID();
}

function ProjectDialog({ onSaved }: { onSaved: () => void }) {
  const [open, setOpen] = useState(false);
  const fetchClients = useServerFn(listClients);
  const { data: cd } = useQuery({ queryKey: ["clients"], queryFn: () => fetchClients({}), enabled: open });
  const save = useServerFn(upsertProject);
  const [saving, setSaving] = useState(false);
  const [draftId, setDraftId] = useState(newDraftId);
  const [form, setForm] = useState<any>({
    client_id: "", name: "", billing_type: "time_and_materials", status: "active",
    hourly_rate: null, currency_code: "", start_date: "", end_date: "",
  });

  function handleOpenChange(next: boolean) {
    if (next) setDraftId(newDraftId());
    setOpen(next);
  }

  async function submit() {
    if (saving) return; // belt to the button's braces
    setSaving(true);
    try {
      await save({ data: { ...form, id: draftId, hourly_rate: form.hourly_rate ? Number(form.hourly_rate) : null } });
      toast.success("Project saved");
      setOpen(false); onSaved();
    } catch (e: any) { toast.error(e?.message ?? "Failed"); }
    finally { setSaving(false); }
  }
  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild><Button>New project</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>New project</DialogTitle></DialogHeader>
        <div className="grid gap-3">
          <div>
            <Label>Client</Label>
            <Select value={form.client_id} onValueChange={(v) => setForm({ ...form, client_id: v })}>
              <SelectTrigger><SelectValue placeholder="Pick client" /></SelectTrigger>
              <SelectContent>{(cd?.clients ?? []).map((c: any) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div><Label>Project name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Billing</Label>
              <Select value={form.billing_type} onValueChange={(v) => setForm({ ...form, billing_type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="time_and_materials">Time & materials</SelectItem>
                  <SelectItem value="fixed">Fixed price</SelectItem>
                  <SelectItem value="retainer">Retainer</SelectItem>
                  <SelectItem value="non_billable">Non-billable</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="on_hold">On hold</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Hourly rate</Label><Input type="number" value={form.hourly_rate ?? ""} onChange={(e) => setForm({ ...form, hourly_rate: e.target.value })} /></div>
            <div><Label>Currency</Label><Input maxLength={3} value={form.currency_code} onChange={(e) => setForm({ ...form, currency_code: e.target.value.toUpperCase() })} /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Start</Label><Input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} /></div>
            <div><Label>End</Label><Input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} /></div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)} disabled={saving}>Cancel</Button>
          <Button onClick={submit} disabled={saving || !form.client_id || !form.name}>
            {saving ? "Saving…" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
