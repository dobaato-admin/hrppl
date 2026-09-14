import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertTriangle, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { DestructiveConfirm } from "@/components/DestructiveConfirm";
import { useAuth } from "@/hooks/use-auth";
import { can } from "@/lib/rbac";
import { supabase } from "@/integrations/supabase/client";
import {
  bulkDeleteEmployees,
  deleteTenant,
  purgePayrollHistory,
  transferOwnership,
} from "@/lib/danger-zone.functions";
import { AdminGate } from "@/components/AdminGate";
import { useMyTenant } from "@/hooks/use-tenant";

export const Route = createFileRoute("/org/danger")({
  head: () => ({ meta: [{ title: "Danger zone — hrppl" }] }),
  component: () => (
    <AdminGate feature="org.danger">
      <DangerZonePage />
    </AdminGate>
  ),
});

function DangerZonePage() {
  const { roles, user } = useAuth();
  const allowed = can("org.danger", roles);

  // This was already a React Query, so it never had the "null renders as an
  // answer" problem — but it read profiles.tenant_id directly, which is NULL
  // for a platform account, so a super_admin acting as a tenant was told they
  // had no organisation on the one page where that matters most.
  const { tenant, isLoading: tenantLoading } = useMyTenant();
  const tenantId = tenant?.id;

  return (
    <AppShell title="Danger zone" subtitle="Irreversible organization-level actions">
      <div className="mx-auto w-full max-w-3xl space-y-6 p-4 md:p-6">
        {!allowed && (
          <Alert variant="destructive">
            <ShieldAlert className="h-4 w-4" />
            <AlertTitle>Forbidden</AlertTitle>
            <AlertDescription>
              Only organization admins can access the danger zone.
            </AlertDescription>
          </Alert>
        )}

        {/* `tenantLoading` is the difference between "you are not scoped to
            an organisation" and "we have not found out yet". Without it this
            alert accused every org admin of the former for the duration of the
            latter. */}
        {allowed && !tenantId && !tenantLoading && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>No organization</AlertTitle>
            <AlertDescription>You are not currently scoped to an organization.</AlertDescription>
          </Alert>
        )}

        {allowed && tenantId && tenant && (
          <>
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>These actions cannot be undone</AlertTitle>
              <AlertDescription>
                Each action requires a typed confirmation and your password. Deleted data cannot be
                recovered.
              </AlertDescription>
            </Alert>

            <TransferOwnershipCard tenantId={tenantId} tenantName={tenant.name} />
            <BulkDeleteEmployeesCard tenantId={tenantId} tenantName={tenant.name} />
            <PurgePayrollCard tenantId={tenantId} tenantName={tenant.name} />
            <DeleteTenantCard tenantId={tenantId} tenantName={tenant.name} />
          </>
        )}
      </div>
    </AppShell>
  );
}

