import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { ReviewController } from '../controllers/ReviewController';
import { buildReviewDependencies } from '../container';
import { authenticate } from '../middlewares/authenticate';
import { errorResponseSchema } from '../../schemas/authSchemas';
import {
  createReviewBodySchema,
  createReviewParamsSchema,
  reviewResponseSchema,
} from '../../schemas/reviewSchemas';

export async function reviewRoutes(app: FastifyInstance): Promise<void> {
  const controller = new ReviewController(buildReviewDependencies());

  app.addHook('preHandler', authenticate);

  app.withTypeProvider<ZodTypeProvider>().post(
    '/:appointmentId/reviews',
    {
      schema: {
        tags: ['reviews'],
        summary: 'Submit a review for a completed appointment',
        security: [{ bearerAuth: [] }],
        params: createReviewParamsSchema,
        body: createReviewBodySchema,
        response: {
          201: reviewResponseSchema,
          401: errorResponseSchema,
          501: errorResponseSchema,
        },
      },
    },
    controller.submit,
  );
}
