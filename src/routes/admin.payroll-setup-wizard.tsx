import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
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
import {
  getPayrollSetup,
  upsertPayrollSettings,
  upsertPayrollComponent,
  getPayrollReadiness,
  updateTenantCurrency,
  upsertOvertimeRateQuick,
} from "@/lib/payroll-setup.functions";
import { CURRENCIES } from "@/lib/currencies";
import { AdminGate } from "@/components/AdminGate";
import { ORG_ADMIN_ONLY } from "@/lib/rbac";

export const Route = createFileRoute("/admin/payroll-setup-wizard")({
  head: () => ({ meta: [{ title: "Pre-invite payroll checklist — hrppl" }] }),
  component: () => (
    <AdminGate allow={ORG_ADMIN_ONLY}>
      <WizardPage />
    </AdminGate>
  ),
});

type StepKey = "payItems" | "payDates" | "overtimeRates" | "currency";
const STEPS: { key: StepKey; title: string; blurb: string }[] = [
  {
    key: "payItems",
    title: "Pay items",
    blurb: "Define at least one active earning/deduction so payslips can render.",
  },
  {
    key: "payDates",
    title: "Pay dates",
    blurb: "Set the pay period and standard hours that drive every payroll run.",
  },
  {
    key: "overtimeRates",
    title: "Overtime & penalty rates",
    blurb: "Add at least one rate so overtime can be priced correctly.",
  },
  {
    key: "currency",
    title: "Currency",
    blurb: "Confirm the ISO 4217 currency for payroll, FX, and invoicing.",
  },
];

function WizardPage() {
  const { user, roles, loading, rolesLoaded } = useAuth();
  const navigate = useNavigate();
  const canAccess = roles.includes("org_admin") || roles.includes("super_admin");
  const qc = useQueryClient();

  const fetchReadiness = useServerFn(getPayrollReadiness);
  const fetchSetup = useServerFn(getPayrollSetup);

  const readinessQ = useQuery({
    queryKey: ["payroll-readiness"],
    queryFn: () => fetchReadiness(),
    enabled: !!user && rolesLoaded && canAccess,
  });
  const setupQ = useQuery({
    queryKey: ["payroll-setup"],
    queryFn: () => fetchSetup(),
    enabled: !!user && rolesLoaded && canAccess,
  });

  const [step, setStep] = useState<number>(0);

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
        Sign in required.
      </main>
    );

  const steps = readinessQ.data?.steps ?? {
    payItems: false,
    payDates: false,
    overtimeRates: false,
    currency: false,
  };
  const allComplete = !!readinessQ.data?.allComplete;
  const active = STEPS[step];

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["payroll-readiness"] });
    qc.invalidateQueries({ queryKey: ["payroll-setup"] });
  };

  return (
    <AppShell
      title="Pre-invite payroll checklist"
      subtitle="Complete every step before inviting employees"
    >
      <div className="mx-auto max-w-4xl space-y-6 p-6">
        <Card>
          <CardHeader>
            <CardTitle>Setup progress</CardTitle>
            <CardDescription>
              Employee invitations are blocked until all four steps below are complete.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="grid grid-cols-1 gap-3 sm:grid-cols-4">
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
                  All setup steps complete. You can now invite employees.
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
            {active.key === "payItems" && (
              <PayItemsStep
                hasItems={steps.payItems}
                components={setupQ.data?.components ?? []}
                onSaved={refresh}
              />
            )}
            {active.key === "payDates" && (
              <PayDatesStep existing={setupQ.data?.settings ?? null} onSaved={refresh} />
            )}
            {active.key === "overtimeRates" && (
              <OvertimeStep hasRates={steps.overtimeRates} onSaved={refresh} />
            )}
            {active.key === "currency" && <CurrencyStep onSaved={refresh} />}
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
          Need the full configuration UI? Open the{" "}
          <Link to="/admin/payroll-setup" className="underline">
            Payroll Setup admin
          </Link>
          .
        </p>
      </div>
    </AppShell>
  );
}

