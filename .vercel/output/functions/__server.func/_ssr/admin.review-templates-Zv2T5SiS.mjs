import { j as jsxRuntimeExports, r as reactExports } from "../_libs/react.mjs";
import { e as useNavigate, L as Link } from "../_libs/tanstack__react-router.mjs";
import { u as useAuth, a as useServerFn, B as Button, C as Card, b as CardHeader, c as CardTitle, d as CardDescription, T as Textarea, e as CardContent, f as Badge } from "./router-CLxirH5A.mjs";
import { s as supabase } from "./client-BLUqAwhM.mjs";
import { I as Input } from "./input-C6yqZkRy.mjs";
import { L as Label } from "./label-Cbju7vgw.mjs";
import { T as Table, a as TableHeader, b as TableRow, c as TableHead, d as TableBody, e as TableCell } from "./table-DBQt_Juv.mjs";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-Bk9id1Ls.mjs";
import { C as Checkbox } from "./checkbox-Dj6wn8_T.mjs";
import { D as Dialog, f as DialogTrigger, a as DialogContent, b as DialogHeader, c as DialogTitle, e as DialogFooter } from "./dialog-UIV2CpIo.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { l as upsertReviewTemplate, m as deleteReviewTemplate } from "./performance.functions-TqKLDjn5.mjs";
import { b as logTemplateAuditEvent, c as listTemplateAuditLog, g as generateReviewInstances } from "./review-instances.functions-rx0bZwLk.mjs";
import { R as REVIEW_PRESETS, I as INDUSTRIES, g as getPreset } from "./review-presets-D9OC61us.mjs";
import { A as AppShell } from "./AppShell-fbDALlr7.mjs";
import { A as AdminGate } from "./AdminGate-B3-x5ytD.mjs";
import { a as ORG_ADMIN_ONLY } from "./rbac-BWg_Nf1T.mjs";
import "../_libs/seroval.mjs";
import "../_libs/lovable.dev__mcp-js.mjs";
import "../_libs/modelcontextprotocol__sdk.mjs";
import "../_libs/zod-to-json-schema.mjs";
import "../_libs/ajv-formats.mjs";
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
import "../_libs/lucide-react.mjs";
import "../_libs/jose.mjs";
import "../_libs/ajv.mjs";
import "../_libs/fast-deep-equal.mjs";
import "../_libs/json-schema-traverse.mjs";
import "../_libs/fast-uri.mjs";
import "../_libs/radix-ui__react-label.mjs";
import "../_libs/radix-ui__react-primitive.mjs";
import "../_libs/radix-ui__react-select.mjs";
import "../_libs/radix-ui__number.mjs";
import "../_libs/radix-ui__primitive.mjs";
import "../_libs/radix-ui__react-collection.mjs";
import "../_libs/radix-ui__react-context.mjs";
import "../_libs/radix-ui__react-direction.mjs";
import "../_libs/@radix-ui/react-dismissable-layer+[...].mjs";
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
import "../_libs/@radix-ui/react-use-controllable-state+[...].mjs";
import "../_libs/radix-ui__react-use-previous.mjs";
import "../_libs/@radix-ui/react-visually-hidden+[...].mjs";
import "../_libs/aria-hidden.mjs";
import "../_libs/react-remove-scroll.mjs";
import "../_libs/react-remove-scroll-bar.mjs";
import "../_libs/react-style-singleton.mjs";
import "../_libs/get-nonce.mjs";
import "../_libs/use-sidecar.mjs";
import "../_libs/use-callback-ref.mjs";
import "../_libs/radix-ui__react-checkbox.mjs";
import "../_libs/radix-ui__react-presence.mjs";
import "../_libs/radix-ui__react-dialog.mjs";
import "../_libs/radix-ui__react-popover.mjs";
import "../_libs/cmdk.mjs";
import "./onboarding.functions-BzLphvXk.mjs";
import "./hrppl-icon-DgSw_-Bc.mjs";
import "./separator-D6YV3GQ2.mjs";
import "../_libs/radix-ui__react-separator.mjs";
import "../_libs/radix-ui__react-tooltip.mjs";
import "../_libs/radix-ui__react-accordion.mjs";
import "../_libs/radix-ui__react-collapsible.mjs";
import "../_libs/radix-ui__react-dropdown-menu.mjs";
import "../_libs/radix-ui__react-menu.mjs";
import "../_libs/radix-ui__react-roving-focus.mjs";
import "./monday-Dpwrcz0o.mjs";
function validateTemplate(draft) {
  const issues = [];
  if (!draft.name?.trim()) issues.push({ field: "name", message: "Template name is required." });
  if (draft.scaleMax <= draft.scaleMin) {
    issues.push({ field: "scale", message: "Scale max must be greater than scale min." });
  }
  const totalWeight = draft.competencies.reduce((s, c) => s + (Number(c.weight) || 0), 0);
  if (draft.competencies.some((c) => c.weight != null) && totalWeight > 100.0001) {
    issues.push({ field: "weight", message: `Weights total ${totalWeight}% — must be ≤ 100%.` });
  }
  const seenIds = /* @__PURE__ */ new Set();
  draft.competencies.forEach((c, i) => {
    const ctx = { itemIndex: i, itemId: c.id };
    if (!c.label?.trim()) issues.push({ ...ctx, field: "label", message: "Label is required." });
    if (seenIds.has(c.id)) issues.push({ ...ctx, field: "id", message: "Duplicate item id." });
    seenIds.add(c.id);
    const numeric = ["number", "percentage", "currency", "range", "scale"].includes(c.type);
    if (numeric) {
      if (c.min != null && c.max != null && Number(c.min) > Number(c.max)) {
        issues.push({ ...ctx, field: "minmax", message: "Min must be ≤ Max." });
      }
      if (c.target != null && c.target !== "") {
        const t = Number(c.target);
        if (!Number.isNaN(t)) {
          if (c.min != null && t < Number(c.min)) issues.push({ ...ctx, field: "target", message: "Target is below Min." });
          if (c.max != null && t > Number(c.max)) issues.push({ ...ctx, field: "target", message: "Target exceeds Max." });
        }
      }
      if (c.type === "percentage") {
        if ((c.min ?? 0) < 0 || (c.max ?? 100) > 100) {
          issues.push({ ...ctx, field: "minmax", message: "Percentage must stay within 0–100." });
        }
      }
    }
    if (c.type === "yes_no") {
      if ((c.yesLabel?.length ?? 0) > 40 || (c.noLabel?.length ?? 0) > 40) {
        issues.push({ ...ctx, field: "yesno", message: "Yes/No labels must be ≤ 40 chars." });
      }
    }
    if (c.evidenceEnabled) {
      const allowed = new Set(c.evidenceTypes ?? []);
      if (allowed.size === 0) {
        issues.push({ ...ctx, field: "evidence", message: "Pick at least one allowed evidence type." });
      }
      for (const req of c.requiredEvidenceTypes ?? []) {
        if (!allowed.has(req)) {
          issues.push({ ...ctx, field: "evidence", message: `Required type "${req}" is not in allowed types.` });
        }
      }
      if ((c.minEvidenceCount ?? 0) > 0 && (c.requiredEvidenceTypes?.length ?? 0) > (c.minEvidenceCount ?? 0)) {
        issues.push({ ...ctx, field: "evidence", message: "Minimum evidence count is lower than the number of required types." });
      }
    } else if ((c.requiredEvidenceTypes?.length ?? 0) > 0 || (c.minEvidenceCount ?? 0) > 0) {
      issues.push({ ...ctx, field: "evidence", message: "Enable evidence to set requirements." });
    }
    if (c.schedule) {
      const expected = { monthly: 12, quarterly: 4, half_yearly: 2, annual: 1, custom: -1 };
      const want = expected[c.schedule.type];
      const got = c.schedule.periods?.length ?? 0;
      if (want > 0 && got > want) {
        issues.push({ ...ctx, field: "schedule", message: `${c.schedule.type} schedule allows at most ${want} periods.` });
      }
      if (c.schedule.type === "custom" && !c.schedule.startDate) {
        issues.push({ ...ctx, field: "schedule", message: "Custom schedule needs a start date." });
      }
    }
  });
  return issues;
}
function formatScheduleLabel(s) {
  if (!s) return "—";
  const base = s.type.replace("_", "-");
  const tail = s.periods?.length ? ` · ${s.periods.join(", ")}` : "";
  const start = s.startDate ? ` (from ${s.startDate})` : "";
  return `${base}${tail}${start}`;
}
function ScorecardPreview(p) {
  const totalWeight = p.competencies.reduce((s, c) => s + (Number(c.weight) || 0), 0);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "border-dashed", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-base", children: p.name || "Untitled template" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", children: p.kind.toUpperCase() }),
        p.industry && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", children: p.industry }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "ml-auto", children: "Preview — read-only" })
      ] }),
      p.description && /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: p.description }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground", children: [
        "Scale ",
        p.scaleMin,
        "–",
        p.scaleMax,
        p.scaleLabels.length ? ` · ${p.scaleLabels.join(" / ")}` : "",
        p.competencies.some((c) => c.weight != null) ? ` · Weights total ${totalWeight}%` : ""
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-3", children: [
      p.competencies.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-muted-foreground italic", children: "No items yet — load a preset or add an item to preview the scorecard." }),
      p.competencies.map((c, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border p-3 space-y-2 bg-muted/20", "aria-disabled": true, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-muted-foreground", children: [
            "#",
            i + 1
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: c.label || /* @__PURE__ */ jsxRuntimeExports.jsx("em", { className: "text-muted-foreground", children: "(no label)" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", children: c.type }),
          c.required && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { children: "Required" }),
          c.weight != null && /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "secondary", children: [
            c.weight,
            "%"
          ] }),
          c.schedule && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", children: formatScheduleLabel(c.schedule) }),
          !c.schedule && c.reviewPeriod && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", children: c.reviewPeriod })
        ] }),
        c.description && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: c.description }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ReviewerControl, { c, scaleMin: p.scaleMin, scaleMax: p.scaleMax, scaleLabels: p.scaleLabels }),
        (c.target != null || c.unit) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground", children: [
          c.target != null && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            "Target: ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: String(c.target) }),
            c.unit ? ` ${c.unit}` : ""
          ] }),
          c.min != null || c.max != null ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ml-2", children: [
            "Range: ",
            c.min ?? "—",
            " – ",
            c.max ?? "—",
            c.unit ? ` ${c.unit}` : ""
          ] }) : null
        ] }),
        c.evidenceEnabled && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-muted-foreground", children: [
            "Evidence: ",
            (c.evidenceTypes ?? []).join(", ") || "none configured",
            c.minEvidenceCount ? ` · min ${c.minEvidenceCount}` : "",
            c.requiredEvidenceTypes?.length ? ` · required: ${c.requiredEvidenceTypes.join(", ")}` : ""
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1 rounded border border-dashed p-2 text-muted-foreground", children: "📎 Reviewers will attach files, URLs, social posts or screenshots here." })
        ] })
      ] }, c.id))
    ] })
  ] });
}
function ReviewerControl({
  c,
  scaleMin,
  scaleMax,
  scaleLabels
}) {
  switch (c.type) {
    case "rating":
    case "scale": {
      const labels = scaleLabels.length === scaleMax - scaleMin + 1 ? scaleLabels : null;
      const opts = Array.from({ length: scaleMax - scaleMin + 1 }, (_, i) => scaleMin + i);
      return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1", children: opts.map((n, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", disabled: true, className: "rounded border px-2 py-1 text-xs bg-background opacity-80 cursor-not-allowed", children: [
        n,
        labels ? ` · ${labels[idx]}` : ""
      ] }, n)) });
    }
    case "yes_no":
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { disabled: true, className: "rounded border px-3 py-1 text-xs bg-background opacity-80 cursor-not-allowed", children: c.yesLabel || "Met" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { disabled: true, className: "rounded border px-3 py-1 text-xs bg-background opacity-80 cursor-not-allowed", children: c.noLabel || "Not met" })
      ] });
    case "number":
    case "percentage":
    case "currency":
      return /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { disabled: true, type: "number", placeholder: c.unit ? `Value (${c.unit})` : "Value" });
    case "range":
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { disabled: true, type: "number", placeholder: `Min ${c.unit ?? ""}` }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { disabled: true, type: "number", placeholder: `Max ${c.unit ?? ""}` })
      ] });
    case "text":
    default:
      return /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { disabled: true, rows: 2, placeholder: "Reviewer comments…" });
  }
}
const COMP_TYPES = [{
  value: "rating",
  label: "Rating (scale)"
}, {
  value: "scale",
  label: "Custom scale"
}, {
  value: "number",
  label: "Number"
}, {
  value: "percentage",
  label: "Percentage"
}, {
  value: "currency",
  label: "Currency"
}, {
  value: "range",
  label: "Range (min–max)"
}, {
  value: "yes_no",
  label: "Yes / No"
}, {
  value: "text",
  label: "Subjective text"
}];
const KINDS = [{
  value: "kpi",
  label: "KPI"
}, {
  value: "kra",
  label: "KRA"
}, {
  value: "competency",
  label: "Competency"
}, {
  value: "mixed",
  label: "Mixed"
}, {
  value: "360",
  label: "360° Feedback"
}];
function newComp(type = "rating") {
  return {
    id: crypto.randomUUID().slice(0, 8),
    label: "",
    description: "",
    type,
    required: true,
    evidenceEnabled: type === "number" || type === "percentage" || type === "currency" || type === "yes_no",
    evidenceTypes: ["document", "url"]
  };
}
function ReviewTemplatesAdmin() {
  const {
    user,
    roles,
    loading
  } = useAuth();
  const navigate = useNavigate();
  const [templates, setTemplates] = reactExports.useState([]);
  const [busy, setBusy] = reactExports.useState(false);
  const [open, setOpen] = reactExports.useState(false);
  const [filterIndustry, setFilterIndustry] = reactExports.useState("all");
  const [filterKind, setFilterKind] = reactExports.useState("all");
  const [filterQuery, setFilterQuery] = reactExports.useState("");
  const [presetKey, setPresetKey] = reactExports.useState("none");
  const [previewMode, setPreviewMode] = reactExports.useState("draft");
  const [previewPresetKey, setPreviewPresetKey] = reactExports.useState("none");
  const [issues, setIssues] = reactExports.useState([]);
  const fileInputRef = reactExports.useRef(null);
  const [form, setForm] = reactExports.useState({
    name: "",
    description: "",
    industry: "Education Agent",
    kind: "kpi",
    isDefault: false,
    scaleMin: 1,
    scaleMax: 5,
    scaleLabels: "Below,Exceeds",
    competencies: [newComp("rating")],
    changeNote: "",
    bumpVersion: false
  });
  const fnSave = useServerFn(upsertReviewTemplate);
  const fnDelete = useServerFn(deleteReviewTemplate);
  const fnAudit = useServerFn(logTemplateAuditEvent);
  const fnAuditList = useServerFn(listTemplateAuditLog);
  const fnGenInstances = useServerFn(generateReviewInstances);
  const [auditOpen, setAuditOpen] = reactExports.useState(false);
  const [auditEntries, setAuditEntries] = reactExports.useState([]);
  reactExports.useEffect(() => {
    if (!loading && !user) navigate({
      to: "/auth"
    });
  }, [loading, user, navigate]);
  async function load() {
    let q2 = supabase.from("review_templates").select("*").eq("is_current", true).order("name");
    const {
      data
    } = await q2;
    setTemplates(data ?? []);
  }
  reactExports.useEffect(() => {
    load();
  }, []);
  function reset() {
    setPresetKey("none");
    setForm({
      name: "",
      description: "",
      industry: "Education Agent",
      kind: "kpi",
      isDefault: false,
      scaleMin: 1,
      scaleMax: 5,
      scaleLabels: "Below,Exceeds",
      competencies: [newComp("rating")],
      changeNote: "",
      bumpVersion: false
    });
  }
  function loadPreset(key) {
    setPresetKey(key);
    if (key === "none") return;
    const p = getPreset(key);
    if (!p) return;
    setForm((f) => ({
      ...f,
      name: p.name,
      description: p.description,
      industry: p.industry,
      kind: p.kind,
      scaleMin: p.scaleMin,
      scaleMax: p.scaleMax,
      scaleLabels: p.scaleLabels.join(","),
      competencies: p.competencies.map((c) => ({
        ...c,
        id: c.id || crypto.randomUUID().slice(0, 8)
      }))
    }));
    toast.success(`Loaded "${p.name}" — customize and save`);
  }
  function edit(t) {
    setPresetKey("none");
    setForm({
      id: t.id,
      name: t.name,
      description: t.description ?? "",
      industry: t.industry ?? "Education Agent",
      kind: t.kind ?? "competency",
      isDefault: t.is_default,
      scaleMin: t.scale_min,
      scaleMax: t.scale_max,
      scaleLabels: (t.scale_labels ?? []).join(","),
      competencies: (t.competencies ?? []).length ? t.competencies : [newComp("rating")],
      changeNote: "",
      bumpVersion: false
    });
    setOpen(true);
  }
  async function save() {
    const draftIssues = validateTemplate({
      name: form.name,
      scaleMin: form.scaleMin,
      scaleMax: form.scaleMax,
      competencies: form.competencies
    });
    setIssues(draftIssues);
    if (draftIssues.length) {
      toast.error(`Fix ${draftIssues.length} issue(s) before saving`);
      return;
    }
    setBusy(true);
    try {
      await fnSave({
        data: {
          id: form.id,
          name: form.name,
          description: form.description || void 0,
          industry: form.industry || void 0,
          kind: form.kind,
          scaleMin: form.scaleMin,
          scaleMax: form.scaleMax,
          scaleLabels: form.scaleLabels.split(",").map((s) => s.trim()).filter(Boolean),
          competencies: form.competencies,
          isDefault: form.isDefault,
          changeNote: form.changeNote || void 0,
          bumpVersion: form.bumpVersion
        }
      });
      toast.success("Saved");
      setOpen(false);
      reset();
      await load();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  }
  function exportTemplate(t) {
    const payload = {
      $schema: "hrppl.review-template/v1",
      name: t.name,
      description: t.description,
      industry: t.industry,
      kind: t.kind,
      scaleMin: t.scale_min,
      scaleMax: t.scale_max,
      scaleLabels: t.scale_labels,
      competencies: t.competencies,
      isDefault: false
    };
    const fileName = `${(t.name || "review-template").replace(/[^a-z0-9-_]+/gi, "-")}.json`;
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json"
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    fnAudit({
      data: {
        templateId: t.id,
        templateName: t.name,
        action: "export",
        fileName,
        snapshot: payload
      }
    }).catch(() => {
    });
    toast.success("Template downloaded — upload it on another tenant via Import.");
  }
  async function importFromFile(file) {
    try {
      const text = await file.text();
      const json = JSON.parse(text);
      const comps = Array.isArray(json.competencies) ? json.competencies : [];
      setPresetKey("none");
      setForm({
        name: String(json.name ?? "Imported template"),
        description: String(json.description ?? ""),
        industry: String(json.industry ?? "Generic / Cross-industry"),
        kind: json.kind ?? "competency",
        isDefault: false,
        scaleMin: Number(json.scaleMin ?? 1),
        scaleMax: Number(json.scaleMax ?? 5),
        scaleLabels: Array.isArray(json.scaleLabels) ? json.scaleLabels.join(",") : "Below,Exceeds",
        competencies: comps.length ? comps : [newComp("rating")],
        changeNote: "Imported",
        bumpVersion: false
      });
      setOpen(true);
      fnAudit({
        data: {
          templateId: null,
          templateName: String(json.name ?? "Imported template"),
          action: "import",
          fileName: file.name,
          snapshot: json
        }
      }).catch(() => {
      });
      toast.success("Imported — review and Save to attach to this tenant.");
    } catch (e) {
      toast.error(`Import failed: ${e.message}`);
    }
  }
  async function openAudit() {
    setAuditOpen(true);
    try {
      const r = await fnAuditList({
        data: {
          action: "all",
          limit: 100
        }
      });
      setAuditEntries(r.entries);
    } catch (e) {
      toast.error(e.message);
    }
  }
  async function scheduleInstances(t) {
    if (!confirm(`Generate scorecards for "${t.name}" for the next 365 days?`)) return;
    try {
      const r = await fnGenInstances({
        data: {
          templateId: t.id,
          horizonDays: 365
        }
      });
      toast.success(`Created ${r.created} scorecard instance(s)`);
    } catch (e) {
      toast.error(e.message);
    }
  }
  async function remove(id) {
    if (!confirm("Delete this template?")) return;
    setBusy(true);
    try {
      await fnDelete({
        data: {
          id
        }
      });
      await load();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  }
  const filteredPresets = REVIEW_PRESETS.filter((p) => p.industry === form.industry);
  const q = filterQuery.trim().toLowerCase();
  const filteredTemplates = templates.filter((t) => (filterIndustry === "all" || (t.industry ?? "") === filterIndustry) && (filterKind === "all" || (t.kind ?? "competency") === filterKind) && (q === "" || (t.name ?? "").toLowerCase().includes(q) || (t.description ?? "").toLowerCase().includes(q) || (t.industry ?? "").toLowerCase().includes(q) || (t.competencies ?? []).some((c) => (c.label ?? "").toLowerCase().includes(q))));
  if (loading || !user) return /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "flex min-h-screen items-center justify-center text-muted-foreground", children: "Loading…" });
  function updateComp(i, patch) {
    const next = [...form.competencies];
    next[i] = {
      ...next[i],
      ...patch
    };
    setForm({
      ...form,
      competencies: next
    });
  }
  return (
    // Wrapped in AppShell to restore the sidebar and top bar. admin.tsx is a
    // bare <Outlet /> by design, so this page had no navigation at all — which
    // is exactly what the screenshot of this route showed.
    //
    // No title passed: the page renders its own header below.
    /* @__PURE__ */ jsxRuntimeExports.jsx(AppShell, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "min-h-screen bg-background", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("header", { className: "border-b border-border bg-card", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto flex max-w-6xl items-center justify-between px-6 py-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-xl font-semibold", children: "KPI / KRA / Review templates" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Pick an industry, start from a standard preset, and customize for your org." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/org", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", size: "sm", children: "Back" }) })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "mx-auto max-w-6xl px-6 py-8 space-y-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-base", children: "Templates" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "Attach a template to a cycle in Performance → Cycles." })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/admin/kpi-kra", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "secondary", size: "sm", children: "KPI & KRA library" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: filterQuery, onChange: (e) => setFilterQuery(e.target.value), placeholder: "Search by name, role, KPI item…", className: "w-[240px]" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: filterIndustry, onValueChange: setFilterIndustry, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-[200px]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "All industries" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All industries" }),
                  INDUSTRIES.map((i) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: i, children: i }, i))
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: filterKind, onValueChange: setFilterKind, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-[140px]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "All kinds" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All kinds" }),
                  KINDS.map((k) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: k.value, children: k.label }, k.value))
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Dialog, { open, onOpenChange: (o) => {
                setOpen(o);
                if (!o) reset();
              }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", onClick: reset, children: "New template" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-3xl", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: form.id ? "Edit template" : "New template" }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 max-h-[75vh] overflow-auto pr-1", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-3", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Industry" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.industry, onValueChange: (v) => setForm({
                          ...form,
                          industry: v
                        }), children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: INDUSTRIES.map((i) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: i, children: i }, i)) })
                        ] })
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Kind" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.kind, onValueChange: (v) => setForm({
                          ...form,
                          kind: v
                        }), children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: KINDS.map((k) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: k.value, children: k.label }, k.value)) })
                        ] })
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Load standard preset" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: presetKey, onValueChange: loadPreset, children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "None — start from scratch" }) }),
                          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "none", children: "None — start from scratch" }),
                            filteredPresets.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: p.key, children: [
                              p.role,
                              " — ",
                              p.kind.toUpperCase(),
                              " · ",
                              p.name
                            ] }, p.key))
                          ] })
                        ] })
                      ] })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Name" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.name, onChange: (e) => setForm({
                        ...form,
                        name: e.target.value
                      }) })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Description" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, value: form.description, onChange: (e) => setForm({
                        ...form,
                        description: e.target.value
                      }) })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-3", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Scale min" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: 1, max: 9, value: form.scaleMin, onChange: (e) => setForm({
                          ...form,
                          scaleMin: Number(e.target.value)
                        }) })
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Scale max" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: 2, max: 10, value: form.scaleMax, onChange: (e) => setForm({
                          ...form,
                          scaleMax: Number(e.target.value)
                        }) })
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Scale labels (comma-separated)" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.scaleLabels, onChange: (e) => setForm({
                          ...form,
                          scaleLabels: e.target.value
                        }), placeholder: "Below,Exceeds" })
                      ] })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { checked: form.isDefault, onCheckedChange: (v) => setForm({
                        ...form,
                        isDefault: !!v
                      }) }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Default template for new cycles" })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t pt-3", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-2", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
                          "Items / KPIs (",
                          form.competencies.length,
                          ")"
                        ] }),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1", children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", onClick: () => setForm({
                            ...form,
                            competencies: [...form.competencies, newComp("rating")]
                          }), children: "+ Rating" }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", onClick: () => setForm({
                            ...form,
                            competencies: [...form.competencies, newComp("number")]
                          }), children: "+ Number" }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", onClick: () => setForm({
                            ...form,
                            competencies: [...form.competencies, newComp("yes_no")]
                          }), children: "+ Yes/No" }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", onClick: () => setForm({
                            ...form,
                            competencies: [...form.competencies, newComp("text")]
                          }), children: "+ Text" })
                        ] })
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: form.competencies.map((c, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded border p-3 space-y-2 bg-muted/30", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-12 gap-2", children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "col-span-5", placeholder: "Label", value: c.label, onChange: (e) => updateComp(i, {
                            label: e.target.value
                          }) }),
                          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: c.type, onValueChange: (v) => updateComp(i, {
                            type: v
                          }), children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "col-span-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: COMP_TYPES.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: t.value, children: t.label }, t.value)) })
                          ] }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "col-span-2", type: "number", placeholder: "Weight %", value: c.weight ?? "", onChange: (e) => updateComp(i, {
                            weight: e.target.value ? Number(e.target.value) : void 0
                          }) }),
                          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "col-span-1 flex items-center gap-1 text-xs", children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { checked: c.required, onCheckedChange: (v) => updateComp(i, {
                              required: !!v
                            }) }),
                            "Req"
                          ] }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { className: "col-span-1", size: "sm", variant: "ghost", onClick: () => setForm({
                            ...form,
                            competencies: form.competencies.filter((_, j) => j !== i)
                          }), children: "✕" })
                        ] }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Optional description / definition", value: c.description ?? "", onChange: (e) => updateComp(i, {
                          description: e.target.value
                        }) }),
                        (c.type === "number" || c.type === "percentage" || c.type === "currency" || c.type === "range" || c.type === "scale") && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-4 gap-2", children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", placeholder: "Min", value: c.min ?? "", onChange: (e) => updateComp(i, {
                            min: e.target.value ? Number(e.target.value) : void 0
                          }) }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", placeholder: "Max", value: c.max ?? "", onChange: (e) => updateComp(i, {
                            max: e.target.value ? Number(e.target.value) : void 0
                          }) }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Target", value: c.target?.toString() ?? "", onChange: (e) => updateComp(i, {
                            target: e.target.value || void 0
                          }) }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Unit (e.g. %, AUD, days)", value: c.unit ?? "", onChange: (e) => updateComp(i, {
                            unit: e.target.value || void 0
                          }) })
                        ] }),
                        c.type === "yes_no" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Yes label (default: Met)", value: c.yesLabel ?? "", onChange: (e) => updateComp(i, {
                            yesLabel: e.target.value || void 0
                          }) }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "No label (default: Not met)", value: c.noLabel ?? "", onChange: (e) => updateComp(i, {
                            noLabel: e.target.value || void 0
                          }) })
                        ] }),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 rounded border bg-background p-2 text-xs", children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-3", children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-1", children: [
                              /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { checked: !!c.evidenceEnabled, onCheckedChange: (v) => updateComp(i, {
                                evidenceEnabled: !!v
                              }) }),
                              "Allow evidence attachment"
                            ] }),
                            c.evidenceEnabled && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Allowed:" }),
                              ["document", "url", "social", "screenshot"].map((t) => /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-1", children: [
                                /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { checked: c.evidenceTypes?.includes(t) ?? false, onCheckedChange: (v) => {
                                  const cur = new Set(c.evidenceTypes ?? []);
                                  if (v) cur.add(t);
                                  else cur.delete(t);
                                  updateComp(i, {
                                    evidenceTypes: Array.from(cur)
                                  });
                                } }),
                                t
                              ] }, t))
                            ] })
                          ] }),
                          c.evidenceEnabled && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-3", children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Min count:" }),
                            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "h-7 w-20", type: "number", min: 0, max: 20, value: c.minEvidenceCount ?? 0, onChange: (e) => updateComp(i, {
                              minEvidenceCount: e.target.value ? Number(e.target.value) : void 0
                            }) }),
                            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Required types:" }),
                            (c.evidenceTypes ?? []).map((t) => /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-1", children: [
                              /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { checked: c.requiredEvidenceTypes?.includes(t) ?? false, onCheckedChange: (v) => {
                                const cur = new Set(c.requiredEvidenceTypes ?? []);
                                if (v) cur.add(t);
                                else cur.delete(t);
                                updateComp(i, {
                                  requiredEvidenceTypes: Array.from(cur)
                                });
                              } }),
                              t
                            ] }, t))
                          ] })
                        ] }),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-2 text-xs items-end", children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Schedule" }),
                            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: c.schedule?.type ?? "none", onValueChange: (v) => updateComp(i, {
                              schedule: v === "none" ? void 0 : {
                                type: v,
                                periods: c.schedule?.periods,
                                startDate: c.schedule?.startDate
                              }
                            }), children: [
                              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-8", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Not scheduled" }) }),
                              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "none", children: "Not scheduled" }),
                                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "monthly", children: "Monthly" }),
                                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "quarterly", children: "Quarterly" }),
                                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "half_yearly", children: "Half-yearly" }),
                                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "annual", children: "Annual" }),
                                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "custom", children: "Custom" })
                              ] })
                            ] })
                          ] }),
                          c.schedule && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "md:col-span-2", children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Periods (comma-separated, e.g. Q1,Q3 or Jan,Apr,Jul,Oct)" }),
                            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "h-8", value: (c.schedule.periods ?? []).join(","), onChange: (e) => updateComp(i, {
                              schedule: {
                                ...c.schedule,
                                periods: e.target.value.split(",").map((s) => s.trim()).filter(Boolean)
                              }
                            }) })
                          ] }),
                          c.schedule?.type === "custom" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Start date" }),
                            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "h-8", type: "date", value: c.schedule.startDate ?? "", onChange: (e) => updateComp(i, {
                              schedule: {
                                ...c.schedule,
                                startDate: e.target.value || void 0
                              }
                            }) })
                          ] }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "md:col-span-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "h-7", placeholder: "Free-text period hint (legacy)", value: c.reviewPeriod ?? "", onChange: (e) => updateComp(i, {
                            reviewPeriod: e.target.value || void 0
                          }) }) })
                        ] }),
                        issues.filter((iss) => iss.itemIndex === i).map((iss, k) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-destructive", children: [
                          "⚠ ",
                          iss.field,
                          ": ",
                          iss.message
                        ] }, k))
                      ] }, c.id)) })
                    ] }),
                    issues.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded border border-destructive/50 bg-destructive/5 p-2 text-xs text-destructive", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-medium mb-1", children: [
                        "Cannot save — ",
                        issues.length,
                        " issue(s):"
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "list-disc pl-4 space-y-0.5", children: [
                        issues.slice(0, 6).map((iss, k) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
                          iss.itemIndex != null ? `Item #${iss.itemIndex + 1}: ` : "",
                          iss.message
                        ] }, k)),
                        issues.length > 6 && /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
                          "+",
                          issues.length - 6,
                          " more…"
                        ] })
                      ] })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-t pt-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ScorecardPreview, { name: form.name, description: form.description, industry: form.industry, kind: form.kind, scaleMin: form.scaleMin, scaleMax: form.scaleMax, scaleLabels: form.scaleLabels.split(",").map((s) => s.trim()).filter(Boolean), competencies: form.competencies }) }),
                    form.id && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t pt-3 space-y-2", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { checked: form.bumpVersion, onCheckedChange: (v) => setForm({
                          ...form,
                          bumpVersion: !!v
                        }) }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Save as a new version (preserve history)" })
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Change note" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.changeNote, onChange: (e) => setForm({
                          ...form,
                          changeNote: e.target.value
                        }), placeholder: "What changed?" })
                      ] })
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { className: "gap-2", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => {
                      const next = validateTemplate({
                        name: form.name,
                        scaleMin: form.scaleMin,
                        scaleMax: form.scaleMax,
                        competencies: form.competencies
                      });
                      setIssues(next);
                      toast[next.length ? "error" : "success"](next.length ? `${next.length} issue(s) — see panel` : "Looks good");
                    }, children: "Validate" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { disabled: busy, onClick: save, children: "Save" })
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", onClick: () => fileInputRef.current?.click(), children: "Import JSON" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", onClick: openAudit, children: "Audit log" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("input", { ref: fileInputRef, type: "file", accept: "application/json,.json", className: "hidden", onChange: (e) => {
                const f = e.target.files?.[0];
                if (f) importFromFile(f);
                e.currentTarget.value = "";
              } })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Name" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Industry" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Kind" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Items" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Version" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, {})
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(TableBody, { children: [
              filteredTemplates.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: t.name }),
                    t.is_default && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { children: "Default" })
                  ] }),
                  t.description && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: t.description })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-sm", children: t.industry ?? "—" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", children: (t.kind ?? "competency").toUpperCase() }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-sm", children: t.competencies?.length ?? 0 }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "outline", children: [
                  "v",
                  t.version
                ] }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { className: "text-right space-x-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", onClick: () => edit(t), children: "Edit" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", onClick: () => exportTemplate(t), children: "Export" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", onClick: () => scheduleInstances(t), children: "Schedule" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", onClick: () => remove(t.id), children: "Delete" })
                ] })
              ] }, t.id)),
              filteredTemplates.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { colSpan: 6, className: "text-center text-muted-foreground", children: "No templates match. Create one or load a preset from the “New template” dialog." }) })
            ] })
          ] }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-base", children: "Standard preset library" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "Industry-aware presets. Open “New template”, pick an industry, then choose a preset to start." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-3 md:grid-cols-2", children: INDUSTRIES.map((ind) => {
              const list = REVIEW_PRESETS.filter((p) => p.industry === ind);
              if (!list.length) return null;
              return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded border p-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium mb-2", children: ind }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "text-xs space-y-1", children: list.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-center justify-between gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "mr-1", children: p.kind.toUpperCase() }),
                    p.role,
                    " — ",
                    p.name
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: () => setPreviewPresetKey(previewPresetKey === p.key ? "none" : p.key), children: previewPresetKey === p.key ? "Hide" : "Preview" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: () => {
                      setForm((f) => ({
                        ...f,
                        industry: p.industry
                      }));
                      setOpen(true);
                      setTimeout(() => loadPreset(p.key), 0);
                    }, children: "Use" })
                  ] })
                ] }, p.key)) })
              ] }, ind);
            }) }),
            previewPresetKey !== "none" && (() => {
              const p = getPreset(previewPresetKey);
              if (!p) return null;
              return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ScorecardPreview, { name: p.name, description: p.description, industry: p.industry, kind: p.kind, scaleMin: p.scaleMin, scaleMax: p.scaleMax, scaleLabels: p.scaleLabels, competencies: p.competencies }) });
            })()
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: auditOpen, onOpenChange: setAuditOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-3xl", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Template export / import audit log" }) }),
        auditEntries.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "py-6 text-center text-sm text-muted-foreground", children: "No events yet." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-h-[60vh] overflow-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "When" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Action" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Template" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Actor" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "File" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: auditEntries.map((e) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-xs", children: new Date(e.created_at).toLocaleString() }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: e.action === "export" ? "secondary" : "default", children: e.action }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: e.template_name }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-xs", children: e.actor_email ?? e.actor_id?.slice(0, 8) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-xs", children: e.file_name ?? "—" })
          ] }, e.id)) })
        ] }) })
      ] }) })
    ] }) })
  );
}
const SplitComponent = () => /* @__PURE__ */ jsxRuntimeExports.jsx(AdminGate, { allow: ORG_ADMIN_ONLY, children: /* @__PURE__ */ jsxRuntimeExports.jsx(ReviewTemplatesAdmin, {}) });
export {
  SplitComponent as component
};
