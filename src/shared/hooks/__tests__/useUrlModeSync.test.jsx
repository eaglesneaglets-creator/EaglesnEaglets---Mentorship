import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

const mockSetMode = vi.fn();
let mockMode = 'mentor';
let mockStacked = true;
let mockRole = 'eagle';

vi.mock('@store', () => ({
  useIsStackedAdmin: () => mockStacked,
  useCurrentMode: () => mockMode,
  useSetCurrentMode: () => mockSetMode,
  // Plan 22-02: hook now reads user.role to pick the right non-admin fallback mode.
  useAuthStore: (selector) => selector({ user: { role: mockRole } }),
}));

import useUrlModeSync from '../useUrlModeSync';

const wrap = (path) => ({ children }) => (
  <MemoryRouter initialEntries={[path]}>{children}</MemoryRouter>
);

describe('useUrlModeSync', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockMode = 'mentor';
    mockStacked = true;
    mockRole = 'eagle';
  });

  it('flips to admin when stacked user lands on /admin/* in mentor mode', () => {
    renderHook(() => useUrlModeSync(), { wrapper: wrap('/admin/kyc') });
    expect(mockSetMode).toHaveBeenCalledWith('admin');
  });

  it('flips to mentor when stacked user leaves admin section while in admin mode', () => {
    mockMode = 'admin';
    renderHook(() => useUrlModeSync(), { wrapper: wrap('/dashboard') });
    expect(mockSetMode).toHaveBeenCalledWith('mentor');
  });

  it('does nothing for non-stacked users', () => {
    mockStacked = false;
    renderHook(() => useUrlModeSync(), { wrapper: wrap('/admin/kyc') });
    expect(mockSetMode).not.toHaveBeenCalled();
  });

  it('does not re-fire when mode already matches the route', () => {
    mockMode = 'admin';
    renderHook(() => useUrlModeSync(), { wrapper: wrap('/admin/kyc') });
    expect(mockSetMode).not.toHaveBeenCalled();
  });

  // Plan 22-02: eaglet+staff fallback is 'mentee', not 'mentor'.
  it('stacked-mentee leaving admin section flips to mentee, not mentor', () => {
    mockMode = 'admin';
    mockRole = 'eaglet';
    renderHook(() => useUrlModeSync(), { wrapper: wrap('/eaglet/dashboard') });
    expect(mockSetMode).toHaveBeenCalledWith('mentee');
  });

  it('stacked-mentee landing on /admin/* still flips to admin', () => {
    mockMode = 'mentee';
    mockRole = 'eaglet';
    renderHook(() => useUrlModeSync(), { wrapper: wrap('/admin/users') });
    expect(mockSetMode).toHaveBeenCalledWith('admin');
  });
});
