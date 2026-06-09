import { Appointment } from '@domain/entities/Appointment';
import { IAppointmentReader, IAppointmentWriter } from '@domain/interfaces/IAppointmentRepository';
import { AppointmentNotFoundError } from '../../errors/AppointmentNotFoundError';
import { InvalidAppointmentStatusError } from '../../errors/InvalidAppointmentStatusError';

export interface RejectAppointmentInput {
  appointmentId: string;
  rejectedAt: Date;
}

export interface RejectAppointmentOutput {
  appointment: Appointment;
}

export class RejectAppointmentUseCase {
  constructor(
    private readonly appointmentReader: IAppointmentReader,
    private readonly appointmentWriter: IAppointmentWriter,
  ) {}

  async execute(input: RejectAppointmentInput): Promise<RejectAppointmentOutput> {
    const found = await this.appointmentReader.findById(input.appointmentId);
    if (!found) {
      throw new AppointmentNotFoundError();
    }

    if (found.status !== 'pending') {
      throw new InvalidAppointmentStatusError('Only pending appointments can be rejected');
    }

    const appointment = found.cancel(input.rejectedAt);
    await this.appointmentWriter.save(appointment);

    return { appointment };
  }
}
