export type CancellationStrategyInput = {
  appointmentStartsAt: Date;
  requestedAt: Date;
  servicePriceInCents: number;
};

export type CancellationStrategyResult = {
  feeInCents: number;
  refundInCents: number;
  isFree: boolean;
  policy: string;
};

export interface ICancellationStrategy {
  calculate(input: CancellationStrategyInput): CancellationStrategyResult;
}
