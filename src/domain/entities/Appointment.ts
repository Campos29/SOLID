export const APPOINTMENT_STATUSES = ['pending', 'confirmed', 'cancelled', 'completed'] as const;

export type AppointmentStatus = (typeof APPOINTMENT_STATUSES)[number];

export type AppointmentProps = {
  id: string;
  providerId: string;
  clientId: string;
  serviceId: string;
  startsAt: Date;
  endsAt: Date;
  status: AppointmentStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateAppointmentInput = {
  id: string;
  providerId: string;
  clientId: string;
  serviceId: string;
  startsAt: Date;
  endsAt: Date;
  status?: AppointmentStatus;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
};

const ALLOWED_STATUS_TRANSITIONS: Record<AppointmentStatus, readonly AppointmentStatus[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['completed', 'cancelled'],
  cancelled: [],
  completed: [],
};

export class Appointment {
  private constructor(private readonly props: AppointmentProps) {}

  static create(input: CreateAppointmentInput): Appointment {
    return new Appointment(buildAppointmentProps(input));
  }

  confirm(confirmedAt = new Date()): Appointment {
    return this.withStatus('confirmed', confirmedAt);
  }

  cancel(cancelledAt = new Date()): Appointment {
    return this.withStatus('cancelled', cancelledAt);
  }

  complete(completedAt = new Date()): Appointment {
    return this.withStatus('completed', completedAt);
  }

  get id(): string {
    return this.props.id;
  }

  get providerId(): string {
    return this.props.providerId;
  }

  get clientId(): string {
    return this.props.clientId;
  }

  get serviceId(): string {
    return this.props.serviceId;
  }

  get startsAt(): Date {
    return new Date(this.props.startsAt);
  }

  get endsAt(): Date {
    return new Date(this.props.endsAt);
  }

  get status(): AppointmentStatus {
    return this.props.status;
  }

  get notes(): string | undefined {
    return this.props.notes;
  }

  get createdAt(): Date {
    return new Date(this.props.createdAt);
  }

  get updatedAt(): Date {
    return new Date(this.props.updatedAt);
  }

  private withStatus(status: AppointmentStatus, updatedAt: Date): Appointment {
    ensureStatusTransition(this.status, status);
    ensureValidDate(updatedAt, 'Appointment updated at');

    return new Appointment({
      ...this.props,
      status,
      updatedAt: new Date(updatedAt),
    });
  }
}

function buildAppointmentProps(input: CreateAppointmentInput): AppointmentProps {
  ensureFilled(input.id, 'Appointment id');
  ensureFilled(input.providerId, 'Appointment provider id');
  ensureFilled(input.clientId, 'Appointment client id');
  ensureFilled(input.serviceId, 'Appointment service id');

  const status = input.status ?? 'pending';
  ensureAppointmentStatus(status);
  ensureTimeRange(input.startsAt, input.endsAt);

  const createdAt = input.createdAt ?? new Date();
  const updatedAt = input.updatedAt ?? createdAt;
  ensureValidDate(createdAt, 'Appointment created at');
  ensureValidDate(updatedAt, 'Appointment updated at');

  return {
    ...input,
    startsAt: new Date(input.startsAt),
    endsAt: new Date(input.endsAt),
    status,
    notes: normalizeNotes(input.notes),
    createdAt: new Date(createdAt),
    updatedAt: new Date(updatedAt),
  };
}

function ensureFilled(value: string, fieldName: string): void {
  if (!value.trim()) {
    throw new Error(`${fieldName} is required`);
  }
}

function ensureAppointmentStatus(status: AppointmentStatus): void {
  if (!APPOINTMENT_STATUSES.includes(status)) {
    throw new Error('Appointment status is invalid');
  }
}

function ensureTimeRange(startsAt: Date, endsAt: Date): void {
  ensureValidDate(startsAt, 'Appointment starts at');
  ensureValidDate(endsAt, 'Appointment ends at');

  if (startsAt >= endsAt) {
    throw new Error('Appointment end time must be after start time');
  }
}

function ensureValidDate(value: Date, fieldName: string): void {
  if (Number.isNaN(value.getTime())) {
    throw new Error(`${fieldName} is invalid`);
  }
}

function ensureStatusTransition(current: AppointmentStatus, next: AppointmentStatus): void {
  if (!ALLOWED_STATUS_TRANSITIONS[current].includes(next)) {
    throw new Error(`Cannot transition appointment from ${current} to ${next}`);
  }
}

function normalizeNotes(notes: string | undefined): string | undefined {
  if (notes === undefined) {
    return undefined;
  }

  const trimmedNotes = notes.trim();
  return trimmedNotes.length > 0 ? trimmedNotes : undefined;
}
