import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import {
  getLeaveReadiness,
  upsertLeaveTypeQuick,
  listLeaveApprovalRoutes,
  upsertLeaveApprovalRoute,
  deleteLeaveApprovalRoute,
  listTenantApprovers,
} from "@/lib/leave-setup.functions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2 } from "lucide-react";
import { AdminGate } from "@/components/AdminGate";
import { ORG_ADMIN_ONLY } from "@/lib/rbac";
import { ExistingList } from "@/components/setup/ExistingList";

export const Route = createFileRoute("/admin/leave-setup-wizard")({
  head: () => ({ meta: [{ title: "Leave Setup Wizard — hrppl" }] }),
  component: () => (
    <AdminGate allow={ORG_ADMIN_ONLY}>
      <LeaveWizard />
    </AdminGate>
  ),
});

type StepKey = "leaveTypes" | "accruals" | "approvalRouting";
const STEPS: { key: StepKey; title: string; blurb: string }[] = [
  {
    key: "leaveTypes",
    title: "Leave types",
    blurb: "Define at least one active leave category (annual, sick, etc.).",
  },
  {
    key: "accruals",
    title: "Accruals & quotas",
    blurb: "Each active type must have a non-zero annual quota or monthly accrual.",
  },
  {
    key: "approvalRouting",
    title: "Approval routing",
    blurb: "At least one approver (Manager / HR / Org Admin) must exist in the org.",
  },
];

