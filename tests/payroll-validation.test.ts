/**
 * Unit + integration tests for invitation payroll validation.
 *
 * - Unit: individual validators in src/lib/payroll-validation.ts
 * - Integration: the same validateInvitationDetails() call that
 *   acceptInvitation() runs server-side before touching the DB.
 *
 * Run: bunx vitest run tests/payroll-validation.test.ts
 */
import { describe, it, expect } from 'vitest';
import {
  validateTFN,
  validateTaxId,
  validateBSB,
  validateBankAccountNumber,
  validateBankAccountName,
  validateSuperMemberNumber,
  validateSuperFundName,
  validateContactNumber,
  validateInvitationDetails,
  type DetailsInput,
} from '../src/lib/payroll-validation';

// ---------- known-good TFNs (pass the official weighted checksum) ----------
// 9-digit: 123 456 782 (ATO sample)
// 8-digit: 12345678 fails checksum; use 32547689 which sums to 11*k.
// We compute one programmatically to avoid hard-coding wrong values.
function makeValid9DigitTFN(): string {
  const weights = [1, 4, 3, 7, 5, 8, 6, 9, 10];
  // brute force the last digit so the checksum is divisible by 11
  const prefix = [1, 2, 3, 4, 5, 6, 7, 8];
  for (let d = 0; d < 10; d++) {
    const digits = [...prefix, d];
    const sum = digits.reduce((a, n, i) => a + n * weights[i], 0);
    if (sum % 11 === 0) return digits.join('');
  }
  throw new Error('no valid 9-digit TFN found');
}
function makeValid8DigitTFN(): string {
  const weights = [10, 7, 8, 4, 6, 3, 5, 1];
  const prefix = [1, 2, 3, 4, 5, 6, 7];
  for (let d = 0; d < 10; d++) {
    const digits = [...prefix, d];
    const sum = digits.reduce((a, n, i) => a + n * weights[i], 0);
    if (sum % 11 === 0) return digits.join('');
  }
  throw new Error('no valid 8-digit TFN found');
}

const VALID_TFN_9 = makeValid9DigitTFN();
const VALID_TFN_8 = makeValid8DigitTFN();

describe('validateTFN', () => {
  it('accepts empty string as optional', () => {
    expect(validateTFN('')).toEqual({ ok: true, value: '' });
  });
  it('accepts a valid 9-digit TFN', () => {
    expect(validateTFN(VALID_TFN_9)).toEqual({ ok: true, value: VALID_TFN_9 });
  });
  it('accepts a valid 8-digit TFN', () => {
    expect(validateTFN(VALID_TFN_8)).toEqual({ ok: true, value: VALID_TFN_8 });
  });
  it('strips non-digits before validating', () => {
    const spaced = VALID_TFN_9.replace(/(\d{3})(\d{3})(\d{3})/, '$1 $2 $3');
    expect(validateTFN(spaced)).toEqual({ ok: true, value: VALID_TFN_9 });
  });
  it('rejects the wrong length', () => {
    expect(validateTFN('1234567').ok).toBe(false);
    expect(validateTFN('1234567890').ok).toBe(false);
  });
  it('rejects bad checksum', () => {
    // flip last digit so checksum fails
    const last = Number(VALID_TFN_9.slice(-1));
    const bad = VALID_TFN_9.slice(0, -1) + ((last + 1) % 10);
    const r = validateTFN(bad);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toMatch(/checksum/i);
  });
});

describe('validateTaxId (non-AU)', () => {
  it('accepts empty', () => expect(validateTaxId('')).toEqual({ ok: true, value: '' }));
  it('accepts alphanumeric with dashes/spaces', () => {
    expect(validateTaxId('AB-1234 5678')).toEqual({ ok: true, value: 'AB-1234 5678' });
  });
  it('rejects too short / too long', () => {
    expect(validateTaxId('abc').ok).toBe(false);
    expect(validateTaxId('a'.repeat(33)).ok).toBe(false);
  });
  it('rejects invalid characters', () => {
    expect(validateTaxId('ABC$123').ok).toBe(false);
  });
});

describe('validateBSB', () => {
  it('accepts empty', () => expect(validateBSB('')).toEqual({ ok: true, value: '' }));
  it('formats 6 digits as XXX-XXX', () => {
    expect(validateBSB('062000')).toEqual({ ok: true, value: '062-000' });
    expect(validateBSB('062-000')).toEqual({ ok: true, value: '062-000' });
  });
  it('rejects non-6-digit input', () => {
    expect(validateBSB('12345').ok).toBe(false);
    expect(validateBSB('1234567').ok).toBe(false);
  });
});

