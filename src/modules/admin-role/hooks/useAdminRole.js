/**
 * Admin Role Management — React Query hooks (plan 18-02).
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@shared/components/ui/toast-utils';
import adminRoleService from '../services/admin-role-service';

export const adminRoleKeys = {
  all: ['admin-role'],
  eligibility: () => [...adminRoleKeys.all, 'eligibility'],
  myRequest: () => [...adminRoleKeys.all, 'my-request'],
  requests: (status) => [...adminRoleKeys.all, 'requests', status ?? 'pending'],
  invites: (status) => [...adminRoleKeys.all, 'invites', status ?? 'sent'],
  team: () => [...adminRoleKeys.all, 'team'],
  audit: () => [...adminRoleKeys.all, 'audit'],
};

/** Extract a friendly error message from API responses. */
const errMsg = (err, fallback) =>
  err?.details?.reasons?.join(' ') ||
  err?.message ||
  err?.response?.data?.error?.message ||
  fallback;

// ─── Eligibility / self EOI ────────────────────────────────────────────────

export const useAdminRoleEligibility = () =>
  useQuery({
    queryKey: adminRoleKeys.eligibility(),
    queryFn: adminRoleService.getEligibility,
    staleTime: 60_000,
  });

export const useMyAdminRequest = () =>
  useQuery({
    queryKey: adminRoleKeys.myRequest(),
    queryFn: adminRoleService.getMyRequest,
    staleTime: 30_000,
  });

export const useSubmitAdminRequest = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (reason) => adminRoleService.submitRequest(reason),
    onSuccess: () => {
      toast.success('Admin role request submitted. The team has been notified.');
      qc.invalidateQueries({ queryKey: adminRoleKeys.myRequest() });
      qc.invalidateQueries({ queryKey: adminRoleKeys.eligibility() });
    },
    onError: (err) => toast.error(errMsg(err, 'Could not submit request.')),
  });
};

export const useWithdrawAdminRequest = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => adminRoleService.withdrawMyRequest(),
    onSuccess: () => {
      toast.success('Request withdrawn.');
      qc.invalidateQueries({ queryKey: adminRoleKeys.myRequest() });
      qc.invalidateQueries({ queryKey: adminRoleKeys.eligibility() });
    },
    onError: (err) => toast.error(errMsg(err, 'Could not withdraw request.')),
  });
};

// ─── Admin queue ───────────────────────────────────────────────────────────

export const usePendingAdminRequests = (status = 'pending') =>
  useQuery({
    queryKey: adminRoleKeys.requests(status),
    queryFn: () => adminRoleService.listRequests(status),
    staleTime: 30_000,
  });

export const useApproveAdminRequest = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, note }) => adminRoleService.approveRequest({ id, note }),
    onSuccess: () => {
      toast.success('Request approved — user promoted to admin.');
      qc.invalidateQueries({ queryKey: adminRoleKeys.all });
    },
    onError: (err) => toast.error(errMsg(err, 'Could not approve request.')),
  });
};

export const useRejectAdminRequest = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, note }) => adminRoleService.rejectRequest({ id, note }),
    onSuccess: () => {
      toast.success('Request rejected.');
      qc.invalidateQueries({ queryKey: adminRoleKeys.all });
    },
    onError: (err) => toast.error(errMsg(err, 'Could not reject request.')),
  });
};

// ─── Invites ───────────────────────────────────────────────────────────────

export const usePendingInvites = (status = 'sent') =>
  useQuery({
    queryKey: adminRoleKeys.invites(status),
    queryFn: () => adminRoleService.listInvites(status),
    staleTime: 30_000,
  });

export const useSendAdminInvite = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ email, message }) => adminRoleService.sendInvite({ email, message }),
    onSuccess: () => {
      toast.success('Invite sent.');
      qc.invalidateQueries({ queryKey: adminRoleKeys.invites('sent') });
    },
    onError: (err) => toast.error(errMsg(err, 'Could not send invite.')),
  });
};

export const useRevokeInvite = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => adminRoleService.revokeInvite(id),
    onSuccess: () => {
      toast.success('Invite revoked.');
      qc.invalidateQueries({ queryKey: adminRoleKeys.invites('sent') });
    },
    onError: (err) => toast.error(errMsg(err, 'Could not revoke invite.')),
  });
};

export const useAcceptInvite = () =>
  useMutation({
    mutationFn: (token) => adminRoleService.acceptInvite(token),
    // AdminInviteAcceptPage renders a contextual error card (email
    // mismatch / expired / invalid) — a global toast on top of that
    // would just duplicate the message. Page is the canonical surface.
  });

// ─── Team ──────────────────────────────────────────────────────────────────

export const useAdminTeam = () =>
  useQuery({
    queryKey: adminRoleKeys.team(),
    queryFn: adminRoleService.listTeam,
    staleTime: 60_000,
  });

export const useRevokeAdmin = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, reason }) => adminRoleService.revokeMember({ userId, reason }),
    onSuccess: () => {
      toast.success('Admin access revoked.');
      qc.invalidateQueries({ queryKey: adminRoleKeys.team() });
      qc.invalidateQueries({ queryKey: adminRoleKeys.audit() });
    },
    onError: (err) => toast.error(errMsg(err, 'Could not revoke admin.')),
  });
};

export const useSelfRevokeAdmin = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (reason) => adminRoleService.selfRevoke(reason),
    onSuccess: () => {
      toast.success('Your admin access has been revoked.');
      qc.invalidateQueries({ queryKey: adminRoleKeys.all });
    },
    onError: (err) => toast.error(errMsg(err, 'Could not revoke admin.')),
  });
};

export const useAdminAuditLog = () =>
  useQuery({
    queryKey: adminRoleKeys.audit(),
    queryFn: adminRoleService.listAudit,
    staleTime: 60_000,
  });
