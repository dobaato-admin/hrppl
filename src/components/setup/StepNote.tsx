import { Link } from "@tanstack/react-router";
import { Info, PencilLine } from "lucide-react";

/**
 * What this step actually does, and what happens to it afterwards.
 *
 * Every step of the creation wizard asked for something without saying what it
 * would produce or whether it could be undone. The sharpest example was
 * "Create the three default leave types" — a ticked box that never said which
 * three, how many days each carried, or that they were editable. Ticking it is
 * a decision about how everybody's leave accrues; it should not be a leap of
 * faith.
 *
 * So each step now states three things, in this order:
 *
 *   1. what will exist when you press the button
 *   2. that you can change it later, and on which page
 *   3. that the Setup guide picks up where this wizard stops
 *
 * The third matters most. This wizard creates an organisation; it does not
 * configure one. Everything that makes payroll actually run — pay items,
 * overtime rates, holidays, policies — lives in the Setup guide afterwards, and
 * an admin who does not know that has no reason to look for it.
 */
export function StepNote({
  children,
  editLabel,
  editTo,
}: {
  /** What this step creates. Be concrete: numbers, names, quantities. */
  children: React.ReactNode;
  /** Where this can be changed afterwards, e.g. "Leave types". */
  editLabel?: string;
  editTo?: string;
}) {
  return (
    <div className="rounded-lg border bg-muted/40 p-3 text-sm">
      <div className="flex gap-2.5">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
        <div className="min-w-0 space-y-2">
          <div className="text-muted-foreground">{children}</div>
          {editLabel && editTo && (
            <p className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
              <PencilLine className="h-3.5 w-3.5" />
              Change this later under{" "}
              <Link to={editTo} className="font-medium text-primary hover:underline">
                {editLabel}
              </Link>
              .
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Shown once, on the last step — the handover to the Setup guide.
 *
 * Deliberately not on every step: repeated on all five it becomes furniture
 * nobody reads, and the moment it actually matters is when the wizard is about
 * to end and the admin is about to be dropped on a dashboard.
 */
export function SetupGuideHandoff() {
  return (
    <div className="rounded-lg border border-primary/30 bg-primary/5 p-3 text-sm">
      <p className="font-medium">This creates your organisation. The Setup guide configures it.</p>
      <p className="mt-1 text-muted-foreground">
        Pay items, overtime and penalty rates, public holidays, expense categories and the policies
        your staff sign are all still to do. The{" "}
        <Link to="/org/setup-guide" className="font-medium text-primary hover:underline">
          Setup guide
        </Link>{" "}
        walks you through them in order and tells you what is still missing — it is on your
        dashboard until your organisation goes live, and you can leave and come back to it at any
        time.
      </p>
    </div>
  );
}
