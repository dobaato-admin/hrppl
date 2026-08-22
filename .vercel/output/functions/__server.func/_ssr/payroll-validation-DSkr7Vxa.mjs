const digitsOnly = (s) => s.replace(/\D+/g, "");
function validateTFN(input) {
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
function validateTaxId(input) {
  const v = (input || "").trim();
  if (!v) return { ok: true, value: "" };
  if (v.length < 4 || v.length > 32) return { ok: false, error: "Tax ID must be 4–32 characters" };
  if (!/^[A-Za-z0-9 \-]+$/.test(v)) return { ok: false, error: "Tax ID contains invalid characters" };
  return { ok: true, value: v };
}
function validateBSB(input) {
  const raw = digitsOnly(input || "");
  if (!raw) return { ok: true, value: "" };
  if (raw.length !== 6) return { ok: false, error: "BSB must be 6 digits" };
  return { ok: true, value: `${raw.slice(0, 3)}-${raw.slice(3)}` };
}
function validateBankAccountNumber(input, opts) {
  const raw = digitsOnly(input || "");
  if (!raw) return { ok: false, error: "Account number is required" };
  const min = 4;
  const max = opts?.au ? 12 : 20;
  if (raw.length < min || raw.length > max) {
    return { ok: false, error: `Account number must be ${min}–${max} digits` };
  }
  return { ok: true, value: raw };
}
function validateBankAccountName(input) {
  const v = (input || "").trim();
  if (!v) return { ok: false, error: "Account name is required" };
  if (v.length < 2 || v.length > 120) return { ok: false, error: "Account name must be 2–120 characters" };
  if (!/^[A-Za-z0-9 .,'\-&/]+$/.test(v)) return { ok: false, error: "Account name contains invalid characters" };
  return { ok: true, value: v };
}
function validateSuperMemberNumber(input) {
  const v = (input || "").trim();
  if (!v) return { ok: true, value: "" };
  if (v.length < 4 || v.length > 30) return { ok: false, error: "Member number must be 4–30 characters" };
  if (!/^[A-Za-z0-9 \-]+$/.test(v)) return { ok: false, error: "Member number contains invalid characters" };
  return { ok: true, value: v.toUpperCase() };
}
function validateSuperFundName(input) {
  const v = (input || "").trim();
  if (!v) return { ok: true, value: "" };
  if (v.length > 120) return { ok: false, error: "Fund name is too long" };
  return { ok: true, value: v };
}
function validateContactNumber(input) {
  const v = (input || "").trim();
  if (!v) return { ok: false, error: "Contact number is required" };
  const digits = digitsOnly(v);
  if (digits.length < 6 || digits.length > 15) return { ok: false, error: "Contact number must be 6–15 digits" };
  if (!/^[+0-9 ()\-]+$/.test(v)) return { ok: false, error: "Contact number contains invalid characters" };
  return { ok: true, value: v };
}
function validateInvitationDetails(input, opts) {
  const errors = {};
  const normalized = { ...input };
  const contactRaw = (input.contact_number ?? "").trim();
  if (contactRaw) {
    const contact = validateContactNumber(contactRaw);
    if (!contact.ok) errors.contact_number = contact.error;
    else normalized.contact_number = contact.value;
  } else {
    normalized.contact_number = "";
    if (opts.isAU) errors.contact_number = "Contact number is required";
  }
  const acctNameRaw = (input.bank_account_name ?? "").trim();
  if (acctNameRaw) {
    const acctName = validateBankAccountName(acctNameRaw);
    if (!acctName.ok) errors.bank_account_name = acctName.error;
    else normalized.bank_account_name = acctName.value;
  } else {
    normalized.bank_account_name = "";
    if (opts.isAU) errors.bank_account_name = "Account name is required";
  }
  const acctNumRaw = (input.bank_account_number ?? "").trim();
  if (acctNumRaw) {
    const acctNum = validateBankAccountNumber(acctNumRaw, { au: opts.isAU });
    if (!acctNum.ok) errors.bank_account_number = acctNum.error;
    else normalized.bank_account_number = acctNum.value;
  } else {
    normalized.bank_account_number = "";
  }
  if (opts.isAU) {
    const bsbRaw = (input.bank_bsb ?? "").trim();
    if (bsbRaw) {
      const bsb = validateBSB(bsbRaw);
      if (!bsb.ok) errors.bank_bsb = bsb.error;
      else normalized.bank_bsb = bsb.value;
    } else {
      normalized.bank_bsb = "";
      errors.bank_bsb = "BSB is required";
    }
    const tfn = validateTFN(input.tfn ?? "");
    if (!tfn.ok) errors.tfn = tfn.error;
    else normalized.tfn = tfn.value;
  } else {
    normalized.bank_bsb = (input.bank_bsb ?? "").trim();
    const tax = validateTaxId(input.tfn ?? "");
    if (!tax.ok) errors.tfn = tax.error;
    else normalized.tfn = tax.value;
  }
  const fund = validateSuperFundName(input.super_fund_name ?? "");
  if (!fund.ok) errors.super_fund_name = fund.error;
  else normalized.super_fund_name = fund.value;
  const member = validateSuperMemberNumber(input.super_member_number ?? "");
  if (!member.ok) errors.super_member_number = member.error;
  else normalized.super_member_number = member.value;
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
    if (!nokPhone.ok) errors.next_of_kin_phone = nokPhone.error;
    else normalized.next_of_kin_phone = nokPhone.value;
  } else {
    normalized.next_of_kin_phone = "";
  }
  normalized.next_of_kin_relationship = (input.next_of_kin_relationship ?? "").trim();
  normalized.bank_name = (input.bank_name ?? "").trim();
  void opts.countryCode;
  return { errors, normalized };
}
function validateABN(input) {
  const raw = digitsOnly(input || "");
  if (!raw) return { ok: true, value: "" };
  if (raw.length !== 11) return { ok: false, error: "ABN must be 11 digits" };
  const weights = [10, 1, 3, 5, 7, 9, 11, 13, 15, 17, 19];
  let sum = (Number(raw[0]) - 1) * weights[0];
  for (let i = 1; i < 11; i++) sum += Number(raw[i]) * weights[i];
  if (sum % 89 !== 0) return { ok: false, error: "ABN checksum is invalid" };
  return { ok: true, value: raw };
}
function validateBusinessRegistrationNumber(input, countryCode) {
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
export {
  validateABN,
  validateBSB,
  validateBankAccountName,
  validateBankAccountNumber,
  validateBusinessRegistrationNumber,
  validateContactNumber,
  validateInvitationDetails,
  validateSuperFundName,
  validateSuperMemberNumber,
  validateTFN,
  validateTaxId
};
