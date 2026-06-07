export type NotificationMessage = {
  recipient: string;
  subject: string;
  body: string;
};

export interface INotification {
  send(message: NotificationMessage): Promise<void>;
}
