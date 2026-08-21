// Standard expense category presets. Admins can one-click add these to their
// tenant on /org/expenses → Categories. Defaults are conservative; tenants
// can edit any field before saving or after.

export type ExpenseCategoryPreset = {
  key: string;
  name: string;
  code: string;
  description: string;
  requires_receipt: boolean;
  max_amount: number | null;
  icon?: string;
};

export const EXPENSE_CATEGORY_PRESETS: ExpenseCategoryPreset[] = [
  {
    key: "travel",
    name: "Travel",
    code: "TRAVEL",
    description: "Flights, trains, taxis, rideshare, parking & tolls.",
    requires_receipt: true,
    max_amount: 2000,
  },
  {
    key: "accommodation",
    name: "Accommodation",
    code: "ACCOM",
    description: "Hotels, serviced apartments and short-stay lodging.",
    requires_receipt: true,
    max_amount: 1500,
  },
  {
    key: "meals",
    name: "Meals & per diem",
    code: "MEALS",
    description: "Staff meals while travelling or working late.",
    requires_receipt: true,
    max_amount: 100,
  },
  {
    key: "client_entertainment",
    name: "Client entertainment",
    code: "ENT",
    description: "Meals or events with clients; needs attendee list.",
    requires_receipt: true,
    max_amount: 500,
  },
  {
    key: "mileage",
    name: "Mileage (personal vehicle)",
    code: "MILE",
    description: "Reimbursement for personal car kilometres on business trips.",
    requires_receipt: false,
    max_amount: null,
  },
  {
    key: "office_supplies",
    name: "Office supplies",
    code: "OFFICE",
    description: "Stationery, printer ink, small office consumables.",
    requires_receipt: true,
    max_amount: 250,
  },
  {
    key: "software",
    name: "Software & subscriptions",
    code: "SAAS",
    description: "SaaS, licences, plugins purchased on personal card.",
    requires_receipt: true,
    max_amount: 500,
  },
  {
    key: "training",
    name: "Training & conferences",
    code: "TRAIN",
    description: "Courses, conference tickets, certifications.",
    requires_receipt: true,
    max_amount: 3000,
  },
  {
    key: "phone_internet",
    name: "Phone & internet",
    code: "TELCO",
    description: "Mobile plans and home internet reimbursements.",
    requires_receipt: true,
    max_amount: 200,
  },
  {
    key: "wellbeing",
    name: "Health & wellbeing",
    code: "WELL",
    description: "Gym, ergonomic equipment, mental-health support.",
    requires_receipt: true,
    max_amount: 300,
  },
  {
    key: "team_events",
    name: "Team events",
    code: "TEAM",
    description: "Team lunches, off-sites, celebrations.",
    requires_receipt: true,
    max_amount: 800,
  },
  {
    key: "other",
    name: "Other / miscellaneous",
    code: "MISC",
    description: "Anything not covered by the other categories.",
    requires_receipt: true,
    max_amount: 200,
  },
];
