import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { EvidenceUploader, type EvidenceItem } from "@/components/performance/EvidenceUploader";
import {
  listMyReviewInstances, submitReviewInstance, resubmitReviewInstance, listInstanceVersions,
} from "@/lib/review-instances.functions";

export const Route = createFileRoute("/me/reviews")({
  head: () => ({ meta: [{ title: "My scorecards — WorldPay HRMS" }] }),
  errorComponent: ({ error, reset }) => (
    <main className="p-6 text-sm text-destructive">
      <p>Couldn't load scorecards: {error.message}</p>
      <Button size="sm" variant="outline" onClick={reset} className="mt-2">Retry</Button>
    </main>
  ),
  notFoundComponent: () => <main className="p-6">Not found.</main>,
  component: MyReviewsPage,
});

interface Instance {
  id: string; template_id: string; item_id: string;
  period_label: string; scheduled_for: string; due_date?: string | null;
  status: "pending" | "submitted" | "approved" | "rejected";
  score: any; evidence: EvidenceItem[];
  reviewer_comments: string | null; submitted_at: string | null;
  version?: number;
}
interface Template {
  id: string; name: string;
  scale_min: number; scale_max: number; scale_labels: string[];
  competencies: any[];
}

interface ValidationDetails {
  missingTypes: string[]; minCount: number; haveCount: number;
  invalidUrls: { index: number; name: string }[];
}

