import { AdminGate } from "@/components/AdminGate";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Plus, Trash2, Copy, Send } from "lucide-react";
import {
  listOnboardingTemplates, upsertOnboardingTemplate, cloneOnboardingTemplate, deleteOnboardingTemplate, applyOnboardingTemplate,
  listTrainingBundles, upsertTrainingBundle, deleteTrainingBundle, applyTrainingBundle,
  listDocumentRequestTemplates, upsertDocumentRequestTemplate, deleteDocumentRequestTemplate,
  listActiveEmployees,
} from "@/lib/templates.functions";
import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute("/admin/templates")({
  head: () => ({ meta: [{ title: "Templates Hub — hrppl" }] }),
  component: TemplatesHub,
});

function TemplatesHub() {
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
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-xl font-semibold">Templates Hub</h1>
            <p className="text-xs text-muted-foreground">Reusable templates for onboarding, training, document requests, and reviews.</p>
          </div>
          <Link to="/org"><Button variant="outline" size="sm">Back</Button></Link>
        </div>
      </header>
      <section className="mx-auto max-w-6xl px-6 py-8">
        <Tabs defaultValue="onboarding" className="w-full">
          <TabsList>
            <TabsTrigger value="onboarding">Onboarding</TabsTrigger>
            <TabsTrigger value="training">Training bundles</TabsTrigger>
            <TabsTrigger value="documents">Document requests</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>
          <TabsContent value="onboarding" className="mt-6"><OnboardingTab /></TabsContent>
          <TabsContent value="training" className="mt-6"><TrainingTab /></TabsContent>
          <TabsContent value="documents" className="mt-6"><DocumentsTab /></TabsContent>
          <TabsContent value="reviews" className="mt-6"><ReviewsTab /></TabsContent>
        </Tabs>
      </section>
      </main>
    </AppShell>
  );
}

// ============================================================
// Onboarding tab
// ============================================================
type OnbTpl = { id: string; name: string; description: string | null; role_target: string | null; is_default: boolean; is_active: boolean };
type OnbItem = { id: string; template_id: string; title: string; description: string | null; category: string; owner_role: string; due_offset_days: number; required: boolean; sort_order: number };
type OnbCourse = { id: string; template_id: string; course_id: string; due_offset_days: number; required: boolean; sort_order: number };

