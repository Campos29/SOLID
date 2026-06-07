import { NotificationFactory } from './NotificationFactory';
import { EmailNotification, EmailNotificationOptions } from './EmailNotification';
import { SMSNotification, SmsGateway } from './SMSNotification';

export type DefaultNotificationFactoryConfig = {
  defaultChannel: string;
  email: EmailNotificationOptions;
  smsGateway?: SmsGateway;
};

export function buildNotificationFactory(
  config: DefaultNotificationFactoryConfig,
): NotificationFactory {
  return new NotificationFactory({ defaultChannel: config.defaultChannel })
    .register('email', () => new EmailNotification(config.email))
    .register('sms', () => new SMSNotification(config.smsGateway));
}
