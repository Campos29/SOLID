import { AppointmentStatus } from '@domain/entities/Appointment';
import { IAppointmentStatusObserver, AppointmentStatusChangeEvent } from '@domain/interfaces/IAppointmentStatusObserver';
import { INotification } from '@domain/interfaces/INotification';

const STATUS_LABELS: Record<AppointmentStatus, string> = {
  pending: 'pending',
  confirmed: 'confirmed',
  cancelled: 'cancelled',
  completed: 'completed',
};

export class AppointmentStatusEmailObserver implements IAppointmentStatusObserver {
  constructor(private readonly notification: INotification) {}

  async update(event: AppointmentStatusChangeEvent): Promise<void> {
    const recipient = event.recipientEmail?.trim();
    if (!recipient) {
      return;
    }

    await this.notification.send({
      recipient,
      subject: buildSubject(event),
      body: buildBody(event),
    });
  }
}

function buildSubject(event: AppointmentStatusChangeEvent): string {
  return `Appointment ${STATUS_LABELS[event.currentStatus]}`;
}

function buildBody(event: AppointmentStatusChangeEvent): string {
  const appointment = event.appointment;

  return [
    `Appointment ${appointment.id} changed from ${STATUS_LABELS[event.previousStatus]} to ${STATUS_LABELS[event.currentStatus]}.`,
    `Provider: ${appointment.providerId}`,
    `Service: ${appointment.serviceId}`,
    `Starts at: ${formatDate(appointment.startsAt)}`,
    `Ends at: ${formatDate(appointment.endsAt)}`,
    `Changed at: ${formatDate(event.changedAt)}`,
  ].join('\n');
}

function formatDate(date: Date): string {
  return date.toISOString();
}
