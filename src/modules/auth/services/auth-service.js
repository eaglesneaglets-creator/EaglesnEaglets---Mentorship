/**
 * Authentication Service
 * API calls for authentication and user management
 */

import { apiClient } from '@api';

export const authService = {
  /**
   * Register a new user
   * @param {Object} data - Registration data
   */
  register: (data) =>
    apiClient.post('/auth/register/', data, { skipAuth: true }),

  /**
   * Login user
   * @param {string} email - User email
   * @param {string} password - User password
   */
  login: (email, password) =>
    apiClient.post('/auth/login/', { email, password }, { skipAuth: true }),

  /**
   * Get Google OAuth login URL
   * @param {string} role - User role (eagle/eaglet)
   */
  getGoogleAuthUrl: (role) =>
    apiClient.get(`/auth/google/login/?role=${role}`, { skipAuth: true }),

  /**
   * Handle Google OAuth callback
   * @param {string} code - Authorization code from Google
   * @param {string} state - OAuth state parameter (contains nonce + role, base64-encoded)
   */
  googleCallback: (code, state) =>
    apiClient.post('/auth/google/callback/', { code, state }, { skipAuth: true }),

  /**
   * Logout user — backend blacklists refresh token from httpOnly cookie.
   */
  logout: () =>
    apiClient.post('/auth/logout/', {}),

  /**
   * Refresh access token — relies on httpOnly refresh_token cookie.
   * Prefer importing refreshAccessToken() from api/index.js directly.
   */
  refreshToken: () =>
    apiClient.post('/auth/token/refresh/', {}, { skipAuth: true }),

  /**
   * Verify email with token
   * @param {string} token - Email verification token
   */
  verifyEmail: (token) =>
    apiClient.post('/auth/email/verify/', { token }, { skipAuth: true }),

  /**
   * Resend verification email
   * @param {string} email - User email
   */
  resendVerification: (email) =>
    apiClient.post('/auth/email/resend/', { email }, { skipAuth: true }),

  /**
   * Request password reset
   * @param {string} email - User email
   */
  requestPasswordReset: (email) =>
    apiClient.post('/auth/password/reset/', { email }, { skipAuth: true }),

  /**
   * Confirm password reset
   * @param {string} token - Password reset token
   * @param {string} newPassword - New password
   * @param {string} newPasswordConfirm - New password confirmation
   */
  confirmPasswordReset: (token, newPassword, newPasswordConfirm) =>
    apiClient.post('/auth/password/reset/confirm/', {
      token,
      new_password: newPassword,
      new_password_confirm: newPasswordConfirm,
    }, { skipAuth: true }),

  /**
   * Change password for authenticated user
   * @param {string} oldPassword - Current password
   * @param {string} newPassword - New password
   * @param {string} newPasswordConfirm - New password confirmation
   */
  changePassword: (oldPassword, newPassword, newPasswordConfirm) =>
    apiClient.post('/auth/password/change/', {
      old_password: oldPassword,
      new_password: newPassword,
      new_password_confirm: newPasswordConfirm,
    }),

  /**
   * Get current user profile
   */
  getCurrentUser: () =>
    apiClient.get('/auth/me/'),

  /**
   * Update current user profile
   * @param {Object} data - Profile data to update
   */
  updateProfile: (data) =>
    apiClient.patch('/auth/me/', data),

  /**
   * Request email change. Verification link sent to NEW email; notice to OLD.
   */
  requestEmailChange: (newEmail, currentPassword) =>
    apiClient.post('/auth/email/change/request/', {
      new_email: newEmail,
      current_password: currentPassword,
    }),

  /**
   * Confirm email change via tokenized link. Public — does not require auth.
   */
  confirmEmailChange: (token) =>
    apiClient.get(`/auth/email/change/confirm/${token}/`, { skipAuth: true }),

  /**
   * Soft-delete the authenticated user's account.
   */
  deleteAccount: (currentPassword) =>
    apiClient.post('/auth/account/delete/', {
      current_password: currentPassword,
    }),
};

