import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/lib/auth-guard";
import {
  computeAuPeriod,
  type PayFrequency as AuPayFrequency,
  type PayLine as AuPayLine,
} from "./payroll-au";

// ---------- Safe arithmetic formula evaluator ----------
// Supports: numbers, + - * /, parentheses, identifiers from `vars`.
// Rejects anything else. No `eval` / `Function` constructor.
function evalFormula(expr: string, vars: Record<string, number>): number {
  const tokens: Array<{ t: string; v: string }> = [];
  let i = 0;
  while (i < expr.length) {
    const c = expr[i];
    if (/\s/.test(c)) { i++; continue; }
    if ("+-*/()".includes(c)) { tokens.push({ t: c, v: c }); i++; continue; }
    if (/[0-9.]/.test(c)) {
      let j = i; while (j < expr.length && /[0-9.]/.test(expr[j])) j++;
      tokens.push({ t: "num", v: expr.slice(i, j) }); i = j; continue;
    }
    if (/[a-zA-Z_]/.test(c)) {
      let j = i; while (j < expr.length && /[a-zA-Z0-9_]/.test(expr[j])) j++;
      const id = expr.slice(i, j);
      if (!(id in vars)) throw new Error(`Unknown identifier: ${id}`);
      tokens.push({ t: "num", v: String(vars[id]) }); i = j; continue;
    }
    throw new Error(`Unexpected character in formula: ${c}`);
  }
  let p = 0;
  const peek = () => tokens[p];
  const eat = (t: string) => { if (peek()?.t !== t) throw new Error(`Expected ${t}`); return tokens[p++]; };
  function parseExpr(): number { let v = parseTerm(); while (peek() && (peek().t === "+" || peek().t === "-")) { const op = tokens[p++].t; const r = parseTerm(); v = op === "+" ? v + r : v - r; } return v; }
  function parseTerm(): number { let v = parseFactor(); while (peek() && (peek().t === "*" || peek().t === "/")) { const op = tokens[p++].t; const r = parseFactor(); v = op === "*" ? v * r : v / r; } return v; }
  function parseFactor(): number {
    const tk = peek(); if (!tk) throw new Error("Unexpected end of formula");
    if (tk.t === "(") { p++; const v = parseExpr(); eat(")"); return v; }
    if (tk.t === "-") { p++; return -parseFactor(); }
    if (tk.t === "+") { p++; return parseFactor(); }
    if (tk.t === "num") { p++; return Number(tk.v); }
    throw new Error(`Unexpected token: ${tk.v}`);
  }
  const result = parseExpr();
  if (p !== tokens.length) throw new Error("Trailing tokens in formula");
  if (!Number.isFinite(result)) throw new Error("Formula did not produce a finite number");
  return result;
}

function round(n: number, decimals: number, mode: string): number {
  const f = Math.pow(10, decimals);
  if (mode === "half_up") return Math.sign(n) * Math.floor(Math.abs(n) * f + 0.5) / f;
  if (mode === "half_down") return Math.sign(n) * Math.ceil(Math.abs(n) * f - 0.5) / f;
  if (mode === "floor") return Math.floor(n * f) / f;
  if (mode === "ceil") return Math.ceil(n * f) / f;
  return Math.round(n * f) / f;
}

async function loadAdmin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

async function assertOrgAdminForTenant(ctxSupabase: any, userId: string, tenantId: string) {
  const { data: roles } = await ctxSupabase.from("user_roles").select("role").eq("user_id", userId);
  const rs = (roles ?? []).map((r: any) => r.role);
  const isSuper = rs.includes("super_admin");
  const isOrgAdmin = rs.includes("org_admin");
  if (isSuper) return;
  if (!isOrgAdmin) throw new Error("Forbidden: org admin role required");
  const { data: profile } = await ctxSupabase.from("profiles").select("tenant_id").eq("id", userId).maybeSingle();
  if (!profile || profile.tenant_id !== tenantId) throw new Error("Forbidden: tenant mismatch");
}

