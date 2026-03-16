import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@api';
import toast from 'react-hot-toast';
import { contentKeys } from './useContent';

export const standaloneKeys = {
    byNest: (nestId) => [...contentKeys.assignments(), 'standalone', nestId],
};

export const useStandaloneAssignments = (nestId) => {
    return useQuery({
        queryKey: standaloneKeys.byNest(nestId),
        queryFn: () => apiClient.get(`/content/assignments/?nest=${nestId}&assignment_type=standalone`),
        enabled: !!nestId,
    });
};

// Fetches ALL standalone assignments across every nest the current user belongs to.
// Uses ?my_assignments=true so the backend resolves nest memberships server-side.
export const useMyStandaloneAssignments = () => {
    return useQuery({
        queryKey: [...contentKeys.assignments(), 'my'],
        queryFn: () => apiClient.get('/content/assignments/?my_assignments=true'),
    });
};

export const useCreateStandaloneAssignment = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (formData) => apiClient.upload('/content/assignments/', formData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: contentKeys.assignments() });
            toast.success('Assignment sent to nest');
        },
        onError: (error) => {
            toast.error(error.response?.data?.detail || 'Failed to create assignment');
        },
    });
};
