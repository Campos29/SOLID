import { Appointment, AppointmentStatus } from '../../domain/entities/Appointment';
import {
  AppointmentSearchFilters,
  IAppointmentRepository,
} from '../../domain/interfaces/IAppointmentRepository';
import { SlotAlreadyBookedError } from '../../application/errors/SlotAlreadyBookedError';
import { QueryExecutor } from '../database/QueryExecutor';

type AppointmentRow = {
  id: string;
  provider_id: string;
  client_id: string;
  service_id: string;
  starts_at: Date;
  ends_at: Date;
  status: AppointmentStatus;
  notes: string | null;
  created_at: Date;
  updated_at: Date;
};

// PostgreSQL exclusion constraint raised when two active appointments overlap
// for the same provider (see migration 005).
const EXCLUSION_VIOLATION = '23P01';

const SELECT_COLUMNS = `
  id, provider_id, client_id, service_id,
  starts_at, ends_at, status, notes, created_at, updated_at
`;

export class PgAppointmentRepository implements IAppointmentRepository {
  constructor(private readonly database: QueryExecutor) {}

  async save(appointment: Appointment): Promise<void> {
    try {
      await this.database.query(
        `INSERT INTO appointments
           (id, provider_id, client_id, service_id, starts_at, ends_at, status, notes, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         ON CONFLICT (id) DO UPDATE SET
           status = EXCLUDED.status,
           notes = EXCLUDED.notes,
           updated_at = EXCLUDED.updated_at`,
        [
          appointment.id,
          appointment.providerId,
          appointment.clientId,
          appointment.serviceId,
          appointment.startsAt,
          appointment.endsAt,
          appointment.status,
          appointment.notes ?? null,
          appointment.createdAt,
          appointment.updatedAt,
        ],
      );
    } catch (error) {
      if (isExclusionViolation(error)) {
        throw new SlotAlreadyBookedError();
      }
      throw error;
    }
  }

  async findById(id: string): Promise<Appointment | null> {
    const result = await this.database.query<AppointmentRow>(
      `SELECT ${SELECT_COLUMNS} FROM appointments WHERE id = $1`,
      [id],
    );
    return mapOptionalAppointmentRow(result.rows[0]);
  }

  async findMany(filters: AppointmentSearchFilters): Promise<Appointment[]> {
    const { clauses, values } = buildWhereClauses(filters);
    const whereClause = clauses.length > 0 ? `WHERE ${clauses.join(' AND ')}` : '';

    const result = await this.database.query<AppointmentRow>(
      `SELECT ${SELECT_COLUMNS} FROM appointments ${whereClause} ORDER BY starts_at DESC`,
      values,
    );
    return result.rows.map(mapAppointmentRow);
  }

  async findOverlappingActiveByProvider(
    providerId: string,
    startsAt: Date,
    endsAt: Date,
  ): Promise<Appointment[]> {
    const result = await this.database.query<AppointmentRow>(
      `SELECT ${SELECT_COLUMNS}
       FROM appointments
       WHERE provider_id = $1
         AND status <> 'cancelled'
         AND tstzrange(starts_at, ends_at, '[)') && tstzrange($2, $3, '[)')`,
      [providerId, startsAt, endsAt],
    );
    return result.rows.map(mapAppointmentRow);
  }
}

function buildWhereClauses(filters: AppointmentSearchFilters): {
  clauses: string[];
  values: unknown[];
} {
  const clauses: string[] = [];
  const values: unknown[] = [];

  const append = (clause: string, value: unknown): void => {
    values.push(value);
    clauses.push(clause.replace('$?', `$${values.length}`));
  };

  if (filters.providerId) append('provider_id = $?', filters.providerId);
  if (filters.clientId) append('client_id = $?', filters.clientId);
  if (filters.serviceId) append('service_id = $?', filters.serviceId);
  if (filters.startsAt) append('starts_at >= $?', filters.startsAt);
  if (filters.endsAt) append('ends_at <= $?', filters.endsAt);
  if (filters.statuses && filters.statuses.length > 0) {
    append('status = ANY($?)', filters.statuses);
  }

  return { clauses, values };
}

function isExclusionViolation(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: string }).code === EXCLUSION_VIOLATION
  );
}

function mapOptionalAppointmentRow(row: AppointmentRow | undefined): Appointment | null {
  return row ? mapAppointmentRow(row) : null;
}

function mapAppointmentRow(row: AppointmentRow): Appointment {
  return Appointment.create({
    id: row.id,
    providerId: row.provider_id,
    clientId: row.client_id,
    serviceId: row.service_id,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    status: row.status,
    notes: row.notes ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  });
}
