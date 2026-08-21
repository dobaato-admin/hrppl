import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/lib/auth-guard";

export type GlobalSearchResult = {
  employees: { id: string; label: string; sub: string }[];
  variations: { id: string; label: string; sub: string }[];
  tasks: { id: string; assignment_id: string; label: string; sub: string }[];
  timesheets: { id: string; label: string; sub: string }[];
};

export const globalSearch = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ q: z.string().trim().min(2).max(100) }).parse(d),
  )
  .handler(async ({ data, context }): Promise<GlobalSearchResult> => {
    const { supabase, userId } = context as any;
    const { data: me } = await supabase
      .from("employees").select("tenant_id").eq("user_id", userId).maybeSingle();
    const tenantId = me?.tenant_id ?? null;
    const q = data.q;
    const like = `%${q}%`;
    const out: GlobalSearchResult = { employees: [], variations: [], tasks: [], timesheets: [] };
    if (!tenantId) return out;

    // Employees
    const { data: emps } = await supabase
      .from("employees")
      .select("id, first_name, last_name, employee_number, email, job_title")
      .eq("tenant_id", tenantId)
      .or(
        `first_name.ilike.${like},last_name.ilike.${like},employee_number.ilike.${like},email.ilike.${like}`,
      )
      .limit(5);
    out.employees = (emps ?? []).map((e: any) => ({
      id: e.id,
      label: `${e.first_name ?? ""} ${e.last_name ?? ""}`.trim() || (e.email ?? "Employee"),
      sub: [e.employee_number ? `#${e.employee_number}` : null, e.job_title]
        .filter(Boolean).join(" · "),
    }));

    // Variations
    const { data: vars } = await supabase
      .from("employment_variations")
      .select("id, variation_type, status, employee:employee_id(first_name, last_name, tenant_id)")
      .limit(20);
    out.variations = (vars ?? [])
      .filter((v: any) => v.employee?.tenant_id === tenantId)
      .filter((v: any) => {
        const name = `${v.employee?.first_name ?? ""} ${v.employee?.last_name ?? ""}`.toLowerCase();
        return name.includes(q.toLowerCase()) || String(v.variation_type ?? "").toLowerCase().includes(q.toLowerCase());
      })
      .slice(0, 5)
      .map((v: any) => ({
        id: v.id,
        label: `${v.employee?.first_name ?? ""} ${v.employee?.last_name ?? ""}`.trim(),
        sub: `${v.variation_type} · ${v.status}`,
      }));

    // Onboarding control room tasks
    const { data: tasks } = await supabase
      .from("onboarding_control_room_tasks")
      .select("id, title, owner_role, status, assignment_id, assignment:assignment_id(employee:employee_id(first_name, last_name, tenant_id))")
      .ilike("title", like)
      .limit(20);
    out.tasks = (tasks ?? [])
      .filter((t: any) => t.assignment?.employee?.tenant_id === tenantId)
      .slice(0, 5)
      .map((t: any) => {
        const emp = t.assignment?.employee;
        const name = emp ? `${emp.first_name ?? ""} ${emp.last_name ?? ""}`.trim() : "";
        return {
          id: t.id,
          assignment_id: t.assignment_id,
          label: t.title,
          sub: [name, t.owner_role, t.status].filter(Boolean).join(" · "),
        };
      });

    // Timesheets
    const { data: ts } = await supabase
      .from("timesheets")
      .select("id, period_start, period_end, status, employee:employee_id(first_name, last_name, tenant_id)")
      .order("period_start", { ascending: false })
      .limit(30);
    out.timesheets = (ts ?? [])
      .filter((t: any) => t.employee?.tenant_id === tenantId)
      .filter((t: any) => {
        const name = `${t.employee?.first_name ?? ""} ${t.employee?.last_name ?? ""}`.toLowerCase();
        return name.includes(q.toLowerCase());
      })
      .slice(0, 5)
      .map((t: any) => ({
        id: t.id,
        label: `${t.employee?.first_name ?? ""} ${t.employee?.last_name ?? ""}`.trim(),
        sub: `${t.period_start} → ${t.period_end} · ${t.status}`,
      }));

    return out;
  });
