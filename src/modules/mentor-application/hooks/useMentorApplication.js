/**
 * useMentorApplication — React Query hooks for the mentor application workflow (plan 16-02).
 *
 * Mutations invalidate both the mentor-application query AND the auth/me query,
 * so MenteeLevelCard + auth-store passthroughs refresh after submit/withdraw.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useAuthStore } from '@store';
import { MentorApplicationService } from '../services/mentor-application-service';

const meKey = ['mentor-application', 'me'];
const authMeKey = ['auth', 'me'];

export function useMyMentorApplication() {
    return useQuery({
        queryKey: meKey,
        queryFn: () => MentorApplicationService.getMyApplication(),
        staleTime: 60 * 1000,
    });
}

function invalidateAll(qc) {
    qc.invalidateQueries({ queryKey: meKey });
    qc.invalidateQueries({ queryKey: authMeKey });
}

export function useSubmitMentorApplication() {
    const qc = useQueryClient();
    const refreshAccessStatus = useAuthStore((s) => s.refreshAccessStatus);
    return useMutation({
        mutationFn: () => MentorApplicationService.submitApplication(),
        onSuccess: () => {
            invalidateAll(qc);
            refreshAccessStatus?.();
            toast.success('Application submitted — we’ll email you when reviewed');
        },
        onError: (err) =>
            toast.error(err?.message || 'Failed to submit application'),
    });
}

export function useWithdrawMentorApplication() {
    const qc = useQueryClient();
    const refreshAccessStatus = useAuthStore((s) => s.refreshAccessStatus);
    return useMutation({
        mutationFn: (id) => MentorApplicationService.withdrawApplication(id),
        onSuccess: () => {
            invalidateAll(qc);
            refreshAccessStatus?.();
            toast.success('Application withdrawn');
        },
        onError: (err) =>
            toast.error(err?.message || 'Failed to withdraw application'),
    });
}
