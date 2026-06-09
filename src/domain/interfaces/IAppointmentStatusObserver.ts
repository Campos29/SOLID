import { Appointment, AppointmentStatus } from '../entities/Appointment';

export type AppointmentStatusChangeEvent = {
  appointment: Appointment;
  previousStatus: AppointmentStatus;
  currentStatus: AppointmentStatus;
  changedAt: Date;
  recipientEmail?: string;
};

export interface IAppointmentStatusObserver {
  update(event: AppointmentStatusChangeEvent): Promise<void>;
}

export interface IAppointmentStatusPublisher {
  publish(event: AppointmentStatusChangeEvent): Promise<void>;
}
