import { Appointment, AppointmentStatus } from '@domain/entities/Appointment';
import { IAppointmentReader } from '@domain/interfaces/IAppointmentRepository';

export interface ListClientAppointmentsInput {
  clientId: string;
  statuses?: AppointmentStatus[];
}

export interface ListClientAppointmentsOutput {
  appointments: Appointment[];
}

export class ListClientAppointmentsUseCase {
  constructor(private readonly appointmentReader: IAppointmentReader) {}

  async execute(input: ListClientAppointmentsInput): Promise<ListClientAppointmentsOutput> {
    const appointments = await this.appointmentReader.findMany({
      clientId: input.clientId,
      statuses: input.statuses,
    });

    return { appointments };
  }
}
