// Shared client + server validation for invitation/onboarding payroll fields.
// All validators accept strings as the user types them and return either
// { ok: true, value } (the normalized value to store) or { ok: false, error }.

export type ValidationResult = { ok: true; value: string } | { ok: false; error: string };

const digitsOnly = (s: string) => s.replace(/\D+/g, "");

// ---------- TFN (Australia) — 8 or 9 digits with weighted checksum ----------
// Weights for 9-digit TFN: 1,4,3,7,5,8,6,9,10 — sum % 11 === 0
// Weights for 8-digit TFN: 10,7,8,4,6,3,5,1 — sum % 11 === 0
export function validateTFN(input: string): ValidationResult {
  const raw = digitsOnly(input || "");
  if (!raw) return { ok: true, value: "" };
  if (raw.length !== 8 && raw.length !== 9) {
    return { ok: false, error: "TFN must be 8 or 9 digits" };
  }
  const weights = raw.length === 9 ? [1, 4, 3, 7, 5, 8, 6, 9, 10] : [10, 7, 8, 4, 6, 3, 5, 1];
  let sum = 0;
  for (let i = 0; i < raw.length; i++) sum += Number(raw[i]) * weights[i];
  if (sum % 11 !== 0) return { ok: false, error: "TFN checksum is invalid" };
  return { ok: true, value: raw };
}

// Generic non-AU tax id: alphanumeric (+ dashes/spaces), 4-32 chars.
export function validateTaxId(input: string): ValidationResult {
  const v = (input || "").trim();
  if (!v) return { ok: true, value: "" };
  if (v.length < 4 || v.length > 32) return { ok: false, error: "Tax ID must be 4–32 characters" };
  if (!/^[A-Za-z0-9 \-]+$/.test(v)) return { ok: false, error: "Tax ID contains invalid characters" };
  return { ok: true, value: v };
}

// ---------- BSB (Australia) — 6 digits, stored as XXX-XXX ----------
export function validateBSB(input: string): ValidationResult {
  const raw = digitsOnly(input || "");
  if (!raw) return { ok: true, value: "" };
  if (raw.length !== 6) return { ok: false, error: "BSB must be 6 digits" };
  return { ok: true, value: `${raw.slice(0, 3)}-${raw.slice(3)}` };
}

// ---------- Bank account number — 4–12 digits (AU); generic 4-20 elsewhere ----------
export function validateBankAccountNumber(input: string, opts?: { au?: boolean }): ValidationResult {
  const raw = digitsOnly(input || "");
  if (!raw) return { ok: false, error: "Account number is required" };
  const min = 4;
  const max = opts?.au ? 12 : 20;
  if (raw.length < min || raw.length > max) {
    return { ok: false, error: `Account number must be ${min}–${max} digits` };
  }
  return { ok: true, value: raw };
}

