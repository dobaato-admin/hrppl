import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { e as useNavigate, L as Link } from "../_libs/tanstack__react-router.mjs";
import { u as useAuth, a as useServerFn, C as Card, b as CardHeader, c as CardTitle, d as CardDescription, e as CardContent, B as Button, f as Badge, T as Textarea } from "./router-CLxirH5A.mjs";
import { s as supabase } from "./client-BLUqAwhM.mjs";
import { I as Input } from "./input-C6yqZkRy.mjs";
import { L as Label } from "./label-Cbju7vgw.mjs";
import { D as Dialog, a as DialogContent, b as DialogHeader, c as DialogTitle, d as DialogDescription, e as DialogFooter } from "./dialog-UIV2CpIo.mjs";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-Bk9id1Ls.mjs";
import { T as Table, a as TableHeader, b as TableRow, c as TableHead, d as TableBody, e as TableCell } from "./table-DBQt_Juv.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { a as useQuery } from "../_libs/tanstack__react-query.mjs";
import { b as applyDefaultAssignmentsForEmployee } from "./onboarding.functions-BzLphvXk.mjs";
import { l as listOnboardingTemplates, a as applyOnboardingTemplate } from "./templates.functions-CYMZ6YqU.mjs";
import { q as getEmployeeTimeline } from "./hr-extras.functions-B-3939sh.mjs";
import { c as createSsrRpc } from "./createSsrRpc-CRedQJGY.mjs";
import { r as requireSupabaseAuth } from "./auth-guard-CkYFJuQL.mjs";
import { c as createServerFn } from "./server-BOi2EjMN.mjs";
import { t as toCSV, d as downloadCSV, p as parseCSV } from "./csv-DKLhQUpn.mjs";
import { c as can } from "./rbac-BWg_Nf1T.mjs";
import "../_libs/lovable.dev__mcp-js.mjs";
import "../_libs/modelcontextprotocol__sdk.mjs";
import "../_libs/zod-to-json-schema.mjs";
import "../_libs/ajv-formats.mjs";
import "../_libs/seroval.mjs";
import { U as Upload, r as ShieldAlert, q as FileText, k as Clock, h as ShieldCheck, aP as FileSpreadsheet, D as Download, a as UserPlus, z as TrendingUp, g as DollarSign, u as Briefcase } from "../_libs/lucide-react.mjs";
import { a as objectType, z as stringType, D as arrayType, J as unknownType } from "../_libs/zod.mjs";
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
import "../_libs/radix-ui__react-dialog.mjs";
import "../_libs/radix-ui__primitive.mjs";
import "../_libs/radix-ui__react-context.mjs";
import "../_libs/radix-ui__react-id.mjs";
import "../_libs/@radix-ui/react-use-layout-effect+[...].mjs";
import "../_libs/@radix-ui/react-use-controllable-state+[...].mjs";
import "../_libs/@radix-ui/react-dismissable-layer+[...].mjs";
import "../_libs/@radix-ui/react-use-callback-ref+[...].mjs";
import "../_libs/@radix-ui/react-use-escape-keydown+[...].mjs";
import "../_libs/radix-ui__react-focus-scope.mjs";
import "../_libs/radix-ui__react-portal.mjs";
import "../_libs/radix-ui__react-presence.mjs";
import "../_libs/radix-ui__react-focus-guards.mjs";
import "../_libs/react-remove-scroll.mjs";
import "../_libs/react-remove-scroll-bar.mjs";
import "../_libs/react-style-singleton.mjs";
import "../_libs/get-nonce.mjs";
import "../_libs/use-sidecar.mjs";
import "../_libs/use-callback-ref.mjs";
import "../_libs/aria-hidden.mjs";
import "../_libs/radix-ui__react-select.mjs";
import "../_libs/radix-ui__number.mjs";
import "../_libs/radix-ui__react-collection.mjs";
import "../_libs/radix-ui__react-direction.mjs";
import "../_libs/radix-ui__react-popper.mjs";
import "../_libs/floating-ui__react-dom.mjs";
import "../_libs/floating-ui__dom.mjs";
import "../_libs/floating-ui__core.mjs";
import "../_libs/floating-ui__utils.mjs";
import "../_libs/radix-ui__react-arrow.mjs";
import "../_libs/radix-ui__react-use-size.mjs";
import "../_libs/radix-ui__react-use-previous.mjs";
import "../_libs/@radix-ui/react-visually-hidden+[...].mjs";
const InputSchema = objectType({
  tenant_id: stringType().uuid(),
  rows: arrayType(unknownType()).min(1).max(2e3)
});
const bulkImportEmployees = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => InputSchema.parse(d)).handler(createSsrRpc("2ad2ea71ca3de95eac6d4bf941d8c88af99c042fb6606997b9ca7ff117309c90"));
const listLeaveTypeCodes = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  tenant_id: stringType().uuid()
}).parse(d)).handler(createSsrRpc("fe7786212f284b2b294f32afa9244aa6e7409f93ff699c0acafe71edf273f0e6"));
const CORE_COLUMNS = [
  "employee_number",
  "first_name",
  "last_name",
  "email",
  "phone",
  "job_title",
  "department_name",
  "manager_email",
  "employment_type",
  "hire_date",
  "base_salary",
  "hourly_rate",
  "pay_frequency",
  "currency_code",
  "tax_treatment_code",
  "income_type",
  "employment_basis",
  "tfn",
  "tfn_status",
  "super_fund_name",
  "super_member_number",
  "bank_name",
  "bank_bsb",
  "bank_account_number",
  "bank_account_name",
  "next_of_kin_name",
  "next_of_kin_relationship",
  "next_of_kin_phone"
];
const YTD_COLUMNS = [
  "ytd_financial_year",
  "ytd_gross",
  "ytd_taxable",
  "ytd_paye_tax",
  "ytd_super_guarantee",
  "ytd_super_salary_sacrifice",
  "ytd_super_employee_voluntary",
  "ytd_allowances",
  "ytd_deductions",
  "ytd_reportable_fringe_benefits"
];
const EXAMPLE_ROW = {
  employee_number: "EMP-0001",
  first_name: "Jane",
  last_name: "Doe",
  email: "jane.doe@example.com",
  phone: "+61400000000",
  job_title: "Software Engineer",
  department_name: "Engineering",
  manager_email: "",
  employment_type: "full_time",
  hire_date: "2025-07-01",
  base_salary: 95e3,
  hourly_rate: "",
  pay_frequency: "fortnightly",
  currency_code: "AUD",
  tax_treatment_code: "RTRTAA",
  income_type: "SAW",
  employment_basis: "FULL_TIME",
  tfn: "123456782",
  tfn_status: "provided",
  super_fund_name: "AustralianSuper",
  super_member_number: "AS-1234",
  bank_name: "CBA",
  bank_bsb: "062-000",
  bank_account_number: "12345678",
  bank_account_name: "Jane Doe",
  next_of_kin_name: "John Doe",
  next_of_kin_relationship: "Spouse",
  next_of_kin_phone: "+61400000001",
  ytd_financial_year: 2026,
  ytd_gross: 25e3,
  ytd_taxable: 25e3,
  ytd_paye_tax: 5500,
  ytd_super_guarantee: 2875,
  ytd_super_salary_sacrifice: 0,
  ytd_super_employee_voluntary: 0,
  ytd_allowances: 0,
  ytd_deductions: 0,
  ytd_reportable_fringe_benefits: 0
};
const REQUIRED_COLUMNS = ["first_name", "last_name", "email", "hire_date", "employment_type"];
const EMPLOYMENT_TYPES = ["full_time", "part_time", "casual", "contractor", "intern", "fixed_term"];
const PAY_FREQUENCIES = ["weekly", "fortnightly", "monthly", "quarterly", "annually"];
const TFN_STATUSES = ["provided", "applied_for", "exempt", "not_provided"];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const BSB_RE = /^\d{3}-?\d{3}$/;
const NUMERIC_FIELDS = [
  "base_salary",
  "hourly_rate",
  "ytd_financial_year",
  "ytd_gross",
  "ytd_taxable",
  "ytd_paye_tax",
  "ytd_super_guarantee",
  "ytd_super_salary_sacrifice",
  "ytd_super_employee_voluntary",
  "ytd_allowances",
  "ytd_deductions",
  "ytd_reportable_fringe_benefits"
];
function validateRow(obj, rowNum, knownLeaveCodes, seenEmails) {
  const errs = [];
  const email = typeof obj.email === "string" ? obj.email.trim().toLowerCase() : "";
  const push = (msg) => errs.push({ row: rowNum, email: email || void 0, error: msg });
  for (const k of REQUIRED_COLUMNS) {
    if (!obj[k] || String(obj[k]).trim() === "") push(`Missing required field: ${k}`);
  }
  if (email && !EMAIL_RE.test(email)) push(`Invalid email format: ${email}`);
  if (email) {
    const prior = seenEmails.get(email);
    if (prior) push(`Duplicate email in file (also on row ${prior})`);
    else seenEmails.set(email, rowNum);
  }
  if (obj.manager_email && !EMAIL_RE.test(String(obj.manager_email))) push(`Invalid manager_email`);
  if (obj.hire_date && !DATE_RE.test(String(obj.hire_date))) push(`hire_date must be YYYY-MM-DD`);
  if (obj.employment_type && !EMPLOYMENT_TYPES.includes(String(obj.employment_type))) {
    push(`employment_type must be one of: ${EMPLOYMENT_TYPES.join(", ")}`);
  }
  if (obj.pay_frequency && !PAY_FREQUENCIES.includes(String(obj.pay_frequency))) {
    push(`pay_frequency must be one of: ${PAY_FREQUENCIES.join(", ")}`);
  }
  if (obj.tfn_status && !TFN_STATUSES.includes(String(obj.tfn_status))) {
    push(`tfn_status must be one of: ${TFN_STATUSES.join(", ")}`);
  }
  if (obj.tfn && !/^\d{8,9}$/.test(String(obj.tfn).replace(/\s/g, ""))) {
    push(`tfn must be 8-9 digits`);
  }
  if (obj.bank_bsb && !BSB_RE.test(String(obj.bank_bsb))) push(`bank_bsb must be 6 digits (e.g. 062-000)`);
  if (obj.currency_code && !/^[A-Z]{3}$/.test(String(obj.currency_code))) push(`currency_code must be a 3-letter ISO code`);
  if (!obj.base_salary && !obj.hourly_rate) push(`Provide base_salary or hourly_rate`);
  for (const f of NUMERIC_FIELDS) {
    if (obj[f] != null && obj[f] !== "" && Number.isNaN(Number(obj[f]))) push(`${f} must be a number`);
  }
  const lb = obj.leave_balances;
  if (lb) {
    for (const [code, val] of Object.entries(lb)) {
      if (Number.isNaN(val)) push(`leave_${code} must be a number`);
      if (knownLeaveCodes.size && !knownLeaveCodes.has(code)) push(`Unknown leave type: ${code}`);
    }
  }
  return errs;
}
function BulkEmployeeImportDialog({ open, onOpenChange, tenantId, onImported }) {
  const listFn = useServerFn(listLeaveTypeCodes);
  const importFn = useServerFn(bulkImportEmployees);
  const [leaveCodes, setLeaveCodes] = reactExports.useState([]);
  const [running, setRunning] = reactExports.useState(false);
  const [validationErrors, setValidationErrors] = reactExports.useState(null);
  const [results, setResults] = reactExports.useState(null);
  const fileRef = reactExports.useRef(null);
  reactExports.useEffect(() => {
    if (!open || !tenantId) return;
    listFn({ data: { tenant_id: tenantId } }).then((r) => setLeaveCodes(r.leave_types.map((t) => t.code))).catch(() => setLeaveCodes([]));
  }, [open, tenantId, listFn]);
  const leaveColumns = reactExports.useMemo(() => leaveCodes.map((c) => `leave_${c}`), [leaveCodes]);
  const allColumns = reactExports.useMemo(
    () => [...CORE_COLUMNS, ...leaveColumns, ...YTD_COLUMNS],
    [leaveColumns]
  );
  function handleDownloadTemplate() {
    const header = allColumns;
    const example = header.map((h) => {
      if (h.startsWith("leave_")) return 0;
      return EXAMPLE_ROW[h] ?? "";
    });
    const csv = toCSV([header, example]);
    downloadCSV("employee-bulk-import-template.csv", csv);
  }
  async function handleFile(file) {
    setRunning(true);
    setResults(null);
    setValidationErrors(null);
    try {
      const text = await file.text();
      const rows = parseCSV(text);
      if (rows.length < 2) throw new Error("CSV is empty");
      const header = rows[0].map((h) => h.trim());
      const requiredMissing = REQUIRED_COLUMNS.filter((c) => !header.includes(c));
      if (requiredMissing.length) {
        throw new Error(`CSV is missing required columns: ${requiredMissing.join(", ")}`);
      }
      const body = rows.slice(1).filter((r) => r.some((v) => v && v.trim() !== ""));
      const knownLeave = new Set(leaveCodes);
      const seenEmails = /* @__PURE__ */ new Map();
      const allErrors = [];
      const payload = body.map((r, idx) => {
        const obj = { leave_balances: {} };
        header.forEach((col, ci) => {
          const raw = (r[ci] ?? "").trim();
          if (col.startsWith("leave_")) {
            if (raw === "") return;
            obj.leave_balances[col.slice("leave_".length)] = Number(raw);
            return;
          }
          if (raw === "") return;
          obj[col] = raw;
        });
        const rowErrs = validateRow(obj, idx + 2, knownLeave, seenEmails);
        allErrors.push(...rowErrs);
        return obj;
      });
      if (allErrors.length) {
        setValidationErrors(allErrors);
        toast.error(`Found ${allErrors.length} issue(s) across ${new Set(allErrors.map((e) => e.row)).size} row(s). Fix the CSV and try again — nothing was imported.`);
        return;
      }
      const res = await importFn({ data: { tenant_id: tenantId, rows: payload } });
      setResults(res);
      const { summary } = res;
      if (summary.errors === 0) {
        toast.success(`Imported ${summary.created} new, updated ${summary.updated}.`);
      } else {
        toast.warning(`${summary.errors} row(s) had errors. Review the table below.`);
      }
      onImported();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Import failed");
    } finally {
      setRunning(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-3xl", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Bulk import employees" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: "Download the CSV template, fill in one employee per row (including leave opening balances and YTD figures for mid-year imports), then upload it here." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-lg border p-4 space-y-2 text-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(FileSpreadsheet, { className: "h-4 w-4 mt-0.5 text-muted-foreground" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: "Template includes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "list-disc pl-5 text-muted-foreground space-y-0.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Core: name, email, phone, job title, department, manager email, employment type, hire date." }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Pay: base_salary, hourly_rate, pay_frequency, currency_code." }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "AU payroll: TFN, tax_treatment_code, income_type, employment_basis, super fund & member, bank BSB/account." }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
              "Leave opening balances: one column per leave type (",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono", children: "leave_<code>" }),
              ")."
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "YTD opening: gross, taxable, PAYG, super (SG / sacrifice / voluntary), allowances, deductions, RFB." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground pt-1", children: "Rows are matched by email — existing employees in the same org will be updated, not duplicated." })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", onClick: handleDownloadTemplate, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "h-4 w-4 mr-2" }),
          " Download CSV template"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            ref: fileRef,
            type: "file",
            accept: ".csv,text/csv",
            className: "hidden",
            onChange: (e) => {
              const f = e.target.files?.[0];
              if (f) void handleFile(f);
            }
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => fileRef.current?.click(), disabled: running, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { className: "h-4 w-4 mr-2" }),
          " ",
          running ? "Importing…" : "Upload CSV"
        ] })
      ] }),
      validationErrors && validationErrors.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-sm space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs font-medium text-destructive", children: [
          validationErrors.length,
          " validation issue(s) — nothing was imported. Fix the CSV and re-upload."
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-h-48 overflow-auto text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "text-left text-muted-foreground", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-1", children: "Row" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { children: "Email" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { children: "Issue" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: validationErrors.map((e, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-t", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-1 pr-2", children: e.row }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "pr-2", children: e.email ?? "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "text-destructive", children: e.error })
          ] }, i)) })
        ] }) })
      ] }),
      results && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border p-3 text-sm space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-4 text-xs", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: results.summary.total }),
            " rows"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-green-700", children: [
            "created ",
            results.summary.created
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-blue-700", children: [
            "updated ",
            results.summary.updated
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-red-700", children: [
            "errors ",
            results.summary.errors
          ] })
        ] }),
        results.summary.errors > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-h-48 overflow-auto text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "text-left text-muted-foreground", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-1", children: "Row" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { children: "Email" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { children: "Error" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: results.results.filter((r) => r.status === "error").map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-t", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-1 pr-2", children: r.row }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "pr-2", children: r.email ?? "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "text-red-700", children: r.error })
          ] }, r.row)) })
        ] }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogFooter, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => onOpenChange(false), children: "Close" }) })
  ] }) });
}
const suspendAccount = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  userId: stringType().uuid(),
  reason: stringType().trim().min(1).max(500)
}).parse(d)).handler(createSsrRpc("08d30269a1696e9feaa7c2cd8da97956b1d175dc2a81d08787afe168963a0f6e"));
const reinstateAccount = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  userId: stringType().uuid()
}).parse(d)).handler(createSsrRpc("15bb30cc41b89437ba30ffce44df51a6e721dd1be3460699f2a099392fb6a6a8"));
const listSuspendedAccounts = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("02a41e86b044cd0a583f98433a4de0142f648e58059962d01648a75396dacafb"));
function AccountSuspensionDialog({
  target,
  open,
  onOpenChange,
  onDone
}) {
  const suspend = useServerFn(suspendAccount);
  const reinstate = useServerFn(reinstateAccount);
  const [reason, setReason] = reactExports.useState("");
  const [working, setWorking] = reactExports.useState(false);
  if (!target) return null;
  const isSuspended = target.suspended;
  async function run() {
    if (!target) return;
    if (!isSuspended && !reason.trim()) {
      toast.error("A reason is required — the user sees it on the suspended screen.");
      return;
    }
    setWorking(true);
    try {
      if (isSuspended) {
        await reinstate({ data: { userId: target.userId } });
        toast.success(`${target.displayName} can sign in again`);
      } else {
        const res = await suspend({
          data: { userId: target.userId, reason: reason.trim() }
        });
        const revoked = res?.sessionsRevoked ?? 0;
        toast.success(
          revoked > 0 ? `${target.displayName} suspended — ${revoked} active session${revoked === 1 ? "" : "s"} ended` : `${target.displayName} suspended`
        );
      }
      setReason("");
      onOpenChange(false);
      await onDone();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not change account status");
    } finally {
      setWorking(false);
    }
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { className: "flex items-center gap-2", children: [
        isSuspended ? /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "h-4 w-4 text-status-done" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldAlert, { className: "h-4 w-4 text-status-stuck" }),
        isSuspended ? "Restore access" : "Suspend account"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: isSuspended ? `${target.displayName} will be able to sign in and use hrppl again immediately.` : `${target.displayName} will be signed out everywhere and blocked from every page and API call until an administrator restores access.` })
    ] }),
    isSuspended ? target.reason ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border border-border bg-muted/40 p-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-medium uppercase tracking-wide text-muted-foreground", children: "Suspended for" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm", children: target.reason })
    ] }) : null : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "suspension-reason", children: "Reason" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Textarea,
        {
          id: "suspension-reason",
          rows: 3,
          value: reason,
          maxLength: 500,
          placeholder: "Shown to the user on the suspended screen, e.g. Offboarded — pending exit checklist",
          onChange: (e) => setReason(e.target.value)
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => onOpenChange(false), disabled: working, children: "Cancel" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          variant: isSuspended ? "default" : "destructive",
          onClick: run,
          disabled: working || !isSuspended && !reason.trim(),
          children: working ? "Working…" : isSuspended ? "Restore access" : "Suspend account"
        }
      )
    ] })
  ] }) });
}
function EmployeesPage() {
  const {
    user,
    roles,
    loading
  } = useAuth();
  const navigate = useNavigate();
  const [tenant, setTenant] = reactExports.useState(null);
  const [employees, setEmployees] = reactExports.useState([]);
  const [departments, setDepartments] = reactExports.useState([]);
  const [search, setSearch] = reactExports.useState("");
  const [open, setOpen] = reactExports.useState(false);
  const [editing, setEditing] = reactExports.useState(null);
  const [timelineFor, setTimelineFor] = reactExports.useState(null);
  const [busy, setBusy] = reactExports.useState(false);
  const [bulkOpen, setBulkOpen] = reactExports.useState(false);
  const listSuspended = useServerFn(listSuspendedAccounts);
  const [suspendedMap, setSuspendedMap] = reactExports.useState({});
  const [suspendTarget, setSuspendTarget] = reactExports.useState(null);
  const canManage = roles.includes("org_admin") || roles.includes("super_admin");
  const canSuspend = can("account.suspend", roles);
  reactExports.useEffect(() => {
    if (!loading && !user) navigate({
      to: "/auth"
    });
  }, [loading, user, navigate]);
  async function loadAll() {
    if (!user) return;
    const {
      data: prof
    } = await supabase.from("profiles").select("tenant_id").eq("id", user.id).maybeSingle();
    if (!prof?.tenant_id) return;
    const {
      data: t
    } = await supabase.from("tenants").select("*").eq("id", prof.tenant_id).maybeSingle();
    if (t) setTenant(t);
    const [{
      data: emps
    }, {
      data: deps
    }] = await Promise.all([supabase.from("employees").select("*").eq("tenant_id", prof.tenant_id).order("created_at", {
      ascending: false
    }), supabase.from("departments").select("id,name").eq("tenant_id", prof.tenant_id).order("name")]);
    setEmployees(emps ?? []);
    setDepartments(deps ?? []);
    await loadSuspended();
  }
  async function loadSuspended() {
    if (!canSuspend) return;
    try {
      const {
        accounts
      } = await listSuspended();
      setSuspendedMap(Object.fromEntries(accounts.map((a) => [a.id, a.suspension_reason])));
    } catch {
    }
  }
  reactExports.useEffect(() => {
    loadAll();
  }, [user]);
  const filtered = reactExports.useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return employees;
    return employees.filter((e) => e.first_name.toLowerCase().includes(q) || e.last_name.toLowerCase().includes(q) || e.email.toLowerCase().includes(q) || e.employee_number.toLowerCase().includes(q) || (e.job_title ?? "").toLowerCase().includes(q));
  }, [employees, search]);
  function openCreate() {
    setEditing(null);
    setOpen(true);
  }
  function openEdit(e) {
    setEditing(e);
    setOpen(true);
  }
  async function handleDelete(e) {
    if (!confirm(`Remove ${e.first_name} ${e.last_name}?`)) return;
    const {
      error
    } = await supabase.from("employees").delete().eq("id", e.id);
    if (error) return toast.error(error.message);
    toast.success("Employee removed");
    loadAll();
  }
  if (loading || !user) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "flex min-h-screen items-center justify-center text-muted-foreground", children: "Loading…" });
  }
  if (!tenant) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "mx-auto max-w-3xl px-6 py-10", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { children: "No tenant assigned" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "You must be linked to an organization to manage employees." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/org", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", children: "Back to organization" }) }) })
    ] }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "min-h-screen bg-background", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("header", { className: "border-b border-border bg-card", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto flex max-w-6xl items-center justify-between px-6 py-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-xl font-semibold", children: "Employees" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: tenant.name })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/org", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", size: "sm", children: "Back" }) }),
        canManage && /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/admin/departments", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", size: "sm", "data-testid": "manage-departments", children: "Manage departments" }) }),
        canManage && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: () => setBulkOpen(true), "data-testid": "bulk-import-employees", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { className: "h-4 w-4 mr-1.5" }),
          " Bulk import"
        ] }),
        canManage && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", onClick: openCreate, "data-testid": "add-employee", children: "Add employee" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "mx-auto max-w-6xl px-6 py-8 space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Search by name, email, number, title…", value: search, onChange: (e) => setSearch(e.target.value), className: "max-w-md" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "outline", children: [
          filtered.length,
          " of ",
          employees.length
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-0", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "#" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Name" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Title" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Department" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Type" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Hire date" }),
          canManage && /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Actions" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TableBody, { children: [
          filtered.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { colSpan: canManage ? 8 : 7, className: "text-center text-muted-foreground py-8", children: "No employees yet." }) }),
          filtered.map((e) => {
            const dep = departments.find((d) => d.id === e.department_id)?.name ?? "—";
            return /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-mono text-xs", children: e.employee_number }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-medium", children: [
                  e.first_name,
                  " ",
                  e.last_name
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: e.email })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: e.job_title ?? "—" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: dep }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", children: e.employment_type.replace("_", " ") }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: e.status === "active" ? "default" : e.status === "on_leave" ? "secondary" : "destructive", children: e.status.replace("_", " ") }),
                e.user_id && e.user_id in suspendedMap && /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "destructive", className: "gap-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldAlert, { className: "h-3 w-3" }),
                  " Suspended"
                ] })
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: e.hire_date }),
              canManage && /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { className: "text-right space-x-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", asChild: true, title: "Full record", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/admin/employees/$employeeId", params: {
                  employeeId: e.id
                }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-4 w-4" }) }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: () => setTimelineFor(e), title: "Timeline", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-4 w-4" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", onClick: () => openEdit(e), children: "Edit" }),
                canSuspend && e.user_id && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", title: e.user_id in suspendedMap ? "Restore access" : "Suspend account", onClick: () => setSuspendTarget({
                  userId: e.user_id,
                  displayName: `${e.first_name} ${e.last_name}`,
                  suspended: e.user_id in suspendedMap,
                  reason: suspendedMap[e.user_id]
                }), children: e.user_id in suspendedMap ? /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "h-4 w-4 text-status-done" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldAlert, { className: "h-4 w-4" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: () => handleDelete(e), children: "Delete" })
              ] })
            ] }, e.id);
          })
        ] })
      ] }) }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(EmployeeDialog, { open, onOpenChange: setOpen, tenant, departments, editing, busy, setBusy, onSaved: () => {
      setOpen(false);
      loadAll();
    } }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(TimelineDialog, { employee: timelineFor, onClose: () => setTimelineFor(null) }),
    tenant && /* @__PURE__ */ jsxRuntimeExports.jsx(BulkEmployeeImportDialog, { open: bulkOpen, onOpenChange: setBulkOpen, tenantId: tenant.id, onImported: loadAll }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AccountSuspensionDialog, { target: suspendTarget, open: !!suspendTarget, onOpenChange: (o) => !o && setSuspendTarget(null), onDone: loadSuspended })
  ] });
}
function TimelineDialog({
  employee,
  onClose
}) {
  const fn = useServerFn(getEmployeeTimeline);
  const {
    data,
    isLoading
  } = useQuery({
    queryKey: ["employee-timeline", employee?.id],
    queryFn: () => fn({
      data: {
        employee_id: employee.id
      }
    }),
    enabled: !!employee
  });
  const iconFor = (kind) => {
    if (kind === "hire") return /* @__PURE__ */ jsxRuntimeExports.jsx(UserPlus, { className: "h-4 w-4" });
    if (kind === "promotion") return /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "h-4 w-4" });
    if (kind === "pay_rate") return /* @__PURE__ */ jsxRuntimeExports.jsx(DollarSign, { className: "h-4 w-4" });
    if (kind === "designation") return /* @__PURE__ */ jsxRuntimeExports.jsx(Briefcase, { className: "h-4 w-4" });
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Briefcase, { className: "h-4 w-4" });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: !!employee, onOpenChange: (o) => !o && onClose(), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-2xl max-h-[80vh] overflow-y-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
        employee?.first_name,
        " ",
        employee?.last_name,
        " — Career timeline"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: "Designations, promotions, and pay-rate history." })
    ] }),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-muted-foreground py-6", children: "Loading…" }) : !data?.events?.length ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-muted-foreground py-6", children: "No timeline entries yet." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("ol", { className: "relative ml-3 border-l border-border pl-6 space-y-5 py-2", children: data.events.map((ev, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "relative", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute -left-[34px] flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary ring-4 ring-background", children: iconFor(ev.kind) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-0.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium text-sm", children: ev.title }),
          ev.detail && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: ev.detail }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground pt-1 space-x-2", children: [
            ev.proposed_by?.name && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              "Proposed by ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-foreground", children: ev.proposed_by.name })
            ] }),
            ev.decided_by?.name && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              "· Approved by ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-foreground", children: ev.decided_by.name }),
              ev.decided_at ? ` on ${new Date(ev.decided_at).toLocaleDateString()}` : ""
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-end gap-1 shrink-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-mono text-muted-foreground", children: ev.date }),
          ev.status && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: ev.status === "applied" ? "default" : ev.status === "approved" ? "secondary" : ev.status === "rejected" ? "destructive" : "outline", children: ev.status })
        ] })
      ] })
    ] }, i)) })
  ] }) });
}
function EmployeeDialog({
  open,
  onOpenChange,
  tenant,
  departments,
  editing,
  busy,
  setBusy,
  onSaved
}) {
  const [form, setForm] = reactExports.useState({});
  const fnApplyDefaults = useServerFn(applyDefaultAssignmentsForEmployee);
  const fnListTemplates = useServerFn(listOnboardingTemplates);
  const fnApplyTemplate = useServerFn(applyOnboardingTemplate);
  const navigate = useNavigate();
  const [step, setStep] = reactExports.useState("form");
  const [newEmpId, setNewEmpId] = reactExports.useState(null);
  const [templates, setTemplates] = reactExports.useState([]);
  const [chosenTpl, setChosenTpl] = reactExports.useState("");
  const [startDate, setStartDate] = reactExports.useState((/* @__PURE__ */ new Date()).toISOString().slice(0, 10));
  const [applying, setApplying] = reactExports.useState(false);
  reactExports.useEffect(() => {
    if (editing) setForm(editing);
    else setForm({
      employment_type: "full_time",
      status: "active",
      hire_date: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
      currency_code: tenant.currency_code
    });
    setStep("form");
    setNewEmpId(null);
    setChosenTpl("");
  }, [editing, open, tenant.currency_code]);
  function update(key, value) {
    setForm((f) => ({
      ...f,
      [key]: value
    }));
  }
  async function handleSave(e) {
    e.preventDefault();
    setBusy(true);
    if (!form.employee_number || !form.first_name || !form.last_name || !form.email || !form.hire_date) {
      setBusy(false);
      return toast.error("Please fill in all required fields");
    }
    const payload = {
      tenant_id: tenant.id,
      employee_number: form.employee_number.trim(),
      first_name: form.first_name.trim(),
      last_name: form.last_name.trim(),
      email: form.email.trim().toLowerCase(),
      phone: form.phone?.trim() || null,
      job_title: form.job_title?.trim() || null,
      department_id: form.department_id || null,
      employment_type: form.employment_type ?? "full_time",
      status: form.status ?? "active",
      hire_date: form.hire_date,
      termination_date: form.termination_date || null,
      base_salary: form.base_salary != null && form.base_salary !== "" ? Number(form.base_salary) : null,
      hourly_rate: form.hourly_rate != null && form.hourly_rate !== "" ? Number(form.hourly_rate) : null,
      pay_frequency: form.pay_frequency || null,
      currency_code: form.currency_code || tenant.currency_code
    };
    const result = editing ? await supabase.from("employees").update(payload).eq("id", editing.id).select("id").single() : await supabase.from("employees").insert(payload).select("id").single();
    setBusy(false);
    if (result.error) return toast.error(result.error.message);
    if (!editing && result.data?.id) {
      try {
        await fnApplyDefaults({
          data: {
            employeeId: result.data.id
          }
        });
      } catch {
      }
      setNewEmpId(result.data.id);
      setStartDate(payload.hire_date);
      try {
        const r = await fnListTemplates();
        const active = (r.templates ?? []).filter((t) => t.is_active);
        setTemplates(active.map((t) => ({
          id: t.id,
          name: t.name
        })));
        setStep("onboard");
        return;
      } catch {
        toast.success("Employee added");
        onSaved();
        return;
      }
    }
    toast.success(editing ? "Employee updated" : "Employee added");
    onSaved();
  }
  async function applyTpl() {
    if (!newEmpId || !chosenTpl) return;
    setApplying(true);
    try {
      const r = await fnApplyTemplate({
        data: {
          template_id: chosenTpl,
          employee_id: newEmpId,
          start_date: startDate
        }
      });
      toast.success(`Onboarding started — ${r.enrolled ?? 0} course(s) enrolled`);
      onSaved();
      navigate({
        to: "/org/onboarding"
      });
    } catch (e) {
      toast.error(e.message ?? "Couldn't start onboarding");
    } finally {
      setApplying(false);
    }
  }
  if (step === "onboard" && newEmpId) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-lg", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Start onboarding now?" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: "Pick an onboarding template to auto-assign the checklist, training and document requests." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Template" }),
          templates.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
            "No active templates. Create one in ",
            /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/admin/templates", className: "underline", children: "Templates Hub" }),
            "."
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: chosenTpl, onValueChange: setChosenTpl, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Choose template" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: templates.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: t.id, children: t.name }, t.id)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Start date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: startDate, onChange: (e) => setStartDate(e.target.value) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", onClick: () => {
          toast.success("Employee added");
          onSaved();
        }, children: "Skip" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: applyTpl, disabled: !chosenTpl || applying, children: applying ? "Starting…" : "Apply & open onboarding" })
      ] })
    ] }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-2xl", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editing ? "Edit employee" : "Add employee" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogDescription, { children: [
        "Employee records are scoped to ",
        tenant.name,
        "."
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSave, className: "grid grid-cols-2 gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Employee #", required: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.employee_number ?? "", onChange: (e) => update("employee_number", e.target.value), required: true }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Email", required: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "email", value: form.email ?? "", onChange: (e) => update("email", e.target.value), required: true }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "First name", required: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.first_name ?? "", onChange: (e) => update("first_name", e.target.value), required: true }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Last name", required: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.last_name ?? "", onChange: (e) => update("last_name", e.target.value), required: true }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Phone", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.phone ?? "", onChange: (e) => update("phone", e.target.value) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Job title", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.job_title ?? "", onChange: (e) => update("job_title", e.target.value) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Department", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.department_id ?? "none", onValueChange: (v) => update("department_id", v === "none" ? null : v), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "none", children: "— None —" }),
          departments.map((d) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: d.id, children: d.name }, d.id))
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Employment type", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.employment_type ?? "full_time", onValueChange: (v) => update("employment_type", v), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "full_time", children: "Full time" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "part_time", children: "Part time" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "contract", children: "Contract" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "intern", children: "Intern" })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Status", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.status ?? "active", onValueChange: (v) => update("status", v), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "active", children: "Active" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "on_leave", children: "On leave" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "terminated", children: "Terminated" })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Hire date", required: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.hire_date ?? "", onChange: (e) => update("hire_date", e.target.value), required: true }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Termination date", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.termination_date ?? "", onChange: (e) => update("termination_date", e.target.value || null) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 mt-2 rounded-lg border bg-muted/30 p-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-2 flex items-center gap-2 text-sm font-semibold", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "💰 Compensation" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-normal text-muted-foreground", children: "— set the pay rate for this new joinee" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4 md:grid-cols-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: `Base salary (${form.currency_code ?? tenant.currency_code})`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", placeholder: "e.g. 75000", value: form.base_salary ?? "", onChange: (e) => update("base_salary", e.target.value === "" ? null : Number(e.target.value)) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: `Hourly rate (${form.currency_code ?? tenant.currency_code})`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.0001", placeholder: "e.g. 38.50", value: form.hourly_rate ?? "", onChange: (e) => update("hourly_rate", e.target.value === "" ? null : Number(e.target.value)) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Pay frequency", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.pay_frequency ?? "none", onValueChange: (v) => update("pay_frequency", v === "none" ? null : v), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "none", children: "— Not set —" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "hourly", children: "Hourly" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "weekly", children: "Weekly" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "fortnightly", children: "Fortnightly" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "monthly", children: "Monthly" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "annually", children: "Annually" })
            ] })
          ] }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { className: "col-span-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "outline", onClick: () => onOpenChange(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", disabled: busy, children: busy ? "Saving…" : editing ? "Save changes" : "Add employee" })
      ] })
    ] })
  ] }) });
}
function Field({
  label,
  required,
  children
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { className: "text-xs", children: [
      label,
      required && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-destructive", children: " *" })
    ] }),
    children
  ] });
}
export {
  EmployeesPage as component
};
