import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/lib/auth-guard";

async function getCtx(context: any) {
  const { supabase, userId } = context;
  const { data: prof } = await supabase.from("profiles").select("tenant_id").eq("id", userId).maybeSingle();
  if (!prof?.tenant_id) throw new Error("No organisation");
  const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", userId);
  const r = (roles ?? []).map((x: any) => x.role as string);
  const isReviewer = r.some((x: string) => ["org_admin", "super_admin", "manager"].includes(x));
  return { tenantId: prof.tenant_id as string, isReviewer, userId, supabase };
}

export const getDutyReview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({
    employeeId: z.string().uuid(),
    cycleLabel: z.string().trim().min(1).max(60),
  }).parse(d))
  .handler(async ({ data, context }) => {
    const { tenantId, isReviewer, supabase } = await getCtx(context);
    if (!isReviewer) throw new Error("Manager / admin only");

    const { data: emp } = await supabase
      .from("employees").select("id, first_name, last_name, email, job_title")
      .eq("id", data.employeeId).eq("tenant_id", tenantId).maybeSingle();
    if (!emp) throw new Error("Employee not found");

    const { data: duties } = await supabase
      .from("employee_duties")
      .select("id, title, description, weight, kpi_target, is_active")
      .eq("employee_id", data.employeeId)
      .eq("is_active", true)
      .order("sort_order");

    const { data: scores } = await supabase
      .from("duty_review_scores")
      .select("id, duty_id, score, comments, updated_at")
      .eq("employee_id", data.employeeId)
      .eq("cycle_label", data.cycleLabel);

    const scoreByDuty = new Map<string, any>();
    for (const s of (scores ?? []) as any[]) scoreByDuty.set(s.duty_id, s);

    const items = (duties ?? []).map((d: any) => ({
      duty: d,
      score: scoreByDuty.get(d.id)?.score ?? null,
      comments: scoreByDuty.get(d.id)?.comments ?? "",
      scoreId: scoreByDuty.get(d.id)?.id ?? null,
    }));

    const totalWeight = items.reduce((s: number, it: any) => s + Number(it.duty.weight || 0), 0);
    const weightedTotal = items.reduce((sum: number, it: any) => {
      if (it.score == null) return sum;
      return sum + (Number(it.score) * Number(it.duty.weight || 0));
    }, 0);
    const finalScore = totalWeight > 0 ? weightedTotal / totalWeight : null;

    return { employee: emp, items, totalWeight, finalScore };
  });

const upsertSchema = z.object({
  employeeId: z.string().uuid(),
  dutyId: z.string().uuid(),
  cycleLabel: z.string().trim().min(1).max(60),
  score: z.number().min(0).max(100),
  comments: z.string().trim().max(2000).optional().default(""),
});

async function assertCycleOpen(supabase: any, tenantId: string, cycleLabel: string) {
  const today = new Date().toISOString().slice(0, 10);
  const { data: cycle } = await supabase
    .from("kpi_review_cycles")
    .select("status, starts_on, ends_on")
    .eq("tenant_id", tenantId).eq("label", cycleLabel).maybeSingle();
  if (!cycle) throw new Error(`Cycle "${cycleLabel}" does not exist. Create it first.`);
  if (cycle.status !== "open") throw new Error(`Cycle "${cycleLabel}" is not open for submissions.`);
  if (today < cycle.starts_on || today > cycle.ends_on) throw new Error("Today is outside the cycle date window.");
}

