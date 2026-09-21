import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoadError from './LoadError';

describe('LoadError', () => {
  it('shows the title and error detail, and announces itself as an alert', () => {
    render(<LoadError title="Failed to load orders" detail="Network Error" />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Failed to load orders')).toBeInTheDocument();
    expect(screen.getByText('Network Error')).toBeInTheDocument();
  });

  it('calls onRetry when the retry control is clicked', async () => {
    const onRetry = vi.fn();
    render(<LoadError title="Failed" onRetry={onRetry} />);
    await userEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('renders no retry control when there is nothing to retry', () => {
    render(<LoadError title="Failed" />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('page variant uses the custom retry label and omits detail', async () => {
    const onRetry = vi.fn();
    render(<LoadError variant="page" title="Failed to load dashboard data" detail="hidden" retryLabel="Try again" onRetry={onRetry} />);
    expect(screen.queryByText('hidden')).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
