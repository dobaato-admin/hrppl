import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { AppShell } from "@/components/AppShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { listEmployeesForDuties } from "@/lib/employee-duties.functions";
import {
  getDutyReview,
  upsertDutyScore,
  exportDutyReviewCsv,
  getDutyReviewExportData,
} from "@/lib/duty-reviews.functions";
import { listCycles } from "@/lib/kpi-cycles.functions";
import { generateDutyReviewPdf } from "@/lib/duty-review-pdf";
import { Target, Download, FileText } from "lucide-react";
import { AdminGate } from "@/components/AdminGate";

export const Route = createFileRoute("/admin/duty-reviews")({
  head: () => ({ meta: [{ title: "Duty-based KPI review — HRPPL" }] }),
  component: () => (
    <AdminGate feature="org.dutyReviews">
      <DutyReviewsPage />
    </AdminGate>
  ),
});

function defaultCycleLabel() {
  const d = new Date();
  const q = Math.floor(d.getMonth() / 3) + 1;
  return `${d.getFullYear()}-Q${q}`;
}

function DutyReviewsPage() {
  const { user, roles, loading, rolesLoaded } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const canAccess =
    roles.includes("org_admin") || roles.includes("super_admin") || roles.includes("manager");
  const empListFn = useServerFn(listEmployeesForDuties);
  const reviewFn = useServerFn(getDutyReview);
  const saveFn = useServerFn(upsertDutyScore);
  const cyclesFn = useServerFn(listCycles);
  const exportFn = useServerFn(exportDutyReviewCsv);
  const exportDataFn = useServerFn(getDutyReviewExportData);

  const [employeeId, setEmployeeId] = useState<string>("");
  const [cycleLabel, setCycleLabel] = useState<string>(defaultCycleLabel());

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
    else if (!loading && user && rolesLoaded && !canAccess) {
      toast.error("Manager/Admin only");
      navigate({ to: "/dashboard" });
    }
  }, [loading, user, rolesLoaded, canAccess, navigate]);

  const empQ = useQuery({
    queryKey: ["duty-review-employees"],
    queryFn: () => empListFn(),
    enabled: canAccess,
  });

  const cyclesQ = useQuery({
    queryKey: ["kpi-cycles-for-reviews"],
    queryFn: () => cyclesFn({}),
    enabled: canAccess,
  });

  async function downloadCsv() {
    try {
      const res: any = await exportFn({ data: { cycleLabel } });
      const blob = new Blob([res.csv], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = res.filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e: any) {
      toast.error(e?.message ?? "Export failed");
    }
  }

  async function downloadPdf() {
    try {
      const payload: any = await exportDataFn({ data: { cycleLabel } });
      const blob = generateDutyReviewPdf(payload);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `duty-review-${cycleLabel}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e: any) {
      toast.error(e?.message ?? "PDF export failed");
    }
  }

  const reviewQ = useQuery({
    queryKey: ["duty-review", employeeId, cycleLabel],
    queryFn: () => reviewFn({ data: { employeeId, cycleLabel } }),
    enabled: canAccess && !!employeeId && !!cycleLabel,
  });

  const [drafts, setDrafts] = useState<Record<string, { score: string; comments: string }>>({});
  useEffect(() => {
    if (!reviewQ.data) return;
    const map: Record<string, { score: string; comments: string }> = {};
    for (const it of reviewQ.data.items) {
      map[it.duty.id] = {
        score: it.score == null ? "" : String(it.score),
        comments: it.comments ?? "",
      };
    }
    setDrafts(map);
  }, [reviewQ.data]);

  const liveFinal = useMemo(() => {
    if (!reviewQ.data) return null;
    let weighted = 0,
      totalW = 0;
    for (const it of reviewQ.data.items) {
      const w = Number(it.duty.weight || 0);
      totalW += w;
      const v = Number(drafts[it.duty.id]?.score);
      if (!Number.isNaN(v) && drafts[it.duty.id]?.score !== "") weighted += v * w;
    }
    return totalW > 0 ? weighted / totalW : null;
  }, [reviewQ.data, drafts]);

  async function saveOne(dutyId: string) {
    const d = drafts[dutyId];
    if (!d) return;
    const score = Number(d.score);
    if (Number.isNaN(score) || score < 0 || score > 100) {
      toast.error("Score must be 0–100");
      return;
    }
    try {
      await saveFn({ data: { employeeId, dutyId, cycleLabel, score, comments: d.comments || "" } });
      toast.success("Saved");
      qc.invalidateQueries({ queryKey: ["duty-review", employeeId, cycleLabel] });
    } catch (e: any) {
      toast.error(e?.message ?? "Failed");
    }
  }

  async function saveAll() {
    if (!reviewQ.data) return;
    try {
      for (const it of reviewQ.data.items) {
        const d = drafts[it.duty.id];
        if (!d || d.score === "") continue;
        const score = Number(d.score);
        if (Number.isNaN(score) || score < 0 || score > 100) continue;
        await saveFn({
          data: { employeeId, dutyId: it.duty.id, cycleLabel, score, comments: d.comments || "" },
        });
      }
      toast.success("All scores saved");
      qc.invalidateQueries({ queryKey: ["duty-review", employeeId, cycleLabel] });
    } catch (e: any) {
      toast.error(e?.message ?? "Failed");
    }
  }

  if (loading || !user)
    return (
      <main className="flex min-h-screen items-center justify-center text-muted-foreground">
        Loading…
      </main>
    );

  return (
    <AppShell
      title="Duty-based KPI review"
      subtitle="Score each duty out of 100. Final rating is weighted by KPI weight."
    >
      <section className="mx-auto max-w-5xl space-y-6 p-4 md:p-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              <CardTitle>Pick employee &amp; cycle</CardTitle>
            </div>
            <CardDescription>
              Cycle label is free-form (e.g. 2026-Q1, 2026 H1, 2026 annual).
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <div className="space-y-1">
              <Label>Employee</Label>
              <Select value={employeeId} onValueChange={setEmployeeId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                  {(empQ.data?.employees ?? []).map((e: any) => (
                    <SelectItem key={e.id} value={e.id}>
                      {e.first_name} {e.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Cycle</Label>
              <Select value={cycleLabel} onValueChange={setCycleLabel}>
                <SelectTrigger>
                  <SelectValue placeholder="Select cycle" />
                </SelectTrigger>
                <SelectContent>
                  {(cyclesQ.data?.cycles ?? []).map((c: any) => (
                    <SelectItem key={c.id} value={c.label}>
                      {c.label} · {c.status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-wrap items-end justify-end gap-2">
              <Button variant="outline" onClick={downloadCsv} disabled={!cycleLabel}>
                <Download className="h-4 w-4 mr-1" />
                Export CSV
              </Button>
              <Button variant="outline" onClick={downloadPdf} disabled={!cycleLabel}>
                <FileText className="h-4 w-4 mr-1" />
                Export PDF
              </Button>
              <Button onClick={saveAll} disabled={!reviewQ.data || reviewQ.data.items.length === 0}>
                Save all
              </Button>
            </div>
          </CardContent>
        </Card>

        {employeeId && reviewQ.data && (
          <Card>
            <CardHeader>
              <CardTitle>
                {reviewQ.data.employee.first_name} {reviewQ.data.employee.last_name}
              </CardTitle>
              <CardDescription>
                {reviewQ.data.items.length} duties · Total weight {reviewQ.data.totalWeight}%
                {liveFinal != null && (
                  <>
                    {" "}
                    ·{" "}
                    <Badge
                      variant={
                        liveFinal >= 70 ? "default" : liveFinal >= 50 ? "secondary" : "outline"
                      }
                    >
                      Final {liveFinal.toFixed(1)}/100
                    </Badge>
                  </>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {reviewQ.data.items.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  This employee has no active duties yet. Add them from Duties &amp;
                  responsibilities.
                </p>
              )}
              {reviewQ.data.items.map((it: any) => (
                <div key={it.duty.id} className="rounded border p-3 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-medium">
                        {it.duty.title}{" "}
                        <Badge variant="outline" className="ml-1">
                          {it.duty.weight}%
                        </Badge>
                      </div>
                      {it.duty.kpi_target && (
                        <div className="text-xs text-muted-foreground">
                          Target: {it.duty.kpi_target}
                        </div>
                      )}
                      {it.duty.description && (
                        <div className="text-xs text-muted-foreground">{it.duty.description}</div>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-[120px_1fr_auto] gap-2 items-start">
                    <div className="space-y-1">
                      <Label className="text-xs">Score 0–100</Label>
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        value={drafts[it.duty.id]?.score ?? ""}
                        onChange={(e) =>
                          setDrafts({
                            ...drafts,
                            [it.duty.id]: {
                              ...(drafts[it.duty.id] ?? { score: "", comments: "" }),
                              score: e.target.value,
                            },
                          })
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Comments</Label>
                      <Textarea
                        rows={2}
                        value={drafts[it.duty.id]?.comments ?? ""}
                        onChange={(e) =>
                          setDrafts({
                            ...drafts,
                            [it.duty.id]: {
                              ...(drafts[it.duty.id] ?? { score: "", comments: "" }),
                              comments: e.target.value,
                            },
                          })
                        }
                      />
                    </div>
                    <div className="pt-5">
                      <Button size="sm" variant="outline" onClick={() => saveOne(it.duty.id)}>
                        Save
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </section>
    </AppShell>
  );
}
