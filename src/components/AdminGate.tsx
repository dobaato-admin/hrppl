import { useEffect, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { ADMIN_LAYOUT_ROLES } from "@/lib/rbac";

/**
 * Client-side defense-in-depth gate for admin-only routes.
 *
 * Server functions invoked by these pages already enforce role checks via
 * `assertOrgAdmin` / `assertHrOrAdmin` / `assertSuperAdmin` — this wrapper
 * makes the redirect immediate so non-admins never see partial admin UI
 * before the data calls fail. RBAC regression tests rely on every
 * src/routes/admin.*.tsx file gating with either a direct role check or
 * this component.
 *
 * NOTE: The default allow-set is intentionally permissive — any admin-class
 * role in ADMIN_LAYOUT_ROLES (super_admin, org_admin, regional_admin, hr,
 * manager). Per-page server fns enforce the finer-grained matrix from
 * docs/rbac.md.
 */
const ADMIN_ROLES = ADMIN_LAYOUT_ROLES as ReadonlySet<string>;

export function AdminGate({ children, allow = ADMIN_ROLES }: { children: ReactNode; allow?: ReadonlySet<string> }) {
  const { user, roles, rolesLoaded } = useAuth();
  const navigate = useNavigate();
  const allowed = rolesLoaded && roles.some((r) => allow.has(r));

  useEffect(() => {
    if (!rolesLoaded) return;
    if (!user) {
      navigate({ to: "/auth" });
      return;
    }
    if (!allowed) navigate({ to: "/dashboard" });
  }, [rolesLoaded, user, allowed, navigate]);

  if (!rolesLoaded) return <div className="p-6 text-muted-foreground">Loading…</div>;
  if (!user || !allowed) return null;
  return <>{children}</>;
}
