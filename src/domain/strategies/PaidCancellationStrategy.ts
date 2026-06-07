import {
  CancellationStrategyInput,
  CancellationStrategyResult,
  ICancellationStrategy,
} from '../interfaces/ICancellationStrategy';
import {
  buildCancellationResult,
  ensureValidCancellationInput,
  isBeforeFreeCancellationDeadline,
} from './cancellationPolicyUtils';

const DEFAULT_LATE_FEE_PERCENTAGE = 20;
const PAID_AFTER_DEADLINE_POLICY = 'paid-after-24-hours';

export class PaidCancellationStrategy implements ICancellationStrategy {
  constructor(private readonly lateFeePercentage = DEFAULT_LATE_FEE_PERCENTAGE) {
    ensureValidPercentage(lateFeePercentage);
  }

  calculate(input: CancellationStrategyInput): CancellationStrategyResult {
    ensureValidCancellationInput(input);

    const feeInCents = isBeforeFreeCancellationDeadline(input)
      ? 0
      : Math.round(input.servicePriceInCents * (this.lateFeePercentage / 100));

    return buildCancellationResult(input, feeInCents, PAID_AFTER_DEADLINE_POLICY);
  }
}

function ensureValidPercentage(value: number): void {
  if (!Number.isInteger(value) || value < 0 || value > 100) {
    throw new Error('Late cancellation fee percentage must be between 0 and 100');
  }
}
