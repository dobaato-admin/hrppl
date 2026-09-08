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

/**
 * The signed-in user's tenant country code (`"AU"`, `"NP"`, …).
 *
 * Only the navigation needs this today: country-specific compliance surfaces
 * (Australian STP2, Payday Super, modern awards) must be absent for tenants
 * elsewhere rather than present-and-empty. A `country` field on the nav entry
 * means the next country is a data change instead of another hardcoded
 * `country_code === "AU"` branch in the shell.
 *
 * Built on the same tenant id as `useMyTenantId`, so a platform account acting
 * as a tenant correctly sees that tenant's country — the AU subgroup appears
 * when a super_admin acts as an AU tenant and disappears when they switch to
 * the Nepali one, which is the behaviour a tenant switcher has to have.
 *
 * Returns `undefined` while loading and `null` when there is no tenant. The
 * nav treats both as "not this country": a country-gated row must not flash
 * into view before the answer arrives, and must not appear at all for an
 * account with no tenant. That is the safe direction — a briefly missing row
 * corrects itself on load, whereas a briefly present one is a link that
 * answers "Forbidden" if clicked in that window.
 */
export function useMyTenantCountry(): {
  country: string | null | undefined;
  isLoading: boolean;
} {
  const { tenantId, isLoading: tenantLoading } = useMyTenantId();
  const { data, isLoading } = useQuery({
    queryKey: ["my-tenant-country", tenantId],
    enabled: !!tenantId,
    staleTime: Infinity,
    queryFn: async () => {
      const { data: tenant } = await supabase
        .from("tenants")
        .select("country_code")
        .eq("id", tenantId!)
        .maybeSingle();
      return (tenant?.country_code as string | undefined) ?? null;
    },
  });
  if (tenantLoading) return { country: undefined, isLoading: true };
  if (!tenantId) return { country: null, isLoading: false };
  return { country: data, isLoading };
}

/**
 * The signed-in user's tenant **record**, not just its id.
 *
 * ---------------------------------------------------------------------------
 * Why this exists
 * ---------------------------------------------------------------------------
 *
 * Sixteen pages hand-rolled this: read `profiles.tenant_id`, then read
 * `tenants` with it, both inside a `useEffect`, into a `useState` that starts
 * as `null`. That shape has two costs, and the second is worse than the first.
 *
 * **It is two sequential round trips**, on every mount, uncached — before the
 * page's own query has even started. On a free-tier database that is most of
 * the time the user spends looking at a blank panel.
 *
 * **And `null` ends up meaning two different things**: "still loading" and
 * "this account genuinely has no tenant". Rendered directly, the first
 * masquerades as the second. `/org` told a signed-in org admin *"Your account
 * isn't linked to an organization yet"* for 400ms on every visit — measured,
 * not theorised — because the effect had not resolved. On a real network that
 * is seconds, and the user reasonably believes it.
 *
 * So this returns `isLoading` as a first-class value, and callers **must**
 * branch on it before treating a null tenant as an answer. Distinguishing the
 * two states is the entire point; a caller that renders "no organisation" while
 * `isLoading` is true has reintroduced the bug.
 *
 * Cached with `staleTime: Infinity` on the shared tenant id, so the second page
 * a user visits pays nothing at all.
 */
export function useMyTenant(): {
  tenant: TenantRecord | null | undefined;
  tenantId: string | null | undefined;
  isLoading: boolean;
} {
  const { tenantId, isLoading: idLoading } = useMyTenantId();
  const { data, isLoading } = useQuery({
    queryKey: ["my-tenant", tenantId],
    enabled: !!tenantId,
    staleTime: Infinity,
    queryFn: async () => {
      const { data: tenant } = await supabase
        .from("tenants")
        .select("*")
        .eq("id", tenantId!)
        .maybeSingle();
      return (tenant as TenantRecord | null) ?? null;
    },
  });
  if (idLoading) return { tenant: undefined, tenantId: undefined, isLoading: true };
  if (!tenantId) return { tenant: null, tenantId: null, isLoading: false };
  return { tenant: data, tenantId, isLoading };
}

/** Shape of a `tenants` row as the client reads it. */
export type TenantRecord = {
  id: string;
  name: string;
  slug?: string | null;
  country_code?: string | null;
  currency_code?: string | null;
  status?: string | null;
  plan?: string | null;
  [key: string]: unknown;
};
