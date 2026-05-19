import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { LockedFeatureModal } from './LockedFeatureModal';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return { ...actual, useNavigate: () => mockNavigate };
});

const renderModal = (props = {}) =>
    render(
        <MemoryRouter>
            <LockedFeatureModal open featureKey="assignments" {...props} />
        </MemoryRouter>,
    );

describe('LockedFeatureModal', () => {
    beforeEach(() => mockNavigate.mockReset());

    it('renders nothing when open=false', () => {
        const { container } = render(
            <MemoryRouter>
                <LockedFeatureModal open={false} featureKey="assignments" />
            </MemoryRouter>,
        );
        expect(container).toBeEmptyDOMElement();
    });

    it('shows the lock title and feature label', () => {
        renderModal({ featureKey: 'leaderboard' });
        expect(screen.getByText(/join a nest to unlock/i)).toBeInTheDocument();
        expect(screen.getByText(/leaderboard/i)).toBeInTheDocument();
    });

    it('has no close (X) button — non-dismissable', () => {
        renderModal();
        // Exactly one button — the CTA — and no aria-label="close" affordance.
        const buttons = screen.getAllByRole('button');
        expect(buttons).toHaveLength(1);
        expect(screen.queryByLabelText(/close/i)).toBeNull();
    });

    it('clicking the overlay does NOT close the modal', () => {
        renderModal();
        const dialog = screen.getByRole('dialog');
        fireEvent.click(dialog); // overlay click
        // Modal still rendered
        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByText(/join a nest to unlock/i)).toBeInTheDocument();
    });

    it('CTA navigates to /eaglet/nest', () => {
        renderModal();
        fireEvent.click(screen.getByRole('button', { name: /go to nest/i }));
        expect(mockNavigate).toHaveBeenCalledWith('/eaglet/nest');
    });
});
