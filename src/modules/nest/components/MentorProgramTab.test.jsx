import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import MentorProgramTab from './MentorProgramTab';

describe('MentorProgramTab', () => {
    it('renders empty state when program is null', () => {
        render(<MentorProgramTab program={null} />);
        expect(screen.getByText(/no active program yet/i)).toBeInTheDocument();
        expect(screen.getByText(/hasn't published a program/i)).toBeInTheDocument();
    });

    it('renders program with objectives and rule summaries', () => {
        const program = {
            id: 'p1',
            name: 'Growth Program',
            description: 'Help mentees grow into Eagles.',
            objectives: [
                { id: 'o1', title: 'Master Modules', rule_summary: 'Complete 3 modules' },
                {
                    id: 'o2',
                    title: 'Engage',
                    rule_summary: 'Pass 5 assignments · Maintain a 7-day streak',
                },
            ],
        };
        render(<MentorProgramTab program={program} />);
        expect(screen.getByText('Growth Program')).toBeInTheDocument();
        expect(screen.getByText(/help mentees grow/i)).toBeInTheDocument();
        expect(screen.getByText('Master Modules')).toBeInTheDocument();
        expect(screen.getByText('Complete 3 modules')).toBeInTheDocument();
        expect(screen.getByText('Engage')).toBeInTheDocument();
        expect(screen.getByText(/Pass 5 assignments · Maintain a 7-day streak/)).toBeInTheDocument();
    });

    it('renders objectives-empty fallback when program has no objectives', () => {
        const program = {
            id: 'p2', name: 'Skeleton Program', description: '', objectives: [],
        };
        render(<MentorProgramTab program={program} />);
        expect(screen.getByText('Skeleton Program')).toBeInTheDocument();
        expect(screen.getByText(/hasn't added objectives yet/i)).toBeInTheDocument();
    });
});
