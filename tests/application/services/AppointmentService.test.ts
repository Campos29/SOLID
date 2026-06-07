import { describe, expect, it } from 'vitest';
import { AppointmentService } from '../../../src/application/services/AppointmentService';
import {
  CancellationStrategyInput,
  CancellationStrategyResult,
  ICancellationStrategy,
} from '../../../src/domain/interfaces/ICancellationStrategy';

class RecordingCancellationStrategy implements ICancellationStrategy {
  public receivedInput: CancellationStrategyInput | null = null;

  calculate(input: CancellationStrategyInput): CancellationStrategyResult {
    this.receivedInput = input;

    return {
      feeInCents: 0,
      refundInCents: input.servicePriceInCents,
      isFree: true,
      policy: 'recording-strategy',
    };
  }
}

describe('AppointmentService', () => {
  it('delegates cancellation rules to the injected strategy', () => {
    const strategy = new RecordingCancellationStrategy();
    const service = new AppointmentService(strategy);
    const input = {
      appointmentStartsAt: new Date('2026-06-10T12:00:00.000Z'),
      requestedAt: new Date('2026-06-09T12:00:00.000Z'),
      servicePriceInCents: 8000,
    };

    const result = service.quoteCancellation(input);

    expect(strategy.receivedInput).toBe(input);
    expect(result).toEqual({
      feeInCents: 0,
      refundInCents: 8000,
      isFree: true,
      policy: 'recording-strategy',
    });
  });
});
