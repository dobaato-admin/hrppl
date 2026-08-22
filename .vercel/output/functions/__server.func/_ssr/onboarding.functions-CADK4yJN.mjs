import { c as createServerRpc } from "./createServerRpc-CbJDFEP-.mjs";
import { r as requireSupabaseAuth } from "./auth-guard-CkYFJuQL.mjs";
import { c as createServerFn } from "./server-BOi2EjMN.mjs";
import "../_libs/seroval.mjs";
import "../_libs/react.mjs";
import { a as objectType, D as arrayType, z as stringType, A as booleanType, C as numberType, B as enumType } from "../_libs/zod.mjs";
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
async function getRoles(supabase, userId) {
  const {
    data
  } = await supabase.from("user_roles").select("role").eq("user_id", userId);
  return (data ?? []).map((r) => r.role);
}
const upsertChecklist_createServerFn_handler = createServerRpc({
  id: "fdf53032c638e6fe525c2cd96c854a8485edc65a2bb729421a7e142feae6e5f2",
  name: "upsertChecklist",
  filename: "src/lib/onboarding.functions.ts"
}, (opts) => upsertChecklist.__executeServer(opts));
const upsertChecklist = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid().optional(),
  name: stringType().min(1).max(120),
  description: stringType().max(2e3).nullable().optional(),
  isDefault: booleanType().default(false),
  countryCode: stringType().max(3).nullable().optional(),
  branchId: stringType().uuid().nullable().optional(),
  departmentId: stringType().uuid().nullable().optional(),
  employmentType: stringType().max(40).nullable().optional(),
  priority: numberType().int().min(0).max(9999).default(100),
  stages: arrayType(objectType({
    key: stringType().min(1).max(60),
    label: stringType().min(1).max(120),
    order: numberType().int().min(0).max(999).default(0)
  })).max(20).default([]),
  items: arrayType(objectType({
    key: stringType().min(1).max(60),
    label: stringType().min(1).max(200),
    required: booleanType().default(true),
    stage: stringType().max(60).optional().nullable()
  })).max(100)
}).parse(d)).handler(upsertChecklist_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const roles = await getRoles(supabase, userId);
  if (!roles.some((r) => ["org_admin", "super_admin"].includes(r))) throw new Error("Not authorized");
  const {
    data: prof
  } = await supabase.from("profiles").select("tenant_id").eq("id", userId).maybeSingle();
  if (!prof?.tenant_id) throw new Error("No tenant");
  const payload = {
    tenant_id: prof.tenant_id,
    name: data.name,
    description: data.description ?? null,
    is_default: data.isDefault,
    country_code: data.countryCode ?? null,
    branch_id: data.branchId ?? null,
    department_id: data.departmentId ?? null,
    employment_type: data.employmentType ?? null,
    priority: data.priority,
    items: data.items,
    stages: data.stages
  };
  if (data.id) {
    const {
      error: error2
    } = await supabase.from("onboarding_checklists").update(payload).eq("id", data.id);
    if (error2) throw new Error(error2.message);
    return {
      ok: true,
      id: data.id
    };
  }
  const {
    data: row,
    error
  } = await supabase.from("onboarding_checklists").insert(payload).select("id").single();
  if (error) throw new Error(error.message);
  return {
    ok: true,
    id: row.id
  };
});
const listChecklistPacks_createServerFn_handler = createServerRpc({
  id: "894f5aab2ebc8cf74eac8b7c322d435b8288268b2074db4ffe232d4d7780f335",
  name: "listChecklistPacks",
  filename: "src/lib/onboarding.functions.ts"
}, (opts) => listChecklistPacks.__executeServer(opts));
const listChecklistPacks = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(listChecklistPacks_createServerFn_handler, async ({
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const {
    data: prof
  } = await supabase.from("profiles").select("tenant_id").eq("id", userId).maybeSingle();
  if (!prof?.tenant_id) return {
    packs: [],
    branches: [],
    departments: []
  };
  const [packsRes, branchesRes, deptsRes] = await Promise.all([supabase.from("onboarding_checklists").select("id,name,description,country_code,branch_id,department_id,employment_type,priority,is_default,is_system_seed,items,stages,updated_at").eq("tenant_id", prof.tenant_id).order("country_code", {
    ascending: true,
    nullsFirst: true
  }).order("priority", {
    ascending: true
  }).order("updated_at", {
    ascending: false
  }), supabase.from("tenant_branches").select("id,name,country_code").eq("tenant_id", prof.tenant_id).order("name"), supabase.from("departments").select("id,name").eq("tenant_id", prof.tenant_id).order("name")]);
  return {
    packs: packsRes.data ?? [],
    branches: branchesRes.data ?? [],
    departments: deptsRes.data ?? []
  };
});
const reorderChecklistPacks_createServerFn_handler = createServerRpc({
  id: "b3a57f2f97a98187a78628d161dd48a5ec8b855082504ebdc9d7fcb1d85fd7e8",
  name: "reorderChecklistPacks",
  filename: "src/lib/onboarding.functions.ts"
}, (opts) => reorderChecklistPacks.__executeServer(opts));
const reorderChecklistPacks = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  ordered: arrayType(objectType({
    id: stringType().uuid(),
    priority: numberType().int().min(0).max(9999)
  })).min(1).max(200)
}).parse(d)).handler(reorderChecklistPacks_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const roles = await getRoles(supabase, userId);
  if (!roles.some((r) => ["org_admin", "super_admin"].includes(r))) throw new Error("Not authorized");
  const {
    data: prof
  } = await supabase.from("profiles").select("tenant_id").eq("id", userId).maybeSingle();
  if (!prof?.tenant_id) throw new Error("No tenant");
  for (const row of data.ordered) {
    const {
      error
    } = await supabase.from("onboarding_checklists").update({
      priority: row.priority
    }).eq("id", row.id).eq("tenant_id", prof.tenant_id);
    if (error) throw new Error(error.message);
  }
  return {
    ok: true
  };
});
const cloneChecklistPack_createServerFn_handler = createServerRpc({
  id: "68beafaf06ed9a79eb3321da003354c0c9cb3887d082f3d57a6133a988ac656b",
  name: "cloneChecklistPack",
  filename: "src/lib/onboarding.functions.ts"
}, (opts) => cloneChecklistPack.__executeServer(opts));
const cloneChecklistPack = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  sourceId: stringType().uuid(),
  name: stringType().min(1).max(120),
  countryCode: stringType().max(3).nullable().optional(),
  branchId: stringType().uuid().nullable().optional(),
  departmentId: stringType().uuid().nullable().optional(),
  employmentType: stringType().max(40).nullable().optional(),
  priority: numberType().int().min(0).max(9999).default(50)
}).parse(d)).handler(cloneChecklistPack_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const roles = await getRoles(supabase, userId);
  if (!roles.some((r) => ["org_admin", "super_admin"].includes(r))) throw new Error("Not authorized");
  const {
    data: prof
  } = await supabase.from("profiles").select("tenant_id").eq("id", userId).maybeSingle();
  if (!prof?.tenant_id) throw new Error("No tenant");
  const {
    data: src,
    error: srcErr
  } = await supabase.from("onboarding_checklists").select("items,stages,description").eq("id", data.sourceId).maybeSingle();
  if (srcErr || !src) throw new Error("Source pack not found");
  const {
    data: row,
    error
  } = await supabase.from("onboarding_checklists").insert({
    tenant_id: prof.tenant_id,
    name: data.name,
    description: src.description ?? null,
    is_default: false,
    is_system_seed: false,
    country_code: data.countryCode ?? null,
    branch_id: data.branchId ?? null,
    department_id: data.departmentId ?? null,
    employment_type: data.employmentType ?? null,
    priority: data.priority,
    items: src.items ?? [],
    stages: src.stages ?? []
  }).select("id").single();
  if (error) throw new Error(error.message);
  return {
    ok: true,
    id: row.id
  };
});
const deleteChecklistPack_createServerFn_handler = createServerRpc({
  id: "9ebe00b9c5969f68c37f00a82accb9bd5968ade791ecc6c75b8f13a0bac36256",
  name: "deleteChecklistPack",
  filename: "src/lib/onboarding.functions.ts"
}, (opts) => deleteChecklistPack.__executeServer(opts));
const deleteChecklistPack = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(deleteChecklistPack_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const roles = await getRoles(supabase, userId);
  if (!roles.some((r) => ["org_admin", "super_admin"].includes(r))) throw new Error("Not authorized");
  const {
    data: row
  } = await supabase.from("onboarding_checklists").select("is_system_seed").eq("id", data.id).maybeSingle();
  if (row?.is_system_seed) throw new Error("Cannot delete a system seed pack. Clone it to override.");
  const {
    error
  } = await supabase.from("onboarding_checklists").delete().eq("id", data.id);
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
const upsertDefaultAssignmentRule_createServerFn_handler = createServerRpc({
  id: "0051aa2eb720efbb56396eed715debdb3345f3caddbbcd4209834c14d7d922d1",
  name: "upsertDefaultAssignmentRule",
  filename: "src/lib/onboarding.functions.ts"
}, (opts) => upsertDefaultAssignmentRule.__executeServer(opts));
const upsertDefaultAssignmentRule = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid().optional(),
  checklistId: stringType().uuid(),
  departmentId: stringType().uuid().nullable().optional(),
  jobTitle: stringType().max(120).nullable().optional(),
  dueOffsetDays: numberType().int().min(0).max(3650).default(30),
  isActive: booleanType().default(true)
}).parse(d)).handler(upsertDefaultAssignmentRule_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const roles = await getRoles(supabase, userId);
  if (!roles.some((r) => ["org_admin", "super_admin"].includes(r))) throw new Error("Not authorized");
  const {
    data: prof
  } = await supabase.from("profiles").select("tenant_id").eq("id", userId).maybeSingle();
  if (!prof?.tenant_id) throw new Error("No tenant");
  const payload = {
    tenant_id: prof.tenant_id,
    checklist_id: data.checklistId,
    department_id: data.departmentId ?? null,
    job_title: data.jobTitle?.trim() ? data.jobTitle.trim() : null,
    due_offset_days: data.dueOffsetDays,
    is_active: data.isActive,
    created_by: userId
  };
  if (data.id) {
    const {
      error: error2
    } = await supabase.from("onboarding_default_assignments").update(payload).eq("id", data.id);
    if (error2) throw new Error(error2.message);
    return {
      ok: true,
      id: data.id
    };
  }
  const {
    data: row,
    error
  } = await supabase.from("onboarding_default_assignments").insert(payload).select("id").single();
  if (error) throw new Error(error.message);
  return {
    ok: true,
    id: row.id
  };
});
const deleteDefaultAssignmentRule_createServerFn_handler = createServerRpc({
  id: "6ecb35027c349ab7121b45b725e22704ef526aa3cfa263f6f0e1a0e8c7ac1503",
  name: "deleteDefaultAssignmentRule",
  filename: "src/lib/onboarding.functions.ts"
}, (opts) => deleteDefaultAssignmentRule.__executeServer(opts));
const deleteDefaultAssignmentRule = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(deleteDefaultAssignmentRule_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const roles = await getRoles(supabase, userId);
  if (!roles.some((r) => ["org_admin", "super_admin"].includes(r))) throw new Error("Not authorized");
  const {
    error
  } = await supabase.from("onboarding_default_assignments").delete().eq("id", data.id);
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
const toggleChecklistItem_createServerFn_handler = createServerRpc({
  id: "42aef7d28880e099d10f61d9168e115b47b594da7ae6043d8df650642b91d6c4",
  name: "toggleChecklistItem",
  filename: "src/lib/onboarding.functions.ts"
}, (opts) => toggleChecklistItem.__executeServer(opts));
const toggleChecklistItem = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  employeeId: stringType().uuid(),
  checklistId: stringType().uuid(),
  itemKey: stringType().min(1).max(60),
  done: booleanType()
}).parse(d)).handler(toggleChecklistItem_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const {
    data: emp
  } = await supabase.from("employees").select("tenant_id,user_id").eq("id", data.employeeId).maybeSingle();
  if (!emp) throw new Error("Employee not found");
  if (data.done) {
    const roles = await getRoles(supabase, userId);
    const privileged = roles.some((r) => ["manager", "org_admin", "super_admin"].includes(r));
    if (!privileged) {
      const {
        data: cl
      } = await supabase.from("onboarding_checklists").select("items,stages").eq("id", data.checklistId).maybeSingle();
      if (cl) {
        const items = cl.items ?? [];
        const stages = cl.stages ?? [];
        const item = items.find((it) => it.key === data.itemKey);
        if (item && stages.length > 0) {
          const {
            computeUnlockedStages,
            STAGE_NONE_KEY
          } = await import("./onboarding-stage-rules-Bl9JZfw6.mjs");
          const {
            data: progRows
          } = await supabase.from("onboarding_progress").select("checklist_id,item_key,approval_status").eq("employee_id", data.employeeId).eq("checklist_id", data.checklistId);
          const unlocked = computeUnlockedStages(stages, items, progRows ?? [], data.checklistId);
          const stageKey = item.stage || STAGE_NONE_KEY;
          if (!unlocked.has(stageKey)) {
            throw new Error("Complete required items in earlier stages before starting this one.");
          }
        }
      }
    }
    const {
      error
    } = await supabase.from("onboarding_progress").upsert({
      tenant_id: emp.tenant_id,
      employee_id: data.employeeId,
      checklist_id: data.checklistId,
      item_key: data.itemKey,
      completed_by: userId,
      completed_at: (/* @__PURE__ */ new Date()).toISOString()
    }, {
      onConflict: "employee_id,checklist_id,item_key"
    });
    if (error) throw new Error(error.message);
  } else {
    const {
      error
    } = await supabase.from("onboarding_progress").delete().eq("employee_id", data.employeeId).eq("checklist_id", data.checklistId).eq("item_key", data.itemKey);
    if (error) throw new Error(error.message);
  }
  return {
    ok: true
  };
});
const recordEmployeeDocument_createServerFn_handler = createServerRpc({
  id: "c1d0684fdcb6dff96b25d6a6dbce1616f4bf56b23b188ef1e1371d36501bae8c",
  name: "recordEmployeeDocument",
  filename: "src/lib/onboarding.functions.ts"
}, (opts) => recordEmployeeDocument.__executeServer(opts));
const recordEmployeeDocument = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  employeeId: stringType().uuid(),
  filePath: stringType().min(1).max(500),
  fileName: stringType().min(1).max(255),
  mimeType: stringType().max(200).optional(),
  sizeBytes: numberType().int().min(0).optional(),
  docType: stringType().max(60).default("other"),
  visibility: enumType(["employee", "manager", "admin"]).default("employee"),
  notes: stringType().max(1e3).optional()
}).parse(d)).handler(recordEmployeeDocument_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const {
    data: emp
  } = await supabase.from("employees").select("tenant_id,user_id").eq("id", data.employeeId).maybeSingle();
  if (!emp) throw new Error("Employee not found");
  const isOwner = emp.user_id === userId;
  if (!isOwner) {
    const roles = await getRoles(supabase, userId);
    if (!roles.some((r) => ["org_admin", "super_admin"].includes(r))) throw new Error("Not authorized");
  } else if (data.visibility !== "employee") {
    throw new Error("Employees can only upload employee-visible files");
  }
  const {
    data: row,
    error
  } = await supabase.from("employee_documents").insert({
    tenant_id: emp.tenant_id,
    employee_id: data.employeeId,
    doc_type: data.docType,
    file_path: data.filePath,
    file_name: data.fileName,
    mime_type: data.mimeType ?? null,
    size_bytes: data.sizeBytes ?? null,
    uploaded_by: userId,
    visibility: data.visibility,
    notes: data.notes ?? null
  }).select("id").single();
  if (error) throw new Error(error.message);
  return {
    ok: true,
    id: row.id
  };
});
const getDocumentDownloadUrl_createServerFn_handler = createServerRpc({
  id: "65e3c7ab18fd36a5ca63b2a117a5fc81d25362706b3dd4c83f30d0e45e2ac0cc",
  name: "getDocumentDownloadUrl",
  filename: "src/lib/onboarding.functions.ts"
}, (opts) => getDocumentDownloadUrl.__executeServer(opts));
const getDocumentDownloadUrl = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  documentId: stringType().uuid()
}).parse(d)).handler(getDocumentDownloadUrl_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase
  } = context;
  const {
    data: doc,
    error
  } = await supabase.from("employee_documents").select("file_path,file_name").eq("id", data.documentId).maybeSingle();
  if (error || !doc) throw new Error("Not found or not authorized");
  const admin = await loadAdmin();
  const {
    data: signed,
    error: e2
  } = await admin.storage.from("employee-documents").createSignedUrl(doc.file_path, 60);
  if (e2 || !signed) throw new Error("Failed to sign URL");
  return {
    url: signed.signedUrl,
    fileName: doc.file_name
  };
});
const deleteEmployeeDocument_createServerFn_handler = createServerRpc({
  id: "2255fd918d512f265eebaef47e0d9f1718dec7539bc36fb4769991cf8b2ac50c",
  name: "deleteEmployeeDocument",
  filename: "src/lib/onboarding.functions.ts"
}, (opts) => deleteEmployeeDocument.__executeServer(opts));
const deleteEmployeeDocument = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  documentId: stringType().uuid()
}).parse(d)).handler(deleteEmployeeDocument_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase
  } = context;
  const {
    data: doc
  } = await supabase.from("employee_documents").select("file_path").eq("id", data.documentId).maybeSingle();
  if (!doc) throw new Error("Not found");
  const admin = await loadAdmin();
  await admin.storage.from("employee-documents").remove([doc.file_path]);
  const {
    error
  } = await supabase.from("employee_documents").delete().eq("id", data.documentId);
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
function isManagerOrAdmin(roles) {
  return roles.some((r) => ["manager", "org_admin", "super_admin"].includes(r));
}
const assignChecklist_createServerFn_handler = createServerRpc({
  id: "ac034b3b6be24b432fa868c4ded271d6d22e602c8b6de5a11b17d942f3080e90",
  name: "assignChecklist",
  filename: "src/lib/onboarding.functions.ts"
}, (opts) => assignChecklist.__executeServer(opts));
const assignChecklist = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  employeeId: stringType().uuid(),
  checklistId: stringType().uuid(),
  dueDate: stringType().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  notes: stringType().max(1e3).optional()
}).parse(d)).handler(assignChecklist_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const roles = await getRoles(supabase, userId);
  if (!isManagerOrAdmin(roles)) throw new Error("Not authorized");
  const {
    data: emp
  } = await supabase.from("employees").select("tenant_id").eq("id", data.employeeId).maybeSingle();
  if (!emp) throw new Error("Employee not found");
  const {
    data: row,
    error
  } = await supabase.from("onboarding_assignments").upsert({
    tenant_id: emp.tenant_id,
    employee_id: data.employeeId,
    checklist_id: data.checklistId,
    assigned_by: userId,
    due_date: data.dueDate ?? null,
    notes: data.notes ?? null,
    status: "in_progress"
  }, {
    onConflict: "employee_id,checklist_id"
  }).select("id").single();
  if (error) throw new Error(error.message);
  return {
    ok: true,
    id: row.id
  };
});
const applyDefaultAssignmentsForEmployee_createServerFn_handler = createServerRpc({
  id: "15088323b596cf506cc2d16b744107e84dd75b762c060a80390ff6106a386655",
  name: "applyDefaultAssignmentsForEmployee",
  filename: "src/lib/onboarding.functions.ts"
}, (opts) => applyDefaultAssignmentsForEmployee.__executeServer(opts));
const applyDefaultAssignmentsForEmployee = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  employeeId: stringType().uuid()
}).parse(d)).handler(applyDefaultAssignmentsForEmployee_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const roles = await getRoles(supabase, userId);
  if (!isManagerOrAdmin(roles)) throw new Error("Not authorized");
  const {
    data: emp
  } = await supabase.from("employees").select("id,tenant_id,department_id,job_title,hire_date").eq("id", data.employeeId).maybeSingle();
  if (!emp) throw new Error("Employee not found");
  const {
    data: rules
  } = await supabase.from("onboarding_default_assignments").select("checklist_id,department_id,job_title,due_offset_days,is_active").eq("tenant_id", emp.tenant_id).eq("is_active", true);
  const matching = (rules ?? []).filter((r) => {
    const deptOk = !r.department_id || r.department_id === emp.department_id;
    const titleOk = !r.job_title || emp.job_title && emp.job_title.trim().toLowerCase() === String(r.job_title).trim().toLowerCase();
    return deptOk && titleOk;
  });
  if (matching.length === 0) return {
    ok: true,
    assigned: 0
  };
  const hire = emp.hire_date ? new Date(emp.hire_date) : /* @__PURE__ */ new Date();
  const rows = matching.map((r) => {
    const due = new Date(hire);
    due.setDate(due.getDate() + (r.due_offset_days ?? 30));
    return {
      tenant_id: emp.tenant_id,
      employee_id: emp.id,
      checklist_id: r.checklist_id,
      assigned_by: userId,
      due_date: due.toISOString().slice(0, 10),
      status: "in_progress"
    };
  });
  const {
    error
  } = await supabase.from("onboarding_assignments").upsert(rows, {
    onConflict: "employee_id,checklist_id",
    ignoreDuplicates: true
  });
  if (error) throw new Error(error.message);
  return {
    ok: true,
    assigned: rows.length
  };
});
const updateAssignment_createServerFn_handler = createServerRpc({
  id: "08422225a8bb407c6dffa36d39534102be78a00020dff41651d439ddc6af1025",
  name: "updateAssignment",
  filename: "src/lib/onboarding.functions.ts"
}, (opts) => updateAssignment.__executeServer(opts));
const updateAssignment = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  assignmentId: stringType().uuid(),
  dueDate: stringType().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  status: enumType(["in_progress", "completed", "signed_off", "cancelled"]).optional(),
  notes: stringType().max(1e3).nullable().optional()
}).parse(d)).handler(updateAssignment_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const roles = await getRoles(supabase, userId);
  if (!isManagerOrAdmin(roles)) throw new Error("Not authorized");
  const patch = {};
  if (data.dueDate !== void 0) patch.due_date = data.dueDate;
  if (data.notes !== void 0) patch.notes = data.notes;
  if (data.status) {
    patch.status = data.status;
    if (data.status === "signed_off") {
      patch.signed_off_by = userId;
      patch.signed_off_at = (/* @__PURE__ */ new Date()).toISOString();
    }
  }
  const {
    error
  } = await supabase.from("onboarding_assignments").update(patch).eq("id", data.assignmentId);
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
const signOffAssignment_createServerFn_handler = createServerRpc({
  id: "00b97c0cf68f6a4a55208420634e8c84e782651beb7d885973bb54b50fde717c",
  name: "signOffAssignment",
  filename: "src/lib/onboarding.functions.ts"
}, (opts) => signOffAssignment.__executeServer(opts));
const signOffAssignment = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  assignmentId: stringType().uuid(),
  notes: stringType().max(1e3).optional()
}).parse(d)).handler(signOffAssignment_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const roles = await getRoles(supabase, userId);
  if (!isManagerOrAdmin(roles)) throw new Error("Not authorized");
  const {
    error
  } = await supabase.from("onboarding_assignments").update({
    status: "signed_off",
    signed_off_by: userId,
    signed_off_at: (/* @__PURE__ */ new Date()).toISOString(),
    notes: data.notes ?? null
  }).eq("id", data.assignmentId);
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
const removeAssignment_createServerFn_handler = createServerRpc({
  id: "d4b2b0f2091847739ef7bb57192d3ba3b38469fd3e243a77ee06e34b5510eff9",
  name: "removeAssignment",
  filename: "src/lib/onboarding.functions.ts"
}, (opts) => removeAssignment.__executeServer(opts));
const removeAssignment = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  assignmentId: stringType().uuid()
}).parse(d)).handler(removeAssignment_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const roles = await getRoles(supabase, userId);
  if (!isManagerOrAdmin(roles)) throw new Error("Not authorized");
  const {
    error
  } = await supabase.from("onboarding_assignments").delete().eq("id", data.assignmentId);
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
const reviewChecklistItem_createServerFn_handler = createServerRpc({
  id: "ff01829140524c7f2d1e8a014726aff5e3dc5bcea80bed4e3de2c2639589d23e",
  name: "reviewChecklistItem",
  filename: "src/lib/onboarding.functions.ts"
}, (opts) => reviewChecklistItem.__executeServer(opts));
const reviewChecklistItem = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  progressId: stringType().uuid(),
  decision: enumType(["approved", "rejected"]),
  notes: stringType().max(1e3).optional()
}).parse(d)).handler(reviewChecklistItem_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const roles = await getRoles(supabase, userId);
  if (!isManagerOrAdmin(roles)) throw new Error("Not authorized");
  const {
    error
  } = await supabase.from("onboarding_progress").update({
    approval_status: data.decision,
    approved_by: userId,
    approved_at: (/* @__PURE__ */ new Date()).toISOString(),
    approval_notes: data.notes ?? null
  }).eq("id", data.progressId);
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
const getMyOnboardingCompletion_createServerFn_handler = createServerRpc({
  id: "81d4d12082841f8e2533592ffbb61d1bbb95e3ceef5a4222b3700abf74555930",
  name: "getMyOnboardingCompletion",
  filename: "src/lib/onboarding.functions.ts"
}, (opts) => getMyOnboardingCompletion.__executeServer(opts));
const getMyOnboardingCompletion = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(getMyOnboardingCompletion_createServerFn_handler, async ({
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const {
    data: emp
  } = await supabase.from("employees").select("id").eq("user_id", userId).maybeSingle();
  if (!emp) return {
    hasOnboarding: false,
    complete: false
  };
  const {
    data: assignments
  } = await supabase.from("onboarding_assignments").select("checklist_id").eq("employee_id", emp.id).neq("status", "cancelled");
  const checklistIds = [...new Set((assignments ?? []).map((a) => a.checklist_id))];
  if (checklistIds.length === 0) return {
    hasOnboarding: false,
    complete: false
  };
  const [{
    data: checklists
  }, {
    data: progress
  }] = await Promise.all([supabase.from("onboarding_checklists").select("id,items").in("id", checklistIds), supabase.from("onboarding_progress").select("checklist_id,item_key,approval_status").eq("employee_id", emp.id)]);
  const {
    computeOnboardingCompletion
  } = await import("./onboarding-completion-CcGaa7A6.mjs");
  const result = computeOnboardingCompletion(checklists ?? [], progress ?? []);
  return {
    hasOnboarding: true,
    complete: result.complete
  };
});
export {
  applyDefaultAssignmentsForEmployee_createServerFn_handler,
  assignChecklist_createServerFn_handler,
  cloneChecklistPack_createServerFn_handler,
  deleteChecklistPack_createServerFn_handler,
  deleteDefaultAssignmentRule_createServerFn_handler,
  deleteEmployeeDocument_createServerFn_handler,
  getDocumentDownloadUrl_createServerFn_handler,
  getMyOnboardingCompletion_createServerFn_handler,
  listChecklistPacks_createServerFn_handler,
  recordEmployeeDocument_createServerFn_handler,
  removeAssignment_createServerFn_handler,
  reorderChecklistPacks_createServerFn_handler,
  reviewChecklistItem_createServerFn_handler,
  signOffAssignment_createServerFn_handler,
  toggleChecklistItem_createServerFn_handler,
  updateAssignment_createServerFn_handler,
  upsertChecklist_createServerFn_handler,
  upsertDefaultAssignmentRule_createServerFn_handler
};
