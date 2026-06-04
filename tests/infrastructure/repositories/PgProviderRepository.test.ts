import { describe, expect, it, vi } from 'vitest';
import { Provider } from '../../../src/domain/entities/Provider';
import { PgProviderRepository } from '../../../src/infrastructure/repositories/PgProviderRepository';

describe('PgProviderRepository', () => {
  it('saves a provider using SQL parameters', async () => {
    const database = createDatabaseMock();
    const repository = new PgProviderRepository(database);
    const provider = makeProvider();

    await repository.save(provider);

    expect(database.query).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO providers'),
      [
        provider.id,
        provider.userId,
        provider.name,
        provider.description,
        provider.category,
        provider.createdAt,
      ],
    );
  });

  it('finds a provider by user id', async () => {
    const database = createDatabaseMock(makeProviderRow());
    const repository = new PgProviderRepository(database);

    const provider = await repository.findByUserId('user-1');

    expect(provider?.userId).toBe('user-1');
    expect(database.query).toHaveBeenCalledWith(expect.stringContaining('WHERE user_id = $1'), [
      'user-1',
    ]);
  });

  it('lists providers by normalized category', async () => {
    const database = createDatabaseMock(makeProviderRow());
    const repository = new PgProviderRepository(database);

    const providers = await repository.findByCategory('Barbearia');

    expect(providers).toHaveLength(1);
    expect(database.query).toHaveBeenCalledWith(expect.stringContaining('WHERE category = $1'), [
      'barbearia',
    ]);
  });

  it('returns null when a provider is not found', async () => {
    const database = createDatabaseMock();
    const repository = new PgProviderRepository(database);

    await expect(repository.findById('missing-provider')).resolves.toBeNull();
  });
});

function makeProvider(): Provider {
  return Provider.create({
    id: 'provider-1',
    userId: 'user-1',
    name: 'Pedro Barber Shop',
    description: 'Barbearia especializada em horarios agendados',
    category: 'Barbearia',
    createdAt: new Date('2026-06-02T21:46:00.000Z'),
  });
}

function makeProviderRow() {
  const provider = makeProvider();

  return {
    id: provider.id,
    user_id: provider.userId,
    name: provider.name,
    description: provider.description,
    category: provider.category,
    created_at: provider.createdAt,
  };
}

function createDatabaseMock(row?: unknown) {
  return {
    query: vi.fn().mockResolvedValue({ rows: row ? [row] : [] }),
  };
}
