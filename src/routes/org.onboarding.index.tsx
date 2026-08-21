import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  upsertChecklist, getDocumentDownloadUrl,
  assignChecklist, updateAssignment, signOffAssignment, removeAssignment, reviewChecklistItem,
  upsertDefaultAssignmentRule, deleteDefaultAssignmentRule,
} from "@/lib/onboarding.functions";
import { previewOnboardingOverdueEmail, sendTestOnboardingOverdueEmail } from "@/lib/onboarding-email-admin.functions";
import { PaySetupPanel } from "@/components/onboarding/PaySetupPanel";

export const Route = createFileRoute("/org/onboarding/")({
  head: () => ({ meta: [{ title: "Onboarding admin — WorldPay HRMS" }] }),
  component: OrgOnboarding,
});

interface Stage { key: string; label: string; order: number }
interface ChecklistItem { key: string; label: string; required: boolean; stage?: string | null }
interface Checklist { id: string; name: string; is_default: boolean; items: ChecklistItem[]; stages?: Stage[] }
interface Emp { id: string; first_name: string; last_name: string; employee_number: string; hire_date: string; department_id: string | null; job_title: string | null }
interface Progress { id: string; employee_id: string; checklist_id: string; item_key: string; approval_status: string; approval_notes: string | null; completed_at: string }
interface Doc { id: string; employee_id: string; file_name: string; doc_type: string; visibility: string; created_at: string }
interface Assignment { id: string; employee_id: string; checklist_id: string; due_date: string | null; status: string; signed_off_at: string | null; signed_off_by: string | null; notes: string | null; assigned_at: string }
interface Department { id: string; name: string }
interface DefaultRule { id: string; checklist_id: string; department_id: string | null; job_title: string | null; due_offset_days: number; is_active: boolean }

