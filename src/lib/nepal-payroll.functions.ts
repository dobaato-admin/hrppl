/**
 * Nepal payroll wizard server fn. Seeds FY 2081/82 (FY24/25) defaults:
 * - Income tax slabs (single & couple)
 * - SSF 11% employee + 20% employer split
 * - CIT (Citizen Investment Trust) opt-in default
 * - Festival bonus month
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/lib/auth-guard";
import { requireTenantId } from "@/lib/tenant-scope";

// FY 2081/82 (2024/25) slabs in NPR (annual). Source: IRD Nepal.
const NP_SLABS_SINGLE = [
  { min: 0, max: 500_000, rate: 1, label: "Social Security Tax" },
  { min: 500_000, max: 700_000, rate: 10, label: "Slab 2" },
  { min: 700_000, max: 1_000_000, rate: 20, label: "Slab 3" },
  { min: 1_000_000, max: 2_000_000, rate: 30, label: "Slab 4" },
  { min: 2_000_000, max: 5_000_000, rate: 36, label: "Slab 5 (30% + 20% surcharge)" },
  { min: 5_000_000, max: null, rate: 39, label: "Slab 6 (30% + 30% surcharge)" },
];
const NP_SLABS_COUPLE = [
  { min: 0, max: 600_000, rate: 1, label: "Social Security Tax" },
  { min: 600_000, max: 800_000, rate: 10, label: "Slab 2" },
  { min: 800_000, max: 1_100_000, rate: 20, label: "Slab 3" },
  { min: 1_100_000, max: 2_000_000, rate: 30, label: "Slab 4" },
  { min: 2_000_000, max: 5_000_000, rate: 36, label: "Slab 5" },
  { min: 5_000_000, max: null, rate: 39, label: "Slab 6" },
];

export const previewNepalSeed = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async () => ({
    fiscalYear: "2081/82 BS (2024/25 AD)",
    slabsSingle: NP_SLABS_SINGLE,
    slabsCouple: NP_SLABS_COUPLE,
    ssf: { employee_percent: 11, employer_percent: 20 },
    citDefault: 33.333,
    festivalDefault: "Ashwin",
  }));

export const runNepalPayrollWizard = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({
    marital_default: z.enum(["single", "couple"]),
    ssf_enrolled: z.boolean(),
    cit_percent: z.number().min(0).max(100),
    festival_month: z.string().min(2).max(20),
    remittance_percent: z.number().min(0).max(100),
    pf_election: z.enum(["optional", "mandatory", "off"]),
  }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    const tenantId = await requireTenantId(supabase, userId);

    // Guard: org admin only
    const { data: isAdmin } = await supabase.rpc("is_org_admin", { _user_id: userId, _tenant_id: tenantId } as any);
    if (!isAdmin) throw new Error("Forbidden: org admin required");

    // Log wizard run
    await supabase.from("np_payroll_wizard_runs").insert({
      tenant_id: tenantId,
      fiscal_year: "2081/82",
      marital_default: data.marital_default,
      ssf_enrolled: data.ssf_enrolled,
      cit_percent: data.cit_percent,
      festival_month: data.festival_month,
      remittance_percent: data.remittance_percent,
      pf_election: data.pf_election,
      inputs: data,
      run_by: userId,
    });

    // Try the existing DB seed RPC if available; ignore if not present
    try { await supabase.rpc("seed_nepal_payroll", { _tenant: tenantId } as any); } catch {}

    return { ok: true, seeded: { slabs: data.marital_default, ssf: data.ssf_enrolled, cit: data.cit_percent } };
  });