function OnboardingTab() {
  const list = useServerFn(listOnboardingTemplates);
  const upsert = useServerFn(upsertOnboardingTemplate);
  const clone = useServerFn(cloneOnboardingTemplate);
  const del = useServerFn(deleteOnboardingTemplate);
  const apply = useServerFn(applyOnboardingTemplate);
  const empList = useServerFn(listActiveEmployees);
  const [templates, setTemplates] = useState<OnbTpl[]>([]);
  const [items, setItems] = useState<OnbItem[]>([]);
  const [courses, setCourses] = useState<OnbCourse[]>([]);
  const [employees, setEmployees] = useState<{ id: string; first_name: string | null; last_name: string | null; email: string | null }[]>([]);
  const [editor, setEditor] = useState<{ open: boolean; tpl: any | null }>({ open: false, tpl: null });
  const [applyDlg, setApplyDlg] = useState<{ open: boolean; tplId: string | null }>({ open: false, tplId: null });

  const refresh = useCallback(async () => {
    try {
      const r = await list({ data: {} as any });
      setTemplates(r.templates as OnbTpl[]); setItems(r.items as OnbItem[]); setCourses(r.courses as OnbCourse[]);
    } catch (e: any) { toast.error(e.message); }
  }, [list]);
  useEffect(() => { refresh(); empList({ data: {} as any }).then((r) => setEmployees(r.employees as any)).catch(() => {}); }, [refresh, empList]);

  function openNew() { setEditor({ open: true, tpl: { name: "", description: "", role_target: "", is_default: false, is_active: true, items: [], courses: [] } }); }
  function openEdit(t: OnbTpl) {
    setEditor({ open: true, tpl: {
      ...t,
      items: items.filter((i) => i.template_id === t.id).map((i) => ({ ...i })),
      courses: courses.filter((c) => c.template_id === t.id).map((c) => ({ ...c })),
    } });
  }
  async function onSave() {
    try {
      await upsert({ data: editor.tpl });
      toast.success("Saved"); setEditor({ open: false, tpl: null }); refresh();
    } catch (e: any) { toast.error(e.message); }
  }
  async function onClone(t: OnbTpl) {
    const name = prompt("New template name", `${t.name} (copy)`);
    if (!name) return;
    try { await clone({ data: { id: t.id, newName: name } }); toast.success("Cloned"); refresh(); }
    catch (e: any) { toast.error(e.message); }
  }
  async function onDelete(t: OnbTpl) {
    if (!confirm(`Delete "${t.name}"?`)) return;
    try { await del({ data: { id: t.id } }); toast.success("Deleted"); refresh(); }
    catch (e: any) { toast.error(e.message); }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-base">Onboarding checklist templates</CardTitle>
          <CardDescription>Reusable hire-day checklists with tasks and attached training courses.</CardDescription>
        </div>
        <Button size="sm" onClick={openNew}><Plus className="mr-1 h-4 w-4" /> New template</Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {templates.length === 0 && <p className="text-sm text-muted-foreground">No templates yet. Create your first to get started.</p>}
        {templates.map((t) => {
          const tItems = items.filter((i) => i.template_id === t.id);
          const tCourses = courses.filter((c) => c.template_id === t.id);
          return (
            <div key={t.id} className="flex items-center justify-between rounded-md border border-border p-3">
              <div>
                <div className="font-medium flex items-center gap-2">{t.name} {t.is_default && <Badge variant="secondary">Default</Badge>} {!t.is_active && <Badge variant="outline">Inactive</Badge>}</div>
                <div className="text-xs text-muted-foreground">{tItems.length} tasks · {tCourses.length} courses {t.role_target && `· role: ${t.role_target}`}</div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setApplyDlg({ open: true, tplId: t.id })}><Send className="mr-1 h-3 w-3" /> Apply</Button>
                <Button variant="outline" size="sm" onClick={() => openEdit(t)}>Edit</Button>
                <Button variant="outline" size="sm" onClick={() => onClone(t)}><Copy className="h-3 w-3" /></Button>
                <Button variant="outline" size="sm" onClick={() => onDelete(t)}><Trash2 className="h-3 w-3" /></Button>
              </div>
            </div>
          );
        })}
      </CardContent>

      <Dialog open={editor.open} onOpenChange={(o) => !o && setEditor({ open: false, tpl: null })}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editor.tpl?.id ? "Edit template" : "New template"}</DialogTitle></DialogHeader>
          {editor.tpl && <OnbEditor tpl={editor.tpl} setTpl={(t) => setEditor({ open: true, tpl: t })} />}
          <DialogFooter><Button variant="outline" onClick={() => setEditor({ open: false, tpl: null })}>Cancel</Button><Button onClick={onSave}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <ApplyOnboardingDialog open={applyDlg.open} tplId={applyDlg.tplId} employees={employees} apply={apply} onClose={() => setApplyDlg({ open: false, tplId: null })} />
    </Card>
  );
}

