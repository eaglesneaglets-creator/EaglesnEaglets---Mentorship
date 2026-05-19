/**
 * usePrograms — React Query hooks for nest programs (plan 14-06 T1).
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { ProgramService } from '../services/program-service';

const programsKey = (nestId) => ['programs', nestId];

export function usePrograms(nestId) {
    return useQuery({
        queryKey: programsKey(nestId),
        queryFn: () => ProgramService.listPrograms(nestId),
        enabled: Boolean(nestId),
    });
}

export function useProgram(nestId, pk) {
    return useQuery({
        queryKey: ['program', nestId, pk],
        queryFn: () => ProgramService.getProgram(nestId, pk),
        enabled: Boolean(nestId && pk),
    });
}

export function useCreateProgram(nestId) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (body) => ProgramService.createProgram(nestId, body),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: programsKey(nestId) });
            toast.success('Program created');
        },
        onError: (err) => toast.error(err?.message || 'Failed to create program'),
    });
}

export function useUpdateProgram(nestId) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ pk, body }) => ProgramService.updateProgram(nestId, pk, body),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: programsKey(nestId) });
            toast.success('Program saved');
        },
        onError: (err) => toast.error(err?.message || 'Failed to save program'),
    });
}
