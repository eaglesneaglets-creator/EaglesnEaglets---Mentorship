/**
 * Donation Service
 *
 * All API calls for campaigns and Hubtel mobile money donations.
 * Uses the native fetch apiClient — no axios.
 */

import { apiClient } from '@api';

const donationService = {
  /** List all active campaigns */
  getCampaigns: () => apiClient.get('/donations/campaigns/'),

  /** Get a single campaign by ID */
  getCampaign: (id) => apiClient.get(`/donations/campaigns/${id}/`),

  /**
   * Step 1 of anonymous donor phone verification.
   * Sends a 6-digit OTP to the given Ghana phone number via Hubtel SMS.
   * Call before showing the OTP input field.
   */
  sendOtp: (phoneNumber) =>
    apiClient.post('/donations/otp/send/', { phone_number: phoneNumber }, { skipAuth: true }),

  /**
   * Step 2 of anonymous donor phone verification.
   * Validates the OTP entered by the donor.
   * Returns { otp_token } — pass this with initiateDonation for anonymous donors.
   */
  verifyOtp: (phoneNumber, code) =>
    apiClient.post('/donations/otp/verify/', { phone_number: phoneNumber, code }, { skipAuth: true }),

  /**
   * Initiate a mobile money donation.
   * Authenticated users: request includes session/token automatically.
   * Anonymous donors: must first call verifyOtp then include otp_token in data.
   * Hubtel sends a prompt to the donor's phone — no redirect needed.
   */
  initiateDonation: (data) => apiClient.post('/donations/initiate/', data),

  /**
   * Poll this after initiateDonation to detect when Hubtel callback
   * has updated the status to SUCCESS or FAILED.
   */
  getDonationStatus: (donationId) =>
    apiClient.get(`/donations/status/${donationId}/`, { skipAuth: true }),

  /**
   * Manually check Hubtel for transaction status.
   * Used as fallback when webhook callback is not received.
   */
  checkDonationStatus: (donationId) =>
    apiClient.post(`/donations/status/check/${donationId}/`, {}, { skipAuth: true }),

  /** Authenticated user's donation history */
  getMyDonations: () => apiClient.get('/donations/my-donations/'),

  /** Admin aggregate stats */
  getAdminStats: () => apiClient.get('/donations/admin/stats/'),
};

export default donationService;
