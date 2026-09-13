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
  | "bank_bsb"
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
  /**
   * Format rule for a value that has one, checked client-side and echoed in
   * the field's help text. T26 · An Australian BSB is exactly six digits and
   * an account number is *not* a fixed length — a form that hard-codes nine
   * rejects legitimate accounts at several institutions.
   */
  format?: "bsb" | "digits" | "swift";
  maxLength?: number;
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
  AU: {
    identifiers: [{ key: "national_id_number", label: "Passport or driver licence number" }],
    statutory: [
      { key: "tax_identification_number", label: "Tax File Number (TFN)", required: true },
      { key: "pension_fund_number", label: "Superannuation member number" },
    ],
    // T26 · The Australian shape, not the generic one.
    //
    // A BSB identifies the branch and is always six digits, conventionally
    // written XXX-XXX. The account number's length varies by institution, so
    // nothing here fixes it — a form that demanded nine digits rejected real
    // accounts. BIC is removed: Australian domestic payments do not use one,
    // and SWIFT is only needed for international transfers, so it is optional.
    bank: [
      { key: "bank_name", label: "Bank name", required: true },
      { key: "bank_account_holder", label: "Account name", required: true },
      {
        key: "bank_bsb",
        label: "BSB",
        required: true,
        placeholder: "083-123",
        help: "Six digits. Type it with or without the hyphen.",
        format: "bsb",
      },
      {
        key: "bank_account_number",
        label: "Account number",
        required: true,
        help: "Length varies between banks — enter it exactly as it appears on your statement.",
        format: "digits",
        maxLength: 18,
      },
      {
        key: "bank_swift",
        label: "SWIFT code (optional)",
        help: "Only needed if you are paid from outside Australia.",
        format: "swift",
      },
    ],
  },
  NP: {
    identifiers: [{ key: "national_id_number", label: "Citizenship number", required: true }],
    statutory: [
      { key: "tax_identification_number", label: "PAN (Permanent Account Number)", required: true },
      { key: "provident_fund_number", label: "Provident Fund (SSF/EPF) number" },
    ],
    // Nepal uses a bank + branch + account number, with no BSB and no IBAN.
    // Keeping the field set country-driven is the point of T26 — the AU shape
    // must not be imposed globally.
    bank: [
      { key: "bank_name", label: "Bank name", required: true },
      { key: "bank_account_holder", label: "Account name", required: true },
      { key: "bank_account_number", label: "Account number", required: true, maxLength: 20 },
      { key: "bank_branch_code", label: "Branch name or code", required: true },
      { key: "bank_swift", label: "SWIFT code (optional)", format: "swift" },
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

// ============================================================================
// T26 · Bank field formats
// ============================================================================

/**
 * Normalise a BSB to six digits.
 *
 * An Australian BSB is conventionally written `083-123`, and people type it
 * both ways — with the hyphen, without it, and occasionally with a space. The
 * stored value is always the six digits, so two records for the same branch
 * cannot differ only in punctuation.
 */
export function normaliseBsb(input: string): string {
  return (input ?? "").replace(/[\s-]/g, "");
}

/** Display form of a stored BSB: `083123` → `083-123`. */
export function formatBsb(stored: string): string {
  const digits = normaliseBsb(stored);
  return digits.length === 6 ? `${digits.slice(0, 3)}-${digits.slice(3)}` : stored;
}

/**
 * Why a value is not acceptable for its format, or null when it is.
 *
 * Returns a sentence for a person, not a rule name. Empty is not this
 * function's business — required-ness is checked separately, and reporting
 * "must be six digits" on an untouched field is how a form starts shouting at
 * somebody who has not done anything yet.
 */
export function formatError(format: FieldDef["format"], value: string): string | null {
  const v = (value ?? "").trim();
  if (!v) return null;
  switch (format) {
    case "bsb": {
      const digits = normaliseBsb(v);
      if (!/^\d+$/.test(digits)) return "A BSB is digits only — for example 083-123.";
      if (digits.length !== 6) {
        return `A BSB is exactly six digits; this has ${digits.length}.`;
      }
      return null;
    }
    case "digits":
      // Deliberately no length rule. Account number lengths vary between
      // Australian institutions, and hard-coding nine rejected real accounts.
      return /^\d+$/.test(v.replace(/[\s-]/g, ""))
        ? null
        : "An account number is digits only.";
    case "swift":
      // ISO 9362: 8 or 11 characters, letters and digits.
      return /^[A-Za-z]{4}[A-Za-z]{2}[A-Za-z0-9]{2}([A-Za-z0-9]{3})?$/.test(v)
        ? null
        : "A SWIFT code is 8 or 11 letters and digits — for example CTBAAU2S.";
    default:
      return null;
  }
}

/**
 * Everything wrong with the bank details on this form, keyed by field.
 *
 * Used by the onboarding profile before submit so a bad BSB is caught on the
 * field rather than by the payment file weeks later.
 */
export function validateBankFields(
  countryCode: string | null | undefined,
  values: Record<string, unknown>,
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const field of getCountrySchema(countryCode).bank) {
    if (!field.format) continue;
    const err = formatError(field.format, String(values[field.key] ?? ""));
    if (err) out[field.key] = err;
  }
  return out;
}
