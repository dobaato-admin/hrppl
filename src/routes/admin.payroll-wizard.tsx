import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
  getPayrollSetup,
  upsertPayrollSettings,
  upsertPayrollComponent,
  togglePayrollComponent,
  getPayrollExportBundle,
  logPayrollScenarioEvent,
  logPayrollExportEvent,
  getAdminAuditLog,
} from "@/lib/payroll-setup.functions";
import { getOrgSettings } from "@/lib/org-settings.functions";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronLeft, ChevronRight, CircleDashed, Download, Printer, AlertCircle, Plus, Trash2, History, Settings2 } from "lucide-react";
import { NepalPayrollWizardDialog } from "@/components/payroll/NepalPayrollWizardDialog";
import { AdminGate } from "@/components/AdminGate";
import { ORG_ADMIN_ONLY } from "@/lib/rbac";

export const Route = createFileRoute("/admin/payroll-wizard")({
  head: () => ({ meta: [{ title: "Payroll configuration wizard — HRPPL" }] }),
  component: () => (
    <AdminGate allow={ORG_ADMIN_ONLY}>
      <Wizard />
    </AdminGate>
  ),
});

const STEPS = [
  { id: 0, label: "Country & currency" },
  { id: 1, label: "Pay period & hours" },
  { id: 2, label: "Taxes & deductions" },
  { id: 3, label: "Overtime & allowances" },
  { id: 4, label: "Scenarios" },
  { id: 5, label: "Review & preview" },
] as const;

type ScenarioOverride = { componentId: string; rate: number; enabled: boolean };
type Scenario = { id: string; name: string; gross: number; overrides: ScenarioOverride[] };