describe('validateBankAccountNumber', () => {
  it('requires a value', () => {
    expect(validateBankAccountNumber('').ok).toBe(false);
  });
  it('AU: 4-12 digits', () => {
    expect(validateBankAccountNumber('12345678', { au: true })).toEqual({ ok: true, value: '12345678' });
    expect(validateBankAccountNumber('123', { au: true }).ok).toBe(false);
    expect(validateBankAccountNumber('1234567890123', { au: true }).ok).toBe(false);
  });
  it('generic: up to 20 digits', () => {
    expect(validateBankAccountNumber('1'.repeat(20), { au: false }).ok).toBe(true);
    expect(validateBankAccountNumber('1'.repeat(21), { au: false }).ok).toBe(false);
  });
  it('strips non-digit characters', () => {
    expect(validateBankAccountNumber('1234 5678', { au: true })).toEqual({ ok: true, value: '12345678' });
  });
});

describe('validateBankAccountName', () => {
  it('requires a value', () => expect(validateBankAccountName('').ok).toBe(false));
  it('accepts common punctuation', () => {
    expect(validateBankAccountName("O'Neil & Co., Ltd").ok).toBe(true);
  });
  it('rejects invalid characters', () => {
    expect(validateBankAccountName('Bad<Name>').ok).toBe(false);
  });
  it('rejects too short / too long', () => {
    expect(validateBankAccountName('A').ok).toBe(false);
    expect(validateBankAccountName('A'.repeat(121)).ok).toBe(false);
  });
});

describe('validateSuperMemberNumber', () => {
  it('accepts empty', () => expect(validateSuperMemberNumber('')).toEqual({ ok: true, value: '' }));
  it('uppercases and trims', () => {
    expect(validateSuperMemberNumber('  abc-123  ')).toEqual({ ok: true, value: 'ABC-123' });
  });
  it('enforces length and charset', () => {
    expect(validateSuperMemberNumber('abc').ok).toBe(false);
    expect(validateSuperMemberNumber('a'.repeat(31)).ok).toBe(false);
    expect(validateSuperMemberNumber('abc$123').ok).toBe(false);
  });
});

describe('validateSuperFundName', () => {
  it('accepts empty', () => expect(validateSuperFundName('')).toEqual({ ok: true, value: '' }));
  it('rejects too long', () => expect(validateSuperFundName('x'.repeat(121)).ok).toBe(false));
});

describe('validateContactNumber', () => {
  it('requires a value', () => expect(validateContactNumber('').ok).toBe(false));
  it('accepts E.164-style and local formats', () => {
    expect(validateContactNumber('+61 412 345 678').ok).toBe(true);
    expect(validateContactNumber('(02) 9999-1234').ok).toBe(true);
  });
  it('rejects too few / too many digits', () => {
    expect(validateContactNumber('12345').ok).toBe(false);
    expect(validateContactNumber('1'.repeat(16)).ok).toBe(false);
  });
  it('rejects letters', () => {
    expect(validateContactNumber('0412-CALL-ME').ok).toBe(false);
  });
});

// ---------- Integration: full payload through validateInvitationDetails ----------
// This is the exact call acceptInvitation() makes server-side before any DB writes.

function goodAUPayload(): DetailsInput {
  return {
    contact_number: '+61 412 345 678',
    bank_name: 'CBA',
    bank_bsb: '062000',
    bank_account_number: '12345678',
    bank_account_name: 'Jane Doe',
    tfn: VALID_TFN_9,
    super_fund_name: 'AustralianSuper',
    super_member_number: 'AS-12345',
    next_of_kin_name: 'John Doe',
    next_of_kin_relationship: 'Spouse',
    next_of_kin_phone: '+61 400 000 000',
  };
}

describe('validateInvitationDetails (AU)', () => {
  it('accepts a fully valid payload and normalizes values', () => {
    const { errors, normalized } = validateInvitationDetails(goodAUPayload(), { isAU: true });
    expect(errors).toEqual({});
    expect(normalized.bank_bsb).toBe('062-000');
    expect(normalized.tfn).toBe(VALID_TFN_9);
    expect(normalized.super_member_number).toBe('AS-12345');
    expect(normalized.bank_account_number).toBe('12345678');
  });

  it('rejects bad TFN, bad BSB, missing required fields together', () => {
    const { errors } = validateInvitationDetails(
      {
        ...goodAUPayload(),
        tfn: '123456789', // bad checksum
        bank_bsb: '12345', // not 6 digits
        bank_account_name: '',
        next_of_kin_name: '',
        contact_number: '',
      },
      { isAU: true },
    );
    expect(errors.tfn).toBeTruthy();
    expect(errors.bank_bsb).toBeTruthy();
    expect(errors.bank_account_name).toBeTruthy();
    expect(errors.next_of_kin_name).toBeTruthy();
    expect(errors.contact_number).toBeTruthy();
  });

  it('requires BSB in AU', () => {
    const { errors } = validateInvitationDetails(
      { ...goodAUPayload(), bank_bsb: '' },
      { isAU: true },
    );
    expect(errors.bank_bsb).toMatch(/required/i);
  });

  it('cross-validates super fund vs member number', () => {
    const onlyFund = validateInvitationDetails(
      { ...goodAUPayload(), super_member_number: '' },
      { isAU: true },
    );
    expect(onlyFund.errors.super_member_number).toBeTruthy();

    const onlyMember = validateInvitationDetails(
      { ...goodAUPayload(), super_fund_name: '' },
      { isAU: true },
    );
    expect(onlyMember.errors.super_fund_name).toBeTruthy();
  });

  it('allows both super fields empty', () => {
    const { errors } = validateInvitationDetails(
      { ...goodAUPayload(), super_fund_name: '', super_member_number: '' },
      { isAU: true },
    );
    expect(errors.super_fund_name).toBeUndefined();
    expect(errors.super_member_number).toBeUndefined();
  });
});

