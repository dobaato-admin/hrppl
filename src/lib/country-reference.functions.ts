import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/lib/auth-guard";

/**
 * Shared country reference data: subdivisions (T16) and default leave types
 * (T18).
 *
 * Neither carries a tenant_id and neither ever should — these are the same
 * kind of data as `countries` and `public_holidays`. Adding a country is an
 * INSERT, which is the whole point: "further countries are a data load, not a
 * code change".
 *
 * Both reads go through the **caller's** client. The rows are readable by
 * every authenticated user by policy, so the service-role client would buy
 * nothing and would make these endpoints usable by anyone who could reach
 * them.
 */

export interface CountrySubdivision {
  code: string;
  name: string;
  kind: string;
}

/**
 * The label a form should use for the subdivision field in this country.
 *
 * "State / Province / Region" is what you write when you do not know which
 * country you are in. Once the country is chosen, the country has a word for
 * it, and using that word is the difference between a form that was built for
 * you and one that was not.
 */
export function subdivisionLabel(subdivisions: CountrySubdivision[]): string {
  const kinds = Array.from(new Set(subdivisions.map((s) => s.kind)));
  if (kinds.length === 0) return "State / Province / Region";
  if (kinds.length === 1) {
    switch (kinds[0]) {
      case "province":
        return "Province";
      case "territory":
        return "Territory";
      case "region":
        return "Region";
      default:
        return "State";
    }
  }
  // Australia has both, and the difference is real — long service leave and
  // payroll tax are administered separately by each.
  if (kinds.includes("state") && kinds.includes("territory")) return "State or territory";
  return "State / Province / Region";
}

export const listCountrySubdivisions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ countryCode: z.string().trim().length(2).optional().nullable() }).parse(d ?? {}),
  )
  .handler(async ({ data, context }) => {
    const { supabase } = context as any;
    const code = (data.countryCode ?? "").toUpperCase();
    if (!code) return { subdivisions: [] as CountrySubdivision[], known: true };
    const { data: rows, error } = await supabase
      .from("country_subdivisions")
      .select("code,name,kind")
      .eq("country_code", code)
      .eq("is_active", true)
      .order("sort_order");
    if (error) {
      // The caller falls back to a free-text box. An empty dropdown and a
      // failed read must not look the same: one means "type it", the other
      // means "this country has no list yet" — and both must leave the person
      // able to finish the form.
      console.error("[country-reference] subdivisions read failed", code, error);
      return { subdivisions: [] as CountrySubdivision[], known: false };
    }
    return { subdivisions: (rows ?? []) as CountrySubdivision[], known: true };
  });

export interface CountryLeaveDefault {
  code: string;
  name: string;
  annual_quota_days: number;
  accrual_per_month: number;
  is_paid: boolean;
  color: string;
  is_standard: boolean;
  description: string | null;
}

export const listCountryLeaveDefaults = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ countryCode: z.string().trim().length(2).optional().nullable() }).parse(d ?? {}),
  )
  .handler(async ({ data, context }) => {
    const { supabase } = context as any;
    const code = (data.countryCode ?? "").toUpperCase();
    if (!code) return { defaults: [] as CountryLeaveDefault[], known: true };
    const { data: rows, error } = await supabase
      .from("country_leave_defaults")
      .select("code,name,annual_quota_days,accrual_per_month,is_paid,color,is_standard,description")
      .eq("country_code", code)
      .order("sort_order");
    if (error) {
      console.error("[country-reference] leave defaults read failed", code, error);
      return { defaults: [] as CountryLeaveDefault[], known: false };
    }
    return {
      defaults: (rows ?? []).map((r: any) => ({
        ...r,
        annual_quota_days: Number(r.annual_quota_days),
        accrual_per_month: Number(r.accrual_per_month),
      })) as CountryLeaveDefault[],
      known: true,
    };
  });

/**
 * Whether a stored subdivision value still makes sense for a country.
 *
 * T16 · "Country selection drives which list appears, and clearing/changing
 * country resets the field." Resetting unconditionally would throw away a
 * value the user just typed for a country with no list, so this only clears
 * what the new country cannot accept: a code that is not in its list.
 */
export function keepSubdivisionForCountry(
  value: string,
  subdivisions: CountrySubdivision[],
): string {
  if (!value) return "";
  // No list for this country — free text, so whatever is there stands.
  if (subdivisions.length === 0) return value;
  return subdivisions.some((s) => s.code === value) ? value : "";
}
