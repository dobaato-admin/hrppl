import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { getRecruitmentJob, moveCandidate, upsertStage, deleteStage, reorderStages } from "@/lib/recruitment.functions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Settings2, Trash2, ArrowUp, ArrowDown, Plus } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/org/recruitment/$jobId")({
  component: JobBoard,
});


function JobBoard() {
  const { jobId } = useParams({ from: "/org/recruitment/$jobId" });
  const get = useServerFn(getRecruitmentJob);
  const move = useServerFn(moveCandidate);
  const upStage = useServerFn(upsertStage);
  const delStage = useServerFn(deleteStage);
  const reorder = useServerFn(reorderStages);
  const [data, setData] = useState<any | null>(null);
  const [dragging, setDragging] = useState<string | null>(null);
  const [stagesOpen, setStagesOpen] = useState(false);
  const [newStageName, setNewStageName] = useState("");

  async function refresh() { const r = await get({ data: { id: jobId } }); setData(r); }
  useEffect(() => { refresh(); }, [jobId]);


  async function onDrop(stageId: string) {
    if (!dragging) return;
    try {
      const stage = data.stages.find((s: any) => s.id === stageId);
      const status = stage?.kind === "hired" ? "hired" : stage?.kind === "rejected" ? "rejected" : "active";
      await move({ data: { candidate_id: dragging, stage_id: stageId, status } });
      setDragging(null);
      await refresh();
    } catch (e: any) { toast.error(e.message); }
  }

  async function addStage() {
    if (!newStageName.trim()) return;
    try {
      await upStage({ data: { job_id: jobId, name: newStageName.trim(), kind: "custom", sort_order: data.stages.length, is_terminal: false } });
      setNewStageName(""); await refresh();
    } catch (e: any) { toast.error(e.message); }
  }
  async function renameStage(s: any, name: string) {
    if (!name.trim() || name === s.name) return;
    try { await upStage({ data: { id: s.id, job_id: jobId, name: name.trim(), kind: s.kind, sort_order: s.sort_order, is_terminal: s.is_terminal } }); await refresh(); }
    catch (e: any) { toast.error(e.message); }
  }
  async function removeStage(id: string) {
    if (!confirm("Delete this stage?")) return;
    try { await delStage({ data: { id } }); await refresh(); }
    catch (e: any) { toast.error(e.message); }
  }
  async function moveStage(idx: number, dir: -1 | 1) {
    const next = [...data.stages];
    const j = idx + dir;
    if (j < 0 || j >= next.length) return;
    [next[idx], next[j]] = [next[j], next[idx]];
    const order = next.map((s: any, i: number) => ({ id: s.id, sort_order: i }));
    try { await reorder({ data: { job_id: jobId, order } }); await refresh(); }
    catch (e: any) { toast.error(e.message); }
  }

  if (!data) return <div className="p-6 text-muted-foreground">Loading…</div>;

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl">{data.job.title}</h2>
          <p className="text-sm text-muted-foreground">{data.job.location ?? "—"} • {data.candidates.length} candidates</p>
        </div>
        <div className="flex gap-2">
          <Badge variant="secondary" className="capitalize">{data.job.status}</Badge>
          <Dialog open={stagesOpen} onOpenChange={setStagesOpen}>
            <DialogTrigger asChild><Button variant="outline" size="sm"><Settings2 className="h-3.5 w-3.5 mr-1" />Edit pipeline</Button></DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader><DialogTitle>Pipeline stages</DialogTitle></DialogHeader>
              <div className="space-y-2 max-h-80 overflow-auto">
                {data.stages.map((s: any, i: number) => (
                  <div key={s.id} className="flex items-center gap-2">
                    <Input defaultValue={s.name} onBlur={(e) => renameStage(s, e.target.value)} className="flex-1" />
                    <Badge variant="outline" className="text-[10px] capitalize">{s.kind}</Badge>
                    <Button size="icon" variant="ghost" onClick={() => moveStage(i, -1)} disabled={i === 0}><ArrowUp className="h-3.5 w-3.5" /></Button>
                    <Button size="icon" variant="ghost" onClick={() => moveStage(i, 1)} disabled={i === data.stages.length - 1}><ArrowDown className="h-3.5 w-3.5" /></Button>
                    <Button size="icon" variant="ghost" onClick={() => removeStage(s.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 pt-2 border-t">
                <Input placeholder="New stage name" value={newStageName} onChange={(e) => setNewStageName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addStage()} />
                <Button onClick={addStage}><Plus className="h-3.5 w-3.5 mr-1" />Add</Button>
              </div>
              <DialogFooter><Button variant="outline" onClick={() => setStagesOpen(false)}>Done</Button></DialogFooter>
            </DialogContent>
          </Dialog>
          <Button asChild variant="outline" size="sm"><Link to="/org/recruitment">All roles</Link></Button>
        </div>
      </div>


      <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${data.stages.length}, minmax(220px, 1fr))` }}>
        {data.stages.map((s: any) => {
          const inStage = data.candidates.filter((c: any) => c.stage_id === s.id);
          return (
            <div key={s.id}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => onDrop(s.id)}
              className="rounded-lg border bg-card/50 p-2 min-h-[400px]">
              <div className="mb-2 flex items-center justify-between px-1">
                <h3 className="text-sm font-medium">{s.name}</h3>
                <Badge variant="outline" className="text-[10px]">{inStage.length}</Badge>
              </div>
              <div className="space-y-2">
                {inStage.map((c: any) => (
                  <Link key={c.id} to="/org/recruitment/candidate/$candidateId" params={{ candidateId: c.id }}>
                    <Card
                      draggable
                      onDragStart={() => setDragging(c.id)}
                      onDragEnd={() => setDragging(null)}
                      className={"cursor-grab hover:shadow-md transition " + (dragging === c.id ? "opacity-50" : "")}>
                      <CardContent className="p-3 space-y-1">
                        <div className="text-sm font-medium">{c.first_name} {c.last_name}</div>
                        {c.current_title && <div className="text-[11px] text-muted-foreground">{c.current_title}{c.current_company ? ` @ ${c.current_company}` : ""}</div>}
                        <div className="text-[10px] text-muted-foreground">{new Date(c.applied_at).toLocaleDateString()}</div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
