import {
  CancellationStrategyInput,
  CancellationStrategyResult,
  ICancellationStrategy,
} from '../../domain/interfaces/ICancellationStrategy';

export class AppointmentService {
  constructor(private readonly cancellationStrategy: ICancellationStrategy) {}

  quoteCancellation(input: CancellationStrategyInput): CancellationStrategyResult {
    return this.cancellationStrategy.calculate(input);
  }
}
