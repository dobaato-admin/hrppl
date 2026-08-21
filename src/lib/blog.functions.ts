import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/lib/auth-guard";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function isSuperAdmin(supabase: any, userId: string): Promise<boolean> {
  const { data } = await supabase
    .from("user_roles").select("role").eq("user_id", userId).eq("role", "super_admin").maybeSingle();
  return !!data;
}

async function recordAccessAudit(opts: {
  userId: string | null;
  route: string;
  reason: string;
  method?: string;
  apiKeyId?: string | null;
  metadata?: Record<string, unknown>;
}) {
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("blog_access_audit").insert({
      user_id: opts.userId,
      route: opts.route,
      method: opts.method ?? null,
      reason: opts.reason,
      api_key_id: opts.apiKeyId ?? null,
      metadata: opts.metadata ?? {},
    } as never);
  } catch {
    // Best-effort audit — never break the calling flow.
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function assertSuperAdmin(supabase: any, userId: string, route = "server_fn") {
  if (await isSuperAdmin(supabase, userId)) return;
  await recordAccessAudit({ userId, route, reason: "non_super_admin_server_fn" });
  throw new Error("Super admin access required");
}

export const logBlogAccessAttempt = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({
      route: z.string().min(1).max(200),
      reason: z.string().min(1).max(120),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    await recordAccessAudit({
      userId: context.userId,
      route: data.route,
      reason: data.reason,
    });
    return { ok: true };
  });


const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);

function readingMinutes(text: string): number {
  const words = text.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}

