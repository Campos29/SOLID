import { Appointment, AppointmentStatus } from '@domain/entities/Appointment';
import { IAppointmentReader } from '@domain/interfaces/IAppointmentRepository';

export interface ListProviderAppointmentsInput {
  providerId: string;
  statuses?: AppointmentStatus[];
}

export interface ListProviderAppointmentsOutput {
  appointments: Appointment[];
}

export class ListProviderAppointmentsUseCase {
  constructor(private readonly appointmentReader: IAppointmentReader) {}

  async execute(input: ListProviderAppointmentsInput): Promise<ListProviderAppointmentsOutput> {
    const appointments = await this.appointmentReader.findMany({
      providerId: input.providerId,
      statuses: input.statuses,
    });

    return { appointments };
  }
}
