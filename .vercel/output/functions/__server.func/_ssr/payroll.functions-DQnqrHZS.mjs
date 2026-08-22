import { c as createServerRpc } from "./createServerRpc-CbJDFEP-.mjs";
import { r as requireSupabaseAuth } from "./auth-guard-CkYFJuQL.mjs";
import { c as createServerFn } from "./server-BOi2EjMN.mjs";
import "../_libs/seroval.mjs";
import "../_libs/react.mjs";
import { a as objectType, C as numberType, z as stringType } from "../_libs/zod.mjs";
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
function computeOTE(lines) {
  return lines.reduce((acc, l) => l.ote_eligible ? acc + l.amount : acc, 0);
}
function computeSuperBase(lines) {
  return lines.reduce((acc, l) => l.super_eligible ? acc + l.amount : acc, 0);
}
function computeSG(superBase, sgRate, maxQuarterlyBase, periodsPerQuarter) {
  let base = Math.max(0, superBase);
  if (maxQuarterlyBase && periodsPerQuarter && periodsPerQuarter > 0) {
    const perPeriodCap = maxQuarterlyBase / periodsPerQuarter;
    if (base > perPeriodCap) base = perPeriodCap;
  }
  return round2(base * sgRate);
}
function computePAYG(taxableEarnings, coeff) {
  if (taxableEarnings <= 0) return 0;
  const w = coeff.a * taxableEarnings - coeff.b;
  if (w <= 0) return 0;
  return Math.floor(w + 0.5);
}
function computeTaxableEarnings(lines) {
  return lines.reduce((acc, l) => l.is_taxable ? acc + l.amount : acc, 0);
}
const PERIODS_PER_QUARTER = {
  weekly: 13,
  fortnightly: 6.5,
  monthly: 3
};
function computeAuPeriod(inputs) {
  const gross = round2(inputs.lines.reduce((a, l) => a + l.amount, 0));
  const taxable = round2(computeTaxableEarnings(inputs.lines));
  const ote = round2(computeOTE(inputs.lines));
  const superBase = round2(computeSuperBase(inputs.lines));
  const payg = computePAYG(taxable, inputs.paygCoeff);
  const sg = computeSG(
    superBase,
    inputs.sgRate,
    inputs.maxQuarterlyBase,
    PERIODS_PER_QUARTER[inputs.frequency]
  );
  const net = round2(gross - payg);
  return { gross, taxable, ote, superBase, payg, sg, net };
}
function round2(n) {
  return Math.round(n * 100) / 100;
}
function evalFormula(expr, vars) {
  const tokens = [];
  let i = 0;
  while (i < expr.length) {
    const c = expr[i];
    if (/\s/.test(c)) {
      i++;
      continue;
    }
    if ("+-*/()".includes(c)) {
      tokens.push({
        t: c,
        v: c
      });
      i++;
      continue;
    }
    if (/[0-9.]/.test(c)) {
      let j = i;
      while (j < expr.length && /[0-9.]/.test(expr[j])) j++;
      tokens.push({
        t: "num",
        v: expr.slice(i, j)
      });
      i = j;
      continue;
    }
    if (/[a-zA-Z_]/.test(c)) {
      let j = i;
      while (j < expr.length && /[a-zA-Z0-9_]/.test(expr[j])) j++;
      const id = expr.slice(i, j);
      if (!(id in vars)) throw new Error(`Unknown identifier: ${id}`);
      tokens.push({
        t: "num",
        v: String(vars[id])
      });
      i = j;
      continue;
    }
    throw new Error(`Unexpected character in formula: ${c}`);
  }
  let p = 0;
  const peek = () => tokens[p];
  const eat = (t) => {
    if (peek()?.t !== t) throw new Error(`Expected ${t}`);
    return tokens[p++];
  };
  function parseExpr() {
    let v = parseTerm();
    while (peek() && (peek().t === "+" || peek().t === "-")) {
      const op = tokens[p++].t;
      const r = parseTerm();
      v = op === "+" ? v + r : v - r;
    }
    return v;
  }
  function parseTerm() {
    let v = parseFactor();
    while (peek() && (peek().t === "*" || peek().t === "/")) {
      const op = tokens[p++].t;
      const r = parseFactor();
      v = op === "*" ? v * r : v / r;
    }
    return v;
  }
  function parseFactor() {
    const tk = peek();
    if (!tk) throw new Error("Unexpected end of formula");
    if (tk.t === "(") {
      p++;
      const v = parseExpr();
      eat(")");
      return v;
    }
    if (tk.t === "-") {
      p++;
      return -parseFactor();
    }
    if (tk.t === "+") {
      p++;
      return parseFactor();
    }
    if (tk.t === "num") {
      p++;
      return Number(tk.v);
    }
    throw new Error(`Unexpected token: ${tk.v}`);
  }
  const result = parseExpr();
  if (p !== tokens.length) throw new Error("Trailing tokens in formula");
  if (!Number.isFinite(result)) throw new Error("Formula did not produce a finite number");
  return result;
}
function round(n, decimals, mode) {
  const f = Math.pow(10, decimals);
  if (mode === "half_up") return Math.sign(n) * Math.floor(Math.abs(n) * f + 0.5) / f;
  if (mode === "half_down") return Math.sign(n) * Math.ceil(Math.abs(n) * f - 0.5) / f;
  if (mode === "floor") return Math.floor(n * f) / f;
  if (mode === "ceil") return Math.ceil(n * f) / f;
  return Math.round(n * f) / f;
}
async function loadAdmin() {
  const {
    supabaseAdmin
  } = await import("./client.server-D5ro3rAQ.mjs");
  return supabaseAdmin;
}
async function assertOrgAdminForTenant(ctxSupabase, userId, tenantId) {
  const {
    data: roles
  } = await ctxSupabase.from("user_roles").select("role").eq("user_id", userId);
  const rs = (roles ?? []).map((r) => r.role);
  const isSuper = rs.includes("super_admin");
  const isOrgAdmin = rs.includes("org_admin");
  if (isSuper) return;
  if (!isOrgAdmin) throw new Error("Forbidden: org admin role required");
  const {
    data: profile
  } = await ctxSupabase.from("profiles").select("tenant_id").eq("id", userId).maybeSingle();
  if (!profile || profile.tenant_id !== tenantId) throw new Error("Forbidden: tenant mismatch");
}
const createPayrollRun_createServerFn_handler = createServerRpc({
  id: "0695f674cc87cce5761d014138bc84887dbd1729d318abe778472fdc26138faa",
  name: "createPayrollRun",
  filename: "src/lib/payroll.functions.ts"
}, (opts) => createPayrollRun.__executeServer(opts));
const createPayrollRun = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  tenantId: stringType().uuid(),
  periodStart: stringType(),
  periodEnd: stringType(),
  payDate: stringType(),
  notes: stringType().max(2e3).optional(),
  currencyCode: stringType().min(3).max(3).optional(),
  fxRate: numberType().positive().max(1e6).optional()
}).parse(d)).handler(createPayrollRun_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  await assertOrgAdminForTenant(supabase, userId, data.tenantId);
  const {
    data: tenant,
    error: terr
  } = await supabase.from("tenants").select("country_code,currency_code").eq("id", data.tenantId).maybeSingle();
  if (terr || !tenant) throw new Error("Tenant not found");
  if (String(tenant.country_code ?? "").toUpperCase() === "AU") {
    const admin0 = await loadAdmin();
    const {
      data: sub
    } = await admin0.from("tenant_subscriptions").select("status, au_payroll_addon, plan_id").eq("tenant_id", data.tenantId).maybeSingle();
    const hasAddon = sub?.au_payroll_addon === true && (sub?.status === "active" || sub?.status === "trialing");
    if (!hasAddon) {
      throw new Error("Australian payroll requires the AU Payroll add-on. Upgrade to Pro and enable the AU Payroll add-on to run payroll.");
    }
  }
  const baseCurrency = tenant.currency_code.toUpperCase();
  const payCurrency = (data.currencyCode ?? baseCurrency).toUpperCase();
  const fxRate = payCurrency === baseCurrency ? 1 : data.fxRate ?? 0;
  if (payCurrency !== baseCurrency && !(fxRate > 0)) {
    throw new Error("FX rate is required when payroll currency differs from the tenant base currency");
  }
  const admin = await loadAdmin();
  const {
    data: run,
    error
  } = await admin.from("payroll_runs").insert({
    tenant_id: data.tenantId,
    country_code: tenant.country_code,
    base_currency_code: baseCurrency,
    currency_code: payCurrency,
    fx_rate: fxRate,
    period_start: data.periodStart,
    period_end: data.periodEnd,
    pay_date: data.payDate,
    status: "draft",
    notes: data.notes,
    created_by: userId
  }).select().single();
  if (error) {
    console.error("[payroll.create] DB error:", error.message, error.code);
    throw new Error("Failed to create payroll run. Please try again.");
  }
  await admin.from("audit_log").insert({
    actor_id: userId,
    entity_type: "payroll_run",
    entity_id: run.id,
    action: "create",
    metadata: {
      tenant_id: data.tenantId,
      period_start: data.periodStart,
      period_end: data.periodEnd,
      base_currency: baseCurrency,
      pay_currency: payCurrency,
      fx_rate: fxRate
    }
  });
  return {
    run
  };
});
const computePayrollRun_createServerFn_handler = createServerRpc({
  id: "724a156c28afde1cce70dc3678b2fb379502b80e3172de0f85fd5db3b2e5ff6a",
  name: "computePayrollRun",
  filename: "src/lib/payroll.functions.ts"
}, (opts) => computePayrollRun.__executeServer(opts));
const computePayrollRun = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  runId: stringType().uuid()
}).parse(d)).handler(computePayrollRun_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const admin = await loadAdmin();
  const {
    data: run,
    error: rerr
  } = await admin.from("payroll_runs").select("*").eq("id", data.runId).maybeSingle();
  if (rerr || !run) throw new Error("Run not found");
  if (run.status !== "draft") throw new Error("Only draft runs can be computed");
  await assertOrgAdminForTenant(supabase, userId, run.tenant_id);
  const {
    data: tplId
  } = await admin.rpc("active_payslip_template", {
    _country_code: run.country_code,
    _on_date: run.pay_date
  });
  if (!tplId) throw new Error(`No published payslip template for ${run.country_code} on ${run.pay_date}`);
  const {
    data: tpl
  } = await admin.from("payslip_templates").select("*").eq("id", tplId).single();
  const {
    data: lineItems
  } = await admin.from("payslip_line_items").select("*").eq("template_id", tplId).order("sort_order");
  const {
    data: cps
  } = await admin.from("country_payroll_settings").select("*").eq("country_code", run.country_code).maybeSingle();
  const decimals = cps?.rounding_decimals ?? 2;
  const mode = cps?.rounding_mode ?? "half_up";
  const workweekHours = Number(cps?.workweek_hours ?? 40);
  const otMultiplier = Number(cps?.overtime_multiplier ?? 1.5);
  const holidayMultiplierDefault = Number(cps?.holiday_pay_multiplier ?? 2);
  const monthlyHours = workweekHours * 52 / 12;
  const {
    data: holidayRows
  } = await admin.from("public_holidays").select("holiday_date,name,pay_multiplier").eq("country_code", run.country_code).gte("holiday_date", run.period_start).lte("holiday_date", run.period_end);
  const countryHolidayByDate = /* @__PURE__ */ new Map();
  for (const h of holidayRows ?? []) {
    countryHolidayByDate.set(h.holiday_date, {
      name: h.name,
      multiplier: h.pay_multiplier != null ? Number(h.pay_multiplier) : holidayMultiplierDefault
    });
  }
  const {
    data: tenantRow
  } = await admin.from("tenants").select("default_holiday_category_id").eq("id", run.tenant_id).maybeSingle();
  const tenantDefaultCatId = tenantRow?.default_holiday_category_id ?? null;
  const {
    data: catRows
  } = await admin.from("public_holiday_categories").select("id").eq("tenant_id", run.tenant_id).eq("country_code", run.country_code);
  const catIds = (catRows ?? []).map((c) => c.id);
  const datesByCategory = /* @__PURE__ */ new Map();
  if (catIds.length) {
    const {
      data: dateRows
    } = await admin.from("holiday_category_dates").select("category_id, holiday_date, name, pay_multiplier").in("category_id", catIds).gte("holiday_date", run.period_start).lte("holiday_date", run.period_end);
    for (const d of dateRows ?? []) {
      const m = datesByCategory.get(d.category_id) ?? /* @__PURE__ */ new Map();
      m.set(d.holiday_date, {
        name: d.name,
        multiplier: d.pay_multiplier != null ? Number(d.pay_multiplier) : holidayMultiplierDefault
      });
      datesByCategory.set(d.category_id, m);
    }
  }
  const {
    data: deptRows
  } = await admin.from("departments").select("id, default_holiday_category_id").eq("tenant_id", run.tenant_id);
  const deptCatById = /* @__PURE__ */ new Map();
  for (const d of deptRows ?? []) deptCatById.set(d.id, d.default_holiday_category_id ?? null);
  function holidayByDateForEmp(emp) {
    const out = new Map(countryHolidayByDate);
    const empCat = emp.holiday_category_id;
    const deptCat = emp.department_id ? deptCatById.get(emp.department_id) ?? null : null;
    const catId = empCat ?? deptCat ?? tenantDefaultCatId;
    if (catId) {
      const extra = datesByCategory.get(catId);
      if (extra) for (const [k, v] of extra) out.set(k, v);
    }
    return out;
  }
  const allHolidayDates = new Set(countryHolidayByDate.keys());
  for (const m of datesByCategory.values()) for (const k of m.keys()) allHolidayDates.add(k);
  let holidayHoursByEmployee = /* @__PURE__ */ new Map();
  if (allHolidayDates.size > 0) {
    const {
      data: attRows
    } = await admin.from("attendance_entries").select("employee_id, work_date, hours_worked").eq("tenant_id", run.tenant_id).in("work_date", Array.from(allHolidayDates));
    for (const a of attRows ?? []) {
      const hrs = Number(a.hours_worked ?? 0);
      if (hrs <= 0) continue;
      const cur = holidayHoursByEmployee.get(a.employee_id) ?? {
        perHoliday: /* @__PURE__ */ new Map()
      };
      cur.perHoliday.set(a.work_date, (cur.perHoliday.get(a.work_date) ?? 0) + hrs);
      holidayHoursByEmployee.set(a.employee_id, cur);
    }
  }
  const {
    data: otRows
  } = await admin.from("timesheets").select("id, employee_id, overtime_hours, overtime_breakdown, consumed_by_run_id").eq("tenant_id", run.tenant_id).eq("status", "approved").gte("period_start", run.period_start).lte("period_end", run.period_end).or(`consumed_by_run_id.is.null,consumed_by_run_id.eq.${run.id}`);
  const otByEmployee = /* @__PURE__ */ new Map();
  for (const ts of otRows ?? []) {
    const hrs = Number(ts.overtime_hours ?? 0);
    const breakdown = ts.overtime_breakdown ?? {};
    const keys = Object.keys(breakdown);
    const cur = otByEmployee.get(ts.employee_id) ?? {
      flatHours: 0,
      byCode: /* @__PURE__ */ new Map()
    };
    if (keys.length > 0) {
      for (const k of keys) {
        const v = Number(breakdown[k] ?? 0);
        if (v > 0) cur.byCode.set(k, (cur.byCode.get(k) ?? 0) + v);
      }
    } else if (hrs > 0) {
      cur.flatHours += hrs;
    }
    otByEmployee.set(ts.employee_id, cur);
  }
  const {
    data: penaltyRows
  } = await admin.from("overtime_penalty_rates").select("*").eq("country_code", run.country_code).eq("is_active", true).lte("effective_from", run.pay_date);
  const penaltyByCode = /* @__PURE__ */ new Map();
  for (const r of penaltyRows ?? []) {
    if (r.effective_to && r.effective_to < run.pay_date) continue;
    penaltyByCode.set(r.code, r);
  }
  const {
    data: leaveRows
  } = await admin.from("leave_requests").select("employee_id, start_date, end_date, days, leave_type_id").eq("tenant_id", run.tenant_id).eq("status", "approved").lte("start_date", run.period_end).gte("end_date", run.period_start);
  const leaveTypeIds = Array.from(new Set((leaveRows ?? []).map((l) => l.leave_type_id)));
  const leaveTypeById = /* @__PURE__ */ new Map();
  if (leaveTypeIds.length) {
    const {
      data: lts
    } = await admin.from("leave_types").select("id, code, name, is_paid").in("id", leaveTypeIds);
    for (const t of lts ?? []) leaveTypeById.set(t.id, t);
  }
  const leaveByEmployee = /* @__PURE__ */ new Map();
  const periodStartMs = (/* @__PURE__ */ new Date(run.period_start + "T00:00:00Z")).getTime();
  const periodEndMs = (/* @__PURE__ */ new Date(run.period_end + "T00:00:00Z")).getTime();
  for (const lr of leaveRows ?? []) {
    const lt = leaveTypeById.get(lr.leave_type_id);
    if (!lt) continue;
    const sMs = Math.max((/* @__PURE__ */ new Date(lr.start_date + "T00:00:00Z")).getTime(), periodStartMs);
    const eMs = Math.min((/* @__PURE__ */ new Date(lr.end_date + "T00:00:00Z")).getTime(), periodEndMs);
    if (eMs < sMs) continue;
    const overlapCalDays = Math.floor((eMs - sMs) / 864e5) + 1;
    const daysInPeriod = Math.min(overlapCalDays, Number(lr.days ?? 0));
    if (daysInPeriod <= 0) continue;
    const cur = leaveByEmployee.get(lr.employee_id) ?? {
      paid: /* @__PURE__ */ new Map(),
      unpaid: /* @__PURE__ */ new Map()
    };
    const bucket = lt.is_paid ? cur.paid : cur.unpaid;
    const entry = bucket.get(lt.code) ?? {
      name: lt.name,
      days: 0
    };
    entry.days += daysInPeriod;
    bucket.set(lt.code, entry);
    leaveByEmployee.set(lr.employee_id, cur);
  }
  const workweekDays = Math.max(1, workweekHours / 8);
  const monthlyWorkdays = workweekDays * 52 / 12;
  const {
    data: brackets
  } = await admin.from("tax_brackets").select("*").eq("country_code", run.country_code).eq("is_active", true).lte("effective_from", run.pay_date).order("bracket_order", {
    ascending: true
  });
  const activeBrackets = (brackets ?? []).filter((b) => !b.effective_to || b.effective_to >= run.pay_date);
  const {
    data: contribs
  } = await admin.from("contribution_rules").select("*").eq("country_code", run.country_code).eq("is_active", true).lte("effective_from", run.pay_date);
  const activeContribs = (contribs ?? []).filter((c) => !c.effective_to || c.effective_to >= run.pay_date);
  const {
    data: employees
  } = await admin.from("employees").select("*").eq("tenant_id", run.tenant_id).eq("status", "active").lte("hire_date", run.pay_date);
  const active = (employees ?? []).filter((e) => !e.termination_date || e.termination_date >= run.period_start);
  const empIds = active.map((e) => e.id);
  const effectivePay = /* @__PURE__ */ new Map();
  if (empIds.length) {
    const {
      data: rateRows
    } = await admin.from("pay_rate_changes").select("employee_id,to_amount,effective_date,status").in("employee_id", empIds).eq("status", "applied").lte("effective_date", run.pay_date).order("effective_date", {
      ascending: false
    });
    for (const r of rateRows ?? []) {
      if (!effectivePay.has(r.employee_id)) effectivePay.set(r.employee_id, Number(r.to_amount));
    }
  }
  const isAU = run.country_code === "AU";
  let auCtx = null;
  if (isAU) {
    const {
      data: setting
    } = await admin.from("tenant_payroll_settings").select("pay_period").eq("tenant_id", run.tenant_id).maybeSingle();
    const rawFreq = setting?.pay_period;
    const frequency = rawFreq === "weekly" || rawFreq === "monthly" ? rawFreq : "fortnightly";
    const {
      data: brktRows
    } = await admin.from("tax_tables_au").select("threshold_min,threshold_max,a,b,effective_from,effective_to").eq("scale", "2").eq("frequency", frequency).lte("effective_from", run.pay_date).order("effective_from", {
      ascending: false
    });
    const activeBr = (brktRows ?? []).filter((r) => !r.effective_to || r.effective_to >= run.pay_date);
    const {
      data: sg
    } = await admin.rpc("au_sg_rate_on", {
      _on: run.pay_date
    });
    const {
      data: comps
    } = await admin.from("payroll_components").select("code,stp2_category,ote_eligible,super_eligible").eq("tenant_id", run.tenant_id);
    const componentByCode = /* @__PURE__ */ new Map();
    for (const c of comps ?? []) componentByCode.set(c.code, c);
    auCtx = {
      frequency,
      brackets: activeBr.map((r) => ({
        threshold_min: Number(r.threshold_min),
        threshold_max: r.threshold_max == null ? null : Number(r.threshold_max),
        a: Number(r.a),
        b: Number(r.b)
      })),
      sgRate: Number(sg ?? 0),
      componentByCode
    };
  }
  function calcTax(taxable) {
    let tax = 0;
    for (const b of activeBrackets) {
      const min = Number(b.min_income ?? 0);
      const max = b.max_income == null ? Infinity : Number(b.max_income);
      if (taxable <= min) continue;
      const slice = Math.min(taxable, max) - min;
      if (slice > 0) tax += slice * (Number(b.rate_percent) / 100) + Number(b.fixed_amount ?? 0);
    }
    return tax;
  }
  function auOteEligible(code) {
    const comp = auCtx?.componentByCode.get(code);
    if (comp) return !!comp.ote_eligible;
    if (code === "BASE") return true;
    if (code.startsWith("OT_") || code === "OVERTIME") return false;
    if (code.startsWith("HOLIDAY_")) return false;
    if (code.startsWith("LEAVE_")) return false;
    return false;
  }
  function auSuperEligible(code) {
    const comp = auCtx?.componentByCode.get(code);
    if (comp) return !!comp.super_eligible;
    return auOteEligible(code);
  }
  const payslipsPayload = [];
  let totGross = 0, totTax = 0, totEC = 0, totER = 0, totNet = 0, totAllow = 0, totDed = 0;
  const fxRate = Number(run.fx_rate ?? 1) || 1;
  const conv = (n) => round(n * fxRate, decimals, mode);
  for (const emp of active) {
    const gross = effectivePay.get(emp.id) ?? Number(emp.base_salary ?? 0);
    const ctxVars = {
      gross,
      base: gross,
      ytd: 0,
      rate: 0
    };
    const lines = [{
      code: "BASE",
      label: "Base salary",
      category: "earning",
      amount: conv(gross),
      base: round(gross, decimals, mode),
      rate: null
    }];
    let allowances = 0, deductions = 0;
    for (const li of lineItems ?? []) {
      if (li.code === "BASE") continue;
      let amount = 0;
      const rate = li.rate == null ? 0 : Number(li.rate);
      ctxVars.rate = rate;
      try {
        if (li.calc_type === "fixed") amount = rate;
        else if (li.calc_type === "percent_of_gross") amount = gross * (rate / 100);
        else if (li.calc_type === "formula" && li.formula) amount = evalFormula(li.formula, ctxVars);
        else amount = 0;
      } catch (e) {
        throw new Error(`Line item ${li.code} formula error: ${e.message}`);
      }
      amount = round(amount, decimals, mode);
      if (li.category === "earning" || li.category === "allowance") allowances += amount;
      else if (li.category === "deduction") deductions += amount;
      lines.push({
        code: li.code,
        label: li.label,
        category: li.category,
        amount: conv(amount),
        base: round(gross, decimals, mode),
        rate
      });
    }
    let employeeContrib = 0, employerContrib = 0;
    if (!isAU) {
      for (const c of activeContribs) {
        const base = Math.max(Number(c.min_base ?? 0), Math.min(gross, c.max_base == null ? gross : Number(c.max_base)));
        const ec = round(base * (Number(c.employee_rate_percent) / 100), decimals, mode);
        const er = round(base * (Number(c.employer_rate_percent) / 100), decimals, mode);
        employeeContrib += ec;
        employerContrib += er;
        lines.push({
          code: `CONTRIB_${c.name}`,
          label: `${c.name} (employee)`,
          category: "contribution_employee",
          amount: conv(ec),
          base: conv(base),
          rate: Number(c.employee_rate_percent)
        });
        lines.push({
          code: `CONTRIB_${c.name}_ER`,
          label: `${c.name} (employer)`,
          category: "contribution_employer",
          amount: conv(er),
          base: conv(base),
          rate: Number(c.employer_rate_percent)
        });
      }
    }
    const ot = otByEmployee.get(emp.id);
    if (ot && monthlyHours > 0) {
      const hourlyRate = gross / monthlyHours;
      for (const [code, hours] of ot.byCode) {
        if (hours <= 0) continue;
        const penalty = penaltyByCode.get(code);
        const mult = penalty ? Number(penalty.rate_multiplier) : otMultiplier;
        const label = penalty?.name ? `Overtime — ${penalty.name}` : `Overtime ${code}`;
        const lineRate = round(hourlyRate * mult, decimals, mode);
        const amount = round(hours * hourlyRate * mult, decimals, mode);
        allowances += amount;
        lines.push({
          code: `OT_${code}`,
          label,
          category: "earning",
          amount: conv(amount),
          base: hours,
          rate: lineRate
        });
      }
      if (ot.flatHours > 0) {
        const otRate = round(hourlyRate * otMultiplier, decimals, mode);
        const otAmount = round(ot.flatHours * hourlyRate * otMultiplier, decimals, mode);
        allowances += otAmount;
        lines.push({
          code: "OVERTIME",
          label: "Overtime",
          category: "earning",
          amount: conv(otAmount),
          base: ot.flatHours,
          rate: otRate
        });
      }
    }
    const holiday = holidayHoursByEmployee.get(emp.id);
    const empHolidayByDate = holidayByDateForEmp(emp);
    if (holiday && monthlyHours > 0) {
      const hourlyRate = gross / monthlyHours;
      for (const [date, hours] of holiday.perHoliday) {
        if (hours <= 0) continue;
        const meta = empHolidayByDate.get(date);
        if (!meta) continue;
        const premiumPortion = Math.max(0, meta.multiplier - 1);
        if (premiumPortion <= 0) continue;
        const lineRate = round(hourlyRate * premiumPortion, decimals, mode);
        const amount = round(hours * hourlyRate * premiumPortion, decimals, mode);
        if (amount <= 0) continue;
        allowances += amount;
        lines.push({
          code: `HOLIDAY_${date}`,
          label: `Holiday premium — ${meta.name} (×${meta.multiplier})`,
          category: "earning",
          amount: conv(amount),
          base: hours,
          rate: lineRate
        });
      }
    }
    const leave = leaveByEmployee.get(emp.id);
    if (leave && monthlyWorkdays > 0) {
      const dailyRate = gross / monthlyWorkdays;
      for (const [code, info] of leave.unpaid) {
        if (info.days <= 0) continue;
        const amount = round(info.days * dailyRate, decimals, mode);
        if (amount <= 0) continue;
        deductions += amount;
        lines.push({
          code: `LEAVE_UNPAID_${code}`,
          label: `Unpaid leave — ${info.name} (${info.days}d)`,
          category: "deduction",
          amount: conv(amount),
          base: info.days,
          rate: round(dailyRate, decimals, mode)
        });
      }
      for (const [code, info] of leave.paid) {
        if (info.days <= 0) continue;
        lines.push({
          code: `LEAVE_PAID_${code}`,
          label: `Paid leave — ${info.name} (${info.days}d)`,
          category: "info",
          amount: conv(0),
          base: info.days,
          rate: round(dailyRate, decimals, mode)
        });
      }
    }
    let taxableBase;
    let incomeTax;
    let net;
    if (isAU && auCtx) {
      const auLines = lines.filter((l) => l.category !== "info" && l.category !== "tax").map((l) => {
        const taxable = l.category === "earning" || l.category === "allowance";
        const sign = l.category === "deduction" ? -1 : 1;
        const code = l.code;
        return {
          code,
          amount: sign * Number(l.amount) / fxRate,
          // un-convert; engine works in tenant currency
          stp2_category: auCtx.componentByCode.get(code)?.stp2_category ?? null,
          ote_eligible: auOteEligible(code),
          super_eligible: auSuperEligible(code),
          is_taxable: taxable
        };
      });
      const taxableGuess = auLines.reduce((a, l) => l.is_taxable ? a + l.amount : a, 0);
      const bracket = auCtx.brackets.find((r) => taxableGuess >= r.threshold_min && (r.threshold_max == null || taxableGuess < r.threshold_max));
      if (!bracket) {
        throw new Error(`No AU PAYG-W bracket for ${auCtx.frequency} taxable=${taxableGuess.toFixed(2)} on ${run.pay_date}`);
      }
      const auResult = computeAuPeriod({
        lines: auLines,
        frequency: auCtx.frequency,
        paygCoeff: {
          a: bracket.a,
          b: bracket.b
        },
        sgRate: auCtx.sgRate
      });
      taxableBase = round(auResult.taxable, decimals, mode);
      incomeTax = round(auResult.payg, decimals, mode);
      const sg = round(auResult.sg, decimals, mode);
      employerContrib += sg;
      lines.push({
        code: "PAYG_W",
        label: "PAYG withholding",
        category: "tax",
        amount: conv(incomeTax),
        base: conv(taxableBase),
        rate: null
      });
      lines.push({
        code: "SUPER_SG",
        label: `Super Guarantee (${(auCtx.sgRate * 100).toFixed(2)}%)`,
        category: "contribution_employer",
        amount: conv(sg),
        base: conv(round(auResult.superBase, decimals, mode)),
        rate: Number((auCtx.sgRate * 100).toFixed(2))
      });
      net = round(auResult.gross - deductions - incomeTax, decimals, mode);
    } else {
      taxableBase = round(gross + allowances - employeeContrib, decimals, mode);
      incomeTax = round(calcTax(taxableBase), decimals, mode);
      lines.push({
        code: "INCOME_TAX",
        label: "Income tax",
        category: "tax",
        amount: conv(incomeTax),
        base: conv(taxableBase),
        rate: null
      });
      net = round(gross + allowances - deductions - employeeContrib - incomeTax, decimals, mode);
    }
    payslipsPayload.push({
      run_id: run.id,
      tenant_id: run.tenant_id,
      employee_id: emp.id,
      template_id: tplId,
      currency_code: run.currency_code,
      gross: conv(gross),
      taxable_base: conv(taxableBase),
      income_tax: conv(incomeTax),
      employee_contributions: conv(employeeContrib),
      employer_contributions: conv(employerContrib),
      allowances: conv(allowances),
      deductions: conv(deductions),
      net_pay: conv(net),
      lines
    });
    totGross += gross;
    totTax += incomeTax;
    totEC += employeeContrib;
    totER += employerContrib;
    totNet += net;
    totAllow += allowances;
    totDed += deductions;
  }
  await admin.from("payroll_payslips").delete().eq("run_id", run.id);
  if (payslipsPayload.length > 0) {
    const {
      error: ie
    } = await admin.from("payroll_payslips").insert(payslipsPayload);
    if (ie) {
      console.error("[payroll.compute] payslips insert error:", ie.message, ie.code);
      throw new Error("Failed to save computed payslips. Please try again.");
    }
  }
  const totals = {
    gross: conv(totGross),
    income_tax: conv(totTax),
    employee_contributions: conv(totEC),
    employer_contributions: conv(totER),
    allowances: conv(totAllow),
    deductions: conv(totDed),
    net_pay: conv(totNet),
    employee_count: payslipsPayload.length,
    currency_code: run.currency_code,
    base_currency_code: run.base_currency_code,
    fx_rate: fxRate
  };
  const {
    error: uerr
  } = await admin.from("payroll_runs").update({
    status: "computed",
    template_id: tplId,
    totals,
    computed_at: (/* @__PURE__ */ new Date()).toISOString()
  }).eq("id", run.id);
  if (uerr) {
    console.error("[payroll.compute] run update error:", uerr.message, uerr.code);
    throw new Error("Failed to finalize payroll computation. Please try again.");
  }
  await admin.from("audit_log").insert({
    actor_id: userId,
    entity_type: "payroll_run",
    entity_id: run.id,
    action: "compute",
    metadata: {
      totals,
      employee_count: payslipsPayload.length
    }
  });
  return {
    totals,
    employeeCount: payslipsPayload.length
  };
});
async function assertApproverForTenant(ctxSupabase, userId, tenantId) {
  const {
    data: roles
  } = await ctxSupabase.from("user_roles").select("role").eq("user_id", userId);
  const rs = (roles ?? []).map((r) => r.role);
  if (rs.includes("super_admin")) return;
  if (!rs.includes("manager")) throw new Error("Forbidden: manager role required");
  const {
    data: profile
  } = await ctxSupabase.from("profiles").select("tenant_id").eq("id", userId).maybeSingle();
  if (!profile || profile.tenant_id !== tenantId) throw new Error("Forbidden: tenant mismatch");
}
const submitPayrollRun_createServerFn_handler = createServerRpc({
  id: "1c9eca8186ec36479ed6d7137a3f445d0d865ad3c94a4694511af97e254d3eae",
  name: "submitPayrollRun",
  filename: "src/lib/payroll.functions.ts"
}, (opts) => submitPayrollRun.__executeServer(opts));
const submitPayrollRun = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  runId: stringType().uuid()
}).parse(d)).handler(submitPayrollRun_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const admin = await loadAdmin();
  const {
    data: run
  } = await admin.from("payroll_runs").select("*").eq("id", data.runId).maybeSingle();
  if (!run) throw new Error("Run not found");
  if (run.status !== "computed") throw new Error("Only computed runs can be submitted for approval");
  await assertOrgAdminForTenant(supabase, userId, run.tenant_id);
  const {
    error
  } = await admin.from("payroll_runs").update({
    status: "pending_approval",
    submitted_by: userId,
    submitted_at: (/* @__PURE__ */ new Date()).toISOString()
  }).eq("id", run.id);
  if (error) {
    console.error("[payroll.submit] DB error:", error.message, error.code);
    throw new Error("Failed to submit payroll run for approval.");
  }
  await admin.from("audit_log").insert({
    actor_id: userId,
    entity_type: "payroll_run",
    entity_id: run.id,
    action: "submit_for_approval",
    metadata: {}
  });
  return {
    ok: true
  };
});
const approvePayrollRun_createServerFn_handler = createServerRpc({
  id: "8bca6cc842b4f19936388b19a1be58aa0ebb781cb283f6b7dabe6ee8afcf81aa",
  name: "approvePayrollRun",
  filename: "src/lib/payroll.functions.ts"
}, (opts) => approvePayrollRun.__executeServer(opts));
const approvePayrollRun = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  runId: stringType().uuid()
}).parse(d)).handler(approvePayrollRun_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const admin = await loadAdmin();
  const {
    data: run
  } = await admin.from("payroll_runs").select("*").eq("id", data.runId).maybeSingle();
  if (!run) throw new Error("Run not found");
  if (run.status !== "pending_approval") throw new Error("Only runs pending approval can be approved");
  await assertApproverForTenant(supabase, userId, run.tenant_id);
  if (run.submitted_by && run.submitted_by === userId) {
    throw new Error("Approver must be different from the person who submitted the run");
  }
  const {
    error
  } = await admin.from("payroll_runs").update({
    status: "approved",
    approved_by: userId,
    approved_at: (/* @__PURE__ */ new Date()).toISOString()
  }).eq("id", run.id);
  if (error) {
    console.error("[payroll.approve] DB error:", error.message, error.code);
    throw new Error("Failed to approve payroll run.");
  }
  await admin.from("timesheets").update({
    consumed_by_run_id: run.id
  }).eq("tenant_id", run.tenant_id).eq("status", "approved").is("consumed_by_run_id", null).gte("period_start", run.period_start).lte("period_end", run.period_end);
  await admin.from("audit_log").insert({
    actor_id: userId,
    entity_type: "payroll_run",
    entity_id: run.id,
    action: "approve",
    metadata: {
      submitted_by: run.submitted_by
    }
  });
  return {
    ok: true
  };
});
const rejectPayrollRun_createServerFn_handler = createServerRpc({
  id: "656ab2abb529d1e67e6a0e45bf4a0f9d47598950e5297c9fca040635138518bc",
  name: "rejectPayrollRun",
  filename: "src/lib/payroll.functions.ts"
}, (opts) => rejectPayrollRun.__executeServer(opts));
const rejectPayrollRun = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  runId: stringType().uuid(),
  reason: stringType().max(2e3).optional()
}).parse(d)).handler(rejectPayrollRun_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const admin = await loadAdmin();
  const {
    data: run
  } = await admin.from("payroll_runs").select("*").eq("id", data.runId).maybeSingle();
  if (!run) throw new Error("Run not found");
  if (run.status !== "pending_approval") throw new Error("Only runs pending approval can be rejected");
  await assertApproverForTenant(supabase, userId, run.tenant_id);
  const {
    error
  } = await admin.from("payroll_runs").update({
    status: "computed",
    submitted_by: null,
    submitted_at: null
  }).eq("id", run.id);
  if (error) {
    console.error("[payroll.reject] DB error:", error.message, error.code);
    throw new Error("Failed to reject payroll run.");
  }
  await admin.from("audit_log").insert({
    actor_id: userId,
    entity_type: "payroll_run",
    entity_id: run.id,
    action: "reject",
    metadata: {
      reason: data.reason ?? null
    }
  });
  return {
    ok: true
  };
});
const cancelPayrollRun_createServerFn_handler = createServerRpc({
  id: "fd51c7d2190fb1eb7cd9944a4f19b65810dcae84c40092bc3a78fe47663f6b3e",
  name: "cancelPayrollRun",
  filename: "src/lib/payroll.functions.ts"
}, (opts) => cancelPayrollRun.__executeServer(opts));
const cancelPayrollRun = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  runId: stringType().uuid()
}).parse(d)).handler(cancelPayrollRun_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const admin = await loadAdmin();
  const {
    data: run
  } = await admin.from("payroll_runs").select("*").eq("id", data.runId).maybeSingle();
  if (!run) throw new Error("Run not found");
  if (run.status === "approved") throw new Error("Approved runs cannot be cancelled");
  await assertOrgAdminForTenant(supabase, userId, run.tenant_id);
  const {
    error
  } = await admin.from("payroll_runs").update({
    status: "cancelled"
  }).eq("id", run.id);
  if (error) {
    console.error("[payroll.cancel] DB error:", error.message, error.code);
    throw new Error("Failed to cancel payroll run.");
  }
  await admin.from("audit_log").insert({
    actor_id: userId,
    entity_type: "payroll_run",
    entity_id: run.id,
    action: "cancel",
    metadata: {}
  });
  return {
    ok: true
  };
});
const deletePayrollRun_createServerFn_handler = createServerRpc({
  id: "8a9007b2ceb3e654b4c223b4ac2556e38c9cf8236df422720bc4e3332e8d4a60",
  name: "deletePayrollRun",
  filename: "src/lib/payroll.functions.ts"
}, (opts) => deletePayrollRun.__executeServer(opts));
const deletePayrollRun = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  runId: stringType().uuid()
}).parse(d)).handler(deletePayrollRun_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const admin = await loadAdmin();
  const {
    data: run
  } = await admin.from("payroll_runs").select("*").eq("id", data.runId).maybeSingle();
  if (!run) throw new Error("Run not found");
  if (run.status === "approved") throw new Error("Approved runs cannot be deleted");
  await assertOrgAdminForTenant(supabase, userId, run.tenant_id);
  const {
    error
  } = await admin.from("payroll_runs").delete().eq("id", run.id);
  if (error) {
    console.error("[payroll.delete] DB error:", error.message, error.code);
    throw new Error("Failed to delete payroll run.");
  }
  await admin.from("audit_log").insert({
    actor_id: userId,
    entity_type: "payroll_run",
    entity_id: run.id,
    action: "delete",
    metadata: {}
  });
  return {
    ok: true
  };
});
export {
  approvePayrollRun_createServerFn_handler,
  cancelPayrollRun_createServerFn_handler,
  computePayrollRun_createServerFn_handler,
  createPayrollRun_createServerFn_handler,
  deletePayrollRun_createServerFn_handler,
  rejectPayrollRun_createServerFn_handler,
  submitPayrollRun_createServerFn_handler
};
