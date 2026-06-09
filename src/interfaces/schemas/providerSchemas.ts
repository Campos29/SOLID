import { z } from 'zod';

export const createProviderBodySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(255, 'Name must be at most 255 characters')
    .describe('Public name of the provider'),
  description: z
    .string()
    .trim()
    .max(1000, 'Description must be at most 1000 characters')
    .optional()
    .describe('Short description of the services offered'),
  category: z
    .string()
    .trim()
    .min(2, 'Category must be at least 2 characters')
    .max(100, 'Category must be at most 100 characters')
    .describe('Category used to group and search providers'),
});

export type CreateProviderBody = z.infer<typeof createProviderBodySchema>;

export const updateProviderBodySchema = createProviderBodySchema;
export type UpdateProviderBody = z.infer<typeof updateProviderBodySchema>;

export const listProvidersQuerySchema = z.object({
  category: z
    .string()
    .trim()
    .min(1)
    .optional()
    .describe('Filters providers by category (case-insensitive)'),
});

export type ListProvidersQuery = z.infer<typeof listProvidersQuerySchema>;

export const providerResponseSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  name: z.string(),
  description: z.string(),
  category: z.string(),
  createdAt: z.string().datetime(),
});

export const providerListResponseSchema = z.object({
  providers: z.array(providerResponseSchema),
});
