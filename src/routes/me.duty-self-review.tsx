import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Target } from "lucide-react";
import { toast } from "sonner";
import { listOpenCyclesForMe } from "@/lib/kpi-cycles.functions";
import { getMyDutyReview, submitMyDutyScore } from "@/lib/duty-reviews.functions";

export const Route = createFileRoute("/me/duty-self-review")({
  head: () => ({ meta: [{ title: "My duty self-review — HRPPL" }] }),
  component: Page,
});

function Page() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const cyclesFn = useServerFn(listOpenCyclesForMe);
  const reviewFn = useServerFn(getMyDutyReview);
  const submitFn = useServerFn(submitMyDutyScore);

  useEffect(() => { if (!loading && !user) navigate({ to: "/auth" }); }, [loading, user, navigate]);

  const cyclesQ = useQuery({ queryKey: ["my-open-cycles"], queryFn: () => cyclesFn({}), enabled: !!user });
  const [cycleLabel, setCycleLabel] = useState<string>("");
  useEffect(() => {
    if (!cycleLabel && cyclesQ.data?.cycles?.[0]) setCycleLabel(cyclesQ.data.cycles[0].label);
  }, [cyclesQ.data, cycleLabel]);

  const reviewQ = useQuery({
    queryKey: ["my-duty-review", cycleLabel],
    queryFn: () => reviewFn({ data: { cycleLabel } }),
    enabled: !!user && !!cycleLabel,
  });

  const [drafts, setDrafts] = useState<Record<string, { score: string; comments: string }>>({});
  useEffect(() => {
    if (!reviewQ.data) return;
    const m: Record<string, any> = {};
    for (const it of reviewQ.data.items) m[it.duty.id] = { score: it.score == null ? "" : String(it.score), comments: it.comments ?? "" };
    setDrafts(m);
  }, [reviewQ.data]);

  const liveFinal = useMemo(() => {
    if (!reviewQ.data) return null;
    let w = 0, sum = 0;
    for (const it of reviewQ.data.items) {
      const ww = Number(it.duty.weight || 0);
      w += ww;
      const v = Number(drafts[it.duty.id]?.score);
      if (drafts[it.duty.id]?.score !== "" && !Number.isNaN(v)) sum += v * ww;
    }
    return w > 0 ? sum / w : null;
  }, [reviewQ.data, drafts]);

  async function save(dutyId: string) {
    const d = drafts[dutyId]; if (!d) return;
    const score = Number(d.score);
    if (Number.isNaN(score) || score < 0 || score > 100) { toast.error("Score 0–100"); return; }
    try {
      await submitFn({ data: { dutyId, cycleLabel, score, comments: d.comments || "" } });
      toast.success("Saved");
      qc.invalidateQueries({ queryKey: ["my-duty-review", cycleLabel] });
    } catch (e: any) { toast.error(e?.message ?? "Failed"); }
  }

  if (loading || !user) return <main className="flex min-h-screen items-center justify-center text-muted-foreground">Loading…</main>;
  const openCycles = cyclesQ.data?.cycles ?? [];

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <Target className="h-5 w-5 text-primary" />
            <div>
              <h1 className="text-xl font-semibold">My duty self-review</h1>
              <p className="text-xs text-muted-foreground">Score yourself against your duties. You can only submit during an open review cycle.</p>
            </div>
          </div>
        </div>
      </header>

      <section className="mx-auto grid max-w-5xl gap-4 px-6 py-8">
        {openCycles.length === 0 ? (
          <Card><CardContent className="py-8 text-center text-sm text-muted-foreground">No open review cycles right now. Check back when your admin opens one.</CardContent></Card>
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Cycle</CardTitle>
                <CardDescription>Pick the active cycle to submit self-scores for.</CardDescription>
              </CardHeader>
              <CardContent>
                <Select value={cycleLabel} onValueChange={setCycleLabel}>
                  <SelectTrigger className="max-w-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {openCycles.map((c: any) => (
                      <SelectItem key={c.id} value={c.label}>{c.label} ({c.starts_on} → {c.ends_on})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {liveFinal != null && (
                  <div className="mt-3"><Badge variant={liveFinal >= 70 ? "default" : "secondary"}>Self total {liveFinal.toFixed(1)}/100</Badge></div>
                )}
              </CardContent>
            </Card>

            {(reviewQ.data?.items ?? []).length === 0 && (
              <Card><CardContent className="py-8 text-center text-sm text-muted-foreground">No active duties assigned yet.</CardContent></Card>
            )}
            {(reviewQ.data?.items ?? []).map((it: any) => (
              <Card key={it.duty.id}>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center justify-between text-base">
                    <span>{it.duty.title}</span>
                    <Badge variant="outline">{Number(it.duty.weight).toFixed(0)}% KPI</Badge>
                  </CardTitle>
                  {it.duty.kpi_target && <CardDescription>Target: {it.duty.kpi_target}</CardDescription>}
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-[120px_1fr_auto] gap-2 items-start">
                  <div className="space-y-1">
                    <Label className="text-xs">Self score 0–100</Label>
                    <Input type="number" min={0} max={100} value={drafts[it.duty.id]?.score ?? ""}
                      onChange={(e) => setDrafts({ ...drafts, [it.duty.id]: { ...(drafts[it.duty.id] ?? { score: "", comments: "" }), score: e.target.value } })} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">My notes</Label>
                    <Textarea rows={2} value={drafts[it.duty.id]?.comments ?? ""}
                      onChange={(e) => setDrafts({ ...drafts, [it.duty.id]: { ...(drafts[it.duty.id] ?? { score: "", comments: "" }), comments: e.target.value } })} />
                  </div>
                  <div className="pt-5"><Button size="sm" onClick={() => save(it.duty.id)}>Submit</Button></div>
                </CardContent>
              </Card>
            ))}
          </>
        )}
      </section>
    </main>
  );
}
