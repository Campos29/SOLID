import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { ProviderController } from '../controllers/ProviderController';
import { buildProviderDependencies } from '../container';
import { authenticate } from '../middlewares/authenticate';
import { authorizeRoles } from '../middlewares/authorizeRoles';
import {
  createProviderBodySchema,
  updateProviderBodySchema,
  listProvidersQuerySchema,
  providerResponseSchema,
  providerListResponseSchema,
} from '../../schemas/providerSchemas';
import { errorResponseSchema } from '../../schemas/authSchemas';
import {
  availabilityResponseSchema,
  configureAvailabilityBodySchema,
  listSlotsQuerySchema,
  listSlotsResponseSchema,
} from '../../schemas/availabilitySchemas';
import {
  createServiceBodySchema,
  updateServiceBodySchema,
  providerIdParamsSchema,
  serviceParamsSchema,
  serviceListResponseSchema,
  serviceResponseSchema,
} from '../../schemas/serviceSchemas';
import {
  listProviderAppointmentsQuerySchema,
  providerAppointmentsResponseSchema,
} from '../../schemas/appointmentSchemas';

export async function providerRoutes(app: FastifyInstance): Promise<void> {
  const controller = new ProviderController(buildProviderDependencies());

  app.withTypeProvider<ZodTypeProvider>().get(
    '/',
    {
      schema: {
        tags: ['providers'],
        summary: 'List providers, optionally filtered by category',
        querystring: listProvidersQuerySchema,
        response: {
          200: providerListResponseSchema,
        },
      },
    },
    controller.list,
  );

  app.register(async (protectedRoutes) => {
    protectedRoutes.addHook('preHandler', authenticate);

    protectedRoutes.register(async (providerRegistrationRoutes) => {
      providerRegistrationRoutes.addHook('preHandler', authorizeRoles('Provider'));

      providerRegistrationRoutes.withTypeProvider<ZodTypeProvider>().post(
        '/',
        {
          schema: {
            tags: ['providers'],
            summary: 'Register a provider profile for the authenticated user',
            security: [{ bearerAuth: [] }],
            body: createProviderBodySchema,
            response: {
              201: providerResponseSchema,
              401: errorResponseSchema,
              403: errorResponseSchema,
              409: errorResponseSchema,
            },
          },
        },
        controller.create,
      );
    });

    protectedRoutes.register(async (providerManagementRoutes) => {
      providerManagementRoutes.addHook('preHandler', authorizeRoles('Provider'));

      providerManagementRoutes.withTypeProvider<ZodTypeProvider>().put(
        '/:providerId',
        {
          schema: {
            tags: ['providers'],
            summary: 'Update the authenticated provider profile',
            security: [{ bearerAuth: [] }],
            params: providerIdParamsSchema,
            body: updateProviderBodySchema,
            response: {
              200: providerResponseSchema,
              401: errorResponseSchema,
              403: errorResponseSchema,
              404: errorResponseSchema,
            },
          },
        },
        controller.updateProfile,
      );

      providerManagementRoutes.withTypeProvider<ZodTypeProvider>().put(
        '/:providerId/availability',
        {
          schema: {
            tags: ['providers'],
            summary: 'Configure weekly availability for a provider',
            security: [{ bearerAuth: [] }],
            params: providerIdParamsSchema,
            body: configureAvailabilityBodySchema,
            response: {
              200: availabilityResponseSchema,
              401: errorResponseSchema,
              403: errorResponseSchema,
              404: errorResponseSchema,
            },
          },
        },
        controller.configureAvailability,
      );

      providerManagementRoutes.withTypeProvider<ZodTypeProvider>().post(
        '/:providerId/services',
        {
          schema: {
            tags: ['providers'],
            summary: 'Create a service offered by a provider',
            security: [{ bearerAuth: [] }],
            params: providerIdParamsSchema,
            body: createServiceBodySchema,
            response: {
              201: serviceResponseSchema,
              401: errorResponseSchema,
              403: errorResponseSchema,
              404: errorResponseSchema,
            },
          },
        },
        controller.createService,
      );

      providerManagementRoutes.withTypeProvider<ZodTypeProvider>().patch(
        '/:providerId/services/:serviceId',
        {
          schema: {
            tags: ['providers'],
            summary: 'Update a provider service',
            security: [{ bearerAuth: [] }],
            params: serviceParamsSchema,
            body: updateServiceBodySchema,
            response: {
              200: serviceResponseSchema,
              401: errorResponseSchema,
              403: errorResponseSchema,
              404: errorResponseSchema,
            },
          },
        },
        controller.updateService,
      );

      providerManagementRoutes.withTypeProvider<ZodTypeProvider>().delete(
        '/:providerId/services/:serviceId',
        {
          schema: {
            tags: ['providers'],
            summary: 'Delete a provider service',
            security: [{ bearerAuth: [] }],
            params: serviceParamsSchema,
            response: {
              204: z.void(),
              401: errorResponseSchema,
              403: errorResponseSchema,
              404: errorResponseSchema,
            },
          },
        },
        controller.deleteService,
      );

      providerManagementRoutes.withTypeProvider<ZodTypeProvider>().get(
        '/:providerId/appointments',
        {
          schema: {
            tags: ['providers'],
            summary: 'List appointments for the authenticated provider',
            security: [{ bearerAuth: [] }],
            params: providerIdParamsSchema,
            querystring: listProviderAppointmentsQuerySchema,
            response: {
              200: providerAppointmentsResponseSchema,
              401: errorResponseSchema,
              403: errorResponseSchema,
              404: errorResponseSchema,
            },
          },
        },
        controller.listAppointments,
      );
    });

    protectedRoutes.register(async (serviceListingRoutes) => {
      serviceListingRoutes.addHook('preHandler', authorizeRoles('Client', 'Provider', 'Admin'));

      serviceListingRoutes.withTypeProvider<ZodTypeProvider>().get(
        '/:providerId/services',
        {
          schema: {
            tags: ['providers'],
            summary: 'List services offered by a provider',
            security: [{ bearerAuth: [] }],
            params: providerIdParamsSchema,
            response: {
              200: serviceListResponseSchema,
              401: errorResponseSchema,
              403: errorResponseSchema,
              404: errorResponseSchema,
            },
          },
        },
        controller.listServices,
      );

      serviceListingRoutes.withTypeProvider<ZodTypeProvider>().get(
        '/:providerId/slots',
        {
          schema: {
            tags: ['providers'],
            summary: 'List available booking slots for a provider service on a date',
            security: [{ bearerAuth: [] }],
            params: providerIdParamsSchema,
            querystring: listSlotsQuerySchema,
            response: {
              200: listSlotsResponseSchema,
              401: errorResponseSchema,
              403: errorResponseSchema,
              404: errorResponseSchema,
            },
          },
        },
        controller.listSlots,
      );
    });
  });
}
