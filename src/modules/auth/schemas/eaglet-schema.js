/**
 * Eaglet Profile Validation Schemas
 * Using Zod for form validation
 */

import { z } from 'zod';

// Age group choices
export const AGE_GROUPS = [
  { value: '13_17', label: '13-17 years' },
  { value: '18_24', label: '18-24 years' },
  { value: '25_34', label: '25-34 years' },
  { value: '35_44', label: '35-44 years' },
  { value: '45_plus', label: '45+ years' },
];

// Educational level choices
export const EDUCATIONAL_LEVELS = [
  { value: 'high_school', label: 'High School' },
  { value: 'undergraduate', label: 'Undergraduate' },
  { value: 'graduate', label: 'Graduate/Postgraduate' },
  { value: 'professional', label: 'Working Professional' },
  { value: 'other', label: 'Other' },
];

// Mentorship interest choices (what eaglets want to learn)
export const MENTORSHIP_INTERESTS = [
  { value: 'career_advice', label: 'Career Advice' },
  { value: 'technical_skills', label: 'Technical Skills' },
  { value: 'leadership', label: 'Leadership Development' },
  { value: 'interview_prep', label: 'Interview Preparation' },
  { value: 'salary_negotiation', label: 'Salary Negotiation' },
  { value: 'spiritual_growth', label: 'Spiritual Growth' },
  { value: 'life_coaching', label: 'Life Coaching' },
  { value: 'academic_support', label: 'Academic Support' },
  { value: 'entrepreneurship', label: 'Entrepreneurship' },
  { value: 'networking', label: 'Networking & Connections' },
  { value: 'work_life_balance', label: 'Work-Life Balance' },
  { value: 'communication_skills', label: 'Communication Skills' },
];

// Mentorship goal choices
export const MENTORSHIP_GOALS = [
  { value: 'career_growth', label: 'Career Growth' },
  { value: 'skill_development', label: 'Skill Development' },
  { value: 'spiritual_guidance', label: 'Spiritual Guidance' },
  { value: 'academic_support', label: 'Academic Support' },
  { value: 'leadership_training', label: 'Leadership Training' },
  { value: 'entrepreneurship', label: 'Starting a Business' },
  { value: 'personal_development', label: 'Personal Development' },
  { value: 'networking', label: 'Building Connections' },
];

// Mentor expertise choices (what kind of mentor they prefer)
export const MENTOR_EXPERTISE = [
  { value: 'spiritual_leadership', label: 'Spiritual Leadership' },
  { value: 'youth_ministry', label: 'Youth Ministry' },
  { value: 'career_guidance', label: 'Career Guidance' },
  { value: 'business_mentoring', label: 'Business & Entrepreneurship' },
  { value: 'education', label: 'Education & Academic' },
  { value: 'technology', label: 'Technology & Innovation' },
  { value: 'creative_arts', label: 'Creative Arts & Media' },
  { value: 'health_wellness', label: 'Health & Wellness' },
  { value: 'financial_literacy', label: 'Financial Literacy' },
  { value: 'personal_development', label: 'Personal Development' },
];

/**
 * Eaglet Onboarding Schema (Required fields)
 */
export const eagletOnboardingSchema = z.object({
  age_group: z.string().min(1, 'Please select your age group'),

  educational_level: z.string().min(1, 'Please select your educational level'),

  interests: z
    .array(z.string())
    .min(1, 'Please select at least one interest')
    .max(10, 'Please select no more than 10 interests'),

  goals: z
    .array(z.string())
    .min(1, 'Please select at least one goal')
    .max(5, 'Please select no more than 5 goals'),

  // Optional fields
  field_of_study: z.string().optional(),
  institution: z.string().optional(),
  preferred_mentor_expertise: z.array(z.string()).optional(),
  bio: z.string().max(500, 'Bio must be 500 characters or less').optional(),
  expectations: z.string().max(1000, 'Expectations must be 1000 characters or less').optional(),
});

/**
 * Eaglet Profile Update Schema (All optional)
 */
export const eagletProfileUpdateSchema = z.object({
  age_group: z.string().optional(),
  educational_level: z.string().optional(),
  field_of_study: z.string().optional(),
  institution: z.string().optional(),
  interests: z.array(z.string()).max(10).optional(),
  goals: z.array(z.string()).max(5).optional(),
  preferred_mentor_expertise: z.array(z.string()).max(5).optional(),
  bio: z.string().max(500).optional(),
  expectations: z.string().max(1000).optional(),
});

export default eagletOnboardingSchema;