function OrgOnboarding() {
  const { user, roles, loading } = useAuth();
  const navigate = useNavigate();
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [tenantCurrency, setTenantCurrency] = useState<string>("");
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [emps, setEmps] = useState<Emp[]>([]);
  const [progress, setProgress] = useState<Progress[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [docs, setDocs] = useState<Doc[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [rules, setRules] = useState<DefaultRule[]>([]);
  const [busy, setBusy] = useState(false);

  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<Checklist | null>(null);
  const [draftName, setDraftName] = useState("");
  const [draftDefault, setDraftDefault] = useState(false);
  const [draftStages, setDraftStages] = useState<Stage[]>([]);
  const [draftItems, setDraftItems] = useState<ChecklistItem[]>([]);

  const [assignOpen, setAssignOpen] = useState(false);
  const [assignEmp, setAssignEmp] = useState<string>("");
  const [assignChecklistId, setAssignChecklistId] = useState<string>("");
  const [assignDue, setAssignDue] = useState<string>("");
  const [assignNotes, setAssignNotes] = useState<string>("");

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailAssignment, setDetailAssignment] = useState<Assignment | null>(null);
  const [signOffNotes, setSignOffNotes] = useState("");

  const [ruleOpen, setRuleOpen] = useState(false);
  const [ruleEditing, setRuleEditing] = useState<DefaultRule | null>(null);
  const [ruleChecklistId, setRuleChecklistId] = useState("");
  const [ruleDeptId, setRuleDeptId] = useState<string>("any");
  const [ruleJobTitle, setRuleJobTitle] = useState("");
  const [ruleOffset, setRuleOffset] = useState(30);
  const [ruleActive, setRuleActive] = useState(true);

  const fnUpsert = useServerFn(upsertChecklist);
  const fnDownload = useServerFn(getDocumentDownloadUrl);
  const fnAssign = useServerFn(assignChecklist);
  const fnUpdate = useServerFn(updateAssignment);
  const fnSignOff = useServerFn(signOffAssignment);
  const fnRemove = useServerFn(removeAssignment);
  const fnReview = useServerFn(reviewChecklistItem);
  const fnUpsertRule = useServerFn(upsertDefaultAssignmentRule);
  const fnDeleteRule = useServerFn(deleteDefaultAssignmentRule);

  const canAccess = roles.includes("org_admin") || roles.includes("super_admin") || roles.includes("manager");
  const isAdmin = roles.includes("org_admin") || roles.includes("super_admin");

  useEffect(() => { if (!loading && !user) navigate({ to: "/auth" }); }, [loading, user, navigate]);
  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase.from("profiles").select("tenant_id").eq("id", user.id).maybeSingle();
      if (data?.tenant_id) {
        setTenantId(data.tenant_id);
        const { data: t } = await supabase.from("tenants").select("currency_code").eq("id", data.tenant_id).maybeSingle();
        if (t?.currency_code) setTenantCurrency(t.currency_code);
      }
    })();
  }, [user]);

  async function load() {
    if (!tenantId) return;
    const [cRes, eRes, pRes, aRes, dRes, depRes, rRes] = await Promise.all([
      supabase.from("onboarding_checklists").select("*").eq("tenant_id", tenantId),
      supabase.from("employees").select("id,first_name,last_name,employee_number,hire_date,department_id,job_title").eq("tenant_id", tenantId).eq("status", "active"),
      supabase.from("onboarding_progress").select("id,employee_id,checklist_id,item_key,approval_status,approval_notes,completed_at").eq("tenant_id", tenantId),
      supabase.from("onboarding_assignments").select("*").eq("tenant_id", tenantId).order("assigned_at", { ascending: false }),
      supabase.from("employee_documents").select("id,employee_id,file_name,doc_type,visibility,created_at").eq("tenant_id", tenantId).order("created_at", { ascending: false }),
      supabase.from("departments").select("id,name").eq("tenant_id", tenantId).order("name"),
      supabase.from("onboarding_default_assignments").select("*").eq("tenant_id", tenantId).order("created_at", { ascending: false }),
    ]);
    setChecklists((cRes.data ?? []) as unknown as Checklist[]);
    setEmps((eRes.data ?? []) as Emp[]);
    setProgress((pRes.data ?? []) as Progress[]);
    setAssignments((aRes.data ?? []) as Assignment[]);
    setDocs((dRes.data ?? []) as Doc[]);
    setDepartments((depRes.data ?? []) as Department[]);
    setRules((rRes.data ?? []) as unknown as DefaultRule[]);
  }
  useEffect(() => { load(); }, [tenantId]);

  function startNew() {
    setEditing(null); setDraftName(""); setDraftDefault(false);
    setDraftStages([]);
    setDraftItems([{ key: "step1", label: "Sign contract", required: true }]);
    setEditOpen(true);
  }
  function startEdit(cl: Checklist) {
    setEditing(cl); setDraftName(cl.name); setDraftDefault(cl.is_default);
    setDraftStages((cl.stages ?? []).map((s) => ({ ...s })));
    setDraftItems(cl.items.map((i) => ({ ...i }))); setEditOpen(true);
  }
  async function saveChecklist() {
    setBusy(true);
    try {
      await fnUpsert({ data: {
        id: editing?.id, name: draftName, isDefault: draftDefault,
        stages: draftStages, items: draftItems,
      } });
      toast.success("Saved"); setEditOpen(false); await load();
    } catch (e: any) { toast.error(e.message); }
    finally { setBusy(false); }
  }

  function startNewRule() {
    setRuleEditing(null);
    setRuleChecklistId(checklists[0]?.id ?? "");
    setRuleDeptId("any"); setRuleJobTitle(""); setRuleOffset(30); setRuleActive(true);
    setRuleOpen(true);
  }
  function startEditRule(r: DefaultRule) {
    setRuleEditing(r);
    setRuleChecklistId(r.checklist_id);
    setRuleDeptId(r.department_id ?? "any");
    setRuleJobTitle(r.job_title ?? "");
    setRuleOffset(r.due_offset_days);
    setRuleActive(r.is_active);
    setRuleOpen(true);
  }
  async function saveRule() {
    if (!ruleChecklistId) { toast.error("Pick a checklist"); return; }
    setBusy(true);
    try {
      await fnUpsertRule({ data: {
        id: ruleEditing?.id,
        checklistId: ruleChecklistId,
        departmentId: ruleDeptId === "any" ? null : ruleDeptId,
        jobTitle: ruleJobTitle.trim() || null,
        dueOffsetDays: ruleOffset,
        isActive: ruleActive,
      } });
      toast.success("Saved"); setRuleOpen(false); await load();
    } catch (e: any) { toast.error(e.message); }
    finally { setBusy(false); }
  }
  async function removeRule(id: string) {
    if (!confirm("Delete this default-assignment rule?")) return;
    setBusy(true);
    try {
      await fnDeleteRule({ data: { id } });
      toast.success("Deleted"); await load();
    } catch (e: any) { toast.error(e.message); }
    finally { setBusy(false); }
  }


  function startAssign(empId?: string) {
    setAssignEmp(empId ?? "");
    setAssignChecklistId("");
    setAssignDue("");
    setAssignNotes("");
    setAssignOpen(true);
  }
  async function doAssign() {
    if (!assignEmp || !assignChecklistId) { toast.error("Pick an employee and a checklist"); return; }
    setBusy(true);
    try {
      await fnAssign({ data: {
        employeeId: assignEmp, checklistId: assignChecklistId,
        dueDate: assignDue || undefined, notes: assignNotes || undefined,
      } });
      toast.success("Assigned"); setAssignOpen(false); await load();
    } catch (e: any) { toast.error(e.message); }
    finally { setBusy(false); }
  }

  function openDetail(a: Assignment) {
    setDetailAssignment(a);
    setSignOffNotes(a.notes ?? "");
    setDetailOpen(true);
  }
  async function doSignOff() {
    if (!detailAssignment) return;
    setBusy(true);
    try {
      await fnSignOff({ data: { assignmentId: detailAssignment.id, notes: signOffNotes || undefined } });
      toast.success("Signed off"); setDetailOpen(false); await load();
    } catch (e: any) { toast.error(e.message); }
    finally { setBusy(false); }
  }
  async function doSetStatus(status: "in_progress" | "completed" | "cancelled") {
    if (!detailAssignment) return;
    setBusy(true);
    try {
      await fnUpdate({ data: { assignmentId: detailAssignment.id, status } });
      toast.success("Updated"); setDetailOpen(false); await load();
    } catch (e: any) { toast.error(e.message); }
    finally { setBusy(false); }
  }
  async function doRemove() {
    if (!detailAssignment) return;
    if (!confirm("Remove this assignment? Progress entries remain.")) return;
    setBusy(true);
    try {
      await fnRemove({ data: { assignmentId: detailAssignment.id } });
      toast.success("Removed"); setDetailOpen(false); await load();
    } catch (e: any) { toast.error(e.message); }
    finally { setBusy(false); }
  }
  async function review(progressId: string, decision: "approved" | "rejected") {
    setBusy(true);
    try {
      const notes = decision === "rejected" ? (prompt("Reason for rejection?") || undefined) : undefined;
      await fnReview({ data: { progressId, decision, notes } });
      toast.success(decision === "approved" ? "Approved" : "Rejected"); await load();
    } catch (e: any) { toast.error(e.message); }
    finally { setBusy(false); }
  }

  async function downloadDoc(id: string) {
    try {
      const { url, fileName } = await fnDownload({ data: { documentId: id } });
      const a = document.createElement("a"); a.href = url; a.download = fileName; a.target = "_blank";
      document.body.appendChild(a); a.click(); a.remove();
    } catch (e: any) { toast.error(e.message); }
  }

  // Assignment progress index
  const progressByAssignment = useMemo(() => {
    const m: Record<string, Progress[]> = {};
    progress.forEach((p) => { (m[`${p.employee_id}:${p.checklist_id}`] ??= []).push(p); });
    return m;
  }, [progress]);

  function assignmentStats(a: Assignment): { done: number; total: number; pct: number } {
    const cl = checklists.find((c) => c.id === a.checklist_id);
    const total = cl?.items.length ?? 0;
    const keys = new Set((progressByAssignment[`${a.employee_id}:${a.checklist_id}`] ?? []).map((p) => p.item_key));
    const done = cl ? cl.items.filter((it) => keys.has(it.key)).length : 0;
    return { done, total, pct: total > 0 ? Math.round((done / total) * 100) : 0 };
  }

  const today = new Date().toISOString().slice(0, 10);

  const detailChecklist = useMemo(
    () => detailAssignment ? checklists.find((c) => c.id === detailAssignment.checklist_id) : null,
    [detailAssignment, checklists],
  );
  const detailProgress = useMemo(
    () => detailAssignment ? (progressByAssignment[`${detailAssignment.employee_id}:${detailAssignment.checklist_id}`] ?? []) : [],
    [detailAssignment, progressByAssignment],
  );
  const detailEmp = useMemo(
    () => detailAssignment ? emps.find((e) => e.id === detailAssignment.employee_id) : null,
    [detailAssignment, emps],
  );

  if (loading || !user) return <main className="flex min-h-screen items-center justify-center text-muted-foreground">Loading…</main>;
  if (!canAccess) return <main className="flex min-h-screen items-center justify-center text-muted-foreground">Forbidden.</main>;

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-xl font-semibold">Onboarding</h1>
            <p className="text-xs text-muted-foreground">Assignments, checklist templates, document review.</p>
          </div>
          <Link to="/org"><Button variant="outline" size="sm">Back</Button></Link>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-8 space-y-6">
        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="pay-setup">Pay setup</TabsTrigger>
            <TabsTrigger value="assignments">Assignments</TabsTrigger>
            <TabsTrigger value="progress">Per-employee</TabsTrigger>
            <TabsTrigger value="checklists">Checklists</TabsTrigger>
            <TabsTrigger value="defaults">Defaults</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="reminders">Reminders</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <OverviewPanel
              assignments={assignments}
              checklists={checklists}
              emps={emps}
              progress={progress}
              today={today}
              assignmentStats={assignmentStats}
            />
          </TabsContent>

          <TabsContent value="pay-setup">
            {tenantId ? <PaySetupPanel tenantId={tenantId} tenantCurrency={tenantCurrency} /> : null}
          </TabsContent>






          <TabsContent value="assignments">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base">New-hire assignments</CardTitle>
                  <CardDescription>Default checklists are auto-assigned when an employee is created.</CardDescription>
                </div>
                <Button size="sm" onClick={() => startAssign()}>Assign checklist</Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader><TableRow>
                    <TableHead>Employee</TableHead><TableHead>Checklist</TableHead>
                    <TableHead>Progress</TableHead><TableHead>Due</TableHead>
                    <TableHead>Status</TableHead><TableHead></TableHead>
                  </TableRow></TableHeader>
                  <TableBody>
                    {assignments.map((a) => {
                      const e = emps.find((x) => x.id === a.employee_id);
                      const cl = checklists.find((c) => c.id === a.checklist_id);
                      const { done, total, pct } = assignmentStats(a);
                      const overdue = a.due_date && a.due_date < today && a.status !== "signed_off";
                      return (
                        <TableRow key={a.id}>
                          <TableCell>
                            <div className="font-medium">{e ? `${e.first_name} ${e.last_name}` : a.employee_id.slice(0, 8)}</div>
                            <div className="text-xs text-muted-foreground">{e?.employee_number}</div>
                          </TableCell>
                          <TableCell>{cl?.name ?? "—"}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="h-2 w-24 rounded bg-muted overflow-hidden"><div className="h-full bg-primary" style={{ width: `${pct}%` }} /></div>
                              <span className="text-xs">{done}/{total}</span>
                            </div>
                          </TableCell>
                          <TableCell className={overdue ? "text-destructive text-sm" : "text-sm"}>
                            {a.due_date ?? "—"}{overdue && " (overdue)"}
                          </TableCell>
                          <TableCell>
                            {a.status === "signed_off" ? <Badge>Signed off</Badge>
                              : a.status === "completed" ? <Badge variant="secondary">Completed</Badge>
                              : a.status === "cancelled" ? <Badge variant="outline">Cancelled</Badge>
                              : <Badge variant="outline">In progress</Badge>}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button size="sm" variant="outline" onClick={() => openDetail(a)}>Open</Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {assignments.length === 0 && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">No assignments yet.</TableCell></TableRow>}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="progress">
            <Card>
              <CardHeader><CardTitle className="text-base">Per-employee summary</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader><TableRow><TableHead>Employee</TableHead><TableHead>Hire date</TableHead><TableHead>Assignments</TableHead><TableHead>Aggregate</TableHead><TableHead></TableHead></TableRow></TableHeader>
                  <TableBody>
                    {emps.map((e) => {
                      const empAsg = assignments.filter((a) => a.employee_id === e.id);
                      const totals = empAsg.reduce((acc, a) => {
                        const s = assignmentStats(a);
                        return { done: acc.done + s.done, total: acc.total + s.total };
                      }, { done: 0, total: 0 });
                      const pct = totals.total ? Math.round((totals.done / totals.total) * 100) : 0;
                      return (
                        <TableRow key={e.id}>
                          <TableCell>
                            <div className="font-medium">{e.first_name} {e.last_name}</div>
                            <div className="text-xs text-muted-foreground">{e.employee_number}</div>
                          </TableCell>
                          <TableCell>{e.hire_date}</TableCell>
                          <TableCell className="text-sm">{empAsg.length}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="h-2 w-32 rounded bg-muted overflow-hidden"><div className="h-full bg-primary" style={{ width: `${pct}%` }} /></div>
                              <span className="text-xs">{totals.done}/{totals.total}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button size="sm" variant="outline" onClick={() => startAssign(e.id)}>Assign…</Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {emps.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">No active employees.</TableCell></TableRow>}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="checklists">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">Checklist templates</CardTitle>
                {isAdmin && <Button size="sm" onClick={startNew}>New checklist</Button>}
              </CardHeader>
              <CardContent className="space-y-3">
                {checklists.map((cl) => {
                  const stages = (cl.stages ?? []).slice().sort((a, b) => a.order - b.order);
                  const grouped: Record<string, ChecklistItem[]> = {};
                  cl.items.forEach((it) => {
                    const k = it.stage || "_unstaged";
                    (grouped[k] ??= []).push(it);
                  });
                  const groupKeys = stages.length
                    ? [...stages.map((s) => s.key), ...Object.keys(grouped).filter((k) => k === "_unstaged" || !stages.some((s) => s.key === k))]
                    : Object.keys(grouped);
                  return (
                    <div key={cl.id} className="rounded-md border p-3 flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="font-medium">{cl.name} {cl.is_default && <Badge variant="outline" className="ml-2 text-xs">Default</Badge>}</div>
                        <div className="text-xs text-muted-foreground">{cl.items.length} items · {stages.length} stages</div>
                        <div className="mt-2 space-y-2">
                          {groupKeys.map((gk) => {
                            const items = grouped[gk] ?? [];
                            if (!items.length) return null;
                            const label = gk === "_unstaged" ? "Unassigned" : (stages.find((s) => s.key === gk)?.label ?? gk);
                            return (
                              <div key={gk}>
                                <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</div>
                                <ul className="text-sm list-disc pl-5">
                                  {items.map((i) => <li key={i.key}>{i.label} {i.required && <span className="text-xs text-muted-foreground">(required)</span>}</li>)}
                                </ul>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      {isAdmin && <Button size="sm" variant="outline" onClick={() => startEdit(cl)}>Edit</Button>}
                    </div>
                  );
                })}
                {checklists.length === 0 && <p className="text-sm text-muted-foreground">No checklists yet.</p>}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="defaults">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base">Default assignment rules</CardTitle>
                  <CardDescription>Auto-assign checklists to new hires by department or job title. Leave both blank to apply to all new employees.</CardDescription>
                </div>
                {isAdmin && <Button size="sm" onClick={startNewRule} disabled={!checklists.length}>New rule</Button>}
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader><TableRow>
                    <TableHead>Checklist</TableHead><TableHead>Department</TableHead>
                    <TableHead>Job title</TableHead><TableHead>Due in</TableHead>
                    <TableHead>Status</TableHead><TableHead></TableHead>
                  </TableRow></TableHeader>
                  <TableBody>
                    {rules.map((r) => {
                      const cl = checklists.find((c) => c.id === r.checklist_id);
                      const dep = r.department_id ? departments.find((d) => d.id === r.department_id) : null;
                      return (
                        <TableRow key={r.id}>
                          <TableCell className="font-medium">{cl?.name ?? r.checklist_id.slice(0, 8)}</TableCell>
                          <TableCell>{dep?.name ?? <span className="text-muted-foreground">Any</span>}</TableCell>
                          <TableCell>{r.job_title ?? <span className="text-muted-foreground">Any</span>}</TableCell>
                          <TableCell className="text-sm">{r.due_offset_days} days after hire</TableCell>
                          <TableCell>{r.is_active ? <Badge>Active</Badge> : <Badge variant="outline">Inactive</Badge>}</TableCell>
                          <TableCell className="text-right">
                            {isAdmin && <>
                              <Button size="sm" variant="outline" onClick={() => startEditRule(r)}>Edit</Button>
                              <Button size="sm" variant="outline" className="ml-1" onClick={() => removeRule(r.id)}>Delete</Button>
                            </>}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {rules.length === 0 && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">No rules configured. New hires will use checklists marked "Default for new hires".</TableCell></TableRow>}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents">
            <Card>
              <CardHeader><CardTitle className="text-base">All employee documents</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader><TableRow><TableHead>Employee</TableHead><TableHead>File</TableHead><TableHead>Type</TableHead><TableHead>Visibility</TableHead><TableHead>Uploaded</TableHead><TableHead></TableHead></TableRow></TableHeader>
                  <TableBody>
                    {docs.map((d) => {
                      const e = emps.find((x) => x.id === d.employee_id);
                      return (
                        <TableRow key={d.id}>
                          <TableCell>{e ? `${e.first_name} ${e.last_name}` : d.employee_id}</TableCell>
                          <TableCell className="font-medium">{d.file_name}</TableCell>
                          <TableCell>{d.doc_type}</TableCell>
                          <TableCell><Badge variant="outline">{d.visibility}</Badge></TableCell>
                          <TableCell className="text-xs text-muted-foreground">{new Date(d.created_at).toLocaleDateString()}</TableCell>
                          <TableCell className="text-right"><Button size="sm" variant="outline" onClick={() => downloadDoc(d.id)}>Download</Button></TableCell>
                        </TableRow>
                      );
                    })}
                    {docs.length === 0 && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">No documents.</TableCell></TableRow>}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="reminders">
            <ReminderPreviewPanel emps={emps} checklists={checklists} assignments={assignments} />
          </TabsContent>
        </Tabs>
      </section>

      {/* Edit checklist dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "Edit checklist" : "New checklist"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Name</Label><Input value={draftName} onChange={(e) => setDraftName(e.target.value)} /></div>
            <div className="flex items-center gap-2"><Switch checked={draftDefault} onCheckedChange={setDraftDefault} /><Label>Default for new hires (legacy fallback)</Label></div>

            <div>
              <Label>Stages (optional)</Label>
              <p className="text-xs text-muted-foreground mb-1">Group items into phases like pre-boarding, day 1, week 1, first month.</p>
              <div className="space-y-2">
                {draftStages.map((s, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <Input value={s.key} onChange={(e) => { const arr = [...draftStages]; arr[idx].key = e.target.value; setDraftStages(arr); }} className="w-32" placeholder="key" />
                    <Input value={s.label} onChange={(e) => { const arr = [...draftStages]; arr[idx].label = e.target.value; setDraftStages(arr); }} placeholder="Label" />
                    <Input type="number" value={s.order} onChange={(e) => { const arr = [...draftStages]; arr[idx].order = Number(e.target.value) || 0; setDraftStages(arr); }} className="w-20" placeholder="order" />
                    <Button size="sm" variant="outline" onClick={() => setDraftStages(draftStages.filter((_, i) => i !== idx))}>×</Button>
                  </div>
                ))}
                <Button size="sm" variant="outline" onClick={() => setDraftStages([...draftStages, { key: `stage${draftStages.length + 1}`, label: "", order: draftStages.length }])}>Add stage</Button>
              </div>
            </div>

            <div>
              <Label>Items</Label>
              <div className="space-y-2">
                {draftItems.map((it, idx) => (
                  <div key={idx} className="flex flex-wrap items-center gap-2">
                    <Input value={it.key} onChange={(e) => { const arr = [...draftItems]; arr[idx].key = e.target.value; setDraftItems(arr); }} className="w-32" placeholder="key" />
                    <Input value={it.label} onChange={(e) => { const arr = [...draftItems]; arr[idx].label = e.target.value; setDraftItems(arr); }} className="flex-1 min-w-[160px]" placeholder="Label" />
                    <Select value={it.stage ?? "_none"} onValueChange={(v) => { const arr = [...draftItems]; arr[idx].stage = v === "_none" ? null : v; setDraftItems(arr); }}>
                      <SelectTrigger className="w-36"><SelectValue placeholder="Stage" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="_none">No stage</SelectItem>
                        {draftStages.map((s) => <SelectItem key={s.key} value={s.key}>{s.label || s.key}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <label className="flex items-center gap-1 text-xs"><input type="checkbox" checked={it.required} onChange={(e) => { const arr = [...draftItems]; arr[idx].required = e.target.checked; setDraftItems(arr); }} />Required</label>
                    <Button size="sm" variant="outline" onClick={() => setDraftItems(draftItems.filter((_, i) => i !== idx))}>×</Button>
                  </div>
                ))}
                <Button size="sm" variant="outline" onClick={() => setDraftItems([...draftItems, { key: `step${draftItems.length + 1}`, label: "", required: true }])}>Add item</Button>
              </div>
            </div>
          </div>
          <DialogFooter><Button onClick={saveChecklist} disabled={busy || !draftName.trim()}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Default-assignment rule dialog */}
      <Dialog open={ruleOpen} onOpenChange={setRuleOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{ruleEditing ? "Edit rule" : "New default-assignment rule"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Checklist</Label>
              <Select value={ruleChecklistId} onValueChange={setRuleChecklistId}>
                <SelectTrigger><SelectValue placeholder="Select checklist" /></SelectTrigger>
                <SelectContent>{checklists.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Department (optional)</Label>
              <Select value={ruleDeptId} onValueChange={setRuleDeptId}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any department</SelectItem>
                  {departments.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Job title (optional, exact match)</Label>
              <Input value={ruleJobTitle} onChange={(e) => setRuleJobTitle(e.target.value)} placeholder="e.g. Software Engineer" />
            </div>
            <div>
              <Label>Due in (days after hire)</Label>
              <Input type="number" min={0} value={ruleOffset} onChange={(e) => setRuleOffset(Number(e.target.value) || 0)} />
            </div>
            <div className="flex items-center gap-2"><Switch checked={ruleActive} onCheckedChange={setRuleActive} /><Label>Active</Label></div>
          </div>
          <DialogFooter><Button onClick={saveRule} disabled={busy}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>


      {/* Assign dialog */}
      <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Assign checklist</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Employee</Label>
              <Select value={assignEmp} onValueChange={setAssignEmp}>
                <SelectTrigger><SelectValue placeholder="Select employee" /></SelectTrigger>
                <SelectContent>{emps.map((e) => <SelectItem key={e.id} value={e.id}>{e.first_name} {e.last_name} · {e.employee_number}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Checklist</Label>
              <Select value={assignChecklistId} onValueChange={setAssignChecklistId}>
                <SelectTrigger><SelectValue placeholder="Select checklist" /></SelectTrigger>
                <SelectContent>{checklists.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}{c.is_default ? " (default)" : ""}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Due date (optional)</Label>
              <Input type="date" value={assignDue} onChange={(e) => setAssignDue(e.target.value)} />
            </div>
            <div>
              <Label>Notes (optional)</Label>
              <Textarea rows={2} value={assignNotes} onChange={(e) => setAssignNotes(e.target.value)} />
            </div>
          </div>
          <DialogFooter><Button onClick={doAssign} disabled={busy}>Assign</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assignment detail dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {detailEmp ? `${detailEmp.first_name} ${detailEmp.last_name}` : "Assignment"} — {detailChecklist?.name}
            </DialogTitle>
          </DialogHeader>
          {detailAssignment && detailChecklist && (
            <div className="space-y-3">
              <div className="text-sm text-muted-foreground">
                {detailAssignment.due_date ? `Due ${detailAssignment.due_date}` : "No due date"} ·{" "}
                Status: {detailAssignment.status.replace("_", " ")}
                {detailAssignment.signed_off_at && (
                  <span> · Signed off {new Date(detailAssignment.signed_off_at).toLocaleDateString()}</span>
                )}
              </div>

              <div className="space-y-2 border-t pt-3">
                {detailChecklist.items.map((it) => {
                  const pr = detailProgress.find((p) => p.item_key === it.key);
                  return (
                    <div key={it.key} className="flex items-start justify-between gap-3 rounded-md border p-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Badge variant={pr ? "secondary" : "outline"} className="text-xs">{pr ? "Done" : "Pending"}</Badge>
                          <span className="text-sm">{it.label}</span>
                          {it.required && <Badge variant="outline" className="text-xs">Required</Badge>}
                          {pr?.approval_status === "approved" && <Badge className="text-xs">Approved</Badge>}
                          {pr?.approval_status === "rejected" && <Badge variant="destructive" className="text-xs">Rejected</Badge>}
                        </div>
                        {pr?.approval_notes && <p className="text-xs text-muted-foreground mt-1">Note: {pr.approval_notes}</p>}
                      </div>
                      {pr && pr.approval_status === "pending" && (
                        <div className="flex gap-1">
                          <Button size="sm" variant="outline" onClick={() => review(pr.id, "approved")}>Approve</Button>
                          <Button size="sm" variant="outline" onClick={() => review(pr.id, "rejected")}>Reject</Button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="border-t pt-3">
                <Label>Sign-off / notes</Label>
                <Textarea rows={2} value={signOffNotes} onChange={(e) => setSignOffNotes(e.target.value)} />
              </div>
            </div>
          )}
          <DialogFooter className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={doRemove} disabled={busy}>Remove</Button>
            <div className="flex-1" />
            <Button variant="outline" onClick={() => doSetStatus("cancelled")} disabled={busy}>Cancel assignment</Button>
            <Button variant="outline" onClick={() => doSetStatus("in_progress")} disabled={busy}>Reopen</Button>
            <Button onClick={doSignOff} disabled={busy}>Sign off</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}

function OverviewPanel({
  assignments, checklists, emps, progress, today, assignmentStats,
}: {
  assignments: Assignment[];
  checklists: Checklist[];
  emps: Emp[];
  progress: Progress[];
  today: string;
  assignmentStats: (a: Assignment) => { done: number; total: number; pct: number };
}) {
  const active = assignments.filter((a) => a.status === "in_progress" || a.status === "completed");
  const overdue = active.filter((a) => a.due_date && a.due_date < today && a.status !== "signed_off");
  const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0, 0, 0, 0);
  const signedOffMonth = assignments.filter((a) => a.status === "signed_off" && a.signed_off_at && new Date(a.signed_off_at) >= monthStart);
  const avgPct = active.length === 0 ? 0 : Math.round(active.reduce((s, a) => s + assignmentStats(a).pct, 0) / active.length);
  const pendingReviews = progress.filter((p) => p.approval_status === "pending").length;

  // Hires in the last 30 days without any assignment
  const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - 30);
  const cutoffStr = cutoff.toISOString().slice(0, 10);
  const empsWithAssignments = new Set(assignments.map((a) => a.employee_id));
  const newHiresMissing = emps.filter((e) => e.hire_date >= cutoffStr && !empsWithAssignments.has(e.id));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        <Stat label="Active" value={active.length} />
        <Stat label="Overdue" value={overdue.length} tone={overdue.length > 0 ? "destructive" : undefined} />
        <Stat label="Signed off this month" value={signedOffMonth.length} />
        <Stat label="Avg progress" value={`${avgPct}%`} />
        <Stat label="Pending reviews" value={pendingReviews} tone={pendingReviews > 0 ? "warning" : undefined} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Overdue assignments</CardTitle>
          <CardDescription>Past their due date and not yet signed off.</CardDescription>
        </CardHeader>
        <CardContent>
          {overdue.length === 0 ? (
            <p className="text-sm text-muted-foreground">No overdue assignments. 🎉</p>
          ) : (
            <Table>
              <TableHeader><TableRow>
                <TableHead>Employee</TableHead><TableHead>Checklist</TableHead>
                <TableHead>Due</TableHead><TableHead>Progress</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {overdue.slice(0, 10).map((a) => {
                  const e = emps.find((x) => x.id === a.employee_id);
                  const cl = checklists.find((c) => c.id === a.checklist_id);
                  const { done, total, pct } = assignmentStats(a);
                  return (
                    <TableRow key={a.id}>
                      <TableCell>{e ? `${e.first_name} ${e.last_name}` : a.employee_id.slice(0, 8)}</TableCell>
                      <TableCell>{cl?.name ?? "—"}</TableCell>
                      <TableCell className="text-destructive text-sm">{a.due_date}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-24 rounded bg-muted overflow-hidden"><div className="h-full bg-primary" style={{ width: `${pct}%` }} /></div>
                          <span className="text-xs">{done}/{total}</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">New hires without onboarding</CardTitle>
          <CardDescription>Hired in the last 30 days with no checklist assigned.</CardDescription>
        </CardHeader>
        <CardContent>
          {newHiresMissing.length === 0 ? (
            <p className="text-sm text-muted-foreground">All recent hires have onboarding assignments.</p>
          ) : (
            <Table>
              <TableHeader><TableRow>
                <TableHead>Employee</TableHead><TableHead>Hire date</TableHead><TableHead>Title</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {newHiresMissing.slice(0, 10).map((e) => (
                  <TableRow key={e.id}>
                    <TableCell>{e.first_name} {e.last_name} <span className="text-xs text-muted-foreground">({e.employee_number})</span></TableCell>
                    <TableCell className="text-sm">{e.hire_date}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{e.job_title ?? "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: number | string; tone?: "destructive" | "warning" }) {
  const cls = tone === "destructive" ? "text-destructive" : tone === "warning" ? "text-amber-600 dark:text-amber-400" : "";
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
        <div className={`mt-1 text-2xl font-semibold ${cls}`}>{value}</div>
      </CardContent>
    </Card>
  );
}

function ReminderPreviewPanel({
  emps,
  checklists,
  assignments,
}: {
  emps: Emp[];
  checklists: Checklist[];
  assignments: Assignment[];
}) {
  const fnPreview = useServerFn(previewOnboardingOverdueEmail);
  const fnSendTest = useServerFn(sendTestOnboardingOverdueEmail);

  const [audience, setAudience] = useState<"employee" | "manager">("employee");
  const [empId, setEmpId] = useState<string>("");
  const [checklistId, setChecklistId] = useState<string>("");
  const [overrideEmail, setOverrideEmail] = useState<string>("");
  const [html, setHtml] = useState<string>("");
  const [subject, setSubject] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  // If the selected employee + checklist matches an existing assignment, prefer it
  const matchedAssignment = useMemo(() => {
    if (!empId || !checklistId) return null;
    return assignments.find((a) => a.employee_id === empId && a.checklist_id === checklistId) ?? null;
  }, [empId, checklistId, assignments]);

  async function loadPreview() {
    setLoading(true);
    try {
      const res = await fnPreview({
        data: {
          audience,
          employeeId: empId || undefined,
          checklistId: checklistId || undefined,
          assignmentId: matchedAssignment?.id,
        },
      });
      setHtml((res as any).html);
      setSubject((res as any).subject);
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to render preview");
    } finally {
      setLoading(false);
    }
  }

  async function sendTest() {
    setSending(true);
    try {
      const res = await fnSendTest({
        data: {
          audience,
          employeeId: empId || undefined,
          checklistId: checklistId || undefined,
          assignmentId: matchedAssignment?.id,
          overrideEmail: overrideEmail.trim() || undefined,
        },
      });
      toast.success(`Test email queued to ${(res as any).recipientEmail}`);
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to send test email");
    } finally {
      setSending(false);
    }
  }

  // Auto-render preview when key inputs change
  useEffect(() => {
    if (empId && checklistId) {
      loadPreview();
    } else {
      setHtml("");
      setSubject("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audience, empId, checklistId, matchedAssignment?.id]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Overdue onboarding reminder</CardTitle>
        <CardDescription>
          Preview the email recipients receive when an onboarding checklist is past its due date,
          and send a one-off test for a selected employee and checklist.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-4">
          <div className="space-y-1">
            <Label>Audience</Label>
            <Select value={audience} onValueChange={(v) => setAudience(v as any)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="employee">Employee</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>Employee</Label>
            <Select value={empId} onValueChange={setEmpId}>
              <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
              <SelectContent>
                {emps.map((e) => (
                  <SelectItem key={e.id} value={e.id}>
                    {e.first_name} {e.last_name} ({e.employee_number})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>Checklist</Label>
            <Select value={checklistId} onValueChange={setChecklistId}>
              <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
              <SelectContent>
                {checklists.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>Send test to (optional)</Label>
            <Input
              type="email"
              placeholder="override@example.com"
              value={overrideEmail}
              onChange={(e) => setOverrideEmail(e.target.value)}
            />
          </div>
        </div>

        {matchedAssignment && (
          <div className="text-xs text-muted-foreground">
            Using existing assignment due {matchedAssignment.due_date ?? "—"} (status {matchedAssignment.status}).
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" onClick={loadPreview} disabled={loading || !empId || !checklistId}>
            {loading ? "Rendering…" : "Refresh preview"}
          </Button>
          <Button onClick={sendTest} disabled={sending || !empId || !checklistId}>
            {sending ? "Sending…" : "Send test email"}
          </Button>
        </div>

        <div className="rounded-md border">
          <div className="border-b px-3 py-2 text-xs text-muted-foreground">
            <span className="font-medium text-foreground">Subject:</span> {subject || "—"}
          </div>
          {html ? (
            <iframe
              title="Onboarding overdue email preview"
              srcDoc={html}
              className="h-[520px] w-full rounded-b-md bg-white"
              sandbox=""
            />
          ) : (
            <div className="p-8 text-center text-sm text-muted-foreground">
              Select an employee and checklist to render the preview.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
