/**
 * Admin Role Management — API client (plan 18-02).
 *
 * Returns unwrapped data (strips {success, data} envelope) for ergonomic
 * use inside React Query hooks.
 */

import { apiClient } from '@api';

const BASE = '/admin-role';

const adminRoleService = {
  // ─── Eligibility ─────────────────────────────────────────────────────────
  getEligibility: async () => {
    const res = await apiClient.get(`${BASE}/eligibility/`);
    return res?.data ?? { eligible: false, reasons: [] };
  },

  // ─── Self / EOI ──────────────────────────────────────────────────────────
  getMyRequest: async () => {
    const res = await apiClient.get(`${BASE}/requests/me/`);
    return res?.data ?? null;
  },

  submitRequest: async (reason) => {
    const res = await apiClient.post(`${BASE}/requests/`, { reason });
    return res?.data;
  },

  withdrawMyRequest: async () => {
    const res = await apiClient.delete(`${BASE}/requests/me/`);
    return res?.data;
  },

  // ─── Admin queue ─────────────────────────────────────────────────────────
  listRequests: async (status = 'pending') => {
    const qs = status && status !== 'all' ? `?status=${encodeURIComponent(status)}` : '';
    const res = await apiClient.get(`${BASE}/requests/${qs}`);
    return res?.data ?? [];
  },

  approveRequest: async ({ id, note }) => {
    const res = await apiClient.post(`${BASE}/requests/${id}/approve/`, { note });
    return res?.data;
  },

  rejectRequest: async ({ id, note }) => {
    const res = await apiClient.post(`${BASE}/requests/${id}/reject/`, { note });
    return res?.data;
  },

  // ─── Invites ─────────────────────────────────────────────────────────────
  listInvites: async (status = 'sent') => {
    const qs = status && status !== 'all' ? `?status=${encodeURIComponent(status)}` : '';
    const res = await apiClient.get(`${BASE}/invites/${qs}`);
    return res?.data ?? [];
  },

  sendInvite: async ({ email, message = '' }) => {
    const res = await apiClient.post(`${BASE}/invites/`, { email, message });
    return res?.data;
  },

  revokeInvite: async (id) => {
    const res = await apiClient.post(`${BASE}/invites/${id}/revoke/`, {});
    return res?.data;
  },

  acceptInvite: async (token) => {
    const res = await apiClient.post(`${BASE}/invites/accept/${token}/`, {});
    return res?.data;
  },

  // ─── Team ────────────────────────────────────────────────────────────────
  listTeam: async () => {
    const res = await apiClient.get(`${BASE}/team/`);
    return res?.data ?? [];
  },

  revokeMember: async ({ userId, reason }) => {
    const res = await apiClient.post(`${BASE}/team/${userId}/revoke/`, { reason });
    return res?.data;
  },

  selfRevoke: async (reason = '') => {
    const res = await apiClient.post(`${BASE}/me/revoke/`, { reason });
    return res?.data;
  },

  transferSuperadmin: async ({ successorId, reason = '' }) => {
    const res = await apiClient.post(`${BASE}/me/transfer-superadmin/`, {
      successor_id: successorId,
      reason,
    });
    return res?.data;
  },

  // ─── Audit ───────────────────────────────────────────────────────────────
  listAudit: async () => {
    const res = await apiClient.get(`${BASE}/audit/`);
    return res?.data ?? [];
  },
};

export default adminRoleService;
