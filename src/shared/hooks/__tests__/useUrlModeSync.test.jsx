import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

const mockSetMode = vi.fn();
let mockMode = 'mentor';
let mockStacked = true;

vi.mock('@store', () => ({
  useIsStackedAdmin: () => mockStacked,
  useCurrentMode: () => mockMode,
  useSetCurrentMode: () => mockSetMode,
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
});
