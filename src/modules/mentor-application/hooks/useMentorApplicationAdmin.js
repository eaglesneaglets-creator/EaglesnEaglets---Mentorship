/**
 * useMentorApplicationAdmin — admin-side React Query hooks for the mentor
 * application queue (plan 16-03). Reuses MentorApplicationService from 16-02.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { MentorApplicationService } from '../services/mentor-application-service';

const adminListKey = (status) => ['mentor-application', 'admin', status];

export function useAdminMentorApplications(status = 'submitted') {
    return useQuery({
        queryKey: adminListKey(status),
        queryFn: () => MentorApplicationService.adminListApplications({ status }),
        staleTime: 30 * 1000,
    });
}

export function useAdminDecideMentorApplication() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, action, body }) =>
            MentorApplicationService.adminDecide(id, action, body),
        onSuccess: (_data, variables) => {
            // Invalidate every admin queue tab — the row may move from
            // submitted → approved/rejected on success.
            qc.invalidateQueries({ queryKey: ['mentor-application', 'admin'] });
            // Edge case: admin acted on their own row.
            qc.invalidateQueries({ queryKey: ['auth', 'me'] });
            const msg =
                variables?.action === 'approve'
                    ? 'Application approved'
                    : 'Application rejected';
            toast.success(msg);
        },
        onError: (err) =>
            toast.error(err?.message || 'Failed to update application'),
    });
}
