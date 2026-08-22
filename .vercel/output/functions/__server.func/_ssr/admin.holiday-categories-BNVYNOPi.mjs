import { j as jsxRuntimeExports, r as reactExports } from "../_libs/react.mjs";
import { e as useNavigate, L as Link } from "../_libs/tanstack__react-router.mjs";
import { u as useAuth, a as useServerFn, B as Button, C as Card, b as CardHeader, c as CardTitle, d as CardDescription, e as CardContent, f as Badge } from "./router-CLxirH5A.mjs";
import { u as useQueryClient, a as useQuery } from "../_libs/tanstack__react-query.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { s as supabase } from "./client-BLUqAwhM.mjs";
import { A as AppShell } from "./AppShell-fbDALlr7.mjs";
import { I as Input } from "./input-C6yqZkRy.mjs";
import { L as Label } from "./label-Cbju7vgw.mjs";
import { T as Table, a as TableHeader, b as TableRow, c as TableHead, d as TableBody, e as TableCell } from "./table-DBQt_Juv.mjs";
import { D as Dialog, a as DialogContent, b as DialogHeader, c as DialogTitle, e as DialogFooter } from "./dialog-UIV2CpIo.mjs";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-Bk9id1Ls.mjs";
import { c as createSsrRpc } from "./createSsrRpc-CRedQJGY.mjs";
import { r as requireSupabaseAuth } from "./auth-guard-CkYFJuQL.mjs";
import { c as createServerFn } from "./server-BOi2EjMN.mjs";
import { A as AdminGate } from "./AdminGate-B3-x5ytD.mjs";
import { a as ORG_ADMIN_ONLY } from "./rbac-BWg_Nf1T.mjs";
import "../_libs/lovable.dev__mcp-js.mjs";
import "../_libs/modelcontextprotocol__sdk.mjs";
import "../_libs/zod-to-json-schema.mjs";
import "../_libs/ajv-formats.mjs";
import "../_libs/seroval.mjs";
import { a as objectType, z as stringType, A as booleanType, C as numberType } from "../_libs/zod.mjs";
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
const listHolidayCategories = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("6bcc10afef8865f2a80c3359bee108eb93aedac9514c3f4160e132caa87c9e35"));
const UpsertCategory = objectType({
  id: stringType().uuid().optional(),
  country_code: stringType().trim().min(2).max(3),
  name: stringType().trim().min(1).max(120),
  is_default: booleanType().optional(),
  notes: stringType().trim().max(500).nullable().optional()
});
const upsertHolidayCategory = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => UpsertCategory.parse(d)).handler(createSsrRpc("97cd0df4fbc8c8688ace62b307bfa10343759a152b338fbdbdb6b6ca15e630d6"));
const deleteHolidayCategory = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(createSsrRpc("90cb15cd2d216308a375ab77d2680e1c622e1405181a5466663adee84080f315"));
const UpsertDate = objectType({
  id: stringType().uuid().optional(),
  category_id: stringType().uuid(),
  holiday_date: stringType().regex(/^\d{4}-\d{2}-\d{2}$/),
  name: stringType().trim().min(1).max(160),
  is_paid: booleanType().optional(),
  pay_multiplier: numberType().min(1).max(10).nullable().optional(),
  notes: stringType().trim().max(500).nullable().optional()
});
const upsertHolidayCategoryDate = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => UpsertDate.parse(d)).handler(createSsrRpc("0b3cee7a0ab2556f977a5b755e78f73e0f6ed1d11bd2fce6b6f132959b097226"));
const deleteHolidayCategoryDate = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(createSsrRpc("444e5e0c028ecb570f37bf3ceddb90b5b9ee3116d6e758522f442f7bdbd3cf74"));
function HolidayCategoriesPage() {
  const {
    user,
    roles,
    loading,
    rolesLoaded
  } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const listFn = useServerFn(listHolidayCategories);
  const saveCat = useServerFn(upsertHolidayCategory);
  const delCat = useServerFn(deleteHolidayCategory);
  const saveDate = useServerFn(upsertHolidayCategoryDate);
  const delDate = useServerFn(deleteHolidayCategoryDate);
  const canAccess = roles.includes("org_admin") || roles.includes("super_admin");
  const [countries, setCountries] = reactExports.useState([]);
  const [catOpen, setCatOpen] = reactExports.useState(false);
  const [catForm, setCatForm] = reactExports.useState({
    country_code: "",
    name: "",
    is_default: false
  });
  const [dateOpen, setDateOpen] = reactExports.useState(false);
  const [dateForm, setDateForm] = reactExports.useState({
    category_id: "",
    holiday_date: "",
    name: "",
    is_paid: true,
    pay_multiplier: ""
  });
  reactExports.useEffect(() => {
    if (!loading && !user) navigate({
      to: "/auth"
    });
    else if (!loading && user && !canAccess) {
      toast.error("Admin only");
      navigate({
        to: "/dashboard"
      });
    }
  }, [loading, user, canAccess, navigate]);
  reactExports.useEffect(() => {
    (async () => {
      const {
        data: data2
      } = await supabase.from("countries").select("code,name").order("name");
      setCountries(data2 ?? []);
    })();
  }, []);
  const {
    data,
    isLoading
  } = useQuery({
    queryKey: ["holiday-categories"],
    queryFn: () => listFn(),
    enabled: canAccess
  });
  const categories = data?.categories ?? [];
  const dates = data?.dates ?? [];
  const datesByCat = reactExports.useMemo(() => {
    const m = /* @__PURE__ */ new Map();
    for (const d of dates) {
      const arr = m.get(d.category_id) ?? [];
      arr.push(d);
      m.set(d.category_id, arr);
    }
    return m;
  }, [dates]);
  function startNewCat() {
    setCatForm({
      country_code: countries[0]?.code ?? "",
      name: "",
      is_default: false
    });
    setCatOpen(true);
  }
  function startEditCat(c) {
    setCatForm({
      id: c.id,
      country_code: c.country_code,
      name: c.name,
      is_default: c.is_default
    });
    setCatOpen(true);
  }
  function startNewDate(catId) {
    setDateForm({
      category_id: catId,
      holiday_date: "",
      name: "",
      is_paid: true,
      pay_multiplier: ""
    });
    setDateOpen(true);
  }
  async function saveCatSubmit(e) {
    e.preventDefault();
    try {
      await saveCat({
        data: {
          id: catForm.id,
          country_code: catForm.country_code,
          name: catForm.name,
          is_default: catForm.is_default
        }
      });
      toast.success("Saved");
      setCatOpen(false);
      qc.invalidateQueries({
        queryKey: ["holiday-categories"]
      });
    } catch (e2) {
      toast.error(e2?.message ?? "Failed");
    }
  }
  async function removeCat(c) {
    if (!confirm(`Delete category "${c.name}"? Dates inside it will also be removed.`)) return;
    try {
      await delCat({
        data: {
          id: c.id
        }
      });
      toast.success("Deleted");
      qc.invalidateQueries({
        queryKey: ["holiday-categories"]
      });
    } catch (e) {
      toast.error(e?.message ?? "Failed");
    }
  }
  async function saveDateSubmit(e) {
    e.preventDefault();
    try {
      await saveDate({
        data: {
          id: dateForm.id,
          category_id: dateForm.category_id,
          holiday_date: dateForm.holiday_date,
          name: dateForm.name,
          is_paid: dateForm.is_paid,
          pay_multiplier: dateForm.pay_multiplier === "" ? null : Number(dateForm.pay_multiplier)
        }
      });
      toast.success("Saved");
      setDateOpen(false);
      qc.invalidateQueries({
        queryKey: ["holiday-categories"]
      });
    } catch (e2) {
      toast.error(e2?.message ?? "Failed");
    }
  }
  async function removeDate(id) {
    if (!confirm("Remove this date?")) return;
    try {
      await delDate({
        data: {
          id
        }
      });
      qc.invalidateQueries({
        queryKey: ["holiday-categories"]
      });
    } catch (e) {
      toast.error(e?.message ?? "Failed");
    }
  }
  if (loading || user && !rolesLoaded) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "flex min-h-screen items-center justify-center text-muted-foreground", children: "Loading…" });
  }
  if (!user) return /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "flex min-h-screen items-center justify-center text-muted-foreground", children: "Loading…" });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(AppShell, { title: "Holiday categories", subtitle: "Group employees by which public holidays they observe", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Assign categories to employees or departments. Payroll adds these dates on top of country-wide public holidays." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/admin/departments", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", size: "sm", children: "Departments" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", onClick: startNewCat, "data-testid": "add-category", children: "Add category" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-base", children: "Categories" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: isLoading ? "Loading…" : `${categories.length} categor${categories.length === 1 ? "y" : "ies"}` })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-0", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Country" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Name" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Dates" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Default" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Actions" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(TableBody, { children: [
            categories.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { colSpan: 5, className: "text-center text-muted-foreground py-8", children: "No categories yet." }) }),
            categories.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { "data-testid": "category-row", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-mono text-xs", children: c.country_code }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-medium", children: c.name }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", children: datesByCat.get(c.id)?.length ?? 0 }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: c.is_default ? /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { children: "Default" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "—" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { className: "text-right space-x-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", onClick: () => startNewDate(c.id), "data-testid": "add-date", children: "Add date" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: () => startEditCat(c), children: "Edit" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: () => removeCat(c), children: "Delete" })
              ] })
            ] }, c.id))
          ] })
        ] }) })
      ] }),
      categories.map((c) => {
        const ds = datesByCat.get(c.id) ?? [];
        if (ds.length === 0) return null;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "text-sm", children: [
            c.name,
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground font-normal", children: [
              "— ",
              c.country_code
            ] })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-0", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Date" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Name" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Paid" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Multiplier" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Actions" })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: ds.map((d) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-mono text-xs", children: d.holiday_date }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: d.name }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: d.is_paid ? "Yes" : "No" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-xs", children: d.pay_multiplier ?? "—" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: () => removeDate(d.id), children: "Remove" }) })
            ] }, d.id)) })
          ] }) })
        ] }, `d_${c.id}`);
      })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: catOpen, onOpenChange: setCatOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: catForm.id ? "Edit category" : "Add category" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: saveCatSubmit, className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Country" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: catForm.country_code, onValueChange: (v) => setCatForm({
            ...catForm,
            country_code: v
          }), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { "data-testid": "category-country", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: countries.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: c.code, children: [
              c.name,
              " (",
              c.code,
              ")"
            ] }, c.code)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Name" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: catForm.name, onChange: (e) => setCatForm({
            ...catForm,
            name: e.target.value
          }), required: true, "data-testid": "category-name" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "outline", onClick: () => setCatOpen(false), children: "Cancel" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", "data-testid": "category-save", children: "Save" })
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: dateOpen, onOpenChange: setDateOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Add observed date" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: saveDateSubmit, className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: dateForm.holiday_date, onChange: (e) => setDateForm({
            ...dateForm,
            holiday_date: e.target.value
          }), required: true, "data-testid": "date-date" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Name" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: dateForm.name, onChange: (e) => setDateForm({
            ...dateForm,
            name: e.target.value
          }), required: true, "data-testid": "date-name" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Pay multiplier (optional)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.05", min: 1, max: 10, value: dateForm.pay_multiplier, placeholder: "Country default", onChange: (e) => setDateForm({
            ...dateForm,
            pay_multiplier: e.target.value
          }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "outline", onClick: () => setDateOpen(false), children: "Cancel" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", "data-testid": "date-save", children: "Save" })
        ] })
      ] })
    ] }) })
  ] });
}
const SplitComponent = () => /* @__PURE__ */ jsxRuntimeExports.jsx(AdminGate, { allow: ORG_ADMIN_ONLY, children: /* @__PURE__ */ jsxRuntimeExports.jsx(HolidayCategoriesPage, {}) });
export {
  SplitComponent as component
};
