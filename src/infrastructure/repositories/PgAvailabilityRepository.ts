import { Availability, BlockedDate, WeeklyAvailabilitySlot } from '../../domain/entities/Availability';
import { IAvailabilityRepository } from '../../domain/interfaces/IAvailabilityRepository';
import { QueryExecutor } from '../database/QueryExecutor';

type AvailabilityRow = {
  id: string;
  provider_id: string;
  weekly_slots: WeeklyAvailabilitySlot[];
  blocked_dates: { date: string; reason?: string }[];
  created_at: Date;
};

export class PgAvailabilityRepository implements IAvailabilityRepository {
  constructor(private readonly database: QueryExecutor) {}

  async save(availability: Availability): Promise<Availability> {
    const result = await this.database.query<AvailabilityRow>(
      `INSERT INTO provider_availability (id, provider_id, weekly_slots, blocked_dates, created_at, updated_at)
       VALUES ($1, $2, $3::jsonb, $4::jsonb, $5, NOW())
       ON CONFLICT (provider_id) DO UPDATE SET
         weekly_slots = EXCLUDED.weekly_slots,
         blocked_dates = EXCLUDED.blocked_dates,
         updated_at = NOW()
       RETURNING id, provider_id, weekly_slots, blocked_dates, created_at`,
      [
        availability.id,
        availability.providerId,
        JSON.stringify(availability.weeklySlots),
        JSON.stringify(
          availability.blockedDates.map((blocked) => ({
            date: blocked.date.toISOString().slice(0, 10),
            reason: blocked.reason,
          })),
        ),
        availability.createdAt,
      ],
    );

    return mapAvailabilityRow(result.rows[0]);
  }

  async findByProviderId(providerId: string): Promise<Availability | null> {
    const result = await this.database.query<AvailabilityRow>(
      `SELECT id, provider_id, weekly_slots, blocked_dates, created_at
       FROM provider_availability
       WHERE provider_id = $1`,
      [providerId],
    );

    return mapOptionalAvailabilityRow(result.rows[0]);
  }
}

function mapOptionalAvailabilityRow(row: AvailabilityRow | undefined): Availability | null {
  return row ? mapAvailabilityRow(row) : null;
}

function mapAvailabilityRow(row: AvailabilityRow): Availability {
  return Availability.create({
    id: row.id,
    providerId: row.provider_id,
    weeklySlots: row.weekly_slots,
    blockedDates: row.blocked_dates.map(mapBlockedDate),
    createdAt: row.created_at,
  });
}

function mapBlockedDate(blocked: { date: string; reason?: string }): BlockedDate {
  return {
    date: new Date(`${blocked.date}T12:00:00`),
    reason: blocked.reason,
  };
}
