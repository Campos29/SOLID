import { Provider } from '../../domain/entities/Provider';
import { IProviderRepository } from '../../domain/interfaces/IProviderRepository';
import { QueryExecutor } from '../database/QueryExecutor';

type ProviderRow = {
  id: string;
  user_id: string;
  name: string;
  description: string;
  category: string;
  average_rating: number | string;
  review_count: number | string;
  created_at: Date;
};

type ProviderFilters = {
  category?: string;
};

export class PgProviderRepository implements IProviderRepository {
  constructor(private readonly database: QueryExecutor) {}

  async save(provider: Provider): Promise<void> {
    await this.database.query(
      `INSERT INTO providers (id, user_id, name, description, category, created_at)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          description = EXCLUDED.description,
          category = EXCLUDED.category,
          updated_at = NOW()`,
      [
        provider.id,
        provider.userId,
        provider.name,
        provider.description,
        provider.category,
        provider.createdAt,
      ],
    );
  }

  async findById(id: string): Promise<Provider | null> {
    const result = await this.findOne('id = $1', [id]);

    return mapOptionalProviderRow(result.rows[0]);
  }

  async findByUserId(userId: string): Promise<Provider | null> {
    const result = await this.findOne('user_id = $1', [userId]);

    return mapOptionalProviderRow(result.rows[0]);
  }

  async findByCategory(category: string): Promise<Provider[]> {
    return this.findAll({ category });
  }

  async findAll(filters: ProviderFilters = {}): Promise<Provider[]> {
    const result = filters.category
      ? await this.findMany('WHERE category = $1', [filters.category.toLowerCase()])
      : await this.findMany('', []);

    return result.rows.map(mapProviderRow);
  }

  async updateAverageRating(providerId: string, average: number): Promise<void> {
    await this.database.query(
      `UPDATE providers SET average_rating = $1 WHERE id = $2`,
      [average, providerId],
    );
  }

  private async findOne(whereClause: string, values: unknown[]) {
    return this.findMany(`WHERE ${whereClause}`, values);
  }

  private async findMany(whereClause: string, values: unknown[]) {
    return this.database.query<ProviderRow>(
      `SELECT id, user_id, name, description, category, average_rating, created_at,
              (SELECT COUNT(*)::int FROM reviews WHERE reviews.provider_id = providers.id) as review_count
       FROM providers
       ${whereClause}
       ORDER BY name ASC`,
      values,
    );
  }
}

function mapOptionalProviderRow(row: ProviderRow | undefined): Provider | null {
  return row ? mapProviderRow(row) : null;
}

function mapProviderRow(row: ProviderRow): Provider {
  return Provider.create({
    id: row.id,
    userId: row.user_id,
    name: row.name,
    description: row.description,
    category: row.category,
    createdAt: row.created_at,
    averageRating: row.average_rating ? Number(row.average_rating) : 0,
    reviewCount: row.review_count ? Number(row.review_count) : 0,
  });
}
