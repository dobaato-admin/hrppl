import { c as createSsrRpc } from "./createSsrRpc-CRedQJGY.mjs";
import { r as requireSupabaseAuth } from "./auth-guard-CkYFJuQL.mjs";
import { c as createServerFn } from "./server-BOi2EjMN.mjs";
import { a as objectType, z as stringType, D as arrayType, A as booleanType, C as numberType } from "../_libs/zod.mjs";
const listOnboardingTemplates = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("43476841b09e343dd276a37963532e8f066b8a4b0662fb502e5ca94beced3083"));
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
}).parse(d)).handler(createSsrRpc("07fc866ca55c9d921e768683213b6647119ac96217fd3c970c7f86ca314436c8"));
const cloneOnboardingTemplate = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid(),
  newName: stringType().min(1).max(120)
}).parse(d)).handler(createSsrRpc("2f985f4feb3b68a1053be752b24a15f3223f1fb6a54ad8335bc23dc05b01ce20"));
const deleteOnboardingTemplate = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(createSsrRpc("571217025d5f95336cd59f3356eea3ec2198059cf95eb42b396587273269152d"));
const applyOnboardingTemplate = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  template_id: stringType().uuid(),
  employee_id: stringType().uuid(),
  start_date: stringType().optional()
}).parse(d)).handler(createSsrRpc("31ddf37462261f054510b38ee34c343fdc2576017662e04343ec1aa89e8db2e2"));
const listTrainingBundles = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("a17f72ddba382d56216e5f20e2447dd4ebf93fb49cefacda3c10bdd974145c7a"));
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
}).parse(d)).handler(createSsrRpc("cf5157d6328101763891401db7d782cd1742911839b33ad88e4af4d669c04702"));
const deleteTrainingBundle = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(createSsrRpc("dd82ffc05cd1cd39cc51fff53b2415dd039832ab165777c31a4a493734b75a71"));
const applyTrainingBundle = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  bundle_id: stringType().uuid(),
  employee_ids: arrayType(stringType().uuid()).min(1).max(500),
  start_date: stringType().optional()
}).parse(d)).handler(createSsrRpc("7cff8704d8667f91578ae0cc72a6d9dbdb928826e72a6b09d40ea374ea555d54"));
const listDocumentRequestTemplates = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("05ac68bc4d1f0200dfbdebe98ef3a0e3e231b07d6adec2e806fc529024dca509"));
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
}).parse(d)).handler(createSsrRpc("ba8611670083a706962b6327949cdee079c2056c2d136615e0d83e186eadfbc6"));
const deleteDocumentRequestTemplate = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(createSsrRpc("5fe07b44e3b68ad946266233247b232799e8f4d337c6cf8594062308b833bf40"));
const listActiveEmployees = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("24fc6c6b8acfc652aa8858a86241738f2a7402258cf7942041aa5df7ca8f225a"));
export {
  applyOnboardingTemplate as a,
  listActiveEmployees as b,
  cloneOnboardingTemplate as c,
  deleteOnboardingTemplate as d,
  listTrainingBundles as e,
  upsertTrainingBundle as f,
  deleteTrainingBundle as g,
  applyTrainingBundle as h,
  listDocumentRequestTemplates as i,
  upsertDocumentRequestTemplate as j,
  deleteDocumentRequestTemplate as k,
  listOnboardingTemplates as l,
  upsertOnboardingTemplate as u
};
