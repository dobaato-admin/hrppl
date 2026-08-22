import { c as createServerRpc } from "./createServerRpc-CbJDFEP-.mjs";
import { r as requireSupabaseAuth } from "./auth-guard-CkYFJuQL.mjs";
import { c as createServerFn } from "./server-BOi2EjMN.mjs";
import "../_libs/seroval.mjs";
import "../_libs/react.mjs";
import { a as objectType, z as stringType, B as enumType, D as arrayType, A as booleanType, C as numberType } from "../_libs/zod.mjs";
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
async function isSuperAdmin(supabase, userId) {
  const {
    data
  } = await supabase.from("user_roles").select("role").eq("user_id", userId).eq("role", "super_admin").maybeSingle();
  return !!data;
}
async function recordAccessAudit(opts) {
  try {
    const {
      supabaseAdmin
    } = await import("./client.server-D5ro3rAQ.mjs");
    await supabaseAdmin.from("blog_access_audit").insert({
      user_id: opts.userId,
      route: opts.route,
      method: opts.method ?? null,
      reason: opts.reason,
      api_key_id: opts.apiKeyId ?? null,
      metadata: opts.metadata ?? {}
    });
  } catch {
  }
}
async function assertSuperAdmin(supabase, userId, route = "server_fn") {
  if (await isSuperAdmin(supabase, userId)) return;
  await recordAccessAudit({
    userId,
    route,
    reason: "non_super_admin_server_fn"
  });
  throw new Error("Super admin access required");
}
const logBlogAccessAttempt_createServerFn_handler = createServerRpc({
  id: "433e258188ae53b7c0191d5fbb7b72126ecd201401245dd282f544da490a0dbb",
  name: "logBlogAccessAttempt",
  filename: "src/lib/blog.functions.ts"
}, (opts) => logBlogAccessAttempt.__executeServer(opts));
const logBlogAccessAttempt = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  route: stringType().min(1).max(200),
  reason: stringType().min(1).max(120)
}).parse(d)).handler(logBlogAccessAttempt_createServerFn_handler, async ({
  data,
  context
}) => {
  await recordAccessAudit({
    userId: context.userId,
    route: data.route,
    reason: data.reason
  });
  return {
    ok: true
  };
});
const slugify = (s) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);
function readingMinutes(text) {
  const words = text.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}
