import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Download, Printer } from "lucide-react";
import { toast } from "sonner";
import {
  exportOnboardingAuditCsv,
  exportVariationAuditCsv,
} from "@/lib/audit-export.functions";

type Source = "onboarding" | "variation";

interface Props {
  source: Source;
  scopeId?: string; // assignment_id or variation_id
  scopeLabel?: string;
}

function todayIso() { return new Date().toISOString().slice(0, 10); }
function isoDaysAgo(n: number) {
  return new Date(Date.now() - n * 86400_000).toISOString().slice(0, 10);
}

function downloadBlob(name: string, content: string, mime: string) {
  const url = URL.createObjectURL(new Blob([content], { type: mime }));
  const a = document.createElement("a");
  a.href = url; a.download = name; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

function csvToHtml(csv: string, title: string): string {
  const lines = csv.split("\n");
  const rows = lines.map((l) => {
    const cells: string[] = []; let cur = ""; let q = false;
    for (let i = 0; i < l.length; i++) {
      const ch = l[i];
      if (q) {
        if (ch === '"' && l[i + 1] === '"') { cur += '"'; i++; }
        else if (ch === '"') q = false;
        else cur += ch;
      } else {
        if (ch === ",") { cells.push(cur); cur = ""; }
        else if (ch === '"') q = true;
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
  <div class="meta">Generated ${new Date().toLocaleString()} · ${body.length} rows</div>
  <div class="noprint" style="margin-bottom:12px;"><button onclick="window.print()">Print / Save as PDF</button></div>
  <table><thead><tr>${header.map((h) => `<th>${h}</th>`).join("")}</tr></thead>
  <tbody>${body
    .map((r) => `<tr>${r.map((c) => `<td>${(c ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;")}</td>`).join("")}</tr>`)
    .join("")}</tbody></table>
  <script>setTimeout(()=>window.print(),400);</script>
  </body></html>`;
}

export function AuditExportButtons({ source, scopeId, scopeLabel }: Props) {
  const [start, setStart] = useState(isoDaysAgo(30));
  const [end, setEnd] = useState(todayIso());
  const [busy, setBusy] = useState(false);
  const onboardingFn = useServerFn(exportOnboardingAuditCsv);
  const variationFn = useServerFn(exportVariationAuditCsv);

  async function run(format: "csv" | "pdf") {
    setBusy(true);
    try {
      const args: any = { data: { start_date: start, end_date: end } };
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
        if (w) { w.document.write(html); w.document.close(); }
      }
      toast.success(`Exported ${res.count} row${res.count === 1 ? "" : "s"}`);
    } catch (e: any) {
      toast.error(e?.message ?? "Export failed");
    } finally { setBusy(false); }
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-1" /> Export audit
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 space-y-3" align="end">
        <div className="text-sm font-medium">Export audit log</div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-xs">From</Label>
            <Input type="date" value={start} max={end} onChange={(e) => setStart(e.target.value)} />
          </div>
          <div>
            <Label className="text-xs">To</Label>
            <Input type="date" value={end} min={start} max={todayIso()} onChange={(e) => setEnd(e.target.value)} />
          </div>
        </div>
        <div className="flex gap-2 justify-end pt-1">
          <Button variant="outline" size="sm" disabled={busy} onClick={() => run("pdf")}>
            <Printer className="h-4 w-4 mr-1" /> PDF
          </Button>
          <Button size="sm" disabled={busy} onClick={() => run("csv")}>
            <Download className="h-4 w-4 mr-1" /> CSV
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
