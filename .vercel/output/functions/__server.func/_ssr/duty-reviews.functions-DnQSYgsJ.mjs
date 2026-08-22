import { c as createSsrRpc } from "./createSsrRpc-CRedQJGY.mjs";
import { r as requireSupabaseAuth } from "./auth-guard-CkYFJuQL.mjs";
import { c as createServerFn } from "./server-BOi2EjMN.mjs";
import { a as objectType, z as stringType, C as numberType } from "../_libs/zod.mjs";
const getDutyReview = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  employeeId: stringType().uuid(),
  cycleLabel: stringType().trim().min(1).max(60)
}).parse(d)).handler(createSsrRpc("6ac6746bc011d85d88c6f440469af43f023fc03283f38ab42b6883f8e3d283ab"));
const upsertSchema = objectType({
  employeeId: stringType().uuid(),
  dutyId: stringType().uuid(),
  cycleLabel: stringType().trim().min(1).max(60),
  score: numberType().min(0).max(100),
  comments: stringType().trim().max(2e3).optional().default("")
});
const upsertDutyScore = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => upsertSchema.parse(d)).handler(createSsrRpc("14d92ee5514474b1123f7e4161535f07fdf7a7c0ddc56fae8477a32538c9496c"));
const submitMyDutyScore = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  dutyId: stringType().uuid(),
  cycleLabel: stringType().trim().min(1).max(60),
  score: numberType().min(0).max(100),
  comments: stringType().trim().max(2e3).optional().default("")
}).parse(d)).handler(createSsrRpc("2c0e462bc7a5500b0f8cc3253ddaf54a0a4643a6bce79407baacd9454e46d27f"));
const getMyDutyReview = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  cycleLabel: stringType().trim().min(1).max(60)
}).parse(d)).handler(createSsrRpc("801f5c6138760a350cb5bf353d34251b37c96dd5a2e52078b4b9ec330ba54424"));
const exportDutyReviewCsv = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  cycleLabel: stringType().trim().min(1).max(60)
}).parse(d)).handler(createSsrRpc("e6cc9ef82b9eb25ac31f360e64a0cfed0513292df3d3051e41c961cf127c0382"));
const getDutyReviewExportData = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  cycleLabel: stringType().trim().min(1).max(60)
}).parse(d)).handler(createSsrRpc("a68ebd0cc0599862883e972a9c86327558a46b3446b8415e6bf744e4bcfc5438"));
createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("c88cb0696bb73914adfaf07580c7f786f843262851f465bf09e03ea6d269c21a"));
export {
  getDutyReview as a,
  getDutyReviewExportData as b,
  exportDutyReviewCsv as e,
  getMyDutyReview as g,
  submitMyDutyScore as s,
  upsertDutyScore as u
};