function OnbEditor({ tpl, setTpl }: { tpl: any; setTpl: (t: any) => void }) {
  function up(k: string, v: any) { setTpl({ ...tpl, [k]: v }); }
  function addItem() { setTpl({ ...tpl, items: [...tpl.items, { title: "", description: "", category: "general", owner_role: "employee", due_offset_days: 0, required: true, sort_order: tpl.items.length }] }); }
  function rmItem(idx: number) { setTpl({ ...tpl, items: tpl.items.filter((_: any, i: number) => i !== idx) }); }
  function setItem(idx: number, patch: any) { setTpl({ ...tpl, items: tpl.items.map((it: any, i: number) => i === idx ? { ...it, ...patch } : it) }); }
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div><Label>Name</Label><Input value={tpl.name} onChange={(e) => up("name", e.target.value)} /></div>
        <div><Label>Role target (optional)</Label><Input value={tpl.role_target ?? ""} onChange={(e) => up("role_target", e.target.value)} placeholder="e.g. engineer, sales" /></div>
      </div>
      <div><Label>Description</Label><Textarea value={tpl.description ?? ""} onChange={(e) => up("description", e.target.value)} /></div>
      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 text-sm"><Checkbox checked={tpl.is_default} onCheckedChange={(c) => up("is_default", !!c)} /> Default template</label>
        <label className="flex items-center gap-2 text-sm"><Checkbox checked={tpl.is_active} onCheckedChange={(c) => up("is_active", !!c)} /> Active</label>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2"><Label>Tasks</Label><Button size="sm" variant="outline" onClick={addItem}><Plus className="h-3 w-3 mr-1" /> Add task</Button></div>
        <div className="space-y-2">
          {tpl.items.map((it: any, idx: number) => (
            <div key={idx} className="grid grid-cols-12 gap-2 items-end rounded border p-2">
              <div className="col-span-4"><Label className="text-xs">Title</Label><Input value={it.title} onChange={(e) => setItem(idx, { title: e.target.value })} /></div>
              <div className="col-span-2"><Label className="text-xs">Owner</Label>
                <Select value={it.owner_role} onValueChange={(v) => setItem(idx, { owner_role: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="employee">Employee</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="hr">HR</SelectItem>
                    <SelectItem value="it">IT</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2"><Label className="text-xs">Category</Label>
                <Select value={it.category} onValueChange={(v) => setItem(idx, { category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="paperwork">Paperwork</SelectItem>
                    <SelectItem value="equipment">Equipment</SelectItem>
                    <SelectItem value="training">Training</SelectItem>
                    <SelectItem value="intro">Intro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2"><Label className="text-xs">Due (days)</Label><Input type="number" value={it.due_offset_days} onChange={(e) => setItem(idx, { due_offset_days: Number(e.target.value) })} /></div>
              <div className="col-span-1 flex items-center"><label className="flex items-center gap-1 text-xs"><Checkbox checked={it.required} onCheckedChange={(c) => setItem(idx, { required: !!c })} /> Req</label></div>
              <div className="col-span-1"><Button size="sm" variant="ghost" onClick={() => rmItem(idx)}><Trash2 className="h-3 w-3" /></Button></div>
            </div>
          ))}
          {tpl.items.length === 0 && <p className="text-xs text-muted-foreground">No tasks added.</p>}
        </div>
      </div>

      <p className="text-xs text-muted-foreground">Tip: To attach training courses to this onboarding template, use the Training Bundles tab and assign both to the employee.</p>
    </div>
  );
}

function ApplyOnboardingDialog({ open, tplId, employees, apply, onClose }: { open: boolean; tplId: string | null; employees: any[]; apply: any; onClose: () => void }) {
  const [empId, setEmpId] = useState("");
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  useEffect(() => { if (open) { setEmpId(""); } }, [open]);
  async function go() {
    if (!tplId || !empId) return;
    try { const r = await apply({ data: { template_id: tplId, employee_id: empId, start_date: startDate } });
      toast.success(`Applied. Enrolled in ${r.enrolled} course(s).`); onClose();
    } catch (e: any) { toast.error(e.message); }
  }
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader><DialogTitle>Apply onboarding template</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div><Label>Employee</Label>
            <Select value={empId} onValueChange={setEmpId}>
              <SelectTrigger><SelectValue placeholder="Select employee…" /></SelectTrigger>
              <SelectContent>{employees.map((e) => <SelectItem key={e.id} value={e.id}>{e.first_name} {e.last_name} {e.email && `(${e.email})`}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div><Label>Start date</Label><Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} /></div>
        </div>
        <DialogFooter><Button variant="outline" onClick={onClose}>Cancel</Button><Button onClick={go} disabled={!empId}>Apply</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================
// Training bundles tab
// ============================================================
function TrainingTab() {
  const list = useServerFn(listTrainingBundles);
  const upsert = useServerFn(upsertTrainingBundle);
  const del = useServerFn(deleteTrainingBundle);
  const apply = useServerFn(applyTrainingBundle);
  const empList = useServerFn(listActiveEmployees);
  const [bundles, setBundles] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [editor, setEditor] = useState<{ open: boolean; b: any | null }>({ open: false, b: null });
  const [applyDlg, setApplyDlg] = useState<{ open: boolean; bId: string | null }>({ open: false, bId: null });

  const refresh = useCallback(async () => {
    try { const r = await list({ data: {} as any }); setBundles(r.bundles); setItems(r.items); setCourses(r.courses); } catch (e: any) { toast.error(e.message); }
  }, [list]);
  useEffect(() => { refresh(); empList({ data: {} as any }).then((r) => setEmployees(r.employees as any)).catch(() => {}); }, [refresh, empList]);

  function openNew() { setEditor({ open: true, b: { name: "", description: "", target_role: "", is_active: true, items: [] } }); }
  function openEdit(b: any) { setEditor({ open: true, b: { ...b, items: items.filter((i) => i.bundle_id === b.id).map((i) => ({ ...i })) } }); }
  async function save() { try { await upsert({ data: editor.b }); toast.success("Saved"); setEditor({ open: false, b: null }); refresh(); } catch (e: any) { toast.error(e.message); } }
  async function onDelete(b: any) { if (!confirm(`Delete "${b.name}"?`)) return; try { await del({ data: { id: b.id } }); toast.success("Deleted"); refresh(); } catch (e: any) { toast.error(e.message); } }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div><CardTitle className="text-base">Training bundles</CardTitle><CardDescription>Group training courses and assign them to employees in one click.</CardDescription></div>
        <Button size="sm" onClick={openNew}><Plus className="mr-1 h-4 w-4" /> New bundle</Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {bundles.length === 0 && <p className="text-sm text-muted-foreground">No bundles yet.</p>}
        {bundles.map((b) => {
          const bi = items.filter((i) => i.bundle_id === b.id);
          return (
            <div key={b.id} className="flex items-center justify-between rounded-md border border-border p-3">
              <div>
                <div className="font-medium flex items-center gap-2">{b.name} {!b.is_active && <Badge variant="outline">Inactive</Badge>}</div>
                <div className="text-xs text-muted-foreground">{bi.length} courses {b.target_role && `· role: ${b.target_role}`}</div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setApplyDlg({ open: true, bId: b.id })}><Send className="mr-1 h-3 w-3" /> Assign</Button>
                <Button variant="outline" size="sm" onClick={() => openEdit(b)}>Edit</Button>
                <Button variant="outline" size="sm" onClick={() => onDelete(b)}><Trash2 className="h-3 w-3" /></Button>
              </div>
            </div>
          );
        })}
      </CardContent>

      <Dialog open={editor.open} onOpenChange={(o) => !o && setEditor({ open: false, b: null })}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editor.b?.id ? "Edit bundle" : "New bundle"}</DialogTitle></DialogHeader>
          {editor.b && <BundleEditor b={editor.b} setB={(b) => setEditor({ open: true, b })} courses={courses} />}
          <DialogFooter><Button variant="outline" onClick={() => setEditor({ open: false, b: null })}>Cancel</Button><Button onClick={save}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <ApplyBundleDialog open={applyDlg.open} bId={applyDlg.bId} employees={employees} apply={apply} onClose={() => setApplyDlg({ open: false, bId: null })} />
    </Card>
  );
}

function BundleEditor({ b, setB, courses }: { b: any; setB: (b: any) => void; courses: any[] }) {
  function add() { setB({ ...b, items: [...b.items, { course_id: "", due_offset_days: 14, required: true, sort_order: b.items.length }] }); }
  function rm(i: number) { setB({ ...b, items: b.items.filter((_: any, idx: number) => idx !== i) }); }
  function patch(i: number, p: any) { setB({ ...b, items: b.items.map((x: any, idx: number) => idx === i ? { ...x, ...p } : x) }); }
  return (
    <div className="space-y-3">
      <div><Label>Name</Label><Input value={b.name} onChange={(e) => setB({ ...b, name: e.target.value })} /></div>
      <div><Label>Description</Label><Textarea value={b.description ?? ""} onChange={(e) => setB({ ...b, description: e.target.value })} /></div>
      <div className="grid grid-cols-2 gap-3">
        <div><Label>Target role (optional)</Label><Input value={b.target_role ?? ""} onChange={(e) => setB({ ...b, target_role: e.target.value })} /></div>
        <div className="flex items-end"><label className="flex items-center gap-2 text-sm"><Checkbox checked={b.is_active} onCheckedChange={(c) => setB({ ...b, is_active: !!c })} /> Active</label></div>
      </div>
      <div>
        <div className="flex items-center justify-between mb-2"><Label>Courses</Label><Button size="sm" variant="outline" onClick={add}><Plus className="h-3 w-3 mr-1" /> Add course</Button></div>
        {b.items.map((it: any, idx: number) => (
          <div key={idx} className="grid grid-cols-12 gap-2 items-end mb-2">
            <div className="col-span-7"><Label className="text-xs">Course</Label>
              <Select value={it.course_id} onValueChange={(v) => patch(idx, { course_id: v })}>
                <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                <SelectContent>{courses.map((c) => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="col-span-3"><Label className="text-xs">Due (days)</Label><Input type="number" value={it.due_offset_days} onChange={(e) => patch(idx, { due_offset_days: Number(e.target.value) })} /></div>
            <div className="col-span-1"><label className="flex items-center gap-1 text-xs"><Checkbox checked={it.required} onCheckedChange={(c) => patch(idx, { required: !!c })} /> Req</label></div>
            <div className="col-span-1"><Button variant="ghost" size="sm" onClick={() => rm(idx)}><Trash2 className="h-3 w-3" /></Button></div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ApplyBundleDialog({ open, bId, employees, apply, onClose }: { open: boolean; bId: string | null; employees: any[]; apply: any; onClose: () => void }) {
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  useEffect(() => { if (open) setSelected({}); }, [open]);
  async function go() {
    const ids = Object.keys(selected).filter((k) => selected[k]);
    if (!bId || !ids.length) return;
    try { const r = await apply({ data: { bundle_id: bId, employee_ids: ids, start_date: startDate } });
      toast.success(`Enrolled ${r.enrolled} entries.`); onClose();
    } catch (e: any) { toast.error(e.message); }
  }
  const count = Object.values(selected).filter(Boolean).length;
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>Assign training bundle</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div><Label>Start date</Label><Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} /></div>
          <div>
            <Label>Employees ({count} selected)</Label>
            <div className="max-h-64 overflow-y-auto border rounded p-2 space-y-1">
              {employees.map((e) => (
                <label key={e.id} className="flex items-center gap-2 text-sm">
                  <Checkbox checked={!!selected[e.id]} onCheckedChange={(c) => setSelected({ ...selected, [e.id]: !!c })} />
                  {e.first_name} {e.last_name} <span className="text-muted-foreground">{e.email}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter><Button variant="outline" onClick={onClose}>Cancel</Button><Button onClick={go} disabled={count === 0}>Assign to {count}</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================
// Document request templates tab
// ============================================================
function DocumentsTab() {
  const list = useServerFn(listDocumentRequestTemplates);
  const upsert = useServerFn(upsertDocumentRequestTemplate);
  const del = useServerFn(deleteDocumentRequestTemplate);
  const [tpls, setTpls] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [docTpls, setDocTpls] = useState<any[]>([]);
  const [editor, setEditor] = useState<{ open: boolean; t: any | null }>({ open: false, t: null });

  const refresh = useCallback(async () => {
    try { const r = await list({ data: {} as any }); setTpls(r.templates); setItems(r.items); setDocTpls(r.documentTemplates); } catch (e: any) { toast.error(e.message); }
  }, [list]);
  useEffect(() => { refresh(); }, [refresh]);

  function openNew() { setEditor({ open: true, t: { name: "", description: "", trigger: "onboarding", is_active: true, items: [] } }); }
  function openEdit(t: any) { setEditor({ open: true, t: { ...t, items: items.filter((i) => i.template_id === t.id).map((i) => ({ ...i })) } }); }
  async function save() { try { await upsert({ data: editor.t }); toast.success("Saved"); setEditor({ open: false, t: null }); refresh(); } catch (e: any) { toast.error(e.message); } }
  async function onDelete(t: any) { if (!confirm(`Delete "${t.name}"?`)) return; try { await del({ data: { id: t.id } }); toast.success("Deleted"); refresh(); } catch (e: any) { toast.error(e.message); } }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div><CardTitle className="text-base">Document request bundles</CardTitle><CardDescription>Group documents to request together — e.g. on hire, promotion, or offboarding.</CardDescription></div>
        <Button size="sm" onClick={openNew}><Plus className="mr-1 h-4 w-4" /> New bundle</Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {tpls.length === 0 && <p className="text-sm text-muted-foreground">No bundles yet.</p>}
        {tpls.map((t) => {
          const ti = items.filter((i) => i.template_id === t.id);
          return (
            <div key={t.id} className="flex items-center justify-between rounded-md border border-border p-3">
              <div>
                <div className="font-medium flex items-center gap-2">{t.name} {t.trigger && <Badge variant="secondary">{t.trigger}</Badge>} {!t.is_active && <Badge variant="outline">Inactive</Badge>}</div>
                <div className="text-xs text-muted-foreground">{ti.length} documents</div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => openEdit(t)}>Edit</Button>
                <Button variant="outline" size="sm" onClick={() => onDelete(t)}><Trash2 className="h-3 w-3" /></Button>
              </div>
            </div>
          );
        })}
      </CardContent>

      <Dialog open={editor.open} onOpenChange={(o) => !o && setEditor({ open: false, t: null })}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editor.t?.id ? "Edit bundle" : "New bundle"}</DialogTitle></DialogHeader>
          {editor.t && <DocBundleEditor t={editor.t} setT={(t) => setEditor({ open: true, t })} docTpls={docTpls} />}
          <DialogFooter><Button variant="outline" onClick={() => setEditor({ open: false, t: null })}>Cancel</Button><Button onClick={save}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

function DocBundleEditor({ t, setT, docTpls }: { t: any; setT: (t: any) => void; docTpls: any[] }) {
  function add() { setT({ ...t, items: [...t.items, { document_template_id: "", required_signature: true, due_offset_days: 7, sort_order: t.items.length }] }); }
  function rm(i: number) { setT({ ...t, items: t.items.filter((_: any, idx: number) => idx !== i) }); }
  function patch(i: number, p: any) { setT({ ...t, items: t.items.map((x: any, idx: number) => idx === i ? { ...x, ...p } : x) }); }
  return (
    <div className="space-y-3">
      <div><Label>Name</Label><Input value={t.name} onChange={(e) => setT({ ...t, name: e.target.value })} /></div>
      <div><Label>Description</Label><Textarea value={t.description ?? ""} onChange={(e) => setT({ ...t, description: e.target.value })} /></div>
      <div className="grid grid-cols-2 gap-3">
        <div><Label>Trigger</Label>
          <Select value={t.trigger ?? ""} onValueChange={(v) => setT({ ...t, trigger: v })}>
            <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="onboarding">Onboarding</SelectItem>
              <SelectItem value="promotion">Promotion</SelectItem>
              <SelectItem value="offboarding">Offboarding</SelectItem>
              <SelectItem value="annual">Annual</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-end"><label className="flex items-center gap-2 text-sm"><Checkbox checked={t.is_active} onCheckedChange={(c) => setT({ ...t, is_active: !!c })} /> Active</label></div>
      </div>
      <div>
        <div className="flex items-center justify-between mb-2"><Label>Documents</Label><Button size="sm" variant="outline" onClick={add}><Plus className="h-3 w-3 mr-1" /> Add document</Button></div>
        {t.items.map((it: any, idx: number) => (
          <div key={idx} className="grid grid-cols-12 gap-2 items-end mb-2">
            <div className="col-span-7"><Label className="text-xs">Document template</Label>
              <Select value={it.document_template_id} onValueChange={(v) => patch(idx, { document_template_id: v })}>
                <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                <SelectContent>{docTpls.map((d) => <SelectItem key={d.id} value={d.id}>{d.name} {d.status && `(${d.status})`}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="col-span-2"><Label className="text-xs">Due (days)</Label><Input type="number" value={it.due_offset_days} onChange={(e) => patch(idx, { due_offset_days: Number(e.target.value) })} /></div>
            <div className="col-span-2"><label className="flex items-center gap-1 text-xs"><Checkbox checked={it.required_signature} onCheckedChange={(c) => patch(idx, { required_signature: !!c })} /> E-sign</label></div>
            <div className="col-span-1"><Button variant="ghost" size="sm" onClick={() => rm(idx)}><Trash2 className="h-3 w-3" /></Button></div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// Reviews tab (link to existing editor)
// ============================================================
function ReviewsTab() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Performance review templates</CardTitle>
        <CardDescription>Design rating scales, competencies, and section sets. Clone any template and save as a new version.</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-3">
          Review templates have their own editor with versioning and per-cycle activation.
        </p>
        <Link to="/admin/review-templates"><Button>Open review templates →</Button></Link>
      </CardContent>
    </Card>
  );
}
