import { c as createServerRpc } from "./createServerRpc-CbJDFEP-.mjs";
import { r as requireSupabaseAuth } from "./auth-guard-CkYFJuQL.mjs";
import { c as createServerFn } from "./server-BOi2EjMN.mjs";
import "../_libs/seroval.mjs";
import "../_libs/react.mjs";
import { a as objectType, A as booleanType, z as stringType, E as recordType, F as anyType, G as literalType } from "../_libs/zod.mjs";
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "tslib";
import "../_libs/supabase__functions-js.mjs";
import "./createMiddleware-BvN2ghIY.mjs";
import "node:async_hooks";
import "../_libs/h3-v2.mjs";
import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";
import "node:stream";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "../_libs/tanstack__react-router.mjs";
import "../_libs/react-dom.mjs";
import "util";
import "async_hooks";
import "stream";
import "crypto";
import "../_libs/isbot.mjs";
async function loadAdmin() {
  const {
    supabaseAdmin
  } = await import("./client.server-D5ro3rAQ.mjs");
  return supabaseAdmin;
}
const profileSchema = objectType({
  country_code: stringType().trim().length(2).optional().nullable(),
  legal_first_name: stringType().trim().max(120).optional().nullable(),
  legal_middle_name: stringType().trim().max(120).optional().nullable(),
  legal_last_name: stringType().trim().max(120).optional().nullable(),
  date_of_birth: stringType().optional().nullable(),
  gender: stringType().trim().max(40).optional().nullable(),
  nationality: stringType().trim().max(80).optional().nullable(),
  marital_status: stringType().trim().max(40).optional().nullable(),
  national_id_number: stringType().trim().max(60).optional().nullable(),
  address_line1: stringType().trim().max(200).optional().nullable(),
  address_line2: stringType().trim().max(200).optional().nullable(),
  city: stringType().trim().max(120).optional().nullable(),
  region: stringType().trim().max(120).optional().nullable(),
  postal_code: stringType().trim().max(40).optional().nullable(),
  country_of_residence: stringType().trim().max(2).optional().nullable(),
  personal_email: stringType().trim().email().max(255).optional().nullable().or(literalType("")),
  personal_phone: stringType().trim().max(40).optional().nullable(),
  emergency_contact_name: stringType().trim().max(120).optional().nullable(),
  emergency_contact_phone: stringType().trim().max(40).optional().nullable(),
  emergency_contact_relation: stringType().trim().max(60).optional().nullable(),
  bank_name: stringType().trim().max(120).optional().nullable(),
  bank_account_holder: stringType().trim().max(160).optional().nullable(),
  bank_account_number: stringType().trim().max(60).optional().nullable(),
  bank_branch_code: stringType().trim().max(40).optional().nullable(),
  bank_iban: stringType().trim().max(60).optional().nullable(),
  bank_swift: stringType().trim().max(20).optional().nullable(),
  tax_identification_number: stringType().trim().max(60).optional().nullable(),
  social_security_number: stringType().trim().max(60).optional().nullable(),
  provident_fund_number: stringType().trim().max(60).optional().nullable(),
  pension_fund_number: stringType().trim().max(60).optional().nullable(),
  country_specific: recordType(stringType(), anyType()).optional().nullable(),
  notes: stringType().trim().max(2e3).optional().nullable(),
  submit: booleanType().default(false)
});
const getMyOnboardingProfile_createServerFn_handler = createServerRpc({
  id: "cd831133bbf354e001b73bb46a3ee2bb736b33513d60c43e91a8b5c40faca60a",
  name: "getMyOnboardingProfile",
  filename: "src/lib/staff-onboarding.functions.ts"
}, (opts) => getMyOnboardingProfile.__executeServer(opts));
const getMyOnboardingProfile = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(getMyOnboardingProfile_createServerFn_handler, async ({
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const {
    data: emp
  } = await supabase.from("employees").select("id,tenant_id,first_name,last_name,email,job_title").eq("user_id", userId).maybeSingle();
  if (!emp) return {
    employee: null,
    profile: null
  };
  const {
    data: prof
  } = await supabase.from("staff_onboarding_profiles").select("*").eq("employee_id", emp.id).maybeSingle();
  return {
    employee: emp,
    profile: prof
  };
});
const upsertMyOnboardingProfile_createServerFn_handler = createServerRpc({
  id: "81d395a527764c23ab74cad1cab11860cc5df11ec157f777bbdd516e910c0e98",
  name: "upsertMyOnboardingProfile",
  filename: "src/lib/staff-onboarding.functions.ts"
}, (opts) => upsertMyOnboardingProfile.__executeServer(opts));
const upsertMyOnboardingProfile = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((data) => profileSchema.parse(data)).handler(upsertMyOnboardingProfile_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const {
    data: emp
  } = await supabase.from("employees").select("id,tenant_id").eq("user_id", userId).maybeSingle();
  if (!emp) throw new Error("No employee record");
  const admin = await loadAdmin();
  const payload = {
    ...data
  };
  delete payload.submit;
  payload.employee_id = emp.id;
  payload.tenant_id = emp.tenant_id;
  if (data.submit) {
    payload.submitted_at = (/* @__PURE__ */ new Date()).toISOString();
    payload.submitted_by = userId;
  }
  if (payload.date_of_birth === "") payload.date_of_birth = null;
  if (payload.personal_email === "") payload.personal_email = null;
  const {
    error
  } = await admin.from("staff_onboarding_profiles").upsert(payload, {
    onConflict: "employee_id"
  });
  if (error) throw new Error(error.message);
  try {
    const {
      computeCompleteSections,
      PROFILE_SECTIONS
    } = await import("./onboarding-profile-sections-vv77l0kC.mjs");
    const {
      data: fullProfile
    } = await admin.from("staff_onboarding_profiles").select("*").eq("employee_id", emp.id).maybeSingle();
    const completedSections = new Set(computeCompleteSections(fullProfile));
    const {
      data: assignments
    } = await admin.from("onboarding_assignments").select("checklist_id, checklist:onboarding_checklists(id, items)").eq("employee_id", emp.id);
    const nowIso = (/* @__PURE__ */ new Date()).toISOString();
    for (const a of assignments ?? []) {
      const items = a.checklist?.items ?? [];
      for (const it of items) {
        const section = it.profile_section;
        if (!section || !(section in PROFILE_SECTIONS)) continue;
        if (completedSections.has(section)) {
          await admin.from("onboarding_progress").upsert({
            tenant_id: emp.tenant_id,
            employee_id: emp.id,
            checklist_id: a.checklist_id,
            item_key: it.key,
            completed_by: userId,
            completed_at: nowIso,
            profile_section: section
          }, {
            onConflict: "employee_id,checklist_id,item_key"
          });
        } else {
          await admin.from("onboarding_progress").delete().eq("employee_id", emp.id).eq("checklist_id", a.checklist_id).eq("item_key", it.key).eq("profile_section", section);
        }
      }
    }
  } catch (e) {
    console.error("[onboarding] profile_section sync failed", e);
  }
  return {
    ok: true,
    submitted: !!data.submit
  };
});
export {
  getMyOnboardingProfile_createServerFn_handler,
  upsertMyOnboardingProfile_createServerFn_handler
};
