import { describe, expect, it, vi } from 'vitest';
import { User } from '../../../src/domain/entities/User';
import { PgUserRepository } from '../../../src/infrastructure/repositories/PgUserRepository';

describe('PgUserRepository', () => {
  it('saves a user using SQL parameters', async () => {
    const database = createDatabaseMock();
    const repository = new PgUserRepository(database);
    const user = makeUser();

    await repository.save(user);

    expect(database.query).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO users'), [
      user.id,
      user.name,
      user.email,
      user.passwordHash,
      user.role,
      user.createdAt,
    ]);
  });

  it('finds a user by normalized email', async () => {
    const database = createDatabaseMock(makeUserRow());
    const repository = new PgUserRepository(database);

    const user = await repository.findByEmail('PEDRO@example.com');

    expect(user?.email).toBe('pedro@example.com');
    expect(database.query).toHaveBeenCalledWith(expect.stringContaining('WHERE email = $1'), [
      'pedro@example.com',
    ]);
  });

  it('returns null when a user is not found', async () => {
    const database = createDatabaseMock();
    const repository = new PgUserRepository(database);

    await expect(repository.findById('missing-user')).resolves.toBeNull();
  });
});

function makeUser(): User {
  return User.create({
    id: 'user-1',
    name: 'Pedro Daou',
    email: 'PEDRO@example.com',
    passwordHash: 'hashed-password',
    role: 'Provider',
    createdAt: new Date('2026-06-02T21:46:00.000Z'),
  });
}

function makeUserRow() {
  const user = makeUser();

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    password_hash: user.passwordHash,
    role: user.role,
    created_at: user.createdAt,
  };
}

function createDatabaseMock(row?: unknown) {
  return {
    query: vi.fn().mockResolvedValue({ rows: row ? [row] : [] }),
  };
}
