import { randomUUID } from 'node:crypto';
import { Review } from '@domain/entities/Review';
import { IAppointmentReader } from '@domain/interfaces/IAppointmentRepository';
import { IReviewRepository } from '@domain/interfaces/IReviewRepository';
import { IProviderRepository } from '@domain/interfaces/IProviderRepository';
import { SubmitReviewInput, SubmitReviewUseCasePort, ReviewView } from '@interfaces/http/container';
import { AppointmentNotFoundError } from '../../errors/AppointmentNotFoundError';
import { UnauthorizedReviewError } from '../../errors/UnauthorizedReviewError';
import { AppointmentNotCompletedError } from '../../errors/AppointmentNotCompletedError';
import { ReviewAlreadyExistsError } from '../../errors/ReviewAlreadyExistsError';

export class SubmitReviewUseCase implements SubmitReviewUseCasePort {
  constructor(
    private readonly appointmentReader: IAppointmentReader,
    private readonly reviewRepository: IReviewRepository,
    private readonly providerRepository: IProviderRepository,
  ) {}

  async execute(input: SubmitReviewInput): Promise<{ review: ReviewView }> {
    const appointment = await this.appointmentReader.findById(input.appointmentId);
    if (!appointment) {
      throw new AppointmentNotFoundError();
    }

    if (appointment.clientId !== input.clientId) {
      throw new UnauthorizedReviewError();
    }

    if (appointment.status !== 'completed') {
      throw new AppointmentNotCompletedError();
    }

    const existingReview = await this.reviewRepository.findByAppointmentId(input.appointmentId);
    if (existingReview) {
      throw new ReviewAlreadyExistsError();
    }

    const review = Review.create({
      id: randomUUID(),
      appointmentId: input.appointmentId,
      providerId: appointment.providerId,
      clientId: input.clientId,
      rating: input.rating,
      comment: input.comment,
    });

    await this.reviewRepository.save(review);

    const newAverage = await this.computeProviderAverage(appointment.providerId);
    await this.providerRepository.updateAverageRating(appointment.providerId, newAverage);

    return { review: this.toReviewView(review) };
  }

  private async computeProviderAverage(providerId: string): Promise<number> {
    const reviews = await this.reviewRepository.findManyByProvider(providerId);
    const total = reviews.reduce((sum, review) => sum + review.rating, 0);
    return total / reviews.length;
  }

  private toReviewView(review: Review): ReviewView {
    return {
      id: review.id,
      appointmentId: review.appointmentId,
      providerId: review.providerId,
      clientId: review.clientId,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt,
    };
  }
}
