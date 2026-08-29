import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Building2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { listActingTenantOptions, setActingTenant } from "@/lib/platform-tenant.functions";

/**
 * Persistent "acting as" banner for platform admins with a tenant selected —
 * see TenantSwitcher. Acting inside a customer tenant must never be
 * ambiguous, so this renders on every page, not just where the switcher
 * lives (same slot pattern as MfaEnforcementBanner, just below the header).
 */
export function ActingTenantBanner() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const list = useServerFn(listActingTenantOptions);
  const clear = useServerFn(setActingTenant);

  const { data } = useQuery({
    queryKey: ["platform-acting-tenant-options", user?.id],
    enabled: !!user,
    queryFn: () => list(),
    staleTime: 60_000,
  });

  const mutation = useMutation({
    mutationFn: () => clear({ data: { tenantId: null } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["platform-acting-tenant-options", user?.id] });
      qc.invalidateQueries({ queryKey: ["my-tenant-id", user?.id] });
    },
  });

  if (!data?.isPlatformAdmin || !data.actingTenantId) return null;
  const current = data.tenants.find((t) => t.id === data.actingTenantId);

  return (
    <div
      role="status"
      className="flex items-center gap-3 border-b border-amber-500/30 bg-amber-500/10 px-4 py-2 text-sm text-amber-900 dark:text-amber-200"
    >
      <Building2 className="h-4 w-4 shrink-0" />
      <div className="flex-1">
        Acting as <strong className="font-semibold">{current?.name ?? "an organization"}</strong> —
        every organization-scoped page reflects their data.
      </div>
      <button
        type="button"
        onClick={() => mutation.mutate()}
        disabled={mutation.isPending}
        className="font-medium underline underline-offset-4 disabled:opacity-50"
      >
        Stop acting
      </button>
    </div>
  );
}
