const INDUSTRIES = [
  "Education Agent",
  "Migration / Visa Services",
  "Professional Services",
  "Sales & Business Development",
  "Operations & Administration",
  "Customer Service",
  "Generic / Cross-industry"
];
const id = (s) => s.replace(/[^a-z0-9]+/gi, "_").slice(0, 60).toLowerCase();
const num = (label, opts = {}) => ({
  id: id(label),
  label,
  type: "number",
  required: true,
  evidenceEnabled: true,
  evidenceTypes: ["document", "url"],
  ...opts
});
const pct = (label, opts = {}) => ({
  id: id(label),
  label,
  type: "percentage",
  required: true,
  min: 0,
  max: 100,
  unit: "%",
  evidenceEnabled: true,
  evidenceTypes: ["document"],
  ...opts
});
const rate = (label, opts = {}) => ({
  id: id(label),
  label,
  type: "rating",
  required: true,
  ...opts
});
const yn = (label, opts = {}) => ({
  id: id(label),
  label,
  type: "yes_no",
  required: true,
  yesLabel: "Met",
  noLabel: "Not met",
  evidenceEnabled: true,
  evidenceTypes: ["document", "url"],
  ...opts
});
const txt = (label, opts = {}) => ({
  id: id(label),
  label,
  type: "text",
  required: false,
  ...opts
});
const cur = (label, opts = {}) => ({
  id: id(label),
  label,
  type: "currency",
  required: true,
  unit: "AUD",
  evidenceEnabled: true,
  evidenceTypes: ["document"],
  ...opts
});
const EDU_AGENT_PRESETS = [
  // ────────────── Operations Head / Branch Manager ──────────────
  {
    key: "edu_ops_head_kpi",
    industry: "Education Agent",
    role: "Operations Head / Branch Manager",
    kind: "kpi",
    name: "Operations Head (NSW) — KPI Scorecard",
    description: "Quarterly KPI matrix for the NSW Operations Head / Branch Manager role at an education agent.",
    scaleMin: 1,
    scaleMax: 5,
    scaleLabels: ["Below", "On Target", "Exceeds"],
    competencies: [
      pct("Branch revenue achievement vs target", { weight: 15, target: 100, reviewPeriod: "Quarterly" }),
      pct("Conversion rate — enquiry to enrolment", { weight: 10, target: 35 }),
      pct("Visa lodgement-to-grant success rate", { weight: 10, target: 90 }),
      num("Average turn-around-time (TAT) for offer letters (business days)", { unit: "days", target: 3, weight: 5 }),
      pct("SOP / compliance audit pass rate (ESOS, National Code, CRICOS, MARA)", { weight: 10, target: 100 }),
      pct("Sub-agent activation rate (active vs onboarded)", { weight: 5, target: 70 }),
      num("New university / college partnerships signed", { unit: "partners", target: 4, weight: 5, reviewPeriod: "Quarterly" }),
      num("Google review rating (1–5)", { min: 1, max: 5, target: 4.5, weight: 5 }),
      num("Net Promoter Score (NPS)", { min: -100, max: 100, target: 50, weight: 5 }),
      pct("Complaint resolution within SLA", { weight: 5, target: 95 }),
      pct("Staff retention — branch", { weight: 5, target: 85 }),
      pct("Budget variance (operating expense vs plan)", { weight: 5, target: 5, unit: "% var" }),
      yn("Quarterly board / corporate report submitted on time", { weight: 5 }),
      txt("Strategic initiatives delivered this period", { required: true })
    ]
  },
  {
    key: "edu_ops_head_kra",
    industry: "Education Agent",
    role: "Operations Head / Branch Manager",
    kind: "kra",
    name: "Operations Head — Key Result Areas",
    description: "Annual KRA framework covering leadership, compliance, growth and people.",
    scaleMin: 1,
    scaleMax: 5,
    scaleLabels: ["Unsatisfactory", "Outstanding"],
    competencies: [
      rate("Executive Leadership & Strategy", { description: "Branch direction, annual roadmap, corporate alignment.", weight: 15 }),
      rate("Operations & SOP institutionalisation", { description: "Workflow, TAT, CRM, analytics adoption.", weight: 15 }),
      rate("Compliance, Governance & Risk", { description: "ESOS, National Code, CRICOS, MARA, privacy.", weight: 15 }),
      rate("Business Development & Provider Relations", { description: "Universities, TAFE, sub-agents.", weight: 15 }),
      rate("Financial Management", { description: "Budgeting, procurement, cost control.", weight: 10 }),
      rate("People Leadership & Team Development", { description: "Hiring, coaching, succession.", weight: 15 }),
      rate("Client Success & Customer Experience", { description: "NPS, review scores, complaint resolution.", weight: 10 }),
      rate("Corporate Collaboration & Reporting", { description: "Cadence, accuracy, transparency.", weight: 5 }),
      txt("Key achievements / strategic wins", { required: true }),
      txt("Development goals for next cycle")
    ]
  },
  // ────────────── GM Sales (NSW) ──────────────
  {
    key: "edu_gm_sales_kpi",
    industry: "Education Agent",
    role: "General Manager — Sales",
    kind: "kpi",
    name: "General Manager (Sales, NSW) — KPI Scorecard",
    description: "Sales leadership KPIs covering revenue, conversion, partner growth and team performance.",
    scaleMin: 1,
    scaleMax: 5,
    scaleLabels: ["Below", "Exceeds"],
    competencies: [
      pct("Annual revenue target achievement", { weight: 15, target: 100 }),
      pct("Quarterly sales target achievement", { weight: 10, target: 100 }),
      pct("Lead → enrolment conversion", { weight: 10, target: 30 }),
      pct("Walk-in to consultation conversion", { weight: 5, target: 70 }),
      num("New active sub-agents onboarded", { unit: "agents", target: 10, weight: 5 }),
      pct("Sub-agent productivity (active producers)", { weight: 5, target: 60 }),
      num("Marketing events / fairs executed", { unit: "events", target: 6, weight: 5 }),
      pct("Cross-sell rate (visa, insurance, OSHC)", { weight: 5, target: 40 }),
      num("Team headcount fully ramped", { unit: "FTE", weight: 5 }),
      pct("Sales team retention", { weight: 5, target: 85 }),
      num("Sales cycle time (lead to enrolment, days)", { unit: "days", target: 21, weight: 5 }),
      pct("CRM pipeline hygiene score", { weight: 5, target: 95 }),
      yn("Quarterly forecast accuracy within ±10%", { weight: 5 }),
      txt("Major partnership / campaign highlights")
    ]
  },
  // ────────────── Global Sales Director ──────────────
  {
    key: "edu_global_sales_kpi",
    industry: "Education Agent",
    role: "Global Sales Director",
    kind: "kpi",
    name: "Global Sales Director — KPI Scorecard",
    description: "Multi-country sales leadership KPIs.",
    scaleMin: 1,
    scaleMax: 5,
    scaleLabels: ["Below", "Exceeds"],
    competencies: [
      pct("Global revenue target achievement", { weight: 20, target: 100 }),
      pct("Country / region target achievement (weighted avg)", { weight: 15, target: 100 }),
      pct("Global lead → enrolment conversion", { weight: 10, target: 28 }),
      num("New geographies / branches launched", { unit: "markets", target: 2, weight: 5 }),
      yn("Global counselling / GTE standards consistency audit passed", { weight: 5 }),
      pct("Provider-promotion communication reach", { weight: 5, target: 90 }),
      num("Strategic global partner agreements signed", { unit: "agreements", target: 5, weight: 10 }),
      pct("Forecast accuracy submitted to ELT", { weight: 5, target: 90 }),
      txt("Global expansion narrative & strategic wins")
    ]
  },
  // ────────────── Operations Manager (Procurement, Vendor, Facilities) ──────────────
  {
    key: "edu_ops_mgr_kpi",
    industry: "Education Agent",
    role: "Operations Manager",
    kind: "kpi",
    name: "Operations Manager — KPI Scorecard",
    description: "Operations, procurement, assets, vendor and facilities KPIs.",
    scaleMin: 1,
    scaleMax: 5,
    scaleLabels: ["Below", "Exceeds"],
    competencies: [
      pct("Procurement requests fulfilled within SLA", { weight: 10, target: 95 }),
      num("Procurement lead time (days)", { unit: "days", target: 5, weight: 10 }),
      pct("Vendor SLA compliance score", { weight: 10, target: 90 }),
      pct("Inventory accuracy at audit", { weight: 10, target: 98 }),
      num("Asset register reconciliation variance", { unit: "items", target: 0, weight: 5 }),
      pct("Building / facilities incident closure within SLA", { weight: 10, target: 95 }),
      pct("Cost savings vs procurement baseline", { weight: 10, target: 5 }),
      yn("Quarterly safety / WHS walk completed", { weight: 5 }),
      pct("Office uptime / availability", { weight: 5, target: 99 }),
      pct("Stakeholder satisfaction (internal NPS)", { weight: 10, target: 80 }),
      txt("Process improvements implemented")
    ]
  },
  // ────────────── Migration Coordinator (Sr. RMA) ──────────────
  {
    key: "edu_mig_coord_kpi",
    industry: "Education Agent",
    role: "Migration Coordinator (Sr. RMA)",
    kind: "kpi",
    name: "Migration Coordinator — KPI Scorecard",
    description: "Senior RMA performance covering case quality, compliance and team supervision.",
    scaleMin: 1,
    scaleMax: 5,
    scaleLabels: ["Below", "Exceeds"],
    competencies: [
      num("Active case load managed", { unit: "cases", target: 60, weight: 10 }),
      pct("Visa decision success rate", { weight: 15, target: 90 }),
      pct("Cases lodged within agreed timeframe", { weight: 10, target: 95 }),
      num("Average case decision turnaround (days)", { unit: "days", target: 45, weight: 5 }),
      yn("100% OMARA Code of Conduct adherence", { weight: 10 }),
      pct("File quality audit pass rate", { weight: 10, target: 95 }),
      pct("Client satisfaction (post-decision survey)", { weight: 10, target: 90 }),
      num("Escalations resolved within 48 hours", { unit: "cases", weight: 5 }),
      num("Junior case officers coached / mentored", { unit: "people", target: 3, weight: 5 }),
      pct("Internal cross-sell referral rate", { weight: 5, target: 25 }),
      cur("Revenue attributed to managed cases", { unit: "AUD", weight: 10 }),
      txt("Notable complex cases & outcomes")
    ]
  },
  // ────────────── Case Officer – Migration ──────────────
  {
    key: "edu_case_officer_kpi",
    industry: "Education Agent",
    role: "Case Officer — Migration",
    kind: "kpi",
    name: "Case Officer (Migration) — KPI Scorecard",
    description: "Monthly KPIs for migration case officers.",
    scaleMin: 1,
    scaleMax: 5,
    scaleLabels: ["Below", "Exceeds"],
    competencies: [
      num("Files opened per month", { unit: "files", target: 20, weight: 10 }),
      num("Files lodged per month", { unit: "files", target: 18, weight: 10 }),
      pct("Cases meeting lodgement deadline", { weight: 15, target: 100 }),
      pct("Documents complete on first submission", { weight: 10, target: 95 }),
      pct("Quality control (QC) pass rate", { weight: 10, target: 95 }),
      pct("Visa grant rate on lodged files", { weight: 15, target: 90 }),
      num("Client follow-up response time (hours)", { unit: "hrs", target: 24, weight: 5 }),
      pct("Client satisfaction score", { weight: 10, target: 90 }),
      yn("OMARA & privacy compliance maintained", { weight: 10 }),
      txt("Learning / training completed this period")
    ]
  },
  // ────────────── Admission Manager (Sales) ──────────────
  {
    key: "edu_adm_mgr_kpi",
    industry: "Education Agent",
    role: "Admission Manager (Sales)",
    kind: "kpi",
    name: "Admission Manager — KPI Scorecard",
    description: "Admissions sales leadership KPIs.",
    scaleMin: 1,
    scaleMax: 5,
    scaleLabels: ["Below", "Exceeds"],
    competencies: [
      pct("Branch admission target achievement", { weight: 15, target: 100 }),
      pct("Enquiry → enrolment conversion", { weight: 10, target: 35 }),
      pct("Offer → acceptance conversion", { weight: 10, target: 70 }),
      pct("Intake fill rate by deadline", { weight: 10, target: 90 }),
      num("Walk-in enquiries converted to consultations", { unit: "per week", target: 25, weight: 5 }),
      pct("Cross-sell rate (visa, OSHC, accommodation)", { weight: 10, target: 40 }),
      cur("Subsidiary revenue from cross-sell", { weight: 10 }),
      pct("Team pipeline hygiene score", { weight: 5, target: 95 }),
      num("Team members coached weekly", { unit: "people", target: 4, weight: 5 }),
      yn("Weekly forecast submitted on time", { weight: 5 }),
      pct("Client satisfaction / Google reviews ≥ 4.5", { weight: 10, target: 90 }),
      txt("Notable wins, key partnerships, escalations")
    ]
  },
  // ────────────── Assistant Admission Manager ──────────────
  {
    key: "edu_asst_adm_mgr_kpi",
    industry: "Education Agent",
    role: "Assistant Admission Manager",
    kind: "kpi",
    name: "Assistant Admission Manager — KPI Scorecard",
    description: "Day-to-day admissions pipeline and team support KPIs.",
    scaleMin: 1,
    scaleMax: 5,
    scaleLabels: ["Below", "Exceeds"],
    competencies: [
      pct("Personal admission target achievement", { weight: 15, target: 100 }),
      num("Daily follow-ups completed", { unit: "follow-ups", target: 25, weight: 10 }),
      pct("Walk-in → appointment conversion", { weight: 10, target: 75 }),
      pct("Offer → acceptance conversion", { weight: 10, target: 70 }),
      pct("CRM pipeline accuracy", { weight: 10, target: 95 }),
      num("Team support actions logged", { unit: "actions", target: 30, weight: 5 }),
      pct("Cross-sell attach rate", { weight: 10, target: 35 }),
      num("Front desk enquiries handled (per week)", { unit: "per week", target: 40, weight: 5 }),
      pct("Client satisfaction score", { weight: 10, target: 90 }),
      yn("Weekly pipeline review attended", { weight: 5 }),
      txt("Improvement ideas & process notes")
    ]
  },
  // ────────────── Admission Officer (Sales) ──────────────
  {
    key: "edu_adm_officer_kpi",
    industry: "Education Agent",
    role: "Admission Officer (Sales)",
    kind: "kpi",
    name: "Admission Officer — KPI Scorecard",
    description: "Frontline admissions counsellor KPIs.",
    scaleMin: 1,
    scaleMax: 5,
    scaleLabels: ["Below", "Exceeds"],
    competencies: [
      num("New enquiries assigned & actioned", { unit: "per week", target: 30, weight: 10 }),
      pct("Enquiry → consultation conversion", { weight: 10, target: 70 }),
      pct("Consultation → application conversion", { weight: 10, target: 60 }),
      pct("Application → offer conversion", { weight: 10, target: 80 }),
      pct("Offer → enrolment conversion", { weight: 10, target: 65 }),
      num("Average response time to new enquiry (hours)", { unit: "hrs", target: 4, weight: 10 }),
      pct("Documents complete at first submission", { weight: 10, target: 90 }),
      pct("Client satisfaction (CSAT)", { weight: 10, target: 90 }),
      pct("Cross-sell attach rate", { weight: 5, target: 30 }),
      yn("Weekly CRM hygiene tasks complete", { weight: 5 }),
      txt("Highlights / blockers for the week")
    ]
  },
  // ────────────── Documentation / Counsellor ──────────────
  {
    key: "edu_documentation_kpi",
    industry: "Education Agent",
    role: "Documentation Officer / Counsellor",
    kind: "kpi",
    name: "Documentation & Counselling — KPI Scorecard",
    description: "Pre-lodgement counselling, documentation accuracy and turnaround.",
    scaleMin: 1,
    scaleMax: 5,
    scaleLabels: ["Below", "Exceeds"],
    competencies: [
      num("Document checklists issued per week", { unit: "per week", target: 35, weight: 10 }),
      pct("Documents accepted at first review", { weight: 15, target: 90 }),
      num("Average pre-lodgement TAT (days)", { unit: "days", target: 7, weight: 10 }),
      pct("Counselling-to-application conversion", { weight: 10, target: 65 }),
      pct("Genuine Temporary Entrant (GTE) statement quality score", { weight: 15, target: 90 }),
      yn("Privacy & ESOS compliance maintained", { weight: 10 }),
      pct("Follow-up SLA adherence", { weight: 10, target: 95 }),
      pct("Client satisfaction (CSAT)", { weight: 10, target: 90 }),
      txt("Notable case observations / process suggestions")
    ]
  },
  // ────────────── 360° — Education Agent specific ──────────────
  {
    key: "edu_360_counsellor",
    industry: "Education Agent",
    role: "Counsellor / Admission Officer",
    kind: "360",
    name: "Education Counsellor — 360° Feedback",
    description: "Peer, manager and client-facing 360° template for counsellors and admission officers.",
    scaleMin: 1,
    scaleMax: 5,
    scaleLabels: ["Strongly Disagree", "Strongly Agree"],
    competencies: [
      rate("Demonstrates deep knowledge of providers, courses and visa pathways"),
      rate("Conducts honest, ethical and GTE-compliant counselling"),
      rate("Responsive and proactive with student communications"),
      rate("Collaborates well with admissions, migration and documentation teams"),
      rate("Handles difficult conversations professionally"),
      rate("Contributes to a positive team culture and shared targets"),
      rate("Embodies brand values in every interaction"),
      txt("One thing this person does exceptionally well"),
      txt("One thing this person could improve")
    ]
  },
  {
    key: "edu_360_manager",
    industry: "Education Agent",
    role: "Manager — Education Agent",
    kind: "360",
    name: "Education Agent Manager — 360° Feedback",
    description: "Upward & peer 360° template for branch / admissions / migration managers.",
    scaleMin: 1,
    scaleMax: 5,
    scaleLabels: ["Strongly Disagree", "Strongly Agree"],
    competencies: [
      rate("Sets clear sales / case targets and removes blockers"),
      rate("Coaches and develops team members"),
      rate("Drives accountability while supporting wellbeing"),
      rate("Ensures compliance with ESOS, National Code and MARA"),
      rate("Communicates strategy clearly across teams"),
      rate("Makes data-informed decisions"),
      rate("Represents the brand professionally with partners and clients"),
      txt("Strengths to amplify"),
      txt("Opportunities for growth")
    ]
  }
];
const GENERIC_PRESETS = [
  {
    key: "generic_kpi",
    industry: "Generic / Cross-industry",
    role: "Any role",
    kind: "kpi",
    name: "Generic KPI Scorecard",
    description: "Lightweight KPI framework suitable for any role.",
    scaleMin: 1,
    scaleMax: 5,
    scaleLabels: ["Below", "Exceeds"],
    competencies: [
      pct("Goal achievement rate", { weight: 25, target: 100 }),
      num("Quality score (rubric)", { min: 0, max: 100, target: 90, weight: 20 }),
      pct("On-time delivery", { weight: 15, target: 95 }),
      pct("Stakeholder satisfaction", { weight: 15, target: 90 }),
      yn("Compliance / policy adherence", { weight: 10 }),
      rate("Initiative & ownership", { weight: 15 }),
      txt("Highlights & evidence")
    ]
  },
  {
    key: "generic_kra",
    industry: "Generic / Cross-industry",
    role: "Any role",
    kind: "kra",
    name: "Generic KRA Framework",
    description: "Annual KRA framework for any role.",
    scaleMin: 1,
    scaleMax: 5,
    scaleLabels: ["Unsatisfactory", "Outstanding"],
    competencies: [
      rate("Delivery & Execution", { weight: 25 }),
      rate("Quality & Compliance", { weight: 20 }),
      rate("Collaboration & Communication", { weight: 15 }),
      rate("Customer / Stakeholder Impact", { weight: 15 }),
      rate("Innovation & Continuous Improvement", { weight: 10 }),
      rate("People Leadership (if applicable)", { weight: 15 }),
      txt("Achievements"),
      txt("Development plan")
    ]
  }
];
const REVIEW_PRESETS = [
  ...EDU_AGENT_PRESETS,
  ...GENERIC_PRESETS
];
function getPreset(key) {
  return REVIEW_PRESETS.find((p) => p.key === key);
}
export {
  INDUSTRIES as I,
  REVIEW_PRESETS as R,
  getPreset as g
};