function mdToHtml(md) {
  if (!md) return "";
  const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  const lines = md.split(/\r?\n/);
  let html = "";
  let inUl = false;
  const closeList = () => {
    if (inUl) {
      html += "</ul>";
      inUl = false;
    }
  };
  const inline = (s) => esc(s).replace(/`([^`]+)`/g, "<code>$1</code>").replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>").replace(/\*([^*]+)\*/g, "<em>$1</em>").replace(/\[([^\]]+)\]\((https?:[^)]+)\)/g, '<a href="$2" rel="noopener" target="_blank">$1</a>');
  for (const raw of lines) {
    const line = raw.trimEnd();
    if (!line.trim()) {
      closeList();
      html += "";
      continue;
    }
    const h = /^(#{1,4})\s+(.*)$/.exec(line);
    if (h) {
      closeList();
      const lvl = h[1].length;
      html += `<h${lvl}>${inline(h[2])}</h${lvl}>`;
      continue;
    }
    if (/^[-*]\s+/.test(line)) {
      if (!inUl) {
        html += "<ul>";
        inUl = true;
      }
      html += `<li>${inline(line.replace(/^[-*]\s+/, ""))}</li>`;
      continue;
    }
    closeList();
    html += `<p>${inline(line)}</p>`;
  }
  closeList();
  return html;
}
const PostInput = objectType({
  id: stringType().uuid().optional(),
  title: stringType().min(1).max(200),
  slug: stringType().min(1).max(120).regex(/^[a-z0-9-]+$/).optional(),
  excerpt: stringType().max(400).optional().nullable(),
  content_md: stringType().max(2e5).default(""),
  cover_image_url: stringType().url().max(2048).optional().nullable(),
  category_id: stringType().uuid().optional().nullable(),
  tags: arrayType(stringType().min(1).max(40)).max(20).default([]),
  status: enumType(["draft", "scheduled", "published", "archived"]).default("draft"),
  scheduled_for: stringType().datetime().optional().nullable(),
  seo_title: stringType().max(200).optional().nullable(),
  seo_description: stringType().max(300).optional().nullable(),
  og_image_url: stringType().url().max(2048).optional().nullable(),
  canonical_url: stringType().url().max(2048).optional().nullable()
});
const listAdminPosts_createServerFn_handler = createServerRpc({
  id: "eb404470d2144d59004dadac2858374fdd883cb7d710cde218a869f56256b015",
  name: "listAdminPosts",
  filename: "src/lib/blog.functions.ts"
}, (opts) => listAdminPosts.__executeServer(opts));
const listAdminPosts = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(listAdminPosts_createServerFn_handler, async ({
  context
}) => {
  await assertSuperAdmin(context.supabase, context.userId);
  const {
    data,
    error
  } = await context.supabase.from("blog_posts").select("id,slug,title,excerpt,status,published_at,scheduled_for,tags,cover_image_url,category_id,author_name,updated_at").order("updated_at", {
    ascending: false
  }).limit(200);
  if (error) throw new Error(error.message);
  return {
    posts: data ?? []
  };
});
const getAdminPost_createServerFn_handler = createServerRpc({
  id: "cc5d62f2c2167ae3fac996611f1c212c9eef4c5bba9e0ccce81cf270a4dd66ab",
  name: "getAdminPost",
  filename: "src/lib/blog.functions.ts"
}, (opts) => getAdminPost.__executeServer(opts));
const getAdminPost = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(getAdminPost_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertSuperAdmin(context.supabase, context.userId);
  const {
    data: post,
    error
  } = await context.supabase.from("blog_posts").select("*").eq("id", data.id).maybeSingle();
  if (error) throw new Error(error.message);
  return {
    post
  };
});
const upsertPost_createServerFn_handler = createServerRpc({
  id: "c79b265bf8b5cbe1e3a96456e7f15d2e1d4776703c5081baca8c3ca84d3396f0",
  name: "upsertPost",
  filename: "src/lib/blog.functions.ts"
}, (opts) => upsertPost.__executeServer(opts));
const upsertPost = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => PostInput.parse(d)).handler(upsertPost_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  await assertSuperAdmin(supabase, userId);
  const slug = data.slug ?? slugify(data.title);
  const content_html = mdToHtml(data.content_md ?? "");
  const reading_minutes = readingMinutes(data.content_md ?? "");
  const published_at = data.status === "published" ? (/* @__PURE__ */ new Date()).toISOString() : null;
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
    published_at
  };
  let saved;
  if (data.id) {
    const {
      data: r,
      error
    } = await supabase.from("blog_posts").update(row).eq("id", data.id).select("*").maybeSingle();
    if (error) throw new Error(error.message);
    saved = r;
  } else {
    const {
      data: r,
      error
    } = await supabase.from("blog_posts").insert(row).select("*").maybeSingle();
    if (error) throw new Error(error.message);
    saved = r;
  }
  if (saved && (saved.status === "published" || data.id == null)) {
    await enqueueWebhookEvent(saved.status === "published" ? "post.published" : "post.updated", saved);
  }
  return {
    post: saved
  };
});
const deletePost_createServerFn_handler = createServerRpc({
  id: "3843831164d0def4cb3afbf32fde4fbd1ac8c93e12b37a3c66d852aa39340c0d",
  name: "deletePost",
  filename: "src/lib/blog.functions.ts"
}, (opts) => deletePost.__executeServer(opts));
const deletePost = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(deletePost_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertSuperAdmin(context.supabase, context.userId);
  const {
    data: existing
  } = await context.supabase.from("blog_posts").select("*").eq("id", data.id).maybeSingle();
  const {
    error
  } = await context.supabase.from("blog_posts").delete().eq("id", data.id);
  if (error) throw new Error(error.message);
  if (existing) await enqueueWebhookEvent("post.deleted", existing);
  return {
    ok: true
  };
});
const listCategories_createServerFn_handler = createServerRpc({
  id: "8bf11339de321924fac14bfd28030a1559f57319cba9e686b2740d135f6f6e8d",
  name: "listCategories",
  filename: "src/lib/blog.functions.ts"
}, (opts) => listCategories.__executeServer(opts));
const listCategories = createServerFn({
  method: "GET"
}).handler(listCategories_createServerFn_handler, async () => {
  const {
    supabaseAdmin
  } = await import("./client.server-D5ro3rAQ.mjs");
  const {
    data
  } = await supabaseAdmin.from("blog_categories").select("id,slug,name,description").order("name");
  return {
    categories: data ?? []
  };
});
function randomKey() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  const raw = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  const key = `hpk_${raw}`;
  const prefix = key.slice(0, 10);
  return {
    key,
    prefix,
    hash: hashHex(key)
  };
}
function hashHex(input) {
  const {
    createHash
  } = require("crypto");
  return createHash("sha256").update(input).digest("hex");
}
const listApiKeys_createServerFn_handler = createServerRpc({
  id: "19900ef92794213055c03d7158ef306d2caafe8df9a9ede72d9e25a0e31937d9",
  name: "listApiKeys",
  filename: "src/lib/blog.functions.ts"
}, (opts) => listApiKeys.__executeServer(opts));
const listApiKeys = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(listApiKeys_createServerFn_handler, async ({
  context
}) => {
  await assertSuperAdmin(context.supabase, context.userId, "blog.listApiKeys");
  const {
    data,
    error
  } = await context.supabase.from("blog_api_keys").select("id,name,prefix,scopes,last_used_at,revoked_at,created_at").order("created_at", {
    ascending: false
  });
  if (error) throw new Error(error.message);
  return {
    keys: data ?? []
  };
});
const createApiKey_createServerFn_handler = createServerRpc({
  id: "adaf7648ff4e7d59d5ca8f8f77a420f2d2e4d24a9d3fd04db29ea02e0d718588",
  name: "createApiKey",
  filename: "src/lib/blog.functions.ts"
}, (opts) => createApiKey.__executeServer(opts));
const createApiKey = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  name: stringType().min(1).max(80),
  scopes: arrayType(enumType(["posts:read", "posts:write", "posts:publish"])).min(1).default(["posts:read", "posts:write"])
}).parse(d)).handler(createApiKey_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertSuperAdmin(context.supabase, context.userId, "blog.createApiKey");
  const {
    key,
    prefix,
    hash
  } = randomKey();
  const {
    data: row,
    error
  } = await context.supabase.from("blog_api_keys").insert({
    name: data.name,
    prefix,
    key_hash: hash,
    scopes: data.scopes,
    created_by: context.userId
  }).select("id,name,prefix,scopes,created_at").maybeSingle();
  if (error) throw new Error(error.message);
  return {
    key,
    record: row
  };
});
const revokeApiKey_createServerFn_handler = createServerRpc({
  id: "71826642922ceb648aa25339e920a6c0d827957ba66820f0645dfa4be1a67c68",
  name: "revokeApiKey",
  filename: "src/lib/blog.functions.ts"
}, (opts) => revokeApiKey.__executeServer(opts));
const revokeApiKey = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(revokeApiKey_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertSuperAdmin(context.supabase, context.userId, "blog.revokeApiKey");
  const {
    error
  } = await context.supabase.from("blog_api_keys").update({
    revoked_at: (/* @__PURE__ */ new Date()).toISOString()
  }).eq("id", data.id);
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
const listWebhooks_createServerFn_handler = createServerRpc({
  id: "34a83ed382ea82139d2bf1bd77c067a1e6916f647f9cd8bd2830970e7286a28d",
  name: "listWebhooks",
  filename: "src/lib/blog.functions.ts"
}, (opts) => listWebhooks.__executeServer(opts));
const listWebhooks = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(listWebhooks_createServerFn_handler, async ({
  context
}) => {
  await assertSuperAdmin(context.supabase, context.userId, "blog.listWebhooks");
  const {
    data,
    error
  } = await context.supabase.from("blog_webhooks").select("id,name,url,events,active,secret_hash,last_rotated_at,rotated_by,created_by,created_at,updated_at").order("created_at", {
    ascending: false
  });
  if (error) throw new Error(error.message);
  return {
    webhooks: data ?? []
  };
});
const upsertWebhook_createServerFn_handler = createServerRpc({
  id: "2015f29c65cc7436d5792ee2e6e64c8afbe308bbd909a53777cc99fe11f74a5c",
  name: "upsertWebhook",
  filename: "src/lib/blog.functions.ts"
}, (opts) => upsertWebhook.__executeServer(opts));
const upsertWebhook = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid().optional(),
  name: stringType().min(1).max(80),
  url: stringType().url().max(2048),
  events: arrayType(enumType(["post.published", "post.updated", "post.deleted"])).min(1),
  active: booleanType().default(true)
}).parse(d)).handler(upsertWebhook_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertSuperAdmin(context.supabase, context.userId, "blog.upsertWebhook");
  if (data.id) {
    const {
      error: error2
    } = await context.supabase.from("blog_webhooks").update({
      name: data.name,
      url: data.url,
      events: data.events,
      active: data.active
    }).eq("id", data.id);
    if (error2) throw new Error(error2.message);
    return {
      ok: true
    };
  }
  const secret = `whsec_${hashHex(crypto.randomUUID() + Date.now()).slice(0, 40)}`;
  const secret_hash = hashHex(secret);
  const {
    error
  } = await context.supabase.from("blog_webhooks").insert({
    name: data.name,
    url: data.url,
    events: data.events,
    active: data.active,
    secret,
    secret_hash,
    last_rotated_at: (/* @__PURE__ */ new Date()).toISOString(),
    rotated_by: context.userId,
    created_by: context.userId
  });
  if (error) throw new Error(error.message);
  return {
    ok: true,
    secret
  };
});
const deleteWebhook_createServerFn_handler = createServerRpc({
  id: "deeb97f5c1e0d576dcb574454d69c9ac9dcdcac04ff39c767c44a29a8af7c5bc",
  name: "deleteWebhook",
  filename: "src/lib/blog.functions.ts"
}, (opts) => deleteWebhook.__executeServer(opts));
const deleteWebhook = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(deleteWebhook_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertSuperAdmin(context.supabase, context.userId, "blog.deleteWebhook");
  const {
    error
  } = await context.supabase.from("blog_webhooks").delete().eq("id", data.id);
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
const rotateWebhookSecret_createServerFn_handler = createServerRpc({
  id: "ca45231f5b6d9bbb28cdec444aff051557b9bfa47ac9e618adf8b43795dae463",
  name: "rotateWebhookSecret",
  filename: "src/lib/blog.functions.ts"
}, (opts) => rotateWebhookSecret.__executeServer(opts));
const rotateWebhookSecret = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(rotateWebhookSecret_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertSuperAdmin(context.supabase, context.userId, "blog.rotateWebhookSecret");
  const secret = `whsec_${hashHex(crypto.randomUUID() + Date.now() + Math.random()).slice(0, 40)}`;
  const secret_hash = hashHex(secret);
  const {
    supabaseAdmin
  } = await import("./client.server-D5ro3rAQ.mjs");
  const {
    error
  } = await supabaseAdmin.from("blog_webhooks").update({
    secret,
    secret_hash,
    last_rotated_at: (/* @__PURE__ */ new Date()).toISOString(),
    rotated_by: context.userId
  }).eq("id", data.id);
  if (error) throw new Error(error.message);
  return {
    ok: true,
    secret
  };
});
async function enqueueWebhookEvent(event, post) {
  const {
    supabaseAdmin
  } = await import("./client.server-D5ro3rAQ.mjs");
  const {
    data: hooks
  } = await supabaseAdmin.from("blog_webhooks").select("id,events").eq("active", true);
  const matches = (hooks ?? []).filter((h) => h.events.includes(event));
  if (!matches.length) return;
  const payload = {
    event,
    occurred_at: (/* @__PURE__ */ new Date()).toISOString(),
    data: {
      post
    }
  };
  await supabaseAdmin.from("blog_webhook_deliveries").insert(matches.map((h) => ({
    webhook_id: h.id,
    event,
    payload,
    status: "pending",
    next_retry_at: (/* @__PURE__ */ new Date()).toISOString()
  })));
}
const listPublishedPosts_createServerFn_handler = createServerRpc({
  id: "e2cbed737503162e46e2ab3f882490859e69491c19f9c07d7dd3510044f18adc",
  name: "listPublishedPosts",
  filename: "src/lib/blog.functions.ts"
}, (opts) => listPublishedPosts.__executeServer(opts));
const listPublishedPosts = createServerFn({
  method: "GET"
}).inputValidator((d) => objectType({
  limit: numberType().min(1).max(50).default(20),
  category: stringType().min(1).max(60).optional(),
  tag: stringType().min(1).max(40).optional()
}).parse(d ?? {})).handler(listPublishedPosts_createServerFn_handler, async ({
  data
}) => {
  const {
    supabaseAdmin
  } = await import("./client.server-D5ro3rAQ.mjs");
  let q = supabaseAdmin.from("blog_posts").select("id,slug,title,excerpt,cover_image_url,tags,published_at,reading_minutes,author_name,category_id").eq("status", "published").lte("published_at", (/* @__PURE__ */ new Date()).toISOString()).order("published_at", {
    ascending: false
  }).limit(data.limit);
  if (data.tag) q = q.contains("tags", [data.tag]);
  const {
    data: posts
  } = await q;
  let filtered = posts ?? [];
  if (data.category) {
    const {
      data: cat
    } = await supabaseAdmin.from("blog_categories").select("id").eq("slug", data.category).maybeSingle();
    if (cat) filtered = filtered.filter((p) => p.category_id === cat.id);
    else filtered = [];
  }
  const {
    data: categories
  } = await supabaseAdmin.from("blog_categories").select("id,slug,name").order("name");
  return {
    posts: filtered,
    categories: categories ?? []
  };
});
const getPublishedPost_createServerFn_handler = createServerRpc({
  id: "5e47b6b5462336cd213aaf587762c19db3f76ae26cbad921e5799a17bbfd9e41",
  name: "getPublishedPost",
  filename: "src/lib/blog.functions.ts"
}, (opts) => getPublishedPost.__executeServer(opts));
const getPublishedPost = createServerFn({
  method: "GET"
}).inputValidator((d) => objectType({
  slug: stringType().min(1).max(120)
}).parse(d)).handler(getPublishedPost_createServerFn_handler, async ({
  data
}) => {
  const {
    supabaseAdmin
  } = await import("./client.server-D5ro3rAQ.mjs");
  const {
    data: post
  } = await supabaseAdmin.from("blog_posts").select("*").eq("slug", data.slug).eq("status", "published").lte("published_at", (/* @__PURE__ */ new Date()).toISOString()).maybeSingle();
  return {
    post
  };
});
export {
  createApiKey_createServerFn_handler,
  deletePost_createServerFn_handler,
  deleteWebhook_createServerFn_handler,
  getAdminPost_createServerFn_handler,
  getPublishedPost_createServerFn_handler,
  listAdminPosts_createServerFn_handler,
  listApiKeys_createServerFn_handler,
  listCategories_createServerFn_handler,
  listPublishedPosts_createServerFn_handler,
  listWebhooks_createServerFn_handler,
  logBlogAccessAttempt_createServerFn_handler,
  revokeApiKey_createServerFn_handler,
  rotateWebhookSecret_createServerFn_handler,
  upsertPost_createServerFn_handler,
  upsertWebhook_createServerFn_handler
};
