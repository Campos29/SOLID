import { z } from 'zod';

export const createReviewParamsSchema = z.object({
  appointmentId: z
    .string()
    .uuid('Appointment id must be a valid UUID')
    .describe('Appointment being reviewed'),
});

export type CreateReviewParams = z.infer<typeof createReviewParamsSchema>;

export const createReviewBodySchema = z.object({
  rating: z
    .number()
    .int('Rating must be an integer')
    .min(1, 'Rating must be at least 1')
    .max(5, 'Rating must be at most 5')
    .describe('Rating score from 1 to 5'),
  comment: z
    .string()
    .trim()
    .max(1000, 'Comment must be at most 1000 characters')
    .optional()
    .describe('Optional public comment about the appointment experience'),
});

export type CreateReviewBody = z.infer<typeof createReviewBodySchema>;

export const reviewSchema = z.object({
  id: z.string().uuid(),
  appointmentId: z.string().uuid(),
  providerId: z.string().uuid(),
  clientId: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().nullable(),
  createdAt: z.string().datetime(),
});

export const reviewResponseSchema = z.object({
  review: reviewSchema,
});
