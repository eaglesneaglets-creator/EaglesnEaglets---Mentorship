import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

/**
 * Phase 31-02 — the Award modal must reflect the LIVE policy.
 *
 * No limit may be hardcoded in the component: a superadmin can change the
 * ceiling at runtime, so the banner and the validation both derive from
 * GET /points/award-budget/.
 */

const mockUseAwardBudget = vi.fn();
const mockMutate = vi.fn();

vi.mock('../hooks/usePoints', () => ({
  useAwardBudget: (...a) => mockUseAwardBudget(...a),
  useAwardManualPoints: () => ({ mutate: mockMutate, isPending: false }),
  useEagletsByNest: () => ({
    data: { data: [{ id: 'e1', full_name: 'Ama Mensah' }] },
    isLoading: false,
  }),
}));

vi.mock('../../nest/hooks/useNests', () => ({
  useOwnedNests: () => ({ data: { data: [{ id: 'n1', name: 'Faith Nest' }] } }),
}));

import AwardPointsModal from './AwardPointsModal';

const budget = (over = {}) => ({
  data: {
    data: {
      max_per_award: 25,
      daily_limit: 250,
      used_today: 100,
      remaining: 150,
      is_enforced: true,
      ...over,
    },
  },
});

const renderModal = (props = {}) =>
  render(
    <AwardPointsModal isOpen onClose={vi.fn()} prefillNestId="n1" {...props} />,
  );

describe('AwardPointsModal — policy budget (31-02)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAwardBudget.mockReturnValue(budget());
  });

  it('shows remaining daily budget and the per-award ceiling', () => {
    renderModal();
    // "150 of 250 points left today · max 25 per award" — assert on the banner
    // as a whole so a bare /25/ doesn't also match the 250 daily limit.
    const banner = screen.getByText(/of 250 points left today/).closest('div');
    expect(banner).toHaveTextContent('150');
    expect(banner).toHaveTextContent('max');
    expect(banner).toHaveTextContent('25');
    // The per-award ceiling also drives the input placeholder.
    expect(screen.getByPlaceholderText('Up to 25')).toBeInTheDocument();
  });

  it('only fetches the budget while the modal is open', () => {
    renderModal();
    expect(mockUseAwardBudget).toHaveBeenCalledWith({ enabled: true });
  });

  it('rejects an amount above the live ceiling, citing the policy value', async () => {
    const user = userEvent.setup();
    renderModal();

    await user.selectOptions(screen.getByRole('combobox'), 'e1');
    await user.type(screen.getByLabelText(/Points to Award/i), '26');
    await user.type(screen.getByPlaceholderText(/Excellent submission/i), 'Good work this week');
    await user.click(screen.getByRole('button', { name: /Award Points/i }));

    // Message names 25 (from the API), never the old hardcoded 1000.
    expect(await screen.findByText(/Maximum 25 points per award/i)).toBeInTheDocument();
    expect(mockMutate).not.toHaveBeenCalled();
  });

  it('tracks a raised ceiling without any frontend change', async () => {
    mockUseAwardBudget.mockReturnValue(budget({ max_per_award: 50 }));
    const user = userEvent.setup();
    renderModal();

    await user.selectOptions(screen.getByRole('combobox'), 'e1');
    await user.type(screen.getByLabelText(/Points to Award/i), '50');
    await user.type(screen.getByPlaceholderText(/Excellent submission/i), 'Excellent leadership work');
    await user.click(screen.getByRole('button', { name: /Award Points/i }));

    expect(mockMutate).toHaveBeenCalled();
  });

  it('disables submission and explains when the daily budget is exhausted', () => {
    mockUseAwardBudget.mockReturnValue(budget({ remaining: 0, used_today: 250 }));
    renderModal();

    expect(screen.getByText(/Daily limit reached/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Award Points/i })).toBeDisabled();
  });

  it('shows no budget banner or ceiling for admins (is_enforced false)', async () => {
    mockUseAwardBudget.mockReturnValue(
      budget({ is_enforced: false, max_per_award: null, daily_limit: null, remaining: null }),
    );
    const user = userEvent.setup();
    renderModal();

    expect(screen.queryByText(/points left today/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Daily limit reached/i)).not.toBeInTheDocument();

    // And no upper bound is applied.
    await user.selectOptions(screen.getByRole('combobox'), 'e1');
    await user.type(screen.getByLabelText(/Points to Award/i), '900');
    await user.type(screen.getByPlaceholderText(/Excellent submission/i), 'Admin correction applied');
    await user.click(screen.getByRole('button', { name: /Award Points/i }));

    expect(mockMutate).toHaveBeenCalled();
  });
});
