import { INotification, NotificationMessage } from '../../domain/interfaces/INotification';

export type SmsMessage = {
  to: string;
  message: string;
};

export interface SmsGateway {
  send(message: SmsMessage): Promise<void>;
}

class NoopSmsGateway implements SmsGateway {
  async send(_message: SmsMessage): Promise<void> {}
}

export class SMSNotification implements INotification {
  constructor(private readonly gateway: SmsGateway = new NoopSmsGateway()) {}

  async send(message: NotificationMessage): Promise<void> {
    await this.gateway.send({
      to: message.recipient,
      message: formatSmsMessage(message),
    });
  }
}

function formatSmsMessage(message: NotificationMessage): string {
  return `${message.subject}\n${message.body}`;
}
