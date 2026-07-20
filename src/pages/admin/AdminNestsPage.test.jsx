/**
 * Tests for AdminNestsPage (Phase 27-02).
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

vi.mock('../../modules/admin-nest/hooks/useAdminNests', () => ({
  useAdminNests: vi.fn(),
  useCreateNest: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
  useAssignableMentors: vi.fn(() => ({ data: [], isLoading: false })),
}));

vi.mock('../../shared/components/layout/DashboardLayout', () => ({
  default: ({ children }) => <div data-testid="dashboard-layout">{children}</div>,
}));

import { useAdminNests } from '../../modules/admin-nest/hooks/useAdminNests';
import AdminNestsPage from './AdminNestsPage';

const nest = {
  id: 'nest-1',
  name: 'Faith & Profession',
  description: 'Integrating christian values.',
  category: 'faith',
  privacy: 'public',
  status: 'active',
  eagle: { id: 'e1', full_name: 'Daniel Oppong', first_name: 'Daniel', last_name: 'Oppong' },
  member_count: 8,
  max_members: 10,
  members: [],
  is_active: true,
  created_at: '2026-07-01T10:00:00Z',
};

const renderPage = () => {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter>
        <AdminNestsPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
};

describe('AdminNestsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAdminNests.mockReturnValue({
      data: { results: [nest], count: 1, next: null, previous: null },
      isLoading: false,
      isError: false,
    });
  });

  it('renders the header and a nest card', () => {
    renderPage();
    expect(screen.getByText('Nests Community')).toBeInTheDocument();
    // Card title is an <h3>; scope to heading to avoid the category <option>.
    expect(screen.getByRole('heading', { name: 'Faith & Profession' })).toBeInTheDocument();
    expect(screen.getByText('Daniel Oppong')).toBeInTheDocument();
  });

  it('shows the status pill from the derived status', () => {
    renderPage();
    // "Active" appears in the status <option> and the pill; the pill is inside
    // the card. Assert at least one non-option element carries it.
    const matches = screen.getAllByText('Active');
    expect(matches.some((el) => el.tagName !== 'OPTION')).toBe(true);
  });

  it('changing a filter re-queries the hook', () => {
    renderPage();
    const statusSelect = screen.getByLabelText(/Filter by status/i);
    fireEvent.change(statusSelect, { target: { value: 'forming' } });
    // hook is called again with the new status
    const calledWith = useAdminNests.mock.calls.map((c) => c[0]);
    expect(calledWith.some((f) => f?.status === 'forming')).toBe(true);
  });

  it('opens the Create New Nest modal', async () => {
    renderPage();
    fireEvent.click(screen.getByRole('button', { name: /Create New Nest/i }));
    await waitFor(() =>
      expect(screen.getByText(/Assign Mentor/i)).toBeInTheDocument(),
    );
  });

  it('toggles between grid and list view', () => {
    renderPage();
    const listBtn = screen.getByLabelText(/List view/i);
    fireEvent.click(listBtn);
    expect(listBtn).toHaveAttribute('aria-pressed', 'true');
  });

  it('renders empty state when no nests', () => {
    useAdminNests.mockReturnValue({ data: { results: [], count: 0 }, isLoading: false, isError: false });
    renderPage();
    expect(screen.getByText(/No nests found/i)).toBeInTheDocument();
  });
});
