import { createFileRoute, redirect } from "@tanstack/react-router";

/**
 * Retired — redirects to /dashboard.
 *
 * W5 P2-6 · This was described as a leftover duplicate of /dashboard. Reading
 * both showed the opposite: it was the better implementation. /dashboard built
 * its five KPI counts with five separate client-side Supabase queries, while
 * this page called getDashboardSnapshot — one server call returning the same
 * five numbers PLUS pre-computed `manager`, `hr` and `finance` blocks that
 * nothing rendered.
 *
 * Those blocks are the per-role dashboard the W4 §5 design specified and never
 * got. They existed the whole time; the only page that fetched them had no nav
 * entry, so nobody saw them.
 *
 * So /dashboard adopted getDashboardSnapshot and the role sections first, and
 * only then did this route become a redirect. Deleting the "duplicate" on
 * sight would have thrown away the better half and left the server function
 * with no caller at all.
 *
 * Not to be confused with /me, which is a genuinely different page: it calls
 * getMeOverview and is the personal profile at a glance. Home and Me are two
 * distinct destinations and always were.
 */
export const Route = createFileRoute("/me/dashboard")({
  beforeLoad: () => {
    throw redirect({ to: "/dashboard", replace: true });
  },
});
