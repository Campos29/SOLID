import { z } from 'zod';
import { APPOINTMENT_STATUSES } from '../../domain/entities/Appointment';

export const listMyAppointmentsQuerySchema = z.object({
  status: z
    .enum(APPOINTMENT_STATUSES)
    .optional()
    .describe('Filters the caller appointments by status'),
});

export type ListMyAppointmentsQuery = z.infer<typeof listMyAppointmentsQuerySchema>;

export const appointmentSchema = z.object({
  id: z.string().uuid(),
  providerId: z.string().uuid(),
  serviceId: z.string().uuid(),
  clientId: z.string().uuid(),
  startsAt: z.string().datetime(),
  endsAt: z.string().datetime(),
  status: z.enum(APPOINTMENT_STATUSES),
  createdAt: z.string().datetime(),
});

export const myAppointmentsResponseSchema = z.object({
  appointments: z.array(appointmentSchema),
});

export const createAppointmentBodySchema = z.object({
  providerId: z.string().uuid(),
  serviceId: z.string().uuid(),
  startsAt: z.string().datetime(),
});

export type CreateAppointmentBody = z.infer<typeof createAppointmentBodySchema>;

export const cancelAppointmentParamsSchema = z.object({
  appointmentId: z.string().uuid(),
});

export type CancelAppointmentParams = z.infer<typeof cancelAppointmentParamsSchema>;

export const listProviderAppointmentsQuerySchema = z.object({
  status: z
    .enum(APPOINTMENT_STATUSES)
    .optional()
    .describe('Filters the provider appointments by status'),
});

export type ListProviderAppointmentsQuery = z.infer<typeof listProviderAppointmentsQuerySchema>;

export const providerAppointmentSchema = appointmentSchema.extend({
  clientName: z.string(),
  serviceName: z.string(),
});

export const providerAppointmentsResponseSchema = z.object({
  appointments: z.array(providerAppointmentSchema),
});

export const confirmAppointmentParamsSchema = z.object({
  appointmentId: z.string().uuid(),
});

export type ConfirmAppointmentParams = z.infer<typeof confirmAppointmentParamsSchema>;

export const providerAppointmentActionParamsSchema = z.object({
  appointmentId: z.string().uuid(),
});

export type ProviderAppointmentActionParams = z.infer<
  typeof providerAppointmentActionParamsSchema
>;
