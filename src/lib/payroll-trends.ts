/**
 * Payroll cost over time: bucketing, comparison and the cost views.
 *
 * Kept pure and separate from the query that feeds it, because every failure
 * worth catching here is arithmetic — a quarter that starts in the wrong
 * month, a year-on-year comparison against a period that does not exist, a
 * per-employee average divided by a headcount of zero.
 *
 * ## What "cost" means, which is the whole point of the views
 *
 * There is no single right answer to "what did this person cost", so the
 * product must not pick one silently:
 *
 * - **Net pay** is what left the business towards the employee.
 * - **Gross** is net plus what was withheld on their behalf — tax and employee
 *   contributions are still their money.
 * - **Total cost to the business** adds *employer* contributions, which the
 *   employee never sees and which do not appear anywhere on a payslip.
 * - **Including expenses** adds reimbursed claims, which are not pay at all
 *   but are real money out for that person.
 *
 * Reporting any one of these as "cost" without saying which produces numbers
 * that disagree with the finance team's, and the disagreement is invisible.
 */

export type Grouping = "month" | "quarter" | "year";

export type CostView = "net" | "gross" | "employer" | "withExpenses";

export const COST_VIEW_LABEL: Record<CostView, string> = {
  net: "Net pay",
  gross: "Gross pay",
  employer: "Total cost to business",
  withExpenses: "Total cost + expenses",
};

export const COST_VIEW_HELP: Record<CostView, string> = {
  net: "What employees actually received.",
  gross: "Net pay plus tax and employee contributions withheld on their behalf.",
  employer: "Gross pay plus employer contributions — what the business paid out.",
  withExpenses: "Total cost to the business plus reimbursed expense claims.",
};

/** One payroll run, flattened to the numbers a trend needs. */
export interface RunPoint {
  /** The run's pay date — a trend is grouped by when money moved. */
  payDate: string;
  periodStart: string;
  periodEnd: string;
  gross: number;
  incomeTax: number;
  employeeContributions: number;
  employerContributions: number;
  netPay: number;
  headcount: number;
  currency: string;
}

/** Reimbursed expenses, already summed per date. */
export interface ExpensePoint {
  paidDate: string;
  amount: number;
}

export interface TrendBucket {
  /** Sort key: `2026-08`, `2026-Q3`, `2026`. */
  key: string;
  /** What a person calls it: "Aug 2026", "Q3 2026", "2026". */
  label: string;
  gross: number;
  incomeTax: number;
  employeeContributions: number;
  employerContributions: number;
  netPay: number;
  expenses: number;
  /** Runs that fell in this bucket. Zero means no payroll was run. */
  runs: number;
  /**
   * Headcount is the MAXIMUM across runs in the bucket, not the sum — two
   * monthly runs of five people in one quarter is five people, not ten.
   */
  headcount: number;
}

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/** The bucket a calendar date falls in, for a grouping. */
export function bucketKey(ymd: string, grouping: Grouping): string {
  const [y, m] = ymd.split("-").map(Number);
  if (grouping === "year") return String(y);
  if (grouping === "quarter") return `${y}-Q${Math.floor((m - 1) / 3) + 1}`;
  return `${y}-${String(m).padStart(2, "0")}`;
}

export function bucketLabel(key: string, grouping: Grouping): string {
  if (grouping === "year") return key;
  if (grouping === "quarter") {
    const [y, q] = key.split("-");
    return `${q} ${y}`;
  }
  const [y, m] = key.split("-").map(Number);
  return `${MONTHS[m - 1]} ${y}`;
}

/** The value a bucket contributes under a given cost view. */
export function costOf(b: TrendBucket, view: CostView): number {
  switch (view) {
    case "net":
      return b.netPay;
    case "gross":
      return b.gross;
    case "employer":
      return b.gross + b.employerContributions;
    case "withExpenses":
      return b.gross + b.employerContributions + b.expenses;
  }
}

/**
 * Group runs and expenses into buckets, oldest first.
 *
 * Buckets with no payroll run are **not** invented. A gap in the chart is a
 * month nobody was paid, which is a fact worth seeing; filling it with a zero
 * would draw a cliff that did not happen, and filling it by carrying the
 * previous value forward would draw a payroll that did not happen.
 */
