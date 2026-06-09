import Fastify, { FastifyInstance } from 'fastify';
import {
  serializerCompiler,
  validatorCompiler,
  jsonSchemaTransform,
} from 'fastify-type-provider-zod';
import fastifyCors from '@fastify/cors';
import fastifyJwt from '@fastify/jwt';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';
import { env } from './config/env';
import { authRoutes } from './interfaces/http/routes/authRoutes';
import { providerRoutes } from './interfaces/http/routes/providerRoutes';
import { appointmentRoutes } from './interfaces/http/routes/appointmentRoutes';
import { reviewRoutes } from './interfaces/http/routes/reviewRoutes';
import { registerErrorHandler } from './interfaces/http/errorHandler';

export function buildApp(): FastifyInstance {
  const app = Fastify({
    ignoreTrailingSlash: true,
    logger: {
      level: env.NODE_ENV === 'production' ? 'info' : 'debug',
    },
  });

  // Zod as the validator and serializer for all routes
  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  app.register(fastifyCors, { origin: true });

  app.register(fastifyJwt, { secret: env.JWT_SECRET });

  app.register(fastifySwagger, {
    openapi: {
      openapi: '3.0.0',
      info: {
        title: 'SlotWise API',
        description: 'Plataforma de agendamento de serviços — SlotWise',
        version: '1.0.0',
      },
      servers: [{ url: `http://localhost:${env.PORT}` }],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
    },
    transform: jsonSchemaTransform,
  });

  app.register(fastifySwaggerUi, {
    routePrefix: '/docs',
    uiConfig: { docExpansion: 'list', deepLinking: false },
  });

  app.setErrorHandler(registerErrorHandler);

  app.get('/health', async () => ({
    status: 'ok',
    timestamp: new Date().toISOString(),
  }));

  app.register(authRoutes, { prefix: '/api/v1/auth' });
  app.register(providerRoutes, { prefix: '/api/v1/providers' });
  app.register(appointmentRoutes, { prefix: '/api/v1/appointments' });
  app.register(reviewRoutes, { prefix: '/api/v1/appointments' });

  return app;
}

const app = buildApp();

app.listen({ port: env.PORT, host: '0.0.0.0' }).catch((error) => {
  app.log.error(error);
  process.exit(1);
});
