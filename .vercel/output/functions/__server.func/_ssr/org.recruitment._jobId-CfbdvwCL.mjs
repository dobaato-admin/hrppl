import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { g as useParams, L as Link } from "../_libs/tanstack__react-router.mjs";
import { a as useServerFn, f as Badge, B as Button, C as Card, e as CardContent } from "./router-CLxirH5A.mjs";
import { d as getRecruitmentJob, m as moveCandidate, e as upsertStage, f as deleteStage, r as reorderStages } from "./recruitment.functions-BtSoKcuO.mjs";
import { I as Input } from "./input-C6yqZkRy.mjs";
import { D as Dialog, f as DialogTrigger, a as DialogContent, b as DialogHeader, c as DialogTitle, e as DialogFooter } from "./dialog-UIV2CpIo.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import "../_libs/seroval.mjs";
import "../_libs/lovable.dev__mcp-js.mjs";
import "../_libs/modelcontextprotocol__sdk.mjs";
import "../_libs/zod-to-json-schema.mjs";
import "../_libs/ajv-formats.mjs";
import { b1 as Settings2, b4 as ArrowUp, b5 as ArrowDown, T as Trash2, aa as Plus } from "../_libs/lucide-react.mjs";
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
import "../_libs/radix-ui__react-dialog.mjs";
import "../_libs/radix-ui__primitive.mjs";
import "../_libs/radix-ui__react-context.mjs";
import "../_libs/radix-ui__react-id.mjs";
import "../_libs/@radix-ui/react-use-layout-effect+[...].mjs";
import "../_libs/@radix-ui/react-use-controllable-state+[...].mjs";
import "../_libs/@radix-ui/react-dismissable-layer+[...].mjs";
import "../_libs/radix-ui__react-primitive.mjs";
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
function JobBoard() {
  const {
    jobId
  } = useParams({
    from: "/org/recruitment/$jobId"
  });
  const get = useServerFn(getRecruitmentJob);
  const move = useServerFn(moveCandidate);
  const upStage = useServerFn(upsertStage);
  const delStage = useServerFn(deleteStage);
  const reorder = useServerFn(reorderStages);
  const [data, setData] = reactExports.useState(null);
  const [dragging, setDragging] = reactExports.useState(null);
  const [stagesOpen, setStagesOpen] = reactExports.useState(false);
  const [newStageName, setNewStageName] = reactExports.useState("");
  async function refresh() {
    const r = await get({
      data: {
        id: jobId
      }
    });
    setData(r);
  }
  reactExports.useEffect(() => {
    refresh();
  }, [jobId]);
  async function onDrop(stageId) {
    if (!dragging) return;
    try {
      const stage = data.stages.find((s) => s.id === stageId);
      const status = stage?.kind === "hired" ? "hired" : stage?.kind === "rejected" ? "rejected" : "active";
      await move({
        data: {
          candidate_id: dragging,
          stage_id: stageId,
          status
        }
      });
      setDragging(null);
      await refresh();
    } catch (e) {
      toast.error(e.message);
    }
  }
  async function addStage() {
    if (!newStageName.trim()) return;
    try {
      await upStage({
        data: {
          job_id: jobId,
          name: newStageName.trim(),
          kind: "custom",
          sort_order: data.stages.length,
          is_terminal: false
        }
      });
      setNewStageName("");
      await refresh();
    } catch (e) {
      toast.error(e.message);
    }
  }
  async function renameStage(s, name) {
    if (!name.trim() || name === s.name) return;
    try {
      await upStage({
        data: {
          id: s.id,
          job_id: jobId,
          name: name.trim(),
          kind: s.kind,
          sort_order: s.sort_order,
          is_terminal: s.is_terminal
        }
      });
      await refresh();
    } catch (e) {
      toast.error(e.message);
    }
  }
  async function removeStage(id) {
    if (!confirm("Delete this stage?")) return;
    try {
      await delStage({
        data: {
          id
        }
      });
      await refresh();
    } catch (e) {
      toast.error(e.message);
    }
  }
  async function moveStage(idx, dir) {
    const next = [...data.stages];
    const j = idx + dir;
    if (j < 0 || j >= next.length) return;
    [next[idx], next[j]] = [next[j], next[idx]];
    const order = next.map((s, i) => ({
      id: s.id,
      sort_order: i
    }));
    try {
      await reorder({
        data: {
          job_id: jobId,
          order
        }
      });
      await refresh();
    } catch (e) {
      toast.error(e.message);
    }
  }
  if (!data) return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-6 text-muted-foreground", children: "Loading…" });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 md:p-6 space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-xl", children: data.job.title }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground", children: [
          data.job.location ?? "—",
          " • ",
          data.candidates.length,
          " candidates"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", className: "capitalize", children: data.job.status }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Dialog, { open: stagesOpen, onOpenChange: setStagesOpen, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Settings2, { className: "h-3.5 w-3.5 mr-1" }),
            "Edit pipeline"
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-lg", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Pipeline stages" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2 max-h-80 overflow-auto", children: data.stages.map((s, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { defaultValue: s.name, onBlur: (e) => renameStage(s, e.target.value), className: "flex-1" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "text-[10px] capitalize", children: s.kind }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", onClick: () => moveStage(i, -1), disabled: i === 0, children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowUp, { className: "h-3.5 w-3.5" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", onClick: () => moveStage(i, 1), disabled: i === data.stages.length - 1, children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowDown, { className: "h-3.5 w-3.5" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", onClick: () => removeStage(s.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5" }) })
            ] }, s.id)) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 pt-2 border-t", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "New stage name", value: newStageName, onChange: (e) => setNewStageName(e.target.value), onKeyDown: (e) => e.key === "Enter" && addStage() }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: addStage, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-3.5 w-3.5 mr-1" }),
                "Add"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(DialogFooter, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setStagesOpen(false), children: "Done" }) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { asChild: true, variant: "outline", size: "sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/org/recruitment", children: "All roles" }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-3", style: {
      gridTemplateColumns: `repeat(${data.stages.length}, minmax(220px, 1fr))`
    }, children: data.stages.map((s) => {
      const inStage = data.candidates.filter((c) => c.stage_id === s.id);
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { onDragOver: (e) => e.preventDefault(), onDrop: () => onDrop(s.id), className: "rounded-lg border bg-card/50 p-2 min-h-[400px]", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-2 flex items-center justify-between px-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-medium", children: s.name }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "text-[10px]", children: inStage.length })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: inStage.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/org/recruitment/candidate/$candidateId", params: {
          candidateId: c.id
        }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { draggable: true, onDragStart: () => setDragging(c.id), onDragEnd: () => setDragging(null), className: "cursor-grab hover:shadow-md transition " + (dragging === c.id ? "opacity-50" : ""), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-3 space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm font-medium", children: [
            c.first_name,
            " ",
            c.last_name
          ] }),
          c.current_title && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[11px] text-muted-foreground", children: [
            c.current_title,
            c.current_company ? ` @ ${c.current_company}` : ""
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-muted-foreground", children: new Date(c.applied_at).toLocaleDateString() })
        ] }) }) }, c.id)) })
      ] }, s.id);
    }) })
  ] });
}
export {
  JobBoard as component
};
