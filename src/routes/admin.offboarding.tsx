import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { listEmployeesForAdmin } from "@/lib/timeline.functions";
import { listDepartments } from "@/lib/departments.functions";
import {
  listOffboarding,
  createOffboarding,
  getOffboarding,
  updateOffboarding,
  toggleChecklistItem,
  addChecklistItem,
  listOffboardingTemplates,
  upsertOffboardingTemplate,
  deleteOffboardingTemplate,
  upsertOffboardingTemplateItem,
  deleteOffboardingTemplateItem,
} from "@/lib/offboarding.functions";
import { AdminGate } from "@/components/AdminGate";
import { OFFBOARDING_ROLES } from "@/lib/rbac";
import { CommsRemovalPanel } from "@/components/offboarding/CommsRemovalPanel";

/**
 * Named component, not an inline arrow on the route options.
 *
 * TanStack renders errorComponent as a component, so useRouter() works at
 * runtime — but inside a lowercase inline arrow, react-hooks/rules-of-hooks
 * cannot verify it and flags an error. Hoisting it makes the lint honest
 * without changing behaviour.
 */
function OffboardingError({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  return (
    <div className="p-6">
      <p className="text-destructive">{error.message}</p>
      <Button
        onClick={() => {
          reset();
          router.invalidate();
        }}
      >
        Retry
      </Button>
    </div>
  );
}

export const Route = createFileRoute("/admin/offboarding")({
  // OFFBOARDING_ROLES, not ADMIN_LAYOUT_ROLES: the gate must match the RLS
  // policy on offboarding_cases. See the comment on the constant.
  component: () => (
    <AdminGate allow={OFFBOARDING_ROLES}>
      <OffboardingPage />
    </AdminGate>
  ),
  errorComponent: ({ error, reset }) => <OffboardingError error={error as Error} reset={reset} />,
  notFoundComponent: () => <div className="p-6">Not found</div>,
});

const REASONS = [
  "resignation",
  "termination",
  "redundancy",
  "retirement",
  "end_of_contract",
  "mutual_separation",
  "death",
  "other",
] as const;
const STATUSES = ["initiated", "in_progress", "clearance_pending", "completed", "cancelled"];

type OffboardingReason = (typeof REASONS)[number];

interface EmployeeOption {
  id: string;
  first_name: string;
  last_name: string;
}

/**
 * Typed so the payload reaching createOffboarding is checked at compile time.
 * This was previously `form as any`, which is how a form whose `reason` is a
 * bare string reached a server fn expecting an enum without complaint.
 */
interface InitiateForm {
  employeeId: string;
  reason: OffboardingReason;
  reasonNotes: string;
  noticeGivenOn: string;
  lastWorkingDay: string;
  confidential: boolean;
}

function OffboardingPage() {
  const qc = useQueryClient();
  const fList = useServerFn(listOffboarding);
  const fCreate = useServerFn(createOffboarding);
  const fGet = useServerFn(getOffboarding);
  const fUpdate = useServerFn(updateOffboarding);
  const fToggle = useServerFn(toggleChecklistItem);
  const fAdd = useServerFn(addChecklistItem);
  const fEmps = useServerFn(listEmployeesForAdmin);

  const empsQ = useQuery({ queryKey: ["emps-admin"], queryFn: () => fEmps() });
  const listQ = useQuery({ queryKey: ["offboarding"], queryFn: () => fList() });

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const detailQ = useQuery({
    queryKey: ["offboarding", selectedId],
    queryFn: () => fGet({ data: { id: selectedId! } }),
    enabled: !!selectedId,
  });

  const [form, setForm] = useState<InitiateForm>({
    employeeId: "",
    reason: "resignation",
    reasonNotes: "",
    noticeGivenOn: "",
    lastWorkingDay: "",
    confidential: false,
  });
  const createM = useMutation({
    mutationFn: () => fCreate({ data: form }),
    onSuccess: (r: any) => {
      toast.success("Offboarding initiated");
      qc.invalidateQueries({ queryKey: ["offboarding"] });
      setForm({
        employeeId: "",
        reason: "resignation",
        reasonNotes: "",
        noticeGivenOn: "",
        lastWorkingDay: "",
        confidential: false,
      });
      setSelectedId(r?.case?.id ?? null);
    },
    onError: (e: any) => toast.error(e.message),
  });
  const statusM = useMutation({
    mutationFn: (status: string) => fUpdate({ data: { id: selectedId!, status: status as any } }),
    onSuccess: () => {
      toast.success("Updated");
      qc.invalidateQueries({ queryKey: ["offboarding"] });
      qc.invalidateQueries({ queryKey: ["offboarding", selectedId] });
    },
  });
  const toggleM = useMutation({
    mutationFn: (v: { id: string; completed: boolean }) =>
      fToggle({ data: { itemId: v.id, completed: v.completed } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["offboarding", selectedId] }),
  });

  const [newItem, setNewItem] = useState({
    title: "",
    category: "general",
    ownerRole: "hr" as const,
    dueDate: "",
    isBlocking: false,
  });
  const addM = useMutation({
    mutationFn: () => fAdd({ data: { caseId: selectedId!, ...newItem } as any }),
    onSuccess: () => {
      setNewItem({
        title: "",
        category: "general",
        ownerRole: "hr",
        dueDate: "",
        isBlocking: false,
      });
      qc.invalidateQueries({ queryKey: ["offboarding", selectedId] });
    },
  });

  const [interview, setInterview] = useState({
    exitInterviewNotes: "",
    exitInterviewRating: 3,
    rehireEligible: true,
    knowledgeTransferNotes: "",
    finalPayStatus: "",
  });
  const saveInterviewM = useMutation({
    mutationFn: () => fUpdate({ data: { id: selectedId!, ...interview } as any }),
    onSuccess: () => {
      toast.success("Saved");
      qc.invalidateQueries({ queryKey: ["offboarding", selectedId] });
    },
  });

  return (
    <AppShell
      title="Exit & offboarding"
      subtitle="Manage employee exits, clearance, asset return, exit interviews and final pay."
    >
      <div className="p-4">
        <Tabs defaultValue="cases">
          <TabsList>
            <TabsTrigger value="cases">Cases</TabsTrigger>
            <TabsTrigger value="templates">Checklist templates</TabsTrigger>
          </TabsList>
          <TabsContent value="cases" className="mt-4">
            <div className="grid gap-4 lg:grid-cols-[1fr_2fr]">
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Initiate offboarding</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Label>Employee</Label>
                      {empsQ.data?.noTenantScope ? (
                        // A platform account with no tenant. Previously this listed
                        // every employee in every tenant and then failed on insert;
                        // say what's wrong instead.
                        <p className="rounded border border-dashed p-3 text-sm text-muted-foreground">
                          Your account isn&rsquo;t attached to an organization, so there are no
                          employees to offboard. Open the organization from{" "}
                          <Link to="/platform/tenants" className="underline">
                            Tenants
                          </Link>{" "}
                          first.
                        </p>
                      ) : (
                        <Select
                          value={form.employeeId}
                          onValueChange={(v) => setForm({ ...form, employeeId: v })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select employee" />
                          </SelectTrigger>
                          <SelectContent>
                            {(empsQ.data?.employees ?? []).map((e: EmployeeOption) => (
                              <SelectItem key={e.id} value={e.id}>
                                {e.first_name} {e.last_name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                    <div>
                      <Label>Reason</Label>
                      <Select
                        value={form.reason}
                        onValueChange={(v) => setForm({ ...form, reason: v as OffboardingReason })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {REASONS.map((r) => (
                            <SelectItem key={r} value={r} className="capitalize">
                              {r.replace(/_/g, " ")}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>Notice given</Label>
                        <Input
                          type="date"
                          value={form.noticeGivenOn}
                          onChange={(e) => setForm({ ...form, noticeGivenOn: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>Last working day</Label>
                        <Input
                          type="date"
                          value={form.lastWorkingDay}
                          onChange={(e) => setForm({ ...form, lastWorkingDay: e.target.value })}
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Notes</Label>
                      <Textarea
                        rows={2}
                        value={form.reasonNotes}
                        onChange={(e) => setForm({ ...form, reasonNotes: e.target.value })}
                      />
                    </div>
                    <div className="flex items-center justify-between rounded border p-2">
                      <Label>Confidential (HR only)</Label>
                      <Switch
                        checked={form.confidential}
                        onCheckedChange={(v) => setForm({ ...form, confidential: v })}
                      />
                    </div>
                    <Button
                      disabled={!form.employeeId || createM.isPending}
                      onClick={() => createM.mutate()}
                      className="w-full"
                    >
                      {createM.isPending ? "Saving…" : "Initiate offboarding"}
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Open cases</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {(listQ.data?.cases ?? []).map((c: any) => (
                      <button
                        key={c.id}
                        onClick={() => setSelectedId(c.id)}
                        className={`w-full rounded border p-2 text-left text-sm hover:bg-accent ${selectedId === c.id ? "border-primary" : ""}`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {c.employees?.first_name} {c.employees?.last_name}
                          </span>
                          <Badge variant="outline" className="capitalize">
                            {c.reason.replace(/_/g, " ")}
                          </Badge>
                          <Badge className="capitalize ml-auto">
                            {c.status.replace(/_/g, " ")}
                          </Badge>
                        </div>
                        {c.last_working_day && (
                          <p className="mt-1 text-xs text-muted-foreground">
                            Last day: {c.last_working_day}
                          </p>
                        )}
                      </button>
                    ))}
                    {(listQ.data?.cases ?? []).length === 0 && (
                      <p className="text-sm text-muted-foreground">No cases yet.</p>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-4">
                {!selectedId ? (
                  <Card>
                    <CardContent className="p-6 text-sm text-muted-foreground">
                      Select a case to manage clearance, exit interview and final steps.
                    </CardContent>
                  </Card>
                ) : detailQ.isLoading ? (
                  <Card>
                    <CardContent className="p-6 text-sm">Loading…</CardContent>
                  </Card>
                ) : (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Case overview</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2 text-sm">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-medium">
                            {detailQ.data?.case?.employees?.first_name}{" "}
                            {detailQ.data?.case?.employees?.last_name}
                          </span>
                          <Badge variant="outline" className="capitalize">
                            {detailQ.data?.case?.reason?.replace(/_/g, " ")}
                          </Badge>
                          <Link
                            to="/admin/employees/$employeeId"
                            params={{ employeeId: detailQ.data?.case?.employee_id }}
                            className="text-xs text-primary hover:underline ml-auto"
                          >
                            Full record →
                          </Link>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {STATUSES.map((s) => (
                            <Button
                              key={s}
                              size="sm"
                              variant={detailQ.data?.case?.status === s ? "default" : "outline"}
                              onClick={() => statusM.mutate(s)}
                              className="capitalize"
                            >
                              {s.replace(/_/g, " ")}
                            </Button>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Clearance checklist</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {(detailQ.data?.items ?? []).map((it: any) => (
                          <label
                            key={it.id}
                            className="flex items-start gap-2 rounded border p-2 text-sm"
                          >
                            <input
                              type="checkbox"
                              checked={it.completed}
                              onChange={(e) =>
                                toggleM.mutate({ id: it.id, completed: e.target.checked })
                              }
                              className="mt-1"
                            />
                            <div className="flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <span
                                  className={
                                    it.completed
                                      ? "line-through text-muted-foreground"
                                      : "font-medium"
                                  }
                                >
                                  {it.title}
                                </span>
                                <Badge variant="outline" className="capitalize">
                                  {it.owner_role}
                                </Badge>
                                {it.is_blocking && <Badge variant="outline">Blocking</Badge>}
                                {it.due_date && (
                                  <span className="text-xs text-muted-foreground ml-auto">
                                    Due {it.due_date}
                                  </span>
                                )}
                              </div>
                            </div>
                          </label>
                        ))}
                        <div className="mt-3 grid grid-cols-1 gap-2 rounded border p-2 md:grid-cols-5">
                          <Input
                            placeholder="New task title"
                            value={newItem.title}
                            onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                            className="md:col-span-2"
                          />
                          <Select
                            value={newItem.ownerRole}
                            onValueChange={(v: any) => setNewItem({ ...newItem, ownerRole: v })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {["hr", "manager", "employee", "it", "finance"].map((r) => (
                                <SelectItem key={r} value={r} className="capitalize">
                                  {r}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Input
                            type="date"
                            value={newItem.dueDate}
                            onChange={(e) => setNewItem({ ...newItem, dueDate: e.target.value })}
                          />
                          <Button
                            disabled={!newItem.title || addM.isPending}
                            onClick={() => addM.mutate()}
                          >
                            Add
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Exit interview & final</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <Label>Exit interview notes</Label>
                          <Textarea
                            rows={3}
                            value={interview.exitInterviewNotes}
                            onChange={(e) =>
                              setInterview({ ...interview, exitInterviewNotes: e.target.value })
                            }
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label>Overall rating (1–5)</Label>
                            <Input
                              type="number"
                              min={1}
                              max={5}
                              value={interview.exitInterviewRating}
                              onChange={(e) =>
                                setInterview({
                                  ...interview,
                                  exitInterviewRating: Number(e.target.value),
                                })
                              }
                            />
                          </div>
                          <div className="flex items-center justify-between rounded border p-2">
                            <Label>Eligible for rehire</Label>
                            <Switch
                              checked={interview.rehireEligible}
                              onCheckedChange={(v) =>
                                setInterview({ ...interview, rehireEligible: v })
                              }
                            />
                          </div>
                        </div>
                        <div>
                          <Label>Knowledge transfer</Label>
                          <Textarea
                            rows={2}
                            value={interview.knowledgeTransferNotes}
                            onChange={(e) =>
                              setInterview({ ...interview, knowledgeTransferNotes: e.target.value })
                            }
                          />
                        </div>
                        <div>
                          <Label>Final pay status</Label>
                          <Input
                            value={interview.finalPayStatus}
                            onChange={(e) =>
                              setInterview({ ...interview, finalPayStatus: e.target.value })
                            }
                            placeholder="e.g. processed, pending tax, paid on 2026-07-05"
                          />
                        </div>
                        <Button
                          onClick={() => saveInterviewM.mutate()}
                          disabled={saveInterviewM.isPending}
                          className="w-full"
                        >
                          {saveInterviewM.isPending ? "Saving…" : "Save exit details"}
                        </Button>
                      </CardContent>
                    </Card>

                    <CommsRemovalPanel caseId={selectedId!} />
                  </>
                )}
              </div>
            </div>
          </TabsContent>
          <TabsContent value="templates" className="mt-4">
            <TemplatesPanel />
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}

const REASON_OPTIONS = [
  "any",
  "resignation",
  "termination",
  "redundancy",
  "retirement",
  "end_of_contract",
  "mutual_separation",
  "death",
  "other",
];
const OWNER_ROLES = ["hr", "manager", "employee", "it", "finance"];

function TemplatesPanel() {
  const qc = useQueryClient();
  const fList = useServerFn(listOffboardingTemplates);
  const fUpsert = useServerFn(upsertOffboardingTemplate);
  const fDelete = useServerFn(deleteOffboardingTemplate);
  const fUpsertItem = useServerFn(upsertOffboardingTemplateItem);
  const fDeleteItem = useServerFn(deleteOffboardingTemplateItem);
  const fDepts = useServerFn(listDepartments);

  const tplQ = useQuery({ queryKey: ["offb-templates"], queryFn: () => fList() });
  const deptQ = useQuery({ queryKey: ["depts"], queryFn: () => fDepts() });

  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    departmentId: "any",
    reason: "any",
    isDefault: false,
    isActive: true,
  });
  const [newItem, setNewItem] = useState({
    title: "",
    category: "general",
    ownerRole: "hr",
    dueOffsetDays: 0,
    isBlocking: false,
    sortOrder: 100,
  });

  const startNew = () => {
    setEditing({ id: null });
    setForm({
      name: "",
      description: "",
      departmentId: "any",
      reason: "any",
      isDefault: false,
      isActive: true,
    });
  };
  const startEdit = (t: any) => {
    setEditing(t);
    setForm({
      name: t.name,
      description: t.description ?? "",
      departmentId: t.department_id ?? "any",
      reason: t.reason ?? "any",
      isDefault: t.is_default,
      isActive: t.is_active,
    });
  };

  const saveM = useMutation({
    mutationFn: () =>
      fUpsert({
        data: {
          id: editing?.id ?? undefined,
          name: form.name,
          description: form.description || undefined,
          departmentId: form.departmentId === "any" ? null : form.departmentId,
          reason: form.reason === "any" ? null : (form.reason as any),
          isDefault: form.isDefault,
          isActive: form.isActive,
        } as any,
      }),
    onSuccess: (r: any) => {
      toast.success("Template saved");
      qc.invalidateQueries({ queryKey: ["offb-templates"] });
      setEditing({ id: r.id });
    },
    onError: (e: any) => toast.error(e.message),
  });
  const deleteM = useMutation({
    mutationFn: (id: string) => fDelete({ data: { id } }),
    onSuccess: () => {
      toast.success("Deleted");
      qc.invalidateQueries({ queryKey: ["offb-templates"] });
      setEditing(null);
    },
  });
  const addItemM = useMutation({
    mutationFn: () => fUpsertItem({ data: { templateId: editing!.id, ...newItem } as any }),
    onSuccess: () => {
      setNewItem({
        title: "",
        category: "general",
        ownerRole: "hr",
        dueOffsetDays: 0,
        isBlocking: false,
        sortOrder: 100,
      });
      qc.invalidateQueries({ queryKey: ["offb-templates"] });
    },
    onError: (e: any) => toast.error(e.message),
  });
  const delItemM = useMutation({
    mutationFn: (id: string) => fDeleteItem({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["offb-templates"] }),
  });

  const templates = tplQ.data?.templates ?? [];
  const allItems = tplQ.data?.items ?? [];
  const items = editing?.id ? allItems.filter((i: any) => i.template_id === editing.id) : [];

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_2fr]">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Templates</CardTitle>
          <Button size="sm" onClick={startNew}>
            New
          </Button>
        </CardHeader>
        <CardContent className="space-y-2">
          {templates.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No templates yet. Click <strong>New</strong> to build one.
            </p>
          )}
          {templates.map((t: any) => {
            const dept = (deptQ.data?.departments ?? []).find((d: any) => d.id === t.department_id);
            return (
              <button
                key={t.id}
                onClick={() => startEdit(t)}
                className={`w-full rounded border p-2 text-left text-sm hover:bg-accent ${editing?.id === t.id ? "border-primary" : ""}`}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium">{t.name}</span>
                  {t.is_default && <Badge>Default</Badge>}
                  {!t.is_active && <Badge variant="outline">Inactive</Badge>}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {dept ? dept.name : "All departments"} ·{" "}
                  {t.reason ? t.reason.replace(/_/g, " ") : "Any reason"}
                </p>
              </button>
            );
          })}
        </CardContent>
      </Card>

      <div className="space-y-4">
        {!editing ? (
          <Card>
            <CardContent className="p-6 text-sm text-muted-foreground">
              Select a template to edit, or create a new one. The most specific match (department +
              reason) wins when an offboarding case is opened.
            </CardContent>
          </Card>
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  {editing.id ? "Edit template" : "New template"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Name</Label>
                    <Input
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Department</Label>
                    <Select
                      value={form.departmentId}
                      onValueChange={(v) => setForm({ ...form, departmentId: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">All departments</SelectItem>
                        {(deptQ.data?.departments ?? []).map((d: any) => (
                          <SelectItem key={d.id} value={d.id}>
                            {d.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Reason</Label>
                    <Select
                      value={form.reason}
                      onValueChange={(v) => setForm({ ...form, reason: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {REASON_OPTIONS.map((r) => (
                          <SelectItem key={r} value={r} className="capitalize">
                            {r.replace(/_/g, " ")}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-5">
                    <label className="flex items-center justify-between rounded border p-2 text-sm">
                      <span>Default</span>
                      <Switch
                        checked={form.isDefault}
                        onCheckedChange={(v) => setForm({ ...form, isDefault: v })}
                      />
                    </label>
                    <label className="flex items-center justify-between rounded border p-2 text-sm">
                      <span>Active</span>
                      <Switch
                        checked={form.isActive}
                        onCheckedChange={(v) => setForm({ ...form, isActive: v })}
                      />
                    </label>
                  </div>
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea
                    rows={2}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                  />
                </div>
                <div className="flex gap-2">
                  <Button disabled={!form.name || saveM.isPending} onClick={() => saveM.mutate()}>
                    {editing.id ? "Save changes" : "Create template"}
                  </Button>
                  {editing.id && (
                    <Button
                      variant="destructive"
                      onClick={() => {
                        if (window.confirm("Delete template?")) deleteM.mutate(editing.id);
                      }}
                    >
                      Delete
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {editing.id && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Tasks</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {items.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      No tasks yet. Add the clearance steps that should be created automatically.
                    </p>
                  )}
                  {items.map((it: any) => (
                    <div
                      key={it.id}
                      className="flex flex-wrap items-center gap-2 rounded border p-2 text-sm"
                    >
                      <span className="font-mono text-xs w-8">{it.sort_order}</span>
                      <span className="font-medium">{it.title}</span>
                      <Badge variant="outline" className="capitalize">
                        {it.owner_role}
                      </Badge>
                      {it.is_blocking && <Badge variant="outline">Blocking</Badge>}
                      <span className="ml-auto text-xs text-muted-foreground">
                        +{it.due_offset_days}d
                      </span>
                      <Button size="sm" variant="ghost" onClick={() => delItemM.mutate(it.id)}>
                        Remove
                      </Button>
                    </div>
                  ))}
                  <div className="mt-3 grid grid-cols-1 gap-2 rounded border p-2 md:grid-cols-6">
                    <Input
                      placeholder="Task title"
                      value={newItem.title}
                      onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                      className="md:col-span-2"
                    />
                    <Select
                      value={newItem.ownerRole}
                      onValueChange={(v) => setNewItem({ ...newItem, ownerRole: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {OWNER_ROLES.map((r) => (
                          <SelectItem key={r} value={r} className="capitalize">
                            {r}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      type="number"
                      placeholder="Offset days"
                      value={newItem.dueOffsetDays}
                      onChange={(e) =>
                        setNewItem({ ...newItem, dueOffsetDays: Number(e.target.value || 0) })
                      }
                    />
                    <Input
                      type="number"
                      placeholder="Order"
                      value={newItem.sortOrder}
                      onChange={(e) =>
                        setNewItem({ ...newItem, sortOrder: Number(e.target.value || 0) })
                      }
                    />
                    <Button
                      disabled={!newItem.title || addItemM.isPending}
                      onClick={() => addItemM.mutate()}
                    >
                      Add task
                    </Button>
                  </div>
                  <label className="flex items-center gap-2 text-xs">
                    <input
                      type="checkbox"
                      checked={newItem.isBlocking}
                      onChange={(e) => setNewItem({ ...newItem, isBlocking: e.target.checked })}
                    />{" "}
                    Blocking task
                  </label>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}
