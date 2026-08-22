import { c as createSsrRpc } from "./createSsrRpc-CRedQJGY.mjs";
import { r as requireSupabaseAuth } from "./auth-guard-CkYFJuQL.mjs";
import { c as createServerFn } from "./server-BOi2EjMN.mjs";
import { a as objectType, z as stringType, B as enumType, A as booleanType, C as numberType, D as arrayType } from "../_libs/zod.mjs";
const DesignationSchema = objectType({
  id: stringType().uuid().optional(),
  title: stringType().min(1).max(120),
  code: stringType().max(40).optional().nullable(),
  grade: stringType().max(40).optional().nullable(),
  department_id: stringType().uuid().optional().nullable(),
  min_salary: numberType().nonnegative().optional().nullable(),
  max_salary: numberType().nonnegative().optional().nullable(),
  currency_code: stringType().max(3).optional().nullable(),
  description: stringType().max(1e3).optional().nullable(),
  is_active: booleanType().default(true)
});
const listDesignations = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("0cbdbd4d0a5f60c0ab6362f75d90f21231bd26e0f696acdbcc79835080e5e1d8"));
const upsertDesignation = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => DesignationSchema.parse(d)).handler(createSsrRpc("676f2683c7cdd2e7642ed4cf01b85da58b5c9c7cbd904aecbf24147789a4295e"));
const deleteDesignation = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(createSsrRpc("d062cf7b6d55e9d7cc7ccb1dd6530cd9e2d77b6417b2607c51ae5c671ece5ebc"));
const SeedPresetSchema = objectType({
  currency_code: stringType().min(3).max(3).default("USD"),
  department_id: stringType().uuid().optional().nullable(),
  designations: arrayType(objectType({
    title: stringType().min(1).max(120),
    grade: stringType().max(40).optional().nullable(),
    code: stringType().max(40).optional().nullable(),
    min_salary: numberType().nonnegative().optional().nullable(),
    max_salary: numberType().nonnegative().optional().nullable(),
    description: stringType().max(1e3).optional().nullable()
  })).min(1).max(50)
});
const seedDesignationPreset = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => SeedPresetSchema.parse(d)).handler(createSsrRpc("8b3a98be6db256140695576d620a272ac657e412b419627345a9f22518a36993"));
const PromotionSchema = objectType({
  employee_id: stringType().uuid(),
  to_designation_id: stringType().uuid().optional().nullable(),
  to_job_title: stringType().min(1).max(160),
  to_department_id: stringType().uuid().optional().nullable(),
  to_manager_id: stringType().uuid().optional().nullable(),
  to_grade: stringType().max(40).optional().nullable(),
  effective_date: stringType(),
  reason: stringType().max(1e3).optional().nullable()
});
const proposePromotion = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => PromotionSchema.parse(d)).handler(createSsrRpc("d7eb527e9a7a072a13b24eb93e3a78586c86ca52671028c7a9cc4e833aedf1d0"));
const listPromotions = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  scope: enumType(["mine", "team", "all"]).default("all"),
  status: stringType().optional()
}).parse(d)).handler(createSsrRpc("030df4639beacc16c4f915d56b0974a525ac5339e10b0dd5c66e787835e5245c"));
const decidePromotion = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid(),
  decision: enumType(["approved", "rejected", "cancelled"]),
  notes: stringType().max(1e3).optional().nullable(),
  apply_now: booleanType().default(false)
}).parse(d)).handler(createSsrRpc("eedd818ad7a8269a4b7c32cbfe68713905765b1dc9a7399bbed567ca023941a8"));
const PayRateSchema = objectType({
  employee_id: stringType().uuid(),
  to_amount: numberType().nonnegative(),
  currency_code: stringType().min(3).max(3),
  pay_frequency: stringType().max(20).default("monthly"),
  effective_date: stringType(),
  reason: enumType(["hire", "promotion", "annual_review", "market_adjustment", "correction", "other"]).default("other"),
  notes: stringType().max(1e3).optional().nullable(),
  promotion_id: stringType().uuid().optional().nullable()
});
const proposePayRate = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => PayRateSchema.parse(d)).handler(createSsrRpc("37b8240ff9154a0c473a86b84f694031f5361a927422ce203c31a2aeb089037b"));
const listPayRateChanges = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  scope: enumType(["mine", "all"]).default("all"),
  employee_id: stringType().uuid().optional(),
  status: stringType().optional()
}).parse(d)).handler(createSsrRpc("f6dd5083cf5b4bfd97543c8e96d000094ccd7b6488daf25b942a012964c333ce"));
const decidePayRate = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid(),
  decision: enumType(["approved", "rejected", "cancelled"]),
  notes: stringType().max(1e3).optional().nullable(),
  apply_now: booleanType().default(false)
}).parse(d)).handler(createSsrRpc("2cf2950ccb7fb5dbed89bb186b50103c6138ca80e104466c55093d7179ca2bf1"));
const listAppreciations = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  scope: enumType(["feed", "received", "sent"]).default("feed"),
  limit: numberType().int().min(1).max(100).default(50)
}).parse(d)).handler(createSsrRpc("0074b036524ba650fb345e382e72b03e175f39d56ddac0d95f5a29a230a3223d"));
const createAppreciation = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  to_employee_id: stringType().uuid(),
  message: stringType().min(2).max(1e3),
  emoji: stringType().max(8).optional().nullable(),
  value_tag: stringType().max(40).optional().nullable(),
  visibility: enumType(["public", "manager"]).default("public")
}).parse(d)).handler(createSsrRpc("ed39086562532ce601003e0fbf8507fd1c407d3aab50e1f3a806c3da563f5afd"));
const toggleAppreciationReaction = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  appreciation_id: stringType().uuid(),
  emoji: stringType().max(8).default("👏")
}).parse(d)).handler(createSsrRpc("6df4964c2b59d339639f05a04dc32ca5f010d0854e31db82761186e2d38c74b9"));
const AwardTypeSchema = objectType({
  id: stringType().uuid().optional(),
  name: stringType().min(1).max(120),
  description: stringType().max(1e3).optional().nullable(),
  icon: stringType().max(40).optional().nullable(),
  cadence: enumType(["monthly", "quarterly", "annual", "ad_hoc"]).default("monthly"),
  is_active: booleanType().default(true)
});
const listAwardTypes = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("caac7defbea870ac1f99338a153484e0827a8eecfdc28bebcd879e974b10f0a5"));
const upsertAwardType = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => AwardTypeSchema.parse(d)).handler(createSsrRpc("464d54df7bf62cea89ffa9f79a1064f38d2e0f1daa203fccc22e0524dfc38995"));
const CycleSchema = objectType({
  id: stringType().uuid().optional(),
  award_type_id: stringType().uuid(),
  title: stringType().min(1).max(160),
  period_start: stringType(),
  period_end: stringType(),
  nominations_close_at: stringType().optional().nullable(),
  status: enumType(["open", "nominated", "shortlisted", "awarded", "closed", "cancelled"]).default("open")
});
const listAwardCycles = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("cd4b3138d67c5cc43be53720a3721fccc3ead655c731ef3ecf03d9fe99834e27"));
const upsertAwardCycle = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => CycleSchema.parse(d)).handler(createSsrRpc("d0373c44b753b4cff3cb930aa346716db019f2a190c27a33766a6c7a3777af64"));
const nominateForAward = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  cycle_id: stringType().uuid(),
  nominee_employee_id: stringType().uuid(),
  justification: stringType().min(10).max(2e3)
}).parse(d)).handler(createSsrRpc("721227d4ba2d8aa84a6e26cb5a8feaa30f2dce151e3e715ded097f8bcbe4d7cd"));
const listNominations = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  cycle_id: stringType().uuid().optional()
}).parse(d)).handler(createSsrRpc("e0b2dd59b4f63768a3075043c7e8ed20151ab1861f46d42aa5f926a48ba7fcca"));
const decideNomination = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid(),
  decision: enumType(["shortlisted", "awarded", "rejected", "withdrawn"]),
  notes: stringType().max(1e3).optional().nullable(),
  citation: stringType().max(2e3).optional().nullable()
}).parse(d)).handler(createSsrRpc("9923291689cf5b870884e70f365addbc95aaca08921238701b29ae49dc911ff9"));
const listAwardsGranted = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("cb61fa41499009895ad01460420f0488d39e5984bf628cea4653055ddcf2b175"));
const getEmployeeTimeline = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  employee_id: stringType().uuid()
}).parse(d)).handler(createSsrRpc("10129f858432cd1f88218334882b6bb9eb3b1b8ddb7e65b65aa0c2458f6e045c"));
const getEmployeePayHistory = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  employee_id: stringType().uuid()
}).parse(d)).handler(createSsrRpc("b8423a62444702e0a68281ff411a515581c85f7a922b62d11314b8163926441a"));
export {
  listAwardCycles as a,
  listNominations as b,
  createAppreciation as c,
  decideNomination as d,
  listAwardsGranted as e,
  listAwardTypes as f,
  upsertAwardCycle as g,
  listPromotions as h,
  decidePromotion as i,
  listPayRateChanges as j,
  proposePayRate as k,
  listAppreciations as l,
  decidePayRate as m,
  nominateForAward as n,
  getEmployeePayHistory as o,
  proposePromotion as p,
  getEmployeeTimeline as q,
  listDesignations as r,
  upsertDesignation as s,
  toggleAppreciationReaction as t,
  upsertAwardType as u,
  deleteDesignation as v,
  seedDesignationPreset as w
};
