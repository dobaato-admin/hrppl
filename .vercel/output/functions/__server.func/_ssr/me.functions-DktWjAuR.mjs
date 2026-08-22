import { c as createServerRpc } from "./createServerRpc-CbJDFEP-.mjs";
import { r as requireSupabaseAuth } from "./auth-guard-CkYFJuQL.mjs";
import { c as createServerFn } from "./server-BOi2EjMN.mjs";
import "../_libs/seroval.mjs";
import "../_libs/react.mjs";
import { a as objectType, z as stringType, G as literalType, C as numberType, B as enumType } from "../_libs/zod.mjs";
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
async function loadMyEmployee(supabase, userId) {
  const {
    data
  } = await supabase.from("employees").select("id,tenant_id,first_name,last_name,email,phone,job_title,department_id,manager_id,employment_type,status,hire_date,base_salary,currency_code,employee_number,user_id").eq("user_id", userId).maybeSingle();
  return data;
}
const getMeOverview_createServerFn_handler = createServerRpc({
  id: "c963549d5a7a6d6e82fbaa75d59a1551df31f9c01de99a84ff4b5c7520168a79",
  name: "getMeOverview",
  filename: "src/lib/me.functions.ts"
}, (opts) => getMeOverview.__executeServer(opts));
const getMeOverview = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(getMeOverview_createServerFn_handler, async ({
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const employee = await loadMyEmployee(supabase, userId);
  if (!employee) return {
    employee: null
  };
  const [dept, manager, prof, balances, leaveRecent, payslipRecent, docCount, openLeave, openTasks] = await Promise.all([employee.department_id ? supabase.from("departments").select("id,name").eq("id", employee.department_id).maybeSingle() : Promise.resolve({
    data: null
  }), employee.manager_id ? supabase.from("employees").select("id,first_name,last_name,email,job_title").eq("id", employee.manager_id).maybeSingle() : Promise.resolve({
    data: null
  }), supabase.from("staff_onboarding_profiles").select("*").eq("employee_id", employee.id).maybeSingle(), supabase.from("leave_balances").select("accrued_days,used_days,pending_days,carried_over_days,year,leave_type:leave_types(id,name,is_paid)").eq("employee_id", employee.id).eq("year", (/* @__PURE__ */ new Date()).getUTCFullYear()), supabase.from("leave_requests").select("id,start_date,end_date,days,status,leave_type:leave_types(name)").eq("employee_id", employee.id).order("created_at", {
    ascending: false
  }).limit(5), supabase.from("payroll_payslips").select("id,run_id,net_pay,currency_code,run:payroll_runs(period_start,period_end,pay_date,status)").eq("employee_id", employee.id).order("created_at", {
    ascending: false
  }).limit(3), supabase.from("employee_documents").select("id", {
    count: "exact",
    head: true
  }).eq("employee_id", employee.id), supabase.from("leave_requests").select("id", {
    count: "exact",
    head: true
  }).eq("employee_id", employee.id).eq("status", "pending"), supabase.from("onboarding_assignments").select("id", {
    count: "exact",
    head: true
  }).eq("employee_id", employee.id).eq("status", "in_progress")]);
  const p = prof.data ?? {};
  const requiredKeys = ["legal_first_name", "legal_last_name", "date_of_birth", "address_line1", "city", "country_of_residence", "personal_phone", "emergency_contact_name", "bank_account_number", "bank_name", "tax_identification_number", "national_id_number"];
  const filled = requiredKeys.filter((k) => !!p[k]).length;
  const completeness = Math.round(filled / requiredKeys.length * 100);
  return {
    employee,
    department: dept.data ?? null,
    manager: manager.data ?? null,
    profile: p,
    profileCompleteness: completeness,
    leaveBalances: balances.data ?? [],
    recentLeave: leaveRecent.data ?? [],
    recentPayslips: payslipRecent.data ?? [],
    documentCount: docCount.count ?? 0,
    pendingLeaveCount: openLeave.count ?? 0,
    openTaskCount: openTasks.count ?? 0
  };
});
const contactSchema = objectType({
  personal_email: stringType().trim().email().max(255).or(literalType("")).nullable().optional(),
  personal_phone: stringType().trim().max(40).nullable().optional(),
  address_line1: stringType().trim().max(200).nullable().optional(),
  address_line2: stringType().trim().max(200).nullable().optional(),
  city: stringType().trim().max(120).nullable().optional(),
  region: stringType().trim().max(120).nullable().optional(),
  postal_code: stringType().trim().max(40).nullable().optional(),
  country_of_residence: stringType().trim().length(2).nullable().optional().or(literalType("")),
  emergency_contact_name: stringType().trim().max(120).nullable().optional(),
  emergency_contact_phone: stringType().trim().max(40).nullable().optional(),
  emergency_contact_relation: stringType().trim().max(60).nullable().optional(),
  marital_status: stringType().trim().max(40).nullable().optional(),
  phone: stringType().trim().max(40).nullable().optional()
  // work phone on employees row
});
const updateMyContactDetails_createServerFn_handler = createServerRpc({
  id: "a4afb90e71eabaf5a0a75e388e9bbf040a1666191e0b46ac30c834e53a6c955c",
  name: "updateMyContactDetails",
  filename: "src/lib/me.functions.ts"
}, (opts) => updateMyContactDetails.__executeServer(opts));
const updateMyContactDetails = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => contactSchema.parse(d)).handler(updateMyContactDetails_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const emp = await loadMyEmployee(supabase, userId);
  if (!emp) throw new Error("No employee record");
  const admin = await loadAdmin();
  const profilePayload = {
    ...data
  };
  const workPhone = profilePayload.phone;
  delete profilePayload.phone;
  if (profilePayload.personal_email === "") profilePayload.personal_email = null;
  if (profilePayload.country_of_residence === "") profilePayload.country_of_residence = null;
  profilePayload.employee_id = emp.id;
  profilePayload.tenant_id = emp.tenant_id;
  const {
    error
  } = await admin.from("staff_onboarding_profiles").upsert(profilePayload, {
    onConflict: "employee_id"
  });
  if (error) throw new Error(error.message);
  if (workPhone !== void 0) {
    await admin.from("employees").update({
      phone: workPhone || null
    }).eq("id", emp.id);
  }
  await admin.from("audit_log").insert({
    entity_type: "staff_onboarding_profile",
    entity_id: emp.id,
    action: "self_service_contact_updated",
    actor_id: userId,
    metadata: {
      tenant_id: emp.tenant_id,
      fields: Object.keys(data)
    }
  });
  return {
    ok: true
  };
});
const bankTaxSchema = objectType({
  bank_name: stringType().trim().max(120).nullable().optional(),
  bank_account_holder: stringType().trim().max(160).nullable().optional(),
  bank_account_number: stringType().trim().max(60).nullable().optional(),
  bank_branch_code: stringType().trim().max(40).nullable().optional(),
  bank_iban: stringType().trim().max(60).nullable().optional(),
  bank_swift: stringType().trim().max(20).nullable().optional(),
  tax_identification_number: stringType().trim().max(60).nullable().optional(),
  social_security_number: stringType().trim().max(60).nullable().optional(),
  provident_fund_number: stringType().trim().max(60).nullable().optional(),
  pension_fund_number: stringType().trim().max(60).nullable().optional(),
  national_id_number: stringType().trim().max(60).nullable().optional()
});
const updateMyBankingTax_createServerFn_handler = createServerRpc({
  id: "0b6c705f84eb0cc52219ea54940b7cba31fccc2a9e1512ffb7774ab2c657ad57",
  name: "updateMyBankingTax",
  filename: "src/lib/me.functions.ts"
}, (opts) => updateMyBankingTax.__executeServer(opts));
const updateMyBankingTax = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => bankTaxSchema.parse(d)).handler(updateMyBankingTax_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const emp = await loadMyEmployee(supabase, userId);
  if (!emp) throw new Error("No employee record");
  const admin = await loadAdmin();
  const payload = {
    ...data,
    employee_id: emp.id,
    tenant_id: emp.tenant_id
  };
  const {
    error
  } = await admin.from("staff_onboarding_profiles").upsert(payload, {
    onConflict: "employee_id"
  });
  if (error) throw new Error(error.message);
  const masked = (v) => v ? `••••${v.slice(-4)}` : null;
  await admin.from("audit_log").insert({
    entity_type: "staff_onboarding_profile",
    entity_id: emp.id,
    action: "self_service_banking_tax_updated",
    actor_id: userId,
    metadata: {
      tenant_id: emp.tenant_id,
      changed: Object.keys(data),
      bank_account_number_mask: masked(data.bank_account_number ?? null),
      bank_iban_mask: masked(data.bank_iban ?? null),
      has_tax_id: !!data.tax_identification_number
    }
  });
  return {
    ok: true
  };
});
const DOC_TYPES = ["contract", "id", "passport", "visa", "certificate", "tax_form", "citizenship_certificate", "drivers_license", "other"];
const listMyDocuments_createServerFn_handler = createServerRpc({
  id: "f8d4e0adcd0ceb0b5cebe3ba0f26156cde04c74de56fe9046b61d7785bd62bc6",
  name: "listMyDocuments",
  filename: "src/lib/me.functions.ts"
}, (opts) => listMyDocuments.__executeServer(opts));
const listMyDocuments = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(listMyDocuments_createServerFn_handler, async ({
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const emp = await loadMyEmployee(supabase, userId);
  if (!emp) return {
    documents: [],
    employeeId: null,
    tenantId: null
  };
  const {
    data
  } = await supabase.from("employee_documents").select("id,doc_type,file_path,file_name,mime_type,size_bytes,visibility,notes,created_at").eq("employee_id", emp.id).eq("visibility", "employee").order("created_at", {
    ascending: false
  });
  return {
    documents: data ?? [],
    employeeId: emp.id,
    tenantId: emp.tenant_id
  };
});
const registerMyDocument_createServerFn_handler = createServerRpc({
  id: "6a82e13a2e4a96f96d658fc4ba1372b4187a72f293da2bb443c1c1201d32cda9",
  name: "registerMyDocument",
  filename: "src/lib/me.functions.ts"
}, (opts) => registerMyDocument.__executeServer(opts));
const registerMyDocument = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  doc_type: enumType(DOC_TYPES),
  file_path: stringType().min(3).max(500),
  file_name: stringType().min(1).max(255),
  mime_type: stringType().max(100).optional(),
  size_bytes: numberType().int().nonnegative().max(50 * 1024 * 1024).optional(),
  notes: stringType().max(1e3).optional()
}).parse(d)).handler(registerMyDocument_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const emp = await loadMyEmployee(supabase, userId);
  if (!emp) throw new Error("No employee record");
  const expected = `${emp.tenant_id}/${emp.id}/`;
  if (!data.file_path.startsWith(expected)) throw new Error("Invalid storage path");
  const admin = await loadAdmin();
  const {
    data: row,
    error
  } = await admin.from("employee_documents").insert({
    tenant_id: emp.tenant_id,
    employee_id: emp.id,
    doc_type: data.doc_type,
    file_path: data.file_path,
    file_name: data.file_name,
    mime_type: data.mime_type ?? null,
    size_bytes: data.size_bytes ?? null,
    uploaded_by: userId,
    visibility: "employee",
    notes: data.notes ?? null
  }).select("id").single();
  if (error) throw new Error(error.message);
  return {
    ok: true,
    id: row.id
  };
});
const createMyDocumentDownloadUrl_createServerFn_handler = createServerRpc({
  id: "ea5e35d9f5bd88316fa9531ebbf4708a649aa831a61ea4c7fddad82c950fde35",
  name: "createMyDocumentDownloadUrl",
  filename: "src/lib/me.functions.ts"
}, (opts) => createMyDocumentDownloadUrl.__executeServer(opts));
const createMyDocumentDownloadUrl = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(createMyDocumentDownloadUrl_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const emp = await loadMyEmployee(supabase, userId);
  if (!emp) throw new Error("No employee record");
  const {
    data: doc
  } = await supabase.from("employee_documents").select("id,file_path,visibility,employee_id").eq("id", data.id).maybeSingle();
  if (!doc || doc.employee_id !== emp.id) throw new Error("Document not found");
  const admin = await loadAdmin();
  const {
    data: signed,
    error
  } = await admin.storage.from("employee-documents").createSignedUrl(doc.file_path, 60 * 10);
  if (error) throw new Error(error.message);
  return {
    url: signed.signedUrl,
    expiresInSeconds: 600
  };
});
const deleteMyDocument_createServerFn_handler = createServerRpc({
  id: "73206aa8188ad1463ae0a0e7ff2704c751b0fa5a5903d2d0a20af855db0c5c1b",
  name: "deleteMyDocument",
  filename: "src/lib/me.functions.ts"
}, (opts) => deleteMyDocument.__executeServer(opts));
const deleteMyDocument = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(deleteMyDocument_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const emp = await loadMyEmployee(supabase, userId);
  if (!emp) throw new Error("No employee record");
  const {
    data: doc
  } = await supabase.from("employee_documents").select("id,file_path,employee_id,visibility").eq("id", data.id).maybeSingle();
  if (!doc || doc.employee_id !== emp.id || doc.visibility !== "employee") {
    throw new Error("Document not found or not deletable");
  }
  const admin = await loadAdmin();
  await admin.storage.from("employee-documents").remove([doc.file_path]);
  await admin.from("employee_documents").delete().eq("id", data.id);
  return {
    ok: true
  };
});
const getCompanyDirectory_createServerFn_handler = createServerRpc({
  id: "12c7bd0fb0d5d2db104457f338805fb6f1b878bebedddab8dd7034b65c1a4db3",
  name: "getCompanyDirectory",
  filename: "src/lib/me.functions.ts"
}, (opts) => getCompanyDirectory.__executeServer(opts));
const getCompanyDirectory = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  search: stringType().trim().max(120).optional(),
  departmentId: stringType().uuid().optional(),
  limit: numberType().int().min(1).max(200).default(100)
}).parse(d)).handler(getCompanyDirectory_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const me = await loadMyEmployee(supabase, userId);
  if (!me) return {
    employees: [],
    departments: []
  };
  const {
    supabaseAdmin
  } = await import("./client.server-D5ro3rAQ.mjs");
  let q = supabaseAdmin.from("employees").select("id,first_name,last_name,job_title,email,phone,department_id,manager_id,status").eq("tenant_id", me.tenant_id).eq("status", "active").order("first_name");
  if (data.departmentId) q = q.eq("department_id", data.departmentId);
  if (data.search) {
    const s = `%${data.search}%`;
    q = q.or(`first_name.ilike.${s},last_name.ilike.${s},email.ilike.${s},job_title.ilike.${s}`);
  }
  const {
    data: emps
  } = await q.limit(data.limit);
  const {
    data: depts
  } = await supabaseAdmin.from("departments").select("id,name").eq("tenant_id", me.tenant_id).order("name");
  return {
    employees: emps ?? [],
    departments: depts ?? []
  };
});
const getMyTeam_createServerFn_handler = createServerRpc({
  id: "ec6dbdedf18afd1b51e40003b9f058802097c720ca58d5d4e70cb6974a675ece",
  name: "getMyTeam",
  filename: "src/lib/me.functions.ts"
}, (opts) => getMyTeam.__executeServer(opts));
const getMyTeam = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(getMyTeam_createServerFn_handler, async ({
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const me = await loadMyEmployee(supabase, userId);
  if (!me) return {
    manager: null,
    peers: [],
    reports: []
  };
  const [{
    data: manager
  }, {
    data: reports
  }, peersRes] = await Promise.all([me.manager_id ? supabase.from("employees").select("id,first_name,last_name,email,job_title").eq("id", me.manager_id).maybeSingle() : Promise.resolve({
    data: null
  }), supabase.from("employees").select("id,first_name,last_name,email,job_title,status").eq("manager_id", me.id).eq("status", "active").order("first_name"), me.manager_id ? supabase.from("employees").select("id,first_name,last_name,email,job_title,status").eq("manager_id", me.manager_id).neq("id", me.id).eq("status", "active").order("first_name") : Promise.resolve({
    data: []
  })]);
  return {
    manager,
    peers: peersRes.data ?? [],
    reports: reports ?? []
  };
});
export {
  createMyDocumentDownloadUrl_createServerFn_handler,
  deleteMyDocument_createServerFn_handler,
  getCompanyDirectory_createServerFn_handler,
  getMeOverview_createServerFn_handler,
  getMyTeam_createServerFn_handler,
  listMyDocuments_createServerFn_handler,
  registerMyDocument_createServerFn_handler,
  updateMyBankingTax_createServerFn_handler,
  updateMyContactDetails_createServerFn_handler
};