// ---------- Create draft run ----------
export const createPayrollRun = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({
    tenantId: z.string().uuid(),
    periodStart: z.string(),
    periodEnd: z.string(),
    payDate: z.string(),
    notes: z.string().max(2000).optional(),
    currencyCode: z.string().min(3).max(3).optional(),
    fxRate: z.number().positive().max(1_000_000).optional(),
  }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await assertOrgAdminForTenant(supabase, userId, data.tenantId);
    const { data: tenant, error: terr } = await supabase.from("tenants").select("country_code,currency_code").eq("id", data.tenantId).maybeSingle();
    if (terr || !tenant) throw new Error("Tenant not found");
    // Australia payroll requires a paid Pro plan with the AU add-on; non-AU payroll is free.
    if (String(tenant.country_code ?? "").toUpperCase() === "AU") {
      const admin0 = await loadAdmin();
      const { data: sub } = await admin0
        .from("tenant_subscriptions")
        .select("status, au_payroll_addon, plan_id")
        .eq("tenant_id", data.tenantId)
        .maybeSingle();
      const hasAddon = sub?.au_payroll_addon === true && (sub?.status === "active" || sub?.status === "trialing");
      if (!hasAddon) {
        throw new Error("Australian payroll requires the AU Payroll add-on. Upgrade to Pro and enable the AU Payroll add-on to run payroll.");
      }
    }
    const baseCurrency = (tenant.currency_code as string).toUpperCase();
    const payCurrency = (data.currencyCode ?? baseCurrency).toUpperCase();
    const fxRate = payCurrency === baseCurrency ? 1 : (data.fxRate ?? 0);
    if (payCurrency !== baseCurrency && !(fxRate > 0)) {
      throw new Error("FX rate is required when payroll currency differs from the tenant base currency");
    }
    const admin = await loadAdmin();
    const { data: run, error } = await admin.from("payroll_runs").insert({
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
      created_by: userId,
    }).select().single();
    if (error) { console.error("[payroll.create] DB error:", error.message, error.code); throw new Error("Failed to create payroll run. Please try again."); }
    await admin.from("audit_log").insert({
      actor_id: userId, entity_type: "payroll_run", entity_id: run.id,
      action: "create", metadata: { tenant_id: data.tenantId, period_start: data.periodStart, period_end: data.periodEnd, base_currency: baseCurrency, pay_currency: payCurrency, fx_rate: fxRate },
    });
    return { run };
  });

