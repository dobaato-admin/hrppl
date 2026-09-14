import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/lib/auth-guard";
import { getTenantId } from "@/lib/tenant-scope";

async function getTenant(supabase: any, userId: string) {
  const tenantId = await getTenantId(supabase, userId);
  return tenantId as string;
}
async function getEmployee(supabase: any, userId: string) {
  const { data } = await supabase.from("employees").select("id,tenant_id,manager_id").eq("user_id", userId).maybeSingle();
  return data;
}

// ============ DESIGNATIONS ============
const DesignationSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1).max(120),
  code: z.string().max(40).optional().nullable(),
  grade: z.string().max(40).optional().nullable(),
  department_id: z.string().uuid().optional().nullable(),
  min_salary: z.number().nonnegative().optional().nullable(),
  max_salary: z.number().nonnegative().optional().nullable(),
  currency_code: z.string().max(3).optional().nullable(),
  description: z.string().max(1000).optional().nullable(),
  is_active: z.boolean().default(true),
});

export const listDesignations = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context as any;
    const { data, error } = await supabase
      .from("designations")
      .select("*, departments(name)")
      .order("title");
    if (error) throw error;
    return { designations: data ?? [] };
  });

export const upsertDesignation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => DesignationSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    const tenant_id = await getTenant(supabase, userId);
    const payload = { ...data, tenant_id };
    const { data: row, error } = data.id
      ? await supabase.from("designations").update(payload).eq("id", data.id).select().single()
      : await supabase.from("designations").insert(payload).select().single();
    if (error) throw error;
    return { designation: row };
  });

export const deleteDesignation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase } = context as any;
    const { error } = await supabase.from("designations").delete().eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });

const SeedPresetSchema = z.object({
  currency_code: z.string().min(3).max(3).default("USD"),
  department_id: z.string().uuid().optional().nullable(),
  designations: z.array(z.object({
    title: z.string().min(1).max(120),
    grade: z.string().max(40).optional().nullable(),
    code: z.string().max(40).optional().nullable(),
    min_salary: z.number().nonnegative().optional().nullable(),
    max_salary: z.number().nonnegative().optional().nullable(),
    description: z.string().max(1000).optional().nullable(),
  })).min(1).max(50),
});

export const seedDesignationPreset = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => SeedPresetSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    const tenant_id = await getTenant(supabase, userId);
    // Skip titles that already exist for this tenant (case-insensitive) to keep
    // the seed idempotent.
    const titles = data.designations.map((d) => d.title);
    const { data: existing } = await supabase
      .from("designations").select("title").eq("tenant_id", tenant_id);
    const seen = new Set((existing ?? []).map((r: any) => String(r.title).toLowerCase()));
    const rows = data.designations
      .filter((d) => !seen.has(d.title.toLowerCase()))
      .map((d) => ({
        ...d,
        tenant_id,
        department_id: data.department_id ?? null,
        currency_code: data.currency_code,
        is_active: true,
      }));
    if (rows.length === 0) return { inserted: 0, skipped: titles.length };
    const { error } = await supabase.from("designations").insert(rows);
    if (error) throw error;
    return { inserted: rows.length, skipped: titles.length - rows.length };
  });


// ============ PROMOTIONS ============
const PromotionSchema = z.object({
  employee_id: z.string().uuid(),
  to_designation_id: z.string().uuid().optional().nullable(),
  to_job_title: z.string().min(1).max(160),
  to_department_id: z.string().uuid().optional().nullable(),
  to_manager_id: z.string().uuid().optional().nullable(),
  to_grade: z.string().max(40).optional().nullable(),
  effective_date: z.string(),
  reason: z.string().max(1000).optional().nullable(),
});

export const proposePromotion = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => PromotionSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    const tenant_id = await getTenant(supabase, userId);
    const { data: emp, error: e1 } = await supabase
      .from("employees")
      .select("job_title,department_id,manager_id")
      .eq("id", data.employee_id)
      .single();
    if (e1) throw e1;
    const { data: row, error } = await supabase.from("promotions").insert({
      tenant_id,
      employee_id: data.employee_id,
      from_job_title: emp.job_title,
      from_department_id: emp.department_id,
      from_manager_id: emp.manager_id,
      to_designation_id: data.to_designation_id,
      to_job_title: data.to_job_title,
      to_department_id: data.to_department_id,
      to_manager_id: data.to_manager_id,
      to_grade: data.to_grade,
      effective_date: data.effective_date,
      reason: data.reason,
      proposed_by: userId,
      status: "proposed",
    }).select().single();
    if (error) throw error;
    return { promotion: row };
  });