export const upsertDutyScore = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => upsertSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { tenantId, isReviewer, supabase, userId } = await getCtx(context);
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
      submitter_kind: "reviewer",
    };
    const { error } = await supabase
      .from("duty_review_scores")
      .upsert(payload, { onConflict: "employee_id,duty_id,cycle_label" } as any);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const submitMyDutyScore = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({
    dutyId: z.string().uuid(),
    cycleLabel: z.string().trim().min(1).max(60),
    score: z.number().min(0).max(100),
    comments: z.string().trim().max(2000).optional().default(""),
  }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    const { data: prof } = await supabase.from("profiles").select("tenant_id").eq("id", userId).maybeSingle();
    if (!prof?.tenant_id) throw new Error("No organisation");
    const { data: emp } = await supabase.from("employees").select("id, tenant_id").eq("user_id", userId).maybeSingle();
    if (!emp) throw new Error("Employee record not found");
    await assertCycleOpen(supabase, emp.tenant_id, data.cycleLabel);
    const { data: duty } = await supabase.from("employee_duties").select("id, employee_id").eq("id", data.dutyId).maybeSingle();
    if (!duty || duty.employee_id !== emp.id) throw new Error("This duty is not assigned to you.");
    const { error } = await supabase
      .from("duty_review_scores")
      .upsert({
        tenant_id: emp.tenant_id,
        employee_id: emp.id,
        duty_id: data.dutyId,
        cycle_label: data.cycleLabel,
        score: data.score,
        comments: data.comments || null,
        submitter_kind: "self",
      }, { onConflict: "employee_id,duty_id,cycle_label" } as any);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const getMyDutyReview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ cycleLabel: z.string().trim().min(1).max(60) }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    const { data: emp } = await supabase.from("employees").select("id, tenant_id, first_name, last_name").eq("user_id", userId).maybeSingle();
    if (!emp) return { items: [], cycle: null };
    const { data: cycle } = await supabase.from("kpi_review_cycles")
      .select("id, label, starts_on, ends_on, status")
      .eq("tenant_id", emp.tenant_id).eq("label", data.cycleLabel).maybeSingle();
    const { data: duties } = await supabase
      .from("employee_duties")
      .select("id, title, description, weight, kpi_target")
      .eq("employee_id", emp.id).eq("is_active", true).order("sort_order");
    const { data: scores } = await supabase
      .from("duty_review_scores")
      .select("duty_id, score, comments, submitter_kind, updated_at")
      .eq("employee_id", emp.id).eq("cycle_label", data.cycleLabel);
    const map = new Map<string, any>();
    for (const s of (scores ?? []) as any[]) {
      const existing = map.get(s.duty_id);
      if (!existing || s.submitter_kind === "self") map.set(s.duty_id, s);
    }
    return {
      cycle,
      employee: emp,
      items: (duties ?? []).map((d: any) => ({ duty: d, score: map.get(d.id)?.score ?? null, comments: map.get(d.id)?.comments ?? "", submitter_kind: map.get(d.id)?.submitter_kind ?? null })),
    };
  });

