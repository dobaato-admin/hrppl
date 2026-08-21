/**
 * Industry-flavoured designation/org-chart presets. Org admins can seed
 * a starter ladder in one click and then customise.
 *
 * Salary bands are illustrative annual USD ranges; admins should adjust to
 * their market. Grades go from L1 (entry) upward — the order in the array
 * is the reporting hierarchy (junior → senior).
 */

export interface PresetDesignation {
  title: string;
  grade: string;
  code?: string;
  min_salary?: number;
  max_salary?: number;
  description?: string;
}

export interface DesignationPreset {
  key: string;
  name: string;
  industry: string;
  description: string;
  designations: PresetDesignation[];
}

export const DESIGNATION_PRESETS: DesignationPreset[] = [
  {
    key: "accounting-firm",
    name: "Accounting / professional services",
    industry: "Accounting",
    description: "Classic public-practice ladder: Junior → Senior → Manager → Partner.",
    designations: [
      { title: "Graduate Accountant", grade: "L1", code: "ACC-GRAD", min_salary: 55000, max_salary: 65000 },
      { title: "Junior Accountant", grade: "L2", code: "ACC-JR", min_salary: 60000, max_salary: 75000 },
      { title: "Senior Accountant", grade: "L3", code: "ACC-SR", min_salary: 80000, max_salary: 110000 },
      { title: "Supervisor", grade: "L4", code: "ACC-SUP", min_salary: 100000, max_salary: 130000 },
      { title: "Manager", grade: "L5", code: "ACC-MGR", min_salary: 120000, max_salary: 160000 },
      { title: "Senior Manager", grade: "L6", code: "ACC-SMGR", min_salary: 150000, max_salary: 200000 },
      { title: "Director", grade: "L7", code: "ACC-DIR", min_salary: 180000, max_salary: 250000 },
      { title: "Partner", grade: "L8", code: "ACC-PTR", min_salary: 250000, max_salary: 500000 },
    ],
  },
  {
    key: "tech-product",
    name: "Tech / product company",
    industry: "Technology",
    description: "Engineering & product career ladder used by most modern SaaS companies.",
    designations: [
      { title: "Software Engineer I", grade: "L1", code: "SWE-1", min_salary: 70000, max_salary: 90000 },
      { title: "Software Engineer II", grade: "L2", code: "SWE-2", min_salary: 90000, max_salary: 120000 },
      { title: "Senior Software Engineer", grade: "L3", code: "SWE-3", min_salary: 120000, max_salary: 160000 },
      { title: "Staff Engineer", grade: "L4", code: "SWE-4", min_salary: 160000, max_salary: 220000 },
      { title: "Principal Engineer", grade: "L5", code: "SWE-5", min_salary: 200000, max_salary: 280000 },
      { title: "Engineering Manager", grade: "M3", code: "ENG-MGR", min_salary: 140000, max_salary: 190000 },
      { title: "Director of Engineering", grade: "M4", code: "ENG-DIR", min_salary: 180000, max_salary: 260000 },
      { title: "VP Engineering", grade: "M5", code: "ENG-VP", min_salary: 250000, max_salary: 380000 },
    ],
  },
  {
    key: "retail",
    name: "Retail / store operations",
    industry: "Retail",
    description: "Store, area and head-office roles for a multi-branch retailer.",
    designations: [
      { title: "Sales Associate", grade: "L1", code: "RET-SA", min_salary: 32000, max_salary: 42000 },
      { title: "Senior Sales Associate", grade: "L2", code: "RET-SSA", min_salary: 38000, max_salary: 48000 },
      { title: "Team Leader", grade: "L3", code: "RET-TL", min_salary: 45000, max_salary: 58000 },
      { title: "Assistant Store Manager", grade: "L4", code: "RET-ASM", min_salary: 55000, max_salary: 70000 },
      { title: "Store Manager", grade: "L5", code: "RET-SM", min_salary: 65000, max_salary: 90000 },
      { title: "Area Manager", grade: "L6", code: "RET-AM", min_salary: 85000, max_salary: 120000 },
      { title: "Regional Manager", grade: "L7", code: "RET-RM", min_salary: 110000, max_salary: 160000 },
      { title: "Head of Retail", grade: "L8", code: "RET-HOR", min_salary: 150000, max_salary: 220000 },
    ],
  },
  {
    key: "hospitality",
    name: "Hospitality (hotel / restaurant)",
    industry: "Hospitality",
    description: "Front-of-house, kitchen and venue management ladder.",
    designations: [
      { title: "Crew Member", grade: "L1", code: "HOS-CR", min_salary: 30000, max_salary: 40000 },
      { title: "Shift Supervisor", grade: "L2", code: "HOS-SS", min_salary: 38000, max_salary: 50000 },
      { title: "Assistant Manager", grade: "L3", code: "HOS-AM", min_salary: 48000, max_salary: 62000 },
      { title: "Venue Manager", grade: "L4", code: "HOS-VM", min_salary: 60000, max_salary: 85000 },
      { title: "Head Chef", grade: "L4", code: "HOS-HC", min_salary: 65000, max_salary: 95000 },
      { title: "Sous Chef", grade: "L3", code: "HOS-SC", min_salary: 50000, max_salary: 70000 },
      { title: "Operations Manager", grade: "L5", code: "HOS-OPS", min_salary: 80000, max_salary: 120000 },
      { title: "General Manager", grade: "L6", code: "HOS-GM", min_salary: 100000, max_salary: 160000 },
    ],
  },
  {
    key: "construction",
    name: "Construction / trades",
    industry: "Construction",
    description: "Site, trades and project management roles.",
    designations: [
      { title: "Apprentice", grade: "L1", code: "CON-APP", min_salary: 35000, max_salary: 45000 },
      { title: "Tradesperson", grade: "L2", code: "CON-TR", min_salary: 55000, max_salary: 80000 },
      { title: "Leading Hand", grade: "L3", code: "CON-LH", min_salary: 70000, max_salary: 95000 },
      { title: "Foreman", grade: "L4", code: "CON-FM", min_salary: 90000, max_salary: 130000 },
      { title: "Site Supervisor", grade: "L5", code: "CON-SS", min_salary: 110000, max_salary: 150000 },
      { title: "Project Manager", grade: "L6", code: "CON-PM", min_salary: 130000, max_salary: 180000 },
      { title: "Construction Manager", grade: "L7", code: "CON-CM", min_salary: 160000, max_salary: 220000 },
    ],
  },
  {
    key: "healthcare-clinic",
    name: "Healthcare clinic",
    industry: "Healthcare",
    description: "Allied-health, nursing and clinical leadership ladder.",
    designations: [
      { title: "Receptionist", grade: "A1", code: "HC-REC", min_salary: 38000, max_salary: 50000 },
      { title: "Medical Assistant", grade: "A2", code: "HC-MA", min_salary: 45000, max_salary: 60000 },
      { title: "Enrolled Nurse", grade: "N1", code: "HC-EN", min_salary: 55000, max_salary: 75000 },
      { title: "Registered Nurse", grade: "N2", code: "HC-RN", min_salary: 70000, max_salary: 100000 },
      { title: "Nurse Practitioner", grade: "N3", code: "HC-NP", min_salary: 100000, max_salary: 140000 },
      { title: "Practice Manager", grade: "M1", code: "HC-PM", min_salary: 80000, max_salary: 120000 },
      { title: "Clinical Director", grade: "M2", code: "HC-CD", min_salary: 150000, max_salary: 220000 },
    ],
  },
  {
    key: "education-school",
    name: "Education / school",
    industry: "Education",
    description: "Teaching staff and school leadership.",
    designations: [
      { title: "Teaching Assistant", grade: "T1", code: "EDU-TA", min_salary: 35000, max_salary: 48000 },
      { title: "Graduate Teacher", grade: "T2", code: "EDU-GT", min_salary: 60000, max_salary: 75000 },
      { title: "Teacher", grade: "T3", code: "EDU-T", min_salary: 70000, max_salary: 95000 },
      { title: "Senior Teacher", grade: "T4", code: "EDU-ST", min_salary: 90000, max_salary: 115000 },
      { title: "Head of Department", grade: "L1", code: "EDU-HOD", min_salary: 105000, max_salary: 135000 },
      { title: "Deputy Principal", grade: "L2", code: "EDU-DP", min_salary: 130000, max_salary: 170000 },
      { title: "Principal", grade: "L3", code: "EDU-PR", min_salary: 160000, max_salary: 220000 },
    ],
  },
  {
    key: "ngo",
    name: "Non-profit / NGO",
    industry: "Non-profit",
    description: "Programme delivery and operational leadership for a small-to-mid NGO.",
    designations: [
      { title: "Volunteer Coordinator", grade: "L1", code: "NGO-VC", min_salary: 45000, max_salary: 60000 },
      { title: "Program Officer", grade: "L2", code: "NGO-PO", min_salary: 55000, max_salary: 75000 },
      { title: "Senior Program Officer", grade: "L3", code: "NGO-SPO", min_salary: 70000, max_salary: 95000 },
      { title: "Program Manager", grade: "L4", code: "NGO-PM", min_salary: 85000, max_salary: 115000 },
      { title: "Head of Programs", grade: "L5", code: "NGO-HOP", min_salary: 110000, max_salary: 150000 },
      { title: "Executive Director", grade: "L6", code: "NGO-ED", min_salary: 140000, max_salary: 200000 },
    ],
  },
];
