import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/lib/auth-guard";
import { enforcePublicRateLimit } from "@/lib/rate-limit.functions";

const leadSchema = z.object({
  full_name: z.string().trim().min(1).max(120),
  work_email: z.string().trim().email().max(255),
  company: z.string().trim().min(1).max(200),
  country: z.string().trim().max(100).optional().nullable(),
  phone: z.string().trim().max(40).optional().nullable(),
  role: z.string().trim().max(120).optional().nullable(),
  company_size: z.string().trim().max(40).optional().nullable(),
  employee_count: z.number().int().min(0).max(10_000_000).optional().nullable(),
  current_payroll_system: z.string().trim().max(160).optional().nullable(),
  message: z.string().trim().max(2000).optional().nullable(),
  source: z.string().trim().max(80).optional().nullable(),
  utm_source: z.string().trim().max(120).optional().nullable(),
  utm_medium: z.string().trim().max(120).optional().nullable(),
  utm_campaign: z.string().trim().max(120).optional().nullable(),
});

export type LeadInput = z.infer<typeof leadSchema>;

export const submitLead = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => leadSchema.parse(data))
  .handler(async ({ data }) => {
    // Marketing lead capture; a real prospect submits once.
    await enforcePublicRateLimit("public_lead", 5, 3600);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("leads").insert({
      ...data,
      status: "new",
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const listLeads = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data: roleRow } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "super_admin")
      .maybeSingle();
    if (!roleRow) throw new Error("Forbidden");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const updateLeadStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({
      id: z.string().uuid(),
      status: z.enum(["new", "contacted", "qualified", "won", "lost"]),
      notes: z.string().max(2000).optional().nullable(),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: roleRow } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "super_admin")
      .maybeSingle();
    if (!roleRow) throw new Error("Forbidden");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("leads")
      .update({ status: data.status, notes: data.notes ?? null })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
