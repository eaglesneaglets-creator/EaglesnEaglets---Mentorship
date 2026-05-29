/**
 * KYC onboarding draft persistence (sessionStorage).
 *
 * The wizard saves a draft on every change and restores it on mount so a
 * refresh — or navigating away to read the Code of Conduct / Privacy Policy
 * and coming back — does not wipe the user's input.
 *
 * Note: sessionStorage is per-tab and cleared on tab close. For cross-device /
 * cross-session persistence a backend draft endpoint would be required (see
 * useAutosave) — not yet wired for KYC.
 */

export const KYC_DRAFT_KEY = (role) => `kyc-draft-${role}`;

/** A value worth restoring from a draft — i.e. the user actually filled it. */
const isMeaningful = (v) => {
  if (Array.isArray(v)) return v.length > 0;
  if (typeof v === 'string') return v.trim().length > 0;
  if (typeof v === 'boolean') return v === true;
  if (typeof v === 'number') return true;
  return v != null;
};

/**
 * Overlay a saved draft on top of the current form values.
 *
 * Only meaningful draft values win, so an empty draft slot never blanks a
 * value the parent prefilled (e.g. `full_name` from the user record).
 */
export const mergeKycDraft = (current = {}, draft = {}) => {
  const out = { ...current };
  for (const [key, value] of Object.entries(draft)) {
    if (isMeaningful(value)) out[key] = value;
  }
  return out;
};

export const loadDraft = (role) => {
  try {
    const raw = sessionStorage.getItem(KYC_DRAFT_KEY(role));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const saveDraft = (role, values) => {
  try {
    sessionStorage.setItem(KYC_DRAFT_KEY(role), JSON.stringify(values));
    return true;
  } catch {
    return false; // quota / private browsing
  }
};

export const clearDraft = (role) => {
  try {
    sessionStorage.removeItem(KYC_DRAFT_KEY(role));
  } catch {
    /* ignore */
  }
};
