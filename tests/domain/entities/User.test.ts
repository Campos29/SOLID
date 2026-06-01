import { describe, expect, it } from 'vitest';
import { User } from '../../../src/domain/entities/User';

describe('User entity', () => {
  it('creates a valid user with normalized email', () => {
    const createdAt = new Date('2026-06-01T20:12:00.000Z');

    const user = User.create({
      id: 'user-1',
      name: 'Pedro Daou',
      email: 'Pedro.Daou@Example.com',
      passwordHash: 'hashed-password',
      role: 'Provider',
      createdAt,
    });

    expect(user.id).toBe('user-1');
    expect(user.name).toBe('Pedro Daou');
    expect(user.email).toBe('pedro.daou@example.com');
    expect(user.passwordHash).toBe('hashed-password');
    expect(user.role).toBe('Provider');
    expect(user.createdAt).toBe(createdAt);
  });

  it('rejects a user without a name', () => {
    expect(() =>
      User.create({
        id: 'user-1',
        name: ' ',
        email: 'pedro@example.com',
        passwordHash: 'hashed-password',
        role: 'Client',
      }),
    ).toThrow('User name is required');
  });
});
