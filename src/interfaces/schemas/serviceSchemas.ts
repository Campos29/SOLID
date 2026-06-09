import { z } from 'zod';

export const providerIdParamsSchema = z.object({
  providerId: z.string().uuid().describe('Provider identifier'),
});

export type ProviderIdParams = z.infer<typeof providerIdParamsSchema>;

export const serviceResponseSchema = z.object({
  id: z.string().uuid(),
  providerId: z.string().uuid(),
  name: z.string(),
  durationInMinutes: z.number().int().positive(),
  priceInCents: z.number().int().nonnegative(),
});

export const serviceListResponseSchema = z.object({
  services: z.array(serviceResponseSchema),
});

export const createServiceBodySchema = z.object({
  name: z.string().trim().min(2).max(255),
  durationInMinutes: z.number().int().positive(),
  priceInCents: z.number().int().nonnegative(),
});

export type CreateServiceBody = z.infer<typeof createServiceBodySchema>;

export const serviceParamsSchema = providerIdParamsSchema.extend({
  serviceId: z.string().uuid(),
});

export type ServiceParams = z.infer<typeof serviceParamsSchema>;

export const updateServiceBodySchema = createServiceBodySchema;
export type UpdateServiceBody = z.infer<typeof updateServiceBodySchema>;
