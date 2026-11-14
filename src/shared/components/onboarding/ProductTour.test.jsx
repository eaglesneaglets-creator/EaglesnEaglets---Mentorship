import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProductTour from './ProductTour';
import { getTour } from './tour-definitions';

const TOUR = {
  id: 'test-tour-v1',
  welcome: { title: 'Welcome aboard', body: 'A quick look around.' },
  steps: [
    { target: 'nav-dashboard', title: 'First stop', body: 'One' },
    { target: 'missing-target', title: 'Second stop', body: 'Two' },
  ],
};

const renderTour = (onFinish = vi.fn()) => {
  render(
    <>
      <a data-tour="nav-dashboard" href="/x" style={{ display: 'block', width: 100, height: 20 }}>Dashboard</a>
      <ProductTour tour={TOUR} open onFinish={onFinish} />
    </>,
  );
  return onFinish;
};

describe('ProductTour', () => {
  it('starts on a welcome screen with a way out', async () => {
    const onFinish = renderTour();
    expect(screen.getByRole('heading', { name: 'Welcome aboard' })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /not now/i }));
    expect(onFinish).toHaveBeenCalledWith({ completed: false });
  });

  it('steps through to Finish and reports completion', async () => {
    const onFinish = renderTour();
    await userEvent.click(screen.getByRole('button', { name: /show me around/i }));
    expect(screen.getByText('Step 1 of 2')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'First stop' })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /^next$/i }));
    // Target not on screen -> still shows a (centred) card rather than breaking.
    expect(screen.getByRole('heading', { name: 'Second stop' })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /^back$/i }));
    expect(screen.getByRole('heading', { name: 'First stop' })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /^next$/i }));
    await userEvent.click(screen.getByRole('button', { name: /^finish$/i }));
    expect(onFinish).toHaveBeenCalledWith({ completed: true });
  });

  it('Skip tour and Escape end it without completing', async () => {
    const onFinish = renderTour();
    await userEvent.click(screen.getByRole('button', { name: /show me around/i }));
    await userEvent.click(screen.getByRole('button', { name: /skip tour/i }));
    expect(onFinish).toHaveBeenLastCalledWith({ completed: false });
  });
});

describe('tour definitions', () => {
  it('tells un-enrolled mentees to find a mentor first', () => {
    const titles = getTour({ view: 'eaglet', hasActiveProgram: false }).steps.map((s) => s.title);
    expect(titles).toContain('Find your mentor');
    expect(getTour({ view: 'eaglet', hasActiveProgram: true }).steps.map((s) => s.title)).toContain('Your nest');
  });

  it('only shows superadmin surfaces to superadmins', () => {
    const scoped = getTour({ view: 'admin', isSuperAdmin: false }).steps.map((s) => s.target);
    const superadmin = getTour({ view: 'admin', isSuperAdmin: true }).steps.map((s) => s.target);
    expect(scoped).not.toContain('nav-nests');
    expect(superadmin).toContain('nav-nests');
  });

  it('every tour has a versioned id and steps with copy', () => {
    for (const view of ['eaglet', 'eagle', 'admin']) {
      const tour = getTour({ view });
      expect(tour.id).toMatch(/^[a-z0-9-]+-v\d+$/);
      tour.steps.forEach((s) => {
        expect(s.target).toBeTruthy();
        expect(s.title.length).toBeGreaterThan(3);
        expect(s.body.length).toBeGreaterThan(20);
      });
    }
  });
});
