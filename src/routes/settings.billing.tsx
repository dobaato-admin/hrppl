import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { Check, CreditCard, Loader2 } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import {
  getMyBilling,
  listPlans,
  changeMyPlan,
  cancelMyPlan,
  resumeMyPlan,
} from "@/lib/billing.functions";

export const Route = createFileRoute("/settings/billing")({
  head: () => ({
    meta: [
      { title: "Billing & subscription — hrppl" },
      { name: "description", content: "Manage your hrppl plan, billing period, and payment history." },
    ],
  }),
  component: BillingPage,
});

type Plan = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  price_monthly: number;
  price_annual: number;
  currency_code: string;
  employee_limit: number | null;
  features: string[];
};

function fmtMoney(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency} ${amount}`;
  }
}

function fmtDate(d: string | null | undefined) {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleDateString(undefined, { dateStyle: "medium" });
  } catch {
    return d;
  }
}

function BillingPage() {
  const { roles, loading } = useAuth();
  const isAdmin = roles.includes("org_admin") || roles.includes("super_admin");
  const qc = useQueryClient();
  const fetchBilling = useServerFn(getMyBilling);
  const fetchPlans = useServerFn(listPlans);
  const change = useServerFn(changeMyPlan);
  const cancel = useServerFn(cancelMyPlan);
  const resume = useServerFn(resumeMyPlan);

  const [interval, setInterval] = useState<"monthly" | "annual">("monthly");
  const [pendingCode, setPendingCode] = useState<string | null>(null);

  const billing = useQuery({
    queryKey: ["billing", "me"],
    queryFn: () => fetchBilling(),
    enabled: !loading,
  });

  const plans = useQuery({
    queryKey: ["billing", "plans"],
    queryFn: () => fetchPlans(),
    enabled: !loading,
  });

  if (loading || billing.isLoading || plans.isLoading) {
    return (
      <AppShell title="Billing & subscription" subtitle="Plan, payment history, and renewals">
        <div className="flex h-64 items-center justify-center text-muted-foreground">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading…
        </div>
      </AppShell>
    );
  }

  const sub = billing.data?.subscription;
  const plan = billing.data?.plan;
  const tenant = billing.data?.tenant;
  const usage = billing.data?.employeeCount ?? 0;
  const history = billing.data?.history ?? [];
  const planList: Plan[] = (plans.data?.plans ?? []) as any;

  const statusLabel = sub?.cancel_at_period_end
    ? "Cancels at period end"
    : sub?.status ?? "—";
  const statusVariant: "default" | "secondary" | "destructive" =
    sub?.status === "active"
      ? "default"
      : sub?.status === "past_due"
        ? "destructive"
        : "secondary";

  async function onChange(code: string) {
    if (!isAdmin) return;
    setPendingCode(code);
    try {
      await change({ data: { plan_code: code, billing_interval: interval } });
      toast.success(`Switched to ${code}`);
      await qc.invalidateQueries({ queryKey: ["billing", "me"] });
    } catch (e: any) {
      toast.error(e?.message ?? "Could not change plan");
    } finally {
      setPendingCode(null);
    }
  }

  async function onCancel() {
    try {
      await cancel();
      toast.success("Subscription will cancel at period end");
      await qc.invalidateQueries({ queryKey: ["billing", "me"] });
    } catch (e: any) {
      toast.error(e?.message ?? "Could not cancel");
    }
  }

  async function onResume() {
    try {
      await resume();
      toast.success("Subscription resumed");
      await qc.invalidateQueries({ queryKey: ["billing", "me"] });
    } catch (e: any) {
      toast.error(e?.message ?? "Could not resume");
    }
  }

  return (
    <AppShell title="Billing & subscription" subtitle={tenant?.name ?? "Your organization"}>
      <div className="mx-auto w-full max-w-6xl space-y-6 p-4 md:p-6">
        {/* Current plan */}
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" /> Current plan
                </CardTitle>
                <CardDescription>
                  Your active subscription and renewal details.
                </CardDescription>
              </div>
              <Badge variant={statusVariant} className="capitalize">
                {statusLabel}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Plan</p>
              <p className="mt-1 text-lg font-semibold">{plan?.name ?? "—"}</p>
              {plan && (
                <p className="text-sm text-muted-foreground">
                  {fmtMoney(
                    sub?.billing_interval === "annual" ? plan.price_annual : plan.price_monthly,
                    plan.currency_code,
                  )}{" "}
                  / {sub?.billing_interval === "annual" ? "year" : "month"}
                </p>
              )}
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Employees</p>
              <p className="mt-1 text-lg font-semibold">
                {usage}
                {plan?.employee_limit ? (
                  <span className="text-sm font-normal text-muted-foreground">
                    {" "}
                    / {plan.employee_limit}
                  </span>
                ) : (
                  <span className="text-sm font-normal text-muted-foreground"> / unlimited</span>
                )}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Current period</p>
              <p className="mt-1 text-sm">
                {fmtDate(sub?.current_period_start)} – {fmtDate(sub?.current_period_end)}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Trial ends</p>
              <p className="mt-1 text-sm">{fmtDate(sub?.trial_ends_at)}</p>
            </div>
          </CardContent>
          {isAdmin && sub && (
            <CardContent className="flex flex-wrap gap-2 pt-0">
              {sub.cancel_at_period_end ? (
                <Button variant="outline" onClick={onResume}>
                  Resume subscription
                </Button>
              ) : (
                <Button variant="outline" onClick={onCancel}>
                  Cancel at period end
                </Button>
              )}
              <Button asChild variant="ghost">
                <Link to="/settings/organization">Organization settings</Link>
              </Button>
            </CardContent>
          )}
        </Card>

        {/* Plan picker */}
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <CardTitle>Choose a plan</CardTitle>
                <CardDescription>
                  {isAdmin
                    ? "Switch plans anytime. Changes take effect immediately."
                    : "Only an organization admin can change the plan."}
                </CardDescription>
              </div>
              <Tabs value={interval} onValueChange={(v) => setInterval(v as any)}>
                <TabsList>
                  <TabsTrigger value="monthly">Monthly</TabsTrigger>
                  <TabsTrigger value="annual">Annual</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            {planList.map((p) => {
              const isCurrent =
                plan?.id === p.id && sub?.billing_interval === interval;
              const price = interval === "annual" ? p.price_annual : p.price_monthly;
              return (
                <div
                  key={p.id}
                  className={`rounded-lg border p-5 ${
                    isCurrent ? "border-primary ring-1 ring-primary" : "border-border"
                  }`}
                >
                  <div className="flex items-baseline justify-between">
                    <h3 className="text-lg font-semibold">{p.name}</h3>
                    {isCurrent && <Badge>Current</Badge>}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{p.description}</p>
                  <p className="mt-3 text-3xl font-bold">
                    {fmtMoney(price, p.currency_code)}
                    <span className="text-sm font-normal text-muted-foreground">
                      {" "}
                      / {interval === "annual" ? "yr" : "mo"}
                    </span>
                  </p>
                  <ul className="mt-4 space-y-2 text-sm">
                    {(p.features ?? []).map((f, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check className="mt-0.5 h-4 w-4 text-primary" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="mt-5 w-full"
                    variant={isCurrent ? "outline" : "default"}
                    disabled={!isAdmin || isCurrent || pendingCode === p.code}
                    onClick={() => onChange(p.code)}
                  >
                    {pendingCode === p.code ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Updating…
                      </>
                    ) : isCurrent ? (
                      "Current plan"
                    ) : (
                      `Switch to ${p.name}`
                    )}
                  </Button>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* History */}
        <Card>
          <CardHeader>
            <CardTitle>Payment history</CardTitle>
            <CardDescription>Confirmed subscription payments for your organization.</CardDescription>
          </CardHeader>
          <CardContent>
            {history.length === 0 ? (
              <p className="text-sm text-muted-foreground">No payments recorded yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <tr>
                      <th className="pb-2 pr-4">Date</th>
                      <th className="pb-2 pr-4">Period</th>
                      <th className="pb-2 pr-4">Reference</th>
                      <th className="pb-2 pr-4 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((h: any) => (
                      <tr key={h.id} className="border-t border-border">
                        <td className="py-2 pr-4">{fmtDate(h.created_at)}</td>
                        <td className="py-2 pr-4">
                          {fmtDate(h.period_start)} – {fmtDate(h.period_end)}
                        </td>
                        <td className="py-2 pr-4 font-mono text-xs">{h.bank_reference}</td>
                        <td className="py-2 pr-4 text-right">
                          {fmtMoney(Number(h.amount), h.currency_code)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