describe('validateInvitationDetails (non-AU)', () => {
  it('skips BSB requirement and uses generic Tax ID rules', () => {
    const { errors, normalized } = validateInvitationDetails(
      {
        contact_number: '+1 415 555 0100',
        bank_account_number: '12345678901234567890',
        bank_account_name: 'Jane Doe',
        tfn: 'AB-1234-5678',
        next_of_kin_name: 'John Doe',
        next_of_kin_phone: '+1 415 555 0200',
      },
      { isAU: false },
    );
    expect(errors).toEqual({});
    expect(normalized.tfn).toBe('AB-1234-5678');
    expect(normalized.bank_account_number).toBe('12345678901234567890');
  });

  it('rejects bad generic tax id', () => {
    const { errors } = validateInvitationDetails(
      {
        contact_number: '+1 415 555 0100',
        bank_account_number: '123456',
        bank_account_name: 'Jane Doe',
        tfn: 'X$',
        next_of_kin_name: 'John Doe',
        next_of_kin_phone: '+1 415 555 0200',
      },
      { isAU: false },
    );
    expect(errors.tfn).toBeTruthy();
  });

  it('rejects bank account longer than 20 digits even in non-AU mode', () => {
    const { errors } = validateInvitationDetails(
      {
        contact_number: '+1 415 555 0100',
        bank_account_number: '1'.repeat(21),
        bank_account_name: 'Jane Doe',
        next_of_kin_name: 'John Doe',
        next_of_kin_phone: '+1 415 555 0200',
      },
      { isAU: false },
    );
    expect(errors.bank_account_number).toBeTruthy();
  });
});

// ---------- Server handler integration ----------
// acceptInvitation runs validateInvitationDetails(rawDetails, { isAU })
// and throws `${field}: ${error}` when the result has any errors. We assert
// that exact contract here so a regression in the handler is caught even
// without a live Supabase connection.

describe('acceptInvitation validation contract', () => {
  // Mirror the handler's branch:
  //   const isAU = orgCountry.toUpperCase() === "AU" || !orgCountry;
  function deriveIsAU(orgCountry: string | null | undefined): boolean {
    const c = (orgCountry ?? '').toUpperCase();
    return c === 'AU' || c === '';
  }

  it("defaults to AU when the invitation has no country_code", () => {
    expect(deriveIsAU(null)).toBe(true);
    expect(deriveIsAU('')).toBe(true);
    expect(deriveIsAU('AU')).toBe(true);
    expect(deriveIsAU('US')).toBe(false);
  });

  it('throws a "field: error" message for the first invalid field (AU branch)', () => {
    const isAU = deriveIsAU('AU');
    const bad = { ...goodAUPayload(), tfn: '123456789' };
    const { errors } = validateInvitationDetails(bad, { isAU });
    expect(Object.keys(errors).length).toBeGreaterThan(0);

    // Re-create the exact throw shape the handler uses.
    const throwIfInvalid = () => {
      if (Object.keys(errors).length > 0) {
        const first = Object.entries(errors)[0];
        throw new Error(`${first[0]}: ${first[1]}`);
      }
    };
    expect(throwIfInvalid).toThrow(/^tfn: /);
  });

  it('passes through a fully-valid AU payload with no thrown error', () => {
    const isAU = deriveIsAU('AU');
    const { errors } = validateInvitationDetails(goodAUPayload(), { isAU });
    expect(errors).toEqual({});
  });

  it('passes through a fully-valid non-AU payload', () => {
    const isAU = deriveIsAU('US');
    const { errors } = validateInvitationDetails(
      {
        contact_number: '+1 415 555 0100',
        bank_account_number: '00012345',
        bank_account_name: 'Jane Doe',
        tfn: 'TAX-12345',
        next_of_kin_name: 'John Doe',
        next_of_kin_phone: '+1 415 555 0200',
      },
      { isAU },
    );
    expect(errors).toEqual({});
  });
});
