import { useQuery } from '@tanstack/react-query';
import { profileService } from '../../profile/services/profile-service';

/**
 * Guard for the KYC form routes (item: post-submit back-button confusion).
 *
 * Once a profile is submitted/under review/approved, the wizard should not be
 * reachable — hitting Back after submit used to re-open a stale form. The
 * pages use this hook to redirect instead:
 *   submitted | under_review  → /pending-approval
 *   approved                  → /dashboard
 *   draft | rejected | requires_changes → stay (editing allowed)
 *
 * Deliberately NOT a logout: pressing Back is normal user behaviour and
 * should never cost a session.
 */
export function useKycRouteGuard(role) {
  const { data, isLoading } = useQuery({
    queryKey: ['kyc-status', role],
    queryFn: async () => {
      const res = role === 'mentor'
        ? await profileService.getMentorProfile()
        : await profileService.getMenteeProfile();
      return res.data || res;
    },
    staleTime: 30_000,
  });

  const status = data?.status ?? null;
  const redirectTo =
    status === 'approved' ? '/dashboard'
      : (status === 'submitted' || status === 'under_review') ? '/pending-approval'
        : null;

  return { isLoading, status, redirectTo };
}
