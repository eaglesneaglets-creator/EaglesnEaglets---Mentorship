/**
 * Program Service — wraps Phase 14 backend endpoints (plan 14-06 T1).
 *
 * Endpoint families:
 *   - Programs (nested under nests)
 *   - Objectives + Rules (nested under programs)
 *   - Enrollments (top-level)
 *   - Exit requests (top-level)
 */
import { apiClient } from '@api';

const qs = (params) =>
    Object.keys(params || {}).length ? `?${new URLSearchParams(params)}` : '';

export const ProgramService = {
    // -- Programs ---------------------------------------------------------
    // Backend mounts programs flat under /nests/programs/ (not nested by nest_id).
    // Filter list by ?nest=<id>; pass nest in body on create.
    listPrograms: (nestId) => apiClient.get(`/nests/programs/${qs({ nest: nestId })}`),
    getProgram: (_nestId, pk) => apiClient.get(`/nests/programs/${pk}/`),
    createProgram: (nestId, body) => apiClient.post(`/nests/programs/`, { ...body, nest: nestId }),
    updateProgram: (_nestId, pk, body) =>
        apiClient.patch(`/nests/programs/${pk}/`, body),
    deleteProgram: (_nestId, pk) => apiClient.delete(`/nests/programs/${pk}/`),

    // -- Objectives -------------------------------------------------------
    listObjectives: (_nestId, programId) =>
        apiClient.get(`/nests/programs/${programId}/objectives/`),
    createObjective: (_nestId, programId, body) =>
        apiClient.post(`/nests/programs/${programId}/objectives/`, body),
    updateObjective: (_nestId, programId, pk, body) =>
        apiClient.patch(`/nests/programs/${programId}/objectives/${pk}/`, body),
    deleteObjective: (_nestId, programId, pk) =>
        apiClient.delete(`/nests/programs/${programId}/objectives/${pk}/`),

    // -- Rules ------------------------------------------------------------
    listRules: (_nestId, programId, objectiveId) =>
        apiClient.get(`/nests/programs/${programId}/objectives/${objectiveId}/rules/`),
    createRule: (_nestId, programId, objectiveId, body) =>
        apiClient.post(`/nests/programs/${programId}/objectives/${objectiveId}/rules/`, body),
    updateRule: (_nestId, programId, objectiveId, pk, body) =>
        apiClient.patch(`/nests/programs/${programId}/objectives/${objectiveId}/rules/${pk}/`, body),
    deleteRule: (_nestId, programId, objectiveId, pk) =>
        apiClient.delete(`/nests/programs/${programId}/objectives/${objectiveId}/rules/${pk}/`),

    // -- Enrollments ------------------------------------------------------
    listEnrollments: (params) => apiClient.get(`/program-enrollments/${qs(params)}`),
    getEnrollment: (id) => apiClient.get(`/program-enrollments/${id}/`),
    approveEnrollment: (id) => apiClient.post(`/program-enrollments/${id}/approve/`, {}),
    rejectEnrollment: (id, reason) =>
        apiClient.post(`/program-enrollments/${id}/reject/`, { reason }),
    releaseEnrollment: (id, reason) =>
        apiClient.post(`/program-enrollments/${id}/release/`, { reason }),
    completeEnrollment: (id) => apiClient.post(`/program-enrollments/${id}/complete/`, {}),

    // -- Exit requests ----------------------------------------------------
    listExitRequests: () => apiClient.get('/program-exit-requests/'),
    decideExitRequest: (id, decision, reason) =>
        apiClient.post(`/program-exit-requests/${id}/decide/`, { decision, reason }),
};
