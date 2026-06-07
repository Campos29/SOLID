import nodemailer from 'nodemailer';
import { INotification, NotificationMessage } from '../../domain/interfaces/INotification';

type EmailPayload = {
  from: string;
  to: string;
  subject: string;
  text: string;
};

export type MailTransporter = {
  sendMail(message: EmailPayload): Promise<unknown>;
};

export type EmailNotificationOptions = {
  host: string;
  port: number;
  from: string;
  user?: string;
  password?: string;
  secure?: boolean;
  transporter?: MailTransporter;
};

type MailAuth = {
  user: string;
  pass: string;
};

export class EmailNotification implements INotification {
  private readonly from: string;
  private readonly transporter: MailTransporter;

  constructor(options: EmailNotificationOptions) {
    this.from = options.from;
    this.transporter = options.transporter ?? createTransporter(options);
  }

  async send(message: NotificationMessage): Promise<void> {
    await this.transporter.sendMail({
      from: this.from,
      to: message.recipient,
      subject: message.subject,
      text: message.body,
    });
  }
}

function createTransporter(options: EmailNotificationOptions): MailTransporter {
  const auth = buildAuth(options);

  return nodemailer.createTransport({
    host: options.host,
    port: options.port,
    secure: options.secure ?? false,
    ...(auth ? { auth } : {}),
  });
}

function buildAuth(options: EmailNotificationOptions): MailAuth | undefined {
  if (!options.user || !options.password) {
    return undefined;
  }

  return {
    user: options.user,
    pass: options.password,
  };
}
