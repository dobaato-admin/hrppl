import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { a as useServerFn, B as Button } from "./router-CLxirH5A.mjs";
import { u as useQueryClient, a as useQuery, c as useMutation } from "../_libs/tanstack__react-query.mjs";
import { a as getMeOverview, u as updateMyContactDetails } from "./me.functions-DY4fpk4D.mjs";
import { a as SkeletonRows, b as SectionCard } from "./monday-Dpwrcz0o.mjs";
import { I as Input } from "./input-C6yqZkRy.mjs";
import { L as Label } from "./label-Cbju7vgw.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import "../_libs/seroval.mjs";
import "../_libs/lovable.dev__mcp-js.mjs";
import "../_libs/modelcontextprotocol__sdk.mjs";
import "../_libs/zod-to-json-schema.mjs";
import "../_libs/ajv-formats.mjs";
import { aC as Save } from "../_libs/lucide-react.mjs";
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
  key: "personal_email",
  label: "Personal email",
  type: "email",
  placeholder: "you@personal.com"
}, {
  key: "personal_phone",
  label: "Personal phone",
  placeholder: "+1 555 0100"
}, {
  key: "phone",
  label: "Work phone",
  placeholder: "Optional"
}, {
  key: "marital_status",
  label: "Marital status",
  placeholder: "Single / Married / …"
}, {
  key: "address_line1",
  label: "Address line 1"
}, {
  key: "address_line2",
  label: "Address line 2"
}, {
  key: "city",
  label: "City"
}, {
  key: "region",
  label: "Region / State"
}, {
  key: "postal_code",
  label: "Postal code"
}, {
  key: "country_of_residence",
  label: "Country (ISO 2)",
  placeholder: "GB, US, ZA…"
}, {
  key: "emergency_contact_name",
  label: "Emergency contact name"
}, {
  key: "emergency_contact_phone",
  label: "Emergency contact phone"
}, {
  key: "emergency_contact_relation",
  label: "Emergency contact relation",
  placeholder: "Spouse, Parent…"
}];
function MeContact() {
  const qc = useQueryClient();
  const fn = useServerFn(getMeOverview);
  const updateFn = useServerFn(updateMyContactDetails);
  const {
    data,
    isLoading
  } = useQuery({
    queryKey: ["me-overview"],
    queryFn: () => fn({})
  });
  const [form, setForm] = reactExports.useState({});
  reactExports.useEffect(() => {
    if (!data?.employee) return;
    const p = data.profile ?? {};
    const next = {};
    for (const f of FIELDS) next[f.key] = (f.key === "phone" ? data.employee.phone : p[f.key]) ?? "";
    setForm(next);
  }, [data]);
  const m = useMutation({
    mutationFn: (v) => updateFn({
      data: v
    }),
    onSuccess: () => {
      toast.success("Contact details saved");
      qc.invalidateQueries({
        queryKey: ["me-overview"]
      });
    },
    onError: (e) => toast.error(e?.message ?? "Failed to save")
  });
  if (isLoading) return /* @__PURE__ */ jsxRuntimeExports.jsx(SkeletonRows, { rows: 6 });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(SectionCard, { title: "Contact & address", description: "These details are visible to your HR admin and used on official documents.", tone: "info", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { className: "grid gap-4 sm:grid-cols-2", onSubmit: (e) => {
    e.preventDefault();
    const cleaned = Object.fromEntries(Object.entries(form).map(([k, v]) => [k, v?.trim() === "" ? null : v?.trim() ?? null]));
    m.mutate(cleaned);
  }, children: [
    FIELDS.map((f) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: f.key, children: f.label }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: f.key, type: f.type ?? "text", placeholder: f.placeholder, value: form[f.key] ?? "", onChange: (e) => setForm((s) => ({
        ...s,
        [f.key]: e.target.value
      })), maxLength: f.key.includes("address") ? 200 : 120 })
    ] }, f.key)),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "sm:col-span-2 flex justify-end", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "submit", disabled: m.isPending, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Save, { className: "mr-1 h-4 w-4" }),
      " ",
      m.isPending ? "Saving…" : "Save changes"
    ] }) })
  ] }) });
}
export {
  MeContact as component
};
