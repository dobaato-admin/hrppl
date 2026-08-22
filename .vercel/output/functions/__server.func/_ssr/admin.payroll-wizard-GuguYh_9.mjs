import { j as jsxRuntimeExports, r as reactExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { A as AppShell, P as Popover, b as PopoverTrigger, c as PopoverContent } from "./AppShell-fbDALlr7.mjs";
import { u as useAuth, a as useServerFn, B as Button, C as Card, b as CardHeader, c as CardTitle, d as CardDescription, e as CardContent, f as Badge } from "./router-CLxirH5A.mjs";
import { u as useQueryClient, a as useQuery, c as useMutation } from "../_libs/tanstack__react-query.mjs";
import { I as Input } from "./input-C6yqZkRy.mjs";
import { L as Label } from "./label-Cbju7vgw.mjs";
import { S as Separator } from "./separator-D6YV3GQ2.mjs";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-Bk9id1Ls.mjs";
import { S as Switch } from "./switch-B3SbfIg0.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { getPayrollSetup, upsertPayrollSettings, upsertPayrollComponent, togglePayrollComponent, getPayrollExportBundle, logPayrollScenarioEvent, logPayrollExportEvent, getAdminAuditLog } from "./payroll-setup.functions-C7xZ-K-i.mjs";
import { g as getOrgSettings } from "./org-settings.functions-Ba2j6svr.mjs";
import { C as Checkbox } from "./checkbox-Dj6wn8_T.mjs";
import { D as Dialog, a as DialogContent, b as DialogHeader, c as DialogTitle, d as DialogDescription, e as DialogFooter } from "./dialog-UIV2CpIo.mjs";
import { c as createSsrRpc } from "./createSsrRpc-CRedQJGY.mjs";
import { r as requireSupabaseAuth } from "./auth-guard-CkYFJuQL.mjs";
import { c as createServerFn } from "./server-BOi2EjMN.mjs";
import { A as AdminGate } from "./AdminGate-B3-x5ytD.mjs";
import { a as ORG_ADMIN_ONLY } from "./rbac-BWg_Nf1T.mjs";
import "../_libs/lovable.dev__mcp-js.mjs";
import "../_libs/modelcontextprotocol__sdk.mjs";
import "../_libs/zod-to-json-schema.mjs";
import "../_libs/ajv-formats.mjs";
import "../_libs/seroval.mjs";
import { b1 as Settings2, D as Download, aX as Printer, aK as History, a5 as Check, b2 as CircleDashed, al as CircleAlert, b3 as ChevronLeft, $ as ChevronRight, aa as Plus, T as Trash2 } from "../_libs/lucide-react.mjs";
import { a as objectType, B as enumType, C as numberType, z as stringType, A as booleanType } from "../_libs/zod.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/react-dom.mjs";
import "util";
import "async_hooks";
import "stream";
import "crypto";
import "../_libs/isbot.mjs";
import "../_libs/radix-ui__react-popover.mjs";
import "../_libs/radix-ui__primitive.mjs";
import "../_libs/radix-ui__react-compose-refs.mjs";
import "../_libs/radix-ui__react-context.mjs";
import "../_libs/@radix-ui/react-dismissable-layer+[...].mjs";
import "../_libs/radix-ui__react-primitive.mjs";
import "../_libs/radix-ui__react-slot.mjs";
import "../_libs/@radix-ui/react-use-callback-ref+[...].mjs";
import "../_libs/@radix-ui/react-use-escape-keydown+[...].mjs";
import "../_libs/radix-ui__react-focus-guards.mjs";
import "../_libs/radix-ui__react-focus-scope.mjs";
import "../_libs/radix-ui__react-id.mjs";
import "../_libs/@radix-ui/react-use-layout-effect+[...].mjs";
import "../_libs/radix-ui__react-popper.mjs";
import "../_libs/floating-ui__react-dom.mjs";
import "../_libs/floating-ui__dom.mjs";
import "../_libs/floating-ui__core.mjs";
import "../_libs/floating-ui__utils.mjs";
import "../_libs/radix-ui__react-arrow.mjs";
import "../_libs/radix-ui__react-use-size.mjs";
import "../_libs/radix-ui__react-portal.mjs";
import "../_libs/radix-ui__react-presence.mjs";
import "../_libs/@radix-ui/react-use-controllable-state+[...].mjs";
import "../_libs/aria-hidden.mjs";
import "../_libs/react-remove-scroll.mjs";
import "tslib";
import "../_libs/react-remove-scroll-bar.mjs";
import "../_libs/react-style-singleton.mjs";
import "../_libs/get-nonce.mjs";
import "../_libs/use-sidecar.mjs";
import "../_libs/use-callback-ref.mjs";
import "./client-BLUqAwhM.mjs";
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "../_libs/supabase__functions-js.mjs";
import "../_libs/cmdk.mjs";
import "../_libs/radix-ui__react-dialog.mjs";
import "./onboarding.functions-BzLphvXk.mjs";
import "./hrppl-icon-DgSw_-Bc.mjs";
import "../_libs/class-variance-authority.mjs";
import "../_libs/clsx.mjs";
import "../_libs/radix-ui__react-tooltip.mjs";
import "../_libs/@radix-ui/react-visually-hidden+[...].mjs";
import "../_libs/radix-ui__react-accordion.mjs";
import "../_libs/radix-ui__react-collection.mjs";
import "../_libs/radix-ui__react-collapsible.mjs";
import "../_libs/radix-ui__react-direction.mjs";
import "../_libs/radix-ui__react-dropdown-menu.mjs";
import "../_libs/radix-ui__react-menu.mjs";
import "../_libs/radix-ui__react-roving-focus.mjs";
import "./monday-Dpwrcz0o.mjs";
import "../_libs/tanstack__query-core.mjs";
import "../_libs/tailwind-merge.mjs";
import "../_libs/lovable.dev__webhooks-js.mjs";
import "../_libs/react-email__render.mjs";
import "../_libs/prettier.mjs";
import "../_libs/html-to-text.mjs";
import "../_libs/selderee__plugin-htmlparser2.mjs";
import "../_libs/selderee.mjs";
import "../_libs/parseley.mjs";
import "../_libs/leac.mjs";
import "../_libs/peberminta.mjs";
import "../_libs/domhandler.mjs";
import "../_libs/domelementtype.mjs";
import "../_libs/htmlparser2.mjs";
import "../_libs/entities.mjs";
import "../_libs/deepmerge.mjs";
import "../_libs/dom-serializer.mjs";
import "./registry-Y5CZHtkF.mjs";
import "../_libs/react-email__text.mjs";
import "../_libs/react-email__section.mjs";
import "../_libs/react-email__button.mjs";
import "../_libs/react-email__html.mjs";
import "../_libs/react-email__head.mjs";
import "../_libs/react-email__preview.mjs";
import "../_libs/react-email__body.mjs";
import "../_libs/react-email__container.mjs";
import "../_libs/react-email__heading.mjs";
import "../_libs/lovable.dev__email-js.mjs";
import "./send-internal.server-9cG3k97B.mjs";
import "./client.server-D5ro3rAQ.mjs";
import "./geofences.functions-C8KvPefL.mjs";
import "./createMiddleware-BvN2ghIY.mjs";
import "node:async_hooks";
import "../_libs/h3-v2.mjs";
import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";
import "../_libs/jose.mjs";
import "../_libs/ajv.mjs";
import "../_libs/fast-deep-equal.mjs";
import "../_libs/json-schema-traverse.mjs";
import "../_libs/fast-uri.mjs";
import "../_libs/radix-ui__react-label.mjs";
import "../_libs/radix-ui__react-separator.mjs";
import "../_libs/radix-ui__react-select.mjs";
import "../_libs/radix-ui__number.mjs";
import "../_libs/radix-ui__react-use-previous.mjs";
import "../_libs/radix-ui__react-switch.mjs";
import "../_libs/radix-ui__react-checkbox.mjs";
const previewNepalSeed = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("b052719e9ba11dde024d6d9130f4cb530f4a0ce8f5403bf3c485faebe1b074e0"));
const runNepalPayrollWizard = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  marital_default: enumType(["single", "couple"]),
  ssf_enrolled: booleanType(),
  cit_percent: numberType().min(0).max(100),
  festival_month: stringType().min(2).max(20),
  remittance_percent: numberType().min(0).max(100),
  pf_election: enumType(["optional", "mandatory", "off"])
}).parse(d)).handler(createSsrRpc("74088d011b9ea2e7447de1196e3efb9d38c89e3da4dc428780947c9e925570f6"));
function NepalPayrollWizardDialog({ open, onOpenChange }) {
  const fPreview = useServerFn(previewNepalSeed);
  const fRun = useServerFn(runNepalPayrollWizard);
  const previewQ = useQuery({ queryKey: ["np-preview"], queryFn: () => fPreview(), enabled: open });
  const [form, setForm] = reactExports.useState({
    marital_default: "single",
    ssf_enrolled: true,
    cit_percent: 33.333,
    festival_month: "Ashwin",
    remittance_percent: 0,
    pf_election: "optional"
  });
  const run = useMutation({
    mutationFn: () => fRun({ data: form }),
    onSuccess: () => {
      toast.success("Nepal payroll seeded for FY 2081/82");
      onOpenChange(false);
    },
    onError: (e) => toast.error(e?.message ?? "Seed failed")
  });
  const p = previewQ.data;
  const slabs = p ? form.marital_default === "couple" ? p.slabsCouple : p.slabsSingle : [];
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-2xl max-h-[90vh] overflow-y-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Nepal payroll wizard — FY 2081/82 (2024/25)" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: "Seeds income tax slabs, SSF 11% + 20%, CIT, and festival bonus defaults. Inputs are saved as draft rules you can edit afterwards." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 md:grid-cols-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Marital default" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.marital_default, onValueChange: (v) => setForm((s) => ({ ...s, marital_default: v })), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "single", children: "Single" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "couple", children: "Couple (joint)" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-end gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { id: "ssf", checked: form.ssf_enrolled, onCheckedChange: (v) => setForm((s) => ({ ...s, ssf_enrolled: v })) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "ssf", children: "SSF enrolled (11% employee / 20% employer)" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "CIT % of basic (default 33.333)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.001", value: form.cit_percent, onChange: (e) => setForm((s) => ({ ...s, cit_percent: Number(e.target.value) })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Festival bonus month" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.festival_month, onValueChange: (v) => setForm((s) => ({ ...s, festival_month: v })), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: ["Ashwin", "Kartik", "Mangsir", "Poush", "Magh", "Falgun", "Chaitra", "Baisakh", "Jestha", "Ashadh", "Shrawan", "Bhadra"].map((m) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: m, children: m }, m)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Remittance % (foreign-source relief)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.1", value: form.remittance_percent, onChange: (e) => setForm((s) => ({ ...s, remittance_percent: Number(e.target.value) })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Provident fund election" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.pf_election, onValueChange: (v) => setForm((s) => ({ ...s, pf_election: v })), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "optional", children: "Optional (per employee)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "mandatory", children: "Mandatory for all" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "off", children: "Off" })
            ] })
          ] })
        ] })
      ] }),
      p && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border rounded-md p-3 text-xs space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-medium text-sm", children: [
          "Preview — ",
          p.fiscalYear
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          "SSF split: ",
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "outline", children: [
            p.ssf.employee_percent,
            "% emp"
          ] }),
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "outline", children: [
            p.ssf.employer_percent,
            "% empr"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-medium mt-2", children: [
          "Slabs (",
          form.marital_default,
          ")"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "text-muted-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left", children: "From (NPR)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left", children: "To" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right", children: "Rate %" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left", children: "Note" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: slabs.map((s, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { children: s.min.toLocaleString() }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { children: s.max ? s.max.toLocaleString() : "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "text-right", children: s.rate }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { children: s.label })
          ] }, i)) })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => onOpenChange(false), children: "Cancel" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => run.mutate(), disabled: run.isPending, children: run.isPending ? "Seeding…" : "Seed FY 2081/82 defaults" })
    ] })
  ] }) });
}
const STEPS = [{
  id: 0,
  label: "Country & currency"
}, {
  id: 1,
  label: "Pay period & hours"
}, {
  id: 2,
  label: "Taxes & deductions"
}, {
  id: 3,
  label: "Overtime & allowances"
}, {
  id: 4,
  label: "Scenarios"
}, {
  id: 5,
  label: "Review & preview"
}];
function Wizard() {
  const {
    user,
    roles,
    rolesLoaded
  } = useAuth();
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
    enabled: !!user && rolesLoaded && canAccess
  });
  const org = useQuery({
    queryKey: ["payroll-wizard-org"],
    queryFn: () => fetchOrg(),
    enabled: !!user && rolesLoaded && canAccess
  });
  const [step, setStep] = reactExports.useState(0);
  const [nepalOpen, setNepalOpen] = reactExports.useState(false);
  const [previewGross, setPreviewGross] = reactExports.useState(5e3);
  const [scenarios, setScenarios] = reactExports.useState([]);
  const [exporting, setExporting] = reactExports.useState(false);
  const fetchExport = useServerFn(getPayrollExportBundle);
  const logScenario = useServerFn(logPayrollScenarioEvent);
  const logExport = useServerFn(logPayrollExportEvent);
  const fetchAudit = useServerFn(getAdminAuditLog);
  const ALL_SECTIONS = [{
    id: "settings",
    label: "Settings"
  }, {
    id: "components",
    label: "Components"
  }, {
    id: "leaveTypes",
    label: "Leave types"
  }, {
    id: "overtimeRates",
    label: "Overtime & penalty rates"
  }, {
    id: "taxBrackets",
    label: "Tax brackets"
  }, {
    id: "holidayCategories",
    label: "Holiday categories"
  }, {
    id: "holidays",
    label: "Public holidays"
  }, {
    id: "scenarios",
    label: "Scenarios"
  }];
  const [exportSections, setExportSections] = reactExports.useState(ALL_SECTIONS.map((s) => s.id));
  const [auditOpen, setAuditOpen] = reactExports.useState(false);
  const audit = useQuery({
    queryKey: ["payroll-audit"],
    queryFn: () => fetchAudit({
      data: {}
    }),
    enabled: !!user && rolesLoaded && canAccess && auditOpen
  });
  if (!user || !rolesLoaded) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(AppShell, { title: "Payroll setup wizard", children: /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "p-6 text-muted-foreground", children: "Loading…" }) });
  }
  const tenant = org.data?.tenant;
  const countrySettings = org.data?.countryPayrollSettings;
  const settings = setup.data?.settings;
  const components = setup.data?.components ?? [];
  const currency = tenant?.currency_code ?? "USD";
  const formatMoney = (n) => new Intl.NumberFormat(void 0, {
    style: "currency",
    currency,
    maximumFractionDigits: 2
  }).format(n);
  const preview = reactExports.useMemo(() => {
    const basic = previewGross;
    const lines = [{
      label: "Basic",
      amount: basic,
      kind: "earning"
    }];
    let grossEarnings = basic;
    let totalDeductions = 0;
    for (const c of components.filter((x) => x.is_active)) {
      let amt = 0;
      if (c.calc_type === "flat") amt = Number(c.rate) || 0;
      else if (c.calc_type === "pct_of_basic") amt = Number(c.rate) / 100 * basic;
      else if (c.calc_type === "pct_of_gross") amt = Number(c.rate) / 100 * grossEarnings;
      const isDeduction = ["tax", "pf", "retirement", "deduction"].includes(c.kind);
      if (isDeduction) totalDeductions += amt;
      else grossEarnings += amt;
      lines.push({
        label: `${c.label} (${c.code})`,
        amount: amt,
        kind: isDeduction ? "deduction" : "earning"
      });
    }
    return {
      lines,
      gross: grossEarnings,
      deductions: totalDeductions,
      net: grossEarnings - totalDeductions
    };
  }, [components, previewGross]);
  const stepErrors = reactExports.useMemo(() => {
    const errors = {
      0: [],
      1: [],
      2: [],
      3: [],
      4: [],
      5: []
    };
    if (!tenant?.country_code) errors[0].push("Country is not set on this organisation.");
    if (!tenant?.currency_code) errors[0].push("Currency is not set on this organisation.");
    if (!settings?.pay_period) errors[1].push("Choose a pay period and save before continuing.");
    if (settings && (settings.standard_hours_per_day == null || settings.standard_hours_per_day <= 0)) errors[1].push("Standard hours per day must be greater than 0.");
    if (settings && (settings.standard_days_per_week == null || settings.standard_days_per_week <= 0)) errors[1].push("Standard days per week must be greater than 0.");
    const taxKinds = ["tax", "pf", "retirement", "deduction"];
    const hasTax = components.some((c) => taxKinds.includes(c.kind) && c.is_active);
    if (!hasTax) errors[2].push("Add at least one active tax or statutory deduction.");
    return errors;
  }, [tenant, settings, components]);
  const currentErrors = stepErrors[step] ?? [];
  const nextDisabled = currentErrors.length > 0;
  function runScenario(gross, overrides) {
    const overrideMap = new Map(overrides.map((o) => [o.componentId, o]));
    let grossEarnings = gross;
    let totalDeductions = 0;
    const lines = [{
      label: "Basic",
      amount: gross,
      kind: "earning"
    }];
    for (const c of components) {
      const ov = overrideMap.get(c.id);
      const active = ov ? ov.enabled : c.is_active;
      if (!active) continue;
      const rate = ov ? ov.rate : Number(c.rate);
      let amt = 0;
      if (c.calc_type === "flat") amt = rate || 0;
      else if (c.calc_type === "pct_of_basic") amt = rate / 100 * gross;
      else if (c.calc_type === "pct_of_gross") amt = rate / 100 * grossEarnings;
      const isDeduction = ["tax", "pf", "retirement", "deduction"].includes(c.kind);
      if (isDeduction) totalDeductions += amt;
      else grossEarnings += amt;
      lines.push({
        label: `${c.label}`,
        amount: amt,
        kind: isDeduction ? "deduction" : "earning"
      });
    }
    return {
      lines,
      gross: grossEarnings,
      deductions: totalDeductions,
      net: grossEarnings - totalDeductions
    };
  }
  function buildScenarioResults() {
    return scenarios.map((s) => {
      const r = runScenario(s.gross, s.overrides);
      return {
        id: s.id,
        name: s.name,
        gross_input: s.gross,
        gross_earnings: r.gross,
        total_deductions: r.deductions,
        net_pay: r.net,
        overrides_active: s.overrides.filter((o) => o.enabled).length
      };
    });
  }
  function buildMeta() {
    return {
      exported_at: (/* @__PURE__ */ new Date()).toISOString(),
      exported_by: user?.email ?? user?.id ?? null,
      tenant: tenant?.name ?? null,
      country: tenant?.country_code ?? null,
      currency,
      sections: exportSections,
      rule_versions: {
        components: components.length,
        active_components: components.filter((c) => c.is_active).length,
        settings_updated_at: settings?.updated_at ?? settings?.created_at ?? null,
        scenarios: scenarios.length
      }
    };
  }
  function filterBundleBySections(bundle) {
    const filtered = {
      tenant: bundle.tenant
    };
    for (const id of exportSections) {
      if (id === "scenarios") filtered.scenarios = buildScenarioResults();
      else filtered[id] = bundle[id];
    }
    return filtered;
  }
  async function handleExportCsv() {
    if (exportSections.length === 0) {
      toast.error("Pick at least one section");
      return;
    }
    setExporting(true);
    try {
      const bundle = await fetchExport();
      const meta = buildMeta();
      const filtered = filterBundleBySections(bundle);
      const csv = bundleToCsv(filtered, meta);
      const blob = new Blob([csv], {
        type: "text/csv;charset=utf-8;"
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `payroll-rules-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      await logExport({
        data: {
          format: "csv",
          sections: exportSections,
          scenarios: scenarios.map((s) => ({
            id: s.id,
            name: s.name
          }))
        }
      }).catch(() => {
      });
      toast.success("Export downloaded");
    } catch (e) {
      toast.error(e.message ?? "Export failed");
    } finally {
      setExporting(false);
    }
  }
  async function handleExportPdf() {
    if (exportSections.length === 0) {
      toast.error("Pick at least one section");
      return;
    }
    setExporting(true);
    try {
      const bundle = await fetchExport();
      const meta = buildMeta();
      const filtered = filterBundleBySections(bundle);
      const html = bundleToPrintableHtml(filtered, currency, meta);
      const w = window.open("", "_blank", "width=900,height=1200");
      if (!w) {
        toast.error("Pop-up blocked");
        return;
      }
      w.document.write(html);
      w.document.close();
      w.onload = () => {
        w.focus();
        w.print();
      };
      await logExport({
        data: {
          format: "pdf",
          sections: exportSections,
          scenarios: scenarios.map((s) => ({
            id: s.id,
            name: s.name
          }))
        }
      }).catch(() => {
      });
    } catch (e) {
      toast.error(e.message ?? "Export failed");
    } finally {
      setExporting(false);
    }
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(AppShell, { title: "Payroll setup wizard", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "#wizard-main", className: "sr-only focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:z-50 focus:rounded focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground", children: "Skip to wizard content" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { id: "wizard-main", tabIndex: -1, className: "mx-auto w-full max-w-6xl space-y-6 p-4 sm:p-6 focus:outline-none", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 sm:flex sm:flex-wrap sm:justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "truncate text-2xl font-semibold", children: "Payroll setup wizard" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Guided configuration for taxes, hours, overtime and leave — with a live payslip preview." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex shrink-0 flex-wrap gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Popover, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(PopoverTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", "aria-label": "Choose export sections", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Settings2, { className: "size-4" }),
              " Sections (",
              exportSections.length,
              ")"
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(PopoverContent, { className: "w-64", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium", children: "Include in export" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "text-xs text-muted-foreground underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded", onClick: () => setExportSections(exportSections.length === ALL_SECTIONS.length ? [] : ALL_SECTIONS.map((s) => s.id)), children: exportSections.length === ALL_SECTIONS.length ? "Clear" : "All" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-1", children: ALL_SECTIONS.map((s) => {
                const checked = exportSections.includes(s.id);
                return /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { id: `exp-${s.id}`, checked, onCheckedChange: (v) => setExportSections(v ? Array.from(/* @__PURE__ */ new Set([...exportSections, s.id])) : exportSections.filter((x) => x !== s.id)) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: `exp-${s.id}`, className: "cursor-pointer text-sm font-normal", children: s.label })
                ] }, s.id);
              }) })
            ] }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: handleExportCsv, disabled: exporting, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "size-4" }),
            " CSV"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: handleExportPdf, disabled: exporting, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { className: "size-4" }),
            " Print / PDF"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: () => setAuditOpen((v) => !v), "aria-expanded": auditOpen, "aria-controls": "audit-panel", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(History, { className: "size-4" }),
            " Audit log"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", size: "sm", asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/admin/payroll-setup", children: "Advanced view" }) })
        ] })
      ] }),
      auditOpen && /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { id: "audit-panel", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-base", children: "Admin audit log" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "Recent payroll rule edits, scenario events and exports." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: audit.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Loading…" }) : audit.data?.entries?.length ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-h-80 overflow-y-auto rounded-md border", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "sticky top-0 bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2", children: "When" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2", children: "Category" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2", children: "Action" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2", children: "Entity" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2", children: "Details" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: audit.data.entries.map((e) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-t focus-within:bg-muted/40", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 text-xs text-muted-foreground tabular-nums", children: new Date(e.created_at).toLocaleString() }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", children: e.category }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: e.action }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 text-xs text-muted-foreground", children: e.entity_type ?? "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx("code", { className: "text-[11px]", children: JSON.stringify(e.details) }) })
          ] }, e.id)) })
        ] }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "No audit entries yet." }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("ol", { className: "grid gap-2 rounded-lg border bg-card p-3 sm:grid-cols-3 lg:grid-cols-6", "aria-label": "Wizard steps", children: STEPS.map((s) => {
        const done = step > s.id;
        const active = step === s.id;
        return /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => setStep(s.id), "aria-current": active ? "step" : void 0, className: `flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${active ? "bg-primary text-primary-foreground" : done ? "bg-muted" : "hover:bg-muted"}`, children: [
          done ? /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "size-4 shrink-0" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(CircleDashed, { className: "size-4 shrink-0" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "truncate", children: [
            s.id + 1,
            ". ",
            s.label
          ] })
        ] }) }, s.id);
      }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "min-w-0", children: [
          step === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { children: "Country & currency" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "Payroll rules apply per country. Update these in organisation settings if they're wrong." })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 sm:grid-cols-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Country" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1 rounded-md border bg-muted/30 px-3 py-2 text-sm", children: tenant?.country_code ?? "—" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Currency" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1 rounded-md border bg-muted/30 px-3 py-2 text-sm", children: currency })
                ] })
              ] }),
              countrySettings ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border bg-muted/20 p-3 text-sm", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mb-2 font-medium", children: "Country defaults" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "grid gap-1 sm:grid-cols-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Pay frequency:" }),
                    " ",
                    countrySettings.pay_frequency
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Workweek hours:" }),
                    " ",
                    countrySettings.workweek_hours
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Overtime ×:" }),
                    " ",
                    countrySettings.overtime_multiplier
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Fiscal start:" }),
                    " month ",
                    countrySettings.fiscal_year_start_month
                  ] })
                ] })
              ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "No country preset found — use the next steps to configure manually." }),
              tenant?.country_code === "NP" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border border-primary/30 bg-primary/5 p-3 text-sm", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: "Nepal payroll quick-seed (FY 2081/82)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Seeds income tax slabs, SSF 11%/20%, CIT, festival bonus and PF election as draft rules." }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", className: "mt-2", onClick: () => setNepalOpen(true), children: "Open Nepal wizard" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-end", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { asChild: true, variant: "link", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/settings/organization", children: "Change in organisation settings" }) }) })
            ] })
          ] }),
          step === 1 && /* @__PURE__ */ jsxRuntimeExports.jsx(PayPeriodStep, { settings, onSave: async (v) => {
            try {
              await saveSettings({
                data: v
              });
              toast.success("Saved");
              qc.invalidateQueries({
                queryKey: ["payroll-wizard-setup"]
              });
            } catch (e) {
              toast.error(e.message ?? "Save failed");
            }
          } }),
          step === 2 && /* @__PURE__ */ jsxRuntimeExports.jsx(ComponentStep, { title: "Taxes & statutory deductions", description: "Income tax, PF, social security and other withholdings deducted from gross pay.", allowedKinds: ["tax", "pf", "retirement", "deduction"], components, onSave: async (v) => {
            try {
              await saveComponent({
                data: v
              });
              toast.success("Saved");
              qc.invalidateQueries({
                queryKey: ["payroll-wizard-setup"]
              });
            } catch (e) {
              toast.error(e.message ?? "Save failed");
            }
          }, onToggle: async (id, active) => {
            try {
              await toggleComp({
                data: {
                  id,
                  is_active: active
                }
              });
              qc.invalidateQueries({
                queryKey: ["payroll-wizard-setup"]
              });
            } catch (e) {
              toast.error(e.message ?? "Toggle failed");
            }
          } }),
          step === 3 && /* @__PURE__ */ jsxRuntimeExports.jsx(ComponentStep, { title: "Overtime, penalty rates & allowances", description: "Earnings on top of basic pay — overtime multipliers, transport, housing, meal allowances.", allowedKinds: ["allowance", "other"], components, onSave: async (v) => {
            try {
              await saveComponent({
                data: v
              });
              toast.success("Saved");
              qc.invalidateQueries({
                queryKey: ["payroll-wizard-setup"]
              });
            } catch (e) {
              toast.error(e.message ?? "Save failed");
            }
          }, onToggle: async (id, active) => {
            try {
              await toggleComp({
                data: {
                  id,
                  is_active: active
                }
              });
              qc.invalidateQueries({
                queryKey: ["payroll-wizard-setup"]
              });
            } catch (e) {
              toast.error(e.message ?? "Toggle failed");
            }
          } }),
          step === 4 && /* @__PURE__ */ jsxRuntimeExports.jsx(ScenariosStep, { components, scenarios, setScenarios, runScenario, formatMoney, onScenarioEvent: (s, action) => logScenario({
            data: {
              scenarioId: s.id,
              name: s.name,
              action,
              gross: s.gross,
              overrideCount: s.overrides.filter((o) => o.enabled).length
            }
          }).catch(() => {
          }) }),
          step === 5 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { children: "Review" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "Confirm your configuration. Use the preview pane to validate calculations." })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 sm:grid-cols-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SummaryRow, { label: "Country", value: tenant?.country_code ?? "—" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SummaryRow, { label: "Currency", value: currency }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SummaryRow, { label: "Pay period", value: settings?.pay_period ?? "not set" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SummaryRow, { label: "Workday hours", value: settings?.standard_hours_per_day ?? "—" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SummaryRow, { label: "Workweek days", value: settings?.standard_days_per_week ?? "—" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SummaryRow, { label: "Active components", value: components.filter((c) => c.is_active).length })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Separator, {}),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap justify-end gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", onClick: handleExportCsv, disabled: exporting, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "size-4" }),
                  " Export CSV"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", onClick: handleExportPdf, disabled: exporting, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { className: "size-4" }),
                  " Print PDF"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { asChild: true, variant: "outline", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/admin/payroll-setup", children: "Advanced settings" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => toast.success("Setup looks good"), children: "Finish" })
              ] })
            ] })
          ] }),
          currentErrors.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { role: "alert", className: "mt-4 rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-1 flex items-center gap-2 font-medium text-destructive", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "size-4" }),
              " Resolve before continuing"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "list-inside list-disc text-destructive/90", children: currentErrors.map((e, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: e }, i)) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 flex justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "ghost", disabled: step === 0, onClick: () => setStep((s) => Math.max(0, s - 1)), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronLeft, { className: "size-4" }),
              " Back"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { disabled: step === STEPS.length - 1 || nextDisabled, onClick: () => setStep((s) => Math.min(STEPS.length - 1, s + 1)), "aria-describedby": nextDisabled ? "wizard-step-errors" : void 0, children: [
              "Next ",
              /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "size-4" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("aside", { className: "lg:sticky lg:top-4 lg:self-start", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-base", children: "Live payslip preview" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "How a sample paycheck applies the current rules." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "preview-gross", children: "Sample basic pay" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "preview-gross", type: "number", min: 0, value: previewGross, onChange: (e) => setPreviewGross(Math.max(0, Number(e.target.value) || 0)) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-1 text-sm", children: preview.lines.map((l, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate text-muted-foreground", children: l.label }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: l.kind === "deduction" ? "text-destructive tabular-nums" : "tabular-nums", children: [
                l.kind === "deduction" ? "-" : "",
                formatMoney(l.amount)
              ] })
            ] }, i)) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Separator, {}),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1 text-sm", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { label: "Gross earnings", value: formatMoney(preview.gross) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { label: "Total deductions", value: formatMoney(preview.deductions), muted: true })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md bg-primary/5 p-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs uppercase tracking-wide text-muted-foreground", children: "Net pay" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-semibold tabular-nums", children: formatMoney(preview.net) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Preview assumes the current basic; per-employee bands are evaluated at run time." })
          ] })
        ] }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(NepalPayrollWizardDialog, { open: nepalOpen, onOpenChange: setNepalOpen })
  ] });
}
function SummaryRow({
  label,
  value
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border bg-muted/20 p-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs uppercase tracking-wide text-muted-foreground", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "truncate text-sm font-medium", children: String(value) })
  ] });
}
function Row({
  label,
  value,
  muted
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: muted ? "text-muted-foreground" : "", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "tabular-nums", children: value })
  ] });
}
function PayPeriodStep({
  settings,
  onSave
}) {
  const [payPeriod, setPayPeriod] = reactExports.useState(settings?.pay_period ?? "monthly");
  const [hpd, setHpd] = reactExports.useState(settings?.standard_hours_per_day ?? 8);
  const [dpw, setDpw] = reactExports.useState(settings?.standard_days_per_week ?? 5);
  const [meal, setMeal] = reactExports.useState(settings?.meal_break_minutes ?? 30);
  const [rest, setRest] = reactExports.useState(settings?.rest_break_minutes ?? 15);
  const [busy, setBusy] = reactExports.useState(false);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { children: "Pay period & working hours" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "How often you pay employees and the standard working week." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 sm:grid-cols-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "pp", children: "Pay period" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: payPeriod, onValueChange: setPayPeriod, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { id: "pp", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "weekly", children: "Weekly" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "fortnightly", children: "Fortnightly" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "semimonthly", children: "Semi-monthly" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "monthly", children: "Monthly" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "hpd", children: "Hours / day" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "hpd", type: "number", min: 0, max: 24, value: hpd, onChange: (e) => setHpd(Number(e.target.value)) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "dpw", children: "Days / week" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "dpw", type: "number", min: 0, max: 7, value: dpw, onChange: (e) => setDpw(Number(e.target.value)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "meal", children: "Meal break (min)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "meal", type: "number", min: 0, max: 240, value: meal, onChange: (e) => setMeal(Number(e.target.value)) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "rest", children: "Rest break (min)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "rest", type: "number", min: 0, max: 240, value: rest, onChange: (e) => setRest(Number(e.target.value)) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-end", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { disabled: busy, onClick: async () => {
        setBusy(true);
        try {
          await onSave({
            pay_period: payPeriod,
            standard_hours_per_day: hpd,
            standard_days_per_week: dpw,
            meal_break_minutes: meal,
            rest_break_minutes: rest
          });
        } finally {
          setBusy(false);
        }
      }, children: "Save" }) })
    ] })
  ] });
}
function ComponentStep({
  title,
  description,
  allowedKinds,
  components,
  onSave,
  onToggle
}) {
  const filtered = components.filter((c) => allowedKinds.includes(c.kind));
  const [code, setCode] = reactExports.useState("");
  const [label, setLabel] = reactExports.useState("");
  const [kind, setKind] = reactExports.useState(allowedKinds[0]);
  const [calc, setCalc] = reactExports.useState("pct_of_basic");
  const [rate, setRate] = reactExports.useState(0);
  const [busy, setBusy] = reactExports.useState(false);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { children: title }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: description })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-4", children: [
      filtered.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "No components configured yet." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "divide-y rounded-md border", children: filtered.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-center justify-between gap-3 p-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate text-sm font-medium", children: c.label }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", children: c.code }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", children: c.kind })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: c.calc_type === "flat" ? `Flat ${c.rate}` : `${c.rate}% of ${c.calc_type === "pct_of_basic" ? "basic" : "gross"}` })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { checked: !!c.is_active, onCheckedChange: (v) => onToggle(c.id, !!v), "aria-label": `Toggle ${c.label}` })
      ] }, c.id)) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Separator, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mb-2 text-sm font-medium", children: "Add component" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 sm:grid-cols-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "c-code", children: "Code" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "c-code", value: code, onChange: (e) => setCode(e.target.value), placeholder: "PF" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "c-label", children: "Label" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "c-label", value: label, onChange: (e) => setLabel(e.target.value), placeholder: "Provident Fund" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "c-kind", children: "Kind" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: kind, onValueChange: setKind, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { id: "c-kind", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: allowedKinds.map((k) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: k, children: k }, k)) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "c-calc", children: "Calculation" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: calc, onValueChange: setCalc, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { id: "c-calc", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "flat", children: "Flat amount" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "pct_of_basic", children: "% of basic" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "pct_of_gross", children: "% of gross" })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "c-rate", children: calc === "flat" ? "Amount" : "Rate (%)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "c-rate", type: "number", min: 0, value: rate, onChange: (e) => setRate(Number(e.target.value)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 flex justify-end", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { disabled: busy || !code || !label, onClick: async () => {
          setBusy(true);
          try {
            await onSave({
              code,
              label,
              kind,
              calc_type: calc,
              rate,
              is_taxable: false,
              show_on_payslip: true,
              is_active: true,
              sort_order: 100
            });
            setCode("");
            setLabel("");
            setRate(0);
          } finally {
            setBusy(false);
          }
        }, children: "Add component" }) })
      ] })
    ] })
  ] });
}
function ScenariosStep({
  components,
  scenarios,
  setScenarios,
  runScenario,
  formatMoney,
  onScenarioEvent
}) {
  function addScenario() {
    const next = {
      id: crypto.randomUUID(),
      name: `Scenario ${scenarios.length + 1}`,
      gross: 5e3,
      overrides: components.map((c) => ({
        componentId: c.id,
        rate: Number(c.rate),
        enabled: !!c.is_active
      }))
    };
    setScenarios([...scenarios, next]);
    onScenarioEvent?.(next, "create");
  }
  function updateScenario(id, patch) {
    setScenarios(scenarios.map((s) => s.id === id ? {
      ...s,
      ...patch
    } : s));
  }
  function removeScenario(id) {
    const target = scenarios.find((s) => s.id === id);
    setScenarios(scenarios.filter((s) => s.id !== id));
    if (target) onScenarioEvent?.(target, "delete");
  }
  function updateOverride(scenarioId, componentId, patch) {
    setScenarios(scenarios.map((s) => s.id === scenarioId ? {
      ...s,
      overrides: s.overrides.map((o) => o.componentId === componentId ? {
        ...o,
        ...patch
      } : o)
    } : s));
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { children: "Payroll scenarios" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "Build side-by-side what-if scenarios by overriding tax, leave, and overtime rates. Compare resulting payslips before publishing changes." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground", children: [
          scenarios.length,
          " scenario",
          scenarios.length === 1 ? "" : "s"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: addScenario, disabled: components.length === 0, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "size-4" }),
          " Add scenario"
        ] })
      ] }),
      scenarios.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground", children: "No scenarios yet. Add one to simulate alternative rules." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid auto-cols-[minmax(260px,1fr)] grid-flow-col gap-3", children: scenarios.map((s) => {
        const result = runScenario(s.gross, s.overrides);
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 rounded-md border bg-card p-3 focus-within:ring-2 focus-within:ring-ring", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-2 flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: s.name, onChange: (e) => updateScenario(s.id, {
              name: e.target.value
            }), className: "h-8", "aria-label": "Scenario name" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", onClick: () => removeScenario(s.id), "aria-label": "Remove scenario", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "size-4" }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Sample basic pay" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: 0, value: s.gross, onChange: (e) => updateScenario(s.id, {
              gross: Math.max(0, Number(e.target.value) || 0)
            }), className: "h-8" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("details", { className: "mb-3 rounded-md border bg-muted/20 p-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("summary", { className: "cursor-pointer text-xs font-medium", children: [
              "Override rates (",
              s.overrides.filter((o) => o.enabled).length,
              " active)"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "mt-2 space-y-2", children: components.map((c) => {
              const ov = s.overrides.find((o) => o.componentId === c.id);
              if (!ov) return null;
              return /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "grid grid-cols-[minmax(0,1fr)_70px_auto] items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate text-xs", children: c.label }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: 0, value: ov.rate, onChange: (e) => updateOverride(s.id, c.id, {
                  rate: Number(e.target.value) || 0
                }), className: "h-7", "aria-label": `${c.label} rate` }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { checked: ov.enabled, onCheckedChange: (v) => updateOverride(s.id, c.id, {
                  enabled: !!v
                }), "aria-label": `Enable ${c.label}` })
              ] }, c.id);
            }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-1 text-xs", children: result.lines.map((l, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate text-muted-foreground", children: l.label }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: l.kind === "deduction" ? "tabular-nums text-destructive" : "tabular-nums", children: [
              l.kind === "deduction" ? "-" : "",
              formatMoney(l.amount)
            ] })
          ] }, i)) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Separator, { className: "my-2" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-xs", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Gross" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "tabular-nums", children: formatMoney(result.gross) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-xs", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Deductions" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "tabular-nums", children: formatMoney(result.deductions) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 rounded bg-primary/5 p-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] uppercase tracking-wide text-muted-foreground", children: "Net pay" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-lg font-semibold tabular-nums", children: formatMoney(result.net) })
          ] })
        ] }, s.id);
      }) }) }),
      scenarios.length >= 2 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border bg-card", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-b bg-muted/40 px-3 py-2 text-sm font-medium", children: "Side-by-side comparison" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", role: "region", "aria-label": "Scenario comparison", tabIndex: 0, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full min-w-[640px] text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("caption", { className: "sr-only", children: "Comparison of each scenario's inputs and resulting net pay" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b text-left text-xs uppercase tracking-wide text-muted-foreground", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { scope: "col", className: "px-3 py-2", children: "Scenario" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { scope: "col", className: "px-3 py-2 text-right", children: "Basic input" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { scope: "col", className: "px-3 py-2 text-right", children: "Active overrides" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { scope: "col", className: "px-3 py-2 text-right", children: "Gross" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { scope: "col", className: "px-3 py-2 text-right", children: "Deductions" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { scope: "col", className: "px-3 py-2 text-right", children: "Net pay" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { scope: "col", className: "px-3 py-2 text-right", children: "Δ vs. first" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: (() => {
            const results = scenarios.map((s) => ({
              s,
              r: runScenario(s.gross, s.overrides)
            }));
            const baseline = results[0]?.r.net ?? 0;
            return results.map(({
              s,
              r
            }, i) => {
              const delta = r.net - baseline;
              const deltaPct = baseline === 0 ? 0 : delta / baseline * 100;
              return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b focus-within:bg-muted/30 hover:bg-muted/20", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("th", { scope: "row", className: "px-3 py-2 text-left font-medium", children: s.name }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 text-right tabular-nums", children: formatMoney(s.gross) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 text-right tabular-nums", children: s.overrides.filter((o) => o.enabled).length }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 text-right tabular-nums", children: formatMoney(r.gross) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-3 py-2 text-right tabular-nums text-destructive", children: [
                  "−",
                  formatMoney(r.deductions)
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 text-right font-semibold tabular-nums", children: formatMoney(r.net) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: `px-3 py-2 text-right tabular-nums ${i === 0 ? "text-muted-foreground" : delta > 0 ? "text-emerald-600" : delta < 0 ? "text-destructive" : ""}`, children: i === 0 ? "baseline" : `${delta > 0 ? "+" : ""}${formatMoney(delta)} (${deltaPct.toFixed(1)}%)` })
              ] }, s.id);
            });
          })() })
        ] }) })
      ] })
    ] })
  ] });
}
function csvEscape(v) {
  if (v === null || v === void 0) return "";
  const s = String(v);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}
function rowsToCsv(rows) {
  if (rows.length === 0) return "(no rows)\n";
  const colSet = /* @__PURE__ */ new Set();
  rows.forEach((r) => Object.keys(r).forEach((k) => colSet.add(k)));
  const cols = Array.from(colSet);
  const head = cols.join(",");
  const body = rows.map((r) => cols.map((c) => csvEscape(r[c])).join(",")).join("\n");
  return `${head}
${body}
`;
}
const SECTION_TITLES = {
  settings: "Settings",
  components: "Components",
  leaveTypes: "Leave types",
  overtimeRates: "Overtime & penalty rates",
  taxBrackets: "Tax brackets",
  holidayCategories: "Public holiday categories",
  holidays: "Public holidays",
  scenarios: "Scenarios"
};
function bundleToCsv(b, meta) {
  const metaRows = [{
    key: "exported_at",
    value: meta.exported_at
  }, {
    key: "exported_by",
    value: meta.exported_by ?? ""
  }, {
    key: "tenant",
    value: meta.tenant ?? ""
  }, {
    key: "country",
    value: meta.country ?? ""
  }, {
    key: "currency",
    value: meta.currency ?? ""
  }, {
    key: "sections",
    value: (meta.sections ?? []).join("|")
  }, {
    key: "rule_versions",
    value: JSON.stringify(meta.rule_versions ?? {})
  }];
  const sections = [{
    title: "Export metadata",
    rows: metaRows
  }, {
    title: "Tenant",
    rows: b.tenant ? [b.tenant] : []
  }];
  for (const key of Object.keys(SECTION_TITLES)) {
    if (b[key] === void 0) continue;
    const rows = Array.isArray(b[key]) ? b[key] : b[key] ? [b[key]] : [];
    sections.push({
      title: SECTION_TITLES[key],
      rows
    });
  }
  return sections.map((s) => `## ${s.title}
${rowsToCsv(s.rows)}`).join("\n");
}
function bundleToPrintableHtml(b, currency, meta) {
  const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;"
  })[c]);
  const tableFor = (rows) => {
    if (!rows || rows.length === 0) return "<p><em>None</em></p>";
    const colSet = /* @__PURE__ */ new Set();
    rows.forEach((r) => Object.keys(r).forEach((k) => colSet.add(k)));
    const cols = Array.from(colSet);
    return `<table><thead><tr>${cols.map((c) => `<th>${esc(c)}</th>`).join("")}</tr></thead><tbody>${rows.map((r) => `<tr>${cols.map((c) => `<td>${esc(r[c])}</td>`).join("")}</tr>`).join("")}</tbody></table>`;
  };
  const sectionHtml = Object.keys(SECTION_TITLES).filter((k) => b[k] !== void 0).map((k) => {
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
const SplitComponent = () => /* @__PURE__ */ jsxRuntimeExports.jsx(AdminGate, { allow: ORG_ADMIN_ONLY, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Wizard, {}) });
export {
  SplitComponent as component
};
