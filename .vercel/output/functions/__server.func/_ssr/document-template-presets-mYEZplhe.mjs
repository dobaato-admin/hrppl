const DEFAULT_FIELDS = [
  "employee.full_name",
  "employee.first_name",
  "employee.email",
  "employee.job_title",
  "company.name",
  "today"
];
const DOCUMENT_TEMPLATE_PRESETS = [
  {
    key: "employment_contract_standard",
    name: "Employment contract — standard",
    description: "Full-time permanent employment contract with standard clauses.",
    doc_type: "employment_contract",
    requires_signature: true,
    requires_countersign: true,
    countersigner_role: "HR Manager",
    default_due_days: 14,
    merge_fields: [...DEFAULT_FIELDS, "employee.start_date", "employee.salary"],
    body_html: `<h1>Employment Agreement</h1>
<p><strong>Between:</strong> {{company.name}} ("the Company")</p>
<p><strong>And:</strong> {{employee.full_name}} ("the Employee")</p>
<p><strong>Date:</strong> {{today}}</p>

<h2>1. Position</h2>
<p>The Employee will be employed as <strong>{{employee.job_title}}</strong>, reporting to their manager as designated by the Company.</p>

<h2>2. Commencement</h2>
<p>Employment shall commence on {{employee.start_date}} and continue until terminated in accordance with this Agreement.</p>

<h2>3. Remuneration</h2>
<p>The Company shall pay the Employee a base salary of {{employee.salary}} per annum, payable in accordance with the Company's standard payroll cycle.</p>

<h2>4. Hours of work</h2>
<p>The Employee's standard hours of work are as set out in the Company's policies, with reasonable additional hours as required.</p>

<h2>5. Confidentiality</h2>
<p>The Employee shall not disclose any confidential information of the Company during or after employment.</p>

<h2>6. Termination</h2>
<p>Either party may terminate this agreement by providing written notice in accordance with applicable law.</p>

<p>Signed by the Employee: ______________________ &nbsp; Date: ______________</p>
<p>Signed for the Company: ______________________ &nbsp; Date: ______________</p>`
  },
  {
    key: "offer_letter_standard",
    name: "Offer letter — standard",
    description: "Conditional job offer letter for new hires.",
    doc_type: "offer_letter",
    requires_signature: true,
    requires_countersign: false,
    default_due_days: 7,
    merge_fields: [...DEFAULT_FIELDS, "employee.start_date", "employee.salary"],
    body_html: `<h1>Offer of Employment</h1>
<p>{{today}}</p>
<p>Dear {{employee.first_name}},</p>
<p>We are delighted to offer you the position of <strong>{{employee.job_title}}</strong> at {{company.name}}, commencing on {{employee.start_date}}.</p>
<p>Your starting remuneration will be <strong>{{employee.salary}}</strong> per annum, payable in accordance with our standard payroll cycle.</p>
<p>This offer is conditional on:</p>
<ul>
  <li>Satisfactory reference checks</li>
  <li>Right to work verification</li>
  <li>Signing the full employment agreement</li>
</ul>
<p>To accept this offer, please sign below by the due date.</p>
<p>Warm regards,<br/>{{company.name}}</p>`
  },
  {
    key: "nda_mutual",
    name: "Non-disclosure agreement (mutual)",
    description: "Mutual confidentiality agreement for staff or contractors.",
    doc_type: "policy",
    requires_signature: true,
    requires_countersign: true,
    countersigner_role: "Authorised Signatory",
    default_due_days: 7,
    merge_fields: DEFAULT_FIELDS,
    body_html: `<h1>Mutual Non-Disclosure Agreement</h1>
<p>This Agreement is entered into on {{today}} between {{company.name}} and {{employee.full_name}}.</p>
<h2>1. Confidential Information</h2>
<p>Each party may disclose confidential, proprietary, or trade-secret information to the other ("Confidential Information").</p>
<h2>2. Obligations</h2>
<p>The receiving party shall: (a) keep all Confidential Information strictly confidential; (b) use it solely for the purposes contemplated; (c) not disclose it to any third party without prior written consent.</p>
<h2>3. Term</h2>
<p>The obligations under this Agreement shall survive for five (5) years following termination.</p>
<p>Signature: ______________________</p>`
  },
  {
    key: "policy_acknowledgement",
    name: "Policy acknowledgement",
    description: "Generic acknowledgement that an employee has read a company policy.",
    doc_type: "policy",
    requires_signature: true,
    requires_countersign: false,
    default_due_days: 14,
    merge_fields: [...DEFAULT_FIELDS, "policy.title"],
    body_html: `<h1>Policy Acknowledgement</h1>
<p>I, <strong>{{employee.full_name}}</strong>, acknowledge that I have received, read, and understood the {{company.name}} policy titled <strong>"{{policy.title}}"</strong>.</p>
<p>I agree to comply with the terms of this policy in the course of my employment with {{company.name}}.</p>
<p>Date: {{today}}</p>
<p>Signature: ______________________</p>`
  },
  {
    key: "warning_letter",
    name: "Warning letter",
    description: "Formal written warning for performance or conduct issues.",
    doc_type: "hr_letter",
    requires_signature: true,
    requires_countersign: true,
    countersigner_role: "HR Manager",
    default_due_days: 7,
    merge_fields: [...DEFAULT_FIELDS, "incident.summary", "incident.date"],
    body_html: `<h1>Written Warning</h1>
<p>{{today}}</p>
<p>Dear {{employee.first_name}},</p>
<p>Following our recent discussion regarding the incident on {{incident.date}}:</p>
<blockquote>{{incident.summary}}</blockquote>
<p>This letter constitutes a formal written warning. We expect immediate and sustained improvement. Further occurrences may result in additional disciplinary action up to and including termination of employment.</p>
<p>You are invited to provide a written response within seven (7) days of receipt.</p>
<p>Yours sincerely,<br/>{{company.name}}</p>`
  },
  {
    key: "experience_letter",
    name: "Experience / relieving letter",
    description: "Confirmation of service for departing employees.",
    doc_type: "hr_letter",
    requires_signature: false,
    requires_countersign: true,
    countersigner_role: "HR Manager",
    default_due_days: 30,
    merge_fields: [...DEFAULT_FIELDS, "employee.start_date", "employee.end_date"],
    body_html: `<h1>Experience Letter</h1>
<p>{{today}}</p>
<p>To Whom It May Concern,</p>
<p>This is to certify that <strong>{{employee.full_name}}</strong> was employed with {{company.name}} as <strong>{{employee.job_title}}</strong> from {{employee.start_date}} to {{employee.end_date}}.</p>
<p>During their tenure, they were found to be diligent, sincere, and professional in their duties.</p>
<p>We wish them every success in their future endeavours.</p>
<p>Sincerely,<br/>{{company.name}}</p>`
  },
  {
    key: "promotion_letter",
    name: "Promotion letter",
    description: "Confirmation of promotion, new title and pay.",
    doc_type: "hr_letter",
    requires_signature: true,
    requires_countersign: true,
    countersigner_role: "HR Manager",
    default_due_days: 7,
    merge_fields: [...DEFAULT_FIELDS, "promotion.new_title", "promotion.new_salary", "promotion.effective_date"],
    body_html: `<h1>Promotion Letter</h1>
<p>{{today}}</p>
<p>Dear {{employee.first_name}},</p>
<p>We are pleased to confirm your promotion to <strong>{{promotion.new_title}}</strong>, effective {{promotion.effective_date}}.</p>
<p>Your revised annual remuneration will be <strong>{{promotion.new_salary}}</strong>, payable in accordance with our standard payroll cycle. All other terms of your employment remain unchanged.</p>
<p>Congratulations on this well-deserved recognition.</p>
<p>Warm regards,<br/>{{company.name}}</p>`
  },
  // ===== HR POLICY LIBRARY =====
  {
    key: "policy_code_of_conduct",
    name: "Code of conduct policy",
    description: "Standards of professional behaviour expected of all staff.",
    doc_type: "policy",
    requires_signature: true,
    requires_countersign: false,
    default_due_days: 14,
    merge_fields: DEFAULT_FIELDS,
    body_html: `<h1>Code of Conduct</h1>
<p><strong>Effective:</strong> {{today}} &nbsp; <strong>Issued by:</strong> {{company.name}}</p>
<h2>1. Purpose</h2>
<p>This policy sets out the standards of behaviour expected of every employee, contractor and director of {{company.name}}.</p>
<h2>2. Our standards</h2>
<ul>
  <li>Treat colleagues, clients and partners with dignity, courtesy and respect.</li>
  <li>Comply with all applicable laws, regulations and Company policies.</li>
  <li>Avoid actual, perceived or potential conflicts of interest.</li>
  <li>Protect Company property, information and confidential data.</li>
  <li>Report wrongdoing through approved channels without fear of retaliation.</li>
</ul>
<h2>3. Prohibited behaviour</h2>
<p>Harassment, discrimination, bullying, theft, fraud, dishonesty, intoxication on duty and breaches of confidentiality are strictly prohibited and may result in disciplinary action up to and including termination.</p>
<h2>4. Reporting concerns</h2>
<p>Raise concerns with your manager, HR or via the Company's grievance channel. Reports are handled confidentially where possible.</p>
<h2>5. Acknowledgement</h2>
<p>I, {{employee.full_name}}, acknowledge that I have read and agree to comply with this Code of Conduct.</p>
<p>Signature: ______________________ &nbsp; Date: ______________</p>`
  },
  {
    key: "policy_leave",
    name: "Leave policy",
    description: "Annual, sick, parental and other leave entitlements.",
    doc_type: "policy",
    requires_signature: true,
    requires_countersign: false,
    default_due_days: 14,
    merge_fields: DEFAULT_FIELDS,
    body_html: `<h1>Leave Policy</h1>
<p><strong>Effective:</strong> {{today}}</p>
<h2>1. Types of leave</h2>
<ul>
  <li><strong>Annual leave</strong> — accrued progressively; balance visible in your self-service portal.</li>
  <li><strong>Sick / personal leave</strong> — personal illness or caring for an immediate family member.</li>
  <li><strong>Parental leave</strong> — per applicable parental-leave law.</li>
  <li><strong>Compassionate / bereavement leave</strong> — death or serious illness of an immediate family member.</li>
  <li><strong>Unpaid leave</strong> — subject to manager and HR approval.</li>
</ul>
<h2>2. Requesting leave</h2>
<p>Leave must be requested in advance via the HR system, except unforeseen sick leave which must be notified to your manager as soon as practicable on the first day of absence.</p>
<h2>3. Documentation</h2>
<p>Sick leave of more than two consecutive days requires a medical certificate.</p>
<h2>4. Approvals</h2>
<p>Approval is at the discretion of your manager, subject to operational requirements. Statutory entitlements will not be unreasonably withheld.</p>
<h2>5. Acknowledgement</h2>
<p>I, {{employee.full_name}}, confirm I have read and understood the Leave Policy.</p>`
  },
  {
    key: "policy_it_acceptable_use",
    name: "IT acceptable use policy",
    description: "Rules for use of Company devices, networks, email and SaaS tools.",
    doc_type: "policy",
    requires_signature: true,
    requires_countersign: false,
    default_due_days: 7,
    merge_fields: DEFAULT_FIELDS,
    body_html: `<h1>Acceptable Use of IT Resources</h1>
<p><strong>Effective:</strong> {{today}}</p>
<h2>1. Acceptable use</h2>
<ul>
  <li>Use Company IT resources primarily for business; incidental personal use must be lawful and brief.</li>
  <li>Use strong, unique passwords and enable multi-factor authentication where available.</li>
  <li>Lock devices when unattended.</li>
  <li>Store Company data only in approved systems.</li>
</ul>
<h2>2. Prohibited use</h2>
<ul>
  <li>Accessing, distributing or storing illegal, harassing or offensive material.</li>
  <li>Installing unauthorised software or bypassing security controls.</li>
  <li>Connecting unauthorised devices to corporate networks.</li>
  <li>Disclosing Company information on personal accounts, public AI tools or unmanaged storage.</li>
</ul>
<h2>3. Monitoring</h2>
<p>The Company may, to the extent permitted by law, monitor use of its IT systems for security, compliance and operational purposes.</p>
<h2>4. Incident reporting</h2>
<p>Suspected security incidents (phishing, malware, lost devices) must be reported to IT immediately.</p>
<h2>5. Acknowledgement</h2>
<p>I, {{employee.full_name}}, agree to comply with this Acceptable Use Policy.</p>`
  },
  {
    key: "policy_whs",
    name: "Workplace health & safety policy",
    description: "WHS / OHS commitments, responsibilities and incident reporting.",
    doc_type: "policy",
    requires_signature: true,
    requires_countersign: false,
    default_due_days: 14,
    merge_fields: DEFAULT_FIELDS,
    body_html: `<h1>Workplace Health & Safety Policy</h1>
<p><strong>Effective:</strong> {{today}}</p>
<h2>1. Commitment</h2>
<p>{{company.name}} is committed to providing a safe and healthy workplace for all workers, contractors and visitors, so far as is reasonably practicable.</p>
<h2>2. Responsibilities</h2>
<ul>
  <li><strong>Management</strong> will provide safe systems of work, training, PPE and consultation on safety matters.</li>
  <li><strong>Workers</strong> must take reasonable care for their own and others' safety, follow instructions and report hazards.</li>
</ul>
<h2>3. Hazard & incident reporting</h2>
<p>All hazards, near-misses and incidents — however minor — must be reported to your manager and recorded in the HR system on the day they occur.</p>
<h2>4. Emergencies</h2>
<p>Familiarise yourself with the emergency exits, assembly points and first-aid officers at your worksite.</p>
<h2>5. Acknowledgement</h2>
<p>I, {{employee.full_name}}, acknowledge my responsibilities under this WHS Policy.</p>`
  },
  {
    key: "policy_anti_harassment",
    name: "Anti-harassment & EEO policy",
    description: "Zero-tolerance policy on harassment, bullying and discrimination.",
    doc_type: "policy",
    requires_signature: true,
    requires_countersign: false,
    default_due_days: 14,
    merge_fields: DEFAULT_FIELDS,
    body_html: `<h1>Equal Opportunity & Anti-Harassment Policy</h1>
<p><strong>Effective:</strong> {{today}}</p>
<h2>1. Commitment</h2>
<p>{{company.name}} provides a workplace free from discrimination, harassment, sexual harassment, bullying and victimisation. All employment decisions are made on merit.</p>
<h2>2. Definitions</h2>
<ul>
  <li><strong>Discrimination</strong> — less favourable treatment on the basis of a protected attribute.</li>
  <li><strong>Harassment</strong> — unwelcome conduct that humiliates, offends or intimidates.</li>
  <li><strong>Sexual harassment</strong> — unwelcome conduct of a sexual nature.</li>
  <li><strong>Bullying</strong> — repeated unreasonable behaviour creating a risk to health and safety.</li>
</ul>
<h2>3. Reporting & no retaliation</h2>
<p>Raise concerns with your manager, HR or anonymously via the grievance channel. The Company will not tolerate retaliation against any person who reports in good faith.</p>
<h2>4. Consequences</h2>
<p>Breach of this policy may result in disciplinary action up to and including termination.</p>
<h2>5. Acknowledgement</h2>
<p>I, {{employee.full_name}}, have read and agree to comply with this policy.</p>`
  },
  {
    key: "policy_privacy",
    name: "Privacy & data protection policy",
    description: "How the Company handles employee and customer personal information.",
    doc_type: "policy",
    requires_signature: true,
    requires_countersign: false,
    default_due_days: 14,
    merge_fields: DEFAULT_FIELDS,
    body_html: `<h1>Privacy & Data Protection Policy</h1>
<p><strong>Effective:</strong> {{today}}</p>
<h2>1. Purpose</h2>
<p>This policy describes how {{company.name}} collects, uses, stores and discloses personal information in compliance with applicable privacy laws.</p>
<h2>2. Collection</h2>
<p>We collect only the personal information reasonably necessary for our business functions.</p>
<h2>3. Use & disclosure</h2>
<p>Personal information is used only for the purpose for which it was collected, or a directly related purpose, unless consent is obtained or disclosure is required by law.</p>
<h2>4. Storage & security</h2>
<p>Information is stored in secure systems with role-based access. Hard-copy records are kept in locked storage.</p>
<h2>5. Access, correction & breach</h2>
<p>Individuals may request access and correction via HR. Suspected data breaches must be reported to IT and the Privacy Officer immediately.</p>
<h2>6. Acknowledgement</h2>
<p>I, {{employee.full_name}}, agree to handle personal information in accordance with this policy.</p>`
  },
  {
    key: "policy_remote_work",
    name: "Remote & hybrid work policy",
    description: "Framework for working from home or other remote locations.",
    doc_type: "policy",
    requires_signature: true,
    requires_countersign: false,
    default_due_days: 14,
    merge_fields: DEFAULT_FIELDS,
    body_html: `<h1>Remote & Hybrid Work Policy</h1>
<p><strong>Effective:</strong> {{today}}</p>
<h2>1. Eligibility</h2>
<p>Remote work is available where the role and individual performance allow, with manager approval. It is a privilege, not an entitlement.</p>
<h2>2. Hours & availability</h2>
<p>Remote workers must maintain core hours agreed with their manager and remain reachable on Company communication tools.</p>
<h2>3. Workspace & equipment</h2>
<p>Workers are responsible for maintaining a safe, ergonomic and private workspace. The Company provides approved equipment; personal devices require IT approval.</p>
<h2>4. Security</h2>
<p>Follow the IT Acceptable Use Policy, lock devices, use secure networks and avoid accessing Company data in public.</p>
<h2>5. Performance</h2>
<p>Remote arrangements may be modified or withdrawn if performance, conduct or business needs require it.</p>
<h2>6. Acknowledgement</h2>
<p>I, {{employee.full_name}}, agree to comply with this Remote Work Policy.</p>`
  },
  {
    key: "policy_drug_alcohol",
    name: "Drug & alcohol policy",
    description: "Standards regarding intoxicants in the workplace.",
    doc_type: "policy",
    requires_signature: true,
    requires_countersign: false,
    default_due_days: 14,
    merge_fields: DEFAULT_FIELDS,
    body_html: `<h1>Drug & Alcohol Policy</h1>
<p><strong>Effective:</strong> {{today}}</p>
<h2>1. Standards</h2>
<ul>
  <li>Workers must not attend work under the influence of alcohol or illicit drugs.</li>
  <li>Alcohol consumption on Company premises is permitted only at authorised Company events, in moderation.</li>
  <li>Workers taking medication that may impair performance must inform their manager.</li>
</ul>
<h2>2. Testing</h2>
<p>Where lawful and reasonable (safety-critical roles, post-incident), the Company may require drug or alcohol testing.</p>
<h2>3. Support & breach</h2>
<p>The Employee Assistance Program is available to workers experiencing substance-related issues. Breaches may result in disciplinary action up to and including termination.</p>
<h2>4. Acknowledgement</h2>
<p>I, {{employee.full_name}}, agree to comply with this policy.</p>`
  },
  {
    key: "policy_social_media",
    name: "Social media policy",
    description: "Use of social media in personal and Company contexts.",
    doc_type: "policy",
    requires_signature: true,
    requires_countersign: false,
    default_due_days: 14,
    merge_fields: DEFAULT_FIELDS,
    body_html: `<h1>Social Media Policy</h1>
<p><strong>Effective:</strong> {{today}}</p>
<h2>1. Personal use</h2>
<p>You are free to use social media in your personal time, provided you do not:</p>
<ul>
  <li>Identify or imply you speak for {{company.name}} unless authorised.</li>
  <li>Disclose confidential, proprietary or customer information.</li>
  <li>Post content that disparages colleagues, clients or the Company.</li>
  <li>Breach the Code of Conduct, Anti-Harassment or Privacy Policies.</li>
</ul>
<h2>2. Company channels & disclosure</h2>
<p>Only authorised spokespeople may post on official Company channels. If you discuss Company products in public, make it clear that the views are your own.</p>
<h2>3. Acknowledgement</h2>
<p>I, {{employee.full_name}}, agree to follow this Social Media Policy.</p>`
  },
  {
    key: "policy_expense_travel",
    name: "Expense & travel policy",
    description: "Allowable business expenses, approvals and reimbursement.",
    doc_type: "policy",
    requires_signature: true,
    requires_countersign: false,
    default_due_days: 14,
    merge_fields: DEFAULT_FIELDS,
    body_html: `<h1>Expense & Travel Policy</h1>
<p><strong>Effective:</strong> {{today}}</p>
<h2>1. Principles & approvals</h2>
<p>Expenses must be reasonable, necessary, properly authorised and supported by receipts. Travel and expenses above thresholds set by Finance require pre-approval by your manager; international travel requires executive approval.</p>
<h2>2. Travel standards</h2>
<ul>
  <li>Economy class for flights under 6 hours.</li>
  <li>Mid-range hotels at the standard nightly cap.</li>
  <li>Public transport or ride-share where reasonable.</li>
</ul>
<h2>3. Submission</h2>
<p>Claims must be lodged via the HR/finance system within 30 days, with receipts attached.</p>
<h2>4. Misuse</h2>
<p>Misuse, falsified claims or undisclosed conflicts of interest will result in disciplinary action.</p>
<h2>5. Acknowledgement</h2>
<p>I, {{employee.full_name}}, agree to comply with this Expense & Travel Policy.</p>`
  }
];
function getPresetByKey(key) {
  return DOCUMENT_TEMPLATE_PRESETS.find((p) => p.key === key);
}
export {
  DOCUMENT_TEMPLATE_PRESETS,
  getPresetByKey
};
