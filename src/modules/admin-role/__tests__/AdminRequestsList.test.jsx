import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

vi.mock('@store', () => ({
  useAuthStore: () => ({ user: { id: 'me-1' } }),
}));

vi.mock('@modules/admin-role/hooks/useAdminRole', () => ({
  usePendingAdminRequests: vi.fn(),
  useApproveAdminRequest: vi.fn(),
  useRejectAdminRequest: vi.fn(),
}));

import {
  usePendingAdminRequests,
  useApproveAdminRequest,
  useRejectAdminRequest,
} from '@modules/admin-role/hooks/useAdminRole';
import AdminRequestsList from '../components/AdminRequestsList';

const noopMutation = (overrides = {}) => ({
  mutate: vi.fn(),
  isPending: false,
  ...overrides,
});

describe('AdminRequestsList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useApproveAdminRequest.mockReturnValue(noopMutation());
    useRejectAdminRequest.mockReturnValue(noopMutation());
  });

  it('shows empty state when no pending requests', () => {
    usePendingAdminRequests.mockReturnValue({ data: [], isLoading: false });
    render(<AdminRequestsList />);
    expect(screen.getByText(/No pending admin requests/i)).toBeInTheDocument();
  });

  it('shows loading state', () => {
    usePendingAdminRequests.mockReturnValue({ data: undefined, isLoading: true });
    render(<AdminRequestsList />);
    expect(screen.getByText(/Loading requests/i)).toBeInTheDocument();
  });

  it('renders rows with approve/reject for non-self pending requests', () => {
    usePendingAdminRequests.mockReturnValue({
      data: [
        {
          id: 'r1',
          status: 'pending',
          reason: 'I have run 4 cohorts this year.',
          created_at: '2026-05-01T12:00:00Z',
          user: { id: 'u1', full_name: 'Pat Mentor', email: 'pat@example.com' },
        },
      ],
      isLoading: false,
    });
    render(<AdminRequestsList />);
    expect(screen.getByText('Pat Mentor')).toBeInTheDocument();
    expect(screen.getByText(/I have run 4 cohorts/i)).toBeInTheDocument();
    // Use exact-name matchers to disambiguate from the "Approved"/"Rejected"
    // filter pill buttons which also match a regex /approve/i.
    expect(screen.getByRole('button', { name: 'Approve' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reject' })).toBeInTheDocument();
  });

  it('opens reject modal with required note when Reject clicked', async () => {
    usePendingAdminRequests.mockReturnValue({
      data: [
        {
          id: 'r1', status: 'pending', reason: 'x',
          user: { id: 'u1', full_name: 'Pat', email: 'pat@e.test' },
          created_at: '2026-05-01T12:00:00Z',
        },
      ],
      isLoading: false,
    });
    render(<AdminRequestsList />);
    await userEvent.click(screen.getByRole('button', { name: 'Reject' }));
    expect(await screen.findByText(/Reject Pat/i)).toBeInTheDocument();
    expect(screen.getByText(/Share a brief reason/i)).toBeInTheDocument();
  });

  it('greys out own request and shows tooltip', () => {
    usePendingAdminRequests.mockReturnValue({
      data: [
        {
          id: 'r1', status: 'pending', reason: 'x',
          user: { id: 'me-1', full_name: 'Me', email: 'me@e.test' },
          created_at: '2026-05-01T12:00:00Z',
        },
      ],
      isLoading: false,
    });
    render(<AdminRequestsList />);
    expect(screen.getByText(/cannot approve your own request/i)).toBeInTheDocument();
  });
});
