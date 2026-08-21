// A7: profile section definitions for unifying staff_onboarding_profiles
// completeness with onboarding_progress (linked via onboarding_progress.profile_section).
//
// A "section" is a logical group of fields in staff_onboarding_profiles. A
// section is "complete" once every required field for that section is filled.

export type ProfileSectionKey =
  | "identity"
  | "address"
  | "contact"
  | "emergency_contact"
  | "banking"
  | "tax_government";

export const PROFILE_SECTIONS: Record<ProfileSectionKey, {
  label: string;
  requiredFields: string[];
}> = {
  identity: {
    label: "Identity",
    requiredFields: ["legal_first_name", "legal_last_name", "date_of_birth", "nationality"],
  },
  address: {
    label: "Address",
    requiredFields: ["address_line1", "city", "country_of_residence"],
  },
  contact: {
    label: "Contact",
    requiredFields: ["personal_phone"],
  },
  emergency_contact: {
    label: "Emergency contact",
    requiredFields: ["emergency_contact_name", "emergency_contact_phone"],
  },
  banking: {
    label: "Banking",
    requiredFields: ["bank_name", "bank_account_holder", "bank_account_number"],
  },
  tax_government: {
    label: "Tax & government IDs",
    requiredFields: ["national_id_number", "tax_identification_number"],
  },
};

export function computeCompleteSections(profile: Record<string, any> | null | undefined): ProfileSectionKey[] {
  if (!profile) return [];
  const done: ProfileSectionKey[] = [];
  for (const [key, def] of Object.entries(PROFILE_SECTIONS) as Array<[ProfileSectionKey, { requiredFields: string[] }]>) {
    if (def.requiredFields.every((f) => !!profile[f] && String(profile[f]).trim() !== "")) {
      done.push(key);
    }
  }
  return done;
}
