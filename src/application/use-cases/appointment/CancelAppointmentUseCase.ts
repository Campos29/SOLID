import { Appointment } from '@domain/entities/Appointment';
import { IAppointmentReader, IAppointmentWriter } from '@domain/interfaces/IAppointmentRepository';
import { IAppointmentStatusPublisher } from '@domain/interfaces/IAppointmentStatusObserver';
import { ICancellationStrategy, CancellationStrategyResult } from '@domain/interfaces/ICancellationStrategy';
import { AppointmentNotFoundError } from '../../errors/AppointmentNotFoundError';

export interface CancelAppointmentInput {
  appointmentId: string;
  requestedAt: Date;
  servicePriceInCents: number;
  recipientEmail?: string;
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
    private readonly statusPublisher?: IAppointmentStatusPublisher,
  ) {}

  async execute(input: CancelAppointmentInput): Promise<CancelAppointmentOutput> {
    const found = await this.appointmentReader.findById(input.appointmentId);
    if (!found) {
      throw new AppointmentNotFoundError();
    }

    const previousStatus = found.status;
    const cancelled = found.cancel(input.requestedAt);

    const cancellationResult = this.cancellationStrategy.calculate({
      appointmentStartsAt: found.startsAt,
      requestedAt: input.requestedAt,
      servicePriceInCents: input.servicePriceInCents,
    });

    await this.appointmentWriter.save(cancelled);
    await this.statusPublisher?.publish({
      appointment: cancelled,
      previousStatus,
      currentStatus: cancelled.status,
      changedAt: input.requestedAt,
      recipientEmail: input.recipientEmail,
    });

    return { appointment: cancelled, cancellationResult };
  }
}
