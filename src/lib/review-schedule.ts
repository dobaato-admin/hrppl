import type { ReviewSchedule } from "./review-presets";

function defaultPeriodLabels(type: ReviewSchedule["type"]): string[] {
  switch (type) {
    case "monthly": return ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    case "quarterly": return ["Q1","Q2","Q3","Q4"];
    case "half_yearly": return ["H1","H2"];
    case "annual": return ["Annual"];
    default: return [];
  }
}

/**
 * Expand a review schedule into concrete period labels + dates within [from, to].
 * Pure function — used by both server (instance generation) and tests.
 */
export function expandSchedule(
  s: ReviewSchedule | undefined,
  from: Date,
  to: Date,
): Array<{ period: string; date: Date }> {
  if (!s) return [];
  const out: Array<{ period: string; date: Date }> = [];
  const startBase = s.startDate ? new Date(s.startDate + "T00:00:00Z") : from;

  if (s.type === "custom") {
    for (const p of s.periods ?? []) {
      const d = /^\d{4}-\d{2}(-\d{2})?$/.test(p)
        ? new Date((p.length === 7 ? p + "-01" : p) + "T00:00:00Z")
        : startBase;
      if (d >= from && d <= to) out.push({ period: p, date: d });
    }
    return out;
  }

  const cadenceMonths: Record<string, number> = {
    monthly: 1, quarterly: 3, half_yearly: 6, annual: 12,
  };
  const step = cadenceMonths[s.type] ?? 0;
  if (!step) return out;
  const labels = s.periods ?? defaultPeriodLabels(s.type);
  const year = (s.startDate ? new Date(s.startDate) : from).getUTCFullYear();
  for (let i = 0; i < labels.length; i += 1) {
    const monthIdx = i * step;
    const d = new Date(Date.UTC(year, monthIdx, 1));
    if (d >= from && d <= to) out.push({ period: labels[i], date: d });
  }
  return out;
}