export const listPromotions = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({
    scope: z.enum(["mine", "team", "all"]).default("all"),
    status: z.string().optional(),
  }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    let q = supabase
      .from("promotions")
      .select("*, employees!promotions_employee_id_fkey(first_name,last_name,job_title,email)")
      .order("created_at", { ascending: false });
    if (data.status) q = q.eq("status", data.status);
    if (data.scope === "mine") {
      const emp = await getEmployee(supabase, userId);
      if (!emp) return { promotions: [] };
      q = q.eq("employee_id", emp.id);
    }
    const { data: rows, error } = await q;
    if (error) throw error;
    return { promotions: rows ?? [] };
  });

export const decidePromotion = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({
    id: z.string().uuid(),
    decision: z.enum(["approved", "rejected", "cancelled"]),
    notes: z.string().max(1000).optional().nullable(),
    apply_now: z.boolean().default(false),
  }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    const { data: row, error } = await supabase.from("promotions").update({
      status: data.decision,
      decided_by: userId,
      decided_at: new Date().toISOString(),
      decision_notes: data.notes,
    }).eq("id", data.id).select().single();
    if (error) throw error;
    if (data.decision === "approved" && data.apply_now) {
      // Apply to employee record
      await supabase.from("employees").update({
        job_title: row.to_job_title,
        department_id: row.to_department_id ?? undefined,
        manager_id: row.to_manager_id ?? undefined,
      }).eq("id", row.employee_id);
      await supabase.from("promotions").update({ status: "applied" }).eq("id", data.id);

      // If the promotion targets a designation with a pay band, auto-create a pay rate change at the midpoint
      if (row.to_designation_id) {
        const { data: des } = await supabase
          .from("designations")
          .select("min_salary,max_salary,currency_code")
          .eq("id", row.to_designation_id)
          .maybeSingle();
        const tenant_id = await getTenant(supabase, userId);
        const { data: emp } = await supabase
          .from("employees")
          .select("base_salary,currency_code")
          .eq("id", row.employee_id)
          .maybeSingle();
        const min = des?.min_salary ? Number(des.min_salary) : null;
        const max = des?.max_salary ? Number(des.max_salary) : null;
        const midpoint = min != null && max != null ? (min + max) / 2 : (max ?? min);
        if (midpoint != null && midpoint > 0) {
          const currency = des?.currency_code ?? emp?.currency_code ?? "USD";
          const { data: prc } = await supabase.from("pay_rate_changes").insert({
            tenant_id,
            employee_id: row.employee_id,
            promotion_id: row.id,
            from_amount: emp?.base_salary ?? null,
            to_amount: midpoint,
            currency_code: currency,
            pay_frequency: "monthly",
            effective_date: row.effective_date,
            reason: "promotion",
            notes: "Auto-proposed from approved promotion (designation midpoint).",
            proposed_by: userId,
            status: "proposed",
          }).select().single();
          return { promotion: row, pay_rate_change: prc };
        }
      }
    }
    return { promotion: row };
  });

// ============ PAY RATE CHANGES ============
const PayRateSchema = z.object({
  employee_id: z.string().uuid(),
  to_amount: z.number().nonnegative(),
  currency_code: z.string().min(3).max(3),
  pay_frequency: z.string().max(20).default("monthly"),
  effective_date: z.string(),
  reason: z.enum(["hire","promotion","annual_review","market_adjustment","correction","other"]).default("other"),
  notes: z.string().max(1000).optional().nullable(),
  promotion_id: z.string().uuid().optional().nullable(),
});

export const proposePayRate = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => PayRateSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    const tenant_id = await getTenant(supabase, userId);
    const { data: emp } = await supabase.from("employees").select("base_salary").eq("id", data.employee_id).single();
    const { data: row, error } = await supabase.from("pay_rate_changes").insert({
      tenant_id,
      employee_id: data.employee_id,
      promotion_id: data.promotion_id,
      from_amount: emp?.base_salary ?? null,
      to_amount: data.to_amount,
      currency_code: data.currency_code,
      pay_frequency: data.pay_frequency,
      effective_date: data.effective_date,
      reason: data.reason,
      notes: data.notes,
      proposed_by: userId,
      status: "proposed",
    }).select().single();
    if (error) throw error;
    return { change: row };
  });

