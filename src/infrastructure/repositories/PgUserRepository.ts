import { User, UserRole } from '../../domain/entities/User';
import { IUserRepository } from '../../domain/interfaces/IUserRepository';
import { QueryExecutor } from '../database/QueryExecutor';

type UserRow = {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  role: UserRole;
  created_at: Date;
};

export class PgUserRepository implements IUserRepository {
  constructor(private readonly database: QueryExecutor) {}

  async save(user: User): Promise<void> {
    await this.database.query(
      `INSERT INTO users (id, name, email, password_hash, role, created_at)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (id) DO UPDATE SET
         name = EXCLUDED.name,
         email = EXCLUDED.email,
         password_hash = EXCLUDED.password_hash,
         role = EXCLUDED.role`,
      [user.id, user.name, user.email, user.passwordHash, user.role, user.createdAt],
    );
  }

  async findById(id: string): Promise<User | null> {
    const result = await this.database.query<UserRow>(
      `SELECT id, name, email, password_hash, role, created_at
       FROM users
       WHERE id = $1`,
      [id],
    );

    return mapOptionalUserRow(result.rows[0]);
  }

  async findByEmail(email: string): Promise<User | null> {
    const result = await this.database.query<UserRow>(
      `SELECT id, name, email, password_hash, role, created_at
       FROM users
       WHERE email = $1`,
      [email.toLowerCase()],
    );

    return mapOptionalUserRow(result.rows[0]);
  }
}

function mapOptionalUserRow(row: UserRow | undefined): User | null {
  return row ? mapUserRow(row) : null;
}

function mapUserRow(row: UserRow): User {
  return User.create({
    id: row.id,
    name: row.name,
    email: row.email,
    passwordHash: row.password_hash,
    role: row.role,
    createdAt: row.created_at,
  });
}
