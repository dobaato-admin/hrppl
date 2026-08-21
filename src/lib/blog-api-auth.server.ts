import { createHash } from "crypto";

/**
 * Shared API-key auth for the public Blog REST endpoints.
 *
 * Resolves the key, enforces scope, and verifies that the key was created by a
 * user who still holds the super_admin role. Also applies a best-effort
 * per-IP rate limit and a simple bot/user-agent blocklist to reduce
 * brute-force and unauthorized scraping. Failures are recorded in
 * blog_access_audit.
 *
 * The rate-limit counters live in-process; on Cloudflare Workers requests fan
 * across isolates, so this is a soft brake, not a WAF replacement.
 */

const RATE_WINDOW_MS = 60_000;
const RATE_MAX = 60; // 60 req/min per IP+route
const hits = new Map<string, number[]>();
function rateLimited(key: string, now: number): boolean {
  const arr = (hits.get(key) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  arr.push(now);
  hits.set(key, arr);
  if (hits.size > 5000) {
    const it = hits.keys();
    for (let i = 0; i < 1000; i++) {
      const k = it.next().value;
      if (!k) break;
      hits.delete(k);
    }
  }
  return arr.length > RATE_MAX;
}

const BOT_UA_RE =
  /(bot|crawler|spider|scrapy|wget|curl\/|httpclient|python-requests|go-http-client|libwww|nikto|sqlmap|nmap|masscan|zgrab|acunetix|nessus)/i;

export async function authenticateBlogApi(
  request: Request,
  route: string,
  method: string,
  requiredScope: string,
): Promise<{ keyId: string; ownerId: string } | { error: Response }> {
  const headersOf = (name: string) => request.headers.get(name) ?? "";
  const authHeader = headersOf("authorization");
  const apiKey =
    headersOf("x-api-key") ||
    (authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "");

  const ip =
    headersOf("cf-connecting-ip") ||
    headersOf("x-forwarded-for").split(",")[0]?.trim() ||
    null;
  const userAgent = headersOf("user-agent") || null;

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  const record = async (
    reason: string,
    apiKeyId: string | null,
    ownerId: string | null,
  ) => {
    try {
      await supabaseAdmin.from("blog_access_audit").insert({
        user_id: ownerId,
        route,
        method,
        reason,
        api_key_id: apiKeyId,
        ip,
        user_agent: userAgent,
        metadata: { prefix: apiKey ? apiKey.slice(0, 10) : null },
      } as never);
    } catch {
      /* best-effort */
    }
  };

  const jsonHeaders = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
  };
  const deny = (status: number, body: unknown) =>
    new Response(JSON.stringify(body), { status, headers: jsonHeaders });

  // Bot/UA blocklist — refuse obvious scanners before touching the DB.
  if (userAgent && BOT_UA_RE.test(userAgent)) {
    await record("bot_blocked", null, null);
    return { error: deny(403, { error: "Automated clients are not allowed." }) };
  }

  // Per-IP+route rate limit (soft, in-memory).
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
            "Retry-After": "60",
          },
        },
      ),
    };
  }

  if (!apiKey) {
    await record("missing_api_key", null, null);
    return {
      error: deny(401, {
        error:
          "Missing API key. Send `Authorization: Bearer <key>` or `x-api-key`.",
      }),
    };
  }

  const hash = createHash("sha256").update(apiKey).digest("hex");
  const { data: row } = await supabaseAdmin
    .from("blog_api_keys")
    .select("*")
    .eq("key_hash", hash)
    .maybeSingle();

  if (!row) {
    await record("invalid_api_key", null, null);
    return { error: deny(401, { error: "Invalid API key." }) };
  }
  if (row.revoked_at) {
    await record("revoked_api_key", row.id as string, row.created_by ?? null);
    return { error: deny(401, { error: "API key has been revoked." }) };
  }
  if (!(row.scopes as string[]).includes(requiredScope)) {
    await record(
      "missing_scope",
      row.id as string,
      row.created_by ?? null,
    );
    return { error: deny(403, { error: `Missing scope: ${requiredScope}` }) };
  }

  // Verify the key was created by a current super admin.
  const ownerId = (row.created_by ?? null) as string | null;
  if (!ownerId) {
    await record("api_key_no_owner", row.id as string, null);
    return {
      error: deny(403, {
        error: "API key has no owner. Ask a super admin to re-issue it.",
      }),
    };
  }
  const { data: roleRow } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", ownerId)
    .eq("role", "super_admin")
    .maybeSingle();
  if (!roleRow) {
    await record("api_key_owner_not_super_admin", row.id as string, ownerId);
    return {
      error: deny(403, {
        error:
          "API key owner no longer has super admin access. The key is disabled.",
      }),
    };
  }

  await supabaseAdmin
    .from("blog_api_keys")
    .update({ last_used_at: new Date().toISOString() })
    .eq("id", row.id);

  return { keyId: row.id as string, ownerId };
}
