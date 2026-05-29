import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

// Mock the auth service the orchestrator calls.
const mockRegister = vi.fn();
const mockGetGoogleAuthUrl = vi.fn(() => Promise.resolve({ success: false, data: {} }));
const mockResend = vi.fn();

vi.mock('../../modules/auth/services/auth-service', () => ({
  authService: {
    register: (...a) => mockRegister(...a),
    getGoogleAuthUrl: (...a) => mockGetGoogleAuthUrl(...a),
    resendVerification: (...a) => mockResend(...a),
  },
}));

import RegisterPage from './RegisterPage';

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={['/register']}>
      <RegisterPage />
    </MemoryRouter>
  );

describe('RegisterPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows the role-first selection cards initially', () => {
    renderPage();
    expect(screen.getByText('I am an Eagle')).toBeInTheDocument();
    expect(screen.getByText('I am an Eaglet')).toBeInTheDocument();
  });

  it('reveals the details form (with Google SSO) after selecting a role', () => {
    renderPage();
    fireEvent.click(screen.getByText('I am an Eaglet'));
    expect(screen.getByText(/Continue with Google/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
  });

  it('passes the selected role into Google OAuth', async () => {
    renderPage();
    fireEvent.click(screen.getByText('I am an Eaglet'));
    fireEvent.click(screen.getByText(/Continue with Google/i));
    await waitFor(() => expect(mockGetGoogleAuthUrl).toHaveBeenCalledWith('eaglet'));
  });

  it('shows inline validation error on invalid email blur', async () => {
    renderPage();
    fireEvent.click(screen.getByText('I am an Eaglet'));
    const email = screen.getByLabelText(/Email Address/i);
    fireEvent.change(email, { target: { value: 'not-an-email' } });
    fireEvent.blur(email);
    await waitFor(() =>
      expect(screen.getByText(/valid email address/i)).toBeInTheDocument()
    );
  });

  it('renders the password strength meter as the user types', async () => {
    renderPage();
    fireEvent.click(screen.getByText('I am an Eaglet'));
    const pwd = screen.getByLabelText(/^Password/i);
    fireEvent.change(pwd, { target: { value: 'abc' } });
    await waitFor(() =>
      expect(screen.getByText(/Password strength:/i)).toBeInTheDocument()
    );
  });
});
