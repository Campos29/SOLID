import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { ProviderController } from '../controllers/ProviderController';
import { buildProviderDependencies } from '../container';
import { authenticate } from '../middlewares/authenticate';
import {
  createProviderBodySchema,
  listProvidersQuerySchema,
  providerResponseSchema,
  providerListResponseSchema,
} from '../../schemas/providerSchemas';
import { errorResponseSchema } from '../../schemas/authSchemas';

export async function providerRoutes(app: FastifyInstance): Promise<void> {
  const controller = new ProviderController(buildProviderDependencies());

  // Public route: clients browse providers without authenticating.
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

  // Protected scope: the preHandler is attached as a hook so it does not pin
  // the route's type-provider generics, keeping Zod body inference working.
  app.register(async (protectedRoutes) => {
    protectedRoutes.addHook('preHandler', authenticate);

    protectedRoutes.withTypeProvider<ZodTypeProvider>().post(
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
            409: errorResponseSchema,
          },
        },
      },
      controller.create,
    );
  });
}
