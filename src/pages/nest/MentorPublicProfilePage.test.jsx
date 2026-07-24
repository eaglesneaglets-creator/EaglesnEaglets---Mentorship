import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

// Mock the data hook so we can drive the page from a fixture.
const mockUseNestDetail = vi.fn();
vi.mock('../../modules/nest/hooks/useNests', () => ({
    useNestDetail: (...args) => mockUseNestDetail(...args),
}));

// DashboardLayout pulls auth/router context we don't need — stub to children.
vi.mock('../../shared/components/layout/DashboardLayout', () => ({
    default: ({ children }) => <div>{children}</div>,
}));

import MentorPublicProfilePage from './MentorPublicProfilePage';

const renderPage = () =>
    render(
        <MemoryRouter initialEntries={['/eaglet/mentor/nest-1']}>
            <MentorPublicProfilePage />
        </MemoryRouter>,
    );

const nestWithProfile = (overrides = {}) => ({
    data: {
        id: 'nest-1',
        name: "Joseph's Nest",
        industry_focus: 'Faith & Profession',
        member_count: 4,
        max_members: 20,
        current_program: null,
        eagle_details: { first_name: 'Joseph', last_name: 'Yidana' },
        mentor_profile: {
            display_picture: 'https://cdn.example.com/joseph.jpg',
            current_occupation: 'Software Engineer',
            area_of_expertise: 'Technology',
            profile_description: 'Guiding young builders in faith and craft for 6 years.',
            years_of_service: 6,
            location: 'Kumasi, Ghana',
            mentorship_types: ['Career', 'Faith', 'Tech'],
            kyc_verified: true,
        },
        ...overrides,
    },
});

describe('MentorPublicProfilePage', () => {
    it('renders the mentor as the subject, not the nest', () => {
        mockUseNestDetail.mockReturnValue({ data: nestWithProfile(), isLoading: false });
        renderPage();

        // Mentor name is the H1
        expect(screen.getByRole('heading', { level: 1, name: /Joseph Yidana/ })).toBeInTheDocument();
        // Occupation is the subtitle
        expect(screen.getByText('Software Engineer')).toBeInTheDocument();
        // Real photo
        expect(screen.getByRole('img', { name: /Joseph Yidana/ }))
            .toHaveAttribute('src', 'https://cdn.example.com/joseph.jpg');
        // Verified badge chip
        expect(screen.getByText('Verified')).toBeInTheDocument();
        // Credibility chips
        expect(screen.getByText(/6 yrs experience/)).toBeInTheDocument();
        expect(screen.getByText('Kumasi, Ghana')).toBeInTheDocument();
        // Nest name demoted to context line, NOT the hero subtitle
        expect(screen.getByText(/Join via/)).toBeInTheDocument();
    });

    it('has no fabricated content (What You\'ll Get / Session Format / placeholder tags)', () => {
        mockUseNestDetail.mockReturnValue({ data: nestWithProfile(), isLoading: false });
        renderPage();

        expect(screen.queryByText(/What You'll Get/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/Session Format/i)).not.toBeInTheDocument();
        // Placeholder fallback expertise from the old design must be gone
        expect(screen.queryByText('Leadership')).not.toBeInTheDocument();
        // Nest-internal stats dropped
        expect(screen.queryByText(/Points Awarded/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/Resources/i)).not.toBeInTheDocument();
    });

    it('degrades gracefully when mentor_profile is absent', () => {
        mockUseNestDetail.mockReturnValue({
            data: nestWithProfile({ mentor_profile: null, eagle_details: { first_name: 'Mary', last_name: 'Ann' } }),
            isLoading: false,
        });
        renderPage();

        // Name still renders (from eagle_details), no crash, no verified badge
        expect(screen.getByRole('heading', { level: 1, name: /Mary Ann/ })).toBeInTheDocument();
        expect(screen.queryByText('Verified')).not.toBeInTheDocument();
    });
});
