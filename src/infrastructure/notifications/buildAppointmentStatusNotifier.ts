import { AppointmentStatusNotifier } from '../../application/services/AppointmentStatusNotifier';
import { EmailNotificationOptions } from './EmailNotification';
import { NodemailerAppointmentStatusEmailObserver } from './NodemailerAppointmentStatusEmailObserver';

export type AppointmentStatusNotifierConfig = {
  email: EmailNotificationOptions;
};

export function buildAppointmentStatusNotifier(
  config: AppointmentStatusNotifierConfig,
): AppointmentStatusNotifier {
  return new AppointmentStatusNotifier()
    .subscribe(new NodemailerAppointmentStatusEmailObserver(config.email));
}