function Wizard() {
  const { user, roles, rolesLoaded } = useAuth();
  const canAccess = roles.includes("org_admin") || roles.includes("super_admin");
  const qc = useQueryClient();

  const fetchSetup = useServerFn(getPayrollSetup);
  const fetchOrg = useServerFn(getOrgSettings);
  const saveSettings = useServerFn(upsertPayrollSettings);
  const saveComponent = useServerFn(upsertPayrollComponent);
  const toggleComp = useServerFn(togglePayrollComponent);

  const setup = useQuery({
    queryKey: ["payroll-wizard-setup"],
    queryFn: () => fetchSetup(),
    enabled: !!user && rolesLoaded && canAccess,
  });
  const org = useQuery({
    queryKey: ["payroll-wizard-org"],
    queryFn: () => fetchOrg(),
    enabled: !!user && rolesLoaded && canAccess,
  });


  const [step, setStep] = useState(0);
  const [nepalOpen, setNepalOpen] = useState(false);
  const [previewGross, setPreviewGross] = useState(5000);
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [exporting, setExporting] = useState(false);
  const fetchExport = useServerFn(getPayrollExportBundle);
  const logScenario = useServerFn(logPayrollScenarioEvent);
  const logExport = useServerFn(logPayrollExportEvent);
  const fetchAudit = useServerFn(getAdminAuditLog);

  const ALL_SECTIONS = [
    { id: "settings", label: "Settings" },
    { id: "components", label: "Components" },
    { id: "leaveTypes", label: "Leave types" },
    { id: "overtimeRates", label: "Overtime & penalty rates" },
    { id: "taxBrackets", label: "Tax brackets" },
    { id: "holidayCategories", label: "Holiday categories" },
    { id: "holidays", label: "Public holidays" },
    { id: "scenarios", label: "Scenarios" },
  ] as const;
  const [exportSections, setExportSections] = useState<string[]>(ALL_SECTIONS.map((s) => s.id));
  const [auditOpen, setAuditOpen] = useState(false);
  const audit = useQuery({
    queryKey: ["payroll-audit"],
    queryFn: () => fetchAudit({ data: {} }),
    enabled: !!user && rolesLoaded && canAccess && auditOpen,
  });

  if (!user || !rolesLoaded) {
    return <AppShell title="Payroll configuration wizard"><main className="p-6 text-muted-foreground">Loading…</main></AppShell>;
  }
  const tenant = (org.data as any)?.tenant;
  const countrySettings = (org.data as any)?.countryPayrollSettings;
  const settings = (setup.data as any)?.settings;
  const components = ((setup.data as any)?.components ?? []) as any[];
  const currency = tenant?.currency_code ?? "USD";

  const formatMoney = (n: number) =>
    new Intl.NumberFormat(undefined, { style: "currency", currency, maximumFractionDigits: 2 }).format(n);

  const preview = useMemo(() => {
    const basic = previewGross;
    const lines: { label: string; amount: number; kind: "earning" | "deduction" }[] = [
      { label: "Basic", amount: basic, kind: "earning" },
    ];
    let grossEarnings = basic;
    let totalDeductions = 0;
    for (const c of components.filter((x) => x.is_active)) {
      let amt = 0;
      if (c.calc_type === "flat") amt = Number(c.rate) || 0;
      else if (c.calc_type === "pct_of_basic") amt = (Number(c.rate) / 100) * basic;
      else if (c.calc_type === "pct_of_gross") amt = (Number(c.rate) / 100) * grossEarnings;
      const isDeduction = ["tax", "pf", "retirement", "deduction"].includes(c.kind);
      if (isDeduction) totalDeductions += amt;
      else grossEarnings += amt;
      lines.push({
        label: `${c.label} (${c.code})`,
        amount: amt,
        kind: isDeduction ? "deduction" : "earning",
      });
    }
    return { lines, gross: grossEarnings, deductions: totalDeductions, net: grossEarnings - totalDeductions };
  }, [components, previewGross]);

  // ---- Validation per step ----
  const stepErrors = useMemo<Record<number, string[]>>(() => {
    const errors: Record<number, string[]> = { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [] };
    if (!tenant?.country_code) errors[0].push("Country is not set on this organisation.");
    if (!tenant?.currency_code) errors[0].push("Currency is not set on this organisation.");
    if (!settings?.pay_period) errors[1].push("Choose a pay period and save before continuing.");
    if (settings && (settings.standard_hours_per_day == null || settings.standard_hours_per_day <= 0))
      errors[1].push("Standard hours per day must be greater than 0.");
    if (settings && (settings.standard_days_per_week == null || settings.standard_days_per_week <= 0))
      errors[1].push("Standard days per week must be greater than 0.");
    const taxKinds = ["tax", "pf", "retirement", "deduction"];
    const hasTax = components.some((c) => taxKinds.includes(c.kind) && c.is_active);
    if (!hasTax) errors[2].push("Add at least one active tax or statutory deduction.");
    return errors;
  }, [tenant, settings, components]);

  const currentErrors = stepErrors[step] ?? [];
  const nextDisabled = currentErrors.length > 0;

  // ---- Scenario engine ----
  function runScenario(gross: number, overrides: ScenarioOverride[]) {
    const overrideMap = new Map(overrides.map((o) => [o.componentId, o]));
    let grossEarnings = gross;
    let totalDeductions = 0;
    const lines: { label: string; amount: number; kind: "earning" | "deduction" }[] = [
      { label: "Basic", amount: gross, kind: "earning" },
    ];
    for (const c of components) {
      const ov = overrideMap.get(c.id);
      const active = ov ? ov.enabled : c.is_active;
      if (!active) continue;
      const rate = ov ? ov.rate : Number(c.rate);
      let amt = 0;
      if (c.calc_type === "flat") amt = rate || 0;
      else if (c.calc_type === "pct_of_basic") amt = (rate / 100) * gross;
      else if (c.calc_type === "pct_of_gross") amt = (rate / 100) * grossEarnings;
      const isDeduction = ["tax", "pf", "retirement", "deduction"].includes(c.kind);
      if (isDeduction) totalDeductions += amt;
      else grossEarnings += amt;
      lines.push({ label: `${c.label}`, amount: amt, kind: isDeduction ? "deduction" : "earning" });
    }
    return { lines, gross: grossEarnings, deductions: totalDeductions, net: grossEarnings - totalDeductions };
  }

  // ---- Export ----
  function buildScenarioResults() {
    return scenarios.map((s) => {
      const r = runScenario(s.gross, s.overrides);
      return {
        id: s.id, name: s.name, gross_input: s.gross,
        gross_earnings: r.gross, total_deductions: r.deductions, net_pay: r.net,
        overrides_active: s.overrides.filter((o) => o.enabled).length,
      };
    });
  }
  function buildMeta() {
    return {
      exported_at: new Date().toISOString(),
      exported_by: user?.email ?? user?.id ?? null,
      tenant: tenant?.name ?? null,
      country: tenant?.country_code ?? null,
      currency,
      sections: exportSections,
      rule_versions: {
        components: components.length,
        active_components: components.filter((c: any) => c.is_active).length,
        settings_updated_at: settings?.updated_at ?? settings?.created_at ?? null,
        scenarios: scenarios.length,
      },
    };
  }
  function filterBundleBySections(bundle: any) {
    const filtered: any = { tenant: bundle.tenant };
    for (const id of exportSections) {
      if (id === "scenarios") filtered.scenarios = buildScenarioResults();
      else filtered[id] = (bundle as any)[id];
    }
    return filtered;
  }
  async function handleExportCsv() {
    if (exportSections.length === 0) { toast.error("Pick at least one section"); return; }
    setExporting(true);
    try {
      const bundle = await fetchExport();
      const meta = buildMeta();
      const filtered = filterBundleBySections(bundle as any);
      const csv = bundleToCsv(filtered, meta);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `payroll-rules-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      await logExport({ data: { format: "csv", sections: exportSections, scenarios: scenarios.map((s) => ({ id: s.id, name: s.name })) } }).catch(() => {});
      toast.success("Export downloaded");
    } catch (e: any) {
      toast.error(e.message ?? "Export failed");
    } finally {
      setExporting(false);
    }
  }
  async function handleExportPdf() {
    if (exportSections.length === 0) { toast.error("Pick at least one section"); return; }
    setExporting(true);
    try {
      const bundle = await fetchExport();
      const meta = buildMeta();
      const filtered = filterBundleBySections(bundle as any);
      const html = bundleToPrintableHtml(filtered, currency, meta);
      const w = window.open("", "_blank", "width=900,height=1200");
      if (!w) { toast.error("Pop-up blocked"); return; }
      w.document.write(html);
      w.document.close();
      w.onload = () => { w.focus(); w.print(); };
      await logExport({ data: { format: "pdf", sections: exportSections, scenarios: scenarios.map((s) => ({ id: s.id, name: s.name })) } }).catch(() => {});
    } catch (e: any) {
      toast.error(e.message ?? "Export failed");
    } finally {
      setExporting(false);
    }
  }

  return (
    <AppShell title="Payroll configuration wizard">
      <a href="#wizard-main" className="sr-only focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:z-50 focus:rounded focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground">
        Skip to wizard content
      </a>
      <main id="wizard-main" tabIndex={-1} className="mx-auto w-full max-w-6xl space-y-6 p-4 sm:p-6 focus:outline-none">
        <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 sm:flex sm:flex-wrap sm:justify-between">
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-semibold">Payroll setup wizard</h1>
            <p className="text-sm text-muted-foreground">
              Guided configuration for taxes, hours, overtime and leave — with a live payslip preview.
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" aria-label="Choose export sections">
                  <Settings2 className="size-4" /> Sections ({exportSections.length})
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Include in export</p>
                    <button
                      type="button"
                      className="text-xs text-muted-foreground underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
                      onClick={() => setExportSections(exportSections.length === ALL_SECTIONS.length ? [] : ALL_SECTIONS.map((s) => s.id))}
                    >
                      {exportSections.length === ALL_SECTIONS.length ? "Clear" : "All"}
                    </button>
                  </div>
                  <ul className="space-y-1">
                    {ALL_SECTIONS.map((s) => {
                      const checked = exportSections.includes(s.id);
                      return (
                        <li key={s.id} className="flex items-center gap-2">
                          <Checkbox
                            id={`exp-${s.id}`}
                            checked={checked}
                            onCheckedChange={(v) => setExportSections(v
                              ? Array.from(new Set([...exportSections, s.id]))
                              : exportSections.filter((x) => x !== s.id))}
                          />
                          <Label htmlFor={`exp-${s.id}`} className="cursor-pointer text-sm font-normal">{s.label}</Label>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </PopoverContent>
            </Popover>
            <Button variant="outline" size="sm" onClick={handleExportCsv} disabled={exporting}>
              <Download className="size-4" /> CSV
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportPdf} disabled={exporting}>
              <Printer className="size-4" /> Print / PDF
            </Button>
            <Button variant="outline" size="sm" onClick={() => setAuditOpen((v) => !v)} aria-expanded={auditOpen} aria-controls="audit-panel">
              <History className="size-4" /> Audit log
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link to="/admin/payroll-setup">Advanced view</Link>
            </Button>
          </div>
        </header>

        {auditOpen && (
          <Card id="audit-panel">
            <CardHeader>
              <CardTitle className="text-base">Admin audit log</CardTitle>
              <CardDescription>Recent payroll rule edits, scenario events and exports.</CardDescription>
            </CardHeader>
            <CardContent>
              {audit.isLoading ? (
                <p className="text-sm text-muted-foreground">Loading…</p>
              ) : (audit.data as any)?.entries?.length ? (
                <div className="max-h-80 overflow-y-auto rounded-md border">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
                      <tr><th className="px-3 py-2">When</th><th className="px-3 py-2">Category</th><th className="px-3 py-2">Action</th><th className="px-3 py-2">Entity</th><th className="px-3 py-2">Details</th></tr>
                    </thead>
                    <tbody>
                      {(audit.data as any).entries.map((e: any) => (
                        <tr key={e.id} className="border-t focus-within:bg-muted/40">
                          <td className="px-3 py-2 text-xs text-muted-foreground tabular-nums">{new Date(e.created_at).toLocaleString()}</td>
                          <td className="px-3 py-2"><Badge variant="outline">{e.category}</Badge></td>
                          <td className="px-3 py-2">{e.action}</td>
                          <td className="px-3 py-2 text-xs text-muted-foreground">{e.entity_type ?? "—"}</td>
                          <td className="px-3 py-2 text-xs"><code className="text-[11px]">{JSON.stringify(e.details)}</code></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No audit entries yet.</p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Stepper */}
        <ol
          className="grid gap-2 rounded-lg border bg-card p-3 sm:grid-cols-3 lg:grid-cols-6"
          aria-label="Wizard steps"
        >
          {STEPS.map((s) => {
            const done = step > s.id;
            const active = step === s.id;
            return (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => setStep(s.id)}
                  aria-current={active ? "step" : undefined}
                  className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                    active ? "bg-primary text-primary-foreground" : done ? "bg-muted" : "hover:bg-muted"
                  }`}
                >
                  {done ? <Check className="size-4 shrink-0" /> : <CircleDashed className="size-4 shrink-0" />}
                  <span className="truncate">{s.id + 1}. {s.label}</span>
                </button>
              </li>
            );
          })}
        </ol>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <section className="min-w-0">
            {step === 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Country & currency</CardTitle>
                  <CardDescription>
                    Payroll rules apply per country. Update these in organisation settings if they're wrong.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label>Country</Label>
                      <div className="mt-1 rounded-md border bg-muted/30 px-3 py-2 text-sm">
                        {tenant?.country_code ?? "—"}
                      </div>
                    </div>
                    <div>
                      <Label>Currency</Label>
                      <div className="mt-1 rounded-md border bg-muted/30 px-3 py-2 text-sm">{currency}</div>
                    </div>
                  </div>
                  {countrySettings ? (
                    <div className="rounded-md border bg-muted/20 p-3 text-sm">
                      <p className="mb-2 font-medium">Country defaults</p>
                      <ul className="grid gap-1 sm:grid-cols-2">
                        <li><span className="text-muted-foreground">Pay frequency:</span> {countrySettings.pay_frequency}</li>
                        <li><span className="text-muted-foreground">Workweek hours:</span> {countrySettings.workweek_hours}</li>
                        <li><span className="text-muted-foreground">Overtime ×:</span> {countrySettings.overtime_multiplier}</li>
                        <li><span className="text-muted-foreground">Fiscal start:</span> month {countrySettings.fiscal_year_start_month}</li>
                      </ul>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No country preset found — use the next steps to configure manually.
                    </p>
                  )}
                  {tenant?.country_code === "NP" && (
                    <div className="rounded-md border border-primary/30 bg-primary/5 p-3 text-sm">
                      <p className="font-medium">Nepal payroll quick-seed (FY 2081/82)</p>
                      <p className="text-xs text-muted-foreground">Seeds income tax slabs, SSF 11%/20%, CIT, festival bonus and PF election as draft rules.</p>
                      <Button size="sm" className="mt-2" onClick={() => setNepalOpen(true)}>Open Nepal wizard</Button>
                    </div>
                  )}
                  <div className="flex justify-end">
                    <Button asChild variant="link"><Link to="/settings/organization">Change in organisation settings</Link></Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {step === 1 && <PayPeriodStep settings={settings} onSave={async (v) => {
              try { await saveSettings({ data: v }); toast.success("Saved"); qc.invalidateQueries({ queryKey: ["payroll-wizard-setup"] }); }
              catch (e: any) { toast.error(e.message ?? "Save failed"); }
            }} />}

            {step === 2 && (
              <ComponentStep
                title="Taxes & statutory deductions"
                description="Income tax, PF, social security and other withholdings deducted from gross pay."
                allowedKinds={["tax", "pf", "retirement", "deduction"]}
                components={components}
                onSave={async (v) => {
                  try { await saveComponent({ data: v }); toast.success("Saved"); qc.invalidateQueries({ queryKey: ["payroll-wizard-setup"] }); }
                  catch (e: any) { toast.error(e.message ?? "Save failed"); }
                }}
                onToggle={async (id, active) => {
                  try { await toggleComp({ data: { id, is_active: active } }); qc.invalidateQueries({ queryKey: ["payroll-wizard-setup"] }); }
                  catch (e: any) { toast.error(e.message ?? "Toggle failed"); }
                }}
              />
            )}

            {step === 3 && (
              <ComponentStep
                title="Overtime, penalty rates & allowances"
                description="Earnings on top of basic pay — overtime multipliers, transport, housing, meal allowances."
                allowedKinds={["allowance", "other"]}
                components={components}
                onSave={async (v) => {
                  try { await saveComponent({ data: v }); toast.success("Saved"); qc.invalidateQueries({ queryKey: ["payroll-wizard-setup"] }); }
                  catch (e: any) { toast.error(e.message ?? "Save failed"); }
                }}
                onToggle={async (id, active) => {
                  try { await toggleComp({ data: { id, is_active: active } }); qc.invalidateQueries({ queryKey: ["payroll-wizard-setup"] }); }
                  catch (e: any) { toast.error(e.message ?? "Toggle failed"); }
                }}
              />
            )}

            {step === 4 && (
              <ScenariosStep
                components={components}
                scenarios={scenarios}
                setScenarios={setScenarios}
                runScenario={runScenario}
                formatMoney={formatMoney}
                onScenarioEvent={(s, action) =>
                  logScenario({ data: { scenarioId: s.id, name: s.name, action, gross: s.gross, overrideCount: s.overrides.filter((o) => o.enabled).length } }).catch(() => {})
                }
              />
            )}

            {step === 5 && (
              <Card>
                <CardHeader>
                  <CardTitle>Review</CardTitle>
                  <CardDescription>Confirm your configuration. Use the preview pane to validate calculations.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <SummaryRow label="Country" value={tenant?.country_code ?? "—"} />
                    <SummaryRow label="Currency" value={currency} />
                    <SummaryRow label="Pay period" value={settings?.pay_period ?? "not set"} />
                    <SummaryRow label="Workday hours" value={settings?.standard_hours_per_day ?? "—"} />
                    <SummaryRow label="Workweek days" value={settings?.standard_days_per_week ?? "—"} />
                    <SummaryRow label="Active components" value={components.filter((c) => c.is_active).length} />
                  </div>
                  <Separator />
                  <div className="flex flex-wrap justify-end gap-2">
                    <Button variant="outline" onClick={handleExportCsv} disabled={exporting}>
                      <Download className="size-4" /> Export CSV
                    </Button>
                    <Button variant="outline" onClick={handleExportPdf} disabled={exporting}>
                      <Printer className="size-4" /> Print PDF
                    </Button>
                    <Button asChild variant="outline"><Link to="/admin/payroll-setup">Advanced settings</Link></Button>
                    <Button onClick={() => toast.success("Setup looks good")}>Finish</Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {currentErrors.length > 0 && (
              <div role="alert" className="mt-4 rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm">
                <div className="mb-1 flex items-center gap-2 font-medium text-destructive">
                  <AlertCircle className="size-4" /> Resolve before continuing
                </div>
                <ul className="list-inside list-disc text-destructive/90">
                  {currentErrors.map((e, i) => <li key={i}>{e}</li>)}
                </ul>
              </div>
            )}

            <div className="mt-4 flex justify-between">
              <Button variant="ghost" disabled={step === 0} onClick={() => setStep((s) => Math.max(0, s - 1))}>
                <ChevronLeft className="size-4" /> Back
              </Button>
              <Button
                disabled={step === STEPS.length - 1 || nextDisabled}
                onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}
                aria-describedby={nextDisabled ? "wizard-step-errors" : undefined}
              >
                Next <ChevronRight className="size-4" />
              </Button>
            </div>
          </section>

          {/* Live preview */}
          <aside className="lg:sticky lg:top-4 lg:self-start">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Live payslip preview</CardTitle>
                <CardDescription>How a sample paycheck applies the current rules.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label htmlFor="preview-gross">Sample basic pay</Label>
                  <Input
                    id="preview-gross"
                    type="number"
                    min={0}
                    value={previewGross}
                    onChange={(e) => setPreviewGross(Math.max(0, Number(e.target.value) || 0))}
                  />
                </div>
                <div className="space-y-1 text-sm">
                  {preview.lines.map((l, i) => (
                    <div key={i} className="flex items-center justify-between gap-2">
                      <span className="truncate text-muted-foreground">{l.label}</span>
                      <span className={l.kind === "deduction" ? "text-destructive tabular-nums" : "tabular-nums"}>
                        {l.kind === "deduction" ? "-" : ""}{formatMoney(l.amount)}
                      </span>
                    </div>
                  ))}
                </div>
                <Separator />
                <div className="space-y-1 text-sm">
                  <Row label="Gross earnings" value={formatMoney(preview.gross)} />
                  <Row label="Total deductions" value={formatMoney(preview.deductions)} muted />
                </div>
                <div className="rounded-md bg-primary/5 p-3">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground">Net pay</div>
                  <div className="text-2xl font-semibold tabular-nums">{formatMoney(preview.net)}</div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Preview assumes the current basic; per-employee bands are evaluated at run time.
                </p>
              </CardContent>
            </Card>
          </aside>
        </div>
      </main>
      <NepalPayrollWizardDialog open={nepalOpen} onOpenChange={setNepalOpen} />
    </AppShell>
  );
}

