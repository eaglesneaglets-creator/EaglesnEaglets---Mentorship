import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import SuperAdminRoute from '../SuperAdminRoute';

// Mock the auth store — the guard only reads `user`.
let mockUser = null;
vi.mock('@store', () => ({
  useAuthStore: () => ({ user: mockUser }),
}));

function renderAt(initialUser) {
  mockUser = initialUser;
  return render(
    <MemoryRouter initialEntries={['/admin/donations']}>
      <Routes>
        <Route
          path="/admin/donations"
          element={
            <SuperAdminRoute>
              <div>Donations Page</div>
            </SuperAdminRoute>
          }
        />
        <Route path="/admin/dashboard" element={<div>Admin Dashboard</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('SuperAdminRoute', () => {
  beforeEach(() => {
    mockUser = null;
  });

  it('renders children for a superadmin', () => {
    renderAt({ is_superuser: true, is_platform_staff: true, role: 'admin' });
    expect(screen.getByText('Donations Page')).toBeInTheDocument();
  });

  it('redirects a scoped (non-super) admin to the dashboard', () => {
    renderAt({ is_superuser: false, is_platform_staff: true, role: 'eagle' });
    expect(screen.queryByText('Donations Page')).not.toBeInTheDocument();
    expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
  });

  it('redirects when there is no user', () => {
    renderAt(null);
    expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
  });
});