export const kycService = {
  /**
   * Get KYC data for current user
   */
  getKYC: () =>
    apiClient.get('/auth/kyc/'),

  /**
   * Update KYC data
   * @param {Object} data - KYC data to update
   */
  updateKYC: (data) =>
    apiClient.patch('/auth/kyc/', data),

  /**
   * Update specific KYC step
   * @param {number} stepNumber - Step number (1-4)
   * @param {Object} data - Step data
   */
  updateKYCStep: (stepNumber, data) =>
    apiClient.patch(`/auth/kyc/step/${stepNumber}/`, data),

  /**
   * Submit KYC application for review
   */
  submitKYC: () =>
    apiClient.post('/auth/kyc/submit/'),

  /**
   * Upload government ID
   * @param {File} file - Government ID file
   */
  uploadGovernmentID: (file) => {
    const formData = new FormData();
    formData.append('government_id', file);
    return apiClient.upload('/auth/kyc/upload/government-id/', formData);
  },

  /**
   * Upload recommendation letter
   * @param {File} file - Recommendation letter file
   */
  uploadRecommendation: (file) => {
    const formData = new FormData();
    formData.append('recommendation_letter', file);
    return apiClient.upload('/auth/kyc/upload/recommendation/', formData);
  },
};

export const eagletProfileService = {
  /**
   * Get eaglet profile for current user
   */
  getProfile: () =>
    apiClient.get('/auth/eaglet/profile/'),

  /**
   * Update eaglet profile
   * @param {Object} data - Profile data to update
   */
  updateProfile: (data) =>
    apiClient.patch('/auth/eaglet/profile/', data),

  /**
   * Complete eaglet onboarding
   * @param {Object} data - Onboarding data
   */
  completeOnboarding: (data) =>
    apiClient.post('/auth/eaglet/onboarding/', data),

  /**
   * Skip eaglet onboarding
   */
  skipOnboarding: () =>
    apiClient.post('/auth/eaglet/onboarding/skip/'),
};


/**
 * Admin Service
 * API calls for admin management
 */
export const adminService = {
  /**
   * Get admin dashboard stats
   * @param {Object} params - Query parameters (e.g. { period: 'weekly' | 'monthly' })
   */
  getStats: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiClient.get(`/auth/admin/stats/${query ? `?${query}` : ''}`);
  },

  /**
   * Get KYC applications list
   * @param {Object} params - Query parameters (role, status, search, ordering, page, per_page)
   */
  getKYCList: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiClient.get(`/auth/admin/kyc/${query ? `?${query}` : ''}`);
  },

  /**
   * Get single KYC application details
   * @param {string} kycId - KYC application ID
   * @param {string} role - 'mentor' or 'mentee'
   */
  getKYCDetail: (kycId, role = 'mentor') =>
    apiClient.get(`/auth/admin/kyc/${kycId}/?role=${role}`),

  /**
   * Approve KYC application
   * @param {string} kycId - KYC application ID
   * @param {string} role - 'mentor' or 'mentee'
   * @param {Object} data - Review notes (optional)
   */
  approveKYC: (kycId, role, data = {}) =>
    apiClient.post(`/auth/admin/kyc/${kycId}/approve/`, { ...data, role }),

  /**
   * Reject KYC application
   * @param {string} kycId - KYC application ID
   * @param {string} role - 'mentor' or 'mentee'
   * @param {Object} data - Rejection reason and notes
   */
  rejectKYC: (kycId, role, data) =>
    apiClient.post(`/auth/admin/kyc/${kycId}/reject/`, { ...data, role }),

  /**
   * Request changes on KYC application
   * @param {string} kycId - KYC application ID
   * @param {string} role - 'mentor' or 'mentee'
   * @param {Object} data - Review notes
   */
  requestKYCChanges: (kycId, role, data) =>
    apiClient.post(`/auth/admin/kyc/${kycId}/request-changes/`, { ...data, role }),

  /**
   * Add internal note to KYC application
   * @param {string} kycId - KYC application ID
   * @param {string} role - 'mentor' or 'mentee'
   * @param {string} note - Note content
   */
  addKYCNote: (kycId, role, note) =>
    apiClient.post(`/auth/admin/kyc/${kycId}/notes/`, { note, role }),

  /**
   * Get paginated list of all platform users
   * @param {Object} params - role, status, search, ordering, page, per_page
   */
  getUsers: (params = {}) => {
    const query = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v != null && v !== '' && v !== 'all'))
    ).toString();
    return apiClient.get(`/auth/admin/users/${query ? `?${query}` : ''}`);
  },

  /**
   * Suspend a user (revoke platform access)
   * @param {string} userId - User ID
   * @param {string} reason - Suspension reason
   */
  suspendUser: (userId, reason) =>
    apiClient.post(`/auth/admin/users/${userId}/suspend/`, { reason }),

  /**
   * Reactivate a suspended user
   * @param {string} userId - User ID
   */
  reactivateUser: (userId) =>
    apiClient.post(`/auth/admin/users/${userId}/reactivate/`),
};

export default authService;

