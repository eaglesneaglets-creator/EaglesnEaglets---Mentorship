/**
 * Admin Nest Management — React Query hooks (Phase 27-02).
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import adminNestService from '../services/admin-nest-service';

export const adminNestKeys = {
  all: ['admin-nests'],
  list: (filters) => [...adminNestKeys.all, 'list', filters],
  detail: (id) => [...adminNestKeys.all, 'detail', id],
  activity: (id, params) => [...adminNestKeys.all, 'activity', id, params],
  mentors: (search) => [...adminNestKeys.all, 'mentors', search],
};

export const useAdminNests = (filters = {}) =>
  useQuery({
    queryKey: adminNestKeys.list(filters),
    queryFn: () => adminNestService.listNests(filters),
    keepPreviousData: true,
  });

export const useAdminNest = (id) =>
  useQuery({
    queryKey: adminNestKeys.detail(id),
    queryFn: () => adminNestService.getNest(id),
    enabled: !!id,
  });

export const useAdminNestActivity = (id, { enabled = true, ...params } = {}) =>
  useQuery({
    queryKey: adminNestKeys.activity(id, params),
    queryFn: () => adminNestService.getActivity(id, params),
    enabled: !!id && enabled,
  });

export const useAssignableMentors = (search = '') =>
  useQuery({
    queryKey: adminNestKeys.mentors(search),
    queryFn: () => adminNestService.listAssignableMentors(search),
    staleTime: 60 * 1000,
  });

export const useCreateNest = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => adminNestService.createNest(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminNestKeys.all });
      toast.success('Nest created.');
    },
    onError: (err) => toast.error(err?.message || 'Failed to create nest.'),
  });
};

export const useArchiveNest = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => adminNestService.archiveNest(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminNestKeys.all });
      toast.success('Nest archived.');
    },
    onError: (err) => toast.error(err?.message || 'Failed to archive nest.'),
  });
};

export const useRemoveNestMember = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ nestId, membershipId }) =>
      adminNestService.removeMember({ nestId, membershipId }),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: adminNestKeys.detail(vars.nestId) });
      toast.success('Member removed.');
    },
    onError: (err) => toast.error(err?.message || 'Failed to remove member.'),
  });
};