function TransferOwnershipCard({ tenantId, tenantName }: { tenantId: string; tenantName: string }) {
  const [employeeId, setEmployeeId] = useState<string>("");
  const [demoteSelf, setDemoteSelf] = useState(false);
  const [open, setOpen] = useState(false);
  const run = useServerFn(transferOwnership);

  const empsQ = useQuery({
    queryKey: ["danger-employees", tenantId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("employees")
        .select("id, first_name, last_name, user_id")
        .eq("tenant_id", tenantId)
        .not("user_id", "is", null)
        .order("first_name", { ascending: true })
        .limit(500);
      if (error) throw error;
      return data ?? [];
    },
  });

  const selectedName = useMemo(() => {
    const e = empsQ.data?.find((x) => x.id === employeeId);
    return e ? `${e.first_name} ${e.last_name}`.trim() : "";
  }, [empsQ.data, employeeId]);

  return (
    <Card className="border-destructive/40">
      <CardHeader>
        <CardTitle>Transfer ownership</CardTitle>
        <CardDescription>
          Grant another linked staff member the org_admin role. Optionally remove the role from
          yourself.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-1">
          <Label>New owner</Label>
          <Select value={employeeId} onValueChange={setEmployeeId}>
            <SelectTrigger>
              <SelectValue placeholder="Select an employee with a user account" />
            </SelectTrigger>
            <SelectContent>
              {(empsQ.data ?? []).map((e) => (
                <SelectItem key={e.id} value={e.id}>
                  {`${e.first_name} ${e.last_name}`.trim()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <Checkbox checked={demoteSelf} onCheckedChange={(v) => setDemoteSelf(v === true)} />
          Remove org_admin from my account afterwards
        </label>
        <Button variant="destructive" disabled={!employeeId} onClick={() => setOpen(true)}>
          Transfer ownership
        </Button>
        <DestructiveConfirm
          open={open}
          onOpenChange={setOpen}
          title="Transfer ownership?"
          description={
            <p>
              {selectedName} will gain full org_admin access to{" "}
              <span className="font-semibold text-foreground">{tenantName}</span>.
              {demoteSelf ? " You will lose org_admin access." : ""}
            </p>
          }
          typedToken={tenantName}
          requirePassword
          actionLabel="Transfer ownership"
          onConfirm={async () => {
            const res = await run({
              data: { tenantId, newOwnerEmployeeId: employeeId, demoteSelf },
            });
            toast.success(`Ownership granted to ${res.newOwnerName}.`);
          }}
        />
      </CardContent>
    </Card>
  );
}

function BulkDeleteEmployeesCard({
  tenantId,
  tenantName,
}: {
  tenantId: string;
  tenantName: string;
}) {
  const [csv, setCsv] = useState("");
  const [open, setOpen] = useState(false);
  const run = useServerFn(bulkDeleteEmployees);
  const ids = useMemo(
    () =>
      csv
        .split(/[\s,]+/)
        .map((s) => s.trim())
        .filter((s) => /^[0-9a-f-]{36}$/i.test(s)),
    [csv],
  );

  return (
    <Card className="border-destructive/40">
      <CardHeader>
        <CardTitle>Bulk-delete employees</CardTitle>
        <CardDescription>
          Permanently removes employee records and all linked data. Paste employee UUIDs separated
          by commas, spaces, or new lines (max 500).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-1">
          <Label htmlFor="ids">Employee IDs</Label>
          <textarea
            id="ids"
            value={csv}
            onChange={(e) => setCsv(e.target.value)}
            className="min-h-24 w-full rounded-md border bg-background p-2 text-sm font-mono"
            placeholder="e2c1…  4b9a…"
          />
          <p className="text-xs text-muted-foreground">
            {ids.length} valid UUID{ids.length === 1 ? "" : "s"} detected.
          </p>
        </div>
        <Button variant="destructive" disabled={ids.length === 0} onClick={() => setOpen(true)}>
          Delete {ids.length} employee{ids.length === 1 ? "" : "s"}
        </Button>
        <DestructiveConfirm
          open={open}
          onOpenChange={setOpen}
          title="Delete employees permanently?"
          description={
            <p>
              {ids.length} employee record{ids.length === 1 ? "" : "s"} and their linked history
              will be removed from{" "}
              <span className="font-semibold text-foreground">{tenantName}</span>.
            </p>
          }
          typedToken={tenantName}
          requirePassword
          actionLabel="Delete employees"
          onConfirm={async () => {
            const res = await run({ data: { tenantId, employeeIds: ids } });
            toast.success(`Deleted ${res.deleted} employee record(s).`);
            setCsv("");
          }}
        />
      </CardContent>
    </Card>
  );
}

function PurgePayrollCard({ tenantId, tenantName }: { tenantId: string; tenantName: string }) {
  const [before, setBefore] = useState("");
  const [open, setOpen] = useState(false);
  const run = useServerFn(purgePayrollHistory);
  const valid = /^\d{4}-\d{2}-\d{2}$/.test(before);

  return (
    <Card className="border-destructive/40">
      <CardHeader>
        <CardTitle>Purge payroll history</CardTitle>
        <CardDescription>
          Permanently deletes payroll runs and payslips with a pay date before the cutoff.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-1">
          <Label htmlFor="before">Delete runs paid before</Label>
          <Input
            id="before"
            type="date"
            value={before}
            onChange={(e) => setBefore(e.target.value)}
          />
        </div>
        <Button variant="destructive" disabled={!valid} onClick={() => setOpen(true)}>
          Purge payroll history
        </Button>
        <DestructiveConfirm
          open={open}
          onOpenChange={setOpen}
          title="Purge payroll history?"
          description={
            <p>
              All payroll runs and payslips before{" "}
              <span className="font-semibold text-foreground">{before}</span> will be deleted from{" "}
              <span className="font-semibold text-foreground">{tenantName}</span>.
            </p>
          }
          typedToken={tenantName}
          requirePassword
          actionLabel="Purge payroll"
          onConfirm={async () => {
            const res = await run({ data: { tenantId, beforeDate: before } });
            toast.success(`Purged ${res.runs} run(s) and ${res.payslips} payslip(s).`);
          }}
        />
      </CardContent>
    </Card>
  );
}

function DeleteTenantCard({ tenantId, tenantName }: { tenantId: string; tenantName: string }) {
  const [open, setOpen] = useState(false);
  const run = useServerFn(deleteTenant);

  return (
    <Card className="border-destructive">
      <CardHeader>
        <CardTitle className="text-destructive">Delete organization</CardTitle>
        <CardDescription>
          Permanently deletes <span className="font-semibold text-foreground">{tenantName}</span>{" "}
          and all its data — employees, payroll, documents, everything. This cannot be undone.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button variant="destructive" onClick={() => setOpen(true)}>
          Delete organization
        </Button>
        <DestructiveConfirm
          open={open}
          onOpenChange={setOpen}
          title="Delete organization permanently?"
          description={
            <p>
              Every record belonging to{" "}
              <span className="font-semibold text-foreground">{tenantName}</span> will be destroyed.
            </p>
          }
          typedToken={tenantName}
          requirePassword
          actionLabel="Delete organization"
          onConfirm={async () => {
            await run({ data: { tenantId, confirmName: tenantName } });
            toast.success("Organization deleted.");
            window.location.assign("/");
          }}
        />
      </CardContent>
    </Card>
  );
}
