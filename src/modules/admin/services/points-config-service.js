/**
 * Points Config Service
 *
 * Admin-only API client for /points/config/.
 * Returns unwrapped data (strips {success, data} envelope).
 */

import { apiClient } from '@api';

const pointsConfigService = {
  /** List all 9 point configurations (read-only activity_type, editable points_value/is_active/description). */
  list: async () => {
    const res = await apiClient.get('/points/config/');
    return res?.data ?? [];
  },

  /** PATCH a single config row. Body may contain points_value, is_active, description. */
  update: async (id, patch) => {
    const res = await apiClient.patch(`/points/config/${id}/`, patch);
    return res?.data;
  },

  /**
   * Manual-award governance policy (Phase 31). Distinct from the config rows
   * above: those set values for AUTOMATIC activities, this caps what a mentor
   * may hand out by hand. Superadmin-only.
   */
  getPolicy: async () => {
    const res = await apiClient.get('/points/policy/');
    return res?.data ?? null;
  },

  updatePolicy: async (patch) => {
    const res = await apiClient.patch('/points/policy/', patch);
    return res?.data;
  },
};

export default pointsConfigService;
