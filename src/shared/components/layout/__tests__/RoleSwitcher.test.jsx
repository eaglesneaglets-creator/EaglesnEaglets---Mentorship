import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

const mockSetMode = vi.fn();
const mockNavigate = vi.fn();
let mockMode = 'mentor';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock('@store', () => ({
  useCurrentMode: () => mockMode,
  useSetCurrentMode: () => mockSetMode,
}));

import RoleSwitcher from '../RoleSwitcher';

const wrap = (props = {}) =>
  render(
    <MemoryRouter>
      <RoleSwitcher
        user={{ first_name: 'Fin', last_name: 'Gojo' }}
        onClose={() => {}}
        onLogout={() => {}}
        {...props}
      />
    </MemoryRouter>,
  );

describe('RoleSwitcher', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockMode = 'mentor';
  });

  it('renders the role badge with current mode', () => {
    wrap();
    expect(screen.getByText('Mentor')).toBeInTheDocument();
  });

  it('shows dropdown after click + lists both modes with checkmark on current', async () => {
    wrap();
    await userEvent.click(screen.getByRole('button', { name: /fin gojo/i }));
    // Both options visible
    expect(screen.getByRole('menuitem', { name: /administrator/i })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: /mentor/i })).toBeInTheDocument();
    // Checkmark on current (mentor)
    const mentorItem = screen.getByRole('menuitem', { name: /mentor/i });
    expect(mentorItem.textContent).toMatch(/check/i);
  });

  it('switching mode calls setCurrentMode + navigates to that mode home', async () => {
    wrap();
    await userEvent.click(screen.getByRole('button', { name: /fin gojo/i }));
    await userEvent.click(screen.getByRole('menuitem', { name: /administrator/i }));
    expect(mockSetMode).toHaveBeenCalledWith('admin');
    expect(mockNavigate).toHaveBeenCalledWith('/admin/dashboard');
  });

  it('clicking current mode does not setCurrentMode but still navigates', async () => {
    wrap();
    await userEvent.click(screen.getByRole('button', { name: /fin gojo/i }));
    await userEvent.click(screen.getByRole('menuitem', { name: /mentor/i }));
    expect(mockSetMode).not.toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
  });

  it('escape key closes the dropdown', async () => {
    wrap();
    await userEvent.click(screen.getByRole('button', { name: /fin gojo/i }));
    expect(screen.getByRole('menu')).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('collapsed variant renders icon-only trigger', () => {
    wrap({ variant: 'collapsed' });
    // No "Fin Gojo" name text in collapsed mode
    expect(screen.queryByText(/fin gojo/i)).not.toBeInTheDocument();
    // But the trigger button with initials is present
    expect(screen.getByRole('button', { name: 'FG' })).toBeInTheDocument();
  });

  it('badge shows Administrator when admin mode is current', () => {
    mockMode = 'admin';
    wrap();
    expect(screen.getByText('Administrator')).toBeInTheDocument();
  });
});

// Plan 22-02: stacked-mentee (eaglet + is_platform_staff) renders "Mentee" instead of "Mentor".
describe('RoleSwitcher — stacked-mentee', () => {
  const mentee = {
    first_name: 'Ada',
    last_name: 'Mente',
    role: 'eaglet',
    is_platform_staff: true,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockMode = 'mentee';
  });

  it('badge reads "Mentee" when role is eaglet and currentMode is mentee', () => {
    wrap({ user: mentee });
    expect(screen.getByText('Mentee')).toBeInTheDocument();
    expect(screen.queryByText('Mentor')).not.toBeInTheDocument();
  });

  it('dropdown lists Administrator + Mentee (not Mentor)', async () => {
    wrap({ user: mentee });
    await userEvent.click(screen.getByRole('button', { name: /ada mente/i }));
    expect(screen.getByRole('menuitem', { name: /administrator/i })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: /mentee/i })).toBeInTheDocument();
    expect(screen.queryByRole('menuitem', { name: /^mentor$/i })).not.toBeInTheDocument();
  });

  it('switching to admin mode calls setCurrentMode("admin")', async () => {
    wrap({ user: mentee });
    await userEvent.click(screen.getByRole('button', { name: /ada mente/i }));
    await userEvent.click(screen.getByRole('menuitem', { name: /administrator/i }));
    expect(mockSetMode).toHaveBeenCalledWith('admin');
    expect(mockNavigate).toHaveBeenCalledWith('/admin/dashboard');
  });

  it('admin badge shows Administrator regardless of base role', () => {
    mockMode = 'admin';
    wrap({ user: mentee });
    expect(screen.getByText('Administrator')).toBeInTheDocument();
  });
});
