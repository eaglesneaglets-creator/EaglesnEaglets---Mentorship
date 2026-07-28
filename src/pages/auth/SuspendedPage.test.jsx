import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import SuspendedPage from './SuspendedPage';

const renderPage = () =>
  render(
    <MemoryRouter>
      <SuspendedPage />
    </MemoryRouter>,
  );

describe('SuspendedPage', () => {
  it('explains the suspension and offers a support contact', () => {
    renderPage();

    expect(
      screen.getByRole('heading', { name: /account has been suspended/i }),
    ).toBeInTheDocument();

    const support = screen.getByRole('link', { name: /contact support/i });
    expect(support).toHaveAttribute(
      'href',
      expect.stringContaining('mailto:info.eaglesandeaglets@gmail.com'),
    );
  });

  it('offers a route back to sign in', () => {
    renderPage();
    expect(screen.getByRole('link', { name: /return to sign in/i }))
      .toHaveAttribute('href', '/login');
  });

  it('does not leak an internal suspension reason', () => {
    renderPage();
    // The page is deliberately generic — admin-entered reasons stay internal.
    expect(screen.queryByText(/reason:/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/violation/i)).not.toBeInTheDocument();
  });
});
