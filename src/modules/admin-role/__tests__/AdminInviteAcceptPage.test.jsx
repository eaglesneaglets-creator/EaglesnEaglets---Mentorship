import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

const mockAuth = {
  isAuthenticated: true,
  user: { id: 'u1', email: 'pat@e.test' },
  logout: vi.fn(),
  refreshAccessStatus: vi.fn(),
};
// Honor the selector form `useAuthStore((s) => s.xxx)` AND the bare form.
vi.mock('@store', () => ({
  useAuthStore: (selector) => (selector ? selector(mockAuth) : mockAuth),
}));

const mockAcceptMutate = vi.fn();
let mockAcceptState = { isPending: false };

vi.mock('@modules/admin-role/hooks/useAdminRole', () => ({
  useAcceptInvite: () => ({
    mutate: (token, opts) => {
      mockAcceptMutate(token, opts);
    },
    ...mockAcceptState,
  }),
}));

import AdminInviteAcceptPage from '../../../pages/auth/AdminInviteAcceptPage';

// Each test uses a unique token so the page's module-level tokenResults
// Map doesn't leak state between cases.
let tokenCounter = 0;
const nextToken = () => `test-token-${++tokenCounter}-${Date.now()}`;

const wrap = (token) => render(
  <MemoryRouter initialEntries={[`/admin-role/accept/${token}`]}>
    <Routes>
      <Route path="/admin-role/accept/:token" element={<AdminInviteAcceptPage />} />
      <Route path="/login" element={<div>Login Page</div>} />
    </Routes>
  </MemoryRouter>
);

describe('AdminInviteAcceptPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuth.isAuthenticated = true;
    mockAcceptState = { isPending: false };
    mockAcceptMutate.mockReset();
  });

  it('redirects unauthenticated users to /login', () => {
    mockAuth.isAuthenticated = false;
    wrap(nextToken());
    expect(screen.getByText(/Login Page/i)).toBeInTheDocument();
  });

  it('shows success card on accept', async () => {
    mockAcceptMutate.mockImplementation((_, opts) => opts?.onSuccess?.());
    wrap(nextToken());
    expect(await screen.findByText(/You're now an admin/i)).toBeInTheDocument();
  });

  it('shows email-mismatch card', async () => {
    mockAcceptMutate.mockImplementation((_, opts) =>
      opts?.onError?.({ code: 'email_mismatch' }),
    );
    wrap(nextToken());
    expect(await screen.findByText(/Wrong account/i)).toBeInTheDocument();
    expect(screen.getByText(/Sign out and log in with the invited email/i)).toBeInTheDocument();
  });

  it('shows generic invalid card on bad token', async () => {
    mockAcceptMutate.mockImplementation((_, opts) =>
      opts?.onError?.({ code: 'invalid' }),
    );
    wrap(nextToken());
    expect(await screen.findByText(/Invite no longer valid/i)).toBeInTheDocument();
  });
});
