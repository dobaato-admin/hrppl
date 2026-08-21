import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Trash2, Gavel, MessageSquare, ShieldAlert, Paperclip, CheckCircle2, XCircle, UserCog, Lock, Download, Upload, Workflow } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { listEmployeesForAdmin } from "@/lib/timeline.functions";
import {
  listCases, upsertCase, deleteCase, assignCase, transitionCaseStatus,
  listActions, addAction, deleteAction,
  listGrievances, updateGrievance,
  listGrievanceComments, addGrievanceComment,
  listApprovals, requestApproval, decideApproval,
  recordCaseAttachment, listCaseAttachments, deleteCaseAttachment, getAttachmentDownloadUrl,
  recordGrievanceAttachment, listGrievanceAttachments, deleteGrievanceAttachment,
  listHrUsers,
} from "@/lib/discipline.functions";

export const Route = createFileRoute("/admin/discipline")({
  head: () => ({ meta: [{ title: "Discipline & grievances — hrppl" }] }),
  component: DisciplinePage,
});

const CATEGORIES = ["verbal_warning","written_warning","final_warning","suspension","termination","pip","investigation","other"] as const;
const SEVERITIES = ["low","medium","high","critical"] as const;
const STATUSES = ["draft","open","investigation","hearing_scheduled","hearing_held","decision_pending","decision_issued","appeal_open","under_review","appealed","closed","withdrawn"] as const;
const TRANSITIONS: Record<string, string[]> = {
  draft: ["open","withdrawn"],
  open: ["investigation","hearing_scheduled","decision_pending","closed","withdrawn"],
  investigation: ["hearing_scheduled","decision_pending","closed","withdrawn"],
  hearing_scheduled: ["hearing_held","investigation","withdrawn"],
  hearing_held: ["decision_pending","investigation"],
  decision_pending: ["decision_issued","investigation"],
  decision_issued: ["appeal_open","closed"],
  appeal_open: ["under_review","closed"],
  under_review: ["closed","appealed"],
  appealed: ["closed"],
  closed: [], withdrawn: [],
};
const ACTION_TYPES = ["warning_issued","hearing_scheduled","hearing_held","appeal_filed","outcome_recorded","note","document_attached","status_changed"] as const;
const G_STATUSES = ["submitted","acknowledged","investigating","resolved","dismissed"] as const;

function sevColor(s: string) {
  return s === "critical" ? "bg-status-stuck" : s === "high" ? "bg-status-pending" : s === "medium" ? "bg-status-working" : "bg-muted";
}

function DisciplinePage() {
  const { user, loading, roles } = useAuth();
  const navigate = useNavigate();
  useEffect(() => { if (!loading && !user) navigate({ to: "/auth" }); }, [loading, user, navigate]);
  const canManage = roles.includes("manager") || roles.includes("org_admin") || roles.includes("super_admin");
  if (!canManage) return <AppShell title="Discipline & grievances"><Card><CardContent className="p-8 text-center text-muted-foreground">You don't have access to this page.</CardContent></Card></AppShell>;

  return (
    <AppShell title="Discipline & grievances" subtitle="Manage disciplinary cases, approvals and grievances">
      <Tabs defaultValue="cases">
        <TabsList>
          <TabsTrigger value="cases"><Gavel className="mr-2 h-4 w-4" />Cases</TabsTrigger>
          <TabsTrigger value="approvals"><CheckCircle2 className="mr-2 h-4 w-4" />My approvals</TabsTrigger>
          <TabsTrigger value="grievances"><ShieldAlert className="mr-2 h-4 w-4" />Grievances</TabsTrigger>
        </TabsList>
        <TabsContent value="cases" className="mt-4"><CasesTab /></TabsContent>
        <TabsContent value="approvals" className="mt-4"><ApprovalsTab /></TabsContent>
        <TabsContent value="grievances" className="mt-4"><GrievancesTab /></TabsContent>
      </Tabs>
    </AppShell>
  );
}

/**
 * Subject picker for disciplinary cases.
 *
 * Goes through listEmployeesForAdmin, which filters on the caller's own tenant
 * and drops the caller from the list. The direct supabase query it replaces did
 * neither: it relied on RLS, which does not narrow for super_admin, so every
 * employee in every tenant appeared — and you could open a disciplinary case
 * against yourself. See src/lib/tenant-scope.ts.
 */
