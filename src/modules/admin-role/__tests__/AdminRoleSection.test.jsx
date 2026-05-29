import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

vi.mock('@modules/admin-role/hooks/useAdminRole', () => ({
  useAdminRoleEligibility: vi.fn(),
  useMyAdminRequest: vi.fn(),
  useSubmitAdminRequest: vi.fn(),
  useWithdrawAdminRequest: vi.fn(),
}));

import {
  useAdminRoleEligibility,
  useMyAdminRequest,
  useSubmitAdminRequest,
  useWithdrawAdminRequest,
} from '@modules/admin-role/hooks/useAdminRole';
import AdminRoleSection from '../../../pages/settings/sections/account/AdminRoleSection';

const wrap = (ui) => render(<MemoryRouter>{ui}</MemoryRouter>);

const noopMutation = (overrides = {}) => ({
  mutate: vi.fn(),
  isPending: false,
  ...overrides,
});

describe('AdminRoleSection — 5 states', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useSubmitAdminRequest.mockReturnValue(noopMutation());
    useWithdrawAdminRequest.mockReturnValue(noopMutation());
  });

  it('State A — eligible: shows Submit request button', () => {
    useAdminRoleEligibility.mockReturnValue({
      data: { eligible: true, reasons: [] },
      isLoading: false,
    });
    useMyAdminRequest.mockReturnValue({ data: null, isLoading: false });

    wrap(<AdminRoleSection />);
    expect(screen.getByText(/Request admin role/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /submit request/i })).toBeInTheDocument();
  });

  it('State B — pending: shows withdraw button + pending badge', () => {
    useAdminRoleEligibility.mockReturnValue({
      data: { eligible: false, reasons: ['You already have a pending admin request.'] },
      isLoading: false,
    });
    useMyAdminRequest.mockReturnValue({
      data: {
        id: 'req-1',
        status: 'pending',
        reason: 'I want to help.',
        created_at: '2026-05-01T12:00:00Z',
      },
      isLoading: false,
    });

    wrap(<AdminRoleSection />);
    // Both the heading and the badge contain "pending review" — assert on the badge
    // specifically (it has the animated dot accent).
    expect(screen.getByText(/Admin role request — pending review/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /withdraw request/i })).toBeInTheDocument();
  });

  it('State C — approved: shows success card with role-switcher hint', () => {
    useAdminRoleEligibility.mockReturnValue({
      data: { eligible: false, reasons: ['You already hold admin privileges.'] },
      isLoading: false,
    });
    useMyAdminRequest.mockReturnValue({
      data: {
        id: 'req-1',
        status: 'approved',
        decided_at: '2026-05-10T12:00:00Z',
        decided_by: { full_name: 'Ada Admin' },
      },
      isLoading: false,
    });

    wrap(<AdminRoleSection />);
    expect(screen.getByText(/Admin role — active/i)).toBeInTheDocument();
    expect(screen.getByText(/role switcher/i)).toBeInTheDocument();
    expect(screen.getByText(/Ada Admin/)).toBeInTheDocument();
  });

  it('State D — rejected: shows reviewer note and resubmit when eligible', () => {
    useAdminRoleEligibility.mockReturnValue({
      data: { eligible: true, reasons: [] },
      isLoading: false,
    });
    useMyAdminRequest.mockReturnValue({
      data: {
        id: 'req-1',
        status: 'rejected',
        decision_note: 'Try again after running 3 cohorts.',
        decided_at: '2026-05-05T12:00:00Z',
      },
      isLoading: false,
    });

    wrap(<AdminRoleSection />);
    expect(screen.getByText(/Previous request — not approved/i)).toBeInTheDocument();
    expect(screen.getByText(/Try again after running/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /submit a new request/i })).toBeInTheDocument();
  });

  it('State E — ineligible: lists unmet criteria', () => {
    useAdminRoleEligibility.mockReturnValue({
      data: {
        eligible: false,
        reasons: [
          'You must be an approved mentor for at least 30 days. You have been approved for 12 days.',
          'Your mentor profile must be KYC-approved first.',
        ],
      },
      isLoading: false,
    });
    useMyAdminRequest.mockReturnValue({ data: null, isLoading: false });

    wrap(<AdminRoleSection />);
    expect(screen.getByText(/not yet available/i)).toBeInTheDocument();
    expect(screen.getByText(/at least 30 days/i)).toBeInTheDocument();
    expect(screen.getByText(/KYC-approved/i)).toBeInTheDocument();
  });

  it('Submit button opens the EOI modal', async () => {
    useAdminRoleEligibility.mockReturnValue({ data: { eligible: true, reasons: [] }, isLoading: false });
    useMyAdminRequest.mockReturnValue({ data: null, isLoading: false });

    wrap(<AdminRoleSection />);
    await userEvent.click(screen.getByRole('button', { name: /submit request/i }));
    expect(await screen.findByText(/Tell the existing admin team/i)).toBeInTheDocument();
  });
});
