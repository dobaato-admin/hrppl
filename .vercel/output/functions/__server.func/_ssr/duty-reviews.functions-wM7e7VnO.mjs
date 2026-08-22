import { c as createServerRpc } from "./createServerRpc-CbJDFEP-.mjs";
import { r as requireSupabaseAuth } from "./auth-guard-CkYFJuQL.mjs";
import { c as createServerFn } from "./server-BOi2EjMN.mjs";
import "../_libs/seroval.mjs";
import "../_libs/react.mjs";
import { a as objectType, z as stringType, C as numberType } from "../_libs/zod.mjs";
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
async function getCtx(context) {
  const {
    supabase,
    userId
  } = context;
  const {
    data: prof
  } = await supabase.from("profiles").select("tenant_id").eq("id", userId).maybeSingle();
  if (!prof?.tenant_id) throw new Error("No organisation");
  const {
    data: roles
  } = await supabase.from("user_roles").select("role").eq("user_id", userId);
  const r = (roles ?? []).map((x) => x.role);
  const isReviewer = r.some((x) => ["org_admin", "super_admin", "manager"].includes(x));
  return {
    tenantId: prof.tenant_id,
    isReviewer,
    userId,
    supabase
  };
}
const getDutyReview_createServerFn_handler = createServerRpc({
  id: "6ac6746bc011d85d88c6f440469af43f023fc03283f38ab42b6883f8e3d283ab",
  name: "getDutyReview",
  filename: "src/lib/duty-reviews.functions.ts"
}, (opts) => getDutyReview.__executeServer(opts));
const getDutyReview = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  employeeId: stringType().uuid(),
  cycleLabel: stringType().trim().min(1).max(60)
}).parse(d)).handler(getDutyReview_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    tenantId,
    isReviewer,
    supabase
  } = await getCtx(context);
  if (!isReviewer) throw new Error("Manager / admin only");
  const {
    data: emp
  } = await supabase.from("employees").select("id, first_name, last_name, email, job_title").eq("id", data.employeeId).eq("tenant_id", tenantId).maybeSingle();
  if (!emp) throw new Error("Employee not found");
  const {
    data: duties
  } = await supabase.from("employee_duties").select("id, title, description, weight, kpi_target, is_active").eq("employee_id", data.employeeId).eq("is_active", true).order("sort_order");
  const {
    data: scores
  } = await supabase.from("duty_review_scores").select("id, duty_id, score, comments, updated_at").eq("employee_id", data.employeeId).eq("cycle_label", data.cycleLabel);
  const scoreByDuty = /* @__PURE__ */ new Map();
  for (const s of scores ?? []) scoreByDuty.set(s.duty_id, s);
  const items = (duties ?? []).map((d) => ({
    duty: d,
    score: scoreByDuty.get(d.id)?.score ?? null,
    comments: scoreByDuty.get(d.id)?.comments ?? "",
    scoreId: scoreByDuty.get(d.id)?.id ?? null
  }));
  const totalWeight = items.reduce((s, it) => s + Number(it.duty.weight || 0), 0);
  const weightedTotal = items.reduce((sum, it) => {
    if (it.score == null) return sum;
    return sum + Number(it.score) * Number(it.duty.weight || 0);
  }, 0);
  const finalScore = totalWeight > 0 ? weightedTotal / totalWeight : null;
  return {
    employee: emp,
    items,
    totalWeight,
    finalScore
  };
});
const upsertSchema = objectType({
  employeeId: stringType().uuid(),
  dutyId: stringType().uuid(),
  cycleLabel: stringType().trim().min(1).max(60),
  score: numberType().min(0).max(100),
  comments: stringType().trim().max(2e3).optional().default("")
});
async function assertCycleOpen(supabase, tenantId, cycleLabel) {
  const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  const {
    data: cycle
  } = await supabase.from("kpi_review_cycles").select("status, starts_on, ends_on").eq("tenant_id", tenantId).eq("label", cycleLabel).maybeSingle();
  if (!cycle) throw new Error(`Cycle "${cycleLabel}" does not exist. Create it first.`);
  if (cycle.status !== "open") throw new Error(`Cycle "${cycleLabel}" is not open for submissions.`);
  if (today < cycle.starts_on || today > cycle.ends_on) throw new Error("Today is outside the cycle date window.");
}
const upsertDutyScore_createServerFn_handler = createServerRpc({
  id: "14d92ee5514474b1123f7e4161535f07fdf7a7c0ddc56fae8477a32538c9496c",
  name: "upsertDutyScore",
  filename: "src/lib/duty-reviews.functions.ts"
}, (opts) => upsertDutyScore.__executeServer(opts));
const upsertDutyScore = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => upsertSchema.parse(d)).handler(upsertDutyScore_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    tenantId,
    isReviewer,
    supabase,
    userId
  } = await getCtx(context);
  if (!isReviewer) throw new Error("Manager / admin only");
  await assertCycleOpen(supabase, tenantId, data.cycleLabel);
  const payload = {
    tenant_id: tenantId,
    employee_id: data.employeeId,
    duty_id: data.dutyId,
    cycle_label: data.cycleLabel,
    score: data.score,
    comments: data.comments || null,
    reviewer_id: userId,
    submitter_kind: "reviewer"
  };
  const {
    error
  } = await supabase.from("duty_review_scores").upsert(payload, {
    onConflict: "employee_id,duty_id,cycle_label"
  });
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
const submitMyDutyScore_createServerFn_handler = createServerRpc({
  id: "2c0e462bc7a5500b0f8cc3253ddaf54a0a4643a6bce79407baacd9454e46d27f",
  name: "submitMyDutyScore",
  filename: "src/lib/duty-reviews.functions.ts"
}, (opts) => submitMyDutyScore.__executeServer(opts));
const submitMyDutyScore = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  dutyId: stringType().uuid(),
  cycleLabel: stringType().trim().min(1).max(60),
  score: numberType().min(0).max(100),
  comments: stringType().trim().max(2e3).optional().default("")
}).parse(d)).handler(submitMyDutyScore_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const {
    data: prof
  } = await supabase.from("profiles").select("tenant_id").eq("id", userId).maybeSingle();
  if (!prof?.tenant_id) throw new Error("No organisation");
  const {
    data: emp
  } = await supabase.from("employees").select("id, tenant_id").eq("user_id", userId).maybeSingle();
  if (!emp) throw new Error("Employee record not found");
  await assertCycleOpen(supabase, emp.tenant_id, data.cycleLabel);
  const {
    data: duty
  } = await supabase.from("employee_duties").select("id, employee_id").eq("id", data.dutyId).maybeSingle();
  if (!duty || duty.employee_id !== emp.id) throw new Error("This duty is not assigned to you.");
  const {
    error
  } = await supabase.from("duty_review_scores").upsert({
    tenant_id: emp.tenant_id,
    employee_id: emp.id,
    duty_id: data.dutyId,
    cycle_label: data.cycleLabel,
    score: data.score,
    comments: data.comments || null,
    submitter_kind: "self"
  }, {
    onConflict: "employee_id,duty_id,cycle_label"
  });
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
const getMyDutyReview_createServerFn_handler = createServerRpc({
  id: "801f5c6138760a350cb5bf353d34251b37c96dd5a2e52078b4b9ec330ba54424",
  name: "getMyDutyReview",
  filename: "src/lib/duty-reviews.functions.ts"
}, (opts) => getMyDutyReview.__executeServer(opts));
const getMyDutyReview = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  cycleLabel: stringType().trim().min(1).max(60)
}).parse(d)).handler(getMyDutyReview_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const {
    data: emp
  } = await supabase.from("employees").select("id, tenant_id, first_name, last_name").eq("user_id", userId).maybeSingle();
  if (!emp) return {
    items: [],
    cycle: null
  };
  const {
    data: cycle
  } = await supabase.from("kpi_review_cycles").select("id, label, starts_on, ends_on, status").eq("tenant_id", emp.tenant_id).eq("label", data.cycleLabel).maybeSingle();
  const {
    data: duties
  } = await supabase.from("employee_duties").select("id, title, description, weight, kpi_target").eq("employee_id", emp.id).eq("is_active", true).order("sort_order");
  const {
    data: scores
  } = await supabase.from("duty_review_scores").select("duty_id, score, comments, submitter_kind, updated_at").eq("employee_id", emp.id).eq("cycle_label", data.cycleLabel);
  const map = /* @__PURE__ */ new Map();
  for (const s of scores ?? []) {
    const existing = map.get(s.duty_id);
    if (!existing || s.submitter_kind === "self") map.set(s.duty_id, s);
  }
  return {
    cycle,
    employee: emp,
    items: (duties ?? []).map((d) => ({
      duty: d,
      score: map.get(d.id)?.score ?? null,
      comments: map.get(d.id)?.comments ?? "",
      submitter_kind: map.get(d.id)?.submitter_kind ?? null
    }))
  };
});
const exportDutyReviewCsv_createServerFn_handler = createServerRpc({
  id: "e6cc9ef82b9eb25ac31f360e64a0cfed0513292df3d3051e41c961cf127c0382",
  name: "exportDutyReviewCsv",
  filename: "src/lib/duty-reviews.functions.ts"
}, (opts) => exportDutyReviewCsv.__executeServer(opts));
const exportDutyReviewCsv = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  cycleLabel: stringType().trim().min(1).max(60)
}).parse(d)).handler(exportDutyReviewCsv_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    tenantId,
    isReviewer,
    supabase
  } = await getCtx(context);
  if (!isReviewer) throw new Error("Manager / admin only");
  const {
    data: scores
  } = await supabase.from("duty_review_scores").select("score, comments, submitter_kind, updated_at, cycle_label, employee:employees!inner(id, first_name, last_name, email, job_title), duty:employee_duties!inner(id, title, weight, kpi_target)").eq("tenant_id", tenantId).eq("cycle_label", data.cycleLabel);
  const rows = scores ?? [];
  const byEmp = /* @__PURE__ */ new Map();
  for (const r of rows) {
    const eid = r.employee.id;
    if (!byEmp.has(eid)) byEmp.set(eid, {
      employee: r.employee,
      lines: []
    });
    byEmp.get(eid).lines.push(r);
  }
  const header = ["Employee", "Email", "Job title", "Cycle", "Duty", "Weight%", "Target", "Submitter", "Score", "Weighted", "Comments", "Updated"];
  const csvLines = [header.join(",")];
  const esc = (v) => {
    const s = v == null ? "" : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const summary = [];
  for (const [, grp] of byEmp) {
    let totalW = 0, weighted = 0;
    for (const ln of grp.lines) {
      const w = Number(ln.duty.weight || 0);
      totalW += w;
      if (ln.score != null) weighted += Number(ln.score) * w;
      csvLines.push([`${grp.employee.first_name ?? ""} ${grp.employee.last_name ?? ""}`.trim(), grp.employee.email ?? "", grp.employee.job_title ?? "", data.cycleLabel, ln.duty.title, w, ln.duty.kpi_target ?? "", ln.submitter_kind, ln.score ?? "", ln.score != null ? (Number(ln.score) * w / 100).toFixed(2) : "", ln.comments ?? "", ln.updated_at ?? ""].map(esc).join(","));
    }
    const final = totalW > 0 ? weighted / totalW : null;
    summary.push({
      employee: grp.employee,
      final,
      totalW
    });
  }
  csvLines.push("");
  csvLines.push(["Employee", "Email", "Cycle", "Total weight%", "Final score /100"].join(","));
  for (const s of summary) {
    csvLines.push([`${s.employee.first_name ?? ""} ${s.employee.last_name ?? ""}`.trim(), s.employee.email ?? "", data.cycleLabel, s.totalW, s.final == null ? "" : s.final.toFixed(2)].map(esc).join(","));
  }
  return {
    csv: csvLines.join("\n"),
    filename: `duty-review-${data.cycleLabel}.csv`
  };
});
const getDutyReviewExportData_createServerFn_handler = createServerRpc({
  id: "a68ebd0cc0599862883e972a9c86327558a46b3446b8415e6bf744e4bcfc5438",
  name: "getDutyReviewExportData",
  filename: "src/lib/duty-reviews.functions.ts"
}, (opts) => getDutyReviewExportData.__executeServer(opts));
const getDutyReviewExportData = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  cycleLabel: stringType().trim().min(1).max(60)
}).parse(d)).handler(getDutyReviewExportData_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    tenantId,
    isReviewer,
    supabase
  } = await getCtx(context);
  if (!isReviewer) throw new Error("Manager / admin only");
  const {
    data: tenant
  } = await supabase.from("tenants").select("name").eq("id", tenantId).maybeSingle();
  const {
    data: cycle
  } = await supabase.from("kpi_review_cycles").select("label, starts_on, ends_on, status").eq("tenant_id", tenantId).eq("label", data.cycleLabel).maybeSingle();
  const {
    data: scores
  } = await supabase.from("duty_review_scores").select("score, comments, submitter_kind, updated_at, employee:employees!inner(id, first_name, last_name, email, job_title), duty:employee_duties!inner(id, title, weight, kpi_target)").eq("tenant_id", tenantId).eq("cycle_label", data.cycleLabel);
  const byEmp = /* @__PURE__ */ new Map();
  for (const r of scores ?? []) {
    const eid = r.employee.id;
    if (!byEmp.has(eid)) byEmp.set(eid, {
      employee: r.employee,
      lines: []
    });
    byEmp.get(eid).lines.push(r);
  }
  const employees = Array.from(byEmp.values()).map((g) => {
    let totalW = 0, weighted = 0;
    for (const ln of g.lines) {
      const w = Number(ln.duty.weight || 0);
      totalW += w;
      if (ln.score != null) weighted += Number(ln.score) * w;
    }
    return {
      employee: g.employee,
      lines: g.lines.map((ln) => ({
        duty_title: ln.duty.title,
        weight: Number(ln.duty.weight || 0),
        target: ln.duty.kpi_target ?? null,
        submitter: ln.submitter_kind,
        score: ln.score == null ? null : Number(ln.score),
        weighted_contribution: ln.score != null ? Number((Number(ln.score) * Number(ln.duty.weight || 0) / 100).toFixed(2)) : null,
        comments: ln.comments ?? "",
        updated_at: ln.updated_at
      })),
      total_weight: totalW,
      final_score: totalW > 0 ? Number((weighted / totalW).toFixed(2)) : null
    };
  }).sort((a, b) => `${a.employee.last_name ?? ""}`.localeCompare(`${b.employee.last_name ?? ""}`));
  return {
    tenant_name: tenant?.name ?? "Organisation",
    cycle: cycle ?? {
      label: data.cycleLabel,
      starts_on: null,
      ends_on: null,
      status: null
    },
    generated_at: (/* @__PURE__ */ new Date()).toISOString(),
    employees
  };
});
const listMyDutyReviews_createServerFn_handler = createServerRpc({
  id: "c88cb0696bb73914adfaf07580c7f786f843262851f465bf09e03ea6d269c21a",
  name: "listMyDutyReviews",
  filename: "src/lib/duty-reviews.functions.ts"
}, (opts) => listMyDutyReviews.__executeServer(opts));
const listMyDutyReviews = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(listMyDutyReviews_createServerFn_handler, async ({
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
    reviews: []
  };
  const {
    data,
    error
  } = await supabase.from("duty_review_scores").select("id, duty_id, cycle_label, score, comments, updated_at, duty:employee_duties(id, title, weight, kpi_target)").eq("employee_id", emp.id).order("cycle_label", {
    ascending: false
  });
  if (error) throw new Error(error.message);
  return {
    reviews: data ?? []
  };
});
export {
  exportDutyReviewCsv_createServerFn_handler,
  getDutyReviewExportData_createServerFn_handler,
  getDutyReview_createServerFn_handler,
  getMyDutyReview_createServerFn_handler,
  listMyDutyReviews_createServerFn_handler,
  submitMyDutyScore_createServerFn_handler,
  upsertDutyScore_createServerFn_handler
};
