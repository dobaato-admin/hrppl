import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
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
import {
  upsertFeedbackTemplate,
  deleteFeedbackTemplate,
  getFeedbackTemplateHistory,
  archiveFeedbackTemplate,
  restoreFeedbackTemplate,
  listArchivedFeedbackTemplates,
} from "@/lib/feedback360.functions";
import { FEEDBACK_PRESETS, getPreset } from "@/lib/feedback360-presets";
import { formatDistanceToNow } from "date-fns";
import { AdminGate } from "@/components/AdminGate";
import { ORG_ADMIN_ONLY } from "@/lib/rbac";
import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute("/admin/feedback-templates")({
  head: () => ({ meta: [{ title: "360 feedback templates — WorldPay HRMS" }] }),
  component: () => (
    <AdminGate allow={ORG_ADMIN_ONLY}>
      <FeedbackTemplatesAdmin />
    </AdminGate>
  ),
});

interface Question {
  id: string;
  label: string;
  type: "rating" | "text";
  required: boolean;
  scaleMin?: number;
  scaleMax?: number;
  scaleLabels?: string[];
}
interface Template {
  id: string;
  name: string;
  description: string | null;
  is_default: boolean;
  questions: Question[];
  version: number;
  is_current: boolean;
  parent_template_id: string | null;
  change_note: string | null;
  created_at: string;
}
interface HistoryEntry extends Template { created_by: string | null; updated_by: string | null; }

function newQ(type: "rating" | "text" = "rating"): Question {
  return {
    id: crypto.randomUUID().slice(0, 8),
    label: "",
    type,
    required: true,
    ...(type === "rating" ? { scaleMin: 1, scaleMax: 5, scaleLabels: ["Poor", "Excellent"] } : {}),
  };
}