export function validateBankAccountName(input: string): ValidationResult {
  const v = (input || "").trim();
  if (!v) return { ok: false, error: "Account name is required" };
  if (v.length < 2 || v.length > 120) return { ok: false, error: "Account name must be 2–120 characters" };
  if (!/^[A-Za-z0-9 .,'\-&/]+$/.test(v)) return { ok: false, error: "Account name contains invalid characters" };
  return { ok: true, value: v };
}

// ---------- Superannuation / pension member number ----------
// Alphanumeric (+ dashes/spaces), 4-30 chars.
export function validateSuperMemberNumber(input: string): ValidationResult {
  const v = (input || "").trim();
  if (!v) return { ok: true, value: "" };
  if (v.length < 4 || v.length > 30) return { ok: false, error: "Member number must be 4–30 characters" };
  if (!/^[A-Za-z0-9 \-]+$/.test(v)) return { ok: false, error: "Member number contains invalid characters" };
  return { ok: true, value: v.toUpperCase() };
}

export function validateSuperFundName(input: string): ValidationResult {
  const v = (input || "").trim();
  if (!v) return { ok: true, value: "" };
  if (v.length > 120) return { ok: false, error: "Fund name is too long" };
  return { ok: true, value: v };
}

export function validateContactNumber(input: string): ValidationResult {
  const v = (input || "").trim();
  if (!v) return { ok: false, error: "Contact number is required" };
  const digits = digitsOnly(v);
  if (digits.length < 6 || digits.length > 15) return { ok: false, error: "Contact number must be 6–15 digits" };
  if (!/^[+0-9 ()\-]+$/.test(v)) return { ok: false, error: "Contact number contains invalid characters" };
  return { ok: true, value: v };
}

// Validate the whole details payload. Returns { errors, normalized }.
export interface DetailsInput {
  contact_number?: string;
  bank_name?: string;
  bank_bsb?: string;
  bank_account_number?: string;
  bank_account_name?: string;
  tfn?: string;
  super_fund_name?: string;
  super_member_number?: string;
  next_of_kin_name?: string;
  next_of_kin_relationship?: string;
  next_of_kin_phone?: string;
}

export interface DetailsValidationResult {
  errors: Partial<Record<keyof DetailsInput, string>>;
  normalized: DetailsInput;
}

export function validateInvitationDetails(
  input: DetailsInput,
  opts: { isAU: boolean; countryCode?: string },
): DetailsValidationResult {
  const errors: DetailsValidationResult["errors"] = {};
  const normalized: DetailsInput = { ...input };

  const contactRaw = (input.contact_number ?? "").trim();
  if (contactRaw) {
    const contact = validateContactNumber(contactRaw);
    if (!contact.ok) errors.contact_number = contact.error; else normalized.contact_number = contact.value;
  } else {
    normalized.contact_number = "";
    if (opts.isAU) errors.contact_number = "Contact number is required";
  }

  const acctNameRaw = (input.bank_account_name ?? "").trim();
  if (acctNameRaw) {
    const acctName = validateBankAccountName(acctNameRaw);
    if (!acctName.ok) errors.bank_account_name = acctName.error; else normalized.bank_account_name = acctName.value;
  } else {
    normalized.bank_account_name = "";
    if (opts.isAU) errors.bank_account_name = "Account name is required";
  }

  const acctNumRaw = (input.bank_account_number ?? "").trim();
  if (acctNumRaw) {
    const acctNum = validateBankAccountNumber(acctNumRaw, { au: opts.isAU });
    if (!acctNum.ok) errors.bank_account_number = acctNum.error; else normalized.bank_account_number = acctNum.value;
  } else { normalized.bank_account_number = ""; }


  if (opts.isAU) {
    const bsbRaw = (input.bank_bsb ?? "").trim();
    if (bsbRaw) {
      const bsb = validateBSB(bsbRaw);
      if (!bsb.ok) errors.bank_bsb = bsb.error; else normalized.bank_bsb = bsb.value;
    } else {
      normalized.bank_bsb = "";
      errors.bank_bsb = "BSB is required";
    }

    const tfn = validateTFN(input.tfn ?? "");
    if (!tfn.ok) errors.tfn = tfn.error; else normalized.tfn = tfn.value;
  } else {
    normalized.bank_bsb = (input.bank_bsb ?? "").trim();
    const tax = validateTaxId(input.tfn ?? "");
    if (!tax.ok) errors.tfn = tax.error; else normalized.tfn = tax.value;
  }

  const fund = validateSuperFundName(input.super_fund_name ?? "");
  if (!fund.ok) errors.super_fund_name = fund.error; else normalized.super_fund_name = fund.value;

  const member = validateSuperMemberNumber(input.super_member_number ?? "");
  if (!member.ok) errors.super_member_number = member.error; else normalized.super_member_number = member.value;

  if (normalized.super_fund_name && !normalized.super_member_number) {
    errors.super_member_number = errors.super_member_number ?? "Member number is required when a fund is provided";
  }
  if (normalized.super_member_number && !normalized.super_fund_name) {
    errors.super_fund_name = errors.super_fund_name ?? "Fund name is required when a member number is provided";
  }

  const nokName = (input.next_of_kin_name ?? "").trim();
  if (nokName) {
    if (nokName.length > 120) errors.next_of_kin_name = "Name is too long";
    else normalized.next_of_kin_name = nokName;
  } else {
    normalized.next_of_kin_name = "";
    if (opts.isAU) errors.next_of_kin_name = "Next of kin name is required";
  }


  const nokPhoneRaw = (input.next_of_kin_phone ?? "").trim();
  if (nokPhoneRaw) {
    const nokPhone = validateContactNumber(nokPhoneRaw);
    if (!nokPhone.ok) errors.next_of_kin_phone = nokPhone.error; else normalized.next_of_kin_phone = nokPhone.value;
  } else { normalized.next_of_kin_phone = ""; }

  normalized.next_of_kin_relationship = (input.next_of_kin_relationship ?? "").trim();
  normalized.bank_name = (input.bank_name ?? "").trim();
  void opts.countryCode;
  return { errors, normalized };
}

// ---------- ABN (Australia) — 11 digits, weighted checksum ----------
export function validateABN(input: string): ValidationResult {
  const raw = digitsOnly(input || "");
  if (!raw) return { ok: true, value: "" };
  if (raw.length !== 11) return { ok: false, error: "ABN must be 11 digits" };
  const weights = [10, 1, 3, 5, 7, 9, 11, 13, 15, 17, 19];
  let sum = (Number(raw[0]) - 1) * weights[0];
  for (let i = 1; i < 11; i++) sum += Number(raw[i]) * weights[i];
  if (sum % 89 !== 0) return { ok: false, error: "ABN checksum is invalid" };
  return { ok: true, value: raw };
}

// Generic business registration number; country-aware
export function validateBusinessRegistrationNumber(
  input: string,
  countryCode?: string,
): ValidationResult {
  const cc = (countryCode || "").toUpperCase();
  if (cc === "AU") {
    const abn = validateABN(input);
    if (!abn.ok) return abn;
    if (!abn.value) return { ok: false, error: "ABN is required" };
    return abn;
  }
  const v = (input || "").trim();
  if (!v) return { ok: false, error: "Business registration number is required" };
  if (v.length < 3 || v.length > 32) return { ok: false, error: "Registration number must be 3–32 characters" };
  if (!/^[A-Za-z0-9 \-/]+$/.test(v)) return { ok: false, error: "Registration number contains invalid characters" };
  return { ok: true, value: v };
}
