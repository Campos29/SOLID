import { z } from 'zod';
import { WEEK_DAYS } from '../../domain/entities/Availability';

export const weeklySlotSchema = z.object({
  dayOfWeek: z.number().int().refine((value) => WEEK_DAYS.includes(value as (typeof WEEK_DAYS)[number])),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
  slotIntervalInMinutes: z.number().int().positive(),
});

export const blockedDateSchema = z.object({
  date: z.string().date(),
  reason: z.string().trim().max(255).optional(),
});

export const configureAvailabilityBodySchema = z.object({
  weeklySlots: z.array(weeklySlotSchema).min(1),
  blockedDates: z.array(blockedDateSchema).default([]),
});

export type ConfigureAvailabilityBody = z.infer<typeof configureAvailabilityBodySchema>;

export const availabilityResponseSchema = z.object({
  id: z.string().uuid(),
  providerId: z.string().uuid(),
  weeklySlots: z.array(weeklySlotSchema),
  blockedDates: z.array(blockedDateSchema),
  createdAt: z.string().datetime(),
});

export const listSlotsQuerySchema = z.object({
  serviceId: z.string().uuid(),
  date: z.string().date(),
});

export type ListSlotsQuery = z.infer<typeof listSlotsQuerySchema>;

export const slotResponseSchema = z.object({
  startsAt: z.string().datetime(),
  endsAt: z.string().datetime(),
});

export const listSlotsResponseSchema = z.object({
  slots: z.array(slotResponseSchema),
});
