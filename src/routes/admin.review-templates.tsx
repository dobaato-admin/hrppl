import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { upsertReviewTemplate, deleteReviewTemplate } from "@/lib/performance.functions";
import { logTemplateAuditEvent, listTemplateAuditLog, generateReviewInstances } from "@/lib/review-instances.functions";
import {
  INDUSTRIES,
  REVIEW_PRESETS,
  getPreset,
  type PresetCompetency,
  type CompetencyType,
  type TemplateKind,
  type EvidenceType,
  type ReviewSchedule,
} from "@/lib/review-presets";
import { ScorecardPreview } from "@/components/performance/ScorecardPreview";
import { validateTemplate, type ValidationIssue } from "@/lib/review-template-validation";
import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute("/admin/review-templates")({
  head: () => ({ meta: [{ title: "Review templates — WorldPay HRMS" }] }),
  component: ReviewTemplatesAdmin,
});

type Competency = PresetCompetency;

interface Template {
  id: string; name: string; description: string | null;
  industry: string | null; kind: TemplateKind;
  is_default: boolean;
  scale_min: number; scale_max: number; scale_labels: string[];
  competencies: Competency[];
  version: number; is_current: boolean; parent_template_id: string | null; change_note: string | null;
}

const COMP_TYPES: Array<{ value: CompetencyType; label: string }> = [
  { value: "rating", label: "Rating (scale)" },
  { value: "scale", label: "Custom scale" },
  { value: "number", label: "Number" },
  { value: "percentage", label: "Percentage" },
  { value: "currency", label: "Currency" },
  { value: "range", label: "Range (min–max)" },
  { value: "yes_no", label: "Yes / No" },
  { value: "text", label: "Subjective text" },
];

const KINDS: Array<{ value: TemplateKind; label: string }> = [
  { value: "kpi", label: "KPI" },
  { value: "kra", label: "KRA" },
  { value: "competency", label: "Competency" },
  { value: "mixed", label: "Mixed" },
  { value: "360", label: "360° Feedback" },
];

function newComp(type: CompetencyType = "rating"): Competency {
  return {
    id: crypto.randomUUID().slice(0, 8),
    label: "",
    description: "",
    type,
    required: true,
    evidenceEnabled: type === "number" || type === "percentage" || type === "currency" || type === "yes_no",
    evidenceTypes: ["document", "url"],
  };
}

