import { createFileRoute } from "@tanstack/react-router";

import { z } from "zod";

const ApiPostSchema = z.object({
  title: z.string().min(1).max(200),
  slug: z.string().min(1).max(120).regex(/^[a-z0-9-]+$/).optional(),
  excerpt: z.string().max(400).optional().nullable(),
  content_md: z.string().max(200_000).default(""),
  cover_image_url: z.string().url().max(2048).optional().nullable(),
  tags: z.array(z.string().min(1).max(40)).max(20).default([]),
  category_slug: z.string().min(1).max(60).optional().nullable(),
  status: z.enum(["draft", "scheduled", "published"]).default("draft"),
  scheduled_for: z.string().datetime().optional().nullable(),
  seo_title: z.string().max(200).optional().nullable(),
  seo_description: z.string().max(300).optional().nullable(),
  og_image_url: z.string().url().max(2048).optional().nullable(),
  canonical_url: z.string().url().max(2048).optional().nullable(),
  external_source: z.string().max(60).optional().nullable(),
  external_ref: z.string().max(200).optional().nullable(),
});

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);

function mdToHtml(md: string): string {
  if (!md) return "";
  const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  const lines = md.split(/\r?\n/);
  let html = "", inUl = false;
  const close = () => { if (inUl) { html += "</ul>"; inUl = false; } };
  const inline = (s: string) => esc(s)
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    .replace(/\[([^\]]+)\]\((https?:[^)]+)\)/g, '<a href="$2" rel="noopener" target="_blank">$1</a>');
  for (const raw of lines) {
    const line = raw.trimEnd();
    if (!line.trim()) { close(); continue; }
    const h = /^(#{1,4})\s+(.*)$/.exec(line);
    if (h) { close(); html += `<h${h[1].length}>${inline(h[2])}</h${h[1].length}>`; continue; }
    if (/^[-*]\s+/.test(line)) { if (!inUl) { html += "<ul>"; inUl = true; } html += `<li>${inline(line.replace(/^[-*]\s+/, ""))}</li>`; continue; }
    close();
    html += `<p>${inline(line)}</p>`;
  }
  close();
  return html;
}

function jsonHeaders() {
  return {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, x-api-key",
  };
}
const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: jsonHeaders() });

async function authenticate(request: Request, method: string, requiredScope: string) {
  const { authenticateBlogApi } = await import("@/lib/blog-api-auth.server");
  return authenticateBlogApi(request, "/api/public/blog/posts", method, requiredScope);
}

async function enqueueWebhook(event: string, post: Record<string, unknown>) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: hooks } = await supabaseAdmin
    .from("blog_webhooks").select("id,events").eq("active", true);
  const matches = (hooks ?? []).filter((h) => (h.events as string[]).includes(event));
  if (!matches.length) return;
  const payload = { event, occurred_at: new Date().toISOString(), data: { post } } as unknown as Record<string, unknown>;
  await supabaseAdmin.from("blog_webhook_deliveries").insert(
    matches.map((h) => ({ webhook_id: h.id, event, payload, status: "pending", next_retry_at: new Date().toISOString() })) as never,
  );
}

export const Route = createFileRoute("/api/public/blog/posts")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: jsonHeaders() }),
      GET: async ({ request }) => {
        const auth = await authenticate(request, "GET", "posts:read");
        if ("error" in auth) return auth.error;
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const url = new URL(request.url);
        const limit = Math.min(Number(url.searchParams.get("limit") ?? 25), 100);
        const status = url.searchParams.get("status");
        const slug = url.searchParams.get("slug");
        let q = supabaseAdmin.from("blog_posts").select("*").order("updated_at", { ascending: false }).limit(limit);
        if (status) q = q.eq("status", status as "draft" | "scheduled" | "published" | "archived");
        if (slug) q = q.eq("slug", slug);
        const { data, error } = await q;
        if (error) return json(500, { error: error.message });
        return json(200, { posts: data });
      },
      POST: async ({ request }) => {
        const auth = await authenticate(request, "POST", "posts:write");
        if ("error" in auth) return auth.error;
        let body: unknown;
        try { body = await request.json(); } catch { return json(400, { error: "Invalid JSON" }); }
        const parsed = ApiPostSchema.safeParse(body);
        if (!parsed.success) return json(400, { error: "Validation failed", details: parsed.error.flatten() });
        const d = parsed.data;
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        let category_id: string | null = null;
        if (d.category_slug) {
          const { data: c } = await supabaseAdmin
            .from("blog_categories").select("id").eq("slug", d.category_slug).maybeSingle();
          category_id = c?.id ?? null;
        }
        const slug = d.slug ?? slugify(d.title);
        const content_html = mdToHtml(d.content_md);
        const reading_minutes = Math.max(1, Math.round(d.content_md.split(/\s+/).filter(Boolean).length / 220));
        const published_at = d.status === "published" ? new Date().toISOString() : null;
        // Upsert by external_ref if provided, else by slug
        const existingQuery = d.external_ref
          ? supabaseAdmin.from("blog_posts").select("id").eq("external_ref", d.external_ref).maybeSingle()
          : supabaseAdmin.from("blog_posts").select("id").eq("slug", slug).maybeSingle();
        const { data: existing } = await existingQuery;
        const payload = {
          title: d.title, slug, excerpt: d.excerpt ?? null, content_md: d.content_md,
          content_html, cover_image_url: d.cover_image_url ?? null, category_id,
          tags: d.tags, status: d.status, scheduled_for: d.status === "scheduled" ? d.scheduled_for : null,
          seo_title: d.seo_title ?? null, seo_description: d.seo_description ?? null,
          og_image_url: d.og_image_url ?? null, canonical_url: d.canonical_url ?? null,
          reading_minutes, published_at,
          external_source: d.external_source ?? null,
          external_ref: d.external_ref ?? null,
          author_name: d.external_source ?? "API",
        };
        let saved;
        if (existing?.id) {
          const { data, error } = await supabaseAdmin.from("blog_posts").update(payload).eq("id", existing.id).select("*").maybeSingle();
          if (error) return json(500, { error: error.message });
          saved = data;
        } else {
          const { data, error } = await supabaseAdmin.from("blog_posts").insert(payload).select("*").maybeSingle();
          if (error) return json(500, { error: error.message });
          saved = data;
        }
        if (saved) {
          await enqueueWebhook(saved.status === "published" ? "post.published" : "post.updated", saved);
        }
        return json(existing?.id ? 200 : 201, { post: saved });
      },
    },
  },
});