function MyReviewsPage() {
  const list = useServerFn(listMyReviewInstances);
  const submit = useServerFn(submitReviewInstance);
  const resubmit = useServerFn(resubmitReviewInstance);
  const versionsFn = useServerFn(listInstanceVersions);
  const [instances, setInstances] = useState<Instance[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [editing, setEditing] = useState<Instance | null>(null);
  const [scoreDraft, setScoreDraft] = useState<string>("");
  const [comments, setComments] = useState("");
  const [evidence, setEvidence] = useState<EvidenceItem[]>([]);
  const [busy, setBusy] = useState(false);
  const [tab, setTab] = useState("pending");
  const [validationErr, setValidationErr] = useState<ValidationDetails | null>(null);
  const [versions, setVersions] = useState<any[]>([]);

  const load = async () => {
    try {
      const r = await list({ data: { status: "all" } });
      setInstances(r.instances as unknown as Instance[]);
      setTemplates(r.templates as unknown as Template[]);
    } catch (e: any) { toast.error(e.message); }
  };
  useEffect(() => { load(); }, []);

  const tplById = useMemo(() => Object.fromEntries(templates.map((t) => [t.id, t])), [templates]);
  // Tolerates null: the scorecard dialog is rendered before `editing` is set,
  // so SSR called this with null and threw on inst.template_id.
  const itemOf = (inst: Instance | null | undefined) =>
    inst ? tplById[inst.template_id]?.competencies?.find((c: any) => c.id === inst.item_id) : undefined;

  async function openSubmit(inst: Instance) {
    setEditing(inst);
    setScoreDraft(inst.score == null ? "" : String(inst.score));
    setComments(inst.reviewer_comments ?? "");
    setEvidence(inst.evidence ?? []);
    setValidationErr(null);
    try {
      const r = await versionsFn({ data: { instanceId: inst.id } });
      setVersions(r.versions ?? []);
    } catch { setVersions([]); }
  }

  async function save() {
    if (!editing) return;
    const comp = itemOf(editing);
    setBusy(true);
    setValidationErr(null);
    try {
      let parsedScore: any = scoreDraft;
      if (comp?.type === "yes_no") parsedScore = scoreDraft === "yes";
      else if (["number","percentage","currency","scale","rating","range"].includes(comp?.type)) {
        const n = Number(scoreDraft);
        if (Number.isNaN(n)) throw new Error("Score must be a number");
        if (comp?.min != null && n < Number(comp.min)) throw new Error(`Must be ≥ ${comp.min}`);
        if (comp?.max != null && n > Number(comp.max)) throw new Error(`Must be ≤ ${comp.max}`);
        parsedScore = n;
      }
      const fn = editing.status === "rejected" ? resubmit : submit;
      await fn({ data: {
        id: editing.id, score: parsedScore, evidence, comments: comments || undefined,
      } });
      toast.success(editing.status === "rejected" ? "Scorecard resubmitted" : "Scorecard submitted");
      setEditing(null); await load();
    } catch (e: any) {
      const v = e?.validation as ValidationDetails | undefined;
      if (v) setValidationErr(v);
      toast.error(e.message);
    } finally { setBusy(false); }
  }

  const filtered = (status: string) => instances.filter((i) => status === "all" || i.status === status);

  const StatusBadge = ({ s }: { s: Instance["status"] }) => {
    const map: Record<string, "secondary"|"default"|"destructive"|"outline"> = {
      pending: "outline", submitted: "secondary", approved: "default", rejected: "destructive",
    };
    return <Badge variant={map[s]}>{s}</Badge>;
  };

  function renderRow(inst: Instance) {
    const tpl = tplById[inst.template_id];
    const comp = itemOf(inst);
    const due = inst.due_date ?? inst.scheduled_for;
    const overdue = inst.status === "pending" && due < new Date().toISOString().slice(0, 10);
    return (
      <TableRow key={inst.id}>
        <TableCell>{tpl?.name ?? "—"}</TableCell>
        <TableCell className="font-medium">{comp?.label ?? inst.item_id}{(inst.version ?? 1) > 1 && <Badge variant="outline" className="ml-2">v{inst.version}</Badge>}</TableCell>
        <TableCell>{inst.period_label}</TableCell>
        <TableCell className={overdue ? "text-destructive font-medium" : ""}>{due}{overdue ? " (overdue)" : ""}</TableCell>
        <TableCell><StatusBadge s={inst.status} /></TableCell>
        <TableCell className="text-right">
          {inst.status === "rejected" ? (
            <Button size="sm" onClick={() => openSubmit(inst)}>Edit & resubmit</Button>
          ) : inst.status === "pending" ? (
            <Button size="sm" onClick={() => openSubmit(inst)}>Fill scorecard</Button>
          ) : (
            <Button size="sm" variant="outline" onClick={() => openSubmit(inst)}>View</Button>
          )}
        </TableCell>
      </TableRow>
    );
  }

  return (
    <AppShell title="My scorecards" subtitle="KPI / KRA / 360 items scheduled for you">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base">Scheduled scorecards</CardTitle>
            <CardDescription>Submit evidence for each KPI item your admin has scheduled.</CardDescription>
          </div>
          <Link to="/me/timeline"><Button size="sm" variant="outline">Timeline</Button></Link>
        </CardHeader>
        <CardContent>
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList>
              <TabsTrigger value="pending">Pending ({filtered("pending").length})</TabsTrigger>
              <TabsTrigger value="submitted">Submitted ({filtered("submitted").length})</TabsTrigger>
              <TabsTrigger value="approved">Approved ({filtered("approved").length})</TabsTrigger>
              <TabsTrigger value="rejected">Rejected ({filtered("rejected").length})</TabsTrigger>
              <TabsTrigger value="all">All ({instances.length})</TabsTrigger>
            </TabsList>
            {["pending","submitted","approved","rejected","all"].map((s) => (
              <TabsContent key={s} value={s}>
                {filtered(s).length === 0 ? (
                  <p className="py-6 text-center text-sm text-muted-foreground">Nothing here.</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Template</TableHead>
                        <TableHead>Item</TableHead>
                        <TableHead>Period</TableHead>
                        <TableHead>Due</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>{filtered(s).map(renderRow)}</TableBody>
                  </Table>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{itemOf(editing)?.label ?? "Scorecard"}</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="space-y-4">
              {itemOf(editing)?.description && (
                <p className="text-sm text-muted-foreground">{itemOf(editing)?.description}</p>
              )}
              <ScoreField comp={itemOf(editing)} value={scoreDraft} onChange={setScoreDraft}
                disabled={editing.status === "submitted" || editing.status === "approved"} />
              <div>
                <label className="text-sm font-medium">Evidence</label>
                <div className="mt-1">
                  <EvidenceUploader
                    value={evidence} onChange={setEvidence}
                    allowedTypes={itemOf(editing)?.evidenceTypes ?? ["document","url"]}
                    requiredTypes={itemOf(editing)?.requiredEvidenceTypes ?? []}
                    minCount={itemOf(editing)?.minEvidenceCount ?? 0}
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Notes</label>
                <Textarea value={comments} onChange={(e) => setComments(e.target.value)}
                  placeholder="Add context for your reviewer…" />
              </div>
              {editing.status === "rejected" && editing.reviewer_comments && (
                <div className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm">
                  <p className="font-medium text-destructive">Reviewer feedback</p>
                  <p className="mt-1 whitespace-pre-wrap">{editing.reviewer_comments}</p>
                </div>
              )}
              {validationErr && (
                <div className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-xs space-y-1">
                  <p className="font-medium text-destructive">Submission blocked — fix these items</p>
                  {validationErr.haveCount < validationErr.minCount && (
                    <p>• Need at least <b>{validationErr.minCount}</b> evidence item(s) — you have {validationErr.haveCount}.</p>
                  )}
                  {validationErr.missingTypes.length > 0 && (
                    <p>• Missing required type(s): <b>{validationErr.missingTypes.join(", ")}</b>.</p>
                  )}
                  {validationErr.invalidUrls.length > 0 && (
                    <p>• Invalid URL on: <b>{validationErr.invalidUrls.map((x) => x.name || `#${x.index + 1}`).join(", ")}</b>.</p>
                  )}
                </div>
              )}
              {versions.length > 0 && (
                <details className="rounded-md border p-3 text-xs">
                  <summary className="cursor-pointer font-medium">Version history ({versions.length})</summary>
                  <ul className="mt-2 space-y-2">
                    {versions.map((v: any) => (
                      <li key={v.id} className="border-l-2 border-muted pl-2">
                        <div className="font-medium">v{v.version} • {v.status} • {new Date(v.created_at).toLocaleString()}</div>
                        {v.reviewer_comments && <div className="text-muted-foreground">{v.reviewer_comments}</div>}
                        <div className="text-muted-foreground">Score: {v.score == null ? "—" : (typeof v.score === "object" ? JSON.stringify(v.score) : String(v.score))} • Evidence: {(v.evidence ?? []).length}</div>
                      </li>
                    ))}
                  </ul>
                </details>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>Close</Button>
            {editing && editing.status === "rejected" && (
              <Button onClick={save} disabled={busy}>{busy ? "Resubmitting…" : "Resubmit"}</Button>
            )}
            {editing && editing.status === "pending" && (
              <Button onClick={save} disabled={busy}>{busy ? "Submitting…" : "Submit"}</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}

function ScoreField({ comp, value, onChange, disabled }: { comp: any; value: string; onChange: (v: string) => void; disabled?: boolean }) {
  if (!comp) return null;
  if (comp.type === "yes_no") {
    return (
      <div>
        <label className="text-sm font-medium">Result</label>
        <div className="mt-1 flex gap-2">
          {(["yes","no"] as const).map((v) => (
            <Button key={v} type="button" size="sm" variant={value === v ? "default" : "outline"}
              disabled={disabled} onClick={() => onChange(v)}>
              {v === "yes" ? (comp.yesLabel ?? "Yes") : (comp.noLabel ?? "No")}
            </Button>
          ))}
        </div>
      </div>
    );
  }
  if (comp.type === "text") {
    return (
      <div>
        <label className="text-sm font-medium">Response</label>
        <Textarea value={value} onChange={(e) => onChange(e.target.value)} disabled={disabled} />
      </div>
    );
  }
  return (
    <div>
      <label className="text-sm font-medium">
        Score {comp.unit ? `(${comp.unit})` : ""}{" "}
        {comp.target != null && <span className="text-xs text-muted-foreground">target {String(comp.target)}</span>}
      </label>
      <Input type="number" value={value} onChange={(e) => onChange(e.target.value)} disabled={disabled}
        min={comp.min} max={comp.max} />
      {(comp.min != null || comp.max != null) && (
        <p className="mt-1 text-xs text-muted-foreground">
          Range {comp.min ?? "—"} to {comp.max ?? "—"}
        </p>
      )}
    </div>
  );
}