function SummaryRow({ label, value }: { label: string; value: any }) {
  return (
    <div className="rounded-md border bg-muted/20 p-3">
      <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="truncate text-sm font-medium">{String(value)}</div>
    </div>
  );
}

function Row({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className={muted ? "text-muted-foreground" : ""}>{label}</span>
      <span className="tabular-nums">{value}</span>
    </div>
  );
}

function PayPeriodStep({
  settings,
  onSave,
}: {
  settings: any;
  onSave: (v: {
    pay_period: "weekly" | "fortnightly" | "semimonthly" | "monthly";
    standard_hours_per_day: number;
    standard_days_per_week: number;
    meal_break_minutes: number;
    rest_break_minutes: number;
    notes?: string | null;
  }) => Promise<void>;
}) {
  const [payPeriod, setPayPeriod] = useState<string>(settings?.pay_period ?? "monthly");
  const [hpd, setHpd] = useState(settings?.standard_hours_per_day ?? 8);
  const [dpw, setDpw] = useState(settings?.standard_days_per_week ?? 5);
  const [meal, setMeal] = useState(settings?.meal_break_minutes ?? 30);
  const [rest, setRest] = useState(settings?.rest_break_minutes ?? 15);
  const [busy, setBusy] = useState(false);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pay period & working hours</CardTitle>
        <CardDescription>How often you pay employees and the standard working week.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="pp">Pay period</Label>
            <Select value={payPeriod} onValueChange={setPayPeriod}>
              <SelectTrigger id="pp"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="fortnightly">Fortnightly</SelectItem>
                <SelectItem value="semimonthly">Semi-monthly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="hpd">Hours / day</Label>
              <Input id="hpd" type="number" min={0} max={24} value={hpd} onChange={(e) => setHpd(Number(e.target.value))} />
            </div>
            <div>
              <Label htmlFor="dpw">Days / week</Label>
              <Input id="dpw" type="number" min={0} max={7} value={dpw} onChange={(e) => setDpw(Number(e.target.value))} />
            </div>
          </div>
          <div>
            <Label htmlFor="meal">Meal break (min)</Label>
            <Input id="meal" type="number" min={0} max={240} value={meal} onChange={(e) => setMeal(Number(e.target.value))} />
          </div>
          <div>
            <Label htmlFor="rest">Rest break (min)</Label>
            <Input id="rest" type="number" min={0} max={240} value={rest} onChange={(e) => setRest(Number(e.target.value))} />
          </div>
        </div>
        <div className="flex justify-end">
          <Button
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              try {
                await onSave({
                  pay_period: payPeriod as any,
                  standard_hours_per_day: hpd,
                  standard_days_per_week: dpw,
                  meal_break_minutes: meal,
                  rest_break_minutes: rest,
                });
              } finally {
                setBusy(false);
              }
            }}
          >
            Save
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function ComponentStep({
  title,
  description,
  allowedKinds,
  components,
  onSave,
  onToggle,
}: {
  title: string;
  description: string;
  allowedKinds: string[];
  components: any[];
  onSave: (v: any) => Promise<void>;
  onToggle: (id: string, active: boolean) => Promise<void>;
}) {
  const filtered = components.filter((c) => allowedKinds.includes(c.kind));
  const [code, setCode] = useState("");
  const [label, setLabel] = useState("");
  const [kind, setKind] = useState(allowedKinds[0]);
  const [calc, setCalc] = useState("pct_of_basic");
  const [rate, setRate] = useState(0);
  const [busy, setBusy] = useState(false);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground">No components configured yet.</p>
        ) : (
          <ul className="divide-y rounded-md border">
            {filtered.map((c) => (
              <li key={c.id} className="flex items-center justify-between gap-3 p-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-medium">{c.label}</span>
                    <Badge variant="outline">{c.code}</Badge>
                    <Badge variant="secondary">{c.kind}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {c.calc_type === "flat" ? `Flat ${c.rate}` : `${c.rate}% of ${c.calc_type === "pct_of_basic" ? "basic" : "gross"}`}
                  </p>
                </div>
                <Switch
                  checked={!!c.is_active}
                  onCheckedChange={(v) => onToggle(c.id, !!v)}
                  aria-label={`Toggle ${c.label}`}
                />
              </li>
            ))}
          </ul>
        )}
        <Separator />
        <div>
          <p className="mb-2 text-sm font-medium">Add component</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label htmlFor="c-code">Code</Label>
              <Input id="c-code" value={code} onChange={(e) => setCode(e.target.value)} placeholder="PF" />
            </div>
            <div>
              <Label htmlFor="c-label">Label</Label>
              <Input id="c-label" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Provident Fund" />
            </div>
            <div>
              <Label htmlFor="c-kind">Kind</Label>
              <Select value={kind} onValueChange={setKind}>
                <SelectTrigger id="c-kind"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {allowedKinds.map((k) => (
                    <SelectItem key={k} value={k}>{k}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="c-calc">Calculation</Label>
              <Select value={calc} onValueChange={setCalc}>
                <SelectTrigger id="c-calc"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="flat">Flat amount</SelectItem>
                  <SelectItem value="pct_of_basic">% of basic</SelectItem>
                  <SelectItem value="pct_of_gross">% of gross</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="c-rate">{calc === "flat" ? "Amount" : "Rate (%)"}</Label>
              <Input id="c-rate" type="number" min={0} value={rate} onChange={(e) => setRate(Number(e.target.value))} />
            </div>
          </div>
          <div className="mt-3 flex justify-end">
            <Button
              disabled={busy || !code || !label}
              onClick={async () => {
                setBusy(true);
                try {
                  await onSave({
                    code, label, kind, calc_type: calc, rate, is_taxable: false,
                    show_on_payslip: true, is_active: true, sort_order: 100,
                  });
                  setCode(""); setLabel(""); setRate(0);
                } finally { setBusy(false); }
              }}
            >
              Add component
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ---------- Scenarios step ----------
function ScenariosStep({
  components, scenarios, setScenarios, runScenario, formatMoney, onScenarioEvent,
}: {
  components: any[];
  scenarios: Scenario[];
  setScenarios: (s: Scenario[]) => void;
  runScenario: (gross: number, overrides: ScenarioOverride[]) => { lines: { label: string; amount: number; kind: "earning" | "deduction" }[]; gross: number; deductions: number; net: number };
  formatMoney: (n: number) => string;
  onScenarioEvent?: (s: Scenario, action: "create" | "update" | "delete") => void;
}) {
  function addScenario() {
    const next: Scenario = {
      id: crypto.randomUUID(),
      name: `Scenario ${scenarios.length + 1}`,
      gross: 5000,
      overrides: components.map((c) => ({ componentId: c.id, rate: Number(c.rate), enabled: !!c.is_active })),
    };
    setScenarios([...scenarios, next]);
    onScenarioEvent?.(next, "create");
  }
  function updateScenario(id: string, patch: Partial<Scenario>) {
    setScenarios(scenarios.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  }
  function removeScenario(id: string) {
    const target = scenarios.find((s) => s.id === id);
    setScenarios(scenarios.filter((s) => s.id !== id));
    if (target) onScenarioEvent?.(target, "delete");
  }
  function updateOverride(scenarioId: string, componentId: string, patch: Partial<ScenarioOverride>) {
    setScenarios(scenarios.map((s) => s.id === scenarioId ? {
      ...s,
      overrides: s.overrides.map((o) => o.componentId === componentId ? { ...o, ...patch } : o),
    } : s));
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payroll scenarios</CardTitle>
        <CardDescription>
          Build side-by-side what-if scenarios by overriding tax, leave, and overtime rates.
          Compare resulting payslips before publishing changes.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{scenarios.length} scenario{scenarios.length === 1 ? "" : "s"}</p>
          <Button size="sm" onClick={addScenario} disabled={components.length === 0}>
            <Plus className="size-4" /> Add scenario
          </Button>
        </div>
        {scenarios.length === 0 ? (
          <p className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
            No scenarios yet. Add one to simulate alternative rules.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <div className="grid auto-cols-[minmax(260px,1fr)] grid-flow-col gap-3">
              {scenarios.map((s) => {
                const result = runScenario(s.gross, s.overrides);
                return (
                  <div key={s.id} className="min-w-0 rounded-md border bg-card p-3 focus-within:ring-2 focus-within:ring-ring">
                    <div className="mb-2 flex items-center gap-2">
                      <Input
                        value={s.name}
                        onChange={(e) => updateScenario(s.id, { name: e.target.value })}
                        className="h-8"
                        aria-label="Scenario name"
                      />
                      <Button size="icon" variant="ghost" onClick={() => removeScenario(s.id)} aria-label="Remove scenario">
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                    <div className="mb-3">
                      <Label className="text-xs">Sample basic pay</Label>
                      <Input
                        type="number" min={0} value={s.gross}
                        onChange={(e) => updateScenario(s.id, { gross: Math.max(0, Number(e.target.value) || 0) })}
                        className="h-8"
                      />
                    </div>
                    <details className="mb-3 rounded-md border bg-muted/20 p-2">
                      <summary className="cursor-pointer text-xs font-medium">Override rates ({s.overrides.filter((o) => o.enabled).length} active)</summary>
                      <ul className="mt-2 space-y-2">
                        {components.map((c) => {
                          const ov = s.overrides.find((o) => o.componentId === c.id);
                          if (!ov) return null;
                          return (
                            <li key={c.id} className="grid grid-cols-[minmax(0,1fr)_70px_auto] items-center gap-2">
                              <span className="truncate text-xs">{c.label}</span>
                              <Input
                                type="number" min={0} value={ov.rate}
                                onChange={(e) => updateOverride(s.id, c.id, { rate: Number(e.target.value) || 0 })}
                                className="h-7"
                                aria-label={`${c.label} rate`}
                              />
                              <Switch
                                checked={ov.enabled}
                                onCheckedChange={(v) => updateOverride(s.id, c.id, { enabled: !!v })}
                                aria-label={`Enable ${c.label}`}
                              />
                            </li>
                          );
                        })}
                      </ul>
                    </details>
                    <div className="space-y-1 text-xs">
                      {result.lines.map((l, i) => (
                        <div key={i} className="flex justify-between">
                          <span className="truncate text-muted-foreground">{l.label}</span>
                          <span className={l.kind === "deduction" ? "tabular-nums text-destructive" : "tabular-nums"}>
                            {l.kind === "deduction" ? "-" : ""}{formatMoney(l.amount)}
                          </span>
                        </div>
                      ))}
                    </div>
                    <Separator className="my-2" />
                    <div className="flex justify-between text-xs">
                      <span>Gross</span><span className="tabular-nums">{formatMoney(result.gross)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>Deductions</span><span className="tabular-nums">{formatMoney(result.deductions)}</span>
                    </div>
                    <div className="mt-2 rounded bg-primary/5 p-2">
                      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Net pay</div>
                      <div className="text-lg font-semibold tabular-nums">{formatMoney(result.net)}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        {scenarios.length >= 2 && (
          <div className="rounded-md border bg-card">
            <div className="border-b bg-muted/40 px-3 py-2 text-sm font-medium">Side-by-side comparison</div>
            <div className="overflow-x-auto" role="region" aria-label="Scenario comparison" tabIndex={0}>
              <table className="w-full min-w-[640px] text-sm">
                <caption className="sr-only">Comparison of each scenario's inputs and resulting net pay</caption>
                <thead>
                  <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <th scope="col" className="px-3 py-2">Scenario</th>
                    <th scope="col" className="px-3 py-2 text-right">Basic input</th>
                    <th scope="col" className="px-3 py-2 text-right">Active overrides</th>
                    <th scope="col" className="px-3 py-2 text-right">Gross</th>
                    <th scope="col" className="px-3 py-2 text-right">Deductions</th>
                    <th scope="col" className="px-3 py-2 text-right">Net pay</th>
                    <th scope="col" className="px-3 py-2 text-right">Δ vs. first</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const results = scenarios.map((s) => ({ s, r: runScenario(s.gross, s.overrides) }));
                    const baseline = results[0]?.r.net ?? 0;
                    return results.map(({ s, r }, i) => {
                      const delta = r.net - baseline;
                      const deltaPct = baseline === 0 ? 0 : (delta / baseline) * 100;
                      return (
                        <tr key={s.id} className="border-b focus-within:bg-muted/30 hover:bg-muted/20">
                          <th scope="row" className="px-3 py-2 text-left font-medium">{s.name}</th>
                          <td className="px-3 py-2 text-right tabular-nums">{formatMoney(s.gross)}</td>
                          <td className="px-3 py-2 text-right tabular-nums">{s.overrides.filter((o) => o.enabled).length}</td>
                          <td className="px-3 py-2 text-right tabular-nums">{formatMoney(r.gross)}</td>
                          <td className="px-3 py-2 text-right tabular-nums text-destructive">−{formatMoney(r.deductions)}</td>
                          <td className="px-3 py-2 text-right font-semibold tabular-nums">{formatMoney(r.net)}</td>
                          <td className={`px-3 py-2 text-right tabular-nums ${i === 0 ? "text-muted-foreground" : delta > 0 ? "text-emerald-600" : delta < 0 ? "text-destructive" : ""}`}>
                            {i === 0 ? "baseline" : `${delta > 0 ? "+" : ""}${formatMoney(delta)} (${deltaPct.toFixed(1)}%)`}
                          </td>
                        </tr>
                      );
                    });
                  })()}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ---------- Export helpers ----------
function csvEscape(v: any): string {
  if (v === null || v === undefined) return "";
  const s = String(v);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}
function rowsToCsv(rows: Record<string, any>[]): string {
  if (rows.length === 0) return "(no rows)\n";
  const colSet = new Set<string>();
  rows.forEach((r) => Object.keys(r).forEach((k) => colSet.add(k)));
  const cols = Array.from(colSet);
  const head = cols.join(",");
  const body = rows.map((r) => cols.map((c) => csvEscape(r[c])).join(",")).join("\n");
  return `${head}\n${body}\n`;
}
const SECTION_TITLES: Record<string, string> = {
  settings: "Settings",
  components: "Components",
  leaveTypes: "Leave types",
  overtimeRates: "Overtime & penalty rates",
  taxBrackets: "Tax brackets",
  holidayCategories: "Public holiday categories",
  holidays: "Public holidays",
  scenarios: "Scenarios",
};
function bundleToCsv(b: any, meta: any): string {
  const metaRows = [
    { key: "exported_at", value: meta.exported_at },
    { key: "exported_by", value: meta.exported_by ?? "" },
    { key: "tenant", value: meta.tenant ?? "" },
    { key: "country", value: meta.country ?? "" },
    { key: "currency", value: meta.currency ?? "" },
    { key: "sections", value: (meta.sections ?? []).join("|") },
    { key: "rule_versions", value: JSON.stringify(meta.rule_versions ?? {}) },
  ];
  const sections: { title: string; rows: any[] }[] = [
    { title: "Export metadata", rows: metaRows },
    { title: "Tenant", rows: b.tenant ? [b.tenant] : [] },
  ];
  for (const key of Object.keys(SECTION_TITLES)) {
    if (b[key] === undefined) continue;
    const rows = Array.isArray(b[key]) ? b[key] : b[key] ? [b[key]] : [];
    sections.push({ title: SECTION_TITLES[key], rows });
  }
  return sections.map((s) => `## ${s.title}\n${rowsToCsv(s.rows)}`).join("\n");
}
function bundleToPrintableHtml(b: any, currency: string, meta: any): string {
  const esc = (s: any) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]!));
  const tableFor = (rows: any[]) => {
    if (!rows || rows.length === 0) return "<p><em>None</em></p>";
    const colSet = new Set<string>();
    rows.forEach((r) => Object.keys(r).forEach((k) => colSet.add(k)));
    const cols = Array.from(colSet);
    return `<table><thead><tr>${cols.map((c) => `<th>${esc(c)}</th>`).join("")}</tr></thead><tbody>${
      rows.map((r: any) => `<tr>${cols.map((c) => `<td>${esc(r[c])}</td>`).join("")}</tr>`).join("")
    }</tbody></table>`;
  };
  const sectionHtml = Object.keys(SECTION_TITLES)
    .filter((k) => b[k] !== undefined)
    .map((k) => {
      const rows = Array.isArray(b[k]) ? b[k] : b[k] ? [b[k]] : [];
      return `<h2>${esc(SECTION_TITLES[k])}</h2>${tableFor(rows)}`;
    }).join("");
  return `<!doctype html><html><head><meta charset="utf-8"><title>Payroll rules export</title>
    <style>
      body { font-family: ui-sans-serif, system-ui, -apple-system, sans-serif; padding: 24px; color: #111; }
      h1 { margin: 0 0 4px; }
      h2 { margin: 24px 0 8px; font-size: 16px; border-bottom: 1px solid #ccc; padding-bottom: 4px; }
      table { border-collapse: collapse; width: 100%; font-size: 11px; }
      th, td { border: 1px solid #ddd; padding: 4px 6px; text-align: left; vertical-align: top; }
      th { background: #f3f4f6; }
      .meta { color: #555; font-size: 12px; margin-bottom: 16px; }
      .meta dl { display: grid; grid-template-columns: max-content 1fr; gap: 2px 12px; margin: 0; }
      .meta dt { font-weight: 600; }
      @media print { body { padding: 12mm; } }
    </style></head><body>
    <h1>${esc(b.tenant?.name ?? meta.tenant ?? "Payroll rules")}</h1>
    <div class="meta"><dl>
      <dt>Generated</dt><dd>${esc(new Date(meta.exported_at).toLocaleString())}</dd>
      <dt>Exported by</dt><dd>${esc(meta.exported_by ?? "—")}</dd>
      <dt>Country</dt><dd>${esc(b.tenant?.country_code ?? meta.country ?? "—")}</dd>
      <dt>Currency</dt><dd>${esc(currency)}</dd>
      <dt>Sections</dt><dd>${esc((meta.sections ?? []).join(", "))}</dd>
      <dt>Rule versions</dt><dd><code>${esc(JSON.stringify(meta.rule_versions ?? {}))}</code></dd>
    </dl></div>
    ${sectionHtml}
    </body></html>`;
}
