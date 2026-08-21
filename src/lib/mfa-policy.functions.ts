import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/lib/auth-guard";

const ROLE_VALUES = [
  "super_admin",
  "regional_admin",
  "org_admin",
  "branch_admin",
  "hr",
  "finance",
  "manager",
  "employee",
] as const;

export const getMfaPolicy = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context as any;
    const { data: emp } = await supabase
      .from("employees")
      .select("tenant_id")
      .eq("user_id", userId)
      .maybeSingle();
    if (!emp?.tenant_id) return { policy: null };
    const { data, error } = await supabase
      .from("tenant_mfa_policy")
      .select("*")
      .eq("tenant_id", emp.tenant_id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return { policy: data, tenant_id: emp.tenant_id };
  });

export const updateMfaPolicy = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        required_roles: z.array(z.enum(ROLE_VALUES)).default([]),
        grace_period_days: z.number().int().min(0).max(90).default(7),
        is_enforced: z.boolean().default(false),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    const { data: emp } = await supabase
      .from("employees")
      .select("tenant_id")
      .eq("user_id", userId)
      .maybeSingle();
    if (!emp?.tenant_id) throw new Error("Tenant not found");
    const payload = {
      tenant_id: emp.tenant_id,
      required_roles: data.required_roles,
      grace_period_days: data.grace_period_days,
      is_enforced: data.is_enforced,
      updated_by: userId,
      updated_at: new Date().toISOString(),
    };
    const { error } = await supabase
      .from("tenant_mfa_policy")
      .upsert(payload, { onConflict: "tenant_id" });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const getMyMfaStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context as any;

    // Roles
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);
    const userRoles: string[] = (roles ?? []).map((r: any) => r.role);

    // Tenant + policy
    const { data: emp } = await supabase
      .from("employees")
      .select("tenant_id, created_at")
      .eq("user_id", userId)
      .maybeSingle();

    let policy: any = null;
    if (emp?.tenant_id) {
      const { data: p } = await supabase
        .from("tenant_mfa_policy")
        .select("*")
        .eq("tenant_id", emp.tenant_id)
        .maybeSingle();
      policy = p;
    }

    // Enrollment status — check Supabase auth factors
    const { data: factorData } = await supabase.auth.mfa.listFactors();
    const verifiedFactors =
      (factorData?.all ?? []).filter((f: any) => f.status === "verified") ?? [];
    const enrolled = verifiedFactors.length > 0;

    const requiredRoles: string[] = policy?.required_roles ?? [];
    const required =
      !!policy?.is_enforced &&
      userRoles.some((r) => requiredRoles.includes(r));

    const graceDays = policy?.grace_period_days ?? 0;
    const accountCreated = emp?.created_at ? new Date(emp.created_at) : new Date();
    const elapsed = Math.floor(
      (Date.now() - accountCreated.getTime()) / 86400000,
    );
    const graceRemaining = Math.max(0, graceDays - elapsed);

    return {
      required,
      enrolled,
      grace_remaining_days: graceRemaining,
      blocking: required && !enrolled && graceRemaining <= 0,
    };
  });
