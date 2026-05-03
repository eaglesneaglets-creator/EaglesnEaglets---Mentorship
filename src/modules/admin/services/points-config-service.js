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
};

export default pointsConfigService;
