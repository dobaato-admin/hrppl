import { j as jsxRuntimeExports, r as reactExports } from "../_libs/react.mjs";
import { a as useServerFn, aF as listBiometricDevices, aG as upsertBiometricDevice, aH as rotateDeviceSecret, aI as listMappings, aJ as upsertMapping, aK as listPunches, C as Card, b as CardHeader, c as CardTitle, e as CardContent, f as Badge, d as CardDescription, B as Button } from "./router-CLxirH5A.mjs";
import { s as supabase } from "./client-BLUqAwhM.mjs";
import { A as AppShell } from "./AppShell-fbDALlr7.mjs";
import { I as Input } from "./input-C6yqZkRy.mjs";
import { L as Label } from "./label-Cbju7vgw.mjs";
import { C as Checkbox } from "./checkbox-Dj6wn8_T.mjs";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-Bk9id1Ls.mjs";
import { T as Table, a as TableHeader, b as TableRow, c as TableHead, d as TableBody, e as TableCell } from "./table-DBQt_Juv.mjs";
import { T as Tabs, a as TabsList, b as TabsTrigger, c as TabsContent } from "./tabs-CuOXr1L0.mjs";
import { D as Dialog, a as DialogContent, b as DialogHeader, c as DialogTitle, e as DialogFooter } from "./dialog-UIV2CpIo.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { A as AdminGate } from "./AdminGate-B3-x5ytD.mjs";
import { A as ADMIN_LAYOUT_ROLES } from "./rbac-BWg_Nf1T.mjs";
import { u as useMyTenantId } from "./use-tenant-B3EuiYSY.mjs";
import "../_libs/seroval.mjs";
import "../_libs/lovable.dev__mcp-js.mjs";
import "../_libs/modelcontextprotocol__sdk.mjs";
import "../_libs/zod-to-json-schema.mjs";
import "../_libs/ajv-formats.mjs";
import { H as FingerprintPattern, aF as RefreshCw, aL as Copy, aa as Plus } from "../_libs/lucide-react.mjs";
import "../_libs/tanstack__query-core.mjs";
import "../_libs/tanstack__react-query.mjs";
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
import "../_libs/radix-ui__react-checkbox.mjs";
import "../_libs/radix-ui__react-use-previous.mjs";
import "../_libs/radix-ui__react-select.mjs";
import "../_libs/radix-ui__number.mjs";
import "../_libs/radix-ui__react-tabs.mjs";
const BIOMETRIC_VENDORS = [
  // Top global enterprise
  { code: "zkteco", label: "ZKTeco (ZKBio / BioTime)" },
  { code: "suprema", label: "Suprema BioStar" },
  { code: "hikvision", label: "Hikvision" },
  { code: "dahua", label: "Dahua" },
  { code: "anviz", label: "Anviz" },
  { code: "fingertec", label: "FingerTec" },
  { code: "hid", label: "HID Global" },
  { code: "idemia", label: "IDEMIA (Morpho)" },
  { code: "nec", label: "NEC" },
  { code: "matrix", label: "Matrix Comsec" },
  { code: "realtime", label: "Realtime" },
  { code: "essl", label: "eSSL" },
  { code: "secugen", label: "SecuGen" },
  { code: "biomax", label: "Biomax" },
  { code: "virdi", label: "Virdi (Union Community)" },
  { code: "invixium", label: "Invixium" },
  { code: "princeton", label: "Princeton Identity" },
  { code: "iris-id", label: "Iris ID" },
  { code: "crossmatch", label: "Crossmatch / HID" },
  { code: "lumidigm", label: "Lumidigm" },
  // Australia / APAC popular
  { code: "honeywell", label: "Honeywell" },
  { code: "bosch", label: "Bosch Security" },
  { code: "gallagher", label: "Gallagher (AU)" },
  { code: "inner-range", label: "Inner Range (AU)" },
  { code: "tensor", label: "Tensor" },
  { code: "aussie-time-sheets", label: "Aussie Time Sheets (AU)" },
  { code: "ikeyless", label: "iKeyless / ASSA ABLOY" },
  { code: "kone", label: "KONE Access" },
  { code: "axis", label: "Axis Communications" },
  { code: "paxton", label: "Paxton" },
  // Software-defined / generic fallback
  { code: "kisi", label: "Kisi (cloud)" },
  { code: "openpath", label: "Openpath / Avigilon Alta" },
  { code: "generic", label: "Generic webhook / CSV" }
];
function BiometricPage() {
  const {
    tenantId
  } = useMyTenantId();
  const listDev = useServerFn(listBiometricDevices);
  const upDev = useServerFn(upsertBiometricDevice);
  const rotate = useServerFn(rotateDeviceSecret);
  const listMap = useServerFn(listMappings);
  const upMap = useServerFn(upsertMapping);
  const listP = useServerFn(listPunches);
  const [devices, setDevices] = reactExports.useState([]);
  const [employees, setEmployees] = reactExports.useState([]);
  const [active, setActive] = reactExports.useState(null);
  const [mappings, setMappings] = reactExports.useState([]);
  const [punches, setPunches] = reactExports.useState([]);
  const [open, setOpen] = reactExports.useState(false);
  const [editing, setEditing] = reactExports.useState({
    name: "",
    vendor: "zkteco",
    is_active: true,
    config: {}
  });
  const [newMap, setNewMap] = reactExports.useState({
    raw_user_id: "",
    employee_id: ""
  });
  async function refreshDevices() {
    const r = await listDev();
    setDevices(r.devices);
  }
  async function refreshActive(id) {
    const [m, p] = await Promise.all([listMap({
      data: {
        device_id: id
      }
    }), listP({
      data: {
        device_id: id,
        limit: 100
      }
    })]);
    setMappings(m.mappings);
    setPunches(p.punches);
  }
  reactExports.useEffect(() => {
    refreshDevices();
    if (!tenantId) return;
    supabase.from("employees").select("id,first_name,last_name").eq("tenant_id", tenantId).eq("status", "active").limit(500).order("first_name").then(({
      data
    }) => setEmployees(data ?? []));
  }, [tenantId]);
  reactExports.useEffect(() => {
    if (active) refreshActive(active.id);
  }, [active]);
  async function save() {
    if (!editing.name.trim()) return toast.error("Name required");
    try {
      const r = await upDev({
        data: editing
      });
      toast.success("Saved");
      setOpen(false);
      await refreshDevices();
      if (r.device) setActive(r.device);
    } catch (e) {
      toast.error(e.message);
    }
  }
  async function doRotate() {
    if (!active) return;
    const r = await rotate({
      data: {
        id: active.id
      }
    });
    setActive(r.device);
    await refreshDevices();
    toast.success("Secrets rotated — update your device config");
  }
  async function addMapping() {
    if (!active || !newMap.raw_user_id || !newMap.employee_id) return;
    await upMap({
      data: {
        device_id: active.id,
        ...newMap
      }
    });
    setNewMap({
      raw_user_id: "",
      employee_id: ""
    });
    await refreshActive(active.id);
  }
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const webhookUrl = active ? `${baseUrl}/api/public/biometric/${active.webhook_token}` : "";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(AppShell, { title: "Biometric attendance", subtitle: "Devices, user mappings and punch history", actions: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => {
    setEditing({
      name: "",
      vendor: "zkteco",
      is_active: true,
      config: {}
    });
    setOpen(true);
  }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4 mr-1" }),
    " Add device"
  ] }), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 md:p-6 grid gap-4 lg:grid-cols-[280px_1fr]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-base", children: "Devices" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-1", children: [
          devices.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "No devices yet." }),
          devices.map((d) => /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setActive(d), className: "w-full text-left rounded-md border p-2 hover:bg-muted " + (active?.id === d.id ? "bg-muted border-primary" : ""), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm font-medium flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(FingerprintPattern, { className: "h-3.5 w-3.5" }),
                " ",
                d.name
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: d.is_active ? "secondary" : "outline", className: "text-[10px] capitalize", children: d.vendor })
            ] }),
            d.location && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: d.location }),
            d.last_punch_at && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[10px] text-muted-foreground", children: [
              "Last: ",
              new Date(d.last_punch_at).toLocaleString()
            ] })
          ] }, d.id))
        ] })
      ] }),
      active ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "flex flex-row items-center justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { children: active.name }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(CardDescription, { children: [
                active.vendor.toUpperCase(),
                " • ",
                active.device_serial ?? "no serial"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", onClick: () => {
                setEditing(active);
                setOpen(true);
              }, children: "Edit" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: doRotate, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "h-3.5 w-3.5 mr-1" }),
                "Rotate"
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Webhook URL (push punches)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 mt-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { readOnly: true, value: webhookUrl, className: "font-mono text-xs" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "outline", onClick: () => {
                  navigator.clipboard.writeText(webhookUrl);
                  toast.success("Copied");
                }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Copy, { className: "h-3.5 w-3.5" }) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[11px] text-muted-foreground mt-1", children: [
                "POST a JSON body of ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("code", { children: "{punches:[{raw_user_id,punch_at,punch_type}]}" }),
                " with header ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("code", { children: "X-Device-Secret: <shared_secret>" }),
                ". For ZKTeco BioTime: configure HTTP push with the same structure or schedule a poller calling your BioTime instance and forwarding here."
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Shared secret (sign each request)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { readOnly: true, value: active.shared_secret, className: "font-mono text-xs" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { defaultValue: "mappings", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "mappings", children: "User mappings" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "punches", children: "Recent punches" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "mappings", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-base", children: "Map device user IDs to employees" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-2 md:grid-cols-[1fr_2fr_auto]", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Device user ID (e.g. 1023)", value: newMap.raw_user_id, onChange: (e) => setNewMap({
                  ...newMap,
                  raw_user_id: e.target.value
                }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: newMap.employee_id, onValueChange: (v) => setNewMap({
                  ...newMap,
                  employee_id: v
                }), children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select employee" }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: employees.map((e) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: e.id, children: [
                    e.first_name,
                    " ",
                    e.last_name
                  ] }, e.id)) })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: addMapping, children: "Add" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Device ID" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Employee" })
                ] }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: mappings.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-mono text-xs", children: m.raw_user_id }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { children: [
                    m.employees?.first_name,
                    " ",
                    m.employees?.last_name
                  ] })
                ] }, m.id)) })
              ] })
            ] })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "punches", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-0", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "When" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "User" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Type" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Source" })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: punches.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-xs", children: new Date(p.punch_at).toLocaleString() }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: p.employees ? `${p.employees.first_name} ${p.employees.last_name}` : /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground", children: [
                "Unmapped: ",
                p.raw_user_id
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", className: "capitalize", children: p.punch_type }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-xs text-muted-foreground", children: p.source })
            ] }, p.id)) })
          ] }) }) }) })
        ] })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-10 text-center text-muted-foreground", children: "Select or create a device to begin." }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: setOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editing.id ? "Edit device" : "Add device" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Name" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: editing.name, onChange: (e) => setEditing({
            ...editing,
            name: e.target.value
          }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Vendor" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: editing.vendor, onValueChange: (v) => setEditing({
            ...editing,
            vendor: v
          }), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Pick a vendor" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { className: "max-h-72", children: BIOMETRIC_VENDORS.map((v) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: v.code, children: v.label }, v.code)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 md:grid-cols-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Device serial" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: editing.device_serial ?? "", onChange: (e) => setEditing({
              ...editing,
              device_serial: e.target.value
            }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "IP address" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: editing.ip_address ?? "", onChange: (e) => setEditing({
              ...editing,
              ip_address: e.target.value
            }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "md:col-span-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Location" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: editing.location ?? "", onChange: (e) => setEditing({
              ...editing,
              location: e.target.value
            }), placeholder: "Main reception" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { checked: editing.is_active, onCheckedChange: (v) => setEditing({
            ...editing,
            is_active: !!v
          }) }),
          " Active"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogFooter, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: save, children: "Save" }) })
    ] }) })
  ] });
}
const SplitComponent = () => /* @__PURE__ */ jsxRuntimeExports.jsx(AdminGate, { allow: ADMIN_LAYOUT_ROLES, children: /* @__PURE__ */ jsxRuntimeExports.jsx(BiometricPage, {}) });
export {
  SplitComponent as component
};