export const exportDutyReviewCsv = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ cycleLabel: z.string().trim().min(1).max(60) }).parse(d))
  .handler(async ({ data, context }) => {
    const { tenantId, isReviewer, supabase } = await getCtx(context);
    if (!isReviewer) throw new Error("Manager / admin only");
    const { data: scores } = await supabase
      .from("duty_review_scores")
      .select("score, comments, submitter_kind, updated_at, cycle_label, employee:employees!inner(id, first_name, last_name, email, job_title), duty:employee_duties!inner(id, title, weight, kpi_target)")
      .eq("tenant_id", tenantId)
      .eq("cycle_label", data.cycleLabel);
    const rows = (scores ?? []) as any[];

    // Group by employee to compute weighted final
    const byEmp = new Map<string, any>();
    for (const r of rows) {
      const eid = r.employee.id;
      if (!byEmp.has(eid)) byEmp.set(eid, { employee: r.employee, lines: [] });
      byEmp.get(eid).lines.push(r);
    }

    const header = ["Employee","Email","Job title","Cycle","Duty","Weight%","Target","Submitter","Score","Weighted","Comments","Updated"];
    const csvLines = [header.join(",")];
    const esc = (v: any) => {
      const s = v == null ? "" : String(v);
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const summary: any[] = [];
    for (const [, grp] of byEmp) {
      let totalW = 0, weighted = 0;
      for (const ln of grp.lines) {
        const w = Number(ln.duty.weight || 0);
        totalW += w;
        if (ln.score != null) weighted += Number(ln.score) * w;
        csvLines.push([
          `${grp.employee.first_name ?? ""} ${grp.employee.last_name ?? ""}`.trim(),
          grp.employee.email ?? "",
          grp.employee.job_title ?? "",
          data.cycleLabel,
          ln.duty.title,
          w,
          ln.duty.kpi_target ?? "",
          ln.submitter_kind,
          ln.score ?? "",
          ln.score != null ? ((Number(ln.score) * w) / 100).toFixed(2) : "",
          ln.comments ?? "",
          ln.updated_at ?? "",
        ].map(esc).join(","));
      }
      const final = totalW > 0 ? weighted / totalW : null;
      summary.push({ employee: grp.employee, final, totalW });
    }
    csvLines.push("");
    csvLines.push(["Employee","Email","Cycle","Total weight%","Final score /100"].join(","));
    for (const s of summary) {
      csvLines.push([
        `${s.employee.first_name ?? ""} ${s.employee.last_name ?? ""}`.trim(),
        s.employee.email ?? "",
        data.cycleLabel,
        s.totalW,
        s.final == null ? "" : s.final.toFixed(2),
      ].map(esc).join(","));
    }
    return { csv: csvLines.join("\n"), filename: `duty-review-${data.cycleLabel}.csv` };
  });

/** Structured export consumed by the client-side PDF generator. */
export const getDutyReviewExportData = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ cycleLabel: z.string().trim().min(1).max(60) }).parse(d))
  .handler(async ({ data, context }) => {
    const { tenantId, isReviewer, supabase } = await getCtx(context);
    if (!isReviewer) throw new Error("Manager / admin only");

    const { data: tenant } = await supabase.from("tenants").select("name").eq("id", tenantId).maybeSingle();
    const { data: cycle } = await supabase.from("kpi_review_cycles")
      .select("label, starts_on, ends_on, status").eq("tenant_id", tenantId).eq("label", data.cycleLabel).maybeSingle();

    const { data: scores } = await supabase
      .from("duty_review_scores")
      .select("score, comments, submitter_kind, updated_at, employee:employees!inner(id, first_name, last_name, email, job_title), duty:employee_duties!inner(id, title, weight, kpi_target)")
      .eq("tenant_id", tenantId)
      .eq("cycle_label", data.cycleLabel);

    const byEmp = new Map<string, any>();
    for (const r of (scores ?? []) as any[]) {
      const eid = r.employee.id;
      if (!byEmp.has(eid)) byEmp.set(eid, { employee: r.employee, lines: [] });
      byEmp.get(eid).lines.push(r);
    }
    const employees = Array.from(byEmp.values()).map((g: any) => {
      let totalW = 0, weighted = 0;
      for (const ln of g.lines) {
        const w = Number(ln.duty.weight || 0);
        totalW += w;
        if (ln.score != null) weighted += Number(ln.score) * w;
      }
      return {
        employee: g.employee,
        lines: g.lines.map((ln: any) => ({
          duty_title: ln.duty.title,
          weight: Number(ln.duty.weight || 0),
          target: ln.duty.kpi_target ?? null,
          submitter: ln.submitter_kind,
          score: ln.score == null ? null : Number(ln.score),
          weighted_contribution: ln.score != null ? Number(((Number(ln.score) * Number(ln.duty.weight || 0)) / 100).toFixed(2)) : null,
          comments: ln.comments ?? "",
          updated_at: ln.updated_at,
        })),
        total_weight: totalW,
        final_score: totalW > 0 ? Number((weighted / totalW).toFixed(2)) : null,
      };
    }).sort((a, b) => `${a.employee.last_name ?? ""}`.localeCompare(`${b.employee.last_name ?? ""}`));

    return {
      tenant_name: tenant?.name ?? "Organisation",
      cycle: cycle ?? { label: data.cycleLabel, starts_on: null, ends_on: null, status: null },
      generated_at: new Date().toISOString(),
      employees,
    };
  });


export const listMyDutyReviews = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context as any;
    const { data: emp } = await supabase.from("employees").select("id").eq("user_id", userId).maybeSingle();
    if (!emp) return { reviews: [] };
    const { data, error } = await supabase
      .from("duty_review_scores")
      .select("id, duty_id, cycle_label, score, comments, updated_at, duty:employee_duties(id, title, weight, kpi_target)")
      .eq("employee_id", emp.id)
      .order("cycle_label", { ascending: false });
    if (error) throw new Error(error.message);
    return { reviews: data ?? [] };
  });
