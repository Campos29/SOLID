import {
  CancellationStrategyInput,
  CancellationStrategyResult,
} from '../interfaces/ICancellationStrategy';

export const FREE_CANCELLATION_WINDOW_IN_HOURS = 24;

const HOUR_IN_MILLISECONDS = 60 * 60 * 1000;

export function ensureValidCancellationInput(input: CancellationStrategyInput): void {
  ensureValidDate(input.appointmentStartsAt, 'Appointment starts at');
  ensureValidDate(input.requestedAt, 'Cancellation requested at');
  ensureNonNegativeInteger(input.servicePriceInCents, 'Service price');

  if (input.requestedAt >= input.appointmentStartsAt) {
    throw new Error('Cancellation must be requested before appointment starts');
  }
}

export function isBeforeFreeCancellationDeadline(input: CancellationStrategyInput): boolean {
  const millisecondsBeforeAppointment =
    input.appointmentStartsAt.getTime() - input.requestedAt.getTime();

  return millisecondsBeforeAppointment >= FREE_CANCELLATION_WINDOW_IN_HOURS * HOUR_IN_MILLISECONDS;
}

export function buildCancellationResult(
  input: CancellationStrategyInput,
  feeInCents: number,
  policy: string,
): CancellationStrategyResult {
  const normalizedFee = Math.min(input.servicePriceInCents, Math.max(0, feeInCents));

  return {
    feeInCents: normalizedFee,
    refundInCents: input.servicePriceInCents - normalizedFee,
    isFree: normalizedFee === 0,
    policy,
  };
}

function ensureValidDate(value: Date, fieldName: string): void {
  if (Number.isNaN(value.getTime())) {
    throw new Error(`${fieldName} is invalid`);
  }
}

function ensureNonNegativeInteger(value: number, fieldName: string): void {
  if (!Number.isInteger(value) || value < 0) {
    throw new Error(`${fieldName} must be a non-negative integer`);
  }
}
