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
   * skipAuth = true so anonymous donors can donate without a token.
   * Hubtel sends a prompt to the donor's phone — no redirect needed.
   * Anonymous donors: include otp_token (from verifyOtp) in data.
   */
  initiateDonation: (data) =>
    apiClient.post('/donations/initiate/', data, { skipAuth: true }),

  /**
   * Poll this after initiateDonation to detect when Hubtel callback
   * has updated the status to SUCCESS or FAILED.
   */
  getDonationStatus: (donationId) =>
    apiClient.get(`/donations/status/${donationId}/`, { skipAuth: true }),

  /** Authenticated user's donation history */
  getMyDonations: () => apiClient.get('/donations/my-donations/'),

  /** Admin aggregate stats */
  getAdminStats: () => apiClient.get('/donations/admin/stats/'),
};

export default donationService;
