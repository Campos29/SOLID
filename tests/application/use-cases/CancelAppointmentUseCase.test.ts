import { describe, expect, it } from 'vitest';
import { CancelAppointmentUseCase } from '../../../src/application/use-cases/appointment/CancelAppointmentUseCase';
import { Appointment } from '../../../src/domain/entities/Appointment';
import {
  IAppointmentReader,
  IAppointmentWriter,
  AppointmentSearchFilters,
} from '../../../src/domain/interfaces/IAppointmentRepository';
import {
  AppointmentStatusChangeEvent,
  IAppointmentStatusPublisher,
} from '../../../src/domain/interfaces/IAppointmentStatusObserver';
import {
  CancellationStrategyInput,
  CancellationStrategyResult,
  ICancellationStrategy,
} from '../../../src/domain/interfaces/ICancellationStrategy';

class InMemoryAppointmentRepository implements IAppointmentReader, IAppointmentWriter {
  public savedAppointments: Appointment[] = [];

  constructor(
    private readonly appointments: Appointment[],
    private readonly executionOrder: string[],
  ) {}

  async findById(id: string): Promise<Appointment | null> {
    return this.appointments.find(appointment => appointment.id === id) ?? null;
  }

  async findMany(_filters: AppointmentSearchFilters): Promise<Appointment[]> {
    return this.appointments;
  }

  async findOverlappingActiveByProvider(
    _providerId: string,
    _startsAt: Date,
    _endsAt: Date,
  ): Promise<Appointment[]> {
    return [];
  }

  async save(appointment: Appointment): Promise<void> {
    this.executionOrder.push('save');
    this.savedAppointments.push(appointment);
  }
}

class FreeCancellationStrategy implements ICancellationStrategy {
  public input: CancellationStrategyInput | null = null;

  calculate(input: CancellationStrategyInput): CancellationStrategyResult {
    this.input = input;
    return {
      feeInCents: 0,
      refundInCents: input.servicePriceInCents,
      isFree: true,
      policy: 'test-policy',
    };
  }
}

class RecordingStatusPublisher implements IAppointmentStatusPublisher {
  public events: AppointmentStatusChangeEvent[] = [];

  constructor(private readonly executionOrder: string[]) {}

  async publish(event: AppointmentStatusChangeEvent): Promise<void> {
    this.executionOrder.push('publish');
    this.events.push(event);
  }
}

describe('CancelAppointmentUseCase', () => {
  it('publishes the appointment status change after saving the cancelled appointment', async () => {
    const executionOrder: string[] = [];
    const appointment = Appointment.create({
      id: 'appointment-1',
      providerId: 'provider-1',
      clientId: 'client-1',
      serviceId: 'service-1',
      startsAt: new Date('2026-06-10T12:00:00.000Z'),
      endsAt: new Date('2026-06-10T13:00:00.000Z'),
      status: 'confirmed',
    });
    const repository = new InMemoryAppointmentRepository([appointment], executionOrder);
    const cancellationStrategy = new FreeCancellationStrategy();
    const statusPublisher = new RecordingStatusPublisher(executionOrder);
    const useCase = new CancelAppointmentUseCase(
      repository,
      repository,
      cancellationStrategy,
      statusPublisher,
    );

    const result = await useCase.execute({
      appointmentId: 'appointment-1',
      requestedAt: new Date('2026-06-09T12:00:00.000Z'),
      servicePriceInCents: 10000,
      recipientEmail: 'client@example.com',
    });

    expect(result.appointment.status).toBe('cancelled');
    expect(repository.savedAppointments).toEqual([result.appointment]);
    expect(statusPublisher.events).toEqual([
      {
        appointment: result.appointment,
        previousStatus: 'confirmed',
        currentStatus: 'cancelled',
        changedAt: new Date('2026-06-09T12:00:00.000Z'),
        recipientEmail: 'client@example.com',
      },
    ]);
    expect(executionOrder).toEqual(['save', 'publish']);
  });
});
