import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Building2, Check } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { listActingTenantOptions, setActingTenant } from "@/lib/platform-tenant.functions";

/**
 * Tenant picker for super_admin / regional_admin — the only roles with
 * `profiles.tenant_id = NULL`. Every tenant-owned surface is correctly empty
 * for them until they pick a tenant to act as (src/lib/tenant-scope.ts). Not
 * rendered for anyone else; see AppShell.
 */
export function TenantSwitcher() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const list = useServerFn(listActingTenantOptions);
  const setTenant = useServerFn(setActingTenant);

  const { data } = useQuery({
    queryKey: ["platform-acting-tenant-options", user?.id],
    enabled: !!user,
    queryFn: () => list(),
    staleTime: 60_000,
  });

  const mutation = useMutation({
    mutationFn: (tenantId: string | null) => setTenant({ data: { tenantId } }),
    // AuthRouteGate's own status cache (a hand-rolled Map, not React Query —
    // see AuthRouteGate.tsx) is untouched here and can lag up to 2 minutes.
    // That's inert for tenant gating itself: isPlatformAdmin bypasses the
    // tenant branch unconditionally regardless of tenantId. It only matters
    // for anything else that reads getMyGateStatus, and nothing does today.
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["platform-acting-tenant-options", user?.id] });
      qc.invalidateQueries({ queryKey: ["my-tenant-id", user?.id] });
    },
  });

  if (!data?.isPlatformAdmin) return null;

  const current = data.tenants.find((t) => t.id === data.actingTenantId);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-9 gap-1.5"
          data-testid="tenant-switcher-trigger"
        >
          <Building2 className="h-4 w-4" />
          <span className="hidden max-w-[10rem] truncate sm:inline">
            {current ? current.name : "Select organization"}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>Act as organization</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {data.tenants.length === 0 ? (
          <div className="px-2 py-1.5 text-sm text-muted-foreground">
            No organizations in scope.
          </div>
        ) : (
          data.tenants.map((tenant) => (
            <DropdownMenuItem
              key={tenant.id}
              onClick={() => mutation.mutate(tenant.id)}
              disabled={mutation.isPending}
              className="flex items-center justify-between gap-2"
            >
              <span className="truncate">{tenant.name}</span>
              {tenant.id === data.actingTenantId ? <Check className="h-4 w-4 shrink-0" /> : null}
            </DropdownMenuItem>
          ))
        )}
        {data.actingTenantId ? (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => mutation.mutate(null)}
              disabled={mutation.isPending}
              className="text-muted-foreground"
            >
              Stop acting
            </DropdownMenuItem>
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
