import { c as createServerRpc } from "./createServerRpc-CbJDFEP-.mjs";
import { r as requireSupabaseAuth } from "./auth-guard-CkYFJuQL.mjs";
import { validateInvitationDetails } from "./payroll-validation-DSkr7Vxa.mjs";
import { c as createServerFn } from "./server-BOi2EjMN.mjs";
import "../_libs/seroval.mjs";
import "../_libs/react.mjs";
import { a as objectType, z as stringType, G as literalType, C as numberType, D as arrayType, B as enumType } from "../_libs/zod.mjs";
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
async function loadEmailSender() {
  const {
    sendInternalEmail
  } = await import("./send-internal.server-9cG3k97B.mjs");
  return sendInternalEmail;
}
function generateToken() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
}
function appUrl() {
  return process.env.PUBLIC_APP_URL || "https://hrppl.io";
}
async function getInviterContext(supabase, userId) {
  const {
    data: profile
  } = await supabase.from("profiles").select("tenant_id").eq("id", userId).maybeSingle();
  if (!profile?.tenant_id) throw new Error("No organization");
  const {
    data: roles
  } = await supabase.from("user_roles").select("role").eq("user_id", userId);
  const inviterRoles = (roles ?? []).map((r) => r.role);
  const allowed = ["org_admin", "super_admin", "branch_admin", "hr"];
  if (!inviterRoles.some((r) => allowed.includes(r))) {
    throw new Error("Not authorized to send invitations");
  }
  const isElevated = inviterRoles.some((r) => r === "org_admin" || r === "super_admin");
  return {
    tenantId: profile.tenant_id,
    inviterRoles,
    isElevated
  };
}
async function getOrgAdminTenantId(supabase, userId) {
  const {
    tenantId
  } = await getInviterContext(supabase, userId);
  return tenantId;
}
const listTenantInvitations_createServerFn_handler = createServerRpc({
  id: "4f6fbd45edcb117fec1c70cf749babd1003e48ca426a536091b64d291aee815d",
  name: "listTenantInvitations",
  filename: "src/lib/staff-invitations.functions.ts"
}, (opts) => listTenantInvitations.__executeServer(opts));
const listTenantInvitations = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(listTenantInvitations_createServerFn_handler, async ({
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const tenantId = await getOrgAdminTenantId(supabase, userId);
  const admin = await loadAdmin();
  const {
    data
  } = await admin.from("staff_invitations").select("id,email,first_name,last_name,job_title,status,role,expires_at,accepted_at,created_at,last_sent_at,send_count,token").eq("tenant_id", tenantId).order("created_at", {
    ascending: false
  }).limit(200);
  return {
    invitations: data ?? []
  };
});
const dutyItemSchema = objectType({
  title: stringType().trim().min(1).max(200),
  description: stringType().trim().max(2e3).optional().or(literalType("")),
  weight: numberType().min(0).max(100),
  kpi_target: stringType().trim().max(500).optional().or(literalType(""))
});
const inviteSchema = objectType({
  email: stringType().trim().email().max(255),
  first_name: stringType().trim().max(80).optional().or(literalType("")),
  last_name: stringType().trim().max(80).optional().or(literalType("")),
  job_title: stringType().trim().max(120).optional().or(literalType("")),
  department_id: stringType().uuid().optional().nullable(),
  country_code: stringType().trim().length(2).optional().or(literalType("")),
  role: enumType(["employee", "manager", "org_admin", "branch_admin", "hr", "finance"]).default("employee"),
  state_region: stringType().trim().max(10).optional().or(literalType("")),
  duties: arrayType(dutyItemSchema).max(50).optional().default([])
});
const inviteStaff_createServerFn_handler = createServerRpc({
  id: "a9239ef5daac8dddedc280577c76a3753b09a1218e6ee80aff16ee8a2a3238ee",
  name: "inviteStaff",
  filename: "src/lib/staff-invitations.functions.ts"
}, (opts) => inviteStaff.__executeServer(opts));
const inviteStaff = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((data) => inviteSchema.parse(data)).handler(inviteStaff_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const sendInternalEmail = await loadEmailSender();
  const {
    tenantId,
    isElevated
  } = await getInviterContext(supabase, userId);
  const elevatedTargets = /* @__PURE__ */ new Set(["org_admin", "branch_admin", "hr", "finance"]);
  if (elevatedTargets.has(data.role) && !isElevated) {
    throw new Error("Only Org Admins can invite admin or HR roles.");
  }
  const admin = await loadAdmin();
  const {
    checkPayrollReadiness,
    checkOvertimeReadiness
  } = await import("./payroll-setup.functions-C7xZ-K-i.mjs");
  const {
    checkLeaveReadiness
  } = await import("./leave-setup.functions-7GflKBSX.mjs");
  const [payroll, overtime, leave] = await Promise.all([checkPayrollReadiness(admin, tenantId), checkOvertimeReadiness(admin, tenantId), checkLeaveReadiness(admin, tenantId)]);
  if (!payroll.allComplete) {
    const missing = Object.entries(payroll.steps).filter(([, ok]) => !ok).map(([k]) => k).join(", ");
    throw new Error(`Complete the Payroll Setup Wizard before inviting employees. Outstanding: ${missing}.`);
  }
  if (!overtime.allComplete) {
    throw new Error("Complete the Overtime & Penalty Rates setup before inviting employees.");
  }
  if (!leave.allComplete) {
    const missing = Object.entries(leave.steps).filter(([, ok]) => !ok).map(([k]) => k).join(", ");
    throw new Error(`Complete the Leave Setup Wizard before inviting employees. Outstanding: ${missing}.`);
  }
  const {
    data: tenant
  } = await admin.from("tenants").select("name,country_code").eq("id", tenantId).maybeSingle();
  if (!tenant) throw new Error("Organization not found");
  const {
    data: inviter
  } = await admin.from("profiles").select("full_name,email").eq("id", userId).maybeSingle();
  const token = generateToken();
  const {
    data: inserted,
    error
  } = await admin.from("staff_invitations").insert({
    tenant_id: tenantId,
    email: data.email.toLowerCase(),
    first_name: data.first_name || null,
    last_name: data.last_name || null,
    job_title: data.job_title || null,
    department_id: data.department_id || null,
    country_code: (data.country_code || tenant.country_code || "").toUpperCase() || null,
    role: data.role,
    token,
    invited_by: userId,
    state_region: data.state_region || null,
    duties: data.duties ?? []
  }).select("id,token").single();
  if (error || !inserted) throw new Error(error?.message ?? "Could not create invitation");
  const inviteUrl = `${appUrl()}/invite/${token}`;
  await sendInternalEmail({
    templateName: "staff-invitation",
    recipientEmail: data.email,
    idempotencyKey: `invite-${inserted.id}`,
    templateData: {
      organizationName: tenant.name,
      inviterName: inviter?.full_name || inviter?.email,
      firstName: data.first_name || null,
      jobTitle: data.job_title || null,
      inviteUrl
    }
  });
  const dutySum = (data.duties ?? []).reduce((s, d) => s + Number(d.weight || 0), 0);
  let weightWarning = null;
  if (data.duties && data.duties.length > 0) {
    const {
      data: tSet
    } = await admin.from("tenants").select("kpi_weight_tolerance, kpi_strict_weights").eq("id", tenantId).maybeSingle();
    const tolerance = Number(tSet?.kpi_weight_tolerance ?? 0);
    const strict = Boolean(tSet?.kpi_strict_weights ?? true);
    const within = Math.abs(dutySum - 100) <= tolerance;
    if (strict && !within) {
      throw new Error(`KPI weights must sum to 100% (±${tolerance}%). Current total: ${dutySum}%.`);
    }
    if (!within) {
      weightWarning = `Duty KPI weights sum to ${dutySum}% (expected 100%, ±${tolerance}%). The invitation was sent — adjust weights before reviews start.`;
    }
  }
  return {
    id: inserted.id,
    inviteUrl,
    weight_sum: dutySum,
    warning: weightWarning
  };
});
const resendInvitation_createServerFn_handler = createServerRpc({
  id: "87e36ca08358a7227cfc910a4c1f8332c2ccb450676a61ae8bdd17a563c985b3",
  name: "resendInvitation",
  filename: "src/lib/staff-invitations.functions.ts"
}, (opts) => resendInvitation.__executeServer(opts));
const resendInvitation = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((data) => objectType({
  id: stringType().uuid()
}).parse(data)).handler(resendInvitation_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const sendInternalEmail = await loadEmailSender();
  const tenantId = await getOrgAdminTenantId(supabase, userId);
  const admin = await loadAdmin();
  const {
    data: inv
  } = await admin.from("staff_invitations").select("*").eq("id", data.id).eq("tenant_id", tenantId).maybeSingle();
  if (!inv) throw new Error("Invitation not found");
  if (inv.status !== "pending") throw new Error("Invitation is not pending");
  const newExpiry = new Date(Date.now() + 14 * 24 * 60 * 60 * 1e3).toISOString();
  await admin.from("staff_invitations").update({
    last_sent_at: (/* @__PURE__ */ new Date()).toISOString(),
    send_count: (inv.send_count ?? 1) + 1,
    expires_at: newExpiry
  }).eq("id", inv.id);
  const {
    data: tenant
  } = await admin.from("tenants").select("name").eq("id", tenantId).maybeSingle();
  const {
    data: inviter
  } = await admin.from("profiles").select("full_name,email").eq("id", userId).maybeSingle();
  const inviteUrl = `${appUrl()}/invite/${inv.token}`;
  await sendInternalEmail({
    templateName: "staff-invitation",
    recipientEmail: inv.email,
    idempotencyKey: `invite-${inv.id}-resend-${Date.now()}`,
    templateData: {
      organizationName: tenant?.name,
      inviterName: inviter?.full_name || inviter?.email,
      firstName: inv.first_name,
      jobTitle: inv.job_title,
      inviteUrl
    }
  });
  return {
    ok: true
  };
});
const revokeInvitation_createServerFn_handler = createServerRpc({
  id: "fe8d3bad88fc7c31ce6824aa94300542579a52d2a40a82d8dd1ee8d42b22d271",
  name: "revokeInvitation",
  filename: "src/lib/staff-invitations.functions.ts"
}, (opts) => revokeInvitation.__executeServer(opts));
const revokeInvitation = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((data) => objectType({
  id: stringType().uuid()
}).parse(data)).handler(revokeInvitation_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const tenantId = await getOrgAdminTenantId(supabase, userId);
  const admin = await loadAdmin();
  await admin.from("staff_invitations").update({
    status: "revoked"
  }).eq("id", data.id).eq("tenant_id", tenantId);
  return {
    ok: true
  };
});
const getInvitationByToken_createServerFn_handler = createServerRpc({
  id: "19f515a6b7800389dfe5431779c7ff86d680a4606c99a413225a7fa6fab130a1",
  name: "getInvitationByToken",
  filename: "src/lib/staff-invitations.functions.ts"
}, (opts) => getInvitationByToken.__executeServer(opts));
const getInvitationByToken = createServerFn({
  method: "GET"
}).inputValidator((data) => objectType({
  token: stringType().min(20).max(128).regex(/^[a-f0-9]+$/i)
}).parse(data)).handler(getInvitationByToken_createServerFn_handler, async ({
  data
}) => {
  const admin = await loadAdmin();
  const {
    data: inv
  } = await admin.from("staff_invitations").select("id,tenant_id,email,first_name,last_name,job_title,country_code,role,status,expires_at").eq("token", data.token).maybeSingle();
  if (!inv) return {
    invitation: null,
    organization: null
  };
  const isExpired = new Date(inv.expires_at) < /* @__PURE__ */ new Date();
  if (isExpired && inv.status === "pending") {
    await admin.from("staff_invitations").update({
      status: "expired"
    }).eq("id", inv.id);
    inv.status = "expired";
  }
  const {
    data: tenant
  } = await admin.from("tenants").select("name,country_code,currency_code").eq("id", inv.tenant_id).maybeSingle();
  return {
    invitation: {
      id: inv.id,
      email: inv.email,
      first_name: inv.first_name,
      last_name: inv.last_name,
      job_title: inv.job_title,
      country_code: inv.country_code,
      role: inv.role,
      status: inv.status,
      expires_at: inv.expires_at
    },
    organization: tenant ? {
      name: tenant.name,
      country_code: tenant.country_code,
      currency_code: tenant.currency_code
    } : null
  };
});
function genEmpNumber() {
  const n = Math.floor(1e5 + Math.random() * 9e5);
  return `EMP-${n}`;
}
const acceptSchema = objectType({
  token: stringType().min(20).max(128).regex(/^[a-f0-9]+$/i),
  details: objectType({
    contact_number: stringType().trim().max(40).optional().or(literalType("")),
    bank_name: stringType().trim().max(120).optional().or(literalType("")),
    bank_bsb: stringType().trim().max(20).optional().or(literalType("")),
    bank_account_number: stringType().trim().max(40).optional().or(literalType("")),
    bank_account_name: stringType().trim().max(120).optional().or(literalType("")),
    tfn: stringType().trim().max(20).optional().or(literalType("")),
    super_fund_name: stringType().trim().max(120).optional().or(literalType("")),
    super_member_number: stringType().trim().max(60).optional().or(literalType("")),
    next_of_kin_name: stringType().trim().max(120).optional().or(literalType("")),
    next_of_kin_relationship: stringType().trim().max(60).optional().or(literalType("")),
    next_of_kin_phone: stringType().trim().max(40).optional().or(literalType(""))
  }).optional()
});
const acceptInvitation_createServerFn_handler = createServerRpc({
  id: "a56337699d832b351c042f89f479c3a70280d7f81ecc52d7371d971e6a61cc02",
  name: "acceptInvitation",
  filename: "src/lib/staff-invitations.functions.ts"
}, (opts) => acceptInvitation.__executeServer(opts));
const acceptInvitation = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((data) => acceptSchema.parse(data)).handler(acceptInvitation_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    userId,
    claims
  } = context;
  const userEmail = (claims?.email ?? "").toLowerCase();
  if (!userEmail) throw new Error("User has no email");
  const admin = await loadAdmin();
  const {
    data: inv
  } = await admin.from("staff_invitations").select("*").eq("token", data.token).maybeSingle();
  if (!inv) throw new Error("Invitation not found");
  if (inv.status !== "pending") throw new Error(`Invitation is ${inv.status}`);
  if (new Date(inv.expires_at) < /* @__PURE__ */ new Date()) {
    await admin.from("staff_invitations").update({
      status: "expired"
    }).eq("id", inv.id);
    throw new Error("Invitation expired");
  }
  if (inv.email.toLowerCase() !== userEmail) {
    throw new Error("This invitation was sent to a different email address.");
  }
  const rawDetails = data.details ?? {};
  const orgCountry = inv.country_code || "";
  const isAU = orgCountry.toUpperCase() === "AU" || !orgCountry;
  const {
    errors,
    normalized
  } = validateInvitationDetails(rawDetails, {
    isAU
  });
  if (Object.keys(errors).length > 0) {
    const first = Object.entries(errors)[0];
    throw new Error(`${first[0]}: ${first[1]}`);
  }
  const d = normalized;
  const blank = (v) => v && v.trim().length > 0 ? v.trim() : null;
  await admin.from("profiles").update({
    tenant_id: inv.tenant_id
  }).eq("id", userId);
  const {
    data: existingEmp
  } = await admin.from("employees").select("id").eq("user_id", userId).eq("tenant_id", inv.tenant_id).maybeSingle();
  let employeeId = existingEmp?.id;
  if (!employeeId) {
    const {
      data: emp,
      error: empErr
    } = await admin.from("employees").insert({
      tenant_id: inv.tenant_id,
      user_id: userId,
      employee_number: genEmpNumber(),
      first_name: inv.first_name || userEmail.split("@")[0],
      last_name: inv.last_name || "",
      email: userEmail,
      phone: blank(d.contact_number),
      job_title: inv.job_title,
      department_id: inv.department_id,
      employment_type: "full_time",
      status: "active",
      hire_date: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
      state_region: inv.state_region ?? null
    }).select("id").single();
    if (empErr || !emp) throw new Error(empErr?.message ?? "Could not create employee");
    employeeId = emp.id;
  } else {
    const patch = {};
    if (blank(d.contact_number)) patch.phone = blank(d.contact_number);
    if (inv.state_region) patch.state_region = inv.state_region;
    if (Object.keys(patch).length) await admin.from("employees").update(patch).eq("id", employeeId);
  }
  const invDuties = Array.isArray(inv.duties) ? inv.duties : [];
  if (invDuties.length && employeeId) {
    const rows = invDuties.map((d2, idx) => ({
      tenant_id: inv.tenant_id,
      employee_id: employeeId,
      title: String(d2.title ?? "").slice(0, 200),
      description: d2.description ? String(d2.description).slice(0, 2e3) : null,
      weight: Number(d2.weight ?? 0),
      kpi_target: d2.kpi_target ? String(d2.kpi_target).slice(0, 500) : null,
      sort_order: idx,
      is_active: true,
      created_by: inv.invited_by ?? null
    }));
    await admin.from("employee_duties").insert(rows);
  }
  await admin.from("employee_payroll_details").upsert({
    employee_id: employeeId,
    tenant_id: inv.tenant_id,
    contact_number: blank(d.contact_number),
    bank_name: blank(d.bank_name),
    bank_bsb: blank(d.bank_bsb),
    bank_account_number: blank(d.bank_account_number),
    bank_account_name: blank(d.bank_account_name),
    tfn: blank(d.tfn),
    super_fund_name: blank(d.super_fund_name),
    super_member_number: blank(d.super_member_number),
    next_of_kin_name: blank(d.next_of_kin_name),
    next_of_kin_relationship: blank(d.next_of_kin_relationship),
    next_of_kin_phone: blank(d.next_of_kin_phone)
  }, {
    onConflict: "employee_id"
  });
  const obFields = {
    bank_name: blank(d.bank_name),
    bank_account_holder: blank(d.bank_account_name),
    bank_account_number: blank(d.bank_account_number),
    bank_branch_code: blank(d.bank_bsb),
    tax_identification_number: blank(d.tfn),
    pension_fund_number: blank(d.super_member_number)
  };
  const hasAny = Object.values(obFields).some((v) => v != null && v !== "");
  if (hasAny) {
    await admin.from("staff_onboarding_profiles").upsert({
      employee_id: employeeId,
      tenant_id: inv.tenant_id,
      ...obFields
    }, {
      onConflict: "employee_id"
    });
  }
  await admin.from("user_roles").upsert({
    user_id: userId,
    role: inv.role || "employee",
    tenant_id: inv.tenant_id
  }, {
    onConflict: "user_id,role"
  });
  await admin.from("staff_invitations").update({
    status: "accepted",
    accepted_at: (/* @__PURE__ */ new Date()).toISOString(),
    accepted_user_id: userId
  }).eq("id", inv.id);
  return {
    tenantId: inv.tenant_id,
    employeeId
  };
});
export {
  acceptInvitation_createServerFn_handler,
  getInvitationByToken_createServerFn_handler,
  inviteStaff_createServerFn_handler,
  listTenantInvitations_createServerFn_handler,
  resendInvitation_createServerFn_handler,
  revokeInvitation_createServerFn_handler
};
