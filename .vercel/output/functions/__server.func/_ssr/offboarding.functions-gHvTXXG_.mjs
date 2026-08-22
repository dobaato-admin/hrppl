import { c as createServerRpc } from "./createServerRpc-CbJDFEP-.mjs";
import { r as requireSupabaseAuth } from "./auth-guard-CkYFJuQL.mjs";
import { r as requireTenantId, g as getMyEmployeeId, a as getTenantId } from "./tenant-scope-BlIr6GnF.mjs";
import { c as createServerFn } from "./server-BOi2EjMN.mjs";
import "../_libs/seroval.mjs";
import "../_libs/react.mjs";
import { a as objectType, A as booleanType, z as stringType, B as enumType, C as numberType } from "../_libs/zod.mjs";
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
const listOffboarding_createServerFn_handler = createServerRpc({
  id: "2958288976e42aa638dc71f0a39064337637c77d0e83bddf9f078c7003c0ff3a",
  name: "listOffboarding",
  filename: "src/lib/offboarding.functions.ts"
}, (opts) => listOffboarding.__executeServer(opts));
const listOffboarding = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(listOffboarding_createServerFn_handler, async ({
  context
}) => {
  const {
    data,
    error
  } = await context.supabase.from("offboarding_cases").select("*").order("created_at", {
    ascending: false
  }).limit(300);
  if (error) throw new Error(error.message);
  const ids = Array.from(new Set((data ?? []).map((c) => c.employee_id)));
  const empMap = {};
  if (ids.length) {
    const {
      data: emps
    } = await context.supabase.from("employees").select("id,first_name,last_name,email,job_title").in("id", ids);
    for (const e of emps ?? []) empMap[e.id] = e;
  }
  const cases = (data ?? []).map((c) => ({
    ...c,
    employees: empMap[c.employee_id] ?? null
  }));
  return {
    cases
  };
});
const createOffboarding_createServerFn_handler = createServerRpc({
  id: "ea31b6d6547080465b8d4a5fe80d1265e1795f3d91b8492b144a2ea913da862a",
  name: "createOffboarding",
  filename: "src/lib/offboarding.functions.ts"
}, (opts) => createOffboarding.__executeServer(opts));
const createOffboarding = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  employeeId: stringType().uuid(),
  reason: enumType(["resignation", "termination", "redundancy", "retirement", "end_of_contract", "mutual_separation", "death", "other"]).default("resignation"),
  reasonNotes: stringType().max(2e3).optional(),
  noticeGivenOn: stringType().optional(),
  lastWorkingDay: stringType().optional(),
  confidential: booleanType().default(false)
}).parse(d)).handler(createOffboarding_createServerFn_handler, async ({
  data,
  context
}) => {
  const callerTenantId = await requireTenantId(context.supabase, context.userId);
  const {
    data: emp
  } = await context.supabase.from("employees").select("tenant_id,manager_id").eq("id", data.employeeId).single();
  if (!emp) throw new Error("Employee not found");
  if (emp.tenant_id !== callerTenantId) {
    throw new Error("That employee belongs to a different organization.");
  }
  const myEmployeeId = await getMyEmployeeId(context.supabase, context.userId);
  if (myEmployeeId && myEmployeeId === data.employeeId) {
    throw new Error("You cannot start an offboarding case for yourself.");
  }
  const {
    data: row,
    error
  } = await context.supabase.from("offboarding_cases").insert({
    tenant_id: callerTenantId,
    employee_id: data.employeeId,
    manager_id: emp.manager_id,
    reason: data.reason,
    reason_notes: data.reasonNotes,
    notice_given_on: data.noticeGivenOn || null,
    last_working_day: data.lastWorkingDay || null,
    confidential: data.confidential,
    hr_owner_id: context.userId,
    created_by: context.userId
  }).select().single();
  if (error) throw new Error(error.message);
  return {
    case: row
  };
});
const getOffboarding_createServerFn_handler = createServerRpc({
  id: "a66847756ee769ed40f256447ce180f86e8081880fadec25fd215df17d53c81e",
  name: "getOffboarding",
  filename: "src/lib/offboarding.functions.ts"
}, (opts) => getOffboarding.__executeServer(opts));
const getOffboarding = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(getOffboarding_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    data: c,
    error
  } = await context.supabase.from("offboarding_cases").select("*").eq("id", data.id).single();
  if (error) throw new Error(error.message);
  const {
    data: emp
  } = await context.supabase.from("employees").select("id,first_name,last_name,email,job_title").eq("id", c.employee_id).maybeSingle();
  const {
    data: items
  } = await context.supabase.from("offboarding_checklist_items").select("*").eq("case_id", data.id).order("sort_order", {
    ascending: true
  });
  return {
    case: {
      ...c,
      employees: emp
    },
    items: items ?? []
  };
});
const updateOffboarding_createServerFn_handler = createServerRpc({
  id: "7ed3818e1b3fa2e8dd999e0df0b68a0d1d4e3dbb5669f488d4f8107dc6cc9ef7",
  name: "updateOffboarding",
  filename: "src/lib/offboarding.functions.ts"
}, (opts) => updateOffboarding.__executeServer(opts));
const updateOffboarding = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid(),
  status: enumType(["initiated", "in_progress", "clearance_pending", "completed", "cancelled"]).optional(),
  lastWorkingDay: stringType().optional(),
  exitInterviewNotes: stringType().max(5e3).optional(),
  exitInterviewRating: numberType().int().min(1).max(5).optional(),
  rehireEligible: booleanType().optional(),
  knowledgeTransferNotes: stringType().max(5e3).optional(),
  finalPayStatus: stringType().max(120).optional()
}).parse(d)).handler(updateOffboarding_createServerFn_handler, async ({
  data,
  context
}) => {
  const patch = {};
  if (data.status) patch.status = data.status;
  if (data.lastWorkingDay) patch.last_working_day = data.lastWorkingDay;
  if (data.exitInterviewNotes !== void 0) {
    patch.exit_interview_notes = data.exitInterviewNotes;
    patch.exit_interview_at = (/* @__PURE__ */ new Date()).toISOString();
    patch.exit_interview_by = context.userId;
  }
  if (data.exitInterviewRating !== void 0) patch.exit_interview_rating = data.exitInterviewRating;
  if (data.rehireEligible !== void 0) patch.rehire_eligible = data.rehireEligible;
  if (data.knowledgeTransferNotes !== void 0) patch.knowledge_transfer_notes = data.knowledgeTransferNotes;
  if (data.finalPayStatus !== void 0) patch.final_pay_status = data.finalPayStatus;
  if (data.status === "completed") patch.closed_at = (/* @__PURE__ */ new Date()).toISOString();
  const {
    error
  } = await context.supabase.from("offboarding_cases").update(patch).eq("id", data.id);
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
const toggleChecklistItem_createServerFn_handler = createServerRpc({
  id: "6ef710c8dc517340ce30d61836fe1d52f10fd7967df54f4e0fb6d7cf4820f654",
  name: "toggleChecklistItem",
  filename: "src/lib/offboarding.functions.ts"
}, (opts) => toggleChecklistItem.__executeServer(opts));
const toggleChecklistItem = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  itemId: stringType().uuid(),
  completed: booleanType(),
  notes: stringType().max(1e3).optional()
}).parse(d)).handler(toggleChecklistItem_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    error
  } = await context.supabase.from("offboarding_checklist_items").update({
    completed: data.completed,
    completed_at: data.completed ? (/* @__PURE__ */ new Date()).toISOString() : null,
    completed_by: data.completed ? context.userId : null,
    completion_notes: data.notes ?? null
  }).eq("id", data.itemId);
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
const addChecklistItem_createServerFn_handler = createServerRpc({
  id: "92f61154d5767c93cfe0db5c4a817b51f9484ed0e5d2619e807ae580bc477a71",
  name: "addChecklistItem",
  filename: "src/lib/offboarding.functions.ts"
}, (opts) => addChecklistItem.__executeServer(opts));
const addChecklistItem = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  caseId: stringType().uuid(),
  title: stringType().min(1).max(255),
  category: stringType().max(40).default("general"),
  ownerRole: enumType(["hr", "manager", "employee", "it", "finance"]).default("hr"),
  dueDate: stringType().optional(),
  isBlocking: booleanType().default(false)
}).parse(d)).handler(addChecklistItem_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    data: c
  } = await context.supabase.from("offboarding_cases").select("tenant_id").eq("id", data.caseId).single();
  if (!c) throw new Error("Case not found");
  const {
    error
  } = await context.supabase.from("offboarding_checklist_items").insert({
    tenant_id: c.tenant_id,
    case_id: data.caseId,
    title: data.title,
    category: data.category,
    owner_role: data.ownerRole,
    due_date: data.dueDate || null,
    is_blocking: data.isBlocking
  });
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
const myOffboarding_createServerFn_handler = createServerRpc({
  id: "4e034a4952a1d3e1c2e6c195e1c3a44f9c094cc73480e6feb565ef080349689d",
  name: "myOffboarding",
  filename: "src/lib/offboarding.functions.ts"
}, (opts) => myOffboarding.__executeServer(opts));
const myOffboarding = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(myOffboarding_createServerFn_handler, async ({
  context
}) => {
  const {
    data: emp
  } = await context.supabase.from("employees").select("id").eq("user_id", context.userId).maybeSingle();
  if (!emp) return {
    case: null,
    items: []
  };
  const {
    data: c
  } = await context.supabase.from("offboarding_cases").select("*").eq("employee_id", emp.id).order("created_at", {
    ascending: false
  }).limit(1).maybeSingle();
  if (!c) return {
    case: null,
    items: []
  };
  const {
    data: items
  } = await context.supabase.from("offboarding_checklist_items").select("*").eq("case_id", c.id).order("sort_order");
  return {
    case: c,
    items: items ?? []
  };
});
async function offbTenantId(ctx) {
  const {
    data
  } = await ctx.supabase.from("profiles").select("tenant_id").eq("id", ctx.userId).maybeSingle();
  if (!data?.tenant_id) throw new Error("No tenant");
  return data.tenant_id;
}
const listOffboardingTemplates_createServerFn_handler = createServerRpc({
  id: "d956351cece4e70ffc475713225e9b859605db557213c7ee812b9848a4117d84",
  name: "listOffboardingTemplates",
  filename: "src/lib/offboarding.functions.ts"
}, (opts) => listOffboardingTemplates.__executeServer(opts));
const listOffboardingTemplates = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(listOffboardingTemplates_createServerFn_handler, async ({
  context
}) => {
  const tenantId = await getTenantId(context.supabase, context.userId);
  if (!tenantId) return {
    templates: [],
    items: []
  };
  const {
    data: templates,
    error
  } = await context.supabase.from("offboarding_checklist_templates").select("*").eq("tenant_id", tenantId).order("is_default", {
    ascending: false
  }).order("updated_at", {
    ascending: false
  });
  if (error) throw new Error(error.message);
  const ids = (templates ?? []).map((t) => t.id);
  let items = [];
  if (ids.length) {
    const {
      data: rows
    } = await context.supabase.from("offboarding_checklist_template_items").select("*").in("template_id", ids).order("sort_order");
    items = rows ?? [];
  }
  return {
    templates: templates ?? [],
    items
  };
});
const upsertOffboardingTemplate_createServerFn_handler = createServerRpc({
  id: "e6655661829253a0206e59f3e9d6010d2fe7cd4cfcbe64b83a902343c63bda3f",
  name: "upsertOffboardingTemplate",
  filename: "src/lib/offboarding.functions.ts"
}, (opts) => upsertOffboardingTemplate.__executeServer(opts));
const upsertOffboardingTemplate = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid().optional(),
  name: stringType().min(1).max(200),
  description: stringType().max(2e3).optional(),
  departmentId: stringType().uuid().nullable().optional(),
  reason: enumType(["resignation", "termination", "redundancy", "retirement", "end_of_contract", "mutual_separation", "death", "other"]).nullable().optional(),
  isDefault: booleanType().default(false),
  isActive: booleanType().default(true)
}).parse(d)).handler(upsertOffboardingTemplate_createServerFn_handler, async ({
  data,
  context
}) => {
  const t = await offbTenantId(context);
  const payload = {
    tenant_id: t,
    name: data.name,
    description: data.description ?? null,
    department_id: data.departmentId ?? null,
    reason: data.reason ?? null,
    is_default: data.isDefault,
    is_active: data.isActive
  };
  if (data.id) {
    const {
      error: error2
    } = await context.supabase.from("offboarding_checklist_templates").update(payload).eq("id", data.id);
    if (error2) throw new Error(error2.message);
    return {
      id: data.id
    };
  }
  payload.created_by = context.userId;
  const {
    data: row,
    error
  } = await context.supabase.from("offboarding_checklist_templates").insert(payload).select("id").single();
  if (error) throw new Error(error.message);
  return {
    id: row.id
  };
});
const deleteOffboardingTemplate_createServerFn_handler = createServerRpc({
  id: "0ffbce3e4771e398d29c03574f822a9f3f8f06e7e6998b7a9865a943f7015c4b",
  name: "deleteOffboardingTemplate",
  filename: "src/lib/offboarding.functions.ts"
}, (opts) => deleteOffboardingTemplate.__executeServer(opts));
const deleteOffboardingTemplate = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(deleteOffboardingTemplate_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    error
  } = await context.supabase.from("offboarding_checklist_templates").delete().eq("id", data.id);
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
const upsertOffboardingTemplateItem_createServerFn_handler = createServerRpc({
  id: "71ba11a19c38d1be47a2c78c0f4ac4bb3f4f9cd4db408acb71bdddd2010303ab",
  name: "upsertOffboardingTemplateItem",
  filename: "src/lib/offboarding.functions.ts"
}, (opts) => upsertOffboardingTemplateItem.__executeServer(opts));
const upsertOffboardingTemplateItem = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid().optional(),
  templateId: stringType().uuid(),
  title: stringType().min(1).max(255),
  category: stringType().max(40).default("general"),
  ownerRole: enumType(["hr", "manager", "employee", "it", "finance"]).default("hr"),
  dueOffsetDays: numberType().int().min(-365).max(365).default(0),
  isBlocking: booleanType().default(false),
  sortOrder: numberType().int().min(0).max(9999).default(0)
}).parse(d)).handler(upsertOffboardingTemplateItem_createServerFn_handler, async ({
  data,
  context
}) => {
  const t = await offbTenantId(context);
  const payload = {
    tenant_id: t,
    template_id: data.templateId,
    title: data.title,
    category: data.category,
    owner_role: data.ownerRole,
    due_offset_days: data.dueOffsetDays,
    is_blocking: data.isBlocking,
    sort_order: data.sortOrder
  };
  if (data.id) {
    const {
      error: error2
    } = await context.supabase.from("offboarding_checklist_template_items").update(payload).eq("id", data.id);
    if (error2) throw new Error(error2.message);
    return {
      id: data.id
    };
  }
  const {
    data: row,
    error
  } = await context.supabase.from("offboarding_checklist_template_items").insert(payload).select("id").single();
  if (error) throw new Error(error.message);
  return {
    id: row.id
  };
});
const deleteOffboardingTemplateItem_createServerFn_handler = createServerRpc({
  id: "3fb78cb6d4d2bb14098129f1d958be77e0b0c1d5dabccb2bcde6b536d8ed7f7a",
  name: "deleteOffboardingTemplateItem",
  filename: "src/lib/offboarding.functions.ts"
}, (opts) => deleteOffboardingTemplateItem.__executeServer(opts));
const deleteOffboardingTemplateItem = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(deleteOffboardingTemplateItem_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    error
  } = await context.supabase.from("offboarding_checklist_template_items").delete().eq("id", data.id);
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
export {
  addChecklistItem_createServerFn_handler,
  createOffboarding_createServerFn_handler,
  deleteOffboardingTemplateItem_createServerFn_handler,
  deleteOffboardingTemplate_createServerFn_handler,
  getOffboarding_createServerFn_handler,
  listOffboardingTemplates_createServerFn_handler,
  listOffboarding_createServerFn_handler,
  myOffboarding_createServerFn_handler,
  toggleChecklistItem_createServerFn_handler,
  updateOffboarding_createServerFn_handler,
  upsertOffboardingTemplateItem_createServerFn_handler,
  upsertOffboardingTemplate_createServerFn_handler
};
