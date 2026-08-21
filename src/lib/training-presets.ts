/**
 * Curated catalogue of common compliance/onboarding training courses.
 * Org admins can bulk-seed or refresh any group, including starter quiz banks.
 */

export interface TrainingPreset {
  title: string;
  aliases?: string[];
  category: string;
  description: string;
  provider?: string;
  duration_hours?: number;
  is_mandatory: boolean;
  validity_months?: number | null;
  pass_score?: number;
  quiz_questions?: TrainingPresetQuizQuestion[];
}

export interface TrainingPresetQuizQuestion {
  question: string;
  choices: string[];
  correct_index: number;
  points?: number;
  explanation?: string | null;
}

export interface TrainingPresetGroup {
  key: string;
  name: string;
  description: string;
  courses: TrainingPreset[];
}

export const TRAINING_PRESETS: TrainingPresetGroup[] = [
  {
    key: "compliance-core",
    name: "Mandatory employee compliance",
    description: "Refreshed core modules for every employee, with default quiz banks ready to seed.",
    courses: [
      {
        title: "WHS induction — office, hybrid & site basics",
        aliases: ["Workplace Health & Safety induction", "Workplace tour & emergency procedures"],
        category: "WHS",
        description: "Hazard identification, emergency response, incident reporting, first aid and safe work expectations for office, remote and site-based teams.",
        duration_hours: 1,
        is_mandatory: true,
        validity_months: 12,
        pass_score: 80,
        quiz_questions: [
          { question: "What should an employee do first after noticing a workplace hazard?", choices: ["Ignore it if no one is injured", "Report it through the agreed safety channel", "Move it without telling anyone", "Post about it externally"], correct_index: 1, explanation: "Hazards must be reported promptly through the organisation's safety process." },
          { question: "Which item belongs in a WHS induction?", choices: ["Emergency procedures and evacuation points", "A private payroll password", "Customer pricing strategy", "Unapproved shortcuts"], correct_index: 0, explanation: "Emergency procedures are a core WHS requirement." },
          { question: "When should an incident or near miss be reported?", choices: ["Only when someone takes leave", "At the next annual review", "As soon as practical", "Only if a manager witnessed it"], correct_index: 2, explanation: "Near misses help prevent future injuries and should be reported quickly." },
        ],
      },
      {
        title: "Respectful workplace, EEO & psychosocial safety",
        aliases: ["Anti-bullying, harassment & EEO"],
        category: "Compliance",
        description: "Expected conduct, bullying and harassment prevention, equal opportunity, bystander action and psychosocial risk reporting.",
        duration_hours: 1,
        is_mandatory: true,
        validity_months: 12,
        pass_score: 80,
        quiz_questions: [
          { question: "Which behaviour should be escalated under a respectful workplace policy?", choices: ["Constructive feedback in private", "Repeated intimidation or humiliation", "Asking for project help", "Following a roster"], correct_index: 1, explanation: "Repeated intimidation or humiliation can be bullying and must be escalated." },
          { question: "What is a safe bystander action?", choices: ["Join in", "Document and report concerns through the right channel", "Share rumours", "Retaliate publicly"], correct_index: 1, explanation: "Bystanders should use safe reporting channels and avoid retaliation." },
        ],
      },
      {
        title: "Code of Conduct, conflicts & speak-up obligations",
        aliases: ["Code of Conduct"],
        category: "Governance",
        description: "Professional standards, conflicts of interest, confidentiality, fair dealing, reporting concerns and non-retaliation.",
        duration_hours: 0.75,
        is_mandatory: true,
        validity_months: 12,
        pass_score: 80,
        quiz_questions: [
          { question: "What should an employee do if a personal relationship could influence a business decision?", choices: ["Keep it private", "Declare the potential conflict", "Delete related records", "Ask a supplier to decide"], correct_index: 1, explanation: "Potential conflicts should be declared so they can be managed transparently." },
          { question: "A speak-up process should protect employees from what?", choices: ["Policy updates", "Retaliation for good-faith reporting", "Training invitations", "Normal supervision"], correct_index: 1, explanation: "Good-faith reporting must not result in retaliation." },
        ],
      },
      {
        title: "Privacy, records & personal data handling",
        aliases: ["Privacy & data protection basics", "Patient privacy & records"],
        category: "Privacy",
        description: "Collection, use, storage, sharing and breach escalation for employee, customer and candidate personal information.",
        duration_hours: 1,
        is_mandatory: true,
        validity_months: 12,
        pass_score: 85,
        quiz_questions: [
          { question: "What is the safest way to handle personal information?", choices: ["Collect only what is needed and restrict access", "Download it to a personal device", "Share it in open chat channels", "Keep it forever by default"], correct_index: 0, explanation: "Data minimisation and restricted access reduce privacy risk." },
          { question: "What should happen after a suspected data breach?", choices: ["Wait to see if anyone complains", "Escalate it immediately through the breach process", "Delete all evidence", "Email everyone the file again"], correct_index: 1, explanation: "Suspected breaches require prompt escalation and assessment." },
          { question: "Which is an example of personal information?", choices: ["A public holiday date", "An employee's bank account details", "A generic policy title", "A blank template"], correct_index: 1, explanation: "Bank details identify or relate to a person and must be protected." },
        ],
      },
      {
        title: "Anti-bribery, gifts & corruption prevention",
        aliases: ["Anti-bribery & corruption"],
        category: "Governance",
        description: "Bribery red flags, gifts and hospitality limits, facilitation payments, procurement integrity and reporting obligations.",
        duration_hours: 0.75,
        is_mandatory: true,
        validity_months: 24,
        pass_score: 80,
        quiz_questions: [
          { question: "What is the right response to a supplier offering a personal gift to influence a contract?", choices: ["Accept it quietly", "Declare and follow the gifts policy", "Ask for cash instead", "Hide it from procurement"], correct_index: 1, explanation: "Gifts that may influence decisions must be declared and handled under policy." },
          { question: "A facilitation payment is best described as:", choices: ["A small unofficial payment to speed up a routine action", "A normal salary payment", "A tax refund", "A published product discount"], correct_index: 0, explanation: "Unofficial payments to speed routine actions are high-risk and usually prohibited." },
        ],
      },
      {
        title: "Cyber security, phishing & MFA essentials",
        aliases: ["Cyber security awareness", "Phishing & social engineering"],
        category: "Security",
        description: "Phishing detection, password hygiene, MFA, safe browsing, device security and prompt reporting of suspicious activity.",
        duration_hours: 1,
        is_mandatory: true,
        validity_months: 12,
        pass_score: 85,
        quiz_questions: [
          { question: "Which is a common phishing warning sign?", choices: ["A normal payslip notification from an expected system", "Urgent pressure to click a suspicious link", "A scheduled team meeting", "A policy stored in the HR portal"], correct_index: 1, explanation: "Urgency plus suspicious links is a common social-engineering tactic." },
          { question: "Why is MFA important?", choices: ["It replaces all security policies", "It adds a second proof of identity", "It makes passwords public", "It disables account recovery"], correct_index: 1, explanation: "MFA reduces risk when passwords are stolen or guessed." },
          { question: "What should an employee do with a suspicious login prompt?", choices: ["Enter credentials to test it", "Report it and avoid entering credentials", "Forward it to all staff", "Save the password in the prompt"], correct_index: 1, explanation: "Suspicious prompts should be reported without entering credentials." },
        ],
      },
      {
        title: "Payroll, timesheet & leave integrity",
        category: "HR & payroll",
        description: "Accurate time recording, leave requests, payroll information, approvals, corrections and fraud prevention.",
        duration_hours: 0.5,
        is_mandatory: true,
        validity_months: 12,
        pass_score: 80,
        quiz_questions: [
          { question: "What should an employee do if a submitted timesheet is wrong?", choices: ["Leave it because payroll will guess", "Raise a correction through the approved process", "Ask a colleague to change unrelated records", "Delete supporting notes"], correct_index: 1, explanation: "Payroll and leave records must be corrected through approved channels." },
          { question: "Why must bank and tax details be kept current?", choices: ["To avoid accurate pay", "To support correct payroll processing", "To bypass approval", "To remove audit trails"], correct_index: 1, explanation: "Current payroll details help pay employees correctly and compliantly." },
        ],
      },
      {
        title: "Modern slavery & responsible sourcing awareness",
        aliases: ["Modern slavery awareness"],
        category: "Compliance",
        description: "Modern slavery indicators, supplier risk signals, escalation channels and responsible sourcing expectations.",
        duration_hours: 0.5,
        is_mandatory: true,
        validity_months: 24,
        pass_score: 75,
        quiz_questions: [
          { question: "Which is a potential modern slavery red flag?", choices: ["Transparent contracts", "Workers unable to keep identity documents", "Published supplier policies", "Normal safety onboarding"], correct_index: 1, explanation: "Control of identity documents can indicate exploitation." },
          { question: "What should staff do if they notice a supplier risk indicator?", choices: ["Ignore it if the price is low", "Escalate it through the responsible sourcing process", "Promise the supplier no one will know", "Post confidential details publicly"], correct_index: 1, explanation: "Supplier risk indicators should be escalated for assessment." },
        ],
      },
    ],
  },
  {
    key: "security",
    name: "Information security — role based",
    description: "Deeper security training for staff who handle systems, customers, finance or sensitive employee data.",
    courses: [
      { title: "Acceptable use of IT, SaaS & AI tools", category: "Security", description: "Safe use of company devices, approved SaaS, collaboration tools, AI assistants and removable media.", duration_hours: 0.75, is_mandatory: true, validity_months: 24, pass_score: 80, quiz_questions: [
        { question: "What should staff do before placing confidential company data into a new online tool?", choices: ["Check whether the tool is approved", "Assume every tool is safe", "Use a personal account", "Remove audit logs"], correct_index: 0, explanation: "New tools should be approved before confidential data is entered." },
        { question: "Which action supports acceptable use?", choices: ["Sharing accounts", "Locking devices when unattended", "Disabling MFA", "Installing unapproved software"], correct_index: 1, explanation: "Unattended devices should be locked to prevent unauthorised access." },
      ] },
      { title: "Security incident reporting & escalation", aliases: ["Incident reporting"], category: "Security", description: "When to report suspicious activity, lost devices, credential exposure, data loss and suspected system compromise.", duration_hours: 0.5, is_mandatory: true, validity_months: 12, pass_score: 80, quiz_questions: [
        { question: "When should a suspected credential exposure be reported?", choices: ["Immediately", "After the next payroll run", "Only if a customer asks", "Never"], correct_index: 0, explanation: "Fast reporting helps contain account compromise." },
        { question: "Which detail helps an incident response team?", choices: ["Approximate time and what was clicked", "A changed story", "Deleted emails only", "No context"], correct_index: 0, explanation: "Timelines and actions help responders investigate quickly." },
      ] },
      { title: "Finance fraud, invoice scams & payment redirection", category: "Security", description: "Business email compromise, supplier bank-change fraud, payroll diversion and approval checks.", duration_hours: 0.75, is_mandatory: true, validity_months: 12, pass_score: 85, quiz_questions: [
        { question: "A supplier asks by email to change bank details urgently. What is the safest next step?", choices: ["Update it immediately", "Verify using an approved independent channel", "Reply with employee payroll details", "Skip approval"], correct_index: 1, explanation: "Payment changes should be verified out-of-band through approved contacts." },
        { question: "Which is a business email compromise red flag?", choices: ["Normal approval workflow", "Unexpected secrecy and urgency around payment", "A matched purchase order", "A verified supplier portal"], correct_index: 1, explanation: "Secrecy and urgency are common fraud pressure tactics." },
      ] },
      { title: "Secure handling of employee and payroll records", category: "Privacy", description: "Extra safeguards for payroll, HR, performance, medical, grievance and disciplinary records.", duration_hours: 0.75, is_mandatory: true, validity_months: 12, pass_score: 85, quiz_questions: [
        { question: "Who should access employee payroll records?", choices: ["Anyone curious", "Only authorised people with a work need", "All contractors", "Public visitors"], correct_index: 1, explanation: "Sensitive employee records require need-to-know access." },
        { question: "What should happen before sharing a disciplinary or medical record?", choices: ["Confirm authority and minimum necessary information", "Copy the whole company", "Move it to personal email", "Remove retention controls"], correct_index: 0, explanation: "Sensitive records should only be shared with authority and minimisation." },
      ] },
    ],
  },
  {
    key: "onboarding",
    name: "New-hire onboarding",
    description: "Week-one orientation modules for new employees.",
    courses: [
      { title: "Welcome to the organisation", aliases: ["Company values & history"], category: "Onboarding", description: "Mission, values, operating rhythm, key policies and how new starters get help.", duration_hours: 0.5, is_mandatory: true, validity_months: null, pass_score: 70, quiz_questions: [
        { question: "Where should a new starter look first for approved HR processes?", choices: ["The HR portal or approved policy location", "An old chat thread", "A personal note from a previous employer", "Public social media"], correct_index: 0, explanation: "Approved systems and policies are the reliable source of truth." },
        { question: "What is the best response when a new starter is unsure about a policy?", choices: ["Guess", "Ask their manager or HR contact", "Ignore it", "Create a new policy"], correct_index: 1, explanation: "Managers and HR can direct employees to current guidance." },
      ] },
      { title: "Org structure, managers & escalation paths", aliases: ["Org structure & teams"], category: "Onboarding", description: "Reporting lines, team responsibilities, decision paths and escalation contacts.", duration_hours: 0.5, is_mandatory: true, validity_months: null, pass_score: 70 },
      { title: "HR self-service, timesheets, leave & payslips", aliases: ["HR systems & self-service"], category: "Onboarding", description: "How employees keep details current, submit leave, lodge timesheets, access payslips and respond to HR requests.", duration_hours: 0.75, is_mandatory: true, validity_months: null, pass_score: 75, quiz_questions: [
        { question: "Which detail should employees keep up to date in self-service?", choices: ["Emergency contact details", "A colleague's password", "Unapproved supplier pricing", "Someone else's bank account"], correct_index: 0, explanation: "Emergency and payroll-related details should be current." },
        { question: "What should employees use for leave requests?", choices: ["The approved leave workflow", "A verbal note only", "A public comment", "No record"], correct_index: 0, explanation: "Approved workflows maintain accurate leave records." },
      ] },
      { title: "Benefits, wellbeing & support services", aliases: ["Benefits & wellbeing"], category: "Onboarding", description: "Employee benefits, wellbeing supports, EAP access, flexible work expectations and help channels.", duration_hours: 0.5, is_mandatory: false, validity_months: null, pass_score: 70 },
    ],
  },
  {
    key: "people-management",
    name: "People management",
    description: "Foundational skills for new and existing people-managers.",
    courses: [
      { title: "Manager essentials: fair decisions & duty of care", aliases: ["Fundamentals of management"], category: "Leadership", description: "Manager responsibilities across safety, performance, leave, conduct, confidentiality and escalation.", duration_hours: 2, is_mandatory: true, validity_months: 24, pass_score: 80, quiz_questions: [
        { question: "What should a manager do with sensitive employee information?", choices: ["Share only with authorised people who need it", "Discuss it casually", "Store it in personal notes", "Use it for unrelated decisions"], correct_index: 0, explanation: "Managers must protect confidential employee information." },
        { question: "When should a manager escalate a serious conduct or safety concern?", choices: ["Promptly through the correct channel", "After the employee resigns", "Only if payroll asks", "Never"], correct_index: 0, explanation: "Serious concerns require timely escalation." },
      ] },
      { title: "Performance conversations & evidence-based reviews", aliases: ["Performance conversations"], category: "Leadership", description: "Setting expectations, recording evidence, giving balanced feedback and managing review cycles.", duration_hours: 1.5, is_mandatory: false, validity_months: null, pass_score: 75 },
      { title: "Coaching, growth plans & internal mobility", aliases: ["Coaching & development"], category: "Leadership", description: "Coaching techniques, development goals, career pathways and follow-up actions.", duration_hours: 1.5, is_mandatory: false, validity_months: null, pass_score: 70 },
      { title: "Inclusive hiring, unconscious bias & interview records", aliases: ["Unconscious bias for hiring"], category: "Leadership", description: "Structured hiring, bias controls, lawful interview notes and fair candidate evaluation.", duration_hours: 1, is_mandatory: true, validity_months: 24, pass_score: 80 },
      { title: "Difficult conversations, grievances & de-escalation", aliases: ["Difficult conversations"], category: "Leadership", description: "Early intervention, respectful conversation planning, documentation, support people and escalation.", duration_hours: 1, is_mandatory: false, validity_months: null, pass_score: 75 },
    ],
  },
  {
    key: "hospitality",
    name: "Hospitality / food service",
    description: "Compliance training common to cafes, restaurants and venues.",
    courses: [
      { title: "Responsible Service of Alcohol (RSA)", category: "Compliance", description: "Legal duties when serving alcohol.", duration_hours: 4, is_mandatory: true, validity_months: 36, pass_score: 80 },
      { title: "Food handler hygiene", category: "Compliance", description: "Safe food handling, allergens and contamination.", duration_hours: 2, is_mandatory: true, validity_months: 24, pass_score: 80 },
      { title: "Customer-service standards", category: "Customer", description: "Service flow, problem resolution and de-escalation.", duration_hours: 1, is_mandatory: false, validity_months: null, pass_score: 70 },
    ],
  },
  {
    key: "construction-site",
    name: "Construction / site safety",
    description: "Mandatory site induction and WHS training for trades.",
    courses: [
      { title: "Construction site induction (White Card)", category: "WHS", description: "General construction induction.", duration_hours: 6, is_mandatory: true, validity_months: null, pass_score: 80 },
      { title: "Working at heights", category: "WHS", description: "Fall-prevention, anchor points and harness use.", duration_hours: 4, is_mandatory: true, validity_months: 24, pass_score: 85 },
      { title: "Manual handling", category: "WHS", description: "Safe lifting, carrying and team-lifting.", duration_hours: 1, is_mandatory: true, validity_months: 24, pass_score: 75 },
      { title: "Hazardous chemicals (SDS)", category: "WHS", description: "Reading SDS, PPE and handling chemicals safely.", duration_hours: 1, is_mandatory: true, validity_months: 24, pass_score: 80 },
    ],
  },
  {
    key: "healthcare",
    name: "Healthcare / clinic",
    description: "Common clinical and patient-care compliance modules.",
    courses: [
      { title: "Infection prevention & control", category: "Clinical", description: "Hand hygiene, PPE and sterilisation.", duration_hours: 1, is_mandatory: true, validity_months: 12, pass_score: 85 },
      { title: "CPR & basic life support", category: "Clinical", description: "BLS and use of an AED.", duration_hours: 2, is_mandatory: true, validity_months: 12, pass_score: 85 },
      { title: "Patient privacy & records", category: "Compliance", description: "Patient confidentiality and health-record handling.", duration_hours: 1, is_mandatory: true, validity_months: 12, pass_score: 85 },
      { title: "Manual handling for clinical roles", category: "WHS", description: "Patient transfers and ergonomic safety.", duration_hours: 1, is_mandatory: true, validity_months: 12, pass_score: 80 },
    ],
  },
];
