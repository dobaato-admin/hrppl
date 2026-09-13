/**
 * What is still outstanding before this organisation can pay anybody, said in
 * the words an admin uses rather than the field names the checks are keyed on.
 *
 * T19 · This exists because the same list was needed in three places that had
 * been saying three different things:
 *
 *   - the invite step, which used to *refuse* and print the raw keys
 *     ("Outstanding: payItems, payDates") as a red error;
 *   - the setup wizard, which now shows the same items as a notice; and
 *   - `createPayrollRun`, which is where the refusal actually belongs.
 *
 * Inviting someone is not the moment payroll setup matters. An admin may
 * legitimately need to invite the HR or finance person who is going to do the
 * payroll setup — blocking the invite on it makes that impossible, and was
 * reported as an invitation stuck at "Failed" with no route forward.
 */

export interface PayrollReadinessSteps {
  payItems: boolean;
  payDates: boolean;
  overtimeRates: boolean;
  currency: boolean;
  payslipTemplate: boolean;
}

export interface LeaveReadinessSteps {
  leaveTypes: boolean;
  accruals: boolean;
  approvalRouting: boolean;
}

export interface OutstandingItem {
  /** Stable key, for tests and for telling two items apart. */
  key: string;
  /** What the admin calls it. */
  label: string;
  /** What is missing, and why it matters. One sentence. */
  detail: string;
  /** The page that fixes it. */
  href: string;
}

const PAYROLL_ITEMS: Record<keyof PayrollReadinessSteps, Omit<OutstandingItem, "key">> = {
  currency: {
    label: "Default currency",
    detail: "Every pay amount is recorded in it, so it has to be set before any pay item is.",
    href: "/admin/payroll-setup-wizard",
  },
  payItems: {
    label: "Pay items",
    detail: "The earnings, allowances and deductions a payslip is built from.",
    href: "/admin/payroll-setup-wizard",
  },
  payDates: {
    label: "Pay dates",
    detail: "How often people are paid, and on which day.",
    href: "/admin/payroll-setup-wizard",
  },
  overtimeRates: {
    label: "Overtime rates",
    detail: "The multipliers applied to approved overtime hours.",
    href: "/admin/overtime-setup-wizard",
  },
  payslipTemplate: {
    label: "Payslip template",
    detail:
      "The layout a payslip is rendered from. Without one for your country a run is created but cannot be computed.",
    href: "/admin/payslip-templates",
  },
};

const LEAVE_ITEMS: Record<keyof LeaveReadinessSteps, Omit<OutstandingItem, "key">> = {
  leaveTypes: {
    label: "Leave types",
    detail: "The kinds of leave people can request — annual, sick, unpaid.",
    href: "/admin/leave-setup-wizard",
  },
  accruals: {
    label: "Leave balances",
    detail: "Each leave type needs either an annual quota or a monthly accrual, or nobody has any balance to spend.",
    href: "/admin/leave-setup-wizard",
  },
  approvalRouting: {
    label: "Leave approvers",
    detail: "At least one person who can decide a leave request that needs approval.",
    href: "/admin/leave-setup-wizard",
  },
};

/**
 * The outstanding items, in the order they should be done — currency first
 * because pay items are denominated in it.
 *
 * Any argument may be `null`, meaning "we could not read that". An unknown
 * check is deliberately **not** reported as outstanding: telling an admin to
 * fix something that may already be done is how a checklist loses their trust.
 * Callers that need to refuse should treat a null as a reason not to refuse.
 */
export function outstandingSetupItems(
  payroll: { steps: PayrollReadinessSteps } | null,
  overtime: { allComplete: boolean } | null,
  leave: { steps: LeaveReadinessSteps } | null,
): OutstandingItem[] {
  const out: OutstandingItem[] = [];
  const payrollOrder: Array<keyof PayrollReadinessSteps> = [
    "currency",
    "payItems",
    "payDates",
    "overtimeRates",
    "payslipTemplate",
  ];
  for (const key of payrollOrder) {
    if (!payroll) continue;
    // `overtimeRates` is covered by the payroll readiness check and the
    // overtime one both; prefer the dedicated check when we have it.
    if (key === "overtimeRates" && overtime) {
      if (!overtime.allComplete) out.push({ key, ...PAYROLL_ITEMS[key] });
      continue;
    }
    if (!payroll.steps[key]) out.push({ key, ...PAYROLL_ITEMS[key] });
  }
  if (payroll === null && overtime && !overtime.allComplete) {
    out.push({ key: "overtimeRates", ...PAYROLL_ITEMS.overtimeRates });
  }
  const leaveOrder: Array<keyof LeaveReadinessSteps> = [
    "leaveTypes",
    "accruals",
    "approvalRouting",
  ];
  for (const key of leaveOrder) {
    if (!leave) continue;
    if (!leave.steps[key]) out.push({ key, ...LEAVE_ITEMS[key] });
  }
  return out;
}

/**
 * A one-line summary for a toast or a server-side refusal.
 *
 * Never emits the check keys: "payItems, payDates" was what the invite step
 * used to show the user.
 */
export function outstandingSummary(items: OutstandingItem[]): string {
  if (items.length === 0) return "";
  const labels = items.map((i) => i.label);
  if (labels.length === 1) return labels[0];
  return `${labels.slice(0, -1).join(", ")} and ${labels[labels.length - 1]}`;
}


/** Keys that stop a payroll run from being opened. */
const BLOCKS_A_RUN = new Set([
  "currency",
  "payItems",
  "payDates",
  "overtimeRates",
  "payslipTemplate",
]);

/**
 * Split outstanding items into what actually stops a run and what does not.
 *
 * `createPayrollRun` refuses on the payroll half only — leave setup changes
 * balances, not pay, so an organisation with no leave quotas can still pay
 * people. A banner that lists both under "you can't run payroll yet" tells the
 * admin something false, and sends them to fix a thing that was not in their
 * way. Found exactly that way: the page reported two blockers where the server
 * would only have refused on one.
 */
export function partitionForRun(items: OutstandingItem[]): {
  blocking: OutstandingItem[];
  advisory: OutstandingItem[];
} {
  return {
    blocking: items.filter((i) => BLOCKS_A_RUN.has(i.key)),
    advisory: items.filter((i) => !BLOCKS_A_RUN.has(i.key)),
  };
}
