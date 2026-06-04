import { z } from 'zod';
import { USER_ROLES } from '../../domain/entities/User';

const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email('A valid email address is required')
  .describe('Email used to identify the account');

export const registerBodySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(255, 'Name must be at most 255 characters')
    .describe('Full name of the user'),
  email: emailSchema,
  // bcrypt only considers the first 72 bytes, so a longer password is misleading
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(72, 'Password must be at most 72 characters')
    .describe('Plain-text password; hashed before storage'),
  role: z.enum(USER_ROLES).describe('Access profile assigned to the user'),
});

export type RegisterBody = z.infer<typeof registerBodySchema>;

export const loginBodySchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required').describe('Account password'),
});

export type LoginBody = z.infer<typeof loginBodySchema>;
