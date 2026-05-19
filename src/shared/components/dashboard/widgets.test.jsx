import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('@store', () => ({
    useActiveProgram: vi.fn(),
    usePendingProgramRequest: vi.fn(),
    useMenteeLevel: vi.fn(),
    useMentorEligibility: vi.fn(),
}));

import {
    useActiveProgram,
    usePendingProgramRequest,
    useMenteeLevel,
    useMentorEligibility,
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

    it('shows mentor eligibility banner when eligible', () => {
        useMenteeLevel.mockReturnValue({
            current_level: 5,
            next_threshold: null,
            progress_pct: 100,
            points: 5000,
        });
        useMentorEligibility.mockReturnValue(true);

        wrap(<MenteeLevelCard />);
        expect(screen.getByText(/Eligible to apply as mentor/i)).toBeInTheDocument();
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
});
