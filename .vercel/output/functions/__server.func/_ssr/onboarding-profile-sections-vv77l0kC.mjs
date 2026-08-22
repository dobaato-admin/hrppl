const PROFILE_SECTIONS = {
  identity: {
    label: "Identity",
    requiredFields: ["legal_first_name", "legal_last_name", "date_of_birth", "nationality"]
  },
  address: {
    label: "Address",
    requiredFields: ["address_line1", "city", "country_of_residence"]
  },
  contact: {
    label: "Contact",
    requiredFields: ["personal_phone"]
  },
  emergency_contact: {
    label: "Emergency contact",
    requiredFields: ["emergency_contact_name", "emergency_contact_phone"]
  },
  banking: {
    label: "Banking",
    requiredFields: ["bank_name", "bank_account_holder", "bank_account_number"]
  },
  tax_government: {
    label: "Tax & government IDs",
    requiredFields: ["national_id_number", "tax_identification_number"]
  }
};
function computeCompleteSections(profile) {
  if (!profile) return [];
  const done = [];
  for (const [key, def] of Object.entries(PROFILE_SECTIONS)) {
    if (def.requiredFields.every((f) => !!profile[f] && String(profile[f]).trim() !== "")) {
      done.push(key);
    }
  }
  return done;
}
export {
  PROFILE_SECTIONS,
  computeCompleteSections
};
