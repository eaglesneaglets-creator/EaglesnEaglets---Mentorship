/**
 * Profile Service
 * API calls for profile/KYC management (both mentors and mentees)
 */

import { apiClient } from '@api';

export const profileService = {
  // =========================================================================
  // MENTOR PROFILE
  // =========================================================================

  /**
   * Get mentor profile/KYC data
   */
  getMentorProfile: () =>
    apiClient.get('/auth/mentor-profile/'),

  /**
   * Update mentor profile/KYC data
   * @param {Object} data - Profile data to update
   */
  updateMentorProfile: (data) =>
    apiClient.patch('/auth/mentor-profile/', data),

  // =========================================================================
  // MENTEE PROFILE
  // =========================================================================

  /**
   * Get mentee profile/KYC data
   */
  getMenteeProfile: () =>
    apiClient.get('/auth/mentee-profile/'),

  /**
   * Update mentee profile/KYC data
   * @param {Object} data - Profile data to update
   */
  updateMenteeProfile: (data) =>
    apiClient.patch('/auth/mentee-profile/', data),

  // =========================================================================
  // COMMON ACTIONS
  // =========================================================================

  /**
   * Submit profile for admin review (works for both roles)
   */
  submitProfile: () =>
    apiClient.post('/auth/profile/submit/'),

  /**
   * Upload the KYC display picture.
   *
   * NOTE: this is the KYC/verification photo — the backend BLOCKS it once
   * `kyc.status` is approved/submitted/under_review (an intentional Phase 21
   * immutability contract). Used by the KYC wizard. For the editable profile
   * avatar use `uploadAvatar()` below.
   * @param {File} file - Image file to upload
   */
  uploadPicture: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.upload('/auth/upload/picture/', formData);
  },

  /**
   * Upload the PROFILE avatar (Phase 32).
   *
   * Distinct from `uploadPicture` above: no KYC gate, so a fully-onboarded user
   * can change their photo at any time. Writes User.profile_picture_url.
   * @param {File} file - Image file (jpg/png/webp)
   */
  uploadAvatar: (file) => {
    const formData = new FormData();
    formData.append('avatar', file);
    return apiClient.upload('/auth/me/avatar/', formData);
  },

  /**
   * Remove the profile avatar (Phase 32).
   * The returned `avatar_url` may be a fallback (e.g. the KYC photo) rather
   * than null — the server decides, the client just renders what comes back.
   */
  removeAvatar: () => apiClient.delete('/auth/me/avatar/'),

  /**
   * Upload CV document
   * @param {File} file - CV file to upload (PDF or DOCX)
   */
  uploadCV: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.upload('/auth/upload/cv/', formData);
  },

  // =========================================================================
  // MENTOR AVAILABILITY
  // =========================================================================

  /** Get current mentor's availability slots */
  getAvailability: () =>
    apiClient.get('/auth/me/availability/'),

  /** Add a new availability slot — { day_of_week, start_time, end_time } */
  addAvailabilitySlot: (slot) =>
    apiClient.post('/auth/me/availability/', slot),

  /** Delete an availability slot by id */
  removeAvailabilitySlot: (slotId) =>
    apiClient.delete(`/auth/me/availability/${slotId}/`),
};

// =========================================================================
// CONSTANTS FOR PROFILE FORMS
// =========================================================================

const MENTORSHIP_TYPES = [
  { value: 'career_growth', label: 'Career Growth' },
  { value: 'leadership', label: 'Leadership Development' },
  { value: 'entrepreneurship', label: 'Entrepreneurship' },
  { value: 'technology', label: 'Technology Skills' },
  { value: 'personal_development', label: 'Personal Development' },
  { value: 'spirituality', label: 'Spirituality' },
];

const MARITAL_STATUS_OPTIONS = [
  { value: 'single', label: 'Single' },
  { value: 'married', label: 'Married' },
  { value: 'divorced', label: 'Divorced' },
  { value: 'widowed', label: 'Widowed' },
];

const EMPLOYMENT_STATUS_OPTIONS = [
  { value: 'employed', label: 'Employed' },
  { value: 'self_employed', label: 'Self-Employed' },
  { value: 'student', label: 'Student' },
  { value: 'unemployed', label: 'Unemployed' },
];

const COUNTRY_OPTIONS = [
  { value: 'GH', label: 'Ghana' },
  { value: 'NG', label: 'Nigeria' },
  { value: 'KE', label: 'Kenya' },
  { value: 'ZA', label: 'South Africa' },
  { value: 'TZ', label: 'Tanzania' },
  { value: 'UG', label: 'Uganda' },
  { value: 'RW', label: 'Rwanda' },
  { value: 'ET', label: 'Ethiopia' },
  { value: 'US', label: 'United States' },
  { value: 'GB', label: 'United Kingdom' },
  { value: 'CA', label: 'Canada' },
  { value: 'OTHER', label: 'Other' },
];
