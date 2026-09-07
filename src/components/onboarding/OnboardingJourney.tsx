import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Check, CircleDashed, Clock } from "lucide-react";
import { SectionCard, SkeletonRows, StatusChip } from "@/components/monday";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { getMyOnboardingJourney } from "@/lib/onboarding-journey.functions";

/**
 * Wave 7, Phase 2 — the one place a new starter can see everything.
 *
 * Before this, an employee's onboarding lived on four pages that did not
 * reference each other; `/onboarding/profile` in particular was **not linked
 * from `/onboarding` at all**, so people reached the personal-details form only
 * if someone sent them the URL.
 *
 * Rendered at the top of `/onboarding` rather than as a fifth page, because
 * adding another destination is the problem, not the fix.
 *
 * Every count comes from `getMyOnboardingJourney`, which reads the data — and
 * for the checklist step defers to `computeOnboardingCompletion`, so the
 * employee and the HR tracker cannot give different answers about the same
 * person.
 */
export function OnboardingJourney() {
  const journeyFn = useServerFn(getMyOnboardingJourney);
  const { data, isLoading } = useQuery({
    queryKey: ["my-onboarding-journey"],
    queryFn: () => journeyFn(),
    staleTime: 15_000,
  });

  if (isLoading) return <SkeletonRows rows={4} />;
  if (!data || data.noEmployeeRecord) return null;

  const steps = data.steps;
  const doneCount = steps.filter((s) => s.complete).length;
  const pct = Math.round((doneCount / steps.length) * 100);

  return (
    <SectionCard
      tone={data.complete ? "done" : "primary"}
      title={data.complete ? "You're all set" : "Everything on your list"}
      description={
        data.complete
          ? "Nothing outstanding. This page stays here if you want to review anything."
          : `${doneCount} of ${steps.length} sections done. Start anywhere — nothing has to be finished in order.`
      }
      actions={
        data.awaitingReview > 0 ? (
          <StatusChip tone="working">
            <Clock className="mr-1 inline h-3 w-3" />
            {data.awaitingReview} with HR
          </StatusChip>
        ) : undefined
      }
    >
      <Progress value={pct} className="mb-4 h-2" />
      <ul className="grid gap-2 sm:grid-cols-2">
        {steps.map((s) => (
          <li
            key={s.key}
            className={cn(
              "flex items-start gap-3 rounded-lg border p-3",
              s.complete ? "bg-muted/30" : "hover:bg-muted/40",
            )}
          >
            <span className="mt-0.5 shrink-0">
              {s.complete ? (
                <Check className="h-4 w-4 text-primary" />
              ) : (
                <CircleDashed className="h-4 w-4 text-muted-foreground" />
              )}
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium">{s.title}</div>
              <div className="text-xs text-muted-foreground">
                {/* "Nothing assigned yet" is not the same as "0 of 0", and an
                    employee reading the second one reasonably concludes the
                    page is broken. */}
                {s.key === "documents" && data.nothingAssigned
                  ? "Nothing assigned yet — your manager will add these."
                  : s.total === 0
                    ? "Nothing outstanding."
                    : `${s.done} of ${s.total} done`}
              </div>
              {s.outstanding.length > 0 && (
                <div className="mt-1 text-xs text-muted-foreground">
                  Still to do: {s.outstanding.join(", ")}
                </div>
              )}
            </div>
            {!s.complete && (
              <Button asChild size="sm" variant="outline">
                <Link to={s.href}>
                  Open <ArrowRight className="ml-1 h-3.5 w-3.5" />
                </Link>
              </Button>
            )}
          </li>
        ))}
      </ul>
    </SectionCard>
  );
}
