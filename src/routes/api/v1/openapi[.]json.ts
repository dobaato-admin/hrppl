import { createFileRoute } from "@tanstack/react-router";
import { openApiSpec } from "@/lib/openapi-spec";

// CORS kept narrow — only authenticated super-admin browsers fetch this from
// /admin/api-docs on the same origin, so we don't need cross-origin access.
const SECURITY_HEADERS = {
  "Cache-Control": "no-store",
  "X-Content-Type-Options": "nosniff",
} as const;

async function isCallerSuperAdmin(request: Request): Promise<boolean> {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return false;
  const token = authHeader.slice("Bearer ".length).trim();
  if (!token) return false;

  try {
    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_PUBLISHABLE_KEY!,
      { auth: { persistSession: false, autoRefreshToken: false } },
    );
    const { data: userData, error: userErr } = await supabase.auth.getUser(token);
    if (userErr || !userData?.user) return false;

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: roleRows } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", userData.user.id);
    return (roleRows ?? []).some((r: any) => r.role === "super_admin");
  } catch {
    return false;
  }
}

export const Route = createFileRoute("/api/v1/openapi.json")({
  server: {
    handlers: {
      OPTIONS: async () =>
        new Response(null, { status: 204, headers: SECURITY_HEADERS }),
      GET: async ({ request }) => {
        const ok = await isCallerSuperAdmin(request);
        if (!ok) {
          return new Response(JSON.stringify({ error: "Unauthorized" }), {
            status: 401,
            headers: {
              "Content-Type": "application/json; charset=utf-8",
              ...SECURITY_HEADERS,
            },
          });
        }
        return new Response(JSON.stringify(openApiSpec, null, 2), {
          status: 200,
          headers: {
            "Content-Type": "application/json; charset=utf-8",
            ...SECURITY_HEADERS,
          },
        });
      },
    },
  },
});
