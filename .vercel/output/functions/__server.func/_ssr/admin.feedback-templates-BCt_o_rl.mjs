import { j as jsxRuntimeExports, r as reactExports } from "../_libs/react.mjs";
import { e as useNavigate, L as Link } from "../_libs/tanstack__react-router.mjs";
import { u as useAuth, a as useServerFn, B as Button, C as Card, b as CardHeader, c as CardTitle, d as CardDescription, e as CardContent, f as Badge, T as Textarea } from "./router-CLxirH5A.mjs";
import { s as supabase } from "./client-BLUqAwhM.mjs";
import { I as Input } from "./input-C6yqZkRy.mjs";
import { L as Label } from "./label-Cbju7vgw.mjs";
import { T as Table, a as TableHeader, b as TableRow, c as TableHead, d as TableBody, e as TableCell } from "./table-DBQt_Juv.mjs";
import { C as Checkbox } from "./checkbox-Dj6wn8_T.mjs";
import { D as Dialog, a as DialogContent, b as DialogHeader, c as DialogTitle, e as DialogFooter } from "./dialog-UIV2CpIo.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { u as upsertFeedbackTemplate, c as deleteFeedbackTemplate, e as getFeedbackTemplateHistory, f as archiveFeedbackTemplate, h as restoreFeedbackTemplate, l as listArchivedFeedbackTemplates } from "./feedback360.functions-KiTCS2n6.mjs";
import { A as AdminGate } from "./AdminGate-B3-x5ytD.mjs";
import { a as ORG_ADMIN_ONLY } from "./rbac-BWg_Nf1T.mjs";
import { A as AppShell } from "./AppShell-fbDALlr7.mjs";
import "../_libs/seroval.mjs";
import "../_libs/lovable.dev__mcp-js.mjs";
import "../_libs/modelcontextprotocol__sdk.mjs";
import "../_libs/zod-to-json-schema.mjs";
import "../_libs/ajv-formats.mjs";
import { f as formatDistanceToNow } from "../_libs/date-fns.mjs";
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
import "../_libs/radix-ui__react-checkbox.mjs";
import "../_libs/radix-ui__react-context.mjs";
import "../_libs/radix-ui__primitive.mjs";
import "../_libs/@radix-ui/react-use-controllable-state+[...].mjs";
import "../_libs/@radix-ui/react-use-layout-effect+[...].mjs";
import "../_libs/radix-ui__react-use-previous.mjs";
import "../_libs/radix-ui__react-use-size.mjs";
import "../_libs/radix-ui__react-presence.mjs";
import "../_libs/radix-ui__react-dialog.mjs";
import "../_libs/radix-ui__react-id.mjs";
import "../_libs/@radix-ui/react-dismissable-layer+[...].mjs";
import "../_libs/@radix-ui/react-use-callback-ref+[...].mjs";
import "../_libs/@radix-ui/react-use-escape-keydown+[...].mjs";
import "../_libs/radix-ui__react-focus-scope.mjs";
import "../_libs/radix-ui__react-portal.mjs";
import "../_libs/radix-ui__react-focus-guards.mjs";
import "../_libs/react-remove-scroll.mjs";
import "../_libs/react-remove-scroll-bar.mjs";
import "../_libs/react-style-singleton.mjs";
import "../_libs/get-nonce.mjs";
import "../_libs/use-sidecar.mjs";
import "../_libs/use-callback-ref.mjs";
import "../_libs/aria-hidden.mjs";
import "../_libs/radix-ui__react-popover.mjs";
import "../_libs/radix-ui__react-popper.mjs";
import "../_libs/floating-ui__react-dom.mjs";
import "../_libs/floating-ui__dom.mjs";
import "../_libs/floating-ui__core.mjs";
import "../_libs/floating-ui__utils.mjs";
import "../_libs/radix-ui__react-arrow.mjs";
import "./select-Bk9id1Ls.mjs";
import "../_libs/radix-ui__react-select.mjs";
import "../_libs/radix-ui__number.mjs";
import "../_libs/radix-ui__react-collection.mjs";
import "../_libs/radix-ui__react-direction.mjs";
import "../_libs/@radix-ui/react-visually-hidden+[...].mjs";
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
const r = (id, label, required = true) => ({
  id,
  label,
  type: "rating",
  required,
  scaleMin: 1,
  scaleMax: 5,
  scaleLabels: ["Rarely", "Consistently"]
});
const t = (id, label, required = false) => ({
  id,
  label,
  type: "text",
  required
});
const FEEDBACK_PRESETS = [
  {
    key: "peer-collaboration",
    name: "Peer collaboration (recommended)",
    description: "Balanced peer feedback covering communication, teamwork, and impact.",
    questions: [
      r("q1", "Communicates clearly and listens actively"),
      r("q2", "Collaborates effectively across the team"),
      r("q3", "Delivers high-quality work on time"),
      r("q4", "Supports colleagues and shares knowledge"),
      t("q5", "What does this person do especially well?"),
      t("q6", "One thing they could improve")
    ]
  },
  {
    key: "manager-effectiveness",
    name: "Manager effectiveness (upward)",
    description: "For direct reports to give feedback on their manager.",
    questions: [
      r("q1", "Sets clear expectations and priorities"),
      r("q2", "Gives useful, timely feedback"),
      r("q3", "Removes blockers and advocates for the team"),
      r("q4", "Supports my growth and development"),
      r("q5", "Treats team members fairly and with respect"),
      t("q6", "What should they keep doing?"),
      t("q7", "What should they start or stop doing?")
    ]
  },
  {
    key: "leadership",
    name: "Leadership & influence",
    description: "For senior ICs and leads — strategy, influence, and judgement.",
    questions: [
      r("q1", "Sets a clear technical or strategic direction"),
      r("q2", "Influences without authority"),
      r("q3", "Makes sound, timely decisions"),
      r("q4", "Develops others through mentoring"),
      t("q5", "Strongest example of their leadership in this period"),
      t("q6", "Where could their leadership grow?")
    ]
  },
  {
    key: "project-retro",
    name: "Project retrospective",
    description: "Lightweight feedback at the end of a project or sprint.",
    questions: [
      r("q1", "Contributed meaningfully to project outcomes"),
      r("q2", "Communicated progress and risks early"),
      t("q3", "What went well working with this person?"),
      t("q4", "What would you change next time?")
    ]
  },
  // ─────────── Education Agent industry ───────────
  {
    key: "edu-counsellor-360",
    name: "Education Counsellor — 360° (Education Agent)",
    description: "Peer/manager/client-facing 360° for counsellors and admission officers at an education agency.",
    questions: [
      r("q1", "Demonstrates deep knowledge of providers, courses and visa pathways"),
      r("q2", "Conducts honest, ethical and GTE-compliant counselling"),
      r("q3", "Responsive and proactive with student communications"),
      r("q4", "Collaborates well with admissions, migration and documentation teams"),
      r("q5", "Handles difficult conversations professionally"),
      r("q6", "Embodies brand values in every interaction"),
      t("q7", "One thing this person does exceptionally well"),
      t("q8", "One thing this person could improve")
    ]
  },
  {
    key: "edu-manager-360",
    name: "Education Agent Manager — 360°",
    description: "Upward & peer 360° for branch / admissions / migration managers at an education agency.",
    questions: [
      r("q1", "Sets clear sales / case targets and removes blockers"),
      r("q2", "Coaches and develops team members"),
      r("q3", "Drives accountability while supporting wellbeing"),
      r("q4", "Ensures compliance with ESOS, National Code and MARA"),
      r("q5", "Communicates strategy clearly across teams"),
      r("q6", "Makes data-informed decisions"),
      r("q7", "Represents the brand professionally with partners and clients"),
      t("q8", "Strengths to amplify"),
      t("q9", "Opportunities for growth")
    ]
  },
  {
    key: "edu-migration-rma-360",
    name: "Migration Agent (RMA) — 360°",
    description: "360° for registered migration agents and case officers.",
    questions: [
      r("q1", "Maintains rigorous OMARA Code of Conduct and privacy standards"),
      r("q2", "Produces accurate, well-documented case files"),
      r("q3", "Communicates clearly with clients about timelines and expectations"),
      r("q4", "Handles escalations and complex cases calmly"),
      r("q5", "Collaborates with admissions and front-desk teams on handovers"),
      t("q6", "A standout example of their professional judgement"),
      t("q7", "One area to strengthen")
    ]
  }
];
function getPreset(key) {
  return FEEDBACK_PRESETS.find((p) => p.key === key);
}
function newQ(type = "rating") {
  return {
    id: crypto.randomUUID().slice(0, 8),
    label: "",
    type,
    required: true,
    ...type === "rating" ? {
      scaleMin: 1,
      scaleMax: 5,
      scaleLabels: ["Poor", "Excellent"]
    } : {}
  };
}
function FeedbackTemplatesAdmin() {
  const {
    user,
    roles,
    loading
  } = useAuth();
  const navigate = useNavigate();
  const [templates, setTemplates] = reactExports.useState([]);
  const [busy, setBusy] = reactExports.useState(false);
  const [open, setOpen] = reactExports.useState(false);
  const [editing, setEditing] = reactExports.useState(null);
  const [historyOpen, setHistoryOpen] = reactExports.useState(false);
  const [history, setHistory] = reactExports.useState([]);
  const [historyName, setHistoryName] = reactExports.useState("");
  const [form, setForm] = reactExports.useState({
    name: "",
    description: "",
    isDefault: false,
    questions: [newQ("rating")],
    changeNote: ""
  });
  const [presetOpen, setPresetOpen] = reactExports.useState(false);
  const [archivedOpen, setArchivedOpen] = reactExports.useState(false);
  const [archived, setArchived] = reactExports.useState([]);
  const fnSave = useServerFn(upsertFeedbackTemplate);
  const fnDelete = useServerFn(deleteFeedbackTemplate);
  const fnHistory = useServerFn(getFeedbackTemplateHistory);
  const fnArchive = useServerFn(archiveFeedbackTemplate);
  const fnRestore = useServerFn(restoreFeedbackTemplate);
  const fnListArchived = useServerFn(listArchivedFeedbackTemplates);
  roles.includes("org_admin") || roles.includes("super_admin");
  reactExports.useEffect(() => {
    if (!loading && !user) navigate({
      to: "/auth"
    });
  }, [loading, user, navigate]);
  async function load() {
    const {
      data
    } = await supabase.from("feedback_question_templates").select("*").eq("is_current", true).order("created_at", {
      ascending: false
    });
    setTemplates(data ?? []);
  }
  reactExports.useEffect(() => {
    if (user) load();
  }, [user]);
  function openCreate() {
    setEditing(null);
    setForm({
      name: "",
      description: "",
      isDefault: false,
      questions: [newQ("rating")],
      changeNote: ""
    });
    setOpen(true);
  }
  function openPresetPicker() {
    setPresetOpen(true);
  }
  function startFromPreset(key) {
    const preset = getPreset(key);
    if (!preset) return;
    setEditing(null);
    setForm({
      name: preset.name.replace(" (recommended)", ""),
      description: preset.description,
      isDefault: false,
      questions: preset.questions.map((q) => ({
        ...q,
        id: crypto.randomUUID().slice(0, 8)
      })),
      changeNote: ""
    });
    setPresetOpen(false);
    setOpen(true);
  }
  async function openArchived() {
    setArchivedOpen(true);
    try {
      const res = await fnListArchived();
      setArchived(res.templates ?? []);
    } catch (e) {
      toast.error(e.message);
    }
  }
  async function archive(id) {
    if (!confirm("Archive this template? Existing feedback keeps its template, and you can restore it later.")) return;
    setBusy(true);
    try {
      await fnArchive({
        data: {
          id
        }
      });
      toast.success("Archived");
      await load();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  }
  async function restore(id) {
    setBusy(true);
    try {
      await fnRestore({
        data: {
          id
        }
      });
      toast.success("Restored");
      const res = await fnListArchived();
      setArchived(res.templates ?? []);
      await load();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  }
  function openEdit(t2) {
    setEditing(t2);
    setForm({
      id: t2.id,
      name: t2.name,
      description: t2.description ?? "",
      isDefault: t2.is_default,
      questions: (t2.questions ?? []).map((q) => ({
        ...q
      })),
      changeNote: ""
    });
    setOpen(true);
  }
  async function openHistory(t2) {
    setHistoryName(t2.name);
    setHistoryOpen(true);
    setHistory([]);
    try {
      const res = await fnHistory({
        data: {
          templateId: t2.id
        }
      });
      setHistory(res.versions ?? []);
    } catch (e) {
      toast.error(e.message);
    }
  }
  async function save() {
    if (!form.name.trim()) {
      toast.error("Name required");
      return;
    }
    if (form.questions.length === 0 || form.questions.some((q) => !q.label.trim())) {
      toast.error("All questions need a label");
      return;
    }
    if (editing && !form.changeNote.trim()) {
      toast.error("Add a short change note so the new version is traceable");
      return;
    }
    setBusy(true);
    try {
      const res = await fnSave({
        data: {
          id: form.id,
          name: form.name,
          description: form.description || void 0,
          isDefault: form.isDefault,
          questions: form.questions,
          changeNote: form.changeNote || void 0
        }
      });
      toast.success(editing ? `Saved as version ${res.version}` : "Template created");
      setOpen(false);
      await load();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  }
  async function remove(id) {
    if (!confirm("Delete template?")) return;
    setBusy(true);
    try {
      await fnDelete({
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
  function updateQ(idx, patch) {
    setForm((f) => ({
      ...f,
      questions: f.questions.map((q, i) => i === idx ? {
        ...q,
        ...patch
      } : q)
    }));
  }
  function removeQ(idx) {
    setForm((f) => ({
      ...f,
      questions: f.questions.filter((_, i) => i !== idx)
    }));
  }
  function addQ(type) {
    setForm((f) => ({
      ...f,
      questions: [...f.questions, newQ(type)]
    }));
  }
  if (loading || !user) return /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "flex min-h-screen items-center justify-center text-muted-foreground", children: "Loading…" });
  return (
    // Wrapped in AppShell to restore the sidebar and top bar. admin.tsx is
    // deliberately a bare <Outlet /> (pinned by tests/admin-routes-block.test.ts),
    // so any /admin page that does not render its own shell had no navigation at
    // all — the user could only leave via the browser back button.
    //
    // No title passed: this page already renders its own header below, so the
    // shell contributes chrome only and does not duplicate the heading.
    /* @__PURE__ */ jsxRuntimeExports.jsx(AppShell, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "min-h-screen bg-background", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("header", { className: "border-b border-border bg-card", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto flex max-w-5xl items-center justify-between px-6 py-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-xl font-semibold", children: "360° feedback templates" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Configure questions and rating scales used when colleagues give feedback." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/org", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", size: "sm", children: "Back" }) })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "mx-auto max-w-5xl px-6 py-8 space-y-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "flex flex-row items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-base", children: "Templates" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "One template can be marked default and pre-selected when colleagues request feedback." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", onClick: openArchived, "data-testid": "view-archived", children: "View archived" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", onClick: openPresetPicker, "data-testid": "start-from-recommended", children: "Start from recommended" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", onClick: openCreate, "data-testid": "start-from-scratch", children: "Start from scratch" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Name" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Version" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Questions" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Default" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, {})
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(TableBody, { children: [
            templates.map((t2) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium", children: t2.name }),
                t2.description && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: t2.description })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "outline", children: [
                "v",
                t2.version
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-sm text-muted-foreground", children: (t2.questions ?? []).length }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: t2.is_default && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { children: "Default" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { className: "text-right space-x-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", onClick: () => openHistory(t2), children: "History" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", onClick: () => openEdit(t2), children: "Edit" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", onClick: () => archive(t2.id), disabled: busy, "data-testid": "archive-template", children: "Archive" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: () => remove(t2.id), disabled: busy, children: "Delete" })
              ] })
            ] }, t2.id)),
            templates.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { colSpan: 5, className: "text-center text-muted-foreground", children: "No templates yet." }) })
          ] })
        ] }) })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: setOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-2xl max-h-[85vh] overflow-y-auto", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editing ? "Edit template" : "New template" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Name" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.name, onChange: (e) => setForm({
                ...form,
                name: e.target.value
              }) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 pt-6", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { checked: form.isDefault, onCheckedChange: (c) => setForm({
                ...form,
                isDefault: !!c
              }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Use as default" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Description" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, value: form.description, onChange: (e) => setForm({
              ...form,
              description: e.target.value
            }) })
          ] }),
          editing && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
              "Change note ",
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-muted-foreground", children: [
                "(required — saved as new version v",
                (editing.version ?? 1) + 1,
                ")"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "e.g. Reworded leadership question, raised scale to 1–7", value: form.changeNote, onChange: (e) => setForm({
              ...form,
              changeNote: e.target.value
            }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Questions" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-x-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", onClick: () => addQ("rating"), children: "+ Rating" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", onClick: () => addQ("text"), children: "+ Text" })
              ] })
            ] }),
            form.questions.map((q, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border p-3 space-y-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", children: q.type }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 text-xs", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { checked: q.required, onCheckedChange: (c) => updateQ(idx, {
                      required: !!c
                    }) }),
                    "Required"
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: () => removeQ(idx), children: "Remove" })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Question label", value: q.label, onChange: (e) => updateQ(idx, {
                label: e.target.value
              }) }),
              q.type === "rating" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Min" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: 0, max: 9, value: q.scaleMin ?? 1, onChange: (e) => updateQ(idx, {
                    scaleMin: Number(e.target.value)
                  }) })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Max" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: 1, max: 10, value: q.scaleMax ?? 5, onChange: (e) => updateQ(idx, {
                    scaleMax: Number(e.target.value)
                  }) })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Scale labels (min, max)" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Poor, Excellent", value: (q.scaleLabels ?? []).join(", "), onChange: (e) => updateQ(idx, {
                    scaleLabels: e.target.value.split(",").map((s) => s.trim()).filter(Boolean)
                  }) })
                ] })
              ] })
            ] }, q.id))
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setOpen(false), children: "Cancel" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: save, disabled: busy, children: "Save template" })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: historyOpen, onOpenChange: setHistoryOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-3xl max-h-[85vh] overflow-y-auto", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
          "Version history — ",
          historyName
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
          history.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "No history yet." }),
          [...history].reverse().map((v) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border p-3 space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: v.is_current ? "default" : "outline", children: [
                  "v",
                  v.version
                ] }),
                v.is_current && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", children: "Current" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium", children: v.name })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: v.created_at ? formatDistanceToNow(new Date(v.created_at), {
                addSuffix: true
              }) : "" })
            ] }),
            v.change_note && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: v.change_note }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
              (v.questions ?? []).length,
              " question(s)"
            ] })
          ] }, v.id))
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogFooter, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setHistoryOpen(false), children: "Close" }) })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: presetOpen, onOpenChange: setPresetOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-2xl max-h-[85vh] overflow-y-auto", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Start from a recommended template" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Pick a starting point — you can rename it, add or remove questions, and adjust the rating scale before saving." }),
          FEEDBACK_PRESETS.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border p-3 flex items-start justify-between gap-3", "data-testid": "preset-card", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium text-sm", children: p.name }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: p.description }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground mt-1", children: [
                p.questions.length,
                " questions"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", onClick: () => startFromPreset(p.key), "data-testid": `use-preset-${p.key}`, children: "Use" })
          ] }, p.key))
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogFooter, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setPresetOpen(false), children: "Cancel" }) })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: archivedOpen, onOpenChange: setArchivedOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-2xl max-h-[85vh] overflow-y-auto", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Archived templates" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
          archived.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "No archived templates." }),
          archived.map((t2) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border p-3 flex items-start justify-between gap-3", "data-testid": "archived-row", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium text-sm", children: t2.name }),
              t2.description && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: t2.description }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
                "v",
                t2.version,
                " · ",
                (t2.questions ?? []).length,
                " questions"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", onClick: () => restore(t2.id), disabled: busy, "data-testid": "restore-template", children: "Restore" })
          ] }, t2.id))
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogFooter, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setArchivedOpen(false), children: "Close" }) })
      ] }) })
    ] }) })
  );
}
const SplitComponent = () => /* @__PURE__ */ jsxRuntimeExports.jsx(AdminGate, { allow: ORG_ADMIN_ONLY, children: /* @__PURE__ */ jsxRuntimeExports.jsx(FeedbackTemplatesAdmin, {}) });
export {
  SplitComponent as component
};
