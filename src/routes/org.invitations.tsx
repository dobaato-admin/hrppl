import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { can } from "@/lib/rbac";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  inviteStaff,
  listTenantInvitations,
  resendInvitation,
  revokeInvitation,
} from "@/lib/staff-invitations.functions";
import { getPayrollReadiness, getOvertimeReadiness } from "@/lib/payroll-setup.functions";
import { getLeaveReadiness } from "@/lib/leave-setup.functions";
import { toast } from "sonner";
import { Plus, RefreshCcw, Ban, Copy, UserPlus, AlertTriangle, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/org/invitations")({
  head: () => ({ meta: [{ title: "Staff invitations — WorldPay HRMS" }] }),
  component: OrgInvitationsPage,
});

interface Department {
  id: string;
  name: string;
}

function OrgInvitationsPage() {
  const { user, roles, loading, rolesLoaded } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const listFn = useServerFn(listTenantInvitations);
  const inviteFn = useServerFn(inviteStaff);
  const resendFn = useServerFn(resendInvitation);
  const revokeFn = useServerFn(revokeInvitation);
  const isElevated = roles.includes("org_admin") || roles.includes("super_admin");
  // W5 · Derived from this page's nav feature key rather than a
  // hand-rolled list, so the sidebar and the page cannot give different
  // answers to "who may be here".
  const canAccess = can("org.invitations", roles);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const AU_STATES = ["NSW", "VIC", "QLD", "WA", "SA", "TAS", "ACT", "NT"];
  type Duty = { title: string; description: string; weight: number; kpi_target: string };
  const [duties, setDuties] = useState<Duty[]>([]);
  const [form, setForm] = useState<{
    email: string;
    first_name: string;
    last_name: string;
    job_title: string;
    department_id: string;
    state_region: string;
    role: "employee" | "manager" | "org_admin" | "branch_admin" | "hr" | "finance";
  }>({
    email: "",
    first_name: "",
    last_name: "",
    job_title: "",
    department_id: "",
    state_region: "",
    role: "employee",
  });
  const dutyWeightTotal = duties.reduce((s, d) => s + (Number(d.weight) || 0), 0);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
    else if (!loading && user && rolesLoaded && !canAccess) {
      toast.error("Not authorized to manage invitations");
      navigate({ to: "/dashboard" });
    }
  }, [loading, user, canAccess, navigate]);

  useEffect(() => {
    if (!canAccess) return;
    supabase
      .from("departments")
      .select("id,name")
      .order("name")
      .then(({ data }) => setDepartments((data ?? []) as Department[]));
  }, [canAccess]);

  const { data, isLoading } = useQuery({
    queryKey: ["tenant-invitations"],
    queryFn: () => listFn({}),
    enabled: canAccess,
  });

  const readinessFn = useServerFn(getPayrollReadiness);
  const readinessQ = useQuery({
    queryKey: ["payroll-readiness"],
    queryFn: () => readinessFn(),
    enabled: canAccess,
  });
  const overtimeFn = useServerFn(getOvertimeReadiness);
  const overtimeQ = useQuery({
    queryKey: ["overtime-readiness"],
    queryFn: () => overtimeFn(),
    enabled: canAccess,
  });
  const leaveReadinessFn = useServerFn(getLeaveReadiness);
  const leaveReadinessQ = useQuery({
    queryKey: ["leave-readiness"],
    queryFn: () => leaveReadinessFn(),
    enabled: canAccess,
  });
  const readiness = readinessQ.data;
  const overtimeReadiness = overtimeQ.data;
  const leaveReadiness = leaveReadinessQ.data;
  const payrollComplete = !!readiness?.allComplete;
  const overtimeComplete = !!overtimeReadiness?.allComplete;
  const leaveComplete = !!leaveReadiness?.allComplete;
  const setupComplete = payrollComplete && overtimeComplete && leaveComplete;
  const missingPayroll = readiness
    ? Object.entries(readiness.steps)
        .filter(([, ok]) => !ok)
        .map(([k]) => k)
    : [];
  const missingLeave = leaveReadiness
    ? Object.entries(leaveReadiness.steps)
        .filter(([, ok]) => !ok)
        .map(([k]) => k)
    : [];

  async function send(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const res: any = await inviteFn({
        data: {
          ...form,
          department_id: form.department_id || null,
          duties: duties.map((d) => ({ ...d, weight: Number(d.weight) || 0 })),
        },
      });
      toast.success("Invitation sent");
      if (res?.warning) toast.warning(res.warning);
      setForm({
        email: "",
        first_name: "",
        last_name: "",
        job_title: "",
        department_id: "",
        state_region: "",
        role: "employee",
      });
      setDuties([]);
      setOpen(false);
      qc.invalidateQueries({ queryKey: ["tenant-invitations"] });
    } catch (e: any) {
      toast.error(e?.message ?? "Failed");
    } finally {
      setBusy(false);
    }
  }

  if (loading || (user && !rolesLoaded)) {
    return (
      <main className="flex min-h-screen items-center justify-center text-muted-foreground">
        Loading…
      </main>
    );
  }

  if (!user)
    return (
      <main className="flex min-h-screen items-center justify-center text-muted-foreground">
        Loading…
      </main>
    );
  if (!canAccess)
    return (
      <main className="flex min-h-screen items-center justify-center text-muted-foreground">
        Forbidden.
      </main>
    );

  return (
    <AppShell
      title="Staff invitations"
      subtitle="Invite your team and track who's joined"
      actions={
        <Dialog
          open={open}
          onOpenChange={(o) => {
            if (o && !setupComplete) {
              toast.error("Complete payroll, overtime and leave setup first");
              return;
            }
            setOpen(o);
          }}
        >
          <DialogTrigger asChild>
            <Button
              size="sm"
              disabled={!setupComplete}
              title={setupComplete ? "" : "Complete payroll, overtime and leave setup first"}
            >
              <Plus className="mr-1 h-4 w-4" /> Invite staff
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite a teammate</DialogTitle>
            </DialogHeader>
            <form onSubmit={send} className="space-y-3">
              <div className="space-y-2">
                <Label>Work email</Label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>First name</Label>
                  <Input
                    value={form.first_name}
                    onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Last name</Label>
                  <Input
                    value={form.last_name}
                    onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Job title</Label>
                <Input
                  value={form.job_title}
                  onChange={(e) => setForm({ ...form, job_title: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Department</Label>
                  <Select
                    value={form.department_id}
                    onValueChange={(v) => setForm({ ...form, department_id: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Optional" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((d) => (
                        <SelectItem key={d.id} value={d.id}>
                          {d.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Select
                    value={form.role}
                    onValueChange={(v: any) => setForm({ ...form, role: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="employee">Employee</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      {isElevated && <SelectItem value="hr">HR</SelectItem>}
                      {isElevated && <SelectItem value="finance">Finance</SelectItem>}
                      {isElevated && <SelectItem value="branch_admin">Branch Admin</SelectItem>}
                      {isElevated && <SelectItem value="org_admin">Org Admin</SelectItem>}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>State / region (AU)</Label>
                <Select
                  value={form.state_region}
                  onValueChange={(v) => setForm({ ...form, state_region: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Optional — picks up state public holidays" />
                  </SelectTrigger>
                  <SelectContent>
                    {AU_STATES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Used to apply the right state's public holidays automatically. You can override
                  individual holidays later.
                </p>
              </div>
              <div className="space-y-2 rounded-md border p-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-semibold">KPI duties &amp; responsibilities</Label>
                  <div className="text-xs text-muted-foreground">
                    Weights total:{" "}
                    <span
                      className={
                        dutyWeightTotal === 100 ? "text-emerald-600 font-medium" : "text-amber-600"
                      }
                    >
                      {dutyWeightTotal}%
                    </span>
                  </div>
                </div>
                {duties.length === 0 && (
                  <p className="text-xs text-muted-foreground">
                    Add the core duties this hire will be reviewed against. Each duty has a weight
                    (0–100). Total should add to 100%.
                  </p>
                )}
                {duties.map((d, i) => (
                  <div key={i} className="space-y-2 rounded border p-2">
                    <div className="grid grid-cols-[1fr_88px_auto] gap-2">
                      <Input
                        placeholder="Duty title (e.g. Meet sales quota)"
                        value={d.title}
                        onChange={(e) =>
                          setDuties(
                            duties.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)),
                          )
                        }
                      />
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        placeholder="Weight %"
                        value={d.weight as any}
                        onChange={(e) =>
                          setDuties(
                            duties.map((x, j) =>
                              j === i ? { ...x, weight: Number(e.target.value) } : x,
                            ),
                          )
                        }
                      />
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => setDuties(duties.filter((_, j) => j !== i))}
                      >
                        ×
                      </Button>
                    </div>
                    <Input
                      placeholder="KPI target (e.g. $50k / qtr, NPS ≥ 70)"
                      value={d.kpi_target}
                      onChange={(e) =>
                        setDuties(
                          duties.map((x, j) =>
                            j === i ? { ...x, kpi_target: e.target.value } : x,
                          ),
                        )
                      }
                    />
                    <Input
                      placeholder="Description (optional)"
                      value={d.description}
                      onChange={(e) =>
                        setDuties(
                          duties.map((x, j) =>
                            j === i ? { ...x, description: e.target.value } : x,
                          ),
                        )
                      }
                    />
                  </div>
                ))}
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    setDuties([
                      ...duties,
                      { title: "", description: "", weight: 0, kpi_target: "" },
                    ])
                  }
                >
                  + Add duty
                </Button>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={busy}>
                  {busy ? "Sending…" : "Send invitation"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      }
    >
      <section className="mx-auto max-w-6xl space-y-6 p-4 md:p-6">
        <Card
          className={
            setupComplete
              ? "border-emerald-200 bg-emerald-50/40 dark:border-emerald-900 dark:bg-emerald-950/20"
              : "border-amber-300 bg-amber-50/40 dark:border-amber-900 dark:bg-amber-950/20"
          }
        >
          <CardHeader>
            <div className="flex items-center gap-2">
              {setupComplete ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-amber-700 dark:text-amber-300" />
              )}
              <CardTitle>Onboarding readiness</CardTitle>
            </div>
            <CardDescription>
              {setupComplete
                ? "All required setup is complete. You can invite employees."
                : "Employee invitations are hard-blocked until every section below is complete."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <ReadinessRow
              label="Payroll"
              done={payrollComplete}
              detail={
                payrollComplete
                  ? "Pay items, dates, currency configured"
                  : missingPayroll.length
                    ? `Outstanding: ${missingPayroll.join(", ")}`
                    : "Pending"
              }
              wizardLabel="Open payroll checklist"
              to="/admin/payroll-setup-wizard"
            />
            <ReadinessRow
              label="Overtime & penalty rates"
              done={overtimeComplete}
              detail={
                overtimeComplete
                  ? `${overtimeReadiness?.rateCount ?? 0} rate(s) configured`
                  : "Add at least one overtime or penalty rate"
              }
              wizardLabel="Open overtime wizard"
              to="/admin/overtime-setup-wizard"
            />
            <ReadinessRow
              label="Leave"
              done={leaveComplete}
              detail={
                leaveComplete
                  ? "Leave types, accruals, approval routing configured"
                  : missingLeave.length
                    ? `Outstanding: ${missingLeave.join(", ")}`
                    : "Pending"
              }
              wizardLabel="Open leave wizard"
              to="/admin/leave-setup-wizard"
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-primary" />
              <CardTitle>Invitations</CardTitle>
            </div>
            <CardDescription>
              Invitations expire after 14 days. Resend or revoke as needed.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-sm text-muted-foreground">Loading…</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Sent</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(data?.invitations ?? []).length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-muted-foreground">
                        No invitations yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    (data?.invitations ?? []).map((inv: any) => (
                      <TableRow key={inv.id}>
                        <TableCell className="font-medium">{inv.email}</TableCell>
                        <TableCell>
                          {[inv.first_name, inv.last_name].filter(Boolean).join(" ") || "—"}
                          {inv.job_title && (
                            <div className="text-xs text-muted-foreground">{inv.job_title}</div>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{inv.role}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              inv.status === "accepted"
                                ? "default"
                                : inv.status === "pending"
                                  ? "secondary"
                                  : "outline"
                            }
                          >
                            {inv.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {new Date(inv.last_sent_at ?? inv.created_at).toLocaleDateString()} (
                          {inv.send_count}×)
                        </TableCell>
                        <TableCell className="text-right space-x-1">
                          {inv.status === "pending" && (
                            <>
                              <Button
                                size="sm"
                                variant="ghost"
                                title="Copy invite link"
                                onClick={async () => {
                                  const url = `${window.location.origin}/invite/${inv.token}`;
                                  try {
                                    await navigator.clipboard.writeText(url);
                                    toast.success("Invite link copied");
                                  } catch {
                                    toast.error("Could not copy — link: " + url);
                                  }
                                }}
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                title="Resend email"
                                onClick={async () => {
                                  await resendFn({ data: { id: inv.id } });
                                  toast.success("Resent");
                                  qc.invalidateQueries({ queryKey: ["tenant-invitations"] });
                                }}
                              >
                                <RefreshCcw className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                title="Revoke"
                                onClick={async () => {
                                  await revokeFn({ data: { id: inv.id } });
                                  toast.success("Revoked");
                                  qc.invalidateQueries({ queryKey: ["tenant-invitations"] });
                                }}
                              >
                                <Ban className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </section>
    </AppShell>
  );
}

function ReadinessRow({
  label,
  done,
  detail,
  wizardLabel,
  to,
}: {
  label: string;
  done: boolean;
  detail: string;
  wizardLabel: string;
  to: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-md border bg-background p-3">
      <div className="flex items-start gap-3">
        {done ? (
          <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-600" />
        ) : (
          <AlertTriangle className="mt-0.5 h-5 w-5 text-amber-600" />
        )}
        <div>
          <div className="text-sm font-medium">
            {label}{" "}
            {done ? (
              <Badge variant="secondary" className="ml-1">
                Complete
              </Badge>
            ) : (
              <Badge variant="outline" className="ml-1">
                Pending
              </Badge>
            )}
          </div>
          <div className="text-xs text-muted-foreground">{detail}</div>
        </div>
      </div>
      <Button asChild size="sm" variant={done ? "outline" : "default"}>
        <Link to={to}>{wizardLabel}</Link>
      </Button>
    </div>
  );
}
