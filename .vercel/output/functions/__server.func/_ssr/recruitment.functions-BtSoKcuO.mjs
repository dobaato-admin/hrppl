import { c as createSsrRpc } from "./createSsrRpc-CRedQJGY.mjs";
import { r as requireSupabaseAuth } from "./auth-guard-CkYFJuQL.mjs";
import { c as createServerFn } from "./server-BOi2EjMN.mjs";
import { a as objectType, z as stringType, D as arrayType, B as enumType, C as numberType, E as recordType, A as booleanType } from "../_libs/zod.mjs";
const listRecruitmentJobs = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("ab612d28a0939aea6573fe025a8d037a1567f58ba732845fd363e12eaef0ac9b"));
const JobSchema = objectType({
  id: stringType().uuid().optional(),
  title: stringType().min(1).max(200),
  slug: stringType().max(80).optional(),
  department_id: stringType().uuid().nullable().optional(),
  location: stringType().max(200).optional().nullable(),
  employment_type: stringType().max(80).optional().nullable(),
  description_html: stringType().max(2e4).optional().nullable(),
  requirements_html: stringType().max(2e4).optional().nullable(),
  salary_min: numberType().nonnegative().nullable().optional(),
  salary_max: numberType().nonnegative().nullable().optional(),
  currency: stringType().default("AUD"),
  hiring_manager_id: stringType().uuid().nullable().optional(),
  status: enumType(["draft", "open", "paused", "closed", "filled"]).default("draft")
});
const upsertRecruitmentJob = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => JobSchema.parse(d)).handler(createSsrRpc("84f4baed7babb8083bd777c31ad28ae0ed84ae4ac12d33b51834da09fa25193a"));
const getRecruitmentJob = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(createSsrRpc("e1fd3afd430a3723ba43e557df9fce741508965ce16019c7f0be2fc949929031"));
const moveCandidate = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  candidate_id: stringType().uuid(),
  stage_id: stringType().uuid(),
  status: enumType(["active", "hired", "rejected", "withdrawn"]).optional(),
  rejected_reason: stringType().max(500).optional()
}).parse(d)).handler(createSsrRpc("8221ef19dfc9eb4e38fd3541f0af0de9c2f8fc21c5b247e656ec7895d4432599"));
const getCandidate = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(createSsrRpc("cae1ef93884eaa7c7fe8c80981346dfa1f25adca59b3aab25eb574e494055325"));
const scheduleInterview = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  candidate_id: stringType().uuid(),
  title: stringType().min(1).max(200),
  scheduled_at: stringType(),
  duration_minutes: numberType().int().positive().max(480).default(45),
  mode: enumType(["video", "phone", "onsite"]).default("video"),
  location: stringType().max(500).optional().nullable(),
  interviewer_ids: arrayType(stringType().uuid()).default([]),
  notes: stringType().max(2e3).optional().nullable()
}).parse(d)).handler(createSsrRpc("dd86218314eba30393572665a141c445e1b9a77f81aa9076ca6470934d752aee"));
const submitScorecard = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  candidate_id: stringType().uuid(),
  interview_id: stringType().uuid().nullable().optional(),
  overall_rating: numberType().int().min(1).max(5),
  recommendation: enumType(["strong_yes", "yes", "neutral", "no", "strong_no"]),
  strengths: stringType().max(2e3).optional().nullable(),
  concerns: stringType().max(2e3).optional().nullable(),
  scores: recordType(stringType(), numberType()).default({})
}).parse(d)).handler(createSsrRpc("738ef682d21527af956233c5a9bff52a5f0110ad5e2a6e863790d798d0170f2d"));
const addCandidateNote = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  candidate_id: stringType().uuid(),
  body: stringType().min(1).max(4e3)
}).parse(d)).handler(createSsrRpc("e7f94d82bba143fc66ab87696442edfec378050fda9418387802034d6e913719"));
const createOffer = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  candidate_id: stringType().uuid(),
  job_title: stringType().min(1).max(200),
  base_salary: numberType().positive(),
  currency: stringType().default("AUD"),
  start_date: stringType().optional().nullable(),
  notes: stringType().max(2e3).optional().nullable()
}).parse(d)).handler(createSsrRpc("45962f5bc935a649b706b9a2c8d118c79accf6533a39ab45f7c274cf8f63a6e8"));
const upsertStage = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid().optional(),
  job_id: stringType().uuid(),
  name: stringType().min(1).max(80),
  kind: enumType(["applied", "screen", "interview", "offer", "hired", "rejected", "custom"]).default("custom"),
  sort_order: numberType().int().min(0).max(99),
  is_terminal: booleanType().default(false)
}).parse(d)).handler(createSsrRpc("83153de83d0fd15b8697875634355ad591891675dea405914042bdac8ee05492"));
const deleteStage = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(createSsrRpc("cf6da4080ee10ec8ebc212fa4642df7a3d6885baf5647601b1e36f25a82dfa50"));
const reorderStages = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  job_id: stringType().uuid(),
  order: arrayType(objectType({
    id: stringType().uuid(),
    sort_order: numberType().int().min(0).max(99)
  })).min(1).max(30)
}).parse(d)).handler(createSsrRpc("5bcf5f8a16911c894f6f16fff451e31e32164845dff8ecc26e2e5ea2731158a0"));
const updateOfferStatus = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid(),
  status: enumType(["draft", "sent", "accepted", "declined", "expired"])
}).parse(d)).handler(createSsrRpc("92b3ce5771408400e653f61f63dc4669afd568ba2be9be1f120050c7ba3ff3db"));
const convertCandidateToEmployee = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  candidate_id: stringType().uuid(),
  employee_number: stringType().min(1).max(40),
  job_title: stringType().min(1).max(200),
  department_id: stringType().uuid().nullable().optional(),
  employment_type: enumType(["full_time", "part_time", "casual", "contractor", "intern"]).default("full_time"),
  hire_date: stringType(),
  base_salary: numberType().positive().optional().nullable(),
  currency_code: stringType().max(3).default("AUD")
}).parse(d)).handler(createSsrRpc("3134946837fa4d46683f9f11b5e6a27ff96114bdc2a8dbc1f065d05e669dc4bb"));
const listPublicJobs = createServerFn({
  method: "GET"
}).handler(createSsrRpc("0dbaea053e1757a7ed534558b46f709096b537ce85b9316c9e12ca8c44cede59"));
const getPublicJob = createServerFn({
  method: "POST"
}).inputValidator((d) => objectType({
  slug: stringType().min(1).max(120)
}).parse(d)).handler(createSsrRpc("266a84cb8be8fd5f3d0394e2a852a4280d8f37ab35b06290d4bdaf36d30a6e78"));
const createResumeUploadUrl = createServerFn({
  method: "POST"
}).inputValidator((d) => objectType({
  job_id: stringType().uuid(),
  filename: stringType().min(1).max(200)
}).parse(d)).handler(createSsrRpc("6871539cf2fe3cbe36116161a1ee62649eb6413b2c9eb70353578984a87fcfbc"));
const ApplySchema = objectType({
  job_id: stringType().uuid(),
  first_name: stringType().min(1).max(80),
  last_name: stringType().min(1).max(80),
  email: stringType().email().max(200),
  phone: stringType().max(40).optional().nullable(),
  current_company: stringType().max(200).optional().nullable(),
  current_title: stringType().max(200).optional().nullable(),
  linkedin_url: stringType().url().max(500).optional().nullable(),
  cover_letter: stringType().max(8e3).optional().nullable(),
  resume_path: stringType().max(500).optional().nullable()
});
const applyToJob = createServerFn({
  method: "POST"
}).inputValidator((d) => ApplySchema.parse(d)).handler(createSsrRpc("e3d42cf1c4c9fa18afd76285dd595efd035d2102ffd2c44a0d97b27dd0d687b2"));
export {
  applyToJob as a,
  listRecruitmentJobs as b,
  createResumeUploadUrl as c,
  getRecruitmentJob as d,
  upsertStage as e,
  deleteStage as f,
  getPublicJob as g,
  getCandidate as h,
  submitScorecard as i,
  addCandidateNote as j,
  createOffer as k,
  listPublicJobs as l,
  moveCandidate as m,
  updateOfferStatus as n,
  convertCandidateToEmployee as o,
  reorderStages as r,
  scheduleInterview as s,
  upsertRecruitmentJob as u
};
