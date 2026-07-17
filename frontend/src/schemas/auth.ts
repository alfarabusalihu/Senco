import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, { message: 'Please enter your email.' })
    .email({ message: 'Please enter a valid email address.' }),
  password: z
    .string()
    .min(1, { message: 'Please enter your password.' }),
});

export const registerSchema = z
  .object({
    email: z
      .string()
      .min(1, { message: 'Email is required.' })
      .email({ message: 'Please enter a valid email address.' }),
    firstName: z
      .string()
      .min(1, { message: 'First name is required.' })
      .max(50, { message: 'First name cannot exceed 50 characters.' }),
    lastName: z
      .string()
      .min(1, { message: 'Last name is required.' })
      .max(50, { message: 'Last name cannot exceed 50 characters.' }),
    password: z
      .string()
      .min(6, { message: 'Password must be at least 6 characters long.' }),
    confirmPassword: z
      .string()
      .min(1, { message: 'Please confirm your password.' }),
    role: z.enum(['TEAM_MEMBER', 'PROJECT_MANAGER', 'ADMINISTRATOR']).default('TEAM_MEMBER'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  });

export type LoginFields = z.infer<typeof loginSchema>;
export type RegisterFields = z.infer<typeof registerSchema>;
