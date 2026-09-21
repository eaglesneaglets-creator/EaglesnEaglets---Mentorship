import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import MobilePrototypePage from './MobilePrototypePage';

describe('MobilePrototypePage', () => {
  it('switches between the primary mobile destinations', () => {
    render(<MobilePrototypePage />);
    fireEvent.click(screen.getByRole('button', { name: 'iOS concept' }));

    expect(screen.getByRole('heading', { name: 'Good morning, Ama' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Learn' }));
    expect(screen.getByRole('heading', { name: 'Grow at your pace' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Nest' }));
    expect(screen.getByRole('heading', { name: 'The Growth Nest' })).toBeInTheDocument();
  });

  it('customizes role content and opens the session sheet', () => {
    render(<MobilePrototypePage />);
    fireEvent.click(screen.getByRole('button', { name: 'iOS concept' }));

    fireEvent.change(screen.getAllByRole('combobox')[0], { target: { value: 'eagle' } });
    expect(screen.getByRole('heading', { name: 'Good morning, Daniel' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Mentoring with Empathy' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Resume lesson' }));
    expect(screen.getByRole('dialog', { name: 'Session details' })).toBeInTheDocument();
  });

  it('provides public and admin screen catalogues', () => {
    render(<MobilePrototypePage />);
    fireEvent.click(screen.getByRole('button', { name: 'iOS concept' }));

    fireEvent.change(screen.getAllByRole('combobox')[0], { target: { value: 'admin' } });
    expect(screen.getByRole('heading', { name: 'Admin dashboard' })).toBeInTheDocument();

    fireEvent.change(screen.getAllByRole('combobox')[1], { target: { value: 'users' } });
    expect(screen.getByRole('heading', { name: 'User management' })).toBeInTheDocument();

    fireEvent.change(screen.getAllByRole('combobox')[0], { target: { value: 'public' } });
    expect(screen.getByRole('heading', { name: 'Landing page' })).toBeInTheDocument();
  });

  it('uses the real application route for pixel-identical live previews', () => {
    render(<MobilePrototypePage />);

    expect(screen.getByTitle('Live web app preview: Dashboard')).toHaveAttribute('src', '/eaglet/dashboard');
    fireEvent.change(screen.getAllByRole('combobox')[0], { target: { value: 'public' } });
    fireEvent.change(screen.getAllByRole('combobox')[1], { target: { value: 'about' } });
    expect(screen.getByTitle('Live web app preview: About')).toHaveAttribute('src', '/about');
  });
});
