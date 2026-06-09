import {
  AppointmentStatusChangeEvent,
  IAppointmentStatusObserver,
} from '@domain/interfaces/IAppointmentStatusObserver';
import { AppointmentStatusEmailObserver } from '../../application/observers/AppointmentStatusEmailObserver';
import { EmailNotification, EmailNotificationOptions } from './EmailNotification';

export class NodemailerAppointmentStatusEmailObserver implements IAppointmentStatusObserver {
  private readonly observer: AppointmentStatusEmailObserver;

  constructor(options: EmailNotificationOptions) {
    this.observer = new AppointmentStatusEmailObserver(new EmailNotification(options));
  }

  update(event: AppointmentStatusChangeEvent): Promise<void> {
    return this.observer.update(event);
  }
}
