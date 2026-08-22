import { createHash } from "crypto";
const RATE_WINDOW_MS = 6e4;
const RATE_MAX = 60;
const hits = /* @__PURE__ */ new Map();
function rateLimited(key, now) {
  const arr = (hits.get(key) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  arr.push(now);
  hits.set(key, arr);
  if (hits.size > 5e3) {
    const it = hits.keys();
    for (let i = 0; i < 1e3; i++) {
      const k = it.next().value;
      if (!k) break;
      hits.delete(k);
    }
  }
  return arr.length > RATE_MAX;
}
const BOT_UA_RE = /(bot|crawler|spider|scrapy|wget|curl\/|httpclient|python-requests|go-http-client|libwww|nikto|sqlmap|nmap|masscan|zgrab|acunetix|nessus)/i;
async function authenticateBlogApi(request, route, method, requiredScope) {
  const headersOf = (name) => request.headers.get(name) ?? "";
  const authHeader = headersOf("authorization");
  const apiKey = headersOf("x-api-key") || (authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "");
  const ip = headersOf("cf-connecting-ip") || headersOf("x-forwarded-for").split(",")[0]?.trim() || null;
  const userAgent = headersOf("user-agent") || null;
  const { supabaseAdmin } = await import("./client.server-D5ro3rAQ.mjs");
  const record = async (reason, apiKeyId, ownerId2) => {
    try {
      await supabaseAdmin.from("blog_access_audit").insert({
        user_id: ownerId2,
        route,
        method,
        reason,
        api_key_id: apiKeyId,
        ip,
        user_agent: userAgent,
        metadata: { prefix: apiKey ? apiKey.slice(0, 10) : null }
      });
    } catch {
    }
  };
  const jsonHeaders = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*"
  };
  const deny = (status, body) => new Response(JSON.stringify(body), { status, headers: jsonHeaders });
  if (userAgent && BOT_UA_RE.test(userAgent)) {
    await record("bot_blocked", null, null);
    return { error: deny(403, { error: "Automated clients are not allowed." }) };
  }
  const rlKey = `${ip ?? "anon"}:${route}`;
  if (rateLimited(rlKey, Date.now())) {
    await record("rate_limited", null, null);
    return {
      error: new Response(
        JSON.stringify({ error: "Too many requests. Slow down and retry." }),
        {
          status: 429,
          headers: {
            ...jsonHeaders,
            "Retry-After": "60"
          }
        }
      )
    };
  }
  if (!apiKey) {
    await record("missing_api_key", null, null);
    return {
      error: deny(401, {
        error: "Missing API key. Send `Authorization: Bearer <key>` or `x-api-key`."
      })
    };
  }
  const hash = createHash("sha256").update(apiKey).digest("hex");
  const { data: row } = await supabaseAdmin.from("blog_api_keys").select("*").eq("key_hash", hash).maybeSingle();
  if (!row) {
    await record("invalid_api_key", null, null);
    return { error: deny(401, { error: "Invalid API key." }) };
  }
  if (row.revoked_at) {
    await record("revoked_api_key", row.id, row.created_by ?? null);
    return { error: deny(401, { error: "API key has been revoked." }) };
  }
  if (!row.scopes.includes(requiredScope)) {
    await record(
      "missing_scope",
      row.id,
      row.created_by ?? null
    );
    return { error: deny(403, { error: `Missing scope: ${requiredScope}` }) };
  }
  const ownerId = row.created_by ?? null;
  if (!ownerId) {
    await record("api_key_no_owner", row.id, null);
    return {
      error: deny(403, {
        error: "API key has no owner. Ask a super admin to re-issue it."
      })
    };
  }
  const { data: roleRow } = await supabaseAdmin.from("user_roles").select("role").eq("user_id", ownerId).eq("role", "super_admin").maybeSingle();
  if (!roleRow) {
    await record("api_key_owner_not_super_admin", row.id, ownerId);
    return {
      error: deny(403, {
        error: "API key owner no longer has super admin access. The key is disabled."
      })
    };
  }
  await supabaseAdmin.from("blog_api_keys").update({ last_used_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("id", row.id);
  return { keyId: row.id, ownerId };
}
export {
  authenticateBlogApi
};