export function buildTrend(
  runs: RunPoint[],
  expenses: ExpensePoint[],
  grouping: Grouping,
): TrendBucket[] {
  const byKey = new Map<string, TrendBucket>();

  const ensure = (key: string): TrendBucket => {
    let b = byKey.get(key);
    if (!b) {
      b = {
        key,
        label: bucketLabel(key, grouping),
        gross: 0,
        incomeTax: 0,
        employeeContributions: 0,
        employerContributions: 0,
        netPay: 0,
        expenses: 0,
        runs: 0,
        headcount: 0,
      };
      byKey.set(key, b);
    }
    return b;
  };

  for (const r of runs) {
    const b = ensure(bucketKey(r.payDate, grouping));
    b.gross += r.gross;
    b.incomeTax += r.incomeTax;
    b.employeeContributions += r.employeeContributions;
    b.employerContributions += r.employerContributions;
    b.netPay += r.netPay;
    b.runs += 1;
    b.headcount = Math.max(b.headcount, r.headcount);
  }

  for (const e of expenses) {
    // Expenses only land in a bucket that already has payroll, or one of their
    // own — an expense-only month is still a month money went out.
    const b = ensure(bucketKey(e.paidDate, grouping));
    b.expenses += e.amount;
  }

  return [...byKey.values()].sort((a, b) => (a.key < b.key ? -1 : a.key > b.key ? 1 : 0));
}

export interface Comparison {
  /** Current value under the chosen view. */
  current: number;
  /** The value being compared against, or null when there is nothing to compare. */
  previous: number | null;
  /** Signed change, or null. */
  change: number | null;
  /** Signed percentage change, or null. Null also when previous is zero. */
  percent: number | null;
  /** What the comparison is against, for the label: "Jul 2026". */
  againstLabel: string | null;
}

/**
 * Compare the latest bucket with the one before it (period on period).
 *
 * `previous` is null rather than zero when there is no earlier bucket. A first
 * month showing "+100%" is a fabrication, and the difference between "no prior
 * data" and "prior was zero" is exactly what a finance reader needs.
 */
export function periodOnPeriod(buckets: TrendBucket[], view: CostView): Comparison {
  const latest = buckets[buckets.length - 1];
  const prior = buckets[buckets.length - 2];
  return compare(latest, prior, view);
}

/**
 * Compare the latest bucket with the same bucket a year earlier.
 *
 * Looks the prior period up **by key**, never by offset: with gaps in the
 * data, "twelve buckets back" is not "a year ago", and silently comparing
 * August against the previous March is worse than saying there is nothing to
 * compare.
 */
export function yearOnYear(buckets: TrendBucket[], view: CostView): Comparison {
  const latest = buckets[buckets.length - 1];
  if (!latest) return compare(undefined, undefined, view);
  const priorKey = priorYearKey(latest.key);
  const prior = buckets.find((b) => b.key === priorKey);
  return compare(latest, prior, view);
}

/** `2026-08` → `2025-08`, `2026-Q3` → `2025-Q3`, `2026` → `2025`. */
export function priorYearKey(key: string): string {
  if (/^\d{4}$/.test(key)) return String(Number(key) - 1);
  const [y, rest] = key.split("-");
  return `${Number(y) - 1}-${rest}`;
}

function compare(
  latest: TrendBucket | undefined,
  prior: TrendBucket | undefined,
  view: CostView,
): Comparison {
  if (!latest) {
    return { current: 0, previous: null, change: null, percent: null, againstLabel: null };
  }
  const current = costOf(latest, view);
  if (!prior) {
    return { current, previous: null, change: null, percent: null, againstLabel: null };
  }
  const previous = costOf(prior, view);
  const change = current - previous;
  return {
    current,
    previous,
    change,
    // Percentage against zero is not infinity, it is meaningless. Report the
    // absolute change and leave the percentage out.
    percent: previous === 0 ? null : (change / previous) * 100,
    againstLabel: prior.label,
  };
}

/**
 * Average cost per employee in a bucket.
 *
 * Null when headcount is zero — a bucket with expenses but no payroll run has
 * no headcount, and dividing by it would print Infinity on a finance screen.
 */
export function costPerEmployee(b: TrendBucket, view: CostView): number | null {
  if (b.headcount <= 0) return null;
  return costOf(b, view) / b.headcount;
}

/** Totals across every bucket, for the summary tiles. */
export function trendTotals(buckets: TrendBucket[], view: CostView) {
  const total = buckets.reduce((s, b) => s + costOf(b, view), 0);
  const runs = buckets.reduce((s, b) => s + b.runs, 0);
  const peakHeadcount = buckets.reduce((s, b) => Math.max(s, b.headcount), 0);
  const paidBuckets = buckets.filter((b) => b.runs > 0);
  return {
    total,
    runs,
    peakHeadcount,
    /** Average per bucket that actually had a payroll run. */
    averagePerPeriod: paidBuckets.length > 0 ? total / paidBuckets.length : 0,
    periods: buckets.length,
  };
}