function LeaveWizard() {
  const { user, roles, loading, rolesLoaded } = useAuth();
  const navigate = useNavigate();
  const canAccess = roles.includes("org_admin") || roles.includes("super_admin");
  const qc = useQueryClient();

  const fetchReadiness = useServerFn(getLeaveReadiness);
  const readinessQ = useQuery({
    queryKey: ["leave-readiness"],
    queryFn: () => fetchReadiness(),
    enabled: !!user && rolesLoaded && canAccess,
  });
  const [step, setStep] = useState(0);

  if (loading || (user && !rolesLoaded))
    return (
      <main className="flex min-h-screen items-center justify-center text-muted-foreground">
        Loading…
      </main>
    );
  if (!user)
    return (
      <main className="flex min-h-screen items-center justify-center text-muted-foreground">
        Sign in required.
      </main>
    );

  const steps = readinessQ.data?.steps ?? {
    leaveTypes: false,
    accruals: false,
    approvalRouting: false,
  };
  const allComplete = !!readinessQ.data?.allComplete;
  const active = STEPS[step];
  const refresh = () => qc.invalidateQueries({ queryKey: ["leave-readiness"] });

  return (
    <AppShell
      title="Leave Setup Wizard"
      subtitle="Step 3 of admin setup — required before inviting employees"
    >
      <div className="mx-auto max-w-4xl space-y-6 p-6">
        <Card>
          <CardHeader>
            <CardTitle>Setup progress</CardTitle>
            <CardDescription>
              Employee invitations are blocked until leave types, accruals, and approval routing are
              configured.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {STEPS.map((s, i) => {
                const done = steps[s.key];
                const isActive = i === step;
                return (
                  <li key={s.key}>
                    <button
                      type="button"
                      onClick={() => setStep(i)}
                      className={`flex w-full items-center gap-2 rounded-md border p-3 text-left transition ${
                        isActive ? "border-primary bg-primary/5" : "border-border hover:bg-muted/40"
                      }`}
                    >
                      {done ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                      ) : (
                        <Circle className="h-5 w-5 text-muted-foreground" />
                      )}
                      <div>
                        <div className="text-sm font-medium">
                          {i + 1}. {s.title}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {done ? "Complete" : "Pending"}
                        </div>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ol>
            {allComplete && (
              <div className="mt-4 flex items-center justify-between rounded-md border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-900 dark:bg-emerald-950/30">
                <div className="text-sm text-emerald-900 dark:text-emerald-200">
                  Leave setup complete. You're ready to invite employees.
                </div>
                <Button size="sm" onClick={() => navigate({ to: "/org/invitations" })}>
                  Invite employees <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              Step {step + 1}: {active.title}{" "}
              {steps[active.key] && (
                <Badge variant="secondary" className="ml-2">
                  Complete
                </Badge>
              )}
            </CardTitle>
            <CardDescription>{active.blurb}</CardDescription>
          </CardHeader>
          <CardContent>
            {active.key === "leaveTypes" && (
              <LeaveTypeStep types={readinessQ.data?.types ?? []} onSaved={refresh} />
            )}
            {active.key === "accruals" && <AccrualsStep ok={steps.accruals} onSaved={refresh} />}
            {active.key === "approvalRouting" && <ApprovalStep ok={steps.approvalRouting} />}
          </CardContent>
        </Card>

        <div className="flex justify-between">
          <Button
            variant="ghost"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
          >
            Back
          </Button>
          <Button
            onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}
            disabled={step === STEPS.length - 1}
          >
            Next <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          Manage the full list on the{" "}
          <Link to="/admin/leave-types" className="underline">
            Leave types
          </Link>{" "}
          page.
        </p>
      </div>
    </AppShell>
  );
}

function LeaveTypeStep({ types, onSaved }: { types: any[]; onSaved: () => void }) {
  const save = useServerFn(upsertLeaveTypeQuick);
  const [code, setCode] = useState("ANNUAL");
  const [name, setName] = useState("Annual leave");
  const [quota, setQuota] = useState("20");
  const [accrual, setAccrual] = useState("1.67");
  const [requiresApproval, setRequiresApproval] = useState(true);
  const [isPaid, setIsPaid] = useState(true);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true);
    try {
      await save({
        data: {
          code,
          name,
          color: "#3b82f6",
          annual_quota_days: Number(quota) || 0,
          accrual_per_month: Number(accrual) || 0,
          requires_approval: requiresApproval,
          is_paid: isPaid,
          allow_half_day: true,
          allow_carry_over: true,
          max_carry_over_days: 0,
        },
      });
      toast.success("Leave type added");
      onSaved();
    } catch (e: any) {
      toast.error(e?.message ?? "Could not save");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* "At least one is configured" told an admin nothing about which, so
          the safe move was to add another — which is how a tenant ends up with
          two Annual Leave types. */}
      <ExistingList
        title="Leave types already configured"
        items={types}
        keyOf={(t: any, i) => t.id ?? String(i)}
        emptyTitle="No active leave types yet."
        emptyHint="Add at least one to continue — nobody can submit a leave request without one."
        renderItem={(t: any) => (
          <>
            <span className="font-mono text-xs font-medium">{t.code}</span>
            <span className="flex-1">{t.name}</span>
            <span className="text-xs tabular-nums text-muted-foreground">
              {Number(t.annual_quota_days ?? 0)} days/yr
            </span>
            <span className="text-xs tabular-nums text-muted-foreground">
              {Number(t.accrual_per_month ?? 0)}/mo
            </span>
            <span className="text-xs text-muted-foreground">{t.is_paid ? "paid" : "unpaid"}</span>
            {t.is_active === false && (
              <span className="text-xs text-muted-foreground">(inactive)</span>
            )}
          </>
        )}
      />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <Label>Code</Label>
          <Input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} />
        </div>
        <div>
          <Label>Name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <Label>Annual quota (days)</Label>
          <Input
            type="number"
            step="0.5"
            value={quota}
            onChange={(e) => setQuota(e.target.value)}
          />
        </div>
        <div>
          <Label>Monthly accrual (days)</Label>
          <Input
            type="number"
            step="0.01"
            value={accrual}
            onChange={(e) => setAccrual(e.target.value)}
          />
        </div>
        <div className="flex items-center justify-between rounded-md border p-3">
          <Label>Requires approval</Label>
          <Switch checked={requiresApproval} onCheckedChange={setRequiresApproval} />
        </div>
        <div className="flex items-center justify-between rounded-md border p-3">
          <Label>Paid leave</Label>
          <Switch checked={isPaid} onCheckedChange={setIsPaid} />
        </div>
      </div>
      <Button onClick={submit} disabled={busy || !code || !name}>
        {busy ? "Saving…" : "Add leave type"}
      </Button>
    </div>
  );
}

function AccrualsStep({ ok, onSaved: _onSaved }: { ok: boolean; onSaved: () => void }) {
  return (
    <div className="space-y-3">
      {ok ? (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-200">
          Every active leave type has a non-zero quota or monthly accrual — balances will grow
          correctly.
        </div>
      ) : (
        <div className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
          One or more active leave types have both quota and accrual set to zero. Set at least one
          of those values per type.
        </div>
      )}
      <p className="text-sm text-muted-foreground">
        Edit quotas and accruals on the{" "}
        <Link to="/admin/leave-types" className="underline">
          Leave types
        </Link>{" "}
        page. Per-employee adjustments and carry-overs are managed under{" "}
        <Link to="/org/leave" className="underline">
          Leave management
        </Link>
        .
      </p>
    </div>
  );
}

function ApprovalStep({ ok }: { ok: boolean }) {
  const qc = useQueryClient();
  const listFn = useServerFn(listLeaveApprovalRoutes);
  const approversFn = useServerFn(listTenantApprovers);
  const upsertFn = useServerFn(upsertLeaveApprovalRoute);
  const delFn = useServerFn(deleteLeaveApprovalRoute);

  const routesQ = useQuery({ queryKey: ["leave-approval-routes"], queryFn: () => listFn() });
  const approversQ = useQuery({ queryKey: ["tenant-approvers"], queryFn: () => approversFn() });

  const [tier, setTier] = useState<string>("1");
  const [mode, setMode] = useState<"role" | "user">("role");
  const [role, setRole] = useState<"manager" | "hr" | "branch_admin" | "org_admin">("manager");
  const [userId, setUserId] = useState<string>("");
  const [escalate, setEscalate] = useState<string>("48");
  const [busy, setBusy] = useState(false);

  const refresh = () => qc.invalidateQueries({ queryKey: ["leave-approval-routes"] });

  const addRule = async () => {
    setBusy(true);
    try {
      await upsertFn({
        data: {
          leave_type_id: null,
          tier: Number(tier) || 1,
          approver_role: mode === "role" ? role : null,
          approver_user_id: mode === "user" ? userId || null : null,
          escalate_after_hours: Number(escalate) || 48,
          is_active: true,
        },
      });
      toast.success("Approval rule added");
      refresh();
    } catch (e: any) {
      toast.error(e?.message ?? "Could not save");
    } finally {
      setBusy(false);
    }
  };

  const routes = routesQ.data?.routes ?? [];
  const approvers = approversQ.data?.approvers ?? [];

  return (
    <div className="space-y-4">
      {ok ? (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-200">
          At least one approver (Manager, HR, Branch Admin, or Org Admin) is available. Add an
          explicit routing chain below to control tiers and escalation.
        </div>
      ) : (
        <div className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
          No approvers found yet. Promote a teammate to Manager/HR, or mark every active leave type
          as <em>not</em> requiring approval. Then define the chain below.
        </div>
      )}

      <div className="rounded-md border p-3">
        <div className="mb-2 text-sm font-medium">Approval chain (all leave types)</div>
        {routes.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No rules yet. The first rule you add becomes Tier 1.
          </p>
        ) : (
          <ul className="space-y-1 text-sm">
            {routes.map((r: any) => (
              <li
                key={r.id}
                className="flex items-center justify-between rounded border bg-muted/30 p-2"
              >
                <span>
                  <Badge variant="outline" className="mr-2">
                    Tier {r.tier}
                  </Badge>
                  {r.approver_role ? (
                    <>
                      Role: <span className="font-medium">{r.approver_role}</span>
                    </>
                  ) : (
                    <>
                      User:{" "}
                      <span className="font-medium">
                        {approvers.find((a: any) => a.id === r.approver_user_id)?.full_name ??
                          r.approver_user_id}
                      </span>
                    </>
                  )}
                  <span className="ml-2 text-muted-foreground">
                    escalate after {r.escalate_after_hours}h
                  </span>
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={async () => {
                    await delFn({ data: { id: r.id } });
                    toast.success("Removed");
                    refresh();
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 rounded-md border p-3 sm:grid-cols-5">
        <div>
          <Label>Tier</Label>
          <Input
            type="number"
            min={1}
            max={10}
            value={tier}
            onChange={(e) => setTier(e.target.value)}
          />
        </div>
        <div className="sm:col-span-2">
          <Label>Approver</Label>
          <Select value={mode} onValueChange={(v: any) => setMode(v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="role">By role</SelectItem>
              <SelectItem value="user">Specific user</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="sm:col-span-2">
          <Label>&nbsp;</Label>
          {mode === "role" ? (
            <Select value={role} onValueChange={(v: any) => setRole(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="manager">Manager (direct manager of the requester)</SelectItem>
                <SelectItem value="hr">HR</SelectItem>
                <SelectItem value="branch_admin">Branch Admin</SelectItem>
                <SelectItem value="org_admin">Org Admin</SelectItem>
              </SelectContent>
            </Select>
          ) : (
            <Select value={userId} onValueChange={setUserId}>
              <SelectTrigger>
                <SelectValue
                  placeholder={approvers.length ? "Select approver" : "No approvers yet"}
                />
              </SelectTrigger>
              <SelectContent>
                {approvers.map((a: any) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.full_name || a.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
        <div className="sm:col-span-3">
          <Label>Escalate after (hours)</Label>
          <Input
            type="number"
            min={0}
            max={720}
            value={escalate}
            onChange={(e) => setEscalate(e.target.value)}
          />
        </div>
        <div className="sm:col-span-2 flex items-end">
          <Button
            className="w-full"
            onClick={addRule}
            disabled={busy || (mode === "user" && !userId)}
          >
            {busy ? "Adding…" : "Add tier"}
          </Button>
        </div>
      </div>

      <p className="text-sm text-muted-foreground">
        Leave requests advance through tiers in order. If a tier doesn't act within the escalation
        window, the request advances to the next tier automatically. Manage assignees per employee
        on{" "}
        <Link to="/org/employees" className="underline">
          Employees
        </Link>
        .
      </p>
    </div>
  );
}
