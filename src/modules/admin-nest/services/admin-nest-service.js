/**
 * Admin Nest Management — API client (Phase 27-02).
 *
 * Consumes the /admin/nests/ endpoints from 27-01. Returns unwrapped data
 * (strips the {success, data} envelope) for ergonomic React Query use.
 * Paginated endpoints use the project envelope {success, data: [...], meta:
 * {pagination: {count,...}}} — the list is `data` (an array), NOT `data.results`.
 * `normalizePage` maps that onto the {results, count} shape the UI consumes.
 */

import { apiClient } from '@api';

const BASE = '/admin/nests';

/**
 * Normalize the project pagination envelope onto {results, count}.
 * Backend sends {success, data: [...], meta: {pagination: {count}}}, so the
 * rows live at `data` (an array), never `data.results`. Falls back gracefully
 * if a caller ever receives an already-unwrapped array or a DRF-style body.
 */
const normalizePage = (res) => {
  const rows = Array.isArray(res?.data)
    ? res.data
    : (res?.data?.results ?? (Array.isArray(res) ? res : []));
  const count = res?.meta?.pagination?.count ?? res?.count ?? rows.length;
  return { results: rows, count };
};

const adminNestService = {
  // ─── Nests ────────────────────────────────────────────────────────────────
  listNests: async (params = {}) => {
    const clean = Object.fromEntries(
      Object.entries(params).filter(([, v]) => v != null && v !== '' && v !== 'all'),
    );
    const qs = new URLSearchParams(clean).toString();
    const res = await apiClient.get(`${BASE}/${qs ? `?${qs}` : ''}`);
    return normalizePage(res);
  },

  getNest: async (id) => {
    const res = await apiClient.get(`${BASE}/${id}/`);
    return res?.data ?? null;
  },

  createNest: async (data) => {
    const res = await apiClient.post(`${BASE}/`, data);
    return res?.data;
  },

  archiveNest: async (id) => {
    const res = await apiClient.patch(`${BASE}/${id}/archive/`, {});
    return res?.data;
  },

  getActivity: async (id, params = {}) => {
    const qs = new URLSearchParams(params).toString();
    const res = await apiClient.get(`${BASE}/${id}/activity/${qs ? `?${qs}` : ''}`);
    return normalizePage(res);
  },

  removeMember: async ({ nestId, membershipId }) => {
    const res = await apiClient.delete(`${BASE}/${nestId}/members/${membershipId}/`);
    return res?.data;
  },

  // ─── Assignable mentors (for the create modal) ─────────────────────────────
  // Reuse the admin user list; keep only approved-KYC eagles. The admin users
  // endpoint already supports role + status/search filters.
  listAssignableMentors: async (search = '') => {
    const params = { role: 'eagle', per_page: 100 };
    if (search) params.search = search;
    const qs = new URLSearchParams(params).toString();
    const res = await apiClient.get(`/auth/admin/users/?${qs}`);
    const users = res?.data?.results ?? res?.data ?? [];
    // Prefer approved-KYC mentors; the create endpoint enforces this server-side too.
    return users.filter((u) => (u.kyc_status ? u.kyc_status === 'approved' : true));
  },
};

export default adminNestService;
