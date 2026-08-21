import type { PresetCompetency, TemplateKind } from "@/lib/review-presets";
import { formatScheduleLabel } from "@/lib/review-template-validation";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface Props {
  name: string;
  description?: string;
  industry?: string;
  kind: TemplateKind;
  scaleMin: number;
  scaleMax: number;
  scaleLabels: string[];
  competencies: PresetCompetency[];
}

/**
 * Read-only scorecard preview — mirrors the reviewer-facing form so admins
 * can see the exact KPI/KRA/360 UI before loading or editing a preset.
 */
export function ScorecardPreview(p: Props) {
  const totalWeight = p.competencies.reduce((s, c) => s + (Number(c.weight) || 0), 0);
  return (
    <Card className="border-dashed">
      <CardHeader>
        <div className="flex flex-wrap items-center gap-2">
          <CardTitle className="text-base">{p.name || "Untitled template"}</CardTitle>
          <Badge variant="secondary">{p.kind.toUpperCase()}</Badge>
          {p.industry && <Badge variant="outline">{p.industry}</Badge>}
          <Badge variant="outline" className="ml-auto">Preview — read-only</Badge>
        </div>
        {p.description && <CardDescription>{p.description}</CardDescription>}
        <div className="text-xs text-muted-foreground">
          Scale {p.scaleMin}–{p.scaleMax}
          {p.scaleLabels.length ? ` · ${p.scaleLabels.join(" / ")}` : ""}
          {p.competencies.some((c) => c.weight != null) ? ` · Weights total ${totalWeight}%` : ""}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {p.competencies.length === 0 && (
          <div className="text-sm text-muted-foreground italic">No items yet — load a preset or add an item to preview the scorecard.</div>
        )}
        {p.competencies.map((c, i) => (
          <div key={c.id} className="rounded-md border p-3 space-y-2 bg-muted/20" aria-disabled>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-muted-foreground">#{i + 1}</span>
              <span className="font-medium">{c.label || <em className="text-muted-foreground">(no label)</em>}</span>
              <Badge variant="outline">{c.type}</Badge>
              {c.required && <Badge>Required</Badge>}
              {c.weight != null && <Badge variant="secondary">{c.weight}%</Badge>}
              {c.schedule && <Badge variant="outline">{formatScheduleLabel(c.schedule)}</Badge>}
              {!c.schedule && c.reviewPeriod && <Badge variant="outline">{c.reviewPeriod}</Badge>}
            </div>
            {c.description && <div className="text-xs text-muted-foreground">{c.description}</div>}

            {/* Disabled mock input — exactly what reviewer sees */}
            <ReviewerControl c={c} scaleMin={p.scaleMin} scaleMax={p.scaleMax} scaleLabels={p.scaleLabels} />

            {(c.target != null || c.unit) && (
              <div className="text-xs text-muted-foreground">
                {c.target != null && <>Target: <strong>{String(c.target)}</strong>{c.unit ? ` ${c.unit}` : ""}</>}
                {c.min != null || c.max != null ? (
                  <span className="ml-2">Range: {c.min ?? "—"} – {c.max ?? "—"}{c.unit ? ` ${c.unit}` : ""}</span>
                ) : null}
              </div>
            )}

            {c.evidenceEnabled && (
              <div className="text-xs">
                <div className="text-muted-foreground">
                  Evidence: {(c.evidenceTypes ?? []).join(", ") || "none configured"}
                  {c.minEvidenceCount ? ` · min ${c.minEvidenceCount}` : ""}
                  {c.requiredEvidenceTypes?.length ? ` · required: ${c.requiredEvidenceTypes.join(", ")}` : ""}
                </div>
                <div className="mt-1 rounded border border-dashed p-2 text-muted-foreground">
                  📎 Reviewers will attach files, URLs, social posts or screenshots here.
                </div>
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function ReviewerControl({
  c, scaleMin, scaleMax, scaleLabels,
}: { c: PresetCompetency; scaleMin: number; scaleMax: number; scaleLabels: string[] }) {
  switch (c.type) {
    case "rating":
    case "scale": {
      const labels = scaleLabels.length === scaleMax - scaleMin + 1 ? scaleLabels : null;
      const opts = Array.from({ length: scaleMax - scaleMin + 1 }, (_, i) => scaleMin + i);
      return (
        <div className="flex flex-wrap gap-1">
          {opts.map((n, idx) => (
            <button key={n} type="button" disabled className="rounded border px-2 py-1 text-xs bg-background opacity-80 cursor-not-allowed">
              {n}{labels ? ` · ${labels[idx]}` : ""}
            </button>
          ))}
        </div>
      );
    }
    case "yes_no":
      return (
        <div className="flex gap-2">
          <button disabled className="rounded border px-3 py-1 text-xs bg-background opacity-80 cursor-not-allowed">{c.yesLabel || "Met"}</button>
          <button disabled className="rounded border px-3 py-1 text-xs bg-background opacity-80 cursor-not-allowed">{c.noLabel || "Not met"}</button>
        </div>
      );
    case "number":
    case "percentage":
    case "currency":
      return <Input disabled type="number" placeholder={c.unit ? `Value (${c.unit})` : "Value"} />;
    case "range":
      return (
        <div className="grid grid-cols-2 gap-2">
          <Input disabled type="number" placeholder={`Min ${c.unit ?? ""}`} />
          <Input disabled type="number" placeholder={`Max ${c.unit ?? ""}`} />
        </div>
      );
    case "text":
    default:
      return <Textarea disabled rows={2} placeholder="Reviewer comments…" />;
  }
}
