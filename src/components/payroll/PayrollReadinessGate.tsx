import { Link } from "@tanstack/react-router";
import { AlertTriangle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { partitionForRun, type OutstandingItem } from "@/lib/payroll-readiness";

/**
 * "Payroll setup isn't finished" — on the payroll page, before anybody presses
 * anything.
 *
 * This existed only as a refusal from `createPayrollRun`: the admin opened New
 * run, filled in three dates, pressed Create, and *then* got a toast telling
 * them the run could not be opened. The information was available before they
 * started and was being withheld until after they had done the work.
 *
 * So the same list now renders at the top of the page, the New run button is
 * disabled with a reason, and every item links to the page that fixes it. The
 * server-side refusal stays exactly as it was — it is the enforcement, and a
 * banner is not — but it should now be unreachable through the UI.
 */
export function PayrollReadinessGate({ items }: { items: OutstandingItem[] }) {
  // Only the payroll half stops a run. Leave setup changes balances, not pay,
  // and `createPayrollRun` passes null for it deliberately — so listing it
  // under "you can't run payroll yet" would tell the admin something false and
  // send them to fix a thing that was not in their way.
  const { blocking, advisory } = partitionForRun(items);
  if (blocking.length === 0 && advisory.length === 0) return null;

  return (
    <section
      className={
        blocking.length > 0
          ? "rounded-lg border border-status-stuck/40 bg-status-stuck/5 p-4"
          : "rounded-lg border border-border bg-muted/30 p-4"
      }
      aria-labelledby="payroll-readiness-title"
    >
      <div className="flex items-start gap-3">
        <AlertTriangle
          className={
            blocking.length > 0
              ? "mt-0.5 h-5 w-5 shrink-0 text-status-stuck"
              : "mt-0.5 h-5 w-5 shrink-0 text-muted-foreground"
          }
        />
        <div className="min-w-0 flex-1 space-y-3">
          <div>
            <h2 id="payroll-readiness-title" className="text-sm font-semibold">
              {blocking.length > 0
                ? `You can't run payroll yet — ${blocking.length} setup ${
                    blocking.length === 1 ? "item is" : "items are"
                  } outstanding`
                : "Payroll is ready — some other setup is still outstanding"}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {blocking.length > 0
                ? "A run opened without these would produce wrong numbers, so it is refused. Each one below goes straight to where it is configured."
                : "None of these stop a payroll run. They are here so they do not get forgotten."}
            </p>
          </div>

          <ul className="space-y-2">
            {blocking.map((item) => (
              <li key={item.key} className="text-sm">
                <Link to={item.href} className="font-medium underline-offset-4 hover:underline">
                  {item.label}
                </Link>
                <span className="text-muted-foreground"> — {item.detail}</span>
              </li>
            ))}
          </ul>

          {advisory.length > 0 && (
            <div className="rounded-md bg-background/60 px-3 py-2">
              <p className="text-xs font-medium">
                Doesn't stop a run, but still outstanding:
              </p>
              <ul className="mt-1 space-y-1">
                {advisory.map((item) => (
                  <li key={item.key} className="text-xs text-muted-foreground">
                    <Link to={item.href} className="underline-offset-4 hover:underline">
                      {item.label}
                    </Link>{" "}
                    — {item.detail}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {blocking.length > 0 && (
            <Button asChild size="sm">
              <Link to="/org/setup-guide" search={{ segment: "payroll" as const }}>
                Finish payroll setup <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}
