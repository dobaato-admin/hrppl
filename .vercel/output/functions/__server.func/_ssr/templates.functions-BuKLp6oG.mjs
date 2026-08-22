import { c as createServerRpc } from "./createServerRpc-CbJDFEP-.mjs";
import { r as requireSupabaseAuth } from "./auth-guard-CkYFJuQL.mjs";
import { c as createServerFn } from "./server-BOi2EjMN.mjs";
import "../_libs/seroval.mjs";
import "../_libs/react.mjs";
import { a as objectType, C as numberType, A as booleanType, z as stringType, D as arrayType } from "../_libs/zod.mjs";
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
async function getTenant(supabase, userId) {
  const {
    data
  } = await supabase.from("profiles").select("tenant_id").eq("id", userId).maybeSingle();
  if (!data?.tenant_id) throw new Error("No tenant");
  return data.tenant_id;
}
async function assertAdmin(supabase, userId) {
  const {
    data
  } = await supabase.from("user_roles").select("role").eq("user_id", userId);
  const roles = (data ?? []).map((r) => r.role);
  if (!roles.some((r) => ["org_admin", "hr", "super_admin"].includes(r))) {
    throw new Error("Not authorized");
  }
}
const listOnboardingTemplates_createServerFn_handler = createServerRpc({
  id: "43476841b09e343dd276a37963532e8f066b8a4b0662fb502e5ca94beced3083",
  name: "listOnboardingTemplates",
  filename: "src/lib/templates.functions.ts"
}, (opts) => listOnboardingTemplates.__executeServer(opts));
const listOnboardingTemplates = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).handler(listOnboardingTemplates_createServerFn_handler, async ({
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  await assertAdmin(supabase, userId);
  const tenant_id = await getTenant(supabase, userId);
  const [tpls, items, courses] = await Promise.all([supabase.from("onboarding_checklist_templates").select("*").eq("tenant_id", tenant_id).order("created_at", {
    ascending: false
  }), supabase.from("onboarding_checklist_template_items").select("*").eq("tenant_id", tenant_id).order("sort_order"), supabase.from("onboarding_checklist_template_courses").select("*").eq("tenant_id", tenant_id).order("sort_order")]);
  return {
    templates: tpls.data ?? [],
    items: items.data ?? [],
    courses: courses.data ?? []
  };
});
const onbTplItem = objectType({
  id: stringType().uuid().optional(),
  title: stringType().min(1).max(200),
  description: stringType().max(2e3).optional().nullable(),
  category: stringType().max(40).default("general"),
  owner_role: stringType().max(40).default("employee"),
  due_offset_days: numberType().int().min(-30).max(365).default(0),
  required: booleanType().default(true),
  sort_order: numberType().int().min(0).max(999).default(0)
});
const onbTplCourse = objectType({
  course_id: stringType().uuid(),
  due_offset_days: numberType().int().min(0).max(365).default(14),
  required: booleanType().default(true),
  sort_order: numberType().int().min(0).max(999).default(0)
});
const upsertOnboardingTemplate_createServerFn_handler = createServerRpc({
  id: "07fc866ca55c9d921e768683213b6647119ac96217fd3c970c7f86ca314436c8",
  name: "upsertOnboardingTemplate",
  filename: "src/lib/templates.functions.ts"
}, (opts) => upsertOnboardingTemplate.__executeServer(opts));
const upsertOnboardingTemplate = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid().optional(),
  name: stringType().min(1).max(120),
  description: stringType().max(2e3).optional().nullable(),
  department_id: stringType().uuid().optional().nullable(),
  role_target: stringType().max(60).optional().nullable(),
  is_default: booleanType().default(false),
  is_active: booleanType().default(true),
  items: arrayType(onbTplItem).max(100).default([]),
  courses: arrayType(onbTplCourse).max(50).default([])
}).parse(d)).handler(upsertOnboardingTemplate_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  await assertAdmin(supabase, userId);
  const tenant_id = await getTenant(supabase, userId);
  const base = {
    tenant_id,
    name: data.name,
    description: data.description ?? null,
    department_id: data.department_id ?? null,
    role_target: data.role_target ?? null,
    is_default: data.is_default,
    is_active: data.is_active,
    created_by: userId
  };
  let id = data.id;
  if (id) {
    const {
      error
    } = await supabase.from("onboarding_checklist_templates").update(base).eq("id", id).eq("tenant_id", tenant_id);
    if (error) throw error;
  } else {
    const {
      data: created,
      error
    } = await supabase.from("onboarding_checklist_templates").insert(base).select("id").single();
    if (error) throw error;
    id = created.id;
  }
  await supabase.from("onboarding_checklist_template_items").delete().eq("template_id", id);
  if (data.items.length) {
    const {
      error
    } = await supabase.from("onboarding_checklist_template_items").insert(data.items.map((i, idx) => ({
      ...i,
      id: void 0,
      template_id: id,
      tenant_id,
      sort_order: i.sort_order ?? idx
    })));
    if (error) throw error;
  }
  await supabase.from("onboarding_checklist_template_courses").delete().eq("template_id", id);
  if (data.courses.length) {
    const {
      error
    } = await supabase.from("onboarding_checklist_template_courses").insert(data.courses.map((c, idx) => ({
      ...c,
      template_id: id,
      tenant_id,
      sort_order: c.sort_order ?? idx
    })));
    if (error) throw error;
  }
  return {
    id
  };
});
const cloneOnboardingTemplate_createServerFn_handler = createServerRpc({
  id: "2f985f4feb3b68a1053be752b24a15f3223f1fb6a54ad8335bc23dc05b01ce20",
  name: "cloneOnboardingTemplate",
  filename: "src/lib/templates.functions.ts"
}, (opts) => cloneOnboardingTemplate.__executeServer(opts));
const cloneOnboardingTemplate = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid(),
  newName: stringType().min(1).max(120)
}).parse(d)).handler(cloneOnboardingTemplate_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  await assertAdmin(supabase, userId);
  const tenant_id = await getTenant(supabase, userId);
  const {
    data: src
  } = await supabase.from("onboarding_checklist_templates").select("*").eq("id", data.id).eq("tenant_id", tenant_id).maybeSingle();
  if (!src) throw new Error("Template not found");
  const {
    data: created,
    error
  } = await supabase.from("onboarding_checklist_templates").insert({
    tenant_id,
    name: data.newName,
    description: src.description,
    department_id: src.department_id,
    role_target: src.role_target,
    is_default: false,
    is_active: true,
    created_by: userId
  }).select("id").single();
  if (error) throw error;
  const newId = created.id;
  const {
    data: items
  } = await supabase.from("onboarding_checklist_template_items").select("*").eq("template_id", data.id);
  if (items?.length) {
    await supabase.from("onboarding_checklist_template_items").insert(items.map((i) => ({
      template_id: newId,
      tenant_id,
      title: i.title,
      description: i.description,
      category: i.category,
      owner_role: i.owner_role,
      due_offset_days: i.due_offset_days,
      required: i.required,
      sort_order: i.sort_order
    })));
  }
  const {
    data: courses
  } = await supabase.from("onboarding_checklist_template_courses").select("*").eq("template_id", data.id);
  if (courses?.length) {
    await supabase.from("onboarding_checklist_template_courses").insert(courses.map((c) => ({
      template_id: newId,
      tenant_id,
      course_id: c.course_id,
      due_offset_days: c.due_offset_days,
      required: c.required,
      sort_order: c.sort_order
    })));
  }
  return {
    id: newId
  };
});
const deleteOnboardingTemplate_createServerFn_handler = createServerRpc({
  id: "571217025d5f95336cd59f3356eea3ec2198059cf95eb42b396587273269152d",
  name: "deleteOnboardingTemplate",
  filename: "src/lib/templates.functions.ts"
}, (opts) => deleteOnboardingTemplate.__executeServer(opts));
const deleteOnboardingTemplate = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(deleteOnboardingTemplate_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  await assertAdmin(supabase, userId);
  const tenant_id = await getTenant(supabase, userId);
  const {
    error
  } = await supabase.from("onboarding_checklist_templates").delete().eq("id", data.id).eq("tenant_id", tenant_id);
  if (error) throw error;
  return {
    ok: true
  };
});
const applyOnboardingTemplate_createServerFn_handler = createServerRpc({
  id: "31ddf37462261f054510b38ee34c343fdc2576017662e04343ec1aa89e8db2e2",
  name: "applyOnboardingTemplate",
  filename: "src/lib/templates.functions.ts"
}, (opts) => applyOnboardingTemplate.__executeServer(opts));
const applyOnboardingTemplate = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  template_id: stringType().uuid(),
  employee_id: stringType().uuid(),
  start_date: stringType().optional()
}).parse(d)).handler(applyOnboardingTemplate_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  await assertAdmin(supabase, userId);
  const tenant_id = await getTenant(supabase, userId);
  const start = data.start_date ? new Date(data.start_date) : /* @__PURE__ */ new Date();
  const {
    data: tpl
  } = await supabase.from("onboarding_checklist_templates").select("*").eq("id", data.template_id).eq("tenant_id", tenant_id).maybeSingle();
  if (!tpl) throw new Error("Template not found");
  const {
    data: items
  } = await supabase.from("onboarding_checklist_template_items").select("*").eq("template_id", data.template_id).order("sort_order");
  const {
    data: courses
  } = await supabase.from("onboarding_checklist_template_courses").select("*").eq("template_id", data.template_id).order("sort_order");
  const checklistItems = (items ?? []).map((i) => ({
    key: i.id,
    label: i.title,
    description: i.description,
    category: i.category,
    owner_role: i.owner_role,
    due_offset_days: i.due_offset_days,
    required: i.required,
    sort_order: i.sort_order
  }));
  const {
    data: cl,
    error: clErr
  } = await supabase.from("onboarding_checklists").insert({
    tenant_id,
    name: `${tpl.name} — ${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}`,
    items: checklistItems,
    is_default: false
  }).select("id").single();
  if (clErr) throw clErr;
  const maxOffset = Math.max(0, ...checklistItems.map((i) => Number(i.due_offset_days) || 0));
  const due = new Date(start.getTime() + maxOffset * 864e5).toISOString().slice(0, 10);
  const {
    data: assign,
    error: aErr
  } = await supabase.from("onboarding_assignments").upsert({
    tenant_id,
    employee_id: data.employee_id,
    checklist_id: cl.id,
    assigned_by: userId,
    due_date: due,
    status: "in_progress"
  }, {
    onConflict: "employee_id,checklist_id"
  }).select("id").single();
  if (aErr) throw aErr;
  let enrolled = 0;
  if (courses?.length) {
    const rows = courses.map((c) => ({
      tenant_id,
      course_id: c.course_id,
      employee_id: data.employee_id,
      due_date: new Date(start.getTime() + (c.due_offset_days ?? 14) * 864e5).toISOString().slice(0, 10),
      status: "assigned",
      assigned_by: userId
    }));
    const {
      error: eErr
    } = await supabase.from("training_enrollments").upsert(rows, {
      onConflict: "course_id,employee_id",
      ignoreDuplicates: true
    });
    if (!eErr) enrolled = rows.length;
  }
  return {
    assignment_id: assign.id,
    checklist_id: cl.id,
    enrolled
  };
});
const listTrainingBundles_createServerFn_handler = createServerRpc({
  id: "a17f72ddba382d56216e5f20e2447dd4ebf93fb49cefacda3c10bdd974145c7a",
  name: "listTrainingBundles",
  filename: "src/lib/templates.functions.ts"
}, (opts) => listTrainingBundles.__executeServer(opts));
const listTrainingBundles = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).handler(listTrainingBundles_createServerFn_handler, async ({
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  await assertAdmin(supabase, userId);
  const tenant_id = await getTenant(supabase, userId);
  const [bundles, items, courses] = await Promise.all([supabase.from("training_bundles").select("*").eq("tenant_id", tenant_id).order("created_at", {
    ascending: false
  }), supabase.from("training_bundle_items").select("*").eq("tenant_id", tenant_id).order("sort_order"), supabase.from("training_courses").select("id,title,is_active").eq("tenant_id", tenant_id)]);
  return {
    bundles: bundles.data ?? [],
    items: items.data ?? [],
    courses: courses.data ?? []
  };
});
const upsertTrainingBundle_createServerFn_handler = createServerRpc({
  id: "cf5157d6328101763891401db7d782cd1742911839b33ad88e4af4d669c04702",
  name: "upsertTrainingBundle",
  filename: "src/lib/templates.functions.ts"
}, (opts) => upsertTrainingBundle.__executeServer(opts));
const upsertTrainingBundle = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid().optional(),
  name: stringType().min(1).max(120),
  description: stringType().max(2e3).optional().nullable(),
  target_role: stringType().max(60).optional().nullable(),
  is_active: booleanType().default(true),
  items: arrayType(objectType({
    course_id: stringType().uuid(),
    due_offset_days: numberType().int().min(0).max(365).default(14),
    required: booleanType().default(true),
    sort_order: numberType().int().min(0).max(999).default(0)
  })).max(50).default([])
}).parse(d)).handler(upsertTrainingBundle_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  await assertAdmin(supabase, userId);
  const tenant_id = await getTenant(supabase, userId);
  const base = {
    tenant_id,
    name: data.name,
    description: data.description ?? null,
    target_role: data.target_role ?? null,
    is_active: data.is_active,
    created_by: userId
  };
  let id = data.id;
  if (id) {
    const {
      error
    } = await supabase.from("training_bundles").update(base).eq("id", id).eq("tenant_id", tenant_id);
    if (error) throw error;
  } else {
    const {
      data: created,
      error
    } = await supabase.from("training_bundles").insert(base).select("id").single();
    if (error) throw error;
    id = created.id;
  }
  await supabase.from("training_bundle_items").delete().eq("bundle_id", id);
  if (data.items.length) {
    const {
      error
    } = await supabase.from("training_bundle_items").insert(data.items.map((i, idx) => ({
      ...i,
      bundle_id: id,
      tenant_id,
      sort_order: i.sort_order ?? idx
    })));
    if (error) throw error;
  }
  return {
    id
  };
});
const deleteTrainingBundle_createServerFn_handler = createServerRpc({
  id: "dd82ffc05cd1cd39cc51fff53b2415dd039832ab165777c31a4a493734b75a71",
  name: "deleteTrainingBundle",
  filename: "src/lib/templates.functions.ts"
}, (opts) => deleteTrainingBundle.__executeServer(opts));
const deleteTrainingBundle = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(deleteTrainingBundle_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  await assertAdmin(supabase, userId);
  const tenant_id = await getTenant(supabase, userId);
  const {
    error
  } = await supabase.from("training_bundles").delete().eq("id", data.id).eq("tenant_id", tenant_id);
  if (error) throw error;
  return {
    ok: true
  };
});
const applyTrainingBundle_createServerFn_handler = createServerRpc({
  id: "7cff8704d8667f91578ae0cc72a6d9dbdb928826e72a6b09d40ea374ea555d54",
  name: "applyTrainingBundle",
  filename: "src/lib/templates.functions.ts"
}, (opts) => applyTrainingBundle.__executeServer(opts));
const applyTrainingBundle = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  bundle_id: stringType().uuid(),
  employee_ids: arrayType(stringType().uuid()).min(1).max(500),
  start_date: stringType().optional()
}).parse(d)).handler(applyTrainingBundle_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  await assertAdmin(supabase, userId);
  const tenant_id = await getTenant(supabase, userId);
  const start = data.start_date ? new Date(data.start_date) : /* @__PURE__ */ new Date();
  const {
    data: items
  } = await supabase.from("training_bundle_items").select("*").eq("bundle_id", data.bundle_id).eq("tenant_id", tenant_id);
  if (!items?.length) return {
    enrolled: 0
  };
  const rows = [];
  for (const emp of data.employee_ids) {
    for (const it of items) {
      rows.push({
        tenant_id,
        course_id: it.course_id,
        employee_id: emp,
        due_date: new Date(start.getTime() + (it.due_offset_days ?? 14) * 864e5).toISOString().slice(0, 10),
        status: "assigned",
        assigned_by: userId
      });
    }
  }
  const {
    error
  } = await supabase.from("training_enrollments").upsert(rows, {
    onConflict: "course_id,employee_id",
    ignoreDuplicates: true
  });
  if (error) throw error;
  return {
    enrolled: rows.length
  };
});
const listDocumentRequestTemplates_createServerFn_handler = createServerRpc({
  id: "05ac68bc4d1f0200dfbdebe98ef3a0e3e231b07d6adec2e806fc529024dca509",
  name: "listDocumentRequestTemplates",
  filename: "src/lib/templates.functions.ts"
}, (opts) => listDocumentRequestTemplates.__executeServer(opts));
const listDocumentRequestTemplates = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).handler(listDocumentRequestTemplates_createServerFn_handler, async ({
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  await assertAdmin(supabase, userId);
  const tenant_id = await getTenant(supabase, userId);
  const [tpls, items, docTpls] = await Promise.all([supabase.from("document_request_templates").select("*").eq("tenant_id", tenant_id).order("created_at", {
    ascending: false
  }), supabase.from("document_request_template_items").select("*").eq("tenant_id", tenant_id).order("sort_order"), supabase.from("document_templates").select("id,name,doc_type,status").eq("tenant_id", tenant_id)]);
  return {
    templates: tpls.data ?? [],
    items: items.data ?? [],
    documentTemplates: docTpls.data ?? []
  };
});
const upsertDocumentRequestTemplate_createServerFn_handler = createServerRpc({
  id: "ba8611670083a706962b6327949cdee079c2056c2d136615e0d83e186eadfbc6",
  name: "upsertDocumentRequestTemplate",
  filename: "src/lib/templates.functions.ts"
}, (opts) => upsertDocumentRequestTemplate.__executeServer(opts));
const upsertDocumentRequestTemplate = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid().optional(),
  name: stringType().min(1).max(120),
  description: stringType().max(2e3).optional().nullable(),
  trigger: stringType().max(40).optional().nullable(),
  is_active: booleanType().default(true),
  items: arrayType(objectType({
    document_template_id: stringType().uuid(),
    required_signature: booleanType().default(true),
    due_offset_days: numberType().int().min(0).max(365).default(7),
    sort_order: numberType().int().min(0).max(999).default(0)
  })).max(50).default([])
}).parse(d)).handler(upsertDocumentRequestTemplate_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  await assertAdmin(supabase, userId);
  const tenant_id = await getTenant(supabase, userId);
  const base = {
    tenant_id,
    name: data.name,
    description: data.description ?? null,
    trigger: data.trigger ?? null,
    is_active: data.is_active,
    created_by: userId
  };
  let id = data.id;
  if (id) {
    const {
      error
    } = await supabase.from("document_request_templates").update(base).eq("id", id).eq("tenant_id", tenant_id);
    if (error) throw error;
  } else {
    const {
      data: created,
      error
    } = await supabase.from("document_request_templates").insert(base).select("id").single();
    if (error) throw error;
    id = created.id;
  }
  await supabase.from("document_request_template_items").delete().eq("template_id", id);
  if (data.items.length) {
    const {
      error
    } = await supabase.from("document_request_template_items").insert(data.items.map((i, idx) => ({
      ...i,
      template_id: id,
      tenant_id,
      sort_order: i.sort_order ?? idx
    })));
    if (error) throw error;
  }
  return {
    id
  };
});
const deleteDocumentRequestTemplate_createServerFn_handler = createServerRpc({
  id: "5fe07b44e3b68ad946266233247b232799e8f4d337c6cf8594062308b833bf40",
  name: "deleteDocumentRequestTemplate",
  filename: "src/lib/templates.functions.ts"
}, (opts) => deleteDocumentRequestTemplate.__executeServer(opts));
const deleteDocumentRequestTemplate = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(deleteDocumentRequestTemplate_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  await assertAdmin(supabase, userId);
  const tenant_id = await getTenant(supabase, userId);
  const {
    error
  } = await supabase.from("document_request_templates").delete().eq("id", data.id).eq("tenant_id", tenant_id);
  if (error) throw error;
  return {
    ok: true
  };
});
const listActiveEmployees_createServerFn_handler = createServerRpc({
  id: "24fc6c6b8acfc652aa8858a86241738f2a7402258cf7942041aa5df7ca8f225a",
  name: "listActiveEmployees",
  filename: "src/lib/templates.functions.ts"
}, (opts) => listActiveEmployees.__executeServer(opts));
const listActiveEmployees = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).handler(listActiveEmployees_createServerFn_handler, async ({
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  await assertAdmin(supabase, userId);
  const tenant_id = await getTenant(supabase, userId);
  const {
    data
  } = await supabase.from("employees").select("id, first_name, last_name, email, department_id").eq("tenant_id", tenant_id).eq("status", "active").order("first_name");
  return {
    employees: data ?? []
  };
});
export {
  applyOnboardingTemplate_createServerFn_handler,
  applyTrainingBundle_createServerFn_handler,
  cloneOnboardingTemplate_createServerFn_handler,
  deleteDocumentRequestTemplate_createServerFn_handler,
  deleteOnboardingTemplate_createServerFn_handler,
  deleteTrainingBundle_createServerFn_handler,
  listActiveEmployees_createServerFn_handler,
  listDocumentRequestTemplates_createServerFn_handler,
  listOnboardingTemplates_createServerFn_handler,
  listTrainingBundles_createServerFn_handler,
  upsertDocumentRequestTemplate_createServerFn_handler,
  upsertOnboardingTemplate_createServerFn_handler,
  upsertTrainingBundle_createServerFn_handler
};
