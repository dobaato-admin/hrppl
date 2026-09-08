/**
 * Onboarding completion (Finalization Plan §1 #1).
 *
 * The reported defect: "persistent onboarding screen shown even after checklist
 * completion". The page computed a percentage and did nothing at 100% — there
 * was no notion of "done", so there was nothing to redirect on.
 *
 * Deliberate product decision on what "done" means: the employee is finished
 * when THEY have finished, i.e. every required item is ticked. HR approval and
 * sign-off continue afterwards and do not hold the employee on the page —
 * waiting on an admin is precisely the stuck-screen symptom being fixed.
 *
 * A rejected item is the exception: HR bouncing something back reopens it, so
 * the employee is no longer complete and the task returns.
 *
 * ---------------------------------------------------------------------------
 * Profile-backed items are DERIVED, not looked up
 * ---------------------------------------------------------------------------
 *
 * Some checklist items ("Bank details", "Tax & government IDs") are satisfied by
 * filling a section of `staff_onboarding_profiles`, not by ticking a box.
 * `saveMyOnboardingProfile` writes matching `onboarding_progress` rows for those
 * — but only for checklists **already assigned at the moment of the save**, and
 * nothing re-runs it afterwards.
 *
 * So the ordinary sequence broke: an employee fills in their profile, HR assigns
 * the checklist the next day, and the item stays outstanding **permanently**,
 * asking for data the system already holds — with the form prefilled from that
 * very data, which is how the bug was reported.
 *
 * Passing `completedSections` makes such an item complete because the data is
 * there, not because a sync happened to run at the right moment. It is the same
 * rule the guided setup follows: **derive completion from the data, never from
 * a flag saying somebody once did it.** The stored rows remain — HR's tracker
 * and the audit trail want them — but nothing depends on them having been
 * written in time.
 *
 * Pure and dependency-free so the rule is unit-testable without a database.
 */

export type ChecklistItemLike = {
  key: string;
  required?: boolean;
  /**
   * When set, this item is satisfied by a section of the employee's onboarding
   * profile rather than by ticking a box. See {@link computeOnboardingCompletion}.
   */
  profile_section?: string | null;
};

export type ChecklistLike = {
  id: string;
  items: ChecklistItemLike[];
};

export type ProgressLike = {
  checklist_id: string;
  item_key: string;
  /** null/undefined = submitted, awaiting review. */
  approval_status?: string | null;
};

export type OnboardingCompletion = {
  /** Required items across all assigned checklists. */
  totalRequired: number;
  /** Required items the employee has ticked and that were not bounced back. */
  doneRequired: number;
  /** 0-100, over required items only. */
  percent: number;
  /** The employee has done everything asked of them. */
  complete: boolean;
  /** Items HR sent back; these reopen and block completion. */
  rejected: { checklistId: string; itemKey: string }[];
  /** Ticked but not yet approved — shown as "awaiting review", never blocking. */
  awaitingReview: number;
};

const REJECTED = "rejected";
const APPROVED = "approved";

/**
 * An employee with no checklists assigned is NOT complete: there is nothing to
 * be done, but treating that as "finished onboarding" would redirect a brand
 * new hire away from the page before anyone assigns them anything.
 */
export function computeOnboardingCompletion(
  checklists: ChecklistLike[],
  progress: ProgressLike[],
  /**
   * Profile sections the employee has actually filled in, from
   * `computeCompleteSections`. Optional: callers with no profile in hand behave
   * exactly as before.
   */
  completedSections: Iterable<string> = [],
): OnboardingCompletion {
  const byKey = new Map<string, ProgressLike>();
  for (const p of progress) byKey.set(`${p.checklist_id}:${p.item_key}`, p);
  const sections = new Set(completedSections);

  let totalRequired = 0;
  let doneRequired = 0;
  let awaitingReview = 0;
  const rejected: { checklistId: string; itemKey: string }[] = [];

  for (const cl of checklists) {
    for (const item of cl.items ?? []) {
      const row = byKey.get(`${cl.id}:${item.key}`);
      const isRejected = row?.approval_status === REJECTED;

      // The employee has supplied the data this item asks for, whether or not a
      // progress row was ever written for it.
      const satisfiedByProfile = !!item.profile_section && sections.has(item.profile_section);

      if (isRejected) rejected.push({ checklistId: cl.id, itemKey: item.key });
      if (row && !isRejected && row.approval_status !== APPROVED) awaitingReview++;

      // Optional items are tracked for progress but never gate completion.
      if (!item.required) continue;
      totalRequired++;
      // HR bouncing an item back reopens it even if the profile still holds the
      // data — the rejection is a statement about the content, not its absence.
      if (isRejected) continue;
      if (row || satisfiedByProfile) doneRequired++;
    }
  }

  const percent = totalRequired > 0 ? Math.round((doneRequired / totalRequired) * 100) : 0;

  return {
    totalRequired,
    doneRequired,
    percent,
    complete: totalRequired > 0 && doneRequired === totalRequired,
    rejected,
    awaitingReview,
  };
}
