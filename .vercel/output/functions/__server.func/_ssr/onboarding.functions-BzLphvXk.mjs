import { c as createSsrRpc } from "./createSsrRpc-CRedQJGY.mjs";
import { r as requireSupabaseAuth } from "./auth-guard-CkYFJuQL.mjs";
import { c as createServerFn } from "./server-BOi2EjMN.mjs";
import { a as objectType, A as booleanType, z as stringType, B as enumType, C as numberType, D as arrayType } from "../_libs/zod.mjs";
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
}).parse(d)).handler(createSsrRpc("fdf53032c638e6fe525c2cd96c854a8485edc65a2bb729421a7e142feae6e5f2"));
const listChecklistPacks = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("894f5aab2ebc8cf74eac8b7c322d435b8288268b2074db4ffe232d4d7780f335"));
const reorderChecklistPacks = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  ordered: arrayType(objectType({
    id: stringType().uuid(),
    priority: numberType().int().min(0).max(9999)
  })).min(1).max(200)
}).parse(d)).handler(createSsrRpc("b3a57f2f97a98187a78628d161dd48a5ec8b855082504ebdc9d7fcb1d85fd7e8"));
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
}).parse(d)).handler(createSsrRpc("68beafaf06ed9a79eb3321da003354c0c9cb3887d082f3d57a6133a988ac656b"));
const deleteChecklistPack = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(createSsrRpc("9ebe00b9c5969f68c37f00a82accb9bd5968ade791ecc6c75b8f13a0bac36256"));
const upsertDefaultAssignmentRule = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid().optional(),
  checklistId: stringType().uuid(),
  departmentId: stringType().uuid().nullable().optional(),
  jobTitle: stringType().max(120).nullable().optional(),
  dueOffsetDays: numberType().int().min(0).max(3650).default(30),
  isActive: booleanType().default(true)
}).parse(d)).handler(createSsrRpc("0051aa2eb720efbb56396eed715debdb3345f3caddbbcd4209834c14d7d922d1"));
const deleteDefaultAssignmentRule = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(createSsrRpc("6ecb35027c349ab7121b45b725e22704ef526aa3cfa263f6f0e1a0e8c7ac1503"));
const toggleChecklistItem = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  employeeId: stringType().uuid(),
  checklistId: stringType().uuid(),
  itemKey: stringType().min(1).max(60),
  done: booleanType()
}).parse(d)).handler(createSsrRpc("42aef7d28880e099d10f61d9168e115b47b594da7ae6043d8df650642b91d6c4"));
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
}).parse(d)).handler(createSsrRpc("c1d0684fdcb6dff96b25d6a6dbce1616f4bf56b23b188ef1e1371d36501bae8c"));
const getDocumentDownloadUrl = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  documentId: stringType().uuid()
}).parse(d)).handler(createSsrRpc("65e3c7ab18fd36a5ca63b2a117a5fc81d25362706b3dd4c83f30d0e45e2ac0cc"));
const deleteEmployeeDocument = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  documentId: stringType().uuid()
}).parse(d)).handler(createSsrRpc("2255fd918d512f265eebaef47e0d9f1718dec7539bc36fb4769991cf8b2ac50c"));
const assignChecklist = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  employeeId: stringType().uuid(),
  checklistId: stringType().uuid(),
  dueDate: stringType().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  notes: stringType().max(1e3).optional()
}).parse(d)).handler(createSsrRpc("ac034b3b6be24b432fa868c4ded271d6d22e602c8b6de5a11b17d942f3080e90"));
const applyDefaultAssignmentsForEmployee = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  employeeId: stringType().uuid()
}).parse(d)).handler(createSsrRpc("15088323b596cf506cc2d16b744107e84dd75b762c060a80390ff6106a386655"));
const updateAssignment = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  assignmentId: stringType().uuid(),
  dueDate: stringType().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  status: enumType(["in_progress", "completed", "signed_off", "cancelled"]).optional(),
  notes: stringType().max(1e3).nullable().optional()
}).parse(d)).handler(createSsrRpc("08422225a8bb407c6dffa36d39534102be78a00020dff41651d439ddc6af1025"));
const signOffAssignment = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  assignmentId: stringType().uuid(),
  notes: stringType().max(1e3).optional()
}).parse(d)).handler(createSsrRpc("00b97c0cf68f6a4a55208420634e8c84e782651beb7d885973bb54b50fde717c"));
const removeAssignment = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  assignmentId: stringType().uuid()
}).parse(d)).handler(createSsrRpc("d4b2b0f2091847739ef7bb57192d3ba3b38469fd3e243a77ee06e34b5510eff9"));
const reviewChecklistItem = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  progressId: stringType().uuid(),
  decision: enumType(["approved", "rejected"]),
  notes: stringType().max(1e3).optional()
}).parse(d)).handler(createSsrRpc("ff01829140524c7f2d1e8a014726aff5e3dc5bcea80bed4e3de2c2639589d23e"));
const getMyOnboardingCompletion = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("81d4d12082841f8e2533592ffbb61d1bbb95e3ceef5a4222b3700abf74555930"));
export {
  getDocumentDownloadUrl as a,
  applyDefaultAssignmentsForEmployee as b,
  cloneChecklistPack as c,
  deleteEmployeeDocument as d,
  deleteChecklistPack as e,
  reorderChecklistPacks as f,
  getMyOnboardingCompletion as g,
  assignChecklist as h,
  updateAssignment as i,
  removeAssignment as j,
  reviewChecklistItem as k,
  listChecklistPacks as l,
  upsertDefaultAssignmentRule as m,
  deleteDefaultAssignmentRule as n,
  recordEmployeeDocument as r,
  signOffAssignment as s,
  toggleChecklistItem as t,
  upsertChecklist as u
};