export const listPayRateChanges = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({
    scope: z.enum(["mine", "all"]).default("all"),
    employee_id: z.string().uuid().optional(),
    status: z.string().optional(),
  }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    let q = supabase
      .from("pay_rate_changes")
      .select("*, employees!pay_rate_changes_employee_id_fkey(first_name,last_name,job_title)")
      .order("effective_date", { ascending: false });
    if (data.status) q = q.eq("status", data.status);
    if (data.employee_id) q = q.eq("employee_id", data.employee_id);
    if (data.scope === "mine") {
      const emp = await getEmployee(supabase, userId);
      if (!emp) return { changes: [] };
      q = q.eq("employee_id", emp.id);
    }
    const { data: rows, error } = await q;
    if (error) throw error;
    return { changes: rows ?? [] };
  });

export const decidePayRate = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({
    id: z.string().uuid(),
    decision: z.enum(["approved", "rejected", "cancelled"]),
    notes: z.string().max(1000).optional().nullable(),
    apply_now: z.boolean().default(false),
  }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    const { data: row, error } = await supabase.from("pay_rate_changes").update({
      status: data.decision,
      decided_by: userId,
      decided_at: new Date().toISOString(),
      decision_notes: data.notes,
    }).eq("id", data.id).select().single();
    if (error) throw error;
    if (data.decision === "approved" && data.apply_now) {
      await supabase.from("employees").update({
        base_salary: row.to_amount,
        currency_code: row.currency_code,
      }).eq("id", row.employee_id);
      await supabase.from("pay_rate_changes").update({ status: "applied" }).eq("id", data.id);
    }
    return { change: row };
  });

// ============ APPRECIATIONS ============
export const listAppreciations = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({
    scope: z.enum(["feed", "received", "sent"]).default("feed"),
    limit: z.number().int().min(1).max(100).default(50),
  }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    let q = supabase
      .from("appreciations")
      .select("*, from_emp:employees!appreciations_from_employee_id_fkey(first_name,last_name), to_emp:employees!appreciations_to_employee_id_fkey(first_name,last_name,job_title), appreciation_reactions(emoji,user_id)")
      .order("created_at", { ascending: false })
      .limit(data.limit);
    if (data.scope !== "feed") {
      const emp = await getEmployee(supabase, userId);
      if (!emp) return { items: [] };
      if (data.scope === "received") q = q.eq("to_employee_id", emp.id);
      else q = q.eq("from_employee_id", emp.id);
    }
    const { data: rows, error } = await q;
    if (error) throw error;
    return { items: rows ?? [] };
  });

export const createAppreciation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({
    to_employee_id: z.string().uuid(),
    message: z.string().min(2).max(1000),
    emoji: z.string().max(8).optional().nullable(),
    value_tag: z.string().max(40).optional().nullable(),
    visibility: z.enum(["public", "manager"]).default("public"),
  }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    const emp = await getEmployee(supabase, userId);
    if (!emp) throw new Error("No employee record");
    const { data: row, error } = await supabase.from("appreciations").insert({
      tenant_id: emp.tenant_id,
      from_employee_id: emp.id,
      to_employee_id: data.to_employee_id,
      message: data.message,
      emoji: data.emoji ?? "👏",
      value_tag: data.value_tag,
      visibility: data.visibility,
    }).select().single();
    if (error) throw error;
    return { appreciation: row };
  });

export const toggleAppreciationReaction = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({
    appreciation_id: z.string().uuid(),
    emoji: z.string().max(8).default("👏"),
  }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    const { data: existing } = await supabase
      .from("appreciation_reactions")
      .select("id")
      .eq("appreciation_id", data.appreciation_id)
      .eq("user_id", userId)
      .eq("emoji", data.emoji)
      .maybeSingle();
    if (existing) {
      await supabase.from("appreciation_reactions").delete().eq("id", existing.id);
      return { reacted: false };
    }
    await supabase.from("appreciation_reactions").insert({
      appreciation_id: data.appreciation_id,
      user_id: userId,
      emoji: data.emoji,
    });
    return { reacted: true };
  });

// ============ AWARDS ============
const AwardTypeSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1).max(120),
  description: z.string().max(1000).optional().nullable(),
  icon: z.string().max(40).optional().nullable(),
  cadence: z.enum(["monthly","quarterly","annual","ad_hoc"]).default("monthly"),
  is_active: z.boolean().default(true),
});

export const listAwardTypes = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context as any;
    const { data, error } = await supabase.from("award_types").select("*").order("name");
    if (error) throw error;
    return { types: data ?? [] };
  });

export const upsertAwardType = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => AwardTypeSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    const tenant_id = await getTenant(supabase, userId);
    const payload = { ...data, tenant_id };
    const { data: row, error } = data.id
      ? await supabase.from("award_types").update(payload).eq("id", data.id).select().single()
      : await supabase.from("award_types").insert(payload).select().single();
    if (error) throw error;
    return { type: row };
  });

