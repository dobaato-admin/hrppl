import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/lib/auth-guard";

async function loadAdmin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

const profileSchema = z.object({
  country_code: z.string().trim().length(2).optional().nullable(),
  legal_first_name: z.string().trim().max(120).optional().nullable(),
  legal_middle_name: z.string().trim().max(120).optional().nullable(),
  legal_last_name: z.string().trim().max(120).optional().nullable(),
  date_of_birth: z.string().optional().nullable(),
  gender: z.string().trim().max(40).optional().nullable(),
  nationality: z.string().trim().max(80).optional().nullable(),
  marital_status: z.string().trim().max(40).optional().nullable(),
  national_id_number: z.string().trim().max(60).optional().nullable(),
  address_line1: z.string().trim().max(200).optional().nullable(),
  address_line2: z.string().trim().max(200).optional().nullable(),
  city: z.string().trim().max(120).optional().nullable(),
  region: z.string().trim().max(120).optional().nullable(),
  postal_code: z.string().trim().max(40).optional().nullable(),
  country_of_residence: z.string().trim().max(2).optional().nullable(),
  personal_email: z.string().trim().email().max(255).optional().nullable().or(z.literal("")),
  personal_phone: z.string().trim().max(40).optional().nullable(),
  emergency_contact_name: z.string().trim().max(120).optional().nullable(),
  emergency_contact_phone: z.string().trim().max(40).optional().nullable(),
  emergency_contact_relation: z.string().trim().max(60).optional().nullable(),
  bank_name: z.string().trim().max(120).optional().nullable(),
  bank_account_holder: z.string().trim().max(160).optional().nullable(),
  bank_account_number: z.string().trim().max(60).optional().nullable(),
  bank_branch_code: z.string().trim().max(40).optional().nullable(),
  bank_iban: z.string().trim().max(60).optional().nullable(),
  bank_swift: z.string().trim().max(20).optional().nullable(),
  tax_identification_number: z.string().trim().max(60).optional().nullable(),
  social_security_number: z.string().trim().max(60).optional().nullable(),
  provident_fund_number: z.string().trim().max(60).optional().nullable(),
  pension_fund_number: z.string().trim().max(60).optional().nullable(),
  country_specific: z.record(z.string(), z.any()).optional().nullable(),
  notes: z.string().trim().max(2000).optional().nullable(),
  submit: z.boolean().default(false),
});

export const getMyOnboardingProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context as any;
    const { data: emp } = await supabase
      .from("employees").select("id,tenant_id,first_name,last_name,email,job_title")
      .eq("user_id", userId).maybeSingle();
    if (!emp) return { employee: null, profile: null };
    const { data: prof } = await supabase
      .from("staff_onboarding_profiles").select("*").eq("employee_id", emp.id).maybeSingle();
    return { employee: emp, profile: prof };
  });

export const upsertMyOnboardingProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => profileSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    const { data: emp } = await supabase
      .from("employees").select("id,tenant_id").eq("user_id", userId).maybeSingle();
    if (!emp) throw new Error("No employee record");

    const admin = await loadAdmin();
    const payload: any = { ...data };
    delete payload.submit;
    payload.employee_id = emp.id;
    payload.tenant_id = emp.tenant_id;
    if (data.submit) {
      payload.submitted_at = new Date().toISOString();
      payload.submitted_by = userId;
    }
    // Normalize empty strings to null for date
    if (payload.date_of_birth === "") payload.date_of_birth = null;
    if (payload.personal_email === "") payload.personal_email = null;

    const { error } = await admin
      .from("staff_onboarding_profiles")
      .upsert(payload, { onConflict: "employee_id" } as any);
    if (error) throw new Error(error.message);

    // A7: sync completed profile sections into onboarding_progress so a single
    // % covers both the profile form and the checklist items that reference it.
    try {
      const { computeCompleteSections, PROFILE_SECTIONS } = await import("./onboarding-profile-sections");
      const { data: fullProfile } = await admin
        .from("staff_onboarding_profiles").select("*").eq("employee_id", emp.id).maybeSingle();
      const completedSections = new Set(computeCompleteSections(fullProfile as any));

      // Find checklist items (across this employee's assignments) that reference a profile_section.
      const { data: assignments } = await admin
        .from("onboarding_assignments")
        .select("checklist_id, checklist:onboarding_checklists(id, items)")
        .eq("employee_id", emp.id);
      const nowIso = new Date().toISOString();

      for (const a of (assignments ?? []) as any[]) {
        const items = (a.checklist?.items ?? []) as Array<{ key: string; profile_section?: string | null }>;
        for (const it of items) {
          const section = it.profile_section;
          if (!section || !(section in PROFILE_SECTIONS)) continue;
          if (completedSections.has(section as any)) {
            await admin.from("onboarding_progress").upsert({
              tenant_id: emp.tenant_id,
              employee_id: emp.id,
              checklist_id: a.checklist_id,
              item_key: it.key,
              completed_by: userId,
              completed_at: nowIso,
              profile_section: section,
            }, { onConflict: "employee_id,checklist_id,item_key" } as any);
          } else {
            // Section regressed (a required field was cleared) — untick only rows we previously auto-ticked.
            await admin.from("onboarding_progress").delete()
              .eq("employee_id", emp.id)
              .eq("checklist_id", a.checklist_id)
              .eq("item_key", it.key)
              .eq("profile_section", section);
          }
        }
      }
    } catch (e) {
      // Sync is best-effort; the profile save itself succeeded.
      console.error("[onboarding] profile_section sync failed", e);
    }

    return { ok: true, submitted: !!data.submit };
  });

