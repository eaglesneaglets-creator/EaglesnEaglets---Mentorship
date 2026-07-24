import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import MentorCard from './MentorCard';

const fullNest = {
  id: 'nest-1',
  name: "Richard's Nest",
  eagle_name: 'Richard Densu',
  description: 'Nest-level description.',
  member_count: 5,
  mentor_profile: {
    display_picture: 'https://cdn.example.com/richard.jpg',
    current_occupation: 'Financial Analyst',
    area_of_expertise: 'Finance',
    profile_description: 'Guiding young professionals in stewardship for 8 years.',
    years_of_service: 8,
    location: 'Accra, Ghana',
    mentorship_types: ['Career', 'Faith', 'Finance', 'Extra'],
    kyc_verified: true,
  },
};

const bareNest = {
  id: 'nest-2',
  name: "Joseph's Nest",
  eagle_name: 'Joseph Yidana',
  description: 'Nest-level description only.',
  member_count: 0,
  mentor_profile: null,
};

const renderCard = (nest) =>
  render(
    <MemoryRouter>
      <MentorCard nest={nest} index={0} />
    </MemoryRouter>,
  );

describe('MentorCard', () => {
  it('renders person-first data from mentor_profile', () => {
    renderCard(fullNest);
    expect(screen.getByRole('heading', { name: 'Richard Densu' })).toBeInTheDocument();
    // Occupation as subtitle (not the nest name)
    expect(screen.getByText('Financial Analyst')).toBeInTheDocument();
    // Real bio
    expect(screen.getByText(/Guiding young professionals in stewardship/)).toBeInTheDocument();
    // Expertise chips (capped at 3 — 'Extra' must NOT show)
    expect(screen.getByText('Career')).toBeInTheDocument();
    expect(screen.getByText('Faith')).toBeInTheDocument();
    expect(screen.queryByText('Extra')).not.toBeInTheDocument();
    // Credibility row
    expect(screen.getByText(/8 yrs experience/)).toBeInTheDocument();
    expect(screen.getByText('Accra, Ghana')).toBeInTheDocument();
    // Verified badge
    expect(screen.getByTitle('Verified mentor')).toBeInTheDocument();
    // Real avatar image
    expect(screen.getByRole('img', { name: 'Richard Densu' })).toHaveAttribute('src', 'https://cdn.example.com/richard.jpg');
    // No resources metric anywhere
    expect(screen.queryByText(/resources/i)).not.toBeInTheDocument();
  });

  it('degrades gracefully when mentor_profile is null', () => {
    renderCard(bareNest);
    // Name still renders + initials fallback (no crash)
    expect(screen.getByRole('heading', { name: 'Joseph Yidana' })).toBeInTheDocument();
    // No occupation subtitle line, no verified badge
    expect(screen.queryByTitle('Verified mentor')).not.toBeInTheDocument();
    // No resources metric
    expect(screen.queryByText(/resources/i)).not.toBeInTheDocument();
    // CTA present
    expect(screen.getByRole('link', { name: /View Profile/i })).toBeInTheDocument();
  });
});
