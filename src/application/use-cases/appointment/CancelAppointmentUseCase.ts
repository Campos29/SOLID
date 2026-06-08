import { Appointment } from '@domain/entities/Appointment';
import { IAppointmentReader, IAppointmentWriter } from '@domain/interfaces/IAppointmentRepository';
import { ICancellationStrategy, CancellationStrategyResult } from '@domain/interfaces/ICancellationStrategy';
import { AppointmentNotFoundError } from '../../errors/AppointmentNotFoundError';

export interface CancelAppointmentInput {
  appointmentId: string;
  requestedAt: Date;
  servicePriceInCents: number;
}

export interface CancelAppointmentOutput {
  appointment: Appointment;
  cancellationResult: CancellationStrategyResult;
}

export class CancelAppointmentUseCase {
  constructor(
    private readonly appointmentReader: IAppointmentReader,
    private readonly appointmentWriter: IAppointmentWriter,
    private readonly cancellationStrategy: ICancellationStrategy,
  ) {}

  async execute(input: CancelAppointmentInput): Promise<CancelAppointmentOutput> {
    const found = await this.appointmentReader.findById(input.appointmentId);
    if (!found) {
      throw new AppointmentNotFoundError();
    }

    const cancelled = found.cancel(input.requestedAt);

    const cancellationResult = this.cancellationStrategy.calculate({
      appointmentStartsAt: found.startsAt,
      requestedAt: input.requestedAt,
      servicePriceInCents: input.servicePriceInCents,
    });

    await this.appointmentWriter.save(cancelled);

    return { appointment: cancelled, cancellationResult };
  }
}