// ---------- Compute run ----------
export const computePayrollRun = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ runId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const admin = await loadAdmin();

    const { data: run, error: rerr } = await admin.from("payroll_runs").select("*").eq("id", data.runId).maybeSingle();
    if (rerr || !run) throw new Error("Run not found");
    if (run.status !== "draft") throw new Error("Only draft runs can be computed");
    await assertOrgAdminForTenant(supabase, userId, run.tenant_id);

    // Active template
    const { data: tplId } = await admin.rpc("active_payslip_template", {
      _country_code: run.country_code, _on_date: run.pay_date,
    });
    if (!tplId) throw new Error(`No published payslip template for ${run.country_code} on ${run.pay_date}`);
    const { data: tpl } = await admin.from("payslip_templates").select("*").eq("id", tplId).single();
    const { data: lineItems } = await admin.from("payslip_line_items").select("*").eq("template_id", tplId).order("sort_order");

    // Country settings
    const { data: cps } = await admin.from("country_payroll_settings").select("*").eq("country_code", run.country_code).maybeSingle();
    const decimals = cps?.rounding_decimals ?? 2;
    const mode = cps?.rounding_mode ?? "half_up";
    const workweekHours = Number(cps?.workweek_hours ?? 40);
    const otMultiplier = Number(cps?.overtime_multiplier ?? 1.5);
    const holidayMultiplierDefault = Number(cps?.holiday_pay_multiplier ?? 2.0);
    const monthlyHours = (workweekHours * 52) / 12;

    // Public holidays falling inside the run period (country-wide rows apply to all employees).
    const { data: holidayRows } = await admin.from("public_holidays")
      .select("holiday_date,name,pay_multiplier")
      .eq("country_code", run.country_code)
      .gte("holiday_date", run.period_start)
      .lte("holiday_date", run.period_end);
    const countryHolidayByDate = new Map<string, { name: string; multiplier: number }>();
    for (const h of holidayRows ?? []) {
      countryHolidayByDate.set(h.holiday_date as string, {
        name: h.name as string,
        multiplier: h.pay_multiplier != null ? Number(h.pay_multiplier) : holidayMultiplierDefault,
      });
    }

    // Tenant-scoped holiday categories add extra observed dates per employee.
    const { data: tenantRow } = await admin.from("tenants")
      .select("default_holiday_category_id").eq("id", run.tenant_id).maybeSingle();
    const tenantDefaultCatId = (tenantRow?.default_holiday_category_id ?? null) as string | null;

    const { data: catRows } = await admin.from("public_holiday_categories")
      .select("id").eq("tenant_id", run.tenant_id).eq("country_code", run.country_code);
    const catIds = (catRows ?? []).map((c: any) => c.id as string);
    const datesByCategory = new Map<string, Map<string, { name: string; multiplier: number }>>();
    if (catIds.length) {
      const { data: dateRows } = await admin.from("holiday_category_dates")
        .select("category_id, holiday_date, name, pay_multiplier")
        .in("category_id", catIds)
        .gte("holiday_date", run.period_start)
        .lte("holiday_date", run.period_end);
      for (const d of dateRows ?? []) {
        const m = datesByCategory.get(d.category_id as string) ?? new Map();
        m.set(d.holiday_date as string, {
          name: d.name as string,
          multiplier: d.pay_multiplier != null ? Number(d.pay_multiplier) : holidayMultiplierDefault,
        });
        datesByCategory.set(d.category_id as string, m);
      }
    }

    // Department → default category lookup (used when an employee has no per-employee override).
    const { data: deptRows } = await admin.from("departments")
      .select("id, default_holiday_category_id").eq("tenant_id", run.tenant_id);
    const deptCatById = new Map<string, string | null>();
    for (const d of deptRows ?? []) deptCatById.set(d.id as string, (d.default_holiday_category_id as string | null) ?? null);

    function holidayByDateForEmp(emp: any): Map<string, { name: string; multiplier: number }> {
      const out = new Map(countryHolidayByDate);
      const empCat: any = (emp as any).holiday_category_id;
      const deptCat = emp.department_id ? deptCatById.get(emp.department_id as string) ?? null : null;
      const catId: string | null = empCat ?? deptCat ?? tenantDefaultCatId;
      if (catId) {
        const extra = datesByCategory.get(catId);
        if (extra) for (const [k, v] of extra) out.set(k, v);
      }
      return out;
    }

    // Attendance is queried once over the broadest possible date set; per-employee filtering happens below.
    const allHolidayDates = new Set<string>(countryHolidayByDate.keys());
    for (const m of datesByCategory.values()) for (const k of m.keys()) allHolidayDates.add(k);
    let holidayHoursByEmployee = new Map<string, { perHoliday: Map<string, number> }>();
    if (allHolidayDates.size > 0) {
      const { data: attRows } = await admin.from("attendance_entries")
        .select("employee_id, work_date, hours_worked")
        .eq("tenant_id", run.tenant_id)
        .in("work_date", Array.from(allHolidayDates));
      for (const a of attRows ?? []) {
        const hrs = Number(a.hours_worked ?? 0);
        if (hrs <= 0) continue;
        const cur = holidayHoursByEmployee.get(a.employee_id as string)
          ?? { perHoliday: new Map<string, number>() };
        cur.perHoliday.set(a.work_date as string, (cur.perHoliday.get(a.work_date as string) ?? 0) + hrs);
        holidayHoursByEmployee.set(a.employee_id as string, cur);
      }
    }

    // Approved overtime hours from timesheets within run period (idempotent via consumed_by_run_id)
    const { data: otRows } = await admin.from("timesheets")
      .select("id, employee_id, overtime_hours, overtime_breakdown, consumed_by_run_id")
      .eq("tenant_id", run.tenant_id).eq("status", "approved")
      .gte("period_start", run.period_start).lte("period_end", run.period_end)
      .or(`consumed_by_run_id.is.null,consumed_by_run_id.eq.${run.id}`);
    type OtAgg = { flatHours: number; byCode: Map<string, number> };
    const otByEmployee = new Map<string, OtAgg>();
    for (const ts of otRows ?? []) {
      const hrs = Number(ts.overtime_hours ?? 0);
      const breakdown = (ts.overtime_breakdown ?? {}) as Record<string, number | string>;
      const keys = Object.keys(breakdown);
      const cur = otByEmployee.get(ts.employee_id) ?? { flatHours: 0, byCode: new Map<string, number>() };
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

    // Active overtime penalty rates for the run's country, effective on pay_date
    const { data: penaltyRows } = await admin.from("overtime_penalty_rates").select("*")
      .eq("country_code", run.country_code).eq("is_active", true)
      .lte("effective_from", run.pay_date);
    const penaltyByCode = new Map<string, any>();
    for (const r of penaltyRows ?? []) {
      if (r.effective_to && r.effective_to < run.pay_date) continue;
      penaltyByCode.set(r.code, r);
    }

    // Approved leave requests overlapping the run period — used to pro-rate unpaid leave
    // out of gross and to show paid leave as an informational line on the payslip.
    const { data: leaveRows } = await admin.from("leave_requests")
      .select("employee_id, start_date, end_date, days, leave_type_id")
      .eq("tenant_id", run.tenant_id).eq("status", "approved")
      .lte("start_date", run.period_end).gte("end_date", run.period_start);
    const leaveTypeIds = Array.from(new Set((leaveRows ?? []).map((l: any) => l.leave_type_id)));
    const leaveTypeById = new Map<string, { code: string; name: string; is_paid: boolean }>();
    if (leaveTypeIds.length) {
      const { data: lts } = await admin.from("leave_types")
        .select("id, code, name, is_paid").in("id", leaveTypeIds);
      for (const t of lts ?? []) leaveTypeById.set(t.id as string, t as any);
    }
    type LeaveAgg = { paid: Map<string, { name: string; days: number }>; unpaid: Map<string, { name: string; days: number }> };
    const leaveByEmployee = new Map<string, LeaveAgg>();
    const periodStartMs = new Date(run.period_start + "T00:00:00Z").getTime();
    const periodEndMs = new Date(run.period_end + "T00:00:00Z").getTime();
    for (const lr of leaveRows ?? []) {
      const lt = leaveTypeById.get(lr.leave_type_id as string);
      if (!lt) continue;
      const sMs = Math.max(new Date((lr.start_date as string) + "T00:00:00Z").getTime(), periodStartMs);
      const eMs = Math.min(new Date((lr.end_date as string) + "T00:00:00Z").getTime(), periodEndMs);
      if (eMs < sMs) continue;
      const overlapCalDays = Math.floor((eMs - sMs) / 86400000) + 1;
      // Clamp to recorded days (already accounts for half-days when the leave is fully within the period).
      const daysInPeriod = Math.min(overlapCalDays, Number(lr.days ?? 0));
      if (daysInPeriod <= 0) continue;
      const cur = leaveByEmployee.get(lr.employee_id as string)
        ?? { paid: new Map(), unpaid: new Map() };
      const bucket = lt.is_paid ? cur.paid : cur.unpaid;
      const entry = bucket.get(lt.code) ?? { name: lt.name, days: 0 };
      entry.days += daysInPeriod;
      bucket.set(lt.code, entry);
      leaveByEmployee.set(lr.employee_id as string, cur);
    }
    const workweekDays = Math.max(1, workweekHours / 8);
    const monthlyWorkdays = (workweekDays * 52) / 12;




    // Tax brackets effective on pay_date
    const { data: brackets } = await admin.from("tax_brackets").select("*")
      .eq("country_code", run.country_code).eq("is_active", true)
      .lte("effective_from", run.pay_date)
      .order("bracket_order", { ascending: true });
    const activeBrackets = (brackets ?? []).filter((b: any) => !b.effective_to || b.effective_to >= run.pay_date);

    // Contribution rules
    const { data: contribs } = await admin.from("contribution_rules").select("*")
      .eq("country_code", run.country_code).eq("is_active", true)
      .lte("effective_from", run.pay_date);
    const activeContribs = (contribs ?? []).filter((c: any) => !c.effective_to || c.effective_to >= run.pay_date);

    // Employees
    const { data: employees } = await admin.from("employees").select("*")
      .eq("tenant_id", run.tenant_id).eq("status", "active")
      .lte("hire_date", run.pay_date);
    const active = (employees ?? []).filter((e: any) => !e.termination_date || e.termination_date >= run.period_start);

    // Effective-dated pay rates: most-recent applied change on or before pay_date wins.
    const empIds = active.map((e: any) => e.id);
    const effectivePay = new Map<string, number>();
    if (empIds.length) {
      const { data: rateRows } = await admin.from("pay_rate_changes")
        .select("employee_id,to_amount,effective_date,status")
        .in("employee_id", empIds)
        .eq("status", "applied")
        .lte("effective_date", run.pay_date)
        .order("effective_date", { ascending: false });
      for (const r of rateRows ?? []) {
        if (!effectivePay.has(r.employee_id)) effectivePay.set(r.employee_id, Number(r.to_amount));
      }
    }

    // AU branch context — resolved once per run. When tenant is AU we replace
    // the generic tax/contribution emission with PAYG-W (Schedule 1) + SG.
    const isAU = run.country_code === "AU";
    let auCtx: {
      frequency: AuPayFrequency;
      brackets: Array<{ threshold_min: number; threshold_max: number | null; a: number; b: number }>;
      sgRate: number;
      componentByCode: Map<string, { stp2_category: string | null; ote_eligible: boolean; super_eligible: boolean }>;
    } | null = null;
    if (isAU) {
      const { data: setting } = await admin
        .from("tenant_payroll_settings").select("pay_period").eq("tenant_id", run.tenant_id).maybeSingle();
      const rawFreq = (setting as any)?.pay_period as string | undefined;
      const frequency: AuPayFrequency =
        rawFreq === "weekly" || rawFreq === "monthly" ? rawFreq : "fortnightly";
      const { data: brktRows } = await admin
        .from("tax_tables_au")
        .select("threshold_min,threshold_max,a,b,effective_from,effective_to")
        .eq("scale", "2").eq("frequency", frequency)
        .lte("effective_from", run.pay_date)
        .order("effective_from", { ascending: false });
      const activeBr = (brktRows ?? []).filter((r: any) => !r.effective_to || r.effective_to >= run.pay_date);
      const { data: sg } = await admin.rpc("au_sg_rate_on", { _on: run.pay_date } as any);
      const { data: comps } = await admin.from("payroll_components")
        .select("code,stp2_category,ote_eligible,super_eligible")
        .eq("tenant_id", run.tenant_id);
      const componentByCode = new Map<string, any>();
      for (const c of comps ?? []) componentByCode.set((c as any).code, c);
      auCtx = {
        frequency,
        brackets: activeBr.map((r: any) => ({
          threshold_min: Number(r.threshold_min),
          threshold_max: r.threshold_max == null ? null : Number(r.threshold_max),
          a: Number(r.a),
          b: Number(r.b),
        })),
        sgRate: Number(sg ?? 0),
        componentByCode,
      };
    }

    function calcTax(taxable: number): number {
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

    function auOteEligible(code: string): boolean {
      const comp = auCtx?.componentByCode.get(code);
      if (comp) return !!comp.ote_eligible;
      if (code === "BASE") return true;
      if (code.startsWith("OT_") || code === "OVERTIME") return false;
      if (code.startsWith("HOLIDAY_")) return false;
      if (code.startsWith("LEAVE_")) return false;
      return false;
    }
    function auSuperEligible(code: string): boolean {
      const comp = auCtx?.componentByCode.get(code);
      if (comp) return !!comp.super_eligible;
      return auOteEligible(code);
    }


    const payslipsPayload: any[] = [];
    let totGross = 0, totTax = 0, totEC = 0, totER = 0, totNet = 0, totAllow = 0, totDed = 0;
    const fxRate = Number(run.fx_rate ?? 1) || 1;
    const conv = (n: number) => round(n * fxRate, decimals, mode);

    for (const emp of active) {
      const gross = effectivePay.get(emp.id) ?? Number(emp.base_salary ?? 0);
      const ctxVars: Record<string, number> = { gross, base: gross, ytd: 0, rate: 0 };
      const lines: any[] = [{ code: "BASE", label: "Base salary", category: "earning", amount: conv(gross), base: round(gross, decimals, mode), rate: null }];
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
        } catch (e: any) {
          throw new Error(`Line item ${li.code} formula error: ${e.message}`);
        }
        amount = round(amount, decimals, mode);
        if (li.category === "earning" || li.category === "allowance") allowances += amount;
        else if (li.category === "deduction") deductions += amount;
        lines.push({ code: li.code, label: li.label, category: li.category, amount: conv(amount), base: round(gross, decimals, mode), rate });
      }

      // Contributions (skipped for AU — super is handled via SG in the AU branch)
      let employeeContrib = 0, employerContrib = 0;
      if (!isAU) {
        for (const c of activeContribs) {
          const base = Math.max(Number(c.min_base ?? 0), Math.min(gross, c.max_base == null ? gross : Number(c.max_base)));
          const ec = round(base * (Number(c.employee_rate_percent) / 100), decimals, mode);
          const er = round(base * (Number(c.employer_rate_percent) / 100), decimals, mode);
          employeeContrib += ec; employerContrib += er;
          lines.push({ code: `CONTRIB_${c.name}`, label: `${c.name} (employee)`, category: "contribution_employee", amount: conv(ec), base: conv(base), rate: Number(c.employee_rate_percent) });
          lines.push({ code: `CONTRIB_${c.name}_ER`, label: `${c.name} (employer)`, category: "contribution_employer", amount: conv(er), base: conv(base), rate: Number(c.employer_rate_percent) });
        }
      }

      // Overtime line items from approved timesheets
      const ot = otByEmployee.get(emp.id);
      if (ot && monthlyHours > 0) {
        const hourlyRate = gross / monthlyHours;
        // Per-code lines from overtime_breakdown
        for (const [code, hours] of ot.byCode) {
          if (hours <= 0) continue;
          const penalty = penaltyByCode.get(code);
          const mult = penalty ? Number(penalty.rate_multiplier) : otMultiplier;
          const label = penalty?.name ? `Overtime — ${penalty.name}` : `Overtime ${code}`;
          const lineRate = round(hourlyRate * mult, decimals, mode);
          const amount = round(hours * hourlyRate * mult, decimals, mode);
          allowances += amount;
          lines.push({
            code: `OT_${code}`, label, category: "earning",
            amount: conv(amount), base: hours, rate: lineRate,
          });
        }
        // Legacy flat overtime (timesheets without a breakdown)
        if (ot.flatHours > 0) {
          const otRate = round(hourlyRate * otMultiplier, decimals, mode);
          const otAmount = round(ot.flatHours * hourlyRate * otMultiplier, decimals, mode);
          allowances += otAmount;
          lines.push({
            code: "OVERTIME", label: "Overtime", category: "earning",
            amount: conv(otAmount), base: ot.flatHours, rate: otRate,
          });
        }
      }

      // Public-holiday premium pay: hours worked on a public holiday get paid the
      // (multiplier - 1) premium portion (base hours are assumed to already be in salary/OT).
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
            amount: conv(amount), base: hours, rate: lineRate,
          });
        }
      }

      // Approved leave for the period:
      //   - Unpaid leave pro-rates gross down by (dailyRate × unpaid days) per leave type.
      //   - Paid leave appears as an informational $0 line so it surfaces on the payslip.
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
            amount: conv(amount), base: info.days, rate: round(dailyRate, decimals, mode),
          });
        }
        for (const [code, info] of leave.paid) {
          if (info.days <= 0) continue;
          lines.push({
            code: `LEAVE_PAID_${code}`,
            label: `Paid leave — ${info.name} (${info.days}d)`,
            category: "info",
            amount: conv(0), base: info.days, rate: round(dailyRate, decimals, mode),
          });
        }
      }



      let taxableBase: number;
      let incomeTax: number;
      let net: number;

      if (isAU && auCtx) {
        // Build PayLine[] from the current payslip lines and run the AU calc.
        const auLines: AuPayLine[] = lines
          .filter((l) => l.category !== "info" && l.category !== "tax")
          .map((l) => {
            const taxable = l.category === "earning" || l.category === "allowance";
            const sign = l.category === "deduction" ? -1 : 1;
            const code: string = l.code;
            return {
              code,
              amount: sign * Number(l.amount) / fxRate, // un-convert; engine works in tenant currency
              stp2_category: auCtx!.componentByCode.get(code)?.stp2_category ?? null,
              ote_eligible: auOteEligible(code),
              super_eligible: auSuperEligible(code),
              is_taxable: taxable,
            };
          });
        const taxableGuess = auLines.reduce((a, l) => (l.is_taxable ? a + l.amount : a), 0);
        const bracket = auCtx.brackets.find(
          (r) => taxableGuess >= r.threshold_min && (r.threshold_max == null || taxableGuess < r.threshold_max),
        );
        if (!bracket) {
          throw new Error(`No AU PAYG-W bracket for ${auCtx.frequency} taxable=${taxableGuess.toFixed(2)} on ${run.pay_date}`);
        }
        const auResult = computeAuPeriod({
          lines: auLines,
          frequency: auCtx.frequency,
          paygCoeff: { a: bracket.a, b: bracket.b },
          sgRate: auCtx.sgRate,
        });
        taxableBase = round(auResult.taxable, decimals, mode);
        incomeTax = round(auResult.payg, decimals, mode);
        const sg = round(auResult.sg, decimals, mode);
        employerContrib += sg;
        lines.push({
          code: "PAYG_W", label: "PAYG withholding", category: "tax",
          amount: conv(incomeTax), base: conv(taxableBase), rate: null,
        });
        lines.push({
          code: "SUPER_SG", label: `Super Guarantee (${(auCtx.sgRate * 100).toFixed(2)}%)`,
          category: "contribution_employer",
          amount: conv(sg), base: conv(round(auResult.superBase, decimals, mode)),
          rate: Number((auCtx.sgRate * 100).toFixed(2)),
        });
        net = round(auResult.gross - deductions - incomeTax, decimals, mode);
      } else {
        taxableBase = round(gross + allowances - employeeContrib, decimals, mode);
        incomeTax = round(calcTax(taxableBase), decimals, mode);
        lines.push({ code: "INCOME_TAX", label: "Income tax", category: "tax", amount: conv(incomeTax), base: conv(taxableBase), rate: null });
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
        lines,
      });

      totGross += gross; totTax += incomeTax; totEC += employeeContrib; totER += employerContrib;
      totNet += net; totAllow += allowances; totDed += deductions;
    }

    // Replace existing payslips
    await admin.from("payroll_payslips").delete().eq("run_id", run.id);
    if (payslipsPayload.length > 0) {
      const { error: ie } = await admin.from("payroll_payslips").insert(payslipsPayload);
      if (ie) { console.error("[payroll.compute] payslips insert error:", ie.message, ie.code); throw new Error("Failed to save computed payslips. Please try again."); }
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
      fx_rate: fxRate,
    };

    const { error: uerr } = await admin.from("payroll_runs").update({
      status: "computed", template_id: tplId, totals, computed_at: new Date().toISOString(),
    }).eq("id", run.id);
    if (uerr) { console.error("[payroll.compute] run update error:", uerr.message, uerr.code); throw new Error("Failed to finalize payroll computation. Please try again."); }

    await admin.from("audit_log").insert({
      actor_id: userId, entity_type: "payroll_run", entity_id: run.id,
      action: "compute", metadata: { totals, employee_count: payslipsPayload.length },
    });

    return { totals, employeeCount: payslipsPayload.length };
  });

