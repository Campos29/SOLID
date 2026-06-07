import { INotification } from '../../domain/interfaces/INotification';

export type NotificationCreator = () => INotification;

export type NotificationFactoryConfig = {
  defaultChannel: string;
};

export class NotificationFactory {
  private readonly creators = new Map<string, NotificationCreator>();

  constructor(private readonly config: NotificationFactoryConfig) {
    ensureChannel(config.defaultChannel);
  }

  register(channel: string, creator: NotificationCreator): this {
    ensureChannel(channel);
    this.creators.set(normalizeChannel(channel), creator);
    return this;
  }

  create(channel = this.config.defaultChannel): INotification {
    const creator = this.creators.get(normalizeChannel(channel));

    if (!creator) {
      throw new Error(`Notification channel "${channel}" is not registered`);
    }

    return creator();
  }
}

function ensureChannel(channel: string): void {
  if (!normalizeChannel(channel)) {
    throw new Error('Notification channel is required');
  }
}

function normalizeChannel(channel: string): string {
  return channel.trim().toLowerCase();
}
