// Per-tab session flag — once MFA is verified for the current sign-in, skip
// re-prompting until the user signs out or closes the tab.
const KEY = "hrppl.mfa.verifiedAt";
export const MFA_STATUS_EVENT = "hrppl:mfa-status-changed";

function emitChange() {
  try {
    window.dispatchEvent(new CustomEvent(MFA_STATUS_EVENT));
  } catch {
    /* ignore */
  }
}

export function setMfaSessionVerified() {
  try {
    sessionStorage.setItem(KEY, String(Date.now()));
  } catch {
    /* ignore */
  }
  emitChange();
}

export function clearMfaSessionVerified() {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
  emitChange();
}

export function notifyMfaStatusChanged() {
  emitChange();
}

export function isMfaSessionVerified(): boolean {
  try {
    const v = sessionStorage.getItem(KEY);
    return !!v;
  } catch {
    return false;
  }
}

