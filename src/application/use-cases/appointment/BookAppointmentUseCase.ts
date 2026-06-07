import { randomUUID } from 'node:crypto';
import { Appointment } from '@domain/entities/Appointment';
import { IAppointmentReader, IAppointmentWriter } from '@domain/interfaces/IAppointmentRepository';
import { ITransactionManager } from '@domain/interfaces/ITransactionManager';
import { SlotAlreadyBookedError } from '../../errors/SlotAlreadyBookedError';

export interface BookAppointmentInput {
  providerId: string;
  clientId: string;
  serviceId: string;
  startsAt: Date;
  endsAt: Date;
  notes?: string;
}

export interface BookAppointmentOutput {
  appointment: Appointment;
}

export class BookAppointmentUseCase {
  constructor(
    private readonly appointmentReader: IAppointmentReader,
    private readonly appointmentWriter: IAppointmentWriter,
    private readonly transactionManager: ITransactionManager,
  ) {}

  execute(input: BookAppointmentInput): Promise<BookAppointmentOutput> {
    return this.transactionManager.run(async () => {
      const overlapping = await this.appointmentReader.findOverlappingActiveByProvider(
        input.providerId,
        input.startsAt,
        input.endsAt,
      );

      if (overlapping.length > 0) {
        throw new SlotAlreadyBookedError();
      }

      const appointment = Appointment.create({
        id: randomUUID(),
        providerId: input.providerId,
        clientId: input.clientId,
        serviceId: input.serviceId,
        startsAt: input.startsAt,
        endsAt: input.endsAt,
        notes: input.notes,
      });

      await this.appointmentWriter.save(appointment);

      return { appointment };
    });
  }
}