// Very small markdown -> html (headings, bold, italic, links, paragraphs, lists, code).
function mdToHtml(md: string): string {
  if (!md) return "";
  const esc = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  const lines = md.split(/\r?\n/);
  let html = "";
  let inUl = false;
  const closeList = () => {
    if (inUl) { html += "</ul>"; inUl = false; }
  };
  const inline = (s: string) =>
    esc(s)
      .replace(/`([^`]+)`/g, "<code>$1</code>")
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/\*([^*]+)\*/g, "<em>$1</em>")
      .replace(/\[([^\]]+)\]\((https?:[^)]+)\)/g, '<a href="$2" rel="noopener" target="_blank">$1</a>');
  for (const raw of lines) {
    const line = raw.trimEnd();
    if (!line.trim()) { closeList(); html += ""; continue; }
    const h = /^(#{1,4})\s+(.*)$/.exec(line);
    if (h) { closeList(); const lvl = h[1].length; html += `<h${lvl}>${inline(h[2])}</h${lvl}>`; continue; }
    if (/^[-*]\s+/.test(line)) {
      if (!inUl) { html += "<ul>"; inUl = true; }
      html += `<li>${inline(line.replace(/^[-*]\s+/, ""))}</li>`;
      continue;
    }
    closeList();
    html += `<p>${inline(line)}</p>`;
  }
  closeList();
  return html;
}

const PostInput = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1).max(200),
  slug: z.string().min(1).max(120).regex(/^[a-z0-9-]+$/).optional(),
  excerpt: z.string().max(400).optional().nullable(),
  content_md: z.string().max(200_000).default(""),
  cover_image_url: z.string().url().max(2048).optional().nullable(),
  category_id: z.string().uuid().optional().nullable(),
  tags: z.array(z.string().min(1).max(40)).max(20).default([]),
  status: z.enum(["draft", "scheduled", "published", "archived"]).default("draft"),
  scheduled_for: z.string().datetime().optional().nullable(),
  seo_title: z.string().max(200).optional().nullable(),
  seo_description: z.string().max(300).optional().nullable(),
  og_image_url: z.string().url().max(2048).optional().nullable(),
  canonical_url: z.string().url().max(2048).optional().nullable(),
});

export const listAdminPosts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertSuperAdmin(context.supabase, context.userId);
    const { data, error } = await context.supabase
      .from("blog_posts")
      .select("id,slug,title,excerpt,status,published_at,scheduled_for,tags,cover_image_url,category_id,author_name,updated_at")
      .order("updated_at", { ascending: false })
      .limit(200);
    if (error) throw new Error(error.message);
    return { posts: data ?? [] };
  });

export const getAdminPost = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertSuperAdmin(context.supabase, context.userId);
    const { data: post, error } = await context.supabase
      .from("blog_posts").select("*").eq("id", data.id).maybeSingle();
    if (error) throw new Error(error.message);
    return { post };
  });

export const upsertPost = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => PostInput.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await assertSuperAdmin(supabase, userId);
    const slug = data.slug ?? slugify(data.title);
    const content_html = mdToHtml(data.content_md ?? "");
    const reading_minutes = readingMinutes(data.content_md ?? "");
    const published_at =
      data.status === "published" ? new Date().toISOString() : null;
    const row = {
      title: data.title,
      slug,
      excerpt: data.excerpt ?? null,
      content_md: data.content_md ?? "",
      content_html,
      cover_image_url: data.cover_image_url ?? null,
      category_id: data.category_id ?? null,
      tags: data.tags ?? [],
      status: data.status,
      scheduled_for: data.status === "scheduled" ? data.scheduled_for : null,
      seo_title: data.seo_title ?? null,
      seo_description: data.seo_description ?? null,
      og_image_url: data.og_image_url ?? null,
      canonical_url: data.canonical_url ?? null,
      reading_minutes,
      author_id: userId,
      published_at,
    };
    let saved;
    if (data.id) {
      const { data: r, error } = await supabase
        .from("blog_posts").update(row).eq("id", data.id).select("*").maybeSingle();
      if (error) throw new Error(error.message);
      saved = r;
    } else {
      const { data: r, error } = await supabase
        .from("blog_posts").insert(row).select("*").maybeSingle();
      if (error) throw new Error(error.message);
      saved = r;
    }
    if (saved && (saved.status === "published" || data.id == null)) {
      await enqueueWebhookEvent(saved.status === "published" ? "post.published" : "post.updated", saved);
    }
    return { post: saved };
  });

export const deletePost = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertSuperAdmin(context.supabase, context.userId);
    const { data: existing } = await context.supabase
      .from("blog_posts").select("*").eq("id", data.id).maybeSingle();
    const { error } = await context.supabase.from("blog_posts").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    if (existing) await enqueueWebhookEvent("post.deleted", existing);
    return { ok: true };
  });

export const listCategories = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin.from("blog_categories").select("id,slug,name,description").order("name");
  return { categories: data ?? [] };
});

// ====== API KEYS ======
function randomKey(): { key: string; prefix: string; hash: string } {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  const raw = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  const key = `hpk_${raw}`;
  const prefix = key.slice(0, 10);
  return { key, prefix, hash: hashHex(key) };
}
function hashHex(input: string): string {
  // sha256 via subtle is async; use a synchronous hex of a salted value here via Node crypto on server.
  // Lazy require to keep client-safe imports out.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { createHash } = require("crypto") as typeof import("crypto");
  return createHash("sha256").update(input).digest("hex");
}

export const listApiKeys = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertSuperAdmin(context.supabase, context.userId, "blog.listApiKeys");
    const { data, error } = await context.supabase
      .from("blog_api_keys")
      .select("id,name,prefix,scopes,last_used_at,revoked_at,created_at")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return { keys: data ?? [] };
  });

export const createApiKey = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({
      name: z.string().min(1).max(80),
      scopes: z.array(z.enum(["posts:read", "posts:write", "posts:publish"])).min(1).default(["posts:read", "posts:write"]),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertSuperAdmin(context.supabase, context.userId, "blog.createApiKey");
    const { key, prefix, hash } = randomKey();
    const { data: row, error } = await context.supabase
      .from("blog_api_keys")
      .insert({ name: data.name, prefix, key_hash: hash, scopes: data.scopes, created_by: context.userId })
      .select("id,name,prefix,scopes,created_at")
      .maybeSingle();
    if (error) throw new Error(error.message);
    return { key, record: row };
  });

export const revokeApiKey = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertSuperAdmin(context.supabase, context.userId, "blog.revokeApiKey");
    const { error } = await context.supabase
      .from("blog_api_keys").update({ revoked_at: new Date().toISOString() }).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ====== WEBHOOKS ======
export const listWebhooks = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertSuperAdmin(context.supabase, context.userId, "blog.listWebhooks");
    const { data, error } = await context.supabase
      .from("blog_webhooks")
      .select("id,name,url,events,active,secret_hash,last_rotated_at,rotated_by,created_by,created_at,updated_at")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return { webhooks: data ?? [] };
  });

export const upsertWebhook = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({
      id: z.string().uuid().optional(),
      name: z.string().min(1).max(80),
      url: z.string().url().max(2048),
      events: z.array(z.enum(["post.published", "post.updated", "post.deleted"])).min(1),
      active: z.boolean().default(true),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertSuperAdmin(context.supabase, context.userId, "blog.upsertWebhook");
    if (data.id) {
      const { error } = await context.supabase
        .from("blog_webhooks").update({
          name: data.name, url: data.url, events: data.events, active: data.active,
        }).eq("id", data.id);
      if (error) throw new Error(error.message);
      return { ok: true };
    }
    const secret = `whsec_${hashHex(crypto.randomUUID() + Date.now()).slice(0, 40)}`;
    const secret_hash = hashHex(secret);
    const { error } = await context.supabase
      .from("blog_webhooks").insert({
        name: data.name, url: data.url, events: data.events, active: data.active,
        secret, secret_hash, last_rotated_at: new Date().toISOString(), rotated_by: context.userId,
        created_by: context.userId,
      } as never);
    if (error) throw new Error(error.message);
    // Plaintext secret is returned ONCE to the admin for setup; never re-exposed via list endpoints.
    return { ok: true, secret };
  });

export const deleteWebhook = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertSuperAdmin(context.supabase, context.userId, "blog.deleteWebhook");
    const { error } = await context.supabase.from("blog_webhooks").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// Rotate the webhook's signing secret. Plaintext is returned ONCE; the stored hash lets
// us audit who rotated it without re-exposing the secret on subsequent reads.
export const rotateWebhookSecret = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertSuperAdmin(context.supabase, context.userId, "blog.rotateWebhookSecret");
    const secret = `whsec_${hashHex(crypto.randomUUID() + Date.now() + Math.random()).slice(0, 40)}`;
    const secret_hash = hashHex(secret);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("blog_webhooks")
      .update({
        secret,
        secret_hash,
        last_rotated_at: new Date().toISOString(),
        rotated_by: context.userId,
      } as never)
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true, secret };
  });

// Enqueue a webhook delivery for each active subscriber matching the event.
async function enqueueWebhookEvent(event: string, post: Record<string, unknown>) {
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

// ====== PUBLIC (used by /blog SSR) ======
export const listPublishedPosts = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) =>
    z.object({
      limit: z.number().min(1).max(50).default(20),
      category: z.string().min(1).max(60).optional(),
      tag: z.string().min(1).max(40).optional(),
    }).parse(d ?? {}),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    let q = supabaseAdmin
      .from("blog_posts")
      .select("id,slug,title,excerpt,cover_image_url,tags,published_at,reading_minutes,author_name,category_id")
      .eq("status", "published")
      .lte("published_at", new Date().toISOString())
      .order("published_at", { ascending: false })
      .limit(data.limit);
    if (data.tag) q = q.contains("tags", [data.tag]);
    const { data: posts } = await q;
    let filtered = posts ?? [];
    if (data.category) {
      const { data: cat } = await supabaseAdmin.from("blog_categories").select("id").eq("slug", data.category).maybeSingle();
      if (cat) filtered = filtered.filter((p) => p.category_id === cat.id);
      else filtered = [];
    }
    const { data: categories } = await supabaseAdmin.from("blog_categories").select("id,slug,name").order("name");
    return { posts: filtered, categories: categories ?? [] };
  });

export const getPublishedPost = createServerFn({ method: "GET" })
  .inputValidator((d: { slug: string }) => z.object({ slug: z.string().min(1).max(120) }).parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: post } = await supabaseAdmin
      .from("blog_posts")
      .select("*")
      .eq("slug", data.slug)
      .eq("status", "published")
      .lte("published_at", new Date().toISOString())
      .maybeSingle();
    return { post };
  });
