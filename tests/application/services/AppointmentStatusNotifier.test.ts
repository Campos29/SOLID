import { describe, expect, it } from 'vitest';
import { Appointment } from '../../../src/domain/entities/Appointment';
import {
  AppointmentStatusChangeEvent,
  IAppointmentStatusObserver,
} from '../../../src/domain/interfaces/IAppointmentStatusObserver';
import { AppointmentStatusNotifier } from '../../../src/application/services/AppointmentStatusNotifier';

class RecordingObserver implements IAppointmentStatusObserver {
  public events: AppointmentStatusChangeEvent[] = [];

  async update(event: AppointmentStatusChangeEvent): Promise<void> {
    this.events.push(event);
  }
}

describe('AppointmentStatusNotifier', () => {
  it('notifies every subscribed observer about appointment status changes', async () => {
    const firstObserver = new RecordingObserver();
    const secondObserver = new RecordingObserver();
    const notifier = new AppointmentStatusNotifier()
      .subscribe(firstObserver)
      .subscribe(secondObserver);
    const event = buildStatusChangeEvent();

    await notifier.publish(event);

    expect(firstObserver.events).toEqual([event]);
    expect(secondObserver.events).toEqual([event]);
  });

  it('stops notifying unsubscribed observers', async () => {
    const observer = new RecordingObserver();
    const notifier = new AppointmentStatusNotifier()
      .subscribe(observer)
      .unsubscribe(observer);

    await notifier.publish(buildStatusChangeEvent());

    expect(observer.events).toHaveLength(0);
  });
});

function buildStatusChangeEvent(): AppointmentStatusChangeEvent {
  const appointment = Appointment.create({
    id: 'appointment-1',
    providerId: 'provider-1',
    clientId: 'client-1',
    serviceId: 'service-1',
    startsAt: new Date('2026-06-10T12:00:00.000Z'),
    endsAt: new Date('2026-06-10T13:00:00.000Z'),
    status: 'cancelled',
  });

  return {
    appointment,
    previousStatus: 'confirmed',
    currentStatus: 'cancelled',
    changedAt: new Date('2026-06-09T12:00:00.000Z'),
    recipientEmail: 'client@example.com',
  };
}
