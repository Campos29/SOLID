import { Appointment } from '@domain/entities/Appointment';
import { IAppointmentReader, IAppointmentWriter } from '@domain/interfaces/IAppointmentRepository';
import { AppointmentNotFoundError } from '../../errors/AppointmentNotFoundError';
import { InvalidAppointmentStatusError } from '../../errors/InvalidAppointmentStatusError';

export interface ConfirmAppointmentInput {
  appointmentId: string;
  confirmedAt: Date;
}

export interface ConfirmAppointmentOutput {
  appointment: Appointment;
}

export class ConfirmAppointmentUseCase {
  constructor(
    private readonly appointmentReader: IAppointmentReader,
    private readonly appointmentWriter: IAppointmentWriter,
  ) {}

  async execute(input: ConfirmAppointmentInput): Promise<ConfirmAppointmentOutput> {
    const found = await this.appointmentReader.findById(input.appointmentId);
    if (!found) {
      throw new AppointmentNotFoundError();
    }

    if (found.status !== 'pending') {
      throw new InvalidAppointmentStatusError('Only pending appointments can be confirmed');
    }

    const appointment = found.confirm(input.confirmedAt);
    await this.appointmentWriter.save(appointment);

    return { appointment };
  }
}
