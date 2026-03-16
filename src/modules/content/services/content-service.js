import { apiClient } from '@api';

const ContentService = {
    // --- Modules ---
    getModules: (params) => {
        // Clean params to avoid ?nest=undefined
        const cleanParams = Object.fromEntries(
            Object.entries(params || {}).filter(([_, v]) => v != null && v !== 'undefined')
        );
        const query = Object.keys(cleanParams).length ? `?${new URLSearchParams(cleanParams)}` : '';
        return apiClient.get(`/content/modules/${query}`);
    },
    getModuleDetail: (id) => apiClient.get(`/content/modules/${id}/`),
    createModule: (data) =>
        data instanceof FormData
            ? apiClient.upload('/content/modules/', data)
            : apiClient.post('/content/modules/', data),
    updateModule: (id, data) => apiClient.patch(`/content/modules/${id}/`, data),
    deleteModule: (id) => apiClient.delete(`/content/modules/${id}/`),

    // --- Content Items ---
    getModuleItems: (moduleId, params) => {
        const query = params ? `?${new URLSearchParams(params)}` : '';
        return apiClient.get(`/content/modules/${moduleId}/items/${query}`);
    },
    getItemDetail: (moduleId, itemId) => apiClient.get(`/content/modules/${moduleId}/items/${itemId}/`),
    createItem: (moduleId, formData) => apiClient.upload(`/content/modules/${moduleId}/items/`, formData),
    updateItem: (moduleId, itemId, formData) => apiClient.upload(`/content/modules/${moduleId}/items/${itemId}/`, formData),
    deleteItem: (moduleId, itemId) => apiClient.delete(`/content/modules/${moduleId}/items/${itemId}/`),

    // --- Assignments ---
    getAssignments: (params) => {
        const query = params ? `?${new URLSearchParams(params)}` : '';
        return apiClient.get(`/content/assignments/${query}`);
    },
    getAssignmentDetail: (id) => apiClient.get(`/content/assignments/${id}/`),
    createAssignment: (data) => apiClient.post('/content/assignments/', data),
    updateAssignment: (id, data) => apiClient.patch(`/content/assignments/${id}/`, data),
    submitAssignment: (id, formData) => apiClient.upload(`/content/assignments/${id}/submit/`, formData),
    getSubmissions: (params) => {
        const query = params ? `?${new URLSearchParams(params)}` : '';
        return apiClient.get(`/content/assignments/submissions/${query}`);
    },
    gradeSubmission: (assignmentId, submissionId, data) =>
        apiClient.post(`/content/assignments/${assignmentId}/grade/${submissionId}/`, data),

    // --- Progress ---
    getMyProgress: () => apiClient.get('/content/my-progress/'),
    getContentProgress: (params) => {
        const query = params ? `?${new URLSearchParams(params)}` : '';
        return apiClient.get(`/content/progress/${query}`);
    },
    updateProgress: (itemId, data) => apiClient.patch(`/content/progress/${itemId}/`, data),
};

export default ContentService;
