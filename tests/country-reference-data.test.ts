/**
 * T16 / T18 / T26 — country-driven form data.
 *
 * All three tickets are the same defect in three places: a value that depends
 * on the country was hard-coded, or left as free text, for every country.
 *
 * - T16 · State/region was a text box, so one state arrived as "NSW",
 *   "N.S.W." and "New South Wales" from three employees, and every downstream
 *   grouping and payroll-tax split was quietly unreliable.
 * - T18 · Org setup seeded the same three leave types everywhere. Australia's
 *   entitlements are not Nepal's, and 21 days annual / 10 sick matched
 *   neither.
 * - T26 · The bank form had one shape globally, with a BIC field Australian
 *   banks do not use and no BSB at all.
 *
 * The structural requirement common to all three is that another country is a
 * data load, not a code change — which is why the lists live in tables and
 * these tests check behaviour rather than enumerating rows.
 */
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import {
  subdivisionLabel,
  keepSubdivisionForCountry,
  type CountrySubdivision,
} from "@/lib/country-reference.functions";
import {
  getCountrySchema,
  normaliseBsb,
  formatBsb,
  formatError,
  validateBankFields,
} from "@/lib/onboarding-country-fields";

const AU_SUBS: CountrySubdivision[] = [
  { code: "ACT", name: "Australian Capital Territory", kind: "territory" },
  { code: "NSW", name: "New South Wales", kind: "state" },
];
const NP_SUBS: CountrySubdivision[] = [
  { code: "P3", name: "Bagmati", kind: "province" },
];

describe("subdivisionLabel", () => {
  it("uses the country's own word", () => {
    expect(subdivisionLabel(NP_SUBS)).toBe("Province");
  });

  it("says 'State or territory' for Australia, which has both", () => {
    // Not decoration: long service leave and payroll tax are administered
    // separately by each, so the distinction is load-bearing.
    expect(subdivisionLabel(AU_SUBS)).toBe("State or territory");
  });

  it("falls back to the generic label when there is no list", () => {
    expect(subdivisionLabel([])).toBe("State / Province / Region");
  });
});

describe("keepSubdivisionForCountry", () => {
  it("drops a value the new country does not have", () => {
    // "NSW" left sitting in the field after switching to Nepal is a wrong
    // answer that looks like an answered question.
    expect(keepSubdivisionForCountry("NSW", NP_SUBS)).toBe("");
  });

  it("keeps a value the new country does have", () => {
    expect(keepSubdivisionForCountry("NSW", AU_SUBS)).toBe("NSW");
  });

  it("keeps free text for a country with no list", () => {
    // Launch coverage is AU and NP. Wiping what somebody just typed because
    // we have no list for their country would be the worse failure.
    expect(keepSubdivisionForCountry("Nord-Pas-de-Calais", [])).toBe("Nord-Pas-de-Calais");
  });

  it("is a no-op on an empty value", () => {
    expect(keepSubdivisionForCountry("", AU_SUBS)).toBe("");
  });
});

describe("T26 · Australian bank details", () => {
  const au = getCountrySchema("AU");
  const keys = au.bank.map((f) => f.key);

  it("asks for BSB and account name", () => {
    expect(keys).toContain("bank_bsb");
    expect(au.bank.find((f) => f.key === "bank_account_holder")?.label).toBe("Account name");
  });

  it("has no BIC field — Australian banks do not use one", () => {
    const labels = au.bank.map((f) => f.label).join(" ");
    expect(labels).not.toMatch(/\bBIC\b/);
  });

  it("makes SWIFT optional", () => {
    expect(au.bank.find((f) => f.key === "bank_swift")?.required).toBeFalsy();
  });

  it("does not fix the account number at nine digits", () => {
    // Lengths vary between institutions; a hard nine rejects real accounts.
    const acct = au.bank.find((f) => f.key === "bank_account_number");
    expect(acct?.required).toBe(true);
    expect(acct?.maxLength ?? 0).toBeGreaterThan(9);
  });

  it("does not impose the AU shape on other countries", () => {
    expect(getCountrySchema("NP").bank.map((f) => f.key)).not.toContain("bank_bsb");
    expect(getCountrySchema("GB").bank.map((f) => f.key)).not.toContain("bank_bsb");
    expect(getCountrySchema("DE").bank.map((f) => f.key)).toContain("bank_iban");
  });

  it("Nepal gets bank, account and branch — no BSB, no IBAN", () => {
    const np = getCountrySchema("NP").bank.map((f) => f.key);
    expect(np).toContain("bank_branch_code");
    expect(np).not.toContain("bank_iban");
  });
});

describe("BSB handling", () => {
  it("normalises to six digits however it was typed", () => {
    // Two records for the same branch must not differ only in punctuation.
    for (const typed of ["083-123", "083123", "083 123", " 083-123 "]) {
      expect(normaliseBsb(typed)).toBe("083123");
    }
  });

  it("displays in the conventional XXX-XXX form", () => {
    expect(formatBsb("083123")).toBe("083-123");
  });

  it("leaves a value it cannot format alone rather than mangling it", () => {
    expect(formatBsb("83")).toBe("83");
  });

  it("accepts six digits with or without the hyphen", () => {
    expect(formatError("bsb", "083-123")).toBeNull();
    expect(formatError("bsb", "083123")).toBeNull();
  });

  it("rejects the wrong number of digits, and says how many there are", () => {
    expect(formatError("bsb", "08312")).toMatch(/six digits.*5/);
    expect(formatError("bsb", "0831234")).toMatch(/six digits.*7/);
  });

  it("rejects letters", () => {
    expect(formatError("bsb", "08A123")).toMatch(/digits only/);
  });

  it("says nothing about an empty field", () => {
    // Required-ness is checked separately. Shouting "must be six digits" at
    // somebody who has not typed anything yet is how a form becomes hostile.
    expect(formatError("bsb", "")).toBeNull();
    expect(formatError("bsb", "   ")).toBeNull();
  });
});

