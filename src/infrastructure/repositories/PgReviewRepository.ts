import { Review } from '../../domain/entities/Review';
import { IReviewRepository } from '../../domain/interfaces/IReviewRepository';
import { QueryExecutor } from '../database/QueryExecutor';

type ReviewRow = {
  id: string;
  appointment_id: string;
  provider_id: string;
  client_id: string;
  rating: number;
  comment: string | null;
  created_at: Date;
};

const SELECT_COLUMNS = `id, appointment_id, provider_id, client_id, rating, comment, created_at`;

export class PgReviewRepository implements IReviewRepository {
  constructor(private readonly database: QueryExecutor) {}

  async save(review: Review): Promise<void> {
    await this.database.query(
      `INSERT INTO reviews (id, appointment_id, provider_id, client_id, rating, comment, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (id) DO NOTHING`,
      [
        review.id,
        review.appointmentId,
        review.providerId,
        review.clientId,
        review.rating,
        review.comment ?? null,
        review.createdAt,
      ],
    );
  }

  async findByAppointmentId(appointmentId: string): Promise<Review | null> {
    const result = await this.database.query<ReviewRow>(
      `SELECT ${SELECT_COLUMNS} FROM reviews WHERE appointment_id = $1`,
      [appointmentId],
    );
    return mapOptionalReviewRow(result.rows[0]);
  }

  async findManyByProvider(providerId: string): Promise<Review[]> {
    const result = await this.database.query<ReviewRow>(
      `SELECT ${SELECT_COLUMNS} FROM reviews WHERE provider_id = $1 ORDER BY created_at DESC`,
      [providerId],
    );
    return result.rows.map(mapReviewRow);
  }
}

function mapOptionalReviewRow(row: ReviewRow | undefined): Review | null {
  return row ? mapReviewRow(row) : null;
}

function mapReviewRow(row: ReviewRow): Review {
  return Review.create({
    id: row.id,
    appointmentId: row.appointment_id,
    providerId: row.provider_id,
    clientId: row.client_id,
    rating: row.rating,
    comment: row.comment ?? undefined,
    createdAt: row.created_at,
  });
}
