import { Link } from "@tanstack/react-router";
import { AlertTriangle, ArrowRight, CheckCircle2 } from "lucide-react";
import type { OutstandingItem } from "@/lib/payroll-readiness";

/**
 * "Payroll setup isn't finished" — as a notice, never as a blocker.
 *
 * T19 · The invite step used to refuse outright: no invitation could be
 * created until payroll, overtime and leave setup were complete, and the
 * refusal listed the raw check keys in red. That made the ordinary case
 * impossible — an org admin's first invite is often the HR or finance person
 * who is going to do the payroll setup — and left the row reading "Failed".
 *
 * So this states the consequence (nobody can be *paid* yet), names what is
 * missing in the words an admin uses, links each one to the page that fixes
 * it, and gets out of the way.
 */
export function PayrollSetupNotice({ items }: { items: OutstandingItem[] }) {
  if (items.length === 0) return null;

  return (
    <section
      className="rounded-lg border border-status-stuck/40 bg-status-stuck/5 p-4"
      aria-labelledby="payroll-setup-notice"
    >
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-status-stuck" />
        <div className="min-w-0 flex-1 space-y-3">
          <div>
            <h3 id="payroll-setup-notice" className="text-sm font-medium">
              Payroll setup isn't finished — you can still invite people
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Invitations go out normally. Nobody can be <em>paid</em> until the items below are
              configured, and running payroll will refuse until they are.
            </p>
          </div>

          <ul className="space-y-2">
            {items.map((item) => (
              <li key={item.key} className="text-sm">
                <Link
                  to={item.href}
                  className="font-medium underline-offset-4 hover:underline"
                >
                  {item.label}
                </Link>
                <span className="text-muted-foreground"> — {item.detail}</span>
              </li>
            ))}
          </ul>

          <p className="rounded-md bg-background/60 px-3 py-2 text-xs text-muted-foreground">
            <strong className="font-medium text-foreground">Suggested order:</strong> invite the
            person who will set up payroll first, let them finish it, then invite everyone else.
            That way nobody is waiting on an account that cannot be paid.
          </p>
        </div>
      </div>
    </section>
  );
}

/**
 * The other half: confirmation, once there is nothing outstanding. Shown only
 * where the readiness was actually read — `known` false means a check failed,
 * and an unread check must not be reported as a passed one.
 */
export function PayrollSetupComplete({ known }: { known: boolean }) {
  if (!known) return null;
  return (
    <p className="flex items-center gap-2 rounded-lg border border-status-done/40 bg-status-done/5 px-3 py-2 text-sm">
      <CheckCircle2 className="h-4 w-4 shrink-0 text-status-done" />
      Payroll setup is complete — people you invite can be paid as soon as they accept.
    </p>
  );
}

/** A link into the part of the setup guide that is outstanding. */
export function FinishPayrollSetupLink() {
  return (
    <Link
      to="/org/setup-guide"
      search={{ segment: "payroll" as const }}
      className="inline-flex items-center gap-1 text-sm font-medium underline-offset-4 hover:underline"
    >
      Finish payroll setup <ArrowRight className="h-3 w-3" />
    </Link>
  );
}