function useEmployees() {
  const fEmps = useServerFn(listEmployeesForAdmin);
  return useQuery({
    queryKey: ["disc-employees"],
    queryFn: async () => (await fEmps()).employees,
    staleTime: 5 * 60_000,
  });
}

function useHrUsers() {
  const fn = useServerFn(listHrUsers);
  return useQuery({ queryKey: ["disc-hr"], queryFn: () => fn() });
}

function CasesTab() {
  const qc = useQueryClient();
  const listFn = useServerFn(listCases);
  const saveFn = useServerFn(upsertCase);
  const delFn = useServerFn(deleteCase);
  const { data: empData } = useEmployees();
  const employees = empData ?? [];

  const { data } = useQuery({ queryKey: ["cases"], queryFn: () => listFn({ data: {} }) });
  const cases = data?.cases ?? [];

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<any>(null);
  const [active, setActive] = useState<any>(null);

  function startNew() { setForm({ category: "verbal_warning", severity: "low", status: "draft", description: "", confidential: false }); setOpen(true); }
  function startEdit(c: any) { setForm({ ...c }); setOpen(true); }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    try {
      await saveFn({ data: { ...form, incident_date: form.incident_date || null, due_date: form.due_date || null, appeal_deadline: form.appeal_deadline || null, assigned_to: form.assigned_to || null } });
      toast.success("Saved"); setOpen(false);
      qc.invalidateQueries({ queryKey: ["cases"] });
    } catch (e: any) { toast.error(e?.message ?? "Failed"); }
  }
  async function remove(id: string) {
    if (!confirm("Delete this case and everything attached?")) return;
    try { await delFn({ data: { id } }); toast.success("Deleted"); qc.invalidateQueries({ queryKey: ["cases"] }); }
    catch (e: any) { toast.error(e?.message ?? "Failed"); }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div><CardTitle>Disciplinary cases</CardTitle><CardDescription>{cases.length} total · click a row to open</CardDescription></div>
        <Button onClick={startNew}><Plus className="mr-2 h-4 w-4" />New case</Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader><TableRow>
            <TableHead>Employee</TableHead><TableHead>Category</TableHead><TableHead>Severity</TableHead>
            <TableHead>Status</TableHead><TableHead>Due</TableHead><TableHead></TableHead><TableHead className="text-right"></TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {cases.map((c: any) => {
              const overdue = c.due_date && c.due_date < new Date().toISOString().slice(0,10) && !["closed","withdrawn"].includes(c.status);
              return (
                <TableRow key={c.id} className="cursor-pointer" onClick={() => setActive(c)}>
                  <TableCell>{c.employees ? `${c.employees.first_name} ${c.employees.last_name}` : "—"}</TableCell>
                  <TableCell><Badge variant="outline" className="capitalize">{c.category.replace(/_/g," ")}</Badge></TableCell>
                  <TableCell><Badge className={`text-white ${sevColor(c.severity)}`}>{c.severity}</Badge></TableCell>
                  <TableCell><Badge variant="secondary" className="capitalize">{c.status.replace(/_/g," ")}</Badge></TableCell>
                  <TableCell className={overdue ? "text-status-stuck font-medium" : ""}>{c.due_date ?? "—"}</TableCell>
                  <TableCell>{c.confidential && <Lock className="h-3.5 w-3.5 text-muted-foreground" />}</TableCell>
                  <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                    <Button size="sm" variant="ghost" onClick={() => startEdit(c)}>Edit</Button>
                    <Button size="sm" variant="ghost" onClick={() => remove(c.id)}><Trash2 className="h-4 w-4" /></Button>
                  </TableCell>
                </TableRow>
              );
            })}
            {cases.length === 0 && <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">No cases yet</TableCell></TableRow>}
          </TableBody>
        </Table>
      </CardContent>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>{form?.id ? "Edit case" : "New case"}</DialogTitle></DialogHeader>
          {form && (
            <form onSubmit={save} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Employee</Label>
                  <Select value={form.employee_id ?? ""} onValueChange={(v) => setForm({ ...form, employee_id: v })}>
                    <SelectTrigger><SelectValue placeholder="Choose…" /></SelectTrigger>
                    <SelectContent>{employees.map((e: any) => <SelectItem key={e.id} value={e.id}>{e.first_name} {e.last_name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Case number</Label>
                  <Input value={form.case_number ?? ""} onChange={(e) => setForm({ ...form, case_number: e.target.value })} placeholder="Auto if blank" />
                </div>
                <div>
                  <Label>Category</Label>
                  <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c} className="capitalize">{c.replace(/_/g," ")}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Severity</Label>
                  <Select value={form.severity} onValueChange={(v) => setForm({ ...form, severity: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{SEVERITIES.map((s) => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Incident date</Label>
                  <Input type="date" value={form.incident_date ?? ""} onChange={(e) => setForm({ ...form, incident_date: e.target.value })} />
                </div>
                <div>
                  <Label>Status</Label>
                  <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s} className="capitalize">{s.replace(/_/g," ")}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Description</Label>
                <Textarea rows={4} required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={!!form.confidential} onChange={(e) => setForm({ ...form, confidential: e.target.checked })} />
                Mark as confidential
              </label>
              <DialogFooter><Button type="submit">Save</Button></DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!active} onOpenChange={(v) => !v && setActive(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Case detail</DialogTitle></DialogHeader>
          {active && <CaseDetail caseRow={active} onChange={(c) => setActive(c)} />}
        </DialogContent>
      </Dialog>
    </Card>
  );
}

function CaseDetail({ caseRow, onChange }: { caseRow: any; onChange: (c: any) => void }) {
  const qc = useQueryClient();
  const assignFn = useServerFn(assignCase);
  const transitionFn = useServerFn(transitionCaseStatus);
  const { data: hr } = useHrUsers();
  const hrUsers = hr?.users ?? [];
  const [assigning, setAssigning] = useState({
    assigned_to: caseRow.assigned_to ?? "",
    due_date: caseRow.due_date ?? "",
    appeal_deadline: caseRow.appeal_deadline ?? "",
  });

  async function saveAssign() {
    try {
      const r = await assignFn({ data: {
        case_id: caseRow.id,
        assigned_to: assigning.assigned_to || null,
        due_date: assigning.due_date || null,
        appeal_deadline: assigning.appeal_deadline || null,
      } });
      toast.success("Saved"); onChange(r.case); qc.invalidateQueries({ queryKey: ["cases"] });
    } catch (e: any) { toast.error(e?.message ?? "Failed"); }
  }
  async function move(to: string) {
    try {
      const r = await transitionFn({ data: { case_id: caseRow.id, to_status: to } });
      toast.success(`Moved to ${to.replace(/_/g," ")}`); onChange(r.case);
      qc.invalidateQueries({ queryKey: ["cases"] });
      qc.invalidateQueries({ queryKey: ["case-actions", caseRow.id] });
    } catch (e: any) { toast.error(e?.message ?? "Failed"); }
  }

  const allowed = TRANSITIONS[caseRow.status] ?? [];

  return (
    <div className="space-y-4">
      <div className="rounded-md border p-3 bg-muted/30">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className="capitalize">{caseRow.category.replace(/_/g," ")}</Badge>
          <Badge className={`text-white ${sevColor(caseRow.severity)}`}>{caseRow.severity}</Badge>
          <Badge variant="secondary" className="capitalize">{caseRow.status.replace(/_/g," ")}</Badge>
          {caseRow.confidential && <Badge variant="outline" className="text-status-stuck border-status-stuck"><Lock className="mr-1 h-3 w-3" />Confidential</Badge>}
        </div>
        <div className="text-sm mt-2 whitespace-pre-wrap">{caseRow.description}</div>
      </div>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Workflow className="h-4 w-4" />Workflow</CardTitle></CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {allowed.length === 0 && <span className="text-sm text-muted-foreground">Case is terminal.</span>}
          {allowed.map((s) => (
            <Button key={s} size="sm" variant="outline" onClick={() => move(s)} className="capitalize">{s.replace(/_/g," ")}</Button>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><UserCog className="h-4 w-4" />Assignment & deadlines</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-3 gap-3 items-end">
          <div>
            <Label>HR owner</Label>
            <Select value={assigning.assigned_to || "__none"} onValueChange={(v) => setAssigning({ ...assigning, assigned_to: v === "__none" ? "" : v })}>
              <SelectTrigger><SelectValue placeholder="Unassigned" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="__none">Unassigned</SelectItem>
                {hrUsers.map((u: any) => <SelectItem key={u.id} value={u.id}>{u.full_name ?? u.email}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div><Label>Due date</Label><Input type="date" value={assigning.due_date} onChange={(e) => setAssigning({ ...assigning, due_date: e.target.value })} /></div>
          <div><Label>Appeal deadline</Label><Input type="date" value={assigning.appeal_deadline} onChange={(e) => setAssigning({ ...assigning, appeal_deadline: e.target.value })} /></div>
          <div className="col-span-3 text-right"><Button size="sm" onClick={saveAssign}>Save assignment</Button></div>
        </CardContent>
      </Card>

      <CaseApprovals caseRow={caseRow} />
      <CaseAttachments caseRow={caseRow} />
      <CaseTimeline caseRow={caseRow} />
    </div>
  );
}

function CaseApprovals({ caseRow }: { caseRow: any }) {
  const qc = useQueryClient();
  const listFn = useServerFn(listApprovals);
  const reqFn = useServerFn(requestApproval);
  const { data: hr } = useHrUsers();
  const hrUsers = hr?.users ?? [];
  const { data } = useQuery({ queryKey: ["case-approvals", caseRow.id], queryFn: () => listFn({ data: { case_id: caseRow.id } }) });
  const items = data?.approvals ?? [];
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<any>({ approver_id: "", approver_role: "manager", notes: "" });

  async function send(e: React.FormEvent) {
    e.preventDefault();
    try {
      await reqFn({ data: { case_id: caseRow.id, approver_id: form.approver_id, approver_role: form.approver_role, notes: form.notes || null } });
      toast.success("Approval requested"); setOpen(false); setForm({ approver_id: "", approver_role: "manager", notes: "" });
      qc.invalidateQueries({ queryKey: ["case-approvals", caseRow.id] });
    } catch (e: any) { toast.error(e?.message ?? "Failed"); }
  }

  return (
    <Card>
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-sm flex items-center gap-2"><CheckCircle2 className="h-4 w-4" />Approvals</CardTitle>
        <Button size="sm" variant="outline" onClick={() => setOpen(true)}><Plus className="mr-1 h-3 w-3" />Request approval</Button>
      </CardHeader>
      <CardContent className="space-y-2">
        {items.map((a: any) => (
          <div key={a.id} className="flex items-center justify-between rounded-md border p-2 text-sm">
            <div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="capitalize">{a.approver_role}</Badge>
                <span>{a.approver?.full_name ?? a.approver?.email ?? "—"}</span>
                {a.decided_at
                  ? <Badge className={a.decision === "approved" ? "bg-status-done text-white" : "bg-status-stuck text-white"}>{a.decision}</Badge>
                  : <Badge variant="secondary">Pending</Badge>}
              </div>
              {a.notes && <div className="text-xs text-muted-foreground mt-1">{a.notes}</div>}
            </div>
            <span className="text-xs text-muted-foreground">{new Date(a.requested_at).toLocaleDateString()}</span>
          </div>
        ))}
        {items.length === 0 && <div className="text-sm text-muted-foreground text-center py-2">No approvals yet</div>}
      </CardContent>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Request approval</DialogTitle></DialogHeader>
          <form onSubmit={send} className="space-y-3">
            <div>
              <Label>Approver</Label>
              <Select value={form.approver_id} onValueChange={(v) => setForm({ ...form, approver_id: v })}>
                <SelectTrigger><SelectValue placeholder="Choose…" /></SelectTrigger>
                <SelectContent>{hrUsers.map((u: any) => <SelectItem key={u.id} value={u.id}>{u.full_name ?? u.email}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Role they approve as</Label>
              <Select value={form.approver_role} onValueChange={(v) => setForm({ ...form, approver_role: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="manager">Line manager</SelectItem>
                  <SelectItem value="hr">HR</SelectItem>
                  <SelectItem value="legal">Legal</SelectItem>
                  <SelectItem value="org_admin">Org admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>Notes</Label><Textarea rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
            <DialogFooter><Button type="submit" disabled={!form.approver_id}>Send</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

function CaseAttachments({ caseRow }: { caseRow: any }) {
  const qc = useQueryClient();
  const listFn = useServerFn(listCaseAttachments);
  const recordFn = useServerFn(recordCaseAttachment);
  const delFn = useServerFn(deleteCaseAttachment);
  const urlFn = useServerFn(getAttachmentDownloadUrl);
  const { data } = useQuery({ queryKey: ["case-attachments", caseRow.id], queryFn: () => listFn({ data: { case_id: caseRow.id } }) });
  const items = data?.attachments ?? [];
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  async function upload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return;
    if (file.size > 20 * 1024 * 1024) { toast.error("Max 20 MB"); return; }
    setBusy(true);
    try {
      const path = `${caseRow.tenant_id}/${caseRow.id}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_")}`;
      const { error } = await supabase.storage.from("disciplinary-files").upload(path, file, { upsert: false, contentType: file.type });
      if (error) throw error;
      await recordFn({ data: { case_id: caseRow.id, storage_path: path, file_name: file.name, mime_type: file.type || null, size_bytes: file.size } });
      toast.success("Uploaded"); qc.invalidateQueries({ queryKey: ["case-attachments", caseRow.id] });
      qc.invalidateQueries({ queryKey: ["case-actions", caseRow.id] });
    } catch (e: any) { toast.error(e?.message ?? "Upload failed"); }
    finally { setBusy(false); if (fileRef.current) fileRef.current.value = ""; }
  }
  async function download(p: string) {
    try { const r = await urlFn({ data: { storage_path: p } }); window.open(r.url, "_blank"); }
    catch (e: any) { toast.error(e?.message ?? "Failed"); }
  }
  async function remove(id: string) {
    if (!confirm("Delete this attachment?")) return;
    try { await delFn({ data: { id } }); qc.invalidateQueries({ queryKey: ["case-attachments", caseRow.id] }); }
    catch (e: any) { toast.error(e?.message ?? "Failed"); }
  }

  return (
    <Card>
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-sm flex items-center gap-2"><Paperclip className="h-4 w-4" />Attachments</CardTitle>
        <div>
          <input ref={fileRef} type="file" className="hidden" onChange={upload} />
          <Button size="sm" variant="outline" disabled={busy} onClick={() => fileRef.current?.click()}>
            <Upload className="mr-1 h-3 w-3" />{busy ? "Uploading…" : "Upload file"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-1">
        {items.map((a: any) => (
          <div key={a.id} className="flex items-center justify-between rounded-md border p-2 text-sm">
            <div className="truncate"><Paperclip className="inline h-3 w-3 mr-1" />{a.file_name}<span className="text-xs text-muted-foreground ml-2">{(a.size_bytes/1024).toFixed(0)} KB</span></div>
            <div className="flex gap-1">
              <Button size="sm" variant="ghost" onClick={() => download(a.storage_path)}><Download className="h-4 w-4" /></Button>
              <Button size="sm" variant="ghost" onClick={() => remove(a.id)}><Trash2 className="h-4 w-4" /></Button>
            </div>
          </div>
        ))}
        {items.length === 0 && <div className="text-sm text-muted-foreground text-center py-2">No files</div>}
      </CardContent>
    </Card>
  );
}

function CaseTimeline({ caseRow }: { caseRow: any }) {
  const qc = useQueryClient();
  const listFn = useServerFn(listActions);
  const addFn = useServerFn(addAction);
  const delFn = useServerFn(deleteAction);
  const { data } = useQuery({ queryKey: ["case-actions", caseRow.id], queryFn: () => listFn({ data: { case_id: caseRow.id } }) });
  const actions = data?.actions ?? [];
  const [form, setForm] = useState<any>({ action_type: "note", notes: "", document_url: "" });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await addFn({ data: { case_id: caseRow.id, action_type: form.action_type, notes: form.notes || null, document_url: form.document_url || null, action_date: form.action_date || undefined } });
      setForm({ action_type: "note", notes: "", document_url: "" });
      qc.invalidateQueries({ queryKey: ["case-actions", caseRow.id] });
    } catch (e: any) { toast.error(e?.message ?? "Failed"); }
  }
  async function remove(id: string) { try { await delFn({ data: { id } }); qc.invalidateQueries({ queryKey: ["case-actions", caseRow.id] }); } catch (e: any) { toast.error(e?.message ?? "Failed"); } }

  return (
    <Card>
      <CardHeader className="pb-2"><CardTitle className="text-sm">Timeline</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        <form onSubmit={submit} className="grid grid-cols-12 gap-2 items-end">
          <div className="col-span-4">
            <Label>Type</Label>
            <Select value={form.action_type} onValueChange={(v) => setForm({ ...form, action_type: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{ACTION_TYPES.map((t) => <SelectItem key={t} value={t} className="capitalize">{t.replace(/_/g," ")}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="col-span-4"><Label>Date</Label><Input type="date" value={form.action_date ?? ""} onChange={(e) => setForm({ ...form, action_date: e.target.value })} /></div>
          <div className="col-span-4"><Label>Document URL</Label><Input type="url" value={form.document_url} onChange={(e) => setForm({ ...form, document_url: e.target.value })} /></div>
          <div className="col-span-12"><Label>Notes</Label><Textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
          <div className="col-span-12 text-right"><Button type="submit" size="sm"><Plus className="mr-1 h-3 w-3" />Add entry</Button></div>
        </form>
        <div className="space-y-2">
          {actions.map((a: any) => (
            <div key={a.id} className="flex items-start justify-between rounded-md border p-3">
              <div>
                <div className="flex items-center gap-2 text-sm">
                  <Badge variant="outline" className="capitalize">{a.action_type.replace(/_/g," ")}</Badge>
                  <span className="text-muted-foreground">{a.action_date}</span>
                </div>
                {a.notes && <div className="mt-1 text-sm whitespace-pre-wrap">{a.notes}</div>}
                {a.document_url && <a href={a.document_url} target="_blank" rel="noreferrer" className="text-xs text-primary underline mt-1 inline-block">View document</a>}
              </div>
              <Button size="sm" variant="ghost" onClick={() => remove(a.id)}><Trash2 className="h-4 w-4" /></Button>
            </div>
          ))}
          {actions.length === 0 && <div className="text-sm text-muted-foreground text-center py-2">No timeline entries</div>}
        </div>
      </CardContent>
    </Card>
  );
}

function ApprovalsTab() {
  const qc = useQueryClient();
  const listFn = useServerFn(listApprovals);
  const decideFn = useServerFn(decideApproval);
  const { data } = useQuery({ queryKey: ["my-approvals"], queryFn: () => listFn({ data: { pending_for_me: true } }) });
  const items = data?.approvals ?? [];
  const [notes, setNotes] = useState<Record<string, string>>({});

  async function act(id: string, decision: "approved" | "rejected") {
    try {
      await decideFn({ data: { approval_id: id, decision, notes: notes[id] || null } });
      toast.success(`Marked ${decision}`);
      qc.invalidateQueries({ queryKey: ["my-approvals"] });
    } catch (e: any) { toast.error(e?.message ?? "Failed"); }
  }

  return (
    <Card>
      <CardHeader><CardTitle>Approvals waiting for me</CardTitle><CardDescription>{items.length} pending</CardDescription></CardHeader>
      <CardContent className="space-y-3">
        {items.map((a: any) => (
          <div key={a.id} className="rounded-md border p-3">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="capitalize">{a.approver_role}</Badge>
              <span className="text-sm font-medium">Case {a.case?.case_number ?? a.case?.id?.slice(0,8)}</span>
              <Badge variant="secondary" className="capitalize">{a.case?.category}</Badge>
              {a.case?.employees && <span className="text-sm text-muted-foreground">· {a.case.employees.first_name} {a.case.employees.last_name}</span>}
            </div>
            {a.notes && <p className="text-sm text-muted-foreground mt-2">{a.notes}</p>}
            <Textarea className="mt-2" rows={2} placeholder="Decision notes (optional)" value={notes[a.id] ?? ""} onChange={(e) => setNotes({ ...notes, [a.id]: e.target.value })} />
            <div className="mt-2 flex gap-2 justify-end">
              <Button size="sm" variant="outline" onClick={() => act(a.id, "rejected")}><XCircle className="mr-1 h-4 w-4" />Reject</Button>
              <Button size="sm" onClick={() => act(a.id, "approved")}><CheckCircle2 className="mr-1 h-4 w-4" />Approve</Button>
            </div>
          </div>
        ))}
        {items.length === 0 && <div className="text-sm text-muted-foreground text-center py-6">No approvals pending</div>}
      </CardContent>
    </Card>
  );
}

function GrievancesTab() {
  const qc = useQueryClient();
  const listFn = useServerFn(listGrievances);
  const updateFn = useServerFn(updateGrievance);
  const { data: hr } = useHrUsers();
  const hrUsers = hr?.users ?? [];
  const { data } = useQuery({ queryKey: ["grievances-all"], queryFn: () => listFn({ data: { scope: "all" } }) });
  const grievances = data?.grievances ?? [];
  const [active, setActive] = useState<any>(null);

  async function setStatus(id: string, status: string) {
    try { await updateFn({ data: { id, status: status as any } }); qc.invalidateQueries({ queryKey: ["grievances-all"] }); toast.success("Updated"); }
    catch (e: any) { toast.error(e?.message ?? "Failed"); }
  }
  async function assign(id: string, userId: string) {
    try { await updateFn({ data: { id, assigned_to: userId || null } }); qc.invalidateQueries({ queryKey: ["grievances-all"] }); }
    catch (e: any) { toast.error(e?.message ?? "Failed"); }
  }

  return (
    <Card>
      <CardHeader><CardTitle>Grievances</CardTitle><CardDescription>{grievances.length} total</CardDescription></CardHeader>
      <CardContent>
        <Table>
          <TableHeader><TableRow>
            <TableHead>Subject</TableHead><TableHead>Filer</TableHead><TableHead>Severity</TableHead>
            <TableHead>Assigned to</TableHead><TableHead>Status</TableHead><TableHead></TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {grievances.map((g: any) => (
              <TableRow key={g.id} className="cursor-pointer" onClick={() => setActive(g)}>
                <TableCell className="max-w-xs truncate">{g.subject}</TableCell>
                <TableCell>{g.is_anonymous ? "Anonymous" : (g.filer ? `${g.filer.first_name} ${g.filer.last_name}` : "—")}</TableCell>
                <TableCell><Badge className={`text-white ${sevColor(g.severity)}`}>{g.severity}</Badge></TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <Select value={g.assigned_to ?? "__none"} onValueChange={(v) => assign(g.id, v === "__none" ? "" : v)}>
                    <SelectTrigger className="h-8 w-40"><SelectValue placeholder="Unassigned" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none">Unassigned</SelectItem>
                      {hrUsers.map((u: any) => <SelectItem key={u.id} value={u.id}>{u.full_name ?? u.email}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <Select value={g.status} onValueChange={(v) => setStatus(g.id, v)}>
                    <SelectTrigger className="h-8 w-36"><SelectValue /></SelectTrigger>
                    <SelectContent>{G_STATUSES.map((s) => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}</SelectContent>
                  </Select>
                </TableCell>
                <TableCell><MessageSquare className="h-4 w-4 text-muted-foreground" /></TableCell>
              </TableRow>
            ))}
            {grievances.length === 0 && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No grievances</TableCell></TableRow>}
          </TableBody>
        </Table>
      </CardContent>

      <Dialog open={!!active} onOpenChange={(v) => !v && setActive(null)}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{active?.subject}</DialogTitle></DialogHeader>
          {active && (<>
            <GrievanceThread grievance={active} canInternal />
            <GrievanceAttachments grievance={active} canUpload />
          </>)}
        </DialogContent>
      </Dialog>
    </Card>
  );
}

export function GrievanceThread({ grievance, canInternal }: { grievance: any; canInternal: boolean }) {
  const qc = useQueryClient();
  const listFn = useServerFn(listGrievanceComments);
  const addFn = useServerFn(addGrievanceComment);
  const { data } = useQuery({ queryKey: ["grievance-comments", grievance.id], queryFn: () => listFn({ data: { grievance_id: grievance.id } }) });
  const comments = data?.comments ?? [];
  const [text, setText] = useState("");
  const [internal, setInternal] = useState(false);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    try {
      await addFn({ data: { grievance_id: grievance.id, comment: text, is_internal: internal } });
      setText(""); setInternal(false);
      qc.invalidateQueries({ queryKey: ["grievance-comments", grievance.id] });
    } catch (e: any) { toast.error(e?.message ?? "Failed"); }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border p-3 bg-muted/30">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Badge variant="outline" className="capitalize">{grievance.category}</Badge>
          <Badge className={`text-white ${sevColor(grievance.severity)}`}>{grievance.severity}</Badge>
          <Badge variant="secondary" className="capitalize">{grievance.status}</Badge>
        </div>
        <p className="mt-2 text-sm whitespace-pre-wrap">{grievance.description}</p>
        {grievance.resolution && (
          <div className="mt-3 rounded-md bg-status-done/10 p-2">
            <div className="text-xs font-medium text-status-done">Resolution</div>
            <div className="text-sm">{grievance.resolution}</div>
          </div>
        )}
      </div>

      <div className="space-y-2">
        {comments.map((c: any) => (
          <div key={c.id} className={`rounded-md border p-3 ${c.is_internal ? "border-status-pending bg-status-pending/5" : ""}`}>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{c.profiles?.full_name ?? c.profiles?.email ?? "User"}</span>
              <span>{new Date(c.created_at).toLocaleString()}</span>
            </div>
            {c.is_internal && <Badge variant="outline" className="mt-1 text-status-pending border-status-pending">Internal</Badge>}
            <p className="mt-1 text-sm whitespace-pre-wrap">{c.comment}</p>
          </div>
        ))}
        {comments.length === 0 && <div className="text-sm text-muted-foreground text-center py-4">No comments yet</div>}
      </div>

      <form onSubmit={send} className="space-y-2">
        <Textarea rows={3} value={text} onChange={(e) => setText(e.target.value)} placeholder="Write a comment…" />
        <div className="flex items-center justify-between">
          {canInternal ? (
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={internal} onChange={(e) => setInternal(e.target.checked)} />
              Internal note (HR only)
            </label>
          ) : <span />}
          <Button type="submit" size="sm">Post</Button>
        </div>
      </form>
    </div>
  );
}

export function GrievanceAttachments({ grievance, canUpload }: { grievance: any; canUpload: boolean }) {
  const qc = useQueryClient();
  const listFn = useServerFn(listGrievanceAttachments);
  const recordFn = useServerFn(recordGrievanceAttachment);
  const delFn = useServerFn(deleteGrievanceAttachment);
  const urlFn = useServerFn(getAttachmentDownloadUrl);
  const { data } = useQuery({ queryKey: ["grievance-attachments", grievance.id], queryFn: () => listFn({ data: { grievance_id: grievance.id } }) });
  const items = data?.attachments ?? [];
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  async function upload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return;
    if (file.size > 20 * 1024 * 1024) { toast.error("Max 20 MB"); return; }
    setBusy(true);
    try {
      const path = `${grievance.tenant_id}/grievance/${grievance.id}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_")}`;
      const { error } = await supabase.storage.from("disciplinary-files").upload(path, file, { upsert: false, contentType: file.type });
      if (error) throw error;
      await recordFn({ data: { grievance_id: grievance.id, storage_path: path, file_name: file.name, mime_type: file.type || null, size_bytes: file.size } });
      toast.success("Uploaded"); qc.invalidateQueries({ queryKey: ["grievance-attachments", grievance.id] });
    } catch (e: any) { toast.error(e?.message ?? "Upload failed"); }
    finally { setBusy(false); if (fileRef.current) fileRef.current.value = ""; }
  }
  async function download(p: string) { try { const r = await urlFn({ data: { storage_path: p } }); window.open(r.url, "_blank"); } catch (e: any) { toast.error(e?.message ?? "Failed"); } }
  async function remove(id: string) { if (!confirm("Delete this file?")) return; try { await delFn({ data: { id } }); qc.invalidateQueries({ queryKey: ["grievance-attachments", grievance.id] }); } catch (e: any) { toast.error(e?.message ?? "Failed"); } }

  return (
    <Card className="mt-4">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-sm flex items-center gap-2"><Paperclip className="h-4 w-4" />Evidence files</CardTitle>
        {canUpload && (<>
          <input ref={fileRef} type="file" className="hidden" onChange={upload} />
          <Button size="sm" variant="outline" disabled={busy} onClick={() => fileRef.current?.click()}>
            <Upload className="mr-1 h-3 w-3" />{busy ? "Uploading…" : "Upload"}
          </Button>
        </>)}
      </CardHeader>
      <CardContent className="space-y-1">
        {items.map((a: any) => (
          <div key={a.id} className="flex items-center justify-between rounded-md border p-2 text-sm">
            <div className="truncate"><Paperclip className="inline h-3 w-3 mr-1" />{a.file_name}</div>
            <div className="flex gap-1">
              <Button size="sm" variant="ghost" onClick={() => download(a.storage_path)}><Download className="h-4 w-4" /></Button>
              {canUpload && <Button size="sm" variant="ghost" onClick={() => remove(a.id)}><Trash2 className="h-4 w-4" /></Button>}
            </div>
          </div>
        ))}
        {items.length === 0 && <div className="text-sm text-muted-foreground text-center py-2">No files</div>}
      </CardContent>
    </Card>
  );
}