// ---------- Submit / Approve / Reject / Cancel / Delete ----------
async function assertApproverForTenant(ctxSupabase: any, userId: string, tenantId: string) {
  const { data: roles } = await ctxSupabase.from("user_roles").select("role").eq("user_id", userId);
  const rs = (roles ?? []).map((r: any) => r.role);
  if (rs.includes("super_admin")) return;
  if (!rs.includes("manager")) throw new Error("Forbidden: manager role required");
  const { data: profile } = await ctxSupabase.from("profiles").select("tenant_id").eq("id", userId).maybeSingle();
  if (!profile || profile.tenant_id !== tenantId) throw new Error("Forbidden: tenant mismatch");
}

export const submitPayrollRun = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ runId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const admin = await loadAdmin();
    const { data: run } = await admin.from("payroll_runs").select("*").eq("id", data.runId).maybeSingle();
    if (!run) throw new Error("Run not found");
    if (run.status !== "computed") throw new Error("Only computed runs can be submitted for approval");
    await assertOrgAdminForTenant(supabase, userId, run.tenant_id);
    const { error } = await admin.from("payroll_runs").update({
      status: "pending_approval", submitted_by: userId, submitted_at: new Date().toISOString(),
    }).eq("id", run.id);
    if (error) { console.error("[payroll.submit] DB error:", error.message, error.code); throw new Error("Failed to submit payroll run for approval."); }
    await admin.from("audit_log").insert({
      actor_id: userId, entity_type: "payroll_run", entity_id: run.id, action: "submit_for_approval", metadata: {},
    });
    return { ok: true };
  });

