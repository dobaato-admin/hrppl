import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useMyTenant } from "@/hooks/use-tenant";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { applyDefaultAssignmentsForEmployee } from "@/lib/onboarding.functions";
import { listOnboardingTemplates, applyOnboardingTemplate } from "@/lib/templates.functions";
import { getEmployeeTimeline } from "@/lib/hr-extras.functions";
import {
  Briefcase,
  TrendingUp,
  DollarSign,
  UserPlus,
  Clock,
  FileText,
  Upload,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import { BulkEmployeeImportDialog } from "@/components/BulkEmployeeImportDialog";
import { listSuspendedAccounts } from "@/lib/account-suspension.functions";
import {
  AccountSuspensionDialog,
  type SuspensionTarget,
} from "@/components/security/AccountSuspensionDialog";
import { can } from "@/lib/rbac";
import { AdminGate } from "@/components/AdminGate";

export const Route = createFileRoute("/org/employees")({
  head: () => ({ meta: [{ title: "Employees — hrppl" }] }),
  component: () => (
    <AdminGate feature="org.employees">
      <EmployeesPage />
    </AdminGate>
  ),
});

type EmploymentType = "full_time" | "part_time" | "contract" | "intern";
type EmpStatus = "active" | "on_leave" | "terminated";

interface Department {
  id: string;
  name: string;
}
interface Employee {
  id: string;
  employee_number: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  job_title: string | null;
  department_id: string | null;
  employment_type: EmploymentType;
  status: EmpStatus;
  hire_date: string;
  termination_date: string | null;
  base_salary: number | null;
  hourly_rate: number | null;
  pay_frequency: string | null;
  currency_code: string | null;
  /** Null until the employee has accepted an invite and has a login. */
  user_id: string | null;
}
interface Tenant {
  id: string;
  name: string;
  // Nullable to match the `tenants` row as `useMyTenant` reads it: the column
  // is nullable in the schema, and the dialog already falls back when it is
  // absent. Declaring it non-null here only moved the lie to compile time.
  currency_code?: string | null;
  status?: string | null;
}

function EmployeesPage() {
  const { user, roles, loading } = useAuth();
  const navigate = useNavigate();
  // Shared and cached. This page used to read profiles, then tenants, then its
  // own data — three round trips deep before a row appeared — and rendered
  // "No tenant assigned" for the whole of the first two.
  const { tenant, tenantId, isLoading: tenantLoading } = useMyTenant();
  /**
   * Set when the employee read actually failed, as opposed to returning nothing.
   *
   * The two used to be indistinguishable: `const { data: emps }` discarded the
   * error and `emps ?? []` drew the same empty table either way, so a
   * permissions failure, a dropped connection and a genuinely empty
   * organisation all rendered as "No employees yet." Nobody could tell which
   * they were looking at, and the page gave no reason to retry.
   */
  const [loadError, setLoadError] = useState<string | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Employee | null>(null);
  const [timelineFor, setTimelineFor] = useState<Employee | null>(null);
  const [busy, setBusy] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);

  // Account suspension (§1 #4). Keyed on profiles.id (employees.user_id), not
  // employees.id — employees.status is an HR state, not an auth gate.
  const listSuspended = useServerFn(listSuspendedAccounts);
  const [suspendedMap, setSuspendedMap] = useState<Record<string, string | null>>({});
  const [suspendTarget, setSuspendTarget] = useState<SuspensionTarget | null>(null);

  const canManage = roles.includes("org_admin") || roles.includes("super_admin");
  const canSuspend = can("account.suspend", roles);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [loading, user, navigate]);

  async function loadAll() {
    if (!tenantId) return;
    const [empRes, depRes] = await Promise.all([
      supabase
        .from("employees")
        .select("*")
        .eq("tenant_id", tenantId)
        .order("created_at", { ascending: false }),
      supabase.from("departments").select("id,name").eq("tenant_id", tenantId).order("name"),
    ]);

    if (empRes.error) {
      // Logged as well as shown: "the list was empty" and "the request failed"
      // have to be distinguishable in the console too, not just on screen.
      console.error("[employees] list failed", empRes.error);
      setLoadError(empRes.error.message);
      return;
    }
    setLoadError(null);
    setEmployees((empRes.data ?? []) as Employee[]);
    // Departments failing is not fatal — the list still renders, rows just show
    // "—" for the department. Worth a log, not worth blocking on.
    if (depRes.error) console.error("[employees] departments failed", depRes.error);
    setDepartments((depRes.data ?? []) as Department[]);
    await loadSuspended();
  }

  async function loadSuspended() {
    if (!canSuspend) return;
    try {
      const { accounts } = (await listSuspended()) as {
        accounts: { id: string; suspension_reason: string | null }[];
      };
      setSuspendedMap(Object.fromEntries(accounts.map((a) => [a.id, a.suspension_reason])));
    } catch {
      // Non-fatal: the list still renders, rows just lose the suspended badge.
    }
  }

  useEffect(() => {
    loadAll();
    // Keyed on the tenant, not the user: the first render has no tenant yet, so
    // depending on `user` alone ran loadAll before there was anything to scope
    // it to and never ran it again once there was.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenantId]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return employees;
    return employees.filter(
      (e) =>
        e.first_name.toLowerCase().includes(q) ||
        e.last_name.toLowerCase().includes(q) ||
        e.email.toLowerCase().includes(q) ||
        e.employee_number.toLowerCase().includes(q) ||
        (e.job_title ?? "").toLowerCase().includes(q),
    );
  }, [employees, search]);

  function openCreate() {
    setEditing(null);
    setOpen(true);
  }
  function openEdit(e: Employee) {
    setEditing(e);
    setOpen(true);
  }

  async function handleDelete(e: Employee) {
    if (!confirm(`Remove ${e.first_name} ${e.last_name}?`)) return;
    const { error } = await supabase.from("employees").delete().eq("id", e.id);
    if (error) return toast.error(error.message);
    toast.success("Employee removed");
    loadAll();
  }

  if (loading || !user) {
    return (
      <main className="flex min-h-screen items-center justify-center text-muted-foreground">
        Loading…
      </main>
    );
  }

  // Only once we actually know. Rendering this while the lookup is in flight is
  // how the page told org admins they had no organisation.
  if (!tenant && !tenantLoading) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-10">
        <Card>
          <CardHeader>
            <CardTitle>No tenant assigned</CardTitle>
            <CardDescription>
              You must be linked to an organization to manage employees.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/org">
              <Button variant="outline">Back to organization</Button>
            </Link>
          </CardContent>
        </Card>
      </main>
    );
  }

  // Still finding out. Distinct from the branch above, which is the answer.
  if (!tenant) {
    return (
      <main className="flex min-h-screen items-center justify-center text-muted-foreground">
        Loading…
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-xl font-semibold">Employees</h1>
            <p className="text-xs text-muted-foreground">{tenant.name}</p>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/org">
              <Button variant="outline" size="sm">
                Back
              </Button>
            </Link>
            {canManage && (
              <Link to="/admin/departments">
                <Button variant="outline" size="sm" data-testid="manage-departments">
                  Manage departments
                </Button>
              </Link>
            )}
            {canManage && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setBulkOpen(true)}
                data-testid="bulk-import-employees"
              >
                <Upload className="h-4 w-4 mr-1.5" /> Bulk import
              </Button>
            )}
            {canManage && (
              <Button size="sm" onClick={openCreate} data-testid="add-employee">
                Add employee
              </Button>
            )}
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-8 space-y-4">
        <div className="flex items-center gap-3">
          <Input
            placeholder="Search by name, email, number, title…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-md"
          />
          <Badge variant="outline">
            {filtered.length} of {employees.length}
          </Badge>
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Hire date</TableHead>
                  {canManage && <TableHead className="text-right">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {loadError && (
                  <TableRow>
                    <TableCell colSpan={canManage ? 8 : 7} className="py-8 text-center">
                      <p className="font-medium text-destructive">
                        Could not load employees for this organisation.
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">{loadError}</p>
                      <Button
                        size="sm"
                        variant="outline"
                        className="mt-3"
                        onClick={() => {
                          setLoadError(null);
                          void loadAll();
                        }}
                      >
                        Try again
                      </Button>
                    </TableCell>
                  </TableRow>
                )}
                {!loadError && filtered.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={canManage ? 8 : 7}
                      className="text-center text-muted-foreground py-8"
                    >
                      {employees.length === 0
                        ? "No employees yet."
                        : "No employees match your search."}
                    </TableCell>
                  </TableRow>
                )}
                {filtered.map((e) => {
                  const dep = departments.find((d) => d.id === e.department_id)?.name ?? "—";
                  return (
                    <TableRow key={e.id}>
                      <TableCell className="font-mono text-xs">{e.employee_number}</TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {e.first_name} {e.last_name}
                        </div>
                        <div className="text-xs text-muted-foreground">{e.email}</div>
                      </TableCell>
                      <TableCell>{e.job_title ?? "—"}</TableCell>
                      <TableCell>{dep}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{e.employment_type.replace("_", " ")}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap items-center gap-1">
                          <Badge
                            variant={
                              e.status === "active"
                                ? "default"
                                : e.status === "on_leave"
                                  ? "secondary"
                                  : "destructive"
                            }
                          >
                            {e.status.replace("_", " ")}
                          </Badge>
                          {/* Access state is separate from employment state. */}
                          {e.user_id && e.user_id in suspendedMap && (
                            <Badge variant="destructive" className="gap-1">
                              <ShieldAlert className="h-3 w-3" /> Suspended
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{e.hire_date}</TableCell>
                      {canManage && (
                        <TableCell className="text-right space-x-1">
                          <Button size="sm" variant="ghost" asChild title="Full record">
                            <Link to="/admin/employees/$employeeId" params={{ employeeId: e.id }}>
                              <FileText className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setTimelineFor(e)}
                            title="Timeline"
                          >
                            <Clock className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => openEdit(e)}>
                            Edit
                          </Button>
                          {canSuspend && e.user_id && (
                            <Button
                              size="sm"
                              variant="ghost"
                              title={
                                e.user_id in suspendedMap ? "Restore access" : "Suspend account"
                              }
                              onClick={() =>
                                setSuspendTarget({
                                  userId: e.user_id!,
                                  displayName: `${e.first_name} ${e.last_name}`,
                                  suspended: e.user_id! in suspendedMap,
                                  reason: suspendedMap[e.user_id!],
                                })
                              }
                            >
                              {e.user_id in suspendedMap ? (
                                <ShieldCheck className="h-4 w-4 text-status-done" />
                              ) : (
                                <ShieldAlert className="h-4 w-4" />
                              )}
                            </Button>
                          )}
                          <Button size="sm" variant="ghost" onClick={() => handleDelete(e)}>
                            Delete
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </section>

      <EmployeeDialog
        open={open}
        onOpenChange={setOpen}
        tenant={tenant}
        departments={departments}
        editing={editing}
        busy={busy}
        setBusy={setBusy}
        onSaved={() => {
          setOpen(false);
          loadAll();
        }}
      />
      <TimelineDialog employee={timelineFor} onClose={() => setTimelineFor(null)} />
      {tenant && (
        <BulkEmployeeImportDialog
          open={bulkOpen}
          onOpenChange={setBulkOpen}
          tenantId={tenant.id}
          onImported={loadAll}
        />
      )}
      <AccountSuspensionDialog
        target={suspendTarget}
        open={!!suspendTarget}
        onOpenChange={(o) => !o && setSuspendTarget(null)}
        onDone={loadSuspended}
      />
    </main>
  );
}

function TimelineDialog({ employee, onClose }: { employee: Employee | null; onClose: () => void }) {
  const fn = useServerFn(getEmployeeTimeline);
  const { data, isLoading } = useQuery({
    queryKey: ["employee-timeline", employee?.id],
    queryFn: () => fn({ data: { employee_id: employee!.id } }),
    enabled: !!employee,
  });

  const iconFor = (kind: string) => {
    if (kind === "hire") return <UserPlus className="h-4 w-4" />;
    if (kind === "promotion") return <TrendingUp className="h-4 w-4" />;
    if (kind === "pay_rate") return <DollarSign className="h-4 w-4" />;
    if (kind === "designation") return <Briefcase className="h-4 w-4" />;
    return <Briefcase className="h-4 w-4" />;
  };

  return (
    <Dialog open={!!employee} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {employee?.first_name} {employee?.last_name} — Career timeline
          </DialogTitle>
          <DialogDescription>Designations, promotions, and pay-rate history.</DialogDescription>
        </DialogHeader>
        {isLoading ? (
          <div className="text-sm text-muted-foreground py-6">Loading…</div>
        ) : !data?.events?.length ? (
          <div className="text-sm text-muted-foreground py-6">No timeline entries yet.</div>
        ) : (
          <ol className="relative ml-3 border-l border-border pl-6 space-y-5 py-2">
            {data.events.map((ev: any, i: number) => (
              <li key={i} className="relative">
                <span className="absolute -left-[34px] flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary ring-4 ring-background">
                  {iconFor(ev.kind)}
                </span>
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="font-medium text-sm">{ev.title}</div>
                    {ev.detail && <div className="text-xs text-muted-foreground">{ev.detail}</div>}
                    <div className="text-xs text-muted-foreground pt-1 space-x-2">
                      {ev.proposed_by?.name && (
                        <span>
                          Proposed by <span className="text-foreground">{ev.proposed_by.name}</span>
                        </span>
                      )}
                      {ev.decided_by?.name && (
                        <span>
                          · Approved by{" "}
                          <span className="text-foreground">{ev.decided_by.name}</span>
                          {ev.decided_at
                            ? ` on ${new Date(ev.decided_at).toLocaleDateString()}`
                            : ""}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className="text-xs font-mono text-muted-foreground">{ev.date}</span>
                    {ev.status && (
                      <Badge
                        variant={
                          ev.status === "applied"
                            ? "default"
                            : ev.status === "approved"
                              ? "secondary"
                              : ev.status === "rejected"
                                ? "destructive"
                                : "outline"
                        }
                      >
                        {ev.status}
                      </Badge>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ol>
        )}
      </DialogContent>
    </Dialog>
  );
}

function EmployeeDialog({
  open,
  onOpenChange,
  tenant,
  departments,
  editing,
  busy,
  setBusy,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  tenant: Tenant;
  departments: Department[];
  editing: Employee | null;
  busy: boolean;
  setBusy: (v: boolean) => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<Partial<Employee>>({});
  const fnApplyDefaults = useServerFn(applyDefaultAssignmentsForEmployee);
  const fnListTemplates = useServerFn(listOnboardingTemplates);
  const fnApplyTemplate = useServerFn(applyOnboardingTemplate);
  const navigate = useNavigate();

  const [step, setStep] = useState<"form" | "onboard">("form");
  const [newEmpId, setNewEmpId] = useState<string | null>(null);
  const [templates, setTemplates] = useState<Array<{ id: string; name: string }>>([]);
  const [chosenTpl, setChosenTpl] = useState<string>("");
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    if (editing) setForm(editing);
    else
      setForm({
        employment_type: "full_time",
        status: "active",
        hire_date: new Date().toISOString().slice(0, 10),
        currency_code: tenant.currency_code,
      });
    setStep("form");
    setNewEmpId(null);
    setChosenTpl("");
  }, [editing, open, tenant.currency_code]);

  function update<K extends keyof Employee>(key: K, value: Employee[K] | null) {
    setForm((f) => ({ ...f, [key]: value as Employee[K] }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    if (
      !form.employee_number ||
      !form.first_name ||
      !form.last_name ||
      !form.email ||
      !form.hire_date
    ) {
      setBusy(false);
      return toast.error("Please fill in all required fields");
    }
    const payload = {
      tenant_id: tenant.id,
      employee_number: form.employee_number.trim(),
      first_name: form.first_name.trim(),
      last_name: form.last_name.trim(),
      email: form.email.trim().toLowerCase(),
      phone: form.phone?.trim() || null,
      job_title: form.job_title?.trim() || null,
      department_id: form.department_id || null,
      employment_type: form.employment_type ?? "full_time",
      status: form.status ?? "active",
      hire_date: form.hire_date,
      termination_date: form.termination_date || null,
      base_salary:
        form.base_salary != null && (form.base_salary as unknown as string) !== ""
          ? Number(form.base_salary)
          : null,
      hourly_rate:
        form.hourly_rate != null && (form.hourly_rate as unknown as string) !== ""
          ? Number(form.hourly_rate)
          : null,
      pay_frequency: form.pay_frequency || null,
      currency_code: form.currency_code || tenant.currency_code,
    };
    const result = editing
      ? await supabase.from("employees").update(payload).eq("id", editing.id).select("id").single()
      : await supabase.from("employees").insert(payload).select("id").single();
    setBusy(false);
    if (result.error) return toast.error(result.error.message);
    if (!editing && result.data?.id) {
      try {
        await fnApplyDefaults({ data: { employeeId: result.data.id } });
      } catch {
        /* ignore */
      }
      setNewEmpId(result.data.id);
      setStartDate(payload.hire_date);
      try {
        const r = await fnListTemplates();
        const active = (r.templates ?? []).filter((t: any) => t.is_active);
        setTemplates(active.map((t: any) => ({ id: t.id, name: t.name })));
        setStep("onboard");
        return;
      } catch {
        // No templates available — fall through to close.
        toast.success("Employee added");
        onSaved();
        return;
      }
    }
    toast.success(editing ? "Employee updated" : "Employee added");
    onSaved();
  }

  async function applyTpl() {
    if (!newEmpId || !chosenTpl) return;
    setApplying(true);
    try {
      const r = await fnApplyTemplate({
        data: { template_id: chosenTpl, employee_id: newEmpId, start_date: startDate },
      });
      toast.success(`Onboarding started — ${r.enrolled ?? 0} course(s) enrolled`);
      onSaved();
      navigate({ to: "/org/onboarding" });
    } catch (e: any) {
      toast.error(e.message ?? "Couldn't start onboarding");
    } finally {
      setApplying(false);
    }
  }

  if (step === "onboard" && newEmpId) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Start onboarding now?</DialogTitle>
            <DialogDescription>
              Pick an onboarding template to auto-assign the checklist, training and document
              requests.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Template</Label>
              {templates.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  No active templates. Create one in{" "}
                  <Link to="/admin/templates" className="underline">
                    Templates Hub
                  </Link>
                  .
                </p>
              ) : (
                <Select value={chosenTpl} onValueChange={setChosenTpl}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose template" />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Start date</Label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => {
                toast.success("Employee added");
                onSaved();
              }}
            >
              Skip
            </Button>
            <Button onClick={applyTpl} disabled={!chosenTpl || applying}>
              {applying ? "Starting…" : "Apply & open onboarding"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit employee" : "Add employee"}</DialogTitle>
          <DialogDescription>Employee records are scoped to {tenant.name}.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSave} className="grid grid-cols-2 gap-4">
          <Field label="Employee #" required>
            <Input
              value={form.employee_number ?? ""}
              onChange={(e) => update("employee_number", e.target.value)}
              required
            />
          </Field>
          <Field label="Email" required>
            <Input
              type="email"
              value={form.email ?? ""}
              onChange={(e) => update("email", e.target.value)}
              required
            />
          </Field>
          <Field label="First name" required>
            <Input
              value={form.first_name ?? ""}
              onChange={(e) => update("first_name", e.target.value)}
              required
            />
          </Field>
          <Field label="Last name" required>
            <Input
              value={form.last_name ?? ""}
              onChange={(e) => update("last_name", e.target.value)}
              required
            />
          </Field>
          <Field label="Phone">
            <Input value={form.phone ?? ""} onChange={(e) => update("phone", e.target.value)} />
          </Field>
          <Field label="Job title">
            <Input
              value={form.job_title ?? ""}
              onChange={(e) => update("job_title", e.target.value)}
            />
          </Field>
          <Field label="Department">
            <Select
              value={form.department_id ?? "none"}
              onValueChange={(v) => update("department_id", v === "none" ? null : v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">— None —</SelectItem>
                {departments.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Employment type">
            <Select
              value={form.employment_type ?? "full_time"}
              onValueChange={(v) => update("employment_type", v as EmploymentType)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="full_time">Full time</SelectItem>
                <SelectItem value="part_time">Part time</SelectItem>
                <SelectItem value="contract">Contract</SelectItem>
                <SelectItem value="intern">Intern</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Status">
            <Select
              value={form.status ?? "active"}
              onValueChange={(v) => update("status", v as EmpStatus)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="on_leave">On leave</SelectItem>
                <SelectItem value="terminated">Terminated</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Hire date" required>
            <Input
              type="date"
              value={form.hire_date ?? ""}
              onChange={(e) => update("hire_date", e.target.value)}
              required
            />
          </Field>
          <Field label="Termination date">
            <Input
              type="date"
              value={form.termination_date ?? ""}
              onChange={(e) => update("termination_date", e.target.value || null)}
            />
          </Field>
          <div className="col-span-2 mt-2 rounded-lg border bg-muted/30 p-3">
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
              <span>💰 Compensation</span>
              <span className="text-xs font-normal text-muted-foreground">
                — set the pay rate for this new joinee
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              <Field label={`Base salary (${form.currency_code ?? tenant.currency_code})`}>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="e.g. 75000"
                  value={form.base_salary ?? ""}
                  onChange={(e) =>
                    update("base_salary", e.target.value === "" ? null : Number(e.target.value))
                  }
                />
              </Field>
              <Field label={`Hourly rate (${form.currency_code ?? tenant.currency_code})`}>
                <Input
                  type="number"
                  step="0.0001"
                  placeholder="e.g. 38.50"
                  value={form.hourly_rate ?? ""}
                  onChange={(e) =>
                    update(
                      "hourly_rate",
                      e.target.value === ""
                        ? null
                        : (Number(e.target.value) as unknown as Employee["hourly_rate"]),
                    )
                  }
                />
              </Field>
              <Field label="Pay frequency">
                <Select
                  value={form.pay_frequency ?? "none"}
                  onValueChange={(v) => update("pay_frequency", v === "none" ? null : v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">— Not set —</SelectItem>
                    <SelectItem value="hourly">Hourly</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="fortnightly">Fortnightly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="annually">Annually</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </div>
          </div>
          <DialogFooter className="col-span-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={busy}>
              {busy ? "Saving…" : editing ? "Save changes" : "Add employee"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">
        {label}
        {required && <span className="text-destructive"> *</span>}
      </Label>
      {children}
    </div>
  );
}