function ReviewTemplatesAdmin() {
  const { user, roles, loading } = useAuth();
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(false);
  const [filterIndustry, setFilterIndustry] = useState<string>("all");
  const [filterKind, setFilterKind] = useState<string>("all");
  const [filterQuery, setFilterQuery] = useState<string>("");
  const [presetKey, setPresetKey] = useState<string>("none");
  const [previewMode, setPreviewMode] = useState<"loaded" | "draft">("draft");
  const [previewPresetKey, setPreviewPresetKey] = useState<string>("none");
  const [issues, setIssues] = useState<ValidationIssue[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<{
    id?: string; name: string; description: string;
    industry: string; kind: TemplateKind;
    isDefault: boolean; scaleMin: number; scaleMax: number; scaleLabels: string;
    competencies: Competency[]; changeNote: string; bumpVersion: boolean;
  }>({
    name: "", description: "", industry: "Education Agent", kind: "kpi",
    isDefault: false, scaleMin: 1, scaleMax: 5, scaleLabels: "Below,Exceeds",
    competencies: [newComp("rating")], changeNote: "", bumpVersion: false,
  });

  const fnSave = useServerFn(upsertReviewTemplate);
  const fnDelete = useServerFn(deleteReviewTemplate);
  const fnAudit = useServerFn(logTemplateAuditEvent);
  const fnAuditList = useServerFn(listTemplateAuditLog);
  const fnGenInstances = useServerFn(generateReviewInstances);
  const [auditOpen, setAuditOpen] = useState(false);
  const [auditEntries, setAuditEntries] = useState<any[]>([]);

  const canAccess = roles.includes("org_admin") || roles.includes("super_admin");
  useEffect(() => { if (!loading && !user) navigate({ to: "/auth" }); }, [loading, user, navigate]);

  async function load() {
    let q = supabase.from("review_templates" as any).select("*").eq("is_current", true).order("name");
    const { data } = await q;
    setTemplates(((data ?? []) as unknown) as Template[]);
  }
  useEffect(() => { if (canAccess) load(); }, [canAccess]);

  function reset() {
    setPresetKey("none");
    setForm({
      name: "", description: "", industry: "Education Agent", kind: "kpi",
      isDefault: false, scaleMin: 1, scaleMax: 5, scaleLabels: "Below,Exceeds",
      competencies: [newComp("rating")], changeNote: "", bumpVersion: false,
    });
  }

  function loadPreset(key: string) {
    setPresetKey(key);
    if (key === "none") return;
    const p = getPreset(key);
    if (!p) return;
    setForm((f) => ({
      ...f,
      name: p.name,
      description: p.description,
      industry: p.industry,
      kind: p.kind,
      scaleMin: p.scaleMin,
      scaleMax: p.scaleMax,
      scaleLabels: p.scaleLabels.join(","),
      competencies: p.competencies.map((c) => ({ ...c, id: c.id || crypto.randomUUID().slice(0, 8) })),
    }));
    toast.success(`Loaded "${p.name}" — customize and save`);
  }

  function edit(t: Template) {
    setPresetKey("none");
    setForm({
      id: t.id, name: t.name, description: t.description ?? "",
      industry: t.industry ?? "Education Agent", kind: t.kind ?? "competency",
      isDefault: t.is_default,
      scaleMin: t.scale_min, scaleMax: t.scale_max,
      scaleLabels: (t.scale_labels ?? []).join(","),
      competencies: (t.competencies ?? []).length ? t.competencies : [newComp("rating")],
      changeNote: "", bumpVersion: false,
    });
    setOpen(true);
  }

  async function save() {
    const draftIssues = validateTemplate({
      name: form.name, scaleMin: form.scaleMin, scaleMax: form.scaleMax,
      competencies: form.competencies,
    });
    setIssues(draftIssues);
    if (draftIssues.length) { toast.error(`Fix ${draftIssues.length} issue(s) before saving`); return; }
    setBusy(true);
    try {
      await fnSave({ data: {
        id: form.id, name: form.name, description: form.description || undefined,
        industry: form.industry || undefined, kind: form.kind,
        scaleMin: form.scaleMin, scaleMax: form.scaleMax,
        scaleLabels: form.scaleLabels.split(",").map((s) => s.trim()).filter(Boolean),
        competencies: form.competencies,
        isDefault: form.isDefault,
        changeNote: form.changeNote || undefined,
        bumpVersion: form.bumpVersion,
      } });
      toast.success("Saved"); setOpen(false); reset(); await load();
    } catch (e: any) { toast.error(e.message); } finally { setBusy(false); }
  }

  function exportTemplate(t: Template) {
    const payload = {
      $schema: "hrppl.review-template/v1",
      name: t.name, description: t.description, industry: t.industry, kind: t.kind,
      scaleMin: t.scale_min, scaleMax: t.scale_max, scaleLabels: t.scale_labels,
      competencies: t.competencies, isDefault: false,
    };
    const fileName = `${(t.name || "review-template").replace(/[^a-z0-9-_]+/gi, "-")}.json`;
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = fileName;
    document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
    fnAudit({ data: { templateId: t.id, templateName: t.name, action: "export", fileName, snapshot: payload } })
      .catch(() => {});
    toast.success("Template downloaded — upload it on another tenant via Import.");
  }

  async function importFromFile(file: File) {
    try {
      const text = await file.text();
      const json = JSON.parse(text);
      const comps: Competency[] = Array.isArray(json.competencies) ? json.competencies : [];
      setPresetKey("none");
      setForm({
        name: String(json.name ?? "Imported template"),
        description: String(json.description ?? ""),
        industry: String(json.industry ?? "Generic / Cross-industry"),
        kind: (json.kind ?? "competency") as TemplateKind,
        isDefault: false,
        scaleMin: Number(json.scaleMin ?? 1),
        scaleMax: Number(json.scaleMax ?? 5),
        scaleLabels: Array.isArray(json.scaleLabels) ? json.scaleLabels.join(",") : "Below,Exceeds",
        competencies: comps.length ? comps : [newComp("rating")],
        changeNote: "Imported", bumpVersion: false,
      });
      setOpen(true);
      fnAudit({ data: { templateId: null, templateName: String(json.name ?? "Imported template"), action: "import", fileName: file.name, snapshot: json } })
        .catch(() => {});
      toast.success("Imported — review and Save to attach to this tenant.");
    } catch (e: any) {
      toast.error(`Import failed: ${e.message}`);
    }
  }

  async function openAudit() {
    setAuditOpen(true);
    try {
      const r = await fnAuditList({ data: { action: "all", limit: 100 } });
      setAuditEntries(r.entries);
    } catch (e: any) { toast.error(e.message); }
  }

  async function scheduleInstances(t: Template) {
    if (!confirm(`Generate scorecards for "${t.name}" for the next 365 days?`)) return;
    try {
      const r = await fnGenInstances({ data: { templateId: t.id, horizonDays: 365 } });
      toast.success(`Created ${r.created} scorecard instance(s)`);
    } catch (e: any) { toast.error(e.message); }
  }



  async function remove(id: string) {
    if (!confirm("Delete this template?")) return;
    setBusy(true);
    try { await fnDelete({ data: { id } }); await load(); }
    catch (e: any) { toast.error(e.message); } finally { setBusy(false); }
  }

  const filteredPresets = REVIEW_PRESETS.filter((p) => p.industry === form.industry);
  const q = filterQuery.trim().toLowerCase();
  const filteredTemplates = templates.filter((t) =>
    (filterIndustry === "all" || (t.industry ?? "") === filterIndustry) &&
    (filterKind === "all" || (t.kind ?? "competency") === filterKind) &&
    (q === "" || (
      (t.name ?? "").toLowerCase().includes(q) ||
      (t.description ?? "").toLowerCase().includes(q) ||
      (t.industry ?? "").toLowerCase().includes(q) ||
      (t.competencies ?? []).some((c: any) => (c.label ?? "").toLowerCase().includes(q))
    ))
  );

  if (loading || !user) return <main className="flex min-h-screen items-center justify-center text-muted-foreground">Loading…</main>;
  if (!canAccess) return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-2xl px-6 py-16 space-y-4">
        <div className="rounded-lg border border-border bg-card p-6">
          <h2 className="text-lg font-semibold">You don't have access to Review templates</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            This page is restricted to users with the <span className="font-mono text-foreground">org_admin</span> or{" "}
            <span className="font-mono text-foreground">super_admin</span> role. Ask your organization administrator to grant access,
            or open <Link to="/me/reviews" className="underline">My reviews</Link> to view scorecards assigned to you.
          </p>
        </div>
      </div>
    </main>
  );

  function updateComp(i: number, patch: Partial<Competency>) {
    const next = [...form.competencies];
    next[i] = { ...next[i], ...patch };
    setForm({ ...form, competencies: next });
  }

  return (
    // Wrapped in AppShell to restore the sidebar and top bar. admin.tsx is a
    // bare <Outlet /> by design, so this page had no navigation at all — which
    // is exactly what the screenshot of this route showed.
    //
    // No title passed: the page renders its own header below.
    <AppShell>
      <main className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-xl font-semibold">KPI / KRA / Review templates</h1>
            <p className="text-xs text-muted-foreground">Pick an industry, start from a standard preset, and customize for your org.</p>
          </div>
          <Link to="/org"><Button variant="outline" size="sm">Back</Button></Link>
        </div>
      </header>
      <section className="mx-auto max-w-6xl px-6 py-8 space-y-6">
        <Card>
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-base">Templates</CardTitle>
              <CardDescription>Attach a template to a cycle in Performance → Cycles.</CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Link to="/admin/kpi-kra"><Button variant="secondary" size="sm">KPI & KRA library</Button></Link>
              <Input
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                placeholder="Search by name, role, KPI item…"
                className="w-[240px]"
              />
              <Select value={filterIndustry} onValueChange={setFilterIndustry}>
                <SelectTrigger className="w-[200px]"><SelectValue placeholder="All industries" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All industries</SelectItem>
                  {INDUSTRIES.map((i) => <SelectItem key={i} value={i}>{i}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={filterKind} onValueChange={setFilterKind}>
                <SelectTrigger className="w-[140px]"><SelectValue placeholder="All kinds" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All kinds</SelectItem>
                  {KINDS.map((k) => <SelectItem key={k.value} value={k.value}>{k.label}</SelectItem>)}
                </SelectContent>
              </Select>
              <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) reset(); }}>
                <DialogTrigger asChild><Button size="sm" onClick={reset}>New template</Button></DialogTrigger>
                <DialogContent className="max-w-3xl">
                  <DialogHeader>
                    <DialogTitle>{form.id ? "Edit template" : "New template"}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-3 max-h-[75vh] overflow-auto pr-1">
                    {/* Industry / Kind / Preset loader */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <Label>Industry</Label>
                        <Select value={form.industry} onValueChange={(v) => setForm({ ...form, industry: v })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>{INDUSTRIES.map((i) => <SelectItem key={i} value={i}>{i}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Kind</Label>
                        <Select value={form.kind} onValueChange={(v) => setForm({ ...form, kind: v as TemplateKind })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>{KINDS.map((k) => <SelectItem key={k.value} value={k.value}>{k.label}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Load standard preset</Label>
                        <Select value={presetKey} onValueChange={loadPreset}>
                          <SelectTrigger><SelectValue placeholder="None — start from scratch" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">None — start from scratch</SelectItem>
                            {filteredPresets.map((p) => (
                              <SelectItem key={p.key} value={p.key}>
                                {p.role} — {p.kind.toUpperCase()} · {p.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
                    <div><Label>Description</Label><Textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>

                    <div className="grid grid-cols-3 gap-3">
                      <div><Label>Scale min</Label><Input type="number" min={1} max={9} value={form.scaleMin} onChange={(e) => setForm({ ...form, scaleMin: Number(e.target.value) })} /></div>
                      <div><Label>Scale max</Label><Input type="number" min={2} max={10} value={form.scaleMax} onChange={(e) => setForm({ ...form, scaleMax: Number(e.target.value) })} /></div>
                      <div><Label>Scale labels (comma-separated)</Label><Input value={form.scaleLabels} onChange={(e) => setForm({ ...form, scaleLabels: e.target.value })} placeholder="Below,Exceeds" /></div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox checked={form.isDefault} onCheckedChange={(v) => setForm({ ...form, isDefault: !!v })} />
                      <Label>Default template for new cycles</Label>
                    </div>

                    {/* Competencies / KPIs */}
                    <div className="border-t pt-3">
                      <div className="flex items-center justify-between mb-2">
                        <Label>Items / KPIs ({form.competencies.length})</Label>
                        <div className="flex gap-1">
                          <Button size="sm" variant="outline" onClick={() => setForm({ ...form, competencies: [...form.competencies, newComp("rating")] })}>+ Rating</Button>
                          <Button size="sm" variant="outline" onClick={() => setForm({ ...form, competencies: [...form.competencies, newComp("number")] })}>+ Number</Button>
                          <Button size="sm" variant="outline" onClick={() => setForm({ ...form, competencies: [...form.competencies, newComp("yes_no")] })}>+ Yes/No</Button>
                          <Button size="sm" variant="outline" onClick={() => setForm({ ...form, competencies: [...form.competencies, newComp("text")] })}>+ Text</Button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        {form.competencies.map((c, i) => (
                          <div key={c.id} className="rounded border p-3 space-y-2 bg-muted/30">
                            <div className="grid grid-cols-12 gap-2">
                              <Input className="col-span-5" placeholder="Label" value={c.label} onChange={(e) => updateComp(i, { label: e.target.value })} />
                              <Select value={c.type} onValueChange={(v) => updateComp(i, { type: v as CompetencyType })}>
                                <SelectTrigger className="col-span-3"><SelectValue /></SelectTrigger>
                                <SelectContent>{COMP_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                              </Select>
                              <Input className="col-span-2" type="number" placeholder="Weight %" value={c.weight ?? ""} onChange={(e) => updateComp(i, { weight: e.target.value ? Number(e.target.value) : undefined })} />
                              <label className="col-span-1 flex items-center gap-1 text-xs"><Checkbox checked={c.required} onCheckedChange={(v) => updateComp(i, { required: !!v })} />Req</label>
                              <Button className="col-span-1" size="sm" variant="ghost" onClick={() => setForm({ ...form, competencies: form.competencies.filter((_, j) => j !== i) })}>✕</Button>
                            </div>
                            <Input placeholder="Optional description / definition" value={c.description ?? ""} onChange={(e) => updateComp(i, { description: e.target.value })} />

                            {/* Numeric guardrails */}
                            {(c.type === "number" || c.type === "percentage" || c.type === "currency" || c.type === "range" || c.type === "scale") && (
                              <div className="grid grid-cols-4 gap-2">
                                <Input type="number" placeholder="Min" value={c.min ?? ""} onChange={(e) => updateComp(i, { min: e.target.value ? Number(e.target.value) : undefined })} />
                                <Input type="number" placeholder="Max" value={c.max ?? ""} onChange={(e) => updateComp(i, { max: e.target.value ? Number(e.target.value) : undefined })} />
                                <Input placeholder="Target" value={c.target?.toString() ?? ""} onChange={(e) => updateComp(i, { target: e.target.value || undefined })} />
                                <Input placeholder="Unit (e.g. %, AUD, days)" value={c.unit ?? ""} onChange={(e) => updateComp(i, { unit: e.target.value || undefined })} />
                              </div>
                            )}

                            {/* Yes/No labels */}
                            {c.type === "yes_no" && (
                              <div className="grid grid-cols-2 gap-2">
                                <Input placeholder="Yes label (default: Met)" value={c.yesLabel ?? ""} onChange={(e) => updateComp(i, { yesLabel: e.target.value || undefined })} />
                                <Input placeholder="No label (default: Not met)" value={c.noLabel ?? ""} onChange={(e) => updateComp(i, { noLabel: e.target.value || undefined })} />
                              </div>
                            )}

                            {/* Evidence + requirements */}
                            <div className="space-y-2 rounded border bg-background p-2 text-xs">
                              <div className="flex flex-wrap items-center gap-3">
                                <label className="flex items-center gap-1">
                                  <Checkbox checked={!!c.evidenceEnabled} onCheckedChange={(v) => updateComp(i, { evidenceEnabled: !!v })} />
                                  Allow evidence attachment
                                </label>
                                {c.evidenceEnabled && (
                                  <>
                                    <span className="text-muted-foreground">Allowed:</span>
                                    {(["document","url","social","screenshot"] as const).map((t) => (
                                      <label key={t} className="flex items-center gap-1">
                                        <Checkbox
                                          checked={c.evidenceTypes?.includes(t) ?? false}
                                          onCheckedChange={(v) => {
                                            const cur = new Set(c.evidenceTypes ?? []);
                                            if (v) cur.add(t); else cur.delete(t);
                                            updateComp(i, { evidenceTypes: Array.from(cur) as EvidenceType[] });
                                          }}
                                        />{t}
                                      </label>
                                    ))}
                                  </>
                                )}
                              </div>
                              {c.evidenceEnabled && (
                                <div className="flex flex-wrap items-center gap-3">
                                  <span className="text-muted-foreground">Min count:</span>
                                  <Input className="h-7 w-20" type="number" min={0} max={20}
                                    value={c.minEvidenceCount ?? 0}
                                    onChange={(e) => updateComp(i, { minEvidenceCount: e.target.value ? Number(e.target.value) : undefined })} />
                                  <span className="text-muted-foreground">Required types:</span>
                                  {(c.evidenceTypes ?? []).map((t) => (
                                    <label key={t} className="flex items-center gap-1">
                                      <Checkbox
                                        checked={c.requiredEvidenceTypes?.includes(t) ?? false}
                                        onCheckedChange={(v) => {
                                          const cur = new Set(c.requiredEvidenceTypes ?? []);
                                          if (v) cur.add(t); else cur.delete(t);
                                          updateComp(i, { requiredEvidenceTypes: Array.from(cur) as EvidenceType[] });
                                        }}
                                      />{t}
                                    </label>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Review schedule */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs items-end">
                              <div>
                                <Label className="text-xs">Schedule</Label>
                                <Select
                                  value={c.schedule?.type ?? "none"}
                                  onValueChange={(v) => updateComp(i, {
                                    schedule: v === "none" ? undefined : ({ type: v as ReviewSchedule["type"], periods: c.schedule?.periods, startDate: c.schedule?.startDate }),
                                  })}
                                >
                                  <SelectTrigger className="h-8"><SelectValue placeholder="Not scheduled" /></SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="none">Not scheduled</SelectItem>
                                    <SelectItem value="monthly">Monthly</SelectItem>
                                    <SelectItem value="quarterly">Quarterly</SelectItem>
                                    <SelectItem value="half_yearly">Half-yearly</SelectItem>
                                    <SelectItem value="annual">Annual</SelectItem>
                                    <SelectItem value="custom">Custom</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              {c.schedule && (
                                <div className="md:col-span-2">
                                  <Label className="text-xs">Periods (comma-separated, e.g. Q1,Q3 or Jan,Apr,Jul,Oct)</Label>
                                  <Input className="h-8" value={(c.schedule.periods ?? []).join(",")}
                                    onChange={(e) => updateComp(i, {
                                      schedule: { ...(c.schedule as ReviewSchedule), periods: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) },
                                    })} />
                                </div>
                              )}
                              {c.schedule?.type === "custom" && (
                                <div>
                                  <Label className="text-xs">Start date</Label>
                                  <Input className="h-8" type="date" value={c.schedule.startDate ?? ""}
                                    onChange={(e) => updateComp(i, { schedule: { ...(c.schedule as ReviewSchedule), startDate: e.target.value || undefined } })} />
                                </div>
                              )}
                              <div className="md:col-span-3">
                                <Input className="h-7" placeholder="Free-text period hint (legacy)" value={c.reviewPeriod ?? ""} onChange={(e) => updateComp(i, { reviewPeriod: e.target.value || undefined })} />
                              </div>
                            </div>

                            {/* Inline issues for this item */}
                            {issues.filter((iss) => iss.itemIndex === i).map((iss, k) => (
                              <div key={k} className="text-xs text-destructive">⚠ {iss.field}: {iss.message}</div>
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Validation summary */}
                    {issues.length > 0 && (
                      <div className="rounded border border-destructive/50 bg-destructive/5 p-2 text-xs text-destructive">
                        <div className="font-medium mb-1">Cannot save — {issues.length} issue(s):</div>
                        <ul className="list-disc pl-4 space-y-0.5">
                          {issues.slice(0, 6).map((iss, k) => (
                            <li key={k}>{iss.itemIndex != null ? `Item #${iss.itemIndex + 1}: ` : ""}{iss.message}</li>
                          ))}
                          {issues.length > 6 && <li>+{issues.length - 6} more…</li>}
                        </ul>
                      </div>
                    )}

                    {/* Read-only scorecard preview of the current draft */}
                    <div className="border-t pt-3">
                      <ScorecardPreview
                        name={form.name}
                        description={form.description}
                        industry={form.industry}
                        kind={form.kind}
                        scaleMin={form.scaleMin}
                        scaleMax={form.scaleMax}
                        scaleLabels={form.scaleLabels.split(",").map((s) => s.trim()).filter(Boolean)}
                        competencies={form.competencies}
                      />
                    </div>

                    {form.id && (
                      <div className="border-t pt-3 space-y-2">
                        <div className="flex items-center gap-2"><Checkbox checked={form.bumpVersion} onCheckedChange={(v) => setForm({ ...form, bumpVersion: !!v })} /><Label>Save as a new version (preserve history)</Label></div>
                        <div><Label>Change note</Label><Input value={form.changeNote} onChange={(e) => setForm({ ...form, changeNote: e.target.value })} placeholder="What changed?" /></div>
                      </div>
                    )}
                  </div>
                  <DialogFooter className="gap-2">
                    <Button variant="outline" onClick={() => {
                      const next = validateTemplate({
                        name: form.name, scaleMin: form.scaleMin, scaleMax: form.scaleMax,
                        competencies: form.competencies,
                      });
                      setIssues(next);
                      toast[next.length ? "error" : "success"](next.length ? `${next.length} issue(s) — see panel` : "Looks good");
                    }}>Validate</Button>
                    <Button disabled={busy} onClick={save}>Save</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              <Button size="sm" variant="outline" onClick={() => fileInputRef.current?.click()}>Import JSON</Button>
              <Button size="sm" variant="outline" onClick={openAudit}>Audit log</Button>
              <input ref={fileInputRef} type="file" accept="application/json,.json" className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) importFromFile(f); e.currentTarget.value = ""; }} />
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Industry</TableHead>
                  <TableHead>Kind</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Version</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTemplates.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell>
                      <div className="flex items-center gap-2"><span className="font-medium">{t.name}</span>{t.is_default && <Badge>Default</Badge>}</div>
                      {t.description && <div className="text-xs text-muted-foreground">{t.description}</div>}
                    </TableCell>
                    <TableCell className="text-sm">{t.industry ?? "—"}</TableCell>
                    <TableCell><Badge variant="secondary">{(t.kind ?? "competency").toUpperCase()}</Badge></TableCell>
                    <TableCell className="text-sm">{t.competencies?.length ?? 0}</TableCell>
                    <TableCell><Badge variant="outline">v{t.version}</Badge></TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button size="sm" variant="outline" onClick={() => edit(t)}>Edit</Button>
                      <Button size="sm" variant="outline" onClick={() => exportTemplate(t)}>Export</Button>
                      <Button size="sm" variant="outline" onClick={() => scheduleInstances(t)}>Schedule</Button>
                      <Button size="sm" variant="outline" onClick={() => remove(t.id)}>Delete</Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredTemplates.length === 0 && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">No templates match. Create one or load a preset from the “New template” dialog.</TableCell></TableRow>}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Discoverable preset gallery */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Standard preset library</CardTitle>
            <CardDescription>Industry-aware presets. Open “New template”, pick an industry, then choose a preset to start.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2">
              {INDUSTRIES.map((ind) => {
                const list = REVIEW_PRESETS.filter((p) => p.industry === ind);
                if (!list.length) return null;
                return (
                  <div key={ind} className="rounded border p-3">
                    <div className="font-medium mb-2">{ind}</div>
                    <ul className="text-xs space-y-1">
                      {list.map((p) => (
                        <li key={p.key} className="flex items-center justify-between gap-2">
                          <span><Badge variant="outline" className="mr-1">{p.kind.toUpperCase()}</Badge>{p.role} — {p.name}</span>
                          <div className="flex gap-1">
                            <Button size="sm" variant="ghost" onClick={() => setPreviewPresetKey(previewPresetKey === p.key ? "none" : p.key)}>
                              {previewPresetKey === p.key ? "Hide" : "Preview"}
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => { setForm((f) => ({ ...f, industry: p.industry })); setOpen(true); setTimeout(() => loadPreset(p.key), 0); }}>Use</Button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
            {previewPresetKey !== "none" && (() => {
              const p = getPreset(previewPresetKey);
              if (!p) return null;
              return (
                <div className="mt-4">
                  <ScorecardPreview
                    name={p.name} description={p.description} industry={p.industry} kind={p.kind}
                    scaleMin={p.scaleMin} scaleMax={p.scaleMax} scaleLabels={p.scaleLabels}
                    competencies={p.competencies}
                  />
                </div>
              );
            })()}
          </CardContent>
        </Card>
      </section>

      <Dialog open={auditOpen} onOpenChange={setAuditOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader><DialogTitle>Template export / import audit log</DialogTitle></DialogHeader>
          {auditEntries.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">No events yet.</p>
          ) : (
            <div className="max-h-[60vh] overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>When</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Template</TableHead>
                    <TableHead>Actor</TableHead>
                    <TableHead>File</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {auditEntries.map((e) => (
                    <TableRow key={e.id}>
                      <TableCell className="text-xs">{new Date(e.created_at).toLocaleString()}</TableCell>
                      <TableCell><Badge variant={e.action === "export" ? "secondary" : "default"}>{e.action}</Badge></TableCell>
                      <TableCell>{e.template_name}</TableCell>
                      <TableCell className="text-xs">{e.actor_email ?? e.actor_id?.slice(0, 8)}</TableCell>
                      <TableCell className="text-xs">{e.file_name ?? "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </DialogContent>
      </Dialog>
      </main>
    </AppShell>
  );
}
