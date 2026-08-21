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
 * Returns `undefined` while loading and `null` for a platform account with no
 * tenant. Callers should skip the query in both cases rather than fall back to
 * an unfiltered read — that fallback is the bug this exists to prevent.
 *
 * Cached per user for the session; a user's tenant does not change while they
 * are signed in.
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
      return (profile?.tenant_id as string | undefined) ?? null;
    },
  });
  return { tenantId: user ? data : null, isLoading: isLoading && !!user };
}