export const approvePayrollRun = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ runId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const admin = await loadAdmin();
    const { data: run } = await admin.from("payroll_runs").select("*").eq("id", data.runId).maybeSingle();
    if (!run) throw new Error("Run not found");
    if (run.status !== "pending_approval") throw new Error("Only runs pending approval can be approved");
    await assertApproverForTenant(supabase, userId, run.tenant_id);
    if (run.submitted_by && run.submitted_by === userId) {
      throw new Error("Approver must be different from the person who submitted the run");
    }
    const { error } = await admin.from("payroll_runs").update({
      status: "approved", approved_by: userId, approved_at: new Date().toISOString(),
    }).eq("id", run.id);
    if (error) { console.error("[payroll.approve] DB error:", error.message, error.code); throw new Error("Failed to approve payroll run."); }
    // Consume approved-overtime timesheets so they can't be paid again on a future run.
    await admin.from("timesheets").update({ consumed_by_run_id: run.id })
      .eq("tenant_id", run.tenant_id).eq("status", "approved")
      .is("consumed_by_run_id", null)
      .gte("period_start", run.period_start).lte("period_end", run.period_end);
    await admin.from("audit_log").insert({
      actor_id: userId, entity_type: "payroll_run", entity_id: run.id, action: "approve",
      metadata: { submitted_by: run.submitted_by },
    });
    return { ok: true };
  });