describe("SWIFT and account-number formats", () => {
  it("accepts an 8- or 11-character SWIFT", () => {
    expect(formatError("swift", "CTBAAU2S")).toBeNull();
    expect(formatError("swift", "CTBAAU2S123")).toBeNull();
  });

  it("rejects one of the wrong length", () => {
    expect(formatError("swift", "CTBAAU")).toMatch(/8 or 11/);
  });

  it("accepts an account number of any length", () => {
    expect(formatError("digits", "12345")).toBeNull();
    expect(formatError("digits", "123456789012")).toBeNull();
    expect(formatError("digits", "12-345-678")).toBeNull();
  });

  it("rejects a non-numeric account number", () => {
    expect(formatError("digits", "12345X")).toMatch(/digits only/);
  });
});

describe("validateBankFields", () => {
  it("reports each bad field, in the order they are rendered", () => {
    const errs = validateBankFields("AU", {
      bank_name: "CBA",
      bank_account_holder: "A Person",
      bank_bsb: "12345",
      bank_account_number: "abc",
      bank_swift: "",
    });
    expect(Object.keys(errs)).toEqual(["bank_bsb", "bank_account_number"]);
  });

  it("passes a well-formed Australian account", () => {
    expect(
      validateBankFields("AU", {
        bank_bsb: "083-123",
        bank_account_number: "123456789",
        bank_swift: "CTBAAU2S",
      }),
    ).toEqual({});
  });

  it("checks nothing for a country whose fields carry no format", () => {
    expect(validateBankFields("DE", { bank_iban: "not an iban" })).toEqual({});
  });
});

describe("the reference data is data, not code", () => {
  const migration = readFileSync(
    "supabase/migrations/20260911090000_country_reference_data.sql",
    "utf8",
  );

  it("seeds all eight Australian states and territories", () => {
    for (const code of ["ACT", "NSW", "NT", "QLD", "SA", "TAS", "VIC", "WA"]) {
      expect(migration).toContain(`'${code}'`);
    }
  });

  it("seeds Nepal's seven provinces", () => {
    for (const code of ["P1", "P2", "P3", "P4", "P5", "P6", "P7"]) {
      expect(migration).toContain(`'${code}'`);
    }
  });

  it("carries no tenant_id — this is shared reference data", () => {
    // Comments stripped first: the migration's own header says these tables
    // "carry no tenant_id and must never be given one", which a naive scan
    // reads as an occurrence.
    const codeOnly = migration
      .split("\n")
      .filter((l) => !l.trimStart().startsWith("--"))
      .join("\n");
    const tables = codeOnly.slice(0, codeOnly.indexOf("INSERT INTO"));
    expect(tables).not.toMatch(/tenant_id/);
  });

  it("is readable by any authenticated user and writable only by the platform", () => {
    expect(migration).toMatch(/FOR SELECT TO authenticated USING \(true\)/);
    expect(migration).toMatch(/has_role\(\( SELECT auth\.uid\(\) \), 'super_admin'\)/);
  });

  it("re-runs safely", () => {
    // The Management API is not transactional across statements, so every
    // migration here has to be its own recovery.
    expect(migration).toMatch(/CREATE TABLE IF NOT EXISTS/);
    expect(migration).toMatch(/ON CONFLICT \(country_code, code\) DO NOTHING/);
    expect(migration).toMatch(/DROP POLICY IF EXISTS/);
  });
});

describe("seedOrgDefaults reads the catalogue", () => {
  const src = readFileSync("src/lib/org-signup.functions.ts", "utf8");
  const fn = src.slice(
    src.indexOf("export const seedOrgDefaults"),
    src.indexOf("// ---------- resetMyOrgSetup"),
  );

  it("selects leave types for the tenant's own country", () => {
    expect(fn).toMatch(/country_leave_defaults/);
    expect(fn).toMatch(/\.eq\("country_code", countryCode\)/);
  });

  it("defaults to the country's standard set when no codes are given", () => {
    // An older client that only sends `withLeaveTypes` must behave as before.
    expect(fn).toMatch(/wanted \? wanted\.has\(String\(row\.code\)\.toUpperCase\(\)\) : row\.is_standard/);
  });

  it("honours an explicitly empty selection rather than seeding anyway", () => {
    // Unticking everything and "not being asked" are different answers.
    expect(fn).toMatch(/wanted && wanted\.size === 0/);
  });

  it("still creates something for a country with no catalogue rows", () => {
    expect(fn).toMatch(/code: "ANNUAL"/);
  });

  it("does not report success when the insert failed", () => {
    expect(fn).toMatch(/Could not create the leave types/);
  });
});
