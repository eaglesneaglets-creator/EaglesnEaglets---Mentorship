/**
 * useObjectives — React Query hooks for program objectives + rules (plan 14-06 T1).
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { ProgramService } from '../services/program-service';

const objectivesKey = (nestId, programId) => ['objectives', nestId, programId];

export function useObjectives(nestId, programId) {
    return useQuery({
        queryKey: objectivesKey(nestId, programId),
        queryFn: () => ProgramService.listObjectives(nestId, programId),
        enabled: Boolean(nestId && programId),
    });
}

export function useCreateObjective(nestId, programId) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (body) => ProgramService.createObjective(nestId, programId, body),
        onSuccess: () => qc.invalidateQueries({ queryKey: objectivesKey(nestId, programId) }),
        onError: (err) => toast.error(err?.message || 'Failed to add objective'),
    });
}

export function useUpdateObjective(nestId, programId) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ pk, body }) => ProgramService.updateObjective(nestId, programId, pk, body),
        onSuccess: () => qc.invalidateQueries({ queryKey: objectivesKey(nestId, programId) }),
        onError: (err) => toast.error(err?.message || 'Failed to update objective'),
    });
}

export function useDeleteObjective(nestId, programId) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (pk) => ProgramService.deleteObjective(nestId, programId, pk),
        onSuccess: () => qc.invalidateQueries({ queryKey: objectivesKey(nestId, programId) }),
        onError: (err) => toast.error(err?.message || 'Failed to delete objective'),
    });
}

export function useCreateRule(nestId, programId) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ objectiveId, body }) =>
            ProgramService.createRule(nestId, programId, objectiveId, body),
        onSuccess: () => qc.invalidateQueries({ queryKey: objectivesKey(nestId, programId) }),
        onError: (err) => toast.error(err?.message || 'Failed to add rule'),
    });
}

export function useDeleteRule(nestId, programId) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ objectiveId, pk }) =>
            ProgramService.deleteRule(nestId, programId, objectiveId, pk),
        onSuccess: () => qc.invalidateQueries({ queryKey: objectivesKey(nestId, programId) }),
        onError: (err) => toast.error(err?.message || 'Failed to remove rule'),
    });
}

export function useUpdateRule(nestId, programId) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ objectiveId, pk, body }) =>
            ProgramService.updateRule(nestId, programId, objectiveId, pk, body),
        onSuccess: () => qc.invalidateQueries({ queryKey: objectivesKey(nestId, programId) }),
        onError: (err) => toast.error(err?.message || 'Failed to update rule'),
    });
}
