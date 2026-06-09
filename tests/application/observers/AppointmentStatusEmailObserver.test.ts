import { describe, expect, it } from 'vitest';
import { AppointmentStatusEmailObserver } from '../../../src/application/observers/AppointmentStatusEmailObserver';
import { Appointment } from '../../../src/domain/entities/Appointment';
import { INotification, NotificationMessage } from '../../../src/domain/interfaces/INotification';
import { AppointmentStatusChangeEvent } from '../../../src/domain/interfaces/IAppointmentStatusObserver';

class RecordingNotification implements INotification {
  public messages: NotificationMessage[] = [];

  async send(message: NotificationMessage): Promise<void> {
    this.messages.push(message);
  }
}

describe('AppointmentStatusEmailObserver', () => {
  it('sends an email notification when the status change event has a recipient', async () => {
    const notification = new RecordingNotification();
    const observer = new AppointmentStatusEmailObserver(notification);

    await observer.update(buildStatusChangeEvent({ recipientEmail: 'client@example.com' }));

    expect(notification.messages).toEqual([
      {
        recipient: 'client@example.com',
        subject: 'Appointment cancelled',
        body: [
          'Appointment appointment-1 changed from confirmed to cancelled.',
          'Provider: provider-1',
          'Service: service-1',
          'Starts at: 2026-06-10T12:00:00.000Z',
          'Ends at: 2026-06-10T13:00:00.000Z',
          'Changed at: 2026-06-09T12:00:00.000Z',
        ].join('\n'),
      },
    ]);
  });

  it('does not send email when the event has no recipient', async () => {
    const notification = new RecordingNotification();
    const observer = new AppointmentStatusEmailObserver(notification);

    await observer.update(buildStatusChangeEvent());

    expect(notification.messages).toHaveLength(0);
  });
});

function buildStatusChangeEvent(
  override: Partial<AppointmentStatusChangeEvent> = {},
): AppointmentStatusChangeEvent {
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
    ...override,
  };
}