const CycleSchema = z.object({
  id: z.string().uuid().optional(),
  award_type_id: z.string().uuid(),
  title: z.string().min(1).max(160),
  period_start: z.string(),
  period_end: z.string(),
  nominations_close_at: z.string().optional().nullable(),
  status: z.enum(["open","nominated","shortlisted","awarded","closed","cancelled"]).default("open"),
});

export const listAwardCycles = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context as any;
    const { data, error } = await supabase
      .from("award_cycles")
      .select("*, award_types(name,icon)")
      .order("period_start", { ascending: false });
    if (error) throw error;
    return { cycles: data ?? [] };
  });

export const upsertAwardCycle = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => CycleSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    const tenant_id = await getTenant(supabase, userId);
    const payload = { ...data, tenant_id };
    const { data: row, error } = data.id
      ? await supabase.from("award_cycles").update(payload).eq("id", data.id).select().single()
      : await supabase.from("award_cycles").insert(payload).select().single();
    if (error) throw error;
    return { cycle: row };
  });

export const nominateForAward = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({
    cycle_id: z.string().uuid(),
    nominee_employee_id: z.string().uuid(),
    justification: z.string().min(10).max(2000),
  }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    const emp = await getEmployee(supabase, userId);
    if (!emp) throw new Error("No employee record");
    const { data: row, error } = await supabase.from("award_nominations").insert({
      tenant_id: emp.tenant_id,
      cycle_id: data.cycle_id,
      nominee_employee_id: data.nominee_employee_id,
      nominator_user_id: userId,
      nominator_employee_id: emp.id,
      justification: data.justification,
      status: "submitted",
    }).select().single();
    if (error) throw error;
    return { nomination: row };
  });

export const listNominations = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ cycle_id: z.string().uuid().optional() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase } = context as any;
    let q = supabase
      .from("award_nominations")
      .select("*, nominee:employees!award_nominations_nominee_employee_id_fkey(first_name,last_name,job_title), nominator:employees!award_nominations_nominator_employee_id_fkey(first_name,last_name), award_cycles(title,award_type_id,award_types(name))")
      .order("created_at", { ascending: false });
    if (data.cycle_id) q = q.eq("cycle_id", data.cycle_id);
    const { data: rows, error } = await q;
    if (error) throw error;
    return { nominations: rows ?? [] };
  });

export const decideNomination = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({
    id: z.string().uuid(),
    decision: z.enum(["shortlisted","awarded","rejected","withdrawn"]),
    notes: z.string().max(1000).optional().nullable(),
    citation: z.string().max(2000).optional().nullable(),
  }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    const { data: row, error } = await supabase.from("award_nominations").update({
      status: data.decision,
      decided_by: userId,
      decided_at: new Date().toISOString(),
      decision_notes: data.notes,
    }).eq("id", data.id).select("*, award_cycles(award_type_id)").single();
    if (error) throw error;
    if (data.decision === "awarded") {
      await supabase.from("awards_granted").insert({
        tenant_id: row.tenant_id,
        cycle_id: row.cycle_id,
        award_type_id: row.award_cycles.award_type_id,
        nomination_id: row.id,
        recipient_employee_id: row.nominee_employee_id,
        citation: data.citation ?? row.justification,
        granted_by: userId,
      });
    }
    return { nomination: row };
  });

export const listAwardsGranted = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context as any;
    const { data, error } = await supabase
      .from("awards_granted")
      .select("*, recipient:employees!awards_granted_recipient_employee_id_fkey(first_name,last_name,job_title), award_types(name,icon), award_cycles(title)")
      .order("granted_on", { ascending: false })
      .limit(100);
    if (error) throw error;
    return { awards: data ?? [] };
  });

