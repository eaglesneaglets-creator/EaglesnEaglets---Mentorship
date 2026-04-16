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
   * Upload profile/display picture
   * @param {File} file - Image file to upload
   */
  uploadPicture: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.upload('/auth/upload/picture/', formData);
  },

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

export const MENTORSHIP_TYPES = [
  { value: 'career_growth', label: 'Career Growth' },
  { value: 'leadership', label: 'Leadership Development' },
  { value: 'entrepreneurship', label: 'Entrepreneurship' },
  { value: 'technology', label: 'Technology Skills' },
  { value: 'personal_development', label: 'Personal Development' },
  { value: 'spirituality', label: 'Spirituality' },
];

export const MARITAL_STATUS_OPTIONS = [
  { value: 'single', label: 'Single' },
  { value: 'married', label: 'Married' },
  { value: 'divorced', label: 'Divorced' },
  { value: 'widowed', label: 'Widowed' },
];

export const EMPLOYMENT_STATUS_OPTIONS = [
  { value: 'employed', label: 'Employed' },
  { value: 'self_employed', label: 'Self-Employed' },
  { value: 'student', label: 'Student' },
  { value: 'unemployed', label: 'Unemployed' },
];

export const COUNTRY_OPTIONS = [
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

export default profileService;
