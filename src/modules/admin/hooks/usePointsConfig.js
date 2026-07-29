/**
 * Points Config Hooks
 *
 * React Query wrappers for admin-only point configuration endpoints.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import pointsConfigService from '../services/points-config-service';

const KEY = ['admin', 'points-config'];
const POLICY_KEY = ['admin', 'points-policy'];

export const usePointsConfigs = () =>
  useQuery({
    queryKey: KEY,
    queryFn: pointsConfigService.list,
    staleTime: 60_000,
  });

export const useUpdatePointsConfig = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }) => pointsConfigService.update(id, patch),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
};

// --- Manual-award governance policy (Phase 31) ---

export const usePointsPolicy = () =>
  useQuery({
    queryKey: POLICY_KEY,
    queryFn: pointsConfigService.getPolicy,
    staleTime: 60_000,
  });

export const useUpdatePointsPolicy = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (patch) => pointsConfigService.updatePolicy(patch),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: POLICY_KEY });
      // A mentor's budget banner derives from this policy — drop it too.
      qc.invalidateQueries({ queryKey: ['points', 'award-budget'] });
    },
  });
};
