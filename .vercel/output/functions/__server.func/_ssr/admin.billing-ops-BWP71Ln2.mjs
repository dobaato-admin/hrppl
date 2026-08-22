import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { a as useQuery, c as useMutation } from "../_libs/tanstack__react-query.mjs";
import { aL as listBillingAlerts, aM as listTenantsBillingOverview, aN as listTenantsLite, aO as listReconciliationForMonth, a as useServerFn, aP as retryBillingAlert, aQ as resolveBillingAlert, aR as runReconciliationForMonth, aS as exportBillingForMonth, B as Button, C as Card, b as CardHeader, c as CardTitle, d as CardDescription, e as CardContent, f as Badge, aT as listDiscrepancies, aU as exportDiscrepanciesCsv, aV as listBillingOpsAuditFiltered, aW as exportBillingOpsAuditCsv, aX as listAlertSuppressions, aY as upsertAlertSuppression, aZ as deleteAlertSuppression, a_ as listRetryPolicies, a$ as upsertRetryPolicy, b0 as previewInvoiceImpact } from "./router-CLxirH5A.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { A as AppShell } from "./AppShell-fbDALlr7.mjs";
import { I as Input } from "./input-C6yqZkRy.mjs";
import { L as Label } from "./label-Cbju7vgw.mjs";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-Bk9id1Ls.mjs";
import { S as Switch } from "./switch-B3SbfIg0.mjs";
import { T as Table, a as TableHeader, b as TableRow, c as TableHead, d as TableBody, e as TableCell } from "./table-DBQt_Juv.mjs";
import { T as Tabs, a as TabsList, b as TabsTrigger, c as TabsContent } from "./tabs-CuOXr1L0.mjs";
import { D as Dialog, a as DialogContent, b as DialogHeader, c as DialogTitle } from "./dialog-UIV2CpIo.mjs";
import "../_libs/seroval.mjs";
import "../_libs/lovable.dev__mcp-js.mjs";
import "../_libs/modelcontextprotocol__sdk.mjs";
import "../_libs/zod-to-json-schema.mjs";
import "../_libs/ajv-formats.mjs";
import { D as Download, Y as TriangleAlert, ak as CircleCheck, aF as RefreshCw, L as LoaderCircle, aH as Eye, aK as History, bh as Calculator } from "../_libs/lucide-react.mjs";
import "../_libs/tanstack__query-core.mjs";
import "../_libs/tanstack__react-router.mjs";
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
import "../_libs/cmdk.mjs";
import "../_libs/radix-ui__react-dialog.mjs";
import "./rbac-BWg_Nf1T.mjs";
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
import "../_libs/radix-ui__react-switch.mjs";
import "../_libs/radix-ui__react-tabs.mjs";
function BillingOps() {
  const now = /* @__PURE__ */ new Date();
  const prev = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1));
  const [year, setYear] = reactExports.useState(prev.getUTCFullYear());
  const [month, setMonth] = reactExports.useState(prev.getUTCMonth() + 1);
  const alertsQ = useQuery({
    queryKey: ["billing-alerts"],
    queryFn: () => listBillingAlerts()
  });
  const tenantsQ = useQuery({
    queryKey: ["billing-overview"],
    queryFn: () => listTenantsBillingOverview()
  });
  const tenantsLiteQ = useQuery({
    queryKey: ["tenants-lite"],
    queryFn: () => listTenantsLite()
  });
  const reconQ = useQuery({
    queryKey: ["billing-recon", year, month],
    queryFn: () => listReconciliationForMonth({
      data: {
        year,
        month
      }
    })
  });
  const retryFn = useServerFn(retryBillingAlert);
  const resolveFn = useServerFn(resolveBillingAlert);
  const reconFn = useServerFn(runReconciliationForMonth);
  const exportFn = useServerFn(exportBillingForMonth);
  const retry = useMutation({
    mutationFn: (id) => retryFn({
      data: {
        id
      }
    }),
    onSuccess: (r) => {
      if (r?.alreadyResolved) toast.info("Already resolved — no action taken (idempotent).");
      else if (r?.ok) toast.success("Retry succeeded");
      else toast.warning("Retry attempted — still failing");
      alertsQ.refetch();
    },
    onError: (e) => toast.error(e?.message ?? "Retry failed")
  });
  const resolve = useMutation({
    mutationFn: (id) => resolveFn({
      data: {
        id
      }
    }),
    onSuccess: () => {
      toast.success("Alert resolved");
      alertsQ.refetch();
    }
  });
  const recon = useMutation({
    mutationFn: () => reconFn({
      data: {
        year,
        month
      }
    }),
    onSuccess: (r) => {
      toast.success(`Reconciliation complete — ${r?.discrepancies ?? 0} discrepancies`);
      reconQ.refetch();
      alertsQ.refetch();
    },
    onError: (e) => toast.error(e?.message ?? "Reconciliation failed")
  });
  const exportCsv = useMutation({
    mutationFn: (format) => exportFn({
      data: {
        year,
        month,
        format
      }
    }),
    onSuccess: (r) => downloadBlob(r.content, r.filename, r.mime),
    onError: (e) => toast.error(e?.message ?? "Export failed")
  });
  const alerts = alertsQ.data?.items ?? [];
  const openAlerts = reactExports.useMemo(() => alerts.filter((a) => a.status !== "resolved"), [alerts]);
  const tenants = tenantsQ.data?.items ?? [];
  const tenantOptions = tenantsLiteQ.data?.items ?? [];
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AppShell, { title: "Billing operations", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "container mx-auto py-6 space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "flex flex-wrap items-end justify-between gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-semibold tracking-tight", children: "Billing operations" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Alerts, mandates, invoices, reconciliation, discrepancies, audit trail & invoice impact preview." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-end gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Year" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: year, onChange: (e) => setYear(Number(e.target.value)), className: "w-24" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Month" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: String(month), onValueChange: (v) => setMonth(Number(v)), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-28", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: Array.from({
              length: 12
            }, (_, i) => i + 1).map((m) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: String(m), children: String(m).padStart(2, "0") }, m)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", onClick: () => exportCsv.mutate("csv"), disabled: exportCsv.isPending, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "mr-2 h-4 w-4" }),
          " CSV"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", onClick: () => exportCsv.mutate("pdf"), disabled: exportCsv.isPending, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "mr-2 h-4 w-4" }),
          " PDF"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { defaultValue: "alerts", className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { className: "flex-wrap", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "alerts", children: [
          "Alerts (",
          openAlerts.length,
          ")"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "tenants", children: "Tenants & mandates" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "recon", children: "Reconciliation" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "discrepancies", children: "Discrepancies report" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "audit", children: "Audit timeline" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "suppressions", children: "Suppressions" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "retry", children: "Retry policies" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "preview", children: "Preview impact" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "alerts", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-5 w-5 text-amber-500" }),
            " Open alerts (",
            openAlerts.length,
            ")"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "Cron failures, Stripe usage-reporting errors, failed invoices, reconciliation discrepancies. Super admins receive an email and an in-app notification on every new alert." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "When" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Tenant" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Type" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Severity" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Message" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Retries" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Notified" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Actions" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(TableBody, { children: [
            openAlerts.map((a) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: a.suppressed ? "opacity-70" : "", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "whitespace-nowrap text-xs", children: new Date(a.created_at).toLocaleString() }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: a.tenants?.name ?? "—" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { className: "font-mono text-xs", children: [
                a.alert_type,
                a.suppressed && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "ml-1", children: "muted" }),
                a.auto_retry_exhausted && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "destructive", className: "ml-1", children: "exhausted" }),
                a.next_retry_at && !a.auto_retry_exhausted && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-1 text-[10px] text-muted-foreground", title: a.next_retry_at, children: "auto-retry queued" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: a.severity === "error" ? "destructive" : "secondary", children: a.severity }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { className: "max-w-md truncate", title: a.message ?? "", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm", children: a.title }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground truncate", children: a.message })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right", children: a.retry_count }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right text-xs", children: a.suppressed ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "muted" }) : a.notified_at ? /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "inline h-3 w-3 text-emerald-500" }) : "—" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { className: "text-right space-x-2 whitespace-nowrap", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: () => retry.mutate(a.id), disabled: retry.isPending, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "h-3 w-3 mr-1" }),
                  " Retry"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: () => resolve.mutate(a.id), disabled: resolve.isPending, children: "Resolve" })
              ] })
            ] }, a.id)),
            openAlerts.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { colSpan: 8, className: "text-center text-sm text-muted-foreground py-6", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "inline h-4 w-4 mr-1 text-emerald-500" }),
              " All clear — no open billing alerts."
            ] }) })
          ] })
        ] }) })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "tenants", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { children: "Tenant mandates & invoice outcomes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "Direct-debit mandate status and recent invoice payments. Rows with failed payments are highlighted." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Tenant" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Plan" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Subscription" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Mandate" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Debit regions" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Recent invoices" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(TableBody, { children: [
            tenants.map((t) => {
              const hasFailed = t.failed_invoices > 0;
              return /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: hasFailed ? "bg-destructive/5" : "", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium", children: t.tenants?.name }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: t.tenants?.country_code })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { className: "text-xs", children: [
                  t.subscription_plans?.code ?? "—",
                  t.au_payroll_addon && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "ml-1", children: "+AU" }),
                  t.status === "trialing" && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", className: "ml-1", children: "trial" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: t.status === "active" ? "default" : t.status === "past_due" ? "destructive" : "secondary", children: t.status }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: t.mandate_status ? /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: t.mandate_status === "active" ? "default" : "secondary", children: t.mandate_status }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", children: "not set up" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-xs font-mono", children: (t.debit_regions ?? []).join(", ") }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
                  (t.recent_invoices ?? []).slice(0, 3).map((inv) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs flex items-center gap-2", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: inv.status === "paid" ? "default" : inv.status === "open" || inv.status === "uncollectible" ? "destructive" : "secondary", children: inv.status }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                      ((inv.amount_due ?? 0) / 100).toFixed(2),
                      " ",
                      inv.currency?.toUpperCase()
                    ] }),
                    inv.hosted_invoice_url && /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: inv.hosted_invoice_url, target: "_blank", rel: "noreferrer", className: "underline", children: "view" })
                  ] }, inv.id)),
                  (t.recent_invoices ?? []).length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: "no invoices yet" })
                ] }) })
              ] }, t.tenant_id);
            }),
            tenants.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { colSpan: 6, className: "text-center text-sm text-muted-foreground py-6", children: "No tenants with subscriptions yet." }) })
          ] })
        ] }) })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "recon", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "flex flex-row items-start justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { children: [
              "Reconciliation — ",
              year,
              "-",
              String(month).padStart(2, "0")
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "Compares computed monthly net headcount against Stripe metered quantities. Run before invoices finalise." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => recon.mutate(), disabled: recon.isPending, children: [
            recon.isPending && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "mr-2 h-4 w-4 animate-spin" }),
            " Run reconciliation"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Tenant" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Computed base" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Stripe base" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Δ base" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Computed addon" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Stripe addon" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Δ addon" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Status" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(TableBody, { children: [
            (reconQ.data?.items ?? []).map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: r.has_discrepancy ? "bg-destructive/5" : "", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: r.tenants?.name ?? r.tenant_id.slice(0, 8) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right", children: r.computed_base }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right", children: r.reported_base }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right font-mono", children: r.base_delta }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right", children: r.computed_addon }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right", children: r.reported_addon }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right font-mono", children: r.addon_delta }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: r.has_discrepancy ? "destructive" : "default", children: r.has_discrepancy ? "discrepancy" : "matched" }) })
            ] }, r.id)),
            (reconQ.data?.items ?? []).length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { colSpan: 8, className: "text-center text-sm text-muted-foreground py-6", children: "No reconciliation run for this period yet." }) })
          ] })
        ] }) })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "discrepancies", children: /* @__PURE__ */ jsxRuntimeExports.jsx(DiscrepancyReport, { tenantOptions, defaultYear: year, defaultMonth: month }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "audit", children: /* @__PURE__ */ jsxRuntimeExports.jsx(AuditTimeline, { tenantOptions }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "suppressions", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SuppressionsTab, { tenantOptions }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "retry", children: /* @__PURE__ */ jsxRuntimeExports.jsx(RetryPoliciesTab, {}) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "preview", children: /* @__PURE__ */ jsxRuntimeExports.jsx(PreviewImpact, { tenantOptions, defaultYear: year, defaultMonth: month }) })
    ] })
  ] }) });
}
function DiscrepancyReport({
  tenantOptions,
  defaultYear,
  defaultMonth
}) {
  const [year, setYear] = reactExports.useState(defaultYear);
  const [month, setMonth] = reactExports.useState(defaultMonth);
  const [tenantId, setTenantId] = reactExports.useState("all");
  const [onlyDisc, setOnlyDisc] = reactExports.useState(true);
  const [drill, setDrill] = reactExports.useState(null);
  const params = {
    year: typeof year === "number" ? year : null,
    month: typeof month === "number" ? month : null,
    tenantId: tenantId === "all" ? null : tenantId,
    onlyDiscrepancies: onlyDisc
  };
  const q = useQuery({
    queryKey: ["discrepancies", params],
    queryFn: () => listDiscrepancies({
      data: params
    })
  });
  const exportFn = useServerFn(exportDiscrepanciesCsv);
  const exp = useMutation({
    mutationFn: () => exportFn({
      data: params
    }),
    onSuccess: (r) => downloadBlob(r.content, r.filename, r.mime),
    onError: (e) => toast.error(e?.message ?? "Export failed")
  });
  const rows = q.data?.items ?? [];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { children: "Reconciliation discrepancies" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "Filter by tenant and month, drill into computed vs Stripe quantities, export to CSV." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 md:grid-cols-6 gap-3 items-end", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Year" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: year, onChange: (e) => setYear(e.target.value ? Number(e.target.value) : "") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Month" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: month ? String(month) : "all", onValueChange: (v) => setMonth(v === "all" ? "" : Number(v)), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All" }),
              Array.from({
                length: 12
              }, (_, i) => i + 1).map((m) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: String(m), children: String(m).padStart(2, "0") }, m))
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "md:col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Tenant" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: tenantId, onValueChange: setTenantId, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All tenants" }),
              tenantOptions.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: t.id, children: t.name }, t.id))
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { checked: onlyDisc, onCheckedChange: setOnlyDisc, id: "only-disc" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "only-disc", className: "text-xs", children: "Discrepancies only" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => exp.mutate(), disabled: exp.isPending, variant: "outline", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "h-4 w-4 mr-1" }),
          " Export CSV"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Tenant" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Period" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Computed base" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Stripe base" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Δ base" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Computed addon" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Stripe addon" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Δ addon" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, {})
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TableBody, { children: [
          rows.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: r.has_discrepancy ? "bg-destructive/5" : "", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: r.tenants?.name ?? r.tenant_id.slice(0, 8) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { className: "text-xs", children: [
              r.period_year,
              "-",
              String(r.period_month).padStart(2, "0")
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right", children: r.computed_base }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right", children: r.reported_base }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right font-mono", children: r.base_delta }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right", children: r.computed_addon }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right", children: r.reported_addon }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right font-mono", children: r.addon_delta }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: () => setDrill(r), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-3 w-3" }) }) })
          ] }, r.id)),
          rows.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { colSpan: 9, className: "text-center text-sm text-muted-foreground py-6", children: "No matching rows." }) })
        ] })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: !!drill, onOpenChange: (o) => !o && setDrill(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-3xl", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
        "Discrepancy detail — ",
        drill?.tenants?.name,
        " (",
        drill?.period_year,
        "-",
        String(drill?.period_month ?? 0).padStart(2, "0"),
        ")"
      ] }) }),
      drill && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { label: "Computed base", value: drill.computed_base }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { label: "Stripe base", value: drill.reported_base, delta: drill.base_delta }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { label: "Computed addon", value: drill.computed_addon }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { label: "Stripe addon", value: drill.reported_addon, delta: drill.addon_delta })
        ] }),
        drill.snapshot && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border rounded-md p-3 space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-medium text-muted-foreground", children: "Snapshot" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-2 text-xs", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              "Net employees: ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: drill.snapshot.net_employees })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              "Joined: ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: drill.snapshot.joined_count })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              "Left: ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: drill.snapshot.left_count })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              "Trial applied: ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: String(drill.snapshot.trial_applied) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              "Status: ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: drill.snapshot.status })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              "Reported at: ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: drill.snapshot.reported_at ?? "—" })
            ] })
          ] }),
          drill.snapshot.plan_change_prorated && /* @__PURE__ */ jsxRuntimeExports.jsx("pre", { className: "text-[10px] mt-2 bg-muted p-2 rounded overflow-x-auto", children: JSON.stringify(drill.snapshot.plan_change_prorated, null, 2) }),
          drill.snapshot.error && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-destructive", children: [
            "Error: ",
            drill.snapshot.error
          ] })
        ] })
      ] })
    ] }) })
  ] });
}
function Box({
  label,
  value,
  delta
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border rounded-md p-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-lg font-semibold", children: value }),
    typeof delta === "number" && delta !== 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `text-xs ${delta > 0 ? "text-amber-600" : "text-destructive"}`, children: [
      "Δ ",
      delta
    ] })
  ] });
}
function AuditTimeline({
  tenantOptions
}) {
  const [tenantId, setTenantId] = reactExports.useState("all");
  const [action, setAction] = reactExports.useState("all");
  const [actorEmail, setActorEmail] = reactExports.useState("");
  const [from, setFrom] = reactExports.useState("");
  const [to, setTo] = reactExports.useState("");
  const params = {
    tenantId: tenantId === "all" ? null : tenantId,
    action: action === "all" ? null : action,
    actorEmail: actorEmail || null,
    from: from ? (/* @__PURE__ */ new Date(from + "T00:00:00Z")).toISOString() : null,
    to: to ? (/* @__PURE__ */ new Date(to + "T23:59:59Z")).toISOString() : null,
    limit: 200
  };
  const q = useQuery({
    queryKey: ["ops-audit", params],
    queryFn: () => listBillingOpsAuditFiltered({
      data: params
    })
  });
  const items = q.data?.items ?? [];
  const exportFn = useServerFn(exportBillingOpsAuditCsv);
  const exp = useMutation({
    mutationFn: () => exportFn({
      data: {
        tenantId: params.tenantId,
        action: params.action,
        actorEmail: params.actorEmail,
        from: params.from,
        to: params.to
      }
    }),
    onSuccess: (r) => downloadBlob(r.content, r.filename, r.mime),
    onError: (e) => toast.error(e?.message ?? "Export failed")
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(History, { className: "h-4 w-4" }),
        " Audit timeline"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "Who ran retries, what was retried, before/after snapshots for reconciliation and mandate changes. Retained for 7 years." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 md:grid-cols-6 gap-3 items-end", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "md:col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Tenant" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: tenantId, onValueChange: setTenantId, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All tenants" }),
              tenantOptions.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: t.id, children: t.name }, t.id))
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Action" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: action, onValueChange: setAction, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All actions" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "alert.retry.success", children: "Retry succeeded" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "alert.retry.failed", children: "Retry failed" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "alert.retry.noop", children: "Retry no-op" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "alert.auto_retry.success", children: "Auto-retry succeeded" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "alert.auto_retry.failed", children: "Auto-retry failed" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "alert.resolve", children: "Alert resolved" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "suppression.create", children: "Suppression created" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "suppression.update", children: "Suppression updated" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "suppression.delete", children: "Suppression deleted" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "retry_policy.update", children: "Retry policy updated" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "mandate.update", children: "Mandate update" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "preview.run", children: "Preview run" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Actor email" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: actorEmail, onChange: (e) => setActorEmail(e.target.value), placeholder: "jane@…" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "From" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: from, onChange: (e) => setFrom(e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "To" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: to, onChange: (e) => setTo(e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "md:col-span-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", onClick: () => exp.mutate(), disabled: exp.isPending, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "h-4 w-4 mr-1" }),
          " Export CSV"
        ] }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("ol", { className: "space-y-3 relative border-l pl-4", children: [
        items.map((row) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "relative", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute -left-[22px] top-1.5 h-3 w-3 rounded-full bg-primary/60 ring-2 ring-background" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: new Date(row.created_at).toLocaleString() }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono", children: row.action }),
            row.tenants?.name && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              " — ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: row.tenants.name })
            ] }),
            row.actor_email && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              " by ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: row.actor_email })
            ] })
          ] }),
          (row.before || row.after) && /* @__PURE__ */ jsxRuntimeExports.jsxs("details", { className: "text-xs mt-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("summary", { className: "cursor-pointer text-muted-foreground", children: "before / after" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2 mt-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("pre", { className: "bg-muted rounded p-2 overflow-x-auto text-[10px]", children: JSON.stringify(row.before, null, 2) || "—" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("pre", { className: "bg-muted rounded p-2 overflow-x-auto text-[10px]", children: JSON.stringify(row.after, null, 2) || "—" })
            ] })
          ] })
        ] }, row.id)),
        items.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("li", { className: "text-sm text-muted-foreground", children: "No audit entries." })
      ] })
    ] })
  ] });
}
function PreviewImpact({
  tenantOptions,
  defaultYear,
  defaultMonth
}) {
  const [tenantId, setTenantId] = reactExports.useState("");
  const [year, setYear] = reactExports.useState(defaultYear);
  const [month, setMonth] = reactExports.useState(defaultMonth);
  const [overridePlanCode, setOverridePlanCode] = reactExports.useState("none");
  const [overridePlanChangeDate, setOverridePlanChangeDate] = reactExports.useState("");
  const [overrideTrialEndsAt, setOverrideTrialEndsAt] = reactExports.useState("");
  const [overrideAddonAU, setOverrideAddonAU] = reactExports.useState("keep");
  const [result, setResult] = reactExports.useState(null);
  const fn = useServerFn(previewInvoiceImpact);
  const run = useMutation({
    mutationFn: () => fn({
      data: {
        tenantId,
        year,
        month,
        overridePlanCode: overridePlanCode === "none" ? null : overridePlanCode,
        overridePlanChangeDate: overridePlanChangeDate || null,
        overrideTrialEndsAt: overrideTrialEndsAt || null,
        overrideAddonAU: overrideAddonAU === "keep" ? null : overrideAddonAU === "on"
      }
    }),
    onSuccess: (r) => setResult(r),
    onError: (e) => toast.error(e?.message ?? "Preview failed")
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Calculator, { className: "h-4 w-4" }),
        " Preview invoice impact"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "Dry-run a mid-month upgrade/downgrade or trial expiration and see exactly how units pro-rate for the selected month — before Stripe finalises invoices." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid md:grid-cols-3 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "md:col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Tenant" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: tenantId, onValueChange: setTenantId, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select tenant…" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: tenantOptions.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: t.id, children: t.name }, t.id)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Year" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: year, onChange: (e) => setYear(Number(e.target.value)) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Month" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: String(month), onValueChange: (v) => setMonth(Number(v)), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: Array.from({
                length: 12
              }, (_, i) => i + 1).map((m) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: String(m), children: String(m).padStart(2, "0") }, m)) })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Switch plan to" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: overridePlanCode, onValueChange: setOverridePlanCode, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "none", children: "No change" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "starter_v2", children: "Starter ($1)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "pro_v2", children: "Pro ($3)" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Plan change date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: overridePlanChangeDate, onChange: (e) => setOverridePlanChangeDate(e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Trial ends at (override)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: overrideTrialEndsAt, onChange: (e) => setOverrideTrialEndsAt(e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "AU Payroll add-on" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: overrideAddonAU, onValueChange: setOverrideAddonAU, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "keep", children: "Keep current" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "on", children: "Force on" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "off", children: "Force off" })
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => run.mutate(), disabled: !tenantId || run.isPending, children: [
        run.isPending && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "mr-2 h-4 w-4 animate-spin" }),
        " Run preview"
      ] }) }),
      result && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 mt-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid md:grid-cols-4 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { label: "Net employees", value: result.headcount?.net }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { label: "Joined", value: result.headcount?.joined }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { label: "Left", value: result.headcount?.left }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { label: "Trial applied", value: String(result.trial?.applied) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Line" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Units" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Unit (¢)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Subtotal" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(TableBody, { children: [
            (result.lines ?? []).map((l, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: l.label }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right", children: l.units }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right", children: l.unitCents }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { className: "text-right", children: [
                "$",
                (l.subtotalCents / 100).toFixed(2)
              ] })
            ] }, i)),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { colSpan: 3, className: "text-right font-semibold", children: "Total" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { className: "text-right font-semibold", children: [
                "$",
                (result.totalCents / 100).toFixed(2)
              ] })
            ] })
          ] })
        ] }),
        result.plan?.prorated && /* @__PURE__ */ jsxRuntimeExports.jsx("pre", { className: "text-[10px] bg-muted p-2 rounded overflow-x-auto", children: JSON.stringify(result.plan.prorated, null, 2) })
      ] })
    ] })
  ] });
}
function SuppressionsTab({
  tenantOptions
}) {
  const q = useQuery({
    queryKey: ["suppressions"],
    queryFn: () => listAlertSuppressions()
  });
  const upsertFn = useServerFn(upsertAlertSuppression);
  const deleteFn = useServerFn(deleteAlertSuppression);
  const [tenantId, setTenantId] = reactExports.useState("all");
  const [alertType, setAlertType] = reactExports.useState("all");
  const [reason, setReason] = reactExports.useState("");
  const [expiresAt, setExpiresAt] = reactExports.useState("");
  const upsert = useMutation({
    mutationFn: () => upsertFn({
      data: {
        tenant_id: tenantId === "all" ? null : tenantId,
        alert_type: alertType === "all" ? null : alertType,
        reason: reason || null,
        expires_at: expiresAt ? (/* @__PURE__ */ new Date(expiresAt + "T23:59:59Z")).toISOString() : null
      }
    }),
    onSuccess: () => {
      toast.success("Suppression added");
      setReason("");
      setExpiresAt("");
      q.refetch();
    },
    onError: (e) => toast.error(e?.message ?? "Failed")
  });
  const del = useMutation({
    mutationFn: (id) => deleteFn({
      data: {
        id
      }
    }),
    onSuccess: () => {
      toast.success("Removed");
      q.refetch();
    }
  });
  const items = q.data?.items ?? [];
  const alertTypeOptions = ["stripe_usage_report_failed", "monthly_billing_unhandled_error", "monthly_billing_partial_failure", "reconciliation_run_failed", "reconciliation_discrepancy", "reconciliation_stripe_read_failed", "invoice_payment_failed"];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { children: "Alert suppressions" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "Temporarily mute notifications for specific tenants and/or alert types. Retries (manual and automated) continue normally. Leave a field as “All” to wildcard." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid md:grid-cols-5 gap-3 items-end", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Tenant" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: tenantId, onValueChange: setTenantId, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All tenants" }),
              tenantOptions.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: t.id, children: t.name }, t.id))
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Alert type" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: alertType, onValueChange: setAlertType, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All types" }),
              alertTypeOptions.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: t, children: t }, t))
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Reason" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: reason, onChange: (e) => setReason(e.target.value), placeholder: "Maintenance window" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Expires" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: expiresAt, onChange: (e) => setExpiresAt(e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => upsert.mutate(), disabled: upsert.isPending, children: "Add rule" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Tenant" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Alert type" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Reason" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Expires" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, {})
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TableBody, { children: [
          items.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: r.tenants?.name ?? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "all" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-mono text-xs", children: r.alert_type ?? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "all" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-sm", children: r.reason ?? "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-xs", children: r.expires_at ? new Date(r.expires_at).toLocaleString() : "never" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: () => del.mutate(r.id), disabled: del.isPending, children: "Remove" }) })
          ] }, r.id)),
          items.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { colSpan: 5, className: "text-center text-sm text-muted-foreground py-6", children: "No suppression rules." }) })
        ] })
      ] })
    ] })
  ] });
}
function RetryPoliciesTab() {
  const q = useQuery({
    queryKey: ["retry-policies"],
    queryFn: () => listRetryPolicies()
  });
  const upsertFn = useServerFn(upsertRetryPolicy);
  const [draft, setDraft] = reactExports.useState({});
  const save = useMutation({
    mutationFn: (p) => upsertFn({
      data: p
    }),
    onSuccess: () => {
      toast.success("Policy saved");
      q.refetch();
    },
    onError: (e) => toast.error(e?.message ?? "Save failed")
  });
  const items = q.data?.items ?? [];
  const get = (p, k) => draft[`${p.alert_type}:${k}`] ?? p[k];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { children: "Automated retry policies" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "Per alert type: when enabled, the system retries failed alerts on a backoff schedule until max attempts is reached. Reduces manual intervention while preserving idempotency." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "overflow-x-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Alert type" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Enabled" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Max attempts" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Initial backoff (s)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Multiplier" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Max backoff (s)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, {})
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: items.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-mono text-xs", children: p.alert_type }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { checked: !!get(p, "enabled"), onCheckedChange: (v) => setDraft((d) => ({
            ...d,
            [`${p.alert_type}:enabled`]: v
          })) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", className: "w-20 ml-auto", value: get(p, "max_attempts"), onChange: (e) => setDraft((d) => ({
            ...d,
            [`${p.alert_type}:max_attempts`]: Number(e.target.value)
          })) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", className: "w-24 ml-auto", value: get(p, "backoff_seconds"), onChange: (e) => setDraft((d) => ({
            ...d,
            [`${p.alert_type}:backoff_seconds`]: Number(e.target.value)
          })) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.1", className: "w-20 ml-auto", value: get(p, "backoff_multiplier"), onChange: (e) => setDraft((d) => ({
            ...d,
            [`${p.alert_type}:backoff_multiplier`]: Number(e.target.value)
          })) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", className: "w-28 ml-auto", value: get(p, "max_backoff_seconds"), onChange: (e) => setDraft((d) => ({
            ...d,
            [`${p.alert_type}:max_backoff_seconds`]: Number(e.target.value)
          })) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", disabled: save.isPending, onClick: () => save.mutate({
            alert_type: p.alert_type,
            enabled: !!get(p, "enabled"),
            max_attempts: Number(get(p, "max_attempts")),
            backoff_seconds: Number(get(p, "backoff_seconds")),
            backoff_multiplier: Number(get(p, "backoff_multiplier")),
            max_backoff_seconds: Number(get(p, "max_backoff_seconds"))
          }), children: "Save" }) })
        ] }, p.alert_type)) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground mt-3", children: [
        "Schedule a cron POST to ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("code", { children: "/api/public/hooks/auto-retry-alerts" }),
        " every few minutes to drive retries."
      ] })
    ] })
  ] });
}
function downloadBlob(content, filename, mime) {
  const blob = new Blob([content], {
    type: mime
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
export {
  BillingOps as component
};
