/**
 * Propose the pay period a run is most likely for.
 *
 * Opening "New run" used to present three empty date fields. The admin knows
 * what they want — last month — and has to work out and type three dates that
 * the tenant's own pay-period setting already determines. Getting one of them
 * wrong is not cosmetic: the period bounds decide which timesheets and leave
 * fall into the run, so a period off by a day silently moves somebody's
 * overtime into the wrong pay.
 *
 * Everything here is pure and calendar-date based (`YYYY-MM-DD`), with no
 * `Date` arithmetic that could drift a day across a time zone — the same rule
 * `src/lib/work-date.ts` exists for. A pay period is a calendar concept.
 */

export type PayPeriod = "weekly" | "fortnightly" | "semimonthly" | "monthly";

export interface ProposedPeriod {
  periodStart: string;
  periodEnd: string;
  payDate: string;
  /** What to call it in the UI: "August 2026", "1–15 Sep 2026". */
  label: string;
}

const DAY_MS = 86_400_000;

/** `YYYY-MM-DD` → UTC epoch ms at midnight. Safe: both ends are calendar dates. */
function toMs(ymd: string): number {
  const [y, m, d] = ymd.split("-").map(Number);
  return Date.UTC(y, m - 1, d);
}

function toYmd(ms: number): string {
  const d = new Date(ms);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(
    d.getUTCDate(),
  ).padStart(2, "0")}`;
}

function addDays(ymd: string, n: number): string {
  return toYmd(toMs(ymd) + n * DAY_MS);
}

/** Last calendar day of the month containing `ymd`. Handles February and leap years. */
function endOfMonth(ymd: string): string {
  const [y, m] = ymd.split("-").map(Number);
  return toYmd(Date.UTC(y, m, 0));
}

function startOfMonth(ymd: string): string {
  const [y, m] = ymd.split("-").map(Number);
  return toYmd(Date.UTC(y, m - 1, 1));
}

function addMonths(ymd: string, n: number): string {
  const [y, m, d] = ymd.split("-").map(Number);
  // Clamp rather than roll over: 31 Jan minus one month is 31 Dec, but
  // 31 Mar minus one month must be 28/29 Feb, not 2 or 3 March.
  const target = new Date(Date.UTC(y, m - 1 + n, 1));
  const lastDay = new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0)).getUTCDate();
  return toYmd(Date.UTC(target.getUTCFullYear(), target.getUTCMonth(), Math.min(d, lastDay)));
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function shortLabel(start: string, end: string): string {
  const [sy, sm, sd] = start.split("-").map(Number);
  const [ey, em, ed] = end.split("-").map(Number);
  const short = (n: number) => MONTHS[n - 1].slice(0, 3);
  if (sy === ey && sm === em) return `${sd}–${ed} ${short(sm)} ${sy}`;
  return `${sd} ${short(sm)} – ${ed} ${short(em)} ${ey}`;
}

/**
 * Days after a period ends that people are actually paid.
 *
 * There is no per-tenant column for this, so it is a convention rather than a
 * setting — deliberately short, and deliberately editable in the form. Guessing
 * a pay date the admin then has to correct is still faster than three empty
 * boxes, as long as the guess is visible and changeable.
 */
export const PAY_DATE_OFFSET_DAYS = 3;

/**
 * The most recent **complete** period of this type, ending on or before `today`.
 *
 * Complete, not current: you cannot pay a period that has not finished, and a
 * run opened over a half-finished month computes against partial timesheets.
 * `periodsAgo` steps further back — 0 is the most recent complete period, 1 the
 * one before it — which is how the page offers the last three months.
 */
export function proposePayPeriod(
  payPeriod: PayPeriod | null | undefined,
  today: string,
  periodsAgo = 0,
): ProposedPeriod {
  const period = payPeriod ?? "monthly";
  let periodStart: string;
  let periodEnd: string;
  let label: string;

  if (period === "monthly") {
    const anchor = addMonths(startOfMonth(today), -1 - periodsAgo);
    periodStart = startOfMonth(anchor);
    periodEnd = endOfMonth(anchor);
    const [y, m] = periodStart.split("-").map(Number);
    label = `${MONTHS[m - 1]} ${y}`;
  } else if (period === "semimonthly") {
    // Halves of the month: 1st–15th and 16th–end. Walk back whole halves from
    // the half containing today, which is the only way to get the boundaries
    // right across months of different lengths.
    const [y, m, d] = today.split("-").map(Number);
    let year = y;
    let month = m;
    let secondHalf = d > 15;
    for (let i = 0; i <= periodsAgo; i++) {
      if (secondHalf) {
        secondHalf = false;
      } else {
        secondHalf = true;
        month -= 1;
        if (month === 0) {
          month = 12;
          year -= 1;
        }
      }
    }
    const base = `${year}-${String(month).padStart(2, "0")}-01`;
    periodStart = secondHalf ? `${year}-${String(month).padStart(2, "0")}-16` : base;
    periodEnd = secondHalf ? endOfMonth(base) : `${year}-${String(month).padStart(2, "0")}-15`;
    label = shortLabel(periodStart, periodEnd);
  } else {
    // Weekly and fortnightly: whole Monday–Sunday blocks, the last one that
    // finished on or before today.
    const span = period === "weekly" ? 7 : 14;
    const todayMs = toMs(today);
    // Day of week with Monday = 0.
    const dow = (new Date(todayMs).getUTCDay() + 6) % 7;
    // Sunday that most recently ended a week, on or before today.
    const lastSunday = toYmd(todayMs - (dow + 1) * DAY_MS);
    periodEnd = addDays(lastSunday, -span * periodsAgo);
    periodStart = addDays(periodEnd, -(span - 1));
    label = shortLabel(periodStart, periodEnd);
  }

  return {
    periodStart,
    periodEnd,
    payDate: addDays(periodEnd, PAY_DATE_OFFSET_DAYS),
    label,
  };
}

/**
 * The last `count` complete periods, most recent first.
 *
 * Used for the quick-pick row on the New run dialog, and by the seed scripts
 * so the periods they create are the same ones the UI would propose.
 */
export function recentPayPeriods(
  payPeriod: PayPeriod | null | undefined,
  today: string,
  count = 3,
): ProposedPeriod[] {
  return Array.from({ length: count }, (_, i) => proposePayPeriod(payPeriod, today, i));
}

/** Human name for the cadence, for the dialog's explanatory line. */
export const PAY_PERIOD_LABEL: Record<PayPeriod, string> = {
  weekly: "Weekly",
  fortnightly: "Fortnightly",
  semimonthly: "Twice monthly",
  monthly: "Monthly",
};
