import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('@hooks/useFeatureLock', () => ({
    useFeatureLock: vi.fn(),
}));

import { useFeatureLock } from '@hooks/useFeatureLock';
import { FeatureLockGuard } from './FeatureLockGuard';

const renderWithRouter = (ui) => render(<MemoryRouter>{ui}</MemoryRouter>);

describe('FeatureLockGuard', () => {
    beforeEach(() => vi.clearAllMocks());

    it('renders children directly when feature is not locked', () => {
        useFeatureLock.mockReturnValue({ isLocked: false });

        renderWithRouter(
            <FeatureLockGuard featureKey="assignments">
                <div>Assignments content</div>
            </FeatureLockGuard>
        );

        expect(screen.getByText('Assignments content')).toBeInTheDocument();
        // No modal when unlocked
        expect(screen.queryByRole('dialog')).toBeNull();
    });

    it('renders blurred children + non-dismissable modal when locked', () => {
        useFeatureLock.mockReturnValue({ isLocked: true });

        renderWithRouter(
            <FeatureLockGuard featureKey="assignments">
                <div>Assignments content</div>
            </FeatureLockGuard>
        );

        // Underlying content still in DOM but pointer-events disabled + blurred
        expect(screen.getByText('Assignments content')).toBeInTheDocument();
        // Lock modal overlays
        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByText(/join a nest to unlock/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /go to nest/i })).toBeInTheDocument();
    });

    it('accepts leaderboard featureKey (plan 14.5-02)', () => {
        useFeatureLock.mockReturnValue({ isLocked: true });

        renderWithRouter(
            <FeatureLockGuard featureKey="leaderboard">
                <div>Leaderboard placeholder</div>
            </FeatureLockGuard>
        );

        // Modal renders for the new featureKey
        expect(screen.getByRole('dialog')).toBeInTheDocument();
        // Modal CTA always says "Go to Nest"
        expect(screen.getByRole('button', { name: /go to nest/i })).toBeInTheDocument();
        // Underlying placeholder still rendered (blurred)
        expect(screen.getByText('Leaderboard placeholder')).toBeInTheDocument();
    });
});
