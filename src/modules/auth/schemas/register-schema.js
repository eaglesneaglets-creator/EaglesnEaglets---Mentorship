/**
 * Registration Validation Schema
 * Using Zod for form validation
 */

import { z } from 'zod';

// International phone number regex
// Accepts: +1234567890, 1234567890, +1 234 567 890, +1-234-567-890, etc.
// Supports 7-15 digits with optional country code (+) and separators (spaces, dashes, dots)
const internationalPhoneRegex = /^\+?[0-9]{1,4}[-.\s]?(\(?\d{1,4}\)?[-.\s]?)?[\d\s.-]{6,14}$/;

// Password requirements
const passwordSchema = z
  .string()
  .min(10, 'Password must be at least 10 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/\d/, 'Password must contain at least one number')
  .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain at least one special character');

/**
 * Registration Form Schema
 */
export const registerSchema = z
  .object({
    email: z
      .string()
      .min(1, 'Email is required')
      .email('Please enter a valid email address'),

    first_name: z
      .string()
      .min(2, 'First name must be at least 2 characters')
      .max(50, 'First name must be less than 50 characters'),

    last_name: z
      .string()
      .min(2, 'Last name must be at least 2 characters')
      .max(50, 'Last name must be less than 50 characters'),

    phone_number: z
      .string()
      .optional()
      .refine(
        (val) => !val || internationalPhoneRegex.test(val),
        'Please enter a valid phone number (e.g., +1 234 567 8900)'
      ),

    password: passwordSchema,

    password_confirm: z.string().min(1, 'Please confirm your password'),

    role: z.enum(['eagle', 'eaglet'], {
      required_error: 'Please select a role',
      invalid_type_error: 'Please select a valid role',
    }),

    terms_accepted: z
      .boolean()
      .refine((val) => val === true, 'You must accept the terms and conditions'),
  })
  .refine((data) => data.password === data.password_confirm, {
    message: 'Passwords do not match',
    path: ['password_confirm'],
  });

/**
 * Login Form Schema
 */
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),

  password: z.string().min(1, 'Password is required'),

  remember_me: z.boolean().optional(),
});

/**
 * Forgot Password Schema
 */
export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
});

/**
 * Reset Password Schema
 */
export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, 'Token is required'),

    new_password: passwordSchema,

    new_password_confirm: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.new_password === data.new_password_confirm, {
    message: 'Passwords do not match',
    path: ['new_password_confirm'],
  });

export default registerSchema;
