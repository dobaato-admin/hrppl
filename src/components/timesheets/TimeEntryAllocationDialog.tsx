import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus } from "lucide-react";
import { toast } from "sonner";
import { listAllocationsForEntry, saveAllocations } from "@/lib/timesheet-allocations.functions";

interface AllocationRow {
  id?: string;
  project_id?: string | null;
  job_id?: string | null;
  department_id?: string | null;
  cost_centre_code?: string | null;
  percentage: number;
  hours: number;
  notes?: string | null;
}

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  timeEntryId: string | null;
  entryHours: number;
  projects: Array<{ id: string; name: string; code?: string | null }>;
  jobs: Array<{ id: string; name: string; project_id: string }>;
  departments: Array<{ id: string; name: string }>;
}

export function TimeEntryAllocationDialog({
  open, onOpenChange, timeEntryId, entryHours, projects, jobs, departments,
}: Props) {
  const fetchAllocs = useServerFn(listAllocationsForEntry);
  const save = useServerFn(saveAllocations);
  const qc = useQueryClient();
  const [rows, setRows] = useState<AllocationRow[]>([]);
  const [busy, setBusy] = useState(false);

  const { data } = useQuery({
    queryKey: ["time-entry-allocations", timeEntryId],
    queryFn: () => (timeEntryId ? fetchAllocs({ data: { time_entry_id: timeEntryId } }) : Promise.resolve({ allocations: [] })),
    enabled: !!timeEntryId && open,
  });

  useEffect(() => {
    if (!open || !data) return;
    if ((data.allocations ?? []).length === 0) {
      setRows([{ percentage: 100, hours: entryHours, project_id: null, department_id: null }]);
    } else {
      setRows(data.allocations.map((a: any) => ({
        id: a.id,
        project_id: a.project_id,
        job_id: a.job_id,
        department_id: a.department_id,
        cost_centre_code: a.cost_centre_code,
        percentage: Number(a.percentage),
        hours: Number(a.hours),
        notes: a.notes,
      })));
    }
  }, [open, data, entryHours]);

  const totalPct = rows.reduce((s, r) => s + Number(r.percentage || 0), 0);
  const totalHrs = rows.reduce((s, r) => s + Number(r.hours || 0), 0);
  const pctOk = Math.abs(totalPct - 100) < 0.01;
  const hrsOk = Math.abs(totalHrs - entryHours) < 0.01;

  function update(i: number, patch: Partial<AllocationRow>) {
    setRows((rs) => {
      const next = [...rs];
      next[i] = { ...next[i], ...patch };
      if (patch.percentage !== undefined) {
        next[i].hours = Number(((patch.percentage / 100) * entryHours).toFixed(2));
      } else if (patch.hours !== undefined && entryHours > 0) {
        next[i].percentage = Number(((patch.hours / entryHours) * 100).toFixed(3));
      }
      return next;
    });
  }

  function addRow() {
    const remaining = Math.max(0, 100 - totalPct);
    setRows((rs) => [...rs, { percentage: remaining, hours: Number(((remaining / 100) * entryHours).toFixed(2)) }]);
  }

  function removeRow(i: number) {
    setRows((rs) => rs.filter((_, idx) => idx !== i));
  }

  function splitEvenly() {
    if (rows.length === 0) return;
    const pct = Number((100 / rows.length).toFixed(3));
    const hrs = Number((entryHours / rows.length).toFixed(2));
    setRows((rs) => rs.map((r) => ({ ...r, percentage: pct, hours: hrs })));
  }

  async function onSave() {
    if (!timeEntryId) return;
    if (!pctOk) return toast.error(`Percentages must total 100% (currently ${totalPct.toFixed(2)}%)`);
    setBusy(true);
    try {
      await save({
        data: {
          time_entry_id: timeEntryId,
          allocations: rows.map((r) => ({
            project_id: r.project_id || null,
            job_id: r.job_id || null,
            department_id: r.department_id || null,
            cost_centre_code: r.cost_centre_code || null,
            percentage: Number(r.percentage),
            hours: Number(r.hours),
            notes: r.notes || null,
          })),
        },
      });
      qc.invalidateQueries({ queryKey: ["time-entry-allocations", timeEntryId] });
      toast.success("Allocations saved");
      onOpenChange(false);
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to save");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Allocate time across cost-centres</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <div>Entry total: <span className="font-medium">{entryHours.toFixed(2)} h</span></div>
            <div className="flex gap-2">
              <Badge variant={pctOk ? "default" : "destructive"}>{totalPct.toFixed(2)}%</Badge>
              <Badge variant={hrsOk ? "default" : "secondary"}>{totalHrs.toFixed(2)} h</Badge>
              <Button size="sm" variant="ghost" onClick={splitEvenly} disabled={!rows.length}>Split evenly</Button>
              <Button size="sm" variant="outline" onClick={addRow}><Plus className="h-3 w-3 mr-1" />Row</Button>
            </div>
          </div>

          <div className="space-y-2 max-h-[55vh] overflow-y-auto pr-1">
            {rows.map((r, i) => {
              const jobsForRow = jobs.filter((j) => r.project_id && j.project_id === r.project_id);
              return (
                <div key={i} className="grid grid-cols-12 gap-2 items-end rounded-md border p-2">
                  <div className="col-span-3">
                    <Label className="text-xs">Project</Label>
                    <Select value={r.project_id || "none"} onValueChange={(v) => update(i, { project_id: v === "none" ? null : v, job_id: null })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">—</SelectItem>
                        {projects.map((p) => (<SelectItem key={p.id} value={p.id}>{p.code ? `${p.code} · ` : ""}{p.name}</SelectItem>))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2">
                    <Label className="text-xs">Job</Label>
                    <Select value={r.job_id || "none"} onValueChange={(v) => update(i, { job_id: v === "none" ? null : v })} disabled={!r.project_id}>
                      <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">—</SelectItem>
                        {jobsForRow.map((j) => (<SelectItem key={j.id} value={j.id}>{j.name}</SelectItem>))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2">
                    <Label className="text-xs">Cost centre</Label>
                    <Select value={r.department_id || "none"} onValueChange={(v) => update(i, { department_id: v === "none" ? null : v })}>
                      <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">—</SelectItem>
                        {departments.map((d) => (<SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-1">
                    <Label className="text-xs">Code</Label>
                    <Input value={r.cost_centre_code || ""} onChange={(e) => update(i, { cost_centre_code: e.target.value })} />
                  </div>
                  <div className="col-span-1">
                    <Label className="text-xs">%</Label>
                    <Input type="number" min={0} max={100} step={0.1} value={r.percentage}
                      onChange={(e) => update(i, { percentage: Number(e.target.value || 0) })} />
                  </div>
                  <div className="col-span-2">
                    <Label className="text-xs">Hours</Label>
                    <Input type="number" min={0} step={0.25} value={r.hours}
                      onChange={(e) => update(i, { hours: Number(e.target.value || 0) })} />
                  </div>
                  <div className="col-span-1 text-right">
                    <Button size="icon" variant="ghost" onClick={() => removeRow(i)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>
              );
            })}
            {rows.length === 0 && <p className="text-sm text-muted-foreground">No allocations. Add a row to split this entry.</p>}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>Cancel</Button>
          <Button onClick={onSave} disabled={busy || !pctOk}>{busy ? "Saving…" : "Save allocations"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
