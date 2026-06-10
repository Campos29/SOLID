import { Review } from '../entities/Review';

export interface IReviewRepository {
  save(review: Review): Promise<void>;
  findByAppointmentId(appointmentId: string): Promise<Review | null>;
  findManyByProvider(providerId: string): Promise<Review[]>;
}
