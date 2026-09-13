/**
 * T22 · When to nudge an org admin who left setup unfinished.
 *
 * The cadence is **24 hours, 3 days, 7 days, then stop** — the ticket's own
 * suggestion, and the one implemented here. Three is the point at which a
 * reminder stops being help and starts being noise, and an organisation that
 * has ignored a week of them is not going to be moved by a fourth.
 *
 * Kept as a pure function, separate from the sweep that sends the mail,
 * because the interesting failures here are all arithmetic: reminding twice
 * in an hour, restarting the ladder after a gap, or never stopping.
 */

export interface SetupProgressRow {
  /** When the organisation was created. The ladder is measured from here. */
  created_at: string;
  /** Null until the setup wizard was finished. */
  completed_at?: string | null;
  last_reminder_at?: string | null;
  reminder_count?: number | null;
}

/** Hours after creation at which each reminder falls due. */
export const REMINDER_SCHEDULE_HOURS = [24, 72, 168] as const;

/** No two reminders inside this window, whatever the schedule says. */
const MIN_GAP_MS = 12 * 3600_000;

export interface ReminderDecision {
  /** 1-based: the first, second or third reminder. */
  sequence: number;
  /** Whole days since the organisation was created, for the copy. */
  daysSinceCreated: number;
}

/**
 * The reminder now due for this organisation, or null.
 *
 * Returns null — deliberately — for every one of these:
 *
 * - setup is finished (`completed_at` set);
 * - all three reminders have been sent;
 * - the next scheduled point has not been reached;
 * - one was sent recently, even if the schedule says another is due. A clock
 *   change, a re-run of the sweep, or a backfilled `created_at` should not be
 *   able to send somebody three emails in a morning.
 */
export function dueSetupReminder(
  row: SetupProgressRow,
  now: Date = new Date(),
): ReminderDecision | null {
  if (row.completed_at) return null;

  const sent = Math.max(0, Number(row.reminder_count ?? 0));
  if (sent >= REMINDER_SCHEDULE_HOURS.length) return null;

  const created = new Date(row.created_at).getTime();
  if (!Number.isFinite(created)) return null;

  const elapsedMs = now.getTime() - created;
  if (elapsedMs < 0) return null;

  const dueAfterHours = REMINDER_SCHEDULE_HOURS[sent];
  if (elapsedMs < dueAfterHours * 3600_000) return null;

  if (row.last_reminder_at) {
    const last = new Date(row.last_reminder_at).getTime();
    if (Number.isFinite(last) && now.getTime() - last < MIN_GAP_MS) return null;
  }

  return {
    sequence: sent + 1,
    daysSinceCreated: Math.floor(elapsedMs / 86_400_000),
  };
}

/**
 * The steps still outstanding, named the way the wizard names them.
 *
 * A reminder that says "you haven't finished setup" is worth less than one
 * that says which two steps are left.
 */
export const SETUP_STEP_LABELS: Record<string, string> = {
  details_done: "Organisation details",
  branding_done: "Branding",
  departments_done: "Departments",
  defaults_done: "Leave defaults",
  invites_done: "Invite your team",
};

export function outstandingSetupSteps(progress: Record<string, unknown>): string[] {
  return Object.entries(SETUP_STEP_LABELS)
    .filter(([column]) => !progress?.[column])
    .map(([, label]) => label);
}