function PayItemsStep({
  hasItems,
  components,
  onSaved,
}: {
  hasItems: boolean;
  components: any[];
  onSaved: () => void;
}) {
  const save = useServerFn(upsertPayrollComponent);
  const [code, setCode] = useState("BASIC");
  const [label, setLabel] = useState("Basic salary");
  const [kind, setKind] = useState<
    "allowance" | "deduction" | "pf" | "tax" | "retirement" | "other"
  >("allowance");
  const [calc, setCalc] = useState<"flat" | "pct_of_basic" | "pct_of_gross">("flat");
  const [rate, setRate] = useState("0");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true);
    try {
      await save({
        data: {
          code,
          label,
          kind,
          calc_type: calc,
          rate: Number(rate) || 0,
          is_active: true,
          show_on_payslip: true,
        },
      });
      toast.success("Pay item added");
      onSaved();
    } catch (e: any) {
      toast.error(e?.message ?? "Could not save");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      {hasItems ? (
        <div className="rounded-md border bg-muted/40 p-3 text-sm">
          {components.length} pay item{components.length === 1 ? "" : "s"} configured. Add another
          below or move to the next step.
        </div>
      ) : (
        <div className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
          No active pay items yet. Add at least one to continue.
        </div>
      )}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <Label>Code</Label>
          <Input value={code} onChange={(e) => setCode(e.target.value)} />
        </div>
        <div>
          <Label>Label</Label>
          <Input value={label} onChange={(e) => setLabel(e.target.value)} />
        </div>
        <div>
          <Label>Kind</Label>
          <Select value={kind} onValueChange={(v: any) => setKind(v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="allowance">Allowance / earning</SelectItem>
              <SelectItem value="deduction">Deduction</SelectItem>
              <SelectItem value="pf">Provident fund</SelectItem>
              <SelectItem value="tax">Tax</SelectItem>
              <SelectItem value="retirement">Retirement</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Calc</Label>
          <Select value={calc} onValueChange={(v: any) => setCalc(v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="flat">Flat amount</SelectItem>
              <SelectItem value="pct_of_basic">% of basic</SelectItem>
              <SelectItem value="pct_of_gross">% of gross</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Rate</Label>
          <Input type="number" value={rate} onChange={(e) => setRate(e.target.value)} />
        </div>
      </div>
      <Button onClick={submit} disabled={busy || !code || !label}>
        {busy ? "Saving…" : "Add pay item"}
      </Button>
    </div>
  );
}

function PayDatesStep({ existing, onSaved }: { existing: any; onSaved: () => void }) {
  const save = useServerFn(upsertPayrollSettings);
  const [period, setPeriod] = useState<"weekly" | "fortnightly" | "semimonthly" | "monthly">(
    existing?.pay_period ?? "monthly",
  );
  const [hoursPerDay, setHoursPerDay] = useState<string>(
    String(existing?.standard_hours_per_day ?? 8),
  );
  const [daysPerWeek, setDaysPerWeek] = useState<string>(
    String(existing?.standard_days_per_week ?? 5),
  );
  const [meal, setMeal] = useState<string>(String(existing?.meal_break_minutes ?? 30));
  const [rest, setRest] = useState<string>(String(existing?.rest_break_minutes ?? 15));
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (existing) {
      setPeriod(existing.pay_period ?? "monthly");
      setHoursPerDay(String(existing.standard_hours_per_day ?? 8));
      setDaysPerWeek(String(existing.standard_days_per_week ?? 5));
      setMeal(String(existing.meal_break_minutes ?? 30));
      setRest(String(existing.rest_break_minutes ?? 15));
    }
  }, [existing]);

  const submit = async () => {
    setBusy(true);
    try {
      await save({
        data: {
          pay_period: period,
          standard_hours_per_day: Number(hoursPerDay) || 8,
          standard_days_per_week: Number(daysPerWeek) || 5,
          meal_break_minutes: Number(meal) || 0,
          rest_break_minutes: Number(rest) || 0,
          notes: null,
        },
      });
      toast.success("Pay schedule saved");
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
          <Label>Pay period</Label>
          <Select value={period} onValueChange={(v: any) => setPeriod(v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="fortnightly">Fortnightly</SelectItem>
              <SelectItem value="semimonthly">Semi-monthly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Standard hours/day</Label>
          <Input
            type="number"
            value={hoursPerDay}
            onChange={(e) => setHoursPerDay(e.target.value)}
          />
        </div>
        <div>
          <Label>Standard days/week</Label>
          <Input
            type="number"
            value={daysPerWeek}
            onChange={(e) => setDaysPerWeek(e.target.value)}
          />
        </div>
        <div>
          <Label>Meal break (mins)</Label>
          <Input type="number" value={meal} onChange={(e) => setMeal(e.target.value)} />
        </div>
        <div>
          <Label>Rest break (mins)</Label>
          <Input type="number" value={rest} onChange={(e) => setRest(e.target.value)} />
        </div>
      </div>
      <Button onClick={submit} disabled={busy}>
        {busy ? "Saving…" : "Save pay schedule"}
      </Button>
    </div>
  );
}

function OvertimeStep({ hasRates, onSaved }: { hasRates: boolean; onSaved: () => void }) {
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
      {!hasRates && (
        <div className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
          Add at least one overtime or penalty rate to continue.
        </div>
      )}
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
      <p className="text-xs text-muted-foreground">
        Manage the full list on the{" "}
        <Link to="/admin/overtime-rates" className="underline">
          Overtime rates
        </Link>{" "}
        page.
      </p>
    </div>
  );
}

function CurrencyStep({ onSaved }: { onSaved: () => void }) {
  const save = useServerFn(updateTenantCurrency);
  const [code, setCode] = useState("USD");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true);
    try {
      await save({ data: { currency_code: code } });
      toast.success("Currency saved");
      onSaved();
    } catch (e: any) {
      toast.error(e?.message ?? "Could not save");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="max-w-sm">
        <Label>Default currency</Label>
        <Select value={code} onValueChange={setCode}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="max-h-72">
            {CURRENCIES.map((c) => (
              <SelectItem key={c.code} value={c.code}>
                {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button onClick={submit} disabled={busy}>
        {busy ? "Saving…" : "Save currency"}
      </Button>
    </div>
  );
}
