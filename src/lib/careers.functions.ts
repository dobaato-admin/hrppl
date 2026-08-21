import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import DOMPurify from "isomorphic-dompurify";
import { requireSupabaseAuth } from "@/lib/auth-guard";
import type { Database } from "@/integrations/supabase/types";

const ABOUT_SANITIZE = {
  ALLOWED_TAGS: ["h1", "h2", "h3", "h4", "p", "strong", "em", "ul", "ol", "li", "a", "br", "blockquote"],
  ALLOWED_ATTR: ["href", "target", "rel"],
};

function getPublicClient() {
  return createClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
    { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
  );
}

// -------- Public (anon) reads --------
export const getCareersByTenantSlug = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) =>
    z.object({ tenant_slug: z.string().trim().min(1).max(120) }).parse(d),
  )
  .handler(async ({ data }) => {
    const sb = getPublicClient();
    const { data: site, error: siteErr } = await sb
      .from("tenant_careers_settings")
      .select("tenant_id, public_slug, headline, about_html, brand_color, hero_image_url, is_enabled")
      .eq("public_slug", data.tenant_slug)
      .eq("is_enabled", true)
      .maybeSingle();
    if (siteErr) throw new Error(siteErr.message);
    if (!site) return { site: null, jobs: [] };

    const { data: jobs, error: jobsErr } = await sb
      .from("recruitment_jobs")
      .select("id, title, public_slug, public_summary, employment_type, location, department_id, published_at")
      .eq("tenant_id", site.tenant_id)
      .eq("is_published", true)
      .order("published_at", { ascending: false });
    if (jobsErr) throw new Error(jobsErr.message);

    return { site, jobs: jobs ?? [] };
  });

export const getJobBySlug = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) =>
    z
      .object({
        tenant_slug: z.string().trim().min(1).max(120),
        job_slug: z.string().trim().min(1).max(200),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const sb = getPublicClient();
    const { data: site } = await sb
      .from("tenant_careers_settings")
      .select("tenant_id, public_slug, headline, brand_color")
      .eq("public_slug", data.tenant_slug)
      .eq("is_enabled", true)
      .maybeSingle();
    if (!site) return { site: null, job: null };

    const { data: job } = await sb
      .from("recruitment_jobs")
      .select(
        "id, title, public_slug, public_summary, description_html, requirements_html, employment_type, location, department_id, salary_min, salary_max, currency, published_at",
      )
      .eq("tenant_id", site.tenant_id)
      .eq("public_slug", data.job_slug)
      .eq("is_published", true)
      .maybeSingle();

    return { site, job: job ?? null };
  });

// -------- Admin --------
export const getCareersSettings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context as any;
    const { data: emp } = await supabase
      .from("employees")
      .select("tenant_id")
      .eq("user_id", userId)
      .maybeSingle();
    if (!emp?.tenant_id) return { settings: null, jobs: [] };
    const { data: settings } = await supabase
      .from("tenant_careers_settings")
      .select("*")
      .eq("tenant_id", emp.tenant_id)
      .maybeSingle();
    const { data: jobs } = await supabase
      .from("recruitment_jobs")
      .select("id, title, public_slug, is_published, published_at, public_summary")
      .eq("tenant_id", emp.tenant_id)
      .order("created_at", { ascending: false })
      .limit(200);
    return { settings, jobs: jobs ?? [], tenant_id: emp.tenant_id };
  });

export const updateCareersSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        public_slug: z
          .string()
          .trim()
          .min(2)
          .max(80)
          .regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers, and dashes only"),
        headline: z.string().trim().max(200).nullable().optional(),
        about_html: z.string().trim().max(10000).nullable().optional(),
        brand_color: z
          .string()
          .regex(/^#[0-9A-Fa-f]{6}$/)
          .default("#0F172A"),
        hero_image_url: z.string().url().nullable().optional(),
        is_enabled: z.boolean().default(false),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    const { data: emp } = await supabase
      .from("employees")
      .select("tenant_id")
      .eq("user_id", userId)
      .maybeSingle();
    if (!emp?.tenant_id) throw new Error("Tenant not found");

    const { error } = await supabase
      .from("tenant_careers_settings")
      .upsert(
        {
          tenant_id: emp.tenant_id,
          public_slug: data.public_slug,
          headline: data.headline ?? null,
          about_html: data.about_html ? DOMPurify.sanitize(data.about_html, ABOUT_SANITIZE) : null,
          brand_color: data.brand_color,
          hero_image_url: data.hero_image_url ?? null,
          is_enabled: data.is_enabled,
        },
        { onConflict: "tenant_id" },
      );
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const updateJobPublication = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        id: z.string().uuid(),
        is_published: z.boolean(),
        public_slug: z
          .string()
          .trim()
          .min(2)
          .max(120)
          .regex(/^[a-z0-9-]+$/)
          .nullable()
          .optional(),
        public_summary: z.string().trim().max(2000).nullable().optional(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase } = context as any;
    const payload: Record<string, any> = {
      is_published: data.is_published,
      published_at: data.is_published ? new Date().toISOString() : null,
    };
    if (data.public_slug !== undefined) payload.public_slug = data.public_slug;
    if (data.public_summary !== undefined) payload.public_summary = data.public_summary;
    const { error } = await supabase
      .from("recruitment_jobs")
      .update(payload)
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
