import { describe, expect, it } from 'vitest';
import { Provider } from '../../../src/domain/entities/Provider';

describe('Provider entity', () => {
  it('creates a valid provider with normalized category', () => {
    const createdAt = new Date('2026-06-01T20:12:00.000Z');

    const provider = Provider.create({
      id: 'provider-1',
      userId: 'user-1',
      name: 'Pedro Barber Shop',
      description: 'Barbearia especializada em horarios agendados',
      category: 'Barbearia',
      createdAt,
    });

    expect(provider.id).toBe('provider-1');
    expect(provider.userId).toBe('user-1');
    expect(provider.name).toBe('Pedro Barber Shop');
    expect(provider.description).toBe('Barbearia especializada em horarios agendados');
    expect(provider.category).toBe('barbearia');
    expect(provider.createdAt).toBe(createdAt);
  });

  it('rejects a provider without a category', () => {
    expect(() =>
      Provider.create({
        id: 'provider-1',
        userId: 'user-1',
        name: 'Pedro Barber Shop',
        description: 'Barbearia especializada em horarios agendados',
        category: ' ',
      }),
    ).toThrow('Provider category is required');
  });
});