// ============ EMPLOYEE TIMELINE ============
export const getEmployeeTimeline = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ employee_id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase } = context as any;
    const employee_id = data.employee_id;

    const [empRes, promRes, payRes] = await Promise.all([
      supabase.from("employees").select("id,first_name,last_name,job_title,hire_date,base_salary,currency_code,department_id,departments(name)").eq("id", employee_id).maybeSingle(),
      supabase.from("promotions").select("*, from_dept:departments!promotions_from_department_id_fkey(name), to_dept:departments!promotions_to_department_id_fkey(name), to_designation:designations!promotions_to_designation_id_fkey(title,grade)").eq("employee_id", employee_id).order("effective_date", { ascending: false }),
      supabase.from("pay_rate_changes").select("*").eq("employee_id", employee_id).order("effective_date", { ascending: false }),
    ]);
    if (empRes.error) throw empRes.error;
    if (promRes.error) throw promRes.error;
    if (payRes.error) throw payRes.error;

    const employee = empRes.data;
    const promotions = promRes.data ?? [];
    const payRates = payRes.data ?? [];

    // Resolve actor names from profiles
    const actorIds = Array.from(new Set([
      ...promotions.flatMap((p: any) => [p.proposed_by, p.decided_by]),
      ...payRates.flatMap((p: any) => [p.proposed_by, p.decided_by]),
    ].filter(Boolean)));
    let actors: Record<string, { full_name: string | null; email: string | null }> = {};
    if (actorIds.length) {
      const { data: profs } = await supabase.from("profiles").select("id,full_name,email").in("id", actorIds);
      actors = Object.fromEntries((profs ?? []).map((p: any) => [p.id, { full_name: p.full_name, email: p.email }]));
    }

    type Event = {
      kind: "hire" | "designation" | "promotion" | "pay_rate";
      date: string;
      title: string;
      detail: string;
      status?: string;
      proposed_by?: { name: string | null } | null;
      decided_by?: { name: string | null } | null;
      decided_at?: string | null;
    };
    const nameOf = (id: string | null) => id ? (actors[id]?.full_name ?? actors[id]?.email ?? null) : null;

    const events: Event[] = [];
    if (employee?.hire_date) {
      events.push({
        kind: "hire",
        date: employee.hire_date,
        title: "Hired",
        detail: `Joined as ${employee.job_title ?? "team member"}${employee.departments?.name ? ` · ${employee.departments.name}` : ""}`,
      });
    }
    for (const p of promotions) {
      events.push({
        kind: "promotion",
        date: p.effective_date,
        title: `${p.from_job_title ?? "—"} → ${p.to_job_title}`,
        detail: [
          p.to_grade ? `Grade ${p.to_grade}` : null,
          p.to_dept?.name ? `Dept: ${p.to_dept.name}` : null,
          p.reason ? `Reason: ${p.reason}` : null,
        ].filter(Boolean).join(" · "),
        status: p.status,
        proposed_by: p.proposed_by ? { name: nameOf(p.proposed_by) } : null,
        decided_by: p.decided_by ? { name: nameOf(p.decided_by) } : null,
        decided_at: p.decided_at,
      });
      if (p.to_designation?.title) {
        events.push({
          kind: "designation",
          date: p.effective_date,
          title: `Designation: ${p.to_designation.title}${p.to_designation.grade ? ` (Grade ${p.to_designation.grade})` : ""}`,
          detail: [
            p.from_job_title ? `Previously ${p.from_job_title}` : null,
            p.to_dept?.name ? `Dept: ${p.to_dept.name}` : null,
          ].filter(Boolean).join(" · "),
          status: p.status,
          proposed_by: p.proposed_by ? { name: nameOf(p.proposed_by) } : null,
          decided_by: p.decided_by ? { name: nameOf(p.decided_by) } : null,
          decided_at: p.decided_at,
        });
      }
    }
    for (const r of payRates) {
      const cur = r.currency_code ?? "";
      events.push({
        kind: "pay_rate",
        date: r.effective_date,
        title: `Pay rate: ${r.from_amount ?? "—"} → ${r.to_amount} ${cur}`,
        detail: [
          `Frequency: ${r.pay_frequency}`,
          `Reason: ${r.reason}`,
          r.notes ? r.notes : null,
        ].filter(Boolean).join(" · "),
        status: r.status,
        proposed_by: r.proposed_by ? { name: nameOf(r.proposed_by) } : null,
        decided_by: r.decided_by ? { name: nameOf(r.decided_by) } : null,
        decided_at: r.decided_at,
      });
    }

    events.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));

    return { employee, events };
  });


// ============ PAY HISTORY (per-employee combined timeline) ============
export const getEmployeePayHistory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ employee_id: z.string().uuid() }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase } = context as any;
    const [{ data: emp }, { data: rates }, { data: promos }] = await Promise.all([
      supabase
        .from("employees")
        .select("id,first_name,last_name,job_title,base_salary,currency_code,hire_date")
        .eq("id", data.employee_id)
        .maybeSingle(),
      supabase
        .from("pay_rate_changes")
        .select("*")
        .eq("employee_id", data.employee_id)
        .order("effective_date", { ascending: false }),
      supabase
        .from("promotions")
        .select("*")
        .eq("employee_id", data.employee_id)
        .order("effective_date", { ascending: false }),
    ]);
    return {
      employee: emp ?? null,
      pay_changes: rates ?? [],
      promotions: promos ?? [],
    };
  });
