import { c as createSsrRpc } from "./createSsrRpc-CRedQJGY.mjs";
import { r as requireSupabaseAuth } from "./auth-guard-CkYFJuQL.mjs";
import { c as createServerFn } from "./server-BOi2EjMN.mjs";
import { a as objectType, z as stringType, A as booleanType, B as enumType, C as numberType } from "../_libs/zod.mjs";
const listOffboarding = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("2958288976e42aa638dc71f0a39064337637c77d0e83bddf9f078c7003c0ff3a"));
const createOffboarding = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  employeeId: stringType().uuid(),
  reason: enumType(["resignation", "termination", "redundancy", "retirement", "end_of_contract", "mutual_separation", "death", "other"]).default("resignation"),
  reasonNotes: stringType().max(2e3).optional(),
  noticeGivenOn: stringType().optional(),
  lastWorkingDay: stringType().optional(),
  confidential: booleanType().default(false)
}).parse(d)).handler(createSsrRpc("ea31b6d6547080465b8d4a5fe80d1265e1795f3d91b8492b144a2ea913da862a"));
const getOffboarding = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(createSsrRpc("a66847756ee769ed40f256447ce180f86e8081880fadec25fd215df17d53c81e"));
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
}).parse(d)).handler(createSsrRpc("7ed3818e1b3fa2e8dd999e0df0b68a0d1d4e3dbb5669f488d4f8107dc6cc9ef7"));
const toggleChecklistItem = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  itemId: stringType().uuid(),
  completed: booleanType(),
  notes: stringType().max(1e3).optional()
}).parse(d)).handler(createSsrRpc("6ef710c8dc517340ce30d61836fe1d52f10fd7967df54f4e0fb6d7cf4820f654"));
const addChecklistItem = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  caseId: stringType().uuid(),
  title: stringType().min(1).max(255),
  category: stringType().max(40).default("general"),
  ownerRole: enumType(["hr", "manager", "employee", "it", "finance"]).default("hr"),
  dueDate: stringType().optional(),
  isBlocking: booleanType().default(false)
}).parse(d)).handler(createSsrRpc("92f61154d5767c93cfe0db5c4a817b51f9484ed0e5d2619e807ae580bc477a71"));
const myOffboarding = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("4e034a4952a1d3e1c2e6c195e1c3a44f9c094cc73480e6feb565ef080349689d"));
const listOffboardingTemplates = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("d956351cece4e70ffc475713225e9b859605db557213c7ee812b9848a4117d84"));
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
}).parse(d)).handler(createSsrRpc("e6655661829253a0206e59f3e9d6010d2fe7cd4cfcbe64b83a902343c63bda3f"));
const deleteOffboardingTemplate = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(createSsrRpc("0ffbce3e4771e398d29c03574f822a9f3f8f06e7e6998b7a9865a943f7015c4b"));
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
}).parse(d)).handler(createSsrRpc("71ba11a19c38d1be47a2c78c0f4ac4bb3f4f9cd4db408acb71bdddd2010303ab"));
const deleteOffboardingTemplateItem = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(createSsrRpc("3fb78cb6d4d2bb14098129f1d958be77e0b0c1d5dabccb2bcde6b536d8ed7f7a"));
export {
  addChecklistItem as a,
  listOffboardingTemplates as b,
  createOffboarding as c,
  upsertOffboardingTemplate as d,
  deleteOffboardingTemplate as e,
  upsertOffboardingTemplateItem as f,
  getOffboarding as g,
  deleteOffboardingTemplateItem as h,
  listOffboarding as l,
  myOffboarding as m,
  toggleChecklistItem as t,
  updateOffboarding as u
};
