import { createFileRoute, redirect } from "@tanstack/react-router";

/**
 * Retired — redirects to /admin/security.
 *
 * W5 P2 · These two pages read and wrote exactly the same data through exactly
 * the same two server functions (listSecurityFindings,
 * updateSecurityFindingStatus). Only one was ever in the nav.
 *
 * The one that was NOT in the nav turned out to be the better of the two: at
 * 404 lines against 318, it exposed `ticket_url` and `fixed_in_commit`, which
 * updateSecurityFindingStatus has always accepted and which /admin/security
 * never offered. So two columns of the security audit trail could only be
 * filled in from a page nobody could reach. Those fields were ported to
 * /admin/security before this route was reduced to a redirect — deleting the
 * "duplicate" without checking would have quietly removed the capability
 * rather than the redundancy.
 *
 * Kept as a redirect rather than deleted outright: the path may be bookmarked,
 * and a 404 for someone who had it open is a worse outcome than one hop.
 */
export const Route = createFileRoute("/admin/security-findings")({
  beforeLoad: () => {
    throw redirect({ to: "/admin/security", replace: true });
  },
});
