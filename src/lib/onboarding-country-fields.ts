// Country-aware staff onboarding field map.
// Used by the onboarding profile form to render the right identifiers, bank, and
// statutory contribution fields for each country. Unknown countries fall back to
// the universal core set.

export type CoreField =
  | "legal_first_name"
  | "legal_middle_name"
  | "legal_last_name"
  | "date_of_birth"
  | "gender"
  | "nationality"
  | "marital_status"
  | "national_id_number"
  | "address_line1"
  | "address_line2"
  | "city"
  | "region"
  | "postal_code"
  | "country_of_residence"
  | "personal_email"
  | "personal_phone"
  | "emergency_contact_name"
  | "emergency_contact_phone"
  | "emergency_contact_relation"
  | "bank_name"
  | "bank_account_holder"
  | "bank_account_number"
  | "bank_branch_code"
  | "bank_iban"
  | "bank_swift"
  | "tax_identification_number"
  | "social_security_number"
  | "provident_fund_number"
  | "pension_fund_number";

export interface FieldDef {
  key: CoreField;
  label: string;
  required?: boolean;
  placeholder?: string;
  help?: string;
}

export interface CountryExtra {
  key: string; // stored under country_specific[key]
  label: string;
  required?: boolean;
  placeholder?: string;
}

export interface CountrySchema {
  identifiers: FieldDef[];
  bank: FieldDef[];
  statutory: FieldDef[];
  extras: CountryExtra[];
}

const UNIVERSAL_PERSONAL: FieldDef[] = [
  { key: "legal_first_name", label: "Legal first name", required: true },
  { key: "legal_middle_name", label: "Middle name(s)" },
  { key: "legal_last_name", label: "Legal last name", required: true },
  { key: "date_of_birth", label: "Date of birth", required: true },
  { key: "gender", label: "Gender" },
  { key: "nationality", label: "Nationality", required: true },
  { key: "marital_status", label: "Marital status" },
];

const ADDRESS: FieldDef[] = [
  { key: "address_line1", label: "Address line 1", required: true },
  { key: "address_line2", label: "Address line 2" },
  { key: "city", label: "City", required: true },
  { key: "region", label: "State / Province / Region" },
  { key: "postal_code", label: "Postal / ZIP code", required: true },
  { key: "country_of_residence", label: "Country of residence", required: true },
  { key: "personal_email", label: "Personal email", required: true },
  { key: "personal_phone", label: "Personal phone", required: true },
];

const EMERGENCY: FieldDef[] = [
  { key: "emergency_contact_name", label: "Emergency contact name", required: true },
  { key: "emergency_contact_phone", label: "Emergency contact phone", required: true },
  { key: "emergency_contact_relation", label: "Relationship" },
];

const IBAN_BANK: FieldDef[] = [
  { key: "bank_name", label: "Bank name", required: true },
  { key: "bank_account_holder", label: "Account holder", required: true },
  { key: "bank_iban", label: "IBAN", required: true },
  { key: "bank_swift", label: "SWIFT / BIC" },
];

const ACCOUNT_BANK: FieldDef[] = [
  { key: "bank_name", label: "Bank name", required: true },
  { key: "bank_account_holder", label: "Account holder", required: true },
  { key: "bank_account_number", label: "Account number", required: true },
  { key: "bank_branch_code", label: "Branch / sort / routing code", required: true },
  { key: "bank_swift", label: "SWIFT / BIC" },
];

