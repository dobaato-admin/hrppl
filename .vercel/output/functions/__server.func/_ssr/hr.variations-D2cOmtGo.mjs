import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { e as useNavigate } from "../_libs/tanstack__react-router.mjs";
import { u as useQueryClient, a as useQuery, c as useMutation } from "../_libs/tanstack__react-query.mjs";
import { u as useAuth, a as useServerFn, C as Card, b as CardHeader, c as CardTitle, B as Button, e as CardContent, f as Badge, T as Textarea } from "./router-CLxirH5A.mjs";
import { A as AppShell } from "./AppShell-fbDALlr7.mjs";
import { A as AuditExportButtons } from "./AuditExportButtons-DWNdrWFU.mjs";
import { L as Label } from "./label-Cbju7vgw.mjs";
import { I as Input } from "./input-C6yqZkRy.mjs";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-Bk9id1Ls.mjs";
import { D as Dialog, a as DialogContent, b as DialogHeader, c as DialogTitle, e as DialogFooter } from "./dialog-UIV2CpIo.mjs";
import { T as Table, a as TableHeader, b as TableRow, c as TableHead, d as TableBody, e as TableCell } from "./table-DBQt_Juv.mjs";
import { c as createSsrRpc } from "./createSsrRpc-CRedQJGY.mjs";
import { r as requireSupabaseAuth } from "./auth-guard-CkYFJuQL.mjs";
import { c as createServerFn } from "./server-BOi2EjMN.mjs";
import { s as supabase } from "./client-BLUqAwhM.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { u as useMyTenantId } from "./use-tenant-B3EuiYSY.mjs";
import "../_libs/lovable.dev__mcp-js.mjs";
import "../_libs/modelcontextprotocol__sdk.mjs";
import "../_libs/zod-to-json-schema.mjs";
import "../_libs/ajv-formats.mjs";
import "../_libs/seroval.mjs";
import { a as objectType, z as stringType, G as literalType, A as booleanType, E as recordType, F as anyType, B as enumType } from "../_libs/zod.mjs";
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
import "../_libs/lucide-react.mjs";
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
const VariationType = enumType(["promotion", "transfer", "pay_change", "hours_change", "role_change", "department_change", "contract_change"]);
const Status = enumType(["draft", "pending_approval", "approved", "rejected", "applied", "cancelled"]);
const listVariations = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  status: Status.or(literalType("all")).default("all"),
  employee_id: stringType().uuid().optional()
}).partial().parse(d ?? {})).handler(createSsrRpc("fff7316ee9ee302d27938f5044f9e3a761857e0156611c85cac1fdced01a7350"));
createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  variation_id: stringType().uuid()
}).parse(d)).handler(createSsrRpc("97cb4df4f6b3448917ee29c225220b55113787af6cf23b03f64798ed4d13d323"));
const createVariation = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  employee_id: stringType().uuid(),
  variation_type: VariationType,
  effective_date: stringType().regex(/^\d{4}-\d{2}-\d{2}$/),
  proposed_changes: recordType(stringType(), anyType()),
  notes: stringType().trim().max(2e3).nullable().optional(),
  submit: booleanType().default(false)
}).parse(d)).handler(createSsrRpc("34f6a6285521e4a04689c024501e88e7d0d8bf127998e7edafa3bdb0f1491877"));
createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(createSsrRpc("bfc797ec37156876a94160104faa87b48a1ef3ef00b4e30eb84699261daf4960"));
const approveVariation = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid(),
  comment: stringType().trim().max(1e3).optional()
}).parse(d)).handler(createSsrRpc("4ca1ac9fb371bb54f4f38421f832a860a9d1cdd2ad9f567a4afd2fb211468fcf"));
const rejectVariation = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid(),
  reason: stringType().trim().min(3).max(1e3)
}).parse(d)).handler(createSsrRpc("94539d0999be1703d4b95fe4ee34c4004500040ccf0cf81af7581aedac4d09f8"));
const applyVariation = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(createSsrRpc("3378dedbc692f0b6ece4b74908ed6a1bda716b8d74912d010bba18afa18064ee"));
const TYPES = ["promotion", "transfer", "pay_change", "hours_change", "role_change", "department_change", "contract_change"];
const STATUS_COLOR = {
  draft: "outline",
  pending_approval: "secondary",
  approved: "default",
  rejected: "destructive",
  applied: "default",
  cancelled: "outline"
};
function Page() {
  const {
    roles,
    loading
  } = useAuth();
  const {
    tenantId
  } = useMyTenantId();
  const navigate = useNavigate();
  const canAccess = roles.includes("hr") || roles.includes("org_admin") || roles.includes("super_admin");
  reactExports.useEffect(() => {
    if (!loading && !canAccess) navigate({
      to: "/dashboard"
    });
  }, [loading, canAccess, navigate]);
  const qc = useQueryClient();
  const listFn = useServerFn(listVariations);
  const createFn = useServerFn(createVariation);
  const approveFn = useServerFn(approveVariation);
  const rejectFn = useServerFn(rejectVariation);
  const applyFn = useServerFn(applyVariation);
  const [status, setStatus] = reactExports.useState("all");
  const [search, setSearch] = reactExports.useState("");
  const {
    data,
    isLoading
  } = useQuery({
    queryKey: ["variations", status],
    queryFn: () => listFn({
      data: {
        status
      }
    }),
    enabled: canAccess
  });
  const allRows = data?.rows ?? [];
  const filteredRows = allRows.filter((r) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const name = `${r.employee?.first_name ?? ""} ${r.employee?.last_name ?? ""}`.toLowerCase();
    return name.includes(q);
  });
  const counts = {
    pending: allRows.filter((r) => r.status === "pending_approval").length,
    approved: allRows.filter((r) => r.status === "approved").length,
    applied: allRows.filter((r) => r.status === "applied").length,
    rejected: allRows.filter((r) => r.status === "rejected").length
  };
  const [open, setOpen] = reactExports.useState(false);
  const [employeeId, setEmployeeId] = reactExports.useState("");
  const [type, setType] = reactExports.useState("pay_change");
  const [effectiveDate, setEffectiveDate] = reactExports.useState((/* @__PURE__ */ new Date()).toISOString().slice(0, 10));
  const [notes, setNotes] = reactExports.useState("");
  const [proposedJson, setProposedJson] = reactExports.useState('{"base_salary": 0}');
  const [employees, setEmployees] = reactExports.useState([]);
  reactExports.useEffect(() => {
    if (!open || !tenantId) return;
    supabase.from("employees").select("id, first_name, last_name, employee_number").eq("tenant_id", tenantId).order("first_name").limit(500).then(({
      data: data2
    }) => setEmployees(data2 ?? []));
  }, [open, tenantId]);
  const create = useMutation({
    mutationFn: () => {
      let proposed = {};
      try {
        proposed = JSON.parse(proposedJson || "{}");
      } catch {
        throw new Error("Proposed changes must be valid JSON");
      }
      return createFn({
        data: {
          employee_id: employeeId,
          variation_type: type,
          effective_date: effectiveDate,
          proposed_changes: proposed,
          notes: notes || null,
          submit: true
        }
      });
    },
    onSuccess: () => {
      toast.success("Variation submitted for approval");
      setOpen(false);
      setEmployeeId("");
      setProposedJson('{"base_salary": 0}');
      setNotes("");
      qc.invalidateQueries({
        queryKey: ["variations"]
      });
    },
    onError: (e) => toast.error(e?.message ?? "Create failed")
  });
  const [rejectFor, setRejectFor] = reactExports.useState(null);
  const [rejectReason, setRejectReason] = reactExports.useState("");
  const approve = useMutation({
    mutationFn: (id) => approveFn({
      data: {
        id
      }
    }),
    onSuccess: () => {
      toast.success("Approved");
      qc.invalidateQueries({
        queryKey: ["variations"]
      });
    }
  });
  const reject = useMutation({
    mutationFn: () => rejectFn({
      data: {
        id: rejectFor,
        reason: rejectReason
      }
    }),
    onSuccess: () => {
      toast.success("Rejected");
      setRejectFor(null);
      setRejectReason("");
      qc.invalidateQueries({
        queryKey: ["variations"]
      });
    }
  });
  const apply = useMutation({
    mutationFn: (id) => applyFn({
      data: {
        id
      }
    }),
    onSuccess: () => {
      toast.success("Applied to employee record");
      qc.invalidateQueries({
        queryKey: ["variations"]
      });
    },
    onError: (e) => toast.error(e?.message ?? "Apply failed")
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(AppShell, { title: "Employment variations", subtitle: "Promotions, transfers, pay and contract changes", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 sm:grid-cols-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(StatTile, { label: "Pending approval", value: counts.pending, accent: "text-amber-600", onClick: () => setStatus("pending_approval") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(StatTile, { label: "Approved", value: counts.approved, accent: "text-emerald-600", onClick: () => setStatus("approved") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(StatTile, { label: "Applied", value: counts.applied, accent: "text-primary", onClick: () => setStatus("applied") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(StatTile, { label: "Rejected", value: counts.rejected, accent: "text-destructive", onClick: () => setStatus("rejected") })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-row items-center justify-between gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-base", children: "All variations" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: status, onValueChange: setStatus, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-44", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "draft", children: "Draft" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "pending_approval", children: "Pending approval" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "approved", children: "Approved" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "rejected", children: "Rejected" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "applied", children: "Applied" })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(AuditExportButtons, { source: "variation", scopeLabel: "all variations" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => setOpen(true), children: "New variation" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Search by employee name…", value: search, onChange: (e) => setSearch(e.target.value), className: "max-w-sm" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Loading…" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto rounded-md border", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Employee" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Type" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Effective" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Status" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Proposed" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Actions" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(TableBody, { children: [
            filteredRows.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { children: [
                r.employee?.first_name,
                " ",
                r.employee?.last_name
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-xs capitalize", children: r.variation_type.replace("_", " ") }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-xs", children: r.effective_date }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: STATUS_COLOR[r.status] ?? "outline", children: r.status.replace("_", " ") }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-xs max-w-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ProposedChips, { proposed: r.proposed_changes }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { className: "text-right space-x-1", children: [
                r.status === "pending_approval" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "default", onClick: () => approve.mutate(r.id), children: "Approve" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", onClick: () => setRejectFor(r.id), children: "Reject" })
                ] }),
                r.status === "approved" && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", onClick: () => apply.mutate(r.id), children: "Apply" })
              ] })
            ] }, r.id)),
            filteredRows.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { colSpan: 6, className: "text-center text-muted-foreground text-sm py-6", children: allRows.length === 0 ? "No variations yet." : "No matches for that search." }) })
          ] })
        ] }) }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: setOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-lg", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "New employment variation" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Employee" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: employeeId, onValueChange: setEmployeeId, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Pick employee" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: employees.map((e) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: e.id, children: [
              e.first_name,
              " ",
              e.last_name,
              " ",
              e.employee_number ? `(#${e.employee_number})` : ""
            ] }, e.id)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Type" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: type, onValueChange: (v) => setType(v), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: TYPES.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: t, className: "capitalize", children: t.replace("_", " ") }, t)) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Effective date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: effectiveDate, onChange: (e) => setEffectiveDate(e.target.value) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Proposed changes (JSON)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: proposedJson, onChange: (e) => setProposedJson(e.target.value), rows: 4, className: "font-mono text-xs" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "Allowed keys: job_title, department_id, employment_type, base_salary, hourly_rate" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: notes, onChange: (e) => setNotes(e.target.value) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => create.mutate(), disabled: !employeeId || create.isPending, children: create.isPending ? "Submitting…" : "Submit for approval" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: !!rejectFor, onOpenChange: (o) => !o && setRejectFor(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Reject variation" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { placeholder: "Reason", value: rejectReason, onChange: (e) => setRejectReason(e.target.value) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setRejectFor(null), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "destructive", onClick: () => reject.mutate(), disabled: rejectReason.length < 3, children: "Reject" })
      ] })
    ] }) })
  ] });
}
function StatTile({
  label,
  value,
  accent,
  onClick
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick, className: "rounded-lg border bg-card p-3 text-left transition hover:border-primary/40 hover:shadow-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `text-2xl font-semibold tabular-nums ${accent ?? ""}`, children: value })
  ] });
}
function ProposedChips({
  proposed
}) {
  if (!proposed || typeof proposed !== "object") {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "—" });
  }
  const entries = Object.entries(proposed).filter(([, v]) => v !== null && v !== "" && v !== void 0);
  if (entries.length === 0) return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "—" });
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1", children: entries.map(([k, v]) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "outline", className: "text-[10px] font-normal", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground mr-1", children: [
      k.replace(/_/g, " "),
      ":"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: String(v) })
  ] }, k)) });
}
export {
  Page as component
};
