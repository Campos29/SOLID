

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



export interface Service {
  id: string
  providerId: string
  name: string
  durationInMinutes: number
  priceInCents: number
}



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
