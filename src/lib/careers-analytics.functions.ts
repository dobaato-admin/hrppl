import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import { requireSupabaseAuth } from "@/lib/auth-guard";
import type { Database } from "@/integrations/supabase/types";

function getPublicClient() {
  return createClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
    { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
  );
}

const EventType = z.enum(["site_view", "job_view", "apply_start", "apply_submit"]);

// Public anonymous tracking endpoint
export const trackCareersEvent = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z.object({
      tenant_slug: z.string().trim().min(1).max(120),
      job_id: z.string().uuid().optional(),
      event_type: EventType,
      session_id: z.string().max(80).optional(),
      referrer: z.string().max(500).optional(),
      user_agent: z.string().max(500).optional(),
      metadata: z.record(z.string(), z.any()).optional(),
    }).parse(d),
  )
  .handler(async ({ data }) => {
    const sb = getPublicClient();
    const { data: site } = await sb
      .from("tenant_careers_settings")
      .select("tenant_id, is_enabled")
      .eq("public_slug", data.tenant_slug)
      .maybeSingle();
    if (!site?.tenant_id || !site.is_enabled) return { ok: false };
    await sb.from("careers_analytics_events").insert({
      tenant_id: site.tenant_id,
      job_id: data.job_id ?? null,
      event_type: data.event_type,
      session_id: data.session_id ?? null,
      referrer: data.referrer ?? null,
      user_agent: data.user_agent ?? null,
      metadata: data.metadata ?? {},
    });
    return { ok: true };
  });

// Admin: aggregated analytics for the current tenant
export const getCareersAnalytics = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ days: z.number().int().min(1).max(365).default(30) }).partial().parse(d ?? {}),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    const { data: emp } = await supabase
      .from("employees").select("tenant_id").eq("user_id", userId).maybeSingle();
    if (!emp?.tenant_id) return { totals: null, perJob: [], series: [] };

    const days = data?.days ?? 30;
    const since = new Date(Date.now() - days * 86400_000).toISOString();

    const { data: rows, error } = await supabase
      .from("careers_analytics_events")
      .select("event_type, job_id, created_at")
      .eq("tenant_id", emp.tenant_id)
      .gte("created_at", since)
      .limit(10000);
    if (error) throw new Error(error.message);

    const totals = { site_view: 0, job_view: 0, apply_start: 0, apply_submit: 0 };
    const perJob: Record<string, { job_view: number; apply_start: number; apply_submit: number }> = {};
    const byDay: Record<string, { job_view: number; apply_start: number; apply_submit: number }> = {};
    for (const r of rows ?? []) {
      const t = r.event_type as keyof typeof totals;
      if (t in totals) totals[t] += 1;
      if (r.job_id && (t === "job_view" || t === "apply_start" || t === "apply_submit")) {
        perJob[r.job_id] ??= { job_view: 0, apply_start: 0, apply_submit: 0 };
        (perJob[r.job_id] as any)[t] += 1;
      }
      const day = String(r.created_at).slice(0, 10);
      byDay[day] ??= { job_view: 0, apply_start: 0, apply_submit: 0 };
      if (t === "job_view" || t === "apply_start" || t === "apply_submit") {
        (byDay[day] as any)[t] += 1;
      }
    }

    const jobIds = Object.keys(perJob);
    let jobsMap: Record<string, { title: string; public_slug: string | null }> = {};
    if (jobIds.length) {
      const { data: jobs } = await supabase
        .from("recruitment_jobs")
        .select("id, title, public_slug")
        .in("id", jobIds);
      for (const j of jobs ?? []) jobsMap[(j as any).id] = j as any;
    }

    const perJobArr = jobIds.map((id) => {
      const c = perJob[id];
      const conversion = c.job_view ? Math.round((c.apply_submit / c.job_view) * 1000) / 10 : 0;
      const startRate = c.job_view ? Math.round((c.apply_start / c.job_view) * 1000) / 10 : 0;
      return {
        job_id: id,
        title: jobsMap[id]?.title ?? "(deleted job)",
        public_slug: jobsMap[id]?.public_slug ?? null,
        ...c,
        start_rate_pct: startRate,
        conversion_pct: conversion,
      };
    }).sort((a, b) => b.job_view - a.job_view);

    const series = Object.entries(byDay)
      .sort(([a], [b]) => (a < b ? -1 : 1))
      .map(([day, v]) => ({ day, ...v }));

    const overallConv = totals.job_view
      ? Math.round((totals.apply_submit / totals.job_view) * 1000) / 10
      : 0;

    return { totals: { ...totals, conversion_pct: overallConv }, perJob: perJobArr, series, days };
  });
