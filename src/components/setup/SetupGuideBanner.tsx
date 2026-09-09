import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { can } from "@/lib/rbac";
import type { AppRole } from "@/lib/rbac";
import { getSetupGuide } from "@/lib/setup-guide.functions";

/**
 * "Your organisation isn't set up yet" — on the dashboard, until it is.
 *
 * ---------------------------------------------------------------------------
 * Why this is on the dashboard and not only in the nav
 * ---------------------------------------------------------------------------
 *
 * A new org admin finished the creation wizard at `/org/setup` and was dropped
 * on the dashboard. Nothing mentioned that seven segments of configuration
 * existed, and the guide that walks them sat behind a flyout, two rows below a
 * differently-named wizard they had just completed. The predictable outcome is
 * an organisation that starts inviting staff and running payroll it never
 * configured.
 *
 * **Deliberately not dismissible.** An org that has not finished setup cannot
 * run payroll correctly, and a dismissed banner is exactly how that gets
 * forgotten. It removes itself the moment the tenant is activated — which is a
 * fact about the data, re-derived server-side, not a preference someone set.
 *
 * Renders nothing at all for anyone who cannot act on it: employees, managers,
 * and platform accounts with no tenant. Showing a call to action to someone
 * without the permission to follow it is worse than showing nothing.
 */
export function SetupGuideBanner({ roles }: { roles: AppRole[] }) {
  const guideFn = useServerFn(getSetupGuide);
  const allowed = can("org.setupGuide", roles);

  const { data } = useQuery({
    queryKey: ["setup-guide"],
    queryFn: () => guideFn(),
    enabled: allowed,
    retry: false,
    // Shares the cache entry with /org/setup-guide itself, so arriving there
    // from this banner costs nothing.
    staleTime: 60_000,
  });

  if (!allowed || !data) return null;
  // Activated, or a platform account with no tenant of its own — either way
  // there is nothing here to act on.
  if (data.state?.activated_at) return null;

  const next = data.segments.find((s) => !s.done && !s.skipped) ?? data.segments[0];
  const outstanding = data.segments.filter((s) => s.required && !s.done);

  return (
    <section
      className="rounded-xl border border-primary/30 bg-primary/5 p-4 md:p-5"
      aria-labelledby="setup-banner-title"
    >
      <div className="flex flex-wrap items-start gap-4">
        <span className="mt-0.5 rounded-lg bg-primary/15 p-2 text-primary">
          <Rocket className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 id="setup-banner-title" className="text-base font-semibold">
            Finish setting up {data.tenantProfile?.legal_name ?? "your organisation"}
          </h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {outstanding.length > 0 ? (
              <>
                {data.percent}% configured — still required:{" "}
                <span className="font-medium text-foreground">
                  {outstanding.map((s) => s.title).join(", ")}
                </span>
                .
              </>
            ) : (
              <>
                {data.percent}% configured — everything required is done. You can activate whenever
                you are ready.
              </>
            )}
          </p>
          <Progress value={data.percent} className="mt-3 h-2 max-w-md" />
        </div>
        <Button asChild className="shrink-0">
          <Link to="/org/setup-guide">
            {outstanding.length > 0 ? `Continue: ${next?.title ?? "Setup"}` : "Review & activate"}
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </section>
  );
}
