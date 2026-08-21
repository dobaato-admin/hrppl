/**
 * Starter rows for tenant-owned lookup tables.
 *
 * A new tenant lands in an app where most dropdowns are empty: no expense
 * categories (so a claim cannot be submitted at all), no pay components (so a
 * payroll run has nothing to attach), no recruitment stages, no award types, no
 * training catalogue. Each one is individually trivial and collectively they
 * make the product look broken on first run.
 *
 * These are conservative, country-agnostic defaults meant to be edited. They
 * are kept here — not inline in the seed script — so the same lists can back a
 * future "apply starter defaults" action in org setup, the way
 * EXPENSE_CATEGORY_PRESETS already backs one on /org/expenses.
 *
 * Onboarding and offboarding checklists are deliberately absent: a database
 * trigger (seed_country_onboarding_packs, 20260622131550) already populates
 * those per tenant. Duplicating them here would double them up.
 */

/**
 * payroll_components rows.
 *
 * `kind` and `calc_type` are CHECK-constrained in the database and the unions
 * below are copied from those constraints, not invented:
 *   kind      = tax | pf | retirement | allowance | deduction | other
 *   calc_type = flat | pct_of_basic | pct_of_gross
 * (`payroll_components_kind_check` / `_calc_type_check`; mirrored in the zod
 * schema at src/lib/payroll-setup.functions.ts:77-78.)
 *
 * Note there is no "earning" kind — base pay comes from the employee's own pay
 * rate, and components are the add-ons and deductions layered on top. `rate` is
 * a percentage for the pct_* types and an absolute amount for `flat`; both are
 * left null here because the right number is tenant- and country-specific.
 */
export interface PayrollComponentPreset {
  code: string;
  label: string;
  kind: "tax" | "pf" | "retirement" | "allowance" | "deduction" | "other";
  calc_type: "flat" | "pct_of_basic" | "pct_of_gross";
  is_taxable: boolean;
  show_on_payslip: boolean;
  sort_order: number;
  notes?: string;
}

export const PAYROLL_COMPONENT_PRESETS: PayrollComponentPreset[] = [
  { code: "ALLOW", label: "General allowance", kind: "allowance", calc_type: "flat", is_taxable: true, show_on_payslip: true, sort_order: 10 },
  { code: "TRAVEL_ALLOW", label: "Travel allowance", kind: "allowance", calc_type: "flat", is_taxable: true, show_on_payslip: true, sort_order: 20 },
  { code: "BONUS", label: "Bonus", kind: "allowance", calc_type: "flat", is_taxable: true, show_on_payslip: true, sort_order: 30 },
  { code: "INCOME_TAX", label: "Income tax", kind: "tax", calc_type: "pct_of_gross", is_taxable: false, show_on_payslip: true, sort_order: 100, notes: "Set the rate, or leave to the country's tax_brackets where those are configured." },
  { code: "RETIRE", label: "Retirement / pension", kind: "retirement", calc_type: "pct_of_basic", is_taxable: false, show_on_payslip: true, sort_order: 110 },
  { code: "PF", label: "Provident fund", kind: "pf", calc_type: "pct_of_basic", is_taxable: false, show_on_payslip: true, sort_order: 120 },
  { code: "UNPAID", label: "Unpaid leave deduction", kind: "deduction", calc_type: "flat", is_taxable: false, show_on_payslip: true, sort_order: 130 },
  { code: "ADVANCE", label: "Salary advance recovery", kind: "deduction", calc_type: "flat", is_taxable: false, show_on_payslip: true, sort_order: 140 },
];

/**
 * recruitment_stages. `kind` is CHECK-constrained to
 * applied | screen | interview | offer | hired | rejected | custom
 * (`recruitment_stages_kind_check`) — note "screen", not "screening", and there
 * is no "assessment" member, so the assessment step uses `custom`.
 */
export interface RecruitmentStagePreset {
  name: string;
  sort_order: number;
  kind: "applied" | "screen" | "interview" | "offer" | "hired" | "rejected" | "custom";
  is_terminal: boolean;
}

export const RECRUITMENT_STAGE_PRESETS: RecruitmentStagePreset[] = [
  { name: "Applied", sort_order: 10, kind: "applied", is_terminal: false },
  { name: "Screening", sort_order: 20, kind: "screen", is_terminal: false },
  { name: "Interview", sort_order: 30, kind: "interview", is_terminal: false },
  { name: "Assessment", sort_order: 40, kind: "custom", is_terminal: false },
  { name: "Offer", sort_order: 50, kind: "offer", is_terminal: false },
  { name: "Hired", sort_order: 60, kind: "hired", is_terminal: true },
  { name: "Rejected", sort_order: 70, kind: "rejected", is_terminal: true },
];

export interface AwardTypePreset {
  name: string;
  description: string;
  icon: string;
  cadence: string;
}

