import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { a as useServerFn, B as Button } from "./router-CLxirH5A.mjs";
import { I as Input } from "./input-C6yqZkRy.mjs";
import { L as Label } from "./label-Cbju7vgw.mjs";
import { P as Popover, b as PopoverTrigger, c as PopoverContent } from "./AppShell-fbDALlr7.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { c as createSsrRpc } from "./createSsrRpc-CRedQJGY.mjs";
import { r as requireSupabaseAuth } from "./auth-guard-CkYFJuQL.mjs";
import { c as createServerFn } from "./server-BOi2EjMN.mjs";
import { D as Download, aX as Printer } from "../_libs/lucide-react.mjs";
import { a as objectType, z as stringType } from "../_libs/zod.mjs";
const DateStr = stringType().regex(/^\d{4}-\d{2}-\d{2}$/);
const RangeInput = objectType({
  start_date: DateStr.optional(),
  end_date: DateStr.optional(),
  assignment_id: stringType().uuid().optional(),
  variation_id: stringType().uuid().optional()
}).partial();
const exportOnboardingAuditCsv = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => RangeInput.parse(d ?? {})).handler(createSsrRpc("5409fc3027ce24907be574a7969ee418767984441830ecf7309ae9532dbecf89"));
const exportVariationAuditCsv = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => RangeInput.parse(d ?? {})).handler(createSsrRpc("834dedec00b486acfdf6c5f83f7826440c95170f7a99a65803d23334955bcf2e"));
function todayIso() {
  return (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
}
function isoDaysAgo(n) {
  return new Date(Date.now() - n * 864e5).toISOString().slice(0, 10);
}
function downloadBlob(name, content, mime) {
  const url = URL.createObjectURL(new Blob([content], { type: mime }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}
function csvToHtml(csv, title) {
  const lines = csv.split("\n");
  const rows = lines.map((l) => {
    const cells = [];
    let cur = "";
    let q = false;
    for (let i = 0; i < l.length; i++) {
      const ch = l[i];
      if (q) {
        if (ch === '"' && l[i + 1] === '"') {
          cur += '"';
          i++;
        } else if (ch === '"') q = false;
        else cur += ch;
      } else {
        if (ch === ",") {
          cells.push(cur);
          cur = "";
        } else if (ch === '"') q = true;
        else cur += ch;
      }
    }
    cells.push(cur);
    return cells;
  });
  const header = rows[0] ?? [];
  const body = rows.slice(1);
  return `<!doctype html><html><head><meta charset="utf-8"><title>${title}</title>
  <style>
    body{font:12px/1.45 -apple-system,Segoe UI,Roboto,sans-serif;color:#0f172a;padding:24px;}
    h1{font-size:18px;margin:0 0 4px;} .meta{color:#64748b;margin-bottom:16px;}
    table{border-collapse:collapse;width:100%;font-size:11px;}
    th,td{border:1px solid #e2e8f0;padding:6px 8px;vertical-align:top;text-align:left;}
    th{background:#f8fafc;}
    @media print { @page { size: A4 landscape; margin: 12mm; } .noprint{display:none;} }
    button{padding:8px 14px;border-radius:6px;border:1px solid #0f172a;background:#0f172a;color:#fff;cursor:pointer;}
  </style></head><body>
  <h1>${title}</h1>
  <div class="meta">Generated ${(/* @__PURE__ */ new Date()).toLocaleString()} · ${body.length} rows</div>
  <div class="noprint" style="margin-bottom:12px;"><button onclick="window.print()">Print / Save as PDF</button></div>
  <table><thead><tr>${header.map((h) => `<th>${h}</th>`).join("")}</tr></thead>
  <tbody>${body.map((r) => `<tr>${r.map((c) => `<td>${(c ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;")}</td>`).join("")}</tr>`).join("")}</tbody></table>
  <script>setTimeout(()=>window.print(),400);<\/script>
  </body></html>`;
}
function AuditExportButtons({ source, scopeId, scopeLabel }) {
  const [start, setStart] = reactExports.useState(isoDaysAgo(30));
  const [end, setEnd] = reactExports.useState(todayIso());
  const [busy, setBusy] = reactExports.useState(false);
  const onboardingFn = useServerFn(exportOnboardingAuditCsv);
  const variationFn = useServerFn(exportVariationAuditCsv);
  async function run(format) {
    setBusy(true);
    try {
      const args = { data: { start_date: start, end_date: end } };
      if (source === "onboarding" && scopeId) args.data.assignment_id = scopeId;
      if (source === "variation" && scopeId) args.data.variation_id = scopeId;
      const res = source === "onboarding" ? await onboardingFn(args) : await variationFn(args);
      const title = `${source === "onboarding" ? "Onboarding" : "Approval"} audit log${scopeLabel ? ` — ${scopeLabel}` : ""} (${start} → ${end})`;
      const filename = `${source}-audit-${start}_to_${end}.csv`;
      if (format === "csv") {
        downloadBlob(filename, res.csv, "text/csv;charset=utf-8");
      } else {
        const html = csvToHtml(res.csv, title);
        const w = window.open("", "_blank");
        if (w) {
          w.document.write(html);
          w.document.close();
        }
      }
      toast.success(`Exported ${res.count} row${res.count === 1 ? "" : "s"}`);
    } catch (e) {
      toast.error(e?.message ?? "Export failed");
    } finally {
      setBusy(false);
    }
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Popover, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PopoverTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "h-4 w-4 mr-1" }),
      " Export audit"
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(PopoverContent, { className: "w-80 space-y-3", align: "end", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-medium", children: "Export audit log" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "From" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: start, max: end, onChange: (e) => setStart(e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "To" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: end, min: start, max: todayIso(), onChange: (e) => setEnd(e.target.value) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 justify-end pt-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", disabled: busy, onClick: () => run("pdf"), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { className: "h-4 w-4 mr-1" }),
          " PDF"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", disabled: busy, onClick: () => run("csv"), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "h-4 w-4 mr-1" }),
          " CSV"
        ] })
      ] })
    ] })
  ] });
}
export {
  AuditExportButtons as A
};
