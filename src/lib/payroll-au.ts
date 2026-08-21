/**
 * Australian payroll calculation primitives (M2).
 *
 * - Ordinary Time Earnings (OTE)
 * - Super Guarantee (SG)
 * - PAYG withholding via ATO Schedule 1 statement-of-formulas
 *
 * These are pure functions — no DB calls — so they can be unit-tested and
 * reused from server functions, payroll-run jobs, or preview UIs.
 * Tax brackets and SG rate are passed in (resolved by the caller from
 * `tax_tables_au` / `au_sg_rates`).
 */

export type PayFrequency = "weekly" | "fortnightly" | "monthly";

/** A single STP2-classified earning or deduction line that feeds the engine. */
export interface PayLine {
  code: string;
  amount: number;
  /** STP Phase 2 disaggregation category (see migration comment). */
  stp2_category?: string | null;
  /** True if this line counts toward Ordinary Time Earnings. */
  ote_eligible?: boolean;
  /** True if this line attracts Super Guarantee. Usually equal to ote_eligible. */
  super_eligible?: boolean;
  /** True if this line is subject to PAYG-W. */
  is_taxable?: boolean;
}

export interface PaygCoefficient {
  /** Marginal slope `a` from `withholding = a*x - b`. */
  a: number;
  /** Constant `b` from `withholding = a*x - b`. */
  b: number;
}

/** Sum the OTE component of a payslip. */
export function computeOTE(lines: PayLine[]): number {
  return lines.reduce((acc, l) => (l.ote_eligible ? acc + l.amount : acc), 0);
}

/** Sum the super-eligible component (usually == OTE). */
export function computeSuperBase(lines: PayLine[]): number {
  return lines.reduce((acc, l) => (l.super_eligible ? acc + l.amount : acc), 0);
}

/**
 * Compute Super Guarantee for the period.
 *
 * @param superBase super-eligible earnings for the period
 * @param sgRate statutory SG rate (e.g. 0.12)
 * @param maxQuarterlyBase per-quarter cap; if provided, the period base is
 *   clamped pro-rata to (quarterly cap / periods-per-quarter). Pass null/undefined
 *   to skip the cap (handled at quarter close).
 * @param periodsPerQuarter 13 (weekly), 6.5 (fortnightly), 3 (monthly)
 */
export function computeSG(
  superBase: number,
  sgRate: number,
  maxQuarterlyBase?: number | null,
  periodsPerQuarter?: number,
): number {
  let base = Math.max(0, superBase);
  if (maxQuarterlyBase && periodsPerQuarter && periodsPerQuarter > 0) {
    const perPeriodCap = maxQuarterlyBase / periodsPerQuarter;
    if (base > perPeriodCap) base = perPeriodCap;
  }
  return round2(base * sgRate);
}

/**
 * PAYG-W withholding via ATO Schedule 1 statement-of-formulas:
 *   withholding = round(a * x − b)
 * where x is gross taxable earnings for the period and (a, b) come from
 * `tax_tables_au` for the matching scale + frequency + bracket.
 *
 * Per ATO rules, withholding is rounded to the nearest dollar (0.50 rounds up).
 */
export function computePAYG(taxableEarnings: number, coeff: PaygCoefficient): number {
  if (taxableEarnings <= 0) return 0;
  const w = coeff.a * taxableEarnings - coeff.b;
  if (w <= 0) return 0;
  // ATO: round to nearest whole dollar, .50 rounds up.
  return Math.floor(w + 0.5);
}

/** Gross taxable earnings = sum of `is_taxable` lines. */
export function computeTaxableEarnings(lines: PayLine[]): number {
  return lines.reduce((acc, l) => (l.is_taxable ? acc + l.amount : acc), 0);
}

/** Periods-per-quarter constant for SG cap pro-rating. */
export const PERIODS_PER_QUARTER: Record<PayFrequency, number> = {
  weekly: 13,
  fortnightly: 6.5,
  monthly: 3,
};

/**
 * Full AU period calc — single entry point used by the pay-run engine.
 * Caller is responsible for resolving (a, b) from `tax_tables_au` and `sgRate`
 * from `au_sg_rates` based on the payment date and employee's tax scale.
 */
export interface AuPeriodInputs {
  lines: PayLine[];
  frequency: PayFrequency;
  paygCoeff: PaygCoefficient;
  sgRate: number;
  maxQuarterlyBase?: number | null;
}

export interface AuPeriodResult {
  gross: number;
  taxable: number;
  ote: number;
  superBase: number;
  payg: number;
  sg: number;
  net: number;
}

export function computeAuPeriod(inputs: AuPeriodInputs): AuPeriodResult {
  const gross = round2(inputs.lines.reduce((a, l) => a + l.amount, 0));
  const taxable = round2(computeTaxableEarnings(inputs.lines));
  const ote = round2(computeOTE(inputs.lines));
  const superBase = round2(computeSuperBase(inputs.lines));
  const payg = computePAYG(taxable, inputs.paygCoeff);
  const sg = computeSG(
    superBase,
    inputs.sgRate,
    inputs.maxQuarterlyBase,
    PERIODS_PER_QUARTER[inputs.frequency],
  );
  const net = round2(gross - payg);
  return { gross, taxable, ote, superBase, payg, sg, net };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
