import { describe, expect, it } from 'vitest';
import { FreeCancellationStrategy } from '../../../src/domain/strategies/FreeCancellationStrategy';
import { PaidCancellationStrategy } from '../../../src/domain/strategies/PaidCancellationStrategy';

describe('Cancellation strategies', () => {
  it('does not charge when cancellation is requested at least 24 hours before', () => {
    const strategy = new FreeCancellationStrategy();

    const result = strategy.calculate({
      appointmentStartsAt: new Date('2026-06-10T12:00:00.000Z'),
      requestedAt: new Date('2026-06-09T12:00:00.000Z'),
      servicePriceInCents: 10000,
    });

    expect(result).toEqual({
      feeInCents: 0,
      refundInCents: 10000,
      isFree: true,
      policy: 'free-until-24-hours',
    });
  });

  it('treats exactly 24 hours before the appointment as free cancellation', () => {
    const strategy = new PaidCancellationStrategy(20);

    const result = strategy.calculate({
      appointmentStartsAt: new Date('2026-06-10T12:00:00.000Z'),
      requestedAt: new Date('2026-06-09T12:00:00.000Z'),
      servicePriceInCents: 10000,
    });

    expect(result.feeInCents).toBe(0);
    expect(result.refundInCents).toBe(10000);
    expect(result.isFree).toBe(true);
  });

  it('charges when cancellation is requested inside the 24 hour window', () => {
    const strategy = new PaidCancellationStrategy(20);

    const result = strategy.calculate({
      appointmentStartsAt: new Date('2026-06-10T12:00:00.000Z'),
      requestedAt: new Date('2026-06-09T12:00:00.001Z'),
      servicePriceInCents: 10000,
    });

    expect(result.feeInCents).toBe(2000);
    expect(result.refundInCents).toBe(8000);
    expect(result.isFree).toBe(false);
  });

  it('keeps the full service amount when the free cancellation deadline passed', () => {
    const strategy = new FreeCancellationStrategy();

    const result = strategy.calculate({
      appointmentStartsAt: new Date('2026-06-10T12:00:00.000Z'),
      requestedAt: new Date('2026-06-10T08:00:00.000Z'),
      servicePriceInCents: 10000,
    });

    expect(result.feeInCents).toBe(10000);
    expect(result.refundInCents).toBe(0);
    expect(result.isFree).toBe(false);
  });

  it('charges a percentage fee when paid cancellation happens after the deadline', () => {
    const strategy = new PaidCancellationStrategy(20);

    const result = strategy.calculate({
      appointmentStartsAt: new Date('2026-06-10T12:00:00.000Z'),
      requestedAt: new Date('2026-06-10T08:00:00.000Z'),
      servicePriceInCents: 10000,
    });

    expect(result).toEqual({
      feeInCents: 2000,
      refundInCents: 8000,
      isFree: false,
      policy: 'paid-after-24-hours',
    });
  });

  it('rejects cancellation requests after the appointment starts', () => {
    const strategy = new PaidCancellationStrategy();

    expect(() =>
      strategy.calculate({
        appointmentStartsAt: new Date('2026-06-10T12:00:00.000Z'),
        requestedAt: new Date('2026-06-10T12:01:00.000Z'),
        servicePriceInCents: 10000,
      }),
    ).toThrow('Cancellation must be requested before appointment starts');
  });

  it('rejects a negative service price', () => {
    const strategy = new FreeCancellationStrategy();

    expect(() =>
      strategy.calculate({
        appointmentStartsAt: new Date('2026-06-10T12:00:00.000Z'),
        requestedAt: new Date('2026-06-09T12:00:00.000Z'),
        servicePriceInCents: -1,
      }),
    ).toThrow('Service price must be a non-negative integer');
  });

  it('rejects an invalid late cancellation fee percentage', () => {
    expect(() => new PaidCancellationStrategy(101)).toThrow(
      'Late cancellation fee percentage must be between 0 and 100',
    );
  });
});
