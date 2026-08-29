import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

/**
 * The signed-in user's tenant id, for client-side queries.
 *
 * Pages that read tenant-owned tables directly through the browser client must
 * filter on `tenant_id` themselves. RLS is the security boundary but it is not
 * a scoping one for every role: `super_admin`'s policies carry no tenant
 * predicate, so an unfiltered `supabase.from("employees").select(...)` returns
 * every tenant's rows to that caller. Several pickers shipped that way. See
 * src/lib/tenant-scope.ts for the server-side equivalent and the full story.
 *
 * Platform accounts (`super_admin` / `regional_admin`) have no home tenant, so
 * this falls back to `platform_acting_tenant` — the tenant they've chosen to
 * act as via TenantSwitcher — the same fallback `getTenantId` applies
 * server-side. RLS on that table already restricts it to the caller's own
 * row, same trust level as the `profiles` read above it.
 *
 * Returns `undefined` while loading and `null` for a platform account with
 * nothing selected. Callers should skip the query in both cases rather than
 * fall back to an unfiltered read — that fallback is the bug this exists to
 * prevent.
 *
 * Cached per user for the session with `staleTime: Infinity`; switching
 * tenants must invalidate `["my-tenant-id", user.id]` (see TenantSwitcher).
 */
export function useMyTenantId(): { tenantId: string | null | undefined; isLoading: boolean } {
  const { user } = useAuth();
  const { data, isLoading } = useQuery({
    queryKey: ["my-tenant-id", user?.id],
    enabled: !!user,
    staleTime: Infinity,
    queryFn: async () => {
      const { data: profile } = await supabase
        .from("profiles")
        .select("tenant_id")
        .eq("id", user!.id)
        .maybeSingle();
      const homeTenantId = (profile?.tenant_id as string | undefined) ?? null;
      if (homeTenantId) return homeTenantId;

      const { data: acting } = await supabase
        .from("platform_acting_tenant")
        .select("tenant_id")
        .eq("user_id", user!.id)
        .maybeSingle();
      return (acting?.tenant_id as string | undefined) ?? null;
    },
  });
  return { tenantId: user ? data : null, isLoading: isLoading && !!user };
}
