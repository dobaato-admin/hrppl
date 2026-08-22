import { j as jsxRuntimeExports, r as reactExports } from "../_libs/react.mjs";
import { e as useNavigate } from "../_libs/tanstack__react-router.mjs";
import { u as useAuth, a as useServerFn, C as Card, b as CardHeader, c as CardTitle, d as CardDescription, e as CardContent, B as Button, f as Badge, T as Textarea } from "./router-CLxirH5A.mjs";
import { u as useQueryClient, a as useQuery } from "../_libs/tanstack__react-query.mjs";
import { A as AppShell } from "./AppShell-fbDALlr7.mjs";
import { I as Input } from "./input-C6yqZkRy.mjs";
import { L as Label } from "./label-Cbju7vgw.mjs";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-Bk9id1Ls.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { a as listEmployeesForDuties } from "./employee-duties.functions-B9YLH8cu.mjs";
import { a as getDutyReview, u as upsertDutyScore, e as exportDutyReviewCsv, b as getDutyReviewExportData } from "./duty-reviews.functions-DnQSYgsJ.mjs";
import { a as listCycles } from "./kpi-cycles.functions-7Fp0RqjE.mjs";
import { b as jspdf_node_minExports } from "../_libs/jspdf.mjs";
import { A as AdminGate } from "./AdminGate-B3-x5ytD.mjs";
import { O as ORG_ADMIN_OR_MANAGER } from "./rbac-BWg_Nf1T.mjs";
import "../_libs/seroval.mjs";
import "../_libs/lovable.dev__mcp-js.mjs";
import "../_libs/modelcontextprotocol__sdk.mjs";
import "../_libs/zod-to-json-schema.mjs";
import "../_libs/ajv-formats.mjs";
import { ac as Target, D as Download, q as FileText } from "../_libs/lucide-react.mjs";
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
import "../_libs/fflate.mjs";
import "../_libs/fast-png.mjs";
import "../_libs/iobuffer.mjs";
import "../_libs/pako.mjs";
import "fs";
import "path";
import "../_libs/html2canvas.mjs";
import "../_libs/dompurify.mjs";
import "../_libs/canvg.mjs";
import "../_libs/core-js.mjs";
import "../_libs/babel__runtime.mjs";
import "../_libs/raf.mjs";
import "../_libs/performance-now.mjs";
import "../_libs/rgbcolor.mjs";
import "../_libs/svg-pathdata.mjs";
import "../_libs/stackblur-canvas.mjs";
function generateDutyReviewPdf(payload) {
  const doc = new jspdf_node_minExports.jsPDF({ unit: "pt", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 40;
  let y = margin;
  const addLine = (text, size = 10, bold = false) => {
    if (y > pageH - margin) {
      doc.addPage();
      y = margin;
    }
    doc.setFontSize(size);
    doc.setFont("helvetica", bold ? "bold" : "normal");
    const wrapped = doc.splitTextToSize(text, pageW - margin * 2);
    for (const ln of wrapped) {
      if (y > pageH - margin) {
        doc.addPage();
        y = margin;
      }
      doc.text(ln, margin, y);
      y += size + 4;
    }
  };
  const hr = () => {
    if (y > pageH - margin - 6) {
      doc.addPage();
      y = margin;
    }
    doc.setDrawColor(200);
    doc.line(margin, y, pageW - margin, y);
    y += 8;
  };
  addLine(payload.tenant_name, 18, true);
  addLine(`Duty-based performance report — Cycle ${payload.cycle.label}`, 13, true);
  const range = [payload.cycle.starts_on, payload.cycle.ends_on].filter(Boolean).join(" → ");
  if (range) addLine(`Period: ${range}  ·  Status: ${payload.cycle.status ?? "—"}`, 10);
  addLine(`Generated: ${new Date(payload.generated_at).toLocaleString()}`, 9);
  hr();
  if (payload.employees.length === 0) {
    addLine("No submitted scores for this cycle.", 11);
  }
  for (const emp of payload.employees) {
    const name = `${emp.employee.first_name ?? ""} ${emp.employee.last_name ?? ""}`.trim() || (emp.employee.email ?? "Employee");
    addLine(name, 13, true);
    if (emp.employee.job_title) addLine(emp.employee.job_title, 10);
    if (emp.employee.email) addLine(emp.employee.email, 9);
    addLine(
      `Total weight: ${emp.total_weight}%  ·  Final score: ${emp.final_score == null ? "—" : `${emp.final_score} / 100`}`,
      11,
      true
    );
    y += 4;
    const colX = [margin, margin + 200, margin + 250, margin + 295, margin + 345, margin + 405];
    const drawRow = (cells, bold = false) => {
      if (y > pageH - margin - 14) {
        doc.addPage();
        y = margin;
      }
      doc.setFontSize(9);
      doc.setFont("helvetica", bold ? "bold" : "normal");
      doc.text(cells[0], colX[0], y);
      doc.text(cells[1], colX[1], y);
      doc.text(cells[2], colX[2], y);
      doc.text(cells[3], colX[3], y);
      doc.text(cells[4], colX[4], y);
      doc.text(cells[5], colX[5], y);
      y += 12;
    };
    drawRow(["Duty", "Weight", "Score", "Weighted", "Submitter", "Comments"], true);
    doc.setDrawColor(220);
    doc.line(margin, y - 8, pageW - margin, y - 8);
    for (const ln of emp.lines) {
      const truncDuty = ln.duty_title.length > 38 ? ln.duty_title.slice(0, 35) + "…" : ln.duty_title;
      const truncCmt = (ln.comments ?? "").slice(0, 60);
      drawRow([
        truncDuty,
        `${ln.weight}%`,
        ln.score == null ? "—" : String(ln.score),
        ln.weighted_contribution == null ? "—" : String(ln.weighted_contribution),
        ln.submitter ?? "—",
        truncCmt
      ]);
    }
    y += 8;
    hr();
  }
  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(`Page ${i} / ${pages}`, pageW - margin, pageH - 16, { align: "right" });
    doc.setTextColor(0);
  }
  return doc.output("blob");
}
function defaultCycleLabel() {
  const d = /* @__PURE__ */ new Date();
  const q = Math.floor(d.getMonth() / 3) + 1;
  return `${d.getFullYear()}-Q${q}`;
}
function DutyReviewsPage() {
  const {
    user,
    roles,
    loading,
    rolesLoaded
  } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const canAccess = roles.includes("org_admin") || roles.includes("super_admin") || roles.includes("manager");
  const empListFn = useServerFn(listEmployeesForDuties);
  const reviewFn = useServerFn(getDutyReview);
  const saveFn = useServerFn(upsertDutyScore);
  const cyclesFn = useServerFn(listCycles);
  const exportFn = useServerFn(exportDutyReviewCsv);
  const exportDataFn = useServerFn(getDutyReviewExportData);
  const [employeeId, setEmployeeId] = reactExports.useState("");
  const [cycleLabel, setCycleLabel] = reactExports.useState(defaultCycleLabel());
  reactExports.useEffect(() => {
    if (!loading && !user) navigate({
      to: "/auth"
    });
    else if (!loading && user && rolesLoaded && !canAccess) {
      toast.error("Manager/Admin only");
      navigate({
        to: "/dashboard"
      });
    }
  }, [loading, user, rolesLoaded, canAccess, navigate]);
  const empQ = useQuery({
    queryKey: ["duty-review-employees"],
    queryFn: () => empListFn(),
    enabled: canAccess
  });
  const cyclesQ = useQuery({
    queryKey: ["kpi-cycles-for-reviews"],
    queryFn: () => cyclesFn({}),
    enabled: canAccess
  });
  async function downloadCsv() {
    try {
      const res = await exportFn({
        data: {
          cycleLabel
        }
      });
      const blob = new Blob([res.csv], {
        type: "text/csv;charset=utf-8"
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = res.filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      toast.error(e?.message ?? "Export failed");
    }
  }
  async function downloadPdf() {
    try {
      const payload = await exportDataFn({
        data: {
          cycleLabel
        }
      });
      const blob = generateDutyReviewPdf(payload);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `duty-review-${cycleLabel}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      toast.error(e?.message ?? "PDF export failed");
    }
  }
  const reviewQ = useQuery({
    queryKey: ["duty-review", employeeId, cycleLabel],
    queryFn: () => reviewFn({
      data: {
        employeeId,
        cycleLabel
      }
    }),
    enabled: canAccess && !!employeeId && !!cycleLabel
  });
  const [drafts, setDrafts] = reactExports.useState({});
  reactExports.useEffect(() => {
    if (!reviewQ.data) return;
    const map = {};
    for (const it of reviewQ.data.items) {
      map[it.duty.id] = {
        score: it.score == null ? "" : String(it.score),
        comments: it.comments ?? ""
      };
    }
    setDrafts(map);
  }, [reviewQ.data]);
  const liveFinal = reactExports.useMemo(() => {
    if (!reviewQ.data) return null;
    let weighted = 0, totalW = 0;
    for (const it of reviewQ.data.items) {
      const w = Number(it.duty.weight || 0);
      totalW += w;
      const v = Number(drafts[it.duty.id]?.score);
      if (!Number.isNaN(v) && drafts[it.duty.id]?.score !== "") weighted += v * w;
    }
    return totalW > 0 ? weighted / totalW : null;
  }, [reviewQ.data, drafts]);
  async function saveOne(dutyId) {
    const d = drafts[dutyId];
    if (!d) return;
    const score = Number(d.score);
    if (Number.isNaN(score) || score < 0 || score > 100) {
      toast.error("Score must be 0–100");
      return;
    }
    try {
      await saveFn({
        data: {
          employeeId,
          dutyId,
          cycleLabel,
          score,
          comments: d.comments || ""
        }
      });
      toast.success("Saved");
      qc.invalidateQueries({
        queryKey: ["duty-review", employeeId, cycleLabel]
      });
    } catch (e) {
      toast.error(e?.message ?? "Failed");
    }
  }
  async function saveAll() {
    if (!reviewQ.data) return;
    try {
      for (const it of reviewQ.data.items) {
        const d = drafts[it.duty.id];
        if (!d || d.score === "") continue;
        const score = Number(d.score);
        if (Number.isNaN(score) || score < 0 || score > 100) continue;
        await saveFn({
          data: {
            employeeId,
            dutyId: it.duty.id,
            cycleLabel,
            score,
            comments: d.comments || ""
          }
        });
      }
      toast.success("All scores saved");
      qc.invalidateQueries({
        queryKey: ["duty-review", employeeId, cycleLabel]
      });
    } catch (e) {
      toast.error(e?.message ?? "Failed");
    }
  }
  if (loading || !user) return /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "flex min-h-screen items-center justify-center text-muted-foreground", children: "Loading…" });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AppShell, { title: "Duty-based KPI review", subtitle: "Score each duty out of 100. Final rating is weighted by KPI weight.", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "mx-auto max-w-5xl space-y-6 p-4 md:p-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Target, { className: "h-5 w-5 text-primary" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { children: "Pick employee & cycle" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "Cycle label is free-form (e.g. 2026-Q1, 2026 H1, 2026 annual)." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "grid grid-cols-1 gap-3 md:grid-cols-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Employee" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: employeeId, onValueChange: setEmployeeId, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select employee" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: (empQ.data?.employees ?? []).map((e) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: e.id, children: [
              e.first_name,
              " ",
              e.last_name
            ] }, e.id)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Cycle" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: cycleLabel, onValueChange: setCycleLabel, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select cycle" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: (cyclesQ.data?.cycles ?? []).map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: c.label, children: [
              c.label,
              " · ",
              c.status
            ] }, c.id)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-end justify-end gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", onClick: downloadCsv, disabled: !cycleLabel, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "h-4 w-4 mr-1" }),
            "Export CSV"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", onClick: downloadPdf, disabled: !cycleLabel, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-4 w-4 mr-1" }),
            "Export PDF"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: saveAll, disabled: !reviewQ.data || reviewQ.data.items.length === 0, children: "Save all" })
        ] })
      ] })
    ] }),
    employeeId && reviewQ.data && /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { children: [
          reviewQ.data.employee.first_name,
          " ",
          reviewQ.data.employee.last_name
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardDescription, { children: [
          reviewQ.data.items.length,
          " duties · Total weight ",
          reviewQ.data.totalWeight,
          "%",
          liveFinal != null && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            " · ",
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: liveFinal >= 70 ? "default" : liveFinal >= 50 ? "secondary" : "outline", children: [
              "Final ",
              liveFinal.toFixed(1),
              "/100"
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-3", children: [
        reviewQ.data.items.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "This employee has no active duties yet. Add them from Duties & responsibilities." }),
        reviewQ.data.items.map((it) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded border p-3 space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-start justify-between gap-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-medium", children: [
              it.duty.title,
              " ",
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "outline", className: "ml-1", children: [
                it.duty.weight,
                "%"
              ] })
            ] }),
            it.duty.kpi_target && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground", children: [
              "Target: ",
              it.duty.kpi_target
            ] }),
            it.duty.description && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: it.duty.description })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-[120px_1fr_auto] gap-2 items-start", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Score 0–100" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: 0, max: 100, value: drafts[it.duty.id]?.score ?? "", onChange: (e) => setDrafts({
                ...drafts,
                [it.duty.id]: {
                  ...drafts[it.duty.id] ?? {
                    score: "",
                    comments: ""
                  },
                  score: e.target.value
                }
              }) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Comments" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, value: drafts[it.duty.id]?.comments ?? "", onChange: (e) => setDrafts({
                ...drafts,
                [it.duty.id]: {
                  ...drafts[it.duty.id] ?? {
                    score: "",
                    comments: ""
                  },
                  comments: e.target.value
                }
              }) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pt-5", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", onClick: () => saveOne(it.duty.id), children: "Save" }) })
          ] })
        ] }, it.duty.id))
      ] })
    ] })
  ] }) });
}
const SplitComponent = () => /* @__PURE__ */ jsxRuntimeExports.jsx(AdminGate, { allow: ORG_ADMIN_OR_MANAGER, children: /* @__PURE__ */ jsxRuntimeExports.jsx(DutyReviewsPage, {}) });
export {
  SplitComponent as component
};
