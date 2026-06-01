import 'dotenv/config';
import Fastify from 'fastify';
import fastifyJwt from '@fastify/jwt';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';

const app = Fastify({ logger: true });

app.register(fastifyJwt, {
  secret: process.env.JWT_SECRET ?? 'change-me-in-production',
});

app.register(fastifySwagger, {
  openapi: {
    openapi: '3.0.0',
    info: {
      title: 'SlotWise API',
      description: 'Plataforma de agendamento de serviços para pequenos negócios',
      version: '1.0.0',
    },
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      },
    },
  },
});

app.register(fastifySwaggerUi, { routePrefix: '/docs' });

app.get('/health', async () => ({ status: 'ok' }));

const start = async (): Promise<void> => {
  try {
    const port = Number(process.env.PORT) || 3000;
    await app.listen({ port, host: '0.0.0.0' });
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();

export { app };
