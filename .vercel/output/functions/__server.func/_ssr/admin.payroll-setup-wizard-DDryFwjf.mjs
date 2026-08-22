import { j as jsxRuntimeExports, r as reactExports } from "../_libs/react.mjs";
import { e as useNavigate, L as Link } from "../_libs/tanstack__react-router.mjs";
import { u as useAuth, a as useServerFn, C as Card, b as CardHeader, c as CardTitle, d as CardDescription, e as CardContent, B as Button, f as Badge } from "./router-CLxirH5A.mjs";
import { u as useQueryClient, a as useQuery } from "../_libs/tanstack__react-query.mjs";
import { A as AppShell } from "./AppShell-fbDALlr7.mjs";
import { I as Input } from "./input-C6yqZkRy.mjs";
import { L as Label } from "./label-Cbju7vgw.mjs";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-Bk9id1Ls.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { getPayrollReadiness, getPayrollSetup, upsertPayrollComponent, upsertPayrollSettings, upsertOvertimeRateQuick, updateTenantCurrency } from "./payroll-setup.functions-C7xZ-K-i.mjs";
import { C as CURRENCIES } from "./currencies-Bsvp_aBO.mjs";
import { A as AdminGate } from "./AdminGate-B3-x5ytD.mjs";
import { a as ORG_ADMIN_ONLY } from "./rbac-BWg_Nf1T.mjs";
import "../_libs/seroval.mjs";
import "../_libs/lovable.dev__mcp-js.mjs";
import "../_libs/modelcontextprotocol__sdk.mjs";
import "../_libs/zod-to-json-schema.mjs";
import "../_libs/ajv-formats.mjs";
import { ak as CircleCheck, a6 as Circle, as as ArrowRight } from "../_libs/lucide-react.mjs";
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
import "../_libs/tanstack__query-core.mjs";
import "./client-BLUqAwhM.mjs";
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "tslib";
import "../_libs/supabase__functions-js.mjs";
import "./createSsrRpc-CRedQJGY.mjs";
import "./server-BOi2EjMN.mjs";
import "node:async_hooks";
import "../_libs/h3-v2.mjs";
import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";
import "./auth-guard-CkYFJuQL.mjs";
import "./createMiddleware-BvN2ghIY.mjs";
import "../_libs/radix-ui__react-slot.mjs";
import "../_libs/radix-ui__react-compose-refs.mjs";
import "../_libs/class-variance-authority.mjs";
import "../_libs/clsx.mjs";
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
import "../_libs/zod.mjs";
import "../_libs/jose.mjs";
import "../_libs/ajv.mjs";
import "../_libs/fast-deep-equal.mjs";
import "../_libs/json-schema-traverse.mjs";
import "../_libs/fast-uri.mjs";
import "../_libs/radix-ui__react-popover.mjs";
import "../_libs/radix-ui__primitive.mjs";
import "../_libs/radix-ui__react-context.mjs";
import "../_libs/@radix-ui/react-dismissable-layer+[...].mjs";
import "../_libs/radix-ui__react-primitive.mjs";
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
import "../_libs/react-remove-scroll-bar.mjs";
import "../_libs/react-style-singleton.mjs";
import "../_libs/get-nonce.mjs";
import "../_libs/use-sidecar.mjs";
import "../_libs/use-callback-ref.mjs";
import "./dialog-UIV2CpIo.mjs";
import "../_libs/radix-ui__react-dialog.mjs";
import "../_libs/cmdk.mjs";
import "./onboarding.functions-BzLphvXk.mjs";
import "./hrppl-icon-DgSw_-Bc.mjs";
import "./separator-D6YV3GQ2.mjs";
import "../_libs/radix-ui__react-separator.mjs";
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
import "../_libs/radix-ui__react-label.mjs";
import "../_libs/radix-ui__react-select.mjs";
import "../_libs/radix-ui__number.mjs";
import "../_libs/radix-ui__react-use-previous.mjs";
const STEPS = [{
  key: "payItems",
  title: "Pay items",
  blurb: "Define at least one active earning/deduction so payslips can render."
}, {
  key: "payDates",
  title: "Pay dates",
  blurb: "Set the pay period and standard hours that drive every payroll run."
}, {
  key: "overtimeRates",
  title: "Overtime & penalty rates",
  blurb: "Add at least one rate so overtime can be priced correctly."
}, {
  key: "currency",
  title: "Currency",
  blurb: "Confirm the ISO 4217 currency for payroll, FX, and invoicing."
}];
function WizardPage() {
  const {
    user,
    roles,
    loading,
    rolesLoaded
  } = useAuth();
  const navigate = useNavigate();
  const canAccess = roles.includes("org_admin") || roles.includes("super_admin");
  const qc = useQueryClient();
  const fetchReadiness = useServerFn(getPayrollReadiness);
  const fetchSetup = useServerFn(getPayrollSetup);
  const readinessQ = useQuery({
    queryKey: ["payroll-readiness"],
    queryFn: () => fetchReadiness(),
    enabled: !!user && rolesLoaded && canAccess
  });
  const setupQ = useQuery({
    queryKey: ["payroll-setup"],
    queryFn: () => fetchSetup(),
    enabled: !!user && rolesLoaded && canAccess
  });
  const [step, setStep] = reactExports.useState(0);
  if (loading || user && !rolesLoaded) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "flex min-h-screen items-center justify-center text-muted-foreground", children: "Loading…" });
  }
  if (!user) return /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "flex min-h-screen items-center justify-center text-muted-foreground", children: "Sign in required." });
  const steps = readinessQ.data?.steps ?? {
    payItems: false,
    payDates: false,
    overtimeRates: false,
    currency: false
  };
  const allComplete = !!readinessQ.data?.allComplete;
  const active = STEPS[step];
  const refresh = () => {
    qc.invalidateQueries({
      queryKey: ["payroll-readiness"]
    });
    qc.invalidateQueries({
      queryKey: ["payroll-setup"]
    });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AppShell, { title: "Payroll Setup Wizard", subtitle: "Complete every step before inviting employees", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-4xl space-y-6 p-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { children: "Setup progress" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "Employee invitations are blocked until all four steps below are complete." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("ol", { className: "grid grid-cols-1 gap-3 sm:grid-cols-4", children: STEPS.map((s, i) => {
          const done = steps[s.key];
          const isActive = i === step;
          return /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => setStep(i), className: `flex w-full items-center gap-2 rounded-md border p-3 text-left transition ${isActive ? "border-primary bg-primary/5" : "border-border hover:bg-muted/40"}`, children: [
            done ? /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-5 w-5 text-emerald-600" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Circle, { className: "h-5 w-5 text-muted-foreground" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm font-medium", children: [
                i + 1,
                ". ",
                s.title
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: done ? "Complete" : "Pending" })
            ] })
          ] }) }, s.key);
        }) }),
        allComplete && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 flex items-center justify-between rounded-md border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-900 dark:bg-emerald-950/30", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-emerald-900 dark:text-emerald-200", children: "All setup steps complete. You can now invite employees." }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => navigate({
            to: "/org/invitations"
          }), children: [
            "Invite employees ",
            /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "ml-1 h-4 w-4" })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { children: [
          "Step ",
          step + 1,
          ": ",
          active.title,
          " ",
          steps[active.key] && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", className: "ml-2", children: "Complete" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: active.blurb })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
        active.key === "payItems" && /* @__PURE__ */ jsxRuntimeExports.jsx(PayItemsStep, { hasItems: steps.payItems, components: setupQ.data?.components ?? [], onSaved: refresh }),
        active.key === "payDates" && /* @__PURE__ */ jsxRuntimeExports.jsx(PayDatesStep, { existing: setupQ.data?.settings ?? null, onSaved: refresh }),
        active.key === "overtimeRates" && /* @__PURE__ */ jsxRuntimeExports.jsx(OvertimeStep, { hasRates: steps.overtimeRates, onSaved: refresh }),
        active.key === "currency" && /* @__PURE__ */ jsxRuntimeExports.jsx(CurrencyStep, { onSaved: refresh })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", onClick: () => setStep((s) => Math.max(0, s - 1)), disabled: step === 0, children: "Back" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => setStep((s) => Math.min(STEPS.length - 1, s + 1)), disabled: step === STEPS.length - 1, children: [
        "Next ",
        /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "ml-1 h-4 w-4" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-center text-xs text-muted-foreground", children: [
      "Need the full configuration UI? Open the",
      " ",
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/admin/payroll-setup", className: "underline", children: "Payroll Setup admin" }),
      "."
    ] })
  ] }) });
}
function PayItemsStep({
  hasItems,
  components,
  onSaved
}) {
  const save = useServerFn(upsertPayrollComponent);
  const [code, setCode] = reactExports.useState("BASIC");
  const [label, setLabel] = reactExports.useState("Basic salary");
  const [kind, setKind] = reactExports.useState("allowance");
  const [calc, setCalc] = reactExports.useState("flat");
  const [rate, setRate] = reactExports.useState("0");
  const [busy, setBusy] = reactExports.useState(false);
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
          show_on_payslip: true
        }
      });
      toast.success("Pay item added");
      onSaved();
    } catch (e) {
      toast.error(e?.message ?? "Could not save");
    } finally {
      setBusy(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    hasItems ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border bg-muted/40 p-3 text-sm", children: [
      components.length,
      " pay item",
      components.length === 1 ? "" : "s",
      " configured. Add another below or move to the next step."
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200", children: "No active pay items yet. Add at least one to continue." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 gap-3 sm:grid-cols-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Code" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: code, onChange: (e) => setCode(e.target.value) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Label" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: label, onChange: (e) => setLabel(e.target.value) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Kind" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: kind, onValueChange: (v) => setKind(v), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "allowance", children: "Allowance / earning" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "deduction", children: "Deduction" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "pf", children: "Provident fund" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "tax", children: "Tax" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "retirement", children: "Retirement" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "other", children: "Other" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Calc" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: calc, onValueChange: (v) => setCalc(v), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "flat", children: "Flat amount" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "pct_of_basic", children: "% of basic" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "pct_of_gross", children: "% of gross" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Rate" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: rate, onChange: (e) => setRate(e.target.value) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: submit, disabled: busy || !code || !label, children: busy ? "Saving…" : "Add pay item" })
  ] });
}
function PayDatesStep({
  existing,
  onSaved
}) {
  const save = useServerFn(upsertPayrollSettings);
  const [period, setPeriod] = reactExports.useState(existing?.pay_period ?? "monthly");
  const [hoursPerDay, setHoursPerDay] = reactExports.useState(String(existing?.standard_hours_per_day ?? 8));
  const [daysPerWeek, setDaysPerWeek] = reactExports.useState(String(existing?.standard_days_per_week ?? 5));
  const [meal, setMeal] = reactExports.useState(String(existing?.meal_break_minutes ?? 30));
  const [rest, setRest] = reactExports.useState(String(existing?.rest_break_minutes ?? 15));
  const [busy, setBusy] = reactExports.useState(false);
  reactExports.useEffect(() => {
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
          notes: null
        }
      });
      toast.success("Pay schedule saved");
      onSaved();
    } catch (e) {
      toast.error(e?.message ?? "Could not save");
    } finally {
      setBusy(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 gap-3 sm:grid-cols-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Pay period" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: period, onValueChange: (v) => setPeriod(v), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "weekly", children: "Weekly" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "fortnightly", children: "Fortnightly" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "semimonthly", children: "Semi-monthly" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "monthly", children: "Monthly" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Standard hours/day" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: hoursPerDay, onChange: (e) => setHoursPerDay(e.target.value) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Standard days/week" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: daysPerWeek, onChange: (e) => setDaysPerWeek(e.target.value) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Meal break (mins)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: meal, onChange: (e) => setMeal(e.target.value) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Rest break (mins)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: rest, onChange: (e) => setRest(e.target.value) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: submit, disabled: busy, children: busy ? "Saving…" : "Save pay schedule" })
  ] });
}
function OvertimeStep({
  hasRates,
  onSaved
}) {
  const save = useServerFn(upsertOvertimeRateQuick);
  const [code, setCode] = reactExports.useState("OT15");
  const [name, setName] = reactExports.useState("Weekday overtime ×1.5");
  const [appliesTo, setAppliesTo] = reactExports.useState("overtime");
  const [mult, setMult] = reactExports.useState("1.5");
  const [busy, setBusy] = reactExports.useState(false);
  const submit = async () => {
    setBusy(true);
    try {
      await save({
        data: {
          code,
          name,
          applies_to: appliesTo,
          rate_multiplier: Number(mult) || 1.5
        }
      });
      toast.success("Rate added");
      onSaved();
    } catch (e) {
      toast.error(e?.message ?? "Could not save");
    } finally {
      setBusy(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    !hasRates && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200", children: "Add at least one overtime or penalty rate to continue." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 gap-3 sm:grid-cols-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Code" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: code, onChange: (e) => setCode(e.target.value) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Name" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: name, onChange: (e) => setName(e.target.value) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Applies to" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: appliesTo, onValueChange: (v) => setAppliesTo(v), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "overtime", children: "Overtime" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "penalty", children: "Penalty" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Multiplier" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.05", value: mult, onChange: (e) => setMult(e.target.value) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: submit, disabled: busy || !code || !name, children: busy ? "Saving…" : "Add rate" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
      "Manage the full list on the ",
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/admin/overtime-rates", className: "underline", children: "Overtime rates" }),
      " page."
    ] })
  ] });
}
function CurrencyStep({
  onSaved
}) {
  const save = useServerFn(updateTenantCurrency);
  const [code, setCode] = reactExports.useState("USD");
  const [busy, setBusy] = reactExports.useState(false);
  const submit = async () => {
    setBusy(true);
    try {
      await save({
        data: {
          currency_code: code
        }
      });
      toast.success("Currency saved");
      onSaved();
    } catch (e) {
      toast.error(e?.message ?? "Could not save");
    } finally {
      setBusy(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Default currency" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: code, onValueChange: setCode, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { className: "max-h-72", children: CURRENCIES.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: c.code, children: c.label }, c.code)) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: submit, disabled: busy, children: busy ? "Saving…" : "Save currency" })
  ] });
}
const SplitComponent = () => /* @__PURE__ */ jsxRuntimeExports.jsx(AdminGate, { allow: ORG_ADMIN_ONLY, children: /* @__PURE__ */ jsxRuntimeExports.jsx(WizardPage, {}) });
export {
  SplitComponent as component
};
