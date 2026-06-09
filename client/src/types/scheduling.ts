// Mirrors the provider response envelope exposed by the backend
// (see src/interfaces/schemas/providerSchemas.ts).
export interface Provider {
  id: string
  userId: string
  name: string
  description: string
  category: string
  averageRating?: number
  reviewCount?: number
  createdAt: string
}

// Mirrors the Service domain entity (src/domain/entities/Service.ts).
// Prices are stored in cents and durations in minutes on the backend.
export interface Service {
  id: string
  providerId: string
  name: string
  durationInMinutes: number
  priceInCents: number
}

// A free time window returned by the "list available slots" use case.
// Both ends are ISO-8601 timestamps in UTC.
export interface AvailableSlot {
  startsAt: string
  endsAt: string
}

export interface Appointment {
  id: string
  providerId: string
  serviceId: string
  clientId: string
  startsAt: string
  endsAt: string
  status: string
  createdAt: string
}

export interface ProviderAppointment extends Appointment {
  clientName: string
  serviceName: string
}

export interface CreateAppointmentPayload {
  providerId: string
  serviceId: string
  startsAt: string
}
