import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { e as useNavigate, L as Link } from "../_libs/tanstack__react-router.mjs";
import { u as useAuth, a as useServerFn, B as Button, C as Card, b as CardHeader, c as CardTitle, e as CardContent, T as Textarea, f as Badge } from "./router-CLxirH5A.mjs";
import { s as supabase } from "./client-BLUqAwhM.mjs";
import { T as Table, a as TableHeader, b as TableRow, c as TableHead, d as TableBody, e as TableCell } from "./table-DBQt_Juv.mjs";
import { T as Tabs, a as TabsList, b as TabsTrigger, c as TabsContent } from "./tabs-CuOXr1L0.mjs";
import { D as Dialog, a as DialogContent, b as DialogHeader, c as DialogTitle, e as DialogFooter } from "./dialog-UIV2CpIo.mjs";
import { I as Input } from "./input-C6yqZkRy.mjs";
import { L as Label } from "./label-Cbju7vgw.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { a as approveTimesheet, r as rejectTimesheet } from "./attendance.functions-DLvKDYJF.mjs";
import "../_libs/seroval.mjs";
import "../_libs/lovable.dev__mcp-js.mjs";
import "../_libs/modelcontextprotocol__sdk.mjs";
import "../_libs/zod-to-json-schema.mjs";
import "../_libs/ajv-formats.mjs";
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
import "../_libs/tanstack__react-query.mjs";
import "./createSsrRpc-CRedQJGY.mjs";
import "./server-BOi2EjMN.mjs";
import "node:async_hooks";
import "../_libs/h3-v2.mjs";
import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";
import "./auth-guard-CkYFJuQL.mjs";
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "tslib";
import "../_libs/supabase__functions-js.mjs";
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
import "../_libs/lucide-react.mjs";
import "../_libs/jose.mjs";
import "../_libs/ajv.mjs";
import "../_libs/fast-deep-equal.mjs";
import "../_libs/json-schema-traverse.mjs";
import "../_libs/fast-uri.mjs";
import "../_libs/radix-ui__react-tabs.mjs";
import "../_libs/radix-ui__primitive.mjs";
import "../_libs/radix-ui__react-context.mjs";
import "../_libs/radix-ui__react-roving-focus.mjs";
import "../_libs/radix-ui__react-collection.mjs";
import "../_libs/radix-ui__react-id.mjs";
import "../_libs/@radix-ui/react-use-layout-effect+[...].mjs";
import "../_libs/radix-ui__react-primitive.mjs";
import "../_libs/@radix-ui/react-use-callback-ref+[...].mjs";
import "../_libs/@radix-ui/react-use-controllable-state+[...].mjs";
import "../_libs/radix-ui__react-direction.mjs";
import "../_libs/radix-ui__react-presence.mjs";
import "../_libs/radix-ui__react-dialog.mjs";
import "../_libs/@radix-ui/react-dismissable-layer+[...].mjs";
import "../_libs/@radix-ui/react-use-escape-keydown+[...].mjs";
import "../_libs/radix-ui__react-focus-scope.mjs";
import "../_libs/radix-ui__react-portal.mjs";
import "../_libs/radix-ui__react-focus-guards.mjs";
import "../_libs/react-remove-scroll.mjs";
import "../_libs/react-remove-scroll-bar.mjs";
import "../_libs/react-style-singleton.mjs";
import "../_libs/get-nonce.mjs";
import "../_libs/use-sidecar.mjs";
import "../_libs/use-callback-ref.mjs";
import "../_libs/aria-hidden.mjs";
import "../_libs/radix-ui__react-label.mjs";
function OrgTimesheets() {
  const {
    user,
    roles,
    loading
  } = useAuth();
  const navigate = useNavigate();
  const [tenantId, setTenantId] = reactExports.useState(null);
  const [countryCode, setCountryCode] = reactExports.useState(null);
  const [rows, setRows] = reactExports.useState([]);
  const [emps, setEmps] = reactExports.useState({});
  const [rates, setRates] = reactExports.useState([]);
  const [rejectTarget, setRejectTarget] = reactExports.useState(null);
  const [reason, setReason] = reactExports.useState("");
  const [approveTarget, setApproveTarget] = reactExports.useState(null);
  const [breakdown, setBreakdown] = reactExports.useState({});
  const [busy, setBusy] = reactExports.useState(false);
  const fnApprove = useServerFn(approveTimesheet);
  const fnReject = useServerFn(rejectTimesheet);
  const canAccess = roles.includes("manager") || roles.includes("org_admin") || roles.includes("super_admin");
  reactExports.useEffect(() => {
    if (!loading && !user) navigate({
      to: "/auth"
    });
  }, [loading, user, navigate]);
  reactExports.useEffect(() => {
    if (!user) return;
    (async () => {
      const {
        data: prof
      } = await supabase.from("profiles").select("tenant_id").eq("id", user.id).maybeSingle();
      if (prof?.tenant_id) {
        setTenantId(prof.tenant_id);
        const {
          data: t
        } = await supabase.from("tenants").select("country_code").eq("id", prof.tenant_id).maybeSingle();
        if (t?.country_code) setCountryCode(t.country_code);
      }
    })();
  }, [user]);
  async function load() {
    if (!tenantId) return;
    const [tRes, eRes] = await Promise.all([supabase.from("timesheets").select("*").eq("tenant_id", tenantId).order("period_start", {
      ascending: false
    }), supabase.from("employees").select("id,first_name,last_name,employee_number").eq("tenant_id", tenantId)]);
    setRows(tRes.data ?? []);
    const m = {};
    (eRes.data ?? []).forEach((e) => {
      m[e.id] = e;
    });
    setEmps(m);
  }
  reactExports.useEffect(() => {
    load();
  }, [tenantId]);
  reactExports.useEffect(() => {
    if (!countryCode) return;
    (async () => {
      const {
        data
      } = await supabase.from("overtime_penalty_rates").select("*").eq("country_code", countryCode).eq("is_active", true).order("code");
      setRates(data ?? []);
    })();
  }, [countryCode]);
  function openApprove(r) {
    setApproveTarget(r);
    const initial = {};
    const existing = r.overtime_breakdown ?? {};
    const activeRates = rates.filter((rate) => rate.effective_from <= r.period_end && (!rate.effective_to || rate.effective_to >= r.period_end));
    for (const rate of activeRates) {
      initial[rate.code] = existing[rate.code] != null ? String(existing[rate.code]) : "";
    }
    setBreakdown(initial);
  }
  const breakdownTotal = reactExports.useMemo(() => Object.values(breakdown).reduce((s, v) => s + (Number(v) || 0), 0), [breakdown]);
  const activeRatesForTarget = reactExports.useMemo(() => {
    if (!approveTarget) return [];
    return rates.filter((rate) => rate.effective_from <= approveTarget.period_end && (!rate.effective_to || rate.effective_to >= approveTarget.period_end));
  }, [rates, approveTarget]);
  const anyBreakdownEntered = reactExports.useMemo(() => Object.values(breakdown).some((v) => Number(v) > 0), [breakdown]);
  const breakdownMatches = approveTarget ? Math.abs(breakdownTotal - Number(approveTarget.overtime_hours || 0)) <= 0.01 : false;
  const approveDisabled = busy || anyBreakdownEntered && !breakdownMatches;
  async function onApprove() {
    if (!approveTarget) return;
    setBusy(true);
    try {
      if (anyBreakdownEntered) {
        const payload = {};
        for (const [k, v] of Object.entries(breakdown)) {
          const n = Number(v);
          if (n > 0) payload[k] = n;
        }
        const {
          error: upErr
        } = await supabase.from("timesheets").update({
          overtime_breakdown: payload
        }).eq("id", approveTarget.id);
        if (upErr) throw new Error(upErr.message);
      } else {
        await supabase.from("timesheets").update({
          overtime_breakdown: {}
        }).eq("id", approveTarget.id);
      }
      await fnApprove({
        data: {
          timesheetId: approveTarget.id
        }
      });
      toast.success("Approved");
      setApproveTarget(null);
      setBreakdown({});
      await load();
    } catch (e) {
      toast.error(e.message ?? "Failed");
    } finally {
      setBusy(false);
    }
  }
  async function onReject() {
    if (!rejectTarget) return;
    setBusy(true);
    try {
      await fnReject({
        data: {
          timesheetId: rejectTarget.id,
          reason: reason || void 0
        }
      });
      toast.success("Rejected");
      setRejectTarget(null);
      setReason("");
      await load();
    } catch (e) {
      toast.error(e.message ?? "Failed");
    } finally {
      setBusy(false);
    }
  }
  if (loading || !user) return /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "flex min-h-screen items-center justify-center text-muted-foreground", children: "Loading…" });
  if (!canAccess) return /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "flex min-h-screen items-center justify-center text-muted-foreground", children: "Forbidden." });
  const submitted = rows.filter((r) => r.status === "submitted");
  const history = rows.filter((r) => r.status !== "submitted");
  const Row = ({
    r,
    actions
  }) => {
    const e = emps[r.employee_id];
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium", children: e ? `${e.first_name} ${e.last_name}` : "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: e?.employee_number })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { children: [
        r.period_start,
        " → ",
        r.period_end
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: Number(r.total_hours).toFixed(2) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: Number(r.overtime_hours).toFixed(2) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: r.status === "approved" ? "default" : r.status === "rejected" ? "destructive" : "secondary", children: r.status }) }),
      actions && /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { className: "text-right space-x-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", disabled: busy, onClick: () => openApprove(r), children: "Approve" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", disabled: busy, onClick: () => {
          setRejectTarget(r);
          setReason("");
        }, children: "Reject" })
      ] })
    ] }, r.id);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "min-h-screen bg-background", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("header", { className: "border-b border-border bg-card", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto flex max-w-6xl items-center justify-between px-6 py-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-xl font-semibold", children: "Timesheets" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Approve submitted timesheets." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/org", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", size: "sm", children: "Back" }) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "mx-auto max-w-6xl px-6 py-8", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { defaultValue: "submitted", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "submitted", children: [
          "Submitted (",
          submitted.length,
          ")"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "history", children: [
          "History (",
          history.length,
          ")"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "submitted", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-base", children: "Awaiting approval" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Employee" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Period" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Hours" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "OT" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Status" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, {})
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(TableBody, { children: [
            submitted.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { r, actions: true }, r.id)),
            submitted.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { colSpan: 6, className: "text-center text-muted-foreground", children: "Nothing to approve." }) })
          ] })
        ] }) })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "history", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-base", children: "History" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Employee" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Period" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Hours" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "OT" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Status" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(TableBody, { children: [
            history.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { r }, r.id)),
            history.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { colSpan: 5, className: "text-center text-muted-foreground", children: "No history." }) })
          ] })
        ] }) })
      ] }) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: !!approveTarget, onOpenChange: (o) => {
      if (!o) {
        setApproveTarget(null);
        setBreakdown({});
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-lg", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Approve timesheet" }) }),
      approveTarget && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-muted-foreground", children: [
          "Total overtime: ",
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-medium text-foreground", children: [
            Number(approveTarget.overtime_hours).toFixed(2),
            " h"
          ] })
        ] }),
        activeRatesForTarget.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "No overtime penalty rates configured for this country. The country default multiplier will be used." }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: "Optionally split overtime hours across penalty rates. Leave all empty to use the country default multiplier." }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: activeRatesForTarget.map((rate) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-[1fr_auto] items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { className: "text-xs", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-[11px] mr-1", children: rate.code }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: rate.name }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground", children: [
                " · ×",
                Number(rate.rate_multiplier).toFixed(2)
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", min: 0, className: "w-24", value: breakdown[rate.code] ?? "", onChange: (e) => setBreakdown({
              ...breakdown,
              [rate.code]: e.target.value
            }) })
          ] }, rate.code)) }),
          anyBreakdownEntered && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `text-xs ${breakdownMatches ? "text-muted-foreground" : "text-destructive"}`, children: [
            "Breakdown total: ",
            breakdownTotal.toFixed(2),
            " h",
            !breakdownMatches && ` (must equal ${Number(approveTarget.overtime_hours).toFixed(2)} h)`
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => {
          setApproveTarget(null);
          setBreakdown({});
        }, children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: onApprove, disabled: approveDisabled, children: "Approve" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: !!rejectTarget, onOpenChange: (o) => {
      if (!o) setRejectTarget(null);
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Reject timesheet" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 4, placeholder: "Reason (optional)", value: reason, onChange: (e) => setReason(e.target.value) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setRejectTarget(null), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "destructive", onClick: onReject, disabled: busy, children: "Reject" })
      ] })
    ] }) })
  ] });
}
export {
  OrgTimesheets as component
};