export const AWARD_TYPE_PRESETS: AwardTypePreset[] = [
  { name: "Employee of the month", description: "Outstanding overall contribution in a given month.", icon: "trophy", cadence: "monthly" },
  { name: "Above and beyond", description: "Went well past what the role asked for.", icon: "star", cadence: "adhoc" },
  { name: "Team player", description: "Consistently lifted the people around them.", icon: "users", cadence: "adhoc" },
  { name: "Customer champion", description: "Exceptional outcome for a customer or client.", icon: "heart", cadence: "adhoc" },
  { name: "Innovation", description: "Introduced a materially better way of working.", icon: "lightbulb", cadence: "quarterly" },
];

export interface TrainingCoursePreset {
  title: string;
  description: string;
  category: string;
  duration_hours: number;
  is_mandatory: boolean;
  validity_months: number | null;
}

export const TRAINING_COURSE_PRESETS: TrainingCoursePreset[] = [
  { title: "Workplace health & safety induction", description: "Mandatory induction covering hazards, incident reporting and emergency procedure.", category: "compliance", duration_hours: 2, is_mandatory: true, validity_months: 24 },
  { title: "Code of conduct", description: "Expected standards of behaviour, conflicts of interest and reporting channels.", category: "compliance", duration_hours: 1, is_mandatory: true, validity_months: 12 },
  { title: "Privacy & data handling", description: "Handling personal and payroll data lawfully.", category: "compliance", duration_hours: 1, is_mandatory: true, validity_months: 12 },
  { title: "Anti-discrimination & harassment", description: "Recognising, preventing and reporting discrimination and harassment.", category: "compliance", duration_hours: 2, is_mandatory: true, validity_months: 24 },
  { title: "Cyber security awareness", description: "Phishing, passwords, MFA and safe device use.", category: "security", duration_hours: 1, is_mandatory: true, validity_months: 12 },
  { title: "Manager essentials", description: "Running one-to-ones, giving feedback and approving leave fairly.", category: "leadership", duration_hours: 4, is_mandatory: false, validity_months: null },
  { title: "Performance conversations", description: "Preparing for and running a review cycle conversation.", category: "leadership", duration_hours: 2, is_mandatory: false, validity_months: null },
];

/**
 * A 360 feedback template.
 *
 * `feedback_question_templates` is a TEMPLATE table — one row per question set,
 * with the questions themselves in a `questions` jsonb column — not one row per
 * question. The question shape below matches QuestionSchema at
 * src/lib/feedback360.functions.ts:18-26, so a seeded template validates on the
 * way back in.
 */
export interface FeedbackQuestion {
  id: string;
  label: string;
  type: "rating" | "text";
  required: boolean;
  scaleMin?: number;
  scaleMax?: number;
}

export interface FeedbackTemplatePreset {
  name: string;
  description: string;
  is_default: boolean;
  questions: FeedbackQuestion[];
}

export const FEEDBACK_TEMPLATE_PRESETS: FeedbackTemplatePreset[] = [
  {
    name: "Standard 360 feedback",
    description: "General-purpose peer and upward feedback set, suitable for any role.",
    is_default: true,
    questions: [
      { id: "communication", label: "How effectively does this person communicate with the team?", type: "rating", required: true, scaleMin: 1, scaleMax: 5 },
      { id: "reliability", label: "How reliably do they deliver what they commit to?", type: "rating", required: true, scaleMin: 1, scaleMax: 5 },
      { id: "collaboration", label: "How well do they collaborate across teams?", type: "rating", required: true, scaleMin: 1, scaleMax: 5 },
      { id: "feedback_response", label: "How constructively do they respond to feedback?", type: "rating", required: true, scaleMin: 1, scaleMax: 5 },
      { id: "strength", label: "What is the single most valuable thing this person does?", type: "text", required: true },
      { id: "improvement", label: "What is one thing they could do differently to have more impact?", type: "text", required: false },
    ],
  },
  {
    name: "Manager upward feedback",
    description: "For direct reports giving feedback on the person they report to.",
    is_default: false,
    questions: [
      { id: "clarity", label: "How clearly does your manager set expectations?", type: "rating", required: true, scaleMin: 1, scaleMax: 5 },
      { id: "support", label: "How well supported do you feel in your role?", type: "rating", required: true, scaleMin: 1, scaleMax: 5 },
      { id: "development", label: "How actively does your manager support your development?", type: "rating", required: true, scaleMin: 1, scaleMax: 5 },
      { id: "availability", label: "How accessible is your manager when you need them?", type: "rating", required: true, scaleMin: 1, scaleMax: 5 },
      { id: "keep_doing", label: "What should your manager keep doing?", type: "text", required: true },
      { id: "start_doing", label: "What should your manager start doing?", type: "text", required: false },
    ],
  },
];

/** TOIL defaults — conservative, approval required. */
export const TOIL_SETTINGS_PRESET = {
  enabled: true,
  overtime_multiplier: 1.5,
  shift_swap_multiplier: 1.0,
  penalty_multiplier: 2.0,
  max_balance_hours: 76,
  expiry_months: 12,
  allow_overtime_to_toil: true,
  allow_toil_to_overtime: false,
  min_request_hours: 1,
  require_approval: true,
};
