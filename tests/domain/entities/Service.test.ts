import { describe, expect, it } from 'vitest';
import { Service } from '../../../src/domain/entities/Service';

describe('Service entity', () => {
  it('creates a valid service for a provider', () => {
    const createdAt = new Date('2026-06-04T20:18:00.000Z');

    const service = Service.create({
      id: 'service-1',
      providerId: 'provider-1',
      name: ' Corte masculino ',
      durationInMinutes: 30,
      priceInCents: 4000,
      createdAt,
    });

    expect(service.id).toBe('service-1');
    expect(service.providerId).toBe('provider-1');
    expect(service.name).toBe('Corte masculino');
    expect(service.durationInMinutes).toBe(30);
    expect(service.priceInCents).toBe(4000);
    expect(service.createdAt).toBe(createdAt);
  });

  it('rejects a service without a positive duration', () => {
    expect(() =>
      Service.create({
        id: 'service-1',
        providerId: 'provider-1',
        name: 'Corte masculino',
        durationInMinutes: 0,
        priceInCents: 4000,
      }),
    ).toThrow('Service duration must be a positive integer');
  });
});
