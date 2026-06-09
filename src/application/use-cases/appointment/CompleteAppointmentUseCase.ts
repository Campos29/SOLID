import { Appointment } from '@domain/entities/Appointment';
import { IAppointmentReader, IAppointmentWriter } from '@domain/interfaces/IAppointmentRepository';
import { AppointmentNotFoundError } from '../../errors/AppointmentNotFoundError';
import { InvalidAppointmentStatusError } from '../../errors/InvalidAppointmentStatusError';

export interface CompleteAppointmentInput {
  appointmentId: string;
  completedAt: Date;
}

export interface CompleteAppointmentOutput {
  appointment: Appointment;
}

export class CompleteAppointmentUseCase {
  constructor(
    private readonly appointmentReader: IAppointmentReader,
    private readonly appointmentWriter: IAppointmentWriter,
  ) {}

  async execute(input: CompleteAppointmentInput): Promise<CompleteAppointmentOutput> {
    const found = await this.appointmentReader.findById(input.appointmentId);
    if (!found) {
      throw new AppointmentNotFoundError();
    }

    if (found.status !== 'confirmed') {
      throw new InvalidAppointmentStatusError('Only confirmed appointments can be completed');
    }

    const appointment = found.complete(input.completedAt);
    await this.appointmentWriter.save(appointment);

    return { appointment };
  }
}
