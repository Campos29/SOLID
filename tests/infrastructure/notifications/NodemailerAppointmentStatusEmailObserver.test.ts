import { describe, expect, it } from 'vitest';
import { Appointment } from '../../../src/domain/entities/Appointment';
import { AppointmentStatusChangeEvent } from '../../../src/domain/interfaces/IAppointmentStatusObserver';
import { MailTransporter } from '../../../src/infrastructure/notifications/EmailNotification';
import { NodemailerAppointmentStatusEmailObserver } from '../../../src/infrastructure/notifications/NodemailerAppointmentStatusEmailObserver';
import { buildAppointmentStatusNotifier } from '../../../src/infrastructure/notifications/buildAppointmentStatusNotifier';

type MailMessage = Parameters<MailTransporter['sendMail']>[0];

class RecordingMailTransporter implements MailTransporter {
  public messages: MailMessage[] = [];

  async sendMail(message: MailMessage): Promise<unknown> {
    this.messages.push(message);
    return { accepted: [message.to] };
  }
}

describe('NodemailerAppointmentStatusEmailObserver', () => {
  it('sends appointment status emails through the configured mail transporter', async () => {
    const transporter = new RecordingMailTransporter();
    const observer = new NodemailerAppointmentStatusEmailObserver({
      host: 'localhost',
      port: 1025,
      from: 'noreply@slotwise.com',
      transporter,
    });

    await observer.update(buildStatusChangeEvent());

    expect(transporter.messages).toEqual([
      {
        from: 'noreply@slotwise.com',
        to: 'client@example.com',
        subject: 'Appointment cancelled',
        text: [
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

  it('wires nodemailer email observer into the status notifier builder', async () => {
    const transporter = new RecordingMailTransporter();
    const notifier = buildAppointmentStatusNotifier({
      email: {
        host: 'localhost',
        port: 1025,
        from: 'noreply@slotwise.com',
        transporter,
      },
    });

    await notifier.publish(buildStatusChangeEvent());

    expect(transporter.messages).toHaveLength(1);
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
