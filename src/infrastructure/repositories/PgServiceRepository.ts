import { Service } from '../../domain/entities/Service';
import { IServiceRepository } from '../../domain/interfaces/IServiceRepository';
import { QueryExecutor } from '../database/QueryExecutor';

type ServiceRow = {
  id: string;
  provider_id: string;
  name: string;
  duration_in_minutes: number;
  price_in_cents: number;
  created_at: Date;
};

export class PgServiceRepository implements IServiceRepository {
  constructor(private readonly database: QueryExecutor) {}

  async findById(id: string): Promise<Service | null> {
    const result = await this.database.query<ServiceRow>(
      `SELECT id, provider_id, name, duration_in_minutes, price_in_cents, created_at
       FROM services
       WHERE id = $1`,
      [id],
    );

    return mapOptionalServiceRow(result.rows[0]);
  }

  async save(service: Service): Promise<Service> {
    const result = await this.database.query<ServiceRow>(
      `INSERT INTO services (id, provider_id, name, duration_in_minutes, price_in_cents, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())
       ON CONFLICT (id) DO UPDATE SET
         name = EXCLUDED.name,
         duration_in_minutes = EXCLUDED.duration_in_minutes,
         price_in_cents = EXCLUDED.price_in_cents,
         updated_at = NOW()
       RETURNING id, provider_id, name, duration_in_minutes, price_in_cents, created_at`,
      [
        service.id,
        service.providerId,
        service.name,
        service.durationInMinutes,
        service.priceInCents,
        service.createdAt,
      ],
    );

    return mapServiceRow(result.rows[0]);
  }

  async delete(id: string): Promise<void> {
    await this.database.query('DELETE FROM services WHERE id = $1', [id]);
  }

  async findByProviderId(providerId: string): Promise<Service[]> {
    const result = await this.database.query<ServiceRow>(
      `SELECT id, provider_id, name, duration_in_minutes, price_in_cents, created_at
       FROM services
       WHERE provider_id = $1
       ORDER BY name ASC`,
      [providerId],
    );

    return result.rows.map(mapServiceRow);
  }
}

function mapOptionalServiceRow(row: ServiceRow | undefined): Service | null {
  return row ? mapServiceRow(row) : null;
}

function mapServiceRow(row: ServiceRow): Service {
  return Service.create({
    id: row.id,
    providerId: row.provider_id,
    name: row.name,
    durationInMinutes: row.duration_in_minutes,
    priceInCents: row.price_in_cents,
    createdAt: row.created_at,
  });
}
