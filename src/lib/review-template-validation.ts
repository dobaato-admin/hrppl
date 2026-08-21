import type { PresetCompetency } from "./review-presets";

export interface ValidationIssue {
  itemIndex?: number;
  itemId?: string;
  field?: string;
  message: string;
}

export interface TemplateDraft {
  name: string;
  scaleMin: number;
  scaleMax: number;
  competencies: PresetCompetency[];
}

/**
 * Validate a review template draft. Returns an array of inline issues.
 * Empty array = template is consistent and safe to save.
 */
export function validateTemplate(draft: TemplateDraft): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  if (!draft.name?.trim()) issues.push({ field: "name", message: "Template name is required." });
  if (draft.scaleMax <= draft.scaleMin) {
    issues.push({ field: "scale", message: "Scale max must be greater than scale min." });
  }

  const totalWeight = draft.competencies.reduce((s, c) => s + (Number(c.weight) || 0), 0);
  if (draft.competencies.some((c) => c.weight != null) && totalWeight > 100.0001) {
    issues.push({ field: "weight", message: `Weights total ${totalWeight}% — must be ≤ 100%.` });
  }

  const seenIds = new Set<string>();
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
      const expected: Record<string, number> = { monthly: 12, quarterly: 4, half_yearly: 2, annual: 1, custom: -1 };
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

export function formatScheduleLabel(s?: PresetCompetency["schedule"]): string {
  if (!s) return "—";
  const base = s.type.replace("_", "-");
  const tail = s.periods?.length ? ` · ${s.periods.join(", ")}` : "";
  const start = s.startDate ? ` (from ${s.startDate})` : "";
  return `${base}${tail}${start}`;
}
