import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { AppShell } from "@/components/AppShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { CalendarRange, Play, Square, Trash2, Settings, Users } from "lucide-react";
import {
  listCycles, upsertCycle, setCycleStatus, deleteCycle,
  getKpiWeightSettings, updateKpiWeightSettings, getCycleSubmissionStatus,
} from "@/lib/kpi-cycles.functions";
import { AdminGate } from "@/components/AdminGate";
import { ORG_ADMIN_OR_MANAGER } from "@/lib/rbac";

export const Route = createFileRoute("/admin/review-cycles")({
  head: () => ({ meta: [{ title: "KPI review cycles — HRPPL" }] }),
  component: () => (
    <AdminGate allow={ORG_ADMIN_OR_MANAGER}>
      <Page />
    </AdminGate>
  ),
});

function statusBadge(s: string) {
  if (s === "submitted") return <Badge>Submitted</Badge>;
  if (s === "in_progress") return <Badge variant="secondary">In progress</Badge>;
  return <Badge variant="outline">Not started</Badge>;
}

function Page() {
  const { user, roles, loading, rolesLoaded } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const canAccess = roles.includes("org_admin") || roles.includes("super_admin") || roles.includes("manager");
  const listFn = useServerFn(listCycles);
  const upsertFn = useServerFn(upsertCycle);
  const statusFn = useServerFn(setCycleStatus);
  const delFn = useServerFn(deleteCycle);
  const getSettingsFn = useServerFn(getKpiWeightSettings);
  const setSettingsFn = useServerFn(updateKpiWeightSettings);
  const statusListFn = useServerFn(getCycleSubmissionStatus);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
    else if (!loading && user && rolesLoaded && !canAccess) { toast.error("Manager/Admin only"); navigate({ to: "/dashboard" }); }
  }, [loading, user, rolesLoaded, canAccess, navigate]);

  const q = useQuery({ queryKey: ["kpi-cycles"], queryFn: () => listFn({}), enabled: canAccess });
  const settingsQ = useQuery({ queryKey: ["kpi-weight-settings"], queryFn: () => getSettingsFn({}), enabled: canAccess });

  const today = new Date();
  const defaultLabel = `${today.getFullYear()}-Q${Math.floor(today.getMonth() / 3) + 1}`;
  const [label, setLabel] = useState(defaultLabel);
  const [starts, setStarts] = useState("");
  const [ends, setEnds] = useState("");
  const [reminderDays, setReminderDays] = useState<number>(3);

  const [tolerance, setTolerance] = useState<string>("0");
  const [strict, setStrict] = useState<boolean>(true);
  useEffect(() => {
    if (settingsQ.data) {
      setTolerance(String(settingsQ.data.tolerance ?? 0));
      setStrict(Boolean(settingsQ.data.strict ?? true));
    }
  }, [settingsQ.data]);

  const [selectedCycleLabel, setSelectedCycleLabel] = useState<string>("");
  const statusQ = useQuery({
    queryKey: ["kpi-cycle-status", selectedCycleLabel],
    queryFn: () => statusListFn({ data: { cycleLabel: selectedCycleLabel } }),
    enabled: canAccess && !!selectedCycleLabel,
  });

  async function create() {
    if (!label || !starts || !ends) { toast.error("Label, start, end are required"); return; }
    try {
      await upsertFn({ data: { label, starts_on: starts, ends_on: ends, reminder_days_before: reminderDays } });
      toast.success("Cycle created");
      setLabel(""); setStarts(""); setEnds("");
      qc.invalidateQueries({ queryKey: ["kpi-cycles"] });
    } catch (e: any) { toast.error(e?.message ?? "Failed"); }
  }
  async function setStatus(id: string, status: "draft" | "open" | "closed") {
    try {
      const res: any = await statusFn({ data: { id, status } });
      const n = res?.notified ?? 0;
      toast.success(`Cycle ${status}${n ? ` · notified ${n} employee${n === 1 ? "" : "s"}` : ""}`);
      qc.invalidateQueries({ queryKey: ["kpi-cycles"] });
      qc.invalidateQueries({ queryKey: ["kpi-cycle-status"] });
    } catch (e: any) { toast.error(e?.message ?? "Failed"); }
  }
  async function remove(id: string) {
    if (!confirm("Delete this cycle? Submitted scores remain but employees cannot submit against it.")) return;
    try {
      await delFn({ data: { id } });
      toast.success("Deleted");
      qc.invalidateQueries({ queryKey: ["kpi-cycles"] });
    } catch (e: any) { toast.error(e?.message ?? "Failed"); }
  }
  async function saveSettings() {
    const t = Number(tolerance);
    if (Number.isNaN(t) || t < 0 || t > 25) { toast.error("Tolerance must be 0–25"); return; }
    try {
      await setSettingsFn({ data: { tolerance: t, strict } });
      toast.success("Weight rules saved");
      qc.invalidateQueries({ queryKey: ["kpi-weight-settings"] });
    } catch (e: any) { toast.error(e?.message ?? "Failed"); }
  }

  if (loading || !user) return <main className="flex min-h-screen items-center justify-center text-muted-foreground">Loading…</main>;

  const cycles = q.data?.cycles ?? [];

  return (
    <AppShell title="KPI review cycles" subtitle="Open a cycle to allow submissions, close it to lock scoring. Employees are notified automatically.">
      <section className="mx-auto max-w-5xl space-y-6 p-4 md:p-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2"><Settings className="h-5 w-5 text-primary" /><CardTitle>KPI weight rules</CardTitle></div>
            <CardDescription>Block duty saves unless weights sum to 100% (within the allowed tolerance).</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
            <div className="flex items-center gap-3 md:col-span-2">
              <Switch checked={strict} onCheckedChange={setStrict} id="strict" />
              <Label htmlFor="strict">Enforce strictly (block saves outside tolerance)</Label>
            </div>
            <div className="space-y-1"><Label>Tolerance ± (%)</Label>
              <Input type="number" min={0} max={25} step={1} value={tolerance} onChange={(e) => setTolerance(e.target.value)} />
            </div>
            <div><Button onClick={saveSettings}>Save rules</Button></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2"><CalendarRange className="h-5 w-5 text-primary" /><CardTitle>Create cycle</CardTitle></div>
            <CardDescription>Examples: 2026-Q1, 2026 H1, 2026 annual.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-5 gap-3">
            <div className="space-y-1"><Label>Label</Label><Input value={label} onChange={(e) => setLabel(e.target.value)} /></div>
            <div className="space-y-1"><Label>Starts on</Label><Input type="date" value={starts} onChange={(e) => setStarts(e.target.value)} /></div>
            <div className="space-y-1"><Label>Ends on</Label><Input type="date" value={ends} onChange={(e) => setEnds(e.target.value)} /></div>
            <div className="space-y-1"><Label>Remind (days before close)</Label><Input type="number" min={0} max={60} value={reminderDays} onChange={(e) => setReminderDays(Number(e.target.value))} /></div>
            <div className="flex items-end"><Button onClick={create}>Create</Button></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>All cycles</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {cycles.length === 0 && <p className="text-sm text-muted-foreground">No cycles yet.</p>}
            {cycles.map((c: any) => (
              <div key={c.id} className="flex flex-wrap items-center justify-between gap-2 rounded border p-3">
                <div>
                  <div className="font-medium">{c.label} <Badge variant={c.status === "open" ? "default" : c.status === "closed" ? "secondary" : "outline"}>{c.status}</Badge></div>
                  <div className="text-xs text-muted-foreground">
                    {c.starts_on} → {c.ends_on} · reminders {c.reminder_days_before}d before
                    {c.last_reminder_sent_at && ` · last reminder ${new Date(c.last_reminder_sent_at).toLocaleDateString()}`}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost" onClick={() => setSelectedCycleLabel(c.label)}><Users className="h-3 w-3 mr-1" />Submissions</Button>
                  {c.status !== "open" && <Button size="sm" variant="outline" onClick={() => setStatus(c.id, "open")}><Play className="h-3 w-3 mr-1" />Open</Button>}
                  {c.status === "open" && <Button size="sm" variant="outline" onClick={() => setStatus(c.id, "closed")}><Square className="h-3 w-3 mr-1" />Close</Button>}
                  <Button size="sm" variant="ghost" onClick={() => remove(c.id)}><Trash2 className="h-3 w-3" /></Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2"><Users className="h-5 w-5 text-primary" /><CardTitle>Submission status</CardTitle></div>
            <CardDescription>Track who has completed their self-review and manager review for a cycle.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Select value={selectedCycleLabel} onValueChange={setSelectedCycleLabel}>
              <SelectTrigger className="max-w-xs"><SelectValue placeholder="Pick a cycle" /></SelectTrigger>
              <SelectContent>
                {cycles.map((c: any) => <SelectItem key={c.id} value={c.label}>{c.label} · {c.status}</SelectItem>)}
              </SelectContent>
            </Select>
            {selectedCycleLabel && (
              <div className="rounded border">
                <table className="w-full text-sm">
                  <thead className="bg-muted/40 text-left">
                    <tr>
                      <th className="p-2">Employee</th>
                      <th className="p-2">Duties</th>
                      <th className="p-2">Self review</th>
                      <th className="p-2">Manager review</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(statusQ.data?.rows ?? []).length === 0 && (
                      <tr><td colSpan={4} className="p-3 text-center text-muted-foreground">No employees with active duties.</td></tr>
                    )}
                    {(statusQ.data?.rows ?? []).map((r: any) => (
                      <tr key={r.employee_id} className="border-t">
                        <td className="p-2"><div>{r.name || "—"}</div><div className="text-xs text-muted-foreground">{r.email}</div></td>
                        <td className="p-2">{r.total_duties}</td>
                        <td className="p-2">{statusBadge(r.self_status)} <span className="text-xs text-muted-foreground ml-2">{r.self_submitted}/{r.total_duties}</span></td>
                        <td className="p-2">{statusBadge(r.reviewer_status)} <span className="text-xs text-muted-foreground ml-2">{r.reviewer_submitted}/{r.total_duties}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </AppShell>
  );
}
