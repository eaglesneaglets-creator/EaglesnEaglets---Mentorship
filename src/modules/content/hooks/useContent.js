import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import ContentService from '../services/content-service';
import toast from 'react-hot-toast';
import { analyticsKeys } from '../../analytics/hooks/useAnalytics';

export const contentKeys = {
    all: ['content'],
    modules: () => [...contentKeys.all, 'modules'],
    moduleDetail: (id) => [...contentKeys.modules(), id],
    moduleItems: (moduleId) => [...contentKeys.moduleDetail(moduleId), 'items'],
    itemDetail: (moduleId, itemId) => [...contentKeys.moduleItems(moduleId), itemId],

    assignments: () => [...contentKeys.all, 'assignments'],
    assignmentDetail: (id) => [...contentKeys.assignments(), id],

    progress: () => [...contentKeys.all, 'progress'],
    myProgress: () => [...contentKeys.progress(), 'my'],
    submissions: (params) => [...contentKeys.assignments(), 'submissions', params],
};

// --- Modules Hooks ---

export const useModules = (params) => {
    return useQuery({
        queryKey: [...contentKeys.modules(), params],
        queryFn: () => ContentService.getModules(params),
        // Enable if we have a nest OR if user is searching globally (no nest provided)
        // This allows admins to see global modules correctly.
    });
};

export const useModuleDetail = (id) => {
    return useQuery({
        queryKey: contentKeys.moduleDetail(id),
        queryFn: () => ContentService.getModuleDetail(id),
        enabled: !!id,
    });
};

export const useCreateModule = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data) => ContentService.createModule(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: contentKeys.modules() });
            toast.success('Module created successfully');
        },
        onError: (error) => {
            toast.error(error.message || 'Failed to create module');
        }
    });
};

export const useUpdateModule = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }) => ContentService.updateModule(id, data),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: contentKeys.modules() });
            queryClient.invalidateQueries({ queryKey: contentKeys.moduleDetail(id) });
            toast.success('Module updated successfully');
        },
        onError: (error) => {
            toast.error(error.message || 'Failed to update module');
        }
    });
};

export const useDeleteModule = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id) => ContentService.deleteModule(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: contentKeys.modules() });
            toast.success('Module deleted successfully');
        },
        onError: (error) => {
            toast.error(error.message || 'Failed to delete module');
        }
    });
};

// --- Items Hooks ---

export const useModuleItems = (moduleId, params) => {
    return useQuery({
        queryKey: [...contentKeys.moduleItems(moduleId), params],
        queryFn: () => ContentService.getModuleItems(moduleId, params),
        enabled: !!moduleId,
    });
};

export const useCreateItem = (moduleId) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (formData) => ContentService.createItem(moduleId, formData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: contentKeys.modules() });
            queryClient.invalidateQueries({ queryKey: contentKeys.moduleItems(moduleId) });
            toast.success('Content item added successfully');
        },
        onError: (error) => {
            toast.error(error.message || 'Failed to add content item');
        }
    });
};

export const useUpdateItem = (moduleId) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ itemId, formData }) => ContentService.updateItem(moduleId, itemId, formData),
        onSuccess: (_, { itemId }) => {
            queryClient.invalidateQueries({ queryKey: contentKeys.modules() });
            queryClient.invalidateQueries({ queryKey: contentKeys.moduleItems(moduleId) });
            queryClient.invalidateQueries({ queryKey: contentKeys.itemDetail(moduleId, itemId) });
            toast.success('Content item updated successfully');
        },
        onError: (error) => {
            toast.error(error.message || 'Failed to update content item');
        }
    });
};

export const useDeleteItem = (moduleId) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (itemId) => ContentService.deleteItem(moduleId, itemId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: contentKeys.modules() });
            queryClient.invalidateQueries({ queryKey: contentKeys.moduleItems(moduleId) });
            toast.success('Content item deleted successfully');
        },
        onError: (error) => {
            toast.error(error.message || 'Failed to delete content item');
        }
    });
};

// --- Progress Hooks ---

export const useMyProgress = () => {
    return useQuery({
        queryKey: contentKeys.myProgress(),
        queryFn: () => ContentService.getMyProgress(),
    });
};

export const useUpdateProgress = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ itemId, data }) => ContentService.updateProgress(itemId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: contentKeys.myProgress() });
            queryClient.invalidateQueries({ queryKey: contentKeys.progress() });
            queryClient.invalidateQueries({ queryKey: contentKeys.modules() });
            queryClient.invalidateQueries({ queryKey: analyticsKeys.eagletDashboard() });
            // Refresh points data since completion triggers auto-award
            queryClient.invalidateQueries({ queryKey: ['points'] });
        }
    });
};

// --- Assignment Hooks ---

export const useAssignmentDetail = (id) => {
    return useQuery({
        queryKey: contentKeys.assignmentDetail(id),
        queryFn: () => ContentService.getAssignmentDetail(id),
        enabled: !!id,
    });
};

export const useSubmitAssignment = (assignmentId) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (formData) => ContentService.submitAssignment(assignmentId, formData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: contentKeys.assignments() });
            queryClient.invalidateQueries({ queryKey: contentKeys.assignmentDetail(assignmentId) });
            queryClient.invalidateQueries({ queryKey: contentKeys.modules() });
            queryClient.invalidateQueries({ queryKey: analyticsKeys.eagletDashboard() });
            queryClient.invalidateQueries({ queryKey: ['points'] });
            toast.success('Assignment submitted successfully');
        },
        onError: (error) => {
            toast.error(error.response?.data?.detail || 'Failed to submit assignment');
        }
    });
};

export const useSubmissions = (params) => {
    return useQuery({
        queryKey: contentKeys.submissions(params),
        queryFn: () => ContentService.getSubmissions(params),
    });
};

export const useGradeSubmission = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ assignmentId, submissionId, data }) =>
            ContentService.gradeSubmission(assignmentId, submissionId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: contentKeys.assignments() });
            queryClient.invalidateQueries({ queryKey: ['points'] });
            queryClient.invalidateQueries({ queryKey: contentKeys.submissions() });
            toast.success('Submission graded successfully');
        },
        onError: (error) => {
            toast.error(error.response?.data?.detail || 'Failed to grade submission');
        }
    });
};
