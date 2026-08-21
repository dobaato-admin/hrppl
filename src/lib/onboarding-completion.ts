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
 * Pure and dependency-free so the rule is unit-testable without a database.
 */

export type ChecklistItemLike = {
  key: string;
  required?: boolean;
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
): OnboardingCompletion {
  const byKey = new Map<string, ProgressLike>();
  for (const p of progress) byKey.set(`${p.checklist_id}:${p.item_key}`, p);

  let totalRequired = 0;
  let doneRequired = 0;
  let awaitingReview = 0;
  const rejected: { checklistId: string; itemKey: string }[] = [];

  for (const cl of checklists) {
    for (const item of cl.items ?? []) {
      const row = byKey.get(`${cl.id}:${item.key}`);
      const isRejected = row?.approval_status === REJECTED;

      if (isRejected) rejected.push({ checklistId: cl.id, itemKey: item.key });
      if (row && !isRejected && row.approval_status !== APPROVED) awaitingReview++;

      // Optional items are tracked for progress but never gate completion.
      if (!item.required) continue;
      totalRequired++;
      if (row && !isRejected) doneRequired++;
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
