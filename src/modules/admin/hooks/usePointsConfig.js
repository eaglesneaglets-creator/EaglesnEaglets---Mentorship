/**
 * Points Config Hooks
 *
 * React Query wrappers for admin-only point configuration endpoints.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import pointsConfigService from '../services/points-config-service';

const KEY = ['admin', 'points-config'];

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
