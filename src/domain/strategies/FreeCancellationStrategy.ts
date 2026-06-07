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

const FREE_UNTIL_DEADLINE_POLICY = 'free-until-24-hours';

export class FreeCancellationStrategy implements ICancellationStrategy {
  calculate(input: CancellationStrategyInput): CancellationStrategyResult {
    ensureValidCancellationInput(input);

    const feeInCents = isBeforeFreeCancellationDeadline(input)
      ? 0
      : input.servicePriceInCents;

    return buildCancellationResult(input, feeInCents, FREE_UNTIL_DEADLINE_POLICY);
  }
}
