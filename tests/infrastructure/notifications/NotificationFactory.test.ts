import { describe, expect, it } from 'vitest';
import { INotification, NotificationMessage } from '../../../src/domain/interfaces/INotification';
import { NotificationFactory } from '../../../src/infrastructure/notifications/NotificationFactory';
import { buildNotificationFactory } from '../../../src/infrastructure/notifications/buildNotificationFactory';
import { SmsGateway, SmsMessage } from '../../../src/infrastructure/notifications/SMSNotification';

class FakeNotification implements INotification {
  public sentMessages: NotificationMessage[] = [];

  async send(message: NotificationMessage): Promise<void> {
    this.sentMessages.push(message);
  }
}

class RecordingSmsGateway implements SmsGateway {
  public messages: SmsMessage[] = [];

  async send(message: SmsMessage): Promise<void> {
    this.messages.push(message);
  }
}

describe('NotificationFactory', () => {
  it('creates the configured default notification channel', async () => {
    const emailNotification = new FakeNotification();
    const factory = new NotificationFactory({ defaultChannel: 'email' })
      .register('email', () => emailNotification);

    const notification = factory.create();
    await notification.send({
      recipient: 'client@example.com',
      subject: 'Appointment confirmed',
      body: 'Your appointment was confirmed.',
    });

    expect(emailNotification.sentMessages).toHaveLength(1);
  });

  it('creates SMS notifications through the default factory setup', async () => {
    const smsGateway = new RecordingSmsGateway();
    const factory = buildNotificationFactory({
      defaultChannel: 'sms',
      email: {
        host: 'localhost',
        port: 1025,
        from: 'noreply@slotwise.com',
      },
      smsGateway,
    });

    await factory.create().send({
      recipient: '+5519999999999',
      subject: 'Appointment cancelled',
      body: 'Your appointment was cancelled.',
    });

    expect(smsGateway.messages).toEqual([
      {
        to: '+5519999999999',
        message: 'Appointment cancelled\nYour appointment was cancelled.',
      },
    ]);
  });

  it('rejects channels that were not registered', () => {
    const factory = new NotificationFactory({ defaultChannel: 'push' });

    expect(() => factory.create()).toThrow('Notification channel "push" is not registered');
  });
});
