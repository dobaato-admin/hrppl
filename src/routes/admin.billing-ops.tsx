import { AdminGate } from "@/components/AdminGate";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Download,
  RefreshCw,
  Eye,
  History,
  Calculator,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  listBillingAlerts,
  retryBillingAlert,
  resolveBillingAlert,
  listTenantsBillingOverview,
  runReconciliationForMonth,
  listReconciliationForMonth,
  exportBillingForMonth,
  listDiscrepancies,
  exportDiscrepanciesCsv,
  listTenantsLite,
  previewInvoiceImpact,
  listAlertSuppressions,
  upsertAlertSuppression,
  deleteAlertSuppression,
  listRetryPolicies,
  upsertRetryPolicy,
  exportBillingOpsAuditCsv,
  listBillingOpsAuditFiltered,
  scheduleTenantPlanChange,
} from "@/lib/billing-admin.functions";
import { SUPER_ADMIN_ONLY } from "@/lib/rbac";

export const Route = createFileRoute("/admin/billing-ops")({
  head: () => ({
    meta: [
      { title: "Billing operations — hrppl" },
      {
        name: "description",
        content:
          "Super-admin dashboard: billing alerts, mandates, invoices, reconciliation, discrepancy reports, audit timeline, and invoice impact preview.",
      },
    ],
  }),
  // AdminGate was imported but never wired up — its own meta description
  // already says "Super-admin dashboard," but nothing enforced that at the
  // route level (found while giving it a nav entry per the W4 IA redesign).
  component: () => (
    <AdminGate allow={SUPER_ADMIN_ONLY}>
      <BillingOps />
    </AdminGate>
  ),
});

