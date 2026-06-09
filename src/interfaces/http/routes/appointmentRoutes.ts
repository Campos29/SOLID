import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { AppointmentController } from '../controllers/AppointmentController';
import { buildAppointmentDependencies } from '../container';
import { authenticate } from '../middlewares/authenticate';
import { authorizeRoles } from '../middlewares/authorizeRoles';
import { errorResponseSchema } from '../../schemas/authSchemas';
import {
  appointmentSchema,
  cancelAppointmentParamsSchema,
  confirmAppointmentParamsSchema,
  createAppointmentBodySchema,
  listMyAppointmentsQuerySchema,
  myAppointmentsResponseSchema,
  providerAppointmentActionParamsSchema,
} from '../../schemas/appointmentSchemas';

export async function appointmentRoutes(app: FastifyInstance): Promise<void> {
  const controller = new AppointmentController(buildAppointmentDependencies());

  app.register(async (protectedRoutes) => {
    protectedRoutes.addHook('preHandler', authenticate);
    protectedRoutes.addHook('preHandler', authorizeRoles('Client'));

    protectedRoutes.withTypeProvider<ZodTypeProvider>().get(
      '/me',
      {
        schema: {
          tags: ['appointments'],
          summary: 'List the authenticated client appointments',
          security: [{ bearerAuth: [] }],
          querystring: listMyAppointmentsQuerySchema,
          response: {
            200: myAppointmentsResponseSchema,
            401: errorResponseSchema,
            403: errorResponseSchema,
          },
        },
      },
      controller.listMine,
    );

    protectedRoutes.withTypeProvider<ZodTypeProvider>().post(
      '/',
      {
        schema: {
          tags: ['appointments'],
          summary: 'Create a new appointment',
          security: [{ bearerAuth: [] }],
          body: createAppointmentBodySchema,
          response: {
            201: appointmentSchema,
            401: errorResponseSchema,
            403: errorResponseSchema,
            404: errorResponseSchema,
            409: errorResponseSchema,
          },
        },
      },
      controller.create,
    );

    protectedRoutes.withTypeProvider<ZodTypeProvider>().patch(
      '/:appointmentId/cancel',
      {
        schema: {
          tags: ['appointments'],
          summary: 'Cancel an appointment owned by the authenticated client',
          security: [{ bearerAuth: [] }],
          params: cancelAppointmentParamsSchema,
          response: {
            200: appointmentSchema,
            401: errorResponseSchema,
            403: errorResponseSchema,
            404: errorResponseSchema,
          },
        },
      },
      controller.cancel,
    );
  });

  app.register(async (providerRoutes) => {
    providerRoutes.addHook('preHandler', authenticate);
    providerRoutes.addHook('preHandler', authorizeRoles('Provider'));

    providerRoutes.withTypeProvider<ZodTypeProvider>().patch(
      '/:appointmentId/confirm',
      {
        schema: {
          tags: ['appointments'],
          summary: 'Confirm a pending appointment for the authenticated provider',
          security: [{ bearerAuth: [] }],
          params: confirmAppointmentParamsSchema,
          response: {
            200: appointmentSchema,
            401: errorResponseSchema,
            403: errorResponseSchema,
            404: errorResponseSchema,
            409: errorResponseSchema,
          },
        },
      },
      controller.confirm,
    );

    providerRoutes.withTypeProvider<ZodTypeProvider>().patch(
      '/:appointmentId/reject',
      {
        schema: {
          tags: ['appointments'],
          summary: 'Reject a pending appointment for the authenticated provider',
          security: [{ bearerAuth: [] }],
          params: providerAppointmentActionParamsSchema,
          response: {
            200: appointmentSchema,
            401: errorResponseSchema,
            403: errorResponseSchema,
            404: errorResponseSchema,
            409: errorResponseSchema,
          },
        },
      },
      controller.reject,
    );

    providerRoutes.withTypeProvider<ZodTypeProvider>().patch(
      '/:appointmentId/complete',
      {
        schema: {
          tags: ['appointments'],
          summary: 'Mark a confirmed appointment as completed',
          security: [{ bearerAuth: [] }],
          params: providerAppointmentActionParamsSchema,
          response: {
            200: appointmentSchema,
            401: errorResponseSchema,
            403: errorResponseSchema,
            404: errorResponseSchema,
            409: errorResponseSchema,
          },
        },
      },
      controller.complete,
    );
  });
}
