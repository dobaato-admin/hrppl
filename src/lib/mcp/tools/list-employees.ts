import { createClient } from "@supabase/supabase-js";
import { defineTool, type ToolContext } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { getTenantId } from "@/lib/tenant-scope";

function supabaseForUser(ctx: ToolContext) {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
    global: { headers: { Authorization: `Bearer ${ctx.getToken()}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export default defineTool({
  name: "list_employees",
  title: "List employees",
  description:
    "List employees in the signed-in user's organisation. Returns id, full name, email, status, and department for up to `limit` employees (default 50, max 200).",
  inputSchema: {
    limit: z
      .number()
      .int()
      .min(1)
      .max(200)
      .optional()
      .describe("Max rows to return. Defaults to 50."),
    search: z
      .string()
      .trim()
      .min(1)
      .optional()
      .describe("Optional case-insensitive filter matched against full name or email."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ limit, search }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);

    // Resolve the caller's tenant and filter on it. The description promises
    // "the signed-in user's organisation", but the query used to rely on RLS to
    // deliver that — and RLS does not, for super_admin or regional_admin, whose
    // policies on `employees` carry no tenant predicate. This tool hands its
    // output to an AI agent, so an unscoped read is a cross-tenant disclosure
    // with no human reading it first. See src/lib/tenant-scope.ts.
    const { data: auth } = await supabase.auth.getUser();
    const userId = auth?.user?.id;
    if (!userId) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const tenantId = (await getTenantId(supabase, userId)) ?? undefined;
    if (!tenantId) {
      return {
        content: [{ type: "text", text: "Your account is not attached to an organisation." }],
        structuredContent: { employees: [] },
      };
    }

    // `employees` has first_name / last_name, not full_name. Selecting and
    // ordering by a column that does not exist made every call fail with
    // PostgREST 42703, so this tool has never returned a row.
    let query = supabase
      .from("employees")
      .select("id, first_name, last_name, email, status, department_id")
      .eq("tenant_id", tenantId)
      .order("first_name", { ascending: true })
      .limit(limit ?? 50);
    if (search) {
      query = query.or(
        `first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%`,
      );
    }
    const { data, error } = await query;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };

    const employees = (data ?? []).map((e) => ({
      ...e,
      full_name: `${e.first_name ?? ""} ${e.last_name ?? ""}`.trim(),
    }));
    return {
      content: [{ type: "text", text: JSON.stringify(employees, null, 2) }],
      structuredContent: { employees },
    };
  },
});
