import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@api';
import toast from 'react-hot-toast';
import { contentKeys } from './useContent';

export const quizKeys = {
    quiz: (moduleId) => [...contentKeys.moduleDetail(moduleId), 'quiz'],
    attempts: (moduleId) => [...contentKeys.moduleDetail(moduleId), 'quiz', 'attempts'],
};

// --- Eagle hooks ---

export const useGetQuiz = (moduleId) => {
    return useQuery({
        queryKey: quizKeys.quiz(moduleId),
        queryFn: () => apiClient.get(`/content/modules/${moduleId}/quiz/`),
        enabled: !!moduleId,
    });
};

export const useCreateQuiz = (moduleId) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data) => apiClient.post(`/content/modules/${moduleId}/quiz/`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: quizKeys.quiz(moduleId) });
            queryClient.invalidateQueries({ queryKey: contentKeys.modules() });
            toast.success('Quiz saved successfully');
        },
        onError: (error) => {
            toast.error(error.response?.data?.detail || 'Failed to save quiz');
        },
    });
};

// --- Eaglet hooks ---

export const useSubmitAttempt = (moduleId) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (answers) =>
            apiClient.post(`/content/modules/${moduleId}/quiz/attempt/`, { answers }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: quizKeys.attempts(moduleId) });
            queryClient.invalidateQueries({ queryKey: contentKeys.modules() });
            queryClient.invalidateQueries({ queryKey: ['points'] });
        },
        onError: (error) => {
            toast.error(error.response?.data?.detail || 'Failed to submit quiz');
        },
    });
};

export const useAttemptHistory = (moduleId) => {
    return useQuery({
        queryKey: quizKeys.attempts(moduleId),
        queryFn: () => apiClient.get(`/content/modules/${moduleId}/quiz/attempts/`),
        enabled: !!moduleId,
    });
};
