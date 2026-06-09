import { api } from '../lib/api'
import type {
  Appointment,
  AvailableSlot,
  CreateAppointmentPayload,
  Service,
} from '../types/scheduling'

interface ListServicesResponse {
  services: Service[]
}

interface ListSlotsResponse {
  slots: AvailableSlot[]
}

// Consumes the appointment-related endpoints backed by Yuri's use cases
// (list available slots / create appointment). Keeping the Axios calls here
// keeps the scheduler component focused on presentation and state.
export const schedulingService = {
  async listProviderServices(providerId: string): Promise<Service[]> {
    const { data } = await api.get<ListServicesResponse>(
      `/providers/${providerId}/services`,
    )
    return data.services
  },

  // `date` is a calendar day (YYYY-MM-DD); the backend computes the free
  // windows for that day from the provider's weekly availability and bookings.
  async listAvailableSlots(
    providerId: string,
    serviceId: string,
    date: string,
  ): Promise<AvailableSlot[]> {
    const { data } = await api.get<ListSlotsResponse>(
      `/providers/${providerId}/slots`,
      { params: { serviceId, date } },
    )
    return data.slots
  },

  async createAppointment(payload: CreateAppointmentPayload): Promise<Appointment> {
    const { data } = await api.post<Appointment>('/appointments', payload)
    return data
  },
}
