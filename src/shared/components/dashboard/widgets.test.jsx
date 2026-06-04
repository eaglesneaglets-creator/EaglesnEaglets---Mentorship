import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('@store', () => ({
    useActiveProgram: vi.fn(),
    usePendingProgramRequest: vi.fn(),
    useMenteeLevel: vi.fn(),
    useMentorEligibility: vi.fn(),
    useMentorApplicationStatus: vi.fn(),
    useMentorApplicationEligible: vi.fn(),
}));

import {
    useActiveProgram,
    usePendingProgramRequest,
    useMenteeLevel,
    useMentorEligibility,
    useMentorApplicationStatus,
    useMentorApplicationEligible,
} from '@store';
import ActiveProgramCard from './ActiveProgramCard';
import MenteeLevelCard from './MenteeLevelCard';

const wrap = (ui) => render(<MemoryRouter>{ui}</MemoryRouter>);

describe('ActiveProgramCard', () => {
    beforeEach(() => vi.clearAllMocks());

    it('renders active program details', () => {
        useActiveProgram.mockReturnValue({
            name: 'Leadership 101',
            nest_name: 'Eagle Nest',
            objectives_count: 3,
            objectives_completed: 1,
        });
        usePendingProgramRequest.mockReturnValue(null);

        wrap(<ActiveProgramCard />);
        expect(screen.getByText('Leadership 101')).toBeInTheDocument();
        expect(screen.getByText(/in Eagle Nest/)).toBeInTheDocument();
        expect(screen.getByText(/3 objectives/)).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /open nest/i })).toHaveAttribute('href', '/eaglet/nest');
    });

    it('renders pending state when only pending request', () => {
        useActiveProgram.mockReturnValue(null);
        usePendingProgramRequest.mockReturnValue({ nest_name: 'Builder Nest' });

        wrap(<ActiveProgramCard />);
        expect(screen.getByText(/Application Pending/i)).toBeInTheDocument();
        expect(screen.getByText(/Builder Nest/)).toBeInTheDocument();
    });

    it('renders empty CTA when no program and no pending', () => {
        useActiveProgram.mockReturnValue(null);
        usePendingProgramRequest.mockReturnValue(null);

        wrap(<ActiveProgramCard />);
        expect(screen.getByText(/Join a Community/i)).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /browse communities/i }))
            .toHaveAttribute('href', '/eaglet/nest');
    });
});

describe('MenteeLevelCard', () => {
    beforeEach(() => vi.clearAllMocks());

    it('returns null when no level data', () => {
        useMenteeLevel.mockReturnValue(null);
        useMentorEligibility.mockReturnValue(false);

        const { container } = wrap(<MenteeLevelCard />);
        expect(container.firstChild).toBeNull();
    });

    it('renders level + progress + points', () => {
        useMenteeLevel.mockReturnValue({
            current_level: 3,
            next_threshold: 1500,
            progress_pct: 60,
            points: 1200,
        });
        useMentorEligibility.mockReturnValue(false);

        wrap(<MenteeLevelCard />);
        expect(screen.getByText(/Level 3/)).toBeInTheDocument();
        expect(screen.getByText(/1,200 pts/)).toBeInTheDocument();
        expect(screen.getByText(/Next: 1,500 pts/)).toBeInTheDocument();
    });

    it('shows mentor apply CTA when eligible + no application', () => {
        useMenteeLevel.mockReturnValue({
            current_level: 5,
            next_threshold: null,
            progress_pct: 100,
            points: 5000,
        });
        useMentorEligibility.mockReturnValue(true);
        useMentorApplicationEligible.mockReturnValue(true);
        useMentorApplicationStatus.mockReturnValue(null);

        wrap(<MenteeLevelCard />);
        const link = screen.getByRole('link', { name: /Apply to become a mentor/i });
        expect(link).toHaveAttribute('href', '/eaglet/mentor-application');
    });

    it('hides next threshold at level 5', () => {
        useMenteeLevel.mockReturnValue({
            current_level: 5,
            next_threshold: null,
            progress_pct: 100,
            points: 5000,
        });
        useMentorEligibility.mockReturnValue(true);

        wrap(<MenteeLevelCard />);
        expect(screen.queryByText(/Next:/i)).not.toBeInTheDocument();
    });

    describe('mentor application strip states', () => {
        beforeEach(() => {
            vi.clearAllMocks();
            useMenteeLevel.mockReturnValue({
                current_level: 5,
                next_threshold: null,
                progress_pct: 100,
                points: 5000,
            });
            useMentorEligibility.mockReturnValue(true);
        });

        it('submitted → shows amber pending pill, no apply link', () => {
            useMentorApplicationEligible.mockReturnValue(true);
            useMentorApplicationStatus.mockReturnValue('submitted');

            wrap(<MenteeLevelCard />);
            expect(screen.getByText(/Application pending/i)).toBeInTheDocument();
            expect(screen.queryByRole('link', { name: /Apply to become a mentor/i })).toBeNull();
        });

        it('approved → shows emerald banner + mentor dashboard link', () => {
            useMentorApplicationEligible.mockReturnValue(true);
            useMentorApplicationStatus.mockReturnValue('approved');

            wrap(<MenteeLevelCard />);
            expect(screen.getByText(/You’re now a mentor/i)).toBeInTheDocument();
            expect(screen.getByRole('link', { name: /Open mentor dashboard/i }))
                .toHaveAttribute('href', '/eagle/dashboard');
        });

        it('rejected → shows red banner + re-apply link to application page', () => {
            useMentorApplicationEligible.mockReturnValue(true);
            useMentorApplicationStatus.mockReturnValue('rejected');

            wrap(<MenteeLevelCard />);
            expect(screen.getByText(/Application not approved/i)).toBeInTheDocument();
            expect(screen.getByRole('link', { name: /Re-apply/i }))
                .toHaveAttribute('href', '/eaglet/mentor-application');
        });

        it('eligible + no app → renders apply CTA', () => {
            useMentorApplicationEligible.mockReturnValue(true);
            useMentorApplicationStatus.mockReturnValue(null);

            wrap(<MenteeLevelCard />);
            expect(screen.getByRole('link', { name: /Apply to become a mentor/i }))
                .toHaveAttribute('href', '/eaglet/mentor-application');
        });

        it('withdrawn → shows withdrawn banner (not generic apply CTA)', () => {
            useMentorApplicationEligible.mockReturnValue(true);
            useMentorApplicationStatus.mockReturnValue('withdrawn');

            wrap(<MenteeLevelCard />);
            expect(screen.getByText(/Application withdrawn/i)).toBeInTheDocument();
            expect(screen.queryByText(/Apply to become a mentor/i)).toBeNull();
            expect(screen.getByRole('link', { name: /Re-apply/i }))
                .toHaveAttribute('href', '/eaglet/mentor-application');
        });

        it('ineligible but has submitted app → still shows pending status', () => {
            // User lost eligibility after submitting (e.g. points dropped); they
            // must still see their pending application.
            useMentorApplicationEligible.mockReturnValue(false);
            useMentorApplicationStatus.mockReturnValue('submitted');

            wrap(<MenteeLevelCard />);
            expect(screen.getByText(/Application pending/i)).toBeInTheDocument();
        });
    });
});
