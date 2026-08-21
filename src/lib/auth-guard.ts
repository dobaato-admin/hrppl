import { createMiddleware } from "@tanstack/react-start";
// Aliased on import: within this module "raw" always means "JWT verified, but
// suspension NOT checked", so the two exports below can never be confused.
import { requireSupabaseAuth as requireValidJwt } from "@/integrations/supabase/auth-middleware";

/**
 * Authenticated **and** not suspended. The default guard for every server fn.
 *
 * `requireValidJwt` (generated, do not edit) proves the caller holds a valid
 * token. It says nothing about whether that account is still allowed to act —
 * the Critical finding in the Finalization Plan (§1 #4): a token minted before
 * a suspension kept working until it expired.
 *
 * This re-checks status on *every* request, which is the stated requirement.
 * It injects the same context as the wrapped middleware
 * ({ supabase, userId, claims }), so it is a drop-in replacement at all ~92
 * call sites.
 *
 * The assert sits behind a dynamic import so the service-role client is never
 * pulled into a client bundle via this module's top level.
 */
export const requireActiveUser = createMiddleware({ type: "function" })
  .middleware([requireValidJwt])
  .server(async ({ next, context }) => {
    const { assertAccountActive } = await import("@/lib/account-status.server");
    const { supabase, userId } = context as { supabase: unknown; userId: string };
    // The caller's own client — this check needs no elevation, and depending on
    // the service-role key here would take the whole app down wherever that key
    // is absent.
    await assertAccountActive(supabase as never, userId);
    return next();
  });

/**
 * Authenticated, suspension deliberately NOT enforced.
 *
 * Only for endpoints that must stay reachable *in order to report* that the
 * caller is suspended. Without one, the route gate cannot tell "suspended"
 * apart from "server is broken", and fails open into a shell UI where every
 * other call errors.
 *
 * Permitted use: reads the caller's own status, exposes no tenant data.
 * Everything else must use `requireActiveUser`.
 */
export const requireAuthAllowSuspended = requireValidJwt;

/**
 * Back-compatible alias. Call sites read identically after the import-path
 * swap, but now resolve to the suspension-checked guard. Prefer the explicit
 * `requireActiveUser` in new code.
 */
export const requireSupabaseAuth = requireActiveUser;
