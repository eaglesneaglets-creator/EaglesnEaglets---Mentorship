/**
 * Donation React Query Hooks
 *
 * Query key factory + typed hooks for campaigns, donations, and admin stats.
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import donationService from '../services/donation-service';

// ---------------------------------------------------------------------------
// Query key factory
// ---------------------------------------------------------------------------

export const donationKeys = {
  all: ['donations'],
  campaigns: () => [...donationKeys.all, 'campaigns'],
  campaign: (id) => [...donationKeys.all, 'campaign', id],
  status: (donationId) => [...donationKeys.all, 'status', donationId],
  myDonations: () => [...donationKeys.all, 'my-donations'],
  adminStats: () => [...donationKeys.all, 'admin-stats'],
};

// ---------------------------------------------------------------------------
// Campaign queries
// ---------------------------------------------------------------------------

export function useCampaigns() {
  return useQuery({
    queryKey: donationKeys.campaigns(),
    queryFn: () => donationService.getCampaigns(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useCampaign(id) {
  return useQuery({
    queryKey: donationKeys.campaign(id),
    queryFn: () => donationService.getCampaign(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

// ---------------------------------------------------------------------------
// Donation mutation
// ---------------------------------------------------------------------------

export function useInitiateDonation() {
  return useMutation({
    mutationFn: (data) => donationService.initiateDonation(data),
  });
}

// ---------------------------------------------------------------------------
// Status poller — used after initiation to detect SUCCESS / FAILED
// ---------------------------------------------------------------------------

export function useDonationStatus(donationId, { enabled = false } = {}) {
  return useQuery({
    queryKey: donationKeys.status(donationId),
    queryFn: () => donationService.getDonationStatus(donationId),
    enabled: enabled && !!donationId,
    refetchInterval: (query) => {
      const status = query.state.data?.data?.status;
      // Stop polling once terminal state reached
      if (status === 'success' || status === 'failed') return false;
      return 3000; // poll every 3 seconds
    },
    staleTime: 0,
  });
}

// ---------------------------------------------------------------------------
// My Donations (authenticated)
// ---------------------------------------------------------------------------

export function useMyDonations({ enabled = true } = {}) {
  return useQuery({
    queryKey: donationKeys.myDonations(),
    queryFn: () => donationService.getMyDonations(),
    enabled,
    staleTime: 2 * 60 * 1000,
  });
}

// ---------------------------------------------------------------------------
// Admin stats
// ---------------------------------------------------------------------------

export function useAdminDonationStats({ enabled = true } = {}) {
  return useQuery({
    queryKey: donationKeys.adminStats(),
    queryFn: () => donationService.getAdminStats(),
    enabled,
    staleTime: 60 * 1000,
    refetchInterval: 60 * 1000, // auto-refresh every minute
  });
}
