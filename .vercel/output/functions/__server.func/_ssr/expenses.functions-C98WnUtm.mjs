import { c as createServerRpc } from "./createServerRpc-CbJDFEP-.mjs";
import { r as requireSupabaseAuth } from "./auth-guard-CkYFJuQL.mjs";
import { a as getTenantId } from "./tenant-scope-BlIr6GnF.mjs";
import { c as createServerFn } from "./server-BOi2EjMN.mjs";
import "../_libs/seroval.mjs";
import "../_libs/react.mjs";
import { a as objectType, A as booleanType, z as stringType, C as numberType, B as enumType, D as arrayType } from "../_libs/zod.mjs";
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
async function getEmployee(supabase, userId) {
  const {
    data
  } = await supabase.from("employees").select("id,tenant_id").eq("user_id", userId).maybeSingle();
  return data;
}
const listExpenseCategories_createServerFn_handler = createServerRpc({
  id: "df248d70e7ba472a204ac737aac4b82ab72dd79f3bd65cf11d8486174c3c3c56",
  name: "listExpenseCategories",
  filename: "src/lib/expenses.functions.ts"
}, (opts) => listExpenseCategories.__executeServer(opts));
const listExpenseCategories = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(listExpenseCategories_createServerFn_handler, async ({
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const tenantId = await getTenantId(supabase, userId);
  if (!tenantId) return {
    categories: [],
    noTenantScope: true
  };
  const {
    data,
    error
  } = await supabase.from("expense_categories").select("*").eq("tenant_id", tenantId).order("name");
  if (error) throw error;
  return {
    categories: data ?? [],
    noTenantScope: false
  };
});
const CategorySchema = objectType({
  id: stringType().uuid().optional(),
  name: stringType().min(1).max(120),
  code: stringType().max(40).optional().nullable(),
  description: stringType().max(500).optional().nullable(),
  requires_receipt: booleanType().default(true),
  max_amount: numberType().nonnegative().optional().nullable(),
  daily_limit: numberType().nonnegative().optional().nullable(),
  monthly_limit: numberType().nonnegative().optional().nullable(),
  tax_rate: numberType().min(0).max(1).optional().nullable(),
  tax_code: stringType().max(40).optional().nullable(),
  is_active: booleanType().default(true)
});
async function requireOrgAdmin(supabase, userId) {
  const {
    data
  } = await supabase.from("user_roles").select("role").eq("user_id", userId).in("role", ["org_admin", "super_admin"]);
  if (!data || data.length === 0) throw new Error("Only org admins can perform this action");
}
const upsertExpenseCategory_createServerFn_handler = createServerRpc({
  id: "f4de4516b2c1547cbb0dc602c6aaf3aec76d5b9414886c376e7e4e57214afe06",
  name: "upsertExpenseCategory",
  filename: "src/lib/expenses.functions.ts"
}, (opts) => upsertExpenseCategory.__executeServer(opts));
const upsertExpenseCategory = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => CategorySchema.parse(d)).handler(upsertExpenseCategory_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  await requireOrgAdmin(supabase, userId);
  const {
    data: profile
  } = await supabase.from("profiles").select("tenant_id").eq("id", userId).single();
  const payload = {
    ...data,
    tenant_id: profile.tenant_id
  };
  const {
    data: row,
    error
  } = data.id ? await supabase.from("expense_categories").update(payload).eq("id", data.id).select().single() : await supabase.from("expense_categories").insert(payload).select().single();
  if (error) throw error;
  return {
    category: row
  };
});
const deleteExpenseCategory_createServerFn_handler = createServerRpc({
  id: "16010eda1bf207b64d842c5c9a391470b3f5f10676314c4e7b0b376083924165",
  name: "deleteExpenseCategory",
  filename: "src/lib/expenses.functions.ts"
}, (opts) => deleteExpenseCategory.__executeServer(opts));
const deleteExpenseCategory = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(deleteExpenseCategory_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  await requireOrgAdmin(supabase, userId);
  const {
    error
  } = await supabase.from("expense_categories").update({
    is_active: false
  }).eq("id", data.id);
  if (error) throw error;
  return {
    ok: true
  };
});
const ApprovalRuleSchema = objectType({
  id: stringType().uuid().optional(),
  department_id: stringType().uuid().nullable().optional(),
  min_amount: numberType().nonnegative().default(0),
  max_amount: numberType().positive().nullable().optional(),
  approver_id: stringType().uuid(),
  priority: numberType().int().min(0).max(1e3).default(100),
  is_active: booleanType().default(true),
  notes: stringType().max(500).optional().nullable()
});
const listApprovalRules_createServerFn_handler = createServerRpc({
  id: "69776eba036ece29abe3c9a7737d90b05f2544744c64833c087d157f1518de64",
  name: "listApprovalRules",
  filename: "src/lib/expenses.functions.ts"
}, (opts) => listApprovalRules.__executeServer(opts));
const listApprovalRules = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(listApprovalRules_createServerFn_handler, async ({
  context
}) => {
  const {
    supabase
  } = context;
  const {
    data,
    error
  } = await supabase.from("expense_approval_rules").select("*, departments(name)").order("priority").order("min_amount");
  if (error) throw error;
  return {
    rules: data ?? []
  };
});
const upsertApprovalRule_createServerFn_handler = createServerRpc({
  id: "1924a592c52c343422451709e61ac8ea767e5aad86d972d183f47eac467fb545",
  name: "upsertApprovalRule",
  filename: "src/lib/expenses.functions.ts"
}, (opts) => upsertApprovalRule.__executeServer(opts));
const upsertApprovalRule = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => ApprovalRuleSchema.parse(d)).handler(upsertApprovalRule_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  await requireOrgAdmin(supabase, userId);
  const {
    data: profile
  } = await supabase.from("profiles").select("tenant_id").eq("id", userId).single();
  const payload = {
    ...data,
    tenant_id: profile.tenant_id
  };
  const {
    data: row,
    error
  } = data.id ? await supabase.from("expense_approval_rules").update(payload).eq("id", data.id).select().single() : await supabase.from("expense_approval_rules").insert(payload).select().single();
  if (error) throw error;
  return {
    rule: row
  };
});
const deleteApprovalRule_createServerFn_handler = createServerRpc({
  id: "90e5b8211985a8957045e1b46fa6c8376112ed077e88bad97c5bf618b69abb58",
  name: "deleteApprovalRule",
  filename: "src/lib/expenses.functions.ts"
}, (opts) => deleteApprovalRule.__executeServer(opts));
const deleteApprovalRule = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(deleteApprovalRule_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  await requireOrgAdmin(supabase, userId);
  const {
    error
  } = await supabase.from("expense_approval_rules").delete().eq("id", data.id);
  if (error) throw error;
  return {
    ok: true
  };
});
async function resolveApprovers(supabase, tenantId, employeeId, amount) {
  const {
    data: emp
  } = await supabase.from("employees").select("department_id").eq("id", employeeId).maybeSingle();
  const deptId = emp?.department_id ?? null;
  const {
    data: rules
  } = await supabase.from("expense_approval_rules").select("*, departments(name), approver:approver_id(id,first_name,last_name,job_title)").eq("tenant_id", tenantId).eq("is_active", true).order("priority").order("min_amount");
  const matched = (rules ?? []).filter((r) => {
    if (r.department_id && r.department_id !== deptId) return false;
    if (Number(r.min_amount ?? 0) > amount) return false;
    if (r.max_amount !== null && Number(r.max_amount) < amount) return false;
    return true;
  });
  return matched;
}
const previewClaimRouting_createServerFn_handler = createServerRpc({
  id: "4d743ffecd340f7024df319a87c52897639c9ef5b5f89cfd7330003f418a3e65",
  name: "previewClaimRouting",
  filename: "src/lib/expenses.functions.ts"
}, (opts) => previewClaimRouting.__executeServer(opts));
const previewClaimRouting = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  amount: numberType().nonnegative()
}).parse(d)).handler(previewClaimRouting_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const emp = await getEmployee(supabase, userId);
  if (!emp) return {
    approvers: []
  };
  const approvers = await resolveApprovers(supabase, emp.tenant_id, emp.id, data.amount);
  return {
    approvers
  };
});
const listExpenseClaims_createServerFn_handler = createServerRpc({
  id: "ddfcbcbe194e1dfa9949b021727ae6d89ddd50ae1ecb9f18f2a4553b36c2497c",
  name: "listExpenseClaims",
  filename: "src/lib/expenses.functions.ts"
}, (opts) => listExpenseClaims.__executeServer(opts));
const listExpenseClaims = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  scope: enumType(["mine", "team", "all"]).default("mine"),
  status: stringType().optional()
}).parse(d)).handler(listExpenseClaims_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  let q = supabase.from("expense_claims").select("*, employees!inner(first_name,last_name,job_title)").order("created_at", {
    ascending: false
  });
  if (data.scope === "mine") {
    const emp = await getEmployee(supabase, userId);
    if (!emp) return {
      claims: []
    };
    q = q.eq("employee_id", emp.id);
  }
  if (data.status && data.status !== "all") q = q.eq("status", data.status);
  const {
    data: rows,
    error
  } = await q;
  if (error) throw error;
  return {
    claims: rows ?? []
  };
});
const getExpenseClaim_createServerFn_handler = createServerRpc({
  id: "54a90270c9a8fd84751fd2b4bebcb481ce82c4c4621bd6effc247b2474b94f0e",
  name: "getExpenseClaim",
  filename: "src/lib/expenses.functions.ts"
}, (opts) => getExpenseClaim.__executeServer(opts));
const getExpenseClaim = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(getExpenseClaim_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase
  } = context;
  const {
    data: claim
  } = await supabase.from("expense_claims").select("*, employees(first_name,last_name,job_title,email)").eq("id", data.id).single();
  const {
    data: lines
  } = await supabase.from("expense_lines").select("*, expense_categories(name,code)").eq("claim_id", data.id).order("expense_date");
  const {
    data: approvals
  } = await supabase.from("expense_approvals").select("*").eq("claim_id", data.id).order("created_at", {
    ascending: false
  });
  return {
    claim,
    lines: lines ?? [],
    approvals: approvals ?? []
  };
});
const LineSchema = objectType({
  id: stringType().uuid().optional(),
  category_id: stringType().uuid().nullable().optional(),
  expense_date: stringType(),
  amount: numberType().positive(),
  currency: stringType().default("AUD"),
  merchant: stringType().max(200).optional().nullable(),
  description: stringType().max(500).optional().nullable(),
  receipt_path: stringType().optional().nullable(),
  mileage_km: numberType().nonnegative().optional().nullable(),
  tax_amount: numberType().nonnegative().optional().nullable()
});
const ClaimSchema = objectType({
  id: stringType().uuid().optional(),
  title: stringType().min(1).max(200),
  description: stringType().max(2e3).optional().nullable(),
  currency: stringType().default("AUD"),
  lines: arrayType(LineSchema).min(1).max(100),
  submit: booleanType().default(false)
});
const saveExpenseClaim_createServerFn_handler = createServerRpc({
  id: "540b5df087f4237dc47c0be6959abc1e8f1b0a2104c0790909bd8f7523b9cf25",
  name: "saveExpenseClaim",
  filename: "src/lib/expenses.functions.ts"
}, (opts) => saveExpenseClaim.__executeServer(opts));
const saveExpenseClaim = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => ClaimSchema.parse(d)).handler(saveExpenseClaim_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const emp = await getEmployee(supabase, userId);
  if (!emp) throw new Error("No employee profile");
  const catIds = Array.from(new Set(data.lines.map((l) => l.category_id).filter(Boolean)));
  let catMap = /* @__PURE__ */ new Map();
  if (catIds.length) {
    const {
      data: catRows
    } = await supabase.from("expense_categories").select("id,name,tax_rate,max_amount,requires_receipt,is_active").in("id", catIds);
    (catRows ?? []).forEach((c) => catMap.set(c.id, c));
  }
  for (const l of data.lines) {
    const cat = l.category_id ? catMap.get(l.category_id) : null;
    if (cat) {
      if (cat.is_active === false) throw new Error(`Category "${cat.name}" is no longer accepted`);
      if (cat.max_amount != null && Number(l.amount) > Number(cat.max_amount)) {
        throw new Error(`Line for "${cat.name}" exceeds category limit of ${Number(cat.max_amount).toFixed(2)}`);
      }
      if (data.submit && cat.requires_receipt && !l.receipt_path) {
        throw new Error(`A receipt is required for "${cat.name}"`);
      }
    }
  }
  const admin = await loadAdmin();
  const total = data.lines.reduce((s, l) => s + Number(l.amount), 0);
  const claimPayload = {
    tenant_id: emp.tenant_id,
    employee_id: emp.id,
    title: data.title,
    description: data.description ?? null,
    currency: data.currency,
    total_amount: total,
    status: data.submit ? "submitted" : "draft"
  };
  if (data.submit) claimPayload.submitted_at = (/* @__PURE__ */ new Date()).toISOString();
  let claimId = data.id;
  if (claimId) {
    const {
      error
    } = await supabase.from("expense_claims").update(claimPayload).eq("id", claimId);
    if (error) throw error;
    await admin.from("expense_lines").delete().eq("claim_id", claimId);
  } else {
    const {
      data: created,
      error
    } = await supabase.from("expense_claims").insert(claimPayload).select("id").single();
    if (error) throw error;
    claimId = created.id;
  }
  const lineRows = data.lines.map((l) => {
    const cat = l.category_id ? catMap.get(l.category_id) : null;
    let tax = l.tax_amount;
    if ((tax == null || tax === 0) && cat && Number(cat.tax_rate) > 0) {
      const rate = Number(cat.tax_rate);
      tax = Number((Number(l.amount) * rate / (1 + rate)).toFixed(2));
    }
    return {
      claim_id: claimId,
      tenant_id: emp.tenant_id,
      category_id: l.category_id ?? null,
      expense_date: l.expense_date,
      amount: l.amount,
      currency: l.currency,
      merchant: l.merchant ?? null,
      description: l.description ?? null,
      receipt_path: l.receipt_path ?? null,
      mileage_km: l.mileage_km ?? null,
      tax_amount: tax ?? null
    };
  });
  await admin.from("expense_lines").insert(lineRows);
  if (data.submit) {
    const approvers = await resolveApprovers(supabase, emp.tenant_id, emp.id, total);
    const approverNames = approvers.map((a) => a.approver ? `${a.approver.first_name ?? ""} ${a.approver.last_name ?? ""}`.trim() : "").filter(Boolean).join(", ");
    await supabase.from("expense_approvals").insert({
      claim_id: claimId,
      tenant_id: emp.tenant_id,
      approver_id: userId,
      action: "submitted",
      comment: approverNames ? `Routed to: ${approverNames}` : `No routing rule matched (amount ${total.toFixed(2)})`
    });
  }
  return {
    id: claimId,
    status: claimPayload.status
  };
});
const DecisionSchema = objectType({
  id: stringType().uuid(),
  action: enumType(["recommend", "withdraw_recommendation", "approve", "reject", "pay"]),
  comment: stringType().max(1e3).optional(),
  payment_reference: stringType().max(200).optional()
});
async function isOrgAdmin(supabase, userId) {
  const {
    data
  } = await supabase.from("user_roles").select("role").eq("user_id", userId).in("role", ["org_admin", "super_admin"]);
  return (data ?? []).length > 0;
}
const decideExpenseClaim_createServerFn_handler = createServerRpc({
  id: "16adaf98fff2071248d3c45daba2b6e12d9d6b24584dc2cc94dce2d2a1398be3",
  name: "decideExpenseClaim",
  filename: "src/lib/expenses.functions.ts"
}, (opts) => decideExpenseClaim.__executeServer(opts));
const decideExpenseClaim = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => DecisionSchema.parse(d)).handler(decideExpenseClaim_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const {
    data: claim
  } = await supabase.from("expense_claims").select("*").eq("id", data.id).single();
  if (!claim) throw new Error("Claim not found");
  const admin = await isOrgAdmin(supabase, userId);
  const updates = {};
  const now = (/* @__PURE__ */ new Date()).toISOString();
  let auditAction = data.action;
  if (data.action === "recommend") {
    if (claim.status !== "submitted") throw new Error("Only submitted claims can be recommended");
    updates.status = "recommended";
    updates.recommended_at = now;
    updates.recommended_by = userId;
    updates.recommendation_note = data.comment ?? null;
    auditAction = "recommended";
  } else if (data.action === "withdraw_recommendation") {
    if (claim.status !== "recommended") throw new Error("Claim is not in recommended state");
    updates.status = "submitted";
    updates.recommended_at = null;
    updates.recommended_by = null;
    updates.recommendation_note = null;
    auditAction = "recommendation_withdrawn";
  } else if (data.action === "approve") {
    if (!["submitted", "recommended"].includes(claim.status)) throw new Error("Only submitted or recommended claims can be approved");
    if (!admin) throw new Error("Only org admins can approve");
    updates.status = "approved";
    updates.approved_at = now;
    updates.approved_by = userId;
    auditAction = "approved";
  } else if (data.action === "reject") {
    if (!["submitted", "recommended", "approved"].includes(claim.status)) throw new Error("Cannot reject from this status");
    if (!admin) throw new Error("Only org admins can reject");
    updates.status = "rejected";
    updates.rejected_reason = data.comment ?? null;
    auditAction = "rejected";
  } else if (data.action === "pay") {
    if (claim.status !== "approved") throw new Error("Only approved claims can be paid");
    if (!admin) throw new Error("Only org admins can mark as paid");
    updates.status = "paid";
    updates.paid_at = now;
    updates.paid_by = userId;
    updates.payment_reference = data.payment_reference ?? null;
    auditAction = "paid";
  }
  const {
    error
  } = await supabase.from("expense_claims").update(updates).eq("id", data.id);
  if (error) throw error;
  await supabase.from("expense_approvals").insert({
    claim_id: data.id,
    tenant_id: claim.tenant_id,
    approver_id: userId,
    action: auditAction,
    comment: data.action === "pay" ? `Marked paid (${data.payment_reference ?? "no ref"})` : data.comment ?? null
  });
  return {
    ok: true
  };
});
const deleteExpenseClaim_createServerFn_handler = createServerRpc({
  id: "c93b449e2879fee347404c21adff5aad2323e3b3695820f175b387b86b882324",
  name: "deleteExpenseClaim",
  filename: "src/lib/expenses.functions.ts"
}, (opts) => deleteExpenseClaim.__executeServer(opts));
const deleteExpenseClaim = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(deleteExpenseClaim_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const {
    data: claim
  } = await supabase.from("expense_claims").select("id,employee_id,status,tenant_id").eq("id", data.id).maybeSingle();
  if (!claim) throw new Error("Claim not found");
  const emp = await getEmployee(supabase, userId);
  const admin = await isOrgAdmin(supabase, userId);
  const isOwner = !!emp && emp.id === claim.employee_id;
  if (!admin && !(isOwner && claim.status === "draft")) {
    throw new Error("Forbidden");
  }
  const {
    error
  } = await supabase.from("expense_claims").delete().eq("id", data.id);
  if (error) throw error;
  return {
    ok: true
  };
});
const getReceiptSignedUrl_createServerFn_handler = createServerRpc({
  id: "1485f882bb6917f22e1e0d6ffe335b359de2a870f7b308fef6ac2fbd1eaa8337",
  name: "getReceiptSignedUrl",
  filename: "src/lib/expenses.functions.ts"
}, (opts) => getReceiptSignedUrl.__executeServer(opts));
const getReceiptSignedUrl = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  path: stringType().min(1)
}).parse(d)).handler(getReceiptSignedUrl_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const emp = await getEmployee(supabase, userId);
  if (!emp) throw new Error("Forbidden");
  const segs = data.path.split("/");
  if (segs.length < 2) throw new Error("Invalid path");
  const pathTenant = segs[0];
  if (pathTenant !== emp.tenant_id) throw new Error("Forbidden");
  const {
    data: line
  } = await supabase.from("expense_lines").select("id, expense_claims!inner(employee_id, tenant_id)").eq("receipt_path", data.path).maybeSingle();
  if (!line) {
    const admin = await isOrgAdmin(supabase, userId);
    if (!admin) throw new Error("Forbidden");
  }
  const adminClient = await loadAdmin();
  const {
    data: signed,
    error
  } = await adminClient.storage.from("expense-receipts").createSignedUrl(data.path, 600);
  if (error) throw error;
  return {
    url: signed.signedUrl
  };
});
const getReimbursementSummary_createServerFn_handler = createServerRpc({
  id: "ee609298f5c3d2e25d65cd6f74b822627fdf4d27737fe07fe0b6a9e2d4ce325a",
  name: "getReimbursementSummary",
  filename: "src/lib/expenses.functions.ts"
}, (opts) => getReimbursementSummary.__executeServer(opts));
const getReimbursementSummary = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  employeeId: stringType().uuid().optional(),
  from: stringType().optional(),
  to: stringType().optional()
}).parse(d ?? {})).handler(getReimbursementSummary_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const emp = await getEmployee(supabase, userId);
  const admin = await isOrgAdmin(supabase, userId);
  let targetEmpId = data.employeeId ?? emp?.id ?? null;
  if (data.employeeId && data.employeeId !== emp?.id && !admin) {
    throw new Error("Forbidden");
  }
  if (!targetEmpId) return {
    summary: null,
    claims: []
  };
  let q = supabase.from("expense_claims").select("id,title,reference_code,currency,total_amount,status,submitted_at,approved_at,paid_at,payment_reference,created_at").eq("employee_id", targetEmpId).order("created_at", {
    ascending: false
  });
  if (data.from) q = q.gte("created_at", data.from);
  if (data.to) q = q.lte("created_at", data.to);
  const {
    data: rows,
    error
  } = await q;
  if (error) throw error;
  const claims = rows ?? [];
  let approved = 0, paid = 0, pending = 0, rejected = 0;
  for (const c of claims) {
    const t = Number(c.total_amount) || 0;
    if (c.status === "approved") approved += t;
    else if (c.status === "paid") paid += t;
    else if (c.status === "submitted" || c.status === "recommended") pending += t;
    else if (c.status === "rejected") rejected += t;
  }
  return {
    claims,
    summary: {
      approvedTotal: approved,
      paidTotal: paid,
      pendingTotal: pending,
      rejectedTotal: rejected,
      outstandingTotal: approved,
      // approved but not yet paid
      currency: claims[0]?.currency ?? "AUD",
      employeeId: targetEmpId
    }
  };
});
export {
  decideExpenseClaim_createServerFn_handler,
  deleteApprovalRule_createServerFn_handler,
  deleteExpenseCategory_createServerFn_handler,
  deleteExpenseClaim_createServerFn_handler,
  getExpenseClaim_createServerFn_handler,
  getReceiptSignedUrl_createServerFn_handler,
  getReimbursementSummary_createServerFn_handler,
  listApprovalRules_createServerFn_handler,
  listExpenseCategories_createServerFn_handler,
  listExpenseClaims_createServerFn_handler,
  previewClaimRouting_createServerFn_handler,
  saveExpenseClaim_createServerFn_handler,
  upsertApprovalRule_createServerFn_handler,
  upsertExpenseCategory_createServerFn_handler
};
