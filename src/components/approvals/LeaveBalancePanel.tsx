import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SkeletonRows } from "@/components/monday";
import { getLeaveDecisionContext } from "@/lib/approvals.functions";
import { cn } from "@/lib/utils";

/**
 * T3 — the employee's leave position, on the approval screen.
 *
 * ---------------------------------------------------------------------------
 * Two decisions worth knowing about
 * ---------------------------------------------------------------------------
 *
 * **The projection is taken to the leave start date, not today.** Accrual keeps
 * running between now and the first day off, so for a request booked months
 * ahead today's figure understates what the person will actually hold — and an
 * approver refusing on that basis refuses wrongly. Today's number is shown
 * beside it rather than instead of it, so the two are never confused.
 *
 * **Every leave type is listed, not only the one requested.** Approvers
 * routinely ask "do they have annual left instead?", and leaving this screen to
 * find out is the thing the panel exists to prevent.
 *
 * A request that would push the balance negative is called out explicitly. It
 * is not forbidden — unpaid and negotiated overdrafts are real — but it must
 * never be something the approver has to work out by subtracting columns.
 */
export function LeaveBalancePanel({ requestId }: { requestId: string }) {
  const ctxFn = useServerFn(getLeaveDecisionContext);
  const { data, isLoading, error } = useQuery({
    queryKey: ["leave-decision-context", requestId],
    queryFn: () => ctxFn({ data: { requestId } }),
    retry: false,
  });

  if (isLoading) return <SkeletonRows rows={3} />;
  if (error || !data) {
    return (
      <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-sm">
        <p className="font-medium text-destructive">Could not load the leave balance.</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Decide with care — this panel is missing, not empty.
        </p>
      </div>
    );
  }

  const { types, requested, wouldGoNegative, monthsToStart, request } = data as any;

  return (
    <div className="space-y-3 rounded-lg border bg-muted/30 p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold">Leave position</h3>
        <span className="text-xs text-muted-foreground">
          As at {request.start_date}
          {monthsToStart > 0 && ` · ${monthsToStart} month${monthsToStart === 1 ? "" : "s"} of accrual to come`}
        </span>
      </div>

      {wouldGoNegative && (
        <div className="flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/10 p-2.5 text-sm">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
          <div>
            <p className="font-medium text-destructive">
              Approving this takes {requested?.name} to {requested?.projected.toFixed(2)} days.
            </p>
            <p className="text-xs text-muted-foreground">
              Allowed, but it puts the balance below zero — check it is intended before approving.
            </p>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="text-muted-foreground">
            <tr>
              <th className="py-1 pr-3 text-left font-medium">Leave type</th>
              <th className="py-1 pr-3 text-right font-medium">Accrued today</th>
              <th className="py-1 pr-3 text-right font-medium">By start date</th>
              <th className="py-1 pr-3 text-right font-medium">Taken YTD</th>
              <th className="py-1 pr-3 text-right font-medium">Other pending</th>
              <th className="py-1 pr-3 text-right font-medium">This request</th>
              <th className="py-1 text-right font-medium">Projected</th>
            </tr>
          </thead>
          <tbody className="tabular-nums">
            {types.map((t: any) => (
              <tr
                key={t.leaveTypeId}
                className={cn("border-t", t.isRequested && "bg-primary/5 font-medium")}
              >
                <td className="py-1.5 pr-3">
                  {t.name}
                  {t.isRequested && (
                    <Badge variant="outline" className="ml-2 text-[10px]">
                      requested
                    </Badge>
                  )}
                  {!t.isPaid && <span className="ml-1 text-muted-foreground">(unpaid)</span>}
                </td>
                <td className="py-1.5 pr-3 text-right text-muted-foreground">
                  {t.accruedToday.toFixed(2)}
                </td>
                <td className="py-1.5 pr-3 text-right">{t.accruedByStart.toFixed(2)}</td>
                <td className="py-1.5 pr-3 text-right">{t.takenYtd.toFixed(2)}</td>
                <td className="py-1.5 pr-3 text-right">
                  {t.otherPending > 0 ? t.otherPending.toFixed(2) : "—"}
                </td>
                <td className="py-1.5 pr-3 text-right">
                  {t.thisRequest > 0 ? t.thisRequest.toFixed(2) : "—"}
                </td>
                <td
                  className={cn(
                    "py-1.5 text-right font-medium",
                    t.projected < 0 && "text-destructive",
                  )}
                >
                  {t.projected.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        Projected = accrued by the start date, less leave already taken, less other requests still
        awaiting a decision, less this one. Other pending requests are counted because approving
        both would otherwise overdraw the balance without either approver seeing it.
      </p>
    </div>
  );
}
