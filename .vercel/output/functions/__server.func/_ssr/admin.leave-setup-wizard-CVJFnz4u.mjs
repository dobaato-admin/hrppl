import { j as jsxRuntimeExports, r as reactExports } from "../_libs/react.mjs";
import { e as useNavigate, L as Link } from "../_libs/tanstack__react-router.mjs";
import { u as useAuth, a as useServerFn, C as Card, b as CardHeader, c as CardTitle, d as CardDescription, e as CardContent, B as Button, f as Badge } from "./router-CLxirH5A.mjs";
import { u as useQueryClient, a as useQuery } from "../_libs/tanstack__react-query.mjs";
import { A as AppShell } from "./AppShell-fbDALlr7.mjs";
import { I as Input } from "./input-C6yqZkRy.mjs";
import { L as Label } from "./label-Cbju7vgw.mjs";
import { S as Switch } from "./switch-B3SbfIg0.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { getLeaveReadiness, upsertLeaveTypeQuick, listLeaveApprovalRoutes, listTenantApprovers, upsertLeaveApprovalRoute, deleteLeaveApprovalRoute } from "./leave-setup.functions-7GflKBSX.mjs";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-Bk9id1Ls.mjs";
import { A as AdminGate } from "./AdminGate-B3-x5ytD.mjs";
import { a as ORG_ADMIN_ONLY } from "./rbac-BWg_Nf1T.mjs";
import "../_libs/seroval.mjs";
import "../_libs/lovable.dev__mcp-js.mjs";
import "../_libs/modelcontextprotocol__sdk.mjs";
import "../_libs/zod-to-json-schema.mjs";
import "../_libs/ajv-formats.mjs";
import { ak as CircleCheck, a6 as Circle, as as ArrowRight, T as Trash2 } from "../_libs/lucide-react.mjs";
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
import "../_libs/radix-ui__react-switch.mjs";
import "../_libs/radix-ui__react-use-previous.mjs";
import "../_libs/radix-ui__react-select.mjs";
import "../_libs/radix-ui__number.mjs";
const STEPS = [{
  key: "leaveTypes",
  title: "Leave types",
  blurb: "Define at least one active leave category (annual, sick, etc.)."
}, {
  key: "accruals",
  title: "Accruals & quotas",
  blurb: "Each active type must have a non-zero annual quota or monthly accrual."
}, {
  key: "approvalRouting",
  title: "Approval routing",
  blurb: "At least one approver (Manager / HR / Org Admin) must exist in the org."
}];
function LeaveWizard() {
  const {
    user,
    roles,
    loading,
    rolesLoaded
  } = useAuth();
  const navigate = useNavigate();
  const canAccess = roles.includes("org_admin") || roles.includes("super_admin");
  const qc = useQueryClient();
  const fetchReadiness = useServerFn(getLeaveReadiness);
  const readinessQ = useQuery({
    queryKey: ["leave-readiness"],
    queryFn: () => fetchReadiness(),
    enabled: !!user && rolesLoaded && canAccess
  });
  const [step, setStep] = reactExports.useState(0);
  if (loading || user && !rolesLoaded) return /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "flex min-h-screen items-center justify-center text-muted-foreground", children: "Loading…" });
  if (!user) return /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "flex min-h-screen items-center justify-center text-muted-foreground", children: "Sign in required." });
  const steps = readinessQ.data?.steps ?? {
    leaveTypes: false,
    accruals: false,
    approvalRouting: false
  };
  const allComplete = !!readinessQ.data?.allComplete;
  const active = STEPS[step];
  const refresh = () => qc.invalidateQueries({
    queryKey: ["leave-readiness"]
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AppShell, { title: "Leave Setup Wizard", subtitle: "Step 3 of admin setup — required before inviting employees", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-4xl space-y-6 p-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { children: "Setup progress" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "Employee invitations are blocked until leave types, accruals, and approval routing are configured." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("ol", { className: "grid grid-cols-1 gap-3 sm:grid-cols-3", children: STEPS.map((s, i) => {
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
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-emerald-900 dark:text-emerald-200", children: "Leave setup complete. You're ready to invite employees." }),
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
        active.key === "leaveTypes" && /* @__PURE__ */ jsxRuntimeExports.jsx(LeaveTypeStep, { hasType: steps.leaveTypes, onSaved: refresh }),
        active.key === "accruals" && /* @__PURE__ */ jsxRuntimeExports.jsx(AccrualsStep, { ok: steps.accruals, onSaved: refresh }),
        active.key === "approvalRouting" && /* @__PURE__ */ jsxRuntimeExports.jsx(ApprovalStep, { ok: steps.approvalRouting })
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
      "Manage the full list on the ",
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/admin/leave-types", className: "underline", children: "Leave types" }),
      " page."
    ] })
  ] }) });
}
function LeaveTypeStep({
  hasType,
  onSaved
}) {
  const save = useServerFn(upsertLeaveTypeQuick);
  const [code, setCode] = reactExports.useState("ANNUAL");
  const [name, setName] = reactExports.useState("Annual leave");
  const [quota, setQuota] = reactExports.useState("20");
  const [accrual, setAccrual] = reactExports.useState("1.67");
  const [requiresApproval, setRequiresApproval] = reactExports.useState(true);
  const [isPaid, setIsPaid] = reactExports.useState(true);
  const [busy, setBusy] = reactExports.useState(false);
  const submit = async () => {
    setBusy(true);
    try {
      await save({
        data: {
          code,
          name,
          color: "#3b82f6",
          annual_quota_days: Number(quota) || 0,
          accrual_per_month: Number(accrual) || 0,
          requires_approval: requiresApproval,
          is_paid: isPaid,
          allow_half_day: true,
          allow_carry_over: true,
          max_carry_over_days: 0
        }
      });
      toast.success("Leave type added");
      onSaved();
    } catch (e) {
      toast.error(e?.message ?? "Could not save");
    } finally {
      setBusy(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    hasType ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-md border bg-muted/40 p-3 text-sm", children: "At least one active leave type is configured. Add another, or move on." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200", children: "No active leave types yet. Add at least one to continue." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 gap-3 sm:grid-cols-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Code" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: code, onChange: (e) => setCode(e.target.value.toUpperCase()) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Name" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: name, onChange: (e) => setName(e.target.value) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Annual quota (days)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.5", value: quota, onChange: (e) => setQuota(e.target.value) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Monthly accrual (days)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: accrual, onChange: (e) => setAccrual(e.target.value) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between rounded-md border p-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Requires approval" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { checked: requiresApproval, onCheckedChange: setRequiresApproval })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between rounded-md border p-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Paid leave" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { checked: isPaid, onCheckedChange: setIsPaid })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: submit, disabled: busy || !code || !name, children: busy ? "Saving…" : "Add leave type" })
  ] });
}
function AccrualsStep({
  ok,
  onSaved: _onSaved
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
    ok ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-200", children: "Every active leave type has a non-zero quota or monthly accrual — balances will grow correctly." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200", children: "One or more active leave types have both quota and accrual set to zero. Set at least one of those values per type." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground", children: [
      "Edit quotas and accruals on the",
      " ",
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/admin/leave-types", className: "underline", children: "Leave types" }),
      " page. Per-employee adjustments and carry-overs are managed under",
      " ",
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/org/leave", className: "underline", children: "Leave management" }),
      "."
    ] })
  ] });
}
function ApprovalStep({
  ok
}) {
  const qc = useQueryClient();
  const listFn = useServerFn(listLeaveApprovalRoutes);
  const approversFn = useServerFn(listTenantApprovers);
  const upsertFn = useServerFn(upsertLeaveApprovalRoute);
  const delFn = useServerFn(deleteLeaveApprovalRoute);
  const routesQ = useQuery({
    queryKey: ["leave-approval-routes"],
    queryFn: () => listFn()
  });
  const approversQ = useQuery({
    queryKey: ["tenant-approvers"],
    queryFn: () => approversFn()
  });
  const [tier, setTier] = reactExports.useState("1");
  const [mode, setMode] = reactExports.useState("role");
  const [role, setRole] = reactExports.useState("manager");
  const [userId, setUserId] = reactExports.useState("");
  const [escalate, setEscalate] = reactExports.useState("48");
  const [busy, setBusy] = reactExports.useState(false);
  const refresh = () => qc.invalidateQueries({
    queryKey: ["leave-approval-routes"]
  });
  const addRule = async () => {
    setBusy(true);
    try {
      await upsertFn({
        data: {
          leave_type_id: null,
          tier: Number(tier) || 1,
          approver_role: mode === "role" ? role : null,
          approver_user_id: mode === "user" ? userId || null : null,
          escalate_after_hours: Number(escalate) || 48,
          is_active: true
        }
      });
      toast.success("Approval rule added");
      refresh();
    } catch (e) {
      toast.error(e?.message ?? "Could not save");
    } finally {
      setBusy(false);
    }
  };
  const routes = routesQ.data?.routes ?? [];
  const approvers = approversQ.data?.approvers ?? [];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    ok ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-200", children: "At least one approver (Manager, HR, Branch Admin, or Org Admin) is available. Add an explicit routing chain below to control tiers and escalation." }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200", children: [
      "No approvers found yet. Promote a teammate to Manager/HR, or mark every active leave type as ",
      /* @__PURE__ */ jsxRuntimeExports.jsx("em", { children: "not" }),
      " requiring approval. Then define the chain below."
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border p-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-2 text-sm font-medium", children: "Approval chain (all leave types)" }),
      routes.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "No rules yet. The first rule you add becomes Tier 1." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-1 text-sm", children: routes.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-center justify-between rounded border bg-muted/30 p-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "outline", className: "mr-2", children: [
            "Tier ",
            r.tier
          ] }),
          r.approver_role ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            "Role: ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: r.approver_role })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            "User: ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: approvers.find((a) => a.id === r.approver_user_id)?.full_name ?? r.approver_user_id })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ml-2 text-muted-foreground", children: [
            "escalate after ",
            r.escalate_after_hours,
            "h"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "sm", onClick: async () => {
          await delFn({
            data: {
              id: r.id
            }
          });
          toast.success("Removed");
          refresh();
        }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4" }) })
      ] }, r.id)) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 gap-3 rounded-md border p-3 sm:grid-cols-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Tier" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: 1, max: 10, value: tier, onChange: (e) => setTier(e.target.value) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "sm:col-span-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Approver" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: mode, onValueChange: (v) => setMode(v), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "role", children: "By role" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "user", children: "Specific user" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "sm:col-span-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: " " }),
        mode === "role" ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: role, onValueChange: (v) => setRole(v), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "manager", children: "Manager (direct manager of the requester)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "hr", children: "HR" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "branch_admin", children: "Branch Admin" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "org_admin", children: "Org Admin" })
          ] })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: userId, onValueChange: setUserId, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: approvers.length ? "Select approver" : "No approvers yet" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: approvers.map((a) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: a.id, children: a.full_name || a.email }, a.id)) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "sm:col-span-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Escalate after (hours)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: 0, max: 720, value: escalate, onChange: (e) => setEscalate(e.target.value) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "sm:col-span-2 flex items-end", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { className: "w-full", onClick: addRule, disabled: busy || mode === "user" && !userId, children: busy ? "Adding…" : "Add tier" }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground", children: [
      "Leave requests advance through tiers in order. If a tier doesn't act within the escalation window, the request advances to the next tier automatically. Manage assignees per employee on ",
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/org/employees", className: "underline", children: "Employees" }),
      "."
    ] })
  ] });
}
const SplitComponent = () => /* @__PURE__ */ jsxRuntimeExports.jsx(AdminGate, { allow: ORG_ADMIN_ONLY, children: /* @__PURE__ */ jsxRuntimeExports.jsx(LeaveWizard, {}) });
export {
  SplitComponent as component
};
