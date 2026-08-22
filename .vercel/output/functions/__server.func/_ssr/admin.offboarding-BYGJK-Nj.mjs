import { j as jsxRuntimeExports, r as reactExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { a as useServerFn, C as Card, b as CardHeader, c as CardTitle, e as CardContent, T as Textarea, B as Button, f as Badge, d as CardDescription } from "./router-CLxirH5A.mjs";
import { u as useQueryClient, a as useQuery, c as useMutation } from "../_libs/tanstack__react-query.mjs";
import { A as AppShell } from "./AppShell-fbDALlr7.mjs";
import { I as Input } from "./input-C6yqZkRy.mjs";
import { L as Label } from "./label-Cbju7vgw.mjs";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-Bk9id1Ls.mjs";
import { S as Switch } from "./switch-B3SbfIg0.mjs";
import { T as Tabs, a as TabsList, b as TabsTrigger, c as TabsContent } from "./tabs-CuOXr1L0.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { a as listEmployeesForAdmin } from "./timeline.functions-MTkYDU8o.mjs";
import { l as listDepartments } from "./departments.functions-Bik-dsTc.mjs";
import { l as listOffboarding, c as createOffboarding, g as getOffboarding, u as updateOffboarding, t as toggleChecklistItem, a as addChecklistItem, b as listOffboardingTemplates, d as upsertOffboardingTemplate, e as deleteOffboardingTemplate, f as upsertOffboardingTemplateItem, h as deleteOffboardingTemplateItem } from "./offboarding.functions-CAFoqO01.mjs";
import { A as AdminGate } from "./AdminGate-B3-x5ytD.mjs";
import { b as OFFBOARDING_ROLES } from "./rbac-BWg_Nf1T.mjs";
import { C as Checkbox } from "./checkbox-Dj6wn8_T.mjs";
import { c as createSsrRpc } from "./createSsrRpc-CRedQJGY.mjs";
import { r as requireSupabaseAuth } from "./auth-guard-CkYFJuQL.mjs";
import { c as createServerFn } from "./server-BOi2EjMN.mjs";
import "../_libs/lovable.dev__mcp-js.mjs";
import "../_libs/modelcontextprotocol__sdk.mjs";
import "../_libs/zod-to-json-schema.mjs";
import "../_libs/ajv-formats.mjs";
import "../_libs/seroval.mjs";
import { ak as CircleCheck, al as CircleAlert, D as Download, aK as History, aa as Plus } from "../_libs/lucide-react.mjs";
import { a as objectType, z as stringType, C as numberType, A as booleanType, B as enumType } from "../_libs/zod.mjs";
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
import "../_libs/radix-ui__react-select.mjs";
import "../_libs/radix-ui__number.mjs";
import "../_libs/radix-ui__react-use-previous.mjs";
import "../_libs/radix-ui__react-switch.mjs";
import "../_libs/radix-ui__react-tabs.mjs";
import "../_libs/radix-ui__react-checkbox.mjs";
const listCommsRemoval = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  caseId: stringType().uuid()
}).parse(d)).handler(createSsrRpc("c9f805d45d3e154e1e767cf4bdd15bbf7b164d2494a0b25d87c8f051571bee4e"));
const updateCommsRemoval = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid(),
  removed: booleanType(),
  evidence_url: stringType().url().max(1e3).optional().nullable(),
  attestation_signature: stringType().trim().max(200).optional().nullable(),
  notes: stringType().trim().max(2e3).optional().nullable(),
  due_date: stringType().optional().nullable(),
  reminder_interval_days: numberType().int().min(1).max(30).optional(),
  escalate_after_days: numberType().int().min(1).max(60).optional()
}).parse(d)).handler(createSsrRpc("07fa5ac2761abe5c6217fa395ab0fc1612414652211b10c693020811c07ed840"));
const addCustomCommsChannel = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  caseId: stringType().uuid(),
  channel: stringType().trim().min(2).max(60),
  label: stringType().trim().min(2).max(200)
}).parse(d)).handler(createSsrRpc("a35eb3b0fbfecb75753e7c3decdeed9b71e4a80bb942421020811ff7112b28fe"));
const listCommsAudit = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  caseId: stringType().uuid()
}).parse(d)).handler(createSsrRpc("429b635747bcebe1d45776ee16e57dfa2c4f582ce221126b041564d93fbe1cab"));
const exportCommsRemovalCsv = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  scope: enumType(["all", "gaps"]).default("all"),
  caseId: stringType().uuid().optional()
}).parse(d ?? {})).handler(createSsrRpc("5275e39443dabbb0dd5530019a8375daceb07d802938a3eccf8c3a49b726313a"));
const EVIDENCE_MAX_BYTES = 10 * 1024 * 1024;
const EVIDENCE_ALLOWED_EXTENSIONS = [".pdf", ".png", ".jpg", ".jpeg", ".docx"];
function validateEvidenceUrlClient(url) {
  if (!url) return { ok: true };
  const trimmed = url.trim();
  if (!trimmed) return { ok: true };
  if (trimmed.length > 1e3) return { ok: false, reason: "Link is too long (max 1000 characters). Use a short-link service or upload the file." };
  let u;
  try {
    u = new URL(trimmed);
  } catch {
    return { ok: false, reason: "That doesn't look like a valid URL. Include https:// at the start." };
  }
  if (!/^https?:$/.test(u.protocol)) return { ok: false, reason: "Only http(s) links are allowed. Paste a web link, not a file:// path." };
  const path = u.pathname.toLowerCase();
  const looksLikeFile = /\.[a-z0-9]{2,5}$/.test(path);
  if (looksLikeFile) {
    const ok = EVIDENCE_ALLOWED_EXTENSIONS.some((ext) => path.endsWith(ext));
    if (!ok) return { ok: false, reason: `That file type isn't allowed. Allowed: ${EVIDENCE_ALLOWED_EXTENSIONS.join(", ")}.` };
  }
  return { ok: true };
}
function downloadCsv(name, csv) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1e3);
}
function CommsRemovalPanel({ caseId }) {
  const qc = useQueryClient();
  const fList = useServerFn(listCommsRemoval);
  const fUpdate = useServerFn(updateCommsRemoval);
  const fAdd = useServerFn(addCustomCommsChannel);
  const fExport = useServerFn(exportCommsRemovalCsv);
  const fAudit = useServerFn(listCommsAudit);
  const q = useQuery({ queryKey: ["comms-removal", caseId], queryFn: () => fList({ data: { caseId } }) });
  const [showAudit, setShowAudit] = reactExports.useState(false);
  const [auditFilters, setAuditFilters] = reactExports.useState({});
  const audit = useQuery({ queryKey: ["comms-audit", caseId, auditFilters], queryFn: () => fAudit({ data: { caseId, ...auditFilters } }), enabled: showAudit });
  const upd = useMutation({
    mutationFn: (v) => fUpdate({ data: v }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["comms-removal", caseId] });
      qc.invalidateQueries({ queryKey: ["comms-audit", caseId] });
    },
    onError: (e) => toast.error(e?.message ?? "Save failed")
  });
  const [newCh, setNewCh] = reactExports.useState({ channel: "", label: "" });
  const addM = useMutation({
    mutationFn: () => fAdd({ data: { caseId, channel: newCh.channel, label: newCh.label } }),
    onSuccess: () => {
      setNewCh({ channel: "", label: "" });
      qc.invalidateQueries({ queryKey: ["comms-removal", caseId] });
      toast.success("Channel added");
    },
    onError: (e) => toast.error(e?.message ?? "Add failed")
  });
  const exportM = useMutation({
    mutationFn: (scope) => fExport({ data: { scope, caseId } }),
    onSuccess: (res, scope) => {
      downloadCsv(`comms-removal-${scope}-${caseId.slice(0, 8)}.csv`, res.csv);
      toast.success(`Exported ${res.rowCount} rows`);
    },
    onError: (e) => toast.error(e?.message ?? "Export failed")
  });
  const rows = q.data?.rows ?? [];
  const complete = q.data?.complete;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "flex flex-row items-center justify-between gap-2 flex-wrap", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-sm", children: "Communication channel removal & attestation" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "Verify the staff member has been removed from every channel before closing the case." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        complete ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { className: "bg-emerald-100 text-emerald-700 hover:bg-emerald-100", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-3 w-3 mr-1" }),
          "All verified"
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "destructive", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "h-3 w-3 mr-1" }),
          q.data?.verified ?? 0,
          "/",
          q.data?.total ?? 0,
          " verified"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: () => exportM.mutate("all"), disabled: exportM.isPending, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "h-3 w-3 mr-1" }),
          "All"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: () => exportM.mutate("gaps"), disabled: exportM.isPending, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "h-3 w-3 mr-1" }),
          "Gaps"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "ghost", onClick: () => setShowAudit((v) => !v), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(History, { className: "h-3 w-3 mr-1" }),
          "Audit"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-3", children: [
      q.isLoading && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-muted-foreground", children: "Loading…" }),
      rows.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border rounded-md p-3 space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-start justify-between gap-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Checkbox,
            {
              id: `rm-${r.id}`,
              checked: r.removed,
              onCheckedChange: (v) => upd.mutate({ id: r.id, removed: !!v, evidence_url: r.evidence_url, attestation_signature: r.attestation_signature, notes: r.notes })
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: `rm-${r.id}`, className: "font-medium text-sm", children: r.channel_label }),
            r.is_mandatory && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-2 text-[10px] uppercase text-muted-foreground", children: "required" }),
            r.attested_at && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-emerald-700", children: [
              "Attested ",
              new Date(r.attested_at).toLocaleString(),
              " by ",
              r.attestation_signature
            ] }),
            r.last_reminder_at && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[11px] text-muted-foreground", children: [
              "Last reminder ",
              new Date(r.last_reminder_at).toLocaleDateString(),
              " · sent ",
              r.reminder_count ?? 0,
              "×"
            ] })
          ] })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-2 md:grid-cols-3 pl-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-[11px]", children: "Due date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                type: "date",
                defaultValue: r.due_date ?? "",
                onBlur: (e) => {
                  const v = e.target.value || null;
                  if (v !== (r.due_date ?? null)) upd.mutate({ id: r.id, removed: r.removed, evidence_url: r.evidence_url, attestation_signature: r.attestation_signature, notes: r.notes, due_date: v });
                }
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-[11px]", children: "Remind every (days)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                type: "number",
                min: 1,
                max: 30,
                defaultValue: r.reminder_interval_days ?? 1,
                onBlur: (e) => {
                  const v = Number(e.target.value);
                  if (v && v !== r.reminder_interval_days) upd.mutate({ id: r.id, removed: r.removed, evidence_url: r.evidence_url, attestation_signature: r.attestation_signature, notes: r.notes, reminder_interval_days: v });
                }
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-[11px]", children: "Escalate after (days)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                type: "number",
                min: 1,
                max: 60,
                defaultValue: r.escalate_after_days ?? 3,
                onBlur: (e) => {
                  const v = Number(e.target.value);
                  if (v && v !== r.escalate_after_days) upd.mutate({ id: r.id, removed: r.removed, evidence_url: r.evidence_url, attestation_signature: r.attestation_signature, notes: r.notes, escalate_after_days: v });
                }
              }
            )
          ] })
        ] }),
        r.removed && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-2 md:grid-cols-2 pl-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Evidence URL (screenshot, audit log link)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              EvidenceUrlInput,
              {
                initialValue: r.evidence_url ?? "",
                onCommit: (v) => upd.mutate({ id: r.id, removed: true, evidence_url: v || null, attestation_signature: r.attestation_signature, notes: r.notes })
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Attestation signature (type your name)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                defaultValue: r.attestation_signature ?? "",
                placeholder: "e.g. Jane Doe, IT Lead",
                onBlur: (e) => {
                  const v = e.target.value.trim();
                  if (v && v !== (r.attestation_signature ?? "")) upd.mutate({ id: r.id, removed: true, evidence_url: r.evidence_url, attestation_signature: v, notes: r.notes });
                }
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "md:col-span-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Notes" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                defaultValue: r.notes ?? "",
                placeholder: "Optional: groups left, handover owner, etc.",
                onBlur: (e) => {
                  const v = e.target.value.trim();
                  if (v !== (r.notes ?? "")) upd.mutate({ id: r.id, removed: true, evidence_url: r.evidence_url, attestation_signature: r.attestation_signature, notes: v || null });
                }
              }
            )
          ] })
        ] })
      ] }, r.id)),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t pt-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-medium mb-1", children: "Add custom channel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "key (e.g. notion)", value: newCh.channel, onChange: (e) => setNewCh((s) => ({ ...s, channel: e.target.value })) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Label shown to verifiers", value: newCh.label, onChange: (e) => setNewCh((s) => ({ ...s, label: e.target.value })) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: () => addM.mutate(), disabled: !newCh.channel || !newCh.label || addM.isPending, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-3 w-3 mr-1" }),
            "Add"
          ] })
        ] })
      ] }),
      showAudit && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t pt-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-medium mb-2", children: "Immutable audit trail" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-2 md:grid-cols-5 mb-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Channel (slack…)", className: "h-8 text-xs", value: auditFilters.channel ?? "", onChange: (e) => setAuditFilters((s) => ({ ...s, channel: e.target.value || void 0 })) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Actor name/email", className: "h-8 text-xs", value: auditFilters.actorSearch ?? "", onChange: (e) => setAuditFilters((s) => ({ ...s, actorSearch: e.target.value || void 0 })) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", className: "h-8 text-xs", value: auditFilters.startDate ?? "", onChange: (e) => setAuditFilters((s) => ({ ...s, startDate: e.target.value || void 0 })) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", className: "h-8 text-xs", value: auditFilters.endDate ?? "", onChange: (e) => setAuditFilters((s) => ({ ...s, endDate: e.target.value || void 0 })) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-1 text-[11px]", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { checked: !!auditFilters.includeArchive, onCheckedChange: (v) => setAuditFilters((s) => ({ ...s, includeArchive: !!v })) }),
            "Include archive"
          ] })
        ] }),
        audit.isLoading && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: "Loading…" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-h-64 overflow-auto text-xs space-y-1", children: [
          (audit.data?.rows ?? []).map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between gap-2 border-b py-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: r.action }),
              " · ",
              r.channel,
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[11px] text-muted-foreground", children: [
                r.actor_name ?? r.actor_email ?? "system",
                " · ",
                new Date(r.created_at).toLocaleString()
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[11px] text-muted-foreground max-w-[50%] truncate", title: JSON.stringify(r.after), children: [
              r.after?.evidence_url && /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: r.after.evidence_url, target: "_blank", rel: "noopener noreferrer", className: "text-blue-600 underline", children: "evidence" }),
              r.after?.attestation_signature && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                " · ",
                r.after.attestation_signature
              ] })
            ] })
          ] }, r.id)),
          !audit.isLoading && (audit.data?.rows ?? []).length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-muted-foreground", children: "No events match these filters." })
        ] })
      ] })
    ] })
  ] });
}
function EvidenceUrlInput({ initialValue, onCommit }) {
  const [value, setValue] = reactExports.useState(initialValue);
  const [error, setError] = reactExports.useState(null);
  const validate = (v) => {
    const r = validateEvidenceUrlClient(v);
    setError(r.ok ? null : r.reason);
    return r.ok;
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Input,
      {
        value,
        placeholder: "https://… (PDF, PNG, JPG, DOCX — max 10 MB)",
        onChange: (e) => {
          setValue(e.target.value);
          if (error) validate(e.target.value);
        },
        onBlur: (e) => {
          const v = e.target.value.trim();
          if (v === initialValue) return;
          if (!validate(v)) {
            toast.error(error ?? "Invalid evidence link");
            return;
          }
          onCommit(v);
        },
        "aria-invalid": !!error,
        className: error ? "border-destructive" : ""
      }
    ),
    error && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] text-destructive mt-1", children: error }),
    !error && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[10px] text-muted-foreground mt-1", children: [
      "Allowed file types: ",
      EVIDENCE_ALLOWED_EXTENSIONS.join(", "),
      " · max ",
      EVIDENCE_MAX_BYTES / 1024 / 1024,
      " MB."
    ] })
  ] });
}
const REASONS = ["resignation", "termination", "redundancy", "retirement", "end_of_contract", "mutual_separation", "death", "other"];
const STATUSES = ["initiated", "in_progress", "clearance_pending", "completed", "cancelled"];
function OffboardingPage() {
  const qc = useQueryClient();
  const fList = useServerFn(listOffboarding);
  const fCreate = useServerFn(createOffboarding);
  const fGet = useServerFn(getOffboarding);
  const fUpdate = useServerFn(updateOffboarding);
  const fToggle = useServerFn(toggleChecklistItem);
  const fAdd = useServerFn(addChecklistItem);
  const fEmps = useServerFn(listEmployeesForAdmin);
  const empsQ = useQuery({
    queryKey: ["emps-admin"],
    queryFn: () => fEmps()
  });
  const listQ = useQuery({
    queryKey: ["offboarding"],
    queryFn: () => fList()
  });
  const [selectedId, setSelectedId] = reactExports.useState(null);
  const detailQ = useQuery({
    queryKey: ["offboarding", selectedId],
    queryFn: () => fGet({
      data: {
        id: selectedId
      }
    }),
    enabled: !!selectedId
  });
  const [form, setForm] = reactExports.useState({
    employeeId: "",
    reason: "resignation",
    reasonNotes: "",
    noticeGivenOn: "",
    lastWorkingDay: "",
    confidential: false
  });
  const createM = useMutation({
    mutationFn: () => fCreate({
      data: form
    }),
    onSuccess: (r) => {
      toast.success("Offboarding initiated");
      qc.invalidateQueries({
        queryKey: ["offboarding"]
      });
      setForm({
        employeeId: "",
        reason: "resignation",
        reasonNotes: "",
        noticeGivenOn: "",
        lastWorkingDay: "",
        confidential: false
      });
      setSelectedId(r?.case?.id ?? null);
    },
    onError: (e) => toast.error(e.message)
  });
  const statusM = useMutation({
    mutationFn: (status) => fUpdate({
      data: {
        id: selectedId,
        status
      }
    }),
    onSuccess: () => {
      toast.success("Updated");
      qc.invalidateQueries({
        queryKey: ["offboarding"]
      });
      qc.invalidateQueries({
        queryKey: ["offboarding", selectedId]
      });
    }
  });
  const toggleM = useMutation({
    mutationFn: (v) => fToggle({
      data: {
        itemId: v.id,
        completed: v.completed
      }
    }),
    onSuccess: () => qc.invalidateQueries({
      queryKey: ["offboarding", selectedId]
    })
  });
  const [newItem, setNewItem] = reactExports.useState({
    title: "",
    category: "general",
    ownerRole: "hr",
    dueDate: "",
    isBlocking: false
  });
  const addM = useMutation({
    mutationFn: () => fAdd({
      data: {
        caseId: selectedId,
        ...newItem
      }
    }),
    onSuccess: () => {
      setNewItem({
        title: "",
        category: "general",
        ownerRole: "hr",
        dueDate: "",
        isBlocking: false
      });
      qc.invalidateQueries({
        queryKey: ["offboarding", selectedId]
      });
    }
  });
  const [interview, setInterview] = reactExports.useState({
    exitInterviewNotes: "",
    exitInterviewRating: 3,
    rehireEligible: true,
    knowledgeTransferNotes: "",
    finalPayStatus: ""
  });
  const saveInterviewM = useMutation({
    mutationFn: () => fUpdate({
      data: {
        id: selectedId,
        ...interview
      }
    }),
    onSuccess: () => {
      toast.success("Saved");
      qc.invalidateQueries({
        queryKey: ["offboarding", selectedId]
      });
    }
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AppShell, { title: "Exit & offboarding", subtitle: "Manage employee exits, clearance, asset return, exit interviews and final pay.", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { defaultValue: "cases", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "cases", children: "Cases" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "templates", children: "Checklist templates" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "cases", className: "mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 lg:grid-cols-[1fr_2fr]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-base", children: "Initiate offboarding" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Employee" }),
              empsQ.data?.noTenantScope ? (
                // A platform account with no tenant. Previously this listed
                // every employee in every tenant and then failed on insert;
                // say what's wrong instead.
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "rounded border border-dashed p-3 text-sm text-muted-foreground", children: [
                  "Your account isn’t attached to an organization, so there are no employees to offboard. Open the organization from",
                  " ",
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/platform/tenants", className: "underline", children: "Tenants" }),
                  " first."
                ] })
              ) : /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.employeeId, onValueChange: (v) => setForm({
                ...form,
                employeeId: v
              }), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select employee" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: (empsQ.data?.employees ?? []).map((e) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: e.id, children: [
                  e.first_name,
                  " ",
                  e.last_name
                ] }, e.id)) })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Reason" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.reason, onValueChange: (v) => setForm({
                ...form,
                reason: v
              }), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: REASONS.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: r, className: "capitalize", children: r.replace(/_/g, " ") }, r)) })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notice given" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.noticeGivenOn, onChange: (e) => setForm({
                  ...form,
                  noticeGivenOn: e.target.value
                }) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Last working day" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.lastWorkingDay, onChange: (e) => setForm({
                  ...form,
                  lastWorkingDay: e.target.value
                }) })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, value: form.reasonNotes, onChange: (e) => setForm({
                ...form,
                reasonNotes: e.target.value
              }) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between rounded border p-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Confidential (HR only)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { checked: form.confidential, onCheckedChange: (v) => setForm({
                ...form,
                confidential: v
              }) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { disabled: !form.employeeId || createM.isPending, onClick: () => createM.mutate(), className: "w-full", children: createM.isPending ? "Saving…" : "Initiate offboarding" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-base", children: "Open cases" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-2", children: [
            (listQ.data?.cases ?? []).map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setSelectedId(c.id), className: `w-full rounded border p-2 text-left text-sm hover:bg-accent ${selectedId === c.id ? "border-primary" : ""}`, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-medium", children: [
                  c.employees?.first_name,
                  " ",
                  c.employees?.last_name
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "capitalize", children: c.reason.replace(/_/g, " ") }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "capitalize ml-auto", children: c.status.replace(/_/g, " ") })
              ] }),
              c.last_working_day && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-xs text-muted-foreground", children: [
                "Last day: ",
                c.last_working_day
              ] })
            ] }, c.id)),
            (listQ.data?.cases ?? []).length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "No cases yet." })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-4", children: !selectedId ? /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-6 text-sm text-muted-foreground", children: "Select a case to manage clearance, exit interview and final steps." }) }) : detailQ.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-6 text-sm", children: "Loading…" }) }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-base", children: "Case overview" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-2 text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-medium", children: [
                detailQ.data?.case?.employees?.first_name,
                " ",
                detailQ.data?.case?.employees?.last_name
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "capitalize", children: detailQ.data?.case?.reason?.replace(/_/g, " ") }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/admin/employees/$employeeId", params: {
                employeeId: detailQ.data?.case?.employee_id
              }, className: "text-xs text-primary hover:underline ml-auto", children: "Full record →" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-2", children: STATUSES.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: detailQ.data?.case?.status === s ? "default" : "outline", onClick: () => statusM.mutate(s), className: "capitalize", children: s.replace(/_/g, " ") }, s)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-base", children: "Clearance checklist" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-2", children: [
            (detailQ.data?.items ?? []).map((it) => /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-start gap-2 rounded border p-2 text-sm", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", checked: it.completed, onChange: (e) => toggleM.mutate({
                id: it.id,
                completed: e.target.checked
              }), className: "mt-1" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: it.completed ? "line-through text-muted-foreground" : "font-medium", children: it.title }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "capitalize", children: it.owner_role }),
                it.is_blocking && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", children: "Blocking" }),
                it.due_date && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-muted-foreground ml-auto", children: [
                  "Due ",
                  it.due_date
                ] })
              ] }) })
            ] }, it.id)),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 grid grid-cols-1 gap-2 rounded border p-2 md:grid-cols-5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "New task title", value: newItem.title, onChange: (e) => setNewItem({
                ...newItem,
                title: e.target.value
              }), className: "md:col-span-2" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: newItem.ownerRole, onValueChange: (v) => setNewItem({
                ...newItem,
                ownerRole: v
              }), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: ["hr", "manager", "employee", "it", "finance"].map((r) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: r, className: "capitalize", children: r }, r)) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: newItem.dueDate, onChange: (e) => setNewItem({
                ...newItem,
                dueDate: e.target.value
              }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { disabled: !newItem.title || addM.isPending, onClick: () => addM.mutate(), children: "Add" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-base", children: "Exit interview & final" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Exit interview notes" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 3, value: interview.exitInterviewNotes, onChange: (e) => setInterview({
                ...interview,
                exitInterviewNotes: e.target.value
              }) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Overall rating (1–5)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: 1, max: 5, value: interview.exitInterviewRating, onChange: (e) => setInterview({
                  ...interview,
                  exitInterviewRating: Number(e.target.value)
                }) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between rounded border p-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Eligible for rehire" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { checked: interview.rehireEligible, onCheckedChange: (v) => setInterview({
                  ...interview,
                  rehireEligible: v
                }) })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Knowledge transfer" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, value: interview.knowledgeTransferNotes, onChange: (e) => setInterview({
                ...interview,
                knowledgeTransferNotes: e.target.value
              }) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Final pay status" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: interview.finalPayStatus, onChange: (e) => setInterview({
                ...interview,
                finalPayStatus: e.target.value
              }), placeholder: "e.g. processed, pending tax, paid on 2026-07-05" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => saveInterviewM.mutate(), disabled: saveInterviewM.isPending, className: "w-full", children: saveInterviewM.isPending ? "Saving…" : "Save exit details" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CommsRemovalPanel, { caseId: selectedId })
      ] }) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "templates", className: "mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(TemplatesPanel, {}) })
  ] }) }) });
}
const REASON_OPTIONS = ["any", "resignation", "termination", "redundancy", "retirement", "end_of_contract", "mutual_separation", "death", "other"];
const OWNER_ROLES = ["hr", "manager", "employee", "it", "finance"];
function TemplatesPanel() {
  const qc = useQueryClient();
  const fList = useServerFn(listOffboardingTemplates);
  const fUpsert = useServerFn(upsertOffboardingTemplate);
  const fDelete = useServerFn(deleteOffboardingTemplate);
  const fUpsertItem = useServerFn(upsertOffboardingTemplateItem);
  const fDeleteItem = useServerFn(deleteOffboardingTemplateItem);
  const fDepts = useServerFn(listDepartments);
  const tplQ = useQuery({
    queryKey: ["offb-templates"],
    queryFn: () => fList()
  });
  const deptQ = useQuery({
    queryKey: ["depts"],
    queryFn: () => fDepts()
  });
  const [editing, setEditing] = reactExports.useState(null);
  const [form, setForm] = reactExports.useState({
    name: "",
    description: "",
    departmentId: "any",
    reason: "any",
    isDefault: false,
    isActive: true
  });
  const [newItem, setNewItem] = reactExports.useState({
    title: "",
    category: "general",
    ownerRole: "hr",
    dueOffsetDays: 0,
    isBlocking: false,
    sortOrder: 100
  });
  const startNew = () => {
    setEditing({
      id: null
    });
    setForm({
      name: "",
      description: "",
      departmentId: "any",
      reason: "any",
      isDefault: false,
      isActive: true
    });
  };
  const startEdit = (t) => {
    setEditing(t);
    setForm({
      name: t.name,
      description: t.description ?? "",
      departmentId: t.department_id ?? "any",
      reason: t.reason ?? "any",
      isDefault: t.is_default,
      isActive: t.is_active
    });
  };
  const saveM = useMutation({
    mutationFn: () => fUpsert({
      data: {
        id: editing?.id ?? void 0,
        name: form.name,
        description: form.description || void 0,
        departmentId: form.departmentId === "any" ? null : form.departmentId,
        reason: form.reason === "any" ? null : form.reason,
        isDefault: form.isDefault,
        isActive: form.isActive
      }
    }),
    onSuccess: (r) => {
      toast.success("Template saved");
      qc.invalidateQueries({
        queryKey: ["offb-templates"]
      });
      setEditing({
        id: r.id
      });
    },
    onError: (e) => toast.error(e.message)
  });
  const deleteM = useMutation({
    mutationFn: (id) => fDelete({
      data: {
        id
      }
    }),
    onSuccess: () => {
      toast.success("Deleted");
      qc.invalidateQueries({
        queryKey: ["offb-templates"]
      });
      setEditing(null);
    }
  });
  const addItemM = useMutation({
    mutationFn: () => fUpsertItem({
      data: {
        templateId: editing.id,
        ...newItem
      }
    }),
    onSuccess: () => {
      setNewItem({
        title: "",
        category: "general",
        ownerRole: "hr",
        dueOffsetDays: 0,
        isBlocking: false,
        sortOrder: 100
      });
      qc.invalidateQueries({
        queryKey: ["offb-templates"]
      });
    },
    onError: (e) => toast.error(e.message)
  });
  const delItemM = useMutation({
    mutationFn: (id) => fDeleteItem({
      data: {
        id
      }
    }),
    onSuccess: () => qc.invalidateQueries({
      queryKey: ["offb-templates"]
    })
  });
  const templates = tplQ.data?.templates ?? [];
  const allItems = tplQ.data?.items ?? [];
  const items = editing?.id ? allItems.filter((i) => i.template_id === editing.id) : [];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 lg:grid-cols-[1fr_2fr]", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "flex flex-row items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-base", children: "Templates" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", onClick: startNew, children: "New" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-2", children: [
        templates.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground", children: [
          "No templates yet. Click ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "New" }),
          " to build one."
        ] }),
        templates.map((t) => {
          const dept = (deptQ.data?.departments ?? []).find((d) => d.id === t.department_id);
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => startEdit(t), className: `w-full rounded border p-2 text-left text-sm hover:bg-accent ${editing?.id === t.id ? "border-primary" : ""}`, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: t.name }),
              t.is_default && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { children: "Default" }),
              !t.is_active && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", children: "Inactive" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-xs text-muted-foreground", children: [
              dept ? dept.name : "All departments",
              " · ",
              t.reason ? t.reason.replace(/_/g, " ") : "Any reason"
            ] })
          ] }, t.id);
        })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-4", children: !editing ? /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-6 text-sm text-muted-foreground", children: "Select a template to edit, or create a new one. The most specific match (department + reason) wins when an offboarding case is opened." }) }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-base", children: editing.id ? "Edit template" : "New template" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Name" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.name, onChange: (e) => setForm({
                ...form,
                name: e.target.value
              }) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Department" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.departmentId, onValueChange: (v) => setForm({
                ...form,
                departmentId: v
              }), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "any", children: "All departments" }),
                  (deptQ.data?.departments ?? []).map((d) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: d.id, children: d.name }, d.id))
                ] })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Reason" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.reason, onValueChange: (v) => setForm({
                ...form,
                reason: v
              }), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: REASON_OPTIONS.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: r, className: "capitalize", children: r.replace(/_/g, " ") }, r)) })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2 pt-5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center justify-between rounded border p-2 text-sm", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Default" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { checked: form.isDefault, onCheckedChange: (v) => setForm({
                  ...form,
                  isDefault: v
                }) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center justify-between rounded border p-2 text-sm", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Active" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { checked: form.isActive, onCheckedChange: (v) => setForm({
                  ...form,
                  isActive: v
                }) })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Description" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, value: form.description, onChange: (e) => setForm({
              ...form,
              description: e.target.value
            }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { disabled: !form.name || saveM.isPending, onClick: () => saveM.mutate(), children: editing.id ? "Save changes" : "Create template" }),
            editing.id && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "destructive", onClick: () => {
              if (window.confirm("Delete template?")) deleteM.mutate(editing.id);
            }, children: "Delete" })
          ] })
        ] })
      ] }),
      editing.id && /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-base", children: "Tasks" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-2", children: [
          items.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "No tasks yet. Add the clearance steps that should be created automatically." }),
          items.map((it) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2 rounded border p-2 text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-xs w-8", children: it.sort_order }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: it.title }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "capitalize", children: it.owner_role }),
            it.is_blocking && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", children: "Blocking" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ml-auto text-xs text-muted-foreground", children: [
              "+",
              it.due_offset_days,
              "d"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: () => delItemM.mutate(it.id), children: "Remove" })
          ] }, it.id)),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 grid grid-cols-1 gap-2 rounded border p-2 md:grid-cols-6", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Task title", value: newItem.title, onChange: (e) => setNewItem({
              ...newItem,
              title: e.target.value
            }), className: "md:col-span-2" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: newItem.ownerRole, onValueChange: (v) => setNewItem({
              ...newItem,
              ownerRole: v
            }), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: OWNER_ROLES.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: r, className: "capitalize", children: r }, r)) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", placeholder: "Offset days", value: newItem.dueOffsetDays, onChange: (e) => setNewItem({
              ...newItem,
              dueOffsetDays: Number(e.target.value || 0)
            }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", placeholder: "Order", value: newItem.sortOrder, onChange: (e) => setNewItem({
              ...newItem,
              sortOrder: Number(e.target.value || 0)
            }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { disabled: !newItem.title || addItemM.isPending, onClick: () => addItemM.mutate(), children: "Add task" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 text-xs", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", checked: newItem.isBlocking, onChange: (e) => setNewItem({
              ...newItem,
              isBlocking: e.target.checked
            }) }),
            " Blocking task"
          ] })
        ] })
      ] })
    ] }) })
  ] });
}
const SplitComponent = () => /* @__PURE__ */ jsxRuntimeExports.jsx(AdminGate, { allow: OFFBOARDING_ROLES, children: /* @__PURE__ */ jsxRuntimeExports.jsx(OffboardingPage, {}) });
export {
  SplitComponent as component
};
