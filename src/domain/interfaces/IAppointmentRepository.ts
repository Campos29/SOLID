import { Appointment, AppointmentStatus } from '../entities/Appointment';

export type AppointmentSearchFilters = {
  providerId?: string;
  clientId?: string;
  serviceId?: string;
  startsAt?: Date;
  endsAt?: Date;
  statuses?: AppointmentStatus[];
};

export interface IAppointmentReader {
  findById(id: string): Promise<Appointment | null>;
  findMany(filters: AppointmentSearchFilters): Promise<Appointment[]>;
  findOverlappingActiveByProvider(
    providerId: string,
    startsAt: Date,
    endsAt: Date,
  ): Promise<Appointment[]>;
}

export interface IAppointmentWriter {
  save(appointment: Appointment): Promise<void>;
}

export interface IAppointmentRepository extends IAppointmentReader, IAppointmentWriter {}
