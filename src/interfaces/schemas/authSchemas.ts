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

export const refreshBodySchema = z.object({
  refreshToken: z
    .string()
    .min(1, 'Refresh token is required')
    .describe('Refresh token previously issued at login'),
});

export type RefreshBody = z.infer<typeof refreshBodySchema>;

const userResponseSchema = z
  .object({
    id: z.string().uuid(),
    name: z.string(),
    email: z.string().email(),
    role: z.enum(USER_ROLES),
    createdAt: z.string().datetime(),
  })
  .describe('Public representation of a user, without the password hash');

export const authTokensResponseSchema = z.object({
  user: userResponseSchema,
  accessToken: z.string().describe('Short-lived token for authenticating requests'),
  refreshToken: z.string().describe('Long-lived token used to obtain new access tokens'),
});

export const refreshResponseSchema = z.object({
  accessToken: z.string().describe('Newly issued short-lived access token'),
});

export const errorResponseSchema = z.object({
  statusCode: z.number(),
  error: z.string(),
  message: z.string(),
});
