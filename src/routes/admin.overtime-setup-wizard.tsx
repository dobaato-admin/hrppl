import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { getOvertimeReadiness, upsertOvertimeRateQuick } from "@/lib/payroll-setup.functions";
import { AdminGate } from "@/components/AdminGate";
import { ORG_ADMIN_ONLY } from "@/lib/rbac";

export const Route = createFileRoute("/admin/overtime-setup-wizard")({
  head: () => ({ meta: [{ title: "Overtime Setup Wizard — hrppl" }] }),
  component: () => (
    <AdminGate allow={ORG_ADMIN_ONLY}>
      <OvertimeWizard />
    </AdminGate>
  ),
});

function OvertimeWizard() {
  const { user, roles, loading, rolesLoaded } = useAuth();
  const navigate = useNavigate();
  const canAccess = roles.includes("org_admin") || roles.includes("super_admin");
  const qc = useQueryClient();

  const fetchReadiness = useServerFn(getOvertimeReadiness);
  const readinessQ = useQuery({
    queryKey: ["overtime-readiness"],
    queryFn: () => fetchReadiness(),
    enabled: !!user && rolesLoaded && canAccess,
  });

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

  const done = !!readinessQ.data?.allComplete;
  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["overtime-readiness"] });
    qc.invalidateQueries({ queryKey: ["payroll-readiness"] });
  };

  return (
    <AppShell
      title="Overtime Setup Wizard"
      subtitle="Step 4 of admin setup — required before inviting employees"
    >
      <div className="mx-auto max-w-3xl space-y-6 p-6">
        <Card>
          <CardHeader>
            <CardTitle>Overtime & penalty rates</CardTitle>
            <CardDescription>
              Configure at least one overtime or penalty rate so timesheets and payroll can price
              hours correctly. Employee invitations remain blocked until at least one rate is
              active.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2 rounded-md border p-3">
              {done ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              ) : (
                <Circle className="h-5 w-5 text-muted-foreground" />
              )}
              <div className="text-sm">
                <div className="font-medium">{done ? "Complete" : "Pending"}</div>
                <div className="text-muted-foreground">
                  {readinessQ.data?.rateCount ?? 0} rate(s) configured
                </div>
              </div>
              {done && (
                <Button
                  size="sm"
                  className="ml-auto"
                  onClick={() => navigate({ to: "/org/invitations" })}
                >
                  Invite employees <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              Add a rate{" "}
              {done && (
                <Badge variant="secondary" className="ml-2">
                  Optional — add more
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              Quick-add form. Manage the full list on the Overtime rates admin page.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <QuickRateForm onSaved={refresh} />
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          Need full controls? Open the{" "}
          <Link to="/admin/overtime-rates" className="underline">
            Overtime rates
          </Link>{" "}
          admin.
        </p>
      </div>
    </AppShell>
  );
}

function QuickRateForm({ onSaved }: { onSaved: () => void }) {
  const save = useServerFn(upsertOvertimeRateQuick);
  const [code, setCode] = useState("OT15");
  const [name, setName] = useState("Weekday overtime ×1.5");
  const [appliesTo, setAppliesTo] = useState<"overtime" | "penalty">("overtime");
  const [mult, setMult] = useState("1.5");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true);
    try {
      await save({
        data: { code, name, applies_to: appliesTo, rate_multiplier: Number(mult) || 1.5 },
      });
      toast.success("Rate added");
      onSaved();
    } catch (e: any) {
      toast.error(e?.message ?? "Could not save");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <Label>Code</Label>
          <Input value={code} onChange={(e) => setCode(e.target.value)} />
        </div>
        <div>
          <Label>Name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <Label>Applies to</Label>
          <Select value={appliesTo} onValueChange={(v: any) => setAppliesTo(v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="overtime">Overtime</SelectItem>
              <SelectItem value="penalty">Penalty</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Multiplier</Label>
          <Input type="number" step="0.05" value={mult} onChange={(e) => setMult(e.target.value)} />
        </div>
      </div>
      <Button onClick={submit} disabled={busy || !code || !name}>
        {busy ? "Saving…" : "Add rate"}
      </Button>
    </div>
  );
}
