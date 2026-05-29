import { describe, it, expect, beforeEach } from 'vitest';
import {
  mergeKycDraft,
  loadDraft,
  saveDraft,
  clearDraft,
  KYC_DRAFT_KEY,
} from '../kyc-draft';

describe('mergeKycDraft', () => {
  it('restores user-entered draft values over empty defaults', () => {
    const defaults = { full_name: '', national_id_number: '', mentorship_types: [] };
    const draft = { full_name: 'Daniel Oppong', national_id_number: 'A12345678', mentorship_types: ['career'] };
    expect(mergeKycDraft(defaults, draft)).toEqual({
      full_name: 'Daniel Oppong',
      national_id_number: 'A12345678',
      mentorship_types: ['career'],
    });
  });

  it('does NOT blank a prefilled default when the draft slot is empty', () => {
    // Regression: parent prefills full_name; a draft saved before the user typed
    // it must not wipe the prefilled value.
    const defaults = { full_name: 'Prefilled Name', phone_number: '' };
    const draft = { full_name: '', phone_number: '+1 555 0100' };
    expect(mergeKycDraft(defaults, draft)).toEqual({
      full_name: 'Prefilled Name',
      phone_number: '+1 555 0100',
    });
  });

  it('treats whitespace-only and empty arrays as not meaningful', () => {
    const defaults = { bio: 'keep me', mentorship_types: ['x'] };
    const draft = { bio: '   ', mentorship_types: [] };
    expect(mergeKycDraft(defaults, draft)).toEqual({
      bio: 'keep me',
      mentorship_types: ['x'],
    });
  });

  it('restores a checked consent boolean but ignores unchecked', () => {
    expect(mergeKycDraft({ agree: false }, { agree: true })).toEqual({ agree: true });
    expect(mergeKycDraft({ agree: true }, { agree: false })).toEqual({ agree: true });
  });
});

describe('draft persistence round-trip', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it('saves and loads a draft by role', () => {
    saveDraft('mentor', { full_name: 'Eagle One' });
    expect(loadDraft('mentor')).toEqual({ full_name: 'Eagle One' });
    expect(sessionStorage.getItem(KYC_DRAFT_KEY('mentor'))).toBeTruthy();
  });

  it('returns null when no draft exists', () => {
    expect(loadDraft('eaglet')).toBeNull();
  });

  it('clears a draft', () => {
    saveDraft('mentor', { full_name: 'Eagle One' });
    clearDraft('mentor');
    expect(loadDraft('mentor')).toBeNull();
  });
});
