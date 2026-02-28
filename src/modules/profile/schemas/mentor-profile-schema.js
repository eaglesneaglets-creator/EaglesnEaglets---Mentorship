/**
 * Mentor Profile Validation Schema
 */
import { z } from 'zod';

export const mentorProfileSchema = z.object({
  // Personal Information
  location: z.string().min(1, 'Location is required'),
  national_id_number: z.string().min(6, 'National ID must be at least 6 characters'),
  marital_status: z.string().min(1, 'Please select your marital status'),
  employment_status: z.string().min(1, 'Please select your employment status'),

  // Professional Profile
  profile_description: z
    .string()
    .min(100, 'Profile description must be at least 100 characters')
    .max(2000, 'Profile description must be less than 2000 characters'),
  linkedin_url: z
    .string()
    .url('Please enter a valid URL')
    .regex(/linkedin\.com/i, 'Please enter a valid LinkedIn URL')
    .optional()
    .or(z.literal('')),

  // Specialization
  mentorship_types: z
    .array(z.string())
    .min(1, 'Select at least one mentorship type')
    .max(6, 'You can select up to 6 mentorship types'),
});

export default mentorProfileSchema;
