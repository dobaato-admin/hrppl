import { j as jsxRuntimeExports, r as reactExports } from "../_libs/react.mjs";
import { e as useNavigate, L as Link } from "../_libs/tanstack__react-router.mjs";
import { u as useAuth, B as Button, C as Card, b as CardHeader, c as CardTitle, d as CardDescription, e as CardContent, f as Badge, a as useServerFn } from "./router-CLxirH5A.mjs";
import { s as supabase } from "./client-BLUqAwhM.mjs";
import { I as Input } from "./input-C6yqZkRy.mjs";
import { L as Label } from "./label-Cbju7vgw.mjs";
import { S as Switch } from "./switch-B3SbfIg0.mjs";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-Bk9id1Ls.mjs";
import { A as AppShell, P as Popover, b as PopoverTrigger, c as PopoverContent } from "./AppShell-fbDALlr7.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { c as createSsrRpc } from "./createSsrRpc-CRedQJGY.mjs";
import { r as requireSupabaseAuth } from "./auth-guard-CkYFJuQL.mjs";
import { c as createServerFn } from "./server-BOi2EjMN.mjs";
import { a as useQuery } from "../_libs/tanstack__react-query.mjs";
import { A as AdminGate } from "./AdminGate-B3-x5ytD.mjs";
import { P as PLATFORM_OR_ORG_ADMIN } from "./rbac-BWg_Nf1T.mjs";
import "../_libs/lovable.dev__mcp-js.mjs";
import "../_libs/modelcontextprotocol__sdk.mjs";
import "../_libs/zod-to-json-schema.mjs";
import "../_libs/ajv-formats.mjs";
import "../_libs/seroval.mjs";
import { i as CalendarDays, D as Download } from "../_libs/lucide-react.mjs";
import { a as objectType, C as numberType } from "../_libs/zod.mjs";
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
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "tslib";
import "../_libs/supabase__functions-js.mjs";
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
import "../_libs/radix-ui__react-primitive.mjs";
import "../_libs/radix-ui__react-switch.mjs";
import "../_libs/radix-ui__primitive.mjs";
import "../_libs/radix-ui__react-context.mjs";
import "../_libs/@radix-ui/react-use-controllable-state+[...].mjs";
import "../_libs/@radix-ui/react-use-layout-effect+[...].mjs";
import "../_libs/radix-ui__react-use-previous.mjs";
import "../_libs/radix-ui__react-use-size.mjs";
import "../_libs/radix-ui__react-select.mjs";
import "../_libs/radix-ui__number.mjs";
import "../_libs/radix-ui__react-collection.mjs";
import "../_libs/radix-ui__react-direction.mjs";
import "../_libs/@radix-ui/react-dismissable-layer+[...].mjs";
import "../_libs/@radix-ui/react-use-callback-ref+[...].mjs";
import "../_libs/@radix-ui/react-use-escape-keydown+[...].mjs";
import "../_libs/radix-ui__react-focus-guards.mjs";
import "../_libs/radix-ui__react-focus-scope.mjs";
import "../_libs/radix-ui__react-id.mjs";
import "../_libs/radix-ui__react-popper.mjs";
import "../_libs/floating-ui__react-dom.mjs";
import "../_libs/floating-ui__dom.mjs";
import "../_libs/floating-ui__core.mjs";
import "../_libs/floating-ui__utils.mjs";
import "../_libs/radix-ui__react-arrow.mjs";
import "../_libs/radix-ui__react-portal.mjs";
import "../_libs/@radix-ui/react-visually-hidden+[...].mjs";
import "../_libs/aria-hidden.mjs";
import "../_libs/react-remove-scroll.mjs";
import "../_libs/react-remove-scroll-bar.mjs";
import "../_libs/react-style-singleton.mjs";
import "../_libs/get-nonce.mjs";
import "../_libs/use-sidecar.mjs";
import "../_libs/use-callback-ref.mjs";
import "../_libs/radix-ui__react-popover.mjs";
import "../_libs/radix-ui__react-presence.mjs";
import "./dialog-UIV2CpIo.mjs";
import "../_libs/radix-ui__react-dialog.mjs";
import "../_libs/cmdk.mjs";
import "./onboarding.functions-BzLphvXk.mjs";
import "./hrppl-icon-DgSw_-Bc.mjs";
import "./separator-D6YV3GQ2.mjs";
import "../_libs/radix-ui__react-separator.mjs";
import "../_libs/radix-ui__react-tooltip.mjs";
import "../_libs/radix-ui__react-accordion.mjs";
import "../_libs/radix-ui__react-collapsible.mjs";
import "../_libs/radix-ui__react-dropdown-menu.mjs";
import "../_libs/radix-ui__react-menu.mjs";
import "../_libs/radix-ui__react-roving-focus.mjs";
import "./monday-Dpwrcz0o.mjs";
const syncAuHolidays = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  year: numberType().int().min(2020).max(2035)
}).parse(d)).handler(createSsrRpc("6fa7f9598c2bbf059aa8d16a0f3372034460c651b828ac38c3600e80903a77d6"));
const listAuHolidaySyncLog = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("b5113ef54c545cb4b6e49ae37426399ae528fbbf78349891e5311899041457bd"));
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DOW = ["S", "M", "T", "W", "T", "F", "S"];
function ymd(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const da = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${da}`;
}
function HolidayCalendar() {
  const {
    user,
    roles,
    loading
  } = useAuth();
  const navigate = useNavigate();
  const isSuper = roles.includes("super_admin");
  const isRegional = roles.includes("regional_admin");
  const isOrg = roles.includes("org_admin");
  const canManage = isSuper || isRegional || isOrg;
  const today = /* @__PURE__ */ new Date();
  const [countries, setCountries] = reactExports.useState([]);
  const [country, setCountry] = reactExports.useState("");
  const [year, setYear] = reactExports.useState(today.getFullYear() + 1);
  const [rows, setRows] = reactExports.useState([]);
  reactExports.useEffect(() => {
    if (!loading && !user) navigate({
      to: "/auth"
    });
    else if (!loading && user && !canManage) {
      toast.error("Admin access required");
      navigate({
        to: "/dashboard"
      });
    }
  }, [loading, user, canManage, navigate]);
  reactExports.useEffect(() => {
    if (!canManage || !user) return;
    (async () => {
      if (isSuper) {
        const {
          data
        } = await supabase.from("countries").select("code,name").order("name");
        setCountries(data ?? []);
      } else if (isOrg) {
        const {
          data: prof
        } = await supabase.from("profiles").select("tenant_id").eq("id", user.id).maybeSingle();
        if (!prof?.tenant_id) return;
        const {
          data: tenant
        } = await supabase.from("tenants").select("country_code").eq("id", prof.tenant_id).maybeSingle();
        if (!tenant?.country_code) return;
        const {
          data
        } = await supabase.from("countries").select("code,name").eq("code", tenant.country_code).order("name");
        setCountries(data ?? []);
      } else {
        const {
          data: scope
        } = await supabase.from("role_scope").select("country_code").eq("user_id", user.id);
        const codes = (scope ?? []).map((s) => s.country_code);
        if (!codes.length) return;
        const {
          data
        } = await supabase.from("countries").select("code,name").in("code", codes).order("name");
        setCountries(data ?? []);
      }
    })();
  }, [canManage, isOrg, isSuper, user]);
  reactExports.useEffect(() => {
    if (countries.length && !country) setCountry(countries[0].code);
  }, [countries, country]);
  async function load() {
    if (!country) return;
    const start = `${year}-01-01`;
    const end = `${year}-12-31`;
    const {
      data
    } = await supabase.from("public_holidays").select("*").eq("country_code", country).gte("holiday_date", start).lte("holiday_date", end).order("holiday_date");
    const {
      data: recurring
    } = await supabase.from("public_holidays").select("*").eq("country_code", country).eq("is_recurring", true);
    const explicit = data ?? [];
    const have = new Set(explicit.map((r) => r.holiday_date));
    const projected = [];
    for (const r of recurring ?? []) {
      const projDate = `${year}-${r.holiday_date.slice(5)}`;
      if (!have.has(projDate)) {
        projected.push({
          ...r,
          id: `recurring:${r.id}`,
          holiday_date: projDate
        });
      }
    }
    setRows([...explicit, ...projected].sort((a, b) => a.holiday_date.localeCompare(b.holiday_date)));
  }
  reactExports.useEffect(() => {
    load();
  }, [country, year]);
  const byDate = reactExports.useMemo(() => {
    const m = /* @__PURE__ */ new Map();
    for (const r of rows) m.set(r.holiday_date, r);
    return m;
  }, [rows]);
  async function addHoliday(date, name, isPaid, isRecurring, payMultiplier) {
    const {
      error
    } = await supabase.from("public_holidays").insert({
      country_code: country,
      holiday_date: date,
      name,
      is_paid: isPaid,
      is_recurring: isRecurring,
      pay_multiplier: payMultiplier === "" ? null : Number(payMultiplier)
    });
    if (error) return toast.error(error.message);
    toast.success(`${name} added`);
    load();
  }
  async function materialiseRecurring(virtualId, date, name, isPaid, payMultiplier) {
    const {
      error
    } = await supabase.from("public_holidays").insert({
      country_code: country,
      holiday_date: date,
      name,
      is_paid: isPaid,
      is_recurring: false,
      pay_multiplier: payMultiplier
    });
    if (error) return toast.error(error.message);
    toast.success("Holiday pinned to this year — edit again to update");
    load();
  }
  async function patch(id, changes) {
    if (id.startsWith("recurring:")) {
      toast.message("This date is generated from a recurring rule. Edit it on the Public holidays page, or pin it to this year first.");
      return;
    }
    const {
      error
    } = await supabase.from("public_holidays").update(changes).eq("id", id);
    if (error) return toast.error(error.message);
    load();
  }
  async function remove(id) {
    if (id.startsWith("recurring:")) {
      toast.message("Recurring holidays must be removed from the Public holidays page.");
      return;
    }
    const {
      error
    } = await supabase.from("public_holidays").delete().eq("id", id);
    if (error) return toast.error(error.message);
    load();
  }
  if (loading || !user) return /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "flex min-h-screen items-center justify-center text-muted-foreground", children: "Loading…" });
  const yearOptions = [today.getFullYear() - 1, today.getFullYear(), today.getFullYear() + 1, today.getFullYear() + 2];
  return (
    // Wrapped in AppShell to restore the sidebar and top bar. admin.tsx is
    // deliberately a bare <Outlet /> (pinned by tests/admin-routes-block.test.ts),
    // so any /admin page that does not render its own shell had no navigation at
    // all — the user could only leave via the browser back button.
    //
    // No title passed: this page already renders its own header below, so the
    // shell contributes chrome only and does not duplicate the heading.
    /* @__PURE__ */ jsxRuntimeExports.jsx(AppShell, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "min-h-screen bg-background", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("header", { className: "border-b border-border bg-card", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto flex max-w-6xl items-center justify-between px-6 py-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CalendarDays, { className: "h-5 w-5 text-primary" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-xl font-semibold", children: "Annual holiday calendar" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Click any day to mark or unmark it as a public holiday — used automatically when payroll runs." })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/admin/holidays", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", children: "List view" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/dashboard", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", children: "Dashboard" }) })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "mx-auto grid max-w-6xl gap-6 px-6 py-8", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { children: "Filters" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "Pick a country and a year — holidays you set here flow into payroll automatically (holiday-pay multiplier applies on the pay-day calc)." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "grid grid-cols-1 gap-4 md:grid-cols-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Country" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: country, onValueChange: setCountry, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Country" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: countries.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: c.code, children: c.name }, c.code)) })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Year" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: String(year), onValueChange: (v) => setYear(Number(v)), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: yearOptions.map((y) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: String(y), children: y }, y)) })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-end justify-end gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "secondary", children: [
                rows.length,
                " day",
                rows.length === 1 ? "" : "s",
                " marked"
              ] }),
              country === "AU" && /* @__PURE__ */ jsxRuntimeExports.jsx(AuSyncButton, { year, onDone: load })
            ] })
          ] })
        ] }),
        country === "AU" && /* @__PURE__ */ jsxRuntimeExports.jsx(AuSyncLog, {}),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3", children: MONTHS.map((label, monthIdx) => /* @__PURE__ */ jsxRuntimeExports.jsx(MonthCard, { year, monthIndex: monthIdx, label, byDate, onAdd: addHoliday, onPatch: patch, onRemove: remove, onMaterialise: materialiseRecurring }, label)) })
      ] })
    ] }) })
  );
}
function AuSyncButton({
  year,
  onDone
}) {
  const sync = useServerFn(syncAuHolidays);
  const [busy, setBusy] = reactExports.useState(false);
  async function run() {
    setBusy(true);
    try {
      const r = await sync({
        data: {
          year
        }
      });
      toast.success(`Synced AU holidays for ${year}: ${r.inserted} added, ${r.skipped} already present.`);
      onDone();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: run, disabled: busy, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "mr-1 h-4 w-4" }),
    " ",
    busy ? "Syncing…" : `Sync AU ${year} from data.gov.au`
  ] });
}
function AuSyncLog() {
  const listFn = useServerFn(listAuHolidaySyncLog);
  const q = useQuery({
    queryKey: ["au-holiday-sync-log"],
    queryFn: () => listFn()
  });
  const entries = q.data?.entries ?? [];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-base", children: "AU sync history" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "Last 50 sync runs from data.gov.au. Failed or partial runs show the error and any CSV rows that couldn't be parsed." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-2", children: [
      entries.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "No syncs yet — click the “Sync AU …” button above." }),
      entries.map((e) => {
        const errs = Array.isArray(e.csv_parse_errors) ? e.csv_parse_errors : [];
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("details", { className: "rounded border p-2 text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("summary", { className: "flex flex-wrap items-center gap-2 cursor-pointer", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: e.status === "success" ? "default" : e.status === "partial" ? "secondary" : "outline", className: e.status === "failed" ? "border-red-400 text-red-700" : "", children: e.status }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: e.year }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: new Date(e.started_at).toLocaleString() }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs", children: [
              "+",
              e.inserted_count,
              " added · ",
              e.skipped_count,
              " skipped · ",
              e.total_count,
              " total"
            ] }),
            errs.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-amber-600", children: [
              errs.length,
              " parse warning(s)"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 space-y-1 text-xs text-muted-foreground", children: [
            e.source_url && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              "Source: ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("a", { className: "underline", href: e.source_url, target: "_blank", rel: "noreferrer", children: e.source_url })
            ] }),
            e.error_message && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-red-600", children: [
              "Error: ",
              e.error_message
            ] }),
            errs.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-1 rounded bg-muted p-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium mb-1", children: "CSV parse warnings:" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "list-disc pl-5 space-y-0.5 max-h-40 overflow-auto", children: [
                errs.slice(0, 100).map((er, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
                  "row ",
                  er.row,
                  ": ",
                  er.reason,
                  er.raw ? ` (${er.raw})` : ""
                ] }, i)),
                errs.length > 100 && /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
                  "… and ",
                  errs.length - 100,
                  " more"
                ] })
              ] })
            ] })
          ] })
        ] }, e.id);
      })
    ] })
  ] });
}
function MonthCard({
  year,
  monthIndex,
  label,
  byDate,
  onAdd,
  onPatch,
  onRemove,
  onMaterialise
}) {
  const firstDow = new Date(year, monthIndex, 1).getDay();
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, monthIndex, d));
  while (cells.length % 7 !== 0) cells.push(null);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-base", children: label }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-1 grid grid-cols-7 gap-1 text-center text-[10px] font-medium text-muted-foreground", children: DOW.map((d, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: d }, i)) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-7 gap-1", children: cells.map((d, i) => {
        if (!d) return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-8" }, i);
        const dateStr = ymd(d);
        const h = byDate.get(dateStr);
        const isWeekend = d.getDay() === 0 || d.getDay() === 6;
        return /* @__PURE__ */ jsxRuntimeExports.jsx(DayCell, { date: d, dateStr, holiday: h, isWeekend, onAdd: (name, isPaid, isRecurring, mult) => onAdd(dateStr, name, isPaid, isRecurring, mult), onPatch: (c) => h && onPatch(h.id, c), onRemove: () => h && onRemove(h.id), onMaterialise: () => h && onMaterialise(h.id, dateStr, h.name, h.is_paid, h.pay_multiplier) }, i);
      }) })
    ] })
  ] });
}
function DayCell({
  date,
  dateStr,
  holiday,
  isWeekend,
  onAdd,
  onPatch,
  onRemove,
  onMaterialise
}) {
  const [open, setOpen] = reactExports.useState(false);
  const [name, setName] = reactExports.useState(holiday?.name ?? "");
  const [isPaid, setIsPaid] = reactExports.useState(holiday?.is_paid ?? true);
  const [isRecurring, setIsRecurring] = reactExports.useState(holiday?.is_recurring ?? false);
  const [mult, setMult] = reactExports.useState(holiday?.pay_multiplier != null ? String(holiday.pay_multiplier) : "");
  reactExports.useEffect(() => {
    setName(holiday?.name ?? "");
    setIsPaid(holiday?.is_paid ?? true);
    setIsRecurring(holiday?.is_recurring ?? false);
    setMult(holiday?.pay_multiplier != null ? String(holiday.pay_multiplier) : "");
  }, [holiday?.id]);
  const isVirtual = holiday?.id.startsWith("recurring:");
  const base = "relative h-8 w-full rounded text-xs flex items-center justify-center transition";
  const cls = holiday ? isVirtual ? "bg-amber-100 text-amber-900 hover:bg-amber-200 dark:bg-amber-900/40 dark:text-amber-100" : "bg-primary text-primary-foreground hover:bg-primary/90" : isWeekend ? "bg-muted/40 text-muted-foreground hover:bg-muted" : "hover:bg-muted";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Popover, { open, onOpenChange: setOpen, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PopoverTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", className: `${base} ${cls}`, title: holiday?.name ?? dateStr, children: [
      date.getDate(),
      holiday && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute right-0.5 top-0.5 h-1 w-1 rounded-full bg-current opacity-70" })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(PopoverContent, { className: "w-72 pointer-events-auto", align: "start", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: dateStr }),
      isVirtual && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded border border-amber-300 bg-amber-50 p-2 text-xs text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200", children: "This date comes from a recurring holiday rule. Pin it to this year to edit it, or change the original on the Public holidays page." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Holiday name" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: name, onChange: (e) => setName(e.target.value), placeholder: "e.g. Independence Day" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between rounded border p-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Paid" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { checked: isPaid, onCheckedChange: setIsPaid })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between rounded border p-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Recurs yearly" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { checked: isRecurring, onCheckedChange: setIsRecurring, disabled: !!holiday && !isVirtual ? false : false })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Pay multiplier (blank = country default)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.05", min: 1, max: 10, value: mult, onChange: (e) => setMult(e.target.value), placeholder: "e.g. 2.0" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between gap-2 pt-1", children: [
        holiday && !isVirtual && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", onClick: () => {
          onRemove();
          setOpen(false);
        }, children: "Remove" }),
        isVirtual && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: () => {
          onMaterialise();
          setOpen(false);
        }, children: [
          "Pin to ",
          dateStr.slice(0, 4)
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "ml-auto flex gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: () => setOpen(false), children: "Cancel" }),
          holiday && !isVirtual ? /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", onClick: () => {
            onPatch({
              name: name || holiday.name,
              is_paid: isPaid,
              is_recurring: isRecurring,
              pay_multiplier: mult === "" ? null : Number(mult)
            });
            setOpen(false);
          }, disabled: !name.trim(), children: "Save" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", onClick: () => {
            if (!name.trim()) return;
            onAdd(name.trim(), isPaid, isRecurring, mult);
            setOpen(false);
          }, disabled: !name.trim(), children: "Add holiday" })
        ] })
      ] })
    ] }) })
  ] });
}
const SplitComponent = () => /* @__PURE__ */ jsxRuntimeExports.jsx(AdminGate, { allow: PLATFORM_OR_ORG_ADMIN, children: /* @__PURE__ */ jsxRuntimeExports.jsx(HolidayCalendar, {}) });
export {
  SplitComponent as component
};
