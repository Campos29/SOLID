import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { AuthController } from '../controllers/AuthController';
import { buildAuthDependencies } from '../container';
import {
  registerBodySchema,
  loginBodySchema,
  refreshBodySchema,
  authTokensResponseSchema,
  refreshResponseSchema,
  errorResponseSchema,
} from '../../schemas/authSchemas';

export async function authRoutes(app: FastifyInstance): Promise<void> {
  const controller = new AuthController(buildAuthDependencies());
  const router = app.withTypeProvider<ZodTypeProvider>();

  router.post(
    '/register',
    {
      schema: {
        tags: ['auth'],
        summary: 'Register a new user account',
        body: registerBodySchema,
        response: {
          201: authTokensResponseSchema,
          409: errorResponseSchema,
        },
      },
    },
    controller.register,
  );

  router.post(
    '/login',
    {
      schema: {
        tags: ['auth'],
        summary: 'Authenticate with email and password',
        body: loginBodySchema,
        response: {
          200: authTokensResponseSchema,
          401: errorResponseSchema,
        },
      },
    },
    controller.login,
  );

  router.post(
    '/refresh',
    {
      schema: {
        tags: ['auth'],
        summary: 'Exchange a refresh token for a new access token',
        body: refreshBodySchema,
        response: {
          200: refreshResponseSchema,
          401: errorResponseSchema,
        },
      },
    },
    controller.refresh,
  );
}
