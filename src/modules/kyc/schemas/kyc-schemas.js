import { z } from 'zod';

export const mentorKycSchema = z.object({
    full_name: z.string().min(2, 'Full name is required'),
    national_id_number: z.string().min(4, 'ID number is required'),
    marital_status: z.enum(['single', 'married', 'divorced', 'widowed'], {
        errorMap: () => ({ message: 'Select your marital status' }),
    }),
    phone_number: z.string().min(7, 'Phone number is required'),
    location: z.string().min(2, 'City and country is required'),
    employment_status: z.enum(['employed', 'self_employed', 'student', 'unemployed'], {
        errorMap: () => ({ message: 'Select your employment status' }),
    }),
    linkedin_url: z.string().url('Invalid URL').or(z.literal('')).optional(),
    profile_description: z.string().min(100, 'Bio must be at least 100 characters'),
    mentorship_types: z.array(z.string()).min(1, 'Select at least one area').max(6),
    agree: z.literal(true, { errorMap: () => ({ message: 'You must agree to continue' }) }),
});

export const menteeKycSchema = z.object({
    full_name: z.string().min(2, 'Full name is required'),
    national_id_number: z.string().min(4, 'ID number is required'),
    marital_status: z.enum(['single', 'married', 'divorced', 'widowed'], {
        errorMap: () => ({ message: 'Select your marital status' }),
    }),
    phone_number: z.string().min(7, 'Phone number is required'),
    country: z.string().min(2, 'Select a country'),
    city: z.string().min(2, 'City is required'),
    employment_status: z.enum(['employed', 'self_employed', 'student', 'unemployed'], {
        errorMap: () => ({ message: 'Select your status' }),
    }),
    linkedin_url: z.string().url('Invalid URL').or(z.literal('')).optional(),
    bio: z.string().min(50, 'Bio must be at least 50 characters'),
    mentorship_types: z.array(z.string()).min(1, 'Select at least one area').max(6),
    agree: z.literal(true, { errorMap: () => ({ message: 'You must agree to continue' }) }),
});

export const MENTORSHIP_TYPES = [
    { value: 'career_growth', label: 'Career Growth', icon: 'Briefcase' },
    { value: 'leadership', label: 'Leadership Development', icon: 'Flag' },
    { value: 'entrepreneurship', label: 'Entrepreneurship', icon: 'Rocket' },
    { value: 'technology', label: 'Technology Skills', icon: 'Cpu' },
    { value: 'personal_development', label: 'Personal Development', icon: 'Sparkles' },
    { value: 'spirituality', label: 'Spirituality', icon: 'Heart' },
];

export const MARITAL_STATUS_OPTIONS = [
    { value: 'single', label: 'Single' },
    { value: 'married', label: 'Married' },
    { value: 'divorced', label: 'Divorced' },
    { value: 'widowed', label: 'Widowed' },
];

export const EMPLOYMENT_STATUS_OPTIONS = [
    { value: 'employed', label: 'Employed' },
    { value: 'self_employed', label: 'Self-Employed' },
    { value: 'student', label: 'Student' },
    { value: 'unemployed', label: 'Unemployed' },
];

export const COUNTRY_OPTIONS = [
    'United States', 'Nigeria', 'Kenya', 'Ghana', 'South Africa',
    'United Kingdom', 'Canada', 'Germany', 'India', 'Brazil', 'Other',
].map((c) => ({ value: c, label: c }));
