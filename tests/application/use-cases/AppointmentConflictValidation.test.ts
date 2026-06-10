import { describe, expect, it } from 'vitest';
import { SlotAlreadyBookedError } from '../../../src/application/errors/SlotAlreadyBookedError';
import { BookAppointmentUseCase } from '../../../src/application/use-cases/appointment/BookAppointmentUseCase';
import { CreateAppointmentUseCase } from '../../../src/application/use-cases/appointment/CreateAppointmentUseCase';
import { Appointment } from '../../../src/domain/entities/Appointment';
import {
  AppointmentSearchFilters,
  IAppointmentReader,
  IAppointmentWriter,
} from '../../../src/domain/interfaces/IAppointmentRepository';
import { ITransactionManager } from '../../../src/domain/interfaces/ITransactionManager';

class AppointmentConflictRepository implements IAppointmentReader, IAppointmentWriter {
  public savedAppointments: Appointment[] = [];
  public overlapCalls: Array<{ providerId: string; startsAt: Date; endsAt: Date }> = [];

  constructor(private readonly overlappingAppointments: Appointment[]) {}

  async findById(_id: string): Promise<Appointment | null> {
    return null;
  }

  async findMany(_filters: AppointmentSearchFilters): Promise<Appointment[]> {
    return [];
  }

  async findOverlappingActiveByProvider(
    providerId: string,
    startsAt: Date,
    endsAt: Date,
  ): Promise<Appointment[]> {
    this.overlapCalls.push({ providerId, startsAt, endsAt });
    return this.overlappingAppointments;
  }

  async save(appointment: Appointment): Promise<void> {
    this.savedAppointments.push(appointment);
  }
}

class RecordingTransactionManager implements ITransactionManager {
  public didRun = false;

  async run<T>(fn: () => Promise<T>): Promise<T> {
    this.didRun = true;
    return fn();
  }
}

describe('Appointment conflict validation', () => {
  it('rejects creating an appointment when the provider already has an active overlapping slot', async () => {
    const overlappingAppointment = makeAppointment();
    const repository = new AppointmentConflictRepository([overlappingAppointment]);
    const useCase = new CreateAppointmentUseCase(repository, repository);
    const input = makeAppointmentInput();

    await expect(useCase.execute(input)).rejects.toBeInstanceOf(SlotAlreadyBookedError);

    expect(repository.savedAppointments).toEqual([]);
    expect(repository.overlapCalls).toEqual([
      {
        providerId: input.providerId,
        startsAt: input.startsAt,
        endsAt: input.endsAt,
      },
    ]);
  });

  it('saves the appointment when no active overlapping slot exists', async () => {
    const repository = new AppointmentConflictRepository([]);
    const useCase = new CreateAppointmentUseCase(repository, repository);
    const input = makeAppointmentInput();

    const result = await useCase.execute(input);

    expect(result.appointment.providerId).toBe(input.providerId);
    expect(result.appointment.clientId).toBe(input.clientId);
    expect(result.appointment.serviceId).toBe(input.serviceId);
    expect(result.appointment.status).toBe('pending');
    expect(repository.savedAppointments).toEqual([result.appointment]);
  });

  it('runs overlap validation inside the booking transaction and does not save conflicts', async () => {
    const overlappingAppointment = makeAppointment();
    const repository = new AppointmentConflictRepository([overlappingAppointment]);
    const transactionManager = new RecordingTransactionManager();
    const useCase = new BookAppointmentUseCase(repository, repository, transactionManager);

    await expect(useCase.execute(makeAppointmentInput())).rejects.toBeInstanceOf(
      SlotAlreadyBookedError,
    );

    expect(transactionManager.didRun).toBe(true);
    expect(repository.savedAppointments).toEqual([]);
  });
});

function makeAppointmentInput() {
  return {
    providerId: 'provider-1',
    clientId: 'client-1',
    serviceId: 'service-1',
    startsAt: new Date('2026-06-10T12:00:00.000Z'),
    endsAt: new Date('2026-06-10T12:30:00.000Z'),
  };
}

function makeAppointment(): Appointment {
  return Appointment.create({
    id: 'appointment-1',
    ...makeAppointmentInput(),
  });
}
