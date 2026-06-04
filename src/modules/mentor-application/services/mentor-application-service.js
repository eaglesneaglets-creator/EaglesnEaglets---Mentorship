/**
 * Mentor Application Service — wraps Phase 16-01 backend endpoints.
 *
 * Endpoints (mounted under /api/v1/auth/):
 *   GET  /auth/mentor-application/                                  → my application + eligibility
 *   POST /auth/mentor-application/                                  → submit (no body)
 *   POST /auth/mentor-application/<id>/withdraw/                    → withdraw owner-scoped
 *   GET  /auth/admin/mentor-applications/?status=submitted          → admin queue
 *   POST /auth/admin/mentor-applications/<id>/<action>/             → approve|reject
 */
import { apiClient } from '@api';

const qs = (params) => {
    const entries = Object.entries(params || {}).filter(([, v]) => v != null && v !== '');
    return entries.length ? `?${new URLSearchParams(entries)}` : '';
};

export const MentorApplicationService = {
    getMyApplication: () => apiClient.get('/auth/mentor-application/'),
    submitApplication: () => apiClient.post('/auth/mentor-application/', {}),
    withdrawApplication: (id) =>
        apiClient.post(`/auth/mentor-application/${id}/withdraw/`, {}),

    // Admin queue (16-03 consumes these)
    adminListApplications: (params) =>
        apiClient.get(`/auth/admin/mentor-applications/${qs(params)}`),
    adminDecide: (id, action, body = {}) =>
        apiClient.post(`/auth/admin/mentor-applications/${id}/${action}/`, body),
};
