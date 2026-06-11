import { api } from '../lib/api'
import type { Availability, ConfigureAvailabilityPayload } from '../types/availability'



export const availabilityService = {
  async getByProvider(providerId: string): Promise<Availability | null> {
    try {
      const { data } = await api.get<Availability>(`/providers/${providerId}/availability`)
      return data
    } catch {
      return null
    }
  },

  async configure(
    providerId: string,
    payload: ConfigureAvailabilityPayload,
  ): Promise<Availability> {
    const { data } = await api.put<Availability>(
      `/providers/${providerId}/availability`,
      payload,
    )
    return data
  },
}
