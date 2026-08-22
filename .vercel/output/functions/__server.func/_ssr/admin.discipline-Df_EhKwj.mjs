import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { e as useNavigate } from "../_libs/tanstack__react-router.mjs";
import { a as useServerFn, a9 as listGrievanceAttachments, aa as recordGrievanceAttachment, ab as deleteGrievanceAttachment, ac as getAttachmentDownloadUrl, C as Card, b as CardHeader, c as CardTitle, B as Button, e as CardContent, ad as listGrievanceComments, ae as addGrievanceComment, f as Badge, T as Textarea, u as useAuth, K as listCases, af as upsertCase, ag as deleteCase, d as CardDescription, ah as listApprovals, ai as decideApproval, I as listGrievances, aj as updateGrievance, ak as assignCase, al as transitionCaseStatus, am as listHrUsers, an as requestApproval, ao as listCaseAttachments, ap as recordCaseAttachment, aq as deleteCaseAttachment, O as listActions, ar as addAction, as as deleteAction } from "./router-CLxirH5A.mjs";
import { u as useQueryClient, a as useQuery } from "../_libs/tanstack__react-query.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { A as AppShell } from "./AppShell-fbDALlr7.mjs";
import { I as Input } from "./input-C6yqZkRy.mjs";
import { L as Label } from "./label-Cbju7vgw.mjs";
import { T as Table, a as TableHeader, b as TableRow, c as TableHead, d as TableBody, e as TableCell } from "./table-DBQt_Juv.mjs";
import { D as Dialog, a as DialogContent, b as DialogHeader, c as DialogTitle, e as DialogFooter } from "./dialog-UIV2CpIo.mjs";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-Bk9id1Ls.mjs";
import { T as Tabs, a as TabsList, b as TabsTrigger, c as TabsContent } from "./tabs-CuOXr1L0.mjs";
import { s as supabase } from "./client-BLUqAwhM.mjs";
import { a as listEmployeesForAdmin } from "./timeline.functions-MTkYDU8o.mjs";
import "../_libs/seroval.mjs";
import "../_libs/lovable.dev__mcp-js.mjs";
import "../_libs/modelcontextprotocol__sdk.mjs";
import "../_libs/zod-to-json-schema.mjs";
import "../_libs/ajv-formats.mjs";
import { P as Paperclip, U as Upload, D as Download, T as Trash2, A as Gavel, ak as CircleCheck, r as ShieldAlert, aa as Plus, be as Lock, az as CircleX, ao as MessageSquare, at as Workflow, bf as UserCog } from "../_libs/lucide-react.mjs";
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
import "../_libs/radix-ui__react-tabs.mjs";
const CATEGORIES = ["verbal_warning", "written_warning", "final_warning", "suspension", "termination", "pip", "investigation", "other"];
const SEVERITIES = ["low", "medium", "high", "critical"];
const STATUSES = ["draft", "open", "investigation", "hearing_scheduled", "hearing_held", "decision_pending", "decision_issued", "appeal_open", "under_review", "appealed", "closed", "withdrawn"];
const TRANSITIONS = {
  draft: ["open", "withdrawn"],
  open: ["investigation", "hearing_scheduled", "decision_pending", "closed", "withdrawn"],
  investigation: ["hearing_scheduled", "decision_pending", "closed", "withdrawn"],
  hearing_scheduled: ["hearing_held", "investigation", "withdrawn"],
  hearing_held: ["decision_pending", "investigation"],
  decision_pending: ["decision_issued", "investigation"],
  decision_issued: ["appeal_open", "closed"],
  appeal_open: ["under_review", "closed"],
  under_review: ["closed", "appealed"],
  appealed: ["closed"],
  closed: [],
  withdrawn: []
};
const ACTION_TYPES = ["warning_issued", "hearing_scheduled", "hearing_held", "appeal_filed", "outcome_recorded", "note", "document_attached", "status_changed"];
const G_STATUSES = ["submitted", "acknowledged", "investigating", "resolved", "dismissed"];
function sevColor(s) {
  return s === "critical" ? "bg-status-stuck" : s === "high" ? "bg-status-pending" : s === "medium" ? "bg-status-working" : "bg-muted";
}
function DisciplinePage() {
  const {
    user,
    loading,
    roles
  } = useAuth();
  const navigate = useNavigate();
  reactExports.useEffect(() => {
    if (!loading && !user) navigate({
      to: "/auth"
    });
  }, [loading, user, navigate]);
  const canManage = roles.includes("manager") || roles.includes("org_admin") || roles.includes("super_admin");
  if (!canManage) return /* @__PURE__ */ jsxRuntimeExports.jsx(AppShell, { title: "Discipline & grievances", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-8 text-center text-muted-foreground", children: "You don't have access to this page." }) }) });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AppShell, { title: "Discipline & grievances", subtitle: "Manage disciplinary cases, approvals and grievances", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { defaultValue: "cases", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "cases", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Gavel, { className: "mr-2 h-4 w-4" }),
        "Cases"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "approvals", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "mr-2 h-4 w-4" }),
        "My approvals"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "grievances", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldAlert, { className: "mr-2 h-4 w-4" }),
        "Grievances"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "cases", className: "mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CasesTab, {}) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "approvals", className: "mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ApprovalsTab, {}) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "grievances", className: "mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(GrievancesTab, {}) })
  ] }) });
}
function useEmployees() {
  const fEmps = useServerFn(listEmployeesForAdmin);
  return useQuery({
    queryKey: ["disc-employees"],
    queryFn: async () => (await fEmps()).employees,
    staleTime: 5 * 6e4
  });
}
function useHrUsers() {
  const fn = useServerFn(listHrUsers);
  return useQuery({
    queryKey: ["disc-hr"],
    queryFn: () => fn()
  });
}
function CasesTab() {
  const qc = useQueryClient();
  const listFn = useServerFn(listCases);
  const saveFn = useServerFn(upsertCase);
  const delFn = useServerFn(deleteCase);
  const {
    data: empData
  } = useEmployees();
  const employees = empData ?? [];
  const {
    data
  } = useQuery({
    queryKey: ["cases"],
    queryFn: () => listFn({
      data: {}
    })
  });
  const cases = data?.cases ?? [];
  const [open, setOpen] = reactExports.useState(false);
  const [form, setForm] = reactExports.useState(null);
  const [active, setActive] = reactExports.useState(null);
  function startNew() {
    setForm({
      category: "verbal_warning",
      severity: "low",
      status: "draft",
      description: "",
      confidential: false
    });
    setOpen(true);
  }
  function startEdit(c) {
    setForm({
      ...c
    });
    setOpen(true);
  }
  async function save(e) {
    e.preventDefault();
    try {
      await saveFn({
        data: {
          ...form,
          incident_date: form.incident_date || null,
          due_date: form.due_date || null,
          appeal_deadline: form.appeal_deadline || null,
          assigned_to: form.assigned_to || null
        }
      });
      toast.success("Saved");
      setOpen(false);
      qc.invalidateQueries({
        queryKey: ["cases"]
      });
    } catch (e2) {
      toast.error(e2?.message ?? "Failed");
    }
  }
  async function remove(id) {
    if (!confirm("Delete this case and everything attached?")) return;
    try {
      await delFn({
        data: {
          id
        }
      });
      toast.success("Deleted");
      qc.invalidateQueries({
        queryKey: ["cases"]
      });
    } catch (e) {
      toast.error(e?.message ?? "Failed");
    }
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "flex flex-row items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { children: "Disciplinary cases" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardDescription, { children: [
          cases.length,
          " total · click a row to open"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: startNew, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "mr-2 h-4 w-4" }),
        "New case"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Employee" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Category" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Severity" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Status" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Due" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, {}),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TableBody, { children: [
        cases.map((c) => {
          const overdue = c.due_date && c.due_date < (/* @__PURE__ */ new Date()).toISOString().slice(0, 10) && !["closed", "withdrawn"].includes(c.status);
          return /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "cursor-pointer", onClick: () => setActive(c), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: c.employees ? `${c.employees.first_name} ${c.employees.last_name}` : "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "capitalize", children: c.category.replace(/_/g, " ") }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: `text-white ${sevColor(c.severity)}`, children: c.severity }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", className: "capitalize", children: c.status.replace(/_/g, " ") }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: overdue ? "text-status-stuck font-medium" : "", children: c.due_date ?? "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: c.confidential && /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { className: "h-3.5 w-3.5 text-muted-foreground" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { className: "text-right", onClick: (e) => e.stopPropagation(), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: () => startEdit(c), children: "Edit" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: () => remove(c.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4" }) })
            ] })
          ] }, c.id);
        }),
        cases.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { colSpan: 7, className: "text-center text-muted-foreground py-8", children: "No cases yet" }) })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: setOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-2xl", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: form?.id ? "Edit case" : "New case" }) }),
      form && /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: save, className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Employee" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.employee_id ?? "", onValueChange: (v) => setForm({
              ...form,
              employee_id: v
            }), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Choose…" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: employees.map((e) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: e.id, children: [
                e.first_name,
                " ",
                e.last_name
              ] }, e.id)) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Case number" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.case_number ?? "", onChange: (e) => setForm({
              ...form,
              case_number: e.target.value
            }), placeholder: "Auto if blank" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Category" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.category, onValueChange: (v) => setForm({
              ...form,
              category: v
            }), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: CATEGORIES.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: c, className: "capitalize", children: c.replace(/_/g, " ") }, c)) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Severity" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.severity, onValueChange: (v) => setForm({
              ...form,
              severity: v
            }), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: SEVERITIES.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: s, className: "capitalize", children: s }, s)) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Incident date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.incident_date ?? "", onChange: (e) => setForm({
              ...form,
              incident_date: e.target.value
            }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Status" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.status, onValueChange: (v) => setForm({
              ...form,
              status: v
            }), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: STATUSES.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: s, className: "capitalize", children: s.replace(/_/g, " ") }, s)) })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Description" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 4, required: true, value: form.description, onChange: (e) => setForm({
            ...form,
            description: e.target.value
          }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", checked: !!form.confidential, onChange: (e) => setForm({
            ...form,
            confidential: e.target.checked
          }) }),
          "Mark as confidential"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogFooter, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", children: "Save" }) })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: !!active, onOpenChange: (v) => !v && setActive(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-4xl max-h-[90vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Case detail" }) }),
      active && /* @__PURE__ */ jsxRuntimeExports.jsx(CaseDetail, { caseRow: active, onChange: (c) => setActive(c) })
    ] }) })
  ] });
}
function CaseDetail({
  caseRow,
  onChange
}) {
  const qc = useQueryClient();
  const assignFn = useServerFn(assignCase);
  const transitionFn = useServerFn(transitionCaseStatus);
  const {
    data: hr
  } = useHrUsers();
  const hrUsers = hr?.users ?? [];
  const [assigning, setAssigning] = reactExports.useState({
    assigned_to: caseRow.assigned_to ?? "",
    due_date: caseRow.due_date ?? "",
    appeal_deadline: caseRow.appeal_deadline ?? ""
  });
  async function saveAssign() {
    try {
      const r = await assignFn({
        data: {
          case_id: caseRow.id,
          assigned_to: assigning.assigned_to || null,
          due_date: assigning.due_date || null,
          appeal_deadline: assigning.appeal_deadline || null
        }
      });
      toast.success("Saved");
      onChange(r.case);
      qc.invalidateQueries({
        queryKey: ["cases"]
      });
    } catch (e) {
      toast.error(e?.message ?? "Failed");
    }
  }
  async function move(to) {
    try {
      const r = await transitionFn({
        data: {
          case_id: caseRow.id,
          to_status: to
        }
      });
      toast.success(`Moved to ${to.replace(/_/g, " ")}`);
      onChange(r.case);
      qc.invalidateQueries({
        queryKey: ["cases"]
      });
      qc.invalidateQueries({
        queryKey: ["case-actions", caseRow.id]
      });
    } catch (e) {
      toast.error(e?.message ?? "Failed");
    }
  }
  const allowed = TRANSITIONS[caseRow.status] ?? [];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border p-3 bg-muted/30", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "capitalize", children: caseRow.category.replace(/_/g, " ") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: `text-white ${sevColor(caseRow.severity)}`, children: caseRow.severity }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", className: "capitalize", children: caseRow.status.replace(/_/g, " ") }),
        caseRow.confidential && /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "outline", className: "text-status-stuck border-status-stuck", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { className: "mr-1 h-3 w-3" }),
          "Confidential"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm mt-2 whitespace-pre-wrap", children: caseRow.description })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "text-sm flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Workflow, { className: "h-4 w-4" }),
        "Workflow"
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "flex flex-wrap gap-2", children: [
        allowed.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-muted-foreground", children: "Case is terminal." }),
        allowed.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", onClick: () => move(s), className: "capitalize", children: s.replace(/_/g, " ") }, s))
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "text-sm flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(UserCog, { className: "h-4 w-4" }),
        "Assignment & deadlines"
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "grid grid-cols-3 gap-3 items-end", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "HR owner" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: assigning.assigned_to || "__none", onValueChange: (v) => setAssigning({
            ...assigning,
            assigned_to: v === "__none" ? "" : v
          }), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Unassigned" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none", children: "Unassigned" }),
              hrUsers.map((u) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: u.id, children: u.full_name ?? u.email }, u.id))
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Due date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: assigning.due_date, onChange: (e) => setAssigning({
            ...assigning,
            due_date: e.target.value
          }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Appeal deadline" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: assigning.appeal_deadline, onChange: (e) => setAssigning({
            ...assigning,
            appeal_deadline: e.target.value
          }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-3 text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", onClick: saveAssign, children: "Save assignment" }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(CaseApprovals, { caseRow }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(CaseAttachments, { caseRow }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(CaseTimeline, { caseRow })
  ] });
}
function CaseApprovals({
  caseRow
}) {
  const qc = useQueryClient();
  const listFn = useServerFn(listApprovals);
  const reqFn = useServerFn(requestApproval);
  const {
    data: hr
  } = useHrUsers();
  const hrUsers = hr?.users ?? [];
  const {
    data
  } = useQuery({
    queryKey: ["case-approvals", caseRow.id],
    queryFn: () => listFn({
      data: {
        case_id: caseRow.id
      }
    })
  });
  const items = data?.approvals ?? [];
  const [open, setOpen] = reactExports.useState(false);
  const [form, setForm] = reactExports.useState({
    approver_id: "",
    approver_role: "manager",
    notes: ""
  });
  async function send(e) {
    e.preventDefault();
    try {
      await reqFn({
        data: {
          case_id: caseRow.id,
          approver_id: form.approver_id,
          approver_role: form.approver_role,
          notes: form.notes || null
        }
      });
      toast.success("Approval requested");
      setOpen(false);
      setForm({
        approver_id: "",
        approver_role: "manager",
        notes: ""
      });
      qc.invalidateQueries({
        queryKey: ["case-approvals", caseRow.id]
      });
    } catch (e2) {
      toast.error(e2?.message ?? "Failed");
    }
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "pb-2 flex flex-row items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "text-sm flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-4 w-4" }),
        "Approvals"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: () => setOpen(true), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "mr-1 h-3 w-3" }),
        "Request approval"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-2", children: [
      items.map((a) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between rounded-md border p-2 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "capitalize", children: a.approver_role }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: a.approver?.full_name ?? a.approver?.email ?? "—" }),
            a.decided_at ? /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: a.decision === "approved" ? "bg-status-done text-white" : "bg-status-stuck text-white", children: a.decision }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", children: "Pending" })
          ] }),
          a.notes && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground mt-1", children: a.notes })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: new Date(a.requested_at).toLocaleDateString() })
      ] }, a.id)),
      items.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-muted-foreground text-center py-2", children: "No approvals yet" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: setOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Request approval" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: send, className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Approver" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.approver_id, onValueChange: (v) => setForm({
            ...form,
            approver_id: v
          }), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Choose…" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: hrUsers.map((u) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: u.id, children: u.full_name ?? u.email }, u.id)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Role they approve as" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.approver_role, onValueChange: (v) => setForm({
            ...form,
            approver_role: v
          }), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "manager", children: "Line manager" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "hr", children: "HR" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "legal", children: "Legal" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "org_admin", children: "Org admin" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 3, value: form.notes, onChange: (e) => setForm({
            ...form,
            notes: e.target.value
          }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogFooter, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", disabled: !form.approver_id, children: "Send" }) })
      ] })
    ] }) })
  ] });
}
function CaseAttachments({
  caseRow
}) {
  const qc = useQueryClient();
  const listFn = useServerFn(listCaseAttachments);
  const recordFn = useServerFn(recordCaseAttachment);
  const delFn = useServerFn(deleteCaseAttachment);
  const urlFn = useServerFn(getAttachmentDownloadUrl);
  const {
    data
  } = useQuery({
    queryKey: ["case-attachments", caseRow.id],
    queryFn: () => listFn({
      data: {
        case_id: caseRow.id
      }
    })
  });
  const items = data?.attachments ?? [];
  const fileRef = reactExports.useRef(null);
  const [busy, setBusy] = reactExports.useState(false);
  async function upload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 20 * 1024 * 1024) {
      toast.error("Max 20 MB");
      return;
    }
    setBusy(true);
    try {
      const path = `${caseRow.tenant_id}/${caseRow.id}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_")}`;
      const {
        error
      } = await supabase.storage.from("disciplinary-files").upload(path, file, {
        upsert: false,
        contentType: file.type
      });
      if (error) throw error;
      await recordFn({
        data: {
          case_id: caseRow.id,
          storage_path: path,
          file_name: file.name,
          mime_type: file.type || null,
          size_bytes: file.size
        }
      });
      toast.success("Uploaded");
      qc.invalidateQueries({
        queryKey: ["case-attachments", caseRow.id]
      });
      qc.invalidateQueries({
        queryKey: ["case-actions", caseRow.id]
      });
    } catch (e2) {
      toast.error(e2?.message ?? "Upload failed");
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }
  async function download(p) {
    try {
      const r = await urlFn({
        data: {
          storage_path: p
        }
      });
      window.open(r.url, "_blank");
    } catch (e) {
      toast.error(e?.message ?? "Failed");
    }
  }
  async function remove(id) {
    if (!confirm("Delete this attachment?")) return;
    try {
      await delFn({
        data: {
          id
        }
      });
      qc.invalidateQueries({
        queryKey: ["case-attachments", caseRow.id]
      });
    } catch (e) {
      toast.error(e?.message ?? "Failed");
    }
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "pb-2 flex flex-row items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "text-sm flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Paperclip, { className: "h-4 w-4" }),
        "Attachments"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { ref: fileRef, type: "file", className: "hidden", onChange: upload }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", disabled: busy, onClick: () => fileRef.current?.click(), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { className: "mr-1 h-3 w-3" }),
          busy ? "Uploading…" : "Upload file"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-1", children: [
      items.map((a) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between rounded-md border p-2 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "truncate", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Paperclip, { className: "inline h-3 w-3 mr-1" }),
          a.file_name,
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-muted-foreground ml-2", children: [
            (a.size_bytes / 1024).toFixed(0),
            " KB"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: () => download(a.storage_path), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "h-4 w-4" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: () => remove(a.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4" }) })
        ] })
      ] }, a.id)),
      items.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-muted-foreground text-center py-2", children: "No files" })
    ] })
  ] });
}
function CaseTimeline({
  caseRow
}) {
  const qc = useQueryClient();
  const listFn = useServerFn(listActions);
  const addFn = useServerFn(addAction);
  const delFn = useServerFn(deleteAction);
  const {
    data
  } = useQuery({
    queryKey: ["case-actions", caseRow.id],
    queryFn: () => listFn({
      data: {
        case_id: caseRow.id
      }
    })
  });
  const actions = data?.actions ?? [];
  const [form, setForm] = reactExports.useState({
    action_type: "note",
    notes: "",
    document_url: ""
  });
  async function submit(e) {
    e.preventDefault();
    try {
      await addFn({
        data: {
          case_id: caseRow.id,
          action_type: form.action_type,
          notes: form.notes || null,
          document_url: form.document_url || null,
          action_date: form.action_date || void 0
        }
      });
      setForm({
        action_type: "note",
        notes: "",
        document_url: ""
      });
      qc.invalidateQueries({
        queryKey: ["case-actions", caseRow.id]
      });
    } catch (e2) {
      toast.error(e2?.message ?? "Failed");
    }
  }
  async function remove(id) {
    try {
      await delFn({
        data: {
          id
        }
      });
      qc.invalidateQueries({
        queryKey: ["case-actions", caseRow.id]
      });
    } catch (e) {
      toast.error(e?.message ?? "Failed");
    }
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-sm", children: "Timeline" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: submit, className: "grid grid-cols-12 gap-2 items-end", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Type" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.action_type, onValueChange: (v) => setForm({
            ...form,
            action_type: v
          }), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: ACTION_TYPES.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: t, className: "capitalize", children: t.replace(/_/g, " ") }, t)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.action_date ?? "", onChange: (e) => setForm({
            ...form,
            action_date: e.target.value
          }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Document URL" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "url", value: form.document_url, onChange: (e) => setForm({
            ...form,
            document_url: e.target.value
          }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-12", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, value: form.notes, onChange: (e) => setForm({
            ...form,
            notes: e.target.value
          }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-12 text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "submit", size: "sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "mr-1 h-3 w-3" }),
          "Add entry"
        ] }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        actions.map((a) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between rounded-md border p-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-sm", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "capitalize", children: a.action_type.replace(/_/g, " ") }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: a.action_date })
            ] }),
            a.notes && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1 text-sm whitespace-pre-wrap", children: a.notes }),
            a.document_url && /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: a.document_url, target: "_blank", rel: "noreferrer", className: "text-xs text-primary underline mt-1 inline-block", children: "View document" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: () => remove(a.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4" }) })
        ] }, a.id)),
        actions.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-muted-foreground text-center py-2", children: "No timeline entries" })
      ] })
    ] })
  ] });
}
function ApprovalsTab() {
  const qc = useQueryClient();
  const listFn = useServerFn(listApprovals);
  const decideFn = useServerFn(decideApproval);
  const {
    data
  } = useQuery({
    queryKey: ["my-approvals"],
    queryFn: () => listFn({
      data: {
        pending_for_me: true
      }
    })
  });
  const items = data?.approvals ?? [];
  const [notes, setNotes] = reactExports.useState({});
  async function act(id, decision) {
    try {
      await decideFn({
        data: {
          approval_id: id,
          decision,
          notes: notes[id] || null
        }
      });
      toast.success(`Marked ${decision}`);
      qc.invalidateQueries({
        queryKey: ["my-approvals"]
      });
    } catch (e) {
      toast.error(e?.message ?? "Failed");
    }
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { children: "Approvals waiting for me" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardDescription, { children: [
        items.length,
        " pending"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-3", children: [
      items.map((a) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border p-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "capitalize", children: a.approver_role }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm font-medium", children: [
            "Case ",
            a.case?.case_number ?? a.case?.id?.slice(0, 8)
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", className: "capitalize", children: a.case?.category }),
          a.case?.employees && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm text-muted-foreground", children: [
            "· ",
            a.case.employees.first_name,
            " ",
            a.case.employees.last_name
          ] })
        ] }),
        a.notes && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-2", children: a.notes }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { className: "mt-2", rows: 2, placeholder: "Decision notes (optional)", value: notes[a.id] ?? "", onChange: (e) => setNotes({
          ...notes,
          [a.id]: e.target.value
        }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 flex gap-2 justify-end", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: () => act(a.id, "rejected"), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { className: "mr-1 h-4 w-4" }),
            "Reject"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => act(a.id, "approved"), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "mr-1 h-4 w-4" }),
            "Approve"
          ] })
        ] })
      ] }, a.id)),
      items.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-muted-foreground text-center py-6", children: "No approvals pending" })
    ] })
  ] });
}
function GrievancesTab() {
  const qc = useQueryClient();
  const listFn = useServerFn(listGrievances);
  const updateFn = useServerFn(updateGrievance);
  const {
    data: hr
  } = useHrUsers();
  const hrUsers = hr?.users ?? [];
  const {
    data
  } = useQuery({
    queryKey: ["grievances-all"],
    queryFn: () => listFn({
      data: {
        scope: "all"
      }
    })
  });
  const grievances = data?.grievances ?? [];
  const [active, setActive] = reactExports.useState(null);
  async function setStatus(id, status) {
    try {
      await updateFn({
        data: {
          id,
          status
        }
      });
      qc.invalidateQueries({
        queryKey: ["grievances-all"]
      });
      toast.success("Updated");
    } catch (e) {
      toast.error(e?.message ?? "Failed");
    }
  }
  async function assign(id, userId) {
    try {
      await updateFn({
        data: {
          id,
          assigned_to: userId || null
        }
      });
      qc.invalidateQueries({
        queryKey: ["grievances-all"]
      });
    } catch (e) {
      toast.error(e?.message ?? "Failed");
    }
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { children: "Grievances" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardDescription, { children: [
        grievances.length,
        " total"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Subject" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Filer" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Severity" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Assigned to" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Status" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, {})
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TableBody, { children: [
        grievances.map((g) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "cursor-pointer", onClick: () => setActive(g), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "max-w-xs truncate", children: g.subject }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: g.is_anonymous ? "Anonymous" : g.filer ? `${g.filer.first_name} ${g.filer.last_name}` : "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: `text-white ${sevColor(g.severity)}`, children: g.severity }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { onClick: (e) => e.stopPropagation(), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: g.assigned_to ?? "__none", onValueChange: (v) => assign(g.id, v === "__none" ? "" : v), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-8 w-40", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Unassigned" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none", children: "Unassigned" }),
              hrUsers.map((u) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: u.id, children: u.full_name ?? u.email }, u.id))
            ] })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { onClick: (e) => e.stopPropagation(), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: g.status, onValueChange: (v) => setStatus(g.id, v), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-8 w-36", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: G_STATUSES.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: s, className: "capitalize", children: s }, s)) })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(MessageSquare, { className: "h-4 w-4 text-muted-foreground" }) })
        ] }, g.id)),
        grievances.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { colSpan: 6, className: "text-center text-muted-foreground py-8", children: "No grievances" }) })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: !!active, onOpenChange: (v) => !v && setActive(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-3xl max-h-[85vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: active?.subject }) }),
      active && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(GrievanceThread, { grievance: active, canInternal: true }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(GrievanceAttachments, { grievance: active, canUpload: true })
      ] })
    ] }) })
  ] });
}
function GrievanceThread({
  grievance,
  canInternal
}) {
  const qc = useQueryClient();
  const listFn = useServerFn(listGrievanceComments);
  const addFn = useServerFn(addGrievanceComment);
  const {
    data
  } = useQuery({
    queryKey: ["grievance-comments", grievance.id],
    queryFn: () => listFn({
      data: {
        grievance_id: grievance.id
      }
    })
  });
  const comments = data?.comments ?? [];
  const [text, setText] = reactExports.useState("");
  const [internal, setInternal] = reactExports.useState(false);
  async function send(e) {
    e.preventDefault();
    if (!text.trim()) return;
    try {
      await addFn({
        data: {
          grievance_id: grievance.id,
          comment: text,
          is_internal: internal
        }
      });
      setText("");
      setInternal(false);
      qc.invalidateQueries({
        queryKey: ["grievance-comments", grievance.id]
      });
    } catch (e2) {
      toast.error(e2?.message ?? "Failed");
    }
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border p-3 bg-muted/30", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-xs text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "capitalize", children: grievance.category }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: `text-white ${sevColor(grievance.severity)}`, children: grievance.severity }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", className: "capitalize", children: grievance.status })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm whitespace-pre-wrap", children: grievance.description }),
      grievance.resolution && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 rounded-md bg-status-done/10 p-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-medium text-status-done", children: "Resolution" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm", children: grievance.resolution })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
      comments.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `rounded-md border p-3 ${c.is_internal ? "border-status-pending bg-status-pending/5" : ""}`, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-xs text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: c.profiles?.full_name ?? c.profiles?.email ?? "User" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: new Date(c.created_at).toLocaleString() })
        ] }),
        c.is_internal && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "mt-1 text-status-pending border-status-pending", children: "Internal" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm whitespace-pre-wrap", children: c.comment })
      ] }, c.id)),
      comments.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-muted-foreground text-center py-4", children: "No comments yet" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: send, className: "space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 3, value: text, onChange: (e) => setText(e.target.value), placeholder: "Write a comment…" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
        canInternal ? /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", checked: internal, onChange: (e) => setInternal(e.target.checked) }),
          "Internal note (HR only)"
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", {}),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", size: "sm", children: "Post" })
      ] })
    ] })
  ] });
}
function GrievanceAttachments({
  grievance,
  canUpload
}) {
  const qc = useQueryClient();
  const listFn = useServerFn(listGrievanceAttachments);
  const recordFn = useServerFn(recordGrievanceAttachment);
  const delFn = useServerFn(deleteGrievanceAttachment);
  const urlFn = useServerFn(getAttachmentDownloadUrl);
  const {
    data
  } = useQuery({
    queryKey: ["grievance-attachments", grievance.id],
    queryFn: () => listFn({
      data: {
        grievance_id: grievance.id
      }
    })
  });
  const items = data?.attachments ?? [];
  const fileRef = reactExports.useRef(null);
  const [busy, setBusy] = reactExports.useState(false);
  async function upload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 20 * 1024 * 1024) {
      toast.error("Max 20 MB");
      return;
    }
    setBusy(true);
    try {
      const path = `${grievance.tenant_id}/grievance/${grievance.id}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_")}`;
      const {
        error
      } = await supabase.storage.from("disciplinary-files").upload(path, file, {
        upsert: false,
        contentType: file.type
      });
      if (error) throw error;
      await recordFn({
        data: {
          grievance_id: grievance.id,
          storage_path: path,
          file_name: file.name,
          mime_type: file.type || null,
          size_bytes: file.size
        }
      });
      toast.success("Uploaded");
      qc.invalidateQueries({
        queryKey: ["grievance-attachments", grievance.id]
      });
    } catch (e2) {
      toast.error(e2?.message ?? "Upload failed");
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }
  async function download(p) {
    try {
      const r = await urlFn({
        data: {
          storage_path: p
        }
      });
      window.open(r.url, "_blank");
    } catch (e) {
      toast.error(e?.message ?? "Failed");
    }
  }
  async function remove(id) {
    if (!confirm("Delete this file?")) return;
    try {
      await delFn({
        data: {
          id
        }
      });
      qc.invalidateQueries({
        queryKey: ["grievance-attachments", grievance.id]
      });
    } catch (e) {
      toast.error(e?.message ?? "Failed");
    }
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "mt-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "pb-2 flex flex-row items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "text-sm flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Paperclip, { className: "h-4 w-4" }),
        "Evidence files"
      ] }),
      canUpload && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { ref: fileRef, type: "file", className: "hidden", onChange: upload }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", disabled: busy, onClick: () => fileRef.current?.click(), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { className: "mr-1 h-3 w-3" }),
          busy ? "Uploading…" : "Upload"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-1", children: [
      items.map((a) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between rounded-md border p-2 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "truncate", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Paperclip, { className: "inline h-3 w-3 mr-1" }),
          a.file_name
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: () => download(a.storage_path), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "h-4 w-4" }) }),
          canUpload && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: () => remove(a.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4" }) })
        ] })
      ] }, a.id)),
      items.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-muted-foreground text-center py-2", children: "No files" })
    ] })
  ] });
}
export {
  GrievanceAttachments,
  GrievanceThread,
  DisciplinePage as component
};
