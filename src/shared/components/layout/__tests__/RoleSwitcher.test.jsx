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
