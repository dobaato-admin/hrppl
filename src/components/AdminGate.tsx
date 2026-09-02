import { useEffect, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { can, type AppRole, type Feature } from "@/lib/rbac";

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
 * ---------------------------------------------------------------------------
 * W5 · Two ways to declare the gate, and when to use which
 * ---------------------------------------------------------------------------
 *
 * `feature` — THE DEFAULT. Resolves the allow-set through `can()`, reading the
 * same MATRIX entry the sidebar reads for that destination. Because the nav row
 * and the route quote one key, they cannot drift: changing who may reach a page
 * is a one-line edit to that feature's role set in rbac.ts, and it moves both.
 *
 *     <AdminGate feature="org.departments">
 *
 * `allow` — for the sets that must equal a DATABASE POLICY rather than a UI
 * intent: OFFBOARDING_ROLES, WFH_APPROVER_ROLES, SUPER_ADMIN_ONLY. These stay
 * explicit so the constant keeps its comment naming the policy it mirrors.
 * Widening one without widening the policy in the same change just moves the
 * failure from "link hidden" to "new row violates row-level security policy" —
 * which is exactly how HR reached offboarding and got rejected by Postgres.
 *
 *     <AdminGate allow={OFFBOARDING_ROLES}>
 *
 * Exactly one of the two is required. There is deliberately no default: the
 * old one was ADMIN_LAYOUT_ROLES, which admits seven roles, so a bare
 * <AdminGate> silently granted far more than its author usually intended. That
 * is now a type error rather than a convention documented in a comment.
 */

type AdminGateProps = { children: ReactNode } & (
  | {
      /** Feature key — resolves to the same role set the nav row uses. */
      feature: Feature;
      allow?: never;
    }
  | {
      /** Explicit role set. Only for sets that mirror an RLS policy. */
      allow: ReadonlySet<string>;
      feature?: never;
    }
);

export function AdminGate({ children, feature, allow }: AdminGateProps) {
  const { user, roles, rolesLoaded } = useAuth();
  const navigate = useNavigate();

  const allowed =
    rolesLoaded &&
    (feature
      ? can(feature, roles as readonly AppRole[])
      : roles.some((r) => allow!.has(r)));

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