const COUNTRY_OVERRIDES: Record<string, Partial<CountrySchema>> = {
  ZA: {
    identifiers: [{ key: "national_id_number", label: "South African ID number", required: true }],
    statutory: [
      { key: "tax_identification_number", label: "SARS tax reference number", required: true },
      { key: "provident_fund_number", label: "Provident / pension fund number" },
      { key: "social_security_number", label: "UIF reference number" },
    ],
    bank: ACCOUNT_BANK,
  },
  KE: {
    identifiers: [{ key: "national_id_number", label: "National ID number", required: true }],
    statutory: [
      { key: "tax_identification_number", label: "KRA PIN", required: true },
      { key: "social_security_number", label: "NSSF number", required: true },
      { key: "provident_fund_number", label: "NHIF number", required: true },
    ],
    bank: ACCOUNT_BANK,
  },
  NG: {
    identifiers: [{ key: "national_id_number", label: "NIN (National Identification Number)", required: true }],
    statutory: [
      { key: "tax_identification_number", label: "TIN (Tax Identification Number)", required: true },
      { key: "pension_fund_number", label: "Pension PIN", required: true },
    ],
    bank: ACCOUNT_BANK,
  },
  GB: {
    statutory: [
      { key: "tax_identification_number", label: "UTR (optional)" },
      { key: "social_security_number", label: "National Insurance number", required: true },
    ],
    bank: [
      { key: "bank_name", label: "Bank name", required: true },
      { key: "bank_account_holder", label: "Account holder", required: true },
      { key: "bank_account_number", label: "Account number", required: true },
      { key: "bank_branch_code", label: "Sort code", required: true },
    ],
  },
  US: {
    statutory: [
      { key: "social_security_number", label: "SSN", required: true },
      { key: "tax_identification_number", label: "ITIN (if no SSN)" },
    ],
    bank: [
      { key: "bank_name", label: "Bank name", required: true },
      { key: "bank_account_holder", label: "Account holder", required: true },
      { key: "bank_account_number", label: "Account number", required: true },
      { key: "bank_branch_code", label: "Routing number (ABA)", required: true },
    ],
  },
  IN: {
    identifiers: [{ key: "national_id_number", label: "Aadhaar number", required: true }],
    statutory: [
      { key: "tax_identification_number", label: "PAN", required: true },
      { key: "provident_fund_number", label: "EPF UAN", required: true },
    ],
    bank: [
      { key: "bank_name", label: "Bank name", required: true },
      { key: "bank_account_holder", label: "Account holder", required: true },
      { key: "bank_account_number", label: "Account number", required: true },
      { key: "bank_branch_code", label: "IFSC code", required: true },
    ],
  },
  AE: {
    statutory: [{ key: "tax_identification_number", label: "Emirates ID number", required: true }],
    bank: IBAN_BANK,
  },
};

// Countries that use IBAN by default (EU + many others). Used when no specific override exists.
const IBAN_COUNTRIES = new Set([
  "AT","BE","BG","CH","CY","CZ","DE","DK","EE","ES","FI","FR","GR","HR","HU","IE","IS","IT",
  "LI","LT","LU","LV","MT","NL","NO","PL","PT","RO","SE","SI","SK","SM","VA","MC","AD",
  "AL","BA","BY","ME","MK","RS","TR","UA","XK","GE","AM",
]);

function defaultStatutory(): FieldDef[] {
  return [
    { key: "tax_identification_number", label: "Tax identification number", required: true },
    { key: "social_security_number", label: "Social security number" },
  ];
}

export function getCountrySchema(countryCode: string | null | undefined): CountrySchema {
  const code = (countryCode ?? "").toUpperCase();
  const override = COUNTRY_OVERRIDES[code];
  const base: CountrySchema = {
    identifiers: override?.identifiers ?? [{ key: "national_id_number", label: "National ID / passport number" }],
    bank: override?.bank ?? (IBAN_COUNTRIES.has(code) ? IBAN_BANK : ACCOUNT_BANK),
    statutory: override?.statutory ?? defaultStatutory(),
    extras: override?.extras ?? [],
  };
  return base;
}

export function getPersonalFields(): FieldDef[] {
  return UNIVERSAL_PERSONAL;
}

export function getAddressFields(): FieldDef[] {
  return ADDRESS;
}

export function getEmergencyFields(): FieldDef[] {
  return EMERGENCY;
}

export function getAllFieldKeys(country: string | null | undefined): CoreField[] {
  const s = getCountrySchema(country);
  return [
    ...UNIVERSAL_PERSONAL,
    ...ADDRESS,
    ...EMERGENCY,
    ...s.identifiers,
    ...s.bank,
    ...s.statutory,
  ].map((f) => f.key);
}
