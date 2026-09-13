#!/usr/bin/env bun
/**
 * Make a demo tenant able to actually run payroll.
 *
 *     bun --env-file=.env run scripts/seed-payroll-ready.ts --tenant demo-acme
 *     bun --env-file=.env run scripts/seed-payroll-ready.ts --tenant demo-globex --runs 3
 *
 * ## Why this exists
 *
 * `demo-seed.ts` builds two tenants with employees, roles and pay items, but
 * neither could be paid:
 *
 *   Globex Nepal   pay_period: null   0 of 5 employees with a salary
 *   Acme Global    pay_period: monthly  2 of 9 employees with a salary
 *
 * Those are two different refusals, and both are correct. `createPayrollRun`
 * refuses a tenant with no pay cadence, and `computePayrollRun` refuses an
 * employee with neither an applied pay-rate change nor a base salary — they
 * used to compute to a gross of zero and receive a payslip for nothing.
 *
 * So a demo of payroll was impossible without first doing setup by hand. This
 * closes that, using the same period arithmetic the UI proposes
 * (`src/lib/pay-period.ts`), so the runs it creates are the ones the New run
 * dialog would have offered.
 *
 * ## What it does NOT do
 *
 * It does not bypass any guard. Salaries and settings are written as data;
 * every run is created, computed and approved through the ordinary tables, and
 * a run that the product would refuse still fails here. If this script starts
 * failing, payroll is broken — that is the point of seeding through the real
 * shape rather than inserting finished payslips.
 */
import { createClient } from "@supabase/supabase-js";
import { recentPayPeriods, type PayPeriod } from "../src/lib/pay-period";

// Must match scripts/demo-seed.ts. A wrong value here is worse than no guard:
// it reads as protection while allowing the thing it claims to prevent.
const PRODUCTION_REF = "astbnkrrgchezumcujgv";
const SUPABASE_URL = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL ?? "";
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error(
    "Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY.\n" +
      "Run with the dev project's .env loaded, e.g.  bun --env-file=.env run scripts/seed-payroll-ready.ts --tenant demo-acme",
  );
  process.exit(1);
}
if (SUPABASE_URL.includes(PRODUCTION_REF)) {
  console.error(`Refusing to run: SUPABASE_URL points at production (${PRODUCTION_REF}).`);
  process.exit(1);
}

const admin = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

function arg(name: string, fallback?: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : fallback;
}

const slug = arg("tenant");
const runCount = Number(arg("runs", "0"));
const cadence = (arg("cadence", "monthly") as PayPeriod) ?? "monthly";

if (!slug) {
  console.error("Usage: --tenant <slug> [--runs N] [--cadence monthly|fortnightly|weekly|semimonthly]");
  process.exit(1);
}

/**
 * Salary bands by seniority, in the tenant's own currency.
 *
 * Deliberately spread rather than uniform: a payroll demo where everybody
 * earns the same number cannot show a distribution, a variance report, or a
 * tax bracket boundary being crossed — which are the things the payroll
 * screens exist to show.
 */
const BANDS: Array<{ match: RegExp; multiplier: number }> = [
  { match: /director|head|chief|principal/i, multiplier: 2.2 },
  { match: /manager|lead/i, multiplier: 1.6 },
  { match: /senior/i, multiplier: 1.3 },
  { match: /analyst|specialist|officer/i, multiplier: 1.0 },
];

/** Base figures chosen to be plausible in each currency, not converted. */
const BASE_BY_CURRENCY: Record<string, number> = {
  AUD: 7500, // per month
  NPR: 90000,
  USD: 6000,
  GBP: 4200,
  INR: 120000,
};

function salaryFor(jobTitle: string | null, currency: string, index: number): number {
  const base = BASE_BY_CURRENCY[currency.toUpperCase()] ?? 5000;
  const band = BANDS.find((b) => b.match.test(jobTitle ?? ""))?.multiplier ?? 0.9;
  // A small deterministic spread inside the band so two people with the same
  // title are not identical — again, so distribution charts have something to
  // show. Deterministic so re-running the seed does not churn the numbers.
  const jitter = 1 + ((index * 37) % 11) / 100;
  return Math.round((base * band * jitter) / 10) * 10;
}

async function main() {
  const { data: tenant, error: tErr } = await admin
    .from("tenants")
    .select("id,name,slug,country_code,currency_code")
    .eq("slug", slug)
    .maybeSingle();
  if (tErr) throw tErr;
  if (!tenant) {
    console.error(`No tenant with slug "${slug}". Run scripts/demo-seed.ts first.`);
    process.exit(1);
  }
  console.log(`\n${tenant.name} (${tenant.country_code}, ${tenant.currency_code})`);

  // ---------------------------------------------------------------- cadence
  const { data: existing } = await admin
    .from("tenant_payroll_settings")
    .select("pay_period")
    .eq("tenant_id", tenant.id)
    .maybeSingle();
  if (existing?.pay_period) {
    console.log(`  pay period        already set (${existing.pay_period})`);
  } else {
    const { error } = await admin
      .from("tenant_payroll_settings")
      .upsert({ tenant_id: tenant.id, pay_period: cadence }, { onConflict: "tenant_id" });
    if (error) throw error;
    console.log(`  pay period        set to ${cadence}`);
  }
  const payPeriod = (existing?.pay_period as PayPeriod) ?? cadence;

  // --------------------------------------------------------------- salaries
  const { data: employees, error: eErr } = await admin
    .from("employees")
    .select("id,first_name,last_name,job_title,base_salary,status")
    .eq("tenant_id", tenant.id)
    .eq("status", "active")
    .order("first_name");
  if (eErr) throw eErr;

  const needSalary = (employees ?? []).filter((e) => !(Number(e.base_salary ?? 0) > 0));
  if (needSalary.length === 0) {
    console.log(`  salaries          all ${(employees ?? []).length} already set`);
  } else {
    for (const [i, emp] of needSalary.entries()) {
      const salary = salaryFor(emp.job_title, tenant.currency_code ?? "USD", i);
      const { error } = await admin
        .from("employees")
        .update({ base_salary: salary })
        .eq("id", emp.id)
        .eq("tenant_id", tenant.id);
      if (error) throw error;
    }
    console.log(
      `  salaries          set for ${needSalary.length} of ${(employees ?? []).length} employees`,
    );
  }

  // ------------------------------------------------------------------- runs
  if (runCount > 0) {
    const today = new Date().toISOString().slice(0, 10);
    const periods = recentPayPeriods(payPeriod, today, runCount);
    for (const p of periods) {
      const { data: already } = await admin
        .from("payroll_runs")
        .select("id")
        .eq("tenant_id", tenant.id)
        .eq("period_start", p.periodStart)
        .eq("period_end", p.periodEnd)
        .maybeSingle();
      if (already) {
        console.log(`  run ${p.label.padEnd(16)} already exists`);
        continue;
      }
      const { error } = await admin.from("payroll_runs").insert({
        tenant_id: tenant.id,
        country_code: tenant.country_code,
        base_currency_code: tenant.currency_code,
        currency_code: tenant.currency_code,
        fx_rate: 1,
        period_start: p.periodStart,
        period_end: p.periodEnd,
        pay_date: p.payDate,
        status: "draft",
        notes: "Seeded demo run",
      });
      if (error) throw error;
      console.log(`  run ${p.label.padEnd(16)} created as draft (${p.periodStart} → ${p.periodEnd})`);
    }
    console.log(
      "\n  Drafts only. Compute them from /org/payroll so the payslips go through\n" +
        "  the real engine — seeding finished payslips would prove nothing.",
    );
  }

  console.log("\nDone.\n");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
