/**
 * Mentee Profile Validation Schema
 */
import { z } from 'zod';

// Ghana phone number regex
const ghanaPhoneRegex = /^(\+233|0)[2-9][0-9]{8}$/;

export const menteeProfileSchema = z.object({
  // Personal Information
  national_id_number: z.string().min(6, 'National ID must be at least 6 characters'),
  marital_status: z.string().min(1, 'Please select your marital status'),
  country: z.string().min(1, 'Country is required'),
  city: z.string().min(1, 'City is required'),
  location: z.string().optional(),

  // Contact
  phone_number: z
    .string()
    .min(1, 'Phone number is required')
    .refine(
      (val) => ghanaPhoneRegex.test(val.replace(/[\s-]/g, '')),
      'Please enter a valid Ghana phone number (e.g., +233 XX XXX XXXX or 0XX XXX XXXX)'
    ),

  // Professional
  employment_status: z.string().min(1, 'Please select your employment status'),
  linkedin_url: z
    .string()
    .url('Please enter a valid URL')
    .regex(/linkedin\.com/i, 'Please enter a valid LinkedIn URL')
    .optional()
    .or(z.literal('')),

  // Profile
  bio: z
    .string()
    .min(50, 'Tell us more about yourself (at least 50 characters)')
    .max(1000, 'Bio must be less than 1000 characters'),

  // Preferences
  mentorship_types: z
    .array(z.string())
    .min(1, 'Select at least one mentorship type')
    .max(6, 'You can select up to 6 mentorship types'),
});

export default menteeProfileSchema;