export const rejectPayrollRun = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ runId: z.string().uuid(), reason: z.string().max(2000).optional() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const admin = await loadAdmin();
    const { data: run } = await admin.from("payroll_runs").select("*").eq("id", data.runId).maybeSingle();
    if (!run) throw new Error("Run not found");
    if (run.status !== "pending_approval") throw new Error("Only runs pending approval can be rejected");
    await assertApproverForTenant(supabase, userId, run.tenant_id);
    const { error } = await admin.from("payroll_runs").update({
      status: "computed", submitted_by: null, submitted_at: null,
    }).eq("id", run.id);
    if (error) { console.error("[payroll.reject] DB error:", error.message, error.code); throw new Error("Failed to reject payroll run."); }
    await admin.from("audit_log").insert({
      actor_id: userId, entity_type: "payroll_run", entity_id: run.id, action: "reject",
      metadata: { reason: data.reason ?? null },
    });
    return { ok: true };
  });

export const cancelPayrollRun = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ runId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const admin = await loadAdmin();
    const { data: run } = await admin.from("payroll_runs").select("*").eq("id", data.runId).maybeSingle();
    if (!run) throw new Error("Run not found");
    if (run.status === "approved") throw new Error("Approved runs cannot be cancelled");
    await assertOrgAdminForTenant(supabase, userId, run.tenant_id);
    const { error } = await admin.from("payroll_runs").update({ status: "cancelled" }).eq("id", run.id);
    if (error) { console.error("[payroll.cancel] DB error:", error.message, error.code); throw new Error("Failed to cancel payroll run."); }
    await admin.from("audit_log").insert({
      actor_id: userId, entity_type: "payroll_run", entity_id: run.id, action: "cancel", metadata: {},
    });
    return { ok: true };
  });

export const deletePayrollRun = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ runId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const admin = await loadAdmin();
    const { data: run } = await admin.from("payroll_runs").select("*").eq("id", data.runId).maybeSingle();
    if (!run) throw new Error("Run not found");
    if (run.status === "approved") throw new Error("Approved runs cannot be deleted");
    await assertOrgAdminForTenant(supabase, userId, run.tenant_id);
    const { error } = await admin.from("payroll_runs").delete().eq("id", run.id);
    if (error) { console.error("[payroll.delete] DB error:", error.message, error.code); throw new Error("Failed to delete payroll run."); }
    await admin.from("audit_log").insert({
      actor_id: userId, entity_type: "payroll_run", entity_id: run.id, action: "delete", metadata: {},
    });
    return { ok: true };
  });
