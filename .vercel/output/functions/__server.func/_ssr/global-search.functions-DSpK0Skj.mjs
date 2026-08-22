import { c as createServerRpc } from "./createServerRpc-CbJDFEP-.mjs";
import { r as requireSupabaseAuth } from "./auth-guard-CkYFJuQL.mjs";
import { c as createServerFn } from "./server-BOi2EjMN.mjs";
import "../_libs/seroval.mjs";
import "../_libs/react.mjs";
import { a as objectType, z as stringType } from "../_libs/zod.mjs";
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
const globalSearch_createServerFn_handler = createServerRpc({
  id: "f0242e0ea2b4f8b1ea006738b7b917138ce361b75aff7c4234eb747e886bb088",
  name: "globalSearch",
  filename: "src/lib/global-search.functions.ts"
}, (opts) => globalSearch.__executeServer(opts));
const globalSearch = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  q: stringType().trim().min(2).max(100)
}).parse(d)).handler(globalSearch_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const {
    data: me
  } = await supabase.from("employees").select("tenant_id").eq("user_id", userId).maybeSingle();
  const tenantId = me?.tenant_id ?? null;
  const q = data.q;
  const like = `%${q}%`;
  const out = {
    employees: [],
    variations: [],
    tasks: [],
    timesheets: []
  };
  if (!tenantId) return out;
  const {
    data: emps
  } = await supabase.from("employees").select("id, first_name, last_name, employee_number, email, job_title").eq("tenant_id", tenantId).or(`first_name.ilike.${like},last_name.ilike.${like},employee_number.ilike.${like},email.ilike.${like}`).limit(5);
  out.employees = (emps ?? []).map((e) => ({
    id: e.id,
    label: `${e.first_name ?? ""} ${e.last_name ?? ""}`.trim() || (e.email ?? "Employee"),
    sub: [e.employee_number ? `#${e.employee_number}` : null, e.job_title].filter(Boolean).join(" · ")
  }));
  const {
    data: vars
  } = await supabase.from("employment_variations").select("id, variation_type, status, employee:employee_id(first_name, last_name, tenant_id)").limit(20);
  out.variations = (vars ?? []).filter((v) => v.employee?.tenant_id === tenantId).filter((v) => {
    const name = `${v.employee?.first_name ?? ""} ${v.employee?.last_name ?? ""}`.toLowerCase();
    return name.includes(q.toLowerCase()) || String(v.variation_type ?? "").toLowerCase().includes(q.toLowerCase());
  }).slice(0, 5).map((v) => ({
    id: v.id,
    label: `${v.employee?.first_name ?? ""} ${v.employee?.last_name ?? ""}`.trim(),
    sub: `${v.variation_type} · ${v.status}`
  }));
  const {
    data: tasks
  } = await supabase.from("onboarding_control_room_tasks").select("id, title, owner_role, status, assignment_id, assignment:assignment_id(employee:employee_id(first_name, last_name, tenant_id))").ilike("title", like).limit(20);
  out.tasks = (tasks ?? []).filter((t) => t.assignment?.employee?.tenant_id === tenantId).slice(0, 5).map((t) => {
    const emp = t.assignment?.employee;
    const name = emp ? `${emp.first_name ?? ""} ${emp.last_name ?? ""}`.trim() : "";
    return {
      id: t.id,
      assignment_id: t.assignment_id,
      label: t.title,
      sub: [name, t.owner_role, t.status].filter(Boolean).join(" · ")
    };
  });
  const {
    data: ts
  } = await supabase.from("timesheets").select("id, period_start, period_end, status, employee:employee_id(first_name, last_name, tenant_id)").order("period_start", {
    ascending: false
  }).limit(30);
  out.timesheets = (ts ?? []).filter((t) => t.employee?.tenant_id === tenantId).filter((t) => {
    const name = `${t.employee?.first_name ?? ""} ${t.employee?.last_name ?? ""}`.toLowerCase();
    return name.includes(q.toLowerCase());
  }).slice(0, 5).map((t) => ({
    id: t.id,
    label: `${t.employee?.first_name ?? ""} ${t.employee?.last_name ?? ""}`.trim(),
    sub: `${t.period_start} → ${t.period_end} · ${t.status}`
  }));
  return out;
});
export {
  globalSearch_createServerFn_handler
};
