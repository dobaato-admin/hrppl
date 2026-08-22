import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { a as useServerFn, B as Button } from "./router-CLxirH5A.mjs";
import { u as useQueryClient, a as useQuery, c as useMutation } from "../_libs/tanstack__react-query.mjs";
import { a as getMeOverview, b as updateMyBankingTax } from "./me.functions-DY4fpk4D.mjs";
import { a as SkeletonRows, b as SectionCard } from "./monday-Dpwrcz0o.mjs";
import { I as Input } from "./input-C6yqZkRy.mjs";
import { L as Label } from "./label-Cbju7vgw.mjs";
import { A as Alert, a as AlertDescription } from "./alert-CfSGBoj2.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import "../_libs/seroval.mjs";
import "../_libs/lovable.dev__mcp-js.mjs";
import "../_libs/modelcontextprotocol__sdk.mjs";
import "../_libs/zod-to-json-schema.mjs";
import "../_libs/ajv-formats.mjs";
import { Y as TriangleAlert, h as ShieldCheck, aC as Save } from "../_libs/lucide-react.mjs";
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
import "../_libs/radix-ui__react-label.mjs";
import "../_libs/radix-ui__react-primitive.mjs";
const FIELDS = [{
  key: "bank_name",
  label: "Bank name",
  group: "bank"
}, {
  key: "bank_account_holder",
  label: "Account holder",
  group: "bank"
}, {
  key: "bank_account_number",
  label: "Account number",
  group: "bank"
}, {
  key: "bank_branch_code",
  label: "Branch / sort code",
  group: "bank"
}, {
  key: "bank_iban",
  label: "IBAN",
  group: "bank",
  placeholder: "Optional"
}, {
  key: "bank_swift",
  label: "SWIFT / BIC",
  group: "bank",
  placeholder: "Optional"
}, {
  key: "national_id_number",
  label: "National ID number",
  group: "tax"
}, {
  key: "tax_identification_number",
  label: "Tax ID (TIN / PAYE / SSN…)",
  group: "tax"
}, {
  key: "social_security_number",
  label: "Social security number",
  group: "tax"
}, {
  key: "provident_fund_number",
  label: "Provident fund number",
  group: "tax"
}, {
  key: "pension_fund_number",
  label: "Pension fund number",
  group: "tax"
}];
function MeBankingTax() {
  const qc = useQueryClient();
  const fn = useServerFn(getMeOverview);
  const updateFn = useServerFn(updateMyBankingTax);
  const {
    data,
    isLoading
  } = useQuery({
    queryKey: ["me-overview"],
    queryFn: () => fn({})
  });
  const [form, setForm] = reactExports.useState({});
  reactExports.useEffect(() => {
    if (!data?.profile) return;
    const next = {};
    for (const f of FIELDS) next[f.key] = data.profile[f.key] ?? "";
    setForm(next);
  }, [data]);
  const m = useMutation({
    mutationFn: (v) => updateFn({
      data: v
    }),
    onSuccess: () => {
      toast.success("Banking & tax details saved");
      qc.invalidateQueries({
        queryKey: ["me-overview"]
      });
    },
    onError: (e) => toast.error(e?.message ?? "Failed to save")
  });
  if (isLoading) return /* @__PURE__ */ jsxRuntimeExports.jsx(SkeletonRows, { rows: 6 });
  const missingTaxId = !(form.tax_identification_number ?? "").trim();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    missingTaxId && /* @__PURE__ */ jsxRuntimeExports.jsxs(Alert, { className: "border-status-warning/40 bg-status-warning/10", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-4 w-4 text-status-warning" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDescription, { children: "Your tax ID is missing. It's optional today, but please add it within a week so your payroll filings are accurate — we'll email a reminder otherwise." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Alert, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "h-4 w-4" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDescription, { children: "These details are encrypted in transit, audit-logged, and only visible to authorised payroll administrators. Account numbers in the audit trail are masked." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: (e) => {
      e.preventDefault();
      const cleaned = Object.fromEntries(Object.entries(form).map(([k, v]) => [k, v?.trim() === "" ? null : v?.trim() ?? null]));
      m.mutate(cleaned);
    }, className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(SectionCard, { title: "Banking", description: "Where your salary is paid", tone: "primary", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-4 sm:grid-cols-2", children: FIELDS.filter((f) => f.group === "bank").map((f) => /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { f, value: form[f.key] ?? "", onChange: (v) => setForm((s) => ({
        ...s,
        [f.key]: v
      })) }, f.key)) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(SectionCard, { title: "Tax & social", description: "Statutory IDs used on your payslip and tax filings", tone: "info", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-4 sm:grid-cols-2", children: FIELDS.filter((f) => f.group === "tax").map((f) => /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { f, value: form[f.key] ?? "", onChange: (v) => setForm((s) => ({
        ...s,
        [f.key]: v
      })) }, f.key)) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-end", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "submit", disabled: m.isPending, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Save, { className: "mr-1 h-4 w-4" }),
        " ",
        m.isPending ? "Saving…" : "Save changes"
      ] }) })
    ] })
  ] });
}
function Field({
  f,
  value,
  onChange
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: f.key, children: f.label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: f.key, value, placeholder: f.placeholder, onChange: (e) => onChange(e.target.value), maxLength: 60, autoComplete: "off", spellCheck: false })
  ] });
}
export {
  MeBankingTax as component
};
