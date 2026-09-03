/**
 * Australian payroll server functions (M2).
 *
 * `previewAuPeriod` resolves the right PAYG-W coefficient + SG rate for the
 * given (scale, frequency, pay_date) from `tax_tables_au` / `au_sg_rates`,
 * then runs the pure calc in `payroll-au.ts`. Used for previews, dev
 * tooling, and unit/integration tests before the country-aware engine
 * branch lands.
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/lib/auth-guard";
import { assertAuPayroll } from "@/lib/au-guard";
import {
  computeAuPeriod,
  type AuPeriodResult,
  type PayFrequency,
  type PayLine,
} from "./payroll-au";

const PayLineSchema = z.object({
  code: z.string().min(1).max(40),
  amount: z.number().finite(),
  stp2_category: z.string().max(40).nullish(),
  ote_eligible: z.boolean().optional(),
  super_eligible: z.boolean().optional(),
  is_taxable: z.boolean().optional(),
});

const Input = z.object({
  tenantId: z.string().uuid(),
  payDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  frequency: z.enum(["weekly", "fortnightly", "monthly"]),
  scale: z.string().min(1).max(20),
  lines: z.array(PayLineSchema).min(1).max(200),
});

export const previewAuPeriod = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => Input.parse(d))
  .handler(async ({ data, context }): Promise<AuPeriodResult> => {
    const { supabase, userId } = context;

    // Was an AU-tenant check with no role check at all: any authenticated user
    // could run the PAYG-W/SG calculator against another tenant's brackets by
    // passing its id. The shared guard does both, and mirrors who may run
    // payroll (org_admin or finance).
    await assertAuPayroll(supabase, userId, data.tenantId);

    // Resolve PAYG-W coefficient.
    const taxable = data.lines.reduce(
      (a, l) => (l.is_taxable ? a + l.amount : a),
      0,
    );
    const { data: brackets } = await supabase
      .from("tax_tables_au")
      .select("threshold_min,threshold_max,a,b,effective_from,effective_to")
      .eq("scale", data.scale)
      .eq("frequency", data.frequency)
      .lte("effective_from", data.payDate)
      .order("effective_from", { ascending: false });
    const active = (brackets ?? []).filter(
      (r: any) => !r.effective_to || r.effective_to >= data.payDate,
    );
    const match = active.find(
      (r: any) =>
        taxable >= Number(r.threshold_min) &&
        (r.threshold_max == null || taxable < Number(r.threshold_max)),
    );
    if (!match) {
      throw new Error(
        `No PAYG-W bracket for scale=${data.scale} freq=${data.frequency} on ${data.payDate}`,
      );
    }

    // Resolve SG rate.
    const { data: sgRow } = await supabase.rpc("au_sg_rate_on", {
      _on: data.payDate,
    } as any);
    const sgRate = Number(sgRow ?? 0);
    if (!sgRate) throw new Error(`No SG rate on ${data.payDate}`);

    return computeAuPeriod({
      lines: data.lines as PayLine[],
      frequency: data.frequency as PayFrequency,
      paygCoeff: { a: Number(match.a), b: Number(match.b) },
      sgRate,
    });
  });
