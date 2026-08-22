import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { e as useNavigate, L as Link } from "../_libs/tanstack__react-router.mjs";
import { u as useAuth, a as useServerFn, B as Button, C as Card, b as CardHeader, c as CardTitle, d as CardDescription, e as CardContent, f as Badge, T as Textarea } from "./router-CLxirH5A.mjs";
import { s as supabase } from "./client-BLUqAwhM.mjs";
import { I as Input } from "./input-C6yqZkRy.mjs";
import { L as Label } from "./label-Cbju7vgw.mjs";
import { S as Switch } from "./switch-B3SbfIg0.mjs";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-Bk9id1Ls.mjs";
import { T as Table, a as TableHeader, b as TableRow, c as TableHead, d as TableBody, e as TableCell } from "./table-DBQt_Juv.mjs";
import { T as Tabs, a as TabsList, b as TabsTrigger, c as TabsContent } from "./tabs-CuOXr1L0.mjs";
import { D as Dialog, a as DialogContent, b as DialogHeader, c as DialogTitle, e as DialogFooter } from "./dialog-UIV2CpIo.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { u as upsertChecklist, a as getDocumentDownloadUrl, h as assignChecklist, i as updateAssignment, s as signOffAssignment, j as removeAssignment, k as reviewChecklistItem, m as upsertDefaultAssignmentRule, n as deleteDefaultAssignmentRule } from "./onboarding.functions-BzLphvXk.mjs";
import { c as createSsrRpc } from "./createSsrRpc-CRedQJGY.mjs";
import { r as requireSupabaseAuth } from "./auth-guard-CkYFJuQL.mjs";
import { c as createServerFn } from "./server-BOi2EjMN.mjs";
import "../_libs/lovable.dev__mcp-js.mjs";
import "../_libs/modelcontextprotocol__sdk.mjs";
import "../_libs/zod-to-json-schema.mjs";
import "../_libs/ajv-formats.mjs";
import "../_libs/seroval.mjs";
import { Y as TriangleAlert, ak as CircleCheck } from "../_libs/lucide-react.mjs";
import { a as objectType, z as stringType, B as enumType } from "../_libs/zod.mjs";
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
import "../_libs/radix-ui__react-tabs.mjs";
import "../_libs/radix-ui__react-roving-focus.mjs";
import "../_libs/radix-ui__react-presence.mjs";
import "../_libs/radix-ui__react-dialog.mjs";
const previewOnboardingOverdueEmail = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  audience: enumType(["employee", "manager"]).default("employee"),
  employeeId: stringType().uuid().optional(),
  checklistId: stringType().uuid().optional(),
  assignmentId: stringType().uuid().optional()
}).parse(d)).handler(createSsrRpc("e8298c3f0194ade51ced9d03ad46e58d333b22abc223b091010cdfa195147a3f"));
const sendTestOnboardingOverdueEmail = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  audience: enumType(["employee", "manager"]).default("employee"),
  employeeId: stringType().uuid().optional(),
  checklistId: stringType().uuid().optional(),
  assignmentId: stringType().uuid().optional(),
  // Optional override; defaults to resolved recipient email
  overrideEmail: stringType().email().optional()
}).parse(d)).handler(createSsrRpc("6472faeb0eae3c6157e0b651f13f4789fafaab0e752cfd5dbae20545c7796627"));
const FREQS = ["hourly", "weekly", "fortnightly", "monthly", "annually"];
function PaySetupPanel({ tenantId, tenantCurrency }) {
  const [rows, setRows] = reactExports.useState([]);
  const [drafts, setDrafts] = reactExports.useState({});
  const [savingId, setSavingId] = reactExports.useState(null);
  const [filter, setFilter] = reactExports.useState("missing");
  async function load() {
    const { data } = await supabase.from("employees").select("id,employee_number,first_name,last_name,job_title,hire_date,base_salary,hourly_rate,pay_frequency,currency_code").eq("tenant_id", tenantId).eq("status", "active").order("hire_date", { ascending: false });
    setRows(data ?? []);
  }
  reactExports.useEffect(() => {
    load();
  }, [tenantId]);
  const visible = reactExports.useMemo(() => {
    if (filter === "all") return rows;
    return rows.filter((r) => r.pay_frequency == null || r.base_salary == null && r.hourly_rate == null);
  }, [rows, filter]);
  const missingCount = rows.filter((r) => r.pay_frequency == null || r.base_salary == null && r.hourly_rate == null).length;
  function patch(id, key, value) {
    setDrafts((d) => ({ ...d, [id]: { ...d[id], [key]: value } }));
  }
  async function save(emp) {
    const d = drafts[emp.id] ?? {};
    const payload = {};
    if ("base_salary" in d) payload.base_salary = d.base_salary == null ? null : Number(d.base_salary);
    if ("hourly_rate" in d) payload.hourly_rate = d.hourly_rate == null ? null : Number(d.hourly_rate);
    if ("pay_frequency" in d) payload.pay_frequency = d.pay_frequency || null;
    if (Object.keys(payload).length === 0) return toast.info("No changes");
    setSavingId(emp.id);
    const { error } = await supabase.from("employees").update(payload).eq("id", emp.id);
    setSavingId(null);
    if (error) return toast.error(error.message);
    toast.success(`Pay set for ${emp.first_name} ${emp.last_name}`);
    setDrafts((d2) => {
      const c = { ...d2 };
      delete c[emp.id];
      return c;
    });
    load();
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "flex flex-row items-start justify-between gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { children: "Set pay for new joinees" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "Enter the hourly rate, base salary, and pay frequency for each new joinee before their first pay run." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        missingCount > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "destructive", className: "gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-3 w-3" }),
          " ",
          missingCount,
          " missing"
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "secondary", className: "gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-3 w-3" }),
          " All set"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: filter, onValueChange: (v) => setFilter(v), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-[160px]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "missing", children: "Missing pay only" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All active" })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: visible.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: filter === "missing" ? "Every active employee has pay configured. 🎉" : "No active employees." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Employee" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Hire date" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "w-[140px]", children: "Hourly rate" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "w-[140px]", children: "Base salary" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "w-[150px]", children: "Frequency" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "w-[100px]" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: visible.map((emp) => {
        const d = drafts[emp.id] ?? {};
        const cur = emp.currency_code ?? tenantCurrency;
        const hr = d.hourly_rate ?? emp.hourly_rate ?? "";
        const sal = d.base_salary ?? emp.base_salary ?? "";
        const freq = d.pay_frequency ?? emp.pay_frequency ?? "";
        const dirty = Object.keys(d).length > 0;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-medium", children: [
              emp.first_name,
              " ",
              emp.last_name
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground", children: [
              emp.employee_number,
              " · ",
              emp.job_title ?? "—"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-xs", children: emp.hire_date }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              type: "number",
              step: "0.0001",
              placeholder: cur,
              value: hr,
              onChange: (e) => patch(emp.id, "hourly_rate", e.target.value === "" ? null : Number(e.target.value))
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              type: "number",
              step: "0.01",
              placeholder: cur,
              value: sal,
              onChange: (e) => patch(emp.id, "base_salary", e.target.value === "" ? null : Number(e.target.value))
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: freq || "none", onValueChange: (v) => patch(emp.id, "pay_frequency", v === "none" ? null : v), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "none", children: "— Not set —" }),
              FREQS.map((f) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: f, children: f[0].toUpperCase() + f.slice(1) }, f))
            ] })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", disabled: !dirty || savingId === emp.id, onClick: () => save(emp), children: savingId === emp.id ? "Saving…" : "Save" }) })
        ] }, emp.id);
      }) })
    ] }) }) })
  ] });
}
function OrgOnboarding() {
  const {
    user,
    roles,
    loading
  } = useAuth();
  const navigate = useNavigate();
  const [tenantId, setTenantId] = reactExports.useState(null);
  const [tenantCurrency, setTenantCurrency] = reactExports.useState("");
  const [checklists, setChecklists] = reactExports.useState([]);
  const [emps, setEmps] = reactExports.useState([]);
  const [progress, setProgress] = reactExports.useState([]);
  const [assignments, setAssignments] = reactExports.useState([]);
  const [docs, setDocs] = reactExports.useState([]);
  const [departments, setDepartments] = reactExports.useState([]);
  const [rules, setRules] = reactExports.useState([]);
  const [busy, setBusy] = reactExports.useState(false);
  const [editOpen, setEditOpen] = reactExports.useState(false);
  const [editing, setEditing] = reactExports.useState(null);
  const [draftName, setDraftName] = reactExports.useState("");
  const [draftDefault, setDraftDefault] = reactExports.useState(false);
  const [draftStages, setDraftStages] = reactExports.useState([]);
  const [draftItems, setDraftItems] = reactExports.useState([]);
  const [assignOpen, setAssignOpen] = reactExports.useState(false);
  const [assignEmp, setAssignEmp] = reactExports.useState("");
  const [assignChecklistId, setAssignChecklistId] = reactExports.useState("");
  const [assignDue, setAssignDue] = reactExports.useState("");
  const [assignNotes, setAssignNotes] = reactExports.useState("");
  const [detailOpen, setDetailOpen] = reactExports.useState(false);
  const [detailAssignment, setDetailAssignment] = reactExports.useState(null);
  const [signOffNotes, setSignOffNotes] = reactExports.useState("");
  const [ruleOpen, setRuleOpen] = reactExports.useState(false);
  const [ruleEditing, setRuleEditing] = reactExports.useState(null);
  const [ruleChecklistId, setRuleChecklistId] = reactExports.useState("");
  const [ruleDeptId, setRuleDeptId] = reactExports.useState("any");
  const [ruleJobTitle, setRuleJobTitle] = reactExports.useState("");
  const [ruleOffset, setRuleOffset] = reactExports.useState(30);
  const [ruleActive, setRuleActive] = reactExports.useState(true);
  const fnUpsert = useServerFn(upsertChecklist);
  const fnDownload = useServerFn(getDocumentDownloadUrl);
  const fnAssign = useServerFn(assignChecklist);
  const fnUpdate = useServerFn(updateAssignment);
  const fnSignOff = useServerFn(signOffAssignment);
  const fnRemove = useServerFn(removeAssignment);
  const fnReview = useServerFn(reviewChecklistItem);
  const fnUpsertRule = useServerFn(upsertDefaultAssignmentRule);
  const fnDeleteRule = useServerFn(deleteDefaultAssignmentRule);
  const canAccess = roles.includes("org_admin") || roles.includes("super_admin") || roles.includes("manager");
  const isAdmin = roles.includes("org_admin") || roles.includes("super_admin");
  reactExports.useEffect(() => {
    if (!loading && !user) navigate({
      to: "/auth"
    });
  }, [loading, user, navigate]);
  reactExports.useEffect(() => {
    if (!user) return;
    (async () => {
      const {
        data
      } = await supabase.from("profiles").select("tenant_id").eq("id", user.id).maybeSingle();
      if (data?.tenant_id) {
        setTenantId(data.tenant_id);
        const {
          data: t
        } = await supabase.from("tenants").select("currency_code").eq("id", data.tenant_id).maybeSingle();
        if (t?.currency_code) setTenantCurrency(t.currency_code);
      }
    })();
  }, [user]);
  async function load() {
    if (!tenantId) return;
    const [cRes, eRes, pRes, aRes, dRes, depRes, rRes] = await Promise.all([supabase.from("onboarding_checklists").select("*").eq("tenant_id", tenantId), supabase.from("employees").select("id,first_name,last_name,employee_number,hire_date,department_id,job_title").eq("tenant_id", tenantId).eq("status", "active"), supabase.from("onboarding_progress").select("id,employee_id,checklist_id,item_key,approval_status,approval_notes,completed_at").eq("tenant_id", tenantId), supabase.from("onboarding_assignments").select("*").eq("tenant_id", tenantId).order("assigned_at", {
      ascending: false
    }), supabase.from("employee_documents").select("id,employee_id,file_name,doc_type,visibility,created_at").eq("tenant_id", tenantId).order("created_at", {
      ascending: false
    }), supabase.from("departments").select("id,name").eq("tenant_id", tenantId).order("name"), supabase.from("onboarding_default_assignments").select("*").eq("tenant_id", tenantId).order("created_at", {
      ascending: false
    })]);
    setChecklists(cRes.data ?? []);
    setEmps(eRes.data ?? []);
    setProgress(pRes.data ?? []);
    setAssignments(aRes.data ?? []);
    setDocs(dRes.data ?? []);
    setDepartments(depRes.data ?? []);
    setRules(rRes.data ?? []);
  }
  reactExports.useEffect(() => {
    load();
  }, [tenantId]);
  function startNew() {
    setEditing(null);
    setDraftName("");
    setDraftDefault(false);
    setDraftStages([]);
    setDraftItems([{
      key: "step1",
      label: "Sign contract",
      required: true
    }]);
    setEditOpen(true);
  }
  function startEdit(cl) {
    setEditing(cl);
    setDraftName(cl.name);
    setDraftDefault(cl.is_default);
    setDraftStages((cl.stages ?? []).map((s) => ({
      ...s
    })));
    setDraftItems(cl.items.map((i) => ({
      ...i
    })));
    setEditOpen(true);
  }
  async function saveChecklist() {
    setBusy(true);
    try {
      await fnUpsert({
        data: {
          id: editing?.id,
          name: draftName,
          isDefault: draftDefault,
          stages: draftStages,
          items: draftItems
        }
      });
      toast.success("Saved");
      setEditOpen(false);
      await load();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  }
  function startNewRule() {
    setRuleEditing(null);
    setRuleChecklistId(checklists[0]?.id ?? "");
    setRuleDeptId("any");
    setRuleJobTitle("");
    setRuleOffset(30);
    setRuleActive(true);
    setRuleOpen(true);
  }
  function startEditRule(r) {
    setRuleEditing(r);
    setRuleChecklistId(r.checklist_id);
    setRuleDeptId(r.department_id ?? "any");
    setRuleJobTitle(r.job_title ?? "");
    setRuleOffset(r.due_offset_days);
    setRuleActive(r.is_active);
    setRuleOpen(true);
  }
  async function saveRule() {
    if (!ruleChecklistId) {
      toast.error("Pick a checklist");
      return;
    }
    setBusy(true);
    try {
      await fnUpsertRule({
        data: {
          id: ruleEditing?.id,
          checklistId: ruleChecklistId,
          departmentId: ruleDeptId === "any" ? null : ruleDeptId,
          jobTitle: ruleJobTitle.trim() || null,
          dueOffsetDays: ruleOffset,
          isActive: ruleActive
        }
      });
      toast.success("Saved");
      setRuleOpen(false);
      await load();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  }
  async function removeRule(id) {
    if (!confirm("Delete this default-assignment rule?")) return;
    setBusy(true);
    try {
      await fnDeleteRule({
        data: {
          id
        }
      });
      toast.success("Deleted");
      await load();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  }
  function startAssign(empId) {
    setAssignEmp(empId ?? "");
    setAssignChecklistId("");
    setAssignDue("");
    setAssignNotes("");
    setAssignOpen(true);
  }
  async function doAssign() {
    if (!assignEmp || !assignChecklistId) {
      toast.error("Pick an employee and a checklist");
      return;
    }
    setBusy(true);
    try {
      await fnAssign({
        data: {
          employeeId: assignEmp,
          checklistId: assignChecklistId,
          dueDate: assignDue || void 0,
          notes: assignNotes || void 0
        }
      });
      toast.success("Assigned");
      setAssignOpen(false);
      await load();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  }
  function openDetail(a) {
    setDetailAssignment(a);
    setSignOffNotes(a.notes ?? "");
    setDetailOpen(true);
  }
  async function doSignOff() {
    if (!detailAssignment) return;
    setBusy(true);
    try {
      await fnSignOff({
        data: {
          assignmentId: detailAssignment.id,
          notes: signOffNotes || void 0
        }
      });
      toast.success("Signed off");
      setDetailOpen(false);
      await load();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  }
  async function doSetStatus(status) {
    if (!detailAssignment) return;
    setBusy(true);
    try {
      await fnUpdate({
        data: {
          assignmentId: detailAssignment.id,
          status
        }
      });
      toast.success("Updated");
      setDetailOpen(false);
      await load();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  }
  async function doRemove() {
    if (!detailAssignment) return;
    if (!confirm("Remove this assignment? Progress entries remain.")) return;
    setBusy(true);
    try {
      await fnRemove({
        data: {
          assignmentId: detailAssignment.id
        }
      });
      toast.success("Removed");
      setDetailOpen(false);
      await load();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  }
  async function review(progressId, decision) {
    setBusy(true);
    try {
      const notes = decision === "rejected" ? prompt("Reason for rejection?") || void 0 : void 0;
      await fnReview({
        data: {
          progressId,
          decision,
          notes
        }
      });
      toast.success(decision === "approved" ? "Approved" : "Rejected");
      await load();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  }
  async function downloadDoc(id) {
    try {
      const {
        url,
        fileName
      } = await fnDownload({
        data: {
          documentId: id
        }
      });
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      a.target = "_blank";
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (e) {
      toast.error(e.message);
    }
  }
  const progressByAssignment = reactExports.useMemo(() => {
    const m = {};
    progress.forEach((p) => {
      (m[`${p.employee_id}:${p.checklist_id}`] ??= []).push(p);
    });
    return m;
  }, [progress]);
  function assignmentStats(a) {
    const cl = checklists.find((c) => c.id === a.checklist_id);
    const total = cl?.items.length ?? 0;
    const keys = new Set((progressByAssignment[`${a.employee_id}:${a.checklist_id}`] ?? []).map((p) => p.item_key));
    const done = cl ? cl.items.filter((it) => keys.has(it.key)).length : 0;
    return {
      done,
      total,
      pct: total > 0 ? Math.round(done / total * 100) : 0
    };
  }
  const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  const detailChecklist = reactExports.useMemo(() => detailAssignment ? checklists.find((c) => c.id === detailAssignment.checklist_id) : null, [detailAssignment, checklists]);
  const detailProgress = reactExports.useMemo(() => detailAssignment ? progressByAssignment[`${detailAssignment.employee_id}:${detailAssignment.checklist_id}`] ?? [] : [], [detailAssignment, progressByAssignment]);
  const detailEmp = reactExports.useMemo(() => detailAssignment ? emps.find((e) => e.id === detailAssignment.employee_id) : null, [detailAssignment, emps]);
  if (loading || !user) return /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "flex min-h-screen items-center justify-center text-muted-foreground", children: "Loading…" });
  if (!canAccess) return /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "flex min-h-screen items-center justify-center text-muted-foreground", children: "Forbidden." });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "min-h-screen bg-background", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("header", { className: "border-b border-border bg-card", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto flex max-w-6xl items-center justify-between px-6 py-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-xl font-semibold", children: "Onboarding" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Assignments, checklist templates, document review." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/org", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", size: "sm", children: "Back" }) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "mx-auto max-w-6xl px-6 py-8 space-y-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { defaultValue: "overview", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "overview", children: "Overview" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "pay-setup", children: "Pay setup" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "assignments", children: "Assignments" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "progress", children: "Per-employee" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "checklists", children: "Checklists" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "defaults", children: "Defaults" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "documents", children: "Documents" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "reminders", children: "Reminders" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "overview", children: /* @__PURE__ */ jsxRuntimeExports.jsx(OverviewPanel, { assignments, checklists, emps, progress, today, assignmentStats }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "pay-setup", children: tenantId ? /* @__PURE__ */ jsxRuntimeExports.jsx(PaySetupPanel, { tenantId, tenantCurrency }) : null }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "assignments", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "flex flex-row items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-base", children: "New-hire assignments" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "Default checklists are auto-assigned when an employee is created." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", onClick: () => startAssign(), children: "Assign checklist" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Employee" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Checklist" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Progress" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Due" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Status" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, {})
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(TableBody, { children: [
            assignments.map((a) => {
              const e = emps.find((x) => x.id === a.employee_id);
              const cl = checklists.find((c) => c.id === a.checklist_id);
              const {
                done,
                total,
                pct
              } = assignmentStats(a);
              const overdue = a.due_date && a.due_date < today && a.status !== "signed_off";
              return /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium", children: e ? `${e.first_name} ${e.last_name}` : a.employee_id.slice(0, 8) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: e?.employee_number })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: cl?.name ?? "—" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-2 w-24 rounded bg-muted overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full bg-primary", style: {
                    width: `${pct}%`
                  } }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs", children: [
                    done,
                    "/",
                    total
                  ] })
                ] }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { className: overdue ? "text-destructive text-sm" : "text-sm", children: [
                  a.due_date ?? "—",
                  overdue && " (overdue)"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: a.status === "signed_off" ? /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { children: "Signed off" }) : a.status === "completed" ? /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", children: "Completed" }) : a.status === "cancelled" ? /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", children: "Cancelled" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", children: "In progress" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", onClick: () => openDetail(a), children: "Open" }) })
              ] }, a.id);
            }),
            assignments.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { colSpan: 6, className: "text-center text-muted-foreground", children: "No assignments yet." }) })
          ] })
        ] }) })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "progress", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-base", children: "Per-employee summary" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Employee" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Hire date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Assignments" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Aggregate" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, {})
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(TableBody, { children: [
            emps.map((e) => {
              const empAsg = assignments.filter((a) => a.employee_id === e.id);
              const totals = empAsg.reduce((acc, a) => {
                const s = assignmentStats(a);
                return {
                  done: acc.done + s.done,
                  total: acc.total + s.total
                };
              }, {
                done: 0,
                total: 0
              });
              const pct = totals.total ? Math.round(totals.done / totals.total * 100) : 0;
              return /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-medium", children: [
                    e.first_name,
                    " ",
                    e.last_name
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: e.employee_number })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: e.hire_date }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-sm", children: empAsg.length }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-2 w-32 rounded bg-muted overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full bg-primary", style: {
                    width: `${pct}%`
                  } }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs", children: [
                    totals.done,
                    "/",
                    totals.total
                  ] })
                ] }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", onClick: () => startAssign(e.id), children: "Assign…" }) })
              ] }, e.id);
            }),
            emps.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { colSpan: 5, className: "text-center text-muted-foreground", children: "No active employees." }) })
          ] })
        ] }) })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "checklists", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "flex flex-row items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-base", children: "Checklist templates" }),
          isAdmin && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", onClick: startNew, children: "New checklist" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-3", children: [
          checklists.map((cl) => {
            const stages = (cl.stages ?? []).slice().sort((a, b) => a.order - b.order);
            const grouped = {};
            cl.items.forEach((it) => {
              const k = it.stage || "_unstaged";
              (grouped[k] ??= []).push(it);
            });
            const groupKeys = stages.length ? [...stages.map((s) => s.key), ...Object.keys(grouped).filter((k) => k === "_unstaged" || !stages.some((s) => s.key === k))] : Object.keys(grouped);
            return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border p-3 flex items-start justify-between gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-medium", children: [
                  cl.name,
                  " ",
                  cl.is_default && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "ml-2 text-xs", children: "Default" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground", children: [
                  cl.items.length,
                  " items · ",
                  stages.length,
                  " stages"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 space-y-2", children: groupKeys.map((gk) => {
                  const items = grouped[gk] ?? [];
                  if (!items.length) return null;
                  const label = gk === "_unstaged" ? "Unassigned" : stages.find((s) => s.key === gk)?.label ?? gk;
                  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-medium uppercase tracking-wide text-muted-foreground", children: label }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "text-sm list-disc pl-5", children: items.map((i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
                      i.label,
                      " ",
                      i.required && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: "(required)" })
                    ] }, i.key)) })
                  ] }, gk);
                }) })
              ] }),
              isAdmin && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", onClick: () => startEdit(cl), children: "Edit" })
            ] }, cl.id);
          }),
          checklists.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "No checklists yet." })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "defaults", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "flex flex-row items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-base", children: "Default assignment rules" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "Auto-assign checklists to new hires by department or job title. Leave both blank to apply to all new employees." })
          ] }),
          isAdmin && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", onClick: startNewRule, disabled: !checklists.length, children: "New rule" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Checklist" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Department" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Job title" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Due in" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Status" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, {})
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(TableBody, { children: [
            rules.map((r) => {
              const cl = checklists.find((c) => c.id === r.checklist_id);
              const dep = r.department_id ? departments.find((d) => d.id === r.department_id) : null;
              return /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-medium", children: cl?.name ?? r.checklist_id.slice(0, 8) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: dep?.name ?? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Any" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: r.job_title ?? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Any" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { className: "text-sm", children: [
                  r.due_offset_days,
                  " days after hire"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: r.is_active ? /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { children: "Active" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", children: "Inactive" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right", children: isAdmin && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", onClick: () => startEditRule(r), children: "Edit" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", className: "ml-1", onClick: () => removeRule(r.id), children: "Delete" })
                ] }) })
              ] }, r.id);
            }),
            rules.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { colSpan: 6, className: "text-center text-muted-foreground", children: 'No rules configured. New hires will use checklists marked "Default for new hires".' }) })
          ] })
        ] }) })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "documents", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-base", children: "All employee documents" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Employee" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "File" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Type" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Visibility" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Uploaded" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, {})
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(TableBody, { children: [
            docs.map((d) => {
              const e = emps.find((x) => x.id === d.employee_id);
              return /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: e ? `${e.first_name} ${e.last_name}` : d.employee_id }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-medium", children: d.file_name }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: d.doc_type }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", children: d.visibility }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-xs text-muted-foreground", children: new Date(d.created_at).toLocaleDateString() }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", onClick: () => downloadDoc(d.id), children: "Download" }) })
              ] }, d.id);
            }),
            docs.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { colSpan: 6, className: "text-center text-muted-foreground", children: "No documents." }) })
          ] })
        ] }) })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "reminders", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ReminderPreviewPanel, { emps, checklists, assignments }) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: editOpen, onOpenChange: setEditOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-2xl max-h-[85vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editing ? "Edit checklist" : "New checklist" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Name" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: draftName, onChange: (e) => setDraftName(e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { checked: draftDefault, onCheckedChange: setDraftDefault }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Default for new hires (legacy fallback)" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Stages (optional)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mb-1", children: "Group items into phases like pre-boarding, day 1, week 1, first month." }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            draftStages.map((s, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: s.key, onChange: (e) => {
                const arr = [...draftStages];
                arr[idx].key = e.target.value;
                setDraftStages(arr);
              }, className: "w-32", placeholder: "key" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: s.label, onChange: (e) => {
                const arr = [...draftStages];
                arr[idx].label = e.target.value;
                setDraftStages(arr);
              }, placeholder: "Label" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: s.order, onChange: (e) => {
                const arr = [...draftStages];
                arr[idx].order = Number(e.target.value) || 0;
                setDraftStages(arr);
              }, className: "w-20", placeholder: "order" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", onClick: () => setDraftStages(draftStages.filter((_, i) => i !== idx)), children: "×" })
            ] }, idx)),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", onClick: () => setDraftStages([...draftStages, {
              key: `stage${draftStages.length + 1}`,
              label: "",
              order: draftStages.length
            }]), children: "Add stage" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Items" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            draftItems.map((it, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: it.key, onChange: (e) => {
                const arr = [...draftItems];
                arr[idx].key = e.target.value;
                setDraftItems(arr);
              }, className: "w-32", placeholder: "key" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: it.label, onChange: (e) => {
                const arr = [...draftItems];
                arr[idx].label = e.target.value;
                setDraftItems(arr);
              }, className: "flex-1 min-w-[160px]", placeholder: "Label" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: it.stage ?? "_none", onValueChange: (v) => {
                const arr = [...draftItems];
                arr[idx].stage = v === "_none" ? null : v;
                setDraftItems(arr);
              }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-36", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Stage" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "_none", children: "No stage" }),
                  draftStages.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: s.key, children: s.label || s.key }, s.key))
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-1 text-xs", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", checked: it.required, onChange: (e) => {
                  const arr = [...draftItems];
                  arr[idx].required = e.target.checked;
                  setDraftItems(arr);
                } }),
                "Required"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", onClick: () => setDraftItems(draftItems.filter((_, i) => i !== idx)), children: "×" })
            ] }, idx)),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", onClick: () => setDraftItems([...draftItems, {
              key: `step${draftItems.length + 1}`,
              label: "",
              required: true
            }]), children: "Add item" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogFooter, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: saveChecklist, disabled: busy || !draftName.trim(), children: "Save" }) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: ruleOpen, onOpenChange: setRuleOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: ruleEditing ? "Edit rule" : "New default-assignment rule" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Checklist" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: ruleChecklistId, onValueChange: setRuleChecklistId, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select checklist" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: checklists.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: c.id, children: c.name }, c.id)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Department (optional)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: ruleDeptId, onValueChange: setRuleDeptId, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "any", children: "Any department" }),
              departments.map((d) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: d.id, children: d.name }, d.id))
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Job title (optional, exact match)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: ruleJobTitle, onChange: (e) => setRuleJobTitle(e.target.value), placeholder: "e.g. Software Engineer" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Due in (days after hire)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: 0, value: ruleOffset, onChange: (e) => setRuleOffset(Number(e.target.value) || 0) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { checked: ruleActive, onCheckedChange: setRuleActive }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Active" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogFooter, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: saveRule, disabled: busy, children: "Save" }) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: assignOpen, onOpenChange: setAssignOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Assign checklist" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Employee" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: assignEmp, onValueChange: setAssignEmp, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select employee" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: emps.map((e) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: e.id, children: [
              e.first_name,
              " ",
              e.last_name,
              " · ",
              e.employee_number
            ] }, e.id)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Checklist" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: assignChecklistId, onValueChange: setAssignChecklistId, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select checklist" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: checklists.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: c.id, children: [
              c.name,
              c.is_default ? " (default)" : ""
            ] }, c.id)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Due date (optional)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: assignDue, onChange: (e) => setAssignDue(e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes (optional)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, value: assignNotes, onChange: (e) => setAssignNotes(e.target.value) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogFooter, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: doAssign, disabled: busy, children: "Assign" }) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: detailOpen, onOpenChange: setDetailOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-2xl max-h-[85vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
        detailEmp ? `${detailEmp.first_name} ${detailEmp.last_name}` : "Assignment",
        " — ",
        detailChecklist?.name
      ] }) }),
      detailAssignment && detailChecklist && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm text-muted-foreground", children: [
          detailAssignment.due_date ? `Due ${detailAssignment.due_date}` : "No due date",
          " ·",
          " ",
          "Status: ",
          detailAssignment.status.replace("_", " "),
          detailAssignment.signed_off_at && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            " · Signed off ",
            new Date(detailAssignment.signed_off_at).toLocaleDateString()
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2 border-t pt-3", children: detailChecklist.items.map((it) => {
          const pr = detailProgress.find((p) => p.item_key === it.key);
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-3 rounded-md border p-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: pr ? "secondary" : "outline", className: "text-xs", children: pr ? "Done" : "Pending" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm", children: it.label }),
                it.required && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "text-xs", children: "Required" }),
                pr?.approval_status === "approved" && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "text-xs", children: "Approved" }),
                pr?.approval_status === "rejected" && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "destructive", className: "text-xs", children: "Rejected" })
              ] }),
              pr?.approval_notes && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground mt-1", children: [
                "Note: ",
                pr.approval_notes
              ] })
            ] }),
            pr && pr.approval_status === "pending" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", onClick: () => review(pr.id, "approved"), children: "Approve" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", onClick: () => review(pr.id, "rejected"), children: "Reject" })
            ] })
          ] }, it.key);
        }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t pt-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Sign-off / notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, value: signOffNotes, onChange: (e) => setSignOffNotes(e.target.value) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { className: "flex flex-wrap gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: doRemove, disabled: busy, children: "Remove" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => doSetStatus("cancelled"), disabled: busy, children: "Cancel assignment" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => doSetStatus("in_progress"), disabled: busy, children: "Reopen" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: doSignOff, disabled: busy, children: "Sign off" })
      ] })
    ] }) })
  ] });
}
function OverviewPanel({
  assignments,
  checklists,
  emps,
  progress,
  today,
  assignmentStats
}) {
  const active = assignments.filter((a) => a.status === "in_progress" || a.status === "completed");
  const overdue = active.filter((a) => a.due_date && a.due_date < today && a.status !== "signed_off");
  const monthStart = /* @__PURE__ */ new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);
  const signedOffMonth = assignments.filter((a) => a.status === "signed_off" && a.signed_off_at && new Date(a.signed_off_at) >= monthStart);
  const avgPct = active.length === 0 ? 0 : Math.round(active.reduce((s, a) => s + assignmentStats(a).pct, 0) / active.length);
  const pendingReviews = progress.filter((p) => p.approval_status === "pending").length;
  const cutoff = /* @__PURE__ */ new Date();
  cutoff.setDate(cutoff.getDate() - 30);
  const cutoffStr = cutoff.toISOString().slice(0, 10);
  const empsWithAssignments = new Set(assignments.map((a) => a.employee_id));
  const newHiresMissing = emps.filter((e) => e.hire_date >= cutoffStr && !empsWithAssignments.has(e.id));
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3 md:grid-cols-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { label: "Active", value: active.length }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { label: "Overdue", value: overdue.length, tone: overdue.length > 0 ? "destructive" : void 0 }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { label: "Signed off this month", value: signedOffMonth.length }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { label: "Avg progress", value: `${avgPct}%` }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { label: "Pending reviews", value: pendingReviews, tone: pendingReviews > 0 ? "warning" : void 0 })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-base", children: "Overdue assignments" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "Past their due date and not yet signed off." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: overdue.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "No overdue assignments. 🎉" }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Employee" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Checklist" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Due" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Progress" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: overdue.slice(0, 10).map((a) => {
          const e = emps.find((x) => x.id === a.employee_id);
          const cl = checklists.find((c) => c.id === a.checklist_id);
          const {
            done,
            total,
            pct
          } = assignmentStats(a);
          return /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: e ? `${e.first_name} ${e.last_name}` : a.employee_id.slice(0, 8) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: cl?.name ?? "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-destructive text-sm", children: a.due_date }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-2 w-24 rounded bg-muted overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full bg-primary", style: {
                width: `${pct}%`
              } }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs", children: [
                done,
                "/",
                total
              ] })
            ] }) })
          ] }, a.id);
        }) })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-base", children: "New hires without onboarding" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "Hired in the last 30 days with no checklist assigned." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: newHiresMissing.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "All recent hires have onboarding assignments." }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Employee" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Hire date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Title" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: newHiresMissing.slice(0, 10).map((e) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { children: [
            e.first_name,
            " ",
            e.last_name,
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-muted-foreground", children: [
              "(",
              e.employee_number,
              ")"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-sm", children: e.hire_date }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-sm text-muted-foreground", children: e.job_title ?? "—" })
        ] }, e.id)) })
      ] }) })
    ] })
  ] });
}
function Stat({
  label,
  value,
  tone
}) {
  const cls = tone === "destructive" ? "text-destructive" : tone === "warning" ? "text-amber-600 dark:text-amber-400" : "";
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "pt-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs uppercase tracking-wide text-muted-foreground", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `mt-1 text-2xl font-semibold ${cls}`, children: value })
  ] }) });
}
function ReminderPreviewPanel({
  emps,
  checklists,
  assignments
}) {
  const fnPreview = useServerFn(previewOnboardingOverdueEmail);
  const fnSendTest = useServerFn(sendTestOnboardingOverdueEmail);
  const [audience, setAudience] = reactExports.useState("employee");
  const [empId, setEmpId] = reactExports.useState("");
  const [checklistId, setChecklistId] = reactExports.useState("");
  const [overrideEmail, setOverrideEmail] = reactExports.useState("");
  const [html, setHtml] = reactExports.useState("");
  const [subject, setSubject] = reactExports.useState("");
  const [loading, setLoading] = reactExports.useState(false);
  const [sending, setSending] = reactExports.useState(false);
  const matchedAssignment = reactExports.useMemo(() => {
    if (!empId || !checklistId) return null;
    return assignments.find((a) => a.employee_id === empId && a.checklist_id === checklistId) ?? null;
  }, [empId, checklistId, assignments]);
  async function loadPreview() {
    setLoading(true);
    try {
      const res = await fnPreview({
        data: {
          audience,
          employeeId: empId || void 0,
          checklistId: checklistId || void 0,
          assignmentId: matchedAssignment?.id
        }
      });
      setHtml(res.html);
      setSubject(res.subject);
    } catch (e) {
      toast.error(e?.message ?? "Failed to render preview");
    } finally {
      setLoading(false);
    }
  }
  async function sendTest() {
    setSending(true);
    try {
      const res = await fnSendTest({
        data: {
          audience,
          employeeId: empId || void 0,
          checklistId: checklistId || void 0,
          assignmentId: matchedAssignment?.id,
          overrideEmail: overrideEmail.trim() || void 0
        }
      });
      toast.success(`Test email queued to ${res.recipientEmail}`);
    } catch (e) {
      toast.error(e?.message ?? "Failed to send test email");
    } finally {
      setSending(false);
    }
  }
  reactExports.useEffect(() => {
    if (empId && checklistId) {
      loadPreview();
    } else {
      setHtml("");
      setSubject("");
    }
  }, [audience, empId, checklistId, matchedAssignment?.id]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-base", children: "Overdue onboarding reminder" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "Preview the email recipients receive when an onboarding checklist is past its due date, and send a one-off test for a selected employee and checklist." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 md:grid-cols-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Audience" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: audience, onValueChange: (v) => setAudience(v), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "employee", children: "Employee" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "manager", children: "Manager" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Employee" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: empId, onValueChange: setEmpId, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select…" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: emps.map((e) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: e.id, children: [
              e.first_name,
              " ",
              e.last_name,
              " (",
              e.employee_number,
              ")"
            ] }, e.id)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Checklist" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: checklistId, onValueChange: setChecklistId, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select…" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: checklists.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: c.id, children: c.name }, c.id)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Send test to (optional)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "email", placeholder: "override@example.com", value: overrideEmail, onChange: (e) => setOverrideEmail(e.target.value) })
        ] })
      ] }),
      matchedAssignment && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground", children: [
        "Using existing assignment due ",
        matchedAssignment.due_date ?? "—",
        " (status ",
        matchedAssignment.status,
        ")."
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: loadPreview, disabled: loading || !empId || !checklistId, children: loading ? "Rendering…" : "Refresh preview" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: sendTest, disabled: sending || !empId || !checklistId, children: sending ? "Sending…" : "Send test email" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-b px-3 py-2 text-xs text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-foreground", children: "Subject:" }),
          " ",
          subject || "—"
        ] }),
        html ? /* @__PURE__ */ jsxRuntimeExports.jsx("iframe", { title: "Onboarding overdue email preview", srcDoc: html, className: "h-[520px] w-full rounded-b-md bg-white", sandbox: "" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-8 text-center text-sm text-muted-foreground", children: "Select an employee and checklist to render the preview." })
      ] })
    ] })
  ] });
}
export {
  OrgOnboarding as component
};