function FeedbackTemplatesAdmin() {
  const { user, roles, loading } = useAuth();
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Template | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [historyName, setHistoryName] = useState("");
  const [form, setForm] = useState<{ id?: string; name: string; description: string; isDefault: boolean; questions: Question[]; changeNote: string }>({
    name: "", description: "", isDefault: false, questions: [newQ("rating")], changeNote: "",
  });

  const [presetOpen, setPresetOpen] = useState(false);
  const [archivedOpen, setArchivedOpen] = useState(false);
  const [archived, setArchived] = useState<Template[]>([]);

  const fnSave = useServerFn(upsertFeedbackTemplate);
  const fnDelete = useServerFn(deleteFeedbackTemplate);
  const fnHistory = useServerFn(getFeedbackTemplateHistory);
  const fnArchive = useServerFn(archiveFeedbackTemplate);
  const fnRestore = useServerFn(restoreFeedbackTemplate);
  const fnListArchived = useServerFn(listArchivedFeedbackTemplates);

  const canAccess = roles.includes("org_admin") || roles.includes("super_admin");
  useEffect(() => { if (!loading && !user) navigate({ to: "/auth" }); }, [loading, user, navigate]);

  async function load() {
    const { data } = await supabase
      .from("feedback_question_templates")
      .select("*")
      .eq("is_current", true)
      .order("created_at", { ascending: false });
    setTemplates((data ?? []) as unknown as Template[]);
  }
  useEffect(() => { if (user) load(); }, [user]);

  function openCreate() {
    setEditing(null);
    setForm({ name: "", description: "", isDefault: false, questions: [newQ("rating")], changeNote: "" });
    setOpen(true);
  }
  function openPresetPicker() { setPresetOpen(true); }
  function startFromPreset(key: string) {
    const preset = getPreset(key);
    if (!preset) return;
    setEditing(null);
    setForm({
      name: preset.name.replace(" (recommended)", ""),
      description: preset.description,
      isDefault: false,
      questions: preset.questions.map((q) => ({ ...q, id: crypto.randomUUID().slice(0, 8) })),
      changeNote: "",
    });
    setPresetOpen(false);
    setOpen(true);
  }
  async function openArchived() {
    setArchivedOpen(true);
    try {
      const res = await fnListArchived();
      setArchived((res.templates ?? []) as unknown as Template[]);
    } catch (e: any) { toast.error(e.message); }
  }
  async function archive(id: string) {
    if (!confirm("Archive this template? Existing feedback keeps its template, and you can restore it later.")) return;
    setBusy(true);
    try { await fnArchive({ data: { id } }); toast.success("Archived"); await load(); }
    catch (e: any) { toast.error(e.message); }
    finally { setBusy(false); }
  }
  async function restore(id: string) {
    setBusy(true);
    try {
      await fnRestore({ data: { id } });
      toast.success("Restored");
      const res = await fnListArchived();
      setArchived((res.templates ?? []) as unknown as Template[]);
      await load();
    } catch (e: any) { toast.error(e.message); }
    finally { setBusy(false); }
  }
  function openEdit(t: Template) {
    setEditing(t);
    setForm({
      id: t.id, name: t.name, description: t.description ?? "", isDefault: t.is_default,
      questions: (t.questions ?? []).map((q) => ({ ...q })),
      changeNote: "",
    });
    setOpen(true);
  }

  async function openHistory(t: Template) {
    setHistoryName(t.name);
    setHistoryOpen(true);
    setHistory([]);
    try {
      const res = await fnHistory({ data: { templateId: t.id } });
      setHistory((res.versions ?? []) as unknown as HistoryEntry[]);
    } catch (e: any) { toast.error(e.message); }
  }

  async function save() {
    if (!form.name.trim()) { toast.error("Name required"); return; }
    if (form.questions.length === 0 || form.questions.some((q) => !q.label.trim())) {
      toast.error("All questions need a label"); return;
    }
    if (editing && !form.changeNote.trim()) {
      toast.error("Add a short change note so the new version is traceable"); return;
    }
    setBusy(true);
    try {
      const res = await fnSave({ data: {
        id: form.id, name: form.name, description: form.description || undefined,
        isDefault: form.isDefault, questions: form.questions,
        changeNote: form.changeNote || undefined,
      } });
      toast.success(editing ? `Saved as version ${res.version}` : "Template created");
      setOpen(false);
      await load();
    } catch (e: any) { toast.error(e.message); }
    finally { setBusy(false); }
  }

  async function remove(id: string) {
    if (!confirm("Delete template?")) return;
    setBusy(true);
    try { await fnDelete({ data: { id } }); toast.success("Deleted"); await load(); }
    catch (e: any) { toast.error(e.message); }
    finally { setBusy(false); }
  }

  function updateQ(idx: number, patch: Partial<Question>) {
    setForm((f) => ({ ...f, questions: f.questions.map((q, i) => i === idx ? { ...q, ...patch } : q) }));
  }
  function removeQ(idx: number) {
    setForm((f) => ({ ...f, questions: f.questions.filter((_, i) => i !== idx) }));
  }
  function addQ(type: "rating" | "text") {
    setForm((f) => ({ ...f, questions: [...f.questions, newQ(type)] }));
  }

  if (loading || !user) return <main className="flex min-h-screen items-center justify-center text-muted-foreground">Loading…</main>;

  return (
    // Wrapped in AppShell to restore the sidebar and top bar. admin.tsx is
    // deliberately a bare <Outlet /> (pinned by tests/admin-routes-block.test.ts),
    // so any /admin page that does not render its own shell had no navigation at
    // all — the user could only leave via the browser back button.
    //
    // No title passed: this page already renders its own header below, so the
    // shell contributes chrome only and does not duplicate the heading.
    <AppShell>
      <main className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-xl font-semibold">360° feedback templates</h1>
            <p className="text-xs text-muted-foreground">Configure questions and rating scales used when colleagues give feedback.</p>
          </div>
          <Link to="/org"><Button variant="outline" size="sm">Back</Button></Link>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-6 py-8 space-y-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">Templates</CardTitle>
              <CardDescription>One template can be marked default and pre-selected when colleagues request feedback.</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={openArchived} data-testid="view-archived">View archived</Button>
              <Button size="sm" variant="outline" onClick={openPresetPicker} data-testid="start-from-recommended">Start from recommended</Button>
              <Button size="sm" onClick={openCreate} data-testid="start-from-scratch">Start from scratch</Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Version</TableHead><TableHead>Questions</TableHead><TableHead>Default</TableHead><TableHead></TableHead></TableRow></TableHeader>
              <TableBody>
                {templates.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell>
                      <div className="font-medium">{t.name}</div>
                      {t.description && <div className="text-xs text-muted-foreground">{t.description}</div>}
                    </TableCell>
                    <TableCell><Badge variant="outline">v{t.version}</Badge></TableCell>
                    <TableCell className="text-sm text-muted-foreground">{(t.questions ?? []).length}</TableCell>
                    <TableCell>{t.is_default && <Badge>Default</Badge>}</TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button size="sm" variant="outline" onClick={() => openHistory(t)}>History</Button>
                      <Button size="sm" variant="outline" onClick={() => openEdit(t)}>Edit</Button>
                      <Button size="sm" variant="outline" onClick={() => archive(t.id)} disabled={busy} data-testid="archive-template">Archive</Button>
                      <Button size="sm" variant="ghost" onClick={() => remove(t.id)} disabled={busy}>Delete</Button>
                    </TableCell>
                  </TableRow>
                ))}
                {templates.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">No templates yet.</TableCell></TableRow>}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </section>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "Edit template" : "New template"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div className="flex items-center gap-2 pt-6">
                <Checkbox checked={form.isDefault} onCheckedChange={(c) => setForm({ ...form, isDefault: !!c })} />
                <Label>Use as default</Label>
              </div>
            </div>
            <div><Label>Description</Label><Textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
            {editing && (
              <div>
                <Label>Change note <span className="text-xs text-muted-foreground">(required — saved as new version v{(editing.version ?? 1) + 1})</span></Label>
                <Input placeholder="e.g. Reworded leadership question, raised scale to 1–7" value={form.changeNote} onChange={(e) => setForm({ ...form, changeNote: e.target.value })} />
              </div>
            )}

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Questions</Label>
                <div className="space-x-2">
                  <Button size="sm" variant="outline" onClick={() => addQ("rating")}>+ Rating</Button>
                  <Button size="sm" variant="outline" onClick={() => addQ("text")}>+ Text</Button>
                </div>
              </div>
              {form.questions.map((q, idx) => (
                <div key={q.id} className="rounded-md border p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">{q.type}</Badge>
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-2 text-xs">
                        <Checkbox checked={q.required} onCheckedChange={(c) => updateQ(idx, { required: !!c })} />
                        Required
                      </label>
                      <Button size="sm" variant="ghost" onClick={() => removeQ(idx)}>Remove</Button>
                    </div>
                  </div>
                  <Input placeholder="Question label" value={q.label} onChange={(e) => updateQ(idx, { label: e.target.value })} />
                  {q.type === "rating" && (
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <Label className="text-xs">Min</Label>
                        <Input type="number" min={0} max={9} value={q.scaleMin ?? 1} onChange={(e) => updateQ(idx, { scaleMin: Number(e.target.value) })} />
                      </div>
                      <div>
                        <Label className="text-xs">Max</Label>
                        <Input type="number" min={1} max={10} value={q.scaleMax ?? 5} onChange={(e) => updateQ(idx, { scaleMax: Number(e.target.value) })} />
                      </div>
                      <div>
                        <Label className="text-xs">Scale labels (min, max)</Label>
                        <Input
                          placeholder="Poor, Excellent"
                          value={(q.scaleLabels ?? []).join(", ")}
                          onChange={(e) => updateQ(idx, { scaleLabels: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={busy}>Save template</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Version history — {historyName}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {history.length === 0 && <p className="text-sm text-muted-foreground">No history yet.</p>}
            {[...history].reverse().map((v) => (
              <div key={v.id} className="rounded-md border p-3 space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant={v.is_current ? "default" : "outline"}>v{v.version}</Badge>
                    {v.is_current && <Badge variant="secondary">Current</Badge>}
                    <span className="text-sm font-medium">{v.name}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {v.created_at ? formatDistanceToNow(new Date(v.created_at), { addSuffix: true }) : ""}
                  </span>
                </div>
                {v.change_note && <p className="text-xs text-muted-foreground">{v.change_note}</p>}
                <p className="text-xs text-muted-foreground">{(v.questions ?? []).length} question(s)</p>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setHistoryOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={presetOpen} onOpenChange={setPresetOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Start from a recommended template</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground">Pick a starting point — you can rename it, add or remove questions, and adjust the rating scale before saving.</p>
            {FEEDBACK_PRESETS.map((p) => (
              <div key={p.key} className="rounded-md border p-3 flex items-start justify-between gap-3" data-testid="preset-card">
                <div>
                  <div className="font-medium text-sm">{p.name}</div>
                  <p className="text-xs text-muted-foreground">{p.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">{p.questions.length} questions</p>
                </div>
                <Button size="sm" onClick={() => startFromPreset(p.key)} data-testid={`use-preset-${p.key}`}>Use</Button>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPresetOpen(false)}>Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={archivedOpen} onOpenChange={setArchivedOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Archived templates</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {archived.length === 0 && <p className="text-sm text-muted-foreground">No archived templates.</p>}
            {archived.map((t) => (
              <div key={t.id} className="rounded-md border p-3 flex items-start justify-between gap-3" data-testid="archived-row">
                <div>
                  <div className="font-medium text-sm">{t.name}</div>
                  {t.description && <p className="text-xs text-muted-foreground">{t.description}</p>}
                  <p className="text-xs text-muted-foreground">v{t.version} · {(t.questions ?? []).length} questions</p>
                </div>
                <Button size="sm" onClick={() => restore(t.id)} disabled={busy} data-testid="restore-template">Restore</Button>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setArchivedOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </main>
    </AppShell>
  );
}
