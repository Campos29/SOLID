import { FastifyReply, FastifyRequest } from 'fastify';
import { CreateReviewBody, CreateReviewParams } from '../../schemas/reviewSchemas';
import { ReviewDependencies, ReviewView } from '../container';

export class ReviewController {
  private readonly submitReviewUseCase: ReviewDependencies['submitReviewUseCase'];

  constructor(dependencies: ReviewDependencies) {
    this.submitReviewUseCase = dependencies.submitReviewUseCase;
  }

  submit = async (
    request: FastifyRequest<{ Params: CreateReviewParams; Body: CreateReviewBody }>,
    reply: FastifyReply,
  ) => {
    const { review } = await this.submitReviewUseCase.execute({
      appointmentId: request.params.appointmentId,
      clientId: request.user.userId,
      rating: request.body.rating,
      comment: request.body.comment,
    });

    return reply.status(201).send({ review: this.toResponse(review) });
  };

  private toResponse(review: ReviewView) {
    return {
      id: review.id,
      appointmentId: review.appointmentId,
      providerId: review.providerId,
      clientId: review.clientId,
      rating: review.rating,
      comment: review.comment ?? null,
      createdAt: review.createdAt.toISOString(),
    };
  }
}
