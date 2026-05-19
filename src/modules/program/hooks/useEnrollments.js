/**
 * useEnrollments — React Query hooks for ProgramEnrollment + exit requests (plan 14-06 T1).
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { ProgramService } from '../services/program-service';

const enrollKey = (params) => ['enrollments', params || {}];
const exitKey = ['exit-requests'];

export function useEnrollments(params) {
    return useQuery({
        queryKey: enrollKey(params),
        queryFn: () => ProgramService.listEnrollments(params),
        enabled: params !== null && params !== undefined,
    });
}

const invalidateAll = (qc) => {
    qc.invalidateQueries({ queryKey: ['enrollments'] });
    qc.invalidateQueries({ queryKey: exitKey });
};

export function useApproveEnrollment() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id) => ProgramService.approveEnrollment(id),
        onSuccess: () => { invalidateAll(qc); toast.success('Enrollment approved'); },
        onError: (err) => toast.error(err?.message || 'Approve failed'),
    });
}

export function useRejectEnrollment() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, reason }) => ProgramService.rejectEnrollment(id, reason),
        onSuccess: () => { invalidateAll(qc); toast.success('Enrollment rejected'); },
        onError: (err) => toast.error(err?.message || 'Reject failed'),
    });
}

export function useReleaseEnrollment() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, reason }) => ProgramService.releaseEnrollment(id, reason),
        onSuccess: () => { invalidateAll(qc); toast.success('Mentee released'); },
        onError: (err) => toast.error(err?.message || 'Release failed'),
    });
}

export function useCompleteEnrollment() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id) => ProgramService.completeEnrollment(id),
        onSuccess: () => { invalidateAll(qc); toast.success('Program completed'); },
        onError: (err) => toast.error(err?.message || 'Complete failed — objectives may be incomplete'),
    });
}

export function useExitRequests() {
    return useQuery({
        queryKey: exitKey,
        queryFn: () => ProgramService.listExitRequests(),
    });
}

export function useDecideExitRequest() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, decision, reason }) =>
            ProgramService.decideExitRequest(id, decision, reason),
        onSuccess: () => { invalidateAll(qc); toast.success('Exit request resolved'); },
        onError: (err) => toast.error(err?.message || 'Decision failed'),
    });
}
