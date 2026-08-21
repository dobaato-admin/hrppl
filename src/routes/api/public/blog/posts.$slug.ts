import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const PatchSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  excerpt: z.string().max(400).optional().nullable(),
  content_md: z.string().max(200_000).optional(),
  cover_image_url: z.string().url().max(2048).optional().nullable(),
  tags: z.array(z.string().min(1).max(40)).max(20).optional(),
  status: z.enum(["draft", "scheduled", "published", "archived"]).optional(),
  scheduled_for: z.string().datetime().optional().nullable(),
  seo_title: z.string().max(200).optional().nullable(),
  seo_description: z.string().max(300).optional().nullable(),
  og_image_url: z.string().url().max(2048).optional().nullable(),
  canonical_url: z.string().url().max(2048).optional().nullable(),
});

const jsonHeaders = () => ({
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, x-api-key",
});
const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: jsonHeaders() });

async function authenticate(request: Request, method: string, requiredScope: string) {
  const { authenticateBlogApi } = await import("@/lib/blog-api-auth.server");
  return authenticateBlogApi(request, "/api/public/blog/posts/$slug", method, requiredScope);
}

async function enqueueWebhook(event: string, post: Record<string, unknown>) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: hooks } = await supabaseAdmin.from("blog_webhooks").select("id,events").eq("active", true);
  const matches = (hooks ?? []).filter((h) => (h.events as string[]).includes(event));
  if (!matches.length) return;
  const payload = { event, occurred_at: new Date().toISOString(), data: { post } } as unknown as Record<string, unknown>;
  await supabaseAdmin.from("blog_webhook_deliveries").insert(
    matches.map((h) => ({ webhook_id: h.id, event, payload, status: "pending", next_retry_at: new Date().toISOString() })) as never,
  );
}

export const Route = createFileRoute("/api/public/blog/posts/$slug")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: jsonHeaders() }),
      GET: async ({ request, params }) => {
        const auth = await authenticate(request, "GET", "posts:read");
        if ("error" in auth) return auth.error;
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data } = await supabaseAdmin.from("blog_posts").select("*").eq("slug", params.slug).maybeSingle();
        if (!data) return json(404, { error: "Not found" });
        return json(200, { post: data });
      },
      PATCH: async ({ request, params }) => {
        const auth = await authenticate(request, "PATCH", "posts:write");
        if ("error" in auth) return auth.error;
        let body: unknown;
        try { body = await request.json(); } catch { return json(400, { error: "Invalid JSON" }); }
        const parsed = PatchSchema.safeParse(body);
        if (!parsed.success) return json(400, { error: "Validation failed", details: parsed.error.flatten() });
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const updates: Record<string, unknown> = { ...parsed.data };
        if (parsed.data.status === "published") updates.published_at = new Date().toISOString();
        const { data, error } = await supabaseAdmin.from("blog_posts").update(updates as never).eq("slug", params.slug).select("*").maybeSingle();
        if (error) return json(500, { error: error.message });
        if (!data) return json(404, { error: "Not found" });
        await enqueueWebhook(data.status === "published" ? "post.published" : "post.updated", data);
        return json(200, { post: data });
      },
      DELETE: async ({ request, params }) => {
        const auth = await authenticate(request, "DELETE", "posts:write");
        if ("error" in auth) return auth.error;
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data: existing } = await supabaseAdmin.from("blog_posts").select("*").eq("slug", params.slug).maybeSingle();
        if (!existing) return json(404, { error: "Not found" });
        await supabaseAdmin.from("blog_posts").delete().eq("slug", params.slug);
        await enqueueWebhook("post.deleted", existing);
        return json(200, { ok: true });
      },
    },
  },
});
