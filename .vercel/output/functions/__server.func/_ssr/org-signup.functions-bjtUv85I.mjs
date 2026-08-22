import { c as createServerRpc } from "./createServerRpc-CbJDFEP-.mjs";
import { r as requireSupabaseAuth, a as requireAuthAllowSuspended } from "./auth-guard-CkYFJuQL.mjs";
import { validateBusinessRegistrationNumber } from "./payroll-validation-DSkr7Vxa.mjs";
import { c as createServerFn } from "./server-BOi2EjMN.mjs";
import "../_libs/seroval.mjs";
import "../_libs/react.mjs";
import { a as objectType, z as stringType, G as literalType, B as enumType, A as booleanType, D as arrayType } from "../_libs/zod.mjs";
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
function slugify(input) {
  return input.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 48) || "org";
}
async function uniqueSlug(admin, base) {
  const root = slugify(base);
  for (let i = 0; i < 30; i++) {
    const candidate = i === 0 ? root : `${root}-${i + 1}`;
    const {
      data
    } = await admin.from("tenants").select("id").eq("slug", candidate).maybeSingle();
    if (!data) return candidate;
  }
  return `${root}-${Date.now().toString(36)}`;
}
const getMyOrgStatus_createServerFn_handler = createServerRpc({
  id: "7c8c04f9b97e895f756963cd8788d397e8eeafd37caf3f9dce935c4d2ad87b85",
  name: "getMyOrgStatus",
  filename: "src/lib/org-signup.functions.ts"
}, (opts) => getMyOrgStatus.__executeServer(opts));
const getMyOrgStatus = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(getMyOrgStatus_createServerFn_handler, async ({
  context
}) => {
  const {
    supabase,
    userId,
    claims
  } = context;
  const email = (claims?.email ?? "").toLowerCase() || null;
  const {
    data: profile
  } = await supabase.from("profiles").select("tenant_id, full_name").eq("id", userId).maybeSingle();
  const tenantId = profile?.tenant_id ?? null;
  const {
    data: roleRows
  } = await supabase.from("user_roles").select("role").eq("user_id", userId);
  const roles = (roleRows ?? []).map((r) => r.role);
  let setupProgress = null;
  let tenant = null;
  if (tenantId) {
    const [{
      data: t
    }, {
      data: p
    }] = await Promise.all([supabase.from("tenants").select("id,name,legal_name,primary_contact_name,slug,country_code,currency_code,status,plan,contact_email,contact_phone,address_line1,address_line2,city,region,postal_code,website,tagline,registration_number,tax_id_number").eq("id", tenantId).maybeSingle(), supabase.from("organization_setup_progress").select("*").eq("tenant_id", tenantId).maybeSingle()]);
    tenant = t;
    setupProgress = p;
  }
  let pendingInvitation = null;
  let pendingTrialInvitation = null;
  if (email) {
    const admin = await loadAdmin();
    const [staffInviteResult, trialInviteResult] = await Promise.all([admin.from("staff_invitations").select("id,tenant_id,token,email,first_name,last_name,job_title,status,expires_at").ilike("email", email).eq("status", "pending").gt("expires_at", (/* @__PURE__ */ new Date()).toISOString()).order("created_at", {
      ascending: false
    }).limit(1).maybeSingle(), admin.from("org_trial_invitations").select("id,email,org_name,contact_name,country_code,trial_days,status,expires_at").eq("email", email.toLowerCase()).eq("status", "pending").gt("expires_at", (/* @__PURE__ */ new Date()).toISOString()).order("created_at", {
      ascending: false
    }).limit(1).maybeSingle()]);
    pendingInvitation = staffInviteResult.data ?? null;
    pendingTrialInvitation = trialInviteResult.data ?? null;
  }
  let employee = null;
  let onboardingProfile = null;
  {
    const {
      data: emp
    } = await supabase.from("employees").select("id,tenant_id,first_name,last_name,email,job_title,department_id").eq("user_id", userId).maybeSingle();
    employee = emp;
    if (emp) {
      const {
        data: prof
      } = await supabase.from("staff_onboarding_profiles").select("employee_id,submitted_at").eq("employee_id", emp.id).maybeSingle();
      onboardingProfile = prof;
    }
  }
  return {
    userId,
    email,
    roles,
    tenant,
    tenantId,
    setupProgress,
    pendingInvitation,
    pendingTrialInvitation,
    employee,
    onboardingProfile
  };
});
const getMyGateStatus_createServerFn_handler = createServerRpc({
  id: "f4cf7e338edff3096390043e75330342e0cf10216d426c1abef0a029bd7af291",
  name: "getMyGateStatus",
  filename: "src/lib/org-signup.functions.ts"
}, (opts) => getMyGateStatus.__executeServer(opts));
const getMyGateStatus = createServerFn({
  method: "GET"
}).middleware([requireAuthAllowSuspended]).handler(getMyGateStatus_createServerFn_handler, async ({
  context
}) => {
  const {
    supabase,
    userId,
    claims
  } = context;
  const email = (claims?.email ?? "").toLowerCase();
  const {
    getAccountStatus
  } = await import("./account-status.server-BRvat4z5.mjs");
  const account = await getAccountStatus(supabase, userId);
  if (!account.active) {
    return {
      userId,
      tenantId: null,
      roles: [],
      setupCompleted: false,
      pendingTrialInvitation: null,
      suspended: true,
      suspensionReason: account.reason,
      suspendedScope: account.status === "suspended" ? "account" : "organisation"
    };
  }
  const [{
    data: profile
  }, {
    data: roleRows
  }] = await Promise.all([supabase.from("profiles").select("tenant_id").eq("id", userId).maybeSingle(), supabase.from("user_roles").select("role").eq("user_id", userId)]);
  const tenantId = profile?.tenant_id ?? null;
  const roles = (roleRows ?? []).map((r) => r.role);
  let setupCompleted = false;
  if (tenantId) {
    const {
      data: setupProgress
    } = await supabase.from("organization_setup_progress").select("completed_at").eq("tenant_id", tenantId).maybeSingle();
    setupCompleted = !!setupProgress?.completed_at;
  }
  let pendingTrialInvitation = null;
  if (!tenantId && email) {
    const admin = await loadAdmin();
    const {
      data: trialInvite
    } = await admin.from("org_trial_invitations").select("id,email,status,expires_at").eq("email", email).eq("status", "pending").gt("expires_at", (/* @__PURE__ */ new Date()).toISOString()).order("created_at", {
      ascending: false
    }).limit(1).maybeSingle();
    pendingTrialInvitation = trialInvite ?? null;
  }
  return {
    userId,
    tenantId,
    roles,
    setupCompleted,
    pendingTrialInvitation,
    suspended: false,
    suspensionReason: null,
    suspendedScope: null
  };
});
const createOrgSchema = objectType({
  name: stringType().trim().min(2).max(120),
  legal_name: stringType().trim().max(160).optional().or(literalType("")),
  primary_contact_name: stringType().trim().max(160).optional().or(literalType("")),
  country_code: stringType().trim().length(2),
  contact_email: stringType().trim().email().max(255),
  contact_phone: stringType().trim().max(40).optional().or(literalType("")),
  address_line1: stringType().trim().max(160).optional().or(literalType("")),
  address_line2: stringType().trim().max(160).optional().or(literalType("")),
  city: stringType().trim().max(120).optional().or(literalType("")),
  region: stringType().trim().max(120).optional().or(literalType("")),
  postal_code: stringType().trim().max(32).optional().or(literalType("")),
  website: stringType().trim().max(255).optional().or(literalType("")),
  tagline: stringType().trim().max(160).optional().or(literalType("")),
  registration_number: stringType().trim().max(80).optional().or(literalType("")),
  tax_id_number: stringType().trim().max(80).optional().or(literalType("")),
  owner_job_title: stringType().trim().max(120).optional().or(literalType(""))
});
const createOrganization_createServerFn_handler = createServerRpc({
  id: "ade327610be33474957676510b7908c27c6c147b972fefc9c429006a6113bbf2",
  name: "createOrganization",
  filename: "src/lib/org-signup.functions.ts"
}, (opts) => createOrganization.__executeServer(opts));
const createOrganization = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((data) => createOrgSchema.parse(data)).handler(createOrganization_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    userId,
    claims
  } = context;
  const admin = await loadAdmin();
  const clean = (value) => {
    const next = value?.trim();
    return next ? next : null;
  };
  const email = claims?.email?.toLowerCase() ?? null;
  const {
    data: existingProfile
  } = await admin.from("profiles").select("tenant_id").eq("id", userId).maybeSingle();
  if (existingProfile?.tenant_id) {
    throw new Error("You already belong to an organization.");
  }
  const {
    data: country
  } = await admin.from("countries").select("code,currency_code,name").eq("code", data.country_code.toUpperCase()).maybeSingle();
  if (!country) throw new Error("Unsupported country code");
  const {
    data: trialInvitation
  } = email ? await admin.from("org_trial_invitations").select("id,org_name,contact_name,country_code").eq("email", email).eq("status", "pending").gt("expires_at", (/* @__PURE__ */ new Date()).toISOString()).order("created_at", {
    ascending: false
  }).limit(1).maybeSingle() : {
    data: null
  };
  const phone = clean(data.contact_phone);
  const registrationNumber = clean(data.registration_number);
  if (!trialInvitation && (!phone || phone.replace(/\D+/g, "").length < 6)) {
    throw new Error("Contact phone is required.");
  }
  let normalizedRegistrationNumber = null;
  if (registrationNumber) {
    const regCheck = validateBusinessRegistrationNumber(registrationNumber, data.country_code);
    if (!regCheck.ok) throw new Error(regCheck.error);
    normalizedRegistrationNumber = regCheck.value;
  } else if (!trialInvitation) {
    throw new Error(country.code === "AU" ? "ABN is required." : "Business registration number is required.");
  }
  const slug = await uniqueSlug(admin, data.name);
  const {
    data: tenant,
    error: tErr
  } = await admin.from("tenants").insert({
    name: data.name,
    legal_name: clean(data.legal_name) ?? data.name,
    primary_contact_name: clean(data.primary_contact_name) ?? clean(trialInvitation?.contact_name),
    slug,
    country_code: country.code,
    currency_code: country.currency_code,
    contact_email: data.contact_email,
    contact_phone: phone,
    address_line1: clean(data.address_line1),
    address_line2: clean(data.address_line2),
    city: clean(data.city),
    region: clean(data.region),
    postal_code: clean(data.postal_code),
    website: clean(data.website),
    tagline: clean(data.tagline),
    registration_number: normalizedRegistrationNumber,
    tax_id_number: clean(data.tax_id_number),
    plan: "starter",
    status: "active",
    created_by: userId
  }).select("*").single();
  if (tErr || !tenant) throw new Error(tErr?.message ?? "Could not create organization");
  const {
    error: profileErr
  } = await admin.from("profiles").update({
    tenant_id: tenant.id
  }).eq("id", userId);
  if (profileErr) {
    await admin.from("tenants").delete().eq("id", tenant.id);
    throw new Error(profileErr.message || "Could not link your account to the organization");
  }
  const {
    error: roleErr
  } = await admin.from("user_roles").insert({
    user_id: userId,
    role: "org_admin",
    tenant_id: tenant.id
  });
  if (roleErr) {
    await admin.from("profiles").update({
      tenant_id: null
    }).eq("id", userId);
    await admin.from("tenants").delete().eq("id", tenant.id);
    throw new Error(roleErr.message || "Could not grant organization admin access");
  }
  const {
    data: existingEmployee
  } = await admin.from("employees").select("id").eq("tenant_id", tenant.id).eq("user_id", userId).maybeSingle();
  if (!existingEmployee) {
    const {
      data: profile
    } = await admin.from("profiles").select("full_name,email").eq("id", userId).maybeSingle();
    const fullName = (profile?.full_name || "").trim();
    const [firstNameRaw, ...restName] = fullName.split(/\s+/).filter(Boolean);
    const firstName = firstNameRaw || data.primary_contact_name?.trim() || data.name.trim();
    const lastName = restName.join(" ") || "Administrator";
    const {
      error: employeeErr
    } = await admin.from("employees").insert({
      tenant_id: tenant.id,
      user_id: userId,
      employee_number: `ADM-${Date.now().toString(36).toUpperCase()}`,
      first_name: firstName.slice(0, 120),
      last_name: lastName.slice(0, 120),
      email: (profile?.email || data.contact_email).toLowerCase(),
      phone: clean(data.contact_phone),
      job_title: clean(data.owner_job_title) ?? "Organization Administrator",
      employment_type: "full_time",
      status: "active",
      hire_date: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
      currency_code: country.currency_code
    });
    if (employeeErr) {
      await admin.from("user_roles").delete().eq("user_id", userId).eq("tenant_id", tenant.id);
      await admin.from("profiles").update({
        tenant_id: null
      }).eq("id", userId);
      await admin.from("tenants").delete().eq("id", tenant.id);
      throw new Error(employeeErr.message || "Could not create organization owner record");
    }
  }
  return {
    tenantId: tenant.id,
    slug: tenant.slug
  };
});
const stepSchema = objectType({
  step: enumType(["details", "branding", "departments", "defaults", "invites"])
});
const updateOrgProfileSchema = objectType({
  legal_name: stringType().trim().max(160).optional().or(literalType("")),
  primary_contact_name: stringType().trim().max(160).optional().or(literalType("")),
  contact_phone: stringType().trim().max(40).optional().or(literalType("")),
  address_line1: stringType().trim().max(160).optional().or(literalType("")),
  address_line2: stringType().trim().max(160).optional().or(literalType("")),
  city: stringType().trim().max(120).optional().or(literalType("")),
  region: stringType().trim().max(120).optional().or(literalType("")),
  postal_code: stringType().trim().max(32).optional().or(literalType("")),
  website: stringType().trim().max(255).optional().or(literalType("")),
  tagline: stringType().trim().max(160).optional().or(literalType("")),
  registration_number: stringType().trim().max(80).optional().or(literalType("")),
  tax_id_number: stringType().trim().max(80).optional().or(literalType(""))
});
async function assertOrgAdmin(supabase, userId) {
  const {
    data: profile
  } = await supabase.from("profiles").select("tenant_id").eq("id", userId).maybeSingle();
  const tenantId = profile?.tenant_id;
  if (!tenantId) throw new Error("No organization");
  const {
    data: roleRows
  } = await supabase.from("user_roles").select("role").eq("user_id", userId);
  const roles = (roleRows ?? []).map((r) => r.role);
  if (!roles.includes("org_admin") && !roles.includes("super_admin")) {
    throw new Error("Forbidden: organization admin required");
  }
  return tenantId;
}
const updateOrganizationProfile_createServerFn_handler = createServerRpc({
  id: "3ccb4e88c8f860d7f444773904575501cc69be2a14778af5e01fc030d3795a60",
  name: "updateOrganizationProfile",
  filename: "src/lib/org-signup.functions.ts"
}, (opts) => updateOrganizationProfile.__executeServer(opts));
const updateOrganizationProfile = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((data) => updateOrgProfileSchema.parse(data)).handler(updateOrganizationProfile_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const tenantId = await assertOrgAdmin(supabase, userId);
  const admin = await loadAdmin();
  const clean = (value) => {
    const next = value?.trim();
    return next ? next : null;
  };
  const {
    error
  } = await admin.from("tenants").update({
    legal_name: clean(data.legal_name),
    primary_contact_name: clean(data.primary_contact_name),
    contact_phone: clean(data.contact_phone),
    address_line1: clean(data.address_line1),
    address_line2: clean(data.address_line2),
    city: clean(data.city),
    region: clean(data.region),
    postal_code: clean(data.postal_code),
    website: clean(data.website),
    tagline: clean(data.tagline),
    registration_number: clean(data.registration_number),
    tax_id_number: clean(data.tax_id_number)
  }).eq("id", tenantId);
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
const markSetupStep_createServerFn_handler = createServerRpc({
  id: "937c92ae7566598ba1ab50fa0dbfcd444ac89df6cfd14f6e7b9874440f38c54c",
  name: "markSetupStep",
  filename: "src/lib/org-signup.functions.ts"
}, (opts) => markSetupStep.__executeServer(opts));
const markSetupStep = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((data) => stepSchema.parse(data)).handler(markSetupStep_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const tenantId = await assertOrgAdmin(supabase, userId);
  const col = `${data.step}_done`;
  const admin = await loadAdmin();
  const {
    data: row
  } = await admin.from("organization_setup_progress").select("*").eq("tenant_id", tenantId).maybeSingle();
  const next = {
    ...row ?? {
      tenant_id: tenantId
    },
    [col]: true
  };
  const allDone = next.details_done && next.branding_done && next.departments_done && next.defaults_done;
  if (allDone && !next.completed_at) next.completed_at = (/* @__PURE__ */ new Date()).toISOString();
  const {
    error
  } = await admin.from("organization_setup_progress").upsert(next, {
    onConflict: "tenant_id"
  });
  if (error) throw new Error(error.message);
  return {
    ok: true,
    completed: !!next.completed_at
  };
});
const seedSchema = objectType({
  departments: arrayType(stringType().trim().min(1).max(80)).max(20).default(["Operations", "Engineering", "People"]),
  withLeaveTypes: booleanType().default(true)
});
const seedOrgDefaults_createServerFn_handler = createServerRpc({
  id: "08807eaea5098b595bd997b9687cbd4994ba7d625aecf537fd7a4c553d5e53c5",
  name: "seedOrgDefaults",
  filename: "src/lib/org-signup.functions.ts"
}, (opts) => seedOrgDefaults.__executeServer(opts));
const seedOrgDefaults = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((data) => seedSchema.parse(data)).handler(seedOrgDefaults_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const tenantId = await assertOrgAdmin(supabase, userId);
  const admin = await loadAdmin();
  const deptRows = data.departments.map((name) => ({
    tenant_id: tenantId,
    name
  }));
  if (deptRows.length) {
    await admin.from("departments").insert(deptRows);
  }
  if (data.withLeaveTypes) {
    const {
      count
    } = await admin.from("leave_types").select("id", {
      count: "exact",
      head: true
    }).eq("tenant_id", tenantId);
    if ((count ?? 0) === 0) {
      await admin.from("leave_types").insert([{
        tenant_id: tenantId,
        code: "ANNUAL",
        name: "Annual Leave",
        annual_quota_days: 21,
        accrual_per_month: 1.75,
        is_paid: true,
        color: "#3b82f6"
      }, {
        tenant_id: tenantId,
        code: "SICK",
        name: "Sick Leave",
        annual_quota_days: 10,
        accrual_per_month: 0.83,
        is_paid: true,
        color: "#ef4444"
      }, {
        tenant_id: tenantId,
        code: "UNPAID",
        name: "Unpaid Leave",
        annual_quota_days: 0,
        accrual_per_month: 0,
        is_paid: false,
        color: "#6b7280"
      }]);
    }
  }
  return {
    ok: true
  };
});
const resetMyOrgSetup_createServerFn_handler = createServerRpc({
  id: "ca815b6f41830c534cf0bf8dcf97cf99d787bae94b7d8ba7d561fefc3717ed3c",
  name: "resetMyOrgSetup",
  filename: "src/lib/org-signup.functions.ts"
}, (opts) => resetMyOrgSetup.__executeServer(opts));
const resetMyOrgSetup = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).handler(resetMyOrgSetup_createServerFn_handler, async ({
  context
}) => {
  const {
    userId
  } = context;
  const admin = await loadAdmin();
  const {
    data: profile
  } = await admin.from("profiles").select("tenant_id").eq("id", userId).maybeSingle();
  const tenantId = profile?.tenant_id;
  if (!tenantId) return {
    ok: true,
    reset: false,
    reason: "no_tenant"
  };
  const {
    count: empCount
  } = await admin.from("employees").select("id", {
    count: "exact",
    head: true
  }).eq("tenant_id", tenantId);
  if ((empCount ?? 0) > 0) {
    throw new Error("Cannot reset: this organization already has employees. Contact support.");
  }
  const {
    data: roleRows
  } = await admin.from("user_roles").select("role").eq("user_id", userId).eq("tenant_id", tenantId);
  const isAdmin = (roleRows ?? []).some((r) => r.role === "org_admin" || r.role === "super_admin");
  if (!isAdmin) throw new Error("Only the organization admin can reset setup");
  await admin.from("organization_setup_progress").delete().eq("tenant_id", tenantId);
  await admin.from("departments").delete().eq("tenant_id", tenantId);
  await admin.from("leave_types").delete().eq("tenant_id", tenantId);
  await admin.from("user_roles").delete().eq("user_id", userId).eq("tenant_id", tenantId);
  await admin.from("profiles").update({
    tenant_id: null
  }).eq("id", userId);
  const {
    error: delErr
  } = await admin.from("tenants").delete().eq("id", tenantId);
  if (delErr) throw new Error(delErr.message);
  return {
    ok: true,
    reset: true
  };
});
export {
  createOrganization_createServerFn_handler,
  getMyGateStatus_createServerFn_handler,
  getMyOrgStatus_createServerFn_handler,
  markSetupStep_createServerFn_handler,
  resetMyOrgSetup_createServerFn_handler,
  seedOrgDefaults_createServerFn_handler,
  updateOrganizationProfile_createServerFn_handler
};