function BillingOps() {
  const now = new Date();
  const prev = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1));
  const [year, setYear] = useState(prev.getUTCFullYear());
  const [month, setMonth] = useState(prev.getUTCMonth() + 1);

  const alertsQ = useQuery({ queryKey: ["billing-alerts"], queryFn: () => listBillingAlerts() });
  const tenantsQ = useQuery({
    queryKey: ["billing-overview"],
    queryFn: () => listTenantsBillingOverview(),
  });
  const tenantsLiteQ = useQuery({ queryKey: ["tenants-lite"], queryFn: () => listTenantsLite() });
  const reconQ = useQuery({
    queryKey: ["billing-recon", year, month],
    queryFn: () => listReconciliationForMonth({ data: { year, month } }),
  });

  const retryFn = useServerFn(retryBillingAlert);
  const resolveFn = useServerFn(resolveBillingAlert);
  const reconFn = useServerFn(runReconciliationForMonth);
  const exportFn = useServerFn(exportBillingForMonth);

  // W5 P3 · scheduleTenantPlanChange had no caller. A tenant can change its own
  // plan from /settings/billing, but the platform side had no way to do it on
  // their behalf — the case that actually comes up in support, when someone is
  // on the wrong plan and cannot get themselves off it.
  const queryClient = useQueryClient();
  const planChangeFn = useServerFn(scheduleTenantPlanChange);
  const [planFor, setPlanFor] = useState<{ id: string; name: string; current: string } | null>(
    null,
  );
  const [newPlan, setNewPlan] = useState<"starter_v2" | "pro_v2">("pro_v2");
  const [immediate, setImmediate] = useState(true);

  async function applyPlanChange() {
    if (!planFor) return;
    try {
      await planChangeFn({
        data: { tenantId: planFor.id, newPlanCode: newPlan, effectiveImmediately: immediate },
      });
      toast.success(
        immediate ? "Plan changed" : "Plan change scheduled for the next billing period",
      );
      setPlanFor(null);
      queryClient.invalidateQueries();
    } catch (e: any) {
      toast.error(e?.message ?? "Could not change the plan");
    }
  }

  const retry = useMutation({
    mutationFn: (id: string) => retryFn({ data: { id } }),
    onSuccess: (r: any) => {
      if (r?.alreadyResolved) toast.info("Already resolved — no action taken (idempotent).");
      else if (r?.ok) toast.success("Retry succeeded");
      else toast.warning("Retry attempted — still failing");
      alertsQ.refetch();
    },
    onError: (e: any) => toast.error(e?.message ?? "Retry failed"),
  });
  const resolve = useMutation({
    mutationFn: (id: string) => resolveFn({ data: { id } }),
    onSuccess: () => {
      toast.success("Alert resolved");
      alertsQ.refetch();
    },
  });
  const recon = useMutation({
    mutationFn: () => reconFn({ data: { year, month } }),
    onSuccess: (r: any) => {
      toast.success(`Reconciliation complete — ${r?.discrepancies ?? 0} discrepancies`);
      reconQ.refetch();
      alertsQ.refetch();
    },
    onError: (e: any) => toast.error(e?.message ?? "Reconciliation failed"),
  });
  const exportCsv = useMutation({
    mutationFn: (format: "csv" | "pdf") => exportFn({ data: { year, month, format } }),
    onSuccess: (r: any) => downloadBlob(r.content, r.filename, r.mime),
    onError: (e: any) => toast.error(e?.message ?? "Export failed"),
  });

  const alerts = (alertsQ.data as any)?.items ?? [];
  const openAlerts = useMemo(() => alerts.filter((a: any) => a.status !== "resolved"), [alerts]);
  const tenants = (tenantsQ.data as any)?.items ?? [];
  const tenantOptions = (tenantsLiteQ.data as any)?.items ?? [];

  return (
    <AppShell title="Billing operations">
      <div className="container mx-auto py-6 space-y-6">
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Billing operations</h1>
            <p className="text-sm text-muted-foreground">
              Alerts, mandates, invoices, reconciliation, discrepancies, audit trail & invoice
              impact preview.
            </p>
          </div>
          <div className="flex items-end gap-2">
            <div>
              <Label className="text-xs">Year</Label>
              <Input
                type="number"
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="w-24"
              />
            </div>
            <div>
              <Label className="text-xs">Month</Label>
              <Select value={String(month)} onValueChange={(v) => setMonth(Number(v))}>
                <SelectTrigger className="w-28">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                    <SelectItem key={m} value={String(m)}>
                      {String(m).padStart(2, "0")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              variant="outline"
              onClick={() => exportCsv.mutate("csv")}
              disabled={exportCsv.isPending}
            >
              <Download className="mr-2 h-4 w-4" /> CSV
            </Button>
            <Button
              variant="outline"
              onClick={() => exportCsv.mutate("pdf")}
              disabled={exportCsv.isPending}
            >
              <Download className="mr-2 h-4 w-4" /> PDF
            </Button>
          </div>
        </header>

        <Tabs defaultValue="alerts" className="space-y-4">
          <TabsList className="flex-wrap">
            <TabsTrigger value="alerts">Alerts ({openAlerts.length})</TabsTrigger>
            <TabsTrigger value="tenants">Tenants & mandates</TabsTrigger>
            <TabsTrigger value="recon">Reconciliation</TabsTrigger>
            <TabsTrigger value="discrepancies">Discrepancies report</TabsTrigger>
            <TabsTrigger value="audit">Audit timeline</TabsTrigger>
            <TabsTrigger value="suppressions">Suppressions</TabsTrigger>
            <TabsTrigger value="retry">Retry policies</TabsTrigger>
            <TabsTrigger value="preview">Preview impact</TabsTrigger>
          </TabsList>

          {/* Alerts */}
          <TabsContent value="alerts">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-500" /> Open alerts (
                  {openAlerts.length})
                </CardTitle>
                <CardDescription>
                  Cron failures, Stripe usage-reporting errors, failed invoices, reconciliation
                  discrepancies. Super admins receive an email and an in-app notification on every
                  new alert.
                </CardDescription>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>When</TableHead>
                      <TableHead>Tenant</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Severity</TableHead>
                      <TableHead>Message</TableHead>
                      <TableHead className="text-right">Retries</TableHead>
                      <TableHead className="text-right">Notified</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {openAlerts.map((a: any) => (
                      <TableRow key={a.id} className={a.suppressed ? "opacity-70" : ""}>
                        <TableCell className="whitespace-nowrap text-xs">
                          {new Date(a.created_at).toLocaleString()}
                        </TableCell>
                        <TableCell>{a.tenants?.name ?? "—"}</TableCell>
                        <TableCell className="font-mono text-xs">
                          {a.alert_type}
                          {a.suppressed && (
                            <Badge variant="outline" className="ml-1">
                              muted
                            </Badge>
                          )}
                          {a.auto_retry_exhausted && (
                            <Badge variant="destructive" className="ml-1">
                              exhausted
                            </Badge>
                          )}
                          {a.next_retry_at && !a.auto_retry_exhausted && (
                            <span
                              className="ml-1 text-[10px] text-muted-foreground"
                              title={a.next_retry_at}
                            >
                              auto-retry queued
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={a.severity === "error" ? "destructive" : "secondary"}>
                            {a.severity}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-md truncate" title={a.message ?? ""}>
                          <div className="text-sm">{a.title}</div>
                          <div className="text-xs text-muted-foreground truncate">{a.message}</div>
                        </TableCell>
                        <TableCell className="text-right">{a.retry_count}</TableCell>
                        <TableCell className="text-right text-xs">
                          {a.suppressed ? (
                            <span className="text-muted-foreground">muted</span>
                          ) : a.notified_at ? (
                            <CheckCircle2 className="inline h-3 w-3 text-emerald-500" />
                          ) : (
                            "—"
                          )}
                        </TableCell>
                        <TableCell className="text-right space-x-2 whitespace-nowrap">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => retry.mutate(a.id)}
                            disabled={retry.isPending}
                          >
                            <RefreshCw className="h-3 w-3 mr-1" /> Retry
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => resolve.mutate(a.id)}
                            disabled={resolve.isPending}
                          >
                            Resolve
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {openAlerts.length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={8}
                          className="text-center text-sm text-muted-foreground py-6"
                        >
                          <CheckCircle2 className="inline h-4 w-4 mr-1 text-emerald-500" /> All
                          clear — no open billing alerts.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tenants & mandates */}
          <TabsContent value="tenants">
            <Card>
              <CardHeader>
                <CardTitle>Tenant mandates & invoice outcomes</CardTitle>
                <CardDescription>
                  Direct-debit mandate status and recent invoice payments. Rows with failed payments
                  are highlighted.
                </CardDescription>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tenant</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Subscription</TableHead>
                      <TableHead>Mandate</TableHead>
                      <TableHead>Debit regions</TableHead>
                      <TableHead>Recent invoices</TableHead>
                      <TableHead className="text-right">Plan</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tenants.map((t: any) => {
                      const hasFailed = t.failed_invoices > 0;
                      return (
                        <TableRow key={t.tenant_id} className={hasFailed ? "bg-destructive/5" : ""}>
                          <TableCell>
                            <div className="font-medium">{t.tenants?.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {t.tenants?.country_code}
                            </div>
                          </TableCell>
                          <TableCell className="text-xs">
                            {t.subscription_plans?.code ?? "—"}
                            {t.au_payroll_addon && (
                              <Badge variant="outline" className="ml-1">
                                +AU
                              </Badge>
                            )}
                            {t.status === "trialing" && (
                              <Badge variant="secondary" className="ml-1">
                                trial
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                t.status === "active"
                                  ? "default"
                                  : t.status === "past_due"
                                    ? "destructive"
                                    : "secondary"
                              }
                            >
                              {t.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {t.mandate_status ? (
                              <Badge
                                variant={t.mandate_status === "active" ? "default" : "secondary"}
                              >
                                {t.mandate_status}
                              </Badge>
                            ) : (
                              <Badge variant="outline">not set up</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-xs font-mono">
                            {(t.debit_regions ?? []).join(", ")}
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              {(t.recent_invoices ?? []).slice(0, 3).map((inv: any) => (
                                <div key={inv.id} className="text-xs flex items-center gap-2">
                                  <Badge
                                    variant={
                                      inv.status === "paid"
                                        ? "default"
                                        : inv.status === "open" || inv.status === "uncollectible"
                                          ? "destructive"
                                          : "secondary"
                                    }
                                  >
                                    {inv.status}
                                  </Badge>
                                  <span>
                                    {((inv.amount_due ?? 0) / 100).toFixed(2)}{" "}
                                    {inv.currency?.toUpperCase()}
                                  </span>
                                  {inv.hosted_invoice_url && (
                                    <a
                                      href={inv.hosted_invoice_url}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="underline"
                                    >
                                      view
                                    </a>
                                  )}
                                </div>
                              ))}
                              {(t.recent_invoices ?? []).length === 0 && (
                                <span className="text-xs text-muted-foreground">
                                  no invoices yet
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() =>
                                setPlanFor({
                                  id: t.tenant_id,
                                  name: t.tenants?.name ?? "this tenant",
                                  current: t.subscription_plans?.code ?? "—",
                                })
                              }
                            >
                              Change
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {tenants.length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="text-center text-sm text-muted-foreground py-6"
                        >
                          No tenants with subscriptions yet.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reconciliation */}
          <TabsContent value="recon">
            <Card>
              <CardHeader className="flex flex-row items-start justify-between">
                <div>
                  <CardTitle>
                    Reconciliation — {year}-{String(month).padStart(2, "0")}
                  </CardTitle>
                  <CardDescription>
                    Compares computed monthly net headcount against Stripe metered quantities. Run
                    before invoices finalise.
                  </CardDescription>
                </div>
                <Button onClick={() => recon.mutate()} disabled={recon.isPending}>
                  {recon.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Run
                  reconciliation
                </Button>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tenant</TableHead>
                      <TableHead className="text-right">Computed base</TableHead>
                      <TableHead className="text-right">Stripe base</TableHead>
                      <TableHead className="text-right">Δ base</TableHead>
                      <TableHead className="text-right">Computed addon</TableHead>
                      <TableHead className="text-right">Stripe addon</TableHead>
                      <TableHead className="text-right">Δ addon</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {((reconQ.data as any)?.items ?? []).map((r: any) => (
                      <TableRow key={r.id} className={r.has_discrepancy ? "bg-destructive/5" : ""}>
                        <TableCell>{r.tenants?.name ?? r.tenant_id.slice(0, 8)}</TableCell>
                        <TableCell className="text-right">{r.computed_base}</TableCell>
                        <TableCell className="text-right">{r.reported_base}</TableCell>
                        <TableCell className="text-right font-mono">{r.base_delta}</TableCell>
                        <TableCell className="text-right">{r.computed_addon}</TableCell>
                        <TableCell className="text-right">{r.reported_addon}</TableCell>
                        <TableCell className="text-right font-mono">{r.addon_delta}</TableCell>
                        <TableCell>
                          <Badge variant={r.has_discrepancy ? "destructive" : "default"}>
                            {r.has_discrepancy ? "discrepancy" : "matched"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                    {((reconQ.data as any)?.items ?? []).length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={8}
                          className="text-center text-sm text-muted-foreground py-6"
                        >
                          No reconciliation run for this period yet.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Discrepancies report */}
          <TabsContent value="discrepancies">
            <DiscrepancyReport
              tenantOptions={tenantOptions}
              defaultYear={year}
              defaultMonth={month}
            />
          </TabsContent>

          {/* Audit */}
          <TabsContent value="audit">
            <AuditTimeline tenantOptions={tenantOptions} />
          </TabsContent>

          {/* Plan change — platform side, on a tenant's behalf. */}
          <Dialog open={!!planFor} onOpenChange={(o) => !o && setPlanFor(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Change plan for {planFor?.name}</DialogTitle>
                <DialogDescription>
                  Currently on <span className="font-mono">{planFor?.current}</span>. This is
                  recorded in the billing ops audit against your account.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label className="text-xs">New plan</Label>
                  <Select value={newPlan} onValueChange={(v) => setNewPlan(v as typeof newPlan)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="starter_v2">Starter</SelectItem>
                      <SelectItem value="pro_v2">Pro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between rounded border p-2.5">
                  <div>
                    <Label className="text-xs">Apply immediately</Label>
                    <p className="text-xs text-muted-foreground">
                      Off means it takes effect at the next billing period.
                    </p>
                  </div>
                  <Switch checked={immediate} onCheckedChange={setImmediate} />
                </div>
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setPlanFor(null)}>
                  Cancel
                </Button>
                <Button onClick={applyPlanChange}>Change plan</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <TabsContent value="suppressions">
            <SuppressionsTab tenantOptions={tenantOptions} />
          </TabsContent>

          <TabsContent value="retry">
            <RetryPoliciesTab />
          </TabsContent>

          <TabsContent value="preview">
            <PreviewImpact tenantOptions={tenantOptions} defaultYear={year} defaultMonth={month} />
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}

function DiscrepancyReport({
  tenantOptions,
  defaultYear,
  defaultMonth,
}: {
  tenantOptions: any[];
  defaultYear: number;
  defaultMonth: number;
}) {
  const [year, setYear] = useState<number | "">(defaultYear);
  const [month, setMonth] = useState<number | "">(defaultMonth);
  const [tenantId, setTenantId] = useState<string>("all");
  const [onlyDisc, setOnlyDisc] = useState(true);
  const [drill, setDrill] = useState<any>(null);

  const params = {
    year: typeof year === "number" ? year : null,
    month: typeof month === "number" ? month : null,
    tenantId: tenantId === "all" ? null : tenantId,
    onlyDiscrepancies: onlyDisc,
  };
  const q = useQuery({
    queryKey: ["discrepancies", params],
    queryFn: () => listDiscrepancies({ data: params }),
  });
  const exportFn = useServerFn(exportDiscrepanciesCsv);
  const exp = useMutation({
    mutationFn: () => exportFn({ data: params }),
    onSuccess: (r: any) => downloadBlob(r.content, r.filename, r.mime),
    onError: (e: any) => toast.error(e?.message ?? "Export failed"),
  });

  const rows = (q.data as any)?.items ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reconciliation discrepancies</CardTitle>
        <CardDescription>
          Filter by tenant and month, drill into computed vs Stripe quantities, export to CSV.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3 items-end">
          <div>
            <Label className="text-xs">Year</Label>
            <Input
              type="number"
              value={year}
              onChange={(e) => setYear(e.target.value ? Number(e.target.value) : "")}
            />
          </div>
          <div>
            <Label className="text-xs">Month</Label>
            <Select
              value={month ? String(month) : "all"}
              onValueChange={(v) => setMonth(v === "all" ? "" : Number(v))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <SelectItem key={m} value={String(m)}>
                    {String(m).padStart(2, "0")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="md:col-span-2">
            <Label className="text-xs">Tenant</Label>
            <Select value={tenantId} onValueChange={setTenantId}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All tenants</SelectItem>
                {tenantOptions.map((t: any) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={onlyDisc} onCheckedChange={setOnlyDisc} id="only-disc" />
            <Label htmlFor="only-disc" className="text-xs">
              Discrepancies only
            </Label>
          </div>
          <Button onClick={() => exp.mutate()} disabled={exp.isPending} variant="outline">
            <Download className="h-4 w-4 mr-1" /> Export CSV
          </Button>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tenant</TableHead>
                <TableHead>Period</TableHead>
                <TableHead className="text-right">Computed base</TableHead>
                <TableHead className="text-right">Stripe base</TableHead>
                <TableHead className="text-right">Δ base</TableHead>
                <TableHead className="text-right">Computed addon</TableHead>
                <TableHead className="text-right">Stripe addon</TableHead>
                <TableHead className="text-right">Δ addon</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r: any) => (
                <TableRow key={r.id} className={r.has_discrepancy ? "bg-destructive/5" : ""}>
                  <TableCell>{r.tenants?.name ?? r.tenant_id.slice(0, 8)}</TableCell>
                  <TableCell className="text-xs">
                    {r.period_year}-{String(r.period_month).padStart(2, "0")}
                  </TableCell>
                  <TableCell className="text-right">{r.computed_base}</TableCell>
                  <TableCell className="text-right">{r.reported_base}</TableCell>
                  <TableCell className="text-right font-mono">{r.base_delta}</TableCell>
                  <TableCell className="text-right">{r.computed_addon}</TableCell>
                  <TableCell className="text-right">{r.reported_addon}</TableCell>
                  <TableCell className="text-right font-mono">{r.addon_delta}</TableCell>
                  <TableCell>
                    <Button size="sm" variant="ghost" onClick={() => setDrill(r)}>
                      <Eye className="h-3 w-3" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-sm text-muted-foreground py-6">
                    No matching rows.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      <Dialog open={!!drill} onOpenChange={(o) => !o && setDrill(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              Discrepancy detail — {drill?.tenants?.name} ({drill?.period_year}-
              {String(drill?.period_month ?? 0).padStart(2, "0")})
            </DialogTitle>
          </DialogHeader>
          {drill && (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <Box label="Computed base" value={drill.computed_base} />
                <Box label="Stripe base" value={drill.reported_base} delta={drill.base_delta} />
                <Box label="Computed addon" value={drill.computed_addon} />
                <Box label="Stripe addon" value={drill.reported_addon} delta={drill.addon_delta} />
              </div>
              {drill.snapshot && (
                <div className="border rounded-md p-3 space-y-1">
                  <div className="text-xs font-medium text-muted-foreground">Snapshot</div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      Net employees: <b>{drill.snapshot.net_employees}</b>
                    </div>
                    <div>
                      Joined: <b>{drill.snapshot.joined_count}</b>
                    </div>
                    <div>
                      Left: <b>{drill.snapshot.left_count}</b>
                    </div>
                    <div>
                      Trial applied: <b>{String(drill.snapshot.trial_applied)}</b>
                    </div>
                    <div>
                      Status: <b>{drill.snapshot.status}</b>
                    </div>
                    <div>
                      Reported at: <b>{drill.snapshot.reported_at ?? "—"}</b>
                    </div>
                  </div>
                  {drill.snapshot.plan_change_prorated && (
                    <pre className="text-[10px] mt-2 bg-muted p-2 rounded overflow-x-auto">
                      {JSON.stringify(drill.snapshot.plan_change_prorated, null, 2)}
                    </pre>
                  )}
                  {drill.snapshot.error && (
                    <div className="text-xs text-destructive">Error: {drill.snapshot.error}</div>
                  )}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}

function Box({ label, value, delta }: { label: string; value: any; delta?: number }) {
  return (
    <div className="border rounded-md p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-lg font-semibold">{value}</div>
      {typeof delta === "number" && delta !== 0 && (
        <div className={`text-xs ${delta > 0 ? "text-amber-600" : "text-destructive"}`}>
          Δ {delta}
        </div>
      )}
    </div>
  );
}

function AuditTimeline({ tenantOptions }: { tenantOptions: any[] }) {
  const [tenantId, setTenantId] = useState<string>("all");
  const [action, setAction] = useState<string>("all");
  const [actorEmail, setActorEmail] = useState<string>("");
  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");
  const params = {
    tenantId: tenantId === "all" ? null : tenantId,
    action: action === "all" ? null : action,
    actorEmail: actorEmail || null,
    from: from ? new Date(from + "T00:00:00Z").toISOString() : null,
    to: to ? new Date(to + "T23:59:59Z").toISOString() : null,
    limit: 200,
  };
  const q = useQuery({
    queryKey: ["ops-audit", params],
    queryFn: () => listBillingOpsAuditFiltered({ data: params }),
  });
  const items = (q.data as any)?.items ?? [];
  const exportFn = useServerFn(exportBillingOpsAuditCsv);
  const exp = useMutation({
    mutationFn: () =>
      exportFn({
        data: {
          tenantId: params.tenantId,
          action: params.action,
          actorEmail: params.actorEmail,
          from: params.from,
          to: params.to,
        },
      }),
    onSuccess: (r: any) => downloadBlob(r.content, r.filename, r.mime),
    onError: (e: any) => toast.error(e?.message ?? "Export failed"),
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-4 w-4" /> Audit timeline
        </CardTitle>
        <CardDescription>
          Who ran retries, what was retried, before/after snapshots for reconciliation and mandate
          changes. Retained for 7 years.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3 items-end">
          <div className="md:col-span-2">
            <Label className="text-xs">Tenant</Label>
            <Select value={tenantId} onValueChange={setTenantId}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All tenants</SelectItem>
                {tenantOptions.map((t: any) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Action</Label>
            <Select value={action} onValueChange={setAction}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All actions</SelectItem>
                <SelectItem value="alert.retry.success">Retry succeeded</SelectItem>
                <SelectItem value="alert.retry.failed">Retry failed</SelectItem>
                <SelectItem value="alert.retry.noop">Retry no-op</SelectItem>
                <SelectItem value="alert.auto_retry.success">Auto-retry succeeded</SelectItem>
                <SelectItem value="alert.auto_retry.failed">Auto-retry failed</SelectItem>
                <SelectItem value="alert.resolve">Alert resolved</SelectItem>
                <SelectItem value="suppression.create">Suppression created</SelectItem>
                <SelectItem value="suppression.update">Suppression updated</SelectItem>
                <SelectItem value="suppression.delete">Suppression deleted</SelectItem>
                <SelectItem value="retry_policy.update">Retry policy updated</SelectItem>
                <SelectItem value="mandate.update">Mandate update</SelectItem>
                <SelectItem value="preview.run">Preview run</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Actor email</Label>
            <Input
              value={actorEmail}
              onChange={(e) => setActorEmail(e.target.value)}
              placeholder="jane@…"
            />
          </div>
          <div>
            <Label className="text-xs">From</Label>
            <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          </div>
          <div>
            <Label className="text-xs">To</Label>
            <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
          <div className="md:col-span-6">
            <Button variant="outline" onClick={() => exp.mutate()} disabled={exp.isPending}>
              <Download className="h-4 w-4 mr-1" /> Export CSV
            </Button>
          </div>
        </div>

        <ol className="space-y-3 relative border-l pl-4">
          {items.map((row: any) => (
            <li key={row.id} className="relative">
              <span className="absolute -left-[22px] top-1.5 h-3 w-3 rounded-full bg-primary/60 ring-2 ring-background" />
              <div className="text-xs text-muted-foreground">
                {new Date(row.created_at).toLocaleString()}
              </div>
              <div className="text-sm">
                <span className="font-mono">{row.action}</span>
                {row.tenants?.name && (
                  <>
                    {" "}
                    — <span className="font-medium">{row.tenants.name}</span>
                  </>
                )}
                {row.actor_email && (
                  <>
                    {" "}
                    by <span className="text-muted-foreground">{row.actor_email}</span>
                  </>
                )}
              </div>
              {(row.before || row.after) && (
                <details className="text-xs mt-1">
                  <summary className="cursor-pointer text-muted-foreground">before / after</summary>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <pre className="bg-muted rounded p-2 overflow-x-auto text-[10px]">
                      {JSON.stringify(row.before, null, 2) || "—"}
                    </pre>
                    <pre className="bg-muted rounded p-2 overflow-x-auto text-[10px]">
                      {JSON.stringify(row.after, null, 2) || "—"}
                    </pre>
                  </div>
                </details>
              )}
            </li>
          ))}
          {items.length === 0 && (
            <li className="text-sm text-muted-foreground">No audit entries.</li>
          )}
        </ol>
      </CardContent>
    </Card>
  );
}

function PreviewImpact({
  tenantOptions,
  defaultYear,
  defaultMonth,
}: {
  tenantOptions: any[];
  defaultYear: number;
  defaultMonth: number;
}) {
  const [tenantId, setTenantId] = useState<string>("");
  const [year, setYear] = useState<number>(defaultYear);
  const [month, setMonth] = useState<number>(defaultMonth);
  const [overridePlanCode, setOverridePlanCode] = useState<string>("none");
  const [overridePlanChangeDate, setOverridePlanChangeDate] = useState<string>("");
  const [overrideTrialEndsAt, setOverrideTrialEndsAt] = useState<string>("");
  const [overrideAddonAU, setOverrideAddonAU] = useState<string>("keep");
  const [result, setResult] = useState<any>(null);

  const fn = useServerFn(previewInvoiceImpact);
  const run = useMutation({
    mutationFn: () =>
      fn({
        data: {
          tenantId,
          year,
          month,
          overridePlanCode: overridePlanCode === "none" ? null : (overridePlanCode as any),
          overridePlanChangeDate: overridePlanChangeDate || null,
          overrideTrialEndsAt: overrideTrialEndsAt || null,
          overrideAddonAU: overrideAddonAU === "keep" ? null : overrideAddonAU === "on",
        },
      }),
    onSuccess: (r: any) => setResult(r),
    onError: (e: any) => toast.error(e?.message ?? "Preview failed"),
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-4 w-4" /> Preview invoice impact
        </CardTitle>
        <CardDescription>
          Dry-run a mid-month upgrade/downgrade or trial expiration and see exactly how units
          pro-rate for the selected month — before Stripe finalises invoices.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid md:grid-cols-3 gap-3">
          <div className="md:col-span-2">
            <Label className="text-xs">Tenant</Label>
            <Select value={tenantId} onValueChange={setTenantId}>
              <SelectTrigger>
                <SelectValue placeholder="Select tenant…" />
              </SelectTrigger>
              <SelectContent>
                {tenantOptions.map((t: any) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">Year</Label>
              <Input type="number" value={year} onChange={(e) => setYear(Number(e.target.value))} />
            </div>
            <div>
              <Label className="text-xs">Month</Label>
              <Select value={String(month)} onValueChange={(v) => setMonth(Number(v))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                    <SelectItem key={m} value={String(m)}>
                      {String(m).padStart(2, "0")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label className="text-xs">Switch plan to</Label>
            <Select value={overridePlanCode} onValueChange={setOverridePlanCode}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No change</SelectItem>
                <SelectItem value="starter_v2">Starter ($1)</SelectItem>
                <SelectItem value="pro_v2">Pro ($3)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Plan change date</Label>
            <Input
              type="date"
              value={overridePlanChangeDate}
              onChange={(e) => setOverridePlanChangeDate(e.target.value)}
            />
          </div>
          <div>
            <Label className="text-xs">Trial ends at (override)</Label>
            <Input
              type="date"
              value={overrideTrialEndsAt}
              onChange={(e) => setOverrideTrialEndsAt(e.target.value)}
            />
          </div>
          <div>
            <Label className="text-xs">AU Payroll add-on</Label>
            <Select value={overrideAddonAU} onValueChange={setOverrideAddonAU}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="keep">Keep current</SelectItem>
                <SelectItem value="on">Force on</SelectItem>
                <SelectItem value="off">Force off</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div>
          <Button onClick={() => run.mutate()} disabled={!tenantId || run.isPending}>
            {run.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Run preview
          </Button>
        </div>

        {result && (
          <div className="space-y-3 mt-4">
            <div className="grid md:grid-cols-4 gap-3">
              <Box label="Net employees" value={result.headcount?.net} />
              <Box label="Joined" value={result.headcount?.joined} />
              <Box label="Left" value={result.headcount?.left} />
              <Box label="Trial applied" value={String(result.trial?.applied)} />
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Line</TableHead>
                  <TableHead className="text-right">Units</TableHead>
                  <TableHead className="text-right">Unit (¢)</TableHead>
                  <TableHead className="text-right">Subtotal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(result.lines ?? []).map((l: any, i: number) => (
                  <TableRow key={i}>
                    <TableCell>{l.label}</TableCell>
                    <TableCell className="text-right">{l.units}</TableCell>
                    <TableCell className="text-right">{l.unitCents}</TableCell>
                    <TableCell className="text-right">
                      ${(l.subtotalCents / 100).toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell colSpan={3} className="text-right font-semibold">
                    Total
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    ${(result.totalCents / 100).toFixed(2)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
            {result.plan?.prorated && (
              <pre className="text-[10px] bg-muted p-2 rounded overflow-x-auto">
                {JSON.stringify(result.plan.prorated, null, 2)}
              </pre>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function SuppressionsTab({ tenantOptions }: { tenantOptions: any[] }) {
  const q = useQuery({ queryKey: ["suppressions"], queryFn: () => listAlertSuppressions() });
  const upsertFn = useServerFn(upsertAlertSuppression);
  const deleteFn = useServerFn(deleteAlertSuppression);
  const [tenantId, setTenantId] = useState<string>("all");
  const [alertType, setAlertType] = useState<string>("all");
  const [reason, setReason] = useState("");
  const [expiresAt, setExpiresAt] = useState("");

  const upsert = useMutation({
    mutationFn: () =>
      upsertFn({
        data: {
          tenant_id: tenantId === "all" ? null : tenantId,
          alert_type: alertType === "all" ? null : alertType,
          reason: reason || null,
          expires_at: expiresAt ? new Date(expiresAt + "T23:59:59Z").toISOString() : null,
        },
      }),
    onSuccess: () => {
      toast.success("Suppression added");
      setReason("");
      setExpiresAt("");
      q.refetch();
    },
    onError: (e: any) => toast.error(e?.message ?? "Failed"),
  });
  const del = useMutation({
    mutationFn: (id: string) => deleteFn({ data: { id } }),
    onSuccess: () => {
      toast.success("Removed");
      q.refetch();
    },
  });

  const items = (q.data as any)?.items ?? [];
  const alertTypeOptions = [
    "stripe_usage_report_failed",
    "monthly_billing_unhandled_error",
    "monthly_billing_partial_failure",
    "reconciliation_run_failed",
    "reconciliation_discrepancy",
    "reconciliation_stripe_read_failed",
    "invoice_payment_failed",
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Alert suppressions</CardTitle>
        <CardDescription>
          Temporarily mute notifications for specific tenants and/or alert types. Retries (manual
          and automated) continue normally. Leave a field as “All” to wildcard.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid md:grid-cols-5 gap-3 items-end">
          <div>
            <Label className="text-xs">Tenant</Label>
            <Select value={tenantId} onValueChange={setTenantId}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All tenants</SelectItem>
                {tenantOptions.map((t: any) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Alert type</Label>
            <Select value={alertType} onValueChange={setAlertType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                {alertTypeOptions.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Reason</Label>
            <Input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Maintenance window"
            />
          </div>
          <div>
            <Label className="text-xs">Expires</Label>
            <Input type="date" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} />
          </div>
          <Button onClick={() => upsert.mutate()} disabled={upsert.isPending}>
            Add rule
          </Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tenant</TableHead>
              <TableHead>Alert type</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Expires</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((r: any) => (
              <TableRow key={r.id}>
                <TableCell>
                  {r.tenants?.name ?? <span className="text-muted-foreground">all</span>}
                </TableCell>
                <TableCell className="font-mono text-xs">
                  {r.alert_type ?? <span className="text-muted-foreground">all</span>}
                </TableCell>
                <TableCell className="text-sm">{r.reason ?? "—"}</TableCell>
                <TableCell className="text-xs">
                  {r.expires_at ? new Date(r.expires_at).toLocaleString() : "never"}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => del.mutate(r.id)}
                    disabled={del.isPending}
                  >
                    Remove
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {items.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-sm text-muted-foreground py-6">
                  No suppression rules.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function RetryPoliciesTab() {
  const q = useQuery({ queryKey: ["retry-policies"], queryFn: () => listRetryPolicies() });
  const upsertFn = useServerFn(upsertRetryPolicy);
  const [draft, setDraft] = useState<Record<string, any>>({});

  const save = useMutation({
    mutationFn: (p: any) => upsertFn({ data: p }),
    onSuccess: () => {
      toast.success("Policy saved");
      q.refetch();
    },
    onError: (e: any) => toast.error(e?.message ?? "Save failed"),
  });

  const items = (q.data as any)?.items ?? [];
  const get = (p: any, k: string) => draft[`${p.alert_type}:${k}`] ?? p[k];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Automated retry policies</CardTitle>
        <CardDescription>
          Per alert type: when enabled, the system retries failed alerts on a backoff schedule until
          max attempts is reached. Reduces manual intervention while preserving idempotency.
        </CardDescription>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Alert type</TableHead>
              <TableHead>Enabled</TableHead>
              <TableHead className="text-right">Max attempts</TableHead>
              <TableHead className="text-right">Initial backoff (s)</TableHead>
              <TableHead className="text-right">Multiplier</TableHead>
              <TableHead className="text-right">Max backoff (s)</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((p: any) => (
              <TableRow key={p.alert_type}>
                <TableCell className="font-mono text-xs">{p.alert_type}</TableCell>
                <TableCell>
                  <Switch
                    checked={!!get(p, "enabled")}
                    onCheckedChange={(v) =>
                      setDraft((d) => ({ ...d, [`${p.alert_type}:enabled`]: v }))
                    }
                  />
                </TableCell>
                <TableCell className="text-right">
                  <Input
                    type="number"
                    className="w-20 ml-auto"
                    value={get(p, "max_attempts")}
                    onChange={(e) =>
                      setDraft((d) => ({
                        ...d,
                        [`${p.alert_type}:max_attempts`]: Number(e.target.value),
                      }))
                    }
                  />
                </TableCell>
                <TableCell className="text-right">
                  <Input
                    type="number"
                    className="w-24 ml-auto"
                    value={get(p, "backoff_seconds")}
                    onChange={(e) =>
                      setDraft((d) => ({
                        ...d,
                        [`${p.alert_type}:backoff_seconds`]: Number(e.target.value),
                      }))
                    }
                  />
                </TableCell>
                <TableCell className="text-right">
                  <Input
                    type="number"
                    step="0.1"
                    className="w-20 ml-auto"
                    value={get(p, "backoff_multiplier")}
                    onChange={(e) =>
                      setDraft((d) => ({
                        ...d,
                        [`${p.alert_type}:backoff_multiplier`]: Number(e.target.value),
                      }))
                    }
                  />
                </TableCell>
                <TableCell className="text-right">
                  <Input
                    type="number"
                    className="w-28 ml-auto"
                    value={get(p, "max_backoff_seconds")}
                    onChange={(e) =>
                      setDraft((d) => ({
                        ...d,
                        [`${p.alert_type}:max_backoff_seconds`]: Number(e.target.value),
                      }))
                    }
                  />
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={save.isPending}
                    onClick={() =>
                      save.mutate({
                        alert_type: p.alert_type,
                        enabled: !!get(p, "enabled"),
                        max_attempts: Number(get(p, "max_attempts")),
                        backoff_seconds: Number(get(p, "backoff_seconds")),
                        backoff_multiplier: Number(get(p, "backoff_multiplier")),
                        max_backoff_seconds: Number(get(p, "max_backoff_seconds")),
                      })
                    }
                  >
                    Save
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <p className="text-xs text-muted-foreground mt-3">
          Schedule a cron POST to <code>/api/public/hooks/auto-retry-alerts</code> every few minutes
          to drive retries.
        </p>
      </CardContent>
    </Card>
  );
}

function downloadBlob(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
